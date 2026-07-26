#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${1:-/tmp/agetest-spatial-lane-run-v1-visual}
cd "$ROOT"
node tools/qa-browser-lanes.mjs start audit >/dev/null
mkdir -p "$OUT"
for metric in 393x852 402x874; do
  width=${metric%x*}; height=${metric#*x}
  for scene in initial input jump motion progress goal rock pit crate tnt author success failure invalid timeout; do
    node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-lane-run-v1.legacy-fixture.html?scene=$scene&width=$width" "$width" "$height" 3 >/dev/null
    node tools/qa-browser-lanes.mjs screenshot audit "$OUT/legacy-$metric-$scene.png" >/dev/null
    node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-lane-run-v1.fixture.html?scene=$scene&width=$width" "$width" "$height" 3 >/dev/null
    node tools/qa-browser-lanes.mjs screenshot audit "$OUT/module-$metric-$scene.png" >/dev/null
  done
done
for metric in 393x852 402x874; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    for causal in pit crate-ground crate-air author; do
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-lane-run-v1.legacy-fixture.html?causal=$causal&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit '(async()=>{for(let i=0;i<160;i++){if(document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,50))}return false})()' >/dev/null
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/legacy-$metric-causal-$causal-$motion.png" >/dev/null
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-lane-run-v1.fixture.html?causal=$causal&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit 'document.documentElement.dataset.ready' >/dev/null
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/module-$metric-causal-$causal-$motion.png" >/dev/null
    done
  done
done
OUT="$OUT" python - <<'PY'
from PIL import Image, ImageChops, ImageStat
from pathlib import Path
import json, math, os
root=Path(os.environ["OUT"]); rows=[]
for module in sorted(root.glob("module-*.png")):
    key=module.stem[7:]; legacy=root/f"legacy-{key}.png"
    a=Image.open(legacy).convert("RGB"); b=Image.open(module).convert("RGB"); diff=ImageChops.difference(a,b); stat=ImageStat.Stat(diff)
    rows.append({"key":key,"size":[a.width,a.height],"mae":round(sum(stat.mean)/3,3),"rmse":round(math.sqrt(sum(x*x for x in stat.rms)/3),3),"changed":round(sum(px!=(0,0,0) for px in diff.getdata())/(a.width*a.height),4)})
report={"comparisons":len(rows),"allFullResolution":all(row["size"] in ([1179,2556],[1206,2622]) for row in rows),"meanMAE":round(sum(row["mae"] for row in rows)/len(rows),3),"maxMAE":max(row["mae"] for row in rows),"meanChanged":round(sum(row["changed"] for row in rows)/len(rows),4),"rows":rows}
(root/"comparison-report.json").write_text(json.dumps(report,indent=2)); print(json.dumps({key:value for key,value in report.items() if key!="rows"},indent=2))
PY
