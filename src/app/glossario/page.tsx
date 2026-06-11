import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { TERMOS } from '@/lib/glossario'
import { GlossarioExplorer } from '@/components/glossario/GlossarioExplorer'

export const metadata: Metadata = {
  title: 'Glossário da política — termos explicados em linguagem simples — Aprenda Política',
  description: 'O que é PEC, quórum, medida provisória, emenda parlamentar? Glossário com os termos da política brasileira explicados sem juridiquês.',
}
export const revalidate = false

export default function GlossarioPage() {
  const termos = TERMOS.map(t => ({ slug: t.slug, termo: t.termo, nomeCompleto: t.nomeCompleto, categoria: t.categoria, definicaoCurta: t.definicaoCurta }))
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'DefinedTermSet',
    name: 'Glossário da política brasileira',
    url: 'https://aprendapolitica.com.br/glossario',
    hasDefinedTerm: TERMOS.map(t => ({ '@type': 'DefinedTerm', name: t.termo, description: t.definicaoCurta, url: `https://aprendapolitica.com.br/glossario/${t.slug}` })),
  }
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Glossário' }]} />
        <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mt-4">Educação política</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">Glossário da política</h1>
        <p className="text-gray-500 text-lg max-w-2xl mb-8">{TERMOS.length} termos do dia a dia da política explicados em linguagem simples — sem juridiquês.</p>
        <GlossarioExplorer termos={termos} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}
