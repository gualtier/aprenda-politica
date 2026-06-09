'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchResult } from '@/types'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutRef.current)
  }, [query])

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery('')
    router.push(result.href)
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-verde-500 focus-within:ring-1 focus-within:ring-verde-500/30">
        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sua cidade, estado ou político..."
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          aria-label="Buscar município ou político"
          autoComplete="off"
        />
        {loading && <span className="text-gray-400 text-xs">...</span>}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          {results.map((r) => (
            <li key={r.href}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                {r.type === 'municipality' ? (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V7l7-4v18M5 21V12l4-4"/><path d="M13 21v-4h3v4"/></svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
                )}
                <div>
                  <div className="font-semibold text-sm text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.subtitle}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
