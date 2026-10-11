import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { C, F, PC, mix } from "../theme";
import { Icon } from "./Icon";

export const T = StyleSheet.create({
  h1: { fontFamily: F.display, fontSize: 36, lineHeight: 38, color: C.ink },
  h2: { fontFamily: F.display, fontSize: 23, lineHeight: 26, color: C.ink },
  h3: { fontFamily: F.display, fontSize: 21, lineHeight: 24, color: C.ink },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: C.ink },
  muted: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: C.ink2 },
  small: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: C.ink2 },
  eyebrow: { fontFamily: F.body7, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.ink2 },
  num: { fontFamily: F.mono, fontSize: 13, color: C.ink2 },
  gr: { fontFamily: F.greek, fontSize: 14, color: C.ink2, textTransform: "none", letterSpacing: 0 },
});

/* tap target with a subtle press state */
export function Tap({ onPress, style, children, disabled, hitSlop, accessibilityLabel }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={hitSlop} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [typeof style === "function" ? style({ pressed }) : style, pressed && !disabled ? { opacity: 0.75, transform: [{ scale: 0.99 }] } : null]}>
      {children}
    </Pressable>
  );
}

/* Greek text inside an eyebrow: "Naos · ναός" */
export function Eyebrow({ text, gr, after, color = C.ink2, style }) {
  return (
    <Text style={[T.eyebrow, { color }, style]}>{text}{gr ? " · " : ""}{gr ? <Text style={[T.gr, { color }]}>{gr}</Text> : null}{after || ""}</Text>
  );
}

export function Btn({ title, onPress, kind = "primary", icon, block, sm, disabled, color, inkColor, style, flex }) {
  const bg = kind === "ghost" ? C.surface2 : kind === "danger" ? C.bad : kind === "good" ? C.good : color || C.accent;
  const fg = kind === "ghost" ? C.ink : kind === "danger" || kind === "good" ? "#fff" : inkColor || C.accentInk;
  return (
    <Tap onPress={onPress} disabled={disabled} style={[{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: sm ? 9 : 13, paddingHorizontal: sm ? 13 : 18, borderRadius: sm ? 11 : 14, backgroundColor: bg, opacity: disabled ? 0.45 : 1 }, block && { alignSelf: "stretch" }, flex && { flex }, style]}>
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={{ fontFamily: F.body7, fontSize: sm ? 14 : 15, color: fg, textAlign: "center" }}>{title}</Text>
    </Tap>
  );
}
export const BtnRow = ({ children }) => <View style={{ flexDirection: "row", gap: 8 }}>{children}</View>;

export const Panel = ({ children, style }) => <View style={[{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 16, gap: 12 }, style]}>{children}</View>;

export function SectionHead({ title, right, rightStyle }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
      <Text style={T.h2}>{title}</Text>
      {right != null ? <Text style={[T.small, { fontFamily: F.mono }, rightStyle]}>{right}</Text> : null}
    </View>
  );
}

export function Bar({ pct, color = C.accent, height = 10, style }) {
  return (
    <View style={[{ height, borderRadius: 99, backgroundColor: C.surface2, overflow: "hidden" }, style]}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", backgroundColor: color, borderRadius: 99 }} />
    </View>
  );
}

export function Badge({ kind = "new", text, icon }) {
  const m = { new: [C.accentSoft, C.accent], done: [C.goodSoft, C.good], soon: [C.surface2, C.ink2], warn: [C.badSoft, C.bad], review: [C.goodSoft, C.good] }[kind];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: m[0] }}>
      {icon ? <Icon name={icon} size={12} color={m[1]} /> : null}
      <Text style={{ fontFamily: F.body7, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: m[1] }}>{text}</Text>
    </View>
  );
}

/* difficulty pips */
export function Pips({ n, label }) {
  const dc = n === 1 ? C.good : n === 2 ? C.spark : C.bad;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ flexDirection: "row", gap: 2, alignItems: "flex-end" }}>
        {[6, 9, 12].map((h, i) => <View key={i} style={{ width: 4, height: h, borderRadius: 1, backgroundColor: i < n ? dc : C.line }} />)}
      </View>
      <Text style={{ fontFamily: F.body6, fontSize: 12, color: C.ink2 }}>{label}</Text>
    </View>
  );
}
export function Strength({ box }) {
  return <View style={{ flexDirection: "row", gap: 3 }}>{[0, 1, 2, 3, 4].map(i => <View key={i} style={{ width: 6, height: 14, borderRadius: 2, backgroundColor: i < box ? C.good : C.surface2 }} />)}</View>;
}

