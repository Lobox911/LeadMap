import { Business, SavedLead } from '@/types'

const KEY = 'websitegap_saved_leads'

export function getSavedLeads(): SavedLead[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export function saveLead(b: Business): SavedLead[] {
  const leads = getSavedLeads()
  if (leads.find(l => l.id === b.id)) return leads
  const updated = [...leads, { ...b, savedAt: new Date().toISOString() }]
  localStorage.setItem(KEY, JSON.stringify(updated))
  return updated
}

export function removeLead(id: string): SavedLead[] {
  const updated = getSavedLeads().filter(l => l.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return updated
}

export function clearAllLeads(): void {
  localStorage.removeItem(KEY)
}