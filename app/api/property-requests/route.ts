import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { PropertyRequest } from '@/lib/models/PropertyRequest'
import { validatePropertyRequest } from '@/lib/property-request-utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const requests = await PropertyRequest.find({ ownerId: userId })
    .populate('matchedProperties', 'title description city neighborhood address type bedrooms bathrooms area amenities images listingPurpose pricePerMonth securityDeposit finalPrice bookingPrice isVerified')
    .sort({ updatedAt: -1 })
    .lean()
  return NextResponse.json({ requests })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId || (session?.user as any)?.role === 'ADMIN') return NextResponse.json({ error: 'Only signed-in user accounts can submit property requests.' }, { status: 403 })
  const validation = validatePropertyRequest(await request.json())
  if ('error' in validation) return NextResponse.json(validation, { status: 400 })
  await connectDB()
  const propertyRequest = await PropertyRequest.create({ ...validation.value, ownerId: userId })
  return NextResponse.json({ request: propertyRequest }, { status: 201 })
}
