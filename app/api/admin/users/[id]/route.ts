import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role === 'ADMIN' ? session : null
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await req.json()
    if (action !== 'BAN' && action !== 'UNBAN') return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })

    await connectDB()
    const user = await User.findById(params.id)
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    if (user.role === 'ADMIN') return NextResponse.json({ error: 'Admin accounts cannot be banned.' }, { status: 403 })
    if (String(user._id) === String((session.user as any).id)) return NextResponse.json({ error: 'You cannot ban your own account.' }, { status: 403 })

    user.isBanned = action === 'BAN'
    user.bannedAt = action === 'BAN' ? new Date() : undefined
    await user.save()

    return NextResponse.json({ user: { _id: user._id, isBanned: user.isBanned, bannedAt: user.bannedAt } })
  } catch (error) {
    console.error('Update user ban status error:', error)
    return NextResponse.json({ error: 'Unable to update user status.' }, { status: 500 })
  }
}
