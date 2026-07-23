/**
 * Simple service worker: caches same-origin GET requests so the site works
 * offline for static content after the first visit.
 */
const CACHE_NAME = 'edusei-workstation-v4';

/** Never cache the multi-MB media/model payloads — they'd blow the origin quota. */
const SKIP_CACHE = /\.(mp4|webm|glb|gltf|hdr)$/i;
/** Rough cap on cached entries; oldest entries are evicted past this. */
const MAX_ENTRIES = 150;

const SHELL_URLS = ['/', '/index.html', '/manifest.json', '/favicon.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // status===200 (not response.ok): 206 partial responses from video range
        // requests are "ok" but cache.put() rejects on them.
        if (response.status === 200 && response.type === 'basic' && !SKIP_CACHE.test(url.pathname)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(async (cache) => {
            try {
              await cache.put(request, clone);
              const keys = await cache.keys();
              for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
            } catch {
              /* quota exceeded or uncacheable response — never fatal */
            }
          });
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })))
  );
});
