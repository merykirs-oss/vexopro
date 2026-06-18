// Service worker mínimo para VexoPRO.
// Objetivo único: habilitar la instalación como PWA (ícono en pantalla de inicio).
// No cachea Firebase ni ningún dato dinámico — todo sigue funcionando en tiempo real como antes.

const CACHE_NAME = 'vexopro-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: network-first para todo. Si la red falla (sin conexión), intenta servir
// el index desde caché como última opción, pero nunca cachea datos de Firebase ni APIs externas.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // No interceptar llamadas a Firebase, Google APIs, o APIs de terceros (dólar, etc.)
  if (url.includes('firebaseio.com') || url.includes('googleapis.com') ||
      url.includes('dolarapi.com') || url.includes('gstatic.com')) {
    return; // dejar pasar directo a la red, sin caché
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
