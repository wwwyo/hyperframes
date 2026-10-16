# agent-calendar 提出用デモ動画 — 構成と原稿（3分）

第5回 Agentic AI Hackathon（Zenn）の審査員に向けた提出動画。1920x1080・30fps・180秒。

- composition: `project/index.html`（1ファイル。シーンは `<section class="clip">`）
- 素材の正本（読むだけ）: agent-calendar repo の `docs/submission/zenn-hackathon.md`（課題・解決・特徴の文言）、`design.md`（視覚値）、`AGENTS.md` の Story、`docs/prd/agent-dispatch/prd.md`（自然言語・cloud sandbox・local agent）
- 音声: ナレーションは原稿と字幕まで。TTS・BGM・効果音は入れていない（音声トラックなし）。後で本人の声を録るなら、その実測の秒数でシーンを詰め直す
- 文言の規則: 課題・解決は提出文の下書きに沿い、新しい主張を足さない。YAML で payload を書く旧仕様は見せない（人がカレンダーに書くのは自然言語だけ）

## 全体の流れ

| # | 秒 | 長さ | シーン | 状態 |
|---|---|---|---|---|
| 1 | 0–8 | 8s | 冒頭（タイトル） | 実装済み |
| 2 | 8–42 | 34s | 課題（3つ） | 実装済み |
| 3 | 42–78 | 36s | 解決（カレンダーが agent の起動台帳になる） | 実装済み（※1） |
| 4 | 78–88 | 10s | デモ導入 | 実装済み |
| 5a | 88–104 | 16s | デモ: 締切を書く → 準備が始まる | placeholder |
| 5b | 104–116 | 12s | デモ: 承認待ちを承認する | placeholder |
| 5c | 116–129 | 13s | デモ: 定期の仕事を自然言語で置く（cloud） | placeholder（agent-dispatch 依存） |
| 5d | 129–142 | 13s | デモ: 本人の Mac の agent が起動する（local） | placeholder（agent-dispatch 依存） |
| 6 | 142–162 | 20s | 安全性 | placeholder |
| 7 | 162–174 | 12s | 構成（Google Cloud） | placeholder |
| 8 | 174–180 | 6s | まとめ | placeholder |

※1 シーン3の「cloud の sandbox か自分の Mac で agent が動く」と、起動用カレンダーの自然言語の notes は agent-dispatch（実装中）の内容。提出時点で動いていなければ、この1行の字幕と executor の chip を外す。

ナレーションの目安は 1 秒あたり 5〜6 字。字幕は composition の `.cap`（画面下）に入れてあり、原稿とずれたら両方を直す。

## シーン

### 1. 冒頭（0–8s）

- 画面: 紫の slab が1枚。上に mono で「第5回 Agentic AI Hackathon · Zenn」、wordmark `agent-calendar`、その下に一文
- 原稿: agent-calendar。予定と締切を書いておくと、agent が準備と定期の仕事を自分で始めます。

### 2. 課題（8–42s）

hairline の3列の枠。語りに合わせて1列ずつ出す。

| 列 | 出る秒 | 見出し | 絵 |
|---|---|---|---|
| 01 | 8.4 | 何日前から準備するかは、人が覚えておくしかない | 日付の目盛りに「期日」。「今日」の印が「30日前」を通り過ぎ、気づいた時には残りが少ない |
| 02 | 19.6 | 定期の仕事の設定は、vendor ごとに散らばる | cron・routines・automation の chip が「自分の予定」とつながらずに散らばる |
| 03 | 31.6 | 自動で動かすほど、不安になる | 予定の notes に紛れ込んだ一文が強調され、「書き換え？」「操られる？」の問い |

原稿:

- 締切はカレンダーに書けます。でも、何日前から何を準備するかは、人が覚えておくしかありません。気づいた時には、間に合わない。
- agent に定期の仕事を任せる設定は、vendor ごとの cron・routines・automation に散らばっています。いつ何が動くのかを、自分の予定と並べて見られません。
- そして agent を自動で動かすほど、勝手に予定を書き換えないか、カレンダーに紛れ込んだ文章に操られないかが、不安になります。

### 3. 解決（42–78s）

- 画面: 見出し「Google Calendar を、そのまま agent の起動台帳にする」→ 左に記録用カレンダー（事実）、右に起動用カレンダー（命令）のカードを順に出す → 最後に「足す・動かす・消す」の一行
  - 記録用: 予定「パスポート更新」・notes `準備: 30日前` → 「期日の30日前 agent が準備を始める」→ 「準備の予定を提案」
  - 起動用: 繰り返し予定「朝の締切チェック」・notes「今週の締切を確認して、遅れている準備を教えて」（自然言語）→「その時刻に agent が動く」→ chip「cloud の sandbox」「本人の Mac」（※1）
- 原稿:
  - agent-calendar は、Google Calendar をそのまま agent の起動台帳にします。
  - 記録用のカレンダーで、締切の notes に「準備: 30日前」と1行書くと、期日の30日前に、agent が準備を始めます。
  - 起動用のカレンダーに繰り返しの予定を置き、やってほしいことを言葉で書くと、その時刻に、cloud の sandbox か自分の Mac で agent が動きます。
  - 人は新しい画面を覚えなくていい。いつもの Google Calendar で予定を足し、動かし、消せば、agent の動きが変わります。

### 4. デモ導入（78–88s）

