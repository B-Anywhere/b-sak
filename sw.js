// Retires the service worker from the previous Vite PWA build so returning visitors get the plain static site.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
    await self.registration.unregister();
    (await self.clients.matchAll()).forEach((c) => c.navigate(c.url));
  })());
});
