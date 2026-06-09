# Páginas por Tema de Proposição — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Classificar as ~23k proposições numa taxonomia curada de 15 temas cidadãos e publicar landing pages ricas (`/temas` + `/proposicoes/tema/[slug]`) com conteúdo didático, dados (BI) e exemplos práticos, no design system.

**Architecture:** Taxonomia + classificador heurístico por palavra-chave num módulo único (`src/lib/topics.ts`, espelhado nos workers). `topics text[]` pré-calculado em `propositions` (migration 007 + backfill + plugado no ingest). Frontend RSC reusando os componentes/padrões já existentes (cards de proposição enriquecidos, Avatar, chips, tokens).

**Tech Stack:** Next.js 14 (RSC), Supabase (PostgREST), Tailwind (tokens `verde/amarelo/esfera`), vitest (teste da função pura), Node ESM `.mjs` (classificador nos workers).

**Spec:** `docs/superpowers/specs/2026-06-09-temas-proposicoes-design.md`

---

## File Structure

**Frontend (`aprenda-politica/`):**
| Arquivo | Responsabilidade |
|---|---|
| `src/lib/topics.ts` | taxonomia (15 temas) + `classifyTopics()` + `getTopic()` |
| `src/lib/topics.test.ts` | testes vitest de `classifyTopics` |
| `src/lib/propositions.ts` (mod) | filtro `tema`, `topicStats`, `propositionsByTopic` |
| `src/app/temas/page.tsx` | hub dos temas |
| `src/app/proposicoes/tema/[slug]/page.tsx` | landing rica do tema |
| `src/app/proposicoes/page.tsx` (mod) | filtro "Tema" |
| `src/app/proposicoes/[slug]/page.tsx` (mod) | chips de tema curado |
| `src/lib/sitemap.ts` (mod) | `/temas` + temas no `STATIC_PATHS` |
| `supabase/migrations/007_proposition_topics.sql` | coluna `topics[]` + índice |

**Workers (`aprenda-politica-workers/`):**
| Arquivo | Responsabilidade |
|---|---|
| `scripts/propositions/topics.mjs` | espelho da taxonomia + `classifyTopics` |
| `scripts/classify-topics.mjs` | backfill de `topics` em todas as proposições |
| `scripts/propositions/ingest.mjs` (mod) | calcula `topics` no upsert |

---

## Task 1: Taxonomia + `classifyTopics` (frontend, TDD)

**Files:**
- Create: `src/lib/topics.ts`
- Test: `src/lib/topics.test.ts`

- [ ] **Step 1: Escrever o teste (falhando)** — `src/lib/topics.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { classifyTopics, TOPICS, getTopic } from './topics'

describe('classifyTopics', () => {
  it('classifica saúde', () => {
    expect(classifyTopics('Cria programa de vacinação no SUS', '', [])).toContain('saude')
  })
  it('classifica por keyword nos themes (sem acento/caixa)', () => {
    expect(classifyTopics('Dispõe sobre matéria', '', ['Educação', 'Escola'])).toContain('educacao')
  })
  it('pode ter múltiplos temas', () => {
    const t = classifyTopics('Educação ambiental nas escolas', '', [])
    expect(t).toEqual(expect.arrayContaining(['educacao', 'meio-ambiente']))
  })
  it('retorna vazio quando nada casa', () => {
    expect(classifyTopics('Altera dispositivo da Lei X', '', [])).toEqual([])
  })
})

describe('TOPICS', () => {
  it('tem 15 temas com slug único', () => {
    expect(TOPICS).toHaveLength(15)
    expect(new Set(TOPICS.map(t => t.slug)).size).toBe(15)
  })
  it('getTopic acha por slug', () => {
    expect(getTopic('saude')?.label).toBe('Saúde')
    expect(getTopic('inexistente')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd /Users/gualtieri/Apps/aprenda-politica && npx vitest run src/lib/topics.test.ts`
Expected: FAIL — `Failed to resolve import "./topics"`.

- [ ] **Step 3: Implementar `src/lib/topics.ts`** (taxonomia completa):
```typescript
export interface Topic {
  slug: string
  label: string
  tagline: string
  emoji: string
  accent: string
  intro: string[]
  examples: string[]
  keywords: string // alternativas (já sem acento/caixa) p/ a RegExp
}

export const TOPICS: Topic[] = [
  {
    slug: 'saude', label: 'Saúde', tagline: 'SUS, vacinas, hospitais e atenção à população', emoji: '🏥', accent: '#E11D48',
    intro: [
      'O Congresso legisla sobre o Sistema Único de Saúde (SUS), planos de saúde, medicamentos, vigilância sanitária e políticas de prevenção.',
      'São leis que afetam o atendimento em hospitais e postos, o acesso a remédios e vacinas, e os direitos de pacientes.',
    ],
    examples: ['Inclusão de novos exames e medicamentos no SUS', 'Regras para planos de saúde e reajustes', 'Campanhas de vacinação e saúde mental'],
    keywords: 'saude|sus|hospital|posto de saude|ubs|medic|enfermag|vacina|imuniz|doenca|epidemi|pandemia|farmac|remedio|medicament|cancer|diabetes|saude mental|psicolog|psiquiatr|samu|plano de saude|anvisa|sanitari',
  },
  {
    slug: 'educacao', label: 'Educação', tagline: 'Escolas, universidades, professores e ensino', emoji: '📚', accent: '#2563EB',
    intro: [
      'Trata de educação básica e superior, financiamento (FUNDEB), currículo, merenda, e a carreira dos professores.',
      'São leis que definem como funcionam escolas, creches e universidades, e o acesso de alunos ao ensino.',
    ],
    examples: ['Mudanças no ENEM e no acesso à universidade', 'Merenda escolar e educação infantil', 'Valorização e piso dos professores'],
    keywords: 'educac|escola|ensino|aluno|professor|universidad|faculdad|creche|alfabetiz|merenda|fundeb|enem|bolsa de estudo|magisterio|pedagog|curricul|analfabet',
  },
  {
    slug: 'seguranca', label: 'Segurança Pública', tagline: 'Polícia, crimes, penas e combate à violência', emoji: '🛡️', accent: '#475569',
    intro: [
      'Abrange polícia, sistema prisional, definição de crimes e penas, e políticas de combate à violência.',
      'São leis que mudam o Código Penal, criam ou endurecem crimes, e organizam a segurança pública.',
    ],
    examples: ['Aumento de pena para determinados crimes', 'Regras sobre porte e posse de armas', 'Combate ao feminicídio e à violência'],
    keywords: 'seguranca publica|policia|policial|crime|criminal|violencia|homicidio|furto|roubo|trafico| pena |presidio|penitenciari|delegacia|arma de fogo|porte de arma|codigo penal|feminicidio|milicia|guarda municipal',
  },
  {
    slug: 'meio-ambiente', label: 'Meio Ambiente', tagline: 'Clima, florestas, água e sustentabilidade', emoji: '🌳', accent: '#16A34A',
    intro: [
      'Trata de preservação ambiental, desmatamento, recursos hídricos, saneamento, clima e energia limpa.',
      'São leis que protegem florestas e fauna, regulam poluição e resíduos, e incentivam a sustentabilidade.',
    ],
    examples: ['Proteção da Amazônia e combate ao desmatamento', 'Saneamento básico e tratamento de água', 'Incentivo a energias renováveis'],
    keywords: 'meio ambiente|ambiental|desmatament|floresta|amazonia|clima|aquecimento global|poluic|residuo|reciclag| agua |saneament|fauna|flora|biodiversidad|sustentavel|carbono|energia renovavel|preservac',
  },
  {
    slug: 'trabalho', label: 'Trabalho e Emprego', tagline: 'CLT, salário, sindicatos e aposentadoria', emoji: '💼', accent: '#B45309',
    intro: [
      'Abrange direitos trabalhistas (CLT), salário, jornada, FGTS, sindicatos e a Previdência (INSS).',
      'São leis que afetam quem trabalha com carteira assinada, autônomos e quem se aposenta.',
    ],
    examples: ['Mudanças na jornada e em direitos da CLT', 'Regras de aposentadoria e do INSS', 'Salário mínimo e seguro-desemprego'],
    keywords: 'trabalh|emprego|clt|salario|fgts|sindicato|aposentad|previdenc|inss|jornada|ferias|demiss|carteira|estagi|terceirizac|piso salarial|seguro-desemprego',
  },
  {
    slug: 'economia-impostos', label: 'Economia e Impostos', tagline: 'Tributos, orçamento e atividade econômica', emoji: '💰', accent: '#0D9488',
    intro: [
      'Trata de impostos (IR, ICMS, ISS), orçamento público, crédito, e regras para empresas.',
      'São leis que mudam quanto se paga de tributo e como o Estado arrecada e gasta.',
    ],
    examples: ['Mudanças no Imposto de Renda e isenções', 'Simples Nacional e MEI', 'Reforma tributária e novas taxas'],
    keywords: 'imposto|tribut|icms| iss |ipva|iptu|imposto de renda| taxa |aliquota|fiscal|orcament|divida publica|juros|inflac| credito |financ|economia|microempresa|simples nacional| mei ',
  },
  {
    slug: 'mulher', label: 'Direitos da Mulher', tagline: 'Igualdade, proteção e combate à violência', emoji: '♀️', accent: '#DB2777',
    intro: [
      'Abrange igualdade de gênero, proteção contra a violência doméstica (Lei Maria da Penha) e direitos da mulher.',
      'São leis que combatem o feminicídio e o assédio, e garantem direitos de gestantes e mães.',
    ],
    examples: ['Fortalecimento da Lei Maria da Penha', 'Combate ao assédio e ao feminicídio', 'Igualdade salarial entre homens e mulheres'],
    keywords: 'mulher|feminin|feminic|maria da penha|violencia domestica|igualdade de genero|materni|gestante|assedio',
  },
  {
    slug: 'animais', label: 'Direitos dos Animais', tagline: 'Proteção e bem-estar animal', emoji: '🐾', accent: '#CA8A04',
    intro: [
      'Trata da proteção e bem-estar de animais domésticos e silvestres, e do combate a maus-tratos.',
      'São leis que punem a crueldade, regulam a posse de pets e protegem a fauna.',
    ],
    examples: ['Penas maiores para maus-tratos a animais', 'Castração e adoção responsável', 'Proteção de animais silvestres'],
    keywords: 'maus-tratos|maus tratos|bem-estar animal|protecao animal|animais|crueldade contra|veterinari|zoonose|adocao de animais|castracao| pet ',
  },
  {
    slug: 'transporte', label: 'Transporte e Trânsito', tagline: 'CTB, veículos, rodovias e mobilidade', emoji: '🚗', accent: '#4F46E5',
    intro: [
      'Abrange o Código de Trânsito (CTB), veículos, habilitação (CNH), rodovias, pedágios e transporte público.',
      'São leis que afetam motoristas, passageiros e a mobilidade nas cidades.',
    ],
    examples: ['Mudanças no CTB e na CNH', 'Regras de pedágio e rodovias', 'Transporte público e mobilidade urbana'],
    keywords: 'transporte|transito|veiculo|automovel|motocicleta| ctb |codigo de transito|rodovia|pedagio|onibus| metro |ciclovia| cnh |habilitac|estacionament|mobilidade urbana',
  },
  {
    slug: 'tecnologia', label: 'Tecnologia e Internet', tagline: 'Dados, redes, IA e mundo digital', emoji: '💻', accent: '#0891B2',
    intro: [
      'Trata de internet, proteção de dados (LGPD), redes sociais, inteligência artificial e telecomunicações.',
      'São leis que regulam o ambiente digital, a privacidade e as plataformas online.',
    ],
    examples: ['Proteção de dados pessoais (LGPD)', 'Regulação de redes sociais e IA', 'Acesso à internet e telecom'],
    keywords: 'internet| digital|dados pessoais| lgpd |tecnolog|software|aplicativo|rede social|cibern|inteligencia artificial|telecomunicac|provedor|marco civil',
  },
  {
    slug: 'consumidor', label: 'Defesa do Consumidor', tagline: 'CDC, cobranças, garantias e Procon', emoji: '🛒', accent: '#EA580C',
    intro: [
      'Abrange o Código de Defesa do Consumidor (CDC), publicidade, cobranças, garantias e o Procon.',
      'São leis que protegem quem compra produtos e contrata serviços.',
    ],
    examples: ['Combate à publicidade enganosa', 'Regras de cobrança e garantia', 'Direitos em compras pela internet'],
    keywords: 'consumidor| cdc |codigo de defesa do consumidor|procon|publicidade enganosa| cobranca|fornecedor|relacao de consumo',
  },
  {
    slug: 'crianca', label: 'Criança e Adolescente', tagline: 'ECA, proteção e direitos da infância', emoji: '🧒', accent: '#F59E0B',
    intro: [
      'Trata do Estatuto da Criança e do Adolescente (ECA), proteção contra abusos e direitos da infância.',
      'São leis que combatem o trabalho infantil e o bullying, e protegem menores.',
    ],
    examples: ['Combate ao trabalho infantil', 'Proteção contra bullying e abuso', 'Pensão alimentícia e guarda'],
    keywords: 'crianca|infanti|adolescent| eca |estatuto da crianca| menor |bullying|trabalho infantil|pensao aliment',
  },
  {
    slug: 'idoso', label: 'Pessoa Idosa', tagline: 'Estatuto do Idoso e envelhecimento', emoji: '👵', accent: '#7C3AED',
    intro: [
      'Abrange o Estatuto do Idoso, direitos da terceira idade, e políticas de envelhecimento.',
      'São leis que protegem idosos contra abusos e garantem prioridade e dignidade.',
    ],
    examples: ['Prioridade de atendimento à pessoa idosa', 'Combate à violência contra idosos', 'Benefícios e cuidados na terceira idade'],
    keywords: 'idos|terceira idade|estatuto do idoso|envelheciment|asilo|longevidad',
  },
  {
    slug: 'cultura-esporte', label: 'Cultura e Esporte', tagline: 'Arte, patrimônio, esporte e lazer', emoji: '🎭', accent: '#DC2626',
    intro: [
      'Trata de cultura, patrimônio histórico, incentivo à arte (Lei Rouanet) e esporte.',
      'São leis que apoiam artistas, atletas e a preservação cultural.',
    ],
    examples: ['Incentivo à cultura e à arte', 'Apoio ao esporte e a atletas', 'Proteção do patrimônio histórico'],
    keywords: 'cultura|cultural|artist|patrimonio historico| musica|cinema|teatro|esporte|esportiv|atleta|olimpic|futebol|lei rouanet',
  },
  {
    slug: 'agro', label: 'Agropecuária', tagline: 'Agricultura, pecuária e mundo rural', emoji: '🌾', accent: '#65A30D',
    intro: [
      'Abrange agricultura, pecuária, crédito rural, defensivos e a vida no campo.',
      'São leis que afetam produtores rurais, o agronegócio e a produção de alimentos.',
    ],
    examples: ['Crédito rural e apoio ao produtor', 'Regras sobre defensivos agrícolas', 'Reforma agrária e terras'],
    keywords: 'agricultura|agropecuari|agricultor| rural|agronegoci|pecuari| safra |fazend|plantio|colheita|defensivo|agrotoxico|reforma agraria',
  },
]

const byslug = new Map(TOPICS.map(t => [t.slug, t]))
export const getTopic = (slug: string): Topic | undefined => byslug.get(slug)

const norm = (s: string) =>
  ` ${(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()} `

const RES = TOPICS.map(t => ({ slug: t.slug, re: new RegExp(`(${t.keywords})`, 'i') }))

/** Classifica uma proposição nos temas curados pelo texto (heurística por palavra-chave). */
export function classifyTopics(title: string, summary: string, themes: string[]): string[] {
  const text = norm(`${title} ${summary} ${(themes || []).join(' ')}`)
  return RES.filter(({ re }) => re.test(text)).map(({ slug }) => slug)
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/topics.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 5: Typecheck + commit**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
git add src/lib/topics.ts src/lib/topics.test.ts
git commit -m "feat(temas): taxonomia curada (15) + classifyTopics"
```

---

## Task 2: Migration 007 — coluna `topics[]`

**Files:**
- Create: `supabase/migrations/007_proposition_topics.sql`

- [ ] **Step 1: Criar a migration**
```sql
ALTER TABLE propositions ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_propositions_topics ON propositions USING GIN (topics);
```

- [ ] **Step 2: Aplicar** no Supabase → SQL Editor (padrão das migrations anteriores).

- [ ] **Step 3: Verificar**
```bash
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-); ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
curl -s "${SUPA_URL}/rest/v1/propositions?select=id,topics&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
```
Expected: retorna `topics: []` (coluna existe).

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/007_proposition_topics.sql
git commit -m "feat(db): migration 007 — coluna topics em propositions"
```

---

## Task 3: Classificador nos workers + backfill + ingest

**Files:**
- Create: `aprenda-politica-workers/scripts/propositions/topics.mjs`
- Create: `aprenda-politica-workers/scripts/classify-topics.mjs`
- Modify: `aprenda-politica-workers/scripts/propositions/ingest.mjs`

- [ ] **Step 1: Criar `scripts/propositions/topics.mjs`** (espelho ESM da taxonomia — apenas `keywords` + `classifyTopics`, sem UI):
```js
// Espelho de src/lib/topics.ts (regras de classificação). Manter em sincronia.
const TOPIC_KEYWORDS = {
  'saude': 'saude|sus|hospital|posto de saude|ubs|medic|enfermag|vacina|imuniz|doenca|epidemi|pandemia|farmac|remedio|medicament|cancer|diabetes|saude mental|psicolog|psiquiatr|samu|plano de saude|anvisa|sanitari',
  'educacao': 'educac|escola|ensino|aluno|professor|universidad|faculdad|creche|alfabetiz|merenda|fundeb|enem|bolsa de estudo|magisterio|pedagog|curricul|analfabet',
  'seguranca': 'seguranca publica|policia|policial|crime|criminal|violencia|homicidio|furto|roubo|trafico| pena |presidio|penitenciari|delegacia|arma de fogo|porte de arma|codigo penal|feminicidio|milicia|guarda municipal',
  'meio-ambiente': 'meio ambiente|ambiental|desmatament|floresta|amazonia|clima|aquecimento global|poluic|residuo|reciclag| agua |saneament|fauna|flora|biodiversidad|sustentavel|carbono|energia renovavel|preservac',
  'trabalho': 'trabalh|emprego|clt|salario|fgts|sindicato|aposentad|previdenc|inss|jornada|ferias|demiss|carteira|estagi|terceirizac|piso salarial|seguro-desemprego',
  'economia-impostos': 'imposto|tribut|icms| iss |ipva|iptu|imposto de renda| taxa |aliquota|fiscal|orcament|divida publica|juros|inflac| credito |financ|economia|microempresa|simples nacional| mei ',
  'mulher': 'mulher|feminin|feminic|maria da penha|violencia domestica|igualdade de genero|materni|gestante|assedio',
  'animais': 'maus-tratos|maus tratos|bem-estar animal|protecao animal|animais|crueldade contra|veterinari|zoonose|adocao de animais|castracao| pet ',
  'transporte': 'transporte|transito|veiculo|automovel|motocicleta| ctb |codigo de transito|rodovia|pedagio|onibus| metro |ciclovia| cnh |habilitac|estacionament|mobilidade urbana',
  'tecnologia': 'internet| digital|dados pessoais| lgpd |tecnolog|software|aplicativo|rede social|cibern|inteligencia artificial|telecomunicac|provedor|marco civil',
  'consumidor': 'consumidor| cdc |codigo de defesa do consumidor|procon|publicidade enganosa| cobranca|fornecedor|relacao de consumo',
  'crianca': 'crianca|infanti|adolescent| eca |estatuto da crianca| menor |bullying|trabalho infantil|pensao aliment',
  'idoso': 'idos|terceira idade|estatuto do idoso|envelheciment|asilo|longevidad',
  'cultura-esporte': 'cultura|cultural|artist|patrimonio historico| musica|cinema|teatro|esporte|esportiv|atleta|olimpic|futebol|lei rouanet',
  'agro': 'agricultura|agropecuari|agricultor| rural|agronegoci|pecuari| safra |fazend|plantio|colheita|defensivo|agrotoxico|reforma agraria',
}
const norm = s => ` ${(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()} `
const RES = Object.entries(TOPIC_KEYWORDS).map(([slug, kw]) => ({ slug, re: new RegExp(`(${kw})`, 'i') }))

export function classifyTopics(title, summary, themes) {
  const text = norm(`${title || ''} ${summary || ''} ${(themes || []).join(' ')}`)
  return RES.filter(({ re }) => re.test(text)).map(({ slug }) => slug)
}
```

- [ ] **Step 2: Plugar no `ingest.mjs`** — no topo, importar; no `row`, calcular `topics`. Localizar a linha de import e a montagem do `row` em `scripts/propositions/ingest.mjs`:

Adicionar ao import existente (`import { buildSlug, dedupeAuthors, slugify, SUBSTANTIVE_TYPES } from './normalize.mjs'`) uma nova linha abaixo:
```js
import { classifyTopics } from './topics.mjs'
```
No objeto `row` (que tem `themes: p.themes ?? []`), adicionar a chave:
```js
        topics: classifyTopics(p.title, p.summary, p.themes ?? []),
```

- [ ] **Step 3: Criar `scripts/classify-topics.mjs`** (backfill):
```js
/** Classifica topics[] de todas as proposições (idempotente). */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { classifyTopics } from './propositions/topics.mjs'

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function runPool(items, worker, concurrency = 25) {
  let idx = 0, done = 0
  async function lane() {
    while (idx < items.length) {
      const it = items[idx++]
      try { await worker(it) } catch (e) { console.warn('  ✗', e.message) }
      if (++done % 2000 === 0) console.log(`  ...${done}/${items.length}`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, lane))
}

async function main() {
  const rows = []
  let from = 0
  for (;;) {
    const { data, error } = await supabase.from('propositions')
      .select('id, title, summary, themes').order('id').range(from, from + 999)
    if (error) throw error
    if (!data?.length) break
    rows.push(...data)
    if (data.length < 1000) break
    from += data.length
  }
  console.log(`[topics] ${rows.length} proposições a classificar`)
  let comTema = 0
  await runPool(rows, async (p) => {
    const topics = classifyTopics(p.title, p.summary, p.themes ?? [])
    if (topics.length) comTema++
    await supabase.from('propositions').update({ topics }).eq('id', p.id)
  })
  console.log(`[topics] concluído: ${comTema} com ≥1 tema, ${rows.length - comTema} sem tema`)
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
```

- [ ] **Step 4: Sintaxe + rodar backfill**

Run: `cd /Users/gualtieri/Apps/aprenda-politica-workers && node --check scripts/propositions/topics.mjs && node --check scripts/classify-topics.mjs && node --check scripts/propositions/ingest.mjs && echo OK`
Run: `node scripts/classify-topics.mjs`
Expected: `[topics] N proposições a classificar` → `[topics] concluído: X com ≥1 tema, …`.

- [ ] **Step 5: Verificar no banco**
```bash
cd /Users/gualtieri/Apps/aprenda-politica
SUPA_URL=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d= -f2-); ANON=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d= -f2-)
curl -s "${SUPA_URL}/rest/v1/propositions?topics=cs.{saude}&select=slug,topics&limit=3" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}"
curl -s "${SUPA_URL}/rest/v1/propositions?topics=cs.{saude}&select=id&limit=1" -H "apikey: ${ANON}" -H "Authorization: Bearer ${ANON}" -H "Prefer: count=exact" -H "Range: 0-0" -i 2>/dev/null | grep -i content-range
```
Expected: proposições com `topics` incluindo "saude" + um count > 0.

- [ ] **Step 6: Commit (workers, sem push)**
```bash
cd /Users/gualtieri/Apps/aprenda-politica-workers
git add scripts/propositions/topics.mjs scripts/classify-topics.mjs scripts/propositions/ingest.mjs
git commit -m "feat(temas): classificador de topics + backfill + plugado no ingest"
```

---

## Task 4: Camada de consulta (frontend)

**Files:**
- Modify: `src/lib/propositions.ts`

- [ ] **Step 1: Adicionar filtro `tema` em `listPropositions`** — em `PropositionFilter` adicionar `tema?: string`; dentro de `listPropositions`, após o bloco do filtro `tema` de themes? NÃO — usar `topics`. Localizar `if (f.tema) q = q.contains('themes', [f.tema])` e **substituir** por:
```typescript
  if (f.tema) q = q.contains('topics', [f.tema])
```
(O `tema` agora é slug de tópico curado, não keyword crua.) Em `PropositionFilter`, o campo `tema?: string` já existe — manter.

- [ ] **Step 2: Adicionar as funções de tema** ao final de `src/lib/propositions.ts`:
```typescript
/** Proposições de um tema (paginado, com autor principal já enriquecido). */
export async function propositionsByTopic(tema: string, page = 1, pageSize = 30): Promise<{ items: Proposition[]; total: number }> {
  return listPropositions({ tema, page, pageSize })
}

export interface TopicStats {
  total: number
  bySource: { camara: number; senado: number }
  topTypes: { type: string; n: number }[]
  topParties: { id: number; abbr: string; color: string | null; slug: string | null; logo: string | null; n: number }[]
  topAuthors: { id: number; name: string; slug: string; photo_url: string | null; party_abbr: string | null; party_color: string | null; n: number }[]
}

/** Agregados (BI) de um tema. */
export async function topicStats(tema: string): Promise<TopicStats> {
  const supabase = createServerSupabaseClient()
  const { data: props } = await supabase.from('propositions')
    .select('id, type, source, party_ids').contains('topics', [tema]).limit(20000)
  const rows = (props ?? []) as { id: number; type: string; source: string; party_ids: number[] | null }[]

  const bySource = { camara: 0, senado: 0 }
  const typeCount = new Map<string, number>()
  const partyCount = new Map<number, number>()
  for (const r of rows) {
    if (r.source === 'camara') bySource.camara++
    else if (r.source === 'senado') bySource.senado++
    typeCount.set(r.type, (typeCount.get(r.type) ?? 0) + 1)
    for (const pid of r.party_ids ?? []) partyCount.set(pid, (partyCount.get(pid) ?? 0) + 1)
  }
  const topTypes = [...typeCount].map(([type, n]) => ({ type, n })).sort((a, b) => b.n - a.n).slice(0, 5)

  // partidos
  const topPartyIds = [...partyCount].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id)
  let topParties: TopicStats['topParties'] = []
  if (topPartyIds.length) {
    const { data: parties } = await supabase.from('parties').select('id, abbr, color_hex, slug, logo_url').in('id', topPartyIds)
    topParties = (parties ?? []).map((p: { id: number; abbr: string; color_hex: string | null; slug: string | null; logo_url: string | null }) => ({
      id: p.id, abbr: p.abbr, color: p.color_hex, slug: p.slug, logo: p.logo_url, n: partyCount.get(p.id) ?? 0,
    })).sort((a, b) => b.n - a.n)
  }

  // autores mais ativos no tema (proponentes)
  const ids = rows.map(r => r.id)
  const authorCount = new Map<number, number>()
  for (let i = 0; i < ids.length; i += 300) {
    const slice = ids.slice(i, i + 300)
    const { data: pa } = await supabase.from('proposition_authors')
      .select('politician_id').in('proposition_id', slice).eq('role', 'autor').not('politician_id', 'is', null)
    for (const a of (pa ?? []) as { politician_id: number }[]) authorCount.set(a.politician_id, (authorCount.get(a.politician_id) ?? 0) + 1)
  }
  const topAuthorIds = [...authorCount].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id)
  let topAuthors: TopicStats['topAuthors'] = []
  if (topAuthorIds.length) {
    const { data: pols } = await supabase.from('politicians')
      .select('id, name, slug, photo_url, party:parties(abbr, color_hex)').in('id', topAuthorIds)
    type PR = { id: number; name: string; slug: string; photo_url: string | null; party: { abbr: string; color_hex: string | null } | null }
    topAuthors = ((pols as unknown as PR[]) ?? []).map(p => ({
      id: p.id, name: p.name, slug: p.slug, photo_url: p.photo_url,
      party_abbr: p.party?.abbr ?? null, party_color: p.party?.color_hex ?? null, n: authorCount.get(p.id) ?? 0,
    })).sort((a, b) => b.n - a.n)
  }

  return { total: rows.length, bySource, topTypes, topParties, topAuthors }
}
```

- [ ] **Step 3: Typecheck + commit**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
git add src/lib/propositions.ts
git commit -m "feat(temas): filtro por tema + topicStats + propositionsByTopic"
```

---

## Task 5: Hub `/temas`

**Files:**
- Create: `src/app/temas/page.tsx`

- [ ] **Step 1: Criar a página** (grid de cards, contadores reais via uma query por tema):
```tsx
import Link from 'next/link'
import type { Metadata } from 'next'
import { TOPICS } from '@/lib/topics'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
  const c = await counts()
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Proposições por assunto</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">O que o Congresso propõe sobre…</h1>
        <p className="text-gray-500 text-lg max-w-2xl mb-10">Escolha um tema e veja os projetos de lei, quem propõe e o que está em discussão.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map(t => (
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
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar render** (dev server :3002)
```bash
curl -s "http://localhost:3002/temas" | grep -oE "Saúde|Educação|proposições|O que o Congresso" | sort -u | head
```
Expected: aparecem os temas + "proposições".

- [ ] **Step 3: Commit**
```bash
git add src/app/temas/page.tsx
git commit -m "feat(temas): hub /temas com contadores"
```

---

## Task 6: Landing rica `/proposicoes/tema/[slug]`

**Files:**
- Create: `src/app/proposicoes/tema/[slug]/page.tsx`

- [ ] **Step 1: Criar a página**:
```tsx
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

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${t.accent}14` }}>{t.emoji}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projetos de lei sobre {t.label}</h1>
            <p className="text-sm font-semibold" style={{ color: t.accent }}>{total.toLocaleString('pt-BR')} proposições</p>
          </div>
        </div>

        {/* Intro didática */}
        <div className="space-y-2 mb-8 text-gray-700 leading-relaxed">
          {t.intro.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* Faixa de dados */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat label="Proposições" value={total.toLocaleString('pt-BR')} accent={t.accent} />
          <Stat label="Na Câmara" value={stats.bySource.camara.toLocaleString('pt-BR')} accent={t.accent} />
          <Stat label="No Senado" value={stats.bySource.senado.toLocaleString('pt-BR')} accent={t.accent} />
          <Stat label="Tipo principal" value={stats.topTypes[0]?.type ?? '—'} accent={t.accent} />
        </div>

        {/* Parlamentares mais ativos */}
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

        {/* Partidos mais ativos */}
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

        {/* Exemplos práticos */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Exemplos do que vira proposta</h2>
          <ul className="space-y-1.5">
            {t.examples.map((e, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="mt-1" style={{ color: t.accent }}>•</span>{e}</li>
            ))}
          </ul>
        </section>

        {/* Lista */}
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

        {/* Veja também */}
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
```

- [ ] **Step 2: Typecheck + render**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
curl -s "http://localhost:3002/proposicoes/tema/saude" | grep -oE "Projetos de lei sobre Saúde|Parlamentares mais ativos|Partidos mais ativos|Exemplos|Veja também" | sort -u
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3002/proposicoes/tema/inexistente"   # 404
```
Expected: marcadores presentes; tema inexistente → 404.

- [ ] **Step 3: Commit**
```bash
git add "src/app/proposicoes/tema/[slug]/page.tsx"
git commit -m "feat(temas): landing rica /proposicoes/tema/[slug] (intro, BI, autores, exemplos)"
```

---

## Task 7: Cross-links (filtro de tema + chips na proposição)

**Files:**
- Modify: `src/app/proposicoes/page.tsx`
- Modify: `src/app/proposicoes/[slug]/page.tsx`

- [ ] **Step 1: Filtro "Tema" no `/proposicoes`** — importar `TOPICS`; adicionar um `<select name="tema">` ao form, e o searchParam já chega em `listPropositions`. No topo de `src/app/proposicoes/page.tsx` adicionar import:
```tsx
import { TOPICS } from '@/lib/topics'
```
Adicionar `tema?: string` ao tipo `searchParams` do `PageProps`. No `<form>`, após o `<select name="fonte">…</select>`, inserir:
```tsx
          <select name="tema" defaultValue={searchParams.tema ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos os temas</option>
            {TOPICS.map(t => <option key={t.slug} value={t.slug}>{t.label}</option>)}
          </select>
```

- [ ] **Step 2: Chips de tema curado na página da proposição** — em `src/app/proposicoes/[slug]/page.tsx`, importar a taxonomia e classificar (a proposição já vem com `themes`; usamos `classifyTopics` para os chips curados). Adicionar import:
```tsx
import { classifyTopics, getTopic } from '@/lib/topics'
```
Após `const info = typeInfo(p.type)` (início do componente), calcular:
```tsx
  const topics = classifyTopics(p.title ?? '', p.summary ?? '', p.themes ?? []).map(getTopic).filter(Boolean)
```
Localizar o bloco "Temas como chips" (que itera `p.themes`) e **substituir** por chips de tema curado (linkando pra landing):
```tsx
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {topics.map(tp => tp && (
              <Link key={tp.slug} href={`/proposicoes/tema/${tp.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1 border hover:opacity-80"
                style={{ background: `${tp.accent}14`, color: tp.accent, borderColor: `${tp.accent}40` }}>
                {tp.emoji} {tp.label}
              </Link>
            ))}
          </div>
        )}
```
(Manter as keywords cruas fora da UI — os chips agora são os temas curados.)

- [ ] **Step 3: Typecheck + render**
```bash
npx tsc --noEmit 2>&1 | grep -v "src/tests/" | grep -E "error TS" && echo ERROS || echo "tsc ok"
curl -s "http://localhost:3002/proposicoes?tema=saude" | grep -oc "proposicoes/"   # > 0
```
Expected: tsc ok; filtro retorna resultados.

- [ ] **Step 4: Commit**
```bash
git add src/app/proposicoes/page.tsx "src/app/proposicoes/[slug]/page.tsx"
git commit -m "feat(temas): filtro de tema no /proposicoes + chips de tema na proposição"
```

---

## Task 8: Sitemap (temas no chunk estático)

**Files:**
- Modify: `src/lib/sitemap.ts`

- [ ] **Step 1: Incluir `/temas` e as páginas de tema no `STATIC_PATHS`** — em `src/lib/sitemap.ts`, importar a taxonomia e derivar os paths. No topo (após o import de `SITE_URL`):
```typescript
import { TOPICS } from './topics'
```
No array `STATIC_PATHS`, adicionar `/temas` e, ao final do array (antes do `]`), espalhar os temas:
Localizar `'', '/estados', '/partidos', '/politicos', '/proposicoes', '/aprenda',` e trocar por:
```typescript
  '', '/estados', '/partidos', '/politicos', '/proposicoes', '/temas', '/aprenda',
```
E logo após a abertura do array `const STATIC_PATHS = [` … antes do `]` final, adicionar uma linha com os temas:
```typescript
  ...TOPICS.map(t => `/proposicoes/tema/${t.slug}`),
```

- [ ] **Step 2: Verificar** (dev): chunk 0 inclui os temas
```bash
curl -s "http://localhost:3002/sitemaps-v2/0.xml" | grep -oE "/proposicoes/tema/[a-z-]+|/temas" | sort -u | head
```
Expected: aparecem `/temas` e as URLs `/proposicoes/tema/{slug}`.

- [ ] **Step 3: Commit**
```bash
git add src/lib/sitemap.ts
git commit -m "feat(temas): /temas e páginas de tema no sitemap"
```

---

## Verificação final

1. **Build:** `npm run build` (parar o dev server antes — compartilham `.next`) — compila; `/temas` e `/proposicoes/tema/[slug]` aparecem nas rotas.
2. **Testes:** `npx vitest run src/lib/topics.test.ts` — passa.
3. **E2E** (dev :3002): `/temas` mostra os 15 temas com contadores; `/proposicoes/tema/saude` mostra intro, faixa de dados, parlamentares/partidos mais ativos, exemplos, lista; `/proposicoes?tema=saude` filtra; chips de tema na proposição linkam.
4. **Reprocesso:** re-rodar `node scripts/classify-topics.mjs` é idempotente; proposições novas saem classificadas pelo `ingest`.

## Notas

- **Taxonomia duplicada** (`src/lib/topics.ts` ↔ `scripts/propositions/topics.mjs`): manter as `keywords` em sincronia ao ajustar regras. As regras vivem juntas em cada arquivo para facilitar a cópia.
- **Heurística:** classificação por palavra-chave tem falsos pos/neg. Ajuste de regras = editar `keywords` nos dois arquivos + re-rodar o classificador.
- **Migration 007** depende do usuário aplicar no SQL Editor antes do backfill (Task 3) e das páginas (Tasks 5-8).
- **Dev/build:** não rodar `npm run build` com o `next dev` ligado (corrompe `.next`); deixar a Vercel buildar, ou parar o dev antes.
