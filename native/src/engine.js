/* =========================================================
   WISEBYTE ENGINE — the web app's rules, progress logic, question
   builders and session player, ported unchanged in behaviour.
   Question prompts/options/explanations are small HTML strings
   (as on the web); <Rich> renders them natively.
   ========================================================= */
import WBdata from "./data/wb.json";
import * as Store from "./storage";
import { ui, changed, toast } from "./bus";
import { esc, rand, pick, shuffle, hashStr, today, addDays, daysBetween, plural, ago, fmt } from "./util";

export const WB = WBdata;
export const QUOTES = WB.QUOTES;

/* ============ 1. RULES ============ */
export const RULES = {
  intervals: [1, 3, 7, 14, 30, 60],
  masteredBox: 3,
  levelMult: { beginner: 1, intermediate: 1.25, advanced: 1.5 },
  xp: {
    lessonCorrect: 10, lessonComplete: 20, perfect: 25, retryRight: 3, replayFactor: 0.5,
    wordLearn: 15, wordExercise: 5, wordAdd: 2,
    quizCorrect: 3, quizPerfect: 20,
    challengePoint: 2, beatYesterday: 15,
    recallRight: 5, reviewRight: 3,
    dailyComplete: 50, quoteRead: 10, quoteRight: 5, masteryCorrect: 5, mastery: 100,
    masteryPass: 8,
  },
  goldenChance: 1 / 8,
  maxFreezes: 2, freezeEvery: 7,
};
export const PROFILES = { adult: { name: "You", ranks: [[1, "Novice"], [5, "Apprentice"], [10, "Scholar"], [15, "Expert"], [20, "Sage"], [30, "Polymath"]] } };
export const LEVELS = { beginner: { name: "Beginner", n: 1 }, intermediate: { name: "Intermediate", n: 2 }, advanced: { name: "Advanced", n: 3 } };

export const ACTIVITIES = [
  { id: "maths", pillar: "think", skill: "Mental maths", name: "Mental maths", desc: "Solve as many as you can in 60 seconds.", icon: "calc", timed: 60, gen: () => genMaths() },
  { id: "pattern", pillar: "think", skill: "Pattern recognition", name: "Find the missing number", desc: "Crack the pattern. You have 60 seconds.", icon: "grid", timed: 60, gen: () => genPattern() },
  { id: "memory", pillar: "think", skill: "Memory", name: "Number memory", desc: "Memorise a number, then pick it out.", icon: "brain", count: 8, build: () => buildMemory() },
  { id: "logic", pillar: "think", skill: "Logic", name: "Does it follow?", desc: "Decide whether each conclusion is logically valid.", icon: "scale", count: 8, gen: () => genLogic() },
  { id: "stroop", pillar: "think", skill: "Attention", name: "Colour clash", desc: "Name the ink colour, not the word. 45 seconds.", icon: "eye", timed: 45, gen: () => genStroop() },
  { id: "spatial", pillar: "think", skill: "Spatial reasoning", name: "Turn it around", desc: "Rotate and flip the arrow in your head.", icon: "rotate", count: 8, gen: () => genSpatial() },
  { id: "puzzles", pillar: "think", skill: "Problem solving", name: "Brain teasers", desc: "Classic puzzles that trip up fast thinking.", icon: "bulb", count: 5, build: () => bankSteps(WB.PUZZLES, 5, "puzzle") },
  { id: "critical", pillar: "think", skill: "Critical thinking", name: "Think it through", desc: "Real-world scenarios. What can you actually conclude?", icon: "scale", count: 5, build: () => bankSteps(WB.SCENARIOS, 5, "scenario") },
  { id: "anagram", pillar: "think", skill: "Verbal fluency", name: "Anagrams", desc: "Unscramble the word. 60 seconds.", icon: "shuffle", timed: 60, gen: () => genAnagram() },
  { id: "compare", pillar: "think", skill: "Numeracy", name: "Bigger or smaller?", desc: "Fractions, decimals and percentages. Pick the bigger one, fast.", icon: "gauge", timed: 60, gen: () => genCompare() },
  { id: "letters", pillar: "think", skill: "Verbal reasoning", name: "Letter patterns", desc: "Find the next letter in the sequence.", icon: "stack", count: 8, gen: () => genLetters() },
  { id: "clock", pillar: "think", skill: "Working memory", name: "Time travel", desc: "Add and subtract time in your head.", icon: "hourglass", count: 8, gen: () => genClock() },
  { id: "gk", pillar: "test", name: "10 questions a day", desc: "General knowledge from 13 categories.", icon: "globe", count: 10, build: o => buildGK(o) },
  { id: "fob", pillar: "test", name: "Fact or Fiction?", desc: "Popular claims. True, or total myth?", icon: "flag", count: 10, build: () => buildFOB() },
  { id: "timeline", pillar: "test", name: "Which came first?", desc: "Two moments in history. Pick the one that happened first.", icon: "hourglass", count: 10, build: () => buildTimeline() },
  { id: "capitals", pillar: "test", name: "Capital cities", desc: "Learn five capitals, then test yourself.", icon: "globe", count: 5, build: () => buildCapitals() },
  { id: "memwords", pillar: "test", name: "Memorise five words", desc: "Study five words and meanings, then recall them.", icon: "pen", count: 5, build: () => buildMemWords() },
  { id: "speed", pillar: "test", name: "60-second vocab", desc: "Match words to meanings, fast.", icon: "timer", timed: 60, gen: () => ({ t: "q", q: qMeaning(pick(allWords())) }) },
  { id: "tf", pillar: "test", name: "True or false speed round", desc: "Is that the right meaning? 60 seconds.", icon: "bolt", timed: 60, gen: () => ({ t: "q", q: qTF(pick(allWords())) }) },
  { id: "def", pillar: "test", name: "Guess the definition", desc: "Pick the right meaning for each word.", icon: "book", count: 10, gen: () => ({ t: "q", q: qMeaning(pick(allWords())) }) },
  { id: "word", pillar: "test", name: "Guess the word", desc: "Read the meaning, find the word.", icon: "search", count: 10, gen: () => ({ t: "q", q: qFromDef(pick(allWords())) }) },
  { id: "odd", pillar: "test", name: "Which word doesn't belong?", desc: "Spot the odd one out.", icon: "shuffle", count: 8, gen: () => ({ t: "q", q: qOdd(pick(allWords().filter(canOdd))) }) },
  { id: "opposites", pillar: "test", name: "Opposites", desc: "Pick the word that means the opposite.", icon: "opp", count: 10, gen: () => ({ t: "q", q: qOpp(pick(allWords().filter(canOpp))) }) },
  { id: "blank", pillar: "test", name: "Complete the sentence", desc: "Fill the gap with the right word.", icon: "pen", count: 10, gen: () => ({ t: "q", q: qBlank(pick(allWords())) }) },
  { id: "facts", pillar: "test", name: "Lesson quiz", desc: "10 questions from across the lesson library.", icon: "brain", count: 10, gen: () => { const l = pick(lessons()); return { t: "q", q: qLesson(l, rand(l.quiz.length), `From <b>${esc(l.title)}</b>`) }; } },
];
export const actName = a => a.name;
export const activeActs = () => ACTIVITIES;
export const actById = id => ACTIVITIES.find(a => a.id === id);

