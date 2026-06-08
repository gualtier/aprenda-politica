'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type Leaf = { href: string; label: string }
type Group = { href: string; label: string; children: Leaf[] }
type NavLink = { href: string; label: string; groups?: Group[] }

const APRENDA_GROUPS: Group[] = [
  {
    href: '/aprenda/poderes', label: 'Os Três Poderes',
    children: [
      { href: '/aprenda/poderes/executivo', label: 'Executivo' },
      { href: '/aprenda/poderes/legislativo', label: 'Legislativo' },
      { href: '/aprenda/poderes/judiciario', label: 'Judiciário' },
    ],
  },
  {
    href: '/aprenda/esferas', label: 'As Esferas de Governo',
    children: [
      { href: '/aprenda/esferas/federal', label: 'Federal' },
      { href: '/aprenda/esferas/estadual', label: 'Estadual' },
      { href: '/aprenda/esferas/municipal', label: 'Municipal' },
    ],
  },
  {
    href: '/aprenda/cargos', label: 'Os Cargos Políticos',
    children: [
      { href: '/aprenda/cargos/presidente', label: 'Presidente' },
      { href: '/aprenda/cargos/senador', label: 'Senador' },
      { href: '/aprenda/cargos/deputado-federal', label: 'Deputado Federal' },
      { href: '/aprenda/cargos/governador', label: 'Governador' },
      { href: '/aprenda/cargos/deputado-estadual', label: 'Deputado Estadual' },
      { href: '/aprenda/cargos/prefeito', label: 'Prefeito' },
      { href: '/aprenda/cargos/vereador', label: 'Vereador' },
    ],
  },
  {
    href: '/aprenda/processo-legislativo', label: 'Como uma Lei é Criada',
    children: [
      { href: '/aprenda/processo-legislativo/apresentacao', label: '1. Apresentação' },
      { href: '/aprenda/processo-legislativo/comissoes', label: '2. Comissões' },
      { href: '/aprenda/processo-legislativo/plenario', label: '3. Plenário' },
      { href: '/aprenda/processo-legislativo/casa-revisora', label: '4. Casa Revisora' },
      { href: '/aprenda/processo-legislativo/sancao', label: '5. Sanção / Veto' },
      { href: '/aprenda/processo-legislativo/publicacao', label: '6. Publicação' },
    ],
  },
  {
    href: '/aprenda/impostos', label: 'Os Impostos',
    children: [
      { href: '/aprenda/impostos/ir', label: 'IR — Imposto de Renda' },
      { href: '/aprenda/impostos/ipi', label: 'IPI — Industrializados' },
      { href: '/aprenda/impostos/iof', label: 'IOF — Op. Financeiras' },
      { href: '/aprenda/impostos/icms', label: 'ICMS — Mercadorias' },
      { href: '/aprenda/impostos/ipva', label: 'IPVA — Veículos' },
      { href: '/aprenda/impostos/itcmd', label: 'ITCMD — Herança' },
      { href: '/aprenda/impostos/iptu', label: 'IPTU — Imóveis' },
      { href: '/aprenda/impostos/iss', label: 'ISS — Serviços' },
      { href: '/aprenda/impostos/itbi', label: 'ITBI — Compra de imóvel' },
    ],
  },
]

const links: NavLink[] = [
  { href: '/', label: 'Início' },
  { href: '/aprenda', label: 'Aprenda Política', groups: APRENDA_GROUPS },
  { href: '/estados', label: 'Estados' },
  { href: '/partidos', label: 'Partidos' },
  { href: '/politicos', label: 'Políticos' },
]

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)          // off-canvas mobile
  const [menuOpen, setMenuOpen] = useState(false)  // mega-menu desktop
  const [expanded, setExpanded] = useState<string | null>(null) // acordeão mobile

  useEffect(() => {
    setOpen(false)
    setMenuOpen(false)
    setExpanded(null)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const linkBase = 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors'

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/" aria-label="Aprenda Política — Início" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logos/icon-mark.png" alt="" width={72} height={72} className="h-9 w-9 object-contain" priority />
            <span className="w-px h-7 bg-gray-200" aria-hidden />
            <span className="flex flex-col leading-[0.92] font-extrabold tracking-[-0.01em] text-gray-900">
              <span className="text-[15px]">Aprenda</span>
              <span className="text-[15px]">Política</span>
            </span>
          </Link>

          {/* Nav inline — desktop */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(item => {
              const active = isActive(pathname, item.href)
              if (!item.groups) {
                return (
                  <Link key={item.href} href={item.href} className={`${linkBase} ${active ? 'bg-[#00A859]/10 text-[#00A859]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    {item.label}
                  </Link>
                )
              }
              // Mega-menu (Aprenda Política)
              return (
                <div key={item.href} className="relative" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    className={`${linkBase} inline-flex items-center gap-1 ${active ? 'bg-[#00A859]/10 text-[#00A859]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </Link>

                  <div className={`absolute top-full left-0 pt-2 ${menuOpen ? 'block' : 'hidden'}`}>
                    <div className="columns-3 gap-7 bg-white border border-gray-100 rounded-2xl shadow-lg p-5 w-[620px]">
                      {item.groups.map(g => (
                        <div key={g.href} className="break-inside-avoid mb-5">
                          <Link href={g.href} className={`block text-sm font-bold mb-1.5 transition-colors ${pathname.startsWith(g.href) ? 'text-[#00A859]' : 'text-gray-900 hover:text-[#00A859]'}`}>
                            {g.label}
                          </Link>
                          <ul className="space-y-0.5">
                            {g.children.map(c => {
                              const cActive = pathname === c.href
                              return (
                                <li key={c.href}>
                                  <Link href={c.href} className={`block text-[13px] py-0.5 transition-colors ${cActive ? 'text-[#00A859] font-medium' : 'text-gray-500 hover:text-gray-900'}`}>
                                    {c.label}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Hambúrguer — mobile */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="sm:hidden ml-auto -mr-1 p-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop — mobile */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`sm:hidden fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Off-canvas — mobile */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`sm:hidden fixed top-0 right-0 z-[70] h-full w-80 max-w-[88vw] bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <span className="flex items-center gap-2">
            <Image src="/logos/icon-mark.png" alt="" width={56} height={56} className="h-7 w-7 object-contain" />
            <span className="font-extrabold tracking-[-0.01em] text-gray-900 text-sm">Aprenda Política</span>
          </span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 -mr-2 rounded-md text-gray-500 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-2 gap-0.5 overflow-y-auto">
          {links.map(item => {
            const active = isActive(pathname, item.href)
            const itemCls = `px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${active ? 'bg-[#00A859]/10 text-[#00A859]' : 'text-gray-700 hover:bg-gray-50'}`
            if (!item.groups) {
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={itemCls}>
                  {item.label}
                </Link>
              )
            }
            // Aprenda Política — guias com acordeão
            return (
              <div key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className={`block ${itemCls}`}>{item.label}</Link>
                <div className="ml-3 border-l border-gray-100 pl-1.5 mt-0.5 mb-1">
                  {item.groups.map(g => {
                    const isOpen = expanded === g.href
                    return (
                      <div key={g.href}>
                        <div className="flex items-center">
                          <Link href={g.href} onClick={() => setOpen(false)} className={`flex-1 px-2 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${pathname.startsWith(g.href) ? 'text-[#00A859]' : 'text-gray-600 hover:bg-gray-50'}`}>
                            {g.label}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : g.href)}
                            aria-label={isOpen ? 'Recolher' : 'Expandir'}
                            aria-expanded={isOpen}
                            className="p-2 text-gray-400 hover:text-gray-700"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        {isOpen && (
                          <div className="ml-2 border-l border-gray-100 pl-2 pb-1">
                            {g.children.map(c => {
                              const cActive = pathname === c.href
                              return (
                                <Link
                                  key={c.href}
                                  href={c.href}
                                  onClick={() => setOpen(false)}
                                  className={`block px-2 py-1.5 rounded-lg text-[13px] transition-colors ${cActive ? 'text-[#00A859] bg-[#00A859]/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                >
                                  {c.label}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
