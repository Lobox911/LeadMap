'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
  const [filterMissingContact, setFilterMissingContact] = useState(false)
  const [filterCompleteOnly, setFilterCompleteOnly] = useState(false)
  const [sortPref, setSortPref] = useState<'default' | 'contact-first'>('default')
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set())
  const [textFilter, setTextFilter] = useState('')
  const lastParams = useRef<any>(null)

  useEffect(() => { setSavedLeads(getSavedLeads()) }, [])

  const handleSearch = useCallback(async (params: {
    location: string; category: string; radius: number; showAll: boolean
  }) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    setSelectedId(null)
    setTextFilter('')
    setMobileSearchOpen(false)
    setBulkMode(false)
    setSelectedForBulk(new Set())
    lastParams.current = params

    try {
      const geoRes = await fetch('/api/geocode', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: params.location }),
      })
      if (!geoRes.ok) { const e = await geoRes.json(); throw new Error(e.error || 'Location not found') }
      const geo = await geoRes.json()
      const lat = parseFloat(geo.lat)
      const lon = parseFloat(geo.lon)
      setMapCenter([lat, lon])
      const shortLabel = geo.display_name.split(',').slice(0, 2).join(',').trim()
      setGeoLabel(shortLabel)
      setSearchLabel(params.category + ' · ' + shortLabel + ' · ' + (params.radius / 1000) + 'km')

      const searchRes = await fetch('/api/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, radius: params.radius, category: params.category, showAll: params.showAll, location: params.location }),
      })
      if (!searchRes.ok) { const e = await searchRes.json(); throw new Error(e.error || 'Search failed') }
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
    document.getElementById('card-' + b.id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const handleSelectFromMap = useCallback((id: string) => {
    setSelectedId(id)
    setMobileView('list')
    setTimeout(() => {
      document.getElementById('card-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }, [])

  const toggleBulkSelect = useCallback((id: string) => {
    setSelectedForBulk(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const savedIds = new Set(savedLeads.map(l => l.id))

  const filtered = businesses
    .filter(b => {
      if (filterNoWebsite && b.hasWebsite) return false
      if (filterMissingContact && (b.phone || b.email)) return false
      if (filterCompleteOnly) {
        const hasAddress = b.address && b.address !== 'Address not listed'
        const hasContact = b.phone || b.email
        if (!hasAddress || !hasContact) return false
      }
      if (textFilter.trim()) {
        const q = textFilter.toLowerCase()
        return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (sortPref !== 'contact-first') return 0
      const score = (x: Business) => {
        let s = 0
        if (x.address && x.address !== 'Address not listed') s += 1
        if (x.phone) s += 1
        if (x.email) s += 1
        return s
      }
      return score(b) - score(a)
    })

  const handleBulkSave = useCallback(() => {
    const toSave = filtered.filter(b => selectedForBulk.has(b.id))
    let updated = savedLeads
    toSave.forEach(b => {
      if (!updated.find(l => l.id === b.id)) {
        updated = saveLead(b)
      }
    })
    setSavedLeads(updated)
    setSelectedForBulk(new Set())
    setBulkMode(false)
  }, [filtered, selectedForBulk, savedLeads])

  const noWebsiteCount = businesses.filter(b => !b.hasWebsite).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#fcf8fa' }}>

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
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
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

          {/* Desktop Sidebar */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.aside
                className="desktop-sidebar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                style={{ height: '100%', borderRight: '1px solid #c6c6cd', overflow: 'hidden', flexShrink: 0, background: 'white' }}
              >
                <div style={{ width: 320, height: '100%', overflowY: 'auto', padding: 20 }}>
                  <SearchPanel onSearch={handleSearch} loading={loading} geoLabel={geoLabel} onClearGeo={() => { setGeoLabel(null); setMapCenter(null) }} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Sidebar toggle */}
          <button
            className="desktop-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 14, flexShrink: 0, height: '100%',
              background: '#f6f3f5', border: 'none', borderRight: '1px solid #c6c6cd',
              color: '#76777d', cursor: 'pointer', transition: 'all 0.15s', fontSize: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e4e2e4'; e.currentTarget.style.color = '#006591' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f6f3f5'; e.currentTarget.style.color = '#76777d' }}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>

          {/* Results panel */}
          <div
            className="results-panel"
            style={{
              display: mobileView === 'map' ? 'none' : 'flex',
              flexDirection: 'column',
              width: 400, flexShrink: 0,
              height: '100%', overflow: 'hidden',
              background: 'white',
              borderRight: '1px solid #c6c6cd',
              boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* Toolbar */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e4e2e4', background: '#fcf8fa', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: searched && businesses.length > 0 ? 10 : 0, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1b1b1d' }}>Search Results</h3>
                  {searched && !loading && (
                    <p style={{ fontSize: 12, color: '#45464d', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      {businesses.length > 0 ? `${filtered.length} leads shown · ${noWebsiteCount} no website` : 'No results found'}
                    </p>
                  )}
                </div>

                {businesses.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setFilterNoWebsite(!filterNoWebsite)}
                      style={{
                        padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                        border: filterNoWebsite ? '1px solid #ba1a1a' : '1px solid #c6c6cd',
                        background: filterNoWebsite ? '#ffdad6' : 'white',
                        color: filterNoWebsite ? '#ba1a1a' : '#45464d',
                        transition: 'all 0.15s',
                      }}
                    >
                      No Website Only
                    </button>
                    <button
                      onClick={() => setFilterMissingContact(!filterMissingContact)}
                      style={{
                        padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                        border: filterMissingContact ? '1px solid #006591' : '1px solid #c6c6cd',
                        background: filterMissingContact ? '#c9e6ff' : 'white',
                        color: filterMissingContact ? '#006591' : '#45464d',
                        transition: 'all 0.15s',
                      }}
                    >
                      Has Phone or Email
                    </button>
                    <button
                      onClick={() => setFilterCompleteOnly(!filterCompleteOnly)}
                      style={{
                        padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                        border: filterCompleteOnly ? '1px solid #009668' : '1px solid #c6c6cd',
                        background: filterCompleteOnly ? '#d4f5e6' : 'white',
                        color: filterCompleteOnly ? '#009668' : '#45464d',
                        transition: 'all 0.15s',
                      }}
                    >
                      Complete Info Only
                    </button>
                    <button
                      onClick={() => setSortPref(sortPref === 'contact-first' ? 'default' : 'contact-first')}
                      style={{
                        padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                        border: sortPref === 'contact-first' ? '1px solid #006591' : '1px solid #c6c6cd',
                        background: sortPref === 'contact-first' ? '#c9e6ff' : 'white',
                        color: sortPref === 'contact-first' ? '#006591' : '#45464d',
                        transition: 'all 0.15s',
                      }}
                    >
                      ↑ Sort by Completeness
                    </button>
                    <button
                      onClick={() => { setBulkMode(!bulkMode); setSelectedForBulk(new Set()) }}
                      style={{
                        padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                        border: bulkMode ? '1px solid #006591' : '1px solid #c6c6cd',
                        background: bulkMode ? '#006591' : 'white',
                        color: bulkMode ? 'white' : '#45464d',
                        transition: 'all 0.15s',
                      }}
                    >
                      {bulkMode ? '✕ Cancel Select' : '☑ Select Multiple'}
                    </button>
                  </div>
                )}
              </div>

              {bulkMode && selectedForBulk.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '8px 12px', background: '#c9e6ff', borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: '#006591', fontWeight: 600 }}>{selectedForBulk.size} selected</span>
                  <button onClick={handleBulkSave} className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
                    Save Selected
                  </button>
                </div>
              )}

              {businesses.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#76777d' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search leads by name, address..."
                    value={textFilter}
                    onChange={e => setTextFilter(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: 32, fontSize: 13 }}
                  />
                </div>
              )}
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80, background: '#f6f3f5' }}>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ margin: 8, padding: 20, background: '#ffdad6', border: '1px solid #ba1a1a', borderRadius: 12, textAlign: 'center' }}
                >
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#ba1a1a', marginBottom: 4 }}>Search Failed</p>
                  <p style={{ fontSize: 12, color: '#93000a', marginBottom: 12 }}>{error}</p>
                  <button
                    onClick={() => lastParams.current && handleSearch(lastParams.current)}
                    className="btn-ghost"
                    style={{ fontSize: 12 }}
                  >
                    Retry
                  </button>
                </motion.div>
              )}

              {loading && Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                  <SkeletonCard />
                </motion.div>
              ))}

              {!loading && !error && !searched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '60px 24px', textAlign: 'center', gap: 16 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0edef', border: '2px solid #c6c6cd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}
                  >
                    🎯
                  </motion.div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1b1b1d', marginBottom: 6 }}>Ready to find leads</p>
                    <p style={{ fontSize: 13, color: '#45464d', lineHeight: 1.6, maxWidth: 220 }}>Set your target city and business type, then apply filters to scan for businesses without websites.</p>
                  </div>
                </motion.div>
              )}

              {!loading && !error && searched && businesses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center', gap: 12 }}
                >
                  <span style={{ fontSize: 40 }}>🔍</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1b1b1d' }}>No businesses found</p>
                  <p style={{ fontSize: 13, color: '#45464d' }}>Try a wider radius or different category</p>
                </motion.div>
              )}

              {!loading && !error && searched && filtered.length === 0 && businesses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center', gap: 12 }}
                >
                  <span style={{ fontSize: 40 }}>🔎</span>
                  <p style={{ fontSize: 13, color: '#45464d' }}>No results match your filters</p>
                  <button onClick={() => { setFilterNoWebsite(false); setFilterMissingContact(false); setFilterCompleteOnly(false); setTextFilter('') }} className="btn-ghost" style={{ fontSize: 12 }}>Clear filters</button>
                </motion.div>
              )}

              {!loading && !error && filtered.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.04, 0.5) }}
                  style={{ animationDelay: i * 0.05 + 's' }}
                >
                  <BusinessCard
                    business={b}
                    isSaved={savedIds.has(b.id)}
                    isSelected={selectedId === b.id}
                    onToggleSave={handleToggleSave}
                    onSelect={handleSelectBusiness}
                    bulkMode={bulkMode}
                    isBulkSelected={selectedForBulk.has(b.id)}
                    onToggleBulkSelect={toggleBulkSelect}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div
            style={{ flex: 1, height: '100%', position: 'relative', background: '#f0edef' }}
            className={mobileView === 'list' ? 'hidden lg:block' : ''}
          >
            <MapView
              businesses={filtered}
              center={mapCenter}
              selectedId={selectedId}
              onSelectBusiness={handleSelectFromMap}
              onSave={handleToggleSave}
              savedIds={savedIds}
            />

            {!searched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(252,248,250,0.85)', backdropFilter: 'blur(4px)',
                  pointerEvents: 'none', zIndex: 10,
                }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#45464d', marginBottom: 4 }}>Map loads after search</p>
                  <p style={{ fontSize: 12, color: '#76777d', fontFamily: 'JetBrains Mono, monospace' }}>Apply filters to see business pins</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <div className="mobile-tab-bar">
        {[
          { icon: '🔍', label: 'Search', action: () => setMobileSearchOpen(true), active: mobileSearchOpen },
          { icon: '📋', label: 'List', action: () => { setActiveTab('search'); setMobileView('list') }, active: activeTab === 'search' && mobileView === 'list' && !mobileSearchOpen },
          { icon: '🗺️', label: 'Map', action: () => { setActiveTab('search'); setMobileView('map') }, active: activeTab === 'search' && mobileView === 'map' },
          { icon: '🔖', label: 'Saved', action: () => setActiveTab('leads'), active: activeTab === 'leads', badge: savedLeads.length },
        ].map(tab => (
          <button
            key={tab.label}
            onClick={tab.action}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 16px',
              position: 'relative', minWidth: 60,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: tab.active ? '#006591' : '#76777d', transition: 'color 0.15s' }}>
              {tab.label}
            </span>
            {tab.badge ? (
              <span style={{ position: 'absolute', top: 4, right: 8, background: '#006591', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Mobile search bottom sheet */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              className="bottom-sheet-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSearchOpen(false)}
            />
            <motion.div
              className="bottom-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
                <div style={{ width: 40, height: 4, borderRadius: 99, background: '#c6c6cd' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 4px' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1b1b1d' }}>Lead Filters</p>
                <button onClick={() => setMobileSearchOpen(false)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 13 }}>✕ Close</button>
              </div>
              <div style={{ padding: '12px 20px 8px' }}>
                <SearchPanel onSearch={handleSearch} loading={loading} geoLabel={geoLabel} onClearGeo={() => { setGeoLabel(null); setMapCenter(null) }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}