# Data in Motion

Light guidance for data and stats in video compositions. `house-style.md` handles aesthetics; this just addresses data-specific pitfalls.

## Visual Continuity

When successive stats belong to the same concept (Q1 → Q2 → Q3 → Q4, or three metrics for the same product), keep them in the same visual space with the same aesthetic. Only the VALUE changes. An aesthetic change should signal a new concept, not just a new number.

## One Hue, One Meaning

When color carries a category — node type in a tree, a series in a chart, the parts of a whole — the mapping is data, not decoration. Fix one hue per meaning for the life of the piece and across every cut of a series: a viewer who learned "blue = 事業" from one cut reads the next cut's blue the same way.

A hue already claimed by a role must not also mark a second role, a selection or highlight state, or a verdict glyph. Reassigning a role's hue mid-series (a palette change, a later cut written to a different brief) silently re-labels every other element that shares the hue — and the misread is invisible in a still frame, because the geometry is right. Give the new role an unclaimed hue, or a lightness step of one, and re-audit the whole mapping every time a hue moves.

## Numbers Need Visual Weight

A number on its own floats in empty space. Pair every metric with a visual element that gives it presence — a proportional fill bar, a background color shift, a shape that represents the value, a progress ring. The visual doesn't need to be a chart — it just needs to fill the frame and make the data feel tangible rather than just text on a background.

## Avoid Web Patterns

- **No pie charts** — hard to compare, looks like PowerPoint
- **No multi-axis charts** — viewer can't study intersections in a 3-second window
- **No 6-panel dashboards** — 2-3 related metrics side-by-side is fine, 6+ is a web pattern
- **No gridlines, tick marks, or legends** — visual noise that adds nothing in motion
- **No chart library output** — build with GSAP + SVG/CSS, not D3 or Chart.js
