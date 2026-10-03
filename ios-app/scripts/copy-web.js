/* Copies the Wisebyte web app (the repo root) into ios-app/www so
   Capacitor can bundle it. Go and Kids, this folder and web-only files are
   left out. Scroll is included because it runs inside Wisebyte's
   "Wisebyte Scroll" tab (minus its own service worker and manifest). */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const out = path.resolve(__dirname, "..", "www");

const SKIP = new Set([
  ".git", ".github", "node_modules", "ios-app",
  "go", "kids",                    // separate apps
  "README.md", "codemagic.yaml", "render.yaml",
  "sw.js", "manifest.webmanifest", // browser-only (no service worker in the native app)
]);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let count = 0;
for (const name of fs.readdirSync(root)) {
  if (SKIP.has(name) || name.startsWith(".")) continue;
  fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
  count++;
}
for (const f of ["sw.js", "manifest.webmanifest"]) fs.rmSync(path.join(out, "scroll", f), { force: true });
if (!fs.existsSync(path.join(out, "index.html"))) {
  console.error("copy-web: index.html missing from the repo root");
  process.exit(1);
}
console.log(`copy-web: copied ${count} entries into ios-app/www`);
