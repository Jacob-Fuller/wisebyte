/* Wisebyte Go: the audio tab (Listen, Library, Compendium, You), the mini player and the full player */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Modal, PanResponder } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as A from "../audio";
import * as E from "../engine";
import { changed } from "../bus";
import { C, F, PC, mix } from "../theme";
import { Icon, Logo } from "../components/Icon";
import { T, Tap, Btn, Badge } from "../components/ui";
import { AccountButton } from "./TempleScreen";

const G = A.G;
const pc = p => (PC[p] || PC.learn)[0];
const pcSoft = p => (PC[p] || PC.learn)[1];
const clock = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
function useLive() { const [, set] = useState(0); useEffect(() => A.subscribeLive(() => set(v => v + 1)), []); }
const H2 = ({ t, right }) => (
  <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
    <Text style={T.h2}>{t}</Text>{right || null}
  </View>
);
const Link = ({ t, onPress }) => <Tap onPress={onPress} style={{ minHeight: 32, justifyContent: "center" }}><Text style={{ fontFamily: F.body6, fontSize: 14, color: C.accent }}>{t}</Text></Tap>;
const Note = ({ children }) => <Text style={[T.small, { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.surface2 }]}>{children}</Text>;

function Disc({ p, size = 64 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2, borderWidth: 1.5, borderColor: pc(p) }}>
      <Text style={{ fontFamily: F.greek, fontSize: size * 0.22, color: pc(p) }} numberOfLines={1}>{E.PILLAR_BY(p).gr}</Text>
    </View>
  );
}
const PlayBtn = ({ id, size = 44, big }) => {
  const on = G.cur === id && G.playing, can = A.available(id);
  return (
    <Tap disabled={!can} onPress={() => on ? A.toggle() : A.play(id)} accessibilityLabel={on ? "Pause" : "Play"}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: big ? C.accent : C.surface2, opacity: can ? 1 : 0.4 }}>
      <Icon name={on ? "pausef" : "playf"} size={size * 0.42} color={big ? C.accentInk : C.ink} />
    </Tap>
  );
};
function DlBtn({ id }) {
  const saved = A.isSaved(id), busy = id in G.busy;
  return (
    <Tap onPress={() => saved ? A.removeDownload(id) : A.download(id)} disabled={busy} accessibilityLabel={saved ? "Remove download" : "Download for offline"}
      style={{ width: 36, height: 44, alignItems: "center", justifyContent: "center" }}>
      <Icon name={saved ? "saved" : "dl"} size={20} color={saved ? C.good : busy ? C.accent : C.ink2} />
    </Tap>
  );
}
function EpRow({ e }) {
  const done = A.isDone(e.id), now = G.cur === e.id, cov = A.coverage(e), g = A.groupOf(e), busy = e.id in G.busy;
  const meta = [e.kind === "original" ? (e.series ? `${e.series} · Ep ${e.ep}` : E.PILLAR_BY(e.p).name) : g ? (e.eps > 1 ? `Episode ${e.ep} of ${e.eps}` : E.PILLAR_BY(e.p).name) : ""];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingLeft: 12, paddingRight: 8, borderRadius: 12, backgroundColor: now ? C.surface2 : C.surface, borderWidth: 1, borderColor: now ? pc(e.p) : C.line }}>
      <View style={{ width: 44, alignItems: "center" }}>
        <Text style={{ fontFamily: F.mono7, fontSize: 18, color: pc(e.p) }}>{A.mins(e.id)}</Text>
        <Text style={{ fontFamily: F.body7, fontSize: 9.5, letterSpacing: 1, color: C.ink2 }}>MIN</Text>
      </View>
      <Tap onPress={() => A.play(e.id)} style={{ flex: 1, gap: 4 }}>
        <Text numberOfLines={2} style={{ fontFamily: F.body6, fontSize: 15, lineHeight: 20, color: C.ink }}>{e.kind === "original" || !g ? A.title(e) : e.t}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          {meta[0] ? <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.ink2 }}>{meta[0]}</Text> : null}
          {done ? <Badge kind="done" text="Heard" /> : cov.of && cov.n ? <Badge kind="soon" text={`${cov.n}/${cov.of} covered`} /> : null}
          {A.isSaved(e.id) && !done ? <Badge kind="soon" text="Offline" /> : null}
        </View>
        {busy ? <View style={{ height: 3, borderRadius: 2, backgroundColor: C.line }}><View style={{ width: `${Math.round(G.busy[e.id] * 100)}%`, height: 3, borderRadius: 2, backgroundColor: C.accent }} /></View>
          : G.p.pos[e.id] && !done ? <View style={{ height: 3, borderRadius: 2, backgroundColor: C.line }}><View style={{ width: `${Math.round(A.progFrac(e.id) * 100)}%`, height: 3, borderRadius: 2, backgroundColor: pc(e.p) }} /></View> : null}
      </Tap>
      <DlBtn id={e.id} />
      <PlayBtn id={e.id} />
    </View>
  );
}
const List = ({ items, empty }) => items.length ? <View style={{ gap: 8 }}>{items.map(e => <EpRow key={e.id} e={e} />)}</View> : <Text style={T.muted}>{empty}</Text>;

