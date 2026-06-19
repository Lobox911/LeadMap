import { Business } from '@/types'

interface Props {
  business: Business
  onSave: (b: Business) => void
  isSaved: boolean
}

export default function MapPopup({ business, onSave, isSaved }: Props) {
  const telLink = business.phone ? 'tel:' + business.phone : null

  return (
    <div style={{ width: 240, fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #e4e2e4' }}>
        <span className={business.hasWebsite ? 'badge-verified' : 'badge-no-website'} style={{ marginBottom: 8, display: 'inline-flex' }}>{business.hasWebsite ? 'Verified Website' : 'No Website'}</span>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1b1b1d', marginTop: 6, lineHeight: 1.3 }}>{business.name}</p>
        <p style={{ fontSize: 11, color: '#45464d', fontFamily: 'JetBrains Mono, monospace', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{business.category}</p>
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {business.address !== 'Address not listed' && <p style={{ fontSize: 12, color: '#45464d', lineHeight: 1.5 }}>📍 {business.address}</p>}
        {telLink && <a href={telLink} style={{ fontSize: 12, color: '#006591', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>📞 {business.phone}</a>}
      </div>
      <div style={{ padding: '10px 14px', borderTop: '1px solid #e4e2e4', display: 'flex', gap: 8 }}>
        <a href={business.osmLink} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '7px 0', background: '#f6f3f5', border: '1px solid #c6c6cd', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#45464d', textAlign: 'center', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>View Map</a>
        <button onClick={() => onSave(business)} style={{ flex: 1, padding: '7px 0', background: isSaved ? '#c9e6ff' : '#006591', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, color: isSaved ? '#006591' : 'white', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}>{isSaved ? 'Saved ✓' : 'Save Lead'}</button>
      </div>
    </div>
  )
}