// Reliable and resilient PWA Service Worker (v11)
const CACHE_NAME = 'parking-asistent-v11';

const MANIFEST_PAYLOAD = {
  "id": "/",
  "name": "Parking Asistent",
  "short_name": "Parking",
  "description": "Brzo i jednostavno SMS plaćanje parkinga po zonama u Srbiji i regionu.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "lang": "sr",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then((res) => {
            if (res && res.ok) {
              return cache.put(url, res);
            }
          })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch listener - meets PWA installability requirements without breaking native browser navigation
self.addEventListener('fetch', (event) => {
  // CRITICAL: Let the browser handle page navigation natively so redirects, cookies, and auth bridges never fail
  if (event.request.mode === 'navigate') {
    return;
  }

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  // Never intercept Vite dev server internal assets
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/src') || url.pathname.startsWith('/node_modules')) {
    return;
  }

  // Guaranteed clean application/json for /manifest.json (never returns HTML / 404 to browser)
  if (url.pathname === '/manifest.json' || url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      fetch(event.request, { credentials: 'include' })
        .then((networkRes) => {
          const contentType = networkRes.headers.get('content-type') || '';
          if (networkRes.status === 200 && contentType.includes('application/json')) {
            return networkRes;
          }
          // If network returned HTML or redirect or error, return the embedded pristine JSON
          return new Response(JSON.stringify(MANIFEST_PAYLOAD), {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });
        })
        .catch(() => {
          return new Response(JSON.stringify(MANIFEST_PAYLOAD), {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });
        })
    );
    return;
  }

  // Fallback for any legacy icon requests
  if (url.pathname.includes('pwa-144') || url.pathname.includes('pwa-96')) {
    event.respondWith(
      caches.match('/icon-192.png').then((res) => res || fetch('/icon-192.png'))
    );
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_SESSION_ALERT') {
    console.log('Session alert received in ServiceWorker:', event.data.session?.id);
  }
});