function Seg({ value, options, onChange }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, padding: 4, borderRadius: 12, backgroundColor: C.surface }}>
      {options.map(([v, label]) => { const on = value === v;
        return <Tap key={String(v)} onPress={() => onChange(v)} style={{ flex: 1, minHeight: 36, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: on ? C.surface2 : "transparent", borderWidth: 1, borderColor: on ? C.line : "transparent" }}>
          <Text style={{ fontFamily: F.body6, fontSize: 13.5, color: on ? C.ink : C.ink2 }}>{label}</Text></Tap>; })}
    </View>
  );
}
function Narrators({ compact }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {Object.entries(A.VOICES).map(([k, v]) => { const on = G.p.voice === k;
        return (
          <Tap key={k} onPress={() => A.setVoice(k)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: compact ? 8 : 11, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: on ? C.accent : C.line, backgroundColor: on ? C.accentSoft : C.surface }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: on ? C.accent : C.surface2 }}><Text style={{ fontFamily: F.body7, fontSize: 13, color: on ? C.accentInk : C.ink2 }}>{v.name[0]}</Text></View>
            <View><Text style={{ fontFamily: F.body7, fontSize: 14, color: C.ink }}>{v.name}</Text>{compact ? null : <Text style={{ fontFamily: F.body, fontSize: 12, color: C.ink2 }}>{v.who}</Text>}</View>
          </Tap>); })}
    </View>
  );
}

