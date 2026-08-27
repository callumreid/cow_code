#!/bin/bash
# COW CODE HYPE VIDEO — segment builder. A fever dream, rendered deterministically.
set -e
S=/private/tmp/claude-501/-Users-bronson-coval/5d59099b-784f-49a7-a04c-7040d4274750/scratchpad
P=$S/pics_norm
O=$S/seg
IMP=$S/imp.ttf
COMIC=$S/comic.ttf
SUP=/Users/bronson/screenshots/cowCodeSupreme.mov
IND=/Users/bronson/screenshots/cowCodeIndicators.mov
PRL=/Users/bronson/screenshots/cowCodePRList.mov
TAB=/Users/bronson/screenshots/cowCodeTabToMooo.mov
CHU=/Users/bronson/Downloads/big_chungus_pop.mp4
ENC="-r 30 -pix_fmt yuv420p -c:v libx264 -preset veryfast -crf 18 -an"
mkdir -p "$O"

echo '=== S01 cold open'
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "color=c=black:s=1920x1080:r=30:d=2.7" \
  -loop 1 -t 2.7 -i "$P/p06.png" \
  -filter_complex "\
[0]drawbox=c=0xFF00AA@1:t=fill:enable='lt(mod(n,10),1)*lt(t,0.9)',\
drawbox=c=0x00CCFF@1:t=fill:enable='lt(mod(n+5,10),1)*lt(t,0.9)',\
drawbox=c=white@1:t=fill:enable='between(n,28,29)'[bg];\
[1]rotate=a='0.12*sin(t*22)':ow='hypot(iw,ih)':oh='hypot(iw,ih)':c=none[cr];\
[cr]scale=w='min(1700,10+2600*pow(min(t/0.55,1),2.2))':h=-1:eval=frame[cs];\
[bg][cs]overlay=x=(W-w)/2:y=(H-h)/2-170[b1];\
[b1]drawtext=fontfile=$IMP:text='COW CODE':fontsize=200:fontcolor=0xFF00AA:x=(w-text_w)/2+8:y=h-330+12*sin(n*1.1):enable='gte(t,0.95)',\
drawtext=fontfile=$IMP:text='COW CODE':fontsize=200:fontcolor=0x00CCFF:x=(w-text_w)/2-8:y=h-346+12*sin(n*1.1):enable='gte(t,0.95)',\
drawtext=fontfile=$IMP:text='COW CODE':fontsize=200:fontcolor=white:borderw=12:bordercolor=black:x=(w-text_w)/2:y=h-338+12*sin(n*1.1):enable='gte(t,0.95)',\
drawtext=fontfile=$IMP:text='A FEVER DREAM IN FOUR FEATURES':fontsize=44:fontcolor=white:borderw=6:bordercolor=black:x=(w-text_w)/2:y=h-140:enable='gte(t,1.7)',\
chromashift=cbh=6:crh=-6:cbv=2,noise=alls=10:allf=t,vignette=PI/5" \
  -t 2.7 $ENC "$O/s01.mp4"

echo '=== S02 prophecy'
ffmpeg -hide_banner -loglevel error -y \
  -loop 1 -t 2.8 -i "$P/p07.png" \
  -filter_complex "\
[0]scale=w='2150+120*t':h=-1:eval=frame,crop=1920:1080:x='(iw-ow)/2':y='(ih-oh)/2-40*(t/2.8)',\
curves=preset=vintage,noise=alls=14:allf=t+u,vignette=PI/4.5,\
drawbox=c=black@1:t=fill:w=iw:h=110:x=0:y=0,drawbox=c=black@1:t=fill:w=iw:h=110:x=0:y=ih-110,\
drawtext=fontfile=$IMP:text='IN A WORLD OF TERMINALS…':fontsize=78:fontcolor=white:borderw=8:bordercolor=black:x=(w-text_w)/2+3*sin(n*7):y=h-280:enable='between(t,0.15,1.35)',\
drawtext=fontfile=$IMP:text='ONE HEIFER DARED TO MOO':fontsize=78:fontcolor=0xFFDD00:borderw=8:bordercolor=black:x=(w-text_w)/2+3*sin(n*7):y=h-280:enable='gte(t,1.45)'" \
  -t 2.8 $ENC "$O/s02.mp4"

