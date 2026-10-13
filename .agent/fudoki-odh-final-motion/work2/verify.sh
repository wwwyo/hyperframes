#!/bin/bash
set -e
T=work2/verify; rm -rf $T; mkdir -p $T
names=(3f 3g 3h 3i)
for n in "${names[@]}"; do
  nf=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/$n.mp4 | tr -d ",")
  ffmpeg -v error -y -i out/$n.mp4 -vf "select=eq(n\,$((nf-1)))" -frames:v 1 $T/$n-last.png
  ffmpeg -v error -y -i out/$n.mp4 -frames:v 1 $T/$n-first.png
  # PSNR of every frame vs the cut's last frame
  ffmpeg -v error -i out/$n.mp4 -loop 1 -i $T/$n-last.png -lavfi "[0:v][1:v]psnr=stats_file=$T/$n-psnr.log" -frames:v $nf -f null -
  # last frame index that differs noticeably (<45 dB) from the final frame
  last_move=$(awk '{for(i=1;i<=NF;i++){split($i,a,":"); if(a[1]=="n")n=a[2]; if(a[1]=="psnr_avg")p=a[2]}} p!="inf" && p+0<45 {m=n} END{print m+0}' $T/$n-psnr.log)
  # frame numbers in stats are 1-based
  hold=$(python3 -c "print(f'{($nf - $last_move)/30:.2f}')")
  echo "$n frames=$nf last_moving_frame=$last_move static_tail=${hold}s"
done
echo "--- seams (last of previous vs first of next)"
for i in 1 2 3; do
  p=${names[$((i-1))]}; c=${names[$i]}
  r=$(ffmpeg -v info -i $T/$p-last.png -i $T/$c-first.png -lavfi psnr -f null - 2>&1 | grep -o "average:[^ ]*")
  echo "$p -> $c  PSNR $r"
done
