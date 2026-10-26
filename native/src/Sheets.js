import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import * as E from "./engine";
import { ui, changed, closeSheet, openSheet, toast } from "./bus";
import { Auth, Cloud, validEmail, passProblem } from "./auth";
import Purchases from "./purchases";
import { C, F, PC } from "./theme";
import { Icon } from "./components/Icon";
import { T, Tap, Btn, BtnRow, Panel, SectionHead, Eyebrow } from "./components/ui";
import { WordCard } from "./components/WordCard";
import { SetRow } from "./screens/AccountScreen";
import { ago } from "./util";
import * as Notify from "./notify";

export const DOCS = { privacy: "https://wisebyte.app/privacy.html", terms: "https://wisebyte.app/terms.html" };
export const EMAIL = "contact@wisebyte.app";
export function openDoc(which) { WebBrowser.openBrowserAsync(DOCS[which]).catch(() => Linking.openURL(DOCS[which])); }

function WordSheet({ w }) {
  const e = E.entry(w); if (!e) return null;
  const r = E.state.words[w];
  return (
    <>
      <Panel><WordCard e={e} /></Panel>
      {r ? <Text style={T.small}>Added {ago(r.addedAt)}</Text> : null}
      <BtnRow>
        {r ? <Btn flex={1} kind="ghost" title="Remove" onPress={() => { E.removeWord(w); closeSheet(); toast(`Removed “${w}”`); }} />
          : <Btn flex={1} kind="ghost" icon="plus" title="Add to my words" onPress={() => { E.addWordFromLibrary(w); toast(`Added “${w}” to your words`); changed(); }} />}
        <Btn flex={1} title={r ? "Hear it again" : "Learn it now"} onPress={() => { closeSheet(); E.startWord(w, false); }} />
      </BtnRow>
    </>
  );
}

function QuoteSheet({ i }) {
  const x = E.QUOTES[i]; if (!x) return null;
  const ec = PC.expression[0];
  return (
    <Panel>
      <Eyebrow text="Logos · Quote" color={ec} />
      <View><Text style={{ fontFamily: F.display, fontSize: 64, lineHeight: 52, color: ec }}>“</Text>
        <Text style={{ fontFamily: F.italic6, fontSize: 28, lineHeight: 35, color: C.ink }}>{x.q}</Text></View>
      <View style={{ gap: 2 }}><Text style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>{x.a}</Text><Text style={T.small}>{x.w}</Text></View>
      <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: C.surface2 }}>
        <Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color: ec, marginBottom: 4 }}>What it means</Text>
        <Text style={{ fontFamily: F.body, fontSize: 16, lineHeight: 24, color: C.ink }}>{x.m}</Text>
      </View>
      {E.state.quotes[x.q] ? <Text style={T.small}>First learned {ago(E.state.quotes[x.q])}.</Text> : null}
    </Panel>
  );
}

function AchSheet({ id }) {
  const a = E.ACHIEVEMENTS.find(x => x.id === id), got = E.state.ach[id];
  const text = `I just unlocked “${a.name}” on Wisebyte: ${a.desc.toLowerCase()}.`;
  return (
    <Panel style={{ alignItems: "center" }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: got ? C.gold : C.line }}><Icon name={a.icon} size={30} color={got ? C.surface : C.ink2} /></View>
      <Text style={[T.h2, { textAlign: "center" }]}>{a.name}</Text>
      <Text style={[T.muted, { textAlign: "center" }]}>{a.desc}</Text>
      <Text style={[T.small, { textAlign: "center" }]}>{got ? "Unlocked " + ago(got) : "Not unlocked yet"}</Text>
      {got ? <>
        <View style={{ alignSelf: "stretch", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}><Text style={T.body}>{text}</Text></View>
        <Btn title="Copy to share" onPress={() => Clipboard.setStringAsync(text).then(() => toast("Copied. Paste it anywhere to share."))} />
      </> : null}
    </Panel>
  );
}

function AboutSheet() {
  return (
    <>
      <SectionHead title="About Wisebyte" right="v1.0.0" />
      <Text style={T.muted}>Bite-sized lessons in knowledge, words, life skills, ideas and thinking, for curious Australians.</Text>
      <View style={{ gap: 6 }}>
        <SetRow title="Restore purchases" sub="Already subscribed on this account?" onPress={() => Purchases.restore().then(() => toast(Purchases.entitled() ? "Subscription restored" : "No active subscription found"))} />
        <SetRow title="Manage subscription" sub="Change or cancel in your App Store account settings" onPress={() => Purchases.manage()} />
        <SetRow title="Privacy Policy" sub="How Wisebyte handles your data" onPress={() => openDoc("privacy")} />
        <SetRow title="Terms of Use" onPress={() => openDoc("terms")} />
        <SetRow title="Contact support" sub={EMAIL} onPress={() => Linking.openURL(`mailto:${EMAIL}?subject=Wisebyte%20support`).catch(() => toast(EMAIL))} />
        <SetRow title="Reset all progress" danger onPress={() => openSheet("reset")} />
      </View>
      <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.surface2, borderLeftWidth: 3, borderLeftColor: C.gold }}>
        <Text style={{ fontFamily: F.body, fontSize: 12.5, lineHeight: 18, color: C.ink2 }}>Wisebyte is for general education and interest. Lessons on health, money, law, safety and wellbeing are general information only, not professional advice, and don't consider your circumstances. Always seek advice from a qualified professional about your own situation. In an emergency, call Triple Zero (000). For crisis support, call Lifeline on 13 11 14.</Text>
      </View>
      <Text style={{ fontFamily: F.body, fontSize: 11.5, lineHeight: 17, color: C.ink2, textAlign: "center" }}>© {new Date().getFullYear()} Wisebyte. Your progress is stored on this device{Auth.user() ? " and backed up to your account" : ""}.</Text>
    </>
  );
}

