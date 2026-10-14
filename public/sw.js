const CACHE_NAME = 'redhead-flix-shell-v1';
const APP_BASE = self.registration.scope;
const APP_SHELL = [
  APP_BASE,
  new URL('index.html', APP_BASE).href,
  new URL('favicon.svg', APP_BASE).href,
  new URL('manifest.webmanifest', APP_BASE).href,
  new URL('pwa-192.svg', APP_BASE).href,
  new URL('pwa-512.svg', APP_BASE).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('redhead-flix-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(new URL('index.html', APP_BASE).href, response.clone()))
            .then(() => response);
        })
        .catch(() => caches.match(new URL('index.html', APP_BASE).href))
    );
    return;
  }

  if (/\.(?:js|css|svg|png|ico|webmanifest|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response.ok || response.type !== 'basic') return response;
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, response.clone()))
            .then(() => response);
        });
      })
    );
  }
});