/* ---- generators ---- */
function nearNums(ans, n = 3) { const set = new Set([ans]); for (const d of shuffle([1, -1, 2, -2, 10, -10, 3, -3, 5, -5, 4, -4])) { if (set.size > n) break; if (ans + d >= 0) set.add(ans + d); } return shuffle([...set]); }
function numQ(prompt, ans, explain, sub) { const o = nearNums(ans); return { prompt, sub, options: o.map(String), answer: o.indexOf(ans), explain }; }
function genMaths() {
  const op = pick(["+", "−", "×", "÷"]);
  let a, b, ans;
  if (op === "+") { a = rand(90) + 10; b = rand(90) + 10; ans = a + b; }
  else if (op === "−") { a = rand(90) + 20; b = rand(a - 1) + 1; ans = a - b; }
  else if (op === "×") { a = rand(11) + 2; b = rand(11) + 2; ans = a * b; }
  else { b = rand(11) + 2; ans = rand(11) + 2; a = b * ans; }
  return { t: "q", q: numQ(`<span class="bigq">${a} ${op} ${b}</span>`, ans, `${a} ${op} ${b} = ${ans}`) };
}
function genPattern() {
  const type = pick(["arith", "double", "triple", "square", "alt", "fib", "tri"]);
  let seq = [], rule = "";
  if (type === "arith") { const a = rand(9) + 1, d = rand(12) + 2; for (let i = 0; i < 6; i++) seq.push(a + i * d); rule = `Add ${d} each time.`; }
  if (type === "double") { const a = rand(4) + 1; for (let i = 0; i < 6; i++) seq.push(a * 2 ** i); rule = "Double each time."; }
  if (type === "triple") { const a = rand(3) + 1; for (let i = 0; i < 5; i++) seq.push(a * 3 ** i); rule = "Multiply by 3 each time."; }
  if (type === "square") { const n = rand(4) + 1; for (let i = 0; i < 6; i++) seq.push((n + i) ** 2); rule = "Square numbers."; }
  if (type === "alt") { const x = rand(6) + 2; let y = rand(6) + 2; if (y === x) y = x === 7 ? 2 : x + 1; seq.push(rand(9) + 1); for (let i = 1; i < 7; i++) seq.push(seq[i - 1] + (i % 2 ? x : y)); rule = `Alternately add ${x} and ${y}.`; }
  if (type === "fib") { const a = rand(3) + 1; seq = [a, a + rand(3) + 1]; for (let i = 2; i < 7; i++) seq.push(seq[i - 1] + seq[i - 2]); rule = "Each number is the sum of the two before it."; }
  if (type === "tri") { for (let n = 1; n <= 7; n++) seq.push(n * (n + 1) / 2); rule = "The gaps grow by 1 each time (triangular numbers)."; }
  const h = rand(seq.length - 2) + 2, ans = seq[h];
  return { t: "q", q: numQ(`<span class="seq">${seq.map((v, i) => i === h ? '<span class="gap">?</span>' : `<span>${v}</span>`).join("")}</span>`, ans, rule, "Find the missing number") };
}
function buildMemory() {
  const lens = [4, 5, 5, 6, 6, 7, 7, 8];
  return lens.flatMap((n, i) => {
    let d = ""; for (let k = 0; k < n; k++) d += k === 0 ? rand(9) + 1 : rand(10);
    const opts = new Set([d]);
    for (let g = 0; opts.size < 4 && g < 40; g++) {
      const arr = d.split(""); const j = rand(n - 1);
      if (g % 2) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; else arr[j + (rand(2))] = String((+arr[j] + 1 + rand(8)) % 10);
      if (arr[0] !== "0") opts.add(arr.join(""));
    }
    const o = shuffle([...opts]);
    return [{ t: "mem-show", seq: d, head: `Round ${i + 1} of ${lens.length}` }, { t: "q", q: { prompt: "Which number did you see?", options: o, answer: o.indexOf(d), big: n <= 6, explain: `It was ${d}.` }, head: `Round ${i + 1} of ${lens.length}` }];
  });
}
const NONSENSE = ["bloops", "razzies", "wugs", "zorbs", "flims", "gleeps", "tovs", "snarks", "quibs", "drents"];
const LOGIC = [
  { p: ["All {A} are {B}.", "All {B} are {C}."], c: "All {A} are {C}.", v: true, e: "All {A} are {B}, and all {B} are {C}, so all {A} must be {C}." },
  { p: ["All {A} are {B}.", "Some {B} are {C}."], c: "Some {A} are {C}.", v: false, e: "The {B} that are {C} might not include any {A}." },
  { p: ["No {A} are {B}.", "All {C} are {A}."], c: "No {C} are {B}.", v: true, e: "All {C} are {A}, and no {A} are {B}, so no {C} can be {B}." },
  { p: ["All {A} are {B}.", "Sam is one of the {A}."], c: "Sam is one of the {B}.", v: true, e: "Sam is one of the {A}, and all {A} are {B}." },
  { p: ["All {A} are {B}.", "Sam is one of the {B}."], c: "Sam is one of the {A}.", v: false, e: "There may be {B} that aren't {A}. Sam could be one of them." },
  { p: ["Some {A} are {B}.", "All {B} are {C}."], c: "Some {A} are {C}.", v: true, e: "The {A} that are {B} must also be {C}." },
  { p: ["If something is one of the {A}, it glows.", "This thing glows."], c: "This thing is one of the {A}.", v: false, e: "Other things might glow too. This mistake is called affirming the consequent." },
  { p: ["If something is one of the {A}, it glows.", "This thing doesn't glow."], c: "This thing isn't one of the {A}.", v: true, e: "All {A} glow, so something that doesn't glow can't be one of them." },
  { p: ["No {A} are {B}.", "Some {C} are {A}."], c: "Some {C} are not {B}.", v: true, e: "The {C} that are {A} can't be {B}." },
  { p: ["Some {A} are {B}.", "Some {B} are {C}."], c: "Some {A} are {C}.", v: false, e: "The two 'some' groups might not overlap at all." },
];
function genLogic() {
  const t = pick(LOGIC), [A, B, C] = shuffle(NONSENSE); const f = x => x.split("{A}").join(A).split("{B}").join(B).split("{C}").join(C);
  return { t: "q", q: { prompt: `<div class="premises">${t.p.map(x => `<span>${f(x)}</span>`).join("")}<span class="conc">So: ${f(t.c)}</span></div>`, sub: "Does the conclusion definitely follow?", options: ["Yes", "No"], answer: t.v ? 0 : 1, explain: (t.v ? "It follows. " : "It doesn't follow. ") + f(t.e) } };
}
const COLOURS = [["Red", "#E5484D"], ["Blue", "#3E63DD"], ["Green", "#2F9E5B"], ["Orange", "#F76B15"], ["Purple", "#8E4EC6"]];
function genStroop() {
  const [word] = pick(COLOURS); let ink = pick(COLOURS);
  if (Math.random() < 0.75) while (ink[0] === word) ink = pick(COLOURS);
  const others = shuffle(COLOURS.map(c => c[0]).filter(n => n !== ink[0] && n !== word)).slice(0, word === ink[0] ? 3 : 2);
  const o = shuffle([ink[0], ...(word === ink[0] ? [] : [word]), ...others]);
  return { t: "q", q: { prompt: `<span class="stroop" style="color:${ink[1]}">${word.toUpperCase()}</span>`, sub: "What colour is the ink?", options: o, answer: o.indexOf(ink[0]) } };
}
const ARROWS = ["↑", "→", "↓", "←"];
const MOVES = [
  { t: "Rotate 90° clockwise", f: d => (d + 1) % 4 }, { t: "Rotate 90° anticlockwise", f: d => (d + 3) % 4 }, { t: "Rotate 180°", f: d => (d + 2) % 4 },
  { t: "Mirror it left-to-right", f: d => d === 1 ? 3 : d === 3 ? 1 : d }, { t: "Flip it upside down", f: d => d === 0 ? 2 : d === 2 ? 0 : d },
];
function genSpatial() {
  const start = rand(4), n = 2 + (Math.random() < 0.35 ? 1 : 0), moves = Array.from({ length: n }, () => pick(MOVES));
  const end = moves.reduce((d, m) => m.f(d), start);
  return { t: "q", q: { prompt: `<span class="arrowbig">${ARROWS[start]}</span><ol class="steps-list">${moves.map(m => `<li>${m.t}</li>`).join("")}</ol>`, sub: "Which way does the arrow point now?", options: ARROWS.slice(), answer: end, big: true, explain: `It ends up pointing ${["up", "right", "down", "left"][end]}.` } };
}
const sortedLetters = w => w.split("").sort().join("");
function genAnagram() {
  const pool = allWords().filter(e => /^[a-z]{5,8}$/.test(e.w));
  const e = pick(pool), key = sortedLetters(e.w);
  let sc = e.w; for (let g = 0; sc === e.w && g < 20; g++) sc = shuffle(e.w.split("")).join("");
  const others = pool.filter(x => x.w !== e.w && sortedLetters(x.w) !== key);
  const same = others.filter(x => x.w.length === e.w.length);
  const m = mcOptions(e.w, (same.length >= 3 ? same : others).map(x => x.w));
  return { t: "q", q: { prompt: `<span class="bigq">${esc(sc.toUpperCase())}</span>`, sub: "Unscramble the word", options: m.options.map(esc), answer: m.answer, explain: `${esc(e.w)}: ${esc(e.def)}` } };
}
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function cmpTerm(kind) {
  if (kind === "frac") { const b = rand(11) + 2; let a = rand(b - 1) + 1; while (gcd(a, b) > 1) a = rand(b - 1) + 1; return { label: `${a}/${b}`, v: a / b }; }
  if (kind === "dec") { const v = (rand(19) + 1) / 20; return { label: String(v), v }; }
  if (kind === "pct") { const p = (rand(19) + 1) * 5; return { label: `${p}%`, v: p / 100 }; }
  if (kind === "pctof") { const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), n = pick([20, 40, 60, 80, 120, 150, 200, 240, 300]); return { label: `${p}% of ${n}`, v: p * n / 100 }; }
  const b = pick([2, 3, 4, 5, 6, 8, 10]); let a = rand(b - 1) + 1; while (gcd(a, b) > 1) a = rand(b - 1) + 1; const n = b * (rand(12) + 2); return { label: `${a}/${b} of ${n}`, v: a * n / b };
}
function genCompare() {
  const abs = Math.random() < 0.45;
  let x, y;
  for (let g = 0; g < 50; g++) {
    x = cmpTerm(abs ? pick(["pctof", "fracof"]) : pick(["frac", "dec", "pct"]));
    y = cmpTerm(abs ? pick(["pctof", "fracof"]) : pick(["frac", "dec", "pct"]));
    const d = Math.abs(x.v - y.v);
    if (d > 1e-9 && d / Math.max(x.v, y.v) < 0.35 && x.label !== y.label) break;
  }
  const big = x.v > y.v ? 0 : 1, f = v => +v.toFixed(3);
  return { t: "q", q: { prompt: `<span class="bigq">Which is bigger?</span>`, options: [x.label, y.label], answer: big, explain: `${x.label} = ${f(x.v)} and ${y.label} = ${f(y.v)}.` } };
}
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function genLetters() {
  const type = pick(["step", "step", "back", "alt", "grow"]);
  let seq = [], rule = "";
  for (let g = 0; g < 50; g++) {
    seq = []; let i;
    if (type === "step") { const k = rand(4) + 1; i = rand(26 - 5 * k); for (let n = 0; n < 6; n++) seq.push(i + n * k); rule = `Move forward ${k} letter${k > 1 ? "s" : ""} each time.`; }
    if (type === "back") { const k = rand(3) + 1; i = 25 - rand(26 - 5 * k); for (let n = 0; n < 6; n++) seq.push(i - n * k); rule = `Move back ${k} letter${k > 1 ? "s" : ""} each time.`; }
    if (type === "alt") { const a = rand(3) + 1; let b = rand(3) + 2; if (b === a) b++; i = rand(7); seq.push(i); for (let n = 1; n < 6; n++) seq.push(seq[n - 1] + (n % 2 ? a : b)); rule = `Alternately move forward ${a} and ${b}.`; }
    if (type === "grow") { i = rand(6); seq.push(i); for (let n = 1; n < 6; n++) seq.push(seq[n - 1] + n); rule = "The gap grows by one each time: +1, +2, +3, +4, +5."; }
    if (seq.every(v => v >= 0 && v < 26)) break;
  }
  const ans = seq.pop(), right = ABC[ans];
  const near = shuffle([1, -1, 2, -2, 3, -3].map(d => ans + d).filter(v => v >= 0 && v < 26)).slice(0, 3).map(v => ABC[v]);
  const o = shuffle([right, ...near]);
  return { t: "q", q: { prompt: `<span class="seq">${seq.map(v => `<span>${ABC[v]}</span>`).join("")}<span class="gap">?</span></span>`, sub: "Which letter comes next?", options: o, answer: o.indexOf(right), big: true, explain: rule } };
}
const clockStr = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${(h % 12) || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };
function genClock() {
  const start = (rand(24) * 60) + rand(12) * 5, dh = rand(5), dm = (rand(11) + 1) * 5, back = Math.random() < 0.35;
  const delta = dh * 60 + dm, end = back ? start - delta : start + delta;
  const ds = `${dh ? dh + " h " : ""}${dm} min`;
  const wrong = new Set([clockStr(end)]);
  for (const w of shuffle([end + 60, end - 60, end + 10, end - 10, end + 720, back ? start + delta : start - delta])) { if (wrong.size >= 4) break; wrong.add(clockStr(w)); }
  const o = shuffle([...wrong]), right = clockStr(end);
  return { t: "q", q: { prompt: `<span class="bigq">${clockStr(start)}</span>`, sub: `What time is it ${ds} ${back ? "earlier" : "later"}?`, options: o, answer: o.indexOf(right), explain: `${ds} ${back ? "before" : "after"} ${clockStr(start)} is ${right}.` } };
}
function mcq(item, head) { const o = shuffle(item.o.map((t, i) => ({ t, i }))); return { t: "q", head, q: { prompt: esc(item.q), options: o.map(x => esc(x.t)), answer: o.findIndex(x => x.i === item.a), explain: esc(item.e) } }; }
function bankSteps(bank, n, kind) {
  return shuffle(bank).slice(0, n).map((x, i) => mcq(x, `${kind === "scenario" ? x.topic : "Brain teaser"} · ${i + 1} of ${Math.min(n, bank.length)}`));
}
function buildGK(o = {}) {
  let pool = WB.GK;
  if (o.cat) pool = pool.filter(x => x.cat === o.cat);
  const list = o.cat ? shuffle(pool).slice(0, 10) : pool.slice().sort((a, b) => hashStr(today() + a.q) - hashStr(today() + b.q)).slice(0, 10);
  return list.map((x, i) => mcq(x, `${WB.GK_CATS[x.cat]} · ${i + 1} of ${list.length}`));
}
function buildFOB() {
  const pool = WB.CLAIMS, labels = ["Fact", "Fiction"];
  return shuffle(pool).slice(0, 10).map((x, i) => ({ t: "q", head: `${actName(actById("fob"))} · ${i + 1} of ${Math.min(10, pool.length)}`,
    q: { prompt: `<span class="claim">“${esc(x.c)}”</span>`, options: labels, answer: x.t ? 0 : 1, explain: esc(x.e), verdict: x.t ? "It's a fact." : `It's ${labels[1].toLowerCase()}.` } }));
}
function buildCapitals() {
  const five = shuffle(WB.CAPITALS).slice(0, 5), caps = WB.CAPITALS.map(c => c[1]);
  return [{ t: "learn-list", title: "Learn these five capitals", pairs: five }, ...shuffle(five).map(([c, cap], i) => { const m = mcOptions(cap, caps); return { t: "q", head: `Capital cities · ${i + 1} of 5`, q: { prompt: `What is the capital of <b>${esc(c)}</b>?`, options: m.options.map(esc), answer: m.answer, explain: `${esc(cap)} is the capital of ${esc(c)}.` } }; })];
}
const yearStr = x => (x.c ? "c. " : "") + (x.y < 0 ? Math.abs(x.y) + " BC" : x.y < 1000 ? "AD " + x.y : String(x.y));
function timelineGap(a, b) { const old = Math.min(a.y, b.y); return old < 0 ? 300 : old < 1000 ? 100 : old < 1500 ? 50 : old < 1800 ? 15 : 8; }
function buildTimeline() {
  const ev = shuffle(WB.EVENTS || []), used = new Set(), pairs = [];
  for (let g = 0; pairs.length < 10 && g < 400; g++) {
    const a = pick(ev), b = pick(ev);
    if (a === b || used.has(a) || used.has(b) || Math.abs(a.y - b.y) < timelineGap(a, b) || (a.c || b.c) && Math.abs(a.y - b.y) < 2 * timelineGap(a, b)) continue;
    used.add(a); used.add(b); pairs.push([a, b]);
  }
  return pairs.map(([a, b], i) => { const first = a.y < b.y ? a : b;
    return { t: "q", head: `Which came first? · ${i + 1} of ${pairs.length}`, q: { prompt: "Which happened first?", options: [esc(a.e), esc(b.e)], answer: a === first ? 0 : 1, stack: true,
      explain: `${esc(a.e)}: ${yearStr(a)}.<br>${esc(b.e)}: ${yearStr(b)}.` } }; });
}
function buildMemWords() {
  const pool = lib(), fresh = pool.filter(e => !state.words[e.w]), five = shuffle(fresh.length >= 5 ? fresh : pool).slice(0, 5);
  return [{ t: "learn-list", title: "Memorise these five words", pairs: five.map(e => [e.w, e.def]), words: true }, ...shuffle(five).map((e, i) => ({ t: "q", q: qFromDef(e), head: `Recall · ${i + 1} of 5` }))];
}
function buildActivity(a, o) {
  if (a.build) return a.build(o);
  const steps = [], seen = new Set();
  for (let g = 0; steps.length < a.count && g < 80; g++) { const s = a.gen(), key = s.q.prompt + "|" + (s.q.w || ""); if (!seen.has(key)) { seen.add(key); steps.push(s); } }
  return steps.map((s, i) => ({ ...s, head: s.head || `${actName(a)} · ${i + 1} of ${steps.length}` }));
}

