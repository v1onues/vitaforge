const CACHE_NAME = 'vitaforge-v3';

// Cache-first statik assetler (font, image, css, js)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Fetch: network-first sayfa istekleri, cache-first statik assetler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome extension'leri atla
  if (url.protocol === 'chrome-extension:') return;

  // POST/PUT/DELETE isteklerini cache'e alma
  if (request.method !== 'GET') return;

  // API isteklerini cache'e alma
  if (url.pathname.startsWith('/api/')) return;

  // Sayfa navigasyonları: network-first (her zaman güncel versiyon)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Statik assetler: cache-first, network fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});

// Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});
