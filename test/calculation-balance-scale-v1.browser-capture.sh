#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd);STAMP=$(date +%Y%m%d-%H%M%S);OUT=${1:-/tmp/agetest-calculation-balance-scale-v1-audit-$STAMP};cd "$ROOT"
if [[ -e "$OUT" ]];then echo "refusing existing output: $OUT" >&2;exit 2;fi
mkdir -p "$OUT";node tools/qa-browser-lanes.mjs start audit >/dev/null
ready='(async()=>{for(let i=0;i<240;i++){if(window.__BALANCE_SCALE_FIXTURE__&&document.documentElement.dataset.ready==="true")return true;await new Promise(r=>setTimeout(r,25))}throw Error("ready timeout")})()'
nav(){ local scenario=$1 scene=$2 motion=$3 width=$4 height=$5 live=${6:-0};node tools/qa-browser-lanes.mjs navigate audit "http://127.0.0.1:8862/test/calculation-balance-scale-v1.fixture.html?scenario=$scenario&scene=$scene&motion=$motion&width=$width&live=$live" "$width" "$height" 3 >/dev/null;node tools/qa-browser-lanes.mjs eval audit "$ready" >/dev/null;}
metrics=(393x852 402x874);motions=(normal reduced);scenarios=(0 1 2 3 4 5);scenes=(initial composed first-log singleton wrong-token ambiguous poor empty success timeout)
for scenario in "${scenarios[@]}";do for metric in "${metrics[@]}";do width=${metric%x*};height=${metric#*x};for motion in "${motions[@]}";do for scene in "${scenes[@]}";do
 nav "$scenario" "$scene" "$motion" "$width" "$height"
 node tools/qa-browser-lanes.mjs eval audit 'window.__BALANCE_SCALE_FIXTURE__.report()' >"$OUT/evidence-$scenario-$metric-$scene-$motion.json"
 node tools/qa-browser-lanes.mjs screenshot audit "$OUT/case$scenario-$metric-$scene-$motion.png" >/dev/null
done
 nav "$scenario" initial "$motion" "$width" "$height" 1
 node tools/qa-browser-lanes.mjs eval audit '(()=>{const f=window.__BALANCE_SCALE_FIXTURE__,c=document.querySelector("canvas");c.focus();c.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));document.body.classList.add("fixture-focus");return{focused:c===document.activeElement,state:f.api.inspect(),report:f.report()}})()' >"$OUT/focus-$scenario-$metric-$motion.json"
 node tools/qa-browser-lanes.mjs screenshot audit "$OUT/focus-$scenario-$metric-$motion.png" >/dev/null
done;done;done
for metric in 390x844 430x932;do width=${metric%x*};height=${metric#*x};for scenario in "${scenarios[@]}";do for motion in "${motions[@]}";do for scene in initial success;do
 nav "$scenario" "$scene" "$motion" "$width" "$height"
 node tools/qa-browser-lanes.mjs eval audit 'window.__BALANCE_SCALE_FIXTURE__.report()' >"$OUT/boundary-$scenario-$metric-$scene-$motion.json"
 node tools/qa-browser-lanes.mjs screenshot audit "$OUT/boundary-case$scenario-$metric-$scene-$motion.png" >/dev/null
done;done;done;done
hash_js='(async()=>{const f=window.__BALANCE_SCALE_FIXTURE__,encode=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,"0")).join(""),digest=async v=>hex(await crypto.subtle.digest("SHA-256",encode.encode(v))),canvas=document.querySelector("canvas"),host=document.querySelector("#challenge");return{scenario:f.scenario,scene:f.scene,motion:f.motion,count:f.task.count,canvasHash:await digest(canvas.toDataURL()),domHash:await digest(host.innerHTML),state:f.api.inspect(),report:f.report()}})()'
for metric in "${metrics[@]}";do width=${metric%x*};height=${metric#*x};for motion in "${motions[@]}";do for scene in initial composed;do for scenario in "${scenarios[@]}";do nav "$scenario" "$scene" "$motion" "$width" "$height";node tools/qa-browser-lanes.mjs eval audit "$hash_js" >"$OUT/no-cue-$scenario-$metric-$scene-$motion.json";done;done;done;done

touch_js=$(cat <<'JS'
(async()=>{const f=window.__BALANCE_SCALE_FIXTURE__,api=f.api,c=document.querySelector("canvas"),wait=ms=>new Promise(r=>setTimeout(r,ms)),fire=(type,x,y,id)=>{const r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:id,pointerType:"touch",isPrimary:true,clientX:r.left+x*r.width,clientY:r.top+y*r.height}))},source=id=>{const s=api.inspect(),left=s.left.indexOf(id),right=s.right.indexOf(id);if(left>=0)return{x:.27+(left-(s.left.length-1)/2)*.045,y:.43-(left%2)*.034};if(right>=0)return{x:.73+(right-(s.right.length-1)/2)*.045,y:.43-(right%2)*.034};const pool=Array.from({length:f.task.count},(_,i)=>i+1).filter(v=>!s.left.includes(v)&&!s.right.includes(v)),index=pool.indexOf(id);return{x:.13+(index%6)*.148,y:.64+Math.floor(index/6)*.095}},drag=async(id,zone,seq)=>{const p=source(id),q=zone==="left"?{x:.27,y:.43}:zone==="right"?{x:.73,y:.43}:{x:.5,y:.7};fire("pointerdown",p.x,p.y,seq);fire("pointermove",(p.x+q.x)/2,(p.y+q.y)/2,seq);fire("pointerup",q.x,q.y,seq);await wait(12)},press=button=>button.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,cancelable:true,pointerId:900,pointerType:"touch",isPrimary:true})),steps=[];let node=f.task.strategy,seq=40;for(let use=0;use<3;use++){const current=api.inspect();for(const id of[...current.left,...current.right])await drag(id,"pool",seq++);for(const id of node.left)await drag(id,"left",seq++);for(const id of node.right)await drag(id,"right",seq++);const before=api.inspect();press(document.querySelector(".cbs-actions button"));const locked=api.inspect();await wait(f.motion==="reduced"?240:370);const after=api.inspect(),row=after.log.at(-1);steps.push({node:{left:[...node.left],right:[...node.right]},before,locked,after});node=node.branches[row.result]}press(document.querySelectorAll(".cbs-token")[f.task.hidden.token-1]);const actions=document.querySelectorAll(".cbs-actions button");press(actions[f.task.hidden.tendency==="heavy"?1:2]);press(actions[3]);const terminal=api.inspect();await wait(f.motion==="reduced"?150:500);const report=f.report();return{status:report.status,scenario:f.scenario,motion:f.motion,hidden:structuredClone(f.task.hidden),steps,terminal,after:api.inspect(),runtime:f.runtime.inspect(),finishes:report.finishes,focused:document.activeElement?.tagName||null,targets:report.targets,overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()
JS
)
for scenario in "${scenarios[@]}";do for motion in "${motions[@]}";do nav "$scenario" initial "$motion" 402 874 1;node tools/qa-browser-lanes.mjs eval audit "$touch_js" >"$OUT/touch-strategy-$scenario-$motion.json";node tools/qa-browser-lanes.mjs screenshot audit "$OUT/touch-success-$scenario-$motion.png" >/dev/null;done;done

