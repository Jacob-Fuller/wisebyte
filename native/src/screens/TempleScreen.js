import React from "react";
import { View, Text } from "react-native";
import * as E from "../engine";
import { goTab } from "../bus";
import { C, F, PC } from "../theme";
import { Icon, Logo } from "../components/Icon";
import { T, Tap, Eyebrow, Btn, Bar } from "../components/ui";
import Temple from "../components/Temple";
import { plural } from "../util";

export function Header() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Logo size={28} color={C.accent} />
        <Text style={{ fontFamily: F.display, fontSize: 26, color: C.ink }}>Wisebyte</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 999, backgroundColor: C.sparkSoft }} accessibilityLabel="Day streak">
          <Icon name="flame" size={15} color={C.spark} />
          <Text style={{ fontFamily: F.mono7, fontSize: 13, color: C.spark }}>{E.liveStreak()}</Text>
        </View>
        <Tap onPress={() => goTab("me")} accessibilityLabel="Your profile and progress" style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line }}>
          <Icon name="bolt" size={15} color={C.ink} />
          <Text style={{ fontFamily: F.body7, fontSize: 13, color: C.ink }}>Lv {E.level()}</Text>
        </Tap>
      </View>
    </View>
  );
}

function pickPillar(x) {
  if (x.act === "lesson") E.startLesson(x.id);
  else if (x.act === "wotd") E.startWord(E.wordOfDay().w, true);
  else if (x.act === "quote") E.startQuote();
  else if (x.act === "challenge") E.startChallenge(x.id);
}

function ReviewCard() {
  const S = E.state, dl = E.dueLessons(), dw = E.dueWords(), strug = Object.keys(S.words).filter(w => E.entry(w) && E.struggling(w)), lq = E.learnedQuotes();
  const due = dl.length + dw.length, ms = E.memoryStrength();
  const waiting = E.allDueLessons().length + E.allDueWords().length - due, capped = E.reviewsLeft() === 0 && (E.day().reviewed || 0) > 0;
  const sub = due ? `About ${Math.max(1, Math.round(due * 0.4))} min${waiting > 0 ? ` · ${waiting} more tomorrow` : ""}`
    : capped ? `Today's ${E.REVIEW_CAP} are done${waiting > 0 ? ` · ${waiting} wait for tomorrow` : ""}`
    : ms ? "Nothing due right now" : "Finish a lesson or learn a word to start";
  const chip = (key, label, n, fn) => (
    <Tap key={key} onPress={fn} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: C.surface2 }}>
      <Text style={{ fontFamily: F.body6, fontSize: 13, color: C.ink }}>{label}</Text>
      <Text style={{ fontFamily: F.mono7, fontSize: 12, color: C.ink2 }}>{n}</Text>
    </Tap>
  );
  const chips = [dl.length ? chip("l", "Lessons", dl.length, E.startRecall) : null, dw.length ? chip("w", "Words", dw.length, E.startWordReview) : null,
    strug.length ? chip("s", "Tricky words", strug.length, () => E.startPractice("struggling")) : null, lq.length >= 2 ? chip("q", "Quotes", lq.length, E.startQuoteReview) : null].filter(Boolean);
  const rc = PC.remember[0];
  return (
    <View style={{ gap: 10, padding: 14, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderLeftWidth: 4, borderLeftColor: rc }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1, gap: 1 }}>
          <Eyebrow text="Review" gr="μνημοσύνη" color={rc} />
          <Text style={{ fontFamily: F.display7, fontSize: 21, lineHeight: 24, color: C.ink }}>{due ? `${plural(due, "thing")} to refresh` : capped ? "Done for today" : "All caught up"}</Text>
          <Text style={T.small}>{sub}</Text>
        </View>
        {due ? <Btn sm title="Start" onPress={E.startFullReview} color={rc} inkColor={C.surface} /> : null}
      </View>
      {ms ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontFamily: F.body, fontSize: 12, color: C.ink2 }}>Memory</Text>
          <Bar pct={ms.pct} color={rc} style={{ flex: 1 }} />
          <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink2 }}>{ms.pct}%</Text>
        </View>
      ) : null}
      {chips.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{chips}</View> : null}
    </View>
  );
}

export default function TempleScreen() {
  const items = E.pillarItems(), n = items.filter(x => x.done).length;
  const title = n === 5 ? "The temple stands" : n === 0 ? "Raise today's temple" : `${5 - n} ${5 - n === 1 ? "pillar" : "pillars"} left to raise`;
  return (
    <>
      <Header />
      <View style={{ gap: 10, alignItems: "center", paddingTop: 4 }}>
        <Eyebrow text="Naos" gr="ναός" color={C.gold} />
        <Text style={[T.h1, { fontSize: 34, lineHeight: 36, textAlign: "center" }]}>{title}</Text>
      </View>
      <View style={{ alignItems: "center", paddingTop: 6 }}>
        <Temple items={items} onPick={pickPillar} />
      </View>
      <ReviewCard />
    </>
  );
}
