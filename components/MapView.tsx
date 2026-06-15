'use client'

import dynamic from 'next/dynamic'
import { Business } from '@/types'
import { IconMap } from '@tabler/icons-react'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#08090e]">
      <IconMap size={32} stroke={1} className="text-[#2a2d3a]" />
      <p className="text-xs font-mono text-[#3a3d50]">Loading map...</p>
    </div>
  ),
})

interface Props {
  businesses: Business[]
  center: [number, number] | null
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function MapView(props: Props) {
  return <LeafletMap {...props} />
}