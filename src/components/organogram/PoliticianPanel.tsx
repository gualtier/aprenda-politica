'use client'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { SpectrumBar } from '@/components/ui/SpectrumBar'
import { formatMandate } from '@/lib/utils'
import type { Politician } from '@/types'

interface PoliticianPanelProps {
  politician: Politician
  onClose: () => void
}

const ESFERA_LABEL: Record<string, string> = { federal: 'Federal', state: 'Estadual', municipal: 'Municipal' }

function officialUrl(p: Politician): { href: string; label: string } | null {
  if (!p.external_id) return null
  if (p.source === 'camara') return { href: `https://www.camara.leg.br/deputados/${p.external_id}`, label: 'Perfil na Câmara' }
  if (p.source === 'senado') return { href: `https://www25.senado.leg.br/web/senadores/senador/-/perfil/${p.external_id}`, label: 'Perfil no Senado' }
  return null
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-800 text-right">{children}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 px-6 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2.5">{title}</p>
      {children}
    </div>
  )
}

export function PoliticianPanel({ politician: p, onClose }: PoliticianPanelProps) {
  const local = p.municipality ? `${p.municipality.name} · ${p.state?.abbr ?? ''}`.trim() : p.state?.name ?? null
  const esfera = p.position ? ESFERA_LABEL[p.position.level] ?? null : null
  const official = officialUrl(p)
  const socials = p.social_links?.filter(s => s?.url) ?? []
  const proposals = p.proposals ?? []
  // TSE usa "OUTROS"/"NÃO INFORMADO" como ocupação genérica — não vale mostrar
  const occupation = p.occupation && !/^(outros?|n[ãa]o informad)/i.test(p.occupation.trim()) ? p.occupation : null

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto md:h-full md:w-80 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right rounded-t-2xl md:rounded-none max-h-[88vh] md:max-h-full overflow-hidden"
      role="complementary"
      aria-label="Detalhes do político"
    >
      {/* Drag handle — mobile only */}
      <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0">
        <div className="w-10 h-1 rounded-full bg-gray-200" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{p.position?.name}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Fechar painel">
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Identidade */}
        <div className="p-6 flex flex-col items-center gap-3 border-b border-gray-100">
          <Avatar name={p.name} photoUrl={p.photo_url} size={96} />
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{p.name}</h2>
            {p.party && (
              <div className="text-sm font-medium mt-1" style={{ color: p.party.color_hex }}>
                {p.party.name} ({p.party.abbr})
              </div>
            )}
            {occupation && <div className="text-xs text-gray-500 mt-1">{occupation}</div>}
          </div>
        </div>

        {/* Dados gerais */}
        <div className="px-6 py-4 flex flex-col gap-2.5 text-sm">
          {esfera && <Row label="Esfera">{esfera}</Row>}
          {local && <Row label="Atuação">{local}</Row>}
          {p.mandate_start && <Row label="Mandato">{formatMandate(p.mandate_start, p.mandate_end)}</Row>}
        </div>

        {/* Posicionamento */}
        {p.spectrum_position != null && (
          <Section title="Posicionamento">
            <SpectrumBar position={p.spectrum_position} />
          </Section>
        )}

        {/* Resumo / bio */}
        {p.bio && (
          <Section title="Resumo">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">{p.bio}</p>
          </Section>
        )}

        {/* Propostas (prévia) */}
        {proposals.length > 0 && (
          <Section title={`Propostas · ${proposals.length}`}>
            <ul className="space-y-1.5">
              {proposals.slice(0, 3).map((pr, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                  <span className="text-[#00A859] mt-0.5 shrink-0">•</span>
                  <span className="line-clamp-1">{pr.title}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Redes + fonte oficial */}
        {(socials.length > 0 || official || p.government_plan_url) && (
          <Section title="Links">
            <div className="flex flex-wrap gap-2">
              {socials.map(s => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors capitalize"
                >
                  {s.platform}
                </a>
              ))}
              {p.government_plan_url && (
                <a
                  href={p.government_plan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium px-2.5 py-1 rounded-full border border-amarelo-600/30 text-amarelo-600 hover:bg-amarelo-50 transition-colors"
                >
                  Plano de governo
                </a>
              )}
              {official && (
                <a
                  href={official.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                >
                  {official.label} ↗
                </a>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t shrink-0">
        <Link
          href={`/politico/${p.slug}`}
          className="block w-full text-center bg-[#00A859] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#007a30] transition-colors"
        >
          Ver perfil completo →
        </Link>
      </div>
    </aside>
  )
}