/* ============ 2. STATE ============ */
const STORE_KEY = "wisebyte.v3";
const freshStats = () => ({ answered: 0, correct: 0, run: 0, bestRun: 0, perfectLessons: 0, goldens: 0, recalls: 0, recallsRight: 0,
  challenges: 0, beatYesterday: 0, dailyCompletes: 0, lookups: 0, speedBest: 0, perfectFob: 0, perfectTimeline: 0, perfectOpposites: 0, perfectCapitals: 0, perfectCritical: 0, perfectGk: 0 });
export const freshProfile = () => ({ xp: 0, streak: 0, best: 0, lastActive: null, freezes: 1, days: {}, lessons: {}, words: {}, custom: {}, ach: {}, scores: {}, vocab: null, quotes: {}, mastered: {}, inner: {}, stats: freshStats() });
export const mergeProfile = p => {
  const m = Object.assign(freshProfile(), p && typeof p === "object" ? p : {});
  for (const k of ["days", "lessons", "words", "custom", "ach", "scores", "quotes", "mastered", "inner"]) if (!m[k] || typeof m[k] !== "object" || Array.isArray(m[k])) m[k] = {};
  m.stats = Object.assign(freshStats(), (p && p.stats) || {});
  return m;
};
export let store = { active: "adult", profiles: { adult: freshProfile() } };
export let state = store.profiles.adult;
export function loadState() {
  const s = Store.get(STORE_KEY, null);
  store = s && s.profiles ? { active: "adult", profiles: { adult: mergeProfile(s.profiles.adult) }, updated: s.updated || 0 } : { active: "adult", profiles: { adult: freshProfile() } };
  state = store.profiles.adult;
  migrateQuotes();
}
/* replace the whole profile (cloud merge, reset) */
export function setProfile(p) { store.profiles.adult = state = p; save(); }
export const hooks = { onSave: null };
let saveTimer = null;
export function save() {
  store.updated = Date.now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => Store.set(STORE_KEY, store), 150);
  try { hooks.onSave && hooks.onSave(); } catch (e) {}
}
export function flushSave() { clearTimeout(saveTimer); Store.set(STORE_KEY, store); }

/* ============ 3. HELPERS ============ */
const aud = () => "adult";
export const lessons = () => WB.LESSONS.filter(l => (l.audience || "adult") === aud());
const LESSON_BY = {}; WB.LESSONS.forEach(l => { LESSON_BY[l.id] = l; });
export const lessonById = id => LESSON_BY[id];
const WORD_BY = {}; WB.WORDS.forEach(e => { if (!WORD_BY[e.w]) WORD_BY[e.w] = e; });
export const lib = () => WB.WORDS.filter(e => (e.audience || "adult") === aud());
export const entry = w => WORD_BY[w] || state.custom[w];
export const allWords = () => lib().concat(Object.values(state.custom));
export const catOf = l => WB.CATEGORIES[l.cat] || { name: l.cat, color: "#888" };
export const wcatOf = e => WB.WORD_CATS[e.cat] || WB.WORD_CATS.everyday;
export const lessonMins = l => { const w = l.sections.reduce((a, s) => a + s.b.split(/\s+/).length, 0); return Math.max(3, Math.round(w / 190 + 2)); };

export function day(k = today()) {
  return state.days[k] || (state.days[k] = { lesson: 0, word: false, quiz: false, challenge: false, know: false, practical: false, expr: false, goal: false, done: false, words: 0, challenges: 0, secs: 0, xp: 0 });
}

/* subjects */
export const SUBJ = () => WB.SUBJECTS.filter(x => x.steps.filter(lessonById).length >= 3);
export const subjectById = id => WB.SUBJECTS.find(x => x.id === id);
export const subjectsOf = lessonId => WB.SUBJECTS.filter(x => x.steps.includes(lessonId));
export function subjectProgress(x) {
  const ls = x.steps.filter(lessonById), done = ls.filter(id => state.lessons[id]).length;
  return { done, total: ls.length, mins: ls.reduce((a, id) => a + lessonMins(lessonById(id)), 0), next: ls.find(id => !state.lessons[id]), mastered: state.mastered[x.id] };
}
WB.LESSONS.forEach(l => {
  if (l.related && l.related.length) return;
  const x = WB.SUBJECTS.find(y => y.steps.includes(l.id)); if (!x) { l.related = []; return; }
  const i = x.steps.indexOf(l.id); l.related = x.steps.slice(i + 1).concat(x.steps.slice(0, i)).filter(id => id !== l.id).slice(0, 2);
});

/* ============ 4. PROGRESS LOGIC ============ */
export const xpForLevel = n => 50 * (n - 1) * n;
export const level = () => { let n = 1; while (state.xp >= xpForLevel(n + 1)) n++; return n; };
export function rank(lv = level()) { const R = PROFILES[aud()].ranks; let r = R[0]; R.forEach(x => { if (lv >= x[0]) r = x; }); const next = R.find(x => x[0] > lv); return { name: r[1], next }; }

