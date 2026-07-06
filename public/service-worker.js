const CACHE_NAME = 'sillytavern-shell-v4';
const SHELL_ASSETS = [
    '/',
    '/login.html',
    '/manifest.json',
    '/style.css',
    '/css/st-tailwind.css',
    '/css/mobile-styles.css',
    '/css/login.css',
    '/favicon.ico',
    '/img/apple-icon-192x192.png',
    '/img/apple-icon-512x512.png',
    '/scripts/pwa.js',
    '/scripts/extensions/marketplace-wallet/manifest.json',
    '/scripts/extensions/marketplace-wallet/window.html',
    '/scripts/extensions/marketplace-wallet/index.js?v=0.2.31',
    '/scripts/extensions/marketplace-wallet/filters.js?v=0.2.31',
    '/scripts/extensions/marketplace-wallet/style.css?v=0.2.31',
];

self.addEventListener('install', event => {
    event.waitUntil(Promise.all([
        self.skipWaiting(),
        caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)),
    ]));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys()
        .then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)),
        ))
        .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (url.origin !== location.origin || url.pathname.startsWith('/api/')) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(async () => {
            const cached = await caches.match(request);
            return cached || caches.match('/');
        }));
        return;
    }

    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
