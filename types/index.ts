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