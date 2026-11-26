#!/usr/bin/env bash
# 下载字体对比页要用的 HarmonyOS Sans（不进 Git：授权不许改字体，整份 8MB 一个字重，不适合放仓库）。
# 用法：在 design/UI确认/ 下运行 bash tools/fetch-fonts.sh
# MiSans 不用下载：assets/fonts-misans.css 直接引用 jsdelivr 上的 misans@4.1.0。
set -euo pipefail
cd "$(dirname "$0")/.."
out=assets/fonts/harmonyos; mkdir -p "$out"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
curl -fsSL -o "$tmp/hm.tgz" https://registry.npmjs.org/harmonyos-sans/-/harmonyos-sans-1.0.0.tgz
tar xzf "$tmp/hm.tgz" -C "$tmp"
unzip -q -o "$tmp/package/HarmonyOS Sans.zip" -d "$tmp/z"
for w in Regular Medium Bold; do
  cp "$tmp/z/HarmonyOS Sans/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_$w.ttf" "$out/"
  cp "$tmp/z/HarmonyOS Sans/HarmonyOS_Sans_Naskh_Arabic_UI/HarmonyOS_Sans_Naskh_Arabic_UI_$w.ttf" "$out/"
done
cp "$tmp/z/HarmonyOS Sans/HarmonyOS_Sans_SC/LICENSE.txt" "$out/"
echo "已下载到 $out"
