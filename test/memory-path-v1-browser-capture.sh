#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
LANE_TOOL="$ROOT/tools/qa-browser-lanes.mjs"
LANE=${QA_BROWSER_LANE:-flow}
HTTP_PORT=${QA_BROWSER_HTTP_PORT:-8861}
OUT="$ROOT/test/memory-path-v1-visual"
MODULE="http://127.0.0.1:$HTTP_PORT/test/memory-path-v1.fixture.html"
LEGACY="http://127.0.0.1:$HTTP_PORT/test/memory-path-v1.legacy-fixture.html"
SCENES=(initial flash1 flash2 flash3 recall correct1 correct2 wrong success timeout)
MOTIONS=(normal reduced)
mkdir -p "$OUT";rm -f "$OUT"/*.png "$OUT"/*.json
nav(){ node "$LANE_TOOL" navigate "$LANE" "$1" "$2" "$3" 3 >/dev/null; }
evaljs(){ node "$LANE_TOOL" eval "$LANE" "$1"; }
shot(){ node "$LANE_TOOL" screenshot "$LANE" "$1" >/dev/null; }
ready(){ evaljs '(async()=>{for(let i=0;i<120;i++){if(document.documentElement.dataset.ready==="true")return true;await new Promise(r=>setTimeout(r,50))}throw Error("fixture not ready")})()' >/dev/null; }
for metrics in 393x852 402x874;do
 width=${metrics%x*};height=${metrics#*x}
 for motion in "${MOTIONS[@]}";do
  for scene in "${SCENES[@]}";do
   nav "$LEGACY?scene=$scene&motion=$motion&width=$width&capture=$(date +%s%N)" "$width" "$height";ready
   evaljs 'memoryPathLegacyFixture.evidence()' > "$OUT/$metrics-$motion-$scene-legacy.json";shot "$OUT/$metrics-$motion-$scene-legacy.png"
   nav "$MODULE?scene=$scene&motion=$motion&width=$width&capture=$(date +%s%N)" "$width" "$height";ready
   evaljs 'memoryPathModuleFixture.evidence()' > "$OUT/$metrics-$motion-$scene-module.json";shot "$OUT/$metrics-$motion-$scene-module.png"
   montage -label 'CURRENT APP' "$OUT/$metrics-$motion-$scene-legacy.png" -label 'MODULE' "$OUT/$metrics-$motion-$scene-module.png" -tile 2x1 -geometry +8+28 -background '#ede6f2' -fill '#382b42' -pointsize 20 "$OUT/$metrics-$motion-$scene-parity.png"
  done
  nav "$MODULE?scene=focus&motion=$motion&width=$width&capture=$(date +%s%N)" "$width" "$height";ready
  evaljs 'memoryPathModuleFixture.evidence()' > "$OUT/$metrics-$motion-focus-module.json";shot "$OUT/$metrics-$motion-focus-module.png"
 done
 nav "$MODULE?scene=initial&motion=normal&width=$width&perf=$(date +%s%N)" "$width" "$height";ready
 evaljs '(async()=>{const deltas=[];let before=performance.now();for(let i=0;i<120;i++)await new Promise(resolve=>requestAnimationFrame(now=>{deltas.push(now-before);before=now;resolve()}));const e=memoryPathModuleFixture.evidence(),stable=deltas.slice(5);return{viewport:e.viewport,frames:stable.length,averageFrameMs:stable.reduce((a,b)=>a+b,0)/stable.length,maxFrameMs:Math.max(...stable),over25ms:stable.filter(v=>v>25).length,state:e.state,lifecycle:e.lifecycle,runtime:e.runtime,errors:e.errors,external:e.external,overflow:e.overflow}})()' > "$OUT/$metrics-performance.json"
 evaljs '(async()=>{const before=memoryPathModuleFixture.evidence();memoryPathModuleFixture.dispose();await new Promise(r=>setTimeout(r,80));return{before,after:memoryPathModuleFixture.evidence()}})()' > "$OUT/$metrics-dispose.json"
done
for metrics in 390x844 430x932;do
 width=${metrics%x*};height=${metrics#*x}
 for implementation in legacy module;do
  if [[ "$implementation" == legacy ]];then url=$LEGACY;object=memoryPathLegacyFixture;else url=$MODULE;object=memoryPathModuleFixture;fi
  nav "$url?scene=initial&motion=normal&width=$width&boundary=$(date +%s%N)" "$width" "$height";ready
  evaljs "$object.evidence()" > "$OUT/boundary-$width-$implementation.json";shot "$OUT/boundary-$metrics-$implementation.png"
 done
 montage -label 'CURRENT APP' "$OUT/boundary-$metrics-legacy.png" -label 'MODULE' "$OUT/boundary-$metrics-module.png" -tile 2x1 -geometry +8+28 -background '#ede6f2' -fill '#382b42' -pointsize 20 "$OUT/boundary-$metrics-parity.png"
done
python - "$OUT" "$LANE" <<'PY'
import json,sys
from datetime import date
from pathlib import Path
out=Path(sys.argv[1]);lane=sys.argv[2];scenes=['initial','flash1','flash2','flash3','recall','correct1','correct2','wrong','success','timeout'];motions=['normal','reduced'];viewports=['393x852','402x874']
def load(name):return json.loads((out/name).read_text())
def marks(row):return [{'flash':'flash' in tile['className'],'chosen':'chosen' in tile['className'],'wrong':'wrong' in tile['className'],'disabled':tile['disabled']} for tile in row['tiles']]
def normalized(row):
 state=row['state'];return {'phase':state['phase'],'activeFlash':state['activeFlash'],'cursor':state['cursor'],'entered':state['entered'],'wrongCell':state['wrongCell'],'done':state['done'],'events':state['events'],'result':row['result'],'help':row['help'],'marks':marks(row)}
pairs=[]
for viewport in viewports:
 for motion in motions:
  for scene in scenes:
   legacy=load(f'{viewport}-{motion}-{scene}-legacy.json');module=load(f'{viewport}-{motion}-{scene}-module.json');pairs.append({'viewport':viewport,'motion':motion,'scene':scene,'legacy':legacy,'module':module,'normalizedEqual':normalized(legacy)==normalized(module)})
expected_times={'flash1':('flash-on',4,600),'flash2':('flash-on',1,1900),'flash3':('flash-on',8,3200)}
def behavior(pair):
 scene=pair['scene'];legacy=pair['legacy'];module=pair['module'];state=module['state']
 if legacy['task']!=module['task'] or not pair['normalizedEqual']:return False
 if scene=='initial':return state['phase']=='observe' and state['activeFlash'] is None and state['disabled']==9
 if scene in expected_times:
  kind,cell,at=expected_times[scene];event=state['events'][-1];return state['activeFlash']==cell and (event['type'],event['cell'],event['at'])==(kind,cell,at)
 if scene=='recall':return state['phase']=='recall' and state['activeFlash'] is None and state['cursor']==0 and state['disabled']==0 and module['help']=='同じ順番でタップしてください。' and all(tile['className']=='mpv-tile' and all(word not in tile['aria'] for word in ('順番','番目','答')) for tile in module['tiles'])
 if scene=='correct1':return state['cursor']==1 and marks(module)[4]['chosen'] and module['controls']['touch']
 if scene=='correct2':return state['cursor']==2 and marks(module)[4]['chosen'] and marks(module)[1]['chosen'] and all(module['controls'].values())
 if scene=='wrong':return state['phase']=='wrong' and state['wrongCell']==0 and module['result']=={'correct':False,'payload':{'detail':'順番が迷子になりました。'},'at':5000}
 if scene=='success':return state['phase']=='success' and state['entered']==[4,1,8] and all(module['controls'].values()) and module['result']['correct'] is True and module['result']['payload']['detail']=='順番どおりです。' and abs(module['result']['payload']['quality']-(1-5000/9000))<1e-12
 if scene=='timeout':return state['phase']=='timeout' and module['result']=={'correct':False,'payload':{'detail':'記憶が時間切れになりました。'},'at':12200}
 return False
focus={(viewport,motion):load(f'{viewport}-{motion}-focus-module.json') for viewport in viewports for motion in motions};perf={viewport:load(f'{viewport}-performance.json') for viewport in viewports};dispose={viewport:load(f'{viewport}-dispose.json') for viewport in viewports};boundaries={}
for width in ('390','430'):
 boundaries[width]={implementation:load(f'boundary-{width}-{implementation}.json') for implementation in ('legacy','module')}
checks={
 'pairCount':len(pairs),
 'allTaskFrozenExact':all(pair['legacy']['task']=={'kind':'memoryPath','prompt':'光る順番を覚えて','help':'あとで同じ順番にタップ。','path':[4,1,8],'duration':7200} and pair['legacy']['task']==pair['module']['task'] for pair in pairs),
 'allNormalizedParity':all(pair['normalizedEqual'] for pair in pairs),
 'motionModeExact':all(pair['module']['state']['reduced']==(pair['motion']=='reduced') for pair in pairs),
 'allBehavior':all(behavior(pair) for pair in pairs),
 'allNoErrors':all(not pair[side]['errors'] for pair in pairs for side in ('legacy','module')),
 'allNoExternal':all(not pair[side]['external'] for pair in pairs for side in ('legacy','module')),
 'allNoOverflow':all(not pair[side]['overflow'] for pair in pairs for side in ('legacy','module')),
 'allDpr3':all(pair[side]['viewport']['dpr']==3 for pair in pairs for side in ('legacy','module')),
 'focusPass':all(row['state']['phase']=='recall' and row['state']['cursor']==0 and row['state']['focused']==1 and row['controls']['focus'] and row['result'] is None and row['viewport']['dpr']==3 and not row['overflow'] and not row['errors'] and not row['external'] for row in focus.values()),
 'performancePass':all(row['frames']>=110 and row['averageFrameMs']<20 and row['maxFrameMs']<50 and row['lifecycle']['frames']==0 and row['runtime']['frames']==0 and not row['errors'] and not row['external'] and not row['overflow'] for row in perf.values()),
 'disposePass':all(row['after']['lifecycle']['disposed'] and row['after']['lifecycle']['pending']==0 and row['after']['lifecycle']['frames']==0 and row['after']['lifecycle']['listeners']==0 and row['after']['lifecycle']['aborted'] and row['after']['runtime']=={'disposed':True,'finished':False,'finishCalls':0,'commits':0,'timeouts':0,'frames':0,'listeners':0,'aborted':True} for row in dispose.values()),
 'boundaries390And430':all(row['viewport']['width']==int(width) and row['viewport']['dpr']==3 and not row['overflow'] and not row['errors'] and not row['external'] for width,rows in boundaries.items() for row in rows.values())
}
report={'game':'memory-path-v1','status':'pass' if all(checks.values()) else 'fail','captured':str(date.today()),'lane':{'name':lane,'tool':'tools/qa-browser-lanes.mjs'},'viewports':['393x852 DPR3','402x874 DPR3'],'motions':motions,'scenes':scenes,'checks':checks,'focus':{f'{viewport}-{motion}':row for (viewport,motion),row in focus.items()},'performance':perf,'dispose':dispose,'boundaries':boundaries,'pairs':pairs,'screenshots':sorted(path.name for path in out.glob('*.png'))}
(out.parent/'memory-path-v1.browser-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'checks':checks},ensure_ascii=False))
PY
