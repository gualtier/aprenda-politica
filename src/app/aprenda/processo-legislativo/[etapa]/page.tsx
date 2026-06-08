import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import {
  IconPencil, IconSearch, IconVote, IconRefresh, IconCheckCircle, IconNewspaper,
  IconCheck, IconSpark,
} from '@/components/ui/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>
type Item = { title: string; desc: string }

type Etapa = {
  slug: string
  n: number
  title: string
  short: string
  tagline: string
  accent: string
  soft: string
  Icon: IconType
  oQue: string[]
  detalhes: Item[]
  exemplo: string
  participacao: Item[]
  quem: string
}

const ETAPAS: Etapa[] = [
  {
    slug: 'apresentacao', n: 1, title: 'Apresentação do Projeto', short: 'Apresentação',
    tagline: 'Onde uma ideia vira um projeto de lei', accent: '#2563EB', soft: '#EAF1FB', Icon: IconPencil,
    oQue: [
      'Toda lei começa como um projeto. Ele pode ser apresentado por um deputado, um senador, o Presidente da República, o STF, o Ministério Público — e até pelo próprio povo, por iniciativa popular.',
      'O projeto é protocolado na Casa de origem (Câmara dos Deputados ou Senado) e recebe um número. A partir daí, começa a tramitação.',
    ],
    detalhes: [
      { title: 'PL — Projeto de Lei', desc: 'Lei comum (ordinária), aprovada por maioria simples.' },
      { title: 'PLP — Lei Complementar', desc: 'Regula temas da Constituição; exige maioria absoluta.' },
      { title: 'PEC — Emenda Constitucional', desc: 'Muda a Constituição; exige 3/5 dos votos, em 2 turnos.' },
      { title: 'MP — Medida Provisória', desc: 'Editada pelo Presidente em urgência, com força de lei imediata.' },
    ],
    exemplo: 'A Lei Maria da Penha nasceu de um projeto que tramitou no Congresso até virar a Lei nº 11.340/2006.',
    participacao: [
      { title: 'Iniciativa popular', desc: 'Com assinaturas de cerca de 1% do eleitorado, o povo pode apresentar um projeto diretamente.' },
      { title: 'e-Cidadania (Senado)', desc: 'Você sugere uma ideia legislativa; com apoio suficiente, ela pode virar projeto.' },
    ],
    quem: 'Parlamentares, Presidente, STF, MP ou cidadãos (iniciativa popular)',
  },
  {
    slug: 'comissoes', n: 2, title: 'Análise nas Comissões', short: 'Comissões',
    tagline: 'Onde o projeto é examinado a fundo', accent: '#7c3aed', soft: '#F3EEFD', Icon: IconSearch,
    oQue: [
      'Antes de ir à votação geral, o projeto passa pelas comissões temáticas — saúde, educação, finanças, e a de Constituição e Justiça (CCJ). Elas analisam o mérito, o impacto no orçamento e se o projeto é constitucional.',
      'Um relator estuda o texto e dá um parecer, sugerindo aprovar, rejeitar ou emendar. É aqui que o projeto ganha (ou perde) forma — muitas vezes essa é a etapa mais decisiva.',
    ],
    detalhes: [
      { title: 'Comissões temáticas', desc: 'Analisam o conteúdo conforme a área (saúde, educação, etc.).' },
      { title: 'CCJ', desc: 'A Comissão de Constituição e Justiça checa se o projeto respeita a Constituição.' },
      { title: 'Audiências públicas', desc: 'Especialistas e a sociedade são ouvidos antes da decisão.' },
    ],
    exemplo: 'Um projeto que cria um imposto passa pela Comissão de Finanças e pela CCJ antes de seguir adiante.',
    participacao: [
      { title: 'Acompanhe as audiências públicas', desc: 'São abertas ao cidadão — esta é a fase de maior participação popular no processo.' },
      { title: 'Mande sua opinião ao relator', desc: 'Os gabinetes recebem manifestações que podem influenciar o parecer.' },
    ],
    quem: 'Relator e membros das comissões da Casa',
  },
  {
    slug: 'plenario', n: 3, title: 'Votação no Plenário', short: 'Plenário',
    tagline: 'Onde todos os parlamentares votam', accent: '#00A859', soft: '#E9F7EF', Icon: IconVote,
    oQue: [
      'Aprovado nas comissões, o projeto vai ao plenário — onde todos os parlamentares da Casa votam. É o momento mais visível e onde o seu acompanhamento mais pesa.',
      'O número de votos necessário depende do tipo: maioria simples para um PL, maioria absoluta para um PLP, e 3/5 em dois turnos para uma PEC.',
    ],
    detalhes: [
      { title: 'Maioria simples', desc: 'Metade dos presentes +1 — para leis comuns (PL).' },
      { title: 'Maioria absoluta', desc: 'Metade de todos os parlamentares +1 — para leis complementares.' },
      { title: 'PEC: 3/5 em 2 turnos', desc: 'Emenda à Constituição exige aprovação reforçada, duas vezes.' },
    ],
    exemplo: 'Uma PEC precisa de 308 dos 513 deputados e 49 dos 81 senadores, em dois turnos em cada Casa.',
    participacao: [
      { title: 'Pressione antes da votação', desc: 'Mensagens e campanhas a parlamentares têm mais efeito às vésperas do voto.' },
      { title: 'Acompanhe o voto de cada um', desc: 'A votação é aberta: você vê exatamente como o seu representante votou.' },
    ],
    quem: 'Plenário da Casa iniciante (em geral, a Câmara)',
  },
  {
    slug: 'casa-revisora', n: 4, title: 'Casa Revisora', short: 'Casa Revisora',
    tagline: 'Onde a outra Casa confere o trabalho', accent: '#0891b2', soft: '#E6F6FA', Icon: IconRefresh,
    oQue: [
      'Aprovado numa Casa, o projeto vai à outra: o que passou na Câmara segue para o Senado, e vice-versa. A Casa revisora confirma, emenda ou rejeita o texto.',
      'Se a revisora fizer mudanças, o projeto volta à Casa iniciante para uma nova análise das emendas. Se rejeitar, é arquivado. Esse vai e volta garante que duas casas concordem.',
    ],
    detalhes: [
      { title: 'Aprovação', desc: 'Se a revisora aprova sem mudanças, o projeto segue para sanção.' },
      { title: 'Emendas', desc: 'Se altera o texto, volta à Casa iniciante para decidir sobre as mudanças.' },
      { title: 'Rejeição', desc: 'Se a revisora rejeita, o projeto é arquivado.' },
    ],
    exemplo: 'Um projeto aprovado na Câmara e alterado no Senado retorna à Câmara para a palavra final sobre as emendas.',
    participacao: [
      { title: 'Mais uma chance de agir', desc: 'O texto ainda pode mudar — vale continuar acompanhando e pressionando.' },
      { title: 'Acompanhe nas duas Casas', desc: 'Os portais da Câmara e do Senado mostram a tramitação em tempo real.' },
    ],
    quem: 'A outra Casa do Congresso (Senado ou Câmara)',
  },
  {
    slug: 'sancao', n: 5, title: 'Sanção ou Veto', short: 'Sanção/Veto',
    tagline: 'Onde o chefe do Executivo decide', accent: '#CC9900', soft: '#FFFAE6', Icon: IconCheckCircle,
    oQue: [
      'Aprovado pelas duas Casas, o projeto vai ao Presidente da República (ou ao Governador/Prefeito, nas outras esferas). Ele tem 15 dias úteis para sancionar (aprovar) ou vetar — total ou parcialmente.',
      'O silêncio também aprova: se o prazo passa sem decisão, há sanção tácita. E o veto não é a palavra final — o Congresso pode derrubá-lo.',
    ],
    detalhes: [
      { title: 'Sanção', desc: 'O Presidente concorda e a lei é aprovada.' },
      { title: 'Veto total ou parcial', desc: 'Rejeita a lei inteira ou apenas alguns trechos.' },
      { title: 'Derrubada do veto', desc: 'O Congresso pode derrubar o veto por maioria absoluta e manter a lei.' },
      { title: 'Sanção tácita', desc: 'Se o prazo de 15 dias úteis passa sem decisão, a lei é considerada sancionada.' },
    ],
    exemplo: 'Quando um veto presidencial é derrubado pelo Congresso, a lei entra em vigor mesmo contra a vontade do Presidente.',
    participacao: [
      { title: 'Pressione por sanção ou veto', desc: 'Campanhas públicas costumam mobilizar a opinião nessa fase decisiva.' },
      { title: 'Acompanhe a análise dos vetos', desc: 'O Congresso vota os vetos em sessões específicas — fique de olho.' },
    ],
    quem: 'Presidente da República (ou Governador / Prefeito)',
  },
  {
    slug: 'publicacao', n: 6, title: 'Publicação no Diário Oficial', short: 'Publicação',
    tagline: 'Onde a lei passa a valer para todos', accent: '#6B7280', soft: '#F3F4F6', Icon: IconNewspaper,
    oQue: [
      'Sancionada, a lei é publicada no Diário Oficial com um número (por exemplo, Lei nº 14.133/2021). A publicação é o que a torna oficial e conhecida por todos.',
      'A lei passa a valer na data da publicação — ou depois de um prazo chamado vacatio legis, indicado no próprio texto, para a sociedade ter tempo de se adaptar.',
    ],
    detalhes: [
      { title: 'Número e data', desc: 'A lei ganha um número oficial e entra no ordenamento jurídico.' },
      { title: 'Vigência', desc: 'Em regra, vale a partir da publicação.' },
      { title: 'Vacatio legis', desc: 'Algumas leis preveem um prazo até começar a valer.' },
    ],
    exemplo: 'A LGPD foi publicada em 2018, mas só passou a valer em 2020 — o intervalo foi a vacatio legis.',
    participacao: [
      { title: 'A lei agora é sua', desc: 'Ela vale para todos, e você pode exigir o seu cumprimento na Justiça.' },
      { title: 'Consulte a íntegra', desc: 'O texto fica disponível no Planalto e nos portais legislativos.' },
    ],
    quem: 'Imprensa Nacional (Diário Oficial da União)',
  },
]

