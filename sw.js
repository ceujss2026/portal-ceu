/**
 * Service Worker: Portal RSVP CEU (PWA & APK Offline Caching)
 * Unit Pendidikan Kerjaya (UPK / CEU), Jabatan Sekolah-Sekolah
 */

const CACHE_NAME = 'ceu-pwa-v1.5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './img/logo.png',
  './js/config.js',
  './js/app.js',
  './js/i18n.js',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png',
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
