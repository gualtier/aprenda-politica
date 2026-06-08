import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard, initialsOf } from '@/components/og/OgCard'
import { publicClient } from '@/lib/supabase/public'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Perfil — Aprenda Política'

export default async function Image({ params }: { params: { slug: string } }) {
  const { data } = await publicClient()
    .from('politicians')
    .select('name, party:parties(abbr, color_hex), position:positions(name), state:states(abbr), municipality:municipalities(name)')
    .eq('slug', params.slug)
    .single()

  type P = {
    name: string
    party: { abbr: string; color_hex: string | null } | null
    position: { name: string } | null
    state: { abbr: string } | null
    municipality: { name: string } | null
  }
  const p = data as P | null

  if (!p) {
    return new ImageResponse(
      <OgCard eyebrow="Político" title="Aprenda Política" subtitle="aprendapolitica.com.br" />,
      { ...size },
    )
  }

  const name = p.name.length > 38 ? p.name.slice(0, 37) + '…' : p.name
  const local = p.municipality ? `${p.municipality.name} · ${p.state?.abbr ?? ''}` : p.state?.abbr ?? ''
  const subtitle = [p.party?.abbr, local].filter(Boolean).join('  ·  ')
  const accent = p.party?.color_hex || '#00A859'

  return new ImageResponse(
    (
      <OgCard
        eyebrow={p.position?.name ?? 'Político'}
        title={name}
        subtitle={subtitle || undefined}
        accent={accent}
        initials={initialsOf(p.name)}
      />
    ),
    { ...size },
  )
}
