import Link from 'next/link'
import type { Metadata } from 'next'
import { listEmendas, emendaFacets, formatMoney, tipoGrupoLabel } from '@/lib/emendas'
import { STATES } from '@/lib/states'

export const metadata: Metadata = {
  title: 'Emendas Parlamentares — quem destinou e para onde — Aprenda Política',
  description: 'Emendas ao orçamento por autor, estado, município e função. Veja quanto cada parlamentar destinou e quanto sua cidade recebeu.',
}
export const revalidate = 3600

type PageProps = { searchParams: { ano?: string; uf?: string; funcao?: string; tipo?: string; q?: string; pagina?: string } }

export default async function EmendasPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.pagina ?? '1', 10) || 1)
  const [{ items, total }, { anos, funcoes }] = await Promise.all([
    listEmendas({ ...searchParams, page }),
    emendaFacets(),
  ])
  const pages = Math.ceil(total / 30)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Emendas Parlamentares</h1>
        <p className="text-gray-500 mb-6">{total.toLocaleString('pt-BR')} linhas de emenda — quem destinou verba do orçamento, para onde e quanto.</p>

        <form className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8" action="/emendas" method="get">
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
          {items.map(e => (
            <div key={e.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{tipoGrupoLabel(e.tipo_grupo)} · {e.ano}</span>
                {e.funcao && <span className="text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{e.funcao}</span>}
                <span className="ml-auto text-sm font-bold text-verde-600">{formatMoney(e.valor_pago)}<span className="text-[10px] text-gray-400 font-normal"> pago</span></span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                <span className="font-medium text-gray-900">{e.autor_nome ?? '—'}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">{e.localidade_raw ?? 'destino não informado'}</span>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400">Nenhuma emenda encontrada com esses filtros.</p>}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={`/emendas?${new URLSearchParams({ ...searchParams, pagina: String(page - 1) } as Record<string, string>)}`} className="text-gray-600 hover:text-gray-900">← Anterior</Link> : <span />}
            <span className="text-gray-400">Página {page} de {pages}</span>
            {page < pages ? <Link href={`/emendas?${new URLSearchParams({ ...searchParams, pagina: String(page + 1) } as Record<string, string>)}`} className="text-gray-600 hover:text-gray-900">Próxima →</Link> : <span />}
          </div>
        )}
      </div>
    </main>
  )
}
