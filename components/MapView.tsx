'use client'

import dynamic from 'next/dynamic'
import { Business } from '@/types'
import { IconMap } from '@tabler/icons-react'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#070810' }}>
      <IconMap size={32} stroke={1} style={{ color: '#2a2d3a' }} />
      <p style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace', color: '#3a3d50' }}>Loading map...</p>
    </div>
  ),
})

interface Props {
  businesses: Business[]
  center: [number, number] | null
  selectedId: string | null
  onSelectBusiness: (id: string) => void
  onSave: (b: Business) => void
  savedIds: Set<string>
}

export default function MapView(props: Props) {
  return <LeafletMap {...props} />
}