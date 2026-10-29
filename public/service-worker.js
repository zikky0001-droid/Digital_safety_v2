/* Digital Safety service worker: caches this site's own static assets and handles local notifications. */
const ASSET_CACHE = 'digital-safety-assets-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Cache only static assets from this origin. Never cache cross-origin, form, or API requests.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!['script', 'style', 'image', 'font'].includes(request.destination)) return;
  if (url.pathname === '/service-worker.js') return;

  event.respondWith((async () => {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
      if (response && response.ok && response.type === 'basic') void cache.put(request, response.clone());
      return response;
    });
    if (cached) {
      // Update in the background while returning the previously cached, hashed static asset.
      void network.catch(() => {});
      return cached;
    }
    return network;
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action || 'open';
  const url = action === 'pause' ? '/device-protection?pause-reminders=1' : '/device-protection';
  event.waitUntil((async () => {
    const destination = new URL(url, self.location.origin).toString();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const target = windows.find((client) => 'focus' in client);
    if (target) {
      if ('navigate' in target && target.url !== destination) await target.navigate(destination);
      if (action === 'pause') target.postMessage({ type: 'PAUSE_REMINDERS' });
      await target.focus();
      return;
    }
    await self.clients.openWindow(destination);
  })());
});
