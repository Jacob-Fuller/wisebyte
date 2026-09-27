/* Offline support: keeps a copy of the app on the device so it opens with no signal.
   Bump VERSION whenever the app's files change so everyone gets the new copy. */
const VERSION = "scroll-2026-09-28-web2";
const FILES = [
"./",
"fonts/cormorant-garamond-italic.woff",
"fonts/cormorant-garamond.woff",
"fonts/figtree.woff",
"icons/apple-touch-icon.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"index.html",
"manifest.webmanifest",
"more.js",
"privacy.html",
"store.js",
"terms.html"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith("scroll-")).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (/\.(mp3|m4a)$/i.test(new URL(req.url).pathname)) return;   /* audio is handled by the app's own downloads */
  /* app files: serve the saved copy straight away, refresh it in the background */
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net; if (r) return r;
    if (req.mode === "navigate") { const home = await c.match("./"); if (home) return home; }
    return new Response("Offline", { status: 503 });
  }));
});
