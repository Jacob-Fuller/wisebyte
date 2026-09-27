/* Offline support: keeps a copy of the app on the device so it opens with no signal.
   Bump VERSION whenever the app's files change so everyone gets the new copy. */
const VERSION = "main-2026-09-28-web3";
const FILES = [
"./",
"fonts/cormorant-garamond-italic.woff",
"fonts/cormorant-garamond.woff",
"fonts/figtree.woff",
"fonts/jetbrains-mono.woff",
"icons/apple-touch-icon.png",
"icons/icon-192.png",
"icons/icon-512.png",
"icons/icon-maskable-512.png",
"index.html",
"inner.js",
"lessons-body.js",
"lessons-body2.js",
"lessons-history.js",
"lessons-history2.js",
"lessons-life.js",
"lessons-life2.js",
"lessons-life3.js",
"lessons-money.js",
"lessons-money2.js",
"lessons-money3.js",
"lessons-n-ai.js",
"lessons-n-animals.js",
"lessons-n-art.js",
"lessons-n-books.js",
"lessons-n-business.js",
"lessons-n-coding.js",
"lessons-n-decide-finance.js",
"lessons-n-earth.js",
"lessons-n-econ-work.js",
"lessons-n-evolution.js",
"lessons-n-fitness-food.js",
"lessons-n-food-safety.js",
"lessons-n-geography.js",
"lessons-n-government.js",
"lessons-n-inventions.js",
"lessons-n-investing.js",
"lessons-n-language.js",
"lessons-n-law.js",
"lessons-n-maths.js",
"lessons-n-medicine.js",
"lessons-n-music.js",
"lessons-n-myths.js",
"lessons-n-oceans.js",
"lessons-n-persuasion.js",
"lessons-n-prehistory-universe.js",
"lessons-n-religions.js",
"lessons-n-spaceflight.js",
"lessons-n-tech-cyber.js",
"lessons-nature.js",
"lessons-psychology.js",
"lessons-psychology2.js",
"lessons-science.js",
"lessons-science2.js",
"lessons-space.js",
"lessons-tech.js",
"lessons-tech2.js",
"lessons-thinking.js",
"lessons-thinking2.js",
"lessons-world.js",
"lessons-x-body.js",
"lessons-x-chemphys.js",
"lessons-x-explorers.js",
"lessons-x-firstcivs.js",
"lessons-x-greece.js",
"lessons-x-happy.js",
"lessons-x-medieval.js",
"lessons-x-mind.js",
"lessons-x-modern.js",
"lessons-x-psych1.js",
"lessons-x-psych2.js",
"lessons-x-revolutions.js",
"lessons-x-rome.js",
"lessons-x-stoic.js",
"lessons.js",
"manifest.webmanifest",
"privacy.html",
"store.js",
"subjects.js",
"terms.html",
"think.js",
"think2.js",
"think3.js",
"timeline.js",
"quotes2.js",
"inner2.js",
"words.js",
"words2.js",
"words3.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k.startsWith("main-")).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (/\/(go|scroll|kids)\//.test(new URL(req.url).pathname.slice(new URL(self.registration.scope).pathname.length - 1))) return;   /* the other Wisebyte apps have their own offline copies */
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
