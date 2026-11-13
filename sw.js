const CACHE_NAME = 'perfil-de-aula-v8';
const SHELL = ['./', 'index.html', 'aula-ao-vivo.html', 'perfil-de-aula.html', 'manifest.json', 'manifest-prof.json', 'instalar.js', 'icon-192.png', 'icon-512.png', 'icon-prof-192.png', 'icon-prof-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png', 'ciclista_m.glb', 'ciclista_f.glb'];
// bibliotecas do Firebase: ficam guardadas para a app abrir mesmo sem internet (o endereço tem a versão, por isso não mudam)
const FB = ['app', 'database', 'auth', 'app-check'].map((m) => 'https://www.gstatic.com/firebasejs/10.13.0/firebase-' + m + '-compat.js');

self.addEventListener('install', (e) => {
  self.skipWaiting();
  // um a um: se um ficheiro falhar, os outros ficam guardados na mesma
  e.waitUntil(caches.open(CACHE_NAME).then((c) => Promise.all([
    ...SHELL.map((u) => c.add(u).catch(() => {})),
    ...FB.map((u) => fetch(u, { mode: 'no-cors' }).then((r) => c.put(u, r)).catch(() => {}))
  ])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Firebase (gstatic): primeiro o que está guardado
  if (url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.open(CACHE_NAME).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  // música e serviços externos (SoundCloud, Spotify, Drive…) e pedidos por partes passam direto
  if (url.origin !== self.location.origin || e.request.headers.has('range')) return;
  // Network-first: esta app precisa de dados ao vivo; a cópia guardada é para quando não há internet
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && (e.request.mode === 'navigate' || /\.(html|js|json|png|glb)$/.test(url.pathname))) {
        const copia = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(e.request, copia)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })   // ignora o ?pin=1234 do endereço
      .then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
