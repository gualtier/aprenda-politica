import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sem conexão — Aprenda Política',
}

export default function OfflinePage() {
  return (
    <main className="min-h-[70vh] bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <img src="/logos/icon-mark.png" alt="" className="w-16 h-16 object-contain mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Você está sem conexão</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Não foi possível carregar esta página. Verifique sua internet — as páginas que você já visitou continuam disponíveis.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#00A859] text-white text-sm font-semibold hover:bg-[#007A30] transition-colors"
        >
          Tentar novamente
        </Link>
      </div>
    </main>
  )
}

export const revalidate = false
