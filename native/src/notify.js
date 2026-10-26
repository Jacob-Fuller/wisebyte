/* Daily lesson hint: one local notification a day at the user's chosen time, teasing the lesson the app shows as today's. */
import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import * as E from "./engine";
import { toast, changed } from "./bus";
import { today, addDays, parseKey } from "./util";

const HORIZON = 14;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export const fmtTime = t => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };

async function granted() {
  const p = await Notifications.getPermissionsAsync();
  return p.granted || (p.ios && p.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL);
}

/* rebuild the next two weeks of notifications from the current state */
export async function refresh() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const n = E.state.notify;
    if (!n || !n.on || !(await granted())) return;
    const [h, m] = n.time.split(":").map(Number), now = new Date();
    for (let i = 0; i < HORIZON; i++) {
      const k = addDays(today(), i);
      if (i === 0 && E.day().know) continue;
      const l = E.lessonForDate(k);
      if (!l || !l.push) continue;
      const when = parseKey(k); when.setHours(h, m, 0, 0);
      if (when <= now) continue;
      await Notifications.scheduleNotificationAsync({ content: { title: "Wisebyte", body: l.push }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when } });
    }
  } catch (e) {}
}

export async function setEnabled(on) {
  const n = E.state.notify;
  if (on) {
    let ok = false;
    try { ok = (await granted()) || (await Notifications.requestPermissionsAsync()).granted; } catch (e) {}
    if (!ok) { toast("Allow notifications for Wisebyte in your iPhone settings"); return; }
  }
  n.on = on; n.asked = true; E.save(); changed(); refresh();
}
export function setTime(t) { E.state.notify.time = t; E.save(); changed(); refresh(); }

/* offered once, after the first finished lesson */
async function askAfterFirstLesson() {
  const n = E.state.notify; if (n.asked) return;
  n.asked = true; E.save();
  try {
    const r = await Notifications.requestPermissionsAsync();
    if (r.granted) { n.on = true; E.save(); changed(); refresh(); toast("Daily lesson hint is on"); }
  } catch (e) {}
}

export function init() {
  E.hooksNotify.firstLesson = askAfterFirstLesson;
  E.hooksNotify.refresh = refresh;
  refresh();
  AppState.addEventListener("change", s => { if (s === "active") refresh(); });
}
