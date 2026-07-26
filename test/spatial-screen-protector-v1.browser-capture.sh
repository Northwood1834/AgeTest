#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${1:-/tmp/agetest-spatial-screen-protector-v1-visual}
cd "$ROOT"
node tools/qa-browser-lanes.mjs start audit >/dev/null
mkdir -p "$OUT"
scenes=(initial pressure progress invalid trapped peeled resealed overpeel success timeout)
for metric in 393x852 402x874; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    for scene in "${scenes[@]}"; do
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-screen-protector-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit '(async()=>{for(let i=0;i<200;i++){if(window.__SCREEN_PROTECTOR_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()' >/dev/null
      node tools/qa-browser-lanes.mjs eval audit 'window.__SCREEN_PROTECTOR_FIXTURE__.evidence()' >"$OUT/evidence-$metric-$scene-$motion.json"
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/$metric-$scene-$motion.png" >/dev/null
    done
  done
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-screen-protector-v1.fixture.html?scene=initial&width=$width&measure=1" "$width" "$height" 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit 'new Promise(resolve=>setTimeout(()=>resolve(JSON.parse(document.querySelector("#report").textContent)),1700))' >"$OUT/performance-$metric.json"
done
for metric in 393x852 402x874; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-screen-protector-v1.fixture.html?scene=initial&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
    node tools/qa-browser-lanes.mjs eval audit '(async()=>{for(let i=0;i<200;i++){if(window.__SCREEN_PROTECTOR_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()' >/dev/null
    node tools/qa-browser-lanes.mjs eval audit '(async()=>{const fixture=window.__SCREEN_PROTECTOR_FIXTURE__,surface=document.querySelector(".ssp-board"),rect=surface.getBoundingClientRect(),fire=(type,x,y)=>surface.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:41,pointerType:"touch",isPrimary:true,clientX:rect.left+rect.width*x,clientY:rect.top+rect.height*y}));fire("pointerdown",.2,.94);fire("pointermove",.2,.73);await new Promise(resolve=>setTimeout(resolve,280));const first=fixture.inspect();fire("pointermove",.8,.62);await new Promise(resolve=>setTimeout(resolve,280));fire("pointerup",.8,.62);return{metric:`${innerWidth}x${innerHeight}`,motion:document.body.dataset.motion,overflow:document.body.scrollWidth>innerWidth,external:performance.getEntriesByType("resource").filter(entry=>new URL(entry.name).origin!==location.origin).map(entry=>entry.name),first,final:fixture.inspect(),runtime:fixture.runtime.inspect(),errors:fixture.errors()}})()' >"$OUT/touch-$metric-$motion.json"
    node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-screen-protector-v1.fixture.html?scene=initial&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
    node tools/qa-browser-lanes.mjs eval audit '(async()=>{for(let i=0;i<200;i++){if(window.__SCREEN_PROTECTOR_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()' >/dev/null
    node tools/qa-browser-lanes.mjs eval audit '(()=>{const fixture=window.__SCREEN_PROTECTOR_FIXTURE__,before=fixture.runtime.inspect();fixture.runtime.dispose();return{metric:`${innerWidth}x${innerHeight}`,motion:document.body.dataset.motion,overflow:document.body.scrollWidth>innerWidth,external:performance.getEntriesByType("resource").filter(entry=>new URL(entry.name).origin!==location.origin).map(entry=>entry.name),before,after:fixture.runtime.inspect(),qaPresent:Boolean(fixture.qa[fixture.game.metadata.id]),errors:fixture.errors()}})()' >"$OUT/dispose-$metric-$motion.json"
  done
done
for motion in normal reduced; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-screen-protector-v1.fixture.html?scene=initial&motion=$motion&width=430" 430 932 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{for(let i=0;i<200;i++){if(window.__SCREEN_PROTECTOR_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()' >/dev/null
  node tools/qa-browser-lanes.mjs eval audit 'window.__SCREEN_PROTECTOR_FIXTURE__.evidence()' >"$OUT/supplemental-430x932-initial-$motion.json"
  node tools/qa-browser-lanes.mjs screenshot audit "$OUT/supplemental-430x932-initial-$motion.png" >/dev/null
done
OUT="$OUT" python - <<'PY'
from PIL import Image, ImageChops, ImageStat
from pathlib import Path
import json, math, os
root=Path(os.environ["OUT"]); scenes=["initial","pressure","progress","invalid","trapped","peeled","resealed","overpeel","success","timeout"]; metrics=["393x852","402x874"]
rows=[]
for metric in metrics:
    for scene in scenes:
        a=Image.open(root/f"{metric}-{scene}-normal.png").convert("RGB")
        b=Image.open(root/f"{metric}-{scene}-reduced.png").convert("RGB")
        diff=ImageChops.difference(a,b); stat=ImageStat.Stat(diff)
        rows.append({"key":f"{metric}-{scene}","size":[a.width,a.height],"mae":round(sum(stat.mean)/3,3),"rmse":round(math.sqrt(sum(x*x for x in stat.rms)/3),3),"normalizedRMSE":round(math.sqrt(sum(x*x for x in stat.rms)/3)/255,6),"changed":round(sum(px!=(0,0,0) for px in diff.getdata())/(a.width*a.height),4)})
report={"canonicalViewports":[{"width":393,"height":852,"dpr":3},{"width":402,"height":874,"dpr":3}],"comparisons":len(rows),"screenshots":len(rows)*2,"allDpr3":True,"allFullResolution":all(row["size"] in ([1179,2556],[1206,2622]) for row in rows),"meanMAE":round(sum(row["mae"] for row in rows)/len(rows),3),"maxMAE":max(row["mae"] for row in rows),"maxNormalizedRMSE":max(row["normalizedRMSE"] for row in rows),"meanChanged":round(sum(row["changed"] for row in rows)/len(rows),4),"rows":rows}
(root/"comparison-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))

def load(name): return json.loads((root/name).read_text())
touches={metric:{motion:load(f"touch-{metric}-{motion}.json") for motion in ["normal","reduced"]} for metric in metrics}
disposes={metric:{motion:load(f"dispose-{metric}-{motion}.json") for motion in ["normal","reduced"]} for metric in metrics}
performance={metric:load(f"performance-{metric}.json") for metric in metrics}
supplemental={motion:load(f"supplemental-430x932-initial-{motion}.json") for motion in ["normal","reduced"]}
evidence={"lane":{"name":"audit","cdp":9332,"http":8862},"screenshots":report["screenshots"],"states":scenes,"viewports":report["canonicalViewports"],"touch":touches,"dispose":disposes,"performance":performance,"supplementalSmoke":{"viewport":{"width":430,"height":932,"dpr":3},"canonical":False,"states":["initial"],"screenshots":2,"evidence":supplemental}}
(root/"browser-evidence.json").write_text(json.dumps(evidence,ensure_ascii=False,indent=2))
print(json.dumps({key:value for key,value in report.items() if key!="rows"},indent=2))
PY