let pendingLevelUp = null;
export function addXp(n) {
  n = Math.round(n); if (n <= 0) return 0;
  const before = level();
  state.xp += n; day().xp += n;
  if (level() > before) pendingLevelUp = level();
  return n;
}
function recordAnswer(right) {
  const s = state.stats; s.answered++; if (right) s.correct++;
  s.run = right ? s.run + 1 : 0; s.bestRun = Math.max(s.bestRun, s.run);
}
export function liveStreak() {
  if (!state.lastActive) return 0;
  const gap = daysBetween(state.lastActive, today());
  if (gap <= 1) return state.streak;
  if (gap === 2 && state.freezes > 0) return state.streak;
  return 0;
}
function touchStreak() {
  const t = today(); if (state.lastActive && state.lastActive >= t) return;
  const gap = state.lastActive ? daysBetween(state.lastActive, t) : null;
  if (gap === 1) state.streak++;
  else if (gap === 2 && state.freezes > 0) { state.freezes--; state.streak++; toast("A streak freeze saved your streak"); }
  else state.streak = 1;
  state.lastActive = t; state.best = Math.max(state.best, state.streak);
  if (state.streak % RULES.freezeEvery === 0 && state.freezes < RULES.maxFreezes) { state.freezes++; toast("You earned a streak freeze"); }
}
function checkDay() {
  const d = day(), out = [];
  if (!d.goal && d.lesson > 0 && d.word) { d.goal = true; touchStreak(); out.push({ cls: "spark", icon: "flame", text: `Daily goal done · ${plural(state.streak, "day")} streak` }); }
  if (!d.done && d.know && d.word && d.practical && d.expr && d.challenge) {
    d.done = true; state.stats.dailyCompletes++; addXp(RULES.xp.dailyComplete);
    out.push({ cls: "gold", icon: "gift", text: `All five pillars complete · +${RULES.xp.dailyComplete} XP bonus` });
  }
  return out;
}
function srUpdate(rec, right) {
  if (right) { if (rec.due <= today()) { rec.box = Math.min(rec.box + 1, RULES.intervals.length - 1); rec.due = addDays(today(), RULES.intervals[rec.box]); } }
  else { rec.box = 0; rec.due = addDays(today(), 1); }
}
function lessonRecall(id, right) {
  const r = state.lessons[id]; if (!r) return;
  srUpdate(r, right); state.stats.recalls++; if (right) state.stats.recallsRight++;
}
export function addWord(w, source) {
  if (state.words[w]) return false;
  state.words[w] = { box: 0, due: addDays(today(), 1), addedAt: today(), right: 0, wrong: 0, lapses: 0, source };
  day().words++;
  return true;
}
function updateWord(w, right) {
  const r = state.words[w]; if (!r) return;
  if (right) r.right++; else { r.wrong++; r.lapses++; }
  srUpdate(r, right);
}
export const struggling = w => { const r = state.words[w]; return !!r && (r.lapses >= 2 || (r.wrong >= 2 && r.wrong >= r.right)); };
export const mastered = w => { const r = state.words[w]; return !!r && r.box >= RULES.masteredBox; };
export const allDueWords = () => Object.keys(state.words).filter(w => entry(w) && state.words[w].due <= today());
export const allDueLessons = () => Object.keys(state.lessons).filter(id => lessonById(id) && (lessonById(id).audience || "adult") === aud() && state.lessons[id].due <= today())
  .sort((a, b) => state.lessons[a].due.localeCompare(state.lessons[b].due));
export const REVIEW_CAP = 10;
export const reviewsLeft = () => Math.max(0, REVIEW_CAP - (day().reviewed || 0));
function reviewQueue() {
  const items = [...allDueLessons().map(id => ({ k: "l", id, due: state.lessons[id].due })), ...allDueWords().map(id => ({ k: "w", id, due: state.words[id].due }))];
  return items.sort((a, b) => a.due.localeCompare(b.due)).slice(0, reviewsLeft());
}
export const dueLessons = () => reviewQueue().filter(x => x.k === "l").map(x => x.id);
export const dueWords = () => reviewQueue().filter(x => x.k === "w").map(x => x.id);

function lessonMastery(l) {
  const r = state.lessons[l.id]; if (!r) return 0;
  return 0.5 * (r.best / l.quiz.length) + 0.5 * Math.min(r.box, 4) / 4;
}
export function categoryStats() {
  const out = {};
  lessons().forEach(l => {
    const c = out[l.cat] || (out[l.cat] = { key: l.cat, total: 0, learned: 0, m: 0 });
    c.total++; if (state.lessons[l.id]) c.learned++; c.m += lessonMastery(l);
  });
  return Object.values(out).map(c => ({ ...c, pct: Math.round(100 * c.m / c.total) }));
}

/* daily picks (stable for the day) */
export function lessonOfDay() {
  const d = day(); if (d.lotd && lessonById(d.lotd) && (lessonById(d.lotd).audience || "adult") === aud()) return lessonById(d.lotd);
  const pool = lessons().filter(l => !isPractical(l)), fresh = pool.filter(l => !state.lessons[l.id]);
  const src = fresh.length ? fresh : pool;
  const l = src[hashStr(today() + aud() + "L") % src.length]; d.lotd = l.id; save(); return l;
}
export function wordOfDay() {
  const d = day(); if (d.wotd && entry(d.wotd)) return entry(d.wotd);
  const pool = lib(), fresh = pool.filter(e => !state.words[e.w]);
  const src = fresh.length ? fresh : pool;
  const e = src[hashStr(today() + aud() + "W") % src.length]; d.wotd = e.w; save(); return e;
}
export const challengeOfDay = () => { const A = activeActs().filter(a => a.pillar === "think"); return A[hashStr(today() + aud() + "C") % A.length]; };
export const scoreOn = (id, k) => (state.scores[id] || {})[k];

/* achievements */
export const ACHIEVEMENTS = [
  { id: "first-lesson", name: "First Lesson", desc: "Finish your first lesson", icon: "book", test: c => c.lessons >= 1 },
  { id: "bookworm", name: "Bookworm", desc: "Finish 5 lessons", icon: "book", test: c => c.lessons >= 5 },
  { id: "scholar", name: "Scholar", desc: "Finish 15 lessons", icon: "cap", test: c => c.lessons >= 15 },
  { id: "wordsmith", name: "Wordsmith", desc: "Learn your first word", icon: "pen", test: c => c.words >= 1 },
  { id: "lexicon", name: "Lexicon", desc: "Collect 25 words", icon: "stack", test: c => c.words >= 25 },
  { id: "silver", name: "Silver Tongue", desc: "Master 10 words", icon: "star", test: c => c.mastered >= 10 },
  { id: "flawless", name: "Flawless", desc: "Get a perfect lesson score", icon: "check", test: c => c.perfectLessons >= 1 },
  { id: "perfectionist", name: "Perfectionist", desc: "5 perfect lesson scores", icon: "check", test: c => c.perfectLessons >= 5 },
  { id: "s3", name: "On a Roll", desc: "3-day streak", icon: "flame", test: c => c.best >= 3 },
  { id: "s7", name: "Week Warrior", desc: "7-day streak", icon: "flame", test: c => c.best >= 7 },
  { id: "s30", name: "Unstoppable", desc: "30-day streak", icon: "flame", test: c => c.best >= 30 },
  { id: "elephant", name: "Elephant Memory", desc: "10 correct recalls", icon: "brain", test: c => c.recallsRight >= 10 },
  { id: "fullhouse", name: "Full House", desc: "Complete all five pillars in a day", icon: "gift", test: c => c.dailyCompletes >= 1 },
  { id: "clockwork", name: "Clockwork", desc: "All five pillars on 7 days", icon: "gift", test: c => c.dailyCompletes >= 7 },
  { id: "pb", name: "Better Than Yesterday", desc: "Beat yesterday's score", icon: "trophy", test: c => c.beatYesterday >= 1 },
  { id: "quick", name: "Quick Thinker", desc: "Score 15+ in 60-second vocab", icon: "timer", test: c => c.speedBest >= 15 },
  { id: "curious", name: "Curious Mind", desc: "Look up a word and add it to your words", icon: "search", test: c => c.lookups >= 1 },
  { id: "specialist", name: "Specialist", desc: "Finish every lesson in a category", icon: "trophy", test: c => c.fullCats >= 1 },
  { id: "polymath", name: "All-Rounder", desc: "A lesson in every topic", icon: "compass", test: c => c.allCats },
  { id: "golden", name: "Golden Touch", desc: "Finish a Golden Lesson", icon: "star", test: c => c.goldens >= 1 },
  { id: "rising", name: "Rising Star", desc: "Reach level 10", icon: "bolt", test: c => c.level >= 10 },
  { id: "brainiac", name: "Brainiac", desc: "Try every brain game", icon: "brain", test: c => c.allGames },
  { id: "factchecker", name: "Fact Checker", desc: "Perfect score in Fact or Fiction?", icon: "flag", test: c => c.perfectFob >= 1 },
  { id: "timekeeper", name: "Timekeeper", desc: "10/10 in Which came first?", icon: "hourglass", test: c => c.perfectTimeline >= 1 },
  { id: "opposites", name: "Opposites Attract", desc: "10/10 in Opposites", icon: "opp", test: c => c.perfectOpposites >= 1 },
  { id: "wellrounded", name: "Arena Explorer", desc: "Try every quiz in the Arena", icon: "target", test: c => c.allQuizzes },
  { id: "globetrotter", name: "Globetrotter", desc: "5/5 in Capital cities", icon: "globe", test: c => c.perfectCapitals >= 1 },
  { id: "sharp", name: "Sharp Thinker", desc: "Perfect score in Think it through", icon: "scale", test: c => c.perfectCritical >= 1 },
  { id: "trivia", name: "Know-It-All", desc: "10/10 in The Daily Trial or 10 questions a day", icon: "target", test: c => c.perfectGk >= 1 },
  { id: "master1", name: "Master", desc: "Master your first subject", icon: "laurel", test: c => c.masteredN >= 1 },
  { id: "master5", name: "Grand Master", desc: "Master 5 subjects", icon: "laurel", test: c => c.masteredN >= 5 },
  { id: "master20", name: "Polymath", desc: "Master 20 subjects", icon: "laurel", test: c => c.masteredN >= 20 },
];
export const QUIZ_GROUPS = [["Knowledge", "Test what you know about the world", ["fob", "timeline", "capitals", "facts"]], ["Words", "Sharpen your vocabulary", ["memwords", "speed", "tf", "def", "word", "odd", "opposites", "blank"]]];
export function checkAchievements() {
  const cats = categoryStats();
  const c = { ...state.stats, lessons: Object.keys(state.lessons).filter(id => lessonById(id)).length, words: Object.keys(state.words).length,
    mastered: Object.keys(state.words).filter(mastered).length, best: state.best, level: level(),
    fullCats: cats.filter(x => x.total >= 2 && x.learned === x.total).length, allCats: cats.length > 0 && cats.every(x => x.learned > 0),
    masteredN: Object.keys(state.mastered || {}).length,
    allGames: activeActs().filter(a => a.pillar === "think").every(a => state.scores[a.id]),
    allQuizzes: QUIZ_GROUPS.flatMap(g => g[2]).every(id => state.scores[id]) };
  const got = [];
  ACHIEVEMENTS.forEach(a => { if (!state.ach[a.id] && a.test(c)) { state.ach[a.id] = today(); got.push(a); } });
  return got;
}
export function wrapUp() {
  const out = checkDay();
  if (pendingLevelUp) { out.push({ cls: "", icon: "bolt", text: `Level up! Level ${pendingLevelUp} · ${rank(pendingLevelUp).name}` }); pendingLevelUp = null; }
  checkAchievements().forEach(a => out.push({ cls: "gold", icon: a.icon, text: `Achievement: ${a.name}` }));
  save();
  return out;
}

