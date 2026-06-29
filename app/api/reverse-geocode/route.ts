import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocodeCoords } from '@/lib/nominatim'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip, 30, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  try {
    const { lat, lon } = await req.json()

    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 })
    }
    if (typeof lon !== 'number' || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 })
    }

    const address = await reverseGeocodeCoords(lat, lon)
    return NextResponse.json({ address })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Reverse geocoding failed' }, { status: 500 })
  }
}
