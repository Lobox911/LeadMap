'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Business } from '@/types'
import MapPopup from './MapPopup'

// Fix default icon paths in Next.js
const fixIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  })
}

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 14, { animate: true })
  }, [center, map])
  return null
}

interface Props {
  businesses: Business[]
  center: [number, number] | null
  selectedId: string | null
  onSelectBusiness: (id: string) => void
}

export default function LeafletMap({ businesses, center, selectedId, onSelectBusiness }: Props) {
  useEffect(() => { fixIcon() }, [])

  const withCoords = businesses.filter(b => b.lat !== null && b.lon !== null)

  return (
    <MapContainer
      center={center ?? [20, 0]}
      zoom={center ? 14 : 2}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController center={center} />
      {withCoords.map(b => (
        <Marker
          key={b.id}
          position={[b.lat!, b.lon!]}
          icon={b.hasWebsite ? greenIcon : redIcon}
          eventHandlers={{ click: () => onSelectBusiness(b.id) }}
        >
          <Popup>
            <MapPopup business={b} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}