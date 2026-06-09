import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getOrganogramData } from '@/lib/supabase/queries'
import { emendasByMunicipality, formatMoney } from '@/lib/emendas'
import { Organogram } from '@/components/organogram/Organogram'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface PageProps {
  params: { estado: string; municipio: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getOrganogramData(params.estado, params.municipio)
  if (!data) return {}
  const name = data.municipality?.name ?? data.state.name
  return {
    title: `${name} — Aprenda Política`,
    description: `Organograma político de ${name}: prefeito, vereadores, governador, deputados e senadores.`,
  }
}

export default async function MunicipioPage({ params }: PageProps) {
  const data = await getOrganogramData(params.estado, params.municipio)
  if (!data) notFound()

  const municipioName = data.municipality?.name ?? data.state.name
  const population = data.municipality?.population

  const muniEmendas = data.municipality?.id ? await emendasByMunicipality(data.municipality.id) : null

  const prefeito = data.municipal?.executive[0] ?? null
  const governador = data.estadual?.executive[0] ?? null
  const vereadoresCount = data.municipal?.legislative.length ?? 0
  const depFederaisCount = data.federal.legislative.camara.length
  const depEstaduaisCount = data.estadual.legislative.length
  const senadoresCount = data.federal.legislative.senado.length

  // Ordem por esfera: municipal → estadual → federal
  const stats = [
    population ? { label: 'Habitantes', value: population.toLocaleString('pt-BR'), esfera: null } : null,
    vereadoresCount > 0 ? { label: 'Vereadores', value: vereadoresCount.toLocaleString('pt-BR'), esfera: 'municipal' } : null,
    depEstaduaisCount > 0 ? { label: 'Dep. Estaduais', value: depEstaduaisCount.toLocaleString('pt-BR'), esfera: 'estadual' } : null,
    depFederaisCount > 0 ? { label: 'Dep. Federais', value: depFederaisCount.toLocaleString('pt-BR'), esfera: 'federal' } : null,
    senadoresCount > 0 ? { label: 'Senadores', value: senadoresCount.toLocaleString('pt-BR'), esfera: 'federal' } : null,
  ].filter(Boolean) as { label: string; value: string; esfera: string | null }[]

  const ESF_STYLE: Record<string, { text: string; border: string }> = {
    municipal: { text: 'text-esfera-municipal', border: 'border-l-esfera-municipal' },
    estadual:  { text: 'text-esfera-estadual',  border: 'border-l-esfera-estadual' },
    federal:   { text: 'text-esfera-federal',   border: 'border-l-esfera-federal' },
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: municipioName,
    description: `Organograma político de ${municipioName}`,
    url: `https://aprendapolitica.com.br/${params.estado}/${params.municipio}`,
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <Breadcrumb items={[
          { label: 'Brasil', href: '/' },
          { label: data.state.name, href: `/${params.estado}` },
          { label: municipioName },
        ]} />

        <div className="mt-3 mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{municipioName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.state.name}</p>
        </div>

        {/* Stats strip — cor por esfera (municipal → federal) */}
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            {stats.map(s => {
              const esf = s.esfera ? ESF_STYLE[s.esfera] : null
              return (
                <div key={s.label} className={`border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 min-w-[90px] ${esf ? `border-l-4 ${esf.border}` : ''}`}>
                  <div className={`text-xl font-bold tabular-nums ${esf ? esf.text : 'text-gray-900'}`}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              )
            })}
          </div>
        )}

        {muniEmendas && muniEmendas.totalPago > 0 && (
          <section className="mb-6 border border-gray-200 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Emendas recebidas</h2>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-2 mb-4">
              <div>
                <div className="text-2xl font-bold text-verde-600 tabular-nums">{formatMoney(muniEmendas.totalPago)}</div>
                <div className="text-xs text-gray-500">em emendas pagas ({muniEmendas.count} linhas)</div>
              </div>
            </div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Quem destinou</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {muniEmendas.topAutores.map((a, i) => {
                const inner = (
                  <div className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl p-2.5">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-sm text-gray-900 truncate">{a.name}</span>
                      {a.party_abbr && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${a.party_color ?? '#9ca3af'}1a`, color: a.party_color ?? '#6b7280' }}>{a.party_abbr}</span>}
                    </span>
                    <span className="text-sm font-semibold text-verde-600 shrink-0">{formatMoney(a.pago)}</span>
                  </div>
                )
                return a.slug ? <Link key={i} href={`/politico/${a.slug}`} className="block hover:opacity-90">{inner}</Link> : <div key={i}>{inner}</div>
              })}
            </div>
          </section>
        )}

        {/* Key executives */}
        {(prefeito || governador) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {prefeito && (
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(204,153,0,0.12)' }}>
                  <svg className="w-4 h-4" style={{ color: '#CC9900' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Prefeito</div>
                  <div className="text-sm font-semibold text-gray-800 leading-tight">
                    {prefeito.name}
                    {prefeito.party?.abbr && (
                      <span className="font-normal text-gray-400"> · {prefeito.party.abbr}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {governador && (
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,122,48,0.12)' }}>
                  <svg className="w-4 h-4" style={{ color: '#007A30' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Governador</div>
                  <div className="text-sm font-semibold text-gray-800 leading-tight">
                    {governador.name}
                    {governador.party?.abbr && (
                      <span className="font-normal text-gray-400"> · {governador.party.abbr}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Organogram data={data} />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  )
}

export async function generateStaticParams() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: states } = await supabase
    .from('states').select('id, slug').eq('abbr', 'ES')

  const params: { estado: string; municipio: string }[] = []

  for (const state of states ?? []) {
    const { data: municipalities } = await supabase
      .from('municipalities')
      .select('slug')
      .eq('state_id', state.id)

    for (const m of municipalities ?? []) {
      params.push({ estado: state.slug, municipio: m.slug })
    }
  }

  return params
}

export const revalidate = 86400
