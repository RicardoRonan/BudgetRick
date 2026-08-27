const CACHE_NAME = 'budgetrick-v1'
const STATIC_ASSETS = ['/', '/index.html', '/assets/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
  }
})
