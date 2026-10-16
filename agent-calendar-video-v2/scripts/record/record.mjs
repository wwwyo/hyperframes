// 本番の dashboard を agent-browser で 1920x1080 の動画として収録する。
// 流れ A（締切の準備）と流れ B（定期の仕事）を 1 本で通し、各操作の時刻・クリック位置を marks.json に残す。
// 待ち時間は実際に待って収録し、編集（compositions/s5-demo.html）で詰める。
//
// agent-browser の録画は PATH 上の ffmpeg（libx264 つき）を使う。mise の ffmpeg には libx264 がないので、
// repo の依存に入っている ffmpeg-static を PATH の先頭に置いて動かす:
//   PATH="$(dirname "$(node -p 'require.resolve("ffmpeg-static")')"):$PATH" \
//     node scripts/record/record.mjs <出力ディレクトリ>
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const BASE = "https://agent-calendar-785713600547.asia-northeast1.run.app";
const DASH = `${BASE}/w/demo`;
const out = resolve(process.argv[2] || "");
if (!process.argv[2]) throw new Error("出力ディレクトリを渡す");
mkdirSync(out, { recursive: true });
process.env.AGENT_BROWSER_SESSION ||= "agent-calendar-video-record";

function ab(...args) {
  return execFileSync("agent-browser", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}
function js(code) {
  const res = JSON.parse(ab("eval", code, "--json"));
  if (!res.success) throw new Error(`eval failed: ${res.error}`);
  return res.data.result;
}
const wait = (ms) => ab("wait", String(ms));

// 待ちの区間は低い fps の別ファイルに分ける（1 本で長く録ると encoder が遅れるため）。
// marks の t は、その区間のファイルの先頭からの秒
let t0 = 0;
let seg = null;
const marks = [];
function segment(name, fps) {
  const file = join(out, `${name}.mp4`);
  const prev = seg && join(out, `${seg}.mp4`);
  ab("record", seg ? "restart" : "start", file, "--cursor", "--fps", String(fps));
  // 前の区間のファイルが書き切れているか（moov が無いと再生できない）を確かめる
  if (prev) {
    try {
      execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", prev]);
    } catch {
      console.error(`壊れた区間: ${prev}`);
    }
  }
  t0 = Date.now();
  seg = name;
  marks.push({ label: `segment:${name}`, seg, t: 0, fps });
}
function mark(label, extra = {}) {
  const m = { label, seg, t: Number(((Date.now() - t0) / 1000).toFixed(2)), url: js("location.href"), ...extra };
  marks.push(m);
  console.log(JSON.stringify(m));
  writeFileSync(join(out, "marks.json"), JSON.stringify(marks, null, 2));
}
// 条件に合う最初の要素に印を付け、その selector と画面上の位置を返す
let seq = 0;
function tag(selector, textRe, { visible = true, last = false } = {}) {
  const id = `r${++seq}`;
  const box = js(`(() => {
    const re = ${textRe ? `new RegExp(${JSON.stringify(textRe)})` : "null"};
    let els = [...document.querySelectorAll(${JSON.stringify(selector)})].filter((e) => {
      if (${visible} && !(e.offsetWidth || e.offsetHeight || e.getClientRects().length)) return false;
      return !re || re.test((e.innerText || e.textContent || "").trim());
    });
    const el = ${last} ? els[els.length - 1] : els[0];
    if (!el) return null;
    el.setAttribute("data-rec", "${id}");
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  })()`);
  return box && { sel: `[data-rec="${id}"]`, box };
}
function boxOf(sel) {
  return js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })()`);
}
function click(label, selector, textRe, opts) {
  const t = tag(selector, textRe, opts);
  if (!t) throw new Error(`見つからない: ${label} ${selector} ${textRe || ""}`);
  ab("scrollintoview", t.sel);
  wait(300);
  const b = boxOf(t.sel);
  ab("mouse", "move", String(Math.round(b.x + b.w / 2)), String(Math.round(b.y + b.h / 2)), "--duration", "450", "--steps", "24");
  wait(150);
  mark(label, { click: { x: b.x + b.w / 2, y: b.y + b.h / 2 }, box: b });
  // dashboard は定期的に描き直されて印が消えることがあるので、そのときはカーソル位置で押す
  try {
    ab("click", t.sel);
  } catch {
    ab("mouse", "down");
    ab("mouse", "up");
  }
}
function typeInto(label, selector, text) {
  const t = tag(selector, null);
  ab("click", t.sel);
  ab("fill", t.sel, "");
  mark(label, { box: boxOf(t.sel) });
  ab("type", t.sel, text);
}
function smoothScrollTo(y, ms = 1200) {
  js(`(() => { const from = scrollY, to = ${y}, ms = ${ms}, s = performance.now();
    const step = (n) => { const k = Math.min(1, (n - s) / ms); const e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2;
      scrollTo(0, from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); return true; })()`);
  wait(ms + 150);
}
function scrollToText(selector, textRe, offset = 120, ms = 1200) {
  const y = js(`(() => { const re = new RegExp(${JSON.stringify(textRe)});
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((e) => re.test(e.innerText || ""));
    return el ? el.getBoundingClientRect().top + scrollY - ${offset} : null; })()`);
  if (y != null) smoothScrollTo(Math.max(0, Math.round(y)), ms);
}
const sessionLinks = () =>
  js(`[...document.querySelectorAll('a[href*="/sessions/"]')].map((a) => [a.getAttribute("href"), a.innerText])`);
const pad = (n) => String(n).padStart(2, "0");

ab("open", DASH);
ab("set", "viewport", "1920", "1080");
ab("wait", "--load", "networkidle");
function assertNotLimited() {
  const u = decodeURIComponent(js("location.search"));
  if (u.includes("上限")) throw new Error(`本番の書き込みが上限で拒まれた: ${u}`);
}
// ONLY_B=1 のときは流れ B だけを録る（流れ A を録り終えたあと、B だけ撮り直すため）
const onlyB = process.env.ONLY_B === "1";
// RESUME_B=1 のときは、登録済みの定期の仕事が発火するのを待つ区間から録る
const resumeB = process.env.RESUME_B === "1";
if (resumeB) ab("wait", "--load", "networkidle");
else segment(onlyB ? "03b-B-form" : "01-A-form", 30);
try {
  if (!onlyB && !resumeB) {
  // ---------- 流れ A: 締切の準備 ----------
  mark("A:dashboard");
  wait(2500);
  const before = new Set(sessionLinks().map(([h]) => h));

  click("A:open-add", "button", "^予定を追加$");
  wait(800);
  click("A:tab-deadline", "dialog[open] button", "^締切$");
  wait(600);
  typeInto("A:title", "dialog[open] input[type=text], dialog[open] input:not([type])", "パスポート更新の期限");
  wait(500);
  const form = js(`(() => { const d = document.querySelector("dialog[open]");
    const vis = [...d.querySelectorAll("input")].filter((e) => e.offsetWidth);
    const r = d.getBoundingClientRect();
    return { due: vis.find((e) => e.type === "date").value, prep: vis.find((e) => e.type === "number")?.value ?? vis[2].value,
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }; })()`);
  mark("A:form-filled", form);
  wait(2000);
  click("A:submit", "dialog[open] button", "記録用カレンダーに追加");
  ab("wait", "--load", "networkidle");
  mark("A:submitted");
  assertNotLimited();
  wait(1500);

  // 期日の週へ移る
  const dueDate = new Date(`${form.due}T00:00:00+09:00`);
  const weeks = Math.round((dueDate - Date.now()) / (7 * 864e5));
  for (let i = 0; i < weeks; i++) {
    click(`A:next-week-${i}`, "button", "^→$");
    wait(900);
  }
  const dueEv = tag(".ev", "パスポート更新の期限", { last: true });
  mark("A:deadline-on-calendar", { box: dueEv && dueEv.box });
  wait(3500);
  click("A:back-today", "button", "^今日$");
  wait(800);

  // セッション一覧へ。準備のセッションが出るまで実際に待つ
  scrollToText("h2", "^セッション", 100);
  segment("02-A-wait", 5);
  mark("A:waiting-session");
  let newHref = null;
  for (let i = 0; i < 300 && !newHref; i++) {
    wait(1000);
    for (const [h, text] of sessionLinks()) {
      if (!before.has(h) && text.includes("パスポート更新の期限") && /成功|失敗/.test(text)) newHref = h;
    }
  }
  if (!newHref) throw new Error("準備のセッションが 5 分で出なかった");
  segment("03-A-session", 30);
  const rowA = `a[href="${newHref}"]`;
  mark("A:session-appeared", { box: boxOf(rowA), text: js(`document.querySelector('${rowA}').innerText`) });
  wait(2500);
  click("A:open-session", rowA);
  ab("wait", "--load", "networkidle");
  mark("A:session-page");
  wait(2500);
  scrollToText("h3", "^入力", 140, 1400);
  mark("A:input");
  wait(4500);
  scrollToText("h3", "^tool", 140, 1400);
  mark("A:tool");
  wait(4000);
  scrollToText("h3", "^出力", 140, 1400);
  mark("A:output");
  wait(4000);
  scrollToText("h2", "^提案", 140, 1400);
  const propText = js(`(() => { const h = [...document.querySelectorAll("h2")].find((e) => e.textContent.includes("提案"));
    return h ? h.parentElement.innerText : ""; })()`);
  mark("A:proposals", { text: propText });
  wait(3000);
  click("A:approve", "button", "承認して追加");
  ab("wait", "--load", "networkidle");
  wait(1500);
  mark("A:approved", { text: js(`document.body.innerText.slice(-1500)`) });
  wait(2500);

  // 提案の予定が記録用カレンダーに入ったことを週表示で見せる
  const m = propText.match(/(\d{4}-\d{2}-\d{2})/);
  ab("open", DASH);
  ab("wait", "--load", "networkidle");
  mark("A:back-dashboard", { proposedDate: m && m[1] });
  wait(1200);
  const firstLine = propText.split("\n").find((l) => /\d{4}-\d{2}-\d{2}/.test(l)) || "";
  const propTitle = firstLine.replace(/\s*\d{4}-\d{2}-\d{2}.*/, "").trim();
  if (m) {
    const monday = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
      return x;
    };
    const w = Math.round((monday(new Date(`${m[1]}T00:00:00+09:00`)) - monday(new Date())) / (7 * 864e5));
    for (let i = 0; i < w; i++) {
      click(`A:next-week2-${i}`, "button", "^→$");
      wait(900);
    }
  }
  wait(1000);
  const propEv = tag(".ev", propTitle.slice(0, 6));
  mark("A:proposal-on-calendar", { title: propTitle, box: propEv && propEv.box });
  wait(4500);
  click("A:back-today2", "button", "^今日$");
  wait(1000);
  } else {
    mark("B:dashboard");
    wait(2000);
  }

  // ---------- 流れ B: 定期の仕事 ----------
  const beforeB = new Set(sessionLinks().map(([h]) => h));
  if (!resumeB) {
  click("B:open-add", "button", "^予定を追加$");
  wait(800);
  click("B:tab-automation", "dialog[open] button", "^定期の仕事$");
  wait(600);
  typeInto("B:title", "dialog[open] input[type=text], dialog[open] input:not([type])", "生成 AI ニュースのまとめ");
  // 開始は 4 分後（判定が済んで発火前に見せる時間を取る）
  const st = new Date(Date.now() + 4 * 60e3);
  const local = `${st.getFullYear()}-${pad(st.getMonth() + 1)}-${pad(st.getDate())}T${pad(st.getHours())}:${pad(st.getMinutes())}`;
  // datetime-local は fill では入らないので、値を直接入れて input・change を出す
  const dt = tag("dialog[open] input[type=datetime-local]", null);
  js(`(() => { const el = document.querySelector('${dt.sel}'); el.value = "${local}";
    el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
    return el.value; })()`);
  typeInto("B:notes", "dialog[open] textarea", "今週の生成 AI のニュースを3つ調べて、要点を1行ずつまとめて。");
  mark("B:form-filled", { start: local, box: boxOf("dialog[open]") });
  wait(2000);
  click("B:submit", "dialog[open] button", "起動用カレンダーに追加");
  ab("wait", "--load", "networkidle");
  mark("B:submitted");
  assertNotLimited();
  if (!decodeURIComponent(js("location.search")).includes("追加した")) throw new Error("定期の仕事を追加できなかった");
  wait(1500);
  segment("04-B-judge-wait", 5);

  // 判定が済むまで待つ（予定を開いて「判定」に実行先が出るまで）
  const hhmm = local.slice(11);
  const evRe = `^${hhmm}[\\s\\S]*生成 AI ニュース`;
  let judged = false;
  for (let i = 0; i < 40 && !judged; i++) {
    judged = js(`(async () => { const re = new RegExp(${JSON.stringify(evRe)});
      const ev = [...document.querySelectorAll(".ev")].find((e) => re.test(e.innerText.trim()));
      if (!ev) return false; ev.click(); await new Promise((r) => setTimeout(r, 400));
      const d = document.querySelector("dialog[open]"); const ok = !!d && d.innerText.includes("実行先");
      d?.querySelector("[data-close-ev]")?.click(); return ok; })()`);
    if (!judged) {
      wait(8000);
      ab("open", DASH);
      ab("wait", "--load", "networkidle");
    }
  }
  segment("05-B-judge", 30);
  mark("B:judged", { judged });
  wait(1000);
  click("B:open-event", ".ev", evRe);
  wait(700);
  mark("B:judgement", { box: boxOf("dialog[open]"), text: js(`document.querySelector("dialog[open]").innerText`) });
  wait(6000);
  ab("press", "Escape");
  mark("B:close-event");
  wait(800);
  }

  // 開始時刻に発火し、cloud の sandbox で動いたセッションが出るまで待つ
  scrollToText("h2", "^セッション", 100);
  if (resumeB) wait(1500);
  segment("06-B-wait", 5);
  mark("B:waiting-session");
  let hrefB = null;
  let started = false;
  for (let i = 0; i < 600 && !hrefB; i++) {
    wait(1000);
    for (const [h, text] of sessionLinks()) {
      if (beforeB.has(h) || !text.includes("生成 AI ニュースのまとめ")) continue;
      if (!started) {
        started = true;
        mark("B:session-started", { box: boxOf(`a[href="${h}"]`), text });
      }
      if (/成功|失敗/.test(text)) hrefB = h;
    }
  }
  if (!hrefB) throw new Error("定期の仕事のセッションが 10 分で終わらなかった");
  segment("07-B-session", 30);
  const rowB = `a[href="${hrefB}"]`;
  mark("B:session-done", { box: boxOf(rowB), text: js(`document.querySelector('${rowB}').innerText`) });
  wait(2500);
  click("B:open-session", rowB);
  ab("wait", "--load", "networkidle");
  mark("B:session-page", { text: js("document.body.innerText.slice(0, 5000)") });
  wait(2500);
  scrollToText("h3", "^出力", 140, 1600);
  mark("B:output");
  wait(6000);
  smoothScrollTo(js("document.documentElement.scrollHeight - innerHeight"), 2500);
  mark("B:output-bottom");
  wait(4000);
  mark("end");
} catch (e) {
  marks.push({ label: "error", t: (Date.now() - t0) / 1000, message: String(e && e.message) });
  console.error(e);
} finally {
  try {
    ab("record", "stop");
  } catch (e) {
    console.error(String(e && e.stderr));
  }
  writeFileSync(join(out, "marks.json"), JSON.stringify(marks, null, 2));
  ab("close");
}
