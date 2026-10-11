/* Turns the web app's inline SVG icons into data for react-native-svg (src/data/icons.json). */
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "..", "index.html"), "utf8");
const a = html.indexOf("const S = 'fill="), b = html.indexOf("\n};", html.indexOf("const ICON = {")) + 3;
const ICON = new Function(html.slice(a, b) + "\nreturn ICON;")();
const out = {};
for (const [name, svg] of Object.entries(ICON)) {
  if (name === "logo") continue;
  const head = svg.match(/^<svg([^>]*)>/)[1];
  const fill = /fill="currentColor"/.test(head) && !/stroke="currentColor"/.test(head);
  const sw = +(head.match(/stroke-width="([\d.]+)"(?![\s\S]*stroke-width)/) || [0, 2])[1];
  const body = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const els = [...body.matchAll(/<(path|circle|rect|line|polyline|ellipse)\s([^>]*?)\/?>/g)].map(m => {
    const attrs = {}; for (const [, k, v] of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[k] = v;
    return [m[1], attrs];
  });
  out[name] = { fill, sw, els };
}
fs.writeFileSync(path.join(__dirname, "..", "src", "data", "icons.json"), JSON.stringify(out));
console.log(Object.keys(out).length, "icons");
