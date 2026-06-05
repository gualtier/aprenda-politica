import { SearchBar } from '@/components/search/SearchBar'
import { BrazilMap } from '@/components/map/BrazilMap'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <div>
            <span className="text-xl font-bold text-gray-900">Aprenda Política</span>
            <div className="w-6 h-0.5 bg-[#009c3b] mt-0.5" />
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Entenda o poder<br />
          <span className="text-[#009c3b]">na sua cidade.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-md">
          Dados reais. Linguagem simples. Do presidente ao vereador.
        </p>
        <SearchBar />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Ou clique no mapa para explorar por estado
        </h2>
        <BrazilMap />
      </section>
    </main>
  )
}
