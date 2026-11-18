// Offline-Unterstützung: erst Netz (mit Zeitlimit), sonst Zwischenspeicher
const C = 't-log-v4';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; });
  const timeout = new Promise((_, rej) => setTimeout(() => rej('timeout'), 3000));
  e.respondWith(Promise.race([net, timeout]).catch(() =>
    caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')).then(r => r || net)));
});
