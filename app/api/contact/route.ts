import { NextRequest, NextResponse } from 'next/server'

const SUPPORT_EMAIL = 'westaynest@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !message) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email delivery is not configured yet.' }, { status: 503 })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'StayNest <onboarding@resend.dev>',
        to: [SUPPORT_EMAIL],
        reply_to: email,
        subject: `[StayNest Contact] ${subject || 'New customer message'}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    })

    if (!response.ok) {
      let details = ''
      try { details = await response.text() } catch {}
      // Surface the real cause in the server logs so it's easy to diagnose in production.
      console.error(`Resend error (${response.status}):`, details)

      // Most common cause: sending from the shared "onboarding@resend.dev" test address only
      // works when the "to" address matches the email the Resend account was created with.
      // Fix: verify a real domain in the Resend dashboard (resend.com/domains) and set
      // CONTACT_FROM_EMAIL to an address on that domain, e.g. "StayNest <contact@yourdomain.com>".
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Email delivery is not fully configured yet (sender domain not verified). Please email us directly at westaynest@gmail.com.' },
          { status: 502 }
        )
      }
      return NextResponse.json({ error: 'Unable to send your message right now. Please try again shortly.' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route failed:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
