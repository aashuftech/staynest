import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MAX_FILE_SIZE = 8 * 1024 * 1024

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: 'Image uploads are not configured. Add Cloudinary credentials to .env.' }, { status: 503 })

  const form = await request.formData()
  const file = form.get('file')
  const scope = form.get('scope')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file first.' }, { status: 400 })
  if (scope !== 'profile' && scope !== 'property') return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Each image must be 8 MB or smaller.' }, { status: 400 })

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = scope === 'profile' ? 'staynest/profiles' : 'staynest/properties'
  const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex')
  const cloudinaryForm = new FormData()
  cloudinaryForm.append('file', file)
  cloudinaryForm.append('api_key', apiKey)
  cloudinaryForm.append('timestamp', String(timestamp))
  cloudinaryForm.append('folder', folder)
  cloudinaryForm.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: cloudinaryForm })
  const data = await response.json()
  if (!response.ok || !data.secure_url) return NextResponse.json({ error: data.error?.message || 'Image upload failed.' }, { status: 502 })
  return NextResponse.json({ url: data.secure_url })
}
