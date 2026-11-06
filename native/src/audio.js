/* =========================================================
   WISEBYTE GO inside Wisebyte: the audio engine.
   Episodes come from data/episodes.json (built by scripts/build-audio.js):
     lesson episodes  3-4 library lessons narrated back to back (kind course | topic | inner)
     originals        the recorded Wisebyte - Go lessons (kind original)
   Which episodes have audio online comes from manifest.json on the audio host, read at launch,
   so newly recorded episodes appear without an app update. Files are downloaded before they play
   (a second or two), kept for offline use when the user downloads them, and tidied up otherwise.
   ========================================================= */
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";
import { AppState } from "react-native";
import * as FS from "expo-file-system/legacy";
import CAT from "./data/episodes.json";
import * as Store from "./storage";
import * as E from "./engine";
import { changed, toast } from "./bus";
import { today, addDays } from "./util";

/* where recordings live. The manifest can point files elsewhere ("base"), so moving them to
   Cloudflare R2 later only needs a manifest change, not an app update. */
export const HOST = "https://raw.githubusercontent.com/Jacob-Fuller/wisebyte/main/go/audio/";
export const VOICES = { f: { name: "Female", who: "American", file: "af_heart" }, m: { name: "Male", who: "British", file: "am_michael" } };
export const RATES = [0.85, 1, 1.15, 1.3, 1.5];
export const LENGTHS = [10, 15, 20, 30];
export const NOTE_DRIVE = "Please don't handle your phone while driving. Pick an episode and press play before you set off, and follow the road rules for phone use in your state.";

/* ---------- catalogue ---------- */
export const EPISODES = CAT.ORIGINALS.concat(CAT.EPISODES);
const BY = Object.fromEntries(EPISODES.map(e => [e.id, e]));
export const ep = id => BY[id];
export const lessonsOf = e => e.kind === "original" ? e.covers : e.lessons;
const SUBJ = Object.fromEntries(E.WB.SUBJECTS.map(x => [x.id, x]));
export function title(e) { return e.kind === "original" || e.eps < 2 ? e.t : `${e.t} · Ep ${e.ep}`; }
export function blurb(e) { return e.kind === "original" ? e.d : e.lessons.map(id => (E.lessonById(id) || { title: id }).title).join(" · "); }
export function groupOf(e) {
  if (e.kind === "original") return e.series ? { key: "series:" + e.series, t: e.series } : null;
  if (e.kind === "course") return { key: "course:" + e.course, t: e.t, d: (SUBJ[e.course] || {}).desc };
  if (e.kind === "inner") return { key: "inner", t: e.t };
  return { key: "topic:" + e.cat, t: e.t };
}
export const isPsych = e => e.kind === "original" ? !!e.psy : e.lessons.some(id => { const l = E.lessonById(id); return l && (l.cat === "psychology" || l.cat === "emotions"); });

/* ---------- state ---------- */
const P0 = { voice: "f", rate: 1, trip: 35, len: 0, pos: {}, done: {}, days: {}, saved: {}, keep: {}, welcomed: false, driveNoticed: false };
export const G = {
  p: JSON.parse(JSON.stringify(P0)),
  manifest: { v: 1, episodes: {} },
  cur: null, queue: [], playing: false, loading: false, status: "", t: 0, dur: 0,
  detail: {}, busy: {}, offline: false,
  seg: "listen", pillar: "all", libLen: 0, sheet: false, drive: false, showText: false, modal: null,
};
/* read saved settings once device storage has loaded (called from init) */
function loadPrefs() {
  G.p = Object.assign(JSON.parse(JSON.stringify(P0)), Store.get("wbgo", {}));
  for (const k of ["pos", "done", "days", "saved", "keep"]) if (!G.p[k] || typeof G.p[k] !== "object") G.p[k] = {};
  if (!VOICES[G.p.voice]) G.p.voice = "f";
  G.manifest = Store.get("wbgo-manifest", null) || { v: 1, episodes: {} };
}
let saveT = null;
export function savePrefs(now) { clearTimeout(saveT); const go = () => Store.set("wbgo", G.p); if (now) go(); else saveT = setTimeout(go, 800); }

/* live updates (position, transcript) go only to the player views, not the whole app */
const live = new Set();
export function subscribeLive(f) { live.add(f); return () => live.delete(f); }
let appActive = true;
AppState.addEventListener("change", st => { appActive = st === "active"; if (appActive) tickLive(); });
function tickLive() { if (appActive) live.forEach(f => { try { f(); } catch (e) {} }); }