/* ---------------- Listen ---------------- */
function Listen() {
  const u = A.upNext(), plan = A.planTrip(G.p.trip), planMins = plan.reduce((a, e) => a + A.mins(e.id), 0);
  const cont = A.AVAILABLE().filter(e => G.p.pos[e.id] && !A.isDone(e.id) && (!u || e.id !== u.id)).slice(0, 3);
  const lens = A.lengthsAvailable(), toGet = plan.filter(e => !A.isSaved(e.id)), planBusy = plan.some(e => e.id in G.busy);
  const uOn = u && G.cur === u.id && G.playing;
  const setLen = m => { G.p.len = m; A.savePrefs(); changed(); };
  const pillars = E.PILLAR5.filter(x => A.AVAILABLE().some(e => e.p === x.p));
  const vt = A.EPISODES.filter(e => e.series === "Voice test");   /* temporary: narrator candidates */
  return (
    <>
      {G.offline ? <Note>You're offline. Downloaded episodes still play.</Note> : null}
      {vt.length ? <View style={{ gap: 10 }}><H2 t="Voice test" right={<Text style={T.small}>Pick one female and one male</Text>} /><List items={vt} /></View> : null}
      <View style={{ gap: 12 }}>
        <View style={{ gap: 2 }}><Text style={[T.eyebrow, { color: C.accent }]}>Listen and learn on the go</Text><Text style={[T.h1, { fontSize: 32, lineHeight: 34 }]}>How long is the trip?</Text></View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {[...lens, 0].map(m => { const on = G.p.len === m;
            return <Tap key={m} onPress={() => setLen(m)} style={{ flex: 1, minHeight: 58, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: on ? C.accent : C.line, backgroundColor: on ? C.accentSoft : C.surface }}>
              <Text style={{ fontFamily: F.mono7, fontSize: 19, color: on ? C.accent : C.ink }}>{m || "∞"}</Text><Text style={{ fontFamily: F.body6, fontSize: 11, color: C.ink2 }}>{m ? "min" : "any"}</Text></Tap>; })}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <H2 t="Up next" right={<Text style={T.small}>{G.p.len ? `About ${G.p.len} minutes` : "Any length"}</Text>} />
        {!u ? <Note>Episodes are on their way. Check your connection, then come back.</Note> : (
          <View style={{ gap: 12, padding: 16, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderTopWidth: 3, borderTopColor: pc(u.p) }}>
            {G.p.len && A.bucket(u.id) !== G.p.len ? <Text style={T.small}>You've heard every {G.p.len}-minute episode. Here's the closest length.</Text> : null}
            <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
              <Disc p={u.p} size={68} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[T.eyebrow, { color: pc(u.p) }]}>{A.groupOf(u) && u.kind !== "original" ? (u.eps > 1 ? `Episode ${u.ep} of ${u.eps}` : E.PILLAR_BY(u.p).name) : E.PILLAR_BY(u.p).name}{A.isPsych(u) ? " · Psychology" : ""}</Text>
                <Text style={{ fontFamily: F.display7, fontSize: 23, lineHeight: 26, color: C.ink }}>{u.t}</Text>
              </View>
            </View>
            <Text style={T.muted} numberOfLines={3}>{A.blurb(u)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Tap onPress={() => uOn ? A.toggle() : A.play(u.id)} accessibilityLabel={uOn ? "Pause" : "Play"} style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: C.accent }}>
                <Icon name={uOn ? "pausef" : "playf"} size={24} color={C.accentInk} /></Tap>
              <View style={{ gap: 1 }}><Text style={{ fontFamily: F.mono7, fontSize: 15, color: C.ink }}>{clock(A.durOf(u.id))}</Text><Text style={T.small}>{G.p.pos[u.id] ? "Resume" : `${A.VOICES[G.p.voice].name} narrator`}</Text></View>
              {A.isSaved(u.id) ? <Badge kind="soon" text="Offline" /> : null}
            </View>
          </View>)}
      </View>
      <View style={{ gap: 10 }}><H2 t="Narrator" /><Narrators /></View>
      {cont.length ? <View style={{ gap: 10 }}><H2 t="Continue" /><List items={cont} /></View> : null}
      <View style={{ gap: 12, padding: 16, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
        <H2 t="Plan a drive" />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <Tap onPress={() => { G.p.trip = Math.max(10, G.p.trip - 5); A.savePrefs(); changed(); }} accessibilityLabel="Five minutes shorter" style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2 }}><Text style={{ fontFamily: F.body7, fontSize: 24, color: C.ink }}>−</Text></Tap>
          <View style={{ alignItems: "center", minWidth: 120 }}><Text style={{ fontFamily: F.mono7, fontSize: 34, color: C.ink }}>{G.p.trip}</Text><Text style={T.small}>minutes on the road</Text></View>
          <Tap onPress={() => { G.p.trip = Math.min(180, G.p.trip + 5); A.savePrefs(); changed(); }} accessibilityLabel="Five minutes longer" style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2 }}><Text style={{ fontFamily: F.body7, fontSize: 24, color: C.ink }}>+</Text></Tap>
        </View>
        {plan.length ? <>
          <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: C.surface2, gap: 2 }}>
            {plan.map(e => <View key={e.id} style={{ width: `${Math.min(100, A.mins(e.id) / G.p.trip * 100)}%`, backgroundColor: pc(e.p) }} />)}
          </View>
          <View style={{ gap: 6 }}>{plan.map(e => (
            <View key={e.id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: pc(e.p) }} />
              <Text numberOfLines={1} style={{ flex: 1, fontFamily: F.body, fontSize: 14, color: C.ink }}>{A.title(e)}</Text>
              <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2 }}>{A.mins(e.id)} min</Text>
            </View>))}</View>
          <Btn icon="playf" title={`Play ${plan.length} episode${plan.length > 1 ? "s" : ""} · ${planMins} min`} onPress={() => A.playList(plan.map(e => e.id))} />
          {toGet.length || planBusy ? <Btn kind="ghost" icon="dl" disabled={planBusy} title={planBusy ? "Downloading…" : `Download trip · ${A.fmtMB(toGet.reduce((a, e) => a + A.estBytes(e.id), 0))}`} onPress={() => A.download(toGet.map(e => e.id))} />
            : <Text style={T.small}>All downloaded. This trip will play without signal.</Text>}
        </> : <Text style={T.muted}>You've heard everything that fits that trip. Try a longer one.</Text>}
      </View>
      {pillars.length > 1 ? <View style={{ gap: 10 }}>
        <H2 t="Browse by pillar" right={<Link t="All episodes" onPress={() => { G.seg = "library"; G.pillar = "all"; changed(); }} />} />
        <View style={{ flexDirection: "row", gap: 6 }}>
          {pillars.map(x => <Tap key={x.p} onPress={() => { G.pillar = x.p; G.seg = "library"; changed(); }} style={{ flex: 1, alignItems: "center", gap: 6, paddingVertical: 12, borderRadius: 4, borderWidth: 1, borderColor: C.line, borderTopWidth: 3, borderTopColor: pc(x.p), backgroundColor: C.surface }}>
            <Text style={{ fontFamily: F.greek, fontSize: 13, color: pc(x.p) }}>{x.gr}</Text>
            <View style={{ width: 2, height: 22, backgroundColor: C.line }} />
            <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: F.body6, fontSize: 11, color: C.ink2 }}>{x.name}</Text></Tap>)}
        </View>
      </View> : null}
    </>
  );
}

/* ---------------- Library ---------------- */
function Library() {
  let list = A.AVAILABLE();
  if (G.pillar === "psy") list = list.filter(A.isPsych);
  else if (G.pillar === "saved") list = list.filter(e => A.isSaved(e.id));
  else if (G.pillar !== "all") list = list.filter(e => e.p === G.pillar);
  if (G.libLen) list = list.filter(e => A.bucket(e.id) === G.libLen);
  const pillars = E.PILLAR5.filter(x => A.AVAILABLE().some(e => e.p === x.p));
  const chip = (k, label, col) => { const on = G.pillar === k;
    return <Tap key={k} onPress={() => { G.pillar = k; changed(); }} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, borderColor: on ? col : C.line, backgroundColor: on ? mix(col, C.surface, 0.18) : C.surface }}>
      {k !== "all" ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: col }} /> : null}<Text style={{ fontFamily: F.body6, fontSize: 13, color: on ? C.ink : C.ink2 }}>{label}</Text></Tap>; };
  return (
    <>
      <H2 t="Episodes" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {chip("all", "All", C.accent)}
        {A.savedCount() ? chip("saved", "Downloaded", C.good) : null}
        {chip("psy", "Psychology", C.accent)}
        {pillars.map(x => chip(x.p, x.name, pc(x.p)))}
      </ScrollView>
      <Seg value={G.libLen} options={[[0, "Any"], ...A.lengthsAvailable().map(m => [m, m + " min"])]} onChange={v => { G.libLen = v; changed(); }} />
      <List items={list} empty="Nothing matches. Try another filter." />
    </>
  );
}

/* ---------------- Compendium ---------------- */
function Group({ g }) {
  const next = g.eps.find(e => !A.isDone(e.id)) || g.eps[0], total = g.eps.reduce((a, e) => a + A.mins(e.id), 0), toGet = g.eps.filter(e => !A.isSaved(e.id));
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 12, padding: 16, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderLeftWidth: 4, borderLeftColor: pc(g.p) }}>
      <Tap onPress={() => setOpen(o => !o)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Disc p={g.p} size={54} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[T.eyebrow, { color: pc(g.p) }]}>{E.PILLAR_BY(g.p).name} · {g.eps.length} episode{g.eps.length === 1 ? "" : "s"} · {total} min</Text>
          <Text style={{ fontFamily: F.display7, fontSize: 21, lineHeight: 24, color: C.ink }}>{g.t}</Text>
        </View>
        <Icon name="down" size={18} color={C.ink2} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
      </Tap>
      {open ? <>
        {g.d ? <Text style={T.muted}>{g.d}</Text> : null}
        <View style={{ gap: 8 }}>{g.eps.map(e => <EpRow key={e.id} e={e} />)}</View>
      </> : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Btn sm kind="ghost" icon="playf" title={`Episode ${next.ep || 1}`} onPress={() => { const rest = g.eps.filter(e => !A.isDone(e.id)); A.playList((rest.length ? rest : g.eps).map(e => e.id)); }} />
        {toGet.length ? <Btn sm kind="ghost" icon="dl" title="Download" onPress={() => A.download(toGet.map(e => e.id))} /> : null}
      </View>
    </View>
  );
}
function Compendium() {
  const gs = A.groups();
  return (
    <>
      <H2 t="Compendium" right={<Text style={T.small}>Audio courses</Text>} />
      {gs.length ? gs.map(g => <Group key={g.key} g={g} />) : <Text style={T.muted}>Audio courses are on the way.</Text>}
    </>
  );
}

/* ---------------- You ---------------- */
function You() {
  const bars = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); bars.push({ lab: d.toLocaleDateString(undefined, { weekday: "narrow" }), m: (G.p.days[dateKey(d)] || 0) / 60 }); }
  const max = Math.max(10, ...bars.map(b => b.m)), busy = Object.keys(G.busy).length;
  const toGet = A.AVAILABLE().filter(e => !A.isSaved(e.id));
  const stat = (b, s) => <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, backgroundColor: C.surface2, gap: 2 }}><Text style={{ fontFamily: F.mono, fontSize: 20, color: C.ink }}>{b}</Text><Text style={{ fontFamily: F.body6, fontSize: 12, color: C.ink2 }}>{s}</Text></View>;
  const box = children => <View style={{ gap: 12, padding: 16, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>{children}</View>;
  return (
    <>
      {box(<>
        <H2 t="Your listening" />
        <View style={{ flexDirection: "row", gap: 8 }}>{stat(A.weekMins(), "minutes this week")}{stat(A.streak(), "day streak")}{stat(Object.keys(G.p.done).length, "episodes heard")}</View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 90, gap: 8 }}>
          {bars.map((b, i) => <View key={i} style={{ flex: 1, alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
            <View style={{ width: "70%", height: `${Math.max(4, b.m / max * 78)}%`, borderRadius: 4, backgroundColor: b.m < 0.5 ? C.line : C.accent }} />
            <Text style={{ fontFamily: F.body6, fontSize: 11, color: C.ink2 }}>{b.lab}</Text></View>)}
        </View>
      </>)}
      {box(<>
        <H2 t="Narrator" />
        <Narrators />
        <View style={{ flexDirection: "row", gap: 8 }}><Btn sm kind="ghost" icon="playf" title="Hear female" onPress={() => A.preview("f")} /><Btn sm kind="ghost" icon="playf" title="Hear male" onPress={() => A.preview("m")} /></View>
        <Text style={T.eyebrow}>Speed</Text>
        <Seg value={G.p.rate} options={A.RATES.map(r => [r, r + "×"])} onChange={A.setRate} />
      </>)}
      {box(<>
        <H2 t="Downloads" />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={T.body}>Downloaded episodes</Text><Text style={{ fontFamily: F.mono7, fontSize: 14, color: C.ink }}>{A.savedCount()}</Text></View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={T.body}>Space used</Text><Text style={{ fontFamily: F.mono7, fontSize: 14, color: C.ink }}>{A.savedCount() ? A.fmtMB(A.savedBytes()) : "0 MB"}</Text></View>
        <Text style={T.small}>Downloads use the {A.VOICES[G.p.voice].name.toLowerCase()} narrator. Downloaded episodes play with no signal, handy for tunnels and country drives.</Text>
        {busy ? <Text style={T.small}>Downloading {busy} episode{busy > 1 ? "s" : ""}…</Text> : null}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {toGet.length ? <Btn sm icon="dl" disabled={!!busy} title={`Download all · ${A.fmtMB(toGet.reduce((a, e) => a + A.estBytes(e.id), 0))}`} onPress={() => A.download(toGet.map(e => e.id))} /> : null}
          {A.savedCount() ? <Btn sm kind="ghost" title="Remove all" onPress={A.removeAllDownloads} /> : null}
        </View>
      </>)}
      {box(<>
        <H2 t="About" />
        <Text style={T.small}>Episodes are general information for learning and interest. They aren't financial, legal or medical advice. For your own situation, talk to a qualified professional.</Text>
        <Text style={T.small}>{A.NOTE_DRIVE}</Text>
        <Text style={T.small}>Finishing an episode counts its lessons as covered across Wisebyte. Their questions then wait in your review, so you can lock in what you heard.</Text>
        <Text style={[T.small, { color: C.muted }]}>Narration by the Kokoro voice model</Text>
      </>)}
    </>
  );
}
const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* ---------------- first-run welcome ---------------- */
function Welcome() {
  if (G.p.welcomed) return null;
  const feat = (ic, b, s) => <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}><Icon name={ic} size={22} color={C.accent} /><View style={{ flex: 1 }}><Text style={{ fontFamily: F.body7, fontSize: 15, color: C.ink }}>{b}</Text><Text style={T.small}>{s}</Text></View></View>;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={() => { G.p.welcomed = true; A.savePrefs(); changed(); }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 18 }}>
        <View style={{ gap: 16, padding: 20, borderRadius: 18, backgroundColor: C.ground, borderWidth: 1, borderColor: C.line }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Logo size={30} color={C.accent} /><Text style={{ fontFamily: F.display7, fontSize: 30, color: C.ink }}>Wisebyte</Text><GoTag /></View>
          <Text style={T.muted}>Audio episodes for the walk, the commute and the drive. Each one covers a few lessons from your library.</Text>
          {feat("clock", "Pick your trip length", "Every episode shows its length, and the planner fills your drive.")}
          {feat("car", "Made for the road", "Big-button drive mode, lock screen controls, and parts you can skip.")}
          {feat("dl", "Works without signal", "Download episodes before you head off.")}
          <Text style={T.eyebrow}>Choose your narrator</Text>
          <Narrators />
          <View style={{ flexDirection: "row", gap: 8 }}><Btn sm kind="ghost" icon="playf" title="Hear female" onPress={() => A.preview("f")} /><Btn sm kind="ghost" icon="playf" title="Hear male" onPress={() => A.preview("m")} /></View>
          <Btn title="Start listening" onPress={() => { G.p.welcomed = true; A.savePrefs(); changed(); }} />
        </View>
      </View>
    </Modal>
  );
}
const GoTag = () => <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 6, backgroundColor: C.accent }}><Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 1.4, color: C.accentInk }}>GO</Text></View>;

export default function GoScreen() {
  const insets = useSafeAreaInsets(), ref = useRef(null);
  const Body = { listen: Listen, library: Library, compendium: Compendium, you: You }[G.seg] || Listen;
  const go = s => { G.seg = s; changed(); ref.current && ref.current.scrollTo({ y: 0, animated: false }); };
  return (
    <View style={{ flex: 1, backgroundColor: C.ground }}>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Logo size={20} color={C.accent} /><Text style={{ fontFamily: F.display, fontSize: 24, color: C.ink }}>Wisebyte</Text><GoTag /></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 32, paddingHorizontal: 9, borderRadius: 999, backgroundColor: C.sparkSoft }} accessibilityLabel="Listening streak"><Icon name="flame" size={14} color={C.spark} /><Text style={{ fontFamily: F.mono7, fontSize: 12.5, color: C.spark }}>{A.streak()}</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 32, paddingHorizontal: 9, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }} accessibilityLabel="Minutes this week"><Icon name="clock" size={14} color={C.ink2} /><Text style={{ fontFamily: F.mono7, fontSize: 12.5, color: C.ink }}>{A.weekMins()}m</Text></View>
            <AccountButton compact />
          </View>
        </View>
        <Seg value={G.seg} options={[["listen", "Listen"], ["library", "Episodes"], ["compendium", "Compendium"], ["you", "Settings"]]} onChange={go} />
      </View>
      <ScrollView ref={ref} contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 18, maxWidth: 520, width: "100%", alignSelf: "center" }}>
        <Body />
      </ScrollView>
      <Welcome />
    </View>
  );
}

