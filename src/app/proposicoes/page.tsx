import Link from 'next/link'
import type { Metadata } from 'next'
import { listPropositions, propositionFacets, formatPropositionLabel } from '@/lib/propositions'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Proposições — Aprenda Política',
  description: 'Projetos de lei, PECs e outras proposições — por tipo, tema, partido e autor.',
}
export const revalidate = 3600

type PageProps = {
  searchParams: { tipo?: string; tema?: string; partido?: string; fonte?: string; autor?: string; q?: string; pagina?: string }
}

export default async function ProposicoesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.pagina ?? '1', 10) || 1)
  const [{ items, total }, { types }, { data: parties }] = await Promise.all([
    listPropositions({ ...searchParams, page }),
    propositionFacets(),
    createServerSupabaseClient().from('parties').select('abbr, slug').order('abbr'),
  ])
  const pageSize = 30
  const pages = Math.ceil(total / pageSize)

  const qs = (patch: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...searchParams, ...patch }
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v))
    return `/proposicoes?${sp.toString()}`
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Proposições</h1>
        <p className="text-gray-500 mb-8">{total.toLocaleString('pt-BR')} proposições do mandato atual.</p>

        <form className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" action="/proposicoes" method="get">
          <input name="q" defaultValue={searchParams.q} placeholder="Buscar por texto ou número"
            className="col-span-2 sm:col-span-4 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <select name="tipo" defaultValue={searchParams.tipo ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos os tipos</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="partido" defaultValue={searchParams.partido ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos os partidos</option>
            {(parties ?? []).filter(p => p.slug).map(p => <option key={p.slug} value={p.slug!}>{p.abbr}</option>)}
          </select>
          <select name="fonte" defaultValue={searchParams.fonte ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todas as casas</option>
            <option value="camara">Câmara</option>
            <option value="senado">Senado</option>
            <option value="ales">Assembleia ES</option>
          </select>
          <button type="submit" className="bg-[#00A859] text-white rounded-lg px-3 py-2 text-sm font-medium">Filtrar</button>
        </form>

        <div className="space-y-3">
          {items.map(p => (
            <Link key={p.id} href={`/proposicoes/${p.slug}`} className="block border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#00A859]">{formatPropositionLabel(p)}</span>
                {p.status && <span className="text-[10px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{p.status}</span>}
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{p.title}</p>
            </Link>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400">Nenhuma proposição encontrada com esses filtros.</p>}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={qs({ pagina: page - 1 })} className="text-gray-600 hover:text-gray-900">← Anterior</Link> : <span />}
            <span className="text-gray-400">Página {page} de {pages}</span>
            {page < pages ? <Link href={qs({ pagina: page + 1 })} className="text-gray-600 hover:text-gray-900">Próxima →</Link> : <span />}
          </div>
        )}
      </div>
    </main>
  )
}