/* ============ 5. QUESTION BUILDERS ============ */
function mcOptions(right, pool, n = 3) { const others = shuffle(pool.filter(x => x !== right)).slice(0, n); const o = shuffle([right, ...others]); return { options: o, answer: o.indexOf(right) }; }
function wordPool(e, samePos = true) { const all = allWords().filter(x => x.w !== e.w); const same = all.filter(x => x.pos === e.pos); return samePos && same.length >= 3 ? same : all; }
function qLesson(l, qi, sub) {
  const q = l.quiz[qi]; const o = shuffle(q.o.map((t, i) => ({ t, i })));
  return { src: "lesson", id: l.id, qi, s: q.s, prompt: esc(q.q), sub, options: o.map(x => esc(x.t)), answer: o.findIndex(x => x.i === q.a), explain: esc(q.e) };
}
function qMeaning(e) { const m = mcOptions(e.def, wordPool(e, false).map(x => x.def)); return { src: "word", w: e.w, lvl: e.lvl, prompt: `What does <b>${esc(e.w)}</b> mean?`, options: m.options.map(esc), answer: m.answer, explain: esc(`${e.w}: ${e.def}`) }; }
function qFromDef(e) { const m = mcOptions(e.w, wordPool(e).map(x => x.w)); return { src: "word", w: e.w, prompt: `Which word means: “${esc(e.def)}”`, options: m.options.map(esc), answer: m.answer, explain: esc(`${e.w}: ${e.def}`) }; }
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function qBlank(e) {
  const m = mcOptions(e.w, wordPool(e).map(x => x.w));
  const sentence = e.blank && e.blank.includes("___") ? e.blank : `${e.ex[0] || ""}`.replace(new RegExp(reEsc(e.w), "i"), "___");
  return { src: "word", w: e.w, sub: "Complete the sentence", prompt: esc(sentence).replace("___", "<span class='num'>_____</span>"), options: m.options.map(esc), answer: m.answer, explain: esc(sentence.replace("___", e.w)) };
}
function qTF(e) {
  const truth = Math.random() < 0.5, other = pick(wordPool(e, false));
  const d = truth ? e.def : other.def;
  return { src: "word", w: e.w, sub: "True or false?", prompt: `<b>${esc(e.w)}</b> means: ${esc(d)}`, options: ["True", "False"], answer: truth ? 0 : 1, explain: esc(`${e.w}: ${e.def}`) };
}
function fitSentence(e) {
  const s = e.blank && e.blank.includes("___") ? e.blank : String((e.ex || [])[0] || "").replace(new RegExp(reEsc(e.w) + "\\w*", "i"), "___");
  return s.includes("___") ? s : null;
}
function qFit(e) {
  const right = fitSentence(e); if (!right) return qMeaning(e);
  const others = shuffle(allWords().filter(x => x.w !== e.w).map(fitSentence).filter(x => x && x !== right)).slice(0, 3);
  const o = shuffle([right, ...others]), fmtS = x => esc(x).replace("___", "<b>_____</b>");
  return { src: "word", w: e.w, fit: true, sub: "Which sentence does it fit best?", prompt: `<span class="fit-w">${esc(e.w)}</span>`, options: o.map(fmtS), answer: o.indexOf(right), explain: esc(right.replace("___", e.w)) + `<br><span class="muted small">${esc(e.w)}: ${esc(e.def)}</span>` };
}
const canOpp = e => e.ant && e.ant.length >= 1 && e.syn && e.syn.length >= 1;
function qOpp(e) {
  const right = e.ant[0], bad = new Set([e.w, ...e.ant, ...e.syn].map(x => x.toLowerCase()));
  const wrong = e.syn.slice(0, 2);
  const extra = shuffle(wordPool(e).filter(x => !bad.has(x.w.toLowerCase()) && !(x.syn || []).some(s => bad.has(s.toLowerCase())) && !(x.ant || []).some(s => bad.has(s.toLowerCase())))).slice(0, 3 - wrong.length).map(x => x.w);
  const o = shuffle([right, ...wrong, ...extra]);
  return { src: "word", w: e.w, prompt: `What's the opposite of <b>${esc(e.w)}</b>?`, sub: "Pick the word that means the opposite", options: o.map(esc), answer: o.indexOf(right), explain: esc(`${e.w}: ${e.def} The opposite is ${right}.`) };
}
const canOdd = e => e.syn && e.syn.length >= 2 && e.ant && e.ant.length >= 1;
function qOdd(e) {
  const odd = e.ant[0], o = shuffle([e.w, e.syn[0], e.syn[1], odd]);
  return { src: "word", w: e.w, prompt: "Which word doesn't belong?", sub: "Three words mean roughly the same thing", options: o.map(esc), answer: o.indexOf(odd), explain: esc(`${e.w}, ${e.syn[0]} and ${e.syn[1]} are similar. ${odd} is the opposite.`) };
}
const wordQ = { fit: qFit, meaning: qMeaning, fromDef: qFromDef, blank: qBlank, tf: qTF, odd: qOdd };

/* ============ 6. PILLARS, QUOTES, REVIEW, INNER CIRCLE ============ */
export const PILLAR5 = [
  { p: "knowledge",  name: "Knowledge",  gk: "Episteme", gr: "ἐπιστήμη", icon: "book",   tag: "Understand the world" },
  { p: "vocabulary", name: "Vocabulary", gk: "Lexis",    gr: "λέξις",    icon: "repeat", tag: "Words are tools" },
  { p: "practical",  name: "Practical",  gk: "Praxis",   gr: "πρᾶξις",   icon: "tools",  tag: "Skills for real life" },
  { p: "expression", name: "Expression", gk: "Logos",    gr: "λόγος",    icon: "pen",    tag: "Words of the wise" },
  { p: "cognition",  name: "Cognition",  gk: "Noesis",   gr: "νόησις",   icon: "brain",  tag: "Sharpen the mind" },
];
export const PILLAR_BY = k => PILLAR5.find(x => x.p === k);
const PRACTICAL_EXTRA = ["mnemonics", "memory-palace", "habits"];
const LIFE_IDS = new Set((WB.COLLECTIONS.find(c => c.id === "life") || { ids: [] }).ids);
export function isPractical(l) { return l.cat === "life" || LIFE_IDS.has(l.id) || PRACTICAL_EXTRA.includes(l.id); }
export function practicalOfDay() {
  const d = day(); if (d.potd && lessonById(d.potd) && (lessonById(d.potd).audience || "adult") === aud()) return lessonById(d.potd);
  const pool = lessons().filter(isPractical), fresh = pool.filter(l => !state.lessons[l.id]);
  const src = fresh.length ? fresh : pool;
  const l = src[hashStr(today() + aud() + "P") % src.length]; d.potd = l.id; save(); return l;
}
export const quotePool = () => QUOTES.map((x, i) => ({ ...x, i, id: x.q }));
function migrateQuotes() {
  for (const k of Object.keys(state.quotes || {})) if (/^\d+$/.test(k)) { if (QUOTES[k] && !state.quotes[QUOTES[k].q]) state.quotes[QUOTES[k].q] = state.quotes[k]; delete state.quotes[k]; }
  for (const d of Object.values(state.days || {})) if (typeof d.qotd === "number") d.qotd = QUOTES[d.qotd] ? QUOTES[d.qotd].q : undefined;
}
export function quoteOfDay() {
  const d = day(), pool = quotePool();
  const qi = d.qotd != null ? QUOTES.findIndex(x => x.q === d.qotd) : -1;
  if (qi >= 0) return { ...QUOTES[qi], i: qi, id: QUOTES[qi].q };
  const fresh = pool.filter(x => !state.quotes[x.id]), src = fresh.length ? fresh : pool;
  const q = src[hashStr(today() + aud() + "Q") % src.length]; d.qotd = q.id; save(); return q;
}
export function pillarItems() {
  const d = day(), l = lessonOfDay(), e = wordOfDay(), pr = practicalOfDay(), qt = quoteOfDay(), ch = challengeOfDay();
  const info = {
    knowledge:  { done: d.know,      item: l.title,       meta: `${lessonMins(l)} min`, act: "lesson", id: l.id },
    vocabulary: { done: d.word,      item: `Word: ${e.w}`, meta: "3 min", act: "wotd" },
    practical:  { done: d.practical, item: pr.title,      meta: `${lessonMins(pr)} min`, act: "lesson", id: pr.id },
    expression: { done: d.expr,      item: `“${qt.q}”`,   meta: "2 min", act: "quote" },
    cognition:  { done: d.challenge, item: actName(ch),   meta: ch.timed ? ch.timed + " sec" : `${ch.count} rounds`, act: "challenge", id: ch.id },
  };
  return PILLAR5.map(x => ({ ...x, ...info[x.p] }));
}
export const learnedQuotes = () => quotePool().filter(x => state.quotes[x.id]);
export function memoryStrength() {
  const recs = [...Object.keys(state.lessons).filter(lessonById).map(id => state.lessons[id]), ...Object.keys(state.words).filter(entry).map(w => state.words[w])];
  if (!recs.length) return null;
  const t = today(), score = recs.reduce((a, r) => a + (r.due < t ? Math.min(r.box, 4) / 8 : Math.min(r.box + 1, 5) / 5), 0);
  return { pct: Math.round(100 * score / recs.length), n: recs.length };
}
export function innerProgress() {
  checkAchievements();
  const got = ACHIEVEMENTS.filter(a => state.ach[a.id]).length, total = ACHIEVEMENTS.length;
  return { got, total, pct: Math.floor(100 * got / total), open: got === total, left: ACHIEVEMENTS.filter(a => !state.ach[a.id]) };
}
export const innerWords = () => WB.WORDS.filter(e => e.audience === "inner");
export const innerLessons = () => WB.LESSONS.filter(l => l.audience === "inner");
export function bestOf(id) { const v = Object.values(state.scores[id] || {}); return v.length ? Math.max(...v) : null; }

