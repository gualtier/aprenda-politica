'use client'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PoliticianPanelProps {
  politician: Politician
  onClose: () => void
}

export function PoliticianPanel({ politician: p, onClose }: PoliticianPanelProps) {
  return (
    <aside
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right"
      role="complementary"
      aria-label="Detalhes do político"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {p.position?.name}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          aria-label="Fechar painel"
        >
          ×
        </button>
      </div>

      <div className="p-6 flex flex-col items-center gap-4 border-b">
        <Avatar name={p.name} photoUrl={p.photo_url} size={96} />
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">{p.name}</h2>
          {p.party && (
            <div className="text-sm font-medium mt-1" style={{ color: p.party.color_hex }}>
              {p.party.name} ({p.party.abbr})
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-3 text-sm flex-1">
        {p.mandate_start && (
          <div className="flex justify-between">
            <span className="text-gray-500">Mandato</span>
            <span className="font-medium">{formatMandate(p.mandate_start, p.mandate_end)}</span>
          </div>
        )}
        {p.position && (
          <div className="flex justify-between">
            <span className="text-gray-500">Esfera</span>
            <span className="font-medium capitalize">
              {p.position.level === 'federal' ? 'Federal' : p.position.level === 'state' ? 'Estadual' : 'Municipal'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Link
          href={`/politico/${p.slug}`}
          className="block w-full text-center bg-[#009c3b] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#007a30] transition-colors"
        >
          Ver perfil completo →
        </Link>
      </div>
    </aside>
  )
}
