/* Aprenda Política — service worker (offline shell + cache de estáticos) */
const VERSION = 'ap-v1'
const STATIC_CACHE = `${VERSION}-static`
const PAGES_CACHE = `${VERSION}-pages`

// Shell mínimo pré-cacheado na instalação
const PRECACHE = [
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/logos/icon-mark.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Estáticos públicos seguros para cache (conteúdo estável)
function isCacheableAsset(url) {
  return (
    url.pathname.startsWith('/flags/') ||
    url.pathname.startsWith('/illustrations/') ||
    url.pathname.startsWith('/logos/') ||
    /\/icon-\d+\.png$/.test(url.pathname) ||
    url.pathname === '/apple-touch-icon.png' ||
    url.pathname === '/manifest.json'
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Não interferir no Next dev/build (HMR, chunks hasheados) nem nas APIs
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) return

  // Navegações (páginas) → network-first com fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(PAGES_CACHE).then((c) => c.put(request, copy))
          return res
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline'))
        )
    )
    return
  }

  // Estáticos públicos → stale-while-revalidate
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((res) => {
              if (res && res.status === 200) cache.put(request, res.clone())
              return res
            })
            .catch(() => cached)
          return cached || network
        })
      )
    )
  }
})
