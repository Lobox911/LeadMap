'use client'

import { useState, useMemo } from 'react'
import { SavedLead } from '@/types'
import { exportToCsv, exportToJson } from '@/lib/exportUtils'

type OutreachStatus = 'not-contacted' | 'contacted' | 'follow-up'

interface Props {
  savedLeads: SavedLead[]
  onRemoveLead: (id: string) => void
  onClearAll: () => void
  onNavigateToSearch: () => void
}

export default function SavedLeads({ savedLeads, onRemoveLead, onClearAll, onNavigateToSearch }: Props) {
  const [query, setQuery] = useState('')
  const [outreachStatus, setOutreachStatus] = useState<Record<string, OutreachStatus>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!query.trim()) return savedLeads
    const q = query.toLowerCase()
    return savedLeads.filter(b => b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
  }, [savedLeads, query])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(b => b.id)))
  }

  const cycleOutreach = (id: string) => {
    const current = outreachStatus[id] || 'not-contacted'
    const next: Record<OutreachStatus, OutreachStatus> = { 'not-contacted': 'contacted', 'contacted': 'follow-up', 'follow-up': 'not-contacted' }
    setOutreachStatus(prev => ({ ...prev, [id]: next[current] }))
  }

  const getOutreachBadge = (id: string) => {
    const status = outreachStatus[id] || 'not-contacted'
    if (status === 'contacted') return <span className="badge-contacted"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#009668' }} />Contacted</span>
    if (status === 'follow-up') return <span className="badge-followup"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#006591' }} />Follow-up</span>
    return <span className="badge-not-contacted"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#76777d' }} />Not Contacted</span>
  }

  if (savedLeads.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', gap: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0edef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🔖</div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1b1b1d', marginBottom: 8 }}>No saved leads yet</h3>
          <p style={{ fontSize: 14, color: '#45464d', maxWidth: 360, lineHeight: 1.6 }}>Head back to the Dashboard to find businesses without websites and start growing your client list.</p>
        </div>
        <button onClick={onNavigateToSearch} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12, fontSize: 15 }}>🗺️ Go to Explorer</button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1b1b1d', marginBottom: 4 }}>Saved Leads</h1>
          <p style={{ fontSize: 14, color: '#45464d' }}>Manage and export businesses with potential website opportunities.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => exportToCsv(savedLeads, 'websitegap-saved-leads.csv')} className="btn-ghost">↓ CSV</button>
          <button onClick={() => exportToJson(savedLeads, 'websitegap-saved-leads.json')} className="btn-ghost">↓ JSON</button>
          <button onClick={() => { if (window.confirm('Clear all saved leads?')) onClearAll() }} className="btn-ghost" style={{ color: '#ba1a1a', borderColor: '#ffdad6' }}>Clear All</button>
        </div>
      </div>

      <input type="text" placeholder="Search saved leads by name, location or category..." value={query} onChange={e => setQuery(e.target.value)} className="input-field" style={{ maxWidth: 480 }} />

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block" style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #c6c6cd', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 16, height: 16, accentColor: '#006591', cursor: 'pointer' }} /></th>
                <th>Business Name</th>
                <th>Location</th>
                <th>Industry</th>
                <th style={{ textAlign: 'center' }}>Website Status</th>
                <th>Date Saved</th>
                <th>Outreach</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#76777d', fontSize: 14 }}>No leads match your search</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} style={{ background: selected.has(b.id) ? '#f0f7ff' : undefined }}>
                  <td><input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleSelect(b.id)} style={{ width: 16, height: 16, accentColor: '#006591', cursor: 'pointer' }} /></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 600, color: '#1b1b1d', fontSize: 14 }}>{b.name}</span>
                      <span style={{ fontSize: 12, color: '#76777d' }}>{b.category}</span>
                    </div>
                  </td>
                  <td style={{ color: '#45464d', fontSize: 14 }}>{b.address !== 'Address not listed' ? b.address.split(',').slice(-2).join(',').trim() : '—'}</td>
                  <td style={{ color: '#45464d', fontSize: 14 }}>{b.category}</td>
                  <td style={{ textAlign: 'center' }}><span className={b.hasWebsite ? 'badge-verified' : 'badge-no-website'}>{b.hasWebsite ? 'Has Website' : 'No Website'}</span></td>
                  <td style={{ color: '#76777d', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{new Date(b.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>
                    <button onClick={() => cycleOutreach(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Click to change status">
                      {getOutreachBadge(b.id)}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={b.osmLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>View →</a>
                      <button onClick={() => onRemoveLead(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777d', fontSize: 16, lineHeight: 1, padding: '0 4px' }} title="Remove lead">×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e4e2e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcf8fa' }}>
          <span style={{ fontSize: 13, color: '#45464d' }}>Showing {filtered.length} of {savedLeads.length} saved leads</span>
        </div>
      </div>

      {/* Mobile stacked cards — hidden on desktop */}
      <div className="flex md:hidden" style={{ flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#76777d', fontSize: 14, background: 'white', borderRadius: 12, border: '1px solid #e4e2e4' }}>
            No leads match your search
          </div>
        ) : filtered.map(b => (
          <div
            key={b.id}
            style={{
              background: selected.has(b.id) ? '#f0f7ff' : 'white',
              border: '1px solid #c6c6cd', borderRadius: 12, padding: 14,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, minWidth: 0 }}>
                <input
                  type="checkbox"
                  checked={selected.has(b.id)}
                  onChange={() => toggleSelect(b.id)}
                  style={{ width: 16, height: 16, accentColor: '#006591', cursor: 'pointer', marginTop: 2, flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#1b1b1d', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</p>
                  <p style={{ fontSize: 12, color: '#76777d' }}>{b.category}</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveLead(b.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#76777d', fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}
                title="Remove lead"
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#45464d' }}>
              {b.address !== 'Address not listed' ? b.address.split(',').slice(-2).join(',').trim() : 'No location'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span className={b.hasWebsite ? 'badge-verified' : 'badge-no-website'}>{b.hasWebsite ? 'Has Website' : 'No Website'}</span>
              <button onClick={() => cycleOutreach(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Tap to change status">
                {getOutreachBadge(b.id)}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f0edef' }}>
              <span style={{ fontSize: 11, color: '#76777d', fontFamily: 'JetBrains Mono, monospace' }}>
                Saved {new Date(b.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <a href={b.osmLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>View on map →</a>
            </div>
          </div>
        ))}

        {filtered.length > 0 && (
          <p style={{ fontSize: 12, color: '#76777d', textAlign: 'center', padding: '8px 0' }}>
            Showing {filtered.length} of {savedLeads.length} saved leads
          </p>
        )}
      </div>
    </div>
  )
}