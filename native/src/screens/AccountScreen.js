import React from "react";
import { View, Text } from "react-native";
import * as E from "../engine";
import { openSheet, toast, changed } from "../bus";
import { Auth } from "../auth";
import Purchases from "../purchases";
import { C, F, PC } from "../theme";
import { Icon } from "../components/Icon";
import { T, Tap, Btn, BtnRow, Panel, SectionHead, Bar, Eyebrow } from "../components/ui";
import { Header } from "./TempleScreen";
import { fmt } from "../util";
import * as Notify from "../notify";

export function SetRow({ title, sub, val, onPress, danger, chev }) {
  return (
    <Tap onPress={onPress} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.body, fontSize: 15, color: danger ? C.bad : C.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.ink2, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {val ? <Text style={{ fontFamily: F.body7, fontSize: 13, color: C.accent }}>{val}</Text> : null}
      {chev ? <Icon name="chev" size={18} color={C.ink2} /> : null}
    </Tap>
  );
}

function AccountPanel() {
  const u = Auth.user();
  if (u) return (
    <Panel>
      <SectionHead title="Account" />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: C.accentSoft }}>
          <Text style={{ fontFamily: F.display7, fontSize: 20, color: C.accent }}>{(u.email || "?")[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: F.body7, fontSize: 15, color: C.ink }}>{u.email}</Text>
          <Text style={T.small}>Progress backed up</Text>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <SetRow title="Change password" onPress={() => openSheet("auth", { mode: "change" })} />
        <SetRow title="Sign out" onPress={() => Auth.signOut().then(() => { toast("Signed out"); changed(); })} />
        <SetRow title="Delete account" danger onPress={() => openSheet("delete")} />
      </View>
    </Panel>
  );
  return (
    <Panel>
      <SectionHead title="Account" />
      <Text style={T.small}>Back up your progress and pick up where you left off on any device.</Text>
      <BtnRow><Btn flex={1} title="Create account" onPress={() => openSheet("auth", { mode: "signup" })} /><Btn flex={1} kind="ghost" title="Sign in" onPress={() => openSheet("auth", { mode: "signin" })} /></BtnRow>
    </Panel>
  );
}

