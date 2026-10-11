import React from "react";
import { useWindowDimensions } from "react-native";
import Svg, { Path, Rect, Circle, Line, G, Text as SvgText } from "react-native-svg";
import { C, F, PC, mix, alpha } from "../theme";

const TOP = 96, BOT = 256;

function Column({ x, i, all, onPress }) {
  const cx = 36 + 72 * i, c = PC[x.p][0];
  const shape = (fill, stroke, sw, dash) => {
    const p = { fill, stroke, strokeWidth: sw, strokeDasharray: dash };
    return (
      <>
        <Path d={`M${cx - 14} ${TOP + 16} L${cx + 14} ${TOP + 16} L${cx + 17} ${BOT - 12} L${cx - 17} ${BOT - 12} Z`} {...p} />
        <Rect x={cx - 25} y={TOP} width={50} height={7} rx={1} {...p} />
        <Rect x={cx - 19} y={TOP + 7} width={38} height={9} rx={2} {...p} />
        <Circle cx={cx - 19} cy={TOP + 11.5} r={5} {...p} />
        <Circle cx={cx + 19} cy={TOP + 11.5} r={5} {...p} />
        <Rect x={cx - 21} y={BOT - 12} width={42} height={6} rx={2} {...p} />
        <Rect x={cx - 24} y={BOT - 6} width={48} height={6} rx={1} {...p} />
      </>
    );
  };
  const flutes = (stroke, dash) => [-8, -3, 3, 8].map(o => <Line key={o} x1={cx + o} y1={TOP + 22} x2={cx + o * 1.2} y2={BOT - 18} stroke={stroke} strokeWidth={1.2} strokeDasharray={dash} />);
  const gkColor = all ? C.gold : x.done ? c : C.ink2;
  return (
    <G onPress={onPress}>
      <Rect x={cx - 34} y={62} width={68} height={BOT - 62 + 48} fill="rgba(0,0,0,0.001)" />
      <SvgText x={cx} y={81} textAnchor="middle" fontFamily={F.display7} fontSize={10.5} letterSpacing={0.8} fill={gkColor}>{x.gk.toUpperCase()}</SvgText>
      {shape(mix(c, C.surface, 0.07), mix(c, C.line, 0.55), 1.4, "4 3")}
      {x.done ? <>{shape(c, mix(c, "#000000", 0.7), 1)}{flutes(alpha("#ffffff", 0.35))}</> : flutes(alpha(c, 0.25), "3 4")}
      <SvgText x={cx} y={BOT + 38} textAnchor="middle" fontFamily={F.body7} fontSize={11} fill={x.done ? C.ink : C.ink2}>{x.name}</SvgText>
    </G>
  );
}

export default function Temple({ items, onPick }) {
  const { width } = useWindowDimensions();
  const w = Math.min(width, 520) - 32, h = w * 304 / 360;
  const n = items.filter(x => x.done).length, all = n === 5;
  const ped = all ? { fill: C.goldSoft, stroke: C.gold } : { fill: C.surface, stroke: C.line };
  return (
    <Svg width={w} height={h} viewBox="0 0 360 304">
      <Path d="M10 64 L180 14 L350 64 Z" {...ped} strokeWidth={1.5} />
      <Path d="M34 58 L180 25 L326 58 Z" fill={all ? mix(C.gold, C.goldSoft, 0.22) : C.surface2} />
      <SvgText x={180} y={52} textAnchor="middle" fontFamily={F.display7} fontSize={15} letterSpacing={1.8} fill={all ? C.gold : C.ink2}>{(["I", "II", "III", "IV", "V"][n - 1] || "–") + " · V"}</SvgText>
      <Rect x={4} y={64} width={352} height={24} rx={1} {...ped} strokeWidth={1.5} />
      <Rect x={10} y={88} width={340} height={5} {...ped} strokeWidth={1.5} />
      {items.map((x, i) => <Column key={x.p} x={x} i={i} all={all} onPress={() => onPick(x)} />)}
      <Rect x={8} y={256} width={344} height={7} fill={C.surface} stroke={C.line} strokeWidth={1.5} />
      <Rect x={3} y={263} width={354} height={7} fill={C.surface} stroke={C.line} strokeWidth={1.5} />
      <Rect x={0} y={270} width={360} height={7} fill={C.surface} stroke={C.line} strokeWidth={1.5} />
    </Svg>
  );
}