- 画面: 「デモ — 3つの操作」。1 締切を書く / 2 承認する / 3 定期の仕事を置く を順に出す。下に mono でデプロイ URL
- 原稿: では、実際に動かします。締切を書く、承認する、定期の仕事を置く。この3つを見てください。

### 5a. デモ: 締切を書く（88–104s）— placeholder

- 収録するもの: デプロイ先の dashboard の「試す」フォーム。「締切を書く」で期日を2週間後・準備を30日前にして書く → 1分以内に「遅れて登録」で準備が始まり、実行記録（入力・tool 呼び出し・出力・token）が出る。待ち時間は早送りか切る
- 原稿（案）: 締切を書きます。期日は2週間後、準備は30日前。もう過ぎているので、agent はすぐに準備を始め、「遅れて登録」と伝えます。実行記録には、入力と tool 呼び出し、出力が残ります。

### 5b. デモ: 承認する（104–116s）— placeholder

- 収録するもの: 承認待ちに出た「記録用カレンダーに予定を追加」の提案 → 「承認して追加」を押す → Google Calendar の記録用カレンダーに予定が入った画面
- 原稿（案）: agent はカレンダーに直接書けません。提案は承認待ちに入り、承認したときだけ、記録用のカレンダーに書かれます。

### 5c. デモ: 定期の仕事を自然言語で置く（116–129s）— placeholder・agent-dispatch 依存

- 収録するもの: 起動用カレンダー（またはデモ用フォーム）に自然言語で定期の仕事を書く → dashboard に発火前の判定結果（実行先 cloud・agent 種別・prompt）が出る → 時刻に発火し、sandbox で動いた回の実行記録が出る
- 原稿（案）: 定期の仕事は、言葉で書くだけです。何がどこで動くかは、発火の前に dashboard で確かめられます。時刻が来ると、使い捨ての sandbox で agent が起動します。

### 5d. デモ: 本人の Mac で agent が起動する（129–142s）— placeholder・agent-dispatch 依存

- 収録するもの: 起動用カレンダーに「codex で agent-calendar の依存の更新を確かめて。local で」と書く → 判定結果（local・codex・target）→ 時刻に本人の Mac で codex が起動する画面 → 出力が実行記録に残る
- 原稿（案）: 「local で」と書けば、自分の Mac で codex が起動します。agent を差し替えても、カレンダーの書き方は変わりません。

### 6. 安全性（142–162s）— placeholder

- 作る絵: 3つの守りを順に出す。(1) 記録用＝事実・起動用＝命令の分離と作成者の allowlist、(2) 副作用はすべて承認待ち、agent は起動用カレンダーに書けない、(3) cloud の sandbox はカレンダー・Firestore の権限も API key も持たない。記録用の notes は信頼しないデータとして囲んで渡す
- 原稿（案）: 記録用のカレンダーは事実、起動用のカレンダーは命令。命令として読むのは、起動用の、許可した人が作った予定だけです。記録用の notes は信頼しないデータとして渡し、副作用はすべて承認待ちを通ります。cloud の agent は sandbox で動き、カレンダーにも鍵にも触れません。
- 実装するとき: シーン2の03（紛れ込んだ文章）の絵を再登場させ、それが起動につながらないことを見せると課題と対になる

### 7. 構成（162–174s）— placeholder

- 作る絵: Cloud Scheduler（1分ごと /tick、LLM なし）→ Cloud Run（runner・dashboard）→ Firestore / Vertex AI（Gemini）、Google Calendar API を service account で。agent-dispatch が入れば、実行ごとの Cloud Run Job（sandbox）と local worker を足す
- 素材: `docs/architecture.png` は旧仕様（payload 検証）と明るい配色なので、そのまま貼らず design.md の配色で描き直す
- 原稿（案）: Cloud Scheduler が1分ごとに差分を取り、この部分は LLM を呼びません。Cloud Run と Firestore、Vertex AI の Gemini だけの構成で、鍵も API key も持ちません。

### 8. まとめ（174–180s）— placeholder

- 作る絵: 冒頭の slab に戻り、一文とデプロイ URL・リポジトリ URL
- 原稿（案）: いつもの Google Calendar で、agent を動かす。agent-calendar でした。

## 視覚（design.md から）

- 背景 `#0f0b16`、文字 `#f0eaf7`、補足 `#9e93ac`、hairline `#2a2137` / `#3c3050`、gutter の点 `#241c30`
- 彩度は紫 `#a855f7` 一色。面として塗るのは冒頭の slab だけ。失敗は `#ff5f7a`、成功は `#4de0a8`
- 欧文 Inter Tight・mono Geist Mono（Google Fonts）、和文はヒラギノ角ゴ。見出しは 500 で `palt`
- 枠は hairline と中空の corner tick。mono は機械の出力（notes の生値・URL・時刻）だけ
- 動き: 流れは左向き。シーンの継ぎ目は左へ抜けて右から入る。中身は語りに合わせて段階的に出す

## プレビューと検証

```bash
cd .agent/agent-calendar-demo/project
node ../../../packages/cli/bin/hyperframes.mjs lint
node ../../../packages/cli/bin/hyperframes.mjs check
node ../../../packages/cli/bin/hyperframes.mjs preview          # Studio で再生
node ../../../packages/cli/bin/hyperframes.mjs snapshot --at 4,20,30,40,60,74,84,95
```
