#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${1:-/tmp/agetest-prediction-ricochet-knockback-v1-visual}
cd "$ROOT"
node tools/qa-browser-lanes.mjs start audit >/dev/null
rm -rf "$OUT"; mkdir -p "$OUT"
scenes=(initial aim bounce impact nearMiss insufficient collateral selfHit success timeout)
ready='(async()=>{for(let i=0;i<300;i++){if(window.__RICOCHET_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()'
for metric in 393x852 402x874; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    for scene in "${scenes[@]}"; do
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
      node tools/qa-browser-lanes.mjs eval audit 'window.__RICOCHET_FIXTURE__.report()' >"$OUT/evidence-$metric-$scene-$motion.json"
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/$metric-$scene-$motion.png" >/dev/null
    done
  done
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=initial&width=$width" "$width" "$height" 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const fixture=window.__RICOCHET_FIXTURE__,deltas=[];let previous=performance.now();await new Promise(resolve=>{const tick=now=>{deltas.push(now-previous);previous=now;if(deltas.length>=90)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick)});const report=fixture.report();return{status:deltas.length===90&&fixture.runtime.inspect().frames===1&&!report.external.length&&!report.errors.length&&report.viewport.bodyScrollWidth<=report.width?"pass":"fail",frames:deltas.length,averageFrameMs:deltas.reduce((a,b)=>a+b,0)/deltas.length,maxFrameMs:Math.max(...deltas),gameOwnedFrames:fixture.runtime.inspect().frames,overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors,viewport:report.viewport}})()' >"$OUT/performance-$metric.json"
done
for metric in 390x844 430x932; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    for scene in initial success; do
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
      node tools/qa-browser-lanes.mjs eval audit 'window.__RICOCHET_FIXTURE__.report()' >"$OUT/supplemental-$metric-$scene-$motion.json"
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/supplemental-$metric-$scene-$motion.png" >/dev/null
    done
  done
done
for motion in normal reduced; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__RICOCHET_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task,surface=document.querySelector(".prk-board"),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),waitDone=async()=>{for(let i=0;i<200;i++){if(f.runtime.inspect().finished)return;await wait(25)}throw Error("touch shot timeout")},rect=surface.getBoundingClientRect(),a=task.canonical.angle*Math.PI/180,distance=600,x0=rect.left+rect.width*.5,y0=rect.top+rect.height*(650/700),x1=rect.left+rect.width*((500+Math.sin(a)*distance)/1000),y1=rect.top+rect.height*((650-Math.cos(a)*distance)/700),fire=(type,x,y)=>surface.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:41,pointerType:"touch",isPrimary:true,clientX:x,clientY:y}));fire("pointerdown",x0,y0);fire("pointermove",x1,y1);const aimed=api.inspect();fire("pointerup",x1,y1);const released=api.inspect(),lockedAim=api.setAim(0,1);surface.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true,cancelable:true}));const lockedKeyboard=api.inspect();await waitDone();const completed=api.inspect(),report=f.report();return{motion:document.body.dataset.motion,aimed,released,lockedAim,lockedKeyboard,completed,controlsLocked:[...document.querySelectorAll(".prk-control")].every(node=>node.disabled),runtime:f.runtime.inspect(),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/touch-402x874-$motion.json"
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__RICOCHET_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task,surface=document.querySelector(".prk-board"),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));api.setAim(task.canonical.angle-1,3);surface.focus();surface.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));surface.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowUp",bubbles:true,cancelable:true}));const aimed=api.inspect(),focusedClass=document.activeElement?.className||null;surface.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));const released=api.inspect(),lockedAim=api.setAim(0,1);for(let i=0;i<200;i++){if(f.runtime.inspect().finished)break;await wait(25)}const completed=api.inspect(),report=f.report();return{motion:document.body.dataset.motion,aimed,focusedClass,released,lockedAim,completed,controlsLocked:[...document.querySelectorAll(".prk-control")].every(node=>node.disabled),runtime:f.runtime.inspect(),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/keyboard-402x874-$motion.json"
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__RICOCHET_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task;api.fire(task.canonical.angle,task.canonical.power);const before=f.runtime.inspect(),flight=api.inspect();f.runtime.dispose();const report=f.report();return{motion:document.body.dataset.motion,flight,before,after:f.runtime.inspect(),qaPresent:Boolean(f.qa[f.game.metadata.id]),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/dispose-402x874-$motion.json"
done
for layout in 0 1 2; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=initial&layout=$layout&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__RICOCHET_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task;api.setAim(task.canonical.angle,task.canonical.power);const canonical=api.simulate(task.canonical.angle,task.canonical.power),examples=Object.fromEntries(Object.entries(task.proof.examples).map(([outcome,shot])=>[outcome,api.simulate(shot.angle,shot.power)]));return{layout:task.layout,proof:task.proof,preview:api.inspect().preview,canonical,examples,errors:f.errors()}})()' >"$OUT/causality-layout-$layout.json"
done
for motion in normal reduced; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/prediction-ricochet-knockback-v1.fixture.html?scene=initial&motion=$motion&width=402&deadline=220" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__RICOCHET_FIXTURE__;for(let i=0;i<80;i++){if(f.runtime.inspect().finished)break;await new Promise(resolve=>setTimeout(resolve,25))}return{motion:document.body.dataset.motion,report:f.report(),runtime:f.runtime.inspect(),outcome:f.report().outcome}})()' >"$OUT/deadline-402x874-$motion.json"
done
OUT="$OUT" python - <<'PY'
from PIL import Image,ImageChops,ImageStat
from pathlib import Path
import json,math,os
root=Path(os.environ['OUT']); scenes=['initial','aim','bounce','impact','nearMiss','insufficient','collateral','selfHit','success','timeout']; metrics=['393x852','402x874']; rows=[]
for metric in metrics:
 for scene in scenes:
  a=Image.open(root/f'{metric}-{scene}-normal.png').convert('RGB'); b=Image.open(root/f'{metric}-{scene}-reduced.png').convert('RGB'); diff=ImageChops.difference(a,b); stat=ImageStat.Stat(diff)
  rows.append({'key':f'{metric}-{scene}','size':[a.width,a.height],'mae':round(sum(stat.mean)/3,3),'rmse':round(math.sqrt(sum(x*x for x in stat.rms)/3),3),'normalizedRMSE':round(math.sqrt(sum(x*x for x in stat.rms)/3)/255,6),'changed':round(sum(px!=(0,0,0) for px in diff.getdata())/(a.width*a.height),4)})
