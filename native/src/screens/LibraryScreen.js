import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import * as E from "../engine";
import { ui, changed, openSheet, toast } from "../bus";
import { C, F, PC } from "../theme";
import { Icon } from "../components/Icon";
import { T, Tap, Btn, BtnRow, Panel, SectionHead, Back, PageHead, Fold, Eyebrow, Bar, Badge } from "../components/ui";
import { WordCard } from "../components/WordCard";
import { Header } from "./TempleScreen";
import { LessonRow, WordRow, QuoteRow, SubjRow, GameRow, GRow, Progressive } from "./rows";
import { plural, ago, fmt } from "../util";

const nav = patch => { Object.assign(ui, patch); ui.scrollTo0++; changed(); };
export const goLib = id => nav({ tab: "library", libPillar: id || null, libArea: null, libSubject: null, learnCat: "all", learnLevel: "all" });
export const goArea = id => nav({ tab: "library", libArea: id, libSubject: null, libPillar: null, learnCat: "all" });
export const goSubject = id => nav({ tab: "library", libSubject: id });

function toggleFold(id) { ui.foldOpen[id] = !ui.foldOpen[id]; changed(); }
function toggleAcc(key) { ui.accOpen[key] = !ui.accOpen[key]; changed(); }

function TopicAcc({ k, name, tag, color, done, total, ls }) {
  const open = !!ui.accOpen[k];
  return (
    <View style={{ borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderLeftWidth: 4, borderLeftColor: color, overflow: "hidden" }}>
      <Tap onPress={() => toggleAcc(k)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13, paddingHorizontal: 14, minHeight: 52, borderBottomWidth: open ? 1 : 0, borderBottomColor: C.line }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: F.body7, fontSize: 15, color: C.ink }}>{name}</Text>
          {tag ? <Text style={{ fontFamily: F.body, fontSize: 12, color: C.ink2 }}>{tag}</Text> : null}
        </View>
        <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink2 }}>{done}/{total}</Text>
        <Icon name="chev" size={18} color={C.ink2} style={{ transform: [{ rotate: open ? "-90deg" : "90deg" }] }} />
      </Tap>
      {open ? <View style={{ padding: 10, gap: 8 }}>{(ls || E.topicLessons(k)).map(l => <LessonRow key={l.id} l={l} bg={C.surface2} />)}</View> : null}
    </View>
  );
}

function LevelSeg() {
  const opts = [["all", "All"], ...Object.entries(E.LEVELS).map(([k, v]) => [k, v.name])];
  return (
    <View style={{ flexDirection: "row", backgroundColor: C.surface2, borderRadius: 12, padding: 3, gap: 2 }}>
      {opts.map(([k, n]) => {
        const on = ui.learnLevel === k;
        return <Tap key={k} onPress={() => { ui.learnLevel = k; changed(); }} style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 9, backgroundColor: on ? C.surface : "transparent" }}>
          <Text numberOfLines={1} style={{ fontFamily: F.body6, fontSize: 13, color: on ? C.ink : C.ink2, textAlign: "center" }}>{n}</Text></Tap>;
      })}
    </View>
  );
}
function GroupedLessons({ pool }) {
  const f = pool.filter(l => ui.learnLevel === "all" || l.level === ui.learnLevel);
  const catName = c => (E.WB.CATEGORIES[c] && E.WB.CATEGORIES[c].name) || c;
  const cats = [...new Set(f.map(l => l.cat))].sort((a, b) => catName(a).localeCompare(catName(b)));
  const sorted = c => f.filter(l => l.cat === c).sort((a, b) => E.LEVELS[a.level].n - E.LEVELS[b.level].n);
  return (
    <>
      <LevelSeg />
      {!cats.length ? <Panel><Text style={[T.muted, { textAlign: "center" }]}>No lessons at this level yet.</Text></Panel>
        : cats.length === 1 ? <View style={{ gap: 8 }}>{sorted(cats[0]).map(l => <LessonRow key={l.id} l={l} />)}</View>
        : <View style={{ gap: 8 }}>{cats.map(c => { const ls = sorted(c), cc = E.WB.CATEGORIES[c] || E.catOf({ cat: c });
            return <TopicAcc key={c} k={"grp:" + ui.learnLevel + ":" + c} name={cc.name} color={cc.color} done={ls.filter(l => E.state.lessons[l.id]).length} total={ls.length} ls={ls} />; })}</View>}
    </>
  );
}