echo '=== S03 supreme montage'
ffmpeg -hide_banner -loglevel error -y \
  -ss 2 -t 8 -i "$SUP" -ss 26 -t 12 -i "$SUP" -ss 50 -t 8 -i "$SUP" \
  -loop 1 -t 5.6 -i "$P/p06.png" \
  -filter_complex "\
[0]setpts=(PTS-STARTPTS)/5,fps=30,split[a0][a1];\
[a0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=22:2,eq=brightness=-0.18:saturation=1.4[abg];\
[a1]scale=1920:-2[afg];[abg][afg]overlay=(W-w)/2:(H-h)/2[segA];\
[1]setpts=(PTS-STARTPTS)/5,fps=30,split[b0][b1];\
[b0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=22:2,eq=brightness=-0.18:saturation=1.4[bbg];\
[b1]scale=2140:-2,crop=1920:826:x=(iw-ow)/2:y=(ih-oh)/2[bfg];[bbg][bfg]overlay=(W-w)/2:(H-h)/2[segB];\
[2]setpts=(PTS-STARTPTS)/5,fps=30,split[c0][c1];\
[c0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=22:2,eq=brightness=-0.18:saturation=1.4[cbg];\
[c1]scale=1920:-2[cfg];[cbg][cfg]overlay=(W-w)/2:(H-h)/2[segC];\
[segA][segB][segC]concat=n=3:v=1:a=0[cat];\
[3]scale=-1:150[cow];\
[cat][cow]overlay=x=W-w-60:y='H-190-abs(60*sin(t*4))'[wcow];\
[wcow]hue=H='0.10*sin(2*PI*t/2.5)':s='1+0.15*sin(2*PI*t/1.8)',\
drawtext=fontfile=$IMP:text='THE DESKTOP APP HAS ARRIVED':fontsize=84:fontcolor=white:borderw=9:bordercolor=black:x=(w-text_w)/2:y=90:enable='between(t,0.10,1.55)',\
drawtext=fontfile=$IMP:text='RUNS LOCAL MODELS':fontsize=96:fontcolor=0x00FFCC:borderw=9:bordercolor=black:x=(w-text_w)/2:y=90:enable='between(t,1.70,3.85)',\
drawtext=fontfile=$IMP:text='ON AN ACTUAL MAC MINI':fontsize=90:fontcolor=0xFFDD00:borderw=9:bordercolor=black:x=(w-text_w)/2:y=90:enable='gte(t,3.95)'" \
  -t 5.6 $ENC "$O/s03.mp4"

echo '=== S04 turtle'
ffmpeg -hide_banner -loglevel error -y \
  -loop 1 -t 1.2 -i "$P/p01.png" \
  -filter_complex "\
[0]split[t0][t1];\
[t0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=24:2,eq=brightness=-0.25:saturation=1.6[tbg];\
[t1]scale=-2:1300[tfg];\
[tbg][tfg]overlay=x=(W-w)/2:y=(H-h)/2-40[tcomp];\
[tcomp]crop=1856:1044:x='32+16*sin(n*39)':y='18+12*cos(n*31)',scale=1920:1080,\
drawbox=c=0xFF1111@0.25:t=fill:enable='lt(mod(n,4),2)',\
noise=alls=18:allf=t,vignette=PI/4,\
drawtext=fontfile=$IMP:text='YOU, WITHOUT COW CODE':fontsize=96:fontcolor=white:borderw=10:bordercolor=black:x=(w-text_w)/2:y=70:enable='gte(t,0.05)',\
drawtext=fontfile=$IMP:text='(DRAMATIZATION)':fontsize=40:fontcolor=0xFF6666:borderw=6:bordercolor=black:x=(w-text_w)/2:y=h-110" \
  -t 1.2 $ENC "$O/s04.mp4"

