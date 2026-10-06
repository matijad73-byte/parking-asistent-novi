// Self-clearing Service Worker
// Automatically cleans up old cached assets to prevent blank screens
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => self.registration.unregister()).then(() => self.clients.claim())
  );
});
