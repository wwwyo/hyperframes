// 定期の仕事の予定を開いて「判定」を見せる区間だけを録り直す。
// record.mjs の 05-B-judge が書き切れずに壊れたときの補い（予定は本番に残っている）
// usage: node scripts/record/judge.mjs <out-dir> <HH:MM>
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const DASH = "https://agent-calendar-785713600547.asia-northeast1.run.app/w/demo";
const out = resolve(process.argv[2]);
const hhmm = process.argv[3];
const ab = (...a) => execFileSync("agent-browser", a, { encoding: "utf8" }).trim();
const js = (code) => JSON.parse(ab("eval", code) || "null");
const wait = (ms) => ab("wait", String(ms));
const marks = [];
let t0 = 0;
const mark = (label, extra = {}) => {
  marks.push({ label, t: Number(((Date.now() - t0) / 1000).toFixed(2)), ...extra });
  console.log(JSON.stringify(marks.at(-1)));
};

ab("open", DASH);
ab("set", "viewport", "1920", "1080");
ab("wait", "--load", "networkidle");
const re = `^${hhmm}[\\s\\S]*生成 AI ニュース`;
const box = () =>
  js(`(() => { const re = new RegExp(${JSON.stringify(re)});
    const e = [...document.querySelectorAll(".ev")].find((x) => re.test(x.innerText.trim()));
    if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
if (!box()) throw new Error(`予定が見つからない: ${hhmm}`);
ab("record", "start", join(out, "08-B-judge.mp4"), "--cursor", "--fps", "30");
t0 = Date.now();
try {
  wait(1500);
  const b = box();
  const x = Math.round(b.x + b.w / 2);
  const y = Math.round(b.y + b.h / 2);
  ab("mouse", "move", String(x), String(y), "--duration", "600", "--steps", "30");
  wait(200);
  mark("open-event", { click: { x, y }, box: b });
  ab("mouse", "down");
  ab("mouse", "up");
  wait(700);
  const d = js(`(() => { const r = document.querySelector("dialog[open]").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  mark("judgement", { box: d, text: js(`document.querySelector("dialog[open]").innerText`) });
  wait(7000);
  mark("end");
} finally {
  ab("record", "stop");
  writeFileSync(join(out, "marks-judge.json"), JSON.stringify(marks, null, 2));
  ab("close");
}
