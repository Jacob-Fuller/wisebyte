/* Builds Wisebyte's audio layer from the lesson library.

   The content hierarchy:
     Episode (Wisebyte Go, ~12-20 min)  ->  3-4 Lessons (the reading app)  ->  5 teaching points each  ->  Scroll cards
   A teaching point is a lesson section (h, key, b). Its id is "<lessonId>#<index>" in every format.

   Outputs
     native/src/data/episodes.json      episode catalogue bundled with the app (no audio, no scripts)
     audio-kit/scripts/<episode>.json   narration scripts for every lesson episode, ready for audio-kit/generate.py
     go/audio/<original>.json           player data (chapters, transcript units, timings) for the recorded Go originals
     go/audio/manifest.json             which episodes have audio online. The app reads this at launch, so new
                                        recordings appear in the app without an app update.
   Usage: node native/scripts/build-audio.js   (run after extract-content.js) */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..", "..");
const W = require(path.join(root, "native", "src", "data", "wb.json"));
const L = Object.fromEntries(W.LESSONS.map(l => [l.id, l]));
const LIFE = new Set((W.COLLECTIONS.find(c => c.id === "life") || { ids: [] }).ids);
const isPractical = l => l.cat === "life" || LIFE.has(l.id) || ["mnemonics", "memory-palace", "habits"].includes(l.id);
const NUMW = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/* ---------- 1. group lessons into episodes ---------- */
/* split n lessons into chunks of 3 or 4 (a single lesson only when the group is that small) */
function sizes(n) {
  if (n <= 4) return [n];
  const k = Math.ceil(n / 4), out = Array(k).fill(Math.floor(n / k));
  for (let i = 0; i < n % k; i++) out[i]++;
  return out;
}
function chunk(ids) { const out = []; let i = 0; for (const s of sizes(ids.length)) { out.push(ids.slice(i, i + s)); i += s; } return out; }

const used = new Set(), episodes = [];
const pillarOf = ids => ids.filter(id => isPractical(L[id])).length * 2 > ids.length ? "practical" : "knowledge";
for (const x of W.SUBJECTS) {
  const ids = x.steps.filter(id => L[id] && !used.has(id) && (L[id].audience || "adult") === "adult");
  if (!ids.length) continue;
  const parts = chunk(ids);
  parts.forEach((g, i) => {
    g.forEach(id => used.add(id));
    episodes.push({ id: `${x.id}-${i + 1}`, kind: "course", course: x.id, t: x.title, ep: i + 1, eps: parts.length, p: pillarOf(g), lessons: g });
  });
}
/* lessons outside every course: grouped by topic, easiest first */
const LV = { beginner: 1, intermediate: 2, advanced: 3 };
const loose = {};
W.LESSONS.filter(l => !used.has(l.id) && (l.audience || "adult") === "adult").forEach(l => (loose[l.cat] = loose[l.cat] || []).push(l));
for (const [cat, ls] of Object.entries(loose)) {
  ls.sort((a, b) => LV[a.level] - LV[b.level] || a.title.localeCompare(b.title));
  const parts = chunk(ls.map(l => l.id)), name = (W.CATEGORIES[cat] || { name: cat }).name;
  parts.forEach((g, i) => { g.forEach(id => used.add(id));
    episodes.push({ id: `topic-${cat}-${i + 1}`, kind: "topic", cat, t: `${name} Shorts`, ep: i + 1, eps: parts.length, p: pillarOf(g), lessons: g }); });
}
/* the Inner Circle's lessons get episodes of their own, locked like the rest of the sanctum */
const inner = W.LESSONS.filter(l => l.audience === "inner").map(l => l.id);
chunk(inner).forEach((g, i, a) => { g.forEach(id => used.add(id)); episodes.push({ id: `inner-${i + 1}`, kind: "inner", t: "The Sanctum Teachings", ep: i + 1, eps: a.length, p: "knowledge", lessons: g, inner: 1 }); });

const missing = W.LESSONS.filter(l => !used.has(l.id));
if (missing.length) throw new Error("Lessons without an episode: " + missing.map(l => l.id).join(", "));

