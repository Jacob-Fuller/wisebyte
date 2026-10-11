/* Device storage. Everything is read once at launch into memory, then written back in the background. */
import AsyncStorage from "@react-native-async-storage/async-storage";

const mem = {};
const KEYS = ["wisebyte.v3", "wb-auth", "wisebyte.sub.wisebyte", "wbs-day", "wbs-kept", "wbs-seen", "wbs-total", "wbs-welcomed"];

export async function loadAll() {
  try {
    const pairs = await AsyncStorage.multiGet(KEYS);
    for (const [k, raw] of pairs) if (raw != null) { try { mem[k] = JSON.parse(raw); } catch (e) {} }
  } catch (e) {}
}
export function get(k, d) { return k in mem ? mem[k] : d; }
export function set(k, v) {
  if (v === null || v === undefined) { delete mem[k]; AsyncStorage.removeItem(k).catch(() => {}); return; }
  mem[k] = v;
  AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});
}