/* ---------------- mini player (above the tab bar, on every tab) ---------------- */
export function MiniPlayer() {
  useLive();
  const e = G.cur && A.ep(G.cur); if (!e) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingLeft: 14, paddingRight: 8, backgroundColor: C.surface2, borderTopWidth: 1, borderTopColor: C.line }}>
      <View style={{ position: "absolute", top: 0, left: 0, height: 2, width: `${Math.min(100, (G.t / (G.dur || A.durOf(e.id) || 1)) * 100)}%`, backgroundColor: pc(e.p) }} />
      <Tap onPress={() => { G.sheet = true; changed(); }} accessibilityLabel="Open player" style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name="headphones" size={20} color={pc(e.p)} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.body7, fontSize: 14, color: C.ink }}>{A.title(e)}</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.body, fontSize: 12, color: C.ink2 }}>{G.status || A.chapterLabel()}</Text>
        </View>
      </Tap>
      <Tap onPress={A.toggle} accessibilityLabel={G.playing ? "Pause" : "Play"} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
        <Icon name={G.playing ? "pausef" : "playf"} size={22} color={C.ink} />
      </Tap>
      <Tap onPress={A.stop} accessibilityLabel="Close player" style={{ width: 36, height: 44, alignItems: "center", justifyContent: "center" }}>
        <Icon name="close" size={18} color={C.ink2} />
      </Tap>
    </View>
  );
}

