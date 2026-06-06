# Infraestrutura OCI + Pipeline Nacional de Sync

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mover todo trabalho pesado (sync nacional TSE, fotos, notícias) para uma VM OCI Always Free com Docker Compose, num repositório separado, com deploy automático via GitHub Actions + SSH.

**Architecture:** O repositório `aprenda-politica-workers` roda no OCI como uma stack Docker Compose com Redis (BullMQ), quatro workers (sync, photos, news, bull-board) e OCI Object Storage para fotos. O Vercel serve o Next.js; Cloudflare é o DNS global e atua como CDN na frente do OCI Object Storage para fotos. O Supabase permanece no free tier usado apenas como banco.

**Tech Stack:** Docker Compose · Node.js 20 (ARM64) · BullMQ + Redis · TypeScript · OCI Always Free (Ampere A1 4CPU/24GB) · OCI Object Storage · Cloudflare Free · GitHub Actions · Vercel ISR revalidation

---

## Infraestrutura de custos

| Serviço | Uso | Custo |
|---|---|---|
| Vercel Free | Next.js frontend + CDN | $0 |
| Supabase Free | PostgreSQL (65 MB dados) | $0 |
| OCI Always Free | VM 4CPU/24GB + 20 GB Object Storage | $0 |
| Cloudflare Free | DNS + CDN para fotos | $0 |
| **Total** | | **$0/mês** |

---

## Repositório: `aprenda-politica-workers`

```
aprenda-politica-workers/
├── docker-compose.yml
├── docker-compose.prod.yml         # override com restart policies
├── .env.example
├── packages/
│   ├── shared/                     # tipos compartilhados, cliente Supabase
│   │   ├── src/supabase.ts
│   │   ├── src/queue.ts            # BullMQ queues e job types
│   │   └── src/oci-storage.ts      # upload para OCI Object Storage
│   ├── sync-worker/                # sync TSE 27 estados + Câmara + Senado
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── index.ts            # BullMQ worker entry
│   │       ├── tse.ts              # syncTSEBrazil() — extraído do Next.js
│   │       ├── camara.ts
│   │       └── senado.ts
│   ├── photo-worker/               # download ZIPs TSE → OCI Storage
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── index.ts
│   │       └── tse-photos.ts
│   ├── news-worker/                # scraping + IA por município (fase 2)
│   │   ├── Dockerfile
│   │   └── src/
│   │       └── index.ts            # stub — implementado na fase de notícias
│   └── scheduler/                  # cron jobs que enfileiram no BullMQ
│       ├── Dockerfile
│       └── src/
│           └── index.ts
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions → SSH → OCI
└── scripts/
    └── setup-oci.sh                # provisionamento inicial do servidor
```

---

## Filas BullMQ

| Queue | Jobs | Concorrência |
|---|---|---|
| `sync` | `sync-tse-state` (por UF), `sync-camara`, `sync-senado`, `sync-federal` | 2 |
| `photos` | `process-photos-state` (por UF) | 1 |
| `news` | `scrape-municipality` (por município) | 3 |
| `revalidate` | `revalidate-vercel` | 5 |

---

## Agendamento (cron — `scheduler`)

| Job | Schedule | Descrição |
|---|---|---|
| Sync TSE nacional | Domingo 02h00 BRT | Enfileira `sync-tse-state` para cada UF dos 27 estados |
| Sync Câmara + Senado | Domingo 02h30 BRT | Enfileira `sync-camara` e `sync-senado` |
| Photos | Domingo 04h00 BRT | Enfileira `process-photos-state` para UFs com políticos sem foto |
| Notícias | Diário 06h00 BRT | Enfileira `scrape-municipality` (fase 2) |

Após cada sync bem-sucedido, o worker enfileira `revalidate-vercel` que chama `POST /api/revalidate` no Vercel com um `REVALIDATE_SECRET`.

---

## OCI Object Storage — fotos

- Bucket público: `politician-photos`
- Path: `/{uf}/{sq_candidato}.jpg` (ex: `/es/80002264925.jpg`)
- URL pública via Cloudflare: `https://fotos.aprendapolitica.com.br/es/80002264925.jpg`
- CNAME no Cloudflare: `fotos.aprendapolitica.com.br` → `{namespace}.objectstorage.{region}.oci.customer-oci.com`
- Cloudflare proxy ativado (laranja) → cache edge global

O `photo_url` dos políticos no Supabase é atualizado para `https://fotos.aprendapolitica.com.br/{uf}/{sq}.jpg` após upload bem-sucedido.

---

## CI/CD — GitHub Actions + SSH

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to OCI
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.OCI_HOST }}
          username: ubuntu
          key: ${{ secrets.OCI_SSH_KEY }}
          script: |
            cd ~/aprenda-politica-workers
            git pull origin main
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Secrets necessários no GitHub: `OCI_HOST`, `OCI_SSH_KEY`.

---

## Bull Board (monitoramento)

- Porta `3001`, acessível apenas via SSH tunnel: `ssh -L 3001:localhost:3001 ubuntu@{oci-ip}`
- Basic auth com `BULL_BOARD_USER` / `BULL_BOARD_PASSWORD` do `.env`
- Não exposto à internet (sem regra de ingress no OCI Security List)

---

## Variáveis de ambiente (`.env`)

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OCI Object Storage
OCI_NAMESPACE=
OCI_BUCKET=politician-photos
OCI_REGION=sa-saopaulo-1
OCI_ACCESS_KEY_ID=
OCI_SECRET_ACCESS_KEY=

# Vercel revalidation
VERCEL_REVALIDATE_URL=https://aprendapolitica.com.br/api/revalidate
REVALIDATE_SECRET=

# Bull Board auth
BULL_BOARD_USER=admin
BULL_BOARD_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Provisioning inicial do OCI (one-time)

1. Criar instância Ampere A1 (4 OCPU, 24 GB) com Ubuntu 22.04
2. Configurar Security List: porta 22 (SSH) apenas
3. Instalar Docker + Docker Compose
4. Clonar `aprenda-politica-workers`
5. Copiar `.env` com secrets
6. `docker compose up -d`

Script em `scripts/setup-oci.sh` automatiza os passos 3–6.

---

## Migração do código de sync

O código de sync atual em `aprenda-politica/src/lib/sync/` é **copiado** (não movido) para `aprenda-politica-workers/packages/sync-worker/src/`. O Next.js mantém o endpoint `/api/sync` funcional para desenvolvimento local, mas em produção o sync passa a ser responsabilidade exclusiva dos workers.

A função `syncTSEBrazil()` (já implementada em `tse.ts`) é o ponto de entrada principal do sync-worker.

---

## O que está fora do escopo deste spec

- Plataforma de notícias (news-worker é stub neste spec)
- Enriquecimento de dados dos políticos (propostas, votações)
- Deploy do Next.js no Vercel (documentado separadamente)
- Monitoramento avançado (métricas, alertas) — fase posterior
