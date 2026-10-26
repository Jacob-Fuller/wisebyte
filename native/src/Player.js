import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, Animated, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as E from "./engine";
import { ui, changed } from "./bus";
import { C, F, PC, mix } from "./theme";
import { Icon } from "./components/Icon";
import { Rich } from "./components/Rich";
import { T, Tap, Btn, BtnRow, Eyebrow, Lines, Callout, Pips, Badge } from "./components/ui";
import { WordCard, SpeakBtn, speak } from "./components/WordCard";
import { LessonRow } from "./screens/rows";
import { goSubject } from "./screens/LibraryScreen";
import { today, addDays, fmt } from "./util";

function Enter({ id, children }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { a.setValue(0); Animated.timing(a, { toValue: 1, duration: 260, useNativeDriver: true }).start(); }, [id]);
  return <Animated.View style={{ flex: 1, opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }), transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>{children}</Animated.View>;
}
const Card = ({ children, onPress }) => {
  const st = { flexGrow: 1, gap: 16, paddingVertical: 22, paddingHorizontal: 20, borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line };
  return onPress ? <Pressable onPress={onPress} style={st}>{children}</Pressable> : <View style={st}>{children}</View>;
};
const H1 = ({ children }) => <Text style={{ fontFamily: F.display, fontSize: 30, lineHeight: 33, color: C.ink }}>{children}</Text>;
const H2 = ({ children }) => <Text style={{ fontFamily: F.display, fontSize: 24, lineHeight: 28, color: C.ink }}>{children}</Text>;
const Big = ({ children }) => <Text style={{ fontFamily: F.body5, fontSize: 20, lineHeight: 29, color: C.ink }}>{children}</Text>;
const Body = ({ children }) => <Text style={{ fontFamily: F.body, fontSize: 18, lineHeight: 29, color: C.ink }}>{children}</Text>;
const Muted = ({ children, center }) => <Text style={[T.muted, center && { textAlign: "center" }]}>{children}</Text>;
function Tag({ color, text }) {
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    <Text style={{ fontFamily: F.body7, fontSize: 12, letterSpacing: 0.7, textTransform: "uppercase", color }}>{text}</Text></View>;
}
function Keypoint({ label, text, acc }) {
  return <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: acc[1] }}>
    <Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 0.9, textTransform: "uppercase", color: acc[0], marginBottom: 3 }}>{label}</Text>
    <Text style={{ fontFamily: F.body6, fontSize: 16, lineHeight: 23, color: C.ink }}>{text}</Text></View>;
}
function Idea({ label, text, color }) {
  return <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: C.surface2 }}>
    <Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color, marginBottom: 4 }}>{label}</Text>
    <Text style={{ fontFamily: F.body, fontSize: 16, lineHeight: 24, color: C.ink }}>{text}</Text></View>;
}
const BigQuote = ({ text, color }) => <View>
  <Text style={{ fontFamily: F.display, fontSize: 64, lineHeight: 52, color }}>“</Text>
  <Text style={{ fontFamily: F.italic6, fontSize: 28, lineHeight: 35, color: C.ink }}>{text}</Text></View>;
const Byline = ({ a, w }) => <View style={{ gap: 2 }}><Text style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>{a}</Text><Text style={T.small}>{w}</Text></View>;

