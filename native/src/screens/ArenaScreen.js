import React from "react";
import { View, Text } from "react-native";
import * as E from "../engine";
import { C, F, PC, mix } from "../theme";
import { Icon } from "../components/Icon";
import { Tap, Eyebrow, SectionHead, PageHead } from "../components/ui";
import { Header } from "./TempleScreen";
import { today, ago, fmt } from "../util";

const GAME_HUE = { maths: "think", pattern: "learn", memory: "remember", logic: "cognition", stroop: "test", spatial: "practical", puzzles: "expression", critical: "think", anagram: "remember", compare: "test", letters: "learn", clock: "practical" };

function TrialCard({ hue, icon, eyebrow, gr, title, done, children, onPress }) {
  const h = hue;
  return (
    <Tap onPress={onPress} style={{ overflow: "hidden", gap: 6, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 16, borderRadius: 20, borderWidth: 1.5, borderColor: mix(h, C.line, 0.5), backgroundColor: mix(h, C.surface, 0.14) }}>
      <View style={{ position: "absolute", right: -40, top: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: h, opacity: 0.1 }} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <View style={{ width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: done && h === C.gold ? C.good : h }}><Icon name={icon} size={26} color={C.surface} /></View>
        <Eyebrow text={eyebrow} gr={gr} color={h} />
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: F.display7, fontSize: 30, lineHeight: 32, color: C.ink }}>{title}</Text>
      {children}
    </Tap>
  );
}
const Dots = ({ n, h }) => <View style={{ flexDirection: "row", gap: 3, marginTop: 8, marginBottom: 4 }}>{Array.from({ length: 10 }, (_, i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: n != null && i < n ? h : mix(h, C.surface2, 0.18) }} />)}</View>;
const Chip = ({ text, h, hs }) => <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderRadius: 999, backgroundColor: hs || C.surface2 }}><Text style={{ fontFamily: F.mono7, fontSize: 11, color: h || C.ink2 }}>{text}</Text></View>;

function GameTile({ a, hue }) {
  const [h, hs] = PC[hue] || PC.think;
  const t = E.scoreOn(a.id, today()), b = E.bestOf(a.id);
  const fmtS = a.timed ? `${a.timed}s` : a.id === "memory" ? `${a.count} rounds` : `${a.count} Qs`;
  return (
    <Tap onPress={() => E.startChallenge(a.id)} style={{ width: "48.5%", minHeight: 112, gap: 3, paddingTop: 12, paddingHorizontal: 12, paddingBottom: 13, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderTopWidth: 3, borderTopColor: h }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 6, paddingBottom: 10, flex: 1 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: hs }}><Icon name={a.icon} size={19} color={h} /></View>
        {t != null ? <Chip text={`Today ${t}`} h={C.good} hs={C.goodSoft} /> : b != null ? <Chip text={`Best ${b}`} /> : <Chip text="New" h={h} hs={hs} />}
      </View>
      <Text style={{ fontFamily: F.display7, fontSize: 18, lineHeight: 20, color: C.ink }}>{E.actName(a)}</Text>
      <Text style={{ fontFamily: F.body, fontSize: 12, color: C.ink2 }}>{a.skill && a.skill !== E.actName(a) ? a.skill + " · " : ""}{fmtS}</Text>
    </Tap>
  );
}

export default function ArenaScreen() {
  const d = E.day(), S = E.state, games = E.activeActs().filter(a => a.pillar === "think");
  const rc = PC.remember[0];
  return (
    <>
      <Header />
      <PageHead eyebrow="Palaistra" gr="παλαίστρα" eyeColor={PC.think[0]} title="Arena" />
      <TrialCard hue={C.gold} icon="laurel" eyebrow="Dokimasia" gr="δοκιμασία" title="The Daily Trial" done={d.trial != null} onPress={E.startTrial}>
        <Dots n={d.trial} h={C.gold} />
        {d.trial != null || S.trialBest != null ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <Text style={{ fontFamily: F.body7, fontSize: 13, color: C.gold }}>{d.trial != null ? `${d.trial}/10 today` : ""}</Text>
            {S.trialBest != null ? <Chip text={`Best ${S.trialBest}/10`} /> : null}
          </View>) : null}
      </TrialCard>
      <TrialCard hue={rc} icon="gauge" eyebrow="Metron" gr="μέτρον" title="Test Your Vocabulary" onPress={E.startVocabTest}>
        {S.vocab ? <Text style={{ fontFamily: F.body7, fontSize: 13, color: rc }}>≈ {fmt(S.vocab.value)} words · {ago(S.vocab.date)}</Text> : null}
      </TrialCard>
      <View style={{ gap: 10 }}>
        <SectionHead title="Brain games" right={`Beat yesterday +${E.RULES.xp.beatYesterday} XP`} rightStyle={{ fontFamily: F.body }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>{games.map(a => <GameTile key={a.id} a={a} hue={GAME_HUE[a.id] || "think"} />)}</View>
      </View>
      <View style={{ gap: 10 }}>
        <SectionHead title="Quizzes" />
        {E.QUIZ_GROUPS.map(([name, sub, ids], gi) => {
          const xs = ids.map(E.actById).filter(Boolean);
          return (
            <View key={name} style={{ gap: 8, marginTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, paddingHorizontal: 2 }}>
                <Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color: C.ink }}>{name}</Text>
                <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.ink2 }}>{sub}</Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>{xs.map(a => <GameTile key={a.id} a={a} hue={gi ? "remember" : "learn"} />)}</View>
            </View>
          );
        })}
      </View>
    </>
  );
}
