/* Offline support: keeps a copy of the app on the device so it opens with no signal.
   Bump VERSION whenever the app's files change so everyone gets the new copy. */
const VERSION = "kids-2026-09-28-web3";
const FILES = [
"./",
"icons/apple-touch-icon.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"index.html",
"manifest.webmanifest",
"privacy.html",
"store.js",
"terms.html"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith("kids-")).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (/\.(mp3|m4a)$/i.test(new URL(req.url).pathname)) return;   /* audio is handled by the app's own downloads */
  /* app files: get the latest copy when online (bypassing the browser cache), fall back to the saved copy offline */
  e.respondWith(caches.open(VERSION).then(async c => {
    try {
      const r = await fetch(req, { cache: "no-cache" });
      if (r && r.ok) { c.put(req, r.clone()); return r; }
      if (r) return r;
    } catch (err) {}
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") { const home = await c.match("./"); if (home) return home; }
    return new Response("Offline", { status: 503 });
  }));
});
