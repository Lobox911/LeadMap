import { Business } from '@/types'
import StatusBadge from './StatusBadge'

export default function MapPopup({ business }: { business: Business }) {
  const telLink = business.phone ? 'tel:' + business.phone : null

  return (
    <div className="p-4 min-w-[220px] max-w-[280px]">
      <StatusBadge hasWebsite={business.hasWebsite} className="mb-2" />
      <p className="font-semibold text-sm text-[#f0f0f5] leading-snug mb-1">{business.name}</p>
      <p className="text-[10px] font-mono text-[#00d4ff] uppercase tracking-widest mb-3">{business.category}</p>
      {business.address !== 'Address not listed' && (
        <p className="text-[11px] text-[#8888aa] leading-relaxed mb-2">{business.address}</p>
      )}
      {telLink && (
        <a href={telLink} className="block text-[11px] font-mono text-[#8888aa] hover:text-[#00d4ff] mb-2 transition-colors">
          {business.phone}
        </a>
      )}
      <a href={business.osmLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[#00d4ff] hover:underline font-mono mt-1">
        View on OpenStreetMap
      </a>
    </div>
  )
}