/* topic lists for the library */
export function topicLessons(key) {
  const [kind, a, b] = key.split(":");
  if (kind === "cat") return lessons().filter(l => l.cat === a).sort((x, y) => LEVELS[x.level].n - LEVELS[y.level].n);
  if (kind === "col") return ((WB.COLLECTIONS.find(c => c.id === a) || { ids: [] }).ids).map(lessonById).filter(Boolean);
  if (kind === "grp") { const pool = ui.libPillar === "practical" ? lessons().filter(isPractical) : lessons().filter(l => !isPractical(l));
    return pool.filter(l => l.cat === b && (a === "all" || l.level === a)).sort((x, y) => LEVELS[x.level].n - LEVELS[y.level].n); }
  return [];
}

/* disclaimers */
const DISCLAIMERS = {
  health: "General information only, not medical advice. Talk to your doctor or a health professional about your own situation.",
  money: "General information only, not financial advice. It doesn't consider your circumstances. Consider speaking to a licensed financial adviser.",
  law: "General information only, not legal advice. Some laws differ between states and territories, and laws change over time. For your situation, contact Legal Aid or a lawyer.",
  safety: "General information only, not a substitute for first aid training or official emergency advice. In an emergency, call Triple Zero (000).",
  mind: "Educational content, not a substitute for professional support. If you're struggling, call Lifeline on 13 11 14 or talk to your GP.",
};
const LAW_IDS = ["legal-system-au", "constitution-au", "contracts", "consumer-rights", "workplace-rights", "renting", "start-business-au", "making-a-will", "contractor-or-employee", "burnout-and-disconnecting"];
const MONEY_IDS = ["lodging-your-tax-return", "super-housekeeping", "comparing-personal-loans", "getting-out-of-debt", "big-purchases-bnpl", "building-an-emergency-fund", "income-protection-insurance", "private-health-insurance-decoded", "making-an-insurance-claim"];
const HEALTH_IDS = ["medicare-and-finding-a-gp", "building-a-better-sleep-routine"];
const MIND_IDS = ["manipulation-tactics", "gaslighting", "cults", "dark-triad", "stress", "resilience", "emotional-regulation", "boundaries", "attachment", "conflict"];
export function disclaimerFor(l) {
  if (LAW_IDS.includes(l.id)) return DISCLAIMERS.law;
  if (MIND_IDS.includes(l.id) || l.cat === "emotions") return DISCLAIMERS.mind;
  if (l.cat === "body" || HEALTH_IDS.includes(l.id) || l.id === "alcohol" || l.id === "food-safety") return DISCLAIMERS.health;
  if (l.cat === "money" || MONEY_IDS.includes(l.id)) return DISCLAIMERS.money;
  if (l.cat === "safety") return DISCLAIMERS.safety;
  return "";
}

