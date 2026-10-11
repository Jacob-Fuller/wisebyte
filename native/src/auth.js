/* Accounts (Supabase Auth, Wisebyte project, Sydney) and progress backup.
   Same flow as the web app: email + password, 6-digit email codes, one `progress` row per account. */
import { AppState } from "react-native";
import * as Store from "./storage";
import * as E from "./engine";
import { changed } from "./bus";

const AUTH_CONFIG = {
  url: "https://xastaekivlmpyzxfwuid.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhc3RhZWtpdmxtcHl6eGZ3dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTgzNzgsImV4cCI6MjEwNzE5NDM3OH0.cgbWpmf67zz7SwyRZKKRggD9pfy-ZLzUdhHuHCJpnmM",
};
const AUTH_KEY = "wb-auth";

export const Auth = {
  session: null,
  configured: () => !!(AUTH_CONFIG.url && AUTH_CONFIG.anonKey),
  user: () => Auth.session && Auth.session.user,
  async load() {
    Auth.session = Store.get(AUTH_KEY, null);
    if (Auth.session) { try { await Auth.fresh(); } catch (e) { if (e.status === 400 || e.status === 401) Auth.set(null); } }
    changed();
    if (Auth.user()) Cloud.sync();
  },
  set(s) {
    Auth.session = s ? { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600), user: { id: s.user.id, email: s.user.email } } : null;
    Store.set(AUTH_KEY, Auth.session);
  },
  async call(path, { method = "POST", body, token, base = "/auth/v1" } = {}) {
    let r;
    try {
      r = await fetch(AUTH_CONFIG.url + base + path, { method, headers: { apikey: AUTH_CONFIG.anonKey, Authorization: "Bearer " + (token || AUTH_CONFIG.anonKey), "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    } catch (e) { const er = new Error("Couldn't connect. Check your internet and try again."); er.status = 0; throw er; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const er = new Error(Auth.friendly(j, r.status)); er.status = r.status; er.code = j.error_code || j.code; throw er; }
    return j;
  },
  friendly(j, status) {
    const m = String(j.error_description || j.msg || j.message || j.error || "").toLowerCase();
    if (status === 429 || m.includes("rate limit")) return "Too many attempts. Wait a minute, then try again.";
    if (m.includes("invalid login")) return "That email and password don't match.";
    if (m.includes("not confirmed")) return "Please confirm your email first. We can send you a new code.";
    if (m.includes("already registered") || m.includes("already been registered")) return "There's already an account with that email. Try signing in.";
    if (m.includes("expired") || m.includes("invalid") && m.includes("token")) return "That code is wrong or has expired. Request a new one.";
    if (m.includes("password") && (m.includes("weak") || m.includes("characters") || m.includes("pwned") || m.includes("leaked"))) return "Please choose a stronger password: at least 8 characters, with letters and numbers, and not one that's been leaked online.";
    if (m.includes("same") && m.includes("password")) return "Your new password must be different from your old one.";
    if (m.includes("email") && m.includes("invalid")) return "Please check the email address.";
    return "Something went wrong. Please try again.";
  },
  async fresh() {
    const s = Auth.session; if (!s) return null;
    if (s.expires_at - Date.now() / 1000 > 60) return s.access_token;
    Auth.set(await Auth.call("/token?grant_type=refresh_token", { body: { refresh_token: s.refresh_token } }));
    return Auth.session.access_token;
  },
  async signUp(email, password) {
    const j = await Auth.call("/signup", { body: { email, password } });
    if (j.access_token) { Auth.set(j); return { signedIn: true }; }
    return { signedIn: false };
  },
  async verify(email, token, type) { const j = await Auth.call("/verify", { body: { email, token, type } }); Auth.set(j); return j; },
  async signIn(email, password) { Auth.set(await Auth.call("/token?grant_type=password", { body: { email, password } })); },
  resend: email => Auth.call("/resend", { body: { type: "signup", email } }),
  recover: email => Auth.call("/recover", { body: { email } }),
  async setPassword(password) { await Auth.call("/user", { method: "PUT", body: { password }, token: await Auth.fresh() }); },
  async signOut() { try { clearTimeout(Cloud.timer); await Cloud.push(); } catch (e) {} try { const t = await Auth.fresh(); if (t) await Auth.call("/logout", { token: t }); } catch (e) {} Auth.set(null); },
  async deleteAccount() { await Auth.call("/delete-account", { base: "/functions/v1", token: await Auth.fresh() }); Auth.set(null); },
};

/* Merging only ever adds progress: maps combine, numbers take the higher value,
   flags stay set once set, lists are joined, dates take the later one. */
const SCROLL_SYNC = ["wbs-kept", "wbs-seen", "wbs-total"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
export function mergeVal(a, b) {
  if (a === undefined || a === null) return b;
  if (b === undefined || b === null) return a;
  if (Array.isArray(a) && Array.isArray(b)) return [...new Set([...b, ...a].map(x => JSON.stringify(x)))].map(x => JSON.parse(x));
  if (typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const o = {};
    for (const k of new Set([...Object.keys(b), ...Object.keys(a)])) o[k] = mergeVal(a[k], b[k]);
    return o;
  }
  if (typeof a === "number" && typeof b === "number") return Math.max(a, b);
  if (typeof a === "boolean" && typeof b === "boolean") return a || b;
  if (typeof a === "string" && typeof b === "string" && DATE_RE.test(a) && DATE_RE.test(b)) return a > b ? a : b;
  return a;
}
export const scrollHooks = { reload: null };
export const Cloud = {
  timer: null, busy: false, last: 0,
  async req(method, query, body) {
    const t = await Auth.fresh(); if (!t) return null;
    const r = await fetch(AUTH_CONFIG.url + "/rest/v1/progress" + query, { method,
      headers: { apikey: AUTH_CONFIG.anonKey, Authorization: "Bearer " + t, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error("Sync failed (" + r.status + ")");
    return method === "GET" ? r.json() : null;
  },
  scrollData() { const o = {}; for (const k of SCROLL_SYNC) { const v = Store.get(k, null); if (v != null) o[k] = v; } return o; },
  mergeScroll(remote) {
    const local = Cloud.scrollData(); let changedAny = false;
    for (const k of SCROLL_SYNC) {
      if (remote[k] === undefined) continue;
      const v = mergeVal(local[k], remote[k]);
      if (JSON.stringify(v) === JSON.stringify(local[k])) continue;
      changedAny = true; Store.set(k, v);
    }
    if (changedAny && scrollHooks.reload) scrollHooks.reload();
  },
  async push() {
    const u = Auth.user(); if (!u) return;
    await Cloud.req("POST", "", { user_id: u.id, data: { v: 1, profile: E.state, scroll: Cloud.scrollData() }, updated_at: new Date().toISOString() });
    Cloud.last = Date.now();
  },
  schedule(ms = 2500) {
    if (!Auth.user()) return;
    clearTimeout(Cloud.timer); Cloud.timer = setTimeout(() => { Cloud.timer = null; Cloud.push().catch(() => {}); }, ms);
  },
  async sync() {
    const u = Auth.user(); if (!u || Cloud.busy) return;
    Cloud.busy = true;
    try {
      const rows = await Cloud.req("GET", "?select=data&user_id=eq." + encodeURIComponent(u.id));
      const d = rows && rows[0] && rows[0].data;
      if (d && d.profile) {
        const merged = E.mergeProfile(mergeVal(E.state, E.mergeProfile(d.profile)));
        if (JSON.stringify(merged) !== JSON.stringify(E.state)) { E.setProfile(merged); changed(); }
      }
      if (d && d.scroll) Cloud.mergeScroll(d.scroll);
      clearTimeout(Cloud.timer); await Cloud.push();
    } catch (e) {} finally { Cloud.busy = false; }
  },
};
E.hooks.onSave = () => Cloud.schedule();

/* push when the app goes to the background; pull when it comes back after a while */
AppState.addEventListener("change", s => {
  if (s === "background" || s === "inactive") { E.flushSave(); if (Cloud.timer) { clearTimeout(Cloud.timer); Cloud.timer = null; Cloud.push().catch(() => {}); } }
  else if (s === "active" && Date.now() - Cloud.last > 60000) Cloud.sync();
});

export const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const passProblem = p => p.length < 8 ? "Use at least 8 characters." : !/[A-Za-z]/.test(p) || !/\d/.test(p) ? "Use a mix of letters and numbers." : "";
