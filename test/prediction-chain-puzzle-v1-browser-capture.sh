#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd)
LANE="$ROOT/tools/qa-browser-lanes.mjs"
OUT="$ROOT/test/prediction-chain-puzzle-v1-visual"
mkdir -p "$OUT"
nav(){ node "$LANE" navigate flow "$1" "$2" "$3" 3 >/dev/null; }
evaljs(){ node "$LANE" eval flow "$1" >/dev/null; }
shot(){ node "$LANE" screenshot flow "$1" >/dev/null; }
wait_ready(){ evaljs '(async()=>{for(let i=0;i<120;i++){if(document.body.dataset.ready==="true"||window.__SHORO_QA__?.puzzle) return true;await new Promise(r=>setTimeout(r,50))}throw Error("fixture not ready")})()'; }
restore_legacy(){ local width=$1 height=$2;nav "http://127.0.0.1:8861/test/prediction-chain-puzzle-v1.fixture.html?scenario=initial&reset=$(date +%s%N)" "$width" "$height";wait_ready;evaljs 'localStorage.setItem("shoro-test-state-v1",localStorage.getItem("pcp-qa-baseline-state"));true';nav "http://127.0.0.1:8861/?legacy=$(date +%s%N)" "$width" "$height";evaljs '(async()=>{for(let i=0;i<120;i++){if(window.__SHORO_QA__?.puzzle) return true;await new Promise(r=>setTimeout(r,50))}throw Error("legacy not ready")})()'; }
for metrics in 393x852 402x874; do
  width=${metrics%x*};height=${metrics#*x}
  restore_legacy "$width" "$height";shot "$OUT/legacy-${metrics}-initial.png"
  restore_legacy "$width" "$height";evaljs '(()=>{const p=__SHORO_QA__.puzzle,c=document.querySelector(".puzzle-canvas"),r=c.getBoundingClientRect(),cell=r.width/7,col=Math.max(0,p.task.bestCol-1);c.dispatchEvent(new PointerEvent("pointermove",{clientX:r.left+(col+.5)*cell,clientY:r.top+100,bubbles:true}));document.querySelectorAll(".puzzle-key")[col].focus();return col})()';shot "$OUT/legacy-${metrics}-input.png"
  restore_legacy "$width" "$height";evaljs '(async()=>{const p=__SHORO_QA__.puzzle;p.drop(p.task.bestCol);await new Promise(r=>setTimeout(r,720));return {chain:p.state.chain,best:p.state.bestChain}})()';shot "$OUT/legacy-${metrics}-progress.png"
  restore_legacy "$width" "$height";evaljs '(()=>{const p=__SHORO_QA__.puzzle,full=p.task.board[0].findIndex((_,c)=>p.task.board.every(r=>r[c]));p.drop(full);document.querySelectorAll(".puzzle-key")[full].focus();return {full,drops:p.state.drops}})()';shot "$OUT/legacy-${metrics}-invalid.png"
  restore_legacy "$width" "$height";evaljs '(async()=>{const p=__SHORO_QA__.puzzle;p.drop(p.task.bestCol);await new Promise(r=>setTimeout(r,2700));return {done:p.state.done,best:p.state.bestChain}})()';shot "$OUT/legacy-${metrics}-success.png"
  restore_legacy "$width" "$height";evaljs '(async()=>{const p=__SHORO_QA__.puzzle,col=[...Array(7).keys()].find(c=>c!==p.task.bestCol&&!p.task.board.every(r=>r[c]));p.drop(col);await new Promise(r=>setTimeout(r,1900));return {col,done:p.state.done,best:p.state.bestChain}})()';shot "$OUT/legacy-${metrics}-failure.png"
  for scenario in initial input progress invalid success failure; do
    nav "http://127.0.0.1:8861/test/prediction-chain-puzzle-v1.fixture.html?scenario=$scenario&capture=$(date +%s%N)" "$width" "$height";wait_ready;shot "$OUT/module-${metrics}-${scenario}.png"
  done
done
