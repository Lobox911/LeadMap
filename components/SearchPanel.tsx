'use client'

import { useState, useEffect, useRef } from 'react'
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
  { label: '1km', value: 1000 },
  { label: '5km', value: 5000 },
  { label: '10km', value: 10000 },
  { label: '25km', value: 25000 },
  { label: '50km', value: 50000 },
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
  const [suggestions, setSuggestions] = useState<{ label: string; lat: string; lon: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const suggestBoxRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [category, setCategory] = useState('Restaurant')
  const [customCat, setCustomCat] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [radius, setRadius] = useState(10000)
  const [showAll, setShowAll] = useState(false)
  const [radiusDisplay, setRadiusDisplay] = useState(10)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (city.trim().length < 2) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: city }),
        })
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [city])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestBoxRef.current && !suggestBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return
    const cat = useCustom ? customCat.trim() : category
    if (!cat) return
    const location = city.includes(',') ? city.trim() : city.trim() + ', ' + country
    onSearch({ location, category: cat, radius, showAll })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e4e2e4' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1b1b1d', marginBottom: 3 }}>Lead Filters</h2>
        <p style={{ fontSize: 13, color: '#45464d' }}>Refine your search parameters</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

        {/* Geo chip */}
        {geoLabel && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#c9e6ff', border: '1px solid #89ceff', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {geoLabel}
            </span>
            <button type="button" onClick={onClearGeo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#006591', padding: '0 4px', fontSize: 14, lineHeight: 1 }}>✕</button>
          </div>
        )}

        {/* Country */}
        <div>
          <label className="section-label">Country</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="input-field"
            style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%2376777d\' d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
          >
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* City with autocomplete */}
        <div ref={suggestBoxRef} style={{ position: 'relative' }}>
          <label className="section-label">Target City</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📍</span>
            <input
              type="text"
              required
              value={city}
              onChange={e => { setCity(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. Austin, Lagos, London"
              className="input-field"
              style={{ paddingLeft: 34 }}
              autoComplete="off"
            />
            {loadingSuggestions && (
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#76777d' }}>...</span>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4,
              background: 'white', border: '1px solid #c6c6cd', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden',
              maxHeight: 220, overflowY: 'auto',
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCity(s.label)
                    setShowSuggestions(false)
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', background: 'none', border: 'none',
                    borderBottom: i < suggestions.length - 1 ? '1px solid #f0edef' : 'none',
                    color: '#1b1b1d', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f6f3f5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 13 }}>📍</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <div style={{ paddingTop: 16, borderTop: '1px solid #e4e2e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="section-label" style={{ marginBottom: 0 }}>Business Category</label>
            <button
              type="button"
              onClick={() => setUseCustom(!useCustom)}
              style={{ fontSize: 11, color: '#006591', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}
            >
              {useCustom ? 'Use presets' : 'Custom'}
            </button>
          </div>
          {useCustom ? (
            <input
              type="text" required value={customCat}
              onChange={e => setCustomCat(e.target.value)}
              placeholder="e.g. Wedding photographer"
              className="input-field"
            />
          ) : (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🏢</span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input-field"
                style={{ paddingLeft: 34, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%2376777d\' d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
              >
                {CATEGORY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Radius slider */}
        <div style={{ paddingTop: 16, borderTop: '1px solid #e4e2e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label className="section-label" style={{ marginBottom: 0 }}>Radius</label>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#006591', fontFamily: 'JetBrains Mono, monospace' }}>{radiusDisplay}km</span>
          </div>
          <input
            type="range" min={1} max={50} step={1}
            value={radiusDisplay}
            onChange={e => {
              const v = Number(e.target.value)
              setRadiusDisplay(v)
              setRadius(v * 1000)
            }}
            style={{ width: '100%', height: 4, borderRadius: 99, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#76777d', fontFamily: 'JetBrains Mono, monospace', marginTop: 4, padding: '0 2px' }}>
            <span>1km</span><span>50km</span>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f6f3f5', borderRadius: 12, border: '1px solid #e4e2e4' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1b1b1d' }}>No Website Only</p>
            <p style={{ fontSize: 12, color: '#45464d', marginTop: 1 }}>Filter businesses with sites</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!showAll}
            onClick={() => setShowAll(!showAll)}
            className="toggle"
            style={{ background: !showAll ? '#006591' : '#c6c6cd' }}
          >
            <span className="toggle-thumb" style={{ left: !showAll ? 23 : 3 }} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{ paddingTop: 20, borderTop: '1px solid #e4e2e4', marginTop: 'auto' }}>
        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 15 }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Scanning...
            </>
          ) : (
            <>🔍 Apply Filters</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}