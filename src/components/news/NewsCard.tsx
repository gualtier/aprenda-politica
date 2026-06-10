import Link from 'next/link'
import type { News } from '@/lib/news'
import { timeAgo } from '@/lib/news'
import { NewsCover } from './NewsCover'
import { SourceTag } from './SourceTag'

export function NewsCard({ n, variant = 'feed' }: { n: News; variant?: 'destaque' | 'feed' | 'compacto' }) {
  const href = `/noticias/${n.slug}`
  if (variant === 'compacto') return (
    <Link href={href} className="flex items-center gap-3 group">
      <NewsCover motif={n.cover_motif} sphere={n.sphere} imageUrl={n.image_url} className="w-16 h-16 rounded-lg shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-verde-600">{n.title}</p>
        <div className="mt-1 flex items-center gap-2"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">{timeAgo(n.published_at)}</span></div>
      </div>
    </Link>
  )
  if (variant === 'destaque') return (
    <Link href={href} className="group block rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors">
      <NewsCover motif={n.cover_motif} sphere={n.sphere} imageUrl={n.image_url} className="h-44 w-full" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">· {timeAgo(n.published_at)}</span></div>
        <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-verde-600">{n.title}</h3>
        {n.summary && <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{n.summary}</p>}
      </div>
    </Link>
  )
  return (
    <Link href={href} className="group flex gap-3 py-3 border-b border-gray-100">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">· {timeAgo(n.published_at)}</span></div>
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-verde-600">{n.title}</h3>
        {n.summary && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.summary}</p>}
      </div>
      <NewsCover motif={n.cover_motif} sphere={n.sphere} imageUrl={n.image_url} className="w-24 h-24 rounded-xl shrink-0" />
    </Link>
  )
}
