#!/bin/bash
set -e
names=(3f 3g 3h 3i); F=(0 228 372 612 827)
for i in 0 1 2 3; do
  a=${F[$i]}; b=${F[$((i+1))]}
  ffmpeg -v error -y -i work2/master.mp4 -vf "trim=start_frame=${a}:end_frame=$((b+1)),setpts=PTS-STARTPTS" -an -r 30 \
    -c:v h264_videotoolbox -profile:v high -b:v 40M -pix_fmt yuv420p -movflags +faststart "out/${names[$i]}.mp4"
  echo "${names[$i]} master frames ${a}..${b}"
done
for n in "${names[@]}"; do
  echo "$n: $(ffprobe -v error -count_frames -show_entries stream=codec_type,width,height,r_frame_rate,nb_read_frames:format=duration -of compact "out/$n.mp4" | tr '\n' ' ')"
done
