import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { PropertyRequest } from '@/lib/models/PropertyRequest'
import { Property } from '@/lib/models/Property'
import { findMatchingProperties, REQUEST_STATUSES, validPropertyIds } from '@/lib/property-request-utils'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role === 'ADMIN'
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const request = await PropertyRequest.findById(params.id)
    .populate('ownerId', 'name email image')
    .populate('matchedProperties', 'title description city neighborhood address type bedrooms bathrooms area amenities images listingPurpose pricePerMonth securityDeposit finalPrice bookingPrice isVerified')
    .lean()
  if (!request) return NextResponse.json({ error: 'Property request not found.' }, { status: 404 })
  const suggestedProperties = await findMatchingProperties(request)
  return NextResponse.json({ request, suggestedProperties })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const status = body?.status
  const adminNotes = typeof body?.adminNotes === 'string' ? body.adminNotes.trim() : undefined
  if (!REQUEST_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid request status.' }, { status: 400 })
  if (adminNotes !== undefined && adminNotes.length > 3000) return NextResponse.json({ error: 'Notes can be up to 3,000 characters.' }, { status: 400 })

  await connectDB()
  const selectedIds = validPropertyIds(body?.matchedPropertyIds)
  const request = await PropertyRequest.findById(params.id)
  if (!request) return NextResponse.json({ error: 'Property request not found.' }, { status: 404 })

  if (selectedIds.length) {
    // An admin may share either a rental or a sale property, even when it is
    // different from the request's original purpose. The request remains a
    // concierge conversation, not a hard listing-purpose restriction.
    const count = await Property.countDocuments({ _id: { $in: selectedIds }, isAvailable: { $ne: false }, isVerified: true })
    if (count !== selectedIds.length) return NextResponse.json({ error: 'One or more selected properties cannot be shared.' }, { status: 400 })
  }

  request.status = status
  if (adminNotes !== undefined) request.adminNotes = adminNotes
  request.matchedProperties = selectedIds as any
  await request.save()

  const updated = await PropertyRequest.findById(request._id)
    .populate('ownerId', 'name email image')
    .populate('matchedProperties', 'title description city neighborhood address type bedrooms bathrooms area amenities images listingPurpose pricePerMonth securityDeposit finalPrice bookingPrice isVerified')
    .lean()
  return NextResponse.json({ request: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await connectDB()
  const request = await PropertyRequest.findByIdAndDelete(params.id).select('_id').lean()
  if (!request) return NextResponse.json({ error: 'Property request not found.' }, { status: 404 })
  return NextResponse.json({ deletedId: String(request._id) })
}
