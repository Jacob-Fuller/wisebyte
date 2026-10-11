/* Wisebyte Scroll: an endless feed of small, true ideas (embedded as its own tab) */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, FlatList, Share, Modal, ScrollView, Linking } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SCROLL from "../data/scroll.json";
import * as Store from "../storage";
import { toast } from "../bus";
import { Cloud, scrollHooks } from "../auth";
import { C, F, mix } from "../theme";
import { Logo } from "../components/Icon";
import { Tap } from "../components/ui";
import { openDoc, EMAIL } from "../Sheets";

const { POOL, CATS, PILLARS, WEIGHTS } = SCROLL;
const BY_ID = Object.fromEntries(POOL.map(x => [x.id, x]));
const BY_P = {}; POOL.forEach(x => (BY_P[x.p] = BY_P[x.p] || []).push(x));
const dateKey = () => { const d = new Date(), p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const BODY = "#A59D91", MUTED = C.muted, BRONZE = C.accent;

/* feed state lives at module level so it survives tab switches, like the web iframe did */
const S = { day: null, kept: [], seen: new Set(), total: 0, filter: "all", decks: {}, lastCat: null, lastP: null, onScreen: new Set(), list: [], uid: 0, loaded: false };
function persist(k, v) { Store.set(k, v); if (k !== "wbs-day" && k !== "wbs-welcomed") Cloud.schedule(); }
function loadState() {
  S.day = Store.get("wbs-day", { d: dateKey(), n: 0 });
  S.kept = Store.get("wbs-kept", []).filter(id => BY_ID[id]);
  S.seen = new Set(Store.get("wbs-seen", []).filter(id => BY_ID[id]));
  S.total = Store.get("wbs-total", 0);
  rollDay();
}
function rollDay() { const k = dateKey(); if (!S.day || S.day.d !== k) { S.day = { d: k, n: 0 }; persist("wbs-day", S.day); } }
function markRead(id) {
  rollDay(); S.day.n++; S.total++; persist("wbs-day", S.day); persist("wbs-total", S.total);
  if (!S.seen.has(id)) { S.seen.add(id); persist("wbs-seen", [...S.seen]); }
}
function refill(p) {
  const src = BY_P[p];
  let fresh = src.filter(x => !S.seen.has(x.id) && !S.onScreen.has(x.id));
  if (!fresh.length) {
    src.forEach(x => S.seen.delete(x.id)); persist("wbs-seen", [...S.seen]);
    fresh = src.filter(x => !S.onScreen.has(x.id)); if (!fresh.length) fresh = src.slice();
    if (S.filter !== "all" && S.list.length) toast("You’ve read them all. Starting a fresh round.");
  }
  S.decks[p] = shuffle(fresh);
}
function pickPillar() {
  if (S.filter !== "all") return S.filter;
  const roll = () => { let r = Math.random(); for (const [p, w] of Object.entries(WEIGHTS)) { if ((r -= w) <= 0) return p; } return "k"; };
  let p = roll(); if (p === S.lastP && p !== "k") p = roll(); return p;
}
function draw() {
  const p = pickPillar();
  if (!S.decks[p] || !S.decks[p].length) refill(p);
  const d = S.decks[p]; let idx = d.length - 1;
  for (let i = d.length - 1; i >= 0; i--) { if (d[i].cat !== S.lastCat && !S.onScreen.has(d[i].id)) { idx = i; break; } }
  const x = d.splice(idx, 1)[0]; S.lastCat = x.cat; S.lastP = p; return x;
}
function append(n) { for (let i = 0; i < n; i++) { const x = draw(); S.onScreen.add(x.id); S.list.push({ key: "c" + (S.uid++), x }); } }
function reset() {
  S.list = []; S.onScreen.clear(); S.decks = {}; S.lastCat = null; S.lastP = null;
  if (!Store.get("wbs-welcomed", false) && S.filter === "all") S.list.push({ key: "welcome", welcome: true });
  append(10);
}

function shareText(x) {
  switch (x.type) {
    case "fact": return `${x.t}\n\n${x.h}${x.b ? " " + x.b : ""}`;
    case "myth": return `Fact or fiction? ${x.h}\n\n${x.a ? "Fact." : "Fiction."} ${x.e}`;
    case "word": return `${x.t} (${x.pos}): ${x.h}\n\n“${x.ex}”`;
    case "quote": return `“${x.h}”\n\n${x.t}, ${x.src}`;
    case "skill": return `${x.t}\n\n${x.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    case "puzzle": return `${x.t}: ${x.h}`;
  }
  return x.t;
}
const shareCard = x => Share.share({ message: shareText(x) + "\n\nFrom Wisebyte" }).catch(() => {});

const KeepIcon = ({ on, color }) => <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M6 3.5h12v17l-6-4-6 4z" fill={on ? color : "none"} stroke={on ? color : MUTED} strokeWidth={1.8} strokeLinejoin="round" /></Svg>;
const ShareIcon = () => <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" fill="none" stroke={MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /><Path d="M5 11.5v8a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-8" fill="none" stroke={MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
const Chev = ({ color, open }) => <Svg width={15} height={15} viewBox="0 0 24 24" style={{ transform: [{ rotate: open ? "90deg" : "0deg" }] }}><Path d="M9 5l7 7-7 7" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;

const Title = ({ t }) => <Text style={{ fontFamily: F.display5, fontSize: 34, lineHeight: 37, color: C.ink }}>{t}</Text>;
const Head = ({ t, quote }) => <Text style={quote ? { fontFamily: F.italic, fontSize: 25, lineHeight: 33, color: C.ink } : { fontFamily: F.body7, fontSize: 18.5, lineHeight: 26, color: C.ink }}>{t}</Text>;
const Txt = ({ children, style }) => <Text style={[{ fontFamily: F.body, fontSize: 16.5, lineHeight: 27, color: BODY }, style]}>{children}</Text>;

function Card({ x, onKeep }) {
  const [open, setOpen] = useState(false), [guess, setGuess] = useState(null);
  const c = CATS[x.cat].c, kept = S.kept.includes(x.id);
  const more = label => <Tap onPress={() => setOpen(o => !o)} style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, marginVertical: -6 }}>
    <Text style={{ fontFamily: F.body5, fontSize: 16.5, color: mix(c, BODY, 0.8) }}>{label}</Text><Chev color={mix(c, BODY, 0.8)} open={open} /></Tap>;
  const extra = children => open ? <View style={{ borderLeftWidth: 2, borderLeftColor: c, paddingLeft: 14 }}>{children}</View> : null;
  let body = null;
  if (x.type === "fact") body = <><Title t={x.t} /><Head t={x.h} />{x.b ? <Txt>{x.b}</Txt> : null}{more("Why it matters")}{extra(<Txt>{x.m}</Txt>)}</>;
  else if (x.type === "myth") {
    const ok = guess !== null && (guess === 1) === x.a;
    body = <><Title t={x.t} /><Head t={x.h} />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
        {[[1, "Fact"], [0, "Fiction"]].map(([g, label]) => {
          const isRight = (g === 1) === x.a, st = guess === null ? "" : isRight ? "right" : guess === g ? "wrong" : "";
          const col = st === "right" ? C.good : st === "wrong" ? C.bad : C.ink;
          return <Tap key={g} disabled={guess !== null} onPress={() => setGuess(g)} style={{ flex: 1, minHeight: 48, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: st ? col : C.line, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", opacity: guess !== null && !st ? 0.55 : 1 }}>
            <Text style={{ fontFamily: F.body6, fontSize: 15, letterSpacing: 0.6, color: col }}>{label}</Text></Tap>;
        })}
      </View>
      {guess !== null ? <View style={{ borderLeftWidth: 2, borderLeftColor: c, paddingLeft: 14, gap: 8 }}>
        <Text style={{ fontFamily: F.body7, fontSize: 16, color: ok ? C.good : C.bad }}>{(ok ? "Correct. " : "Not quite. ") + (x.a ? "It’s a fact." : "It’s fiction.")}</Text><Txt>{x.e}</Txt></View> : null}</>;
  }
  else if (x.type === "word") body = <><Title t={x.t} /><Head t={x.h} /><Txt><Text style={{ fontSize: 14.5, color: MUTED }}>/{x.pr}/ · {x.pos}</Text>{"\n"}<Text style={{ fontStyle: "italic", color: C.ink }}>“{x.ex}”</Text></Txt>{more("Where the word comes from")}{extra(<Txt>{x.o}</Txt>)}</>;
  else if (x.type === "quote") body = <><Title t={x.t} /><Head quote t={`“${x.h}”`} /><Txt>{x.src}</Txt>{more("The context")}{extra(<Txt>{x.n}</Txt>)}</>;
  else if (x.type === "skill") body = <><Title t={x.t} /><View style={{ gap: 8 }}>{x.steps.map((s, i) => <View key={i} style={{ flexDirection: "row", gap: 8 }}>
    <Text style={{ width: 24, fontFamily: F.body7, fontSize: 16.5, lineHeight: 25, color: c }}>{i + 1}</Text><Txt style={{ flex: 1, lineHeight: 25 }}>{s}</Txt></View>)}</View>{more("Why it works")}{extra(<Txt>{x.n}</Txt>)}</>;
  else if (x.type === "puzzle") body = <><Title t={x.t} /><Head t={x.h} />{more("Show the answer")}{extra(<Txt>{x.a}</Txt>)}</>;
  return (
    <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderTopWidth: 3, borderTopColor: c, borderRadius: 22, paddingTop: 14, paddingHorizontal: 22, paddingBottom: 22, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, minHeight: 44 }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c }} />
        <Text style={{ flex: 1, fontFamily: F.body6, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: mix(c, BODY, 0.78) }}>{x.cat}</Text>
        <Tap onPress={() => shareCard(x)} accessibilityLabel="Share" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -6 }}><ShareIcon /></Tap>
        <Tap onPress={() => onKeep(x.id)} accessibilityLabel={kept ? "Remove from kept" : "Keep"} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -12 }}><KeepIcon on={kept} color={c} /></Tap>
      </View>
      {body}
    </View>
  );
}

function Welcome({ onOk }) {
  return (
    <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderTopWidth: 3, borderTopColor: BRONZE, borderRadius: 22, paddingTop: 14, paddingHorizontal: 22, paddingBottom: 22, gap: 12 }}>
      <Text style={{ minHeight: 44, textAlignVertical: "center", fontFamily: F.body6, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: BRONZE, paddingTop: 13 }}>Welcome</Text>
      <Title t="Scroll as long as you like." />
      <Txt>Every card is a small, true idea worth knowing: facts, words, quotes, life skills and puzzles. Tap the bookmark to keep a card for later, or the share arrow to send it to someone. Use the filters above to focus on one kind.</Txt>
      <Tap onPress={onOk} style={{ alignSelf: "flex-start", minHeight: 48, paddingHorizontal: 22, borderRadius: 14, backgroundColor: BRONZE, justifyContent: "center" }}><Text style={{ fontFamily: F.body6, fontSize: 15, color: C.accentInk }}>Start reading</Text></Tap>
    </View>
  );
}

function SheetRow({ title, sub, val, onPress, danger, first }) {
  return (
    <Tap onPress={onPress} disabled={!onPress} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 52, paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: first ? 0 : 1, borderTopColor: C.line }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.body, fontSize: 16, color: danger ? C.bad : C.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: F.body, fontSize: 13, color: MUTED, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {val != null ? <Text style={{ fontFamily: F.body, fontSize: 16, color: BODY }}>{val}</Text> : null}
    </Tap>
  );
}
const Group = ({ children }) => <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 16, marginBottom: 18, overflow: "hidden" }}>{children}</View>;
const GroupTitle = ({ t }) => <Text style={{ fontFamily: F.body6, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: MUTED, marginHorizontal: 4, marginBottom: 8 }}>{t}</Text>;

function ScrollSheet({ view, setView, refresh, onKeep }) {
  const [armed, setArmed] = useState(null);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(null), 3500); return () => clearTimeout(t); }, [armed]);
  if (!view) return null;
  let title = "Kept", body = null, back = null;
  if (view.t === "kept") {
    body = S.kept.length ? S.kept.map(id => { const x = BY_ID[id];
      return (
        <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Tap onPress={() => setView({ t: "reader", id })} style={{ flex: 1, paddingVertical: 12, minHeight: 56 }}>
            <Text style={{ fontFamily: F.body6, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: CATS[x.cat].c }}>{x.cat}</Text>
            <Text numberOfLines={2} style={{ fontFamily: F.display5, fontSize: 20, lineHeight: 24, color: C.ink }}>{x.type === "myth" ? x.h : x.t}</Text>
          </Tap>
          <Tap onPress={() => { onKeep(id, true); refresh(); }} style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: "center" }}><Text style={{ fontFamily: F.body, fontSize: 14, color: MUTED }}>Remove</Text></Tap>
        </View>); })
      : <Text style={{ fontFamily: F.body, fontSize: 16, lineHeight: 24, color: BODY, paddingVertical: 20 }}>Nothing kept yet. Tap the bookmark on any card to save it here.</Text>;
  } else if (view.t === "reader") {
    back = () => setView({ t: "kept" });
    body = <Card x={BY_ID[view.id]} onKeep={id => { onKeep(id); refresh(); }} />;
  } else {
    title = "Settings";
    const confirmRow = (key, label, sub, fn) => <SheetRow danger first={key === "history"} title={armed === key ? "Tap again to confirm" : label} sub={armed === key ? null : sub}
      onPress={() => { if (armed !== key) return setArmed(key); setArmed(null); fn(); refresh(); }} />;
    body = <>
      <GroupTitle t="Your reading" />
      <Group><SheetRow first title="Read today" val={S.day.n} /><SheetRow title="Read all time" val={S.total} /><SheetRow title="Cards in the library" val={POOL.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} /></Group>
      <Group>
        <SheetRow first title="Privacy policy" val="›" onPress={() => openDoc("privacy")} />
        <SheetRow title="Terms of Use" val="›" onPress={() => openDoc("terms")} />
        <SheetRow title="Contact support" sub={EMAIL} val="›" onPress={() => Linking.openURL(`mailto:${EMAIL}?subject=Wisebyte%20-%20Scroll%20support`).catch(() => {})} />
      </Group>
      <GroupTitle t="Your data" />
      <Group>
        {confirmRow("history", "Reset reading history", "Clears what you’ve read and your counts", () => { S.seen = new Set(); S.day = { d: dateKey(), n: 0 }; S.total = 0; persist("wbs-seen", []); persist("wbs-day", S.day); persist("wbs-total", 0); persist("wbs-welcomed", false); toast("Reading history cleared"); })}
        {confirmRow("kept", "Clear kept cards", null, () => { S.kept = []; persist("wbs-kept", []); toast("Kept cards cleared"); })}
      </Group>
      <Text style={{ fontFamily: F.body, fontSize: 13, lineHeight: 21, color: MUTED, textAlign: "center", marginTop: 8 }}>Wisebyte Scroll{"\n"}Everything you do stays on this device.</Text>
    </>;
  }
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setView(null)}>
      <View style={{ flex: 1, backgroundColor: C.ground, borderTopWidth: 3, borderTopColor: BRONZE }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingLeft: back ? 4 : 12, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
          {back ? <Tap onPress={back} accessibilityLabel="Back" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}><Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M15 5l-7 7 7 7" fill="none" stroke={BODY} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg></Tap> : null}
          <Text style={{ flex: 1, fontFamily: F.display, fontSize: 26, color: C.ink, paddingLeft: 6 }}>{title}</Text>
          <Tap onPress={() => setView(null)} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: "center" }}><Text style={{ fontFamily: F.body5, fontSize: 16, color: BODY }}>Close</Text></Tap>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>{body}</ScrollView>
      </View>
    </Modal>
  );
}

export default function ScrollScreen() {
  const insets = useSafeAreaInsets();
  const [, setV] = useState(0);
  const refresh = useCallback(() => setV(v => v + 1), []);
  const [view, setView] = useState(null);
  const listRef = useRef(null);
  if (!S.loaded) { loadState(); reset(); S.loaded = true; }
  useEffect(() => {
    scrollHooks.reload = () => { loadState(); refresh(); };
    return () => { scrollHooks.reload = null; };
  }, []);
  /* a card counts as read once it has stayed mostly on screen for 1.5 seconds */
  const timers = useRef({}), counted = useRef(new Set());
  const onViewable = useRef(({ viewableItems }) => {
    const vis = new Set(viewableItems.map(v => v.key));
    for (const k of Object.keys(timers.current)) if (!vis.has(k)) { clearTimeout(timers.current[k]); delete timers.current[k]; }
    for (const v of viewableItems) {
      const it = v.item; if (!it.x || counted.current.has(it.key) || timers.current[it.key]) continue;
      timers.current[it.key] = setTimeout(() => { delete timers.current[it.key]; counted.current.add(it.key); markRead(it.x.id); refresh(); }, 1500);
    }
  }).current;
  const keep = (id, forceOff) => {
    const on = forceOff ? false : !S.kept.includes(id);
    S.kept = on ? [id, ...S.kept.filter(k => k !== id)] : S.kept.filter(k => k !== id); persist("wbs-kept", S.kept);
    if (!forceOff) toast(on ? "Kept" : "Removed from kept");
    refresh();
  };
  const setFilter = k => { if (k === S.filter) return; S.filter = k; reset(); counted.current.clear(); refresh(); listRef.current && listRef.current.scrollToOffset({ offset: 0, animated: false }); };
  const stat = (b, label, onPress) => (
    <Tap onPress={onPress} disabled={!onPress} style={{ minHeight: 36, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.line, borderRadius: 999, backgroundColor: C.surface }}>
      <Text style={{ fontFamily: F.body6, fontSize: 12.5, color: C.ink }}>{b}</Text><Text style={{ fontFamily: F.body, fontSize: 12.5, color: BODY }}>{label}</Text>
    </Tap>
  );
  rollDay();
  return (
    <View style={{ flex: 1, backgroundColor: C.ground }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: C.ground }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <Logo size={20} color={BRONZE} />
            <Text numberOfLines={1} style={{ fontFamily: F.display, fontSize: 24, color: C.ink, flexShrink: 1 }}>Wisebyte</Text>
            <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: BRONZE }}><Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 1.4, color: C.accentInk }}>SCROLL</Text></View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {stat(S.day.n, "today")}
            {stat(S.kept.length, "kept", () => setView({ t: "kept" }))}
            <Tap onPress={() => setView({ t: "settings" })} accessibilityLabel="Settings" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -6 }}>
              <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M4 7h16M4 12h16M4 17h16" stroke={BODY} strokeWidth={1.8} strokeLinecap="round" /></Svg>
            </Tap>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
          {[["all", "All"], ...Object.entries(PILLARS)].map(([k, label]) => { const on = S.filter === k;
            return <Tap key={k} onPress={() => setFilter(k)} style={{ minHeight: 40, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1, borderColor: on ? BRONZE : C.line, backgroundColor: on ? BRONZE : C.surface, justifyContent: "center" }}>
              <Text style={{ fontFamily: F.body6, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: on ? C.accentInk : BODY }}>{label}</Text></Tap>; })}
        </ScrollView>
      </View>
      <FlatList ref={listRef} data={S.list} keyExtractor={it => it.key} extraData={S.kept.length + ":" + S.list.length}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 16 }}
        renderItem={({ item }) => item.welcome ? <Welcome onOk={() => { persist("wbs-welcomed", true); S.list = S.list.filter(x => !x.welcome); refresh(); }} /> : <Card x={item.x} onKeep={keep} />}
        onEndReached={() => { append(8); refresh(); }} onEndReachedThreshold={2.5}
        onViewableItemsChanged={onViewable} viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        initialNumToRender={6} windowSize={9} />
      <ScrollSheet view={view} setView={setView} refresh={refresh} onKeep={keep} />
    </View>
  );
}