echo '=== S05 indicators'
ffmpeg -hide_banner -loglevel error -y \
  -ss 0.4 -t 7.6 -i "$IND" \
  -loop 1 -t 3.31 -i "$P/p03.png" \
  -filter_complex "\
[0]setpts=(PTS-STARTPTS)/2.3,fps=30,split[i0][i1];\
[i0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=20:2,eq=brightness=-0.2:saturation=1.5[ibg];\
[i1]scale=iw*1.58:-1:flags=neighbor[ifg];\
[ibg][ifg]overlay=(W-w)/2:(H-h)/2[base];\
[1]rotate=a='0.08*sin(t*18)':ow='hypot(iw,ih)':oh='hypot(iw,ih)':c=none[t0];\
[t0]scale=w='min(600,1+3400*max(0,t-2.15))':h=-1:eval=frame:flags=neighbor[tr];\
[base][tr]overlay=x=W-w-70:y=H-h-60:enable='gte(t,2.15)'[wt];\
[wt]drawtext=fontfile=$IMP:text='LIVE COW INDICATORS':fontsize=88:fontcolor=white:borderw=9:bordercolor=black:x=(w-text_w)/2:y=64:enable='between(t,0.10,1.60)',\
drawtext=fontfile=$IMP:text='SHE SPINS WHEN SHE COOKS':fontsize=84:fontcolor=0xFF00AA:borderw=9:bordercolor=black:x=(w-text_w)/2:y=64:enable='gte(t,1.70)',\
drawtext=fontfile=$IMP:text='CORRECT.':fontsize=64:fontcolor=0xFFDD00:borderw=8:bordercolor=black:x=w-text_w-100:y=h-660:enable='gte(t,2.45)'" \
  -t 3.31 $ENC "$O/s05.mp4"

echo '=== S06 pr list'
ffmpeg -hide_banner -loglevel error -y \
  -ss 0.4 -t 16 -i "$PRL" \
  -loop 1 -t 4.0 -i "$P/p05.png" \
  -loop 1 -t 4.0 -i "$P/p02.png" \
  -filter_complex "\
[0]setpts=(PTS-STARTPTS)/4,fps=30,split[p0][p1];\
[p0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=20:2,eq=brightness=-0.2:saturation=1.5[pbg];\
[p1]scale=-2:1080[pfg];\
[pbg][pfg]overlay=(W-w)/2:(H-h)/2[base];\
[1]rotate=a='0.06*sin(t*14)':ow='hypot(iw,ih)':oh='hypot(iw,ih)':c=none[popz];\
[popz]scale=w='min(480,1+2800*max(0,t-1.15))':h=-1:eval=frame:flags=neighbor[pope];\
[base][pope]overlay=x=130:y=H-h-150:enable='gte(t,1.15)'[w1];\
[2]rotate=a='-0.06*sin(t*14)':ow='hypot(iw,ih)':oh='hypot(iw,ih)':c=none[thz];\
[thz]scale=w='min(560,1+3000*max(0,t-2.55))':h=-1:eval=frame:flags=neighbor[thumb];\
[w1][thumb]overlay=x=W-w-120:y=H-h-150:enable='gte(t,2.55)'[w2];\
[w2]drawtext=fontfile=$IMP:text='NINE OPEN PULL REQUESTS':fontsize=84:fontcolor=white:borderw=9:bordercolor=black:x=(w-text_w)/2:y=64:enable='between(t,0.10,1.30)',\
drawtext=fontfile=$IMP:text='ONE POCKET BARN':fontsize=92:fontcolor=0x00FFCC:borderw=9:bordercolor=black:x=(w-text_w)/2:y=64:enable='between(t,1.40,2.55)',\
drawtext=fontfile=$COMIC:text='wowww':fontsize=140:fontcolor=0xFF00AA:borderw=10:bordercolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60+14*sin(n*1.4):enable='gte(t,2.65)',\
drawtext=fontfile=$IMP:text='BLESSED.':fontsize=54:fontcolor=0xFFDD00:borderw=7:bordercolor=black:x=150:y=h-120:enable='gte(t,1.45)',\
drawtext=fontfile=$IMP:text='APPROVED.':fontsize=54:fontcolor=0xFFDD00:borderw=7:bordercolor=black:x=w-text_w-140:y=h-120:enable='gte(t,2.85)'" \
  -t 4.0 $ENC "$O/s06.mp4"

