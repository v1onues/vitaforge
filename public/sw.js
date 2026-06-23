const CACHE_NAME = 'vitaforge-v2';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/setup',
  '/tasks',
  '/projects',
  '/habits',
  '/notes',
  '/journal',
  '/gratitude',
  '/reading',
  '/sleep',
  '/goals',
  '/analytics',
  '/settings',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension://')) return;

  const { request } = event;
  // POST, PUT, DELETE gibi non-GET request'leri cache'e alma
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      });
    })
  );
});

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
});