function QCard({ s, P, acc }) {
  const q = s.q, a = P.answered, done = a !== null, right = a === q.answer;
  const layout = q.big ? "big" : q.options.length === 2 && !q.stack ? "two" : "list";
  return (
    <Card>
      {s.head ? <Eyebrow text={s.head} /> : null}
      {q.sub ? <Rich html={q.sub} style={T.muted} accent={acc} /> : null}
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <View style={{ flexShrink: 1, flexGrow: 1 }}><Rich html={q.prompt} style={{ fontFamily: F.display, fontSize: 22, lineHeight: 28, color: C.ink }} accent={acc} /></View>
        {q.fit ? <SpeakBtn w={q.w} size={38} /> : null}
      </View>
      <View style={layout === "list" ? { gap: 10 } : { flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {q.options.map((o, i) => {
          const st = done ? (i === q.answer ? "right" : i === a ? "wrong" : "") : "";
          const bc = st === "right" ? C.good : st === "wrong" ? C.bad : C.line, bg = st === "right" ? C.goodSoft : st === "wrong" ? C.badSoft : C.surface;
          const showKey = (q.options.length > 2 || q.stack) && !q.big;
          return (
            <Tap key={i} disabled={done} onPress={() => E.answer(i)} style={[{ borderWidth: 2, borderColor: bc, backgroundColor: bg, borderRadius: 14 },
              layout === "list" ? { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 15 }
                : { width: "48%", flexGrow: 1, alignItems: "center", justifyContent: "center", padding: layout === "big" ? 14 : 18 }]}>
              {showKey ? <View style={{ width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2 }}><Text style={{ fontFamily: F.mono, fontSize: 13, color: C.ink }}>{"ABCD"[i]}</Text></View> : null}
              <View style={layout === "list" ? { flex: 1 } : null}>
                <Rich html={o} accent={acc} style={layout === "big" ? { fontFamily: F.mono7, fontSize: 30, color: C.ink, textAlign: "center" }
                  : layout === "two" ? { fontFamily: F.body7, fontSize: 18, color: C.ink, textAlign: "center" } : { fontFamily: F.body5, fontSize: 16, lineHeight: 22, color: C.ink }} />
              </View>
            </Tap>
          );
        })}
      </View>
      {done && !P.timed && q.explain ? (
        <View style={{ padding: 14, borderRadius: 14, backgroundColor: right ? C.goodSoft : C.badSoft, gap: 2 }}>
          <Text style={{ fontFamily: F.body7, fontSize: 15, color: C.ink }}>{right ? "Correct." : "Not quite."}{q.verdict ? " " + q.verdict : ""}</Text>
          <Rich html={q.explain} style={{ fontFamily: F.body, fontSize: 15, lineHeight: 21, color: C.ink }} accent={acc} />
        </View>
      ) : null}
    </Card>
  );
}

function Reward({ r, head, big, xpPill, top, bottom, acc }) {
  return (
    <Card>
      <View style={{ flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
        {top}
        <Eyebrow text={head} style={{ textAlign: "center" }} />
        <Text style={{ fontFamily: F.mono7, fontSize: 50, lineHeight: 56, color: acc[0] }}>{big}</Text>
        {xpPill ? <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 999, backgroundColor: acc[1] }}>
          <Icon name="bolt" size={15} color={acc[0]} /><Text style={{ fontFamily: F.mono7, fontSize: 13, color: acc[0] }}>+{r.xp} XP</Text></View> : null}
        <Lines rows={r.lines} />
        {r.note ? <Muted center>{r.note}</Muted> : null}
        {(r.out || []).map((c, i) => <Callout key={i} c={c} />)}
        {bottom}
      </View>
    </Card>
  );
}

function TempleNext() {
  const t = E.templeFinish(), nx = t.next;
  const c = nx ? PC[nx.p][0] : C.gold;
  return (
    <View style={{ alignSelf: "stretch", gap: 3, marginTop: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: mix(c, C.surface2, 0.12), borderWidth: 1, borderColor: mix(c, C.line, 0.45) }}>
      <Eyebrow text={nx ? `Pillar raised · ${t.n} of 5` : "5 of 5"} color={c} />
      {nx ? <Text style={{ fontFamily: F.display, fontSize: 21, color: C.ink }}>Next: {nx.name}  <Text style={{ fontFamily: F.italic, fontSize: 14, color: C.ink2 }}>{nx.gk} · </Text><Text style={{ fontFamily: F.greek, fontSize: 14, color: C.ink2 }}>{nx.gr}</Text></Text>
        : <Text style={{ fontFamily: F.display, fontSize: 21, color: C.ink }}>The temple stands</Text>}
      <Text style={T.small}>{nx ? `${nx.tag} · ${nx.meta}` : "All five pillars raised today."}</Text>
    </View>
  );
}

function Step({ P, acc }) {
  const s = P.steps[P.i], l = P.l;
  const next = () => E.advance();
  const ended = (s.t === "l-reward" || s.t === "w-reward" || s.t === "x-reward" || s.t === "summary") && E.raisedThisSession().length > 0;
  let card = null, foot = null;
  if (s.t === "l-intro") {
    const lv = E.LEVELS[l.level] || E.LEVELS.beginner, disc = E.disclaimerFor(l);
    card = (
      <Card onPress={next}>
        {P.golden ? <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 999, backgroundColor: C.goldSoft }}>
          <Icon name="bolt" size={14} color={C.gold} /><Text style={{ fontFamily: F.body7, fontSize: 13, color: C.gold }}>Golden Lesson · 2× XP</Text></View> : null}
        <Tag color={P.color} text={E.catOf(l).name} />
        <H1>{l.title}</H1>
        <Big>{l.hook}</Big>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 14, rowGap: 6 }}>
          <Pips n={lv.n} label={lv.name} />
          {[`${E.lessonMins(l)} min`, `${l.sections.length} short reads`, `${l.quiz.length} questions`].map(x => <Text key={x} style={T.num}>{x}</Text>)}
        </View>
        <Lines rows={[["1 · Learn", "read"], ["2 · Test", `${l.quiz.length} Qs`], ["3 · Recall", "refresher"], ["4 · Review", "spaced"]]} />
        {disc ? <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.surface2, borderLeftWidth: 3, borderLeftColor: C.gold }}><Text style={{ fontFamily: F.body, fontSize: 12.5, lineHeight: 18, color: C.ink2 }}>{disc}</Text></View> : null}
        {P.replay ? <Muted>Reviewing a lesson you've learned. Going over it again strengthens your memory, and reviews earn half XP.</Muted> : null}
      </Card>);
    foot = <Btn block title={P.replay ? "Start review" : "Start reading"} onPress={next} color={acc[0]} />;
  } else if (s.t === "l-read") {
    const sec = l.sections[s.k];
    card = <Card onPress={next}><Tag color={P.color} text={`Read · ${s.k + 1} of ${l.sections.length}`} /><H2>{sec.h}</H2><Body>{sec.b}</Body><Keypoint label="Key idea" text={sec.key} acc={acc} /></Card>;
    foot = <Btn block title={s.k === l.sections.length - 1 ? "Test yourself" : "Next"} onPress={next} color={acc[0]} />;
  } else if (s.t === "q") {
    card = <QCard s={s} P={P} acc={acc} />;
    foot = P.timed ? null : <Btn block disabled={P.answered === null} title={P.answered === null ? "Choose an answer" : "Continue"} onPress={next} color={acc[0]} />;
  } else if (s.t === "l-score") {
    const right = P.results.filter(r => r.right).length, n = l.quiz.length, missed = P.results.filter(r => !r.right);
    card = (
      <Card><View style={{ flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Eyebrow text="Your score" />
        <Text style={{ fontFamily: F.mono7, fontSize: 50, lineHeight: 56, color: right === n ? C.good : acc[0] }}>{right}/{n}</Text>
        <Lines rows={P.results.map(r => [l.sections[r.s].h, r.right ? "✓" : "✗", r.right ? "ok" : "miss"])} />
        {right === n ? <Callout c={{ cls: "good", icon: "check", text: `Perfect score! +${E.RULES.xp.perfect} XP bonus` }} />
          : <Muted center>{missed.length === 1 ? "One concept you missed." : `${missed.length} concepts you missed.`} Here's a 30-second refresher, then one more try.</Muted>}
      </View></Card>);
    foot = <Btn block title={right === n ? "Collect XP" : "Start refresher"} onPress={next} color={acc[0]} />;
  } else if (s.t === "l-refresh") {
    const sec = l.sections[s.s];
    card = <Card><Eyebrow text="30-second refresher" /><H2>{sec.h}</H2><Keypoint label="The concept you missed" text={sec.key} acc={acc} /><Body>{sec.b}</Body></Card>;
    foot = <Btn block title="Try the question again" onPress={next} color={acc[0]} />;
  } else if (s.t === "l-reward") {
    card = <Reward r={P.reward} head={P.replay ? "Lesson reviewed" : "Lesson complete"} big={`+${P.reward.xp} XP`} acc={acc} bottom={ended ? <TempleNext /> : null} />;
    foot = <Btn block title="Continue" onPress={next} color={acc[0]} />;
  } else if (s.t === "l-next") {
    const subs = E.subjectsOf(l.id);
    const path = subs.find(x => x.steps.some(id => !E.state.lessons[id] && E.lessonById(id))) || subs[0];
    const nextInPath = path && path.steps.find(x => E.lessonById(x) && !E.state.lessons[x]);
    const rel = (l.related || []).map(E.lessonById).filter(Boolean);
    const d = E.day();
    const action = (title, sub, badge, color, fn) => (
      <Tap onPress={fn} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
        <View style={{ flex: 1, gap: 2 }}><Text style={{ fontFamily: F.body6, fontSize: 15, color: C.ink }}>{title}</Text><Text style={T.small}>{sub}</Text></View>
        <Badge kind="new" text={badge} />
      </Tap>);
    card = (
      <Card>
        <Eyebrow text="What next?" /><H2>Keep going</H2>
        {!d.word ? action("Learn today's word", "Finish your daily goal", "Word", C.accent, () => { E.closePlayer(); E.startWord(E.wordOfDay().w, true); }) : null}
        {nextInPath ? <View style={{ gap: 8 }}><Eyebrow text={`Next in ${path.title}`} /><LessonRow l={E.lessonById(nextInPath)} /></View>
          : path && !E.state.mastered[path.id] ? action(`${path.title}: exam unlocked`, "Pass it to master the subject", "Exam", C.gold, () => { E.closePlayer(); goSubject(path.id); }) : null}
        {rel.length ? <View style={{ gap: 8 }}><Eyebrow text="Related lessons" />{rel.map(x => <LessonRow key={x.id} l={x} />)}</View> : null}
      </Card>);
    foot = <Btn block kind="ghost" title="Done for now" onPress={E.closePlayer} />;
  } else if (s.t === "w-card") {
    card = <Card><Eyebrow text={`${P.isWotd ? "Word of the day" : "New word"} · see it, hear it`} /><WordCard e={P.e} noEx /></Card>;
    foot = <BtnRow><Btn flex={1} kind="ghost" icon="speaker" title="Hear again" onPress={() => speak(P.e.w)} /><Btn flex={1} title="Done" onPress={next} color={acc[0]} /></BtnRow>;
  } else if (s.t === "w-reward") {
    card = <Reward r={P.reward} head={P.reward.isNew ? "Added to your words" : "Word practised"} big={`+${P.reward.xp} XP`} acc={acc} bottom={ended ? <TempleNext /> : null} />;
    foot = <Btn block title="Done" onPress={next} color={acc[0]} />;
  } else if (s.t === "mem-show") {
    card = <Card><Eyebrow text={`${s.head} · memorise this number`} />
      <Text style={{ fontFamily: F.mono7, fontSize: 44, letterSpacing: 8, textAlign: "center", paddingVertical: 24, color: C.ink }}>{s.seq}</Text>
      <Muted center>It disappears in a few seconds.</Muted></Card>;
    foot = <Btn block title="I've got it" onPress={next} color={acc[0]} />;
  } else if (s.t === "learn-list") {
    card = <Card><Eyebrow text="Study first" /><H2>{s.title}</H2>
      <View style={{ gap: 8 }}>{s.pairs.map(([a, b]) => (
        <View key={a} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}>
          <Text style={{ fontFamily: F.body7, fontSize: 16, color: C.ink }}>{a}</Text><Text style={{ fontFamily: F.body, fontSize: 16, color: C.ink2, textAlign: "right", flexShrink: 1 }}>{b}</Text></View>))}</View>
      <Muted>{s.words ? "Read each word and meaning. Say them out loud; it helps." : "Take a moment. Try linking each capital to an image or a word that sounds similar."}</Muted></Card>;
    foot = <Btn block title="I'm ready, test me" onPress={next} color={acc[0]} />;
  } else if (s.t === "c-intro") {
    const c = P.c, y = E.scoreOn(c.id, addDays(today(), -1)), t = E.scoreOn(c.id, today()), cat = P.opt && P.opt.cat;
    card = <Card><Eyebrow text={c.pillar === "think" ? "Brain games" + (c.skill ? " · " + c.skill : "") : "Test yourself"} />
      <H1>{E.actName(c)}{cat ? `: ${E.WB.GK_CATS[cat]}` : ""}</H1><Big>{c.desc}</Big>
      <Lines rows={[["Format", c.timed ? c.timed + " seconds" : (P.total || c.count) + (c.id === "memory" ? " rounds" : " questions")], ...(cat ? [] : [["Yesterday's score", y ?? "–"], ["Best today", t ?? "–"]])]} />
      {!cat && y != null ? <Muted>Beat {y} for a +{E.RULES.xp.beatYesterday} XP bonus.</Muted> : null}</Card>;
    foot = <Btn block title={c.timed ? "Start the clock" : "Start"} onPress={next} color={acc[0]} />;
  } else if (s.t === "m-intro") {
    const x = P.subject;
    card = <Card><Tag color={C.gold} text="Mastery exam" /><H1>{x.title}</H1>
      <Big>{P.total} questions from across the subject. Score {E.RULES.xp.masteryPass} or more to master it.</Big>
      <Lines rows={[["Questions", P.total], ["Pass mark", `${E.RULES.xp.masteryPass}/10`], ["Reward", `+${E.RULES.xp.mastery} XP`]]} /></Card>;
    foot = <Btn block title="Begin the exam" onPress={next} color={acc[0]} />;
  } else if (s.t === "x-quote") {
    const q = P.quote, ec = PC.expression[0];
    card = <Card><Tag color={ec} text="Logos · Quote of the day" /><BigQuote text={q.q} color={ec} /><Byline a={q.a} w={q.w} />
      <Idea label="What it means" text={q.m} color={ec} /><Text style={T.small}>Read it twice. Try saying it out loud.</Text></Card>;
    foot = <Btn block title="Done" onPress={next} color={acc[0]} />;
  } else if (s.t === "x-reward") {
    card = <Reward r={P.reward} head="Quote read" big={`+${P.reward.xp} XP`} acc={acc} bottom={ended ? <TempleNext /> : null} />;
    foot = <Btn block title="Done" onPress={next} color={acc[0]} />;
  } else if (s.t === "summary") {
    const r = P.reward;
    const big = P.score + "/" + r.total;
    const top = P.mode === "mastery" && P.passed ? <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 12, borderRadius: 12, backgroundColor: C.goldSoft }}>
      <Icon name="laurel" size={26} color={C.gold} /><Text style={{ fontFamily: F.body7, fontSize: 15, color: C.gold }}>{P.subject.title} mastered</Text></View> : null;
    card = <Reward r={r} head={r.title + " complete"} big={big} xpPill={r.xp > 0} top={top} acc={acc} bottom={ended ? <TempleNext /> : null} />;
    foot = P.mode === "mastery" ? <BtnRow><Btn flex={1} kind="ghost" title="Done" onPress={E.closePlayer} /><Btn flex={1} title="Back to subject" onPress={() => { const id = P.subject.id; E.closePlayer(); goSubject(id); }} color={acc[0]} /></BtnRow>
      : P.mode === "challenge" ? <BtnRow><Btn flex={1} kind="ghost" title="Done" onPress={E.closePlayer} /><Btn flex={1} title="Play again" onPress={() => { const id = P.c.id; E.closePlayer(); E.startChallenge(id); }} color={acc[0]} /></BtnRow>
      : <Btn block title="Done" onPress={E.closePlayer} color={acc[0]} />;
  }
  if (ended) {
    const t = E.templeFinish();
    foot = t.next ? <BtnRow><Btn flex={1} kind="ghost" title="Temple" onPress={() => { E.closePlayer(); ui.tab = "today"; ui.scrollTo0++; changed(); }} />
      <Btn flex={2} title={`Next: ${t.next.name}`} onPress={() => { const p = t.next.p; E.closePlayer(); E.startPillar(p); }} color={acc[0]} /></BtnRow>
      : <Btn block title="See your temple" onPress={() => { E.closePlayer(); ui.tab = "today"; ui.scrollTo0++; changed(); }} color={acc[0]} />;
  }
  return { card, foot };
}

