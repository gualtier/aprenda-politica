import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { getTopic, TOPICS } from '@/lib/topics'
import { propositionsByTopic, topicStats, formatPropositionLabel, SOURCE_SHORT } from '@/lib/propositions'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = getTopic(params.slug)
  if (!t) return { title: 'Tema — Aprenda Política' }
  return {
    title: `Projetos de lei sobre ${t.label} — Aprenda Política`,
    description: `${t.tagline}. Veja as proposições, quem propõe e o que está em discussão sobre ${t.label.toLowerCase()}.`,
    alternates: { canonical: `${SITE_URL}/proposicoes/tema/${t.slug}` },
    openGraph: { title: `Projetos de lei sobre ${t.label}`, description: t.tagline, type: 'website' },
  }
}

export default async function TemaPage({ params, searchParams }: { params: { slug: string }; searchParams: { pagina?: string } }) {
  const t = getTopic(params.slug)
  if (!t) notFound()
  const page = Math.max(1, parseInt(searchParams.pagina ?? '1', 10) || 1)
  const [stats, { items, total }] = await Promise.all([topicStats(t.slug), propositionsByTopic(t.slug, page)])
  const pages = Math.ceil(total / 30)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: `Projetos de lei sobre ${t.label}`, about: t.label, inLanguage: 'pt-BR',
    url: `${SITE_URL}/proposicoes/tema/${t.slug}`,
  }

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/temas" className="hover:text-gray-600">Temas</Link><span>›</span>
          <span className="text-gray-600">{t.label}</span>
        </nav>

        <div className="flex items-center gap-4 mb-5">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${t.accent}14` }}>{t.emoji}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projetos de lei sobre {t.label}</h1>
            <p className="text-sm font-semibold" style={{ color: t.accent }}>{total.toLocaleString('pt-BR')} proposições</p>
          </div>
        </div>

        <div className="space-y-2 mb-8 text-gray-700 leading-relaxed">
          {t.intro.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat label="Proposições" value={total.toLocaleString('pt-BR')} accent={t.accent} />
          <Stat label="Na Câmara" value={stats.bySource.camara.toLocaleString('pt-BR')} accent={t.accent} />
          <Stat label="No Senado" value={stats.bySource.senado.toLocaleString('pt-BR')} accent={t.accent} />
          <Stat label="Tipo principal" value={stats.topTypes[0]?.type ?? '—'} accent={t.accent} />
        </div>

        {stats.topAuthors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Parlamentares mais ativos no tema</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stats.topAuthors.map(a => (
                <Link key={a.id} href={`/politico/${a.slug}`} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 hover:border-gray-400">
                  <Avatar name={a.name} photoUrl={a.photo_url} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm truncate">{a.name}</span>
                      {a.party_abbr && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${a.party_color ?? '#9ca3af'}1a`, color: a.party_color ?? '#6b7280' }}>{a.party_abbr}</span>}
                    </div>
                    <div className="text-xs text-gray-500">{a.n} proposições no tema</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {stats.topParties.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Partidos mais ativos</h2>
            <div className="flex flex-wrap gap-2">
              {stats.topParties.map(p => {
                const c = p.color ?? '#6b7280'
                return (
                  <Link key={p.id} href={`/proposicoes?partido=${p.slug ?? ''}&tema=${t.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border hover:opacity-80"
                    style={{ background: `${c}14`, color: c, borderColor: `${c}40` }}>
                    {p.logo && <img src={p.logo} alt={p.abbr} className="w-4 h-4 object-contain" />}
                    {p.abbr} · {p.n}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Exemplos do que vira proposta</h2>
          <ul className="space-y-1.5">
            {t.examples.map((e, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="mt-1" style={{ color: t.accent }}>•</span>{e}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Proposições</h2>
          <div className="space-y-3">
            {items.map(p => (
              <Link key={p.id} href={`/proposicoes/${p.slug}`} className="block border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{SOURCE_SHORT[p.source] ?? p.source}</span>
                  <span className="text-xs font-bold text-verde-500">{formatPropositionLabel(p)}</span>
                  {p.status && <span className="ml-auto text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 truncate max-w-[45%]">{p.status}</span>}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{p.title}</p>
              </Link>
            ))}
            {items.length === 0 && <p className="text-sm text-gray-400">Sem proposições classificadas neste tema ainda.</p>}
          </div>
          {pages > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              {page > 1 ? <Link href={`/proposicoes/tema/${t.slug}?pagina=${page - 1}`} className="text-gray-600 hover:text-gray-900">← Anterior</Link> : <span />}
              <span className="text-gray-400">Página {page} de {pages}</span>
              {page < pages ? <Link href={`/proposicoes/tema/${t.slug}?pagina=${page + 1}`} className="text-gray-600 hover:text-gray-900">Próxima →</Link> : <span />}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Veja também</h2>
          <div className="flex flex-wrap gap-2">
            {TOPICS.filter(o => o.slug !== t.slug).map(o => (
              <Link key={o.slug} href={`/proposicoes/tema/${o.slug}`} className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:border-gray-400">
                {o.emoji} {o.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-lg font-bold tabular-nums mt-0.5" style={{ color: accent }}>{value}</div>
    </div>
  )
}
