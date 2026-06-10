import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { newsBySlug, timeAgo } from '@/lib/news'
import { NewsCover } from '@/components/news/NewsCover'
import { SourceTag } from '@/components/news/SourceTag'
import { MentionChip } from '@/components/news/MentionChip'

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
        <NewsCover motif={n.cover_motif} sphere={n.sphere} className="h-52 w-full rounded-2xl mt-4 mb-5" />
        <div className="flex items-center gap-2 mb-2">
          <SourceTag name={n.source_name} domain={n.source_domain} />
          <span className="text-xs text-gray-400">· {timeAgo(n.published_at)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">{n.title}</h1>
        {n.summary && <p className="text-lg text-gray-700 leading-relaxed mb-6">{n.summary}</p>}

        <a href={n.source_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-verde-600 hover:underline mb-8">
          Ler matéria completa na fonte
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>

        {mentioned.length > 0 && (
          <section className="border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Mencionados nesta notícia</h2>
            <div className="flex flex-wrap gap-2">
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
