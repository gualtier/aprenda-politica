import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { listNews, featuredNews, categoryLabel } from '@/lib/news'
import { NewsCard } from '@/components/news/NewsCard'
import { CategoryBar } from '@/components/news/CategoryBar'

export const metadata: Metadata = {
  title: 'Notícias — política que cruza com o portal — Aprenda Política',
  description: 'Notícias sobre políticos, projetos de lei e emendas, com as entidades mencionadas linkadas ao Aprenda Política.',
}
export const revalidate = 900

type PageProps = { searchParams: { cat?: string } }

export default async function NoticiasPage({ searchParams }: PageProps) {
  const cat = searchParams.cat ?? 'todos'
  const [{ items }, featured] = await Promise.all([
    listNews({ category: cat, pageSize: 30 }),
    cat === 'todos' ? featuredNews(5) : Promise.resolve([]),
  ])
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Notícias' }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-1">Notícias</h1>
        <p className="text-gray-500 mb-5">O que a imprensa diz sobre políticos, projetos de lei e emendas — com tudo linkado ao portal.</p>
        <div className="mb-6"><CategoryBar active={cat} /></div>

        {featured.length > 0 && (
          <section className="mb-9">
            <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Em destaque</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(n => <NewsCard key={n.id} n={n} variant="destaque" />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">{cat === 'todos' ? 'Recomendados' : categoryLabel(cat)}</h2>
          {items.length === 0
            ? <p className="text-sm text-gray-400 mt-3">Sem notícias nesta categoria ainda.</p>
            : <div>{items.map(n => <NewsCard key={n.id} n={n} variant="feed" />)}</div>}
        </section>
      </div>
    </main>
  )
}