export default function Player() {
  const P = E.player.P;
  const insets = useSafeAreaInsets();
  const scroller = useRef(null);
  const idx = P ? P.i : -1;
  useEffect(() => { if (scroller.current) scroller.current.scrollTo({ y: 0, animated: false }); }, [idx]);
  if (!P) return null;
  const acc = PC[E.playerPillar()] || PC.learn;
  const tc = P.color || acc[0];
  const { card, foot } = Step({ P, acc });
  const left = E.timeLeft();
  return (
    <View style={{ flex: 1, backgroundColor: C.ground, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Tap onPress={E.closePlayer} accessibilityLabel="Close" style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2 }}><Icon name="close" size={18} color={C.ink} /></Tap>
        {P.timed ? <>
          <View style={{ flex: 1, height: 8, borderRadius: 99, backgroundColor: C.surface2, overflow: "hidden" }}><View style={{ width: `${100 * left / (P.timed * 1000)}%`, height: "100%", backgroundColor: C.spark, borderRadius: 99 }} /></View>
          <Text style={{ fontFamily: F.mono7, fontSize: 15, minWidth: 42, textAlign: "right", color: C.ink }}>{Math.ceil(left / 1000)}s</Text>
          <Text style={{ fontFamily: F.mono7, fontSize: 15, minWidth: 30, textAlign: "right", color: C.ink }}>{P.score}</Text>
        </> : <View style={{ flex: 1, flexDirection: "row", gap: 3 }}>{P.steps.map((_, i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i <= P.i ? tc : C.surface2 }} />)}</View>}
      </View>
      <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Enter id={P.i}>{card}</Enter>
      </ScrollView>
      {foot ? <View style={{ gap: 8 }}>{foot}</View> : null}
    </View>
  );
}
