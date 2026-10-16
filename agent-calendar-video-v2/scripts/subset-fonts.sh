#!/bin/sh
# compositions と index.html に出てくる文字だけで Google Sans と Noto Sans JP を subset する。
# 元のフォントは src-fonts/（git に入れない。取得元は README の節を参照）。
# fonttools は exact pin。cooldown 7 日を満たす版（4.66.1, 2026-09-29）。
set -eu
cd "$(dirname "$0")/.."
mkdir -p .hyperframes; chars=.hyperframes/subset-chars.txt
cat index.html compositions/*.html > "$chars"
# ASCII は常に全部入れる（URL・数字・記号）
uvx --from fonttools==4.66.1 pyftsubset src-fonts/GoogleSans.ttf \
  --text-file="$chars" --unicodes="U+0020-007E,U+2014,U+2192,U+00B7,U+2713,U+2715" \
  --layout-features='*' --output-file=assets/fonts/GoogleSans-subset.ttf
uvx --from fonttools==4.66.1 pyftsubset src-fonts/NotoSansJP.ttf \
  --text-file="$chars" --unicodes="U+0020-007E,U+3000-303F,U+FF01-FF5E,U+2192,U+30FC,U+25B6" \
  --layout-features='*' --output-file=assets/fonts/NotoSansJP-subset.ttf
rm -f "$chars"
cp src-fonts/OFL-GoogleSans.txt src-fonts/OFL-NotoSansJP.txt assets/fonts/
ls -la assets/fonts
