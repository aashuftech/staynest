import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { AiActivity } from '@/lib/models/AiActivity'
import { AiConversation } from '@/lib/models/AiConversation'
import { AiKnowledgeSync } from '@/lib/models/AiKnowledgeSync'
import { Property } from '@/lib/models/Property'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role === 'ADMIN' ? session : null
}

function publishedPropertyQuery() {
  return {
    isAvailable: { $ne: false },
    $or: [{ listingStatus: 'APPROVED' }, { listingStatus: { $exists: false } }],
  }
}

async function getPropertyKnowledgeCounts() {
  const base = publishedPropertyQuery()
  const [propertyCount, rentPropertyCount, buyPropertyCount, verifiedPropertyCount] = await Promise.all([
    Property.countDocuments(base),
    Property.countDocuments({ ...base, $and: [{ $or: [{ listingPurpose: 'RENT' }, { listingPurpose: { $exists: false } }] }] }),
    Property.countDocuments({ ...base, listingPurpose: 'BUY' }),
    Property.countDocuments({ ...base, isVerified: true }),
  ])
  return { propertyCount, rentPropertyCount, buyPropertyCount, verifiedPropertyCount }
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()

    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 29)

    const [dailyRows, searches, searchesWithMatches, conversations, latestSync, knowledge] = await Promise.all([
      AiActivity.aggregate([
        { $match: { kind: 'PROPERTY_SEARCH', createdAt: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, searches: { $sum: 1 }, matchedSearches: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$matchedPropertyIds', []] } }, 0] }, 1, 0] } } } },
      ]),
      AiActivity.countDocuments({ kind: 'PROPERTY_SEARCH', createdAt: { $gte: start } }),
      AiActivity.countDocuments({ kind: 'PROPERTY_SEARCH', createdAt: { $gte: start }, 'matchedPropertyIds.0': { $exists: true } }),
      AiConversation.countDocuments({ lastActivityAt: { $gte: start } }),
      AiKnowledgeSync.findOne({ key: 'primary' }).lean(),
      getPropertyKnowledgeCounts(),
    ])

    const dayMap = new Map(dailyRows.map((row: any) => [row._id, row]))
    const daily = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const key = date.toISOString().slice(0, 10)
      const row: any = dayMap.get(key)
      return { date: key.slice(5), searches: row?.searches || 0, matchedSearches: row?.matchedSearches || 0 }
    })

    return NextResponse.json({
      daily,
      overview: {
        searches,
        searchesWithMatches,
        matchRate: searches ? Math.round((searchesWithMatches / searches) * 100) : 0,
        activeConversations: conversations,
      },
      knowledge,
      latestSync: latestSync ? {
        synchronizedAt: latestSync.synchronizedAt,
        propertyCount: latestSync.propertyCount,
        rentPropertyCount: latestSync.rentPropertyCount,
        buyPropertyCount: latestSync.buyPropertyCount,
        verifiedPropertyCount: latestSync.verifiedPropertyCount,
      } : null,
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    })
  } catch (error) {
    console.error('AI insights error:', error)
    return NextResponse.json({ error: 'Unable to load AI insights.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    if (body?.action !== 'SYNC_KNOWLEDGE') return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })

    await connectDB()
    const knowledge = await getPropertyKnowledgeCounts()
    const synchronizedAt = new Date()
    const sync = await AiKnowledgeSync.findOneAndUpdate(
      { key: 'primary' },
      { $set: { ...knowledge, synchronizedAt, synchronizedBy: (session.user as any).id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()

    return NextResponse.json({ sync })
  } catch (error) {
    console.error('AI knowledge sync error:', error)
    return NextResponse.json({ error: 'Unable to sync AI knowledge.' }, { status: 500 })
  }
}
