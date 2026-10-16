// セッション一覧から指定の時刻のセッションを開き、判定と出典つきの出力を見せる区間だけを録り直す。
// record.mjs の 07-B-session が書き切れずに壊れたときの補い（セッションは本番に残っている）
// usage: node scripts/record/session.mjs <out-dir> <HH:MM:SS>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const DASH = "https://agent-calendar-785713600547.asia-northeast1.run.app/w/demo";
const out = resolve(process.argv[2]);
const at = process.argv[3];
const ab = (...a) => execFileSync("agent-browser", a, { encoding: "utf8" }).trim();
const js = (code) => JSON.parse(ab("eval", code) || "null");
const wait = (ms) => ab("wait", String(ms));
const marks = [];
let t0 = 0;
const mark = (label, extra = {}) => {
  marks.push({ label, t: Number(((Date.now() - t0) / 1000).toFixed(2)), ...extra });
  console.log(JSON.stringify(marks.at(-1)));
};
const scrollTo = (y, ms) =>
  js(`(async () => { const s = scrollY, d = ${y} - s, n = ${Math.round(ms / 16)};
    for (let i = 1; i <= n; i++) { const p = i / n; scrollTo(0, s + d * (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2));
      await new Promise((r) => setTimeout(r, 16)); } return scrollY; })()`);

ab("open", DASH);
ab("set", "viewport", "1920", "1080");
ab("wait", "--load", "networkidle");
const sel = `a[href*="/sessions/"]`;
const rowY = () =>
  js(`(() => { const a = [...document.querySelectorAll('${sel}')].find((e) => e.innerText.includes("${at}"));
    if (!a) return null; return a.getBoundingClientRect().top + scrollY; })()`);
const y0 = rowY();
if (y0 == null) throw new Error(`セッションが見つからない: ${at}`);
scrollTo(y0 - 140, 10);
wait(500);
ab("record", "start", join(out, "09-B-session.mp4"), "--cursor", "--fps", "30");
t0 = Date.now();
try {
  wait(1500);
  const b = js(`(() => { const a = [...document.querySelectorAll('${sel}')].find((e) => e.innerText.includes("${at}"));
    const r = a.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, text: a.innerText }; })()`);
  mark("row", { box: b });
  wait(1500);
  const x = Math.round(b.x + b.w / 2);
  const y = Math.round(b.y + b.h / 2);
  ab("mouse", "move", String(x), String(y), "--duration", "600", "--steps", "30");
  wait(200);
  mark("open-session", { click: { x, y } });
  ab("mouse", "down");
  ab("mouse", "up");
  ab("wait", "--load", "networkidle");
  mark("session-page", { text: js("document.body.innerText.slice(0, 4000)") });
  wait(3000);
  const yo = js(`(() => { const h = [...document.querySelectorAll("h2, h3, h4")].find((e) => /判定/.test(e.innerText));
    return h ? h.getBoundingClientRect().top + scrollY : null; })()`);
  if (yo != null) scrollTo(yo - 140, 1400);
  mark("judgement");
  wait(4000);
  const yt = js(`(() => { const h = [...document.querySelectorAll("h2, h3, h4")].find((e) => /^出力/.test(e.innerText.trim()));
    return h ? h.getBoundingClientRect().top + scrollY : null; })()`);
  if (yt != null) scrollTo(yt - 140, 1400);
  mark("output", {
    box: js(`(() => { const h = [...document.querySelectorAll("h2, h3, h4")].find((e) => /^出力/.test(e.innerText.trim()));
      const r = h.nextElementSibling.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`),
  });
  wait(6000);
  mark("end");
} finally {
  ab("record", "stop");
  writeFileSync(join(out, "marks-session.json"), JSON.stringify(marks, null, 2));
  ab("close");
}