/* ---------------- full player ---------------- */
function Track({ e }) {
  const w = useRef(1), dur = G.dur || A.durOf(e.id) || 1, cs = A.chapterStarts(e.id);
  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true, onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: ev => A.seek(ev.nativeEvent.locationX / w.current * (G.dur || A.durOf(G.cur))),
    onPanResponderMove: ev => A.seek(Math.max(0, Math.min(1, ev.nativeEvent.locationX / w.current)) * (G.dur || A.durOf(G.cur))),
  })).current;
  return (
    <View style={{ gap: 6 }}>
      <View {...pr.panHandlers} onLayout={ev => { w.current = ev.nativeEvent.layout.width || 1; }} style={{ height: 28, justifyContent: "center" }}>
        <View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: C.line, overflow: "hidden" }}>
          <View style={{ width: `${Math.min(100, G.t / dur * 100)}%`, height: 6, backgroundColor: pc(e.p) }} />
        </View>
        {cs.slice(1).map((x, i) => <View key={i} pointerEvents="none" style={{ position: "absolute", left: `${x / dur * 100}%`, width: 2, height: 10, backgroundColor: C.ground }} />)}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2 }}>{clock(G.t)}</Text>
        <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2 }}>−{clock((dur - G.t) / G.p.rate)}</Text>
      </View>
    </View>
  );
}
function Transcript({ e }) {
  const d = G.detail[e.id], ref = useRef(null), pos = useRef({}), cur = A.curUnit();
  useEffect(() => { const y = pos.current[cur]; if (ref.current && y != null) ref.current.scrollTo({ y: Math.max(0, y - 80), animated: true }); }, [cur]);
  if (!d) return null;
  const paras = []; let para = null;
  d.units.forEach((u, i) => {
    if (u.k === "title") return;
    if (u.k === "head") { para = null; paras.push({ head: true, i, t: u.c < d.chapters.length ? `${u.c + 1}. ${d.chapters[u.c]}` : "Quick recall" }); return; }
    if (u.ps || u.k !== "s" || !para) { para = { i, s: [] }; paras.push(para); }
    para.s.push({ i, t: u.t });
    if (u.k !== "s") para = null;
  });
  return (
    <ScrollView ref={ref} nestedScrollEnabled style={{ maxHeight: 320, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }} contentContainerStyle={{ padding: 14, gap: 10 }}>
      {paras.map(p => p.head
        ? <Text key={p.i} onLayout={ev => { pos.current[p.i] = ev.nativeEvent.layout.y; }} onPress={() => A.seekUnit(p.i)} style={{ fontFamily: F.display7, fontSize: 18, color: p.i === cur ? pc(e.p) : C.ink }}>{p.t}</Text>
        : <Text key={p.i} onLayout={ev => { p.s.forEach(x => { pos.current[x.i] = ev.nativeEvent.layout.y; }); }} style={{ fontFamily: F.body, fontSize: 15, lineHeight: 23, color: C.ink2 }}>
          {p.s.map(x => <Text key={x.i} onPress={() => A.seekUnit(x.i)} style={x.i === cur ? { color: C.ink, backgroundColor: mix(pc(e.p), C.surface, 0.25) } : null}>{x.t + " "}</Text>)}
        </Text>)}
    </ScrollView>
  );
}
function Drive({ e }) {
  const insets = useSafeAreaInsets(), dur = G.dur || A.durOf(e.id) || 1;
  const big = (ic, label, fn, main) => (
    <Tap onPress={fn} accessibilityLabel={label} style={{ flex: main ? undefined : 1, width: main ? "100%" : undefined, minHeight: main ? 150 : 110, borderRadius: 22, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: main ? C.accent : C.surface2 }}>
      <Icon name={ic} size={main ? 64 : 38} color={main ? C.accentInk : C.ink} />{main ? null : <Text style={{ fontFamily: F.body7, fontSize: 16, color: C.ink }}>{label}</Text>}
    </Tap>
  );
  return (
    <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: C.ground, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 18, gap: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[T.eyebrow, { color: pc(e.p) }]}>Drive mode · {E.PILLAR_BY(e.p).name}</Text>
        <Btn sm kind="ghost" title="Exit" onPress={() => { G.drive = false; changed(); }} />
      </View>
      <Text numberOfLines={2} style={{ fontFamily: F.display7, fontSize: 30, lineHeight: 33, color: C.ink }}>{A.title(e)}</Text>
      <Text numberOfLines={1} style={{ fontFamily: F.body6, fontSize: 16, color: C.ink2 }}>{G.status || A.chapterLabel().replace(" · ", ": ")}</Text>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: C.line, overflow: "hidden" }}><View style={{ width: `${Math.min(100, G.t / dur * 100)}%`, height: 8, backgroundColor: pc(e.p) }} /></View>
      <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
        {big(G.playing ? "pausef" : "playf", G.playing ? "Pause" : "Play", A.toggle, true)}
        <View style={{ flexDirection: "row", gap: 12 }}>{big("back15", "Back 15", () => A.skip(-15))}{big("nextf", "Next part", A.nextChapter)}</View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {Object.entries(A.VOICES).map(([k, v]) => <Tap key={k} onPress={() => A.setVoice(k)} style={{ flex: 1, minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: G.p.voice === k ? C.accent : C.line, backgroundColor: G.p.voice === k ? C.accentSoft : C.surface }}>
          <Text style={{ fontFamily: F.body7, fontSize: 15, color: C.ink }}>{v.name} voice</Text></Tap>)}
      </View>
    </View>
  );
}
function DriveNotice() {
  return (
    <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 22 }}>
      <View style={{ gap: 14, padding: 20, borderRadius: 18, backgroundColor: C.ground, borderWidth: 1, borderColor: C.line }}>
        <Text style={T.h2}>Set up before you drive</Text>
        <Text style={T.muted}>Pick your episode and press play before you set off. Drive mode's big buttons are for quick taps only when it's safe and legal.</Text>
        <Text style={T.muted}>Phone rules differ by state, and learner and provisional drivers often can't use a phone at all, even hands-free. Check your state's road rules.</Text>
        <Btn title="Got it" onPress={() => { G.p.driveNoticed = true; A.savePrefs(); G.modal = null; G.drive = true; changed(); }} />
        <Btn kind="ghost" title="Not now" onPress={() => { G.modal = null; changed(); }} />
      </View>
    </View>
  );
}
function PlayerBody() {
  useLive();
  const insets = useSafeAreaInsets(), e = A.ep(G.cur); if (!e) return null;
  const d = G.detail[e.id], c = A.curChapter(), cs = A.chapterStarts(e.id), g = A.groupOf(e);
  const sub = (ic, label, fn, text) => <Tap onPress={fn} style={{ flex: 1, alignItems: "center", gap: 4, paddingVertical: 8 }}>{text ? <Text style={{ fontFamily: F.mono7, fontSize: 16, color: C.ink }}>{text}</Text> : <Icon name={ic} size={21} color={C.ink} />}<Text style={{ fontFamily: F.body6, fontSize: 11.5, color: C.ink2 }}>{label}</Text></Tap>;
  return (
    <View style={{ flex: 1, backgroundColor: C.ground }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28, paddingHorizontal: 18, gap: 16, maxWidth: 520, width: "100%", alignSelf: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Tap onPress={() => { G.sheet = false; changed(); }} accessibilityLabel="Close player" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}><Icon name="down" size={24} color={C.ink} /></Tap>
          <Text numberOfLines={1} style={[T.eyebrow, { flex: 1, textAlign: "center", color: pc(e.p) }]}>{g ? g.t : E.PILLAR_BY(e.p).name}</Text>
          <Tap onPress={() => { if (G.p.driveNoticed) G.drive = true; else G.modal = "drive"; changed(); }} accessibilityLabel="Drive mode" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}><Icon name="car" size={23} color={C.ink} /></Tap>
        </View>
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <View style={{ width: 210, height: 210, borderRadius: 105, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: mix(pc(e.p), C.ground, 0.35) }}>
            <View style={{ width: 168, height: 168, borderRadius: 84, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: mix(pc(e.p), C.ground, G.playing ? 0.7 : 0.4), backgroundColor: C.surface }}>
              <Text style={{ fontFamily: F.greek, fontSize: 30, color: pc(e.p) }}>{E.PILLAR_BY(e.p).gr}</Text>
              <Text style={[T.eyebrow, { marginTop: 4 }]}>{E.PILLAR_BY(e.p).name}</Text>
            </View>
          </View>
        </View>
        <View style={{ gap: 4, alignItems: "center" }}>
          <Text style={{ fontFamily: F.display7, fontSize: 27, lineHeight: 30, color: C.ink, textAlign: "center" }}>{A.title(e)}</Text>
          <Text numberOfLines={1} style={T.muted}>{A.chapterLabel()}</Text>
        </View>
        <Track e={e} />
        {G.status ? <Text style={[T.small, { textAlign: "center" }]}>{G.status}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28 }}>
          <Tap onPress={() => A.skip(-15)} accessibilityLabel="Back 15 seconds" style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}><Icon name="back15" size={34} color={C.ink} /><Text style={{ position: "absolute", fontFamily: F.mono7, fontSize: 10, color: C.ink }}>15</Text></Tap>
          <Tap onPress={A.toggle} accessibilityLabel={G.playing ? "Pause" : "Play"} style={{ width: 78, height: 78, borderRadius: 39, alignItems: "center", justifyContent: "center", backgroundColor: C.accent }}><Icon name={G.playing ? "pausef" : "playf"} size={34} color={C.accentInk} /></Tap>
          <Tap onPress={() => A.skip(30)} accessibilityLabel="Forward 30 seconds" style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center" }}><Icon name="fwd30" size={34} color={C.ink} /><Text style={{ position: "absolute", fontFamily: F.mono7, fontSize: 10, color: C.ink }}>30</Text></Tap>
        </View>
        <View style={{ flexDirection: "row", borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
          {sub("prevf", "Part", A.prevChapter)}{sub(null, "Speed", A.cycleRate, G.p.rate + "×")}{sub("text", G.showText ? "Hide text" : "Transcript", () => { G.showText = !G.showText; changed(); })}{sub("nextf", "Part", A.nextChapter)}
        </View>
        <Narrators compact />
        {e.note ? <Note>{e.note}</Note> : null}
        {e.kind !== "original" ? (() => { const ls = e.lessons.map(E.lessonById).filter(Boolean), dl = ls.map(E.disclaimerFor).find(Boolean); return dl ? <Note>{dl}</Note> : null; })() : null}
        <Btn kind="ghost" icon={A.isSaved(e.id) ? "saved" : "dl"} disabled={e.id in G.busy}
          title={A.isSaved(e.id) ? "Downloaded · Remove" : e.id in G.busy ? `Downloading ${Math.round(G.busy[e.id] * 100)}%` : "Download for offline"}
          onPress={() => A.isSaved(e.id) ? A.removeDownload(e.id) : A.download(e.id)} />
        {G.showText ? <Transcript e={e} /> : null}
        {d ? <View style={{ gap: 8 }}>
          <H2 t="Chapters" right={<Text style={T.num}>{clock(G.dur || A.durOf(e.id))}</Text>} />
          {d.chapters.map((t, i) => <Tap key={i} onPress={() => A.seekChapter(i)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12, backgroundColor: i === c ? C.surface2 : C.surface, borderWidth: 1, borderColor: i === c ? pc(e.p) : C.line }}>
            <Text style={{ width: 22, fontFamily: F.mono7, fontSize: 14, color: pc(e.p) }}>{i + 1}</Text>
            <Text style={{ flex: 1, fontFamily: F.body6, fontSize: 14.5, color: C.ink }}>{t}</Text>
            <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2 }}>{clock(cs[i])}</Text></Tap>)}
          {cs.length > d.chapters.length ? <Tap onPress={() => A.seekChapter(d.chapters.length)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12, backgroundColor: c >= d.chapters.length ? C.surface2 : C.surface, borderWidth: 1, borderColor: c >= d.chapters.length ? pc(e.p) : C.line }}>
            <Text style={{ width: 22, fontFamily: F.mono7, fontSize: 14, color: pc(e.p) }}>?</Text><Text style={{ flex: 1, fontFamily: F.body6, fontSize: 14.5, color: C.ink }}>Quick recall</Text>
            <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2 }}>{clock(cs[d.chapters.length])}</Text></Tap> : null}
        </View> : null}
        {G.queue.length ? <View style={{ gap: 8 }}>
          <H2 t="Queue" right={<Link t="Clear" onPress={() => { G.queue = []; changed(); }} />} />
          {G.queue.map(id => { const q = A.ep(id); return <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: pc(q.p) }} /><Text numberOfLines={1} style={{ flex: 1, fontFamily: F.body, fontSize: 14, color: C.ink }}>{A.title(q)}</Text><Text style={T.num}>{A.mins(id)} min</Text></View>; })}
        </View> : null}
      </ScrollView>
      {G.drive ? <Drive e={e} /> : null}
      {G.modal === "drive" ? <DriveNotice /> : null}
    </View>
  );
}
export function GoPlayer({ children }) {
  return (
    <Modal visible={!!(G.sheet && G.cur)} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => { if (G.drive) G.drive = false; else G.sheet = false; changed(); }}>
      <PlayerBody />{children}
    </Modal>
  );
}