echo '=== S07 tab to moo'
ffmpeg -hide_banner -loglevel error -y \
  -ss 0 -t 3.14 -i "$TAB" -ss 3.14 -t 2.36 -i "$TAB" -ss 5.5 -t 3.1 -i "$TAB" \
  -filter_complex "\
[0]setpts=(PTS-STARTPTS)/1.75,fps=30,split[a0][a1];\
[a0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=20:2,eq=brightness=-0.2[abg];\
[a1]scale=-2:1080[afg];[abg][afg]overlay=(W-w)/2:(H-h)/2[segA];\
[1]setpts=(PTS-STARTPTS)/1.75,fps=30,split[b0][b1];\
[b0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=20:2,eq=brightness=-0.2[bbg];\
[b1]scale=-2:1240,crop=iw:1080:x=0:y=(ih-oh)/2[bfg];[bbg][bfg]overlay=(W-w)/2:(H-h)/2[segB];\
[2]setpts=(PTS-STARTPTS)/1.75,fps=30,split[c0][c1];\
[c0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=20:2,eq=brightness=-0.2[cbg];\
[c1]scale=-2:1080[cfg];[cbg][cfg]overlay=(W-w)/2:(H-h)/2[segC];\
[segA][segB][segC]concat=n=3:v=1:a=0[cat];\
[cat]drawtext=fontfile=$IMP:text='PRESS TAB.':fontsize=110:fontcolor=white:borderw=10:bordercolor=black:x=(w-text_w)/2:y=80:enable='between(t,0.25,1.60)',\
drawtext=fontfile=$IMP:text='IT MOOS.':fontsize=150:fontcolor=0xFFDD00:borderw=12:bordercolor=black:x=(w-text_w)/2:y=90+8*sin(n*9):enable='between(t,1.85,3.05)',\
drawtext=fontfile=$IMP:text='THAT’S IT. THAT’S THE FEATURE.':fontsize=64:fontcolor=white:borderw=8:bordercolor=black:x=(w-text_w)/2:y=90:enable='gte(t,3.25)'" \
  -t 4.92 $ENC "$O/s07.mp4"

echo '=== S08 chungus'
ffmpeg -hide_banner -loglevel error -y \
  -i "$CHU" \
  -loop 1 -t 3.56 -i "$P/p04.png" \
  -filter_complex "\
[0:v:0]setpts=(PTS-STARTPTS)/1.7,fps=30,split[u0][u1];\
[u0]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=24:2,eq=brightness=-0.22:saturation=1.4[ubg];\
[u1]scale=-2:h='1080*(1+0.10*t/3.55)':eval=frame[ufg];\
[ubg][ufg]overlay=(W-w)/2:(H-h)/2[base];\
[1]scale=-1:760,rotate=a='0.15*sin(t*9)':c=none[fieri];\
[base][fieri]overlay=x='-900+(t-2.66)*4200':y='140+70*sin(t*6)':enable='gte(t,2.66)'[wf];\
[wf]drawbox=c=white@1:t=fill:enable='between(n,81,83)',\
drawtext=fontfile=$IMP:text='YOUR PRODUCTIVITY':fontsize=92:fontcolor=white:borderw=9:bordercolor=black:x=(w-text_w)/2:y=72:enable='between(t,0.30,2.50)',\
drawtext=fontfile=$IMP:text='TOTAL BARN DOMINATION':fontsize=96:fontcolor=0xFF00AA:borderw=10:bordercolor=black:x=(w-text_w)/2:y=72:enable='gte(t,2.85)'" \
  -t 3.56 $ENC "$O/s08.mp4"

