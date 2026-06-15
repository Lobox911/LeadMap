import { GeoResult } from '@/types'

export async function geocodeLocation(location: string): Promise<GeoResult> {
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
}