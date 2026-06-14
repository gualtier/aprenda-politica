# Enriquecimento via Wikidata — Design (Parte 2)

**Data:** 2026-06-14
**Status:** Aprovado (design)
**Depende de:** Parte 1 (Fontes & Proveniência) — o componente `<Fonte>` e o registro de fontes (`wikidata`, `commons` já registrados). Implementar a Parte 1 antes.

## Objetivo

Enriquecer os perfis de políticos com dados do **Wikidata** e da **Wikipedia** (ambos APIs gratuitas, sem chave): link para o verbete, resumo, redes sociais, carreira (cargos exercidos) e foto dos proeminentes que ainda faltam — cada dado citando sua fonte via o `<Fonte>` da Parte 1. Sem uso de LLM.

## Princípio de segurança (o que torna "todos os 65k" viável)

Varre todos os políticos, mas **só aceita match de alta confiança**, ancorado na **data de nascimento** (o TSE nos dá `birth_date` de todos; o Wikidata tem P569). Obscuros sem verbete simplesmente não casam e são pulados — nunca viram match errado (homônimo).

## Arquitetura

Worker no host (repo `aprenda-politica-workers`), no padrão de `sync-news`/`sync-emendas`:

1. `scripts/sync-wikidata.mjs` — orquestra: pagina políticos do DB, chama o matcher, extrai, grava. Lotes via env, paced, idempotente (upsert por `id`).
2. `scripts/wikidata/match.mjs` — busca + desambiguação por nascimento. Unidade isolada e testável.
3. `scripts/wikidata/extract.mjs` — parse de claims do Wikidata + busca do resumo REST da Wikipedia. Unidade isolada e testável.
4. Migração SQL (`supabase/migrations/012_wikidata.sql`) — colunas novas em `politicians` (aplicada pelo usuário no SQL Editor).
5. Frontend — seções novas no perfil + integração com `<Fonte>` (Parte 1).

### APIs (gratuitas, sem chave)

- **Wikidata search**: `https://www.wikidata.org/w/api.php?action=wbsearchentities&search={nome}&language=pt&format=json`
- **Wikidata entity**: `https://www.wikidata.org/wiki/Special:EntityData/{Q}.json`
- **Wikipedia resumo (REST)**: `https://pt.wikipedia.org/api/rest_v1/page/summary/{title}` → campo `extract` (texto puro, sem LLM)
- **Commons imageinfo** (autor/licença): `https://commons.wikimedia.org/w/api.php?action=query&titles=File:{nome}&prop=imageinfo&iiprop=extmetadata&format=json`

Etiqueta: `User-Agent` descritivo (ex.: `AprendaPoliticaBot/1.0 (educação cívica; contato)`) e ritmo gentil (~1 req/s efetivo), igual ao que foi feito com o Google News.

## Unidade — Matching (`scripts/wikidata/match.mjs`)

Entrada: `{ name, birthDate, cargoSlug, uf }` (do político). Saída: `{ qid, confidence } | null`.

Algoritmo:

1. `wbsearchentities` por `name` (pt), pega até 5 candidatos.
2. Para cada candidato, busca a entidade e lê claims:
   - **Exige** `P27` (país de cidadania) incluir `Q155` (Brasil). Sem isso → descarta o candidato.
   - **ALTA**: `P569` (nascimento) == `birthDate` do TSE.
     - Precisão do P569 é dia → compara ano-mês-dia.
     - Precisão só-ano → compara só o ano.
   - **MÉDIA (fallback, quando o candidato não tem P569)**: `P106` (ocupação) inclui `Q82955` (político) **ou** algum `P39` (cargo exercido) compatível com `cargoSlug`/`uf`.
3. Aceita o **melhor** candidato aceito (ALTA > MÉDIA); empate → o que tem sitelink `ptwiki`. Nenhum aceito → `null`.

Decisões de borda: nome com acentos normalizado para a busca; data do TSE em `YYYY-MM-DD`; P569 vem como `+1976-12-14T00:00:00Z` com `precision` (9=ano, 11=dia).

## Unidade — Extração (`scripts/wikidata/extract.mjs`)

Dada a entidade aceita, produz:

- `wikidata_id`: o Q-number.
- `wikipedia_url`: do sitelink `ptwiki` → `https://pt.wikipedia.org/wiki/{title}`.
- `wikipedia_summary`: `extract` do endpoint REST (trunca em ~600 chars; null se ausente).
- `social_links`: array `[{tipo, url}]` de `P856` (site oficial), `P2002` (X/Twitter → `https://x.com/{v}`), `P2003` (Instagram), `P2013` (Facebook), `P2397` (YouTube).
- `wikidata_career`: array `[{cargo, inicio, fim}]` dos `P39` (cargo exercido) com qualificadores `P580` (início) / `P582` (fim); `cargo` = label pt do valor.
- `photo`: se `P18` presente **e** o político não tem `photo_url` (lacuna): `{ url, attribution }` — `url` é a do Commons (hotlink permitido, é CC); `attribution` montado do `extmetadata` (Artist + LicenseShortName).

## Schema — migração (aplicada pelo usuário)

Colunas novas em `politicians` (todas nullable):

```sql
ALTER TABLE politicians
  ADD COLUMN wikidata_id        text,
  ADD COLUMN wikipedia_url      text,
  ADD COLUMN wikipedia_summary  text,
  ADD COLUMN wikidata_career    jsonb,
  ADD COLUMN photo_attribution  text,
  ADD COLUMN photo_source       text,   -- 'tse' | 'commons'
  ADD COLUMN enriched_at        timestamptz;
CREATE INDEX IF NOT EXISTS politicians_wikidata_id_idx ON politicians (wikidata_id);
```

`social_links` e `photo_url` já existem. Fotos do TSE existentes recebem `photo_source='tse'` por padrão na exibição (não precisa backfill: ausência de `photo_source` = TSE).

## Frontend — perfil (`src/app/politico/[slug]/page.tsx`)

Plugando no `<Fonte>` da Parte 1:

- **Seção "Sobre"**: `wikipedia_summary` quando presente, com `<Fonte>` citando Wikipedia/Wikidata e link "Veja na Wikipedia".
- **Carreira**: `wikidata_career` como lista/linha do tempo (cargo · período).
- **Redes**: `social_links` agora preenchidos (a renderização na linha ~200 já existe).
- **Foto**: quando `photo_source='commons'`, legenda fina com `photo_attribution` sob a foto.
- **Bloco "Fonte dos dados"**: passa a incluir `wikidata` (quando `wikidata_id`) e `commons` (quando foto do Commons, com atribuição), além de TSE/Câmara/Senado.

`revalidate` da página mantém o comportamento atual.

## Execução

- Lotes manuais paced: `WIKIDATA_OFFSET` / `WIKIDATA_LIMIT` / `WIKIDATA_DELAY_MS`, rodando incrementalmente (como foi feito com notícias).
- Idempotente: re-rodar atualiza (`enriched_at`); pode pular quem já tem `enriched_at` recente via flag.
- Entrar no **scheduler** (recorrência) é escopo do "além A", **adiado** — fora desta spec.

## Tratamento de erro

- Político sem `birth_date` → tenta só fallback MÉDIO (cargo+estado); se inconclusivo, pula (não arrisca).
- API throttle/timeout → retry com backoff (3 tentativas), depois pula o item e segue (não derruba o lote).
- Entidade sem ptwiki → grava `wikidata_id` + dados estruturados, `wikipedia_url`/`summary` ficam null.
- Foto: só preenche lacuna; nunca sobrescreve foto do TSE existente.

## Testes

- `scripts/wikidata/match.test.ts` (node:test): aceita por nascimento exato; rejeita homônimo (mesmo nome, nascimento diferente); rejeita não-brasileiro (sem Q155); fallback MÉDIO aceita por cargo+estado quando sem P569; retorna null quando nada qualifica.
- `scripts/wikidata/extract.test.ts`: monta `social_links` dos P-codes; extrai `wikidata_career` com início/fim; monta `attribution` do extmetadata; trunca resumo.
- Frontend: render do perfil com/sem dados Wikidata; foto Commons exibe atribuição; tokens do design system (zero hex em className).

## Fora de escopo

- Recorrência no scheduler / hospedagem OCI ("além A").
- Outras fontes (Câmara votações, CEAP, ALEs, bens do TSE — "além B").
- Resumo gerado por LLM (decisão explícita: não gastar LLM; usa o `extract` da Wikipedia).
- Sobrescrever foto do TSE por foto do Commons (política = só lacunas).