echo '=== S09 outro altar'
ffmpeg -hide_banner -loglevel error -y \
  -f lavfi -i "gradients=s=1920x1080:c0=0x14001f:c1=0x8f0a6e:c2=0x1a0b3d:nb_colors=3:speed=0.06:rate=30:duration=6" \
  -loop 1 -t 6 -i "$P/p06.png" \
  -loop 1 -t 6 -i "$P/p01.png" \
  -loop 1 -t 6 -i "$P/p03.png" \
  -loop 1 -t 6 -i "$P/p04.png" \
  -loop 1 -t 6 -i "$P/p02.png" \
  -loop 1 -t 6 -i "$P/p05.png" \
  -filter_complex "\
[1]scale=-1:560[cow];\
[2]scale=-1:230[h1];[3]scale=-1:230:flags=neighbor[h2];[4]scale=-1:260[h3];[5]scale=-1:230:flags=neighbor[h4];[6]scale=-1:230:flags=neighbor[h5];\
[0][h1]overlay=x='960+400*cos(2*PI*t/5)-w/2':y='520+250*sin(2*PI*t/5)-h/2'[o1];\
[o1][h2]overlay=x='960+400*cos(2*PI*t/5+1.2566)-w/2':y='520+250*sin(2*PI*t/5+1.2566)-h/2'[o2];\
[o2][h3]overlay=x='960+400*cos(2*PI*t/5+2.5133)-w/2':y='520+250*sin(2*PI*t/5+2.5133)-h/2'[o3];\
[o3][h4]overlay=x='960+400*cos(2*PI*t/5+3.7699)-w/2':y='520+250*sin(2*PI*t/5+3.7699)-h/2'[o4];\
[o4][h5]overlay=x='960+400*cos(2*PI*t/5+5.0265)-w/2':y='520+250*sin(2*PI*t/5+5.0265)-h/2'[o5];\
[o5][cow]overlay=x=(W-w)/2:y='(H-h)/2-30+14*sin(t*2.6)'[oc];\
[oc]drawtext=fontfile=$IMP:text='COW CODE':fontsize=175:fontcolor=0xFF00AA:x=(w-text_w)/2+6:y=66,\
drawtext=fontfile=$IMP:text='COW CODE':fontsize=175:fontcolor=white:borderw=12:bordercolor=black:x=(w-text_w)/2:y=60,\
drawtext=fontfile=$IMP:text='git clone · bun install · moo':fontsize=54:fontcolor=white:borderw=7:bordercolor=black:x=(w-text_w)/2:y=h-220:enable='gte(t,0.6)',\
drawtext=fontfile=$IMP:text='MOO RESPONSIBLY':fontsize=48:fontcolor=0xFFDD00:borderw=7:bordercolor=black:x=(w-text_w)/2:y=h-130:enable='gte(t,2.8)',\
noise=alls=7:allf=t,vignette=PI/5,fade=t=out:st=5.5:d=0.5" \
  -t 6 $ENC "$O/s09.mp4"

echo '=== concat (re-encode, normalized SAR)'
cd "$O"
ffmpeg -hide_banner -loglevel error -y \
  -i s01.mp4 -i s02.mp4 -i s03.mp4 -i s04.mp4 -i s05.mp4 -i s06.mp4 -i s07.mp4 -i s08.mp4 -i s09.mp4 \
  -filter_complex "[0][1][2][3][4][5][6][7][8]concat=n=9:v=1:a=0,setsar=1" \
  -r 30 -pix_fmt yuv420p -c:v libx264 -preset veryfast -crf 18 -an "$S/video_silent.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$S/video_silent.mp4"
for i in 01 02 03 04 05 06 07 08 09; do d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "s$i.mp4"); echo "s$i $d"; done
echo BUILD-OK
