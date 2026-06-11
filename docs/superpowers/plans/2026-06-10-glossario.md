# Glossário — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Glossário de ~63 termos políticos em linguagem simples — hub `/glossario` (busca + A–Z + categorias) e landing SEO `/glossario/[termo]` com afinidades, temas do sistema e cross-links pro portal.

**Architecture:** Conteúdo 100% estático em `src/lib/glossario.ts` (padrão /aprenda, sem DB). Hub RSC com ilha client de busca (`GlossarioExplorer`). Página por termo via `generateStaticParams`. Integra `@/lib/topics` (chips de tema) e o sitemap (STATIC_PATHS).

**Tech Stack:** Next.js 14 App Router RSC, Tailwind (tokens do design system — zero hex em className), Vitest.

**Repo/branch:** `/Users/gualtieri/Apps/aprenda-politica`, criar branch `feat/glossario` a partir de `main`.

**Spec:** `docs/superpowers/specs/2026-06-10-glossario-design.md`

---

## File Structure

- `src/lib/glossario.ts` — dados (interface Termo, CATEGORIAS, TERMOS) + helpers (`getTermo`, `getCategoria`, `termosPorLetra`, `afins`, `vizinhos`).
- `src/lib/glossario.test.ts` — vitest: helpers + **testes de integridade** (slugs únicos, relacionados existem, temas existem em TOPICS).
- `src/components/glossario/GlossarioExplorer.tsx` — ilha client: busca + A–Z + chips de categoria + grid de cards.
- `src/app/glossario/page.tsx` — hub (RSC, estático).
- `src/app/glossario/[termo]/page.tsx` — landing do termo.
- `src/components/ui/Navbar.tsx` — **modificar**: grupo "Glossário" em APRENDA_GROUPS.
- `src/lib/sitemap.ts` — **modificar**: `/glossario` + termos em STATIC_PATHS.

---

## Task 1: Dados + helpers (`src/lib/glossario.ts`) — TDD

**Files:**
- Create: `src/lib/glossario.ts`
- Test: `src/lib/glossario.test.ts`

- [ ] **Step 0: Criar a branch**

```bash
cd /Users/gualtieri/Apps/aprenda-politica && git checkout main && git checkout -b feat/glossario
```

- [ ] **Step 1: Escrever os testes (falhando)**

```ts
// src/lib/glossario.test.ts
import { describe, it, expect } from 'vitest'
import { TERMOS, CATEGORIAS, getTermo, termosPorLetra, afins, vizinhos } from './glossario'
import { getTopic } from './topics'

describe('glossario', () => {
  it('tem ~60+ termos com slugs únicos', () => {
    expect(TERMOS.length).toBeGreaterThanOrEqual(55)
    expect(new Set(TERMOS.map(t => t.slug)).size).toBe(TERMOS.length)
  })
  it('getTermo resolve e retorna undefined p/ inexistente', () => {
    expect(getTermo('pec')?.termo).toBe('PEC')
    expect(getTermo('nao-existe')).toBeUndefined()
  })
  it('todo relacionado aponta pra um termo existente', () => {
    const slugs = new Set(TERMOS.map(t => t.slug))
    for (const t of TERMOS) for (const r of t.relacionados) {
      expect(slugs.has(r), `${t.slug} → relacionado inexistente: ${r}`).toBe(true)
      expect(r).not.toBe(t.slug)
    }
  })
  it('todo tema aponta pra um topic existente', () => {
    for (const t of TERMOS) for (const tema of t.temas ?? []) {
      expect(getTopic(tema), `${t.slug} → tema inexistente: ${tema}`).toBeDefined()
    }
  })
  it('toda categoria usada existe em CATEGORIAS', () => {
    const ids = new Set(CATEGORIAS.map(c => c.id))
    for (const t of TERMOS) expect(ids.has(t.categoria), `${t.slug}: ${t.categoria}`).toBe(true)
  })
  it('todo termo tem conteúdo completo', () => {
    for (const t of TERMOS) {
      expect(t.definicaoCurta.length, t.slug).toBeGreaterThan(20)
      expect(t.definicao.length, t.slug).toBeGreaterThanOrEqual(2)
      expect(t.exemplo.length, t.slug).toBeGreaterThan(20)
    }
  })
  it('afins completa até 6 com a mesma categoria, sem o próprio termo', () => {
    const pec = getTermo('pec')!
    const a = afins(pec)
    expect(a.length).toBeGreaterThanOrEqual(3)
    expect(a.length).toBeLessThanOrEqual(6)
    expect(a.some(x => x.slug === 'pec')).toBe(false)
    expect(new Set(a.map(x => x.slug)).size).toBe(a.length)
  })
  it('termosPorLetra agrupa ordenado', () => {
    const grupos = termosPorLetra()
    const letras = grupos.map(([l]) => l)
    expect([...letras].sort()).toEqual(letras)
  })
  it('vizinhos navega em ordem alfabética', () => {
    const { prev, next } = vizinhos(getTermo('pec')!)
    expect(prev || next).toBeDefined()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/glossario.test.ts` — Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar a estrutura + helpers**