const BY_SLUG: Record<string, Etapa> = Object.fromEntries(ETAPAS.map(e => [e.slug, e]))

export function generateStaticParams() {
  return ETAPAS.map(e => ({ etapa: e.slug }))
}

export function generateMetadata({ params }: { params: { etapa: string } }): Metadata {
  const e = BY_SLUG[params.etapa]
  if (!e) return {}
  return {
    title: `${e.title} — Como uma Lei é Criada — Aprenda Política`,
    description: `Etapa ${e.n} do processo legislativo: ${e.tagline}. O que acontece, exemplo e como o cidadão participa.`,
  }
}

function SectionTitle({ eyebrow, title, accent }: { eyebrow: string; title: string; accent: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: accent }}>{eyebrow}</p>
      <h2 className="text-2xl font-bold text-gray-900 tracking-[-0.01em]">{title}</h2>
    </div>
  )
}

export default function EtapaPage({ params }: { params: { etapa: string } }) {
  const e = BY_SLUG[params.etapa]
  if (!e) notFound()

  const idx = ETAPAS.findIndex(x => x.slug === e.slug)
  const prev = idx > 0 ? ETAPAS[idx - 1] : null
  const next = idx < ETAPAS.length - 1 ? ETAPAS[idx + 1] : null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/aprenda" className="hover:text-gray-600">Aprenda</Link>
          <span>›</span>
          <Link href="/aprenda/processo-legislativo" className="hover:text-gray-600">Como uma Lei é Criada</Link>
          <span>›</span>
          <span className="text-gray-600">{e.short}</span>
        </nav>

        {/* Stepper */}
        <div className="flex items-center gap-1.5 mb-8 flex-wrap">
          {ETAPAS.map(s => (
            <Link
              key={s.slug}
              href={`/aprenda/processo-legislativo/${s.slug}`}
              title={s.title}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-110"
              style={s.slug === e.slug
                ? { background: e.accent, color: '#fff' }
                : { background: '#F3F4F6', color: '#9CA3AF' }}
            >
              {s.n}
            </Link>
          ))}
        </div>

        {/* Header */}
        <header className="flex items-start gap-4 mb-8">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: e.soft, color: e.accent }}>
            <e.Icon className="w-7 h-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: e.accent }}>Etapa {e.n} de 6</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-[-0.02em] mt-0.5">{e.title}</h1>
            <p className="text-gray-500 text-lg mt-1">{e.tagline}</p>
          </div>
        </header>

        {/* O que acontece */}
        <section className="mb-12">
          <SectionTitle eyebrow="O que acontece" title="Nesta etapa" accent={e.accent} />
          <div className="space-y-3">
            {e.oQue.map((para, i) => (
              <p key={i} className="text-[15px] text-gray-700 leading-relaxed">{para}</p>
            ))}
          </div>
        </section>

        {/* Detalhes */}
        <section className="mb-12">
          <SectionTitle eyebrow="Como funciona" title="Os detalhes" accent={e.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {e.detalhes.map((d, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <p className="font-semibold text-gray-900 text-sm mb-0.5">{d.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exemplo */}
        <section className="mb-12">
          <SectionTitle eyebrow="Exemplo" title="Na vida real" accent={e.accent} />
          <div className="rounded-2xl p-5 border" style={{ borderColor: `${e.accent}33`, background: e.soft }}>
            <p className="text-sm text-gray-700 leading-relaxed">{e.exemplo}</p>
          </div>
        </section>

        {/* Participação */}
        <section className="mb-12">
          <SectionTitle eyebrow="Sua participação" title="O que você pode fazer aqui" accent={e.accent} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {e.participacao.map((it, i) => (
              <div key={i} className="border rounded-2xl p-5" style={{ borderColor: `${e.accent}40`, background: e.soft }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <IconSpark className="w-4 h-4" style={{ color: e.accent }} />
                  <p className="text-sm font-bold text-gray-900">{it.title}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{it.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5" style={{ color: e.accent }} />
            Quem decide nesta etapa: <span className="text-gray-600 font-medium">{e.quem}</span>
          </p>
        </section>

        {/* Nav */}
        <div className="border-t border-gray-100 pt-6 flex items-center justify-between gap-3 text-sm">
          {prev ? (
            <Link href={`/aprenda/processo-legislativo/${prev.slug}`} className="text-gray-500 hover:text-gray-800">← {prev.n}. {prev.short}</Link>
          ) : (
            <Link href="/aprenda/processo-legislativo" className="text-gray-500 hover:text-gray-800">← Visão geral</Link>
          )}
          {next ? (
            <Link href={`/aprenda/processo-legislativo/${next.slug}`} className="font-medium hover:underline" style={{ color: e.accent }}>{next.n}. {next.short} →</Link>
          ) : (
            <Link href="/aprenda/processo-legislativo" className="font-medium hover:underline" style={{ color: e.accent }}>Ver o fluxo completo →</Link>
          )}
        </div>
      </div>
    </main>
  )
}

export const revalidate = false
