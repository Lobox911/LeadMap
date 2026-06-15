import { Business } from '@/types'
import { OSM_CATEGORIES } from './osmCategories'

function buildQuery(
  key: string,
  value: string,
  lat: number,
  lon: number,
  radius: number,
  showAll: boolean
): string {
  const websiteFilter = showAll ? '' : '[!"website"]'
  const around = 'around:' + radius + ',' + lat + ',' + lon
  const tag = '"' + key + '"="' + value + '"'
  const nodeFilter = 'node[' + tag + ']' + websiteFilter + '(' + around + ');'
  const wayFilter = 'way[' + tag + ']' + websiteFilter + '(' + around + ');'
  const relFilter = 'relation[' + tag + ']' + websiteFilter + '(' + around + ');'
  return '[out:json][timeout:30];(' + nodeFilter + wayFilter + relFilter + ');out body;>;out skel qt;'
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
    tags['addr:postcode'],
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : tags['addr:full'] || 'Address not listed'
}

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

function mapElement(el: any, category: string): Business {
  const tags = el.tags || {}
  const website = tags.website || tags['contact:website'] || null
  const osmType = el.type as 'node' | 'way' | 'relation'
  return {
    id: String(el.id),
    type: osmType,
    name: tags.name,
    category,
    address: buildAddress(tags),
    phone: tags.phone || tags['contact:phone'] || null,
    email: tags.email || tags['contact:email'] || null,
    openingHours: tags.opening_hours || null,
    hasWebsite: Boolean(website),
    website,
    osmLink: 'https://www.openstreetmap.org/' + el.type + '/' + el.id,
    lat: el.lat !== undefined ? el.lat : (el.center ? el.center.lat : null),
    lon: el.lon !== undefined ? el.lon : (el.center ? el.center.lon : null),
  }
}

export async function searchOverpass(
  category: string,
  lat: number,
  lon: number,
  radius: number,
  showAll: boolean
): Promise<Business[]> {
  const osmTag = OSM_CATEGORIES[category]
  if (!osmTag) throw new Error('Unknown category: ' + category)

  const query = buildQuery(osmTag.key, osmTag.value, lat, lon, radius, showAll)
  const body = 'data=' + encodeURIComponent(query)

  let lastError = 'All endpoints failed'

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'WebsiteGap/1.0 (contact@websitegap.org)',
          'Accept': 'application/json',
        },
        body: body,
      })

      if (res.status === 429) throw new Error('RATE_LIMITED')
      if (res.status === 504) throw new Error('TIMEOUT')

      if (!res.ok) {
        lastError = 'Overpass error ' + res.status + ' from ' + endpoint
        continue
      }

      const data = await res.json()
      const elements: any[] = data.elements || []

      return elements
        .filter((el) => el.tags && el.tags.name)
        .map((el) => mapElement(el, category))

    } catch (err: any) {
      if (err.message === 'RATE_LIMITED') throw err
      if (err.message === 'TIMEOUT') throw err
      lastError = err.message || 'Unknown error from ' + endpoint
    }
  }

  throw new Error(lastError)
}