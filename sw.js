// IQ Market — service worker.
// Пипа САМО отварянето на страници (навигация): първо мрежата, а без интернет показва offline.html.
// Каталог, цени, Supabase, Stripe и картинки минават директно, без кеш, за да не се показват стари цени.
const CACHE = 'iqm-offline-v2';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([OFFLINE_URL])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('iqm-') && k !== CACHE).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return; // всичко друго — директно към мрежата
  event.respondWith((async () => {
    try {
      const preloaded = await event.preloadResponse;
      if (preloaded) return preloaded;
      return await fetch(event.request);
    } catch (err) {
      const cached = await caches.match(OFFLINE_URL);
      return cached || Response.error();
    }
  })());
});
