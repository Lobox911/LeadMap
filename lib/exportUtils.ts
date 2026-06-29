import { Business } from '@/types'

function esc(val: unknown): string {
  const s = val == null ? '' : String(val)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : `"${s}"`
}

export function exportToCsv(businesses: Business[], filename = 'websitegap-leads.csv'): void {
  const headers = ['Name','Category','Address','Phone','Email','Opening Hours','No Website','Confidence','Website URL','OSM Link','Lat','Lon']
  const rows = businesses.map(b => [
    b.name, b.category, b.address, b.phone, b.email,
    b.openingHours, b.hasWebsite ? 'NO' : 'YES', b.confidence,
    b.website, b.osmLink, b.lat, b.lon,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\r\n')
  download(csv, filename, 'text/csv;charset=utf-8;')
}

export function exportToJson(businesses: Business[], filename = 'websitegap-leads.json'): void {
  download(JSON.stringify(businesses, null, 2), filename, 'application/json;charset=utf-8;')
}

function download(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename, style: 'display:none' })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}