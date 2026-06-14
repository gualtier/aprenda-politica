import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { TERMOS, getTermo, getCategoria, afins, vizinhos } from '@/lib/glossario'
import { Fonte } from '@/components/ui/Fonte'
import { getTopic } from '@/lib/topics'

interface PageProps { params: { termo: string } }

export function generateStaticParams() {
  return TERMOS.map(t => ({ termo: t.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = getTermo(params.termo)
  if (!t) return {}
  return {
    title: `O que é ${t.termo}? — Glossário — Aprenda Política`,
    description: t.definicaoCurta,
  }
}

export default function TermoPage({ params }: PageProps) {
  const t = getTermo(params.termo)
  if (!t) notFound()
  const cat = getCategoria(t.categoria)
  const relacionados = afins(t)
  const { prev, next } = vizinhos(t)
  const temas = (t.temas ?? []).map(s => getTopic(s)).filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'DefinedTerm',
    name: t.termo, alternateName: t.nomeCompleto, description: t.definicaoCurta,
    url: `https://aprendapolitica.com.br/glossario/${t.slug}`,
    inDefinedTermSet: 'https://aprendapolitica.com.br/glossario',
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Glossário', href: '/glossario' }, { label: t.termo }]} />

        <div className="mt-4 mb-6">
          {cat && <span className={`inline-flex text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 mb-3 ${cat.pill}`}>{cat.label}</span>}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{t.termo}</h1>
          {t.nomeCompleto && <p className="text-lg text-gray-500 mt-1">{t.nomeCompleto}</p>}
        </div>

        <div className="space-y-4 mb-6">
          {t.definicao.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed">{p}</p>)}
        </div>

        <div className="bg-verde-50 border border-verde-100 rounded-2xl p-5 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-verde-700 mb-1.5">Na prática</div>
          <p className="text-sm text-gray-700 leading-relaxed">{t.exemplo}</p>
        </div>

        {temas.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Temas relacionados</h2>
            <div className="flex flex-wrap gap-2">
              {temas.map(tp => tp && (
                <Link key={tp.slug} href={`/proposicoes/tema/${tp.slug}`}
                  className="text-xs font-medium rounded-full px-3 py-1.5 border hover:opacity-80 transition"
                  style={{ background: `${tp.accent}14`, color: tp.accent, borderColor: `${tp.accent}33` }}>
                  {tp.emoji} {tp.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {(t.links?.length ?? 0) > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Veja no portal</h2>
            <div className="flex flex-wrap gap-2">
              {t.links!.map(l => (
                <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-verde-600 border border-verde-100 bg-verde-50 rounded-full px-3.5 py-1.5 hover:bg-verde-100 transition-colors">
                  {l.label} →
                </Link>
              ))}
            </div>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Termos com afinidade</h2>
            <div className="flex flex-wrap gap-2">
              {relacionados.map(r => (
                <Link key={r.slug} href={`/glossario/${r.slug}`} className="text-sm font-medium text-gray-700 border border-gray-200 rounded-full px-3.5 py-1.5 hover:border-verde-500 hover:text-verde-600 transition-colors">
                  {r.termo}
                </Link>
              ))}
            </div>
          </section>
        )}

        <Fonte variant="bloco" className="mb-8" sources={[{ fonte: 'editorial' }]} />

        <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-5">
          {prev ? <Link href={`/glossario/${prev.slug}`} className="text-gray-500 hover:text-gray-900">← {prev.termo}</Link> : <span />}
          {next ? <Link href={`/glossario/${next.slug}`} className="text-verde-600 font-medium hover:underline">{next.termo} →</Link> : <span />}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}

export const revalidate = false
