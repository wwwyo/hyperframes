# Story spine — value-first narrative doctrine

Applies to the narrated, story-driven creation workflows — `/product-launch-video`, `/pr-to-video`, `/faceless-explainer`, and `/general-video` when the piece tells a story. It does **not** apply to `/music-to-video` (the track drives the arc), `/motion-graphics` (no narration — motion is the message), `/embedded-captions` and `/talking-head-recut` (the footage's story is already fixed), or `/slideshow` (the presenter owns the story). Do not force these rules onto an exempt workflow.

Each workflow's own story-design reference owns its archetypes, beat sequences, and frame vocabulary. This file owns five cross-workflow rules about **order** and **justification** — the reverse iceberg: lead with why it's valuable, not with what it is or how it was made.

## 1. The hook speaks the viewer's language

The first beat answers "why should I care" in **outcome language** — what the viewer gains, avoids, or finally understands. Subject-internal vocabulary is banned in the hook: file / function / API names for a code change; a feature list for a product; the source article's section headings for an explainer. Numbers are welcome only when they carry stakes ("40% faster cold starts"), never inventory ("23 files changed").

## 2. Reverse iceberg — value before evidence

The value claim (the brief's `message`) lands **by the second beat**. Everything after it is evidence in service of that claim — the diff, the mechanism, the feature demo, the site's screenshots. Implementation is the footnote of the story, not the spine.

Self-check on the finished beat list:

- Delete every evidence beat — the remaining beats must still state the value on their own.
- Delete the value beats — if the video still seems to work, it was a feature tour / diff readout, not a story.

Structure is value-first; the **voice** stays whatever the workflow prescribes (a PR video keeps its plain, no-hype developer voice — leading with value is an ordering decision, not a marketing register).

## 3. The storyboard is a proposal, not a listing

When Step 3 presents the plan (a checkpoint gate — `hyperframes/references/brief-contract.md` § 1):

- Open by echoing the strategy line: **"This video tells [audience] that [message]."**
- Present the frames as a markdown table, one row per frame:

  | Frame            | Beat      | On screen                                               | Why                             |
  | ---------------- | --------- | ------------------------------------------------------- | ------------------------------- |
  | 01 — Not anymore | hook · 9s | States the old pain and resolves it in the same breath. | Lands the value claim in beat 1 |

  **Why** is the frame's job in the story (from its `narrativeRole`), traced back to the message — a frame whose why cannot be traced to the message is a frame to cut, not to decorate.

- Recommendations keep their receipts (brief-contract § 3): the archetype choice, the beat count, and any beat the user might question each state their basis.

How to write the storyboard itself, and the `storyboard.html` page it is reviewed on, is `storyboard-recipe.md`.

The proposal shape — echo line → frame table → style / duration footer → "approve or adjust" — is the cheapest place to iterate: a frame change here costs 30 seconds; the same change after build costs minutes.

## 4. Visuals point back to the source

When the piece derives from concrete source material — a PR, a repo, an article, a product page — mine that material for the visual vocabulary before inventing any: its phrases, entities, verbs, and recurring motifs are the props. Each frame's key visual should be traceable to a specific line of the source, the same way its **Why** traces to the message: real filenames over generic file icons, the product's own numbers over invented ones, the article's own metaphor over a stock one.

Self-check per visual: if the prop could appear unchanged in another product's video, it didn't come from the source. Swap it for something only this subject could produce before decorating it.

## 5. A reversal must resolve into a replacement frame

When the piece corrects a belief — a counterintuitive hook, a story-explainer turn, a fix-explainer's bug — the turn is not "and it's actually the opposite." A bare denial leaves the viewer with nothing to hold: the piece reads as a list of facts with a contradiction dropped in, and the climax lands weak.

Design the turn as **setup → assumption → reversal → reframe**: the reversal hands back a new frame that explains the same facts better ("it's not X — it's Y, which is why Z"). That replacement frame is the payoff; the value claim (rule 2) should ride on it, not on the facts it overturns.

Self-check: cover the reversal and read the rest. If the viewer still holds the old belief, the turn denied without reframing. A reframe weaker than the misconception it corrects is a turn to redesign, not to decorate.