function SubjectPage({ x }) {
  const pr = E.subjectProgress(x), c = E.WB.CATEGORIES[x.cat] || { color: C.accent }, area = E.WB.AREAS.find(a => a.id === x.area);
  const ls = x.steps.filter(E.lessonById), open = pr.done === pr.total;
  return (
    <>
      <Header />
      <Back label={area ? area.name : "Library"} onPress={() => area ? goArea(x.area) : goLib()} />
      <PageHead eyebrow={`Subject · ${plural(pr.total, "lesson")} · ${pr.mins} min`} eyeColor={c.color} title={x.title} desc={x.desc} />
      {pr.mastered ? <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, backgroundColor: C.goldSoft }}><Icon name="laurel" size={26} color={C.gold} /><Text style={{ fontFamily: F.body7, color: C.gold, fontSize: 15 }}>Mastered {ago(pr.mastered)}. Well done.</Text></View>
        : <View style={{ gap: 10 }}><Bar pct={100 * pr.done / pr.total} color={c.color} /><Text style={T.num}>{pr.done}/{pr.total} lessons done{pr.next ? "" : " · exam unlocked"}</Text></View>}
      {pr.next ? <Btn block title={`${pr.done ? "Continue" : "Start"}: ${E.lessonById(pr.next).title}`} onPress={() => E.startLesson(pr.next)} /> : null}
      <View style={{ gap: 8 }}>
        {ls.map((id, i) => { const l = E.lessonById(id), d = !!E.state.lessons[id];
          return (
            <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: d ? C.good : C.surface2 }}>
                {d ? <Icon name="check" size={14} color="#fff" /> : <Text style={{ fontFamily: F.mono7, fontSize: 12, color: C.ink2 }}>{i + 1}</Text>}
              </View>
              <View style={{ flex: 1 }}><LessonRow l={l} right={d ? <Badge kind="done" text="Done" /> : id === pr.next ? <Badge kind="new" text="Next" /> : null} /></View>
            </View>
          ); })}
      </View>
      <View style={{ gap: 10, padding: 16, borderRadius: 12, borderWidth: 1.5, borderStyle: open ? "solid" : "dashed", borderColor: open ? C.gold : C.line, backgroundColor: open ? C.goldSoft : C.surface }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="laurel" size={22} color={C.gold} /><Text style={[T.h2, { fontSize: 22 }]}>Mastery exam</Text></View>
        <Text style={T.muted}>{open ? `10 questions from across all ${pr.total} lessons. Score ${E.RULES.xp.masteryPass}/10 or better to master ${x.title}.` : `Finish all ${pr.total} lessons to unlock a 10-question exam. Pass it to master this subject.`}</Text>
        {open ? <Btn title={pr.mastered ? "Retake the exam" : "Take the mastery exam"} onPress={() => E.startMastery(x.id)} style={{ alignSelf: "flex-start" }} /> : null}
      </View>
    </>
  );
}

