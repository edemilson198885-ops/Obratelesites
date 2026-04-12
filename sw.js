const CACHE_NAME = 'telesites-pwa-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css?v=9.7.0',
  './assets/img/logo-telesites.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './assets/js/config.js?v=9.7.0',
  './assets/js/helpers.js?v=9.7.0',
  './assets/js/models.js?v=9.7.0',
  './assets/js/storage.js?v=9.7.0',
  './assets/js/rules.js?v=9.7.0',
  './assets/js/state.js?v=9.7.0',
  './assets/js/services.js?v=9.7.0',
  './assets/js/ui.js?v=9.7.0',
  './assets/js/router.js?v=9.7.0',
  './assets/js/events.js?v=9.7.0',
  './assets/js/screens/login.screen.js?v=9.7.0',
  './assets/js/screens/dashboard.screen.js?v=9.7.0',
  './assets/js/screens/obras.screen.js?v=9.7.0',
  './assets/js/screens/obra-detalhe.screen.js?v=9.7.0',
  './assets/js/screens/financeiro.screen.js?v=9.7.0',
  './assets/js/screens/cadastros.screen.js?v=9.7.0',
  './assets/js/screens/configuracoes.screen.js?v=9.7.0',
  './assets/js/screens/relatorios.screen.js?v=9.7.0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => Promise.resolve())
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Let Supabase and third-party requests go to the network
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