/* ---------- availability ---------- */
const entry = id => G.manifest.episodes && G.manifest.episodes[id] || (BY[id] && BY[id].dur ? { dur: BY[id].dur } : null);
export const available = id => { const e = BY[id]; return !!e && !!entry(id) && (!e.inner || E.innerProgress().open); };
export const AVAILABLE = () => EPISODES.filter(e => available(e.id));
export const durOf = (id, v = G.p.voice) => { const x = entry(id); return x ? (x.dur[v] || x.dur.f || 0) : 0; };
export const mins = id => Math.max(1, Math.round(durOf(id) / 60));
const avgMins = id => { const x = entry(id); return x ? ((x.dur.f || 0) + (x.dur.m || x.dur.f || 0)) / 120 : 0; };
export const bucket = id => LENGTHS.reduce((b, x) => Math.abs(x - avgMins(id)) < Math.abs(b - avgMins(id)) ? x : b, LENGTHS[0]);
export const lengthsAvailable = () => LENGTHS.filter(m => AVAILABLE().some(e => bucket(e.id) === m));
export const isDone = id => !!G.p.done[id];
/* how much of an episode the user has already met in Read, Scroll or Listen */
export function coverage(e) { const ls = lessonsOf(e); return { n: ls.filter(E.isCovered).length, of: ls.length }; }
const fullyCovered = e => e.kind !== "original" && e.lessons.length > 0 && e.lessons.every(E.isCovered);

async function fetchManifest() {
  try {
    const r = await fetch(HOST + "manifest.json?t=" + Date.now()); if (!r.ok) throw new Error(r.status);
    const m = await r.json(); if (!m || !m.episodes) throw new Error("bad manifest");
    G.manifest = m; G.offline = false; Store.set("wbgo-manifest", m); changed();
  } catch (e) { if (String(e && e.message).includes("Network")) G.offline = true; }
}
const baseFor = id => (G.manifest.episodes[id] && G.manifest.episodes[id].base) || G.manifest.base || HOST;

/* ---------- files ---------- */
/* re-downloadable audio lives in Caches, which iCloud doesn't back up (Apple's storage guidelines) */
const DIR = (FS.cacheDirectory || "") + "wbaudio/";
const fileName = (id, v) => `${id}-${VOICES[v].file}.mp4`;
const key = (id, v) => id + "-" + v;
export const isSaved = (id, v = G.p.voice) => !!G.p.saved[key(id, v)] && !!G.p.keep[key(id, v)];
export const savedCount = () => Object.keys(G.p.keep).filter(k => G.p.saved[k]).length;
export const savedBytes = () => Object.keys(G.p.keep).reduce((a, k) => a + (G.p.saved[k] || 0), 0);
export const estBytes = id => { const x = G.manifest.episodes[id]; return (x && x.size && x.size[G.p.voice]) || Math.round(durOf(id) * 2600); };
export const fmtMB = b => b >= 1e9 ? (b / 1e9).toFixed(1) + " GB" : Math.max(1, Math.round(b / 1e6)) + " MB";
async function ensureDir() { try { const i = await FS.getInfoAsync(DIR); if (!i.exists) await FS.makeDirectoryAsync(DIR, { intermediates: true }); } catch (e) {} }

async function ensureDetail(id) {
  if (G.detail[id]) return G.detail[id];
  await ensureDir();
  const path = DIR + id + ".json";
  try { const i = await FS.getInfoAsync(path); if (i.exists) { G.detail[id] = JSON.parse(await FS.readAsStringAsync(path)); return G.detail[id]; } } catch (e) {}
  const r = await fetch(baseFor(id) + id + ".json"); if (!r.ok) throw new Error("detail " + r.status);
  const txt = await r.text(); G.detail[id] = JSON.parse(txt);
  FS.writeAsStringAsync(path, txt).catch(() => {});
  return G.detail[id];
}
const inflight = new Map();
function ensureAudio(id, v, onProgress) {
  const k = key(id, v);
  if (inflight.has(k)) { const e = inflight.get(k); if (onProgress) e.listeners.add(onProgress); return e.promise; }
  const listeners = new Set(onProgress ? [onProgress] : []);
  const promise = fetchAudio(id, v, f => listeners.forEach(fn => { try { fn(f); } catch (e) {} })).finally(() => inflight.delete(k));
  inflight.set(k, { promise, listeners });
  return promise;
}
async function fetchAudio(id, v, onProgress) {
  await ensureDir();
  const k = key(id, v), path = DIR + fileName(id, v);
  if (G.p.saved[k]) { try { const i = await FS.getInfoAsync(path); if (i.exists && i.size > 1000) return path; } catch (e) {} delete G.p.saved[k]; }
  const task = FS.createDownloadResumable(baseFor(id) + fileName(id, v), path + ".part", {}, d => { if (d.totalBytesExpectedToWrite > 0 && onProgress) onProgress(d.totalBytesWritten / d.totalBytesExpectedToWrite); });
  const res = await task.downloadAsync();
  if (!res || res.status !== 200) { FS.deleteAsync(path + ".part", { idempotent: true }).catch(() => {}); throw new Error("audio " + (res && res.status)); }
  await FS.deleteAsync(path, { idempotent: true }).catch(() => {});
  await FS.moveAsync({ from: path + ".part", to: path });
  const i = await FS.getInfoAsync(path);
  G.p.saved[k] = i.size || estBytes(id); savePrefs();
  return path;
}
async function dropFile(id, v) {
  const k = key(id, v);
  if (G.cur === id && v === G.p.voice) { delete G.p.keep[k]; savePrefs(); return; }   /* playing now: keep the file, tidy it later */
  delete G.p.saved[k]; delete G.p.keep[k]; savePrefs();
  await FS.deleteAsync(DIR + fileName(id, v), { idempotent: true }).catch(() => {});
}

/* ---------- offline downloads (the user's choice, kept until removed) ---------- */
const dlQueue = []; let dlRunning = false;
export function download(ids) {
  for (const id of [].concat(ids)) if (available(id) && !isSaved(id) && !(id in G.busy) && !dlQueue.includes(id)) { dlQueue.push(id); G.busy[id] = 0; }
  changed(); runDownloads();
}
async function runDownloads() {
  if (dlRunning) return; dlRunning = true;
  while (dlQueue.length) {
    const id = dlQueue.shift(), v = G.p.voice;
    try {
      await ensureDetail(id);
      await ensureAudio(id, v, f => { G.busy[id] = f; tickLive(); if (Math.random() < 0.08) changed(); });
      G.p.keep[key(id, v)] = true; savePrefs();
    } catch (e) { toast("A download couldn't finish. Check your connection."); }
    delete G.busy[id]; changed();
  }
  dlRunning = false;
}
export function removeDownload(id) { dropFile(id, G.p.voice).then(changed); }
export async function removeAllDownloads() {
  for (const k of Object.keys(G.p.keep)) { const i = k.lastIndexOf("-"); await dropFile(k.slice(0, i), k.slice(i + 1)); }
  toast("Downloads removed"); changed();
}

/* ---------- playback ---------- */
let player = null, modeSet = false, pendingSeek = null, loadToken = 0, lastT = 0, lastSave = 0, loadedKey = null, lockOn = false;
/* true only when the player holds the current episode in the current voice, and it's ready */
const ready = () => !!player && loadedKey === key(G.cur, G.p.voice) && player.isLoaded;
function getPlayer() {
  if (player) return player;
  player = createAudioPlayer(null, { updateInterval: 250, keepAudioSessionActive: true });
  player.addListener("playbackStatusUpdate", st => {
    if (!G.cur || loadedKey !== key(G.cur, G.p.voice) || !st.isLoaded) return;   /* ignore the previous item's events */
    if (st.isLoaded && pendingSeek != null) { const s = pendingSeek; pendingSeek = null; if (s > 0.5) player.seekTo(s).catch(() => {}); try { player.setPlaybackRate(G.p.rate); } catch (e) {} }
    const t = st.currentTime || 0;
    if (st.playing && t > lastT && t - lastT < 3) logListen((t - lastT) / (G.p.rate || 1));
    lastT = t; G.t = t; if (st.duration > 0) G.dur = st.duration;
    const was = G.playing; G.playing = !!st.playing;
    if (st.isBuffering && st.playing && !G.status) G.status = "Loading…"; else if (!st.isBuffering && G.status === "Loading…") G.status = "";
    const now = Date.now();
    if (now - lastSave > 5000) { lastSave = now; G.p.pos[G.cur] = { u: curUnit(), t }; savePrefs(); }
    if (st.didJustFinish) { finishEpisode(); return; }
    if (was !== G.playing) { if (!G.playing) { G.p.pos[G.cur] = { u: curUnit(), t }; savePrefs(); } changed(); }
    tickLive();
  });
  return player;
}
async function setupMode() {
  if (modeSet) return; modeSet = true;
  try { await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }); } catch (e) {}
}
/* activate lock-screen controls once, then only update the metadata (re-activating stacks remote-command handlers) */
function lockScreen(id) {
  const e = BY[id], g = groupOf(e), meta = { title: title(e), artist: "Wisebyte Go", albumTitle: g ? g.t : E.PILLAR_BY(e.p).name };
  try { if (!lockOn) { player.setActiveForLockScreen(true, meta, { showSeekForward: true, showSeekBackward: true }); lockOn = true; } else player.updateLockScreenMetadata(meta); } catch (err) {}
}
async function load(id, startAt, autoplay) {
  const token = ++loadToken, pl = getPlayer();
  if (G.playing) { try { pl.pause(); } catch (e) {} }
  loadedKey = null;
  G.cur = id; G.loading = true; G.playing = false; G.status = "Loading…"; G.t = startAt || 0; G.dur = durOf(id); lastT = G.t;
  changed();
  try {
    await ensureDetail(id);
    const uri = await ensureAudio(id, G.p.voice, f => { if (token === loadToken) { G.status = `Loading ${Math.round(f * 100)}%`; tickLive(); } });
    if (token !== loadToken) return;
    await setupMode();
    pendingSeek = startAt || 0;
    loadedKey = key(id, G.p.voice);
    pl.replace({ uri });
    try { pl.setPlaybackRate(G.p.rate); } catch (e) {}
    if (autoplay) pl.play();
    G.loading = false; G.status = "";
    lockScreen(id);
  } catch (e) {
    if (token !== loadToken) return;
    G.loading = false; G.playing = false;
    G.status = isSaved(id) ? "This episode couldn't be played. Try again." : "This episode couldn't be loaded. Check your connection and try again.";
  }
  changed(); tickLive();
}
const startOf = id => { const p = G.p.pos[id], d = G.detail[id]; if (!p) return 0; return d && d.at && d.at[G.p.voice] ? Math.max(0, d.at[G.p.voice][Math.max(0, p.u)] - 0.2) : Math.max(0, (p.t || 0) - 2); };
export async function play(id, fromQueue) {
  if (!available(id)) return;
  if (!fromQueue) G.queue = G.queue.filter(q => q !== id);
  if (G.cur === id && ready()) {
    if (!G.playing) { if (G.dur && G.t >= G.dur - 1) { player.seekTo(0).catch(() => {}); G.t = 0; } if (G.status && !G.loading) G.status = ""; player.play(); G.playing = true; changed(); }
    return;
  }
  if (G.cur === id && G.loading) return;
  try { await ensureDetail(id); } catch (e) {}
  load(id, startOf(id), true);
}
export function playList(ids) { ids = ids.filter(available); if (!ids.length) return; G.queue = ids.slice(1); play(ids[0], true); }
export function toggle() {
  if (!G.cur) return;
  if (G.loading) return;
  if (!ready()) return play(G.cur);
  if (G.playing) return player.pause();
  if (G.status) G.status = "";
  setupMode();
  if (G.dur && G.t >= G.dur - 1) { player.seekTo(0).catch(() => {}); G.t = 0; }
  player.play();
}
export function seek(t) { if (!G.cur) return; if (!ready()) { pendingSeek = t; return; } const d = G.dur || durOf(G.cur); const x = Math.max(0, Math.min(d - 0.3, t)); G.t = x; player.seekTo(x).catch(() => {}); tickLive(); }
export const skip = s => seek((G.t || 0) + s);
export function setRate(r) { G.p.rate = r; savePrefs(); try { player && player.setPlaybackRate(r); } catch (e) {} changed(); }
export function cycleRate() { setRate(RATES[(RATES.indexOf(G.p.rate) + 1) % RATES.length]); }
export function setVoice(v) {
  if (!VOICES[v] || v === G.p.voice) return;
  const id = G.cur, d = id && G.detail[id];
  if (id && d && ready() && d.at[v]) {
    const u = curUnit(), off = (G.t || 0) - d.at[G.p.voice][u], wasPlaying = G.playing;
    G.p.voice = v; savePrefs();
    load(id, d.at[v][u] + Math.max(0, off * 0.9), wasPlaying);
  } else { const was = G.loading && id; G.p.voice = v; savePrefs(); if (was) load(id, 0, true); else changed(); }
  toast(`${VOICES[v].name} narrator`);
}
function finishEpisode() {
  const id = G.cur; if (!id) return;
  G.p.done[id] = today(); delete G.p.pos[id]; savePrefs();
  const e = BY[id];
  /* heard = covered: the lessons drop out of suggestions and Scroll, and their questions wait in Review */
  const n = E.markHeard(lessonsOf(e));
  if (n) toast(`${n === 1 ? "1 lesson" : n + " lessons"} added to your review`);
  const next = G.queue.shift();
  if (next) { load(next, startOf(next), true); return; }
  G.playing = false; G.status = "Finished. Pick another for the road."; changed();
}
export function stop() { loadToken++; pendingSeek = null; loadedKey = null; try { player && player.pause(); } catch (e) {} setIsAudioActiveAsync(false).catch(() => {}); G.cur = null; G.loading = false; G.status = ""; G.queue = []; G.sheet = false; G.drive = false; G.playing = false; changed(); }

/* ---------- position helpers ---------- */
const vk = d => d.at[G.p.voice] ? G.p.voice : Object.keys(d.at)[0];
export function unitAt(id, t) {
  const d = G.detail[id]; if (!d || !d.at) return 0; const at = d.at[vk(d)]; let lo = 0, hi = at.length - 1, r = 0;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (at[mid] <= t + 0.05) { r = mid; lo = mid + 1; } else hi = mid - 1; }
  return r;
}
export const curUnit = () => G.cur ? unitAt(G.cur, G.t || 0) : 0;
export function chapterStarts(id) {
  const d = G.detail[id]; if (!d || !d.at) return []; const out = [], at = d.at[vk(d)];
  d.units.forEach((u, i) => { if (u.k === "head" && out.length === u.c) out.push(at[i]); });
  return out;
}
export function curChapter() { const d = G.cur && G.detail[G.cur]; if (!d) return 0; return Math.max(0, d.units[curUnit()].c); }
export function chapterLabel() {
  const d = G.cur && G.detail[G.cur]; if (!d) return "";
  const c = curChapter(); if (c >= d.chapters.length) return "Quick recall";
  return `Part ${c + 1} of ${d.chapters.length} · ${d.chapters[c]}`;
}
export function nextChapter() {
  if (!G.cur) return; const t = G.t, n = chapterStarts(G.cur).find(x => x > t + 0.5);
  if (n != null) seek(n); else if (G.queue.length) finishEpisode(); else toast("This is the last part of the episode.");
}
export function prevChapter() {
  if (!G.cur) return; const cs = chapterStarts(G.cur), t = G.t; let i = cs.findIndex(x => x > t) - 1; if (i < -1) i = cs.length - 1;
  if (i < 0) return seek(0); seek(t - cs[i] > 4 ? cs[i] : cs[Math.max(0, i - 1)]);
}
export const seekChapter = c => { const cs = chapterStarts(G.cur); if (cs[c] != null) { seek(cs[c]); if (!G.playing) toggle(); } };
export const seekUnit = u => { const d = G.detail[G.cur]; if (d && d.at) { seek(d.at[vk(d)][u]); if (!G.playing) toggle(); } };

/* ---------- listening stats ---------- */
function logListen(sec) { if (!(sec > 0)) return; const k = today(); G.p.days[k] = (G.p.days[k] || 0) + sec; }
export function streak() { let n = 0, k = today(); if (!(G.p.days[k] > 30)) k = addDays(k, -1); while (G.p.days[k] > 30) { n++; k = addDays(k, -1); } return n; }
export function weekMins() { let s = 0, k = today(); for (let i = 0; i < 7; i++) { s += G.p.days[k] || 0; k = addDays(k, -1); } return Math.round(s / 60); }
export const progFrac = id => { const p = G.p.pos[id]; return p ? Math.min(0.97, (p.t || 0) / (durOf(id) || 1)) : 0; };