```ts
// src/lib/glossario.ts
export const CATEGORIAS = [
  { id: 'processo-legislativo', label: 'Processo Legislativo', pill: 'bg-verde-600 text-white',     chip: 'bg-verde-50 text-verde-700' },
  { id: 'orcamento',            label: 'Orçamento',            pill: 'bg-amarelo-600 text-white',   chip: 'bg-amarelo-50 text-amarelo-600' },
  { id: 'eleicoes',             label: 'Eleições',             pill: 'bg-amarelo-500 text-gray-900',chip: 'bg-amarelo-50 text-amarelo-600' },
  { id: 'instituicoes',         label: 'Instituições',         pill: 'bg-esfera-federal text-white',chip: 'bg-gray-100 text-esfera-federal' },
  { id: 'justica',              label: 'Justiça',              pill: 'bg-gray-800 text-white',      chip: 'bg-gray-100 text-gray-700' },
  { id: 'participacao',         label: 'Participação',         pill: 'bg-verde-500 text-white',     chip: 'bg-verde-50 text-verde-600' },
] as const
export type CategoriaId = typeof CATEGORIAS[number]['id']
export const getCategoria = (id: string) => CATEGORIAS.find(c => c.id === id)

export interface Termo {
  slug: string
  termo: string
  nomeCompleto?: string
  categoria: CategoriaId
  definicaoCurta: string
  definicao: string[]
  exemplo: string
  relacionados: string[]
  temas?: string[]
  links?: { label: string; href: string }[]
}

export const TERMOS: Termo[] = [
  // … (Step 4: conteúdo)
]

const bySlug = new Map(TERMOS.map(t => [t.slug, t]))
export const getTermo = (slug: string): Termo | undefined => bySlug.get(slug)

const ordenados = () => [...TERMOS].sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))

export function termosPorLetra(termos: Termo[] = TERMOS): [string, Termo[]][] {
  const grupos = new Map<string, Termo[]>()
  for (const t of [...termos].sort((a, b) => a.termo.localeCompare(b.termo, 'pt-BR'))) {
    const letra = t.termo[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    if (!grupos.has(letra)) grupos.set(letra, [])
    grupos.get(letra)!.push(t)
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b))
}

/** Afinidade: relacionados curados + complemento da mesma categoria (sem dupes, sem o próprio), até max. */
export function afins(t: Termo, max = 6): Termo[] {
  const out: Termo[] = []
  const seen = new Set([t.slug])
  for (const r of t.relacionados) {
    const x = bySlug.get(r)
    if (x && !seen.has(x.slug)) { out.push(x); seen.add(x.slug) }
  }
  for (const x of TERMOS) {
    if (out.length >= max) break
    if (x.categoria === t.categoria && !seen.has(x.slug)) { out.push(x); seen.add(x.slug) }
  }
  return out.slice(0, max)
}

export function vizinhos(t: Termo): { prev?: Termo; next?: Termo } {
  const ord = ordenados()
  const i = ord.findIndex(x => x.slug === t.slug)
  return { prev: ord[i - 1], next: ord[i + 1] }
}
```

> Nota: o regex `[̀-ͯ]` contém o range literal de combining marks U+0300–U+036F (copiar exatamente, igual a `src/lib/topics.ts`).