function Confirm({ title, text, action, danger, onConfirm }) {
  const [busy, setBusy] = useState(false);
  return (
    <View style={{ gap: 14 }}>
      <Text style={[T.h2, { textAlign: "center" }]}>{title}</Text>
      <Text style={[T.muted, { textAlign: "center" }]}>{text}</Text>
      <Btn block kind={danger ? "danger" : "primary"} disabled={busy} title={busy ? "Please wait…" : action} onPress={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }} />
    </View>
  );
}

/* ---------- account forms ---------- */
let authEmail = "";
function Field({ label, ...p }) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ fontFamily: F.body6, fontSize: 13, color: C.ink2 }}>{label}</Text>
      <TextInput placeholderTextColor={C.muted} autoCorrect={false} {...p}
        style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface, color: C.ink, fontFamily: p.code ? F.mono : F.body, fontSize: 16 }} />
    </View>
  );
}
function AuthSheet({ mode, note, isErr }) {
  const [email, setEmail] = useState(authEmail);
  const [pw, setPw] = useState(""), [pw2, setPw2] = useState(""), [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setPw(""); setPw2(""); setCode(""); setBusy(false); setEmail(authEmail); }, [mode, note]);
  const go = (m, n, err) => openSheet("auth", { mode: m, note: n, isErr: err });
  const fail = m => go(mode, m, true);
  const done = msg => { closeSheet(); toast(msg); changed(); Cloud.sync(); };
  const has = { email: ["signup", "signin", "forgot"].includes(mode), pw: ["signup", "signin", "reset", "change"].includes(mode), confirm: ["signup", "reset", "change"].includes(mode), code: ["verify", "reset"].includes(mode) };
  async function submit() {
    if (has.email) { authEmail = email.trim().toLowerCase(); if (!validEmail(authEmail)) return fail("Please enter a valid email address."); }
    if (has.confirm) { const bad = passProblem(pw); if (bad) return fail(bad); if (pw !== pw2) return fail("The passwords don't match."); }
    if (mode === "signin" && !pw) return fail("Please enter your password.");
    if (has.code && !/^\d{6,10}$/.test(code.trim())) return fail("Enter the code from the email.");
    setBusy(true);
    try {
      if (mode === "signup") { const r = await Auth.signUp(authEmail, pw); if (r.signedIn) return done("Account created. You're signed in."); return go("verify"); }
      if (mode === "verify") { await Auth.verify(authEmail, code.trim(), "email"); return done("Email confirmed. You're signed in."); }
      if (mode === "signin") { await Auth.signIn(authEmail, pw); return done("Signed in"); }
      if (mode === "forgot") { await Auth.recover(authEmail); return go("reset"); }
      if (mode === "reset") { await Auth.verify(authEmail, code.trim(), "recovery"); await Auth.setPassword(pw); return done("Password changed. You're signed in."); }
      if (mode === "change") { await Auth.setPassword(pw); return done("Password changed"); }
    } catch (e) {
      setBusy(false);
      if (mode === "signin" && /confirm your email/.test(e.message)) return go("verify", e.message, true);
      fail(e.message);
    }
  }
  const title = { signup: "Create your account", verify: "Confirm your email", signin: "Sign in", forgot: "Reset your password", reset: "Set a new password", change: "Change password" }[mode];
  const action = { signup: "Create account", verify: "Confirm", signin: "Sign in", forgot: "Send code", reset: "Save password", change: "Save password" }[mode];
  const link = (t, fn) => <Tap key={t} onPress={fn} style={{ alignSelf: "center", padding: 6 }}><Text style={{ fontFamily: F.body6, fontSize: 14, color: C.accent }}>{t}</Text></Tap>;
  return (
    <View style={{ gap: 10 }}>
      <Text style={T.h2}>{title}</Text>
      {note ? <Text style={{ fontFamily: F.body, fontSize: 14, color: isErr ? C.bad : C.good }}>{note}</Text> : null}
      {mode === "verify" ? <Text style={T.muted}>We sent a code to <Text style={{ fontFamily: F.body7, color: C.ink }}>{authEmail}</Text>. Enter it below. It can take a minute to arrive, so check your junk folder too.</Text> : null}
      {mode === "forgot" ? <Text style={T.muted}>Enter your email and we'll send you a code to set a new password.</Text> : null}
      {mode === "reset" ? <Text style={T.muted}>If there's an account for <Text style={{ fontFamily: F.body7, color: C.ink }}>{authEmail}</Text>, we've sent it a code.</Text> : null}
      {has.email ? <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" autoComplete="email" /> : null}
      {has.code ? <Field label="6-digit code" code value={code} onChangeText={setCode} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={10} /> : null}
      {has.pw ? <Field label={mode === "reset" || mode === "change" ? "New password" : "Password"} value={pw} onChangeText={setPw} secureTextEntry autoCapitalize="none"
        textContentType={mode === "signin" ? "password" : "newPassword"} autoComplete={mode === "signin" ? "current-password" : "new-password"} /> : null}
      {has.confirm ? <Field label={mode === "signup" ? "Confirm password" : "Confirm new password"} value={pw2} onChangeText={setPw2} secureTextEntry autoCapitalize="none" textContentType="newPassword" autoComplete="new-password" /> : null}
      {mode === "signup" ? <Text style={T.small}>At least 8 characters, with letters and numbers. By creating an account you agree to the <Text onPress={() => openDoc("terms")} style={{ fontFamily: F.body6, color: C.accent }}>Terms of Use</Text> and <Text onPress={() => openDoc("privacy")} style={{ fontFamily: F.body6, color: C.accent }}>Privacy Policy</Text>.</Text> : null}
      <Btn block disabled={busy} title={busy ? "Please wait…" : action} onPress={submit} />
      {mode === "signup" ? link("Already have an account? Sign in", () => go("signin")) : null}
      {mode === "verify" ? link("Send a new code", () => Auth.resend(authEmail).then(() => go("verify", "New code sent.")).catch(e => go("verify", e.message, true))) : null}
      {mode === "signin" ? [link("Forgot your password?", () => go("forgot")), link("New here? Create an account", () => go("signup"))] : null}
    </View>
  );
}

function TimeSheet() {
  const [h, m] = E.state.notify.time.split(":").map(Number);
  const set = (nh, nm) => Notify.setTime(`${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`);
  const chip = (on, label, fn) => (
    <Tap key={label} onPress={fn} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: on ? C.accent : C.surface2 }}>
      <Text style={{ fontFamily: F.body6, fontSize: 14, color: on ? C.accentInk : C.ink }}>{label}</Text>
    </Tap>
  );
  return (
    <>
      <Text style={T.h2}>Reminder time</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: 17 }, (_, i) => i + 6).map(x => chip(x === h, `${((x + 11) % 12) + 1} ${x < 12 ? "am" : "pm"}`, () => set(x, m)))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[0, 15, 30, 45].map(x => chip(x === m, `:${String(x).padStart(2, "0")}`, () => set(h, x)))}
      </View>
    </>
  );
}

