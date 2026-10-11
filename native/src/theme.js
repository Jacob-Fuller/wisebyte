/* Design tokens, matching the web app's single dark theme */
export const C = {
  ground: "#141210", surface: "#1D1A16", surface2: "#24201B", line: "#353029",
  ink: "#F3EEE6", ink2: "#A59D91", muted: "#7D766C",
  accent: "#C08F5C", accentInk: "#1A140D", accentSoft: "#3A2C1D",
  spark: "#E09A5C", sparkSoft: "#3A2717",
  good: "#8DB57F", goodSoft: "#232B1D",
  bad: "#D98272", badSoft: "#3A1D1A",
  gold: "#D9BB6E", goldSoft: "#352C15",
};
/* pillar colours (and their soft backgrounds) */
export const PC = {
  learn: ["#C08F5C", "#3A2C1D"], remember: ["#8FB9A2", "#1D2D25"], think: ["#9DB3D2", "#1E2733"], test: ["#E08A80", "#3A1D1A"],
  practical: ["#D9BB6E", "#352C15"], expression: ["#C99BCB", "#33232F"],
};
PC.knowledge = PC.learn; PC.vocabulary = PC.remember; PC.cognition = PC.think;

/* fonts: names are the keys passed to useFonts in App.js */
export const F = {
  display: "Cormorant-600", display5: "Cormorant-500", display7: "Cormorant-700",
  italic: "CormorantItalic-500", italic6: "CormorantItalic-600",
  body: "Figtree-400", body5: "Figtree-500", body6: "Figtree-600", body7: "Figtree-700", body8: "Figtree-800",
  mono: "Mono-400", mono7: "Mono-700", greek: "Greek",
};

/* mix two hex colours: t = share of a */
export function mix(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return "#" + x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, "0")).join("");
}
export const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, "0");
