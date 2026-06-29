import { NextRequest, NextResponse } from 'next/server'
import { searchOverpass } from '@/lib/overpass'
import { checkRateLimit } from '@/lib/rateLimit'
import { CATEGORY_NAMES } from '@/lib/osmCategories'

const MIN_RADIUS = 1000
const MAX_RADIUS = 50000

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { lat, lon, radius, category, showAll } = body

    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 })
    }
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 })
    }
    const radiusNum = Number(radius)
    if (!radiusNum || radiusNum < MIN_RADIUS || radiusNum > MAX_RADIUS) {
      return NextResponse.json({ error: 'Invalid radius' }, { status: 400 })
    }
    if (!category || !CATEGORY_NAMES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (typeof showAll !== 'boolean') {
      return NextResponse.json({ error: 'Invalid showAll flag' }, { status: 400 })
    }

    // Step 1: Fetch all businesses from OSM. Website verification beyond what
    // OSM already has tagged happens afterwards via /api/verify-batch, run in
    // the background from the client - that's what lets us check every lead
    // instead of only the first 10, without blocking this response on it.
    const rawResults = await searchOverpass(category, lat, lon, Number(radius), true)

    const finalResults = showAll
      ? rawResults
      : rawResults.filter(b => !b.hasWebsite)

    const noWebsiteCount = rawResults.filter(b => !b.hasWebsite).length

    return NextResponse.json({
      results: finalResults,
      total: rawResults.length,
      noWebsiteCount,
    })

  } catch (err: any) {
    if (err.message === 'RATE_LIMITED') return NextResponse.json({ error: 'Too many requests. Wait 30 seconds and retry.' }, { status: 429 })
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'Search timed out. Try a smaller radius.' }, { status: 504 })
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 })
  }
}
