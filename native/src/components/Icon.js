import React from "react";
import Svg, { Path, Circle, Rect, Line, Defs, Mask, G } from "react-native-svg";
import BASE from "../data/icons.json";

/* audio icons (from Wisebyte - Go); kept here so regenerating icons.json never drops them */
const st = (sw, els) => ({ fill: false, sw, els }), fl = els => ({ fill: true, sw: 0, els });
const ICONS = {
  ...BASE,
  headphones: st(1.8, [["path", { d: "M3 18v-3a9 9 0 0 1 18 0v3" }], ["rect", { x: "3", y: "15", width: "4", height: "6", rx: "1.5" }], ["rect", { x: "17", y: "15", width: "4", height: "6", rx: "1.5" }]]),
  playf: fl([["path", { d: "M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" }]]),
  pausef: fl([["rect", { x: "6", y: "5", width: "4.2", height: "14", rx: "1.2" }], ["rect", { x: "13.8", y: "5", width: "4.2", height: "14", rx: "1.2" }]]),
  back15: st(1.6, [["path", { d: "M4 12a8 8 0 1 0 2.5-5.8" }], ["path", { d: "M4 4v4h4" }]]),
  fwd30: st(1.6, [["path", { d: "M20 12a8 8 0 1 1-2.5-5.8" }], ["path", { d: "M20 4v4h-4" }]]),
  nextf: fl([["path", { d: "M5 6.2v11.6a.9.9 0 0 0 1.4.75L15 12.75a.9.9 0 0 0 0-1.5L6.4 5.45A.9.9 0 0 0 5 6.2z" }], ["rect", { x: "16.5", y: "5", width: "2.6", height: "14", rx: "1" }]]),
  prevf: fl([["path", { d: "M19 6.2v11.6a.9.9 0 0 1-1.4.75L9 12.75a.9.9 0 0 1 0-1.5l8.6-5.8A.9.9 0 0 1 19 6.2z" }], ["rect", { x: "4.9", y: "5", width: "2.6", height: "14", rx: "1" }]]),
  down: st(2.2, [["path", { d: "M6 9l6 6 6-6" }]]),
  car: st(1.8, [["path", { d: "M3.5 16.5v-4l2.2-5.5h12.6l2.2 5.5v4z" }], ["path", { d: "M3.5 12.5h17" }], ["circle", { cx: "7.5", cy: "18", r: "1.8" }], ["circle", { cx: "16.5", cy: "18", r: "1.8" }]]),
  text: st(1.9, [["path", { d: "M5 6h14M5 10h14M5 14h10M5 18h7" }]]),
  dl: st(1.9, [["path", { d: "M12 4v11" }], ["path", { d: "m7 10 5 5 5-5" }], ["path", { d: "M5 20h14" }]]),
  saved: st(2, [["circle", { cx: "12", cy: "12", r: "9" }], ["path", { d: "m8 12.5 2.7 2.7L16 9.8" }]]),
  clock: st(2, [["circle", { cx: "12", cy: "12", r: "9" }], ["path", { d: "M12 7v5l3 2" }]]),
};

const TAGS = { path: Path, circle: Circle, rect: Rect, line: Line };
const NUM = new Set(["cx", "cy", "r", "x", "y", "width", "height", "rx", "x1", "y1", "x2", "y2"]);

export function Icon({ name, size = 20, color = "#fff", style }) {
  const ic = ICONS[name]; if (!ic) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {ic.els.map(([tag, attrs], i) => {
        const T = TAGS[tag]; if (!T) return null;
        const p = {};
        for (const [k, v] of Object.entries(attrs)) p[k] = NUM.has(k) ? parseFloat(v) : v;
        const own = attrs.fill === "currentColor";
        return <T key={i} {...p}
          fill={ic.fill || own ? color : "none"}
          stroke={ic.fill ? "none" : color} strokeWidth={ic.sw} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </Svg>
  );
}

/* the Wisebyte mark: a circle with a bite taken out */
export function Logo({ size = 28, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <Mask id="bite" x="0" y="0" width="32" height="32" maskUnits="userSpaceOnUse">
          <Rect width="32" height="32" fill="#fff" />
          <Circle cx="27.5" cy="6.5" r="5.5" fill="#000" />
          <Circle cx="31" cy="14" r="4" fill="#000" />
        </Mask>
      </Defs>
      <G mask="url(#bite)"><Circle cx="15" cy="17" r="14" fill={color} /></G>
    </Svg>
  );
}
