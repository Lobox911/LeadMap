'use client'

import { useState } from 'react'
import {
  IconTarget, IconMapPin, IconSearch, IconChevronDown,
  IconCheck, IconSparkles, IconLoader2
} from '@tabler/icons-react'
import { CATEGORY_NAMES } from '@/lib/osmCategories'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh',
  'Belgium','Brazil','Canada','Chile','China','Colombia','Czech Republic','Denmark',
  'Egypt','Ethiopia','Finland','France','Germany','Ghana','Greece','Hungary','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan','Kenya',
  'Malaysia','Mexico','Morocco','Netherlands','New Zealand','Nigeria','Norway',
  'Pakistan','Peru','Philippines','Poland','Portugal','Romania','Russia',
  'Saudi Arabia','Singapore','South Africa','South Korea','Spain','Sweden',
  'Switzerland','Tanzania','Thailand','Turkey','Uganda','Ukraine',
  'United Arab Emirates','United Kingdom','United States','Vietnam','Zimbabwe',
].sort()

const RADIUS_OPTIONS = [
  { label: '1 km',  value: 1000  },
  { label: '5 km',  value: 5000  },
  { label: '10 km', value: 10000 },
  { label: '25 km', value: 25000 },
  { label: '50 km', value: 50000 },
]

interface Props {
  onSearch: (params: { location: string; category: string; radius: number; showAll: boolean }) => void
  loading: boolean
  geoLabel: string | null
  onClearGeo: () => void
}

export default function SearchPanel({ onSearch, loading, geoLabel, onClearGeo }: Props) {
  const [country, setCountry] = useState('United States')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('Restaurant')
  const [customCat, setCustomCat] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [radius, setRadius] = useState(10000)
  const [showAll, setShowAll] = useState(false)
  const [showCountryMenu, setShowCountryMenu] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')

  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return
    const loc = `${city.trim()}, ${country}`
    const cat = useCustom ? customCat.trim() : category
    if (!cat) return
    onSearch({ location: loc, category: cat, radius, showAll })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#1a1d2e]">
        <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
          <IconTarget size={15} stroke={1.5} className="text-[#00d4ff]" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#f0f0f5] tracking-wide uppercase">Target Search</p>
          <p className="text-[10px] text-[#4a4d60] font-mono">OpenStreetMap · Free · No API key</p>
        </div>
      </div>

      {/* Geocoded label */}
      {geoLabel && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#00d4ff]/5 border border-[#00d4ff]/15 rounded-xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shrink-0 animate-pulse" />
            <p className="text-[10px] font-mono text-[#00d4ff] truncate">{geoLabel}</p>
          </div>
          <button type="button" onClick={onClearGeo} className="text-[#3a3d50] hover:text-[#f0f0f5] text-xs ml-2 shrink-0">✕</button>
        </div>
      )}

      {/* Country */}
      <div className="space-y-1.5 relative">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a4d60] font-mono">Country</label>
        <button
          type="button"
          onClick={() => setShowCountryMenu(!showCountryMenu)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl text-sm text-[#f0f0f5] hover:border-[#252840] transition-colors text-left focus-visible:outline-[#00d4ff]"
        >
          <span>{country}</span>
          <IconChevronDown size={14} stroke={1.5} className={`text-[#4a4d60] transition-transform ${showCountryMenu ? 'rotate-180' : ''}`} />
        </button>

        {showCountryMenu && (
          <div className="absolute left-0 right-0 z-50 mt-1 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl shadow-2xl overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={countrySearch}
              onChange={e => setCountrySearch(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#08090e] text-xs text-[#f0f0f5] border-b border-[#1a1d2e] focus:outline-none placeholder-[#3a3d50] font-mono"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCountry(c); setShowCountryMenu(false); setCountrySearch('') }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-[#8888aa] hover:bg-[#00d4ff]/5 hover:text-white transition-colors text-left"
                >
                  {c}
                  {country === c && <IconCheck size={12} stroke={2} className="text-[#00d4ff]" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3.5 py-3 text-xs text-[#3a3d50] text-center font-mono">No results</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a4d60] font-mono">City / Region</label>
        <div className="relative">
          <IconMapPin size={14} stroke={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3d50]" />
          <input
            type="text"
            required
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Austin, Lagos, London"
            className="w-full pl-9 pr-3.5 py-2.5 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl text-sm text-[#f0f0f5] placeholder-[#3a3d50] focus:border-[#00d4ff]/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2 border-t border-[#1a1d2e] pt-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a4d60] font-mono">Business Type</label>
          <button
            type="button"
            onClick={() => setUseCustom(!useCustom)}
            className="flex items-center gap-1 text-[10px] text-[#00d4ff] font-bold font-mono hover:underline"
          >
            <IconSparkles size={10} stroke={2} />
            {useCustom ? 'Use presets' : 'Custom'}
          </button>
        </div>
        {useCustom ? (
          <input
            type="text"
            required
            value={customCat}
            onChange={e => setCustomCat(e.target.value)}
            placeholder="e.g. Wedding photographer"
            className="w-full px-3.5 py-2.5 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl text-sm text-[#f0f0f5] placeholder-[#3a3d50] focus:border-[#00d4ff]/40 focus:outline-none transition-colors"
          />
        ) : (
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl text-sm text-[#f0f0f5] focus:border-[#00d4ff]/40 focus:outline-none transition-colors cursor-pointer appearance-none"
            >
              {CATEGORY_NAMES.map(c => (
                <option key={c} value={c} className="bg-[#0d0f1a]">{c}</option>
              ))}
            </select>
            <IconChevronDown size={14} stroke={1.5} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a4d60] pointer-events-none" />
          </div>
        )}
      </div>

      {/* Radius */}
      <div className="space-y-2 border-t border-[#1a1d2e] pt-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4a4d60] font-mono">Search Radius</label>
        <div className="grid grid-cols-5 gap-1.5">
          {RADIUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRadius(opt.value)}
              className={`py-2 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                radius === opt.value
                  ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]'
                  : 'bg-[#0d0f1a] border-[#1a1d2e] text-[#4a4d60] hover:text-[#8888aa] hover:border-[#252840]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl">
        <div>
          <p className="text-xs font-semibold text-[#8888aa]">No Website Only</p>
          <p className="text-[10px] text-[#3a3d50] font-mono mt-0.5">Filter out businesses with sites</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!showAll}
          onClick={() => setShowAll(!showAll)}
          className={`relative w-10 h-5 rounded-full transition-colors ${!showAll ? 'bg-[#00d4ff]' : 'bg-[#1a1d2e]'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${!showAll ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !city.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all
          bg-[#00d4ff] text-[#08090e] hover:bg-[#00e1ff] active:scale-[0.98]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
          shadow-[0_0_24px_rgba(0,212,255,0.2)]"
      >
        {loading ? (
          <><IconLoader2 size={16} stroke={2} className="animate-spin" /> Scanning...</>
        ) : (
          <><IconSearch size={16} stroke={2} /> Find Leads</>
        )}
      </button>

      {/* Tips */}
      <div className="border-t border-[#1a1d2e] pt-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a3d50] font-mono">Pro Tip</p>
        <p className="text-[11px] text-[#4a4d60] leading-relaxed">
          Businesses with high ratings but no website are your warmest leads. Call them with a live mockup ready.
        </p>
      </div>
    </form>
  )
}