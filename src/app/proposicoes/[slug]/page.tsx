import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import {
  getPropositionBySlug, formatPropositionLabel, typeInfo,
  SOURCE_LABELS, SOURCE_COLORS, statusTone,
} from '@/lib/propositions'
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

function PartyTag({ abbr, color }: { abbr: string; color: string | null }) {
  const c = color ?? '#6b7280'
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${c}1a`, color: c }}>
      {abbr}
    </span>
  )
}

/** Card de conexão do autor: foto + nome + cargo·UF + partido. */
function AuthorCard({ a }: { a: PropositionAuthor }) {
  const pol = a.politician
  const party = pol?.party
  const sub = [pol?.position?.name, pol?.state?.abbr].filter(Boolean).join(' · ')
  const body = (
    <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 hover:border-gray-400 transition-colors h-full">
      <Avatar name={pol?.name ?? a.author_name} photoUrl={pol?.photo_url ?? null} size={44} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate">{pol?.name ?? a.author_name}</span>
          {party?.abbr && <PartyTag abbr={party.abbr} color={party.color_hex} />}
        </div>
        {sub && <div className="text-xs text-gray-500 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  )
  return pol?.slug ? <Link href={`/politico/${pol.slug}`} className="block">{body}</Link> : body
}

/** Chip compacto p/ coautores. */
function CoauthorChip({ a }: { a: PropositionAuthor }) {
  const pol = a.politician
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-gray-700">{pol?.name ?? a.author_name}</span>
      {pol?.party?.abbr && <PartyTag abbr={pol.party.abbr} color={pol.party.color_hex} />}
    </span>
  )
  return pol?.slug
    ? <Link href={`/politico/${pol.slug}`} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1 hover:border-gray-400 transition-colors">{inner}</Link>
    : <span className="text-sm border border-gray-100 rounded-lg px-2.5 py-1 text-gray-500">{a.author_name}</span>
}

export default async function PropositionPage({ params }: { params: { slug: string } }) {
  const p = await getPropositionBySlug(params.slug)
  if (!p) notFound()

  const label = formatPropositionLabel(p)
  const info = typeInfo(p.type)
  const authors = p.authors ?? []
  const autores = authors.filter(a => a.role === 'autor')
  const coautores = authors.filter(a => a.role !== 'autor')
  const coautoresShown = coautores.slice(0, 40)
  const sourceColor = SOURCE_COLORS[p.source] ?? '#6b7280'

  // Partidos envolvidos (distintos) — logo + cor + slug, a partir dos autores casados
  const parties = new Map<string, { color: string | null; logo: string | null; slug: string }>()
  for (const a of authors) {
    const pt = a.politician?.party
    if (pt?.abbr && !parties.has(pt.abbr)) parties.set(pt.abbr, { color: pt.color_hex, logo: pt.logo_url ?? null, slug: pt.slug ?? pt.abbr.toLowerCase() })
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

        {/* Header: badges coloridas (casa = link) */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Link href={`/proposicoes?fonte=${p.source}`}
            className="text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 hover:opacity-80 transition-opacity"
            style={{ background: `${sourceColor}14`, color: sourceColor }}>
            {SOURCE_LABELS[p.source] ?? p.source}
          </Link>
          {p.status && <span className={`text-[11px] border rounded-full px-2 py-0.5 ${statusTone(p.status)}`}>{p.status}</span>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{label}</h1>
        {info.desc && <p className="text-sm text-gray-500 mb-5"><span className="font-semibold text-gray-700">{info.name}</span> — {info.desc}</p>}

        {/* Ementa */}
        {p.summary && (
          <div className="border-l-4 border-verde-100 pl-4 mb-6">
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

        {/* Autoria — cards de conexão */}
        {autores.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {autores.length > 1 ? 'Autores' : 'Autor'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {autores.map((a, i) => <AuthorCard key={i} a={a} />)}
            </div>
          </section>
        )}

        {coautores.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Coautores ({coautores.length})</h2>
            <div className="flex flex-wrap gap-2">
              {coautoresShown.map((a, i) => <CoauthorChip key={i} a={a} />)}
              {coautores.length > coautoresShown.length && (
                <span className="text-sm text-gray-400 px-2.5 py-1">+{coautores.length - coautoresShown.length} outros</span>
              )}
            </div>
          </section>
        )}

        {/* Partidos envolvidos — com logo */}
        {parties.size > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Partidos envolvidos</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(parties).map(([abbr, info2]) => {
                const c = info2.color ?? '#6b7280'
                return (
                  <Link key={abbr} href={`/proposicoes?partido=${info2.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border hover:opacity-80"
                    style={{ background: `${c}14`, color: c, borderColor: `${c}40` }}>
                    {info2.logo && <img src={info2.logo} alt={abbr} className="w-4 h-4 object-contain" />}
                    {abbr}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-verde-600 font-medium hover:underline">
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
