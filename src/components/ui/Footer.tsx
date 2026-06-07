import Link from 'next/link'

const NAV = [
  { href: '/', label: 'Início' },
  { href: '/estados', label: 'Estados' },
  { href: '/partidos', label: 'Partidos' },
  { href: '/politicos', label: 'Políticos' },
  { href: '/aprenda', label: 'Aprenda' },
]

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-12 pb-4 text-center">
        <div className="text-[15px] font-semibold tracking-[0.06em] uppercase text-gray-600 leading-[2]">
          Política para <span className="text-verde-600">entender.</span><br />
          Poder para <span className="text-verde-600">transformar.</span>
        </div>
        <img
          src="/illustrations/brasilia-skyline.png"
          alt="Skyline de Brasília"
          className="w-full max-w-[720px] mx-auto mt-3 block"
        />
        <div className="flex justify-center gap-5 mt-2 flex-wrap">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="text-[13px] text-gray-500 hover:text-gray-700">{n.label}</Link>
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-3.5">Aprenda Política · dados públicos · pt-BR</div>
      </div>
    </footer>
  )
}
