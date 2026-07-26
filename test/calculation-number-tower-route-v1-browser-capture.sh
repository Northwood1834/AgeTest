#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
LANE_TOOL="$ROOT/tools/qa-browser-lanes.mjs"
LANE=${QA_BROWSER_LANE:-flow}
HTTP_PORT=${QA_BROWSER_HTTP_PORT:-8861}
OUT="$ROOT/test/calculation-number-tower-route-v1-visual"
BASE="http://127.0.0.1:$HTTP_PORT/test/calculation-number-tower-route-v1.fixture.html"
SCENARIOS=(initial focus invalid travel input-lock addition multiply enemy retained too-strong operator-trap boss-defeat success timeout reduced reduced-timeout touch keyboard)
TERMINALS=(too-strong operator-trap boss-defeat success timeout reduced-timeout)
mkdir -p "$OUT"
rm -f "$OUT"/*.png "$OUT"/*.json
nav(){ node "$LANE_TOOL" navigate "$LANE" "$1" "$2" "$3" 3 >/dev/null; }
evaljs(){ node "$LANE_TOOL" eval "$LANE" "$1"; }
shot(){ node "$LANE_TOOL" screenshot "$LANE" "$1" >/dev/null; }
wait_ready(){ evaljs '(async()=>{for(let i=0;i<160;i++){if(document.documentElement.dataset.ready==="true")return true;await new Promise(r=>setTimeout(r,50))}throw Error("fixture not ready")})()' >/dev/null; }
is_terminal(){ local name=$1;for item in "${TERMINALS[@]}";do [[ "$item" == "$name" ]]&&return 0;done;return 1; }
compact='(()=>{const e=numberTowerFixture.evidence(),active=document.activeElement;return{scenario:e.scenario,viewport:e.viewport,game:e.game,result:e.result,runtime:e.runtime,errors:e.errors,external:e.external,overflow:e.overflow,buttonCount:e.buttonCount,active:e.active,canvasAria:e.canvasAria,status:document.querySelector(".cntr-status")?.textContent||null,ledger:document.querySelector(".cntr-ledger")?.textContent||null,terminal:document.querySelector(".cntr-terminal:not([hidden])")?.textContent||null,task:{variant:e.task.variant,start:e.task.start,boss:e.task.boss,winningLanes:e.task.proof.winningLanes,winningTrace:e.task.proof.winningTrace,routeCount:e.task.proof.routeCount,counts:e.task.proof.counts,maxObserved:e.task.proof.maxObserved},dom:{rooms:document.querySelectorAll(".cntr-room").length,reachable:document.querySelectorAll(".cntr-room[data-reachable=true]").length,invalid:document.querySelectorAll(".cntr-room[data-invalid=true]").length,disabled:document.querySelectorAll(".cntr-room:disabled").length}}})()'
for metrics in 393x852 402x874;do
  width=${metrics%x*};height=${metrics#*x}
  for scenario in "${SCENARIOS[@]}";do
    reduced="";[[ "$scenario" == "reduced" ]]&&reduced="&reduced=1"
    nav "$BASE?scenario=$scenario$reduced&capture=$(date +%s%N)" "$width" "$height"
    wait_ready
    if is_terminal "$scenario";then evaljs '(async()=>{await new Promise(r=>setTimeout(r,780));return true})()' >/dev/null;fi
    evaljs "$compact" > "$OUT/$metrics-$scenario.json"
    shot "$OUT/$metrics-$scenario.png"
  done
  nav "$BASE?scenario=initial&perf=$(date +%s%N)" "$width" "$height";wait_ready
  evaljs '(async()=>{const deltas=[];let previous=performance.now();for(let i=0;i<120;i++)await new Promise(resolve=>requestAnimationFrame(now=>{deltas.push(now-previous);previous=now;resolve()}));const e=numberTowerFixture.evidence(),stable=deltas.slice(5);return{viewport:e.viewport,frames:stable.length,averageFrameMs:stable.reduce((a,b)=>a+b,0)/stable.length,maxFrameMs:Math.max(...stable),over25ms:stable.filter(value=>value>25).length,gameFrames:e.game.frames,canvas:e.game.canvas,errors:e.errors,external:e.external,overflow:e.overflow}})()' > "$OUT/$metrics-performance.json"
  evaljs '(async()=>{const before=numberTowerFixture.runtime();numberTowerFixture.dispose();await new Promise(r=>setTimeout(r,80));return{before,after:numberTowerFixture.runtime(),game:numberTowerFixture.inspect(),errors:numberTowerFixture.errors()}})()' > "$OUT/$metrics-dispose.json"
done
for metrics in 390x844 430x932;do
  width=${metrics%x*};height=${metrics#*x}
  nav "$BASE?scenario=initial&boundary=$(date +%s%N)" "$width" "$height";wait_ready
  evaljs "$compact" > "$OUT/boundary-$width.json"
  shot "$OUT/boundary-$metrics.png"
done
python - "$OUT" "$LANE" <<'PY'
import json,sys
from datetime import date
from pathlib import Path
out=Path(sys.argv[1]);lane=sys.argv[2];scenarios=[]
for path in sorted(out.glob('*x*-*.json')):
    if path.name.endswith(('-performance.json','-dispose.json')):continue
    scenarios.append(json.loads(path.read_text()))
perf={p.name.split('-performance.json')[0]:json.loads(p.read_text()) for p in sorted(out.glob('*-performance.json'))}
dispose={p.name.split('-dispose.json')[0]:json.loads(p.read_text()) for p in sorted(out.glob('*-dispose.json'))}
boundaries={p.stem.split('-')[1]:json.loads(p.read_text()) for p in sorted(out.glob('boundary-*.json'))}
by={(row['viewport']['width'],row['scenario']):row for row in scenarios}
expected={'initial','focus','invalid','travel','input-lock','addition','multiply','enemy','retained','too-strong','operator-trap','boss-defeat','success','timeout','reduced','reduced-timeout','touch','keyboard'}
def behavior(width):
    rows={name:by[(width,name)] for name in expected}
    initial=rows['initial'];focus=rows['focus'];invalid=rows['invalid'];travel=rows['travel'];locked=rows['input-lock'];addition=rows['addition'];multiply=rows['multiply'];enemy=rows['enemy'];retained=rows['retained'];success=rows['success']
    trace=success['game']['trace']
    return (
      initial['game']['floor']==0 and initial['game']['value']==15 and initial['dom']['rooms']==13 and initial['dom']['reachable']==3 and initial['task']['routeCount']==41 and initial['task']['counts']['success']==1 and initial['task']['maxObserved']<=999 and
      focus['active']['tag']=='BUTTON' and focus['active']['id']=='f1c1' and
      invalid['game']['done'] is False and invalid['game']['invalidId']=='f3c2' and invalid['game']['floor']==2 and invalid['dom']['invalid']==1 and
      travel['game']['busy'] is True and travel['game']['transition']['targetId']=='f1c1' and 0<travel['game']['transition']['progress']<1 and travel['dom']['disabled']==13 and
      locked['game']['busy'] is True and locked['game']['transition']['targetId']=='f1c1' and locked['dom']['disabled']==13 and len(locked['game']['visited'])==0 and
      addition['game']['floor']==1 and addition['game']['value']==24 and len(addition['game']['trace'])==1 and
      multiply['game']['floor']==2 and multiply['game']['value']==72 and len(multiply['game']['blocked'])==4 and
      enemy['game']['floor']==3 and enemy['game']['value']==121 and enemy['game']['trace'][-1]['id']=='f3c1' and
      retained['game']['floor']==4 and retained['game']['value']==238 and len(retained['game']['visited'])==4 and len(retained['game']['blocked'])==8 and
      rows['too-strong']['game']['result']=='too-strong' and rows['too-strong']['result']['detail']['reason']=='too-strong' and rows['too-strong']['runtime']['commits']==1 and
      rows['operator-trap']['game']['result']=='operator-trap' and rows['operator-trap']['result']['detail']['reason']=='operator-trap' and rows['operator-trap']['runtime']['commits']==1 and
      rows['boss-defeat']['game']['result']=='boss-defeat' and rows['boss-defeat']['result']['detail']['reason']=='boss-defeat' and rows['boss-defeat']['runtime']['commits']==1 and
      success['game']['result']=='success' and success['result']['correct'] is True and success['runtime']['commits']==1 and success['game']['visited'][-1]=='boss' and trace==success['task']['winningTrace'] and all(trace[index]['before']==trace[index-1]['after'] for index in range(1,len(trace))) and
      rows['timeout']['game']['result']=='timeout' and rows['timeout']['result']['detail']['reason']=='timeout' and rows['timeout']['runtime']['commits']==1 and rows['timeout']['game']['floor']==1 and
      rows['reduced']['game']['frames']==0 and rows['reduced']['runtime']['frames']==0 and rows['reduced']['game']['floor']==1 and
      rows['reduced-timeout']['game']['result']=='timeout' and rows['reduced-timeout']['result']['detail']['reason']=='timeout' and rows['reduced-timeout']['runtime']['commits']==1 and rows['reduced-timeout']['game']['frames']==0 and rows['reduced-timeout']['game']['floor']==1 and
      rows['touch']['game']['floor']==1 and rows['touch']['game']['trace'][0]['id']=='f1c1' and
      rows['keyboard']['game']['floor']==1 and rows['keyboard']['game']['trace'][0]['id']=='f1c2' and rows['keyboard']['game']['result']=='too-strong'
    )
checks={
 'scenarioCount':len(scenarios),
 'requiredScenarioSet':all({row['scenario'] for row in scenarios if row['viewport']['width']==width}==expected for width in (393,402)),
 'behaviorPass':all(behavior(width) for width in (393,402)),
 'allErrorsEmpty':all(not row['errors'] for row in scenarios),
 'allExternalEmpty':all(not row['external'] for row in scenarios),
 'allNoOverflow':all(not row['overflow'] for row in scenarios),
 'allDpr3':all(row['viewport']['dpr']==3 and row['game']['canvas']['dpr']==3 for row in scenarios),
 'boundary390And430':set(boundaries)=={'390','430'} and all(row['viewport']['width']==int(width) and row['viewport']['dpr']==3 and row['game']['canvas']['dpr']==3 and not row['overflow'] and not row['errors'] and not row['external'] and row['buttonCount']==13 for width,row in boundaries.items()),
 'allAuthoredProof':all(row['task']['routeCount']==41 and row['task']['counts']['success']==1 and row['task']['counts']['too-strong']>=2 and row['task']['counts']['operator-trap']>=2 and row['task']['counts']['boss-defeat']>=2 and row['task']['maxObserved']<=999 for row in scenarios),
 'performancePass':all(row['frames']>=110 and row['averageFrameMs']<20 and row['maxFrameMs']<50 and not row['errors'] and not row['external'] and not row['overflow'] for row in perf.values()),
 'disposePass':all(row['after']=={'disposed':True,'finished':False,'finishCalls':0,'commits':0,'timeouts':0,'frames':0,'listeners':0,'aborted':True} and not row['errors'] for row in dispose.values())
}
report={'game':'calculation-number-tower-route-v1','lane':{'name':lane,'cdp':9331,'http':8861,'tool':'tools/qa-browser-lanes.mjs'},'captured':str(date.today()),'viewports':['393x852 DPR3','402x874 DPR3'],'responsiveBoundaries':['390x844 DPR3','430x932 DPR3'],'scenarioNames':sorted(expected),'checks':checks,'performance':perf,'dispose':dispose,'boundaries':boundaries,'scenarios':scenarios,'screenshots':sorted(p.name for p in out.glob('*.png'))}
report['status']='pass' if all(checks.values()) else 'fail'
(out.parent/'calculation-number-tower-route-v1.browser-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':checks},ensure_ascii=False))
PY
