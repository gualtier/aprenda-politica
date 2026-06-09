import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPropositionBySlug, formatPropositionLabel } from '@/lib/propositions'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPropositionBySlug(params.slug)
  if (!p) return { title: 'Proposição — Aprenda Política' }
  return { title: `${formatPropositionLabel(p)} — Aprenda Política`, description: p.title ?? undefined }
}

export default async function PropositionPage({ params }: { params: { slug: string } }) {
  const p = await getPropositionBySlug(params.slug)
  if (!p) notFound()

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/proposicoes" className="hover:text-gray-600">Proposições</Link>
          <span>›</span>
          <span className="text-gray-600">{formatPropositionLabel(p)}</span>
        </nav>

        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-2xl font-bold text-gray-900">{formatPropositionLabel(p)}</h1>
          {p.status && <span className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">{p.status}</span>}
        </div>

        {p.summary && <p className="text-gray-700 leading-relaxed mb-6">{p.summary}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {fmtDate(p.presented_on) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Apresentação</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{fmtDate(p.presented_on)}</div>
            </div>
          )}
          {(p.themes ?? []).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Temas</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{(p.themes ?? []).join(', ')}</div>
            </div>
          )}
        </div>

        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Autoria</h2>
          <div className="flex flex-wrap gap-2">
            {(p.authors ?? []).map((a, i) => a.politician?.slug ? (
              <Link key={i} href={`/politico/${a.politician.slug}`} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400">
                {a.politician.name}
              </Link>
            ) : (
              <span key={i} className="text-sm border border-gray-100 rounded-lg px-3 py-1.5 text-gray-500">{a.author_name}</span>
            ))}
          </div>
        </section>

        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00A859] font-medium hover:underline">Ver no portal oficial →</a>}
      </div>
    </main>
  )
}
