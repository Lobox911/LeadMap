interface VerificationResult {
  hasWebsite: boolean
  websiteUrl: string | null
  verified: boolean
}

const TIMEOUT_MS = 5000

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

const DIRECTORY_DOMAINS = [
  'facebook.com', 'fb.com',
  'yelp.com',
  'tripadvisor.com',
  'yellowpages.com',
  'foursquare.com',
  'zomato.com',
  'doordash.com',
  'ubereats.com',
  'grubhub.com',
  'opentable.com',
  'instagram.com',
  'twitter.com', 'x.com',
  'linkedin.com',
  'google.com', 'google.co',
  'apple.com',
  'bing.com',
  'wikipedia.org',
  'mapquest.com',
  'bbb.org',
  'angieslist.com',
  'thumbtack.com',
  'homeadvisor.com',
  'nextdoor.com',
  'justdial.com',
  'maps.apple.com',
  'waze.com',
  'allmenus.com',
  'menupages.com',
  'seamless.com',
  'postmates.com',
  'restaurantji.com',
  'menuism.com',
  'locu.com',
  'urbanspoon.com',
  'gayot.com',
  'eater.com',
  'zagat.com',
  'diningout.com',
  'reserveout.com',
  'openmenu.com',
  'delivery.com',
  'grubhub.com',
  'tiktok.com',
  'twitter.com',
  'pinterest.com',
  'yelp.ca',
  'zoominfo.com',
  'manta.com',
  'chamberofcommerce.com',
  'bizapedia.com',
  'dnb.com',
  'hotfrog.com',
]

function isDirectorySite(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '')
    return DIRECTORY_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
  } catch {
    return false
  }
}

function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function domainMatchesBusiness(url: string, businessName: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '')
    const nameParts = normalizeBusinessName(businessName).split(' ')
    // Check if domain contains significant words from business name
    const significantParts = nameParts.filter(p => p.length > 3)
    return significantParts.some(part => hostname.includes(part))
  } catch {
    return false
  }
}

async function searchGoogleCSE(
  businessName: string,
  location: string,
  apiKey: string,
  cseId: string
): Promise<VerificationResult> {
  try {
    // Use two different queries for better coverage
    const queries = [
      '"' + businessName + '" ' + location + ' official site',
      businessName + ' ' + location + ' website',
    ]

    for (const query of queries) {
      const url = 'https://www.googleapis.com/customsearch/v1?key=' + apiKey +
        '&cx=' + cseId +
        '&q=' + encodeURIComponent(query) +
        '&num=5'

      const res = await fetchWithTimeout(url, TIMEOUT_MS)

      if (res.status === 429) return { hasWebsite: false, websiteUrl: null, verified: false }
      if (!res.ok) continue

      const data = await res.json()
      const items: any[] = data.items || []

      if (items.length === 0) continue

      // Priority 1: find a result that matches business name AND is not a directory
      for (const item of items) {
        const link: string = item.link || ''
        if (!link) continue
        if (!isDirectorySite(link) && domainMatchesBusiness(link, businessName)) {
          return { hasWebsite: true, websiteUrl: link, verified: true }
        }
      }

      // Priority 2: find any non-directory result in top 3
      for (const item of items.slice(0, 3)) {
        const link: string = item.link || ''
        if (!link) continue
        if (!isDirectorySite(link)) {
          return { hasWebsite: true, websiteUrl: link, verified: true }
        }
      }
    }

    // Both queries only returned directories — genuinely no website
    return { hasWebsite: false, websiteUrl: null, verified: true }

  } catch {
    return { hasWebsite: false, websiteUrl: null, verified: false }
  }
}

export async function verifyBusinessWebsites(
  businesses: Array<{
    id: string
    name: string
    address: string
    hasWebsite: boolean
    website: string | null
  }>,
  location: string,
  apiKey: string,
  cseId: string
): Promise<Map<string, VerificationResult>> {
  const results = new Map<string, VerificationResult>()

  const CONCURRENCY = 5

  for (let i = 0; i < businesses.length; i += CONCURRENCY) {
    const batch = businesses.slice(i, i + CONCURRENCY)

    const batchResults = await Promise.all(
      batch.map(async (business) => {
        // OSM already confirmed a website URL — trust it
        if (business.hasWebsite && business.website) {
          return {
            id: business.id,
            result: { hasWebsite: true, websiteUrl: business.website, verified: true },
          }
        }

        const searchLocation = business.address !== 'Address not listed'
          ? business.address.split(',').slice(-2).join(',').trim()
          : location

        const result = await searchGoogleCSE(
          business.name,
          searchLocation,
          apiKey,
          cseId
        )

        return { id: business.id, result }
      })
    )

    for (const { id, result } of batchResults) {
      results.set(id, result)
    }
  }

  return results
}