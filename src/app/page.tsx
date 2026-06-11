import Link from 'next/link'
import type { CSSProperties } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { BrazilMap } from '@/components/map/BrazilMap'
import { STATES, REGIONS } from '@/lib/states'
import {
  IconScale, IconBank, IconChair, IconScroll,
  IconArrow, IconSpark,
} from '@/components/ui/icons'
import { featuredNews } from '@/lib/news'
import { NewsCard } from '@/components/news/NewsCard'

const WRAP = 'max-w-6xl mx-auto px-6 sm:px-10'

const STATS = [
  { value: '5.570', label: 'Municípios' },
  { value: '27', label: 'Unidades federativas' },
  { value: '513', label: 'Deputados federais' },
  { value: '81', label: 'Senadores' },
  { value: '29', label: 'Partidos no TSE' },
]

const SUGGEST = ['São Paulo', 'Vitória', 'Lula', 'Deputado Federal', 'PT']

const GUIAS = [
  { href: '/aprenda/poderes', Icon: IconScale, title: 'Os Três Poderes', desc: 'Executivo, Legislativo e Judiciário — o que cada um faz e como se equilibram.', tone: '#00A859', soft: '#E9F7EF' },
  { href: '/aprenda/esferas', Icon: IconBank, title: 'As Esferas de Governo', desc: 'Federal, Estadual e Municipal — quem cuida do quê e onde cada poder atua.', tone: '#2255AA', soft: '#EAF1FB' },
  { href: '/aprenda/cargos', Icon: IconChair, title: 'Os Cargos Políticos', desc: 'Do presidente ao vereador — mandatos, competências e como cada um é eleito.', tone: '#7c3aed', soft: '#F3EEFD' },
  { href: '/aprenda/processo-legislativo', Icon: IconScroll, title: 'Como uma Lei é Criada', desc: 'Do projeto à publicação no Diário Oficial — o passo a passo do processo legislativo.', tone: '#CC9900', soft: '#FFFAE6' },
]

const PASSOS = [
  { n: 1, img: '/illustrations/cidadaos.png', title: 'Busque o que importa', desc: 'Digite sua cidade, estado ou o nome de um político. Os resultados aparecem na hora.' },
  { n: 2, img: '/illustrations/congresso.png', title: 'Explore o organograma', desc: 'Veja quem governa nas três esferas — do presidente ao vereador da sua cidade.' },
  { n: 3, img: '/illustrations/checklist.png', title: 'Entenda como funciona', desc: 'Guias visuais explicam poderes, cargos e como uma lei nasce — sem juridiquês.' },
]

// Estados em destaque na home (os demais via "Ver os 27 estados")
const FEATURED = ['ES', 'SP', 'RJ', 'MG', 'BA', 'CE', 'PE', 'PR', 'RS', 'DF']
  .map(abbr => STATES.find(s => s.abbr === abbr)!)

// Termos do glossário em destaque na home
const GLOSSARIO_DESTAQUE = [
  { slug: 'pec', termo: 'PEC' },
  { slug: 'medida-provisoria', termo: 'Medida Provisória' },
  { slug: 'cpi', termo: 'CPI' },
  { slug: 'quorum', termo: 'Quórum' },
  { slug: 'emenda-parlamentar', termo: 'Emenda parlamentar' },
  { slug: 'sancao', termo: 'Sanção' },
  { slug: 'veto', termo: 'Veto' },
  { slug: 'coeficiente-eleitoral', termo: 'Coeficiente eleitoral' },
  { slug: 'foro-privilegiado', termo: 'Foro privilegiado' },
  { slug: 'stf', termo: 'STF' },
  { slug: 'plebiscito', termo: 'Plebiscito' },
  { slug: 'lai', termo: 'LAI' },
]

function Eyebrow({ children, className = 'text-gray-400' }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${className}`}>{children}</span>
}

export default async function HomePage() {
  const noticias = await featuredNews(3)
  return (
    <main className="bg-white text-gray-900">
      {/* ---------- Hero ---------- */}
      <section className={`${WRAP} pt-16 pb-12 flex flex-col items-center text-center gap-6`}>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-verde-50 border border-verde-100">
          <IconSpark className="w-[15px] h-[15px] text-verde-600" />
          <span className="text-[13px] font-semibold text-verde-700 whitespace-nowrap">
            Política para entender. Poder para transformar.
          </span>
        </div>

        <h1 className="text-[40px] sm:text-[56px] font-bold tracking-[-0.03em] leading-[1.04] m-0">
          Entenda o poder<br />
          <span className="text-verde-500">na sua cidade.</span>
        </h1>

        <p className="text-lg sm:text-[19px] text-gray-500 m-0 max-w-[480px] leading-[1.55]">
          Dados reais. Linguagem simples. Do presidente ao vereador — quem governa o Brasil, em um só lugar.
        </p>

        <div className="w-full max-w-[580px] mt-1 flex justify-center">
          <SearchBar />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-[13px] text-gray-400 self-center mr-0.5">Tente:</span>
          {SUGGEST.map(s => (
            <span
              key={s}
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:border-verde-500 hover:bg-verde-50 hover:text-verde-700 transition-colors cursor-default"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Como funciona ---------- */}
      <section className={`${WRAP} pt-8 pb-14`}>
        <div className="text-center mb-9">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-gray-900 mt-2.5">Do clique ao entendimento, em três passos</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PASSOS.map(p => (
            <div key={p.n} className="text-center flex flex-col items-center">
              <div className="w-[120px] h-[120px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-[18px]">
                <img src={p.img} alt="" className="w-[92px] h-[92px] object-contain" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-[22px] h-[22px] rounded-full bg-verde-500 text-white text-xs font-bold flex items-center justify-center">{p.n}</span>
                <h3 className="text-[17px] font-bold text-gray-900 m-0">{p.title}</h3>
              </div>
              <p className="text-sm text-gray-500 m-0 leading-[1.6] max-w-[280px]">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Faixa de estatísticas ---------- */}
      <section className={`${WRAP} pt-2 pb-14`}>
        <div className="flex justify-center flex-wrap border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 min-w-[150px] py-[22px] px-4 text-center ${i === 0 ? '' : 'border-l border-gray-200'}`}
            >
              <div className="text-3xl font-bold text-gray-900 tracking-[-0.02em] leading-none tabular-nums">{s.value}</div>
              <div className="text-[12.5px] text-gray-500 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Aprenda (guias) ---------- */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className={`${WRAP} py-14`}>
          <div className="text-center mb-7">
            <Eyebrow className="text-verde-600">Educação política</Eyebrow>
            <h2 className="text-[30px] font-bold tracking-[-0.02em] text-gray-900 mt-2.5 mb-2">
              Como funciona o poder <span className="text-verde-500">no Brasil?</span>
            </h2>
            <p className="text-[15px] text-gray-500 m-0">Guias visuais, sem juridiquês, para entender o sistema político brasileiro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GUIAS.map(g => (
              <Link
                key={g.href}
                href={g.href}
                className="guide-card flex gap-[18px] items-start bg-white rounded-2xl p-[22px]"
                style={{ '--tone': g.tone } as CSSProperties}
              >
                <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: g.soft, color: g.tone }}>
                  <g.Icon className="w-6 h-6" />
                </span>
                <div className="flex-1">
                  <h3 className="text-[17px] font-bold text-gray-900 mt-0.5 mb-1.5">{g.title}</h3>
                  <p className="text-[13.5px] text-gray-500 m-0 leading-[1.55]">{g.desc}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold whitespace-nowrap" style={{ color: g.tone }}>
                    Ler guia <IconArrow className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Mapa (secundário) ---------- */}
      <section className={`${WRAP} pt-16 pb-16`}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-7 items-center">
          <div>
            <Eyebrow>Explorar visualmente</Eyebrow>
            <h2 className="text-[28px] font-bold tracking-[-0.02em] text-gray-900 mt-2.5 mb-2.5">Navegue pelo mapa do país</h2>
            <p className="text-[15px] text-gray-500 mb-[18px] leading-[1.6] max-w-[380px]">
              Clique em um estado para ver seus municípios, governador e o organograma político completo.
            </p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(r => (
                <span
                  key={r.name}
                  className="region-pill inline-flex items-center gap-2 px-3 py-[7px] rounded-full bg-white text-[13px] font-medium text-gray-700 cursor-default"
                  style={{ '--tone': r.tone } as CSSProperties}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.tone }} />
                  {r.name}
                  <span className="text-gray-400 font-normal">{r.ufs}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
            <BrazilMap />
          </div>
        </div>
      </section>

      {/* ---------- Explorar por estado ---------- */}
      <section className={`${WRAP} pb-16`}>
        <div className="flex items-baseline justify-between mb-[18px] gap-4">
          <div>
            <Eyebrow>Explorar por estado</Eyebrow>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Comece pela sua unidade federativa</h2>
          </div>
          <Link href="/estados" className="text-sm font-medium text-verde-600 inline-flex items-center gap-1 whitespace-nowrap hover:underline">
            Ver os 27 estados <IconArrow className="w-[15px] h-[15px]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {FEATURED.map(s => (
            <Link
              key={s.abbr}
              href={`/${s.slug}`}
              className="group flex flex-col border border-gray-200 rounded-xl p-3.5 hover:border-verde-500 hover:bg-verde-500/5 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <img src={`/flags/states/${s.abbr}.svg`} alt={`Bandeira ${s.name}`} className="w-[46px] h-[31px] object-cover rounded shadow-sm shrink-0" />
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{s.abbr}</span>
              </div>
              <div className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-verde-500">{s.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.munis.toLocaleString('pt-BR')} municípios</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Notícias ---------- */}
      {noticias.length > 0 && (
        <section className={`${WRAP} pb-16`}>
          <div className="flex items-baseline justify-between mb-[18px] gap-4">
            <div>
              <Eyebrow>Na imprensa</Eyebrow>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Notícias que cruzam com o portal</h2>
            </div>
            <Link href="/noticias" className="text-sm font-medium text-verde-600 inline-flex items-center gap-1 whitespace-nowrap hover:underline">
              Ver todas <IconArrow className="w-[15px] h-[15px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {noticias.map(n => <NewsCard key={n.id} n={n} variant="destaque" />)}
          </div>
        </section>
      )}

      {/* ---------- Glossário ---------- */}
      <section className={`${WRAP} pb-20`}>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7 sm:p-9">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div>
              <Eyebrow>Educação política</Eyebrow>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Glossário da política</h2>
              <p className="text-[15px] text-gray-500 mt-1.5 leading-[1.6] max-w-[440px]">PEC, quórum, emenda, sanção… os termos da política explicados em linguagem simples, sem juridiquês.</p>
            </div>
            <Link href="/glossario" className="text-sm font-medium text-verde-600 inline-flex items-center gap-1 whitespace-nowrap hover:underline shrink-0 mt-1">
              Ver o glossário <IconArrow className="w-[15px] h-[15px]" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {GLOSSARIO_DESTAQUE.map(t => (
              <Link key={t.slug} href={`/glossario/${t.slug}`} className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 hover:border-verde-500 hover:text-verde-600 transition-colors">{t.termo}</Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}

export const revalidate = 900