export default function AccountScreen() {
  const S = E.state, lv = E.level(), rk = E.rank(lv), into = S.xp - E.xpForLevel(lv), need = E.xpForLevel(lv + 1) - E.xpForLevel(lv);
  const cats = E.categoryStats().sort((a, b) => b.pct - a.pct);
  const learned = Object.keys(S.lessons).filter(id => E.lessonById(id) && (E.lessonById(id).audience || "adult") === "adult").length;
  const got = E.ACHIEVEMENTS.filter(a => S.ach[a.id]).length;
  const totalSecs = Object.values(S.days).reduce((a, x) => a + (x.secs || 0), 0);
  const tt = totalSecs >= 3600 ? Math.floor(totalSecs / 3600) + "h " + Math.round((totalSecs % 3600) / 60) + "m" : Math.round(totalSecs / 60) + "m";
  const topicsMastered = cats.filter(c => c.pct >= 80).length;
  const games = E.activeActs().filter(a => a.pillar === "think");
  const stat = (b, s) => <View key={s} style={{ width: "31.8%", paddingVertical: 12, paddingHorizontal: 10, borderRadius: 14, backgroundColor: C.surface2, gap: 2 }}>
    <Text style={{ fontFamily: F.mono, fontSize: 19, lineHeight: 23, color: C.ink }}>{b}</Text><Text style={{ fontFamily: F.body6, fontSize: 12, color: C.ink2 }}>{s}</Text></View>;
  return (
    <>
      <Header />
      <Panel>
        <Eyebrow text={`Rank · Level ${lv}`} />
        <Text style={[T.h2, { fontSize: 28, lineHeight: 30 }]}>{rk.name}</Text>
        <Bar pct={100 * into / need} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2 }}>{fmt(into)} / {fmt(need)} XP</Text>
          <Text numberOfLines={1} style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink2, flexShrink: 1 }}>{rk.next ? `${rk.next[1]} · Lv ${rk.next[0]}` : `Lv ${lv + 1} next`}</Text>
        </View>
      </Panel>
      <Panel>
        <SectionHead title="Your knowledge" right={`Level ${lv}`} rightStyle={{ fontFamily: F.body }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
          {stat(learned, "Lessons")}{stat(S.stats.dailyCompletes || 0, "Temples raised")}
          {stat(topicsMastered, "Topics mastered")}{stat(E.liveStreak(), "Day streak")}{stat(totalSecs ? tt : "–", "Learning time")}
        </View>
      </Panel>
      <Panel>
        <SectionHead title="Topic mastery" />
        <View style={{ gap: 11 }}>
          {cats.map(c => { const cc = E.WB.CATEGORIES[c.key];
            return (
              <View key={c.key} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 118, flexDirection: "row", alignItems: "center", gap: 7 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cc.color }} />
                  <Text numberOfLines={1} style={{ fontFamily: F.body6, fontSize: 14, color: C.ink, flexShrink: 1 }}>{cc.name}</Text>
                </View>
                <Bar pct={c.pct} color={cc.color} height={12} style={{ flex: 1 }} />
                <Text style={{ width: 40, textAlign: "right", fontFamily: F.mono, fontSize: 13, color: C.ink }}>{c.pct}%</Text>
              </View>); })}
        </View>
      </Panel>
      <Panel>
        <SectionHead title="Brain games" right="Best scores" rightStyle={{ fontFamily: F.body }} />
        <View style={{ gap: 6 }}>
          {games.map(a => { const b = E.bestOf(a.id);
            return (
              <View key={a.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}>
                <Text style={{ fontFamily: F.body, fontSize: 15, color: C.ink, flexShrink: 1 }}>{E.actName(a)}{a.skill && a.skill !== E.actName(a) ? <Text style={{ fontSize: 13, color: C.ink2 }}> · {a.skill}</Text> : null}</Text>
                <Text style={{ fontFamily: F.mono7, fontSize: 15, color: C.ink }}>{b ?? "–"}</Text>
              </View>); })}
        </View>
      </Panel>
      <Panel>
        <SectionHead title="Achievements" right={`${got}/${E.ACHIEVEMENTS.length}`} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
          {E.ACHIEVEMENTS.map(a => { const on = !!S.ach[a.id];
            return (
              <Tap key={a.id} onPress={() => openSheet("ach", { id: a.id })} style={{ width: "31.8%", alignItems: "center", gap: 5, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14, backgroundColor: on ? C.goldSoft : C.surface2, opacity: on ? 1 : 0.72 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: on ? C.gold : C.line }}><Icon name={a.icon} size={21} color={on ? C.surface : C.ink2} /></View>
                <Text style={{ fontFamily: F.body7, fontSize: 13, lineHeight: 16, color: C.ink, textAlign: "center" }}>{a.name}</Text>
                <Text style={{ fontFamily: F.body, fontSize: 11, lineHeight: 14, color: C.ink2, textAlign: "center" }}>{a.desc}</Text>
              </Tap>); })}
        </View>
      </Panel>
      <AccountPanel />
      <Panel>
        <SectionHead title="Settings" />
        <View style={{ gap: 6 }}>
          <SetRow title="Subscription" sub={Purchases.status()} val="Plans" onPress={() => Purchases.showPaywall({ dismissable: true })} />
          <SetRow title="Daily lesson hint" sub="A short hint about today's lesson" val={E.state.notify.on ? "On" : "Off"} onPress={() => Notify.setEnabled(!E.state.notify.on)} />
          {E.state.notify.on ? <SetRow title="Time" val={Notify.fmtTime(E.state.notify.time)} onPress={() => openSheet("notifytime")} /> : null}
          <SetRow title="About, privacy and terms" sub="Disclaimers, contact and support" chev onPress={() => openSheet("about")} />
        </View>
      </Panel>
      <Text style={[T.small, { textAlign: "center" }]}>Progress is saved on this device.</Text>
    </>
  );
}
