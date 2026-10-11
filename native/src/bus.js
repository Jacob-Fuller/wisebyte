/* App-wide UI state and change notifications.
   The engine mutates plain objects (like the web app did), then calls changed() to redraw. */
const listeners = new Set();
let version = 0;

export const ui = {
  tab: "today",              // today | library | arena | scroll | me | inner
  libPillar: null, libArea: null, libSubject: null, learnCat: "all", learnLevel: "all",
  foldOpen: {}, accOpen: {},
  lookup: null,              // { q, w, status, entry }
  sheet: null,               // { type, ...props }
  paywall: null,             // { dismissable, reason }
  toasts: [],
  scrollTo0: 0,              // bump to scroll the current screen to the top
};

export function changed() { version++; listeners.forEach(f => { try { f(version); } catch (e) {} }); }
export function subscribe(f) { listeners.add(f); return () => listeners.delete(f); }

let toastTimer = null;
export function toast(msg) {
  ui.toasts.push(msg);
  if (!toastTimer) nextToast();
}
function nextToast() {
  if (!ui.toasts.length) { toastTimer = null; ui.toast = null; changed(); return; }
  ui.toast = ui.toasts.shift(); changed();
  toastTimer = setTimeout(nextToast, 2400);
}

export function openSheet(type, props) { ui.sheet = { type, ...(props || {}) }; changed(); }
export function closeSheet() { ui.sheet = null; changed(); }
export function goTab(t) { ui.tab = t; ui.scrollTo0++; changed(); }