/* Learn This: library look-up */
function parseLookup(q) {
  q = q.trim().toLowerCase().replace(/[?!.]+$/, "");
  const m = q.match(/(?:what does|what's|whats|define|definition of|meaning of|what is)\s+(?:the\s+(?:word|meaning of)\s+)?["'“‘]?([a-z][a-z' -]*?)["'”’]?(?:\s+mean)?$/);
  return (m ? m[1] : q).replace(/["'“”‘’]/g, "").trim();
}
export function doLookup(q) {
  const w = parseLookup(q); if (!w) return;
  const pool = lib().concat(innerProgress().open ? innerWords() : []);
  const e = pool.find(x => x.w === w) || state.custom[w] || pool.find(x => w.startsWith(x.w.slice(0, -1)) && Math.abs(w.length - x.w.length) <= 3);
  ui.lookup = e ? { q, w: e.w, status: "found", entry: e } : { q, w, status: "missing" };
  changed();
}

/* ============ 7. PLAYER ============ */
export let P = null;
export const player = { get P() { return P; } };
let timer = null, memTimer = null;
function start(p) {
  P = Object.assign({ i: 0, answered: null, score: 0, t0: Date.now(), drawn: -1 }, p);
  P.pillarsBefore = new Set(pillarItems().filter(x => x.done).map(x => x.p));
  if (P.timed) { P.endAt = Date.now() + P.timed * 1000; timer = setInterval(tick, 250); }
  enter(); changed();
}
export function closePlayer() {
  if (!P) return;
  if (timer) { clearInterval(timer); timer = null; }
  if (memTimer) { clearTimeout(memTimer); memTimer = null; }
  const secs = Math.min((Date.now() - P.t0) / 1000, 1200); if (secs > 3) day().secs += secs;
  save(); P = null; changed();
}
function tick() {
  if (!P || !P.timed || P.steps[P.i].t === "c-intro") return;
  const left = Math.max(0, P.endAt - Date.now());
  if (left <= 0 && P.steps[P.i].t === "q") { clearInterval(timer); timer = null; if (P.answered === null) P.steps.splice(P.i, 1); P.steps.push({ t: "summary" }); P.i = P.steps.length - 1; P.answered = null; enter(); }
  changed();
}
export const timeLeft = () => P && P.timed ? Math.max(0, P.endAt - Date.now()) : 0;

export function raisedThisSession() { return P && P.pillarsBefore ? pillarItems().filter(x => x.done && !P.pillarsBefore.has(x.p)).map(x => x.p) : []; }
function nextPillarAfter(p, items) {
  const i = PILLAR5.findIndex(x => x.p === p);
  for (let k = 1; k <= PILLAR5.length; k++) { const x = items.find(y => y.p === PILLAR5[(i + k) % PILLAR5.length].p); if (x && !x.done) return x; }
  return null;
}
export function templeFinish() {
  const items = pillarItems(), n = items.filter(x => x.done).length, nx = nextPillarAfter(raisedThisSession()[0], items);
  return { n, next: nx };
}
export function startPillar(p) {
  const x = pillarItems().find(i => i.p === p); if (!x) return;
  if (x.act === "lesson") startLesson(x.id);
  else if (x.act === "wotd") startWord(wordOfDay().w, true);
  else if (x.act === "quote") startQuote();
  else if (x.act === "challenge") startChallenge(x.id);
}

/* --- starting sessions --- */
export function startLesson(id) {
  const l = lessonById(id); if (!l) return;
  const replay = !!state.lessons[id];
  start({ mode: "lesson", l, replay, golden: !replay && Math.random() < RULES.goldenChance, results: [], retryRight: 0, color: catOf(l).color,
    steps: [{ t: "l-intro" }, ...l.sections.map((_, k) => ({ t: "l-read", k })), ...l.quiz.map((_, qi) => ({ t: "q", q: qLesson(l, qi), head: `Question ${qi + 1} of ${l.quiz.length}` })), { t: "l-score" }, { t: "l-reward" }, { t: "l-next" }] });
}
export function startWord(w, isWotd) {
  const e = entry(w); if (!e) return;
  start({ mode: "word", e, isWotd, wordRight: 0, color: wcatOf(e).color,
    steps: [{ t: "w-card" }, { t: "q", q: qFit(e), head: "Where does it fit?" }, { t: "w-reward" }] });
}
export function startRecall() {
  const ids = dueLessons().slice(0, 5); if (!ids.length) return toast("Nothing to recall right now");
  start({ mode: "recall", total: ids.length, steps: [...ids.map(id => { const l = lessonById(id); return { t: "q", q: qLesson(l, rand(l.quiz.length), `You learned about <b>${esc(l.title)}</b> ${ago(state.lessons[id].learnedAt)}.`), head: "Quick recall" }; }), { t: "summary" }] });
}
function wordSteps(list, kinds) {
  return list.map(e => { let k = pick(kinds); if (k === "odd" && !canOdd(e)) k = "meaning"; return { t: "q", q: wordQ[k](e) }; });
}
export function startWordReview() {
  const ws = shuffle(dueWords()).slice(0, 12).map(entry); if (!ws.length) return toast("No words are due. Nice work!");
  start({ mode: "review", total: ws.length, steps: [...wordSteps(ws, ["fit"]).map(s => ({ ...s, head: "Review" })), { t: "summary" }] });
}
export function startPractice(kind) {
  const mine = Object.keys(state.words).map(entry).filter(Boolean);
  let pool = kind === "struggling" ? mine.filter(e => struggling(e.w)) : mine;
  if (kind === "struggling" && !pool.length) return toast("No tricky words yet. Words you miss twice show up here.");
  if (kind !== "struggling" && pool.length < 4) pool = pool.concat(shuffle(lib().filter(e => !state.words[e.w]))).slice(0, 10);
  const due = new Set(dueWords());
  const list = shuffle(pool).sort((a, b) => (due.has(b.w) ? 1 : 0) - (due.has(a.w) ? 1 : 0)).slice(0, 10);
  start({ mode: "practice", total: list.length, steps: [...wordSteps(list, ["fit"]), { t: "summary" }] });
}
export function startTrial() {
  const world = buildGK().slice(0, 5).map(st => ({ ...st, part: "The world" }));
  const learnedL = lessons().filter(l => state.lessons[l.id]), mineW = Object.keys(state.words).map(entry).filter(Boolean);
  const lq = shuffle(learnedL.length ? learnedL : lessons().filter(l => l.level === "beginner")).slice(0, mineW.length ? 3 : 5).map(l => ({ t: "q", q: qLesson(l, rand(l.quiz.length), `From <b>${esc(l.title)}</b>`) }));
  const wq = wordSteps(shuffle(mineW.length >= 3 ? mineW : allWords()).slice(0, 5 - lq.length), ["fit"]);
  const mine = lq.concat(wq).map(st => ({ ...st, part: "Your learning" }));
  const steps = []; for (let i = 0; i < 5; i++) { if (world[i]) steps.push(world[i]); if (mine[i]) steps.push(mine[i]); }
  start({ mode: "quiz", trial: true, total: steps.length, steps: [...steps.map((st, i, a) => ({ ...st, head: `The Daily Trial · ${st.part} · ${i + 1} of ${a.length}` })), { t: "summary" }] });
}
export function startChallenge(id, opt) {
  const a = actById(id); if (!a) return;
  if (a.timed) return start({ mode: "challenge", c: a, opt, timed: a.timed, steps: [{ t: "c-intro" }] });
  const steps = buildActivity(a, opt);
  start({ mode: "challenge", c: a, opt, total: steps.filter(s => s.t === "q").length, steps: [{ t: "c-intro" }, ...steps, { t: "summary" }] });
}
export function startVocabTest() {
  const L = [1, 2, 3].flatMap(n => shuffle(lib().filter(e => e.lvl === n)).slice(0, 5));
  start({ mode: "vocab", total: L.length, tally: { 1: [0, 0], 2: [0, 0], 3: [0, 0] }, steps: [{ t: "v-intro" }, ...shuffle(L).map((e, i) => ({ t: "q", q: qMeaning(e), head: `Vocabulary check · ${i + 1} of ${L.length}` })), { t: "summary" }] });
}
export function startQuote() {
  const q = quoteOfDay(), pool = quotePool();
  const others = shuffle(pool.filter(x => x.i !== q.i));
  const mo = shuffle([q.m, ...others.slice(0, 3).map(x => x.m)]);
  const q1 = { t: "q", head: "Logos · What does it mean?", q: { prompt: `“${esc(q.q)}”`, sub: "Which best captures the meaning?", options: mo.map(esc), answer: mo.indexOf(q.m), explain: esc(q.m) } };
  const seen = pool.filter(x => state.quotes[x.id] && state.quotes[x.id] < today());
  const r = seen.length ? pick(seen) : q;
  const authors = [...new Set(pool.map(x => x.a))].filter(a => a !== r.a);
  const ao = shuffle([r.a, ...shuffle(authors).slice(0, 3)]);
  const q2 = { t: "q", head: seen.length ? "Logos · Remember this one?" : "Logos · Who said it?", q: { prompt: `“${esc(r.q)}”`, sub: "Who said it?", options: ao.map(esc), answer: ao.indexOf(r.a), explain: esc(`${r.a}: ${r.w}.`) } };
  start({ mode: "expr", quote: q, total: 2, steps: [{ t: "x-quote" }, q1, q2, { t: "summary" }] });
}
export function startMastery(id) {
  const x = subjectById(id); if (!x) return;
  const ls = x.steps.map(lessonById).filter(Boolean);
  const pool = shuffle(ls.flatMap(l => l.quiz.map((_, qi) => ({ l, qi }))));
  const picked = [], per = {};
  for (const c of pool) { if (picked.length >= 10) break; if ((per[c.l.id] || 0) < Math.ceil(10 / ls.length)) { picked.push(c); per[c.l.id] = (per[c.l.id] || 0) + 1; } }
  for (const c of pool) { if (picked.length >= 10) break; if (!picked.includes(c)) picked.push(c); }
  const steps = shuffle(picked).map((c, i) => ({ t: "q", q: qLesson(c.l, c.qi, `From <b>${esc(c.l.title)}</b>`), head: `Mastery exam · ${i + 1} of ${picked.length}` }));
  start({ mode: "mastery", subject: x, total: steps.length, steps: [{ t: "m-intro" }, ...steps, { t: "summary" }] });
}
export function startFullReview() {
  const ls = dueLessons().map(id => { const l = lessonById(id); return { t: "q", q: qLesson(l, rand(l.quiz.length), `You learned about <b>${esc(l.title)}</b> ${ago(state.lessons[id].learnedAt)}.`) }; });
  const ws = wordSteps(shuffle(dueWords()).map(entry), ["fit"]);
  const steps = shuffle(ls.concat(ws)).map((st, i, a) => ({ ...st, head: `Review · ${i + 1} of ${a.length}` }));
  if (!steps.length) return toast("Nothing is due right now");
  start({ mode: "memory", total: steps.length, steps: [...steps, { t: "summary" }] });
}
export function startQuoteReview() {
  const pool = shuffle(learnedQuotes()).slice(0, 5), authors = [...new Set(quotePool().map(x => x.a))];
  const steps = pool.map((r, i) => { const ao = shuffle([r.a, ...shuffle(authors.filter(a => a !== r.a)).slice(0, 3)]);
    return { t: "q", head: `Quotes · ${i + 1} of ${pool.length}`, q: { prompt: `“${esc(r.q)}”`, sub: "Who said it?", options: ao.map(esc), answer: ao.indexOf(r.a), explain: esc(`${r.a}: ${r.w}.`) } }; });
  start({ mode: "memory", total: steps.length, steps: [...steps, { t: "summary" }] });
}
export function startInner(kind) {
  let steps;
  if (kind === "q") steps = shuffle(WB.INNER.questions).slice(0, 10).map((x, i) => mcq(x, `Expert question · ${i + 1} of 10`));
  else if (kind === "r") steps = shuffle(WB.INNER.riddles).slice(0, 5).map((x, i) => mcq(x, `Expert riddle · ${i + 1} of 5`));
  else { const iw = innerWords(); steps = shuffle(iw).slice(0, 10).map((e, i) => { const m = mcOptions(e.def, iw.filter(x => x !== e).map(x => x.def));
    return { t: "q", head: `Lexicon · ${i + 1} of 10`, q: { src: "word", w: e.w, prompt: `What does <b>${esc(e.w)}</b> mean?`, options: m.options.map(esc), answer: m.answer, explain: esc(`${e.w}: ${e.def}`) } }; }); }
  start({ mode: "inner", kind, total: steps.length, steps: [...steps, { t: "summary" }] });
}
export function startRandomLesson() { const pool = lessons(), fresh = pool.filter(l => !state.lessons[l.id]); startLesson(pick(fresh.length ? fresh : pool).id); }

/* --- moving through steps --- */
export const hooksPlayer = { speak: null };
export function advance() {
  const s = P.steps[P.i];
  if (s.t === "q" && P.answered === null) return;
  if (P.timed && s.t === "q") return nextTimed();
  if (P.timed && s.t === "c-intro") { P.endAt = Date.now() + P.timed * 1000; P.steps.push(P.c.gen()); P.i++; P.answered = null; return changed(); }
  if (memTimer) { clearTimeout(memTimer); memTimer = null; }
  if (P.i >= P.steps.length - 1) return closePlayer();
  P.i++; P.answered = null; enter(); changed();
}
function nextTimed() {
  if (Date.now() >= P.endAt) return tick();
  P.steps.push(P.c.gen()); P.i++; P.answered = null; changed();
}
export function answer(i) {
  if (!P || P.answered !== null) return;
  const s = P.steps[P.i], q = s.q, right = i === q.answer;
  P.answered = i; recordAnswer(right);
  if ((P.mode === "recall" || P.mode === "review" || P.mode === "memory") && (q.src === "lesson" || q.src === "word")) day().reviewed = (day().reviewed || 0) + 1;
  if (right) P.score++;
  if (P.mode === "lesson") { if (s.retry) { if (right) P.retryRight++; } else P.results.push({ qi: q.qi, s: q.s, right }); }
  else if (P.mode === "word") { if (right) P.wordRight++; }
  else if (P.mode === "recall") { lessonRecall(q.id, right); if (right) addXp(RULES.xp.recallRight); }
  else if (P.mode === "review" || P.mode === "practice") { updateWord(q.w, right); if (right) addXp(RULES.xp.reviewRight); }
  else if (P.mode === "quiz" || P.mode === "mastery" || P.mode === "memory") { if (P.mode === "memory" && !q.src) {} else if (q.src === "lesson") lessonRecall(q.id, right); else updateWord(q.w, right); }
  else if (P.mode === "vocab") { const t = P.tally[q.lvl]; t[1]++; if (right) t[0]++; }
  save(); changed();
  if (P.timed) setTimeout(() => { if (P && P.steps[P.i] === s) nextTimed(); }, right ? 300 : 850);
}
function enter() {
  const s = P.steps[P.i];
  if (s.t === "l-score" && !P.scored) {
    P.scored = true;
    const missed = P.results.filter(r => !r.right);
    const add = [];
    missed.slice(0, 2).forEach(r => { add.push({ t: "l-refresh", s: r.s }); add.push({ t: "q", q: qLesson(P.l, r.qi), retry: true, head: "Try it again" }); });
    P.steps.splice(P.i + 1, 0, ...add);
  }
  if (s.t === "l-reward" && !P.reward) P.reward = finishLesson();
  if (s.t === "w-reward" && !P.reward) P.reward = finishWord();
  if (s.t === "w-card" && !s.spoken) { s.spoken = true; setTimeout(() => { if (P && P.steps[P.i] === s && hooksPlayer.speak) hooksPlayer.speak(P.e.w); }, 350); }
  if (s.t === "summary" && !P.reward) P.reward = finishSession();
  if (s.t === "mem-show") memTimer = setTimeout(() => { if (P && P.steps[P.i] === s) { memTimer = null; advance(); } }, 700 * s.seq.length + 900);
}
function finishLesson() {
  const l = P.l, right = P.results.filter(r => r.right).length, n = l.quiz.length, mult = RULES.levelMult[l.level] || 1, perfect = right === n;
  const lines = [];
  let xp = 0;
  const a = Math.round(right * RULES.xp.lessonCorrect * mult); xp += a; lines.push([`Correct answers (${right}/${n})`, `+${a}`]);
  xp += RULES.xp.lessonComplete; lines.push(["Lesson complete", `+${RULES.xp.lessonComplete}`]);
  if (perfect) { xp += RULES.xp.perfect; lines.push(["Perfect score bonus", `+${RULES.xp.perfect}`]); }
  if (P.retryRight) { const r = P.retryRight * RULES.xp.retryRight; xp += r; lines.push(["Recalled after refresher", `+${r}`]); }
  if (P.replay) { xp = Math.round(xp * RULES.xp.replayFactor); lines.push(["Review", "½ XP"]); }
  if (P.golden) { xp *= 2; lines.push(["Golden Lesson", "2×"]); state.stats.goldens++; }
  addXp(xp);
  const rec = state.lessons[l.id];
  if (!rec) state.lessons[l.id] = { box: 0, due: addDays(today(), 1), learnedAt: today(), best: right, attempts: 1 };
  else { rec.best = Math.max(rec.best, right); rec.attempts++; const was = rec.due; srUpdate(rec, right >= Math.ceil(n * 0.6)); if (rec.due < was) rec.due = was; }
  if (perfect) state.stats.perfectLessons++;
  day().lesson++; if (isPractical(l)) day().practical = true; else day().know = true;
  return { xp, lines, right, n, perfect, out: wrapUp() };
}
function finishWord() {
  const e = P.e, lines = []; let xp = 0;
  const isNew = addWord(e.w, P.isWotd ? "daily" : "library");
  xp += RULES.xp.wordLearn; lines.push([isNew ? "New word learned" : "Word practised", `+${RULES.xp.wordLearn}`]);
  if (P.wordRight) { const a = P.wordRight * RULES.xp.wordExercise; xp += a; lines.push([`Fit the sentence (${P.wordRight}/1)`, `+${a}`]); }
  if (!isNew) xp = Math.round(xp / 2);
  addXp(xp);
  day().word = true;
  return { xp, lines, isNew, out: wrapUp() };
}
function finishSession() {
  const m = P.mode, total = P.mode === "challenge" && P.timed ? P.steps.filter(s => s.t === "q").length : (P.total || P.steps.filter(s => s.t === "q").length);
  const lines = []; let xp = 0, title = "", note = "";
  if (m === "quiz") {
    title = P.trial ? "The Daily Trial" : "Daily quiz";
    if (P.trial) { const d0 = day(); d0.trial = Math.max(d0.trial ?? 0, P.score); state.trialBest = Math.max(state.trialBest ?? 0, P.score); if (P.score === total) state.stats.perfectGk++; }
    const a = P.score * RULES.xp.quizCorrect; xp += a; lines.push([`Correct (${P.score}/${total})`, `+${a}`]);
    if (P.score === total) { xp += RULES.xp.quizPerfect; lines.push(["Perfect score bonus", `+${RULES.xp.quizPerfect}`]); }
    if (!day().quiz) day().quiz = true; else { xp = Math.round(xp / 2); lines.push(["Replay", "½ XP"]); }
  } else if (m === "challenge") {
    const c = P.c, k = today(), y = scoreOn(c.id, addDays(k, -1)), prev = scoreOn(c.id, k);
    title = actName(c) + (P.opt && P.opt.cat ? ` · ${WB.GK_CATS[P.opt.cat]}` : "");
    const perfect = !P.timed && P.score === total;
    if (perfect) { const key = { fob: "perfectFob", timeline: "perfectTimeline", opposites: "perfectOpposites", capitals: "perfectCapitals", critical: "perfectCritical", gk: "perfectGk" }[c.id]; if (key) state.stats[key]++; }
    const a = P.score * RULES.xp.challengePoint; xp += a; lines.push([`Score ${P.score}`, `+${a}`]);
    state.scores[c.id] = state.scores[c.id] || {};
    if (!(P.opt && P.opt.cat) && (prev == null || P.score > prev)) state.scores[c.id][k] = P.score;
    if (!(P.opt && P.opt.cat) && y != null && P.score > y && !(prev > y)) { xp += RULES.xp.beatYesterday; lines.push([`Beat yesterday's ${y}`, `+${RULES.xp.beatYesterday}`]); state.stats.beatYesterday++; }
    else if (y != null) lines.push(["Yesterday's score", String(y)]);
    if (c.id === "speed") state.stats.speedBest = Math.max(state.stats.speedBest, P.score);
    state.stats.challenges++; day().challenges++;
    if (c.id === challengeOfDay().id) day().challenge = true;
    if (perfect) { xp += 10; lines.push(["Perfect score bonus", "+10"]); }
    note = c.id === challengeOfDay().id ? "Today's challenge is ticked off." : `Today's challenge is ${actName(challengeOfDay())}. Play it to tick off your plan.`;
  } else if (m === "recall") {
    title = "Quick recall"; xp = P.score * RULES.xp.recallRight; lines.push([`Remembered (${P.score}/${total})`, `+${xp}`]);
    note = P.score === total ? "Locked in. These lessons come back later, spaced further apart." : "Missed ones come back tomorrow. That's how they stick.";
  } else if (m === "review" || m === "practice") {
    title = m === "review" ? "Word review" : "Practice"; xp = P.score * RULES.xp.reviewRight; lines.push([`Correct (${P.score}/${total})`, `+${xp}`]);
    note = "Words you miss come back sooner. Words you know come back later.";
  } else if (m === "memory") {
    title = "Review"; xp = P.score * RULES.xp.reviewRight; lines.push([`Remembered (${P.score}/${total})`, `+${xp}`]);
    if (!day().review) { day().review = true; xp += 10; lines.push(["Daily review done", "+10"]); }
    note = "Missed ones come back tomorrow. Ones you got right come back later, spaced further apart.";
  } else if (m === "inner") {
    title = { q: "Expert questions", r: "Expert riddles", w: "Lexicon test" }[P.kind];
    xp = P.score * 10; lines.push([`Correct (${P.score}/${total})`, `+${xp}`]);
    state.inner = state.inner || {}; if (state.inner[P.kind] == null || P.score > state.inner[P.kind]) { state.inner[P.kind] = P.score; if (P.score) lines.push(["New personal best", "★"]); }
    note = P.score === total ? "Flawless. Few ever manage that." : "The Inner Circle rewards persistence. Try again.";
  } else if (m === "mastery") {
    const x = P.subject, pass = P.score >= Math.min(RULES.xp.masteryPass, total), first = pass && !state.mastered[x.id];
    title = "Mastery exam"; xp = P.score * RULES.xp.masteryCorrect; lines.push([`Correct (${P.score}/${total})`, `+${xp}`]);
    if (first) { state.mastered[x.id] = today(); xp += RULES.xp.mastery; lines.push([`${x.title} mastered`, `+${RULES.xp.mastery}`]); }
    note = pass ? (first ? `You have mastered ${x.title}. It's on your Account page for good.` : "Passed again. Still a master.") : `You need ${RULES.xp.masteryPass}/10 to pass. Review the lessons you missed, then try again.`;
    P.passed = pass;
  } else if (m === "expr") {
    title = "Expression"; xp = RULES.xp.quoteRead + P.score * RULES.xp.quoteRight;
    lines.push(["Quote of the day", `+${RULES.xp.quoteRead}`], [`Correct (${P.score}/${total})`, `+${P.score * RULES.xp.quoteRight}`]);
    if (day().expr) { xp = Math.round(xp / 2); lines.push(["Replay", "½ XP"]); }
    state.quotes[P.quote.q] = state.quotes[P.quote.q] || today(); day().expr = true;
    note = "Quotes you've met come back later to test your memory.";
  } else if (m === "vocab") {
    title = "Vocabulary check";
    const p = n => P.tally[n][1] ? P.tally[n][0] / P.tally[n][1] : 0;
    const est = Math.round((8000 + 8000 * p(1) + 10000 * p(2) + 12000 * p(3)) / 500) * 500;
    state.vocab = { value: est, date: today() };
    lines.push(["Common words", `${P.tally[1][0]}/${P.tally[1][1]}`], ["Intermediate words", `${P.tally[2][0]}/${P.tally[2][1]}`], ["Advanced words", `${P.tally[3][0]}/${P.tally[3][1]}`]);
    note = `Your estimated vocabulary is about ${fmt(est)} words. It's a rough estimate from 15 questions; retake it any time.`;
  }
  if (m === "quiz" || m === "challenge" || m === "expr" || m === "mastery" || m === "inner" || m === "memory") addXp(xp);
  return { title, xp, lines, total, note, out: wrapUp() };
}
/* which pillar colours the player */
export function playerPillar() {
  if (!P) return "learn";
  return P.mode === "mastery" || P.mode === "inner" ? "practical" : P.mode === "expr" ? "expression" : P.mode === "lesson" ? (isPractical(P.l) ? "practical" : "learn") : P.mode === "challenge" ? P.c.pillar : P.mode === "quiz" ? "test" : "remember";
}

/* ============ 8. ACTIONS used by sheets ============ */
export function resetProgress() { setProfile(freshProfile()); }
export function removeWord(w) { delete state.words[w]; save(); }
export function addWordFromLibrary(w) { addWord(w, "library"); addXp(RULES.xp.wordAdd); wrapUp(); }
export function addLookupWord() {
  const L = ui.lookup; const e = entry(L.w) || L.entry;
  if (e.custom) state.custom[e.w] = e;
  state.stats.lookups++; addWord(e.w, "lookup"); addXp(RULES.xp.wordAdd); wrapUp();
  return e;
}