/* ---------- suggestions ---------- */
/* in a course or series, only the next unheard episode is offered, so episodes play in order */
function nextInGroup(e) {
  const g = groupOf(e); if (!g || e.kind === "topic") return true;
  const first = AVAILABLE().filter(x => { const h = groupOf(x); return h && h.key === g.key && !isDone(x.id) && !fullyCovered(x); }).sort((a, b) => a.ep - b.ep)[0];
  return !first || first.id === e.id;
}
const fresh = e => !isDone(e.id) && !fullyCovered(e) && e.id !== G.cur;
/* rank: episodes with the most content the user hasn't met yet come first */
const newness = e => { const c = coverage(e); return c.of ? c.n / c.of : 0; };
export function candidates() { return AVAILABLE().filter(e => fresh(e) && nextInGroup(e)).sort((a, b) => newness(a) - newness(b)); }
export function upNext() {
  const pool = AVAILABLE().filter(e => !isDone(e.id));
  const inProg = pool.find(e => G.p.pos[e.id] && (!G.p.len || bucket(e.id) === G.p.len)); if (inProg) return inProg;
  const c = candidates(), fits = c.filter(e => !G.p.len || bucket(e.id) === G.p.len);
  if (fits.length) return fits[0];
  const any = c.length ? c : pool.length ? pool : AVAILABLE(); if (!any.length) return null;
  if (!G.p.len) return any[0];
  return any.slice().sort((a, b) => Math.abs(avgMins(a.id) - G.p.len) - Math.abs(avgMins(b.id) - G.p.len))[0];
}
/* fill a drive as fully as possible with as few episodes as possible (subset sum over whole minutes) */
export function planTrip(total) {
  const usable = candidates();
  const best = new Array(total + 1).fill(null); best[0] = [];
  usable.forEach((e, i) => {
    const m = mins(e.id); if (m > total) return;
    for (let s = total; s >= m; s--) { const prev = best[s - m]; if (!prev || prev.length >= 8) continue; if (!best[s] || prev.length + 1 < best[s].length) best[s] = prev.concat(i); }
  });
  let s = total; while (s > 0 && !best[s]) s--;
  const out = (best[s] || []).map(i => usable[i]);
  for (let i = 1; i < out.length; i++) if (out[i].p === out[i - 1].p) { const j = out.findIndex((x, k) => k > i && x.p !== out[i - 1].p); if (j > 0) [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function groups() {
  const m = new Map();
  for (const e of AVAILABLE()) { const g = groupOf(e); if (!g) continue; if (!m.has(g.key)) m.set(g.key, { ...g, p: e.p, eps: [] }); m.get(g.key).eps.push(e); }
  return [...m.values()].map(g => ({ ...g, eps: g.eps.sort((a, b) => a.ep - b.ep) }));
}

/* ---------- narrator preview ---------- */
let prev = null, prevT = null, prevStart = null;
export async function preview(v) {
  const id = "spotlight"; if (!available(id)) return;
  try {
    await ensureDetail(id);
    const uri = await ensureAudio(id, v);
    if (player && G.playing) player.pause();
    await setupMode();
    if (!prev) prev = createAudioPlayer(null);
    clearTimeout(prevT); clearTimeout(prevStart); prev.replace({ uri });
    const start = G.detail[id].at[v][2], t0 = Date.now();
    const go = () => { if (!prev.isLoaded && Date.now() - t0 < 4000) { prevStart = setTimeout(go, 150); return; } try { if (prev.isLoaded) prev.seekTo(start).catch(() => {}); prev.play(); } catch (e) {} };
    prevStart = setTimeout(go, 150);
    prevT = setTimeout(() => { try { prev.pause(); } catch (e) {} }, 11000);
  } catch (e) { toast("Couldn't load the sample. Check your connection."); }
}

/* files played but not downloaded are temporary: tidy those of finished or abandoned episodes */
async function tidy() {
  for (const k of Object.keys(G.p.saved)) {
    { const i = k.lastIndexOf("-"), id = k.slice(0, i), v = k.slice(i + 1);
      try { const info = await FS.getInfoAsync(DIR + fileName(id, v)); if (!info.exists) { delete G.p.saved[k]; delete G.p.keep[k]; continue; } } catch (e) {} }
    if (G.p.keep[k]) continue; const i = k.lastIndexOf("-"), id = k.slice(0, i);
    if (!G.p.pos[id] && id !== "spotlight") await dropFile(id, k.slice(i + 1));
  }
}
export function init() { loadPrefs(); fetchManifest(); tidy().then(() => savePrefs()).catch(() => {}); }
