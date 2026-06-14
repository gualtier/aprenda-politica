import Link from 'next/link'
import type { Metadata } from 'next'
import { listEmendas, emendaFacets, formatMoney, tipoGrupoLabel, tipoGrupoColor, funcaoToTema, emendaTemaSlugs } from '@/lib/emendas'
import { getTopic } from '@/lib/topics'
import { STATES } from '@/lib/states'
import { Avatar } from '@/components/ui/Avatar'
import { Fonte } from '@/components/ui/Fonte'

export const metadata: Metadata = {
  title: 'Emendas Parlamentares — quem destinou e para onde — Aprenda Política',
  description: 'Emendas ao orçamento por autor, estado, município e função. Veja quanto cada parlamentar destinou e quanto sua cidade recebeu.',
}
export const revalidate = 3600

type PageProps = { searchParams: { ano?: string; uf?: string; funcao?: string; tipo?: string; q?: string; tema?: string; pagina?: string } }

export default async function EmendasPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.pagina ?? '1', 10) || 1)
  const [{ items, total }, { anos, funcoes }] = await Promise.all([
    listEmendas({ ...searchParams, page }),
    emendaFacets(),
  ])
  const pages = Math.ceil(total / 30)

  const qs = (patch: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...searchParams, ...patch }
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v))
    return `/emendas?${sp.toString()}`
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Emendas Parlamentares</h1>
        <p className="text-gray-500 mb-5">{total.toLocaleString('pt-BR')} linhas de emenda — quem destinou verba do orçamento, para onde e quanto.</p>

        {/* Quick-filtros por tema (a partir da função orçamentária) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href={qs({ tema: undefined, pagina: undefined })}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border transition ${searchParams.tema ? 'border-gray-200 text-gray-600 hover:border-gray-400' : 'bg-gray-900 text-white border-gray-900'}`}>
            Todos
          </Link>
          {emendaTemaSlugs().map(slug => {
            const t = getTopic(slug)
            if (!t) return null
            const active = searchParams.tema === slug
            return (
              <Link key={slug} href={qs({ tema: slug, pagina: undefined })}
                className="text-xs font-medium rounded-full px-3 py-1.5 border hover:opacity-80 transition"
                style={active
                  ? { background: t.accent, color: '#fff', borderColor: t.accent }
                  : { background: `${t.accent}14`, color: t.accent, borderColor: `${t.accent}33` }}>
                {t.emoji} {t.label}
              </Link>
            )
          })}
        </div>

        <form className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8" action="/emendas" method="get">
          <input type="hidden" name="tema" value={searchParams.tema ?? ''} />
          <input name="q" defaultValue={searchParams.q} placeholder="Autor" className="col-span-2 sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <select name="ano" defaultValue={searchParams.ano ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todo ano</option>
            {anos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select name="uf" defaultValue={searchParams.uf ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Toda UF</option>
            {STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.abbr}</option>)}
          </select>
          <select name="funcao" defaultValue={searchParams.funcao ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Toda função</option>
            {funcoes.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select name="tipo" defaultValue={searchParams.tipo ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todo tipo</option>
            <option value="individual">Individual</option>
            <option value="bancada">De bancada</option>
            <option value="comissao">De comissão</option>
            <option value="relator">De relator</option>
          </select>
          <button type="submit" className="bg-verde-500 text-white rounded-lg px-3 py-2 text-sm font-medium">Filtrar</button>
        </form>

        <div className="space-y-3">
          {items.map(e => {
            const tc = tipoGrupoColor(e.tipo_grupo)
            const tema = funcaoToTema(e.funcao)
            const pct = e.valor_empenhado > 0 ? Math.min(100, Math.round((e.valor_pago / e.valor_empenhado) * 100)) : null
            const tipoDesc = e.tipo?.includes(' - ') ? e.tipo.split(' - ').slice(1).join(' - ') : null
            return (
              <div key={e.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5" style={{ background: `${tc}14`, color: tc }}>{tipoGrupoLabel(e.tipo_grupo)}</span>
                  <span className="text-[11px] text-gray-400">{e.ano}{e.numero ? ` · nº ${e.numero}` : ''}</span>
                  {e.funcao && (tema
                    ? <Link href={`/proposicoes/tema/${tema}`} className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 hover:border-gray-400">{e.funcao}</Link>
                    : <span className="text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{e.funcao}</span>)}
                  {e.subfuncao && <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">{e.subfuncao}</span>}
                  <span className="ml-auto text-right">
                    <span className="text-base font-bold text-verde-600">{formatMoney(e.valor_pago)}</span>
                    <span className="text-[10px] text-gray-400 font-normal"> pago</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm mb-2">
                  {e.politician?.slug
                    ? <Link href={`/politico/${e.politician.slug}`} className="font-semibold text-gray-900 hover:text-verde-600 inline-flex items-center gap-1.5">
                        <Avatar name={e.autor_nome ?? ''} photoUrl={e.politician.photo_url} size={26} />
                        {e.autor_nome}
                        {e.politician.party?.abbr && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${e.politician.party.color_hex ?? '#9ca3af'}1a`, color: e.politician.party.color_hex ?? '#6b7280' }}>{e.politician.party.abbr}</span>}
                      </Link>
                    : <span className="font-semibold text-gray-900 inline-flex items-center gap-1.5">
                        <span className="w-[26px] h-[26px] rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0">🏛️</span>
                        {e.autor_nome ?? '—'}
                      </span>}
                  <span className="text-gray-300">→</span>
                  {e.municipality?.slug && e.municipality.state?.slug
                    ? <Link href={`/${e.municipality.state.slug}/${e.municipality.slug}`} className="text-gray-600 hover:text-verde-600 font-medium">{e.municipality.name}-{e.uf}</Link>
                    : <span className="text-gray-500">{e.localidade_raw ?? 'destino não informado'}</span>}
                  {tipoDesc && <span className="text-[11px] text-gray-400 basis-full sm:basis-auto">· {tipoDesc}</span>}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] mb-1">
                    <span className="text-gray-400">Empenhado <b className="text-gray-700 font-semibold">{formatMoney(e.valor_empenhado)}</b></span>
                    <span className="text-gray-400">Liquidado <b className="text-gray-700 font-semibold">{formatMoney(e.valor_liquidado)}</b></span>
                    <span className="text-gray-400">Pago <b className="text-verde-600 font-semibold">{formatMoney(e.valor_pago)}</b></span>
                    {pct !== null && <span className="ml-auto text-gray-400 font-medium">{pct}% executado</span>}
                  </div>
                  {pct !== null && (
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 100 ? '#009C3B' : '#00A859' }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {items.length === 0 && <p className="text-sm text-gray-400">Nenhuma emenda encontrada com esses filtros.</p>}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={`/emendas?${new URLSearchParams({ ...searchParams, pagina: String(page - 1) } as Record<string, string>)}`} className="text-gray-600 hover:text-gray-900">← Anterior</Link> : <span />}
            <span className="text-gray-400">Página {page} de {pages}</span>
            {page < pages ? <Link href={`/emendas?${new URLSearchParams({ ...searchParams, pagina: String(page + 1) } as Record<string, string>)}`} className="text-gray-600 hover:text-gray-900">Próxima →</Link> : <span />}
          </div>
        )}

        <Fonte variant="bloco" className="mt-8" sources={[{ fonte: 'transparencia' }]} />
      </div>
    </main>
  )
}