keyboard_js=$(cat <<'JS'
(async()=>{const f=window.__BALANCE_SCALE_FIXTURE__,api=f.api,c=document.querySelector("canvas"),wait=ms=>new Promise(r=>setTimeout(r,ms)),keys=[],key=value=>{c.dispatchEvent(new KeyboardEvent("keydown",{key:value,bubbles:true,cancelable:true}));keys.push(value)},go=id=>{let guard=0;while(api.inspect().selected!==id&&guard++<f.task.count){key("ArrowRight")}},steps=[];c.focus();let node=f.task.strategy;for(let use=0;use<3;use++){for(let id=1;id<=f.task.count;id++){go(id);key("p")}for(const id of node.left){go(id);key("l")}for(const id of node.right){go(id);key("r")}const before=api.inspect(),button=document.querySelector(".cbs-actions button");button.focus();button.click();const locked=api.inspect();await wait(f.motion==="reduced"?240:370);c.focus();const after=api.inspect(),row=after.log.at(-1);steps.push({node:{left:[...node.left],right:[...node.right]},before,locked,after});node=node.branches[row.result]}go(f.task.hidden.token);const actions=document.querySelectorAll(".cbs-actions button");actions[f.task.hidden.tendency==="heavy"?1:2].focus();actions[f.task.hidden.tendency==="heavy"?1:2].click();actions[3].focus();actions[3].click();const terminal=api.inspect();await wait(f.motion==="reduced"?150:500);const report=f.report();return{status:report.status,scenario:f.scenario,motion:f.motion,keys,steps,terminal,after:api.inspect(),runtime:f.runtime.inspect(),finishes:report.finishes,focused:document.activeElement?.textContent||null,targets:report.targets,overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()
JS
)
for pair in 0:normal 5:reduced;do scenario=${pair%:*};motion=${pair#*:};nav "$scenario" initial "$motion" 402 874 1;node tools/qa-browser-lanes.mjs eval audit "$keyboard_js" >"$OUT/keyboard-strategy-$scenario-$motion.json";node tools/qa-browser-lanes.mjs screenshot audit "$OUT/keyboard-success-$scenario-$motion.png" >/dev/null;done

deadline_js='(async()=>{const f=window.__BALANCE_SCALE_FIXTURE__,wait=ms=>new Promise(r=>setTimeout(r,ms));f.api.runStrategyStep();await wait(f.motion==="reduced"?240:370);f.api.assign(f.task.count,"left");f.api.selectToken(Math.min(2,f.task.count));f.api.selectTendency("light");const before=f.api.snapshot();f.runtime.context.setDeadline(180,f.api.expire);await wait(700);const report=f.report();return{motion:f.motion,before,after:f.api.inspect(),runtime:f.runtime.inspect(),finishes:report.finishes,overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors}})()'
dispose_js='(async()=>{const f=window.__BALANCE_SCALE_FIXTURE__,wait=ms=>new Promise(r=>setTimeout(r,ms));f.api.runStrategyStep();const state=f.api.inspect(),before=f.runtime.inspect();f.runtime.dispose();await wait(440);return{motion:f.motion,state,before,after:f.runtime.inspect(),disposedState:f.api.inspect(),qaPresent:Boolean(f.qa[f.game.metadata.id]),finishes:f.report().finishes}})()'
for motion in "${motions[@]}";do nav 3 initial "$motion" 402 874 1;node tools/qa-browser-lanes.mjs eval audit "$deadline_js" >"$OUT/deadline-$motion.json";node tools/qa-browser-lanes.mjs screenshot audit "$OUT/deadline-$motion.png" >/dev/null;nav 3 initial "$motion" 402 874 1;node tools/qa-browser-lanes.mjs eval audit "$dispose_js" >"$OUT/dispose-$motion.json";done

perf_js='(async()=>{const f=window.__BALANCE_SCALE_FIXTURE__,d=[];f.api.runStrategyStep();let p=performance.now();await new Promise(resolve=>{const tick=n=>{d.push(n-p);p=n;if(d.length===90)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick)});const report=f.report(),runtime=f.runtime.inspect();return{status:d.length===90&&runtime.frames===0&&!report.external.length&&!report.errors.length&&report.viewport.bodyScrollWidth<=report.width?"pass":"fail",scenario:f.scenario,motion:f.motion,frames:d.length,averageFrameMs:d.reduce((a,b)=>a+b,0)/d.length,maxFrameMs:Math.max(...d),gameOwnedFrames:runtime.frames,state:f.api.inspect(),runtime,overflow:report.viewport.bodyScrollWidth>report.width,external:report.external,errors:report.errors,canvas:report.state.canvas}})()'
for metric in "${metrics[@]}";do width=${metric%x*};height=${metric#*x};for motion in "${motions[@]}";do nav 4 initial "$motion" "$width" "$height" 1;node tools/qa-browser-lanes.mjs eval audit "$perf_js" >"$OUT/performance-$metric-$motion.json";done;done

OUT="$OUT" python - <<'PY'
from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import json,math,os
root=Path(os.environ['OUT']);scenarios=range(6);metrics=['393x852','402x874'];scenes=['initial','composed','first-log','singleton','wrong-token','ambiguous','poor','empty','success','timeout'];rows=[];fail=[]
result_expect={'initial':None,'composed':None,'first-log':None,'singleton':None,'wrong-token':'wrong-token','ambiguous':'ambiguous','poor':'information-poor','empty':'empty-weighing','success':'success','timeout':'timeout'};first_results=set()
for case in scenarios:
 for metric in metrics:
  for scene in scenes:
   a=Image.open(root/f'case{case}-{metric}-{scene}-normal.png').convert('RGB');b=Image.open(root/f'case{case}-{metric}-{scene}-reduced.png').convert('RGB');d=ImageChops.difference(a,b);stat=ImageStat.Stat(d);rows.append({'key':f'{case}-{metric}-{scene}','size':[a.width,a.height],'mae':round(sum(stat.mean)/3,3),'rmse':round(math.sqrt(sum(v*v for v in stat.rms)/3),3),'normalizedRMSE':round(math.sqrt(sum(v*v for v in stat.rms)/3)/255,6),'changed':round(sum(px!=(0,0,0) for px in d.getdata())/(a.width*a.height),5)})
   for motion in ['normal','reduced']:
    e=json.loads((root/f'evidence-{case}-{metric}-{scene}-{motion}.json').read_text());state=e['state']
    if scene=='first-log':first_results.add(state['log'][0]['result'])
    geometry=state['outcome']==result_expect[scene] and (scene!='singleton' or state['uses']==3 and len(state['candidates'])==1) and (scene not in ['ambiguous','poor','empty','success','timeout','wrong-token'] or state['done'])
    if e['status']!='pass' or e['dpr']!=3 or e['external'] or e['errors'] or e['viewport']['bodyScrollWidth']>e['width'] or state['canvas']['dpr']!=3 or not geometry:fail.append(f'evidence {case} {metric} {scene} {motion}')
if first_results!={'left','balanced','right'}:fail.append(f'pose coverage {sorted(first_results)}')
for metric in metrics:
 width,height=map(int,metric.split('x'))
 for case in scenarios:
  for motion in ['normal','reduced']:
   e=json.loads((root/f'focus-{case}-{metric}-{motion}.json').read_text())
   if not e['focused'] or e['report']['status']!='pass' or e['report']['viewport']['bodyScrollWidth']>width:fail.append(f'focus {case} {metric} {motion}')
for metric in ['390x844','430x932']:
 width,height=map(int,metric.split('x'));expected=(width*3,height*3)
 for case in scenarios:
  for motion in ['normal','reduced']:
   for scene in ['initial','success']:
    e=json.loads((root/f'boundary-{case}-{metric}-{scene}-{motion}.json').read_text());im=Image.open(root/f'boundary-case{case}-{metric}-{scene}-{motion}.png')
    if e['status']!='pass' or e['dpr']!=3 or e['errors'] or e['external'] or e['viewport']['bodyScrollWidth']>width or im.size!=expected:fail.append(f'boundary {case} {metric} {scene} {motion}')
for metric in metrics:
 for motion in ['normal','reduced']:
  for scene in ['initial','composed']:
   for a,b in [(0,1),(2,3),(4,5)]:
    x=json.loads((root/f'no-cue-{a}-{metric}-{scene}-{motion}.json').read_text());y=json.loads((root/f'no-cue-{b}-{metric}-{scene}-{motion}.json').read_text())
    if (x['canvasHash'],x['domHash'])!=(y['canvasHash'],y['domHash']):fail.append(f'cue mismatch {a}/{b} {metric} {scene} {motion}')
def predicted(hidden,left,right):
 sign=1 if hidden['tendency']=='heavy' else -1
 effect=sign if hidden['token'] in left else -sign if hidden['token'] in right else 0
 return 'left' if effect>0 else 'right' if effect<0 else 'balanced'
for case in scenarios:
 for motion in ['normal','reduced']:
  e=json.loads((root/f'touch-strategy-{case}-{motion}.json').read_text())
  ok=e['status']=='pass' and len(e['steps'])==3 and all(s['locked']['busy'] and s['before']['left']==s['node']['left'] and s['before']['right']==s['node']['right'] and s['after']['uses']==i+1 and s['after']['log'][-1]['result']==predicted(e['hidden'],s['node']['left'],s['node']['right']) and s['after']['log'][-1]['after']==len(s['after']['candidates']) for i,s in enumerate(e['steps'])) and e['after']['outcome']=='success' and len(e['finishes'])==1 and e['finishes'][0]['correct'] and not e['overflow'] and not e['external'] and not e['errors'] and min(t['height'] for t in e['targets'])>=44
  if not ok:fail.append(f'touch {case} {motion}')
for case,motion in [(0,'normal'),(5,'reduced')]:
 e=json.loads((root/f'keyboard-strategy-{case}-{motion}.json').read_text())
 if not(len(e['steps'])==3 and e['after']['outcome']=='success' and len(e['finishes'])==1 and e['finishes'][0]['correct'] and not e['overflow'] and not e['errors']):fail.append(f'keyboard {case} {motion}')
for motion in ['normal','reduced']:
 e=json.loads((root/f'deadline-{motion}.json').read_text())
 if not(e['after']['outcome']=='timeout' and len(e['finishes'])==1 and all(e['before'][k]==e['after'][k] for k in ['left','right','log','candidates','uses','pose','selected','tendency'])):fail.append(f'deadline {motion}')
 e=json.loads((root/f'dispose-{motion}.json').read_text())
 if not(e['after']['disposed'] and e['after']['timeouts']==0 and e['after']['listeners']==0 and not e['qaPresent'] and not e['finishes']):fail.append(f'dispose {motion}')
for metric in metrics:
 for motion in ['normal','reduced']:
  e=json.loads((root/f'performance-{metric}-{motion}.json').read_text())
  if not(e['status']=='pass' and e['frames']==90 and e['gameOwnedFrames']==0 and not e['overflow'] and not e['external'] and not e['errors']):fail.append(f'performance {metric} {motion}')
report={'status':'pass' if not fail else 'fail','canonicalViewports':[{'width':393,'height':852,'dpr':3},{'width':402,'height':874,'dpr':3}],'scenarios':list(scenarios),'states':scenes,'comparisons':len(rows),'canonicalScreenshots':len(rows)*2,'focusScreenshots':24,'boundaryScreenshots':48,'touchRoutes':12,'keyboardRoutes':2,'allDpr3':not any('evidence' in x for x in fail),'allFullResolution':all(r['size'] in ([1179,2556],[1206,2622]) for r in rows),'maxMAE':max(r['mae'] for r in rows),'meanMAE':round(sum(r['mae'] for r in rows)/len(rows),3),'maxNormalizedRMSE':max(r['normalizedRMSE'] for r in rows),'meanChanged':round(sum(r['changed'] for r in rows)/len(rows),5),'failures':fail,'rows':rows};(root/'comparison-report.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='rows'},indent=2));raise SystemExit(bool(fail))
PY
echo "$OUT"
