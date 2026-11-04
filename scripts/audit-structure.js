/* Structural audit of every Wisebyte content set. Errors must be zero before a release; warnings are listed for review.
   Usage: node scripts/audit-structure.js [--verbose] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, "..");
const verbose = process.argv.includes("--verbose");

/* load content exactly as the app does */
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
for (const s of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => s !== "store.js"))
  vm.runInContext(fs.readFileSync(path.join(root, s), "utf8"), ctx, { filename: s });
const q0 = html.indexOf("const QUOTES = ["), q1 = html.indexOf("\n];", q0) + 3;
vm.runInContext(html.slice(q0, q1).replace("const QUOTES", "window.__Q"), ctx);
const WB = ctx.WB, QUOTES = ctx.__Q.concat(WB.QUOTES_MORE || []);
const sh = fs.readFileSync(path.join(root, "scroll", "index.html"), "utf8");
const sx = { console }; sx.window = sx; vm.createContext(sx);
vm.runInContext(fs.readFileSync(path.join(root, "scroll", "more.js"), "utf8"), sx);
vm.runInContext(sh.slice(sh.indexOf("const FACTS = ["), sh.indexOf("const BY_ID")) + "\nwindow.__S = { POOL, CATS };", sx);
const POOL = sx.__S.POOL;

const errors = [], warns = [];
const E = (k, m) => errors.push(`[${k}] ${m}`), W = (k, m) => warns.push(`[${k}] ${m}`);
const words = s => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const US = /\b(?:color|colors|colored|behavior|behaviors|organize|organized|organizing|organization|center|centers|centered|kilometer|kilometers|favorite|favor|honor|honored|labor|neighbor|neighbors|realize|realized|recognize|recognized|analyze|analyzed|defense|offense|traveled|traveling|modeled|catalog|gray|fiber|theater|liter|liters|apologize|criticize|emphasize|minimize|maximize|optimize|summarize|jewelry|aluminum|practicing|enrollment|fulfill|skeptic|skeptical|maneuver|pediatric|anemia|anesthesia|estrogen|fetus|tumor|humor|rumor|vapor|flavor|harbor|armor|savior|endeavor|odor|vigor|ardor|candor)\b/;
const textOf = l => [l.title, l.hook, ...l.sections.flatMap(s => [s.h, s.key, s.b]), ...l.quiz.flatMap(q => [q.q, ...q.o, q.e]), l.push].join(" \n ");

/* ---------- lessons ---------- */
const L = WB.LESSONS, ids = {}, titles = {}, qtexts = {};
const inCourse = new Set(WB.SUBJECTS.flatMap(x => x.steps));
const pos = [0, 0, 0, 0];
for (const l of L) {
  const k = `lesson ${l.id}`;
  if (ids[l.id]) E("dup-id", k); ids[l.id] = 1;
  const tl = l.title.toLowerCase(); if (titles[tl]) W("dup-title", `${k} = ${titles[tl]}`); titles[tl] = l.id;
  if (!l.hook) E("hook", `${k}: missing hook`);
  if (!l.push) W("push", `${k}: missing push hint`); else if (l.push.length > 110) W("push-long", `${k}: push hint ${l.push.length} chars`);
  if (!WB.CATEGORIES[l.cat]) E("cat", `${k}: unknown category ${l.cat}`);
  if (!["beginner", "intermediate", "advanced"].includes(l.level)) E("level", `${k}: ${l.level}`);
  if (l.sections.length !== 5) E("pages", `${k}: ${l.sections.length} pages`);
  l.sections.forEach((s, i) => {
    if (!s.h || !s.key || !s.b) E("page", `${k} p${i}: missing heading/key/body`);
    const n = words(s.b); if (n < 40) W("page-short", `${k} p${i}: ${n} words`); if (n > 160) W("page-long", `${k} p${i}: ${n} words`);
  });
  if (l.quiz.length !== 5) E("quiz-count", `${k}: ${l.quiz.length} questions`);
  l.quiz.forEach((q, i) => {
    const kq = `${k} q${i}`;
    if (!Array.isArray(q.o) || q.o.length !== 4) E("options", `${kq}: ${q.o && q.o.length} options`);
    if (!(q.a >= 0 && q.a <= 3)) E("answer", `${kq}: answer ${q.a}`); else pos[q.a]++;
    if (!l.sections[q.s]) E("quiz-page", `${kq}: s=${q.s}`);
    if (!q.e) E("explain", `${kq}: missing explanation`);
    if (new Set(q.o.map(o => o.toLowerCase().trim())).size !== q.o.length) E("dup-option", kq);
    const lens = q.o.map(o => o.length), right = lens[q.a], others = lens.filter((_, j) => j !== q.a), mx = Math.max(...others), mn = Math.min(...others);
    if (right > mx * 1.45 && right - mx > 18) W("answer-longest", `${kq}: right ${right} vs others max ${mx} · ${q.q}`);
    if (right < mn * 0.55 && mn - right > 18) W("answer-shortest", `${kq}: right ${right} vs others min ${mn} · ${q.q}`);
    const qt = q.q.toLowerCase(); if (qtexts[qt]) W("dup-question", `${kq} = ${qtexts[qt]}`); qtexts[qt] = kq;
  });
  if ((l.audience || "adult") === "adult" && !inCourse.has(l.id)) W("no-course", k);
  const t = textOf(l);
  if (/—/.test(t)) W("em-dash", k);
  const us = t.match(US); if (us) W("us-spelling", `${k}: "${us[0]}"`);
  if (/\blorem\b|\bTODO\b|\bTBD\b|xxx/i.test(t)) E("placeholder", k);
}
const tot = pos.reduce((a, b) => a + b, 0);
const spread = pos.map(n => Math.round(100 * n / tot));
if (Math.max(...spread) > 35 || Math.min(...spread) < 15) W("answer-spread", `A/B/C/D = ${spread.join("/")} %`);

