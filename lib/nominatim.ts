import { GeoResult } from '@/types'

// Nominatim's usage policy caps requests at ~1/sec from a single client.
// All reverse-geocode calls from every user funnel through this server, so we
// serialize them here with a small spacing delay rather than trusting that
// callers will space themselves out.
let lastNominatimCallAt = 0
const MIN_GAP_MS = 1100
let nominatimQueue: Promise<void> = Promise.resolve()

async function throttledNominatimCall<T>(fn: () => Promise<T>): Promise<T> {
  const runNow = async (): Promise<T> => {
    const wait = Math.max(0, lastNominatimCallAt + MIN_GAP_MS - Date.now())
    if (wait > 0) await new Promise(r => setTimeout(r, wait))
    lastNominatimCallAt = Date.now()
    return fn()
  }
  const result = nominatimQueue.then(runNow)
  nominatimQueue = result.then(() => undefined, () => undefined)
  return result
}

export async function geocodeLocation(location: string): Promise<GeoResult> {
  return throttledNominatimCall(async () => {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', location)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'WebsiteGap/1.0 contact@websitegap.org',
        'Accept-Language': 'en',
      },
    })

    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`)
    const data = await res.json()
    if (!data || data.length === 0) throw new Error('Location not found')

    return {
      lat: data[0].lat,
      lon: data[0].lon,
      display_name: data[0].display_name,
    }
  })
}

// Reverse geocode: turn a lat/lon we already have (from Overpass) into a real
// street address, for the common case where OSM never tagged addr:* fields
// on the business itself. Returns null rather than throwing when Nominatim
// has nothing usable, so callers can fall back to the manual "Find address" link.
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<string | null> {
  return throttledNominatimCall(async () => {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lon))
    url.searchParams.set('format', 'json')
    url.searchParams.set('zoom', '18')
    url.searchParams.set('addressdetails', '1')

    let res: Response
    try {
      res = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'WebsiteGap/1.0 contact@websitegap.org',
          'Accept-Language': 'en',
        },
      })
    } catch {
      return null
    }

    if (!res.ok) return null
    const data = await res.json()
    const a = data?.address
    if (!a) return null

    const parts = [
      [a.house_number, a.road].filter(Boolean).join(' '),
      a.suburb || a.neighbourhood,
      a.city || a.town || a.village || a.municipality,
      a.postcode,
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(', ') : (data.display_name || null)
  })
}