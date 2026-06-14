# Fontes & Proveniência (Parte 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Todo objeto do sistema cita sua fonte de dados de forma consistente, via um registro estático de fontes e um componente `<Fonte>` reutilizável.

**Architecture:** Registro estático (`src/lib/fontes.ts`) + componente de apresentação (`src/components/ui/Fonte.tsx`, generaliza o `SourceTag`) + fiação por objeto usando os campos `source`/`url`/`updated_at` já existentes. Sem migração de schema.

**Tech Stack:** Next.js 14 App Router (RSC), Tailwind (tokens do design system, zero hex em className), Vitest. Logos via favicon (`google.com/s2/favicons`).

**Spec:** `docs/superpowers/specs/2026-06-12-fontes-proveniencia-design.md`

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/fontes.ts` | Registro estático de fontes + helpers (`getFonte`, `fonteLogo`, `hrefFor`) |
| `src/lib/fontes.test.ts` | Testes de integridade do registro |
| `src/components/ui/Fonte.tsx` | Componente de apresentação (badge/bloco, multi-fonte, atribuição) |
| `src/app/politico/[slug]/page.tsx` | Fiação: bloco de fonte no perfil (corrige TSE sem link) |
| `src/app/proposicoes/[slug]/page.tsx` | Fiação: bloco de fonte na proposição |
| `src/app/emendas/page.tsx` | Fiação: fonte Portal da Transparência |
| `src/app/noticias/[slug]/page.tsx`, `src/components/news/NewsCard.tsx` | Migrar `SourceTag` → `<Fonte variant="badge">` |
| `src/app/partidos/[slug]/page.tsx`, `src/app/estados/[slug]/page.tsx` (ou `[slug]`), `src/app/glossario/[termo]/page.tsx` | Fiação: blocos de fonte |

---

## Task 1: Registro de fontes (`src/lib/fontes.ts`)

**Files:**
- Create: `src/lib/fontes.ts`
- Test: `src/lib/fontes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/fontes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { FONTES, getFonte, fonteLogo, type FonteId } from './fontes'

