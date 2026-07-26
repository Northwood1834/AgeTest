#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=${1:-/tmp/agetest-social-care-package-v1-visual}
cd "$ROOT"
node tools/qa-browser-lanes.mjs start audit >/dev/null
rm -rf "$OUT"; mkdir -p "$OUT"
scenes=(initial drag packed repacked capacity-invalid mixed intrusive-photo intrusive-friends success-reply success-video timeout)
ready='(async()=>{for(let i=0;i<300;i++){if(window.__CARE_PACKAGE_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(resolve=>setTimeout(resolve,25))}throw new Error("fixture readiness timeout")})()'
for metric in 393x852 402x874; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    for scene in "${scenes[@]}"; do
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
      node tools/qa-browser-lanes.mjs eval audit 'window.__CARE_PACKAGE_FIXTURE__.report()' >"$OUT/evidence-$metric-$scene-$motion.json"
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/$metric-$scene-$motion.png" >/dev/null
    done
  done
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=initial&width=$width" "$width" "$height" 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const fixture=window.__CARE_PACKAGE_FIXTURE__,deltas=[];let previous=performance.now();await new Promise(resolve=>{const tick=now=>{deltas.push(now-previous);previous=now;if(deltas.length>=90)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick)});const report=fixture.report();return{status:deltas.length===90&&!report.external.length&&!report.errors.length&&report.viewport.bodyScrollWidth<=report.width?"pass":"fail",frames:deltas.length,averageFrameMs:deltas.reduce((a,b)=>a+b,0)/deltas.length,maxFrameMs:Math.max(...deltas),gameOwnedFrames:fixture.runtime.inspect().frames,overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors,viewport:report.viewport}})()' >"$OUT/performance-$metric.json"
done
for metric in 390x844 430x932; do
  width=${metric%x*}; height=${metric#*x}
  for motion in normal reduced; do
    for scene in initial success-video; do
      node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=$scene&motion=$motion&width=$width" "$width" "$height" 3 >/dev/null
      node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
      node tools/qa-browser-lanes.mjs eval audit 'window.__CARE_PACKAGE_FIXTURE__.report()' >"$OUT/supplemental-$metric-$scene-$motion.json"
      node tools/qa-browser-lanes.mjs screenshot audit "$OUT/supplemental-$metric-$scene-$motion.png" >/dev/null
    done
  done
done
for motion in normal reduced; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__CARE_PACKAGE_FIXTURE__,surface=document.querySelector(".scp-box"),button=id=>document.querySelector(`.scp-item[data-id="${id}"]`),fire=(node,type,x,y,id)=>node.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:"touch",isPrimary:true,clientX:x,clientY:y})),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),pause=document.body.dataset.motion==="reduced"?140:220;const drag=async(id,inside,pointerId)=>{const node=button(id),from=node.getBoundingClientRect(),target=inside?surface.getBoundingClientRect():document.querySelector(".scp-shelf").getBoundingClientRect(),x0=from.left+from.width/2,y0=from.top+from.height/2,x1=target.left+target.width/2,y1=target.top+Math.min(target.height*.65,160);fire(node,"pointerdown",x0,y0,pointerId);fire(node,"pointermove",x1,y1,pointerId);fire(node,"pointerup",x1,y1,pointerId);await wait(pause)};await drag("rice",true,31);const packed=f.inspect();await drag("rice",false,32);const removed=f.inspect();await drag("noodles",true,33);const repacked=f.inspect(),gift=button("gift");gift.focus();gift.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));await wait(pause);const keyboardPacked=f.inspect();gift.dispatchEvent(new KeyboardEvent("keydown",{key:"Delete",bubbles:true,cancelable:true}));await wait(pause);const keyboardRemoved=f.inspect(),report=f.report();return{motion:document.body.dataset.motion,packed,removed,repacked,keyboardPacked,keyboardRemoved,focusedId:document.activeElement?.dataset?.id||null,runtime:f.runtime.inspect(),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/interaction-402x874-$motion.json"
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=initial&motion=$motion&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__CARE_PACKAGE_FIXTURE__,api=f.qa[f.game.metadata.id];api.pack("rice");const before=f.runtime.inspect();f.runtime.dispose();const report=f.report();return{motion:document.body.dataset.motion,before,after:f.runtime.inspect(),qaPresent:Boolean(f.qa[f.game.metadata.id]),overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()' >"$OUT/dispose-402x874-$motion.json"
done
for scenario in 0 1 2; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=initial&scenario=$scenario&width=402" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__CARE_PACKAGE_FIXTURE__,api=f.qa[f.game.metadata.id],task=f.task;return{scenarioId:task.scenarioId,message:task.message,timely:task.timely,proof:task.proof,canonical:api.score(task.proof.answer),mixed:api.score(["canned","socks"]),photo:api.score(["noodles","pasta","gravure"]),friends:api.score(["rice","gift","friends"]),classifications:task.items.map(item=>({id:item.id,kind:item.kind,score:api.score([item.id]).score})),errors:f.errors()}})()' >"$OUT/score-family-$scenario.json"
done
for motion in normal reduced; do
  node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/social-care-package-v1.fixture.html?scene=packed&motion=$motion&width=402&deadline=750" 402 874 3 >/dev/null
  node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null
  node tools/qa-browser-lanes.mjs eval audit '(async()=>{const f=window.__CARE_PACKAGE_FIXTURE__;for(let i=0;i<80;i++){if(f.runtime.inspect().finished)break;await new Promise(resolve=>setTimeout(resolve,25))}return{motion:document.body.dataset.motion,report:f.report(),selected:f.inspect()?.selected||null,runtime:f.runtime.inspect(),outcome:f.report().outcome}})()' >"$OUT/deadline-402x874-$motion.json"
done
OUT="$OUT" python - <<'PY'
from PIL import Image,ImageChops,ImageStat
from pathlib import Path
import json,math,os
root=Path(os.environ['OUT']); scenes=['initial','drag','packed','repacked','capacity-invalid','mixed','intrusive-photo','intrusive-friends','success-reply','success-video','timeout']; metrics=['393x852','402x874']; rows=[]
for metric in metrics:
 for scene in scenes:
  a=Image.open(root/f'{metric}-{scene}-normal.png').convert('RGB'); b=Image.open(root/f'{metric}-{scene}-reduced.png').convert('RGB'); diff=ImageChops.difference(a,b); stat=ImageStat.Stat(diff)
  rows.append({'key':f'{metric}-{scene}','size':[a.width,a.height],'mae':round(sum(stat.mean)/3,3),'rmse':round(math.sqrt(sum(x*x for x in stat.rms)/3),3),'normalizedRMSE':round(math.sqrt(sum(x*x for x in stat.rms)/3)/255,6),'changed':round(sum(px!=(0,0,0) for px in diff.getdata())/(a.width*a.height),4)})
report={'canonicalViewports':[{'width':393,'height':852,'dpr':3},{'width':402,'height':874,'dpr':3}],'states':scenes,'comparisons':len(rows),'screenshots':len(rows)*2,'allDpr3':True,'allFullResolution':all(row['size'] in ([1179,2556],[1206,2622]) for row in rows),'meanMAE':round(sum(row['mae'] for row in rows)/len(rows),3),'maxMAE':max(row['mae'] for row in rows),'maxNormalizedRMSE':max(row['normalizedRMSE'] for row in rows),'meanChanged':round(sum(row['changed'] for row in rows)/len(rows),4),'rows':rows}
(root/'comparison-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
def load(name):return json.loads((root/name).read_text())
evidence={'lane':{'name':'audit','cdp':9332,'http':8862},'canonical':{'viewports':report['canonicalViewports'],'states':scenes,'screenshots':report['screenshots']},'matrix':{metric:{motion:{scene:load(f'evidence-{metric}-{scene}-{motion}.json') for scene in scenes} for motion in ['normal','reduced']} for metric in metrics},'interaction402':{motion:load(f'interaction-402x874-{motion}.json') for motion in ['normal','reduced']},'dispose402':{motion:load(f'dispose-402x874-{motion}.json') for motion in ['normal','reduced']},'deadline402':{motion:load(f'deadline-402x874-{motion}.json') for motion in ['normal','reduced']},'scoreFamilies':[load(f'score-family-{i}.json') for i in range(3)],'performance':{metric:load(f'performance-{metric}.json') for metric in metrics},'supplemental':{metric:{motion:{scene:load(f'supplemental-{metric}-{scene}-{motion}.json') for scene in ['initial','success-video']} for motion in ['normal','reduced']} for metric in ['390x844','430x932']}}
(root/'browser-evidence.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='rows'},indent=2))
PY
