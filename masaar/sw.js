// Masaar service worker — offline-first for the app shell.
const VERSION = 'masaar-v1.0.0';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/styles.css',
  './assets/app.js',
  './assets/data.js',
  './assets/i18n.js',
  './assets/agent.js',
  './assets/logo.svg',
  './icons/icon.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(SHELL)).catch(() => null)
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache LLM API traffic — always live, network only.
  const liveHosts = [
    'api.openai.com','api.anthropic.com','api.groq.com',
    'generativelanguage.googleapis.com','openrouter.ai','api.mistral.ai'
  ];
  if (liveHosts.some(h => url.hostname.endsWith(h))) return;

  // Same-origin: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const fetching = fetch(req).then(res => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetching;
    })());
    return;
  }
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
