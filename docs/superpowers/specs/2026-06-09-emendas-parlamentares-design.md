# Emendas Parlamentares — Design

**Data:** 2026-06-09
**Projeto:** Aprenda Política
**Status:** Aprovado (design) — aguardando spec review

## Objetivo

Trazer as **emendas parlamentares ao orçamento** para o Aprenda Política em duas frentes:
uma **página didática** (o que são, tipos, orçamento impositivo, fiscalização) e um
**objeto do sistema** (entidade `emendas` ingerida da API do Portal da Transparência,
cruzada com políticos, partidos e municípios). Ângulo cívico forte: **"quanto seu
deputado destinou pra sua cidade"** e **"quanto sua cidade recebeu, e de quem"**.

## Fonte de dados (confirmada)

**Portal da Transparência — API** `https://api.portaldatransparencia.gov.br/api-de-dados/emendas`
- Auth: header `chave-api-dados: <token>` (token grátis via cadastro gov.br). Já obtido; guardado
  em `aprenda-politica-workers/.env` como `PORTAL_TRANSPARENCIA_KEY` (gitignored).
- Paginação: `?ano=YYYY&pagina=N` (15 registros/página).
- Campos (verificados): `codigoEmenda, ano, tipoEmenda, autor, nomeAutor, numeroEmenda,
  localidadeDoGasto, funcao, subfuncao, valorEmpenhado, valorLiquidado, valorPago,
  valorRestoInscrito, valorRestoCancelado, valorRestoPago`.
- Valores em BRL string (`"10.000,00"`). `localidadeDoGasto` = `"MUNICÍPIO - UF"` (ou UF, ou
  nacional). `tipoEmenda` traz o tipo por extenso (Individual / Bancada / Comissão / Relator).
- Exemplo real: `LUISA CANZIANI · Emenda Individual · LONDRINA - PR · Saúde · R$ 10.000 pago`.

## Decisões (do brainstorming)

| Tema | Decisão |
|------|---------|
| Caminho | Pego a chave → **as duas frentes** (Aprenda primeiro, depois o objeto) |
| Tipos | **Todas** (individual, bancada, comissão, relator) |
| Recorte | **2023→2025** (mandato atual) |
| Unidade | **Linha de execução** (emenda × localidade × função) |

## Arquitetura

### Frente 1 — Página no Aprenda (`/aprenda/emendas`)

Guia didático no padrão dos guias existentes (poderes/esferas/cargos/impostos): RSC estático,
tokens do design system, com seções:
- **O que é** uma emenda parlamentar (como o parlamentar direciona verba do orçamento).
- **Tipos**: individual (autor único → destino), de bancada (estadual), de comissão, de
  **relator (RP9)** — com a controvérsia da transparência.
- **Orçamento impositivo**: o que o governo é obrigado a pagar.
- **Empenhado × pago**: dinheiro prometido vs efetivamente entregue.
- **O que o cidadão pode fiscalizar** (deveres/o que acompanhar).
- Cross-link para `/emendas` (os dados reais) quando existir.

Sem dependência de dados — entra primeiro. Adicionar ao submenu "Aprenda Política" da navbar
e ao hub `/aprenda`.

### Frente 2 — Objeto do sistema

**Modelo (migration 008)** — nível de **linha de execução**:
```sql
CREATE TABLE emendas (
  id              BIGSERIAL PRIMARY KEY,
  codigo          TEXT NOT NULL,         -- codigoEmenda
  ano             INTEGER,
  numero          TEXT,                  -- numeroEmenda
  tipo            TEXT,                  -- tipoEmenda (texto)
  tipo_grupo      TEXT,                  -- 'individual'|'bancada'|'comissao'|'relator' (derivado)
  autor_nome      TEXT,
  politician_id   BIGINT REFERENCES politicians(id),       -- casado (individuais)
  funcao          TEXT,
  subfuncao       TEXT,
  localidade_raw  TEXT,                  -- "LONDRINA - PR"
  municipality_id BIGINT REFERENCES municipalities(id),    -- casado
  uf              TEXT,
  valor_empenhado NUMERIC DEFAULT 0,
  valor_liquidado NUMERIC DEFAULT 0,
  valor_pago      NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(codigo, localidade_raw, funcao, ano)
);
-- índices: politician_id, municipality_id, ano, uf, funcao, tipo_grupo
-- RLS: public_read (igual às demais)
```
O grão exato (se `codigoEmenda` repete por localidade/função) confirma-se na 1ª ingestão; a
chave única cobre os dois casos.

**Ingestão (workers)** — `scripts/sync-emendas.mjs`:
- Para cada ano (2023→2025), paginar a API com a chave.
- **Parse**: valores BRL→numérico; `localidadeDoGasto`→ `{ municipio, uf }`; `tipoEmenda`→`tipo_grupo`.
- **Casamento autor→político**: nome normalizado (slugify), restrito a federais
  (deputado-federal/senador). Bancada/comissão/relator → `politician_id = null` (guarda `autor_nome`).
- **Casamento localidade→município**: por nome normalizado + UF (técnica dos municípios).
  Localidades estaduais/nacionais → `municipality_id = null`, `uf` preenchido quando houver.
- Upsert idempotente (`onConflict codigo,localidade_raw,funcao,ano`).

**Camada de consulta** (`src/lib/emendas.ts`): formatação de R$ (centavos→`R$ x mil/mi`),
`tipoGrupoLabel`, e funções:
- `listEmendas(filtro)`: ano, autor(slug), partido(slug via party_ids? não — via politician),
  uf, municipio(slug), funcao, tipo_grupo, q; paginado.
- `emendasByPolitician(id)`: total destinado + top municípios + top funções.
- `emendasByMunicipality(id)`: total recebido + top autores (parlamentares).
- `emendaStats`/agregados para a página `/emendas`.

**Páginas (RSC, design system, padrão das proposições):**
- **`/emendas`** — lista + filtros (ano, UF, município, função, tipo, autor) + faixa de dados
  (total empenhado/pago, por tipo). Card: autor (chip partido) · **valor pago** · destino
  (município-UF) · função.
- **Perfil do político** (`/politico/[slug]`): bloco "Emendas — destinou **R$ X**"; top
  municípios e funções; link "ver todas".
- **Página do município** (`/[estado]/[municipio]`): bloco "Emendas recebidas — **R$ Y**";
  top parlamentares que destinaram. **(o ângulo matador)**
- **Página do partido**: total/recentes de emendas dos filiados.
- **Cross-link `funcao ↔ tema`**: mapear funções comuns (Saúde, Educação…) para os slugs de
  tema, linkando emenda → landing de tema e vice-versa.
- **SEO**: `/emendas` + (opcional) por-UF no sitemap; JSON-LD; metadata com o apelo cívico.

## Faseamento

**Ciclo único, em ordem:**
1. **Aprenda** `/aprenda/emendas` (conteúdo) + navbar/hub — sem blocker.
2. Migration 008 (`emendas`) — usuário aplica no SQL Editor.
3. Ingestão (`sync-emendas.mjs`) + casamentos + backfill 2023→2025.
4. `src/lib/emendas.ts` (consulta/agregados).
5. Páginas: `/emendas` (lista+filtros), bloco no perfil, **bloco no município**, bloco no partido.
6. Sitemap + JSON-LD + `funcao↔tema`.

## Riscos / decisões

- **Casamento por nome** (autor e município) tem ambiguidade (homônimos) — mitiga com restrição
  por cargo federal / UF, e log de não-casados. Reprocessável.
- **Bancada/comissão/relator** sem autor individual → `politician_id null`; aparecem como
  agregado (por UF / sem perfil). O ângulo "seu deputado" é nas **individuais**.
- **Localidades não-municipais** (estaduais/nacionais) → sem `municipality_id`; entram nos
  totais por UF/Brasil.
- **Volume**: milhares de linhas/ano × 3 anos; paginação de 15/página = muitas requisições —
  rodar local (chave + paginação), com retry/backoff.
- **Valores**: distinguir **empenhado** (prometido) de **pago** (entregue) na UI — destacar o pago.

## Critérios de sucesso

- `/aprenda/emendas` publicada (didática), na navbar e no hub.
- `emendas` populada (2023→2025) com autor e município casados onde possível.
- `/emendas` lista e filtra; perfil do político mostra "destinou R$ X"; **página do município
  mostra "recebeu R$ Y e de quem"**; partido mostra emendas.
- `funcao↔tema` linkando emendas e temas.
- Re-rodar a ingestão é idempotente.
