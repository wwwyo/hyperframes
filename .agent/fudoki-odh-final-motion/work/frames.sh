#!/bin/bash
set -e
for n in 3a 3b 3c 3c2 3d 3e; do
  nf=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.mp4 | tr -d ',')
  for pair in "start:0" "mid:$((nf/2))" "end:$((nf-1))"; do
    k=${pair%%:*}; f=${pair##*:}
    ffmpeg -v error -y -i out/$n.mp4 -vf "select=eq(n\,$f)" -frames:v 1 out/frames/$n-$k.png
  done
done
ls out/frames