- [ ] **Step 4: Escrever o conteúdo dos 63 termos**

Regras editoriais (valem pra TODOS): `definicao` = 2–3 parágrafos curtos (40–80 palavras cada), **linguagem simples, sem juridiquês**, tom factual e neutro (sem opinião); `exemplo` = 1 parágrafo concreto começando explicando uma situação real/típica; `definicaoCurta` = 1 frase (vai em card e meta description); `relacionados` = 2–4 slugs **desta lista** semanticamente próximos; `temas` = 0–2 slugs **da taxonomia de `@/lib/topics`** (só quando houver relação real); `links` = 0–3 itens apontando pra rotas reais do portal (`/proposicoes?tipo=PEC`, `/proposicoes`, `/emendas`, `/aprenda/emendas`, `/aprenda/processo-legislativo/*`, `/aprenda/cargos/*`, `/politicos?cargo=*`, `/temas`, `/partidos`).

**Lista completa (slug · termo · nomeCompleto?)** — categoria por bloco:

processo-legislativo (18): `pec` PEC (Proposta de Emenda à Constituição) · `pl` PL (Projeto de Lei) · `plp` PLP (Projeto de Lei Complementar) · `medida-provisoria` Medida Provisória (MP) · `pdl` PDL (Projeto de Decreto Legislativo) · `emenda-ao-projeto` Emenda (a um projeto) · `sancao` Sanção · `veto` Veto · `derrubada-de-veto` Derrubada de veto · `quorum` Quórum · `plenario` Plenário · `comissao` Comissão · `cpi` CPI (Comissão Parlamentar de Inquérito) · `relator` Relator · `tramitacao` Tramitação · `regime-de-urgencia` Regime de urgência · `casa-revisora` Casa revisora · `promulgacao` Promulgação

orcamento (10): `emenda-parlamentar` Emenda parlamentar · `emenda-individual` Emenda individual · `emenda-de-bancada` Emenda de bancada · `emenda-de-relator` Emenda de relator (RP9, "orçamento secreto") · `empenho` Empenho · `execucao-orcamentaria` Execução orçamentária · `loa` LOA (Lei Orçamentária Anual) · `ldo` LDO (Lei de Diretrizes Orçamentárias) · `orcamento-impositivo` Orçamento impositivo · `fpm` FPM (Fundo de Participação dos Municípios)

eleicoes (11): `coeficiente-eleitoral` Coeficiente eleitoral · `segundo-turno` Segundo turno · `suplente` Suplente · `filiacao-partidaria` Filiação partidária · `federacao-partidaria` Federação partidária · `fundo-eleitoral` Fundo eleitoral · `fundo-partidario` Fundo partidário · `inelegibilidade` Inelegibilidade · `voto-proporcional` Voto proporcional · `voto-majoritario` Voto majoritário · `janela-partidaria` Janela partidária

instituicoes (11): `congresso-nacional` Congresso Nacional · `camara-dos-deputados` Câmara dos Deputados · `senado-federal` Senado Federal · `mesa-diretora` Mesa Diretora · `bancada` Bancada · `lider-partidario` Líder partidário · `bloco-partidario` Bloco partidário · `base-governista` Base governista · `oposicao` Oposição · `legislatura` Legislatura · `mandato` Mandato

justica (7): `stf` STF (Supremo Tribunal Federal) · `stj` STJ (Superior Tribunal de Justiça) · `adi` ADI (Ação Direta de Inconstitucionalidade) · `adpf` ADPF (Arguição de Descumprimento de Preceito Fundamental) · `foro-privilegiado` Foro privilegiado · `transito-em-julgado` Trânsito em julgado · `habeas-corpus` Habeas corpus

participacao (6): `iniciativa-popular` Iniciativa popular · `plebiscito` Plebiscito · `referendo` Referendo · `audiencia-publica` Audiência pública · `lai` LAI (Lei de Acesso à Informação) · `controle-social` Controle social

**Padrão-ouro (seguir este nível de qualidade)** — 2 exemplos completos:

