// Simple and resilient Service Worker for Parking Asistent PWA & PWABuilder
const CACHE_NAME = 'parking-asistent-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// Install: precache essential static assets & skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('ServiceWorker pre-caching skipped for:', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean up older caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip non-http schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Navigation (HTML pages): Network-first with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Static assets: Cache first with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);
    })
  );
});

// Handle Background Notification Actions & Clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const sessionData = event.notification.data || {};

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (action === 'extend') {
            client.postMessage({ type: 'PARKING_ACTION', action: 'extend', sessionData });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const urlToOpen = action === 'extend' ? '/?action=extend' : '/';
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_SESSION_ALERT') {
    console.log('Session alert received in ServiceWorker:', event.data.session?.id);
  }
});
