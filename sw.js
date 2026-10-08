// sw.js - Service Worker for PWA
const CACHE_NAME = 'alfathonah-cache-v5';
const ASSETS_TO_CACHE = [
  './',
  './login.html',
  './dashboard.html',
  './dashboard.css',
  './dashboard.js',
  './dashboard-cms.js',
  './belanja.js',
  './riwayat-pemasukan.js',
  './manifest.json',
  './img/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first, fallback to cache for offline availability
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
