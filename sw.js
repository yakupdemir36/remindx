// RemindX Service Worker v1.0
const CACHE_NAME = ‘remindx-v1’;
const ASSETS = [’/’, ‘/index.html’, ‘/manifest.json’];

self.addEventListener(‘install’, e => {
e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
self.skipWaiting();
});

self.addEventListener(‘activate’, e => {
e.waitUntil(caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
));
self.clients.claim();
});

self.addEventListener(‘fetch’, e => {
e.respondWith(
caches.match(e.request).then(cached => cached || fetch(e.request))
);
});

// Push notification handler
self.addEventListener(‘push’, e => {
const data = e.data ? e.data.json() : { title: ‘RemindX’, body: ‘Hatırlatman var!’ };
e.waitUntil(
self.registration.showNotification(data.title, {
body: data.body,
icon: ‘/icon-192.png’,
badge: ‘/icon-192.png’,
vibrate: [200, 100, 200],
tag: data.tag || ‘remindx’,
actions: [
{ action: ‘done’, title: ‘✓ Tamamlandı’ },
{ action: ‘snooze’, title: ‘⏰ 10 dk Ertele’ }
]
})
);
});

self.addEventListener(‘notificationclick’, e => {
e.notification.close();
if (e.action === ‘done’) {
// Handle done action
self.clients.matchAll().then(clients => {
clients.forEach(client => client.postMessage({ action: ‘done’, tag: e.notification.tag }));
});
} else if (e.action === ‘snooze’) {
// Snooze 10 minutes
setTimeout(() => {
self.registration.showNotification(e.notification.title, {
body: ‘⏰ Ertelendi: ’ + e.notification.body,
icon: ‘/icon-192.png’
});
}, 10 * 60 * 1000);
} else {
e.waitUntil(self.clients.openWindow(’/’));
}
});
