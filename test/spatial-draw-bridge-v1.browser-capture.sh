#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${1:-/tmp/agetest-spatial-draw-bridge-v1-visual}
cd "$ROOT"
node tools/qa-browser-lanes.mjs start audit >/dev/null
rm -rf "$OUT"; mkdir -p "$OUT"
scenes=(initial draw load sag unanchored overbudget bottomOut jointSnap wheelLoss stalledSpan success timeout)
ready='(async()=>{for(let i=0;i<300;i++){if(window.__DRAW_BRIDGE_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()'
for metric in 393x852 402x874; do
 width=${metric%x*}; height=${metric#*x}
 for motion in normal reduced; do
  for scene in "${scenes[@]}"; do
   node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
   node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
   node tools/qa-browser-lanes.mjs eval audit 'window.__DRAW_BRIDGE_FIXTURE__.report()' >"$OUT/evidence-$metric-$scene-$motion.json"
   node tools/qa-browser-lanes.mjs screenshot audit "$OUT/$metric-$scene-$motion.png" >/dev/null
  done
 done
 node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=initial&width=$width" "$width" "$height" 3 >/dev/null
 node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
 node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__DRAW_BRIDGE_FIXTURE__,d=[];let p=performance.now();await new Promise(resolve=>{const tick=n=>{d.push(n-p);p=n;if(d.length===90)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick)});const r=f.report(),owned=f.runtime.inspect().frames;return{status:d.length===90&&owned===1&&!r.external.length&&!r.errors.length&&r.viewport.bodyScrollWidth<=r.width?"pass":"fail",frames:d.length,averageFrameMs:d.reduce((a,b)=>a+b,0)/d.length,maxFrameMs:Math.max(...d),gameOwnedFrames:owned,overflow:r.viewport.bodyScrollWidth>r.width,external:r.external,errors:r.errors,viewport:r.viewport}})()' >"$OUT/performance-$metric.json"
done
for metric in 390x844 430x932; do
 width=${metric%x*}; height=${metric#*x}
 for motion in normal reduced; do
  for scene in initial success; do
   node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
   node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
   node tools/qa-browser-lanes.mjs eval audit 'window.__DRAW_BRIDGE_FIXTURE__.report()' >"$OUT/supplemental-$metric-$scene-$motion.json"
   node tools/qa-browser-lanes.mjs screenshot audit "$OUT/supplemental-$metric-$scene-$motion.png" >/dev/null
  done
 done
done
for layout in 0 1 2; do
 node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=initial&layout=$layout&width=402" 402 874 3 >/dev/null
 node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
 node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__DRAW_BRIDGE_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task,compact=r=>{const middle=r.samples[Math.floor(r.samples.length/2)]||null,first=r.samples[0]||null,last=r.samples.at(-1)||null,maxSag=r.samples.length?Math.max(...r.samples.flatMap(s=>s.nodes.map((n,i)=>n.y-r.path[i].y))):0;return{outcome:r.outcome,reason:r.reason,path:r.path,diagnostics:r.diagnostics,events:r.events,sampleCount:r.samples.length,first,middle,last,maxSag,final:r.final}},canonical=compact(api.simulate(task.proof.canonical.path)),examples=Object.fromEntries(Object.entries(task.proof.examples).map(([name,path])=>[name,compact(api.simulate(path))]));return{layout:task.layout,anchors:task.anchors,bottomY:task.bottomY,materialBudget:task.materialBudget,vehicle:task.vehicle,proof:task.proof.outcomes,canonical,examples,errors:f.errors()}})()' >"$OUT/causality-layout-$layout.json"
