const CACHE_NAME = 'perfil-de-aula-v6';
const SHELL = ['aula-ao-vivo.html', 'perfil-de-aula.html', 'manifest.json', 'manifest-prof.json', 'icon-192.png', 'icon-512.png', 'icon-prof-192.png', 'icon-prof-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)).catch(()=>{}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: esta app precisa de dados ao vivo, a cache é só um recurso de emergência.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // música e serviços externos (SoundCloud, Spotify, Drive…) e pedidos por partes passam direto
  if (new URL(e.request.url).origin !== self.location.origin || e.request.headers.has('range')) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