function Body({ s }) {
  switch (s.type) {
    case "notifytime": return <TimeSheet />;
    case "word": return <WordSheet w={s.w} />;
    case "quote": return <QuoteSheet i={s.i} />;
    case "ach": return <AchSheet id={s.id} />;
    case "about": return <AboutSheet />;
    case "auth": return <AuthSheet mode={s.mode} note={s.note} isErr={s.isErr} />;
    case "reset": return <Confirm danger title="Reset all progress?" action="Yes, reset everything"
      text="This deletes your streak, XP, lessons, words and achievements on this device. It can't be undone. Your subscription isn't affected."
      onConfirm={() => { E.resetProgress(); closeSheet(); toast("Progress reset"); }} />;
    case "delete": return <Confirm danger title="Delete your account?" action="Delete my account"
      text="This permanently deletes your Wisebyte account, its email address and your backed-up progress. It can't be undone. Your progress on this device stays, and your subscription isn't affected (cancel it in your App Store account if you want to)."
      onConfirm={() => Auth.deleteAccount().then(() => { closeSheet(); toast("Your account has been deleted"); changed(); }).catch(e => { closeSheet(); toast(e.message); })} />;
  }
  return null;
}

/* host = which layer is presenting it ("root", "player" or "paywall"); only the top one renders */
export default function Sheets({ host }) {
  const top = ui.paywall ? "paywall" : E.player.P ? "player" : "root";
  const s = ui.sheet;
  if (host !== top) return null;
  return (
    <Modal visible={!!s} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeSheet}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: C.ground }}>
        <View style={{ alignItems: "center", paddingTop: 8 }}><View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: C.line }} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
          {s ? <Body s={s} /> : null}
          <Btn block kind="ghost" title={s && (s.type === "about") ? "Done" : s && (s.type === "auth" || s.type === "reset" || s.type === "delete") ? "Cancel" : "Close"} onPress={closeSheet} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
