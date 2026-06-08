import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/og/OgCard'
import { publicClient } from '@/lib/supabase/public'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Organograma político — Aprenda Política'

export default async function Image({ params }: { params: { estado: string; municipio: string } }) {
  const supabase = publicClient()
  const { data: state } = await supabase.from('states').select('id, name, abbr').eq('slug', params.estado).single()
  type S = { id: number; name: string; abbr: string }
  const st = state as S | null

  let cityName = params.municipio.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  if (st) {
    const { data: mun } = await supabase
      .from('municipalities').select('name').eq('slug', params.municipio).eq('state_id', st.id).single()
    if (mun?.name) cityName = mun.name as string
  }

  const title = cityName.length > 34 ? cityName.slice(0, 33) + '…' : cityName

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Organograma político"
        title={title}
        subtitle={st ? `${st.name} · quem governa a cidade` : 'quem governa a cidade'}
      />
    ),
    { ...size },
  )
}
