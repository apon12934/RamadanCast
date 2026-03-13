const CACHE_NAME = 'rmadancast-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/logo/RmadanCast.svg',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API/TTS calls (dynamic)
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/.netlify/')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cachedResponse) => cachedResponse || fetch(event.request)
    )
  );
});
