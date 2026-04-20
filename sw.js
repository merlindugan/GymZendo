const CACHE = 'gimnasio-v1';
const ASSETS = [
  './gimnasio-v2.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap',
];

// Instalar: cachear recursos base
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

// Activar: limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, cache fallback
self.addEventListener('fetch', e => {
  // No interceptar requests de Firebase
  if(e.request.url.includes('firebase') || e.request.url.includes('firestore')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar en cache si es un asset local
        if(res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.googleapis'))){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
