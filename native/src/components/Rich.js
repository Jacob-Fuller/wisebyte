/* Renders the small HTML strings the engine builds for questions
   (b, em, br, span/div with a class, ol/li) as native views. */
import React from "react";
import { View, Text } from "react-native";
import { C, F } from "../theme";

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const decode = s => s.replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, k) => ENT[k] ?? (k[0] === "#" ? String.fromCodePoint(k[1] === "x" || k[1] === "X" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)) : m));

export function parse(html) {
  const root = { tag: "root", children: [] }, stack = [root];
  const re = /<\/?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g; let m;
  while ((m = re.exec(String(html ?? "")))) {
    const top = stack[stack.length - 1];
    if (m[3] != null) { top.children.push(decode(m[3])); continue; }
    const tag = m[1].toLowerCase(), isClose = m[0][1] === "/";
    if (isClose) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; } continue; }
    if (tag === "br") { top.children.push("\n"); continue; }
    const attrs = m[2] || "";
    const cls = (attrs.match(/class=["']([^"']*)["']/) || [0, ""])[1].split(/\s+/).filter(Boolean);
    const color = (attrs.match(/color:\s*(#[0-9a-fA-F]{3,8})/) || [])[1];
    const node = { tag, cls, color, children: [] };
    top.children.push(node);
    if (!m[0].endsWith("/>")) stack.push(node);
  }
  return root;
}

const BLOCK = new Set(["bigq", "seq", "premises", "stroop", "arrowbig", "steps-list"]);
const isBlock = n => typeof n !== "string" && (n.tag === "div" || n.tag === "ol" || n.cls.some(c => BLOCK.has(c)));
const textOf = n => typeof n === "string" ? n : n.children.map(textOf).join("");

function inlineStyle(n) {
  const s = {};
  if (n.tag === "b" || n.tag === "strong") s.fontFamily = F.body7;
  if (n.tag === "em" || n.tag === "i") s.fontStyle = "italic";
  if (n.cls.includes("num")) s.fontFamily = F.mono;
  if (n.cls.includes("muted")) s.color = C.ink2;
  if (n.cls.includes("small")) s.fontSize = 13;
  if (n.cls.includes("claim")) Object.assign(s, { fontFamily: F.display7, fontSize: 24, lineHeight: 31 });
  if (n.cls.includes("fit-w")) Object.assign(s, { fontFamily: F.display7, fontSize: 40, lineHeight: 44 });
  if (n.color) s.color = n.color;
  return s;
}
function Inline({ nodes, base }) {
  const render = (n, k) => typeof n === "string" ? n : <Text key={k} style={inlineStyle(n)}>{n.children.map(render)}</Text>;
  return <Text style={base}>{nodes.map(render)}</Text>;
}

function Block({ n, base, accent }) {
  const c = n.cls;
  if (c.includes("bigq")) return <Text style={{ fontFamily: F.mono7, fontSize: 34, color: C.ink, textAlign: "center", paddingVertical: 10 }}>{textOf(n)}</Text>;
  if (c.includes("stroop")) return <Text style={{ fontFamily: F.display7, fontSize: 52, textAlign: "center", paddingVertical: 8, color: n.color || C.ink }}>{textOf(n)}</Text>;
  if (c.includes("arrowbig")) return <Text style={{ fontSize: 64, lineHeight: 72, textAlign: "center", color: C.ink }}>{textOf(n)}</Text>;
  if (c.includes("seq")) return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, paddingVertical: 8 }}>
      {n.children.filter(x => typeof x !== "string").map((x, i) => {
        const gap = x.cls.includes("gap");
        return <View key={i} style={{ minWidth: 48, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, backgroundColor: gap ? accent[1] : C.surface2 }}>
          <Text style={{ fontFamily: F.mono7, fontSize: 22, textAlign: "center", color: gap ? accent[0] : C.ink }}>{textOf(x)}</Text></View>;
      })}
    </View>);
  if (c.includes("premises")) return (
    <View style={{ gap: 6, padding: 14, borderRadius: 14, backgroundColor: C.surface2 }}>
      {n.children.filter(x => typeof x !== "string").map((x, i) => x.cls.includes("conc")
        ? <Text key={i} style={{ fontFamily: F.body7, fontSize: 17, color: C.ink, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, marginTop: 2 }}>{textOf(x)}</Text>
        : <Text key={i} style={{ fontFamily: F.body5, fontSize: 17, color: C.ink }}>{textOf(x)}</Text>)}
    </View>);
  if (n.tag === "ol") return (
    <View style={{ gap: 4, paddingLeft: 4 }}>
      {n.children.filter(x => typeof x !== "string").map((x, i) => <Text key={i} style={{ fontFamily: F.body5, fontSize: 16, color: C.ink }}>{i + 1}.  {textOf(x)}</Text>)}
    </View>);
  return <Rich html={null} nodes={n.children} style={base} accent={accent} />;
}

/* style = base text style; accent = [colour, soft] used by sequence gaps */
export function Rich({ html, nodes, style, accent = [C.accent, C.accentSoft] }) {
  const list = nodes || parse(html).children;
  if (!list.some(isBlock)) return <Inline nodes={list} base={style} />;
  const out = []; let run = [];
  const flush = () => { if (run.some(x => typeof x !== "string" || x.trim())) out.push(<Inline key={"i" + out.length} nodes={run} base={style} />); run = []; };
  list.forEach(n => { if (isBlock(n)) { flush(); out.push(<Block key={"b" + out.length} n={n} base={style} accent={accent} />); } else run.push(n); });
  flush();
  return <View style={{ gap: 6 }}>{out}</View>;
}
export const plain = html => textOf(parse(html));
