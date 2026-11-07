/**
 * Service Worker: Portal RSVP CEU (PWA & APK Offline Caching)
 * Unit Pendidikan Kerjaya (UPK / CEU), Jabatan Sekolah-Sekolah
 */

const CACHE_NAME = 'ceu-pwa-v1.7';
const STATIC_ASSETS = [
  '/',
  './',
  './index.html',
  './css/style.css',
  './img/logo.png',
  './js/config.js',
  './js/app.js',
  './js/i18n.js',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-96.png',
  './icon-128.png',
  './icon-192.png',
  './icon-256.png',
  './icon-384.png',
  './icon-512.png',
  './screenshot-desktop.png',
  './screenshot-mobile.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn('PWA SW: Asset cache skipped:', asset);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Permintaan API Google Apps Script mestilah SENTIASA terus ke rangkaian (bebas cache basi)
  if (url.origin.includes('script.google.com') || url.origin.includes('script.googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Aset statis: Cache First, fallback ke Rangkaian
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Fallback jika offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Periodic Background Sync (PWA Capability)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'ceu-sync-rsvps') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.add('./index.html')).catch(() => {})
    );
  }
});

// Background Sync (PWA Capability)
self.addEventListener('sync', (event) => {
  if (event.tag === 'ceu-bg-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.add('./index.html')).catch(() => {})
    );
  }
});

// Push Notifications (PWA Capability)
self.addEventListener('push', (event) => {
  const dataText = event.data ? event.data.text() : 'Pemberitahuan RSVP Program CEU';
  event.waitUntil(
    self.registration.showNotification('RSVP CEU', {
      body: dataText,
      icon: './icon-192.png',
      badge: './icon-96.png',
      data: { url: './index.html' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
