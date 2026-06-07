'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Início' },
  { href: '/estados', label: 'Estados' },
  { href: '/partidos', label: 'Partidos' },
  { href: '/politicos', label: 'Políticos' },
  { href: '/aprenda', label: 'Aprenda' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" aria-label="Aprenda Política — Início" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logos/icon-mark.png"
            alt=""
            width={72}
            height={72}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="w-px h-7 bg-gray-200" aria-hidden />
          <span className="flex flex-col leading-[0.92] font-extrabold tracking-[-0.01em] text-gray-900">
            <span className="text-[15px]">Aprenda</span>
            <span className="text-[15px]">Política</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#00A859]/10 text-[#00A859]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