export function Back({ label, onPress }) {
  return (
    <Tap onPress={onPress} style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 }}>
      <Icon name="chev" size={16} color={C.ink2} style={{ transform: [{ rotate: "180deg" }] }} />
      <Text style={{ fontFamily: F.body6, fontSize: 14, color: C.ink2 }}>{label}</Text>
    </Tap>
  );
}

/* page heading */
export function PageHead({ eyebrow, gr, after, eyeColor, title, desc, center = true }) {
  return (
    <View style={{ gap: 4, paddingTop: 4, alignItems: center ? "center" : "flex-start" }}>
      {eyebrow ? <Eyebrow text={eyebrow} gr={gr} after={after} color={eyeColor || C.ink2} style={{ textAlign: center ? "center" : "left" }} /> : null}
      <Text style={[T.h1, { textAlign: center ? "center" : "left" }]}>{title}</Text>
      {desc ? <Text style={[T.muted, { textAlign: center ? "center" : "left", maxWidth: 320 }]}>{desc}</Text> : null}
    </View>
  );
}

/* a list row with a coloured dot (lessons and words) */
export function Row({ color, title, meta, right, onPress, bg }) {
  return (
    <Tap onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: bg || C.surface, borderWidth: 1, borderColor: C.line }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ fontFamily: F.body6, fontSize: 15, color: C.ink }}>{title}</Text>
        {meta ? <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 10, rowGap: 3 }}>{meta}</View> : null}
      </View>
      {right}
    </Tap>
  );
}
export const Meta = ({ children }) => <Text style={{ fontFamily: F.body, fontSize: 13, color: C.ink2 }}>{children}</Text>;

/* expandable section with a round +/- */
export function Fold({ open, onToggle, title, meta, center, children }) {
  return (
    <View>
      <Tap onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", justifyContent: center ? "center" : "space-between", gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, marginBottom: open ? 10 : 0 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, flexShrink: 1 }}>
          <Text style={T.h2}>{title}</Text>
          {meta ? <Text style={[T.muted, { fontFamily: F.mono }]}>{meta}</Text> : null}
        </View>
        <View style={[{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.accentSoft, alignItems: "center", justifyContent: "center" }, center && { position: "absolute", right: 14 }]}>
          <View style={{ width: 12, height: 2, borderRadius: 1, backgroundColor: C.accent }} />
          {!open ? <View style={{ position: "absolute", width: 2, height: 12, borderRadius: 1, backgroundColor: C.accent }} /> : null}
        </View>
      </Tap>
      {open ? children : null}
    </View>
  );
}

/* the coloured callouts at the end of a session */
export function Callout({ c }) {
  const m = { gold: [C.goldSoft, C.gold], spark: [C.sparkSoft, C.spark], good: [C.goodSoft, C.good], "": [C.accentSoft, C.accent] }[c.cls || ""] || [C.accentSoft, C.accent];
  return (
    <View style={{ alignSelf: "stretch", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: m[0] }}>
      {c.icon ? <Icon name={c.icon} size={18} color={m[1]} /> : null}
      <Text style={{ fontFamily: F.body7, fontSize: 15, color: m[1], textAlign: "center", flexShrink: 1 }}>{c.text}</Text>
    </View>
  );
}

/* key/value lines (rewards, formats) */
export function Lines({ rows, okMiss }) {
  return (
    <View style={{ gap: 6, alignSelf: "stretch" }}>
      {rows.map(([a, b, cls], i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, backgroundColor: C.surface2 }}>
          <Text style={{ fontFamily: F.body, fontSize: 15, color: C.ink, flexShrink: 1 }}>{a}</Text>
          <Text style={{ fontFamily: F.mono7, fontSize: 15, color: cls === "ok" ? C.good : cls === "miss" ? C.bad : C.ink }}>{b}</Text>
        </View>
      ))}
    </View>
  );
}
export const pillarColor = p => (PC[p] || PC.learn)[0];
export const softOf = p => (PC[p] || PC.learn)[1];
export { mix };
