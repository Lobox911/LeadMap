'use client'

import { useState, useMemo } from 'react'
import {
  IconBookmark, IconTrash, IconSearch, IconExternalLink,
  IconMapPin, IconPhone, IconArrowLeft, IconDownload
} from '@tabler/icons-react'
import { SavedLead } from '@/types'
import { exportToCsv, exportToJson } from '@/lib/exportUtils'
import StatusBadge from './StatusBadge'

interface Props {
  savedLeads: SavedLead[]
  onRemoveLead: (id: string) => void
  onClearAll: () => void
  onNavigateToSearch: () => void
}

export default function SavedLeads({ savedLeads, onRemoveLead, onClearAll, onNavigateToSearch }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return savedLeads
    const q = query.toLowerCase()
    return savedLeads.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    )
  }, [savedLeads, query])

  if (savedLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#0d0f1a] border border-[#1a1d2e] flex items-center justify-center">
          <IconBookmark size={28} stroke={1} className="text-[#2a2d3a]" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-[#4a4d60]">No saved leads yet</p>
          <p className="text-[11px] text-[#3a3d50] font-mono leading-relaxed max-w-xs mx-auto">
            Bookmark businesses from search results to build your outreach list
          </p>
        </div>
        <button
          onClick={onNavigateToSearch}
          className="px-5 py-2.5 bg-[#00d4ff] text-[#08090e] text-xs font-bold rounded-xl hover:bg-[#00e1ff] transition-colors shadow-[0_0_20px_rgba(0,212,255,0.2)]"
        >
          Start Searching
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToSearch}
            className="flex items-center gap-1.5 text-xs text-[#4a4d60] hover:text-[#f0f0f5] transition-colors font-mono"
          >
            <IconArrowLeft size={13} stroke={1.5} /> Back
          </button>
          <span className="w-px h-4 bg-[#1a1d2e]" />
          <div>
            <h2 className="text-sm font-bold text-[#f0f0f5]">Saved Leads</h2>
            <p className="text-[10px] text-[#4a4d60] font-mono">{savedLeads.length} prospect{savedLeads.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(savedLeads)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold rounded-xl hover:bg-[#00d4ff]/15 transition-colors"
          >
            <IconDownload size={13} stroke={2} /> CSV
          </button>
          <button
            onClick={() => exportToJson(savedLeads)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0d0f1a] border border-[#1a1d2e] text-[#6b6e85] text-xs font-semibold rounded-xl hover:border-[#252840] hover:text-white transition-colors"
          >
            <IconDownload size={13} stroke={2} /> JSON
          </button>
          <button
            onClick={() => { if (window.confirm('Clear all saved leads?')) onClearAll() }}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/15 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/15 transition-colors"
          >
            <IconTrash size={13} stroke={1.5} /> Clear all
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch size={14} stroke={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a3d50]" />
        <input
          type="text"
          placeholder="Search saved leads..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#0d0f1a] border border-[#1a1d2e] rounded-xl text-sm text-[#f0f0f5] placeholder-[#3a3d50] focus:border-[#00d4ff]/30 focus:outline-none transition-colors font-mono"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xs text-[#3a3d50] font-mono">No leads match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="card-surface rounded-2xl p-5 flex flex-col gap-4 group">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-md font-mono">
                    {b.category}
                  </span>
                  <h3 className="text-sm font-semibold text-[#f0f0f5] leading-snug truncate">{b.name}</h3>
                </div>
                <button
                  onClick={() => onRemoveLead(b.id)}
                  aria-label="Remove lead"
                  className="p-1.5 text-[#3a3d50] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                >
                  <IconTrash size={14} stroke={1.5} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs text-[#6b6e85] border-t border-[#1a1d2e] pt-3">
                <div className="flex items-start gap-2">
                  <IconMapPin size={13} stroke={1.5} className="shrink-0 mt-0.5 text-[#3a3d50]" />
                  <span className="text-[#8888aa] leading-relaxed">{b.address}</span>
                </div>
                {b.phone ? (
                  <div className="flex items-center gap-2">
                    <IconPhone size={13} stroke={1.5} className="shrink-0 text-[#3a3d50]" />
                    <a href={`tel:${b.phone}`} className="font-mono text-[11px] text-[#8888aa] hover:text-[#00d4ff] transition-colors">
                      {b.phone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#3a3d50] italic">
                    <IconPhone size={13} stroke={1.5} className="shrink-0" />
                    <span>No phone listed</span>
                  </div>
                )}
                <p className="text-[10px] text-[#2a2d3a] font-mono">
                  Saved {new Date(b.savedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1a1d2e]">
                <StatusBadge hasWebsite={b.hasWebsite} />
                

                <a href={b.osmLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold font-mono bg-[#1a1d2e] hover:bg-[#252840] text-[#6b6e85] hover:text-white rounded-lg transition-all border border-[#252840]">
                  OSM <IconExternalLink size={10} stroke={2} />
                </a>


              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}