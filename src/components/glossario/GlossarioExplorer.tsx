'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CATEGORIAS, getCategoria } from '@/lib/glossario'

export interface TermoCard { slug: string; termo: string; nomeCompleto?: string; categoria: string; definicaoCurta: string }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function GlossarioExplorer({ termos }: { termos: TermoCard[] }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  const [letra, setLetra] = useState<string | null>(null)

  const letras = useMemo(() => Array.from(new Set(termos.map(t => norm(t.termo)[0].toUpperCase()))).sort(), [termos])
  const filtrados = useMemo(() => {
    let list = [...termos].sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))
    if (cat) list = list.filter(t => t.categoria === cat)
    if (letra) list = list.filter(t => norm(t.termo)[0].toUpperCase() === letra)
    if (q.trim()) { const nq = norm(q); list = list.filter(t => norm(`${t.termo} ${t.nomeCompleto ?? ''} ${t.definicaoCurta}`).includes(nq)) }
    return list
  }, [termos, q, cat, letra])

  return (
    <div>
      <input
        value={q} onChange={e => { setQ(e.target.value); setLetra(null) }}
        placeholder="Buscar termo… (ex: PEC, quórum, empenho)"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-verde-500/30 focus:border-verde-500"
      />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button onClick={() => setCat(null)} className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${!cat ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>Todas</button>
        {CATEGORIAS.map(c => (
          <button key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${cat === c.id ? c.pill + ' border-transparent' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mb-6">
        {letras.map(l => (
          <button key={l} onClick={() => setLetra(letra === l ? null : l)}
            className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors ${letra === l ? 'bg-verde-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtrados.map(t => {
          const c = getCategoria(t.categoria)
          return (
            <Link key={t.slug} href={`/glossario/${t.slug}`} className="group border border-gray-200 rounded-2xl p-4 hover:border-verde-500 transition-colors flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-gray-900 group-hover:text-verde-600 leading-tight">{t.termo}</h3>
                {c && <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${c.chip}`}>{c.label}</span>}
              </div>
              {t.nomeCompleto && <div className="text-xs text-gray-400 mb-1">{t.nomeCompleto}</div>}
              <p className="text-sm text-gray-500 line-clamp-3">{t.definicaoCurta}</p>
            </Link>
          )
        })}
        {filtrados.length === 0 && <p className="text-sm text-gray-400 col-span-full">Nenhum termo encontrado.</p>}
      </div>
    </div>
  )
}
