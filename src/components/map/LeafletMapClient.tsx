'use client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { PathOptions } from 'leaflet'
import { slugify } from '@/lib/utils'

interface BrazilMapClientProps {
  onStateClick: (stateSlug: string, stateAbbr: string) => void
}

export default function LeafletMapClient({ onStateClick }: BrazilMapClientProps) {
  useEffect(() => {
    // Fix Leaflet default icon paths in Next.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl
  }, [])

  const stateStyle: PathOptions = {
    fillColor: '#00A859',
    fillOpacity: 0.08,
    color: '#00A859',
    weight: 1,
  }

  const hoverStyle: PathOptions = {
    fillOpacity: 0.2,
    weight: 2,
  }

  function onEachFeature(feature: any, layer: any) {
    layer.on({
      mouseover: (e: any) => e.target.setStyle(hoverStyle),
      mouseout: (e: any) => e.target.setStyle(stateStyle),
      click: () => {
        const abbr: string = feature.properties.sigla
        const slug = slugify(feature.properties.nome)
        onStateClick(slug, abbr)
      },
    })
    layer.bindTooltip(feature.properties.nome, { permanent: false, direction: 'center', className: 'leaflet-state-tooltip' })
  }

  return (
    <MapContainer
      center={[-14.235, -51.925]}
      zoom={4}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.3}
      />
      <BrazilGeoJSON onEachFeature={onEachFeature} style={() => stateStyle} />
    </MapContainer>
  )
}

function BrazilGeoJSON({ onEachFeature, style }: any) {
  const [geoData, setGeoData] = useState<any>(null)

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=minima&divisao=UF')
      .then((r) => r.json())
      .then(setGeoData)
  }, [])

  if (!geoData) return null
  return <GeoJSON data={geoData} onEachFeature={onEachFeature} style={style} />
}
