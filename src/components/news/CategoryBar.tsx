import Link from 'next/link'
import { NEWS_CATEGORIES } from '@/lib/news'
const ESF: Record<string, string> = { federal: 'text-esfera-federal', estadual: 'text-esfera-estadual', municipal: 'text-amarelo-600' }
export function CategoryBar({ active }: { active: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {NEWS_CATEGORIES.map(c => {
        const on = (active || 'todos') === c.id
        const href = c.id === 'todos' ? '/noticias' : `/noticias?cat=${c.id}`
        return (
          <Link key={c.id} href={href}
            className={`shrink-0 text-sm font-medium rounded-full px-3.5 py-1.5 border transition-colors ${on ? 'bg-gray-900 text-white border-gray-900' : `border-gray-200 hover:border-gray-400 ${c.sphere ? ESF[c.sphere] : 'text-gray-600'}`}`}>
            {c.label}
          </Link>
        )
      })}
    </div>
  )
}
