import Link from 'next/link'
import type { News } from '@/lib/news'
import { timeAgo, categoryLabel, categorySphere, sphereText } from '@/lib/news'
import { NewsCover } from './NewsCover'
import { SourceTag } from './SourceTag'
import { CatPill } from './CatPill'

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

  // destaque — capa full-bleed com título sobreposto (gradiente + pill)
  if (variant === 'destaque') return (
    <Link href={href} className="group relative block rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
      <NewsCover motif={n.cover_motif} sphere={n.sphere} imageUrl={n.image_url} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,12,20,0.85) 0%, rgba(8,12,20,0.30) 42%, rgba(8,12,20,0.05) 70%)' }} />
      <CatPill category={n.category} className="absolute top-3 left-3" />
      <div className="absolute left-4 right-4 bottom-4">
        <div className="flex items-center gap-2 mb-1.5">
          <SourceTag name={n.source_name} domain={n.source_domain} light />
          <span className="text-[11px] text-white/70">· {timeAgo(n.published_at)}</span>
        </div>
        <h3 className="text-white font-bold leading-snug line-clamp-2 text-[17px]">{n.title}</h3>
      </div>
    </Link>
  )

  // feed — linha com thumb à esquerda, kicker de categoria, título e fonte
  return (
    <Link href={href} className="group flex gap-3.5 py-3.5 border-b border-gray-100">
      <NewsCover motif={n.cover_motif} sphere={n.sphere} imageUrl={n.image_url} className="w-[80px] h-[80px] rounded-xl shrink-0" />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${sphereText(categorySphere(n.category))}`}>{categoryLabel(n.category)}</div>
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-verde-600">{n.title}</h3>
        <div className="mt-1.5 flex items-center gap-2"><SourceTag name={n.source_name} domain={n.source_domain} /><span className="text-[11px] text-gray-400">· {timeAgo(n.published_at)}</span></div>
      </div>
    </Link>
  )
}
