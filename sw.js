// DreamDive multi-page PWA service worker
const CACHE = 'dreamdive-pro-v1';
const CORE = [
  './','./index.html','./rooms.html','./dining.html','./experiences.html',
  './gallery.html','./story.html','./booking.html','./manifest.json',
  './css/design-system.css','./js/chrome.js','./js/app.js'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => {
    if (r.status === 200 && e.request.method === 'GET') { const cl = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, cl)); }
    return r;
  }).catch(() => c)));
});