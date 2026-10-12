const VERSION = 'godzilla-pwa-v2-0-2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const ASSET_CACHE = 'godzilla-images-v1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)));
  // No skipWaiting: never force a running app to switch versions.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('godzilla-pwa-') && name !== VERSION).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      if (cached) return cached;
      try { const response = await fetch(req); if (response.ok) await cache.put(req,response.clone()); return response; }
      catch (e) { if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error(); throw e; }
    })());
  } else if (url.hostname === 'humulos.com' && /\/digimon\/images\//.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const response = await fetch(req);
      if (response.ok || response.type === 'opaque') await cache.put(req,response.clone());
      return response;
    })());
  }
});
