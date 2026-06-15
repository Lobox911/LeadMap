import { NextRequest, NextResponse } from 'next/server'
import { searchOverpass } from '@/lib/overpass'
import { checkRateLimit } from '@/lib/rateLimit'
import { CATEGORY_NAMES } from '@/lib/osmCategories'
import { verifyBusinessWebsites } from '@/lib/verifyWebsite'

const VALID_RADII = [1000, 5000, 10000, 25000, 50000]
const MAX_VERIFY = 10 // Google CSE free tier = 100/day, verify top 10 per search

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { lat, lon, radius, category, showAll, location } = body

    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 })
    }
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 })
    }
    if (!VALID_RADII.includes(Number(radius))) {
      return NextResponse.json({ error: 'Invalid radius' }, { status: 400 })
    }
    if (!category || !CATEGORY_NAMES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if (typeof showAll !== 'boolean') {
      return NextResponse.json({ error: 'Invalid showAll flag' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_CSE_API_KEY
    const cseId = process.env.GOOGLE_CSE_ID
    const canVerify = Boolean(apiKey && cseId)

    // Step 1: Fetch all businesses from OSM
    const rawResults = await searchOverpass(category, lat, lon, Number(radius), true)

    let finalResults = rawResults

    if (canVerify) {
      // Step 2: Only verify businesses OSM says have NO website (top 10)
      const noWebsiteBatch = rawResults
        .filter(b => !b.hasWebsite)
        .slice(0, MAX_VERIFY)

      const verificationMap = await verifyBusinessWebsites(
        noWebsiteBatch.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address,
          hasWebsite: b.hasWebsite,
          website: b.website,
        })),
        location || '',
        apiKey!,
        cseId!
      )

      // Step 3: Apply verification — update hasWebsite based on Google results
      finalResults = rawResults.map(b => {
        const verification = verificationMap.get(b.id)
        if (!verification) return b
        return {
          ...b,
          hasWebsite: verification.hasWebsite,
          website: verification.websiteUrl || b.website,
          verified: verification.verified,
        }
      })
    }

    // Step 4: Apply filter
    const filtered = showAll
      ? finalResults
      : finalResults.filter(b => !b.hasWebsite)

    const noWebsiteCount = finalResults.filter(b => !b.hasWebsite).length

    return NextResponse.json({
      results: filtered,
      total: finalResults.length,
      noWebsiteCount,
      verified: canVerify,
    })

  } catch (err: any) {
    if (err.message === 'RATE_LIMITED') return NextResponse.json({ error: 'Too many requests. Wait 30 seconds and retry.' }, { status: 429 })
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'Search timed out. Try a smaller radius.' }, { status: 504 })
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 })
  }
}