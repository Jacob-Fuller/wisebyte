/* =====================================================================
   Wisebyte subscriptions — shared by Wisebyte, Wisebyte - Go,
   Wisebyte - Scroll and Wisebyte Kids.

   Plans (monthly, auto-renewing):
     • This app on its own ............ $9.99  (Wisebyte Kids: $4.99)
     • Wisebyte All Access ............ $24.99 (unlocks all four apps)

   Stores:
     • iPhone / iPad: Apple In-App Purchase through cordova-plugin-purchase
       (window.CdvPurchase) inside the Capacitor app.
     • Windows: Microsoft Store add-ons through the Digital Goods API +
       Payment Request API, when the app is installed from the Microsoft
       Store as a packaged web app (PWA).
     • Anywhere else (a normal browser, the Claude preview) runs in
       "preview" mode: everything is unlocked and nothing can be bought.

   All Access across apps: a store only tells an app about its own
   purchases, so when All Access is active in one app it is recorded in
   storage the other Wisebyte apps can read:
     • iOS: the shared App Group "group.au.wisebyte.shared" through the
       small SharedEntitlement native plugin (see the setup guide).
     • Windows: localStorage, shared automatically when all four apps are
       hosted on the same domain (for example wisebyte.app/, /go/, /scroll/,
       /kids/).
   The record is refreshed every time the buying app opens and expires
   40 days after it was last confirmed, so a cancelled subscription stops
   unlocking the other apps.

   Product IDs below must match App Store Connect and Partner Center.
   ===================================================================== */
(function () {
  "use strict";

  const APPS = {
    wisebyte: { name: "Wisebyte",          price: "$9.99", ios: "au.wisebyte.wisebyte.monthly", ms: "wisebyte_monthly", iosAll: "au.wisebyte.wisebyte.allaccess", msAll: "wisebyte_allaccess_wb" },
    go:       { name: "Wisebyte - Go",     price: "$9.99", ios: "au.wisebyte.go.monthly",       ms: "wisebytego_monthly", iosAll: "au.wisebyte.go.allaccess", msAll: "wisebyte_allaccess_go" },
    scroll:   { name: "Wisebyte - Scroll", price: "$9.99", ios: "au.wisebyte.scroll.monthly",   ms: "wisebytescroll_monthly", iosAll: "au.wisebyte.scroll.allaccess", msAll: "wisebyte_allaccess_scroll" },
    kids:     { name: "Wisebyte Kids",     price: "$4.99", ios: "au.wisebyte.kids.monthly",     ms: "wisebytekids_monthly", iosAll: "au.wisebyte.kids.allaccess", msAll: "wisebyte_allaccess_kids" },
  };
  const ALL = { name: "Wisebyte All Access", price: "$24.99", blurb: "Wisebyte, Wisebyte - Go, Wisebyte - Scroll and Wisebyte Kids" };
  const GROUP = "group.au.wisebyte.shared";
  const MS_BILLING = "https://store.microsoft.com/billing";
  const SHARE_KEY = "wisebyte.entitlement.v1";
  const GRACE = 40 * 864e5;
  /* Your live website domain(s). On these hosts, a plain browser (not the
     App Store or Microsoft Store app) can't unlock anything and is asked to
     get the app from a store. Everywhere else (the Claude preview, localhost)
     runs in preview mode with everything unlocked. Example: ["wisebyte.app"] */
  const PRODUCTION_HOSTS = [];  /* TEMPORARILY UNLOCKED for review. Before release set to ["jacob-fuller.github.io"] */
  const CACHE_KEY = "wisebyte.sub.";

  const S = {
    app: null, cfg: null, mode: "preview", ready: false,
    own: false, all: false, sharedAll: false, prices: {}, intro: {},
    listeners: [], busy: false, opts: {},
  };

  const now = () => Date.now();
  const lsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const cap = () => (window.Capacitor && window.Capacitor.Plugins) || {};
  const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  /* ---------- shared All Access record ---------- */
  async function readShared() {
    let rec = null;
    try {
      const P = cap().SharedEntitlement;
      if (P) { const r = await P.get({ group: GROUP, key: SHARE_KEY }); rec = r && r.value ? JSON.parse(r.value) : null; }
    } catch (e) {}
    if (!rec) rec = lsGet(SHARE_KEY);
    return !!(rec && rec.all && now() - rec.checked < GRACE);
  }
  async function writeShared(active) {
    const rec = { all: !!active, checked: now(), by: S.app };
    try { const P = cap().SharedEntitlement; if (P) await P.set({ group: GROUP, key: SHARE_KEY, value: JSON.stringify(rec) }); } catch (e) {}
    lsSet(SHARE_KEY, rec);
  }
  /* last known status for this app, so it still opens offline */
  const remember = () => lsSet(CACHE_KEY + S.app, { own: S.own, all: S.all, at: now() });
  function recall() { const r = lsGet(CACHE_KEY + S.app); if (r && now() - r.at < GRACE) { S.own = !!r.own; S.all = !!r.all; } }

  function emit() { S.listeners.forEach(f => { try { f(api.entitled()); } catch (e) {} }); }

  /* ---------- Apple ---------- */
  const Apple = {
    ids() { return [S.cfg.ios, S.cfg.iosAll]; },
    async init() {
      const CP = window.CdvPurchase;
      if (!CP) return false;
      const { store, ProductType, Platform } = CP;
      store.register(this.ids().map(id => ({ id, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE, group: "wisebyte_" + S.app })));
      store.when().approved(t => t.verify()).verified(r => r.finish()).receiptUpdated(() => this.refresh()).productUpdated(() => this.refresh());
      try { await store.initialize([Platform.APPLE_APPSTORE]); } catch (e) {}
      S.ready = true; this.refresh(); return true;
    },
    refresh() {
      const store = window.CdvPurchase.store;
      this.ids().forEach(id => {
        const p = store.get(id); const o = p && p.getOffer && p.getOffer();
        const phases = (o && o.pricingPhases) || (p && p.pricing ? [p.pricing] : []);
        const full = phases[phases.length - 1]; if (full && full.price) S.prices[id] = full.price;
        const free = phases.find(ph => ph.priceMicros === 0 && ph.billingPeriod);
        S.intro[id] = free ? isoPeriod(free.billingPeriod) : null;
      });
      const was = api.entitled();
      S.own = store.owned(S.cfg.ios); S.all = store.owned(S.cfg.iosAll);
      if (S.all) writeShared(true);
      remember();
      if (was !== api.entitled()) emit(); else emit();
    },
    async buy(key) {
      const id = key === "all" ? S.cfg.iosAll : S.cfg.ios;
      const p = window.CdvPurchase.store.get(id), offer = p && p.getOffer();
      if (!offer) throw new Error("The App Store isn't available right now. Please try again soon.");
      const err = await offer.order();
      if (err && err.code !== window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) throw new Error("The purchase didn't go through. You haven't been charged.");
    },
    async restore() { await window.CdvPurchase.store.restorePurchases(); this.refresh(); },
    manage() { try { window.CdvPurchase.store.manageSubscriptions(); } catch (e) { open("https://apps.apple.com/account/subscriptions"); } },
  };

  /* ---------- Microsoft Store ---------- */
  const Microsoft = {
    svc: null,
    ids() { return [S.cfg.ms, S.cfg.msAll]; },
    async init() {
      if (!("getDigitalGoodsService" in window)) return false;
      try { this.svc = await window.getDigitalGoodsService(MS_BILLING); } catch (e) { return false; }
      if (!this.svc) return false;
      try {
        const details = await this.svc.getDetails(this.ids());
        details.forEach(d => {
          if (d.price) S.prices[d.itemId] = new Intl.NumberFormat("en-AU", { style: "currency", currency: d.price.currency }).format(+d.price.value);
          S.intro[d.itemId] = d.freeTrialPeriod ? isoPeriod(d.freeTrialPeriod) : null;
        });
      } catch (e) {}
      S.ready = true; await this.refresh(); return true;
    },
    async refresh() {
      try {
        const owned = (await this.svc.listPurchases()).map(p => p.itemId);
        S.own = owned.includes(S.cfg.ms); S.all = owned.includes(S.cfg.msAll);
        if (S.all) writeShared(true);
        remember();
      } catch (e) {}
      emit();
    },
    async buy(key) {
      const sku = key === "all" ? S.cfg.msAll : S.cfg.ms;
      const req = new PaymentRequest([{ supportedMethods: MS_BILLING, data: { sku } }], { total: { label: "Total", amount: { currency: "AUD", value: "0" } } });
      const resp = await req.show();
      await resp.complete("success");
      await this.refresh();
    },
    async restore() { await this.refresh(); },
    manage() { open("https://account.microsoft.com/services"); },
  };

  function isoPeriod(p) {
    const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(p || ""); if (!m) return null;
    const [, y, mo, w, d] = m.map(x => +x || 0);
    if (d) return d + (d === 1 ? " day" : " days"); if (w) return w * 7 + " days";
    if (mo) return mo + (mo === 1 ? " month" : " months"); if (y) return y + " year";
    return null;
  }

  /* ---------- paywall ---------- */
  const THEMES = {
    stoic: { bg: "#141210", card: "#1D1A16", card2: "#24201B", line: "#353029", ink: "#F3EEE6", ink2: "#A59D91", accent: "#C08F5C", accentInk: "#1A140D", font: "Figtree,system-ui,-apple-system,'Segoe UI',sans-serif", display: "'Cormorant Garamond','Iowan Old Style',Georgia,serif", radius: "16px" },
    kids:  { bg: "#E6F1FF", card: "#FFFFFF", card2: "#F1F6FD", line: "#CFDDF0", ink: "#1B2446", ink2: "#5A6788", accent: "#2F7DE1", accentInk: "#FFFFFF", font: "ui-rounded,'SF Pro Rounded',Nunito,'Segoe UI',system-ui,sans-serif", display: "ui-rounded,'SF Pro Rounded','Arial Rounded MT Bold',system-ui,sans-serif", radius: "20px" },
  };
  function css(t) {
    return `#wbpw{position:fixed;inset:0;z-index:9999;background:${t.bg};color:${t.ink};font-family:${t.font};overflow-y:auto;-webkit-overflow-scrolling:touch}
#wbpw *{box-sizing:border-box}
#wbpw .in{max-width:520px;margin:0 auto;padding:calc(28px + env(safe-area-inset-top,0px)) 18px calc(28px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:14px}
#wbpw .logo{width:56px;height:56px;color:${t.accent};align-self:center}
#wbpw h2{font-family:${t.display};font-weight:600;font-size:32px;line-height:1.1;margin:0;text-align:center}
#wbpw p{margin:0;color:${t.ink2};line-height:1.5;text-align:center}
#wbpw ul{margin:4px 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
#wbpw li{display:flex;gap:10px;align-items:flex-start;line-height:1.45}
#wbpw li:before{content:"";flex:none;width:8px;height:8px;margin-top:8px;border-radius:50%;background:${t.accent}}
#wbpw .plan{display:flex!important;flex-direction:row!important;justify-content:space-between;align-items:center;gap:12px;min-height:0;height:auto;width:100%;text-align:left;padding:16px;border-radius:${t.radius};border:2px solid ${t.line};background:${t.card};color:${t.ink};font:inherit;cursor:pointer}
#wbpw .plan[aria-pressed="true"]{border-color:${t.accent}}
#wbpw .plan>span{display:block;margin:0;padding:0}
#wbpw .plan>span:first-child{flex:1;min-width:0;text-align:left}
#wbpw .plan b{display:block;font-size:17px}
#wbpw .plan small{display:block;color:${t.ink2};font-size:13px;margin-top:2px;line-height:1.35}
#wbpw .plan .pr{font-weight:700;font-size:17px;white-space:nowrap;text-align:right}
#wbpw .plan .pr small{font-weight:500}
#wbpw .tag{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:99px;background:${t.accent};color:${t.accentInk};font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;vertical-align:2px}
#wbpw .go{width:100%;padding:16px;border:0;border-radius:${t.radius};background:${t.accent};color:${t.accentInk};font:inherit;font-weight:700;font-size:17px;cursor:pointer}
#wbpw .go[disabled]{opacity:.5}
#wbpw .fine{font-size:12px;line-height:1.5;color:${t.ink2};text-align:center}
#wbpw .links{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px}
#wbpw .links button{background:none;border:0;color:${t.accent};font:inherit;font-size:14px;font-weight:600;padding:6px 2px;cursor:pointer}
#wbpw .msg{min-height:1.4em;font-size:14px;text-align:center;color:${t.ink}}
#wbpw .note{padding:10px 12px;border-radius:12px;background:${t.card2};font-size:13px;color:${t.ink2};text-align:center}`;
  }
  const BITE = '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><defs><mask id="wbpwbite"><rect width="32" height="32" fill="#fff"/><circle cx="27.5" cy="6.5" r="5.5" fill="#000"/><circle cx="31" cy="14" r="4" fill="#000"/></mask></defs><circle cx="15" cy="17" r="14" fill="currentColor" mask="url(#wbpwbite)"/></svg>';
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function price(key) {
    const id = S.mode === "apple" ? (key === "all" ? S.cfg.iosAll : S.cfg.ios) : (key === "all" ? S.cfg.msAll : S.cfg.ms);
    return S.prices[id] || (key === "all" ? ALL.price : S.cfg.price);
  }
  function trial(key) {
    const id = S.mode === "apple" ? (key === "all" ? S.cfg.iosAll : S.cfg.ios) : (key === "all" ? S.cfg.msAll : S.cfg.ms);
    return S.intro[id] || null;
  }

  let pick = "own";
  function showPaywall(opt) {
    opt = Object.assign({ dismissable: false, reason: "" }, opt || {});
    const t = THEMES[S.opts.theme || "stoic"];
    if (!document.getElementById("wbpwcss")) { const st = document.createElement("style"); st.id = "wbpwcss"; st.textContent = css(t); document.head.appendChild(st); }
    let el = document.getElementById("wbpw");
    if (!el) { el = document.createElement("div"); el.id = "wbpw"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Subscribe"); document.body.appendChild(el); }
    const storeName = S.mode === "apple" ? "Apple ID" : S.mode === "microsoft" ? "Microsoft account" : "store account";
    const renewal = S.mode === "microsoft"
      ? "Payment is charged to your Microsoft account when you confirm. The subscription renews automatically each month until you cancel it in your Microsoft account's Services & subscriptions page."
      : "Payment is charged to your Apple ID when you confirm. The subscription renews automatically each month unless you cancel at least 24 hours before the end of the current period, and your account is charged for renewal within 24 hours before the period ends. Manage or cancel any time in your App Store account settings.";
    const tr = trial(pick);
    el.innerHTML = `<div class="in">${S.opts.logoHTML || BITE}
      <h2>${esc(S.opts.headline || ("Subscribe to " + S.cfg.name))}</h2>
      <p>${esc(S.opts.pitch || "")}</p>
      ${S.opts.features ? `<ul>${S.opts.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="plan" data-plan="own" aria-pressed="${pick === "own"}"><span><b>${esc(S.cfg.name)}</b><small>This app, every lesson and feature</small></span><span class="pr">${esc(price("own"))}<small><br>per month</small></span></button>
        <button class="plan" data-plan="all" aria-pressed="${pick === "all"}"><span><b>${esc(ALL.name)}<span class="tag">All 4 apps</span></b><small>${esc(ALL.blurb)}</small></span><span class="pr">${esc(price("all"))}<small><br>per month</small></span></button>
      </div>
      <button class="go" id="wbpwbuy" ${S.busy || S.mode === "web" ? "disabled" : ""}>${S.mode === "web" ? "Get the app from the App Store or Microsoft Store" : S.mode === "preview" ? "Available in the app store version" : tr ? `Start ${esc(tr)} free, then ${esc(price(pick))} a month` : `Subscribe for ${esc(price(pick))} a month`}</button>
      <p class="msg" id="wbpwmsg" aria-live="polite">${esc(opt.reason)}</p>
      ${S.mode === "web" ? `<p class="note">Subscriptions are sold inside the ${esc(S.cfg.name)} app from the App Store (iPhone and iPad) or the Microsoft Store (Windows). Already subscribed? Open the app there.</p>` : ""}
      ${S.mode === "preview" ? `<p class="note">This is the preview version, so everything is already unlocked. Subscriptions are sold in the App Store and Microsoft Store versions.</p>` : ""}
      <p class="fine">Monthly auto-renewing subscription. ${esc(S.cfg.name)} is ${esc(price("own"))} a month. ${esc(ALL.name)} is ${esc(price("all"))} a month and unlocks ${esc(ALL.blurb)} on this device's ${esc(storeName)}.${tr ? ` Free trials are for new subscribers; if you don't cancel before the trial ends, the subscription starts automatically.` : ""} ${renewal}</p>
      <div class="links"><button data-l="restore">Restore purchases</button><button data-l="terms">Terms of Use</button><button data-l="privacy">Privacy Policy</button>${opt.dismissable || S.mode === "preview" ? `<button data-l="close">Not now</button>` : ""}</div>
    </div>`;
    const msg = m => { const x = document.getElementById("wbpwmsg"); if (x) x.textContent = m; };
    el.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => { pick = b.dataset.plan; showPaywall(opt); });
    el.querySelector("#wbpwbuy").onclick = () => guard(async () => {
      if (S.mode === "preview") { hidePaywall(); return; }
      S.busy = true; showPaywall(opt);
      try { await api.buy(pick); } catch (e) { S.busy = false; showPaywall(Object.assign({}, opt, { reason: e.message || "Something went wrong. You haven't been charged." })); return; }
      S.busy = false;
      if (api.entitled()) hidePaywall(); else showPaywall(opt);
    });
    el.querySelectorAll("[data-l]").forEach(b => b.onclick = () => {
      const l = b.dataset.l;
      if (l === "restore") guard(async () => { msg("Checking…"); try { await api.restore(); } catch (e) {} if (api.entitled()) { hidePaywall(); } else msg(`No active subscription was found for this ${storeName}.`); });
      else if (l === "terms") (S.opts.openDoc || defaultDoc)(S.opts.termsUrl || "terms.html");
      else if (l === "privacy") (S.opts.openDoc || defaultDoc)(S.opts.privacyUrl || "privacy.html");
      else if (l === "close") hidePaywall();
    });
  }
  function hidePaywall() { const el = document.getElementById("wbpw"); if (el) el.remove(); }
  /* Kids: purchases sit behind the grown-ups gate */
  function guard(fn) { if (S.opts.gate) S.opts.gate(fn); else fn(); }
  function defaultDoc(url) {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.6);display:flex;flex-direction:column;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px))";
    d.innerHTML = `<iframe src="${esc(url)}" title="Document" style="flex:1;width:100%;max-width:720px;margin:0 auto;border:0;border-radius:14px;background:#fff"></iframe><button style="margin:10px auto 0;padding:12px 26px;border:0;border-radius:12px;font:inherit;font-weight:700;cursor:pointer">Close</button>`;
    d.querySelector("button").onclick = () => d.remove();
    document.body.appendChild(d);
  }

  /* ---------- public API ---------- */
  const api = {
    /* opts: { app, theme, headline, pitch, features, gate(fn), openDoc(url), termsUrl, privacyUrl, logoHTML } */
    async init(opts) {
      S.opts = opts || {}; S.app = S.opts.app; S.cfg = APPS[S.app];
      if (!S.cfg) throw new Error("Unknown Wisebyte app " + S.app);
      recall();
      S.sharedAll = await readShared();
      if (isNative()) {
        S.mode = "apple";
        const tryApple = async () => { if (!(await Apple.init())) return false; return true; };
        if (!(await tryApple())) document.addEventListener("deviceready", () => tryApple(), { once: true });
      } else if (await Microsoft.init()) {
        S.mode = "microsoft";
      } else {
        const h = location.hostname;
        S.mode = PRODUCTION_HOSTS.some(d => h === d || h.endsWith("." + d)) ? "web" : "preview";
      }
      emit();
      return api;
    },
    get mode() { return S.mode; },
    entitled() { return S.mode === "preview" || S.own || S.all || S.sharedAll; },
    status() {
      if (S.mode === "preview") return "Preview: everything unlocked";
      if (S.all) return ALL.name + " (active)";
      if (S.own) return S.cfg.name + " (active)";
      if (S.sharedAll) return ALL.name + " (from another Wisebyte app)";
      return "Not subscribed";
    },
    onChange(f) { S.listeners.push(f); },
    async buy(key) { if (S.mode === "web") throw new Error("Please subscribe in the app from the App Store or Microsoft Store."); if (S.mode === "apple") return Apple.buy(key); if (S.mode === "microsoft") return Microsoft.buy(key); },
    async restore() { if (S.mode === "apple") await Apple.restore(); else if (S.mode === "microsoft") await Microsoft.restore(); S.sharedAll = await readShared(); emit(); },
    manage() { guard(() => { if (S.mode === "apple") Apple.manage(); else if (S.mode === "microsoft") Microsoft.manage(); }); },
    showPaywall, hidePaywall,
    /* call on launch: shows the paywall if the user isn't subscribed */
    require() { if (!api.entitled()) showPaywall(); else hidePaywall(); },
    plans: { apps: APPS, all: ALL },
  };
  window.WBStore = api;
})();