```ts
{
  slug: 'pec', termo: 'PEC', nomeCompleto: 'Proposta de Emenda à Constituição',
  categoria: 'processo-legislativo',
  definicaoCurta: 'Proposta que altera o texto da Constituição Federal — exige aprovação por 3/5 dos parlamentares, em dois turnos, na Câmara e no Senado.',
  definicao: [
    'A PEC é o instrumento usado para mudar a Constituição, a lei mais importante do país. Por mexer nas regras fundamentais, o caminho é mais difícil do que o de uma lei comum: são necessários 3/5 dos votos (308 deputados e 49 senadores), em dois turnos de votação em cada Casa.',
    'Nem tudo pode ser alterado por PEC: as chamadas cláusulas pétreas — como o voto direto e secreto, a separação dos Poderes e os direitos individuais — não podem ser abolidas.',
    'Depois de aprovada, a PEC é promulgada pelo próprio Congresso, sem sanção ou veto do presidente.',
  ],
  exemplo: 'Na prática: a PEC do teto de gastos (2016) limitou o crescimento das despesas públicas por 20 anos. Precisou passar duas vezes na Câmara e duas no Senado, sempre com pelo menos 3/5 dos votos.',
  relacionados: ['quorum', 'promulgacao', 'pl', 'casa-revisora'],
  temas: ['economia-impostos'],
  links: [
    { label: 'PECs em tramitação', href: '/proposicoes?tipo=PEC' },
    { label: 'Como uma lei é criada', href: '/aprenda/processo-legislativo' },
  ],
},
{
  slug: 'emenda-de-relator', termo: 'Emenda de relator', nomeCompleto: 'RP9 — o "orçamento secreto"',
  categoria: 'orcamento',
  definicaoCurta: 'Emenda ao orçamento feita pelo relator-geral, que ficou conhecida como "orçamento secreto" por distribuir verbas sem transparência sobre quem indicou.',
  definicao: [
    'O relator-geral do orçamento pode propor emendas para corrigir erros e ajustar o texto. Entre 2020 e 2022, esse instrumento (classificado como RP9) passou a ser usado para distribuir bilhões em verbas indicadas por parlamentares sem registro público de autoria — daí o apelido "orçamento secreto".',
    'Em dezembro de 2022, o STF declarou essa prática inconstitucional por ferir os princípios da transparência e da impessoalidade. Desde então, as emendas de relator nos moldes do RP9 deixaram de existir.',
  ],
  exemplo: 'Na prática: um município recebia recursos para obras sem que ninguém soubesse qual parlamentar havia indicado a verba — impossibilitando o eleitor de cobrar responsabilidade.',
  relacionados: ['emenda-parlamentar', 'emenda-individual', 'execucao-orcamentaria', 'loa'],
  temas: ['economia-impostos'],
  links: [
    { label: 'Emendas parlamentares (dados reais)', href: '/emendas' },
    { label: 'Guia: emendas parlamentares', href: '/aprenda/emendas' },
  ],
},
```

Escrever os 63 com esse padrão. Conferência factual: números institucionais (308/49, 3/5, prazos de MP 60+60 dias, 1% de assinaturas pra iniciativa popular etc.) devem estar corretos.

- [ ] **Step 5: Rodar testes e ver passar**

Run: `npx vitest run src/lib/glossario.test.ts` — Expected: PASS (9 testes). Os testes de integridade pegam qualquer relacionado/tema/categoria inválido.

- [ ] **Step 6: Typecheck + commit**

```bash
npx tsc --noEmit   # ignorar erros pré-existentes em src/tests/
git add src/lib/glossario.ts src/lib/glossario.test.ts
git commit -m "feat(glossario): dados (63 termos, 6 categorias) + helpers com testes de integridade"
```

---

## Task 2: Hub `/glossario` (+ ilha de busca)

**Files:**
- Create: `src/components/glossario/GlossarioExplorer.tsx`
- Create: `src/app/glossario/page.tsx`

- [ ] **Step 1: Ilha client**

```tsx
// src/components/glossario/GlossarioExplorer.tsx
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

  const letras = useMemo(() => [...new Set(termos.map(t => norm(t.termo)[0].toUpperCase()))].sort(), [termos])
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
```

> Se `[...new Set(...)]` disparar TS2802 (já aconteceu neste repo), usar `Array.from(new Set(...))`.

- [ ] **Step 2: Hub RSC**