function LookupPanel() {
  const [q, setQ] = useState(ui.lookup ? ui.lookup.q : "");
  const L = ui.lookup;
  let out = null;
  if (L && L.status === "found") {
    const e = E.entry(L.w) || L.entry;
    out = <View style={{ gap: 10 }}><WordCard e={e} />
      {E.state.words[e.w] ? <View style={{ alignSelf: "flex-start" }}><Badge kind="done" text="In your words" /></View>
        : <Btn icon="plus" title="Add to my words" onPress={() => { const w = E.addLookupWord(); toast(`Added “${w.w}” to your words`); changed(); }} style={{ alignSelf: "flex-start" }} />}</View>;
  } else if (L && L.status === "missing") out = <Text style={T.muted}>“{L.w}” isn't in the Wisebyte library yet.</Text>;
  return (
    <Panel>
      <SectionHead title="Learn This" right="Any word, any time" rightStyle={{ fontFamily: F.body }} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput value={q} onChangeText={setQ} onSubmitEditing={() => E.doLookup(q)} returnKeyType="search" placeholder="e.g. What does ubiquitous mean?" placeholderTextColor={C.muted}
          autoCapitalize="none" autoCorrect={false} style={{ flex: 1, minWidth: 0, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface, color: C.ink, fontFamily: F.body, fontSize: 16 }} />
        <Btn sm icon="search" title="Look up" onPress={() => E.doLookup(q)} />
      </View>
      {out}
    </Panel>
  );
}

