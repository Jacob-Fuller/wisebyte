import React from "react";
import { View, Text } from "react-native";
import * as Speech from "expo-speech";
import * as E from "../engine";
import { C, F } from "../theme";
import { Icon } from "./Icon";
import { Tap, Pips } from "./ui";

export function speak(w) {
  try {
    Speech.stop();
    Speech.speak(w, { language: "en-AU", rate: 0.9 });
  } catch (e) {}
}
E.hooksPlayer.speak = speak;

export function SpeakBtn({ w, size = 44 }) {
  return (
    <Tap onPress={() => speak(w)} accessibilityLabel={`Hear ${w}`} style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", backgroundColor: C.accentSoft }}>
      <Icon name="speaker" size={size > 40 ? 21 : 18} color={C.accent} />
    </Tap>
  );
}

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* an example sentence with the word in bold */
function Example({ text, w }) {
  const m = text.match(new RegExp(`(${reEsc(w)}\\w*)`, "i"));
  const parts = m ? [text.slice(0, m.index), m[0], text.slice(m.index + m[0].length)] : [text];
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Text style={{ fontFamily: F.display, fontSize: 20, lineHeight: 22, color: C.accent }}>“</Text>
      <Text style={{ flex: 1, fontFamily: F.body, fontStyle: "italic", fontSize: 15, lineHeight: 22, color: C.ink2 }}>
        {parts[0]}{m ? <Text style={{ fontFamily: F.body7, color: C.ink }}>{parts[1]}</Text> : null}{parts[2] || ""}
      </Text>
    </View>
  );
}
const Chips = ({ list }) => <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{list.map(x => (
  <View key={x} style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: C.surface2 }}><Text style={{ fontFamily: F.body5, fontSize: 13, color: C.ink }}>{x}</Text></View>))}</View>;
const Dt = ({ children }) => <Text style={{ width: 82, fontFamily: F.body7, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: C.ink2, paddingTop: 4 }}>{children}</Text>;

export function WordCard({ e, noEx }) {
  const wc = E.wcatOf(e);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.display7, fontSize: 38, lineHeight: 40, color: C.ink }}>{e.w}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 4, alignItems: "center", marginTop: 6 }}>
            <Text style={{ fontFamily: F.body, fontStyle: "italic", fontSize: 14, color: C.ink2 }}>{e.pos}</Text>
            {e.ipa ? <Text style={{ fontFamily: F.mono, fontSize: 13, color: C.ink2 }}>{e.ipa}</Text> : null}
            {e.say ? <Text style={{ fontFamily: F.body, fontSize: 14, color: C.ink2 }}>{e.say}</Text> : null}
          </View>
        </View>
        <SpeakBtn w={e.w} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 6, alignItems: "center" }}>
        <Pips n={e.lvl || 1} label={E.WB.WORD_LEVELS[e.lvl || 1]} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: wc.color }} />
          <Text style={{ fontFamily: F.body7, fontSize: 12, letterSpacing: 0.7, textTransform: "uppercase", color: wc.color }}>{wc.name}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: F.body5, fontSize: 19, lineHeight: 27, color: C.ink }}>{e.def}</Text>
      {noEx ? null : <View style={{ gap: 6 }}>{(e.ex || []).map((x, i) => <Example key={i} text={x} w={e.w} />)}</View>}
      {(e.syn && e.syn.length) || (e.ant && e.ant.length) ? (
        <View style={{ gap: 6 }}>
          {e.syn && e.syn.length ? <View style={{ flexDirection: "row", gap: 10 }}><Dt>Synonyms</Dt><Chips list={e.syn} /></View> : null}
          {e.ant && e.ant.length ? <View style={{ flexDirection: "row", gap: 10 }}><Dt>Antonyms</Dt><Chips list={e.ant} /></View> : null}
        </View>
      ) : null}
      {e.origin ? (
        <View style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}>
          <Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: C.ink2, marginBottom: 2 }}>Origin</Text>
          <Text style={{ fontFamily: F.body, fontSize: 14, lineHeight: 20, color: C.ink }}>{e.origin}</Text>
        </View>
      ) : null}
    </View>
  );
}
