'use client'

import { IconMapPin, IconPhone, IconClock, IconBookmark, IconBookmarkFilled, IconExternalLink, IconMail, IconWorldOff, IconWorld } from '@tabler/icons-react'
import { Business } from '@/types'

interface Props {
  business: Business
  isSaved: boolean
  isSelected: boolean
  onToggleSave: (b: Business) => void
  onSelect: (b: Business) => void
}

export default function BusinessCard({ business, isSaved, isSelected, onToggleSave, onSelect }: Props) {
  const telLink = business.phone ? 'tel:' + business.phone : null
  const mailLink = business.email ? 'mailto:' + business.email : null
  const websiteHref = business.website ? (business.website.startsWith('http') ? business.website : 'https://' + business.website) : null
  const websiteDisplay = business.website ? business.website.replace(/^https?:\/\/(www\.)?/, '') : null

  return (
    <div
      id={'card-' + business.id}
      onClick={() => onSelect(business)}
      className={['group relative rounded-xl p-4 cursor-pointer transition-all duration-150 border', isSelected ? 'bg-[#00d4ff]/[0.04] border-[#00d4ff]/30 shadow-[0_0_0_1px_rgba(0,212,255,0.15)]' : 'bg-[#0d0f1a] border-[#1e2130] hover:border-[#2a2d40] hover:bg-[#111420]'].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={['inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', business.hasWebsite ? 'text-emerald-400 bg-emerald-400/8 border-emerald-400/20' : 'text-red-400 bg-red-400/8 border-red-400/20'].join(' ')}>
              {business.hasWebsite ? <><IconWorld size={9} stroke={2} />Has Website</> : <><IconWorldOff size={9} stroke={2} />No Website</>}
            </span>
          </div>
          <h3 className="text-[13px] font-semibold text-[#e8e8f0] leading-snug group-hover:text-white transition-colors truncate pr-2">{business.name}</h3>
          <p className="text-[10px] font-mono text-[#4a4d65] mt-0.5 uppercase tracking-wider">{business.category}</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSave(business) }}
          aria-label={isSaved ? 'Remove bookmark' : 'Save lead'}
          className={['shrink-0 p-1.5 rounded-lg transition-all', isSaved ? 'text-[#00d4ff] bg-[#00d4ff]/10' : 'text-[#3a3d52] hover:text-[#00d4ff] hover:bg-[#00d4ff]/8'].join(' ')}
        >
          {isSaved ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} stroke={1.5} />}
        </button>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-start gap-2">
          <IconMapPin size={11} stroke={1.5} className="shrink-0 mt-0.5 text-[#3a3d52]" />
          <span className="text-[#6b6e85] leading-relaxed">{business.address}</span>
        </div>

        {telLink ? (
          <div className="flex items-center gap-2">
            <IconPhone size={11} stroke={1.5} className="shrink-0 text-[#3a3d52]" />
            <a href={telLink} onClick={(e) => e.stopPropagation()} className="font-mono text-[#6b6e85] hover:text-[#00d4ff] transition-colors">{business.phone}</a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#2e3045] italic">
            <IconPhone size={11} stroke={1.5} className="shrink-0" />
            <span>No phone listed</span>
          </div>
        )}

        {mailLink && (
          <div className="flex items-center gap-2">
            <IconMail size={11} stroke={1.5} className="shrink-0 text-[#3a3d52]" />
            <a href={mailLink} onClick={(e) => e.stopPropagation()} className="font-mono text-[#6b6e85] hover:text-[#00d4ff] transition-colors truncate">{business.email}</a>
          </div>
        )}

        {business.openingHours && (
          <div className="flex items-start gap-2">
            <IconClock size={11} stroke={1.5} className="shrink-0 mt-0.5 text-[#3a3d52]" />
            <span className="text-[#4a4d65] leading-relaxed">{business.openingHours}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1a1d2e]">
        {websiteHref ? (
          <a href={websiteHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-mono text-[#00d4ff]/70 hover:text-[#00d4ff] transition-colors truncate max-w-[160px]">{websiteDisplay}</a>
        ) : (
          <span className="text-[10px] font-mono text-[#2e3045]">No website found</span>
        )}
        <a href={business.osmLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold font-mono bg-[#1a1d2e] hover:bg-[#222538] text-[#4a4d65] hover:text-[#8888aa] rounded-md transition-all border border-[#252840]">
          OSM <IconExternalLink size={9} stroke={2} />
        </a>
      </div>
    </div>
  )
}