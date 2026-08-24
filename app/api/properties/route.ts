import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Property } from '@/lib/models/Property'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const type = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const isVerified = searchParams.get('isVerified')
    const listingPurpose = searchParams.get('listingPurpose')
    const adminOnly = searchParams.get('adminOnly') === 'true'
    const search = searchParams.get('search') // free text search
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const skip = (page - 1) * limit

    // Older seeded listings do not have isAvailable saved. Treat a missing
    // value as available while still hiding listings explicitly marked false.
    const query: any = { isAvailable: { $ne: false }, $and: [{ $or: [{ listingStatus: 'APPROVED' }, { listingStatus: { $exists: false } }] }] }
    if (adminOnly) query.ownerId = { $exists: false }

    // Free text search across city, neighborhood, address, title
    if (search) {
      query.$or = [
        { city: { $regex: search, $options: 'i' } },
        { neighborhood: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ]
    } else if (city) {
      query.$or = [
        { city: { $regex: city, $options: 'i' } },
        { neighborhood: { $regex: city, $options: 'i' } },
        { address: { $regex: city, $options: 'i' } },
      ]
    }

    if (type) query.type = type.toUpperCase()
    // Legacy properties created before buy/rent support have no listingPurpose.
    // Treat them as rental listings so existing apartments remain visible.
    if (listingPurpose === 'BUY') query.listingPurpose = 'BUY'
    if (listingPurpose === 'RENT') query.$and = [...(query.$and || []), { $or: [{ listingPurpose: 'RENT' }, { listingPurpose: { $exists: false } }] }]
    if (listingPurpose === 'BUY') query.saleStatus = { $ne: 'SOLD' }
    if (isVerified === 'true') query.isVerified = true
    if (minPrice || maxPrice) {
      const priceField = listingPurpose === 'BUY' ? 'finalPrice' : 'pricePerMonth'
      query[priceField] = {}
      if (minPrice) query[priceField].$gte = parseFloat(minPrice)
      if (maxPrice) query[priceField].$lte = parseFloat(maxPrice)
    }
    if (bedrooms && bedrooms !== 'Any' && bedrooms !== '4+') {
      query.bedrooms = parseInt(bedrooms)
    } else if (bedrooms === '4+') {
      query.bedrooms = { $gte: 4 }
    }

    const [properties, total] = await Promise.all([
      Property.find(query).select('-ownerContact -ownerId').sort({ isVerified: -1, rating: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(query),
    ])

    return NextResponse.json({ properties, total, page, limit })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const body = await req.json()
    body.listingStatus = 'APPROVED'
    body.isAvailable = true
    // Keep the database schema monthly-only, even if a stale client submits
    // the legacy field.
    delete body.pricePerNight
    body.listingPurpose = body.listingPurpose === 'BUY' ? 'BUY' : 'RENT'
    if (body.listingPurpose === 'BUY') {
      delete body.pricePerMonth
      delete body.securityDeposit
      body.finalPrice = Number(body.finalPrice)
      body.bookingPrice = Number(body.bookingPrice)
      body.saleStatus = 'AVAILABLE'
      if (!Number.isFinite(body.finalPrice) || !Number.isFinite(body.bookingPrice) || body.finalPrice <= 0 || body.bookingPrice <= 0) {
        return NextResponse.json({ error: 'Final price and booking price are required for a property for sale.' }, { status: 400 })
      }
    }
    if (body.listingPurpose === 'RENT' && (!Number.isFinite(Number(body.pricePerMonth)) || Number(body.pricePerMonth) <= 0)) {
      return NextResponse.json({ error: 'A valid monthly rent is required.' }, { status: 400 })
    }
    if (body.listingPurpose === 'RENT') {
      body.securityDeposit = Number(body.securityDeposit || 0)
      if (!Number.isFinite(body.securityDeposit) || body.securityDeposit < 0) {
        return NextResponse.json({ error: 'Security deposit must be a valid amount.' }, { status: 400 })
      }
    }
    const property = await Property.create(body)
    return NextResponse.json({ property }, { status: 201 })
  } catch (err: any) {
    console.error('Create property error:', err)
    return NextResponse.json({ error: err?.message || 'Unable to save the property.' }, { status: 500 })
  }
}
