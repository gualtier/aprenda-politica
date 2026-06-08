/* Card base para as OG images (next/og). Só flexbox — sem CSS avançado. */
import type { ReactElement } from 'react'

export const OG_SIZE = { width: 1200, height: 630 }

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function OgCard({
  eyebrow,
  title,
  subtitle,
  accent = '#00A859',
  initials,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  accent?: string
  initials?: string
}): ReactElement {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff' }}>
      {/* Barra de acento à esquerda */}
      <div style={{ width: 18, height: '100%', background: accent, display: 'flex' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px' }}>
        {/* Topo: avatar + eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {initials ? (
            <div style={{
              width: 104, height: 104, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${accent}1f`, color: accent, fontSize: 44, fontWeight: 700,
            }}>
              {initials}
            </div>
          ) : null}
          <div style={{ display: 'flex', fontSize: 28, color: '#6B7280', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>
            {eyebrow}
          </div>
        </div>

        {/* Meio: título + subtítulo */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, color: '#111827', lineHeight: 1.05 }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: 'flex', fontSize: 36, color: '#6B7280', marginTop: 18 }}>{subtitle}</div>
          ) : null}
        </div>

        {/* Rodapé: marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: accent, display: 'flex' }} />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, color: '#111827' }}>Aprenda</div>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, color: accent }}>Política</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#9CA3AF', marginLeft: 8 }}>· aprendapolitica.com.br</div>
        </div>
      </div>
    </div>
  )
}
