import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare var self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// Ensure Workbox Manifest is not injected multiple times
const manifest = self.__WB_MANIFEST || [];
precacheAndRoute(manifest);

// Immediately claim clients
clientsClaim();

// Skip waiting to activate new service worker version
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Fetch event for runtime caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
