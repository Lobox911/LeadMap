export type Confidence = 'pending' | 'confirmed' | 'likely' | 'unconfirmed'

export interface Business {
  id: string
  type: 'node' | 'way' | 'relation'
  name: string
  category: string
  address: string
  phone: string | null
  email: string | null
  openingHours: string | null
  hasWebsite: boolean
  website: string | null
  // How trustworthy `hasWebsite` is right now:
  //  'confirmed'   - OSM had the website tagged, or a live web search confirmed it
  //  'likely'      - a guessed domain responded live, but wasn't cross-checked
  //  'unconfirmed' - we genuinely don't know yet (don't show this as "No Website")
  //  'pending'     - background verification hasn't run yet
  confidence: Confidence
  osmLink: string
  lat: number | null
  lon: number | null
}

export interface GeoResult {
  lat: string
  lon: string
  display_name: string
}

export interface SearchParams {
  location: string
  lat: number
  lon: number
  radius: number
  category: string
  showAll: boolean
}

export interface SavedLead extends Business {
  savedAt: string
}