import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import type { NewsEntity } from '@/lib/news'
export function MentionChip({ e }: { e: NewsEntity }) {
  if (e.politician?.slug) return (
    <Link href={`/politico/${e.politician.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 pl-1 pr-2.5 py-1 hover:border-verde-500 transition-colors">
      <Avatar name={e.politician.name} photoUrl={e.politician.photo_url} size={20} />
      <span className="text-xs font-medium text-gray-800">{e.politician.name}</span>
    </Link>
  )
  if (e.proposition?.slug) return (
    <Link href={`/proposicoes/${e.proposition.slug}`} className="inline-flex items-center rounded-full bg-verde-50 text-verde-700 text-xs font-semibold px-2.5 py-1 hover:bg-verde-100 transition-colors">
      {e.label ?? `${e.proposition.type} ${e.proposition.number}/${e.proposition.year}`}
    </Link>
  )
  if (e.emenda_id) return (
    <Link href={`/emendas`} className="inline-flex items-center rounded-full bg-amarelo-50 text-amarelo-600 text-xs font-semibold px-2.5 py-1 hover:opacity-80 transition-colors">{e.label ?? 'Emenda'}</Link>
  )
  if (e.orgao) return <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">{e.orgao}</span>
  return null
}
