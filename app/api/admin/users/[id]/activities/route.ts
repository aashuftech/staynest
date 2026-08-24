import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { AiConversation } from '@/lib/models/AiConversation'
import { AiActivity } from '@/lib/models/AiActivity'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role === 'ADMIN'
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const user = await User.findById(params.id).select('name email publicId role isBanned createdAt').lean()
    if (!user || user.role === 'ADMIN') return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const [conversation, searches] = await Promise.all([
      AiConversation.findOne({ userId: user._id }).select('messages lastActivityAt').lean(),
      AiActivity.find({ userId: user._id, kind: 'PROPERTY_SEARCH' }).sort({ createdAt: -1 }).select('input output listingPurpose criteria matchedPropertyIds createdAt').lean(),
    ])

    return NextResponse.json({ user, chat: conversation?.messages || [], lastChatActivityAt: conversation?.lastActivityAt || null, searches })
  } catch (error) {
    console.error('Load user activity error:', error)
    return NextResponse.json({ error: 'Unable to load user activities.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const user = await User.findById(params.id).select('role').lean()
    if (!user || user.role === 'ADMIN') return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    await Promise.all([
      AiConversation.deleteOne({ userId: user._id }),
      AiActivity.deleteMany({ userId: user._id }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user activity error:', error)
    return NextResponse.json({ error: 'Unable to delete user history.' }, { status: 500 })
  }
}
