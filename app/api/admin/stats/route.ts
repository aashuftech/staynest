import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Property } from '@/lib/models/Property'
import { User } from '@/lib/models/User'
import { Booking } from '@/lib/models/Booking'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const today = new Date(); today.setHours(0,0,0,0)
    const [totalProperties, totalUsers, matchesToday, revenueData] = await Promise.all([
      Property.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.aggregate([
        { $match: { paymentStatus: 'PAID', status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ])
    return NextResponse.json({ totalProperties, newUsers: totalUsers, matchesToday, revenue: revenueData[0]?.total || 0 })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
