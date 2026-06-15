import { NextRequest, NextResponse } from 'next/server'
import { geocodeLocation } from '@/lib/nominatim'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }
  try {
    const { location } = await req.json()
    if (!location || typeof location !== 'string') {
      return NextResponse.json({ error: 'Location required' }, { status: 400 })
    }
    const trimmed = location.trim()
    if (trimmed.length === 0) return NextResponse.json({ error: 'Location cannot be empty' }, { status: 400 })
    if (trimmed.length > 200) return NextResponse.json({ error: 'Location too long' }, { status: 400 })
    const result = await geocodeLocation(trimmed)
    return NextResponse.json(result)
  } catch (err: any) {
    const status = err.message === 'Location not found' ? 404 : 500
    return NextResponse.json({ error: err.message || 'Geocoding failed' }, { status })
  }
}