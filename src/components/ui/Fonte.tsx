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
