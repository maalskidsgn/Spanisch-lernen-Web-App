#!/bin/bash
# Baut aus den sechs Szenenbildern den Habloo-Teaser.
#
# Der Ablauf in zwei Stufen:
#   1. Jede Szene bekommt eine langsame Kamerafahrt (zoompan). Ein
#      Standbild, das drei Sekunden still steht, wirkt tot – diese
#      kaum merkliche Bewegung hält das Auge wach.
#   2. Die Szenen werden mit xfade ineinander geblendet, abwechselnd
#      Überblendung und Wisch, damit es nicht monoton wird.
#
# Ohne Ton: Social-Videos laufen stumm (siehe Manuels Vorgabe).
set -e
cd "$(dirname "$0")"

FPS=30
DAUER=3.4          # Standzeit je Szene in Sekunden
BLENDE=0.55        # Länge der Übergänge
B=1080; H=1920

echo "1/3  Kamerafahrten rendern …"
for i in 1 2 3 4 5 6; do
  # Ungerade Szenen fahren hinein, gerade heraus – das wechselt die
  # Blickrichtung und wirkt lebendiger als immer dieselbe Richtung.
  if (( i % 2 )); then
    ZOOM="min(zoom+0.0009,1.11)"
  else
    ZOOM="if(lte(zoom,1.0),1.11,max(1.001,zoom-0.0009))"
  fi
  # WICHTIG: Das Bild genau EINMAL einlesen (kein -loop). zoompan
  # macht aus einem Eingabebild d Ausgabebilder. Mit -loop bekäme
  # jeder der 102 eingelesenen Frames nochmal 102 Frames spendiert –
  # aus 3,4 Sekunden würden knapp 6 Minuten.
  FRAMES=$(python3 -c "print(int($FPS*$DAUER))")
  ffmpeg -y -loglevel error \
    -i szene-$i.png \
    -vf "scale=$((B*2)):$((H*2)),zoompan=z='$ZOOM':d=$FRAMES:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${B}x${H}:fps=$FPS,setsar=1" \
    -frames:v $FRAMES \
    -c:v libx264 -pix_fmt yuv420p -preset slow -crf 17 teil-$i.mp4
  printf "     Szene %s fertig\n" "$i"
done

echo "2/3  Übergänge setzen …"
# Jeder Übergang verkürzt die Gesamtlänge um die Blendendauer,
# deshalb wandert der Offset in Schritten von (DAUER - BLENDE).
SCHRITT=$(python3 -c "print(round($DAUER - $BLENDE, 3))")
UEBER=(fade wipeleft fade smoothup fade)

FILTER=""
LETZTE="0:v"
for i in 0 1 2 3 4; do
  OFF=$(python3 -c "print(round($DAUER + $i*$SCHRITT - $BLENDE, 3))")
  NEU="v$i"
  FILTER="$FILTER[$LETZTE][$((i+1)):v]xfade=transition=${UEBER[$i]}:duration=$BLENDE:offset=$OFF[$NEU];"
  LETZTE="$NEU"
done
FILTER="${FILTER%;}"

ffmpeg -y -loglevel error \
  -i teil-1.mp4 -i teil-2.mp4 -i teil-3.mp4 -i teil-4.mp4 -i teil-5.mp4 -i teil-6.mp4 \
  -filter_complex "$FILTER" -map "[$LETZTE]" \
  -c:v libx264 -pix_fmt yuv420p -preset slow -crf 18 -r $FPS -movflags +faststart \
  habloo-teaser.mp4

echo "3/3  Aufräumen …"
rm -f teil-*.mp4
echo ""
ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,r_frame_rate \
  -of default=noprint_wrappers=1 habloo-teaser.mp4