done
for motion in normal reduced; do
 node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
 node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
 node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__DRAW_BRIDGE_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task,board=document.querySelector(".sdb-board"),rect=board.getBoundingClientRect(),toClient=p=>({x:rect.left+p.x/1000*rect.width,y:rect.top+p.y/650*rect.height}),fire=(type,p)=>{const c=toClient(p);board.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:51,pointerType:"touch",isPrimary:true,clientX:c.x,clientY:c.y}))},path=task.proof.canonical.path;fire("pointerdown",path[0]);for(const p of path.slice(1,-1))fire("pointermove",p);const drawing=api.inspect();fire("pointerup",path.at(-1));const released=api.inspect(),lockedBegin=api.begin();for(let i=0;i<320;i++){if(f.runtime.inspect().finished)break;await new Promise(r=>setTimeout(r,25))}const completed=api.inspect(),report=f.report();return{motion:document.body.dataset.motion,drawing,released,lockedBegin,completed,controlsLocked:[...document.querySelectorAll(".sdb-control")].every(n=>n.disabled),runtime:f.runtime.inspect(),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/touch-402x874-$motion.json"
 node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
 node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
 node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__DRAW_BRIDGE_FIXTURE__,api=f.qa[f.game.metadata.id],board=document.querySelector(".sdb-board");board.focus();board.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));for(let i=0;i<30;i++)board.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));const drawing=api.inspect(),focusedClass=document.activeElement?.className||null;board.dispatchEvent(new KeyboardEvent("keydown",{key:" ",bubbles:true,cancelable:true}));const released=api.inspect(),lockedBegin=api.begin();for(let i=0;i<320;i++){if(f.runtime.inspect().finished)break;await new Promise(r=>setTimeout(r,25))}const completed=api.inspect(),report=f.report();return{motion:document.body.dataset.motion,drawing,focusedClass,released,lockedBegin,completed,controlsLocked:[...document.querySelectorAll(".sdb-control")].every(n=>n.disabled),runtime:f.runtime.inspect(),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/keyboard-402x874-$motion.json"
 node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
 node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
 node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__DRAW_BRIDGE_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task;api.loadPath(task.proof.canonical.path);api.release();const flight=api.inspect(),before=f.runtime.inspect();f.runtime.dispose();const report=f.report();return{motion:document.body.dataset.motion,flight,before,after:f.runtime.inspect(),qaPresent:Boolean(f.qa[f.game.metadata.id]),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/dispose-402x874-$motion.json"
 node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/spatial-draw-bridge-v1.fixture.html?scene=draw&motion=$motion&width=402&deadline=220" 402 874 3 >/dev/null
 node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
 node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__DRAW_BRIDGE_FIXTURE__;for(let i=0;i<80;i++){if(f.runtime.inspect().finished)break;await new Promise(r=>setTimeout(r,25))}return{motion:document.body.dataset.motion,report:f.report(),runtime:f.runtime.inspect(),outcome:f.report().outcome}})()' >"$OUT/deadline-402x874-$motion.json"
done
OUT="$OUT" python - <<'PY'
from PIL import Image,ImageChops,ImageStat
from pathlib import Path
import json,math,os
root=Path(os.environ['OUT']);scenes=['initial','draw','load','sag','unanchored','overbudget','bottomOut','jointSnap','wheelLoss','stalledSpan','success','timeout'];metrics=['393x852','402x874'];rows=[]
for metric in metrics:
 for scene in scenes:
  a=Image.open(root/f'{metric}-{scene}-normal.png').convert('RGB');b=Image.open(root/f'{metric}-{scene}-reduced.png').convert('RGB');diff=ImageChops.difference(a,b);stat=ImageStat.Stat(diff);rows.append({'key':f'{metric}-{scene}','size':[a.width,a.height],'mae':round(sum(stat.mean)/3,3),'rmse':round(math.sqrt(sum(x*x for x in stat.rms)/3),3),'normalizedRMSE':round(math.sqrt(sum(x*x for x in stat.rms)/3)/255,6),'changed':round(sum(px!=(0,0,0) for px in diff.getdata())/(a.width*a.height),4)})
report={'canonicalViewports':[{'width':393,'height':852,'dpr':3},{'width':402,'height':874,'dpr':3}],'states':scenes,'comparisons':len(rows),'screenshots':len(rows)*2,'allDpr3':True,'allFullResolution':all(r['size'] in ([1179,2556],[1206,2622]) for r in rows),'meanMAE':round(sum(r['mae'] for r in rows)/len(rows),3),'maxMAE':max(r['mae'] for r in rows),'maxNormalizedRMSE':max(r['normalizedRMSE'] for r in rows),'meanChanged':round(sum(r['changed'] for r in rows)/len(rows),4),'rows':rows}
(root/'comparison-report.json').write_text(json.dumps(report,indent=2))
def load(n):return json.loads((root/n).read_text())
e={'lane':{'name':'audit','cdp':9332,'http':8862},'canonical':{'viewports':report['canonicalViewports'],'states':scenes,'screenshots':report['screenshots']},'matrix':{m:{o:{s:load(f'evidence-{m}-{s}-{o}.json') for s in scenes} for o in ['normal','reduced']} for m in metrics},'causality':[load(f'causality-layout-{i}.json') for i in range(3)],'touch402':{o:load(f'touch-402x874-{o}.json') for o in ['normal','reduced']},'keyboard402':{o:load(f'keyboard-402x874-{o}.json') for o in ['normal','reduced']},'dispose402':{o:load(f'dispose-402x874-{o}.json') for o in ['normal','reduced']},'deadline402':{o:load(f'deadline-402x874-{o}.json') for o in ['normal','reduced']},'performance':{m:load(f'performance-{m}.json') for m in metrics},'supplemental':{m:{o:{s:load(f'supplemental-{m}-{s}-{o}.json') for s in ['initial','success']} for o in ['normal','reduced']} for m in ['390x844','430x932']}}
(root/'browser-evidence.json').write_text(json.dumps(e,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='rows'},indent=2))
PY
