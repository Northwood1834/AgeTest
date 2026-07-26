#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
LANE="$ROOT/tools/qa-browser-lanes.mjs"
OUT="$ROOT/test/attention-driving-safety-v1-visual"
BASE="http://127.0.0.1:8861/test/attention-driving-safety-v1.fixture.html"
SCENARIOS=(initial selected crosswalk-feedback phone phone-feedback railway railway-feedback alcohol alcohol-feedback fatigue fatigue-feedback success mixed all-wrong timeout focus reduced-feedback touch keyboard)
mkdir -p "$OUT"
rm -f "$OUT"/*.png "$OUT"/*.json
nav(){ node "$LANE" navigate flow "$1" "$2" "$3" 3 >/dev/null; }
evaljs(){ node "$LANE" eval flow "$1"; }
shot(){ node "$LANE" screenshot flow "$1" >/dev/null; }
wait_ready(){ evaljs '(async()=>{for(let i=0;i<140;i++){if(document.documentElement.dataset.ready==="true")return true;await new Promise(r=>setTimeout(r,50))}throw Error("fixture not ready")})()' >/dev/null; }
compact='(()=>{const e=drivingSafetyFixture.evidence(),active=document.activeElement;return{scenario:e.scenario,viewport:e.viewport,game:e.game,result:e.result,runtime:e.runtime,errors:e.errors,external:e.external,overflow:e.overflow,source:{label:e.task.source.label,url:e.task.source.url,confirmed:e.task.source.confirmed},question:e.game?.question||null,canvasAria:document.querySelector(".ads-canvas")?.getAttribute("aria-label")||null,active:{tag:active?.tagName||null,className:active?.className||null,text:active?.textContent?.trim()||null},provenance:document.querySelector(".ads-source")?.textContent||null,citation:document.querySelector(".ads-feedback:not([hidden]) .ads-line:last-of-type")?.textContent||null,pastQuestionClaim:/過去問|公式問題/.test(document.body.innerText)}})()'
for metrics in 393x852 402x874; do
  width=${metrics%x*};height=${metrics#*x}
  for scenario in "${SCENARIOS[@]}"; do
    reduced="";[[ "$scenario" == "reduced-feedback" ]]&&reduced="&reduced=1"
    nav "$BASE?scenario=$scenario$reduced&capture=$(date +%s%N)" "$width" "$height"
    wait_ready
    evaljs "$compact" > "$OUT/$metrics-$scenario.json"
    shot "$OUT/$metrics-$scenario.png"
  done
  nav "$BASE?scenario=initial&perf=$(date +%s%N)" "$width" "$height";wait_ready
  evaljs '(async()=>{const deltas=[];let previous=performance.now();for(let i=0;i<120;i++)await new Promise(resolve=>requestAnimationFrame(now=>{deltas.push(now-previous);previous=now;resolve()}));const e=drivingSafetyFixture.evidence(),stable=deltas.slice(5);return{viewport:e.viewport,frames:stable.length,averageFrameMs:stable.reduce((a,b)=>a+b,0)/stable.length,maxFrameMs:Math.max(...stable),over25ms:stable.filter(value=>value>25).length,gameFrames:e.game.frames,canvas:e.game.canvas,errors:e.errors,external:e.external,overflow:e.overflow}})()' > "$OUT/$metrics-performance.json"
  evaljs '(async()=>{const before=drivingSafetyFixture.runtime();drivingSafetyFixture.dispose();await new Promise(r=>setTimeout(r,80));return{before,after:drivingSafetyFixture.runtime(),game:drivingSafetyFixture.inspect(),errors:drivingSafetyFixture.errors()}})()' > "$OUT/$metrics-dispose.json"
done
python - "$OUT" <<'PY'
import json,sys
from datetime import date
from pathlib import Path
out=Path(sys.argv[1]); scenarios=[]
for path in sorted(out.glob('*x*-*.json')):
    if path.name.endswith(('-performance.json','-dispose.json')): continue
    scenarios.append(json.loads(path.read_text()))
perf={p.name.split('-performance.json')[0]:json.loads(p.read_text()) for p in sorted(out.glob('*-performance.json'))}
dispose={p.name.split('-dispose.json')[0]:json.loads(p.read_text()) for p in sorted(out.glob('*-dispose.json'))}
by={(row['viewport']['width'],row['scenario']):row for row in scenarios}
expected={'initial','selected','crosswalk-feedback','phone','phone-feedback','railway','railway-feedback','alcohol','alcohol-feedback','fatigue','fatigue-feedback','success','mixed','all-wrong','timeout','focus','reduced-feedback','touch','keyboard'}
def behavior(width):
    rows={name:by[(width,name)] for name in expected}
    feedback={'crosswalk-feedback':'crosswalk','phone-feedback':'phone','railway-feedback':'railway','alcohol-feedback':'alcohol','fatigue-feedback':'fatigue'}
    return (
      rows['initial']['game']['phase']=='question' and rows['initial']['game']['question']=='crosswalk' and rows['initial']['runtime']['frames']==1 and
      rows['selected']['game']['phase']=='question' and rows['selected']['game']['selected'] is True and not rows['selected']['game']['answers'] and
      all(rows[name]['game']['phase']=='review' and rows[name]['game']['question']==question and len(rows[name]['game']['answers'])==1 and '警察庁教則' in rows[name]['citation'] and '2026-07-26確認' in rows[name]['citation'] for name,question in feedback.items()) and
      rows['success']['game']['phase']=='final' and rows['success']['game']['score']==5 and len(rows['success']['game']['answers'])==5 and '携帯電話 正解' in rows['success']['canvasAria'] and '○' not in rows['success']['canvasAria'] and '×' not in rows['success']['canvasAria'] and
      rows['mixed']['game']['phase']=='final' and rows['mixed']['game']['score']==3 and len(rows['mixed']['game']['answers'])==5 and '携帯電話 不正解' in rows['mixed']['canvasAria'] and '踏切 正解' in rows['mixed']['canvasAria'] and '○' not in rows['mixed']['canvasAria'] and '×' not in rows['mixed']['canvasAria'] and
      rows['all-wrong']['game']['phase']=='final' and rows['all-wrong']['game']['score']==0 and len(rows['all-wrong']['game']['answers'])==5 and '横断歩道 不正解' in rows['all-wrong']['canvasAria'] and '○' not in rows['all-wrong']['canvasAria'] and '×' not in rows['all-wrong']['canvasAria'] and
      rows['timeout']['result']['detail']['reason']=='timeout' and rows['timeout']['runtime']['disposed'] is True and
      rows['focus']['active']['tag']=='BUTTON' and 'ads-answer' in rows['focus']['active']['className'] and '誤りと思う' in rows['focus']['active']['text'] and
      rows['reduced-feedback']['game']['phase']=='review' and rows['reduced-feedback']['game']['frames']==0 and rows['reduced-feedback']['runtime']['frames']==0 and
      rows['touch']['game']['phase']=='review' and len(rows['touch']['game']['answers'])==1 and
      rows['keyboard']['game']['phase']=='review' and len(rows['keyboard']['game']['answers'])==1
    )
checks={
  'scenarioCount':len(scenarios),
  'requiredScenarioSet':all({row['scenario'] for row in scenarios if row['viewport']['width']==width}==expected for width in (393,402)),
  'behaviorPass':all(behavior(width) for width in (393,402)),
  'allErrorsEmpty':all(not row['errors'] for row in scenarios),
  'allExternalEmpty':all(not row['external'] for row in scenarios),
  'allNoOverflow':all(not row['overflow'] for row in scenarios),
  'allDpr3':all(row['viewport']['dpr']==3 for row in scenarios),
  'sourceLabelExact':all(row['source']['label']=='本試験形式・警察庁教則準拠' and row['provenance'].startswith('本試験形式・警察庁教則準拠') for row in scenarios),
  'sourceOfficialUrl':all(row['source']['url']=='https://www.npa.go.jp/bureau/traffic/20241113kyousoku.pdf' for row in scenarios),
  'sourceConfirmed':all(row['source']['confirmed']=='2026-07-26' for row in scenarios),
  'noPastQuestionClaim':all(not row['pastQuestionClaim'] for row in scenarios),
  'performancePass':all(row['frames']>=110 and row['averageFrameMs']<20 and row['maxFrameMs']<50 and not row['errors'] and not row['external'] and not row['overflow'] for row in perf.values()),
  'disposePass':all(row['after']=={'disposed':True,'finished':False,'finishCalls':0,'commits':0,'timeouts':0,'frames':0,'listeners':0,'aborted':True} and row['game'] is None and not row['errors'] for row in dispose.values())
}
report={'game':'attention-driving-safety-v1','lane':{'name':'flow','cdp':9331,'http':8861,'tool':'tools/qa-browser-lanes.mjs'},'captured':str(date.today()),'viewports':['393x852 DPR3','402x874 DPR3'],'scenarioNames':['initial/crosswalk','selected','crosswalk-feedback','phone','phone-feedback','railway','railway-feedback','alcohol','alcohol-feedback','fatigue','fatigue-feedback','success/all-correct','mixed','all-wrong','timeout','focus','reduced-feedback','touch','keyboard'],'checks':checks,'performance':perf,'dispose':dispose,'scenarios':scenarios,'screenshots':sorted(p.name for p in out.glob('*.png'))}
report['status']='pass' if all(checks.values()) else 'fail'
(out.parent/'attention-driving-safety-v1.browser-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':checks},ensure_ascii=False))
PY
