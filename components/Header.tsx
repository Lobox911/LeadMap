'use client'

import { IconRadar, IconBookmark, IconDownload, IconChevronDown, IconDatabase, IconSearch } from '@tabler/icons-react'
import { useState, useRef, useEffect } from 'react'
import { Business } from '@/types'
import { exportToCsv, exportToJson } from '@/lib/exportUtils'

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
  const resultsExportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
      if (resultsExportRef.current && !resultsExportRef.current.contains(e.target as Node)) setShowResultsExport(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const label = searchLabel || 'search-results'

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
    width: 200, background: '#0c0e1a', border: '1px solid #1e2235',
    borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden', zIndex: 100,
  }

  const dropdownBtnStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
    color: '#8b8fa8', fontSize: 11, cursor: 'pointer', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-geist-mono), monospace', transition: 'background 0.1s',
  }

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
    background: '#0c0e1a', border: '1px solid #1e2235', borderRadius: 8,
    color: '#8b8fa8', fontSize: 11, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s',
  }

  return (
    <header style={{
      height: 52, borderBottom: '1px solid #1e2235',
      background: 'rgba(7,8,16,0.97)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', gap: 12,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconRadar size={14} stroke={1.5} style={{ color: '#00d4ff' }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#e2e4f0', letterSpacing: '-0.02em' }}>WebsiteGap</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#454860', border: '1px solid #1e2235', padding: '2px 6px', borderRadius: 5, fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.08em' }}>FREE</span>
      </div>

      {/* Center stats */}
      {resultsCount > 0 && activeTab === 'search' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 14px', background: '#0c0e1a', border: '1px solid #1e2235', borderRadius: 99, fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace', overflow: 'hidden', maxWidth: 400 }}>
          <span style={{ color: '#454860', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#e2e4f0', fontWeight: 700 }}>{resultsCount}</span> found
          </span>
          <span style={{ width: 1, height: 12, background: '#1e2235', flexShrink: 0 }} />
          <span style={{ color: '#454860', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#00d4ff', fontWeight: 700 }}>{noWebsiteCount}</span> no website
          </span>
          {searchLabel && (
            <>
              <span style={{ width: 1, height: 12, background: '#1e2235', flexShrink: 0 }} />
              <span style={{ color: '#454860', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{searchLabel}</span>
            </>
          )}
        </div>
      )}

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Export current results */}
        {currentResults.length > 0 && activeTab === 'search' && (
          <div style={{ position: 'relative' }} ref={resultsExportRef}>
            <button onClick={() => setShowResultsExport(!showResultsExport)} style={btnStyle}>
              <IconSearch size={11} stroke={1.5} />
              Results
              <IconChevronDown size={10} stroke={2} style={{ transform: showResultsExport ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {showResultsExport && (
              <div style={dropdownStyle}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2235' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#454860', fontFamily: 'var(--font-geist-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Export Search Results</p>
                  <p style={{ fontSize: 10, color: '#272a3d', fontFamily: 'var(--font-geist-mono), monospace', marginTop: 2 }}>{currentResults.length} businesses</p>
                </div>
                <button onClick={() => { exportToCsv(currentResults, label + '.csv'); setShowResultsExport(false) }} style={dropdownBtnStyle}>
                  <IconDownload size={11} stroke={1.5} /> Export as CSV
                </button>
                <div style={{ height: 1, background: '#1e2235' }} />
                <button onClick={() => { exportToJson(currentResults, label + '.json'); setShowResultsExport(false) }} style={dropdownBtnStyle}>
                  <IconDownload size={11} stroke={1.5} /> Export as JSON
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search / Saved tabs */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#0c0e1a', border: '1px solid #1e2235', borderRadius: 9, padding: 3, gap: 2 }}>
          {(['search', 'leads'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 7,
                border: activeTab === tab ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                background: activeTab === tab ? 'rgba(0,212,255,0.08)' : 'transparent',
                color: activeTab === tab ? '#00d4ff' : '#454860',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab === 'search' ? <IconSearch size={11} stroke={1.5} /> : <IconBookmark size={11} stroke={1.5} />}
              {tab === 'search' ? 'Search' : 'Saved'}
              {tab === 'leads' && savedCount > 0 && (
                <span
                  suppressHydrationWarning
                  style={{ background: '#00d4ff', color: '#070810', fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 99, minWidth: 14, textAlign: 'center' }}
                >
                  {savedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Export saved leads */}
        {savedLeads.length > 0 && (
          <div style={{ position: 'relative' }} ref={exportRef}>
            <button onClick={() => setShowExport(!showExport)} style={btnStyle}>
              <IconDatabase size={11} stroke={1.5} />
              Leads
              <IconChevronDown size={10} stroke={2} style={{ transform: showExport ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {showExport && (
              <div style={dropdownStyle}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e2235' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#454860', fontFamily: 'var(--font-geist-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Export Saved Leads</p>
                  <p style={{ fontSize: 10, color: '#272a3d', fontFamily: 'var(--font-geist-mono), monospace', marginTop: 2 }}>{savedLeads.length} saved leads</p>
                </div>
                <button onClick={() => { exportToCsv(savedLeads, 'websitegap-saved-leads.csv'); setShowExport(false) }} style={dropdownBtnStyle}>
                  <IconDownload size={11} stroke={1.5} /> Export as CSV
                </button>
                <div style={{ height: 1, background: '#1e2235' }} />
                <button onClick={() => { exportToJson(savedLeads, 'websitegap-saved-leads.json'); setShowExport(false) }} style={dropdownBtnStyle}>
                  <IconDownload size={11} stroke={1.5} /> Export as JSON
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}