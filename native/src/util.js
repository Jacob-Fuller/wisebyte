export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const rand = n => Math.floor(Math.random() * n);
export const pick = a => a[rand(a.length)];
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const hashStr = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pad = n => String(n).padStart(2, "0");
export const keyOf = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const today = () => keyOf(new Date());
export const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
export const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
export const plural = (n, one, many) => n + " " + (n === 1 ? one : (many || one + "s"));
export const ago = k => { const g = daysBetween(k, today()); return g <= 0 ? "earlier today" : g === 1 ? "yesterday" : g + " days ago"; };
/* en-AU thousands separators without relying on Intl */
export const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