```tsx
// src/app/glossario/page.tsx
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { TERMOS } from '@/lib/glossario'
import { GlossarioExplorer } from '@/components/glossario/GlossarioExplorer'

export const metadata: Metadata = {
  title: 'Glossário da política — termos explicados em linguagem simples — Aprenda Política',
  description: 'O que é PEC, quórum, medida provisória, emenda parlamentar? Glossário com os termos da política brasileira explicados sem juridiquês.',
}
export const revalidate = false

export default function GlossarioPage() {
  const termos = TERMOS.map(t => ({ slug: t.slug, termo: t.termo, nomeCompleto: t.nomeCompleto, categoria: t.categoria, definicaoCurta: t.definicaoCurta }))
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'DefinedTermSet',
    name: 'Glossário da política brasileira',
    url: 'https://aprendapolitica.com.br/glossario',
    hasDefinedTerm: TERMOS.map(t => ({ '@type': 'DefinedTerm', name: t.termo, description: t.definicaoCurta, url: `https://aprendapolitica.com.br/glossario/${t.slug}` })),
  }
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Glossário' }]} />
        <span className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mt-4">Educação política</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-2">Glossário da política</h1>
        <p className="text-gray-500 text-lg max-w-2xl mb-8">{TERMOS.length} termos do dia a dia da política explicados em linguagem simples — sem juridiquês.</p>
        <GlossarioExplorer termos={termos} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}
```

- [ ] **Step 3: Verificar** — `npx tsc --noEmit` limpo; com dev server: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/glossario` → 200.

- [ ] **Step 4: Commit**

```bash
git add src/components/glossario/ src/app/glossario/page.tsx
git commit -m "feat(glossario): hub /glossario com busca instantânea, A–Z e categorias"
```

---

## Task 3: Página do termo `/glossario/[termo]`

**Files:**
- Create: `src/app/glossario/[termo]/page.tsx`

- [ ] **Step 1: Implementar**

