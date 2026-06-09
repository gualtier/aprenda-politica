'use client'
import { useState, useCallback } from 'react'
import { PoliticianPanel } from './PoliticianPanel'
import { Avatar } from '@/components/ui/Avatar'
import type { OrganogramData, Politician } from '@/types'

const COLORS = {
  federal: '#2255aa',
  estadual: '#007a30',
  municipal: '#cc9900',
}

interface OrganogramProps {
  data: OrganogramData
}

// ── Small avatar button used in legislative grids ────────────────────────────

function AvatarBtn({ p, onSelect }: { p: Politician; onSelect: (p: Politician) => void }) {
  return (
    <button
      onClick={() => onSelect(p)}
      className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
      title={p.name}
    >
      <Avatar name={p.name} photoUrl={p.photo_url} size={40} />
      <span className="text-[9px] text-gray-600 text-center leading-tight w-10 truncate">{p.name.split(' ')[0]}</span>
      <span className="text-[8px] text-gray-400">{p.party?.abbr ?? ''}</span>
    </button>
  )
}

// ── Rich executive card ──────────────────────────────────────────────────────

function ExecCard({ p, color, onSelect }: { p: Politician; color: string; onSelect: (p: Politician) => void }) {
  return (
    <button
      onClick={() => onSelect(p)}
      className="w-full flex items-center gap-3 text-left rounded-xl p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-100"
    >
      <Avatar name={p.name} photoUrl={p.photo_url} size={52} />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-sm text-gray-900 truncate">{p.name}</div>
        <div className="text-xs font-medium truncate mt-0.5" style={{ color }}>
          {p.position?.name ?? '—'}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {p.party?.name ?? ''}{p.party?.abbr ? ` (${p.party.abbr})` : ''}
        </div>
      </div>
      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

// ── Mobile sphere section ────────────────────────────────────────────────────

interface SphereSectionProps {
  color: string
  sphereLabel: string
  govLabel: string
  tagline: string
  executive: Politician[]
  legGroups: { label: string; description: string; politicians: Politician[] }[]
  onSelect: (p: Politician) => void
}

function SphereSection({ color, sphereLabel, govLabel, tagline, executive, legGroups, onSelect }: SphereSectionProps) {
  const totalLeg = legGroups.reduce((s, g) => s + g.politicians.length, 0)

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: `${color}40` }}>
      {/* Header */}
      <div className="px-4 py-3" style={{ background: color }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-sm tracking-wide">{sphereLabel}</div>
            <div className="text-white/80 text-xs mt-0.5">{govLabel}</div>
          </div>
          <div className="text-white/60 text-xs text-right">{tagline}</div>
        </div>
      </div>

      {/* Body — mobile: stacked | desktop: exec left + leg right */}
      <div className="bg-white md:flex md:divide-x md:divide-gray-100">

        {/* Poder Executivo */}
        <div className="px-4 pt-4 pb-3 md:w-72 md:shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full" style={{ background: color }} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Poder Executivo</span>
          </div>
          {executive.length > 0 ? (
            <div className="flex flex-col gap-2">
              {executive.map((p) => <ExecCard key={p.id} p={p} color={color} onSelect={onSelect} />)}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Dados não disponíveis</p>
          )}
        </div>

        {/* Poder Legislativo */}
        <div className="px-4 pt-3 pb-4 border-t border-gray-50 md:border-t-0 md:flex-1 md:pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-gray-300" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Poder Legislativo</span>
          </div>
          {totalLeg > 0 ? (
            <div className="flex flex-col gap-4">
              {legGroups.filter(g => g.politicians.length > 0).map((g) => (
                <div key={g.label}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-700">{g.label}</span>
                    <span className="text-xs text-gray-400">· {g.politicians.length} membros</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-2 leading-snug">{g.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {g.politicians.map((p) => <AvatarBtn key={p.id} p={p} onSelect={onSelect} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Dados em breve</p>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function Organogram({ data }: OrganogramProps) {
  const [selected, setSelected] = useState<Politician | null>(null)
  const handleSelect = useCallback((p: Politician) => setSelected(p), [])

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Ordem local-primeiro: municipal → estadual → federal */}
        {data.municipal && (
          <SphereSection
            color={COLORS.municipal}
            sphereLabel="Esfera Municipal"
            govLabel={`Prefeitura de ${data.municipality?.name}`}
            tagline="Governo local"
            executive={data.municipal.executive}
            legGroups={[
              {
                label: 'Câmara Municipal',
                description: `Vereadores eleitos para criar leis municipais e fiscalizar a prefeitura de ${data.municipality?.name}.`,
                politicians: data.municipal.legislative,
              },
            ]}
            onSelect={handleSelect}
          />
        )}

        <SphereSection
          color={COLORS.estadual}
          sphereLabel="Esfera Estadual"
          govLabel={`Governo do ${data.state.name}`}
          tagline={data.state.abbr}
          executive={data.estadual.executive}
          legGroups={[
            {
              label: 'Assembleia Legislativa',
              description: `Deputados estaduais eleitos para criar leis do ${data.state.name} e fiscalizar o governo estadual.`,
              politicians: data.estadual.legislative,
            },
          ]}
          onSelect={handleSelect}
        />

        <SphereSection
          color={COLORS.federal}
          sphereLabel="Esfera Federal"
          govLabel="Governo da República Federativa do Brasil"
          tagline="214 mi de brasileiros"
          executive={data.federal.executive}
          legGroups={[
            {
              label: 'Câmara dos Deputados',
              description: 'Representantes eleitos pelo povo de cada estado. Propõem e votam leis federais.',
              politicians: data.federal.legislative.camara,
            },
            {
              label: 'Senado Federal',
              description: '3 senadores por estado. Revisam leis e representam os estados na esfera federal.',
              politicians: data.federal.legislative.senado,
            },
          ]}
          onSelect={handleSelect}
        />
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />
          <PoliticianPanel politician={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </>
  )
}
