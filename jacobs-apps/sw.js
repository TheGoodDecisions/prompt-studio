const CACHE = 'jacobs-apps-v4-simple-lock';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './pin-lock.js', './manifest.webmanifest', './brand-logo.jpg', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(Promise.all([self.clients.claim(), caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('jacobs-apps-') && k !== CACHE).map(k => caches.delete(k))))])));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request,copy)); }
    return response;
  }).catch(() => caches.match(event.request).then(match => match || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
