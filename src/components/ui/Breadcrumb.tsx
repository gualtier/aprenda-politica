import Link from 'next/link'

interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Navegação">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-300">›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#009c3b] transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