/* ---------- 2. narration scripts (written for the ear) ---------- */
function speakable(s) {
  return String(s)
    .replace(/\s*\(([^)]*)\)/g, ", $1,")          // brackets read badly aloud
    .replace(/\s+[–—]\s+/g, ", ")
    .replace(/&/g, " and ")
    .replace(/\be\.g\.,?/gi, "for example,").replace(/\bi\.e\.,?/gi, "that is,").replace(/\betc\./gi, "and so on.")
    .replace(/\bvs\.?\b/gi, "versus")
    .replace(/,\s*([,.;:!?])/g, "$1").replace(/,,+/g, ",")
    .replace(/\s{2,}/g, " ").trim();
}
const sentences = text => speakable(text).match(/[^.!?]+(?:[.!?]+["'”’]?|$)/g).map(s => s.trim()).filter(Boolean);
const listAnd = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const clean = t => t.replace(/[.:!?]+$/, "");

/* identifies which lessons an episode holds; a recording made for a different set is never served */
const lessonsKey = e => e.lessons.join(",");
function script(e) {
  const units = [], add = (t, c, k, ps = false) => units.push({ t, c, k, ps });
  const ls = e.lessons.map(id => L[id]);
  const head = e.eps > 1 ? `${e.t}. Episode ${NUMW[e.ep - 1] || e.ep}.` : `${e.t}.`;
  add(head, -1, "title");
  add(`In this episode: ${listAnd(ls.map(l => clean(l.title)))}.`, -1, "s", true);
  ls.forEach((l, c) => {
    add(`Part ${NUMW[c]}. ${clean(l.title)}.`, c, "head");
    sentences(l.hook).forEach((s, i) => add(s, c, "s", i === 0));
    l.sections.forEach(sec => {
      add(`${clean(sec.h)}.`, c, "s", true);
      sec.b.split(/\n\s*\n/).forEach(par => sentences(par).forEach((s, i) => add(s, c, "s", i === 0)));
    });
    add(`The key idea: ${clean(speakable(l.sections[0].key))}.`, c, "s", true);
  });
  const rc = ls.length;
  add("Quick recall. Answer out loud, or just in your head.", rc, "head");
  ls.forEach((l, i) => {
    const q = l.quiz[0];
    add(`Question ${NUMW[i]}. ${speakable(q.q)}`, rc, "q");
    add(`Answer. ${clean(speakable(q.o[q.a]))}.`, rc, "a");
  });
  add(`That's the end of this episode. The questions are waiting in your review, so you can lock in what you heard.`, rc, "end");
  return { id: e.id, h: lessonsKey(e), title: e.t + (e.eps > 1 ? ` · Episode ${e.ep}` : ""), chapters: ls.map(l => clean(l.title)), units };
}

const kit = path.join(root, "audio-kit", "scripts");
fs.mkdirSync(kit, { recursive: true });
for (const f of fs.readdirSync(kit)) if (f.endsWith(".json")) fs.unlinkSync(path.join(kit, f));
let words = 0;
for (const e of episodes) { const s = script(e); words += s.units.reduce((a, u) => a + u.t.split(/\s+/).length, 0); fs.writeFileSync(path.join(kit, e.id + ".json"), JSON.stringify(s, null, 1)); }

/* ---------- 3. the recorded Wisebyte Go originals ---------- */
const goHtml = fs.readFileSync(path.join(root, "go", "index.html"), "utf8");
const a0 = goHtml.indexOf("/*AUDIO:BEGIN*/") + 15, a1 = goHtml.indexOf("/*AUDIO:END*/");
const AUDIO = JSON.parse(goHtml.slice(a0, a1));
const ctx = {}; vm.createContext(ctx);
vm.runInContext(goHtml.slice(goHtml.indexOf("const SERIES = ["), goHtml.indexOf("/* =========================================================\n   App settings")) + "\nthis.__G = { SERIES, ALL_LESSONS };", ctx);
const { SERIES, ALL_LESSONS } = ctx.__G;
/* main lessons each original teaches the same core ideas as (listening to it counts them as covered) */
const COVERS = { spotlight: ["spotlight-effect"], habits: ["habits"], meals: ["meal-planning"], focus: ["focus"], blind1: ["wason-confirmation-bias"],
  attach: ["attachment"], aussie: ["australian-english"], bills: ["cutting-household-bills"], firstaid: ["first-aid"], mathtricks: ["mental-maths"],
  decide: ["decisions"], fallacies: ["logical-fallacies"] };
const NOTE = { money: "General information only, not personal financial advice.", work: "General information only, not legal or financial advice.",
  health: "General information only, not medical advice.", aid: "A refresher only, not a substitute for a first aid course. In an emergency, call triple zero (000)." };
const NOTES = { money1: "money", money2: "money", money3: "money", money4: "money", bills: "money", payrise: "work", sleep: "health", memory2: "health", placebo: "health", firstaid: "aid", attach: "health" };
const originals = ALL_LESSONS.filter(l => AUDIO[l.id]).map(l => {
  const s = l.s && SERIES.find(x => x.id === l.s);
  for (const id of COVERS[l.id] || []) if (!L[id]) throw new Error(`COVERS: no lesson ${id}`);
  return { id: l.id, kind: "original", t: l.t, d: l.d, p: l.p, psy: l.psy || undefined, series: s ? s.t : undefined, ep: l.ep, covers: COVERS[l.id] || [], note: NOTES[l.id] ? NOTE[NOTES[l.id]] : undefined, lessons: [] };
});

/* ---------- 4. write ---------- */
const goAudio = path.join(root, "go", "audio");
const manifest = { v: 1, base: "", episodes: {} };
const mPath = path.join(goAudio, "manifest.json");
if (fs.existsSync(mPath)) Object.assign(manifest.episodes, JSON.parse(fs.readFileSync(mPath, "utf8")).episodes || {});
/* episodes recorded with audio-kit/generate.py. Set AUDIO_BASE when their files are hosted elsewhere (e.g. Cloudflare R2) */
const kitM = path.join(root, "audio-kit", "out", "manifest.json");
if (fs.existsSync(kitM)) for (const [id, x] of Object.entries(JSON.parse(fs.readFileSync(kitM, "utf8")).episodes || {})) {
  const cur = episodes.find(e => e.id === id);
  if (!cur || (x.h && x.h !== lessonsKey(cur))) { delete manifest.episodes[id]; console.log(`skipping ${id}: recorded for a different set of lessons, re-record it`); continue; }
  const base = process.env.AUDIO_BASE || (manifest.episodes[id] && manifest.episodes[id].base);
  manifest.episodes[id] = base ? { ...x, base } : x;
}
for (const o of originals) {
  const A = AUDIO[o.id];
  fs.writeFileSync(path.join(goAudio, o.id + ".json"), JSON.stringify({ chapters: A.chapters, units: A.units, at: A.at, dur: A.dur }));
  const size = {}; for (const [v, f] of [["f", "af_heart"], ["m", "am_michael"]]) { const p = path.join(goAudio, `${o.id}-${f}.mp4`); if (fs.existsSync(p)) size[v] = fs.statSync(p).size; }
  manifest.episodes[o.id] = { dur: A.dur, size };
}
fs.writeFileSync(mPath, JSON.stringify(manifest, null, 1));

/* bundle the durations of everything already recorded, so those episodes work before the manifest loads */
for (const e of episodes.concat(originals)) if (manifest.episodes[e.id]) e.dur = manifest.episodes[e.id].dur;
const strip = e => { const o = { ...e }; for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k]; return o; };
fs.writeFileSync(path.join(root, "native", "src", "data", "episodes.json"), JSON.stringify({ EPISODES: episodes.map(strip), ORIGINALS: originals.map(strip) }));
console.log(`${episodes.length} lesson episodes (${episodes.filter(e => e.kind === "course").length} course, ${episodes.filter(e => e.kind === "topic").length} topic, ${episodes.filter(e => e.kind === "inner").length} inner)`);
console.log(`${originals.length} recorded originals · ~${Math.round(words / 150 / 60)} hours of narration per voice to record`);
