import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip, 20, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { query } = await req.json()

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const trimmed = query.trim().slice(0, 100)

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', trimmed)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '6')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('featureType', 'city')

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'WebsiteGap/1.0 contact@websitegap.org',
        'Accept-Language': 'en',
      },
    })

    if (!res.ok) return NextResponse.json({ suggestions: [] })

    const data = await res.json()

    const suggestions = data
      .filter((item: any) => item.address)
      .map((item: any) => {
        const addr = item.address
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county
        const state = addr.state
        const country = addr.country
        const parts = [city, state, country].filter(Boolean)
        return {
          label: parts.join(', '),
          lat: item.lat,
          lon: item.lon,
        }
      })
      .filter((s: any, i: number, arr: any[]) =>
        s.label && arr.findIndex(x => x.label === s.label) === i
      )
      .slice(0, 6)

    return NextResponse.json({ suggestions })
  } catch (err: any) {
    return NextResponse.json({ suggestions: [] })
  }
}