/**
 * Service worker de l'application.
 *  - Pages (navigation)          : réseau d'abord, sinon version en cache, sinon page hors ligne
 *  - Fichiers statiques & images : cache d'abord (rapide sur connexion lente)
 *  - Données Supabase (REST)     : réseau d'abord, cache en secours
 * Pensez à incrémenter VERSION si vous modifiez ce fichier.
 */
const VERSION = 'v1'
const STATIC_CACHE = `static-${VERSION}`
const IMAGE_CACHE = `images-${VERSION}`
const DATA_CACHE = `data-${VERSION}`
const PRECACHE = ['/', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  const keep = [STATIC_CACHE, IMAGE_CACHE, DATA_CACHE]
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok || response.type === 'opaque') {
    cache.put(request, response.clone())
    if (maxEntries) trim(cache, maxEntries)
  }
  return response
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (e) {
    const cached = await cache.match(request)
    if (cached) return cached
    throw e
  }
}

async function trim(cache, max) {
  const keys = await cache.keys()
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)))
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Navigation : réseau d'abord → page d'accueil en cache → page hors ligne
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(STATIC_CACHE).then((c) => c.put('/', copy))
          return res
        })
        .catch(async () => (await caches.match('/')) || caches.match('/offline.html')),
    )
    return
  }

  // Supabase : images (cache d'abord) et données (réseau d'abord). Jamais l'authentification.
  if (url.hostname.endsWith('.supabase.co')) {
    if (url.pathname.startsWith('/storage/v1/object/public/')) {
      event.respondWith(cacheFirst(request, IMAGE_CACHE, 200))
    } else if (url.pathname.startsWith('/rest/v1/')) {
      event.respondWith(networkFirst(request, DATA_CACHE))
    }
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  // Fichiers statiques versionnés (JS/CSS/polices) et images locales : cache d'abord
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/demo/') ||
    /\.(?:png|jpe?g|webp|avif|svg|woff2?|gif|ico)$/.test(url.pathname)
  ) {
    const isImage = /\.(?:png|jpe?g|webp|avif|svg|gif)$/.test(url.pathname)
    event.respondWith(cacheFirst(request, isImage ? IMAGE_CACHE : STATIC_CACHE, isImage ? 200 : 0))
  }
})
