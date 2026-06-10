import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { newsBySlug, timeAgo } from '@/lib/news'
import { NewsCover } from '@/components/news/NewsCover'
import { SourceTag } from '@/components/news/SourceTag'
import { MentionChip } from '@/components/news/MentionChip'
import { CatPill } from '@/components/news/CatPill'

interface PageProps { params: { slug: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const n = await newsBySlug(params.slug)
  if (!n) return {}
  return { title: `${n.title} — Aprenda Política`, description: n.summary ?? n.title }
}

export default async function NoticiaPage({ params }: PageProps) {
  const n = await newsBySlug(params.slug)
  if (!n) notFound()
  const ents = n.entities ?? []
  const mentioned = ents.filter(e => e.role === 'mencionado' || e.role === 'principal')

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: n.title, datePublished: n.published_at ?? undefined,
    abstract: n.summary ?? undefined,
    isBasedOn: n.source_url, publisher: n.source_name ? { '@type': 'Organization', name: n.source_name } : undefined,
    url: `https://aprendapolitica.com.br/noticias/${n.slug}`,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Notícias', href: '/noticias' }, { label: n.title.slice(0, 40) + '…' }]} />
        {/* hero — capa full-bleed com título sobreposto */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[2/1] mt-4 mb-6">
          <NewsCover motif={n.cover_motif} sphere={n.sphere} imageUrl={n.image_url} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,12,20,0.86) 0%, rgba(8,12,20,0.30) 45%, rgba(8,12,20,0.05) 75%)' }} />
          <CatPill category={n.category} className="absolute top-4 left-4" />
          <div className="absolute left-5 right-5 bottom-5">
            <div className="flex items-center gap-2 mb-2">
              <SourceTag name={n.source_name} domain={n.source_domain} light />
              <span className="text-xs text-white/70">· {timeAgo(n.published_at)}</span>
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight">{n.title}</h1>
          </div>
        </div>

        {n.summary && <p className="text-lg text-gray-700 leading-relaxed mb-6">{n.summary}</p>}

        <a href={n.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-verde-600 hover:underline mb-8">
          Ler matéria completa na fonte
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>

        {mentioned.length > 0 && (
          <section className="border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Mencionados nesta notícia</h2>
            <p className="text-sm text-gray-400 mb-4">Objetos do sistema citados — clique para abrir o perfil.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mentioned.map((e, i) => <MentionChip key={i} e={e} />)}
            </div>
          </section>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}

export const revalidate = 900