report={'canonicalViewports':[{'width':393,'height':852,'dpr':3},{'width':402,'height':874,'dpr':3}],'states':scenes,'comparisons':len(rows),'screenshots':len(rows)*2,'allDpr3':True,'allFullResolution':all(row['size'] in ([1179,2556],[1206,2622]) for row in rows),'meanMAE':round(sum(row['mae'] for row in rows)/len(rows),3),'maxMAE':max(row['mae'] for row in rows),'maxNormalizedRMSE':max(row['normalizedRMSE'] for row in rows),'meanChanged':round(sum(row['changed'] for row in rows)/len(rows),4),'rows':rows}
(root/'comparison-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
def load(name):return json.loads((root/name).read_text())
evidence={'lane':{'name':'audit','cdp':9332,'http':8862},'canonical':{'viewports':report['canonicalViewports'],'states':scenes,'screenshots':report['screenshots']},'matrix':{metric:{motion:{scene:load(f'evidence-{metric}-{scene}-{motion}.json') for scene in scenes} for motion in ['normal','reduced']} for metric in metrics},'touch402':{motion:load(f'touch-402x874-{motion}.json') for motion in ['normal','reduced']},'keyboard402':{motion:load(f'keyboard-402x874-{motion}.json') for motion in ['normal','reduced']},'dispose402':{motion:load(f'dispose-402x874-{motion}.json') for motion in ['normal','reduced']},'deadline402':{motion:load(f'deadline-402x874-{motion}.json') for motion in ['normal','reduced']},'causality':[load(f'causality-layout-{i}.json') for i in range(3)],'performance':{metric:load(f'performance-{metric}.json') for metric in metrics},'supplemental':{metric:{motion:{scene:load(f'supplemental-{metric}-{scene}-{motion}.json') for scene in ['initial','success']} for motion in ['normal','reduced']} for metric in ['390x844','430x932']}}
(root/'browser-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='rows'},indent=2))
PY