function VocabularyPage() {
  const list = E.lib().slice().sort((a, b) => a.w.localeCompare(b.w));
  const mine = Object.keys(E.state.words).map(E.entry).filter(Boolean), strug = mine.filter(x => E.struggling(x.w)), mast = mine.filter(x => E.mastered(x.w));
  return (
    <>
      <Panel>
        <SectionHead title="My words" right={`${mine.length} saved · ${mast.length} mastered`} />
        <Text style={T.small}>See the word, hear it, then pick the sentence it fits best.</Text>
        {mine.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{mine.slice(0, 24).map(e => (
          <Tap key={e.w} onPress={() => openSheet("word", { w: e.w })} style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
            <Text style={{ fontFamily: F.body6, fontSize: 13, color: C.ink }}>{e.w}{E.struggling(e.w) ? " ·" : ""}</Text></Tap>))}</View> : null}
        <BtnRow><Btn flex={1} icon="speaker" title="Practise" onPress={() => E.startPractice("fit")} />{strug.length ? <Btn flex={1} kind="ghost" title={`Tricky · ${strug.length}`} onPress={() => E.startPractice("struggling")} /> : null}</BtnRow>
        <Tap onPress={E.startVocabTest} style={{ alignSelf: "flex-start" }}><Text style={{ fontFamily: F.body6, fontSize: 14, color: C.accent }}>{E.state.vocab ? `Vocabulary ≈ ${fmt(E.state.vocab.value)} words · retake` : "Estimate my vocabulary size"}</Text></Tap>
      </Panel>
      <LookupPanel />
      <Fold open={!!ui.foldOpen.master} onToggle={() => toggleFold("master")} title="Words - How do you 'master' them?">
        <View style={{ gap: 10 }}>
          <Text style={T.muted}>A word is mastered when you get it right in three spaced reviews in a row.</Text>
          {[["1 · Learn it", "day 0"], ["2 · First review", "1 day later"], ["3 · Second review", "3 days later"], ["4 · Third review", "7 days later · mastered"]].map(([a, b]) => (
            <View key={a} style={{ flexDirection: "row", justifyContent: "space-between", padding: 11, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}>
              <Text style={T.body}>{a}</Text><Text style={{ fontFamily: F.mono7, fontSize: 14, color: C.ink }}>{b}</Text></View>))}
          <Text style={T.small}>Reviews come to you on the Temple when they're due. Miss one and the word starts again from day 1. Miss a word twice and it's marked tricky, so you can practise it on its own.</Text>
        </View>
      </Fold>
      <Fold open={!!ui.foldOpen.words} onToggle={() => toggleFold("words")} title="All words" meta={plural(list.length, "word")}>
        <Text style={[T.small, { marginBottom: 8 }]}>Tap any word to learn it or add it to your collection.</Text>
        <Progressive items={list} render={e => <WordRow key={e.w} e={e} />} />
      </Fold>
    </>
  );
}

function LibraryHome() {
  const cats = E.categoryStats().sort((a, b) => E.WB.CATEGORIES[a.key].name.localeCompare(E.WB.CATEGORIES[b.key].name));
  const cur = E.SUBJ().filter(x => { const pr = E.subjectProgress(x); return pr.done > 0 && !pr.mastered; })
    .sort((a, b) => E.subjectProgress(b).done / E.subjectProgress(b).total - E.subjectProgress(a).done / E.subjectProgress(a).total).slice(0, 3);
  const topics = [
    ...cats.map(c => { const t = E.WB.CATEGORIES[c.key]; return { name: t.name, el: <TopicAcc key={"cat:" + c.key} k={"cat:" + c.key} name={t.name} tag={t.tag} color={t.color} done={c.learned} total={c.total} /> }; }),
    ...E.WB.COLLECTIONS.filter(c => !Object.values(E.WB.CATEGORIES).some(t => t.name === c.title)).map(c => { const ls = c.ids.map(E.lessonById).filter(Boolean), dn = ls.filter(l => E.state.lessons[l.id]).length;
      return { name: c.title, el: <TopicAcc key={"col:" + c.id} k={"col:" + c.id} name={c.title} tag={c.desc} color={C.accent} done={dn} total={ls.length} /> }; }),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const pr = E.innerProgress();
  return (
    <>
      <Header />
      <PageHead eyebrow="Bibliotheke" gr="βιβλιοθήκη" eyeColor={PC.learn[0]} title="Library" />
      <View style={{ gap: 10 }}>
        <SectionHead title="By pillar" />
        <View style={{ gap: 5, paddingHorizontal: 4 }}>
          <View style={{ height: 12, borderRadius: 3, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line }} />
          <View style={{ height: 12, marginTop: -5, marginHorizontal: 18, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, borderTopWidth: 0 }} />
          {E.PILLAR5.map(x => { const pc = PC[x.p][0];
            return (
              <Tap key={x.p} onPress={() => goLib(x.p)} style={{ marginHorizontal: 22, paddingVertical: 15, paddingHorizontal: 16, borderRadius: 3, borderWidth: 1, borderColor: C.line, borderLeftWidth: 4, borderLeftColor: pc, backgroundColor: C.surface, alignItems: "center" }}>
                <Text style={{ fontFamily: F.display7, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: pc }}>{x.gk}</Text>
                <Text style={{ fontFamily: F.display7, fontSize: 23, lineHeight: 26, color: C.ink }}>{x.name}</Text>
              </Tap>); })}
          <View style={{ height: 10, marginHorizontal: 14, borderRadius: 2, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line }} />
          <View style={{ height: 12, marginTop: -2, borderRadius: 3, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line }} />
        </View>
      </View>
      {cur.length ? <View style={{ gap: 10 }}><SectionHead title="Continue" /><View style={{ gap: 8 }}>{cur.map(x => <SubjRow key={x.id} x={x} onPress={() => goSubject(x.id)} />)}</View></View> : null}
      <Fold center open={!!ui.foldOpen.compendium} onToggle={() => toggleFold("compendium")} title="Compendium">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {E.WB.AREAS.filter(a => E.SUBJ().some(x => x.area === a.id)).map(a => { const xs = E.SUBJ().filter(x => x.area === a.id);
            return <Tap key={a.id} onPress={() => goArea(a.id)} style={{ width: "48.5%", gap: 6, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
              <Text style={{ fontFamily: F.display7, fontSize: 19, lineHeight: 21, color: C.ink }}>{a.name}</Text>
              <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink2 }}>{plural(xs.length, "subject")}</Text></Tap>; })}
        </View>
      </Fold>
      <Fold center open={!!ui.foldOpen.topics} onToggle={() => toggleFold("topics")} title="By topic">
        <View style={{ gap: 8 }}>{topics.map(t => t.el)}</View>
      </Fold>
      <Btn kind="ghost" block icon="dice" title="Surprise me with a lesson" onPress={E.startRandomLesson} />
      <Tap onPress={() => nav({ tab: "inner" })} style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#6B5C3A", backgroundColor: C.surface }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: C.gold, backgroundColor: pr.open ? C.gold : "transparent" }}>
          <Icon name={pr.open ? "eye3" : "keyhole"} size={24} color={pr.open ? C.surface : C.gold} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Eyebrow text="Adyton" gr="ἄδυτον" color={C.gold} />
          <Text style={{ fontFamily: F.display7, fontSize: 23, lineHeight: 25, color: C.ink }}>The Inner Circle</Text>
          <Text style={T.small}>{pr.open ? "The sanctum is open to you." : `Sealed. Unlock every achievement to enter · ${pr.got}/${pr.total}`}</Text>
        </View>
      </Tap>
    </>
  );
}

export default function LibraryScreen() {
  const all = E.lessons(), know = all.filter(l => !E.isPractical(l)), prac = all.filter(E.isPractical);
  const back = <Back label="Library" onPress={() => goLib()} />;
  if (ui.libSubject && E.subjectById(ui.libSubject)) return <SubjectPage x={E.subjectById(ui.libSubject)} />;
  if (ui.libArea) {
    const A = E.WB.AREAS.find(a => a.id === ui.libArea), xs = E.SUBJ().filter(x => x.area === ui.libArea);
    return <><Header />{back}<PageHead eyebrow="Compendium" title={A.name} desc={`${plural(xs.length, "subject")}. Work through each one, then pass its exam to master it.`} />
      <View style={{ gap: 8 }}>{xs.map(x => <SubjRow key={x.id} x={x} onPress={() => goSubject(x.id)} />)}</View></>;
  }
  if (ui.learnCat !== "all") {
    const cc = E.WB.CATEGORIES[ui.learnCat];
    return <><Header />{back}<PageHead eyebrow="Topic" title={cc.name} desc={cc.tag ? cc.tag + "." : null} /><GroupedLessons pool={all.filter(l => l.cat === ui.learnCat)} /></>;
  }
  if (ui.libPillar) {
    const P5 = E.PILLAR_BY(ui.libPillar), pc = PC[P5.p][0];
    const head = <>{back}<PageHead eyebrow={P5.gk} gr={P5.gr} eyeColor={pc} title={P5.name} desc={P5.tag + "."} /></>;
    if (ui.libPillar === "knowledge") return <><Header />{head}<GroupedLessons pool={know} /></>;
    if (ui.libPillar === "practical") return <><Header />{head}<GroupedLessons pool={prac} /></>;
    if (ui.libPillar === "vocabulary") return <><Header />{head}<VocabularyPage /></>;
    if (ui.libPillar === "expression") {
      const Q = E.quotePool().sort((a, b) => a.a.localeCompare(b.a));
      return <><Header />{head}<Text style={T.small}>{plural(Q.length, "quote")} · {Q.filter(x => E.state.quotes[x.id]).length} learned</Text>
        <Progressive items={Q} render={x => <QuoteRow key={x.i} x={x} />} /></>;
    }
    if (ui.libPillar === "cognition") {
      const g = E.activeActs().filter(a => a.pillar === "think"), t = E.activeActs().filter(a => a.pillar === "test");
      return <><Header />{head}
        <SectionHead title="Brain games" right={`${g.length} games`} rightStyle={{ fontFamily: F.body }} /><View style={{ gap: 8 }}>{g.map(a => <GameRow key={a.id} a={a} />)}</View>
        <SectionHead title="Quizzes & tests" right={`${t.length} formats`} rightStyle={{ fontFamily: F.body }} /><View style={{ gap: 8 }}>{t.map(a => <GameRow key={a.id} a={a} />)}</View></>;
    }
  }
  return <LibraryHome />;
}

export function InnerScreen() {
  const pr = E.innerProgress();
  const head = <><Back label="Library" onPress={() => goLib()} />
    <PageHead eyebrow="Adyton" gr="ἄδυτον" after=" · the inner sanctum" eyeColor={C.gold} title="The Inner Circle"
      desc="In Greek temples, the adyton was the innermost room, closed to all but a chosen few. Here it holds the hardest knowledge in Wisebyte." /></>;
  if (!pr.open) return (
    <>
      <Header />{head}
      <View style={{ gap: 12, padding: 24, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: "#5E5033", backgroundColor: C.surface }}>
        <View style={{ alignSelf: "center", width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.gold, backgroundColor: C.goldSoft }}><Icon name="keyhole" size={40} color={C.gold} /></View>
        <Text style={[T.h2, { fontSize: 28, lineHeight: 30, textAlign: "center" }]}>Sealed</Text>
        <Text style={[T.muted, { textAlign: "center" }]}>The door opens only for those who have unlocked every achievement.</Text>
        <View style={{ gap: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={T.body}>Achievements unlocked</Text><Text style={{ fontFamily: F.mono, fontSize: 14, color: C.ink }}>{pr.got}/{pr.total}</Text></View>
          <Bar pct={pr.pct} height={8} />
        </View>
      </View>
      <SectionHead title="Still to unlock" right={pr.left.length} />
      <View style={{ gap: 8 }}>{pr.left.map(a => <GRow key={a.id} icon={a.icon} title={a.name} sub={a.desc} onPress={() => openSheet("ach", { id: a.id })} />)}</View>
      <SectionHead title="What waits inside" />
      <View style={{ gap: 8 }}>
        <GRow locked icon="book" title="The Sanctum Teachings" sub={`${E.innerLessons().length} advanced lessons on ideas few people truly understand`} />
        <GRow locked icon="brain" title="Expert questions" sub={`${E.WB.INNER.questions.length} questions few people can answer`} />
        <GRow locked icon="bulb" title="Expert riddles" sub={`${E.WB.INNER.riddles.length} riddles and logic traps`} />
        <GRow locked icon="book" title="The Arcane Lexicon" sub={`${E.innerWords().length} rare and advanced words`} />
      </View>
    </>
  );
  const b = E.state.inner || {}, iw = E.innerWords(), best = t => <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink2 }}>{t}</Text>;
  return (
    <>
      <Header />{head}
      <SectionHead title="The Sanctum Teachings" right={`${E.innerLessons().filter(l => E.state.lessons[l.id]).length}/${E.innerLessons().length} studied`} />
      <Text style={T.small}>Advanced lessons on the ideas that quietly run the world, from the limits of mathematics to the maths of ruin.</Text>
      <View style={{ gap: 8 }}>{E.innerLessons().map(l => <LessonRow key={l.id} l={l} />)}</View>
      <SectionHead title="The trials" />
      <View style={{ gap: 8 }}>
        <GRow icon="brain" title="Expert questions" sub={`10 of ${E.WB.INNER.questions.length} · history, science, philosophy, maths`} right={b.q != null ? best(`Best ${b.q}/10`) : null} onPress={() => E.startInner("q")} />
        <GRow icon="bulb" title="Expert riddles" sub={`5 of ${E.WB.INNER.riddles.length} · think before you answer`} right={b.r != null ? best(`Best ${b.r}/5`) : null} onPress={() => E.startInner("r")} />
        <GRow icon="book" title="Lexicon test" sub="10 arcane words" right={b.w != null ? best(`Best ${b.w}/10`) : null} onPress={() => E.startInner("w")} />
      </View>
      <SectionHead title="The Arcane Lexicon" right={`${iw.filter(e => E.state.words[e.w]).length}/${iw.length} learned`} />
      <View style={{ gap: 8 }}>{iw.slice().sort((a, c) => a.w.localeCompare(c.w)).map(e => <WordRow key={e.w} e={e} />)}</View>
    </>
  );
}
