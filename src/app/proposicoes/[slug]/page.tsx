import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPropositionBySlug, formatPropositionLabel, typeInfo, SOURCE_LABELS } from '@/lib/propositions'
import { SITE_URL } from '@/lib/site'
import type { PropositionAuthor } from '@/types'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPropositionBySlug(params.slug)
  if (!p) return { title: 'Proposição — Aprenda Política' }
  const label = formatPropositionLabel(p)
  const desc = (p.title ?? `${typeInfo(p.type).name} ${label}`).slice(0, 155)
  return {
    title: `${label} — ${typeInfo(p.type).name} — Aprenda Política`,
    description: desc,
    alternates: { canonical: `${SITE_URL}/proposicoes/${p.slug}` },
    openGraph: { title: `${label} — Aprenda Política`, description: desc, type: 'article' },
  }
}

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : null

function statusTone(status: string | null): string {
  const s = (status ?? '').toLowerCase()
  if (/sancion|promulg|aprovad|transformad.* em norma|publicad/.test(s)) return 'bg-green-50 text-green-700 border-green-200'
  if (/arquivad|rejeitad|retirad|devolvid|prejudicad/.test(s)) return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

function AuthorChip({ a }: { a: PropositionAuthor }) {
  const party = a.politician?.party
  const inner = (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium text-gray-800">{a.politician?.name ?? a.author_name}</span>
      {party?.abbr && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: `${party.color_hex ?? '#9ca3af'}1a`, color: party.color_hex ?? '#6b7280' }}>
          {party.abbr}
        </span>
      )}
    </span>
  )
  return a.politician?.slug
    ? <Link href={`/politico/${a.politician.slug}`} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors">{inner}</Link>
    : <span className="text-sm border border-gray-100 rounded-lg px-3 py-1.5 text-gray-500">{a.author_name}</span>
}

export default async function PropositionPage({ params }: { params: { slug: string } }) {
  const p = await getPropositionBySlug(params.slug)
  if (!p) notFound()

  const label = formatPropositionLabel(p)
  const info = typeInfo(p.type)
  const authors = p.authors ?? []
  const autores = authors.filter(a => a.role === 'autor')
  const coautores = authors.filter(a => a.role !== 'autor')

  // Partidos envolvidos (distintos), a partir dos autores casados
  const parties = new Map<string, string>()
  for (const a of authors) {
    const pt = a.politician?.party
    if (pt?.abbr && !parties.has(pt.abbr)) parties.set(pt.abbr, pt.color_hex ?? '#6b7280')
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: `${label} — ${p.title ?? info.name}`,
    legislationType: info.name,
    legislationIdentifier: label,
    ...(p.presented_on ? { legislationDate: p.presented_on } : {}),
    ...(p.themes?.length ? { about: p.themes } : {}),
    inLanguage: 'pt-BR',
    url: `${SITE_URL}/proposicoes/${p.slug}`,
    author: (autores.length ? autores : authors).map(a => ({ '@type': 'Person', name: a.politician?.name ?? a.author_name })),
    publisher: { '@type': 'GovernmentOrganization', name: SOURCE_LABELS[p.source] ?? p.source },
  }

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/proposicoes" className="hover:text-gray-600">Proposições</Link>
          <span>›</span>
          <span className="text-gray-600">{label}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
            {SOURCE_LABELS[p.source] ?? p.source}
          </span>
          {p.status && <span className={`text-[11px] border rounded-full px-2 py-0.5 ${statusTone(p.status)}`}>{p.status}</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{label}</h1>
        {info.desc && <p className="text-sm text-gray-500 mb-5"><span className="font-semibold text-gray-700">{info.name}</span> — {info.desc}</p>}

        {/* Ementa */}
        {p.summary && (
          <div className="border-l-4 border-[#00A859]/30 pl-4 mb-6">
            <p className="text-gray-700 leading-relaxed">{p.summary}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {fmtDate(p.presented_on) && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Apresentação</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{fmtDate(p.presented_on)}</div>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Casa</div>
            <div className="text-sm font-bold text-gray-800 mt-1">{SOURCE_LABELS[p.source]?.split(' ')[0] ?? p.source}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Autores</div>
            <div className="text-sm font-bold text-gray-800 mt-1">{authors.length}</div>
          </div>
          {(p.themes ?? []).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Temas</div>
              <div className="text-sm font-bold text-gray-800 mt-1">{(p.themes ?? []).length}</div>
            </div>
          )}
        </div>

        {/* Temas como chips */}
        {(p.themes ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {(p.themes ?? []).map(t => (
              <Link key={t} href={`/proposicoes?tema=${encodeURIComponent(t)}`}
                className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 hover:border-gray-400">
                {t}
              </Link>
            ))}
          </div>
        )}

        {/* Autoria */}
        {autores.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {autores.length > 1 ? 'Autores' : 'Autor'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {autores.map((a, i) => <AuthorChip key={i} a={a} />)}
            </div>
          </section>
        )}

        {coautores.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Coautores ({coautores.length})</h2>
            <div className="flex flex-wrap gap-2">
              {coautores.map((a, i) => <AuthorChip key={i} a={a} />)}
            </div>
          </section>
        )}

        {/* Partidos envolvidos */}
        {parties.size > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Partidos envolvidos</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(parties).map(([abbr, color]) => (
                <Link key={abbr} href={`/proposicoes?partido=${abbr.toLowerCase()}`}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border hover:opacity-80"
                  style={{ background: `${color}14`, color, borderColor: `${color}40` }}>
                  {abbr}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00A859] font-medium hover:underline">
              Ver no portal oficial →
            </a>
          )}
          <Link href="/aprenda/processo-legislativo" className="text-sm text-gray-500 hover:text-gray-700">
            Como uma lei é criada?
          </Link>
        </div>
      </div>
    </main>
  )
}
