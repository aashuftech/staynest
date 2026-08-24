import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Property } from '@/lib/models/Property'
import { AiConversation } from '@/lib/models/AiConversation'
import { groqChat } from '@/lib/groq'
import { fallbackAiMessage, STAYNEST_ASSISTANT_SYSTEM_PROMPT } from '@/lib/staynest-ai'
import { resolveAiActor } from '@/lib/ai-activity'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const PROPERTY_TERMS = /\b(apartment|flat|villa|house|condo|property|rent|buy|purchase|budget|bedroom|kiraya|khareed|kharid|ghar|flat|property|renting)\b/i

function looksLikePropertyQuestion(text: string) {
  return PROPERTY_TERMS.test(text) || /property|घर|किराया|खरीद/i.test(text)
}

function propertyPurpose(text: string) {
  return /\b(buy|purchase|sale|sell|kharid|खरीद)\b/i.test(text) ? 'BUY' : 'RENT'
}

function cityFromText(text: string) {
  const match = text.match(/\b(?:in|near|around|at)\s+([a-zA-Z][a-zA-Z\s-]{2,35})/i)
  return match?.[1]?.trim().replace(/\s+(under|below|within|with|for|and)\b.*$/i, '') || null
}

async function realPropertyContext(text: string) {
  if (!looksLikePropertyQuestion(text)) return ''
  const purpose = propertyPurpose(text)
  const query: any = {
    isAvailable: { $ne: false },
    listingStatus: { $in: ['APPROVED', null] },
  }
  const city = cityFromText(text)
  if (city) query.$or = [{ city: { $regex: city, $options: 'i' } }, { neighborhood: { $regex: city, $options: 'i' } }]
  if (purpose === 'BUY') {
    query.listingPurpose = 'BUY'
    query.saleStatus = { $ne: 'SOLD' }
  } else {
    query.$and = [{ $or: [{ listingPurpose: 'RENT' }, { listingPurpose: { $exists: false } }] }]
  }

  const properties = await Property.find(query)
    .select('title type city neighborhood pricePerMonth finalPrice bedrooms bathrooms amenities isVerified listingPurpose')
    .sort({ isVerified: -1, rating: -1 })
    .limit(5)
    .lean()

  if (!properties.length) {
    return 'REAL LISTING SEARCH: No relevant published StayNest listing was found. Do not invent a listing; suggest Apartments > Search with AI or Request a Property.'
  }

  return `REAL LISTINGS FROM STAYNEST DATABASE (only mention these if recommending a listing):\n${JSON.stringify(properties.map((property: any) => ({
    title: property.title,
    type: property.type,
    city: property.city,
    neighborhood: property.neighborhood,
    price: property.listingPurpose === 'BUY' ? property.finalPrice : property.pricePerMonth,
    priceLabel: property.listingPurpose === 'BUY' ? 'final purchase price' : 'monthly rent',
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: property.amenities,
    verified: property.isVerified,
  })))}`
}

function conversationFilter(actor: { userId?: string; visitorId?: string }) {
  if (actor.userId) return { userId: actor.userId }
  if (actor.visitorId) return { visitorId: actor.visitorId }
  return null
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const actor = await resolveAiActor(searchParams.get('visitorId'))
    const filter = conversationFilter(actor)

    if (!filter) return NextResponse.json({ messages: [] })

    const conversation = await AiConversation.findOne(filter)
      .select('messages')
      .lean()

    return NextResponse.json({ messages: conversation?.messages || [] })
  } catch (error) {
    console.error('Unable to load AI conversation:', error)
    return NextResponse.json({ messages: [] }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let latestUserMessage = ''
  try {
    const body = await req.json()
    if (!Array.isArray(body?.messages)) {
      return NextResponse.json({ reply: 'Please send a valid message.' }, { status: 400 })
    }

    const conversation: ChatMessage[] = body.messages
      .filter((message: any) => (message?.role === 'user' || message?.role === 'assistant') && typeof message?.content === 'string')
      .map((message: any) => ({ role: message.role, content: message.content.trim().slice(0, 1500) }))
      .filter((message: ChatMessage) => message.content)
      .slice(-16)

    latestUserMessage = [...conversation].reverse().find(message => message.role === 'user')?.content || ''
    if (!latestUserMessage) {
      return NextResponse.json({ reply: 'Hi! I am StayNest AI. How can I help you today?' })
    }

    await connectDB()
    const actor = await resolveAiActor(body?.visitorId)
    const propertyContext = await realPropertyContext(latestUserMessage)
    const pageContext = typeof body?.context?.pathname === 'string' ? body.context.pathname.slice(0, 160) : ''

    const reply = await groqChat([
      {
        role: 'system',
        content: `${STAYNEST_ASSISTANT_SYSTEM_PROMPT}\n\nCURRENT CONTEXT\n- Visitor role: ${actor.role}\n- Current page: ${pageContext || 'unknown'}\n${propertyContext}`,
      },
      ...conversation,
    ], { temperature: 0.65, maxTokens: 600 })

    const filter = conversationFilter(actor)
    if (filter) {
      try {
        await AiConversation.findOneAndUpdate(
          filter,
          {
            $setOnInsert: filter,
            $set: { lastActivityAt: new Date() },
            $push: {
              messages: {
                $each: [
                  { role: 'user', content: latestUserMessage, createdAt: new Date() },
                  { role: 'assistant', content: reply, createdAt: new Date() },
                ],
                // Prevent an endlessly growing document while retaining the latest chat context.
                $slice: -200,
              },
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      } catch (saveError) {
        // AI remains usable if history storage is temporarily unavailable.
        console.error('Unable to save AI conversation:', saveError)
      }
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('StayNest AI chat error:', error)
    return NextResponse.json({ reply: fallbackAiMessage(latestUserMessage) }, { status: 500 })
  }
}
