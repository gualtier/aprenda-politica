import { ImageResponse } from 'next/og'
import { OG_SIZE, OgCard } from '@/components/og/OgCard'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Aprenda Política — entenda quem governa o Brasil'

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Educação política · dados públicos"
        title="Entenda quem governa o Brasil"
        subtitle="Do presidente ao vereador — dados reais, em linguagem simples."
      />
    ),
    { ...size },
  )
}