describe('fontes', () => {
  it('toda fonte tem nome e licenca', () => {
    for (const [id, f] of Object.entries(FONTES)) {
      expect(f.nome, `${id} sem nome`).toBeTruthy()
      expect(f.licenca, `${id} sem licenca`).toBeTruthy()
    }
  })
  it('getFonte resolve ids conhecidos', () => {
    expect(getFonte('tse').sigla).toBe('TSE')
    expect(getFonte('camara').nome).toContain('Câmara')
  })
  it('fonteLogo retorna favicon p/ domain e null sem domain', () => {
    expect(fonteLogo('tse.jus.br')).toContain('s2/favicons')
    expect(fonteLogo(undefined)).toBeNull()
  })
  it('hrefFor gera URL http(s) válida quando definido', () => {
    const camara = getFonte('camara')
    expect(camara.hrefFor?.('220530')).toMatch(/^https:\/\/.+220530/)
    const editorial = getFonte('editorial')
    expect(editorial.hrefFor).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/fontes.test.ts`
Expected: FAIL — "Cannot find module './fontes'"

- [ ] **Step 3: Write the implementation**

Create `src/lib/fontes.ts`:

```ts
export type FonteId =
  | 'tse' | 'camara' | 'senado' | 'transparencia' | 'ibge'
  | 'osm' | 'editorial' | 'veiculo' | 'wikidata' | 'commons'

export interface FonteDef {
  id: FonteId
  nome: string
  sigla?: string
  domain?: string
  licenca: string
  hrefFor?: (extId: string | null) => string | null
}

export const FONTES: Record<FonteId, FonteDef> = {
  tse: {
    id: 'tse', nome: 'Tribunal Superior Eleitoral', sigla: 'TSE',
    domain: 'tse.jus.br', licenca: 'Dados públicos',
    hrefFor: () => 'https://www.tse.jus.br',
  },
  camara: {
    id: 'camara', nome: 'Câmara dos Deputados', sigla: 'Câmara',
    domain: 'camara.leg.br', licenca: 'Dados abertos',
    hrefFor: (id) => id ? `https://www.camara.leg.br/deputados/${id}` : null,
  },
  senado: {
    id: 'senado', nome: 'Senado Federal', sigla: 'Senado',
    domain: 'senado.leg.br', licenca: 'Dados abertos',
    hrefFor: (id) => id ? `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${id}` : null,
  },
  transparencia: {
    id: 'transparencia', nome: 'Portal da Transparência', sigla: 'CGU',
    domain: 'portaldatransparencia.gov.br', licenca: 'Dados públicos',
    hrefFor: () => 'https://portaldatransparencia.gov.br/emendas',
  },
  ibge: {
    id: 'ibge', nome: 'IBGE', sigla: 'IBGE',
    domain: 'ibge.gov.br', licenca: 'Dados públicos',
    hrefFor: () => 'https://www.ibge.gov.br',
  },
  osm: {
    id: 'osm', nome: 'OpenStreetMap', sigla: 'OSM',
    domain: 'openstreetmap.org', licenca: 'ODbL',
    hrefFor: () => 'https://www.openstreetmap.org/copyright',
  },
  editorial: {
    id: 'editorial', nome: 'Aprenda Política', licenca: 'Conteúdo próprio',
  },
  veiculo: {
    id: 'veiculo', nome: 'Veículo de imprensa', licenca: 'do veículo',
  },
  wikidata: {
    id: 'wikidata', nome: 'Wikidata', sigla: 'Wikidata',
    domain: 'wikidata.org', licenca: 'CC0',
    hrefFor: (qid) => qid ? `https://www.wikidata.org/wiki/${qid}` : null,
  },
  commons: {
    id: 'commons', nome: 'Wikimedia Commons', sigla: 'Commons',
    domain: 'commons.wikimedia.org', licenca: 'CC BY-SA',
  },
}

export function getFonte(id: FonteId): FonteDef {
  return FONTES[id]
}

export function fonteLogo(domain?: string): string | null {
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/fontes.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/lib/fontes.ts src/lib/fontes.test.ts
git commit -m "feat(fontes): registro estático de fontes + helpers"
```

---

## Task 2: Componente `<Fonte>` (`src/components/ui/Fonte.tsx`)

**Files:**
- Create: `src/components/ui/Fonte.tsx`

Reference (componente atual a generalizar): `src/components/news/SourceTag.tsx` — usa `<img src={favicon} width={16} className="w-4 h-4 rounded-sm object-contain shrink-0 bg-white/90">` + nome `text-xs font-medium`.

- [ ] **Step 1: Write the component**

Create `src/components/ui/Fonte.tsx`:

```tsx
import { FONTES, fonteLogo, type FonteId } from '@/lib/fontes'

export interface FonteItem {
  fonte: FonteId
  href?: string | null      // sobrescreve hrefFor (veículo: a matéria)
  nome?: string             // sobrescreve (veículo: nome do veículo)
  domain?: string           // sobrescreve (veículo: domínio)
  attribution?: string      // Commons: "Foto: <autor>, CC BY-SA"
}

interface FonteProps {
  sources: FonteItem[]
  updatedAt?: string | null
  variant?: 'badge' | 'bloco'
  light?: boolean
  className?: string
}

function resolve(item: FonteItem) {
  const def = FONTES[item.fonte]
  const nome = item.nome ?? def.nome
  const domain = item.domain ?? def.domain
  const logo = fonteLogo(domain)
  const href = item.href !== undefined ? item.href : def.hrefFor?.(null) ?? null
  return { def, nome, logo, href, licenca: def.licenca, attribution: item.attribution }
}

function Logo({ logo, nome }: { logo: string | null; nome: string }) {
  return logo
    ? <img src={logo} alt="" width={16} height={16} className="w-4 h-4 rounded-sm object-contain shrink-0 bg-white/90" loading="lazy" />
    : <span className="w-4 h-4 rounded-sm bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center shrink-0">{nome.slice(0, 1)}</span>
}

export function Fonte({ sources, updatedAt, variant = 'badge', light = false, className = '' }: FonteProps) {
  const items = sources.filter(s => FONTES[s.fonte])
  if (items.length === 0) return null

  if (variant === 'badge') {
    const first = resolve(items[0])
    const extra = items.length - 1
    return (
      <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        <Logo logo={first.logo} nome={first.nome} />
        <span className={`text-xs font-medium truncate ${light ? 'text-white/90' : 'text-gray-500'}`}>
          {first.nome}{extra > 0 ? ` +${extra}` : ''}
        </span>
      </span>
    )
  }

  // bloco
  const fmt = updatedAt
    ? new Date(updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null
  return (
    <section className={`border border-gray-100 rounded-2xl p-5 ${className}`}>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Fonte dos dados</h2>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const r = resolve(item)
          return (
            <li key={i} className="flex items-start gap-2">
              <Logo logo={r.logo} nome={r.nome} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">{r.nome}</span>
                  <span className="text-[10px] text-gray-400">{r.licenca}</span>
                  {r.href && (
                    <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-xs text-verde-600 hover:underline">
                      ver na fonte ↗
                    </a>
                  )}
                </div>
                {r.attribution && <p className="text-[11px] text-gray-400 mt-0.5">{r.attribution}</p>}
              </div>
            </li>
          )
        })}
      </ul>
      {fmt && <p className="text-[11px] text-gray-400 mt-3">Atualizado em {fmt}</p>}
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Visual check (dev server na :3002)**

Adicione temporariamente `<Fonte variant="bloco" sources={[{fonte:'tse'},{fonte:'wikidata'}]} updatedAt={new Date().toISOString()} />` numa página, abra no browser, confirme: logos, nomes, link "ver na fonte", licença, "Atualizado em". Remova o trecho temporário depois.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Fonte.tsx
git commit -m "feat(fontes): componente <Fonte> (badge/bloco, multi-fonte, atribuição)"
```

---

## Task 3: Fiação no perfil do político (corrige TSE sem link)

**Files:**
- Modify: `src/app/politico/[slug]/page.tsx`

Contexto atual: a função `externalLink(source, externalId)` (linha ~39) só trata `camara`/`senado` e retorna `null` para `tse`. O perfil mostra esse link mas **políticos do TSE ficam sem fonte**. Vamos substituir por um bloco `<Fonte>` que cobre as três fontes.

- [ ] **Step 1: Importar o componente**

No topo do arquivo, junto aos outros imports de componentes, adicione:

```tsx
import { Fonte } from '@/components/ui/Fonte'
import { getFonte, type FonteId } from '@/lib/fontes'
```

- [ ] **Step 2: Mapear source → FonteId**

Logo após a definição de `extLink` (linha ~122, `const extLink = externalLink(...)`), adicione:

```tsx
  const fonteId: FonteId = politician.source === 'camara' ? 'camara'
    : politician.source === 'senado' ? 'senado' : 'tse'
```

- [ ] **Step 3: Renderizar o bloco de fonte**

Antes do fechamento do conteúdo principal da página (após a seção de emendas, ~linha 320), adicione. O `href` vem do `hrefFor` do registro (para TSE ele resolve para o site do TSE; para Câmara/Senado, para o perfil via `external_id`):

```tsx
        <Fonte
          variant="bloco"
          className="mb-8"
          sources={[{ fonte: fonteId, href: getFonte(fonteId).hrefFor?.(politician.external_id) ?? null }]}
          updatedAt={politician.updated_at}
        />
```

- [ ] **Step 4: Garantir que o select traz `updated_at` e `external_id`**

Confirme que a query do político (`supabase.from('politicians').select(...)`) inclui `updated_at, external_id, source`. Se faltar, adicione ao select.

- [ ] **Step 5: Remover o `externalLink` antigo se virou órfão**

Se `extLink` não é mais usado em nenhum outro lugar do JSX, remova a função `externalLink` (linha ~39-48) e a linha `const extLink = ...`. Se ainda é usado (ex.: botão no header), mantenha.

- [ ] **Step 6: Typecheck + visual + commit**

```bash
npx tsc --noEmit
```
Abra `http://localhost:3002/politico/<slug-de-um-vereador>` e confirme que agora aparece "Fonte dos dados: TSE". Abra um deputado federal e confirme "Câmara dos Deputados" com link.

```bash
git add "src/app/politico/[slug]/page.tsx"
git commit -m "feat(fontes): bloco de fonte no perfil do político (corrige TSE sem link)"
```

---

## Task 4: Fiação nas proposições

**Files:**
- Modify: `src/app/proposicoes/[slug]/page.tsx`

Contexto: `propositions` tem `source` (`camara`/`senado`), `external_id`, `url`, `updated_at`.

- [ ] **Step 1: Importar**

```tsx
import { Fonte } from '@/components/ui/Fonte'
import type { FonteId } from '@/lib/fontes'
```

- [ ] **Step 2: Renderizar bloco**

Antes do fechamento do conteúdo principal, adicione (use a `url` da própria proposição quando existir):

```tsx
        <Fonte
          variant="bloco"
          className="mb-8"
          sources={[{ fonte: (proposition.source === 'senado' ? 'senado' : 'camara') as FonteId, href: proposition.url ?? null }]}
          updatedAt={proposition.updated_at}
        />
```

Ajuste `proposition` para o nome real da variável da página (verifique no arquivo). Confirme que o select traz `source, url, updated_at`.

- [ ] **Step 3: Typecheck + visual + commit**

```bash
npx tsc --noEmit
```
Abra `http://localhost:3002/proposicoes/<slug>` e confirme o bloco.

```bash
git add "src/app/proposicoes/[slug]/page.tsx"
git commit -m "feat(fontes): bloco de fonte na proposição"
```

---

## Task 5: Fiação nas emendas

**Files:**
- Modify: `src/app/emendas/page.tsx`

Contexto: emendas não têm campo de fonte; a fonte é constante (Portal da Transparência).

- [ ] **Step 1: Importar**

```tsx
import { Fonte } from '@/components/ui/Fonte'
```

- [ ] **Step 2: Renderizar bloco no rodapé da página**

Antes do fechamento do `<main>`, adicione:

```tsx
        <Fonte variant="bloco" className="mt-8" sources={[{ fonte: 'transparencia' }]} />
```

- [ ] **Step 3: Typecheck + visual + commit**

```bash
npx tsc --noEmit
```
Abra `http://localhost:3002/emendas` e confirme "Fonte dos dados: Portal da Transparência" com link.

```bash
git add src/app/emendas/page.tsx
git commit -m "feat(fontes): fonte Portal da Transparência na página de emendas"
```

---

## Task 6: Migrar notícias (`SourceTag` → `<Fonte variant="badge">`)

**Files:**
- Modify: `src/app/noticias/[slug]/page.tsx`
- Modify: `src/components/news/NewsCard.tsx`
- Modify: `src/components/news/SourceTag.tsx` (reescrever como wrapper fino sobre `<Fonte>`)

Objetivo: unificar sem mudar o visual. `SourceTag({name, domain, light})` passa a delegar para `<Fonte variant="badge" sources={[{fonte:'veiculo', nome:name, domain}]} light={light} />`.

- [ ] **Step 1: Reescrever `SourceTag` como wrapper**

Substitua o conteúdo de `src/components/news/SourceTag.tsx` por:

```tsx
import { Fonte } from '@/components/ui/Fonte'
export function SourceTag({ name, domain, light = false, className = '' }: { name: string | null; domain: string | null; light?: boolean; className?: string }) {
  return (
    <Fonte
      variant="badge"
      light={light}
      className={className}
      sources={[{ fonte: 'veiculo', nome: name ?? 'Fonte', domain: domain ?? undefined }]}
    />
  )
}
```

- [ ] **Step 2: Typecheck + visual + commit**

Run: `npx tsc --noEmit`
Abra `http://localhost:3002/noticias` e uma matéria; confirme que o selo do veículo (logo + nome) está idêntico ao anterior, inclusive sobre capas escuras (`light`).

```bash
git add src/components/news/SourceTag.tsx
git commit -m "refactor(fontes): SourceTag delega para <Fonte> (visual idêntico)"
```

Nota: `NewsCard.tsx` e `noticias/[slug]/page.tsx` continuam usando `SourceTag` — não precisam mudar (o wrapper preserva a API).

---

## Task 7: Fiação em partidos, estados, glossário e mapa

**Files:**
- Modify: `src/app/partidos/[slug]/page.tsx`
- Modify: `src/app/estados/[slug]/page.tsx` (confirme o caminho real do detalhe de estado)
- Modify: `src/app/glossario/[termo]/page.tsx`
- Modify: `src/components/map/LeafletMapClient.tsx`

- [ ] **Step 1: Partido — bloco TSE + editorial**

Em `src/app/partidos/[slug]/page.tsx`, importe `import { Fonte } from '@/components/ui/Fonte'` e antes do fim do conteúdo adicione:

```tsx
        <Fonte variant="bloco" className="mb-8" sources={[{ fonte: 'tse' }, { fonte: 'editorial' }]} />
```

- [ ] **Step 2: Estado e município — bloco IBGE + TSE**

Em `src/app/estados/[slug]/page.tsx`, importe `Fonte` e adicione antes do fim:

```tsx
        <Fonte variant="bloco" className="mb-8" sources={[{ fonte: 'ibge' }, { fonte: 'tse' }]} />
```

Localize também a página de detalhe do município (`grep -rl "municipality" src/app --include=page.tsx`, provavelmente `src/app/estados/[slug]/[municipio]/page.tsx` ou similar) e adicione o mesmo bloco antes do fim do conteúdo. Se não houver página de município dedicada, pule esta parte.

- [ ] **Step 3: Glossário — editorial + referências do termo**

Em `src/app/glossario/[termo]/page.tsx`, o termo tem `links?` (referências externas). Importe `Fonte` e renderize editorial + os links como itens `veiculo`:

```tsx
        <Fonte
          variant="bloco"
          className="mb-8"
          sources={[
            { fonte: 'editorial' },
            ...(termo.links ?? []).map(l => ({ fonte: 'veiculo' as const, nome: l.titulo, href: l.url, domain: new URL(l.url).hostname.replace(/^www\./, '') })),
          ]}
        />
```

Ajuste `termo.links` ao shape real (verifique `Termo` em `src/lib/glossario.ts`: campos `titulo`/`url`). Se o shape diferir, mapeie os campos corretos.

- [ ] **Step 4: Mapa — nota IBGE + OSM**

Em `src/components/map/LeafletMapClient.tsx`, abaixo do `<MapContainer>` (fora dele, no JSX que o envolve), adicione uma nota fina:

```tsx
      <p className="text-[11px] text-gray-400 mt-2">Malha: IBGE · Mapa base: OpenStreetMap</p>
```

(Se o `LeafletMapClient` retorna só o `<MapContainer>`, envolva em um `<>…</>` e coloque a nota após.)

- [ ] **Step 5: Typecheck + visual + commit**

```bash
npx tsc --noEmit
```
Abra uma página de cada: `/partidos/<slug>`, `/estados/<slug>`, `/glossario/<termo>`, e a home (mapa). Confirme os blocos/nota.

```bash
git add "src/app/partidos/[slug]/page.tsx" "src/app/estados/[slug]/page.tsx" "src/app/glossario/[termo]/page.tsx" src/components/map/LeafletMapClient.tsx
git commit -m "feat(fontes): blocos de fonte em partidos, estados, glossário e mapa"
```

---

## Verification (após todas as tasks)

1. `npx vitest run src/lib/fontes.test.ts` — verde.
2. `npx tsc --noEmit` — 0 erros.
3. Visual numa página de cada tipo: político (vereador → TSE; federal → Câmara), proposição, emenda, notícia, partido, estado, glossário, mapa — todas mostram fonte.
4. `grep -rn "#[0-9a-fA-F]\{6\}" src/components/ui/Fonte.tsx` — vazio (zero hex hardcoded; só tokens).
5. Notícias: selo do veículo idêntico ao anterior (sobre capa clara e escura).
