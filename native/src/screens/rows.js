/* List rows shared by several screens */
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as E from "../engine";
import { openSheet } from "../bus";
import { C, F, PC } from "../theme";
import { Icon } from "../components/Icon";
import { Row, Meta, Pips, Badge, Tap, Bar } from "../components/ui";
import { plural, today } from "../util";

export function LessonRow({ l, right, bg }) {
  const c = E.catOf(l), r = E.state.lessons[l.id], lv = E.LEVELS[l.level] || E.LEVELS.beginner;
  const badge = right !== undefined ? right : r ? <Badge kind="review" icon="repeat" text="Review" /> : null;
  return <Row color={c.color} title={l.title} bg={bg} onPress={() => E.startLesson(l.id)} right={badge}
    meta={<><Meta>{c.name}</Meta><Pips n={lv.n} label={lv.name} /><Meta>{E.lessonMins(l)} min</Meta></>} />;
}

export function WordRow({ e, bg }) {
  const r = E.state.words[e.w], c = E.wcatOf(e);
  const right = r ? null : <Badge kind="new" text="Add" />;
  return <Row color={c.color} title={e.w} bg={bg} onPress={() => openSheet("word", { w: e.w })} right={right}
    meta={<><Meta>{e.pos}</Meta><Pips n={e.lvl || 1} label={E.WB.WORD_LEVELS[e.lvl || 1]} /><Meta>{c.name}</Meta></>} />;
}

export function QuoteRow({ x }) {
  return (
    <Tap onPress={() => openSheet("quote", { i: x.i })} style={{ gap: 4, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
      <Text style={{ fontFamily: F.italic, fontSize: 18, lineHeight: 23, color: C.ink }}>“{x.q}”</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
        <Text style={{ fontFamily: F.body7, fontSize: 13, color: C.ink2 }}>{x.a}</Text>
        {E.state.quotes[x.id] ? <Text style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 13, color: C.ink2 }}>Learned</Text> : null}
      </View>
    </Tap>
  );
}

export function SubjRow({ x, onPress }) {
  const pr = E.subjectProgress(x), c = E.WB.CATEGORIES[x.cat] || { color: C.accent };
  return (
    <Tap onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderLeftWidth: 4, borderLeftColor: c.color }}>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ fontFamily: F.display7, fontSize: 19, lineHeight: 22, color: C.ink }}>{x.title}</Text>
        <Text style={{ fontFamily: F.body, fontSize: 13, color: C.ink2 }}>{plural(pr.total, "lesson")} · {pr.mins} min · {pr.done}/{pr.total} done</Text>
        <Bar pct={100 * pr.done / pr.total} color={c.color} height={5} />
      </View>
      {pr.mastered ? <Icon name="laurel" size={26} color={C.gold} /> : <Icon name="chev" size={18} color={C.ink2} />}
    </Tap>
  );
}

/* Arena/library game row */
export function GameRow({ a }) {
  const best = Object.values(E.state.scores[a.id] || {}), t = E.scoreOn(a.id, today());
  const meta = t != null ? <Badge kind="done" text={`Today ${t}`} /> : best.length ? <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink2 }}>Best {Math.max(...best)}</Text> : null;
  return <GRow icon={a.icon} title={E.actName(a)} sub={a.skill && a.skill !== E.actName(a) ? a.skill : (a.timed ? a.timed + " seconds" : a.count + " questions")} right={meta} onPress={() => E.startChallenge(a.id)} />;
}
export function GRow({ icon, title, sub, right, onPress, locked }) {
  const tc = PC.think;
  return (
    <Tap onPress={onPress} disabled={locked} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, opacity: locked ? 0.55 : 1 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: tc[1] }}><Icon name={icon} size={19} color={tc[0]} /></View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontFamily: F.body6, fontSize: 15, color: C.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: F.body, fontSize: 12.5, color: C.ink2 }}>{sub}</Text> : null}
      </View>
      {right}
    </Tap>
  );
}

/* renders long lists a chunk at a time so the screen stays responsive */
export function Progressive({ items, render, chunk = 60 }) {
  const [n, setN] = useState(Math.min(items.length, chunk));
  useEffect(() => {
    if (n >= items.length) return;
    const t = setTimeout(() => setN(v => Math.min(items.length, v + chunk)), 16);
    return () => clearTimeout(t);
  }, [n, items.length]);
  return <View style={{ gap: 8 }}>{items.slice(0, n).map(render)}</View>;
}