/* ---------- courses ---------- */
for (const x of WB.SUBJECTS) {
  const ls = x.steps.filter(id => ids[id]);
  if (ls.length !== x.steps.length) E("course-missing", `${x.id}: ${x.steps.filter(id => !ids[id]).join(", ")}`);
  if (ls.length < 3) E("course-small", `${x.id}: ${ls.length} lessons`);
  if (new Set(x.steps).size !== x.steps.length) E("course-dup", x.id);
}

/* ---------- words ---------- */
const seenW = {};
for (const e of WB.WORDS) {
  const k = `word ${e.w}`;
  if (seenW[e.w]) W("dup-word", k); seenW[e.w] = 1;
  if (!e.def) E("word-def", k);
  if (!e.ex || !e.ex.length) W("word-example", k);
  else if (!e.ex.some(s => new RegExp(e.w.slice(0, Math.max(3, e.w.length - 3)), "i").test(s))) W("word-example-use", `${k}: no example uses the word`);
  if (!e.pos) W("word-pos", k);
  if (/—/.test(JSON.stringify(e))) W("em-dash", k);
}

/* ---------- quotes ---------- */
const seenQ = {};
for (const x of QUOTES) {
  if (!x.a) E("quote-author", x.q.slice(0, 50));
  if (seenQ[x.q]) W("dup-quote", x.q.slice(0, 50)); seenQ[x.q] = 1;
}

/* ---------- banks ---------- */
const bank = (name, arr, fn) => (arr || []).forEach((x, i) => fn(x, `${name}#${i}`));
const mc = (x, k) => { if (!x.q || !Array.isArray(x.o) || x.o.length < 2 || !(x.a >= 0 && x.a < x.o.length)) E("bank-item", k); if (x.o && new Set(x.o).size !== x.o.length) E("dup-option", k); };
bank("GK", WB.GK, mc); bank("PUZZLES", WB.PUZZLES, mc); bank("SCENARIOS", WB.SCENARIOS, mc);
bank("INNER.q", WB.INNER.questions, mc); bank("INNER.r", WB.INNER.riddles, mc);
bank("CLAIMS", WB.CLAIMS, (x, k) => { if (!x.c || typeof x.t !== "boolean" || !x.e) E("claim", k); });
bank("EVENTS", WB.EVENTS, (x, k) => { if (!x.e || typeof x.y !== "number") E("event", k); });
bank("CAPITALS", WB.CAPITALS, (x, k) => { if (!Array.isArray(x) || x.length < 2 || !x[0] || !x[1]) E("capital", k); });

/* inner3.js keeps 12 base riddles by matching their answer text: a reworded answer silently drops a riddle */
{ const kept = WB.INNER.riddles.length - (WB.INNER_RIDDLES_HARD || []).length; if (kept !== 12) E("inner-riddles", `${kept} of 12 kept base riddles matched (check the keep list in inner3.js)`); }

/* ---------- scroll pool ---------- */
const need = { fact: ["t", "h", "m"], myth: ["t", "h", "e"], word: ["t", "h", "ex"], quote: ["t", "h", "src"], skill: ["t", "steps", "n"], puzzle: ["t", "h", "a"] };
const seenS = {};
for (const x of POOL) {
  const k = `scroll ${x.id}`;
  for (const f of need[x.type] || []) if (!x[f] || (Array.isArray(x[f]) && !x[f].length)) E("scroll-field", `${k}: ${f}`);
  if (x.type === "myth" && typeof x.a !== "boolean") E("scroll-myth", k);
  if (!sx.__S.CATS[x.cat]) E("scroll-cat", `${k}: ${x.cat}`);
  const key = (x.t + "|" + x.h).toLowerCase(); if (seenS[key]) W("dup-scroll", `${k} = ${seenS[key]}`); seenS[key] = x.id;
  if (/—/.test(JSON.stringify(x))) W("em-dash", k);
}

/* ---------- report ---------- */
const group = list => { const g = {}; for (const m of list) { const t = m.slice(1, m.indexOf("]")); (g[t] = g[t] || []).push(m); } return g; };
const show = (label, list) => {
  console.log(`\n${label}: ${list.length}`);
  for (const [t, ms] of Object.entries(group(list))) { console.log(`  ${t}: ${ms.length}`); if (verbose) ms.forEach(m => console.log("    " + m)); }
};
console.log(`lessons ${L.length} · questions ${tot} (A/B/C/D ${spread.join("/")}%) · words ${WB.WORDS.length} · quotes ${QUOTES.length} · scroll ${POOL.length}`);
show("ERRORS", errors); show("WARNINGS", warns);
if (process.argv.includes("--json")) fs.writeFileSync("/tmp/audit-structure.json", JSON.stringify({ errors, warns }, null, 1));
process.exitCode = errors.length ? 1 : 0;
