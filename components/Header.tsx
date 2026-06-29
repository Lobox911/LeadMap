'use client'

import { useState, useRef, useEffect } from 'react'
import { Business } from '@/types'
import { exportToCsv, exportToJson } from '@/lib/exportUtils'
import { UserButton } from '@clerk/nextjs'


interface Props {
  activeTab: 'search' | 'leads'
  onTabChange: (tab: 'search' | 'leads') => void
  savedCount: number
  resultsCount: number
  noWebsiteCount: number
  savedLeads: Business[]
  currentResults: Business[]
  searchLabel: string | null
}

export default function Header({ activeTab, onTabChange, savedCount, resultsCount, noWebsiteCount, savedLeads, currentResults, searchLabel }: Props) {
  const [showExport, setShowExport] = useState(false)
  const [showResultsExport, setShowResultsExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) setShowResultsExport(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const label = searchLabel || 'websitegap-results'

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
    width: 200, background: 'white', border: '1px solid #c6c6cd',
    borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100,
  }

  const dropdownBtnStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
    color: '#45464d', fontSize: 13, cursor: 'pointer', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: 'JetBrains Mono, monospace', transition: 'background 0.1s',
  }

  return (
    <header style={{
      height: 56, borderBottom: '1px solid #c6c6cd',
      background: 'white', position: 'sticky', top: 0, zIndex: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', gap: 10,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }} className="md:px-6" >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexShrink: 0, minWidth: 0 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#000000', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }} className="md:text-xl">WebsiteGap</h1>
        <nav style={{ display: 'none', gap: 4 }} className="hidden md:flex">
          {(['search', 'leads'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                padding: '6px 14px', borderRadius: 0,
                border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: activeTab === tab ? '#006591' : '#45464d',
                fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.15s',
                borderBottom: activeTab === tab ? '2px solid #006591' : '2px solid transparent',
                display: 'flex', alignItems: 'center',
              }}
            >
              {tab === 'search' ? 'Dashboard' : 'Saved Leads'}
              {tab === 'leads' && savedCount > 0 && (
                <span suppressHydrationWarning style={{ marginLeft: 6, background: '#006591', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>
                  {savedCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile tab switcher (compact pill, replaces hidden nav on small screens) */}
      <div className="flex md:hidden" style={{ alignItems: 'center', background: '#f6f3f5', borderRadius: 8, padding: 2, gap: 2, flexShrink: 0 }}>
        {(['search', 'leads'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? '#006591' : '#45464d',
              fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              position: 'relative', whiteSpace: 'nowrap',
            }}
          >
            {tab === 'search' ? 'Search' : 'Saved'}
            {tab === 'leads' && savedCount > 0 && (
              <span suppressHydrationWarning style={{ marginLeft: 4, background: '#006591', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>
                {savedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Center stats — desktop only */}
      {resultsCount > 0 && activeTab === 'search' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 14px', background: '#f6f3f5', border: '1px solid #e4e2e4', borderRadius: 99, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }} className="hidden lg:flex">
          <span style={{ color: '#45464d' }}><span style={{ color: '#1b1b1d', fontWeight: 700 }}>{resultsCount}</span> found</span>
          <span style={{ width: 1, height: 12, background: '#c6c6cd' }} />
          <span style={{ color: '#45464d' }}><span style={{ color: '#ba1a1a', fontWeight: 700 }}>{noWebsiteCount}</span> no website</span>
          {searchLabel && (
            <>
              <span style={{ width: 1, height: 12, background: '#c6c6cd' }} />
              <span style={{ color: '#76777d', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{searchLabel}</span>
            </>
          )}
        </div>
      )}

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

        {/* Export current results — icon only on mobile */}
        {currentResults.length > 0 && activeTab === 'search' && (
          <div style={{ position: 'relative' }} ref={resultsRef}>
            <button
              onClick={() => setShowResultsExport(!showResultsExport)}
              className="btn-ghost"
              style={{ padding: '7px 10px' }}
            >
              <span aria-hidden>↓</span>
              <span className="hidden sm:inline" style={{ marginLeft: 4 }}>Results</span>
            </button>
            {showResultsExport && (
              <div style={{ ...dropdownStyle, right: 0 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e4e2e4' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#76777d', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Export Search Results</p>
                  <p style={{ fontSize: 11, color: '#c6c6cd', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{currentResults.length} businesses</p>
                </div>
                <button onClick={() => { exportToCsv(currentResults, label + '.csv'); setShowResultsExport(false) }} style={dropdownBtnStyle} onMouseEnter={e => (e.target as HTMLElement).style.background = '#f6f3f5'} onMouseLeave={e => (e.target as HTMLElement).style.background = 'none'}>
                  Export CSV
                </button>
                <div style={{ height: 1, background: '#e4e2e4' }} />
                <button onClick={() => { exportToJson(currentResults, label + '.json'); setShowResultsExport(false) }} style={dropdownBtnStyle} onMouseEnter={e => (e.target as HTMLElement).style.background = '#f6f3f5'} onMouseLeave={e => (e.target as HTMLElement).style.background = 'none'}>
                  Export JSON
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export saved leads — icon only on mobile */}
        {savedLeads.length > 0 && (
          <div style={{ position: 'relative' }} ref={exportRef}>
            <button
              onClick={() => setShowExport(!showExport)}
              className="btn-ghost"
              style={{ padding: '7px 10px' }}
            >
              <span aria-hidden>↓</span>
              <span className="hidden sm:inline" style={{ marginLeft: 4 }}>Leads</span>
            </button>
            {showExport && (
              <div style={{ ...dropdownStyle, right: 0 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e4e2e4' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#76777d', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Export Saved Leads</p>
                  <p style={{ fontSize: 11, color: '#c6c6cd', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{savedLeads.length} leads</p>
                </div>
                <button onClick={() => { exportToCsv(savedLeads, 'websitegap-saved-leads.csv'); setShowExport(false) }} style={dropdownBtnStyle} onMouseEnter={e => (e.target as HTMLElement).style.background = '#f6f3f5'} onMouseLeave={e => (e.target as HTMLElement).style.background = 'none'}>
                  Export CSV
                </button>
                <div style={{ height: 1, background: '#e4e2e4' }} />
                <button onClick={() => { exportToJson(savedLeads, 'websitegap-saved-leads.json'); setShowExport(false) }} style={dropdownBtnStyle} onMouseEnter={e => (e.target as HTMLElement).style.background = '#f6f3f5'} onMouseLeave={e => (e.target as HTMLElement).style.background = 'none'}>
                  Export JSON
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upgrade button — compact on mobile */}
        <a href="/#pricing" className="btn-primary" style={{ borderRadius: 99, padding: '7px 14px', fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
  Upgrade
</a>
<UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}