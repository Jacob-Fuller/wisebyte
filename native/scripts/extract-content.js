/* Builds the native app's content bundles from the web app's content files.
   Runs the same scripts the web page loads, in order, then saves WB (+ QUOTES) and the Scroll pool as JSON.
   Usage: node native/scripts/extract-content.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");
const out = path.resolve(__dirname, "..", "src", "data");
fs.mkdirSync(out, { recursive: true });

/* ---------- main app ---------- */
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => s !== "store.js");
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
for (const s of srcs) vm.runInContext(fs.readFileSync(path.join(root, s), "utf8"), ctx, { filename: s });
/* QUOTES lives inline in index.html */
const qStart = html.indexOf("const QUOTES = [");
const qEnd = html.indexOf("\n];", qStart) + 3;
vm.runInContext(html.slice(qStart, qEnd).replace("const QUOTES", "window.__QUOTES"), ctx);
const WB = ctx.WB;
const keep = {};
for (const k of Object.keys(WB)) if (typeof WB[k] !== "function") keep[k] = WB[k];
keep.QUOTES = ctx.__QUOTES.concat(WB.QUOTES_MORE || []);
delete keep.QUOTES_MORE; delete keep.PATHS; delete keep.RECAT;
fs.writeFileSync(path.join(out, "wb.json"), JSON.stringify(keep));

/* ---------- Scroll ---------- */
const sh = fs.readFileSync(path.join(root, "scroll", "index.html"), "utf8");
const sctx = { console };
sctx.window = sctx;
vm.createContext(sctx);
vm.runInContext(fs.readFileSync(path.join(root, "scroll", "more.js"), "utf8"), sctx);
const s0 = sh.indexOf("const FACTS = [");
const s1 = sh.indexOf("const BY_ID");
vm.runInContext(sh.slice(s0, s1) + "\nwindow.__S = { POOL, CATS, PILLARS, WEIGHTS };", sctx);
fs.writeFileSync(path.join(out, "scroll.json"), JSON.stringify(sctx.__S));

const sizes = Object.fromEntries(Object.entries(keep).map(([k, v]) => [k, Array.isArray(v) ? v.length : typeof v === "object" ? Object.keys(v).length : v]));
console.log(JSON.stringify(sizes));
console.log("scroll pool", sctx.__S.POOL.length);
