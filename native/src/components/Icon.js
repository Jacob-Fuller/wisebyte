import React from "react";
import Svg, { Path, Circle, Rect, Line, Defs, Mask, G } from "react-native-svg";
import ICONS from "../data/icons.json";

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
