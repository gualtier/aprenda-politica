import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import type { NewsEntity } from '@/lib/news'

function Chevron() {
  return (
    <svg className="w-4 h-4 shrink-0 text-gray-300 group-hover:text-verde-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
const rowCls = 'group flex items-center gap-3 border border-gray-200 rounded-xl p-2.5 hover:border-verde-500 transition-colors'
const tile = 'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0'

/** Linha de "Mencionados nesta notícia" — entidade do sistema, linkada. */
export function MentionChip({ e }: { e: NewsEntity }) {
  if (e.politician?.slug) return (
    <Link href={`/politico/${e.politician.slug}`} className={rowCls}>
      <Avatar name={e.politician.name} photoUrl={e.politician.photo_url} size={40} />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-esfera-federal mb-0.5">Político</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{e.politician.name}</div>
      </div>
      <Chevron />
    </Link>
  )
  if (e.proposition?.slug) return (
    <Link href={`/proposicoes/${e.proposition.slug}`} className={rowCls}>
      <span className={`${tile} bg-verde-50 text-verde-600`}>📋</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-verde-600 mb-0.5">Projeto</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{e.label ?? `${e.proposition.type} ${e.proposition.number}/${e.proposition.year}`}</div>
      </div>
      <Chevron />
    </Link>
  )
  if (e.emenda_id) return (
    <Link href="/emendas" className={rowCls}>
      <span className={`${tile} bg-amarelo-50 text-amarelo-600`}>💰</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amarelo-600 mb-0.5">Emenda</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{e.label ?? 'Emenda parlamentar'}</div>
      </div>
      <Chevron />
    </Link>
  )
  if (e.orgao) return (
    <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2.5">
      <span className={`${tile} bg-gray-100 text-gray-500`}>🏛️</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Órgão</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{e.orgao}</div>
      </div>
    </div>
  )
  return null
}