```tsx
// src/app/glossario/[termo]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { TERMOS, getTermo, getCategoria, afins, vizinhos } from '@/lib/glossario'
import { getTopic } from '@/lib/topics'

interface PageProps { params: { termo: string } }

export function generateStaticParams() {
  return TERMOS.map(t => ({ termo: t.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = getTermo(params.termo)
  if (!t) return {}
  return {
    title: `O que é ${t.termo}? — Glossário — Aprenda Política`,
    description: t.definicaoCurta,
  }
}

export default function TermoPage({ params }: PageProps) {
  const t = getTermo(params.termo)
  if (!t) notFound()
  const cat = getCategoria(t.categoria)
  const relacionados = afins(t)
  const { prev, next } = vizinhos(t)
  const temas = (t.temas ?? []).map(s => getTopic(s)).filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'DefinedTerm',
    name: t.termo, alternateName: t.nomeCompleto, description: t.definicaoCurta,
    url: `https://aprendapolitica.com.br/glossario/${t.slug}`,
    inDefinedTermSet: 'https://aprendapolitica.com.br/glossario',
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: 'Brasil', href: '/' }, { label: 'Glossário', href: '/glossario' }, { label: t.termo }]} />

        <div className="mt-4 mb-6">
          {cat && <span className={`inline-flex text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 mb-3 ${cat.pill}`}>{cat.label}</span>}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{t.termo}</h1>
          {t.nomeCompleto && <p className="text-lg text-gray-500 mt-1">{t.nomeCompleto}</p>}
        </div>

        <div className="space-y-4 mb-6">
          {t.definicao.map((p, i) => <p key={i} className="text-gray-700 leading-relaxed">{p}</p>)}
        </div>

        <div className="bg-verde-50 border border-verde-100 rounded-2xl p-5 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-verde-700 mb-1.5">Na prática</div>
          <p className="text-sm text-gray-700 leading-relaxed">{t.exemplo}</p>
        </div>

        {temas.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Temas relacionados</h2>
            <div className="flex flex-wrap gap-2">
              {temas.map(tp => tp && (
                <Link key={tp.slug} href={`/proposicoes/tema/${tp.slug}`}
                  className="text-xs font-medium rounded-full px-3 py-1.5 border hover:opacity-80 transition"
                  style={{ background: `${tp.accent}14`, color: tp.accent, borderColor: `${tp.accent}33` }}>
                  {tp.emoji} {tp.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {(t.links?.length ?? 0) > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Veja no portal</h2>
            <div className="flex flex-wrap gap-2">
              {t.links!.map(l => (
                <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 text-sm font-medium text-verde-600 border border-verde-100 bg-verde-50 rounded-full px-3.5 py-1.5 hover:bg-verde-100 transition-colors">
                  {l.label} →
                </Link>
              ))}
            </div>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="border-t border-gray-100 pt-6 mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Termos com afinidade</h2>
            <div className="flex flex-wrap gap-2">
              {relacionados.map(r => (
                <Link key={r.slug} href={`/glossario/${r.slug}`} className="text-sm font-medium text-gray-700 border border-gray-200 rounded-full px-3.5 py-1.5 hover:border-verde-500 hover:text-verde-600 transition-colors">
                  {r.termo}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-5">
          {prev ? <Link href={`/glossario/${prev.slug}`} className="text-gray-500 hover:text-gray-900">← {prev.termo}</Link> : <span />}
          {next ? <Link href={`/glossario/${next.slug}`} className="text-verde-600 font-medium hover:underline">{next.termo} →</Link> : <span />}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}

export const revalidate = false
```

- [ ] **Step 2: Verificar** — tsc limpo; `curl http://localhost:3002/glossario/pec` → 200 com "Na prática"; `/glossario/nao-existe` → 404.

- [ ] **Step 3: Commit**

```bash
git add "src/app/glossario/[termo]/page.tsx"
git commit -m "feat(glossario): página do termo (definição, Na prática, temas, portal, afins, JSON-LD)"
```

---

## Task 4: Navbar + Sitemap

**Files:**
- Modify: `src/components/ui/Navbar.tsx` (array `APRENDA_GROUPS`)
- Modify: `src/lib/sitemap.ts` (array `STATIC_PATHS`)

- [ ] **Step 1: Navbar** — em `APRENDA_GROUPS`, **adicionar** o grupo Glossário ao final do array (após o grupo de Emendas Parlamentares, que fica como está):

```ts
  {
    href: '/glossario', label: 'Glossário',
    children: [
      { href: '/glossario/pec', label: 'PEC' },
      { href: '/glossario/medida-provisoria', label: 'Medida Provisória' },
      { href: '/glossario/cpi', label: 'CPI' },
      { href: '/glossario/quorum', label: 'Quórum' },
      { href: '/glossario/emenda-parlamentar', label: 'Emenda Parlamentar' },
      { href: '/glossario/sancao', label: 'Sanção' },
      { href: '/glossario/coeficiente-eleitoral', label: 'Coeficiente Eleitoral' },
    ],
  },
```

(Manter o grupo de Emendas como está — só ADICIONAR o novo grupo após ele.)

- [ ] **Step 2: Sitemap** — em `src/lib/sitemap.ts`: adicionar o import `import { TERMOS } from '@/lib/glossario'` (junto ao import de TOPICS) e, dentro de `STATIC_PATHS`, adicionar ao final:

```ts
  '/glossario',
  ...TERMOS.map(t => `/glossario/${t.slug}`),
```

- [ ] **Step 3: Verificar** — tsc limpo; `curl -s http://localhost:3002/sitemaps-v2/0.xml | grep -c glossario` ≥ 60 (chunk 0 = estáticos); navbar mostra "Glossário" no mega menu Aprenda Política.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Navbar.tsx src/lib/sitemap.ts
git commit -m "feat(glossario): grupo no mega menu Aprenda Política + termos no sitemap"
```

---

## Verificação final

1. `npx vitest run src/lib/glossario.test.ts` — 9/9.
2. `npx tsc --noEmit` — 0 erros novos.
3. Dev server: `/glossario` (busca filtra, A–Z e categorias funcionam), `/glossario/pec` (todas as seções), `/glossario/emenda-de-relator` (links pro /emendas), 404 em slug inválido.
4. Mega menu Aprenda Política com grupo Glossário.
5. Merge `feat/glossario` → main (deploy) via superpowers:finishing-a-development-branch.
