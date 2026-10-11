import React, { useState } from "react";
import { View, Text, ScrollView, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ui, changed, openSheet } from "./bus";
import { Auth } from "./auth";
import Purchases from "./purchases";
import { C, F } from "./theme";
import { Logo } from "./components/Icon";
import { Tap } from "./components/ui";
import Sheets, { openDoc } from "./Sheets";

const FEATURES = ["Every lesson and Compendium course, with mastery exams", "The Arena: brain games, quizzes and Fact or Fiction?", "Spaced Review, so you keep what you learn", "New lessons added regularly"];

function Plan({ on, title, sub, price, per, onPress }) {
  return (
    <Tap onPress={onPress} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: on ? C.accent : C.line, backgroundColor: C.surface }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.body7, fontSize: 17, color: C.ink }}>{title}</Text>
        <Text style={{ fontFamily: F.body, fontSize: 13, lineHeight: 17, color: C.ink2, marginTop: 2 }}>{sub}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontFamily: F.body7, fontSize: 17, color: C.ink }}>{price}</Text>
        <Text style={{ fontFamily: F.body5, fontSize: 13, color: C.ink2 }}>{per}</Text>
      </View>
    </Tap>
  );
}
const Link = ({ t, onPress }) => <Tap onPress={onPress} style={{ paddingVertical: 12, paddingHorizontal: 4, minHeight: 44, justifyContent: "center" }}><Text style={{ fontFamily: F.body6, fontSize: 14, color: C.accent }}>{t}</Text></Tap>;

export default function Paywall() {
  const pw = ui.paywall;
  const insets = useSafeAreaInsets();
  const [pick, setPick] = useState("own");
  const [msg, setMsg] = useState("");
  const P = Purchases, cfg = P.cfg;
  const tr = P.trial(pick);
  const preview = P.mode === "preview";
  const buyLabel = preview ? "Available in the app store version" : pick === "life" ? `Buy ${cfg.lifeName} for ${P.price("life")}` : tr ? `Start ${tr} free, then ${P.price("own")} a month` : `Subscribe for ${P.price("own")} a month`;
  const close = () => { ui.paywall = null; setMsg(""); changed(); };
  async function buy() {
    if (preview) return close();
    setMsg("");
    try { await P.buy(pick); } catch (e) { setMsg(e.message || "Something went wrong. You haven't been charged."); return; }
    if (P.entitled()) close();
  }
  async function restore() {
    setMsg("Checking…");
    await P.restore();
    if (P.entitled()) close(); else setMsg("No active subscription was found for this Apple ID.");
  }
  const accountLabel = !Auth.user() ? "Create account or sign in" : "";
  return (
    <Modal visible={!!pw} animationType="fade" presentationStyle="fullScreen" onRequestClose={() => pw && pw.dismissable && close()}>
      <View style={{ flex: 1, backgroundColor: C.ground }}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28, paddingHorizontal: 18, gap: 14, maxWidth: 520, width: "100%", alignSelf: "center" }}>
          <View style={{ alignSelf: "center" }}><Logo size={56} color={C.accent} /></View>
          <Text style={{ fontFamily: F.display, fontSize: 32, lineHeight: 35, color: C.ink, textAlign: "center" }}>Raise your temple every day</Text>
          <Text style={{ fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.ink2, textAlign: "center" }}>Bite-sized lessons in knowledge, words, life skills, ideas and thinking.</Text>
          <View style={{ gap: 8, marginVertical: 4 }}>
            {FEATURES.map(f => (
              <View key={f} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginTop: 8 }} />
                <Text style={{ flex: 1, fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.ink }}>{f}</Text>
              </View>))}
          </View>
          <View style={{ gap: 10 }}>
            <Plan on={pick === "own"} title={cfg.planName} sub="Every lesson and feature" price={P.price("own")} per="per month" onPress={() => setPick("own")} />
            <Plan on={pick === "life"} title={cfg.lifeName} sub="Pay once, keep it forever" price={P.price("life")} per="one time" onPress={() => setPick("life")} />
          </View>
          <Tap onPress={buy} disabled={P.busy} style={{ padding: 16, borderRadius: 16, backgroundColor: C.accent, opacity: P.busy ? 0.5 : 1 }}>
            <Text style={{ fontFamily: F.body7, fontSize: 17, color: C.accentInk, textAlign: "center" }}>{P.busy ? "Please wait…" : buyLabel}</Text>
          </Tap>
          <Text style={{ minHeight: 20, fontFamily: F.body, fontSize: 14, color: C.ink, textAlign: "center" }}>{msg || pw?.reason || ""}</Text>
          {preview ? <View style={{ padding: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.surface2 }}><Text style={{ fontFamily: F.body, fontSize: 13, color: C.ink2, textAlign: "center" }}>This is the preview version, so everything is already unlocked. Subscriptions are sold in the App Store version.</Text></View> : null}
          <Text style={{ fontFamily: F.body, fontSize: 12, lineHeight: 18, color: C.ink2, textAlign: "center" }}>
            {cfg.lifeName} is a one-time purchase of {P.price("life")} with no subscription. Monthly plan: auto-renewing subscription. {cfg.name} is {P.price("own")} a month.{tr ? " Free trials are for new subscribers; if you don't cancel before the trial ends, the subscription starts automatically." : ""} Payment is charged to your Apple ID when you confirm. The subscription renews automatically each month unless you cancel at least 24 hours before the end of the current period, and your account is charged for renewal within 24 hours before the period ends. Manage or cancel any time in your App Store account settings.
          </Text>
          {accountLabel ? <View style={{ flexDirection: "row", justifyContent: "center" }}><Link t={accountLabel} onPress={() => openSheet("auth", { mode: "signup" })} /></View> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 6 }}>
            <Link t="Restore purchases" onPress={restore} />
            <Link t="Terms of Use" onPress={() => openDoc("terms")} />
            <Link t="Privacy Policy" onPress={() => openDoc("privacy")} />
            {pw && (pw.dismissable || preview) ? <Link t="Not now" onPress={close} /> : null}
          </View>
        </ScrollView>
        <Sheets host="paywall" />
      </View>
    </Modal>
  );
}
