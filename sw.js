var CACHE_NAME = 'teamcel-v9';
var urlsToCache = [
    './index.html',
    './main.js',
    './peers.js',
    './i18n.js',
    './style.css',
    './stats.html',
    './presentation.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', function(event) {
    console.log('[SW] install', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[SW] cache opened', CACHE_NAME);
            return cache.addAll(urlsToCache).catch(function(e) {
                console.warn('[SW] cache addAll failed:', e);
            });
        })
    );
});

self.addEventListener('message', function(event) {
    console.log('[SW] message received:', event.data);
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] skipWaiting called');
        self.skipWaiting();
    }
});

self.addEventListener('activate', function(event) {
    console.log('[SW] activate', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) { return name !== CACHE_NAME; })
                    .map(function(name) {
                        console.log('[SW] deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(function() {
            console.log('[SW] claim');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).then(function(response) {
            if (response && response.status === 200) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, clone);
                });
            }
            return response;
        }).catch(function() {
            return caches.match(event.request);
        })
    );
});
