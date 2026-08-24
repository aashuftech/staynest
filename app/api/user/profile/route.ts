import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const user = await User.findById((session.user as any).id).select('-password').lean()
    return NextResponse.json({ user })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const { name, image, currentPassword, newPassword } = await req.json()
    const updateData: any = {}
    if (name) updateData.name = name
    if (image) updateData.image = image
    if (newPassword) {
      const user = await User.findById((session.user as any).id)
      if (!user?.password) return NextResponse.json({ error: 'Cannot change password for Google accounts' }, { status: 400 })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      updateData.password = await bcrypt.hash(newPassword, 10)
    }
    const user = await User.findByIdAndUpdate((session.user as any).id, updateData, { new: true }).select('-password')
    return NextResponse.json({ user })
  } catch { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
}
