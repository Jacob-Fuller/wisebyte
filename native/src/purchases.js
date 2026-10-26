/* Subscriptions: Wisebyte Monthly (auto-renewing) and Wisebyte Lifetime (one-time). Same rules as the web store.js. */
import WbStore from "../modules/wb-store";
import * as Store from "./storage";
import { ui, changed } from "./bus";

const CFG = {
  name: "Wisebyte", price: "$9.99", ios: "au.wisebyte.wisebyte.monthly",
  planName: "Wisebyte Monthly", lifeName: "Wisebyte Lifetime", lifePrice: "$49.99", iosLife: "au.wisebyte.wisebyte.lifetime",
};
const CACHE_KEY = "wisebyte.sub.wisebyte";
const GRACE = 40 * 864e5;
/* Tester builds only: set by the "Wisebyte native (tester) → TestFlight" Codemagic workflow. Never set for a build sent to App Review. */
const TESTER = process.env.EXPO_PUBLIC_TESTER_UNLOCK === "1";
const S = { mode: WbStore ? "apple" : "preview", own: false, life: false, prices: {}, intro: {}, busy: false, ready: false };

const remember = () => Store.set(CACHE_KEY, { own: S.own, all: false, life: S.life, at: Date.now() });
function recall() { const r = Store.get(CACHE_KEY, null); if (!r) return; if (r.life) S.life = true; if (Date.now() - r.at < GRACE) S.own = !!r.own; }

async function refresh() {
  if (!WbStore) return;
  try {
    const owned = await WbStore.owned();
    S.own = owned.includes(CFG.ios);
    if (owned.includes(CFG.iosLife)) S.life = true;
    remember();
  } catch (e) {}
  sync();
}
async function loadProducts() {
  try {
    const ps = await WbStore.products([CFG.ios, CFG.iosLife]);
    for (const p of ps) {
      S.prices[p.id] = p.price;
      S.intro[p.id] = p.trialUnit ? period(p.trialUnit, p.trialValue) : null;
    }
    S.ready = true;
  } catch (e) {}
}
function period(unit, n) {
  if (unit === "day") return n + (n === 1 ? " day" : " days");
  if (unit === "week") return n * 7 + " days";
  if (unit === "month") return n + (n === 1 ? " month" : " months");
  return n + " year";
}
/* show the paywall whenever there's no access (and hide it once there is) */
function sync() {
  if (api.entitled()) { if (ui.paywall) ui.paywall = null; }
  else if (!ui.paywall) ui.paywall = { dismissable: false };
  changed();
}

const api = {
  cfg: CFG,
  get mode() { return S.mode; },
  get busy() { return S.busy; },
  async init() {
    recall();
    if (!WbStore) { sync(); return; }
    try { WbStore.addListener("onChange", () => refresh()); } catch (e) {}
    await Promise.all([loadProducts(), refresh()]);
    sync();
  },
  entitled() { return TESTER || S.mode === "preview" || S.life || S.own; },
  status() {
    if (TESTER) return "Tester build: everything unlocked";
    if (S.mode === "preview") return "Preview: everything unlocked";
    if (S.life) return CFG.lifeName + " (owned)";
    if (S.own) return CFG.name + " (active)";
    return "Not subscribed";
  },
  price(key) { return key === "life" ? S.prices[CFG.iosLife] || CFG.lifePrice : S.prices[CFG.ios] || CFG.price; },
  trial(key) { return key === "life" ? null : S.intro[CFG.ios] || null; },
  async buy(key) {
    if (!WbStore) return;
    S.busy = true; changed();
    try {
      if (!S.ready) await loadProducts();
      const r = await WbStore.buy(key === "life" ? CFG.iosLife : CFG.ios);
      if (r === "unverified") throw new Error("The purchase couldn't be verified. You haven't been charged.");
      if (r === "pending") throw new Error("Your purchase is waiting for approval. It will unlock once it's approved.");
      await refresh();
    } catch (e) {
      throw new Error(e && e.message && !/^Error/.test(e.message) ? e.message : "The purchase didn't go through. You haven't been charged.");
    } finally { S.busy = false; changed(); }
  },
  async restore() { if (!WbStore) return; try { await WbStore.restore(); } catch (e) {} await refresh(); },
  async manage() { if (!WbStore) return; try { await WbStore.manage(); } catch (e) {} },
  showPaywall(opt) { ui.paywall = Object.assign({ dismissable: true, reason: "" }, opt || {}); changed(); },
  hidePaywall() { if (api.entitled() || (ui.paywall && ui.paywall.dismissable)) { ui.paywall = null; changed(); } },
};
export default api;
