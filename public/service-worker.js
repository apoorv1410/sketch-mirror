// add service worker if supported in navigator API
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {

        // Establish a cache name
        const cacheName = 'sketch_mirror_cache';

        // Network Assets to precache
        const precachedAssets = [
            'https://img.icons8.com/stickers/28/pencil-tip.png',
            'https://img.icons8.com/papercut/28/eraser.png'
        ];

        self.addEventListener('install', (event) => {
        // Precache the assets on install
        event.waitUntil(caches.open(cacheName).then((cache) => {
            return cache.addAll(precachedAssets);
        }));
        });

        self.addEventListener('fetch', (event) => {
        // Is this one of our precached assets?
        const url = new URL(event.request.url);
        const isPrecachedRequest = precachedAssets.includes(url.pathname);

        if (isPrecachedRequest) {
            // Use the precached asset from the cache
            event.respondWith(caches.open(cacheName).then((cache) => {
            return cache.match(event.request.url);
            }));
        } else {
            // Continue to the network
            return;
        }
        });
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }  