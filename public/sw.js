// Service Worker disabled for V1 stability.
// HTML pages and API responses MUST NOT be cached to avoid blank pages
// when auth session is missing or stale after refresh.
// Static assets (JS, CSS, images) use network-first via the browser.
// Re-enable with proper strategies when offline support is needed.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Clear all existing caches
  caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests - no caching
  event.respondWith(fetch(event.request));
});
