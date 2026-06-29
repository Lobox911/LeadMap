import { Confidence } from '@/types'

interface VerificationResult {
  hasWebsite: boolean
  websiteUrl: string | null
  confidence: Confidence
}

const TIMEOUT_MS = 3500

async function fetchWithTimeout(url: string, ms: number, method: string = 'GET'): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal, method, redirect: 'follow' })
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
  'tiktok.com',
  'pinterest.com',
  'yelp.ca',
  'zoominfo.com',
  'manta.com',
  'chamberofcommerce.com',
  'bizapedia.com',
  'dnb.com',
  'hotfrog.com',
]

// Domains that resolve and return 200 but are actually parked/for-sale pages,
// not a real business site. A guessed domain landing here is NOT a match.
const PARKING_DOMAINS = [
  'sedo.com', 'dan.com', 'parkingcrew.net', 'bodis.com', 'undeveloped.com',
  'hugedomains.com', 'godaddy.com', 'afternic.com', 'above.com', 'parklogic.com',
  'voodoo.com', 'namebrightdomains.com', 'dnpark.com',
]

function isDirectorySite(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '')
    return DIRECTORY_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
  } catch {
    return false
  }
}

function isParkingPage(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '')
    return PARKING_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
  } catch {
    return false
  }
}

function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function domainMatchesBusiness(url: string, businessName: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '')
    const nameParts = normalizeBusinessName(businessName).split(' ')
    const significantParts = nameParts.filter(p => p.length > 3)
    return significantParts.some(part => hostname.includes(part))
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// FREE PASS: guess a domain from the business name and see if it's actually
// live. This is what catches cases like a chain location OSM never tagged
// with a website ("Vapiano Stureplan" -> vapiano.se) without spending any
// API quota. It runs for every lead, not just the first 10.
// ---------------------------------------------------------------------------

const COUNTRY_TLDS: Record<string, string> = {
  sweden: 'se', norway: 'no', denmark: 'dk', finland: 'fi', iceland: 'is',
  germany: 'de', france: 'fr', spain: 'es', italy: 'it', netherlands: 'nl',
  poland: 'pl', portugal: 'pt', belgium: 'be', austria: 'at', switzerland: 'ch',
  'united kingdom': 'co.uk', england: 'co.uk', scotland: 'co.uk', wales: 'co.uk',
  ireland: 'ie', canada: 'ca', australia: 'com.au', 'new zealand': 'co.nz',
  brazil: 'com.br', mexico: 'com.mx', nigeria: 'com.ng', 'south africa': 'co.za',
  india: 'in', singapore: 'sg', 'united arab emirates': 'ae', dubai: 'ae',
}

function detectCountryTld(location: string): string | null {
  const lower = location.toLowerCase()
  for (const [country, tld] of Object.entries(COUNTRY_TLDS)) {
    if (lower.includes(country)) return tld
  }
  return null
}

function nameBaseCandidates(name: string): string[] {
  const clean = normalizeBusinessName(name)
  const words = clean.split(' ').filter(Boolean)
  const bases = new Set<string>()
  if (words.length > 0) {
    bases.add(words.join('')) // "cafe luna" -> "cafeluna"
    bases.add(words[0]) // catches chain/branch names: "vapiano stureplan" -> "vapiano"
    if (words.length > 1) bases.add(words.slice(0, 2).join(''))
  }
  return Array.from(bases).filter(b => b.length >= 3)
}

function buildDomainGuesses(name: string, location: string): string[] {
  const bases = nameBaseCandidates(name)
  const ccTld = detectCountryTld(location)
  const tlds = ['com', ...(ccTld && ccTld !== 'com' ? [ccTld] : [])]
  const domains: string[] = []
  for (const base of bases) {
    for (const tld of tlds) domains.push(base + '.' + tld)
  }
  return domains.slice(0, 6) // hard cap so one weird name can't fan out forever
}

async function checkDomainLive(domain: string): Promise<string | null> {
  for (const url of ['https://' + domain, 'https://www.' + domain]) {
    try {
      let res = await fetchWithTimeout(url, TIMEOUT_MS, 'HEAD')
      if (res.status === 405 || res.status === 501) {
        res = await fetchWithTimeout(url, TIMEOUT_MS, 'GET')
      }
      if (!res.ok) continue
      if (isParkingPage(res.url)) continue
      return res.url
    } catch {
      continue
    }
  }
  return null
}

async function guessWebsite(name: string, location: string): Promise<string | null> {
  const guesses = buildDomainGuesses(name, location)
  for (const domain of guesses) {
    const liveUrl = await checkDomainLive(domain)
    if (liveUrl) return liveUrl
  }
  return null
}

// ---------------------------------------------------------------------------
// PAID FALLBACK: Google Custom Search, used only when the free guess above
// can't resolve a lead. Capped at a daily budget (well under the 100/day
// free quota) so it never blocks or burns through the account unexpectedly.
// Note: this budget counter lives in memory per server instance, so on
// serverless deploys with multiple instances/cold starts it's an approximate
// cap, not a hard guarantee. For a hard guarantee, move it to a shared store
// (e.g. Vercel KV / Upstash) keyed by date.
// ---------------------------------------------------------------------------

const GOOGLE_CSE_DAILY_BUDGET = 90
let cseUsedToday = 0
let cseResetAt = nextUtcMidnight()

function nextUtcMidnight(): number {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return d.getTime()
}

function cseBudgetAvailable(): boolean {
  if (Date.now() > cseResetAt) {
    cseUsedToday = 0
    cseResetAt = nextUtcMidnight()
  }
  return cseUsedToday < GOOGLE_CSE_DAILY_BUDGET
}

async function searchGoogleCSE(
  businessName: string,
  location: string,
  apiKey: string,
  cseId: string
): Promise<{ hasWebsite: boolean; websiteUrl: string | null; confirmed: boolean }> {
  try {
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

      if (res.status === 429) return { hasWebsite: false, websiteUrl: null, confirmed: false }
      if (!res.ok) continue

      const data = await res.json()
      const items: any[] = data.items || []
      if (items.length === 0) continue

      for (const item of items) {
        const link: string = item.link || ''
        if (!link) continue
        if (!isDirectorySite(link) && domainMatchesBusiness(link, businessName)) {
          return { hasWebsite: true, websiteUrl: link, confirmed: true }
        }
      }
      for (const item of items.slice(0, 3)) {
        const link: string = item.link || ''
        if (!link) continue
        if (!isDirectorySite(link)) {
          return { hasWebsite: true, websiteUrl: link, confirmed: true }
        }
      }
    }

    // Both queries returned only directories (or nothing) - genuinely confirmed absent.
    return { hasWebsite: false, websiteUrl: null, confirmed: true }
  } catch {
    return { hasWebsite: false, websiteUrl: null, confirmed: false }
  }
}

// ---------------------------------------------------------------------------
// Public entry point: verify a batch of leads. Every lead gets the free
// domain-guess pass; only the ones that pass can't resolve, and only while
// daily budget remains, get a Google Custom Search check.
// ---------------------------------------------------------------------------

export async function verifyBusinessesBatch(
  businesses: Array<{
    id: string
    name: string
    address: string
    hasWebsite: boolean
    website: string | null
  }>,
  location: string,
  apiKey: string | undefined,
  cseId: string | undefined
): Promise<Map<string, VerificationResult>> {
  const results = new Map<string, VerificationResult>()
  const CONCURRENCY = 8

  for (let i = 0; i < businesses.length; i += CONCURRENCY) {
    const batch = businesses.slice(i, i + CONCURRENCY)

    const batchResults = await Promise.all(
      batch.map(async (business) => {
        // OSM already had a website tagged - trust it, no need to check further.
        if (business.hasWebsite && business.website) {
          return {
            id: business.id,
            result: { hasWebsite: true, websiteUrl: business.website, confidence: 'confirmed' as Confidence },
          }
        }

        // Free pass: does a guessed domain actually respond?
        const guessedUrl = await guessWebsite(business.name, location)
        if (guessedUrl) {
          return {
            id: business.id,
            result: { hasWebsite: true, websiteUrl: guessedUrl, confidence: 'likely' as Confidence },
          }
        }

        // Paid fallback, only while budget remains.
        if (apiKey && cseId && cseBudgetAvailable()) {
          cseUsedToday++
          const searchLocation = business.address !== 'Address not listed'
            ? business.address.split(',').slice(-2).join(',').trim()
            : location
          const cse = await searchGoogleCSE(business.name, searchLocation, apiKey, cseId)
          return {
            id: business.id,
            result: {
              hasWebsite: cse.hasWebsite,
              websiteUrl: cse.websiteUrl,
              confidence: (cse.confirmed ? 'confirmed' : 'unconfirmed') as Confidence,
            },
          }
        }

        // No way to check further right now - say so honestly rather than
        // claiming "no website" without having actually confirmed it.
        return {
          id: business.id,
          result: { hasWebsite: false, websiteUrl: null, confidence: 'unconfirmed' as Confidence },
        }
      })
    )

    for (const { id, result } of batchResults) {
      results.set(id, result)
    }
  }

  return results
}
