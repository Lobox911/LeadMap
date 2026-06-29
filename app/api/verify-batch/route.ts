import { NextRequest, NextResponse } from 'next/server'
import { verifyBusinessesBatch } from '@/lib/verifyWebsite'
import { checkRateLimit } from '@/lib/rateLimit'

const MAX_BATCH_SIZE = 25

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  // Each search triggers several of these in sequence, so allow more than the
  // default per-minute budget, but still cap it.
  if (!checkRateLimit(ip, 40, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { businesses, location } = body

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json({ error: 'businesses array required' }, { status: 400 })
    }
    if (businesses.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: 'Batch too large, max ' + MAX_BATCH_SIZE }, { status: 400 })
    }
    for (const b of businesses) {
      if (typeof b.id !== 'string' || typeof b.name !== 'string') {
        return NextResponse.json({ error: 'Each business needs an id and name' }, { status: 400 })
      }
    }

    const apiKey = process.env.GOOGLE_CSE_API_KEY
    const cseId = process.env.GOOGLE_CSE_ID

    const verificationMap = await verifyBusinessesBatch(
      businesses.map((b: any) => ({
        id: b.id,
        name: b.name,
        address: b.address || 'Address not listed',
        hasWebsite: Boolean(b.hasWebsite),
        website: b.website || null,
      })),
      location || '',
      apiKey,
      cseId
    )

    const results: Record<string, { hasWebsite: boolean; websiteUrl: string | null; confidence: string }> = {}
    for (const [id, result] of verificationMap.entries()) {
      results[id] = result
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 })
  }
}
