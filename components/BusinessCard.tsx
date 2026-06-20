'use client'

import { Business } from '@/types'
import StatusBadge from './StatusBadge'

interface Props {
  business: Business
  isSaved: boolean
  isSelected: boolean
  onToggleSave: (b: Business) => void
  onSelect: (b: Business) => void
  bulkMode?: boolean
  isBulkSelected?: boolean
  onToggleBulkSelect?: (id: string) => void
}

export default function BusinessCard({ business, isSaved, isSelected, onToggleSave, onSelect, bulkMode, isBulkSelected, onToggleBulkSelect }: Props) {
  const telLink = business.phone ? 'tel:' + business.phone : null
  const mailLink = business.email ? 'mailto:' + business.email : null
  const hasAddress = business.address && business.address !== 'Address not listed'
  const findAddressUrl = 'https://www.google.com/search?q=' + encodeURIComponent(business.name + ' ' + business.category + ' address')

  const handleClick = () => {
    if (bulkMode && onToggleBulkSelect) {
      onToggleBulkSelect(business.id)
    } else {
      onSelect(business)
    }
  }

  return (
    <div id={'card-' + business.id} onClick={handleClick} className={'lead-card stagger-in' + (isSelected ? ' selected' : '')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 0, flex: 1 }}>
          {bulkMode && (
            <input
              type="checkbox"
              checked={!!isBulkSelected}
              onChange={() => onToggleBulkSelect && onToggleBulkSelect(business.id)}
              onClick={e => e.stopPropagation()}
              style={{ width: 16, height: 16, accentColor: '#006591', cursor: 'pointer', marginTop: 3, flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1b1b1d', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{business.name}</h4>
            <p style={{ fontSize: 12, color: '#45464d', fontFamily: 'JetBrains Mono, monospace' }}>{business.category}</p>
          </div>
        </div>
        {!bulkMode && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleSave(business) }}
            aria-label={isSaved ? 'Remove' : 'Save'}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              border: 'none', cursor: 'pointer',
              background: isSaved ? '#c9e6ff' : 'transparent',
              color: isSaved ? '#006591' : '#76777d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all 0.15s',
            }}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <StatusBadge hasWebsite={business.hasWebsite} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10, borderTop: '1px solid #e4e2e4' }}>
        {hasAddress ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>📍</span>
            <span style={{ fontSize: 12, color: '#45464d', lineHeight: 1.4 }}>{business.address}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#c6c6cd' }}>
              <span style={{ fontSize: 12 }}>📍</span>
              <span style={{ fontSize: 12, fontStyle: 'italic' }}>No address listed</span>
            </div>
            <a href={findAddressUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', whiteSpace: 'nowrap' }}>Find address →</a>
          </div>
        )}

        {telLink ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, flexShrink: 0 }}>📞</span>
            <a href={telLink} onClick={(e) => e.stopPropagation()} style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>{business.phone}</a>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#c6c6cd' }}>
            <span style={{ fontSize: 12 }}>📞</span>
            <span style={{ fontSize: 12, fontStyle: 'italic' }}>No phone listed</span>
          </div>
        )}

        {mailLink ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, flexShrink: 0 }}>✉️</span>
            <a href={mailLink} onClick={(e) => e.stopPropagation()} style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{business.email}</a>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#c6c6cd' }}>
            <span style={{ fontSize: 12 }}>✉️</span>
            <span style={{ fontSize: 12, fontStyle: 'italic' }}>No email listed</span>
          </div>
        )}

        {business.openingHours && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>🕐</span>
            <span style={{ fontSize: 11, color: '#76777d', lineHeight: 1.4 }}>{business.openingHours}</span>
          </div>
        )}
      </div>

      {isSelected && !bulkMode && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e4e2e4' }}>
          <a href={business.osmLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View on OpenStreetMap →</a>
        </div>
      )}
    </div>
  )
}