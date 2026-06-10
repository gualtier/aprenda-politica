import Link from 'next/link'
import type { Metadata } from 'next'
import { TOPICS } from '@/lib/topics'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { emendasTotaisPorTema, formatMoney } from '@/lib/emendas'

export const metadata: Metadata = {
  title: 'Temas — o que o Congresso propõe sobre cada assunto — Aprenda Política',
  description: 'Projetos de lei e propostas por tema: saúde, educação, segurança, meio ambiente, trabalho e mais.',
}
export const revalidate = 3600

async function counts(): Promise<Record<string, number>> {
  const supabase = createServerSupabaseClient()
  const entries = await Promise.all(TOPICS.map(async t => {
    const { count } = await supabase.from('propositions').select('id', { count: 'exact', head: true }).contains('topics', [t.slug])
    return [t.slug, count ?? 0] as const
  }))
  return Object.fromEntries(entries)
}

export default async function TemasPage() {
  const [c, em] = await Promise.all([counts(), emendasTotaisPorTema()])
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Proposições por assunto</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">O que o Congresso propõe sobre…</h1>
        <p className="text-gray-500 text-lg max-w-2xl mb-10">Escolha um tema e veja os projetos de lei, quem propõe e o que está em discussão.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map(t => {
            const e = em[t.slug]
            return (
              <Link key={t.slug} href={`/proposicoes/tema/${t.slug}`}
                className="group border border-gray-200 rounded-2xl p-5 hover:border-gray-400 hover:shadow-sm transition flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${t.accent}14` }}>{t.emoji}</span>
                  <div>
                    <h2 className="font-bold text-gray-900 leading-tight">{t.label}</h2>
                    <span className="text-xs font-semibold" style={{ color: t.accent }}>{(c[t.slug] ?? 0).toLocaleString('pt-BR')} proposições</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex-1">{t.tagline}</p>
                {e?.pago ? (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span className="font-semibold text-verde-600">{formatMoney(e.pago)}</span> em emendas · {e.n.toLocaleString('pt-BR')} linhas
                  </div>
                ) : null}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
