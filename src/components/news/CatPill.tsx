import { categoryLabel, categorySphere, sphereBg } from '@/lib/news'

/** Pílula de categoria, cor sólida da esfera (igual ao design). */
export function CatPill({ category, className = '' }: { category: string | null; className?: string }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold uppercase tracking-wide text-white ${sphereBg(categorySphere(category))} ${className}`}>
      {categoryLabel(category)}
    </span>
  )
}
