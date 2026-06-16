'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand,
  IconMap, IconList, IconAlertCircle, IconRefresh,
  IconRadar2, IconMoodEmpty, IconSearch, IconX, IconBookmark,
} from '@tabler/icons-react'
import { Business, SavedLead } from '@/types'
import { saveLead, removeLead, getSavedLeads, clearAllLeads } from '@/lib/storage'
import Header from '@/components/Header'
import SearchPanel from '@/components/SearchPanel'
import BusinessCard from '@/components/BusinessCard'
import SkeletonCard from '@/components/SkeletonCard'
import MapView from '@/components/MapView'
import SavedLeads from '@/components/SavedLeads'

type Tab = 'search' | 'leads'
type MobileView = 'list' | 'map'

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([])

 const [savedLeads, setSavedLeads] = useState<SavedLead[]>([])

useEffect(() => {
  setSavedLeads(getSavedLeads())
}, [])

  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('search')
  const [mobileView, setMobileView] = useState<MobileView>('list')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [geoLabel, setGeoLabel] = useState<string | null>(null)
  const [searchLabel, setSearchLabel] = useState<string | null>(null)
  const [filterNoWebsite, setFilterNoWebsite] = useState(true)
  const [textFilter, setTextFilter] = useState('')
  const lastParams = useRef<any>(null)

  const handleSearch = useCallback(async (params: {
    location: string; category: string; radius: number; showAll: boolean
  }) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    setSelectedId(null)
    setTextFilter('')
    setMobileSearchOpen(false)
    lastParams.current = params

    try {
      const geoRes = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: params.location }),
      })
      if (!geoRes.ok) {
        const e = await geoRes.json()
        throw new Error(e.error || 'Location not found')
      }
      const geo = await geoRes.json()
      const lat = parseFloat(geo.lat)
      const lon = parseFloat(geo.lon)
      setMapCenter([lat, lon])
      const shortLabel = geo.display_name.split(',').slice(0, 2).join(',').trim()
      setGeoLabel(shortLabel)
      setSearchLabel(params.category + ' · ' + shortLabel + ' · ' + (params.radius / 1000) + 'km')

      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat, lon,
          radius: params.radius,
          category: params.category,
          showAll: params.showAll,
          location: params.location,
        }),
      })
      if (!searchRes.ok) {
        const e = await searchRes.json()
        throw new Error(e.error || 'Search failed')
      }
      const data = await searchRes.json()
      setBusinesses(data.results)
      setFilterNoWebsite(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleToggleSave = useCallback((b: Business) => {
    const isAlreadySaved = savedLeads.find(l => l.id === b.id)
    setSavedLeads(isAlreadySaved ? removeLead(b.id) : saveLead(b))
  }, [savedLeads])

  const handleSelectBusiness = useCallback((b: Business) => {
    setSelectedId(b.id)
    if (b.lat && b.lon) setMapCenter([b.lat, b.lon])
    const el = document.getElementById('card-' + b.id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handleSelectFromMap = useCallback((id: string) => {
    setSelectedId(id)
    setMobileView('list')
    setTimeout(() => {
      const el = document.getElementById('card-' + id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }, [])

  const savedIds = new Set(savedLeads.map(l => l.id))

  const filtered = businesses.filter(b => {
    if (filterNoWebsite && b.hasWebsite) return false
    if (textFilter.trim()) {
      const q = textFilter.toLowerCase()
      return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
    }
    return true
  })

  const noWebsiteCount = businesses.filter(b => !b.hasWebsite).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#070810' }}>

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedLeads.length}
        resultsCount={businesses.length}
        noWebsiteCount={noWebsiteCount}
        savedLeads={savedLeads}
        currentResults={filtered}
        searchLabel={searchLabel}
      />

      {activeTab === 'leads' ? (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
            <SavedLeads
              savedLeads={savedLeads}
              onRemoveLead={(id) => setSavedLeads(removeLead(id))}
              onClearAll={() => { clearAllLeads(); setSavedLeads([]) }}
              onNavigateToSearch={() => setActiveTab('search')}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* ── Desktop Sidebar ── */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.aside
                className="desktop-sidebar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 272, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  height: '100%',
                  borderRight: '1px solid #1e2235',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#070810',
                }}
              >
                <div
                  className="dot-grid"
                  style={{ width: 272, height: '100%', overflowY: 'auto', padding: 16 }}
                >
                  <SearchPanel
                    onSearch={handleSearch}
                    loading={loading}
                    geoLabel={geoLabel}
                    onClearGeo={() => { setGeoLabel(null); setMapCenter(null) }}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ── Sidebar Toggle ── */}
          <button
            className="desktop-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          
          
           style={{
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 14, flexShrink: 0, height: '100%',
  background: '#070810',
  border: 'none',
  borderRight: '1px solid #1e2235',
  color: '#272a3d',
  cursor: 'pointer',
  transition: 'color 0.15s, background 0.15s',
}}



            onMouseEnter={e => {
              const t = e.currentTarget
              t.style.color = '#00d4ff'
              t.style.background = 'rgba(0,212,255,0.04)'
            }}
            onMouseLeave={e => {
              const t = e.currentTarget
              t.style.color = '#272a3d'
              t.style.background = '#070810'
            }}
          >
            {sidebarOpen
              ? <IconLayoutSidebarLeftCollapse size={11} stroke={1.5} />
              : <IconLayoutSidebarLeftExpand size={11} stroke={1.5} />}
          </button>

          {/* ── Results Panel ── */}
          <div
            className="results-panel"
            style={{
              display: mobileView === 'map' ? 'none' : 'flex',
              flexDirection: 'column',
              width: 320,
              flexShrink: 0,
              height: '100%',
              overflow: 'hidden',
              background: '#070810',
              borderRight: '1px solid #1e2235',
              boxShadow: '2px 0 16px rgba(0,0,0,0.3)',
            }}
          >
            {/* Toolbar */}
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid #1e2235',
              background: '#070810',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {searched && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 10,
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  <span style={{ color: '#454860' }}>
                    <span style={{ color: '#e2e4f0', fontWeight: 700 }}>{filtered.length}</span> shown
                  </span>
                  <span style={{ width: 1, height: 10, background: '#1e2235', flexShrink: 0 }} />
                  <span style={{ color: '#454860' }}>
                    <span style={{ color: '#00d4ff', fontWeight: 700 }}>{noWebsiteCount}</span> no website
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    {/* Mobile view toggle */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center',
                        background: '#0c0e1a', border: '1px solid #1e2235',
                        borderRadius: 7, padding: 2, gap: 2,
                      }}
                      className="lg:hidden"
                    >
                      {(['list', 'map'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setMobileView(v)}
                          style={{
                            padding: '4px 8px', borderRadius: 5,
                            border: 'none', cursor: 'pointer',
                            background: mobileView === v ? 'rgba(0,212,255,0.1)' : 'transparent',
                            color: mobileView === v ? '#00d4ff' : '#454860',
                            display: 'flex', alignItems: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {v === 'list' ? <IconList size={11} stroke={2} /> : <IconMap size={11} stroke={2} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {businesses.length > 0 && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <IconSearch size={11} stroke={1.5} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#454860', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Filter results..."
                      value={textFilter}
                      onChange={e => setTextFilter(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: 28, paddingRight: 10,
                        paddingTop: 6, paddingBottom: 6,
                        background: '#0c0e1a', border: '1px solid #1e2235',
                        borderRadius: 7, fontSize: 11, color: '#e2e4f0',
                        outline: 'none', fontFamily: 'var(--font-geist-mono), monospace',
                        transition: 'border-color 0.15s', boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                      onBlur={e => e.target.style.borderColor = '#1e2235'}
                    />
                  </div>
                  <button
                    onClick={() => setFilterNoWebsite(!filterNoWebsite)}
                    style={{
                      padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                      fontSize: 9, fontWeight: 700,
                      fontFamily: 'var(--font-geist-mono), monospace',
                      border: filterNoWebsite ? '1px solid rgba(255,77,106,0.25)' : '1px solid #1e2235',
                      background: filterNoWebsite ? 'rgba(255,77,106,0.08)' : '#0c0e1a',
                      color: filterNoWebsite ? '#ff4d6a' : '#454860',
                      transition: 'all 0.15s', whiteSpace: 'nowrap',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >
                    No site
                  </button>
                </div>
              )}
            </div>

            {/* List content */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: 10, display: 'flex',
              flexDirection: 'column', gap: 6,
              paddingBottom: 72,
            }}>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    margin: 8, padding: 18,
                    background: 'rgba(255,77,106,0.05)',
                    border: '1px solid rgba(255,77,106,0.15)',
                    borderRadius: 12, textAlign: 'center',
                  }}
                >
                  <IconAlertCircle size={20} stroke={1.5} style={{ color: '#ff4d6a', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#ff4d6a', marginBottom: 4 }}>Search Failed</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,77,106,0.55)', marginBottom: 12, lineHeight: 1.5 }}>{error}</p>
                  <button
                    onClick={() => lastParams.current && handleSearch(lastParams.current)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', background: '#0c0e1a',
                      border: '1px solid #1e2235', borderRadius: 7,
                      fontSize: 11, color: '#8b8fa8', cursor: 'pointer',
                    }}
                  >
                    <IconRefresh size={11} stroke={2} /> Retry
                  </button>
                </motion.div>
              )}

              {/* Skeletons */}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))}

              {/* Empty — not searched */}
              {!loading && !error && !searched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    height: '100%', padding: '60px 24px', textAlign: 'center', gap: 16,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: '#0c0e1a', border: '1px solid #1e2235',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <IconRadar2 size={22} stroke={1} style={{ color: '#272a3d' }} />
                  </motion.div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#3a3d52', marginBottom: 5 }}>Ready to scan</p>
                    <p style={{ fontSize: 10, color: '#272a3d', fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1.7, maxWidth: 180 }}>
                      Enter a location and business type to find leads
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Empty — no OSM results */}
              {!loading && !error && searched && businesses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center', gap: 10 }}
                >
                  <IconMoodEmpty size={24} stroke={1} style={{ color: '#272a3d' }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#3a3d52' }}>No businesses found</p>
                  <p style={{ fontSize: 10, color: '#272a3d', fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1.6 }}>
                    Try a wider radius or different category
                  </p>
                </motion.div>
              )}

              {/* Empty — filtered */}
              {!loading && !error && searched && filtered.length === 0 && businesses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center', gap: 10 }}
                >
                  <IconMoodEmpty size={24} stroke={1} style={{ color: '#272a3d' }} />
                  <p style={{ fontSize: 10, color: '#272a3d', fontFamily: 'var(--font-geist-mono), monospace' }}>No results match filters</p>
                  <button
                    onClick={() => { setFilterNoWebsite(false); setTextFilter('') }}
                    style={{ fontSize: 10, color: '#00d4ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-geist-mono), monospace', textDecoration: 'underline' }}
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}

              {/* Results */}
              {!loading && !error && filtered.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.04, 0.5), ease: 'easeOut' }}
                >
                  <BusinessCard
                    business={b}
                    isSaved={savedIds.has(b.id)}
                    isSelected={selectedId === b.id}
                    onToggleSave={handleToggleSave}
                    onSelect={handleSelectBusiness}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Map Panel ── */}
          <div
            style={{
              flex: 1, height: '100%', position: 'relative',
              display: mobileView === 'list' ? undefined : 'block',
              background: '#070810',
            }}
            className={mobileView === 'list' ? 'hidden lg:block' : ''}
          >
            {/* Map overlay border */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 0 1px rgba(30,34,53,0.8)',
            }} />

            <MapView
              businesses={filtered}
              center={mapCenter}
              selectedId={selectedId}
              onSelectBusiness={handleSelectFromMap}
              onSave={handleToggleSave}
              savedIds={savedIds}
            />

            {/* Map empty overlay */}
            {!searched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(7,8,16,0.82)',
                  backdropFilter: 'blur(6px)',
                  pointerEvents: 'none', zIndex: 10,
                }}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(12,14,26,0.9)',
                    border: '1px solid #1e2235',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}>
                    <IconMap size={22} stroke={1} style={{ color: '#272a3d' }} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#2e3045', marginBottom: 5 }}>
                    Map loads after search
                  </p>
                  <p style={{ fontSize: 10, color: '#1e2030', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    Run a search to see pins
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="mobile-tab-bar">
        <button
          onClick={() => setMobileSearchOpen(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 20px',
            minWidth: 64,
          }}
        >
          <IconSearch size={22} stroke={1.5} style={{ color: mobileSearchOpen ? '#00d4ff' : '#454860', transition: 'color 0.15s' }} />
          <span style={{ fontSize: 9, color: mobileSearchOpen ? '#00d4ff' : '#454860', fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.15s' }}>Search</span>
        </button>

        {searched && (
          <>
            <button
              onClick={() => { setActiveTab('search'); setMobileView('list') }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px 20px',
                position: 'relative', minWidth: 64,
              }}
            >
              <IconList size={22} stroke={1.5} style={{ color: activeTab === 'search' && mobileView === 'list' ? '#00d4ff' : '#454860', transition: 'color 0.15s' }} />
              <span style={{ fontSize: 9, color: activeTab === 'search' && mobileView === 'list' ? '#00d4ff' : '#454860', fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.15s' }}>List</span>
              {filtered.length > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 12, background: '#00d4ff', color: '#070810', fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 99 }}>{filtered.length > 99 ? '99+' : filtered.length}</span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('search'); setMobileView('map') }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px 20px',
                minWidth: 64,
              }}
            >
              <IconMap size={22} stroke={1.5} style={{ color: activeTab === 'search' && mobileView === 'map' ? '#00d4ff' : '#454860', transition: 'color 0.15s' }} />
              <span style={{ fontSize: 9, color: activeTab === 'search' && mobileView === 'map' ? '#00d4ff' : '#454860', fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.15s' }}>Map</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab(activeTab === 'leads' ? 'search' : 'leads')}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 20px',
            position: 'relative', minWidth: 64,
          }}
        >
          <IconBookmark size={22} stroke={1.5} style={{ color: activeTab === 'leads' ? '#00d4ff' : '#454860', transition: 'color 0.15s' }} />
          <span style={{ fontSize: 9, color: activeTab === 'leads' ? '#00d4ff' : '#454860', fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'color 0.15s' }}>Saved</span>
          {savedLeads.length > 0 && (
            <span style={{ position: 'absolute', top: 4, right: 12, background: '#00d4ff', color: '#070810', fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: 99 }}>{savedLeads.length}</span>
          )}
        </button>
      </div>

      {/* ── Mobile Search Bottom Sheet ── */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              className="bottom-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSearchOpen(false)}
            />
            <motion.div
              className="bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
                <div style={{ width: 40, height: 4, borderRadius: 99, background: '#1e2235' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 4px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e4f0', letterSpacing: '-0.01em' }}>Find Leads</p>
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  style={{
                    background: '#0c0e1a', border: '1px solid #1e2235',
                    borderRadius: 8, padding: 7, cursor: 'pointer',
                    color: '#454860', display: 'flex', transition: 'all 0.15s',
                  }}
                >
                  <IconX size={13} stroke={2} />
                </button>
              </div>
              <div style={{ padding: '12px 18px 8px' }}>
                <SearchPanel
                  onSearch={handleSearch}
                  loading={loading}
                  geoLabel={geoLabel}
                  onClearGeo={() => { setGeoLabel(null); setMapCenter(null) }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}