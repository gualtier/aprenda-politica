# Aprenda Política — Design Spec

**Data:** 2026-06-05
**Status:** Em revisão

---

## Contexto

A maioria dos cidadãos brasileiros desconhece quem são seus representantes eleitos e como as esferas de governo interagem com seu cotidiano. O **Aprenda Política** é um PWA que desmistifica o poder público brasileiro através de um organograma visual interativo, navegável do nível federal até o municipal, alimentado por dados abertos oficiais.

O objetivo é ser a referência mais acessível, bonita e confiável para entender quem governa o Brasil — com foco em leitura fácil e cidadãos comuns como público-alvo.

---

## Escopo do MVP

**Piloto:** Vitória / Espírito Santo / Brasil
**Após validação:** replicar automaticamente para os 5.570 municípios brasileiros via geração estática.

O MVP cobre exclusivamente o **Organograma Interativo** — os demais módulos (conteúdo educacional, agregador de notícias) são v2.

---

## Stack Tecnológica

| Camada | Tecnologia | Motivo |
| ------ | ---------- | ------ |
| Frontend | Next.js 14 (App Router) | SSG/ISR para SEO, PWA, ecossistema React |
| Estilo | Tailwind CSS | Utilitário, consistência, performance |
| Organograma | React Flow | Nós customizáveis, zoom/pan, expansão |
| Mapa | Leaflet + react-leaflet | Leve, open-source, sem custo de API |
| Backend/DB | Supabase (PostgreSQL) | Postgres gerenciado, Edge Functions, Storage |
| Cache | Upstash Redis | Cache de queries frequentes, rate limiting |
| Deploy | Vercel | ISR nativo, Edge Network, CI/CD |
| Sync de dados | Vercel Cron Jobs | Atualização diária das APIs públicas |

---

## Arquitetura de Dados

### Fontes públicas

| Fonte | Dados | Tipo |
|-------|-------|------|
| Câmara dos Deputados API | Deputados federais, fotos, partidos, votações | REST API |
| Senado Federal API | Senadores, fotos, mandatos | REST API |
| TSE Dados Abertos | Partidos, eleições, candidaturas | REST API |
| IBGE API | Municípios, estados, população | REST API |
| ALES (ales.es.gov.br) | Deputados estaduais ES, fotos | Scraping |
| CM-Vitória (camaravitoria.es.gov.br) | Vereadores, fotos | Scraping |
| Portal da Transparência ES/VIX | Dados executivos | Scraping |

### Schema principal (Supabase)

```sql
politicians       -- id, name, photo_url, slug, party, position_id, mandate_start, mandate_end, state_id, municipality_id, external_id
positions         -- id, name, slug, level (federal|state|municipal), branch (executive|legislative|judicial), description
municipalities    -- id, name, slug, state_id, ibge_code, population
states            -- id, name, slug, abbr
parties           -- id, name, abbr, color_hex
sync_logs         -- source, last_synced_at, status, error
```

Fotos sincronizadas e armazenadas no **Supabase Storage** (bucket público, servido via CDN). Nunca hotlink para APIs do governo em runtime.

### Sync strategy

- Cron job diário (02h): busca dados de todas as APIs e atualiza o banco
- ISR com revalidação de 24h nas páginas de município
- Fallback para dados em cache se API pública estiver indisponível

---

## Rotas (Next.js App Router)

```text
/                          → Home: busca + mapa do Brasil
/[estado]                  → Página do estado (ex: /espirito-santo)
/[estado]/[municipio]      → Organograma completo (ex: /espirito-santo/vitoria)
/politico/[slug]           → Perfil do político
/cargo/[cargo]             → Página educativa do cargo (v2)
/api/search                → Busca full-text (Edge Function)
/api/sync                  → Trigger manual de sync (admin)
```

Todas as páginas de município geradas estaticamente via `generateStaticParams` — uma página por município do Brasil.

---

## Organograma — Design

### Estrutura visual

Orientação **vertical (top-down)**. Cada esfera é uma seção com label colorido à esquerda:

```text
🔵 FEDERAL
├── ⚡ Executivo     │ 📜 Legislativo           │ ⚖️ Judiciário (v2)
│   Presidente       │ Câmara (10 dep. ES)       │ STF, STJ
│                    │ Senado (3 sen. ES)         │

🟢 ESTADUAL · ES
├── ⚡ Executivo     │ 📜 Legislativo           │ ⚖️ Judiciário (v2)
│   Governador       │ ALES (30 dep. estaduais)  │ TJ-ES

🟡 MUNICIPAL · VITÓRIA
├── ⚡ Executivo     │ 📜 Legislativo
│   Prefeito         │ Câmara Municipal (26 ver.)
```

Judiciário aparece acinzentado com label "v2" — incluso no layout para educar sobre separação de poderes, mas sem dados no MVP.

### Exibição de fotos

**Todos os rostos visíveis diretamente** (grid sempre visível):

- **Políticos individuais** (Presidente, Governador, Prefeito): card com foto circular 48px + nome + partido + mandato
- **Grupos** (Deputados, Senadores, Vereadores): grid de avatares circulares 40px com nome abaixo e partido em legenda mínima. Todos os membros visíveis diretamente no organograma, sem truncamento — lazy loading por imagem para manter performance.
- Fotos com `loading="lazy"` + placeholder de iniciais em caso de erro
- Imagens servidas via Supabase CDN, otimizadas via Next.js `<Image>` (WebP, responsive)

### Interação

- Clicar em qualquer político → **painel lateral deslizante** com: foto grande, nome completo, partido, mandato (início–fim), contato oficial, link para perfil completo
- Breadcrumb sempre visível: `Brasil › ES › Vitória`

---

## Design Visual — Sistema

**Estilo:** Minimalista Brasileiro

| Token | Valor |
|-------|-------|
| Cor primária | `#009c3b` (verde Brasil) |
| Cor secundária | `#FFDF00` (amarelo, uso pontual) |
| Federal | `#2255aa` |
| Estadual | `#007a30` |
| Municipal | `#cc9900` |
| Background | `#ffffff` |
| Surface | `#f9f9f7` |
| Texto | `#111111` |
| Texto secundário | `#666666` |
| Tipografia | Inter (sans-serif) |
| Border radius | `8px` cards, `50%` avatares |
| Sombra | `0 2px 6px rgba(0,0,0,0.08)` |

---

## PWA

- `manifest.json` com nome, ícones, `theme_color: #009c3b`
- Service worker via **Workbox** (Next.js built-in PWA via `next-pwa`)
- Cache strategy: stale-while-revalidate para páginas, cache-first para imagens
- Offline: exibe última versão cacheada com banner "Você está offline"

---

## SEO / AEO

- Cada página de município tem `<title>`, `description`, `og:image` gerados dinamicamente
- Schema.org `Person` para cada político (nome, cargo, partido, mandato)
- Schema.org `GovernmentOrganization` para câmaras e assembleias
- Sitemap gerado automaticamente para todos os municípios
- URLs semânticas e amigáveis: `/espirito-santo/vitoria`

---

## Navegação — Home

Duas entradas principais:

1. **Busca full-text** no topo: `"Sua cidade, estado ou político..."` — retorna municípios e políticos, redireciona para a página correspondente
2. **Mapa do Brasil** (Leaflet): clicável por estado → lista municípios → abre organograma

---

## Fora do escopo MVP

- Judiciário (dados, perfis de magistrados)
- Secretarias municipais e estaduais
- Conteúdo educacional ("O que faz um vereador?")
- Agregador de notícias
- Autenticação de usuários
- Comparador de políticos
- Histórico de mandatos anteriores

---

## Verificação

1. `npm run dev` → abrir `/espirito-santo/vitoria` e confirmar organograma com 3 esferas
2. Confirmar fotos carregando para todos os políticos (com lazy loading)
3. Clicar em político → painel lateral abre corretamente
4. Busca por "Vitória" → redireciona para página correta
5. Mapa clicável: ES → Vitória → organograma
6. Lighthouse PWA score > 90, Performance > 85
7. `generateStaticParams` gera páginas para todos os municípios do ES sem erro
8. Sync job popula banco com dados da Câmara dos Deputados e Senado
