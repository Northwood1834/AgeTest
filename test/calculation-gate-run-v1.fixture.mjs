import game from "../src/games/calculation-gate-run-v1.js";
import {createGameRuntime} from "../src/game-kernel.js";

const params=new URLSearchParams(location.search),outcome=params.get("outcome")==="lose"?"lose":"win",reduced=params.get("motion")==="reduced",auto=params.get("auto")==="1",width=Number(params.get("width"))||393;
document.body.style.width=`${width}px`;
const winning={kind:"gateRun",prompt:"軍団を増やして敵を倒せ",help:"門を選ぶと兵の数が変わります。最後の敵より多ければ勝ちです。",start:8,gates:[[{kind:"mul",value:3},{kind:"sub",value:5}],[{kind:"add",value:12},{kind:"div",value:2}],[{kind:"mul",value:2},{kind:"add",value:4}]],enemy:40,best:72,answer:[0,0,0],duration:35000};
const losing={...winning,gates:winning.gates.map(pair=>[pair[1],pair[0]]),answer:[1,1,1]};
const task=outcome==="win"?winning:losing,host=document.querySelector("#challenge"),result=document.querySelector("#result"),qa={},frameDeltas=[];
let previousFrame=performance.now(),monitoring=true;
const monitor=now=>{if(!monitoring)return;frameDeltas.push(now-previousFrame);previousFrame=now;if(frameDeltas.length<900)requestAnimationFrame(monitor)};
requestAnimationFrame(monitor);
let runtime,controlEvidence=null,initialGame=null;
const finishReport=(correct,detail)=>{
  monitoring=false;result.hidden=false;result.textContent=`${correct?"成功":"失敗"} — ${detail.detail}`;
  if(!auto)return;
  setTimeout(()=>{const resources=performance.getEntriesByType("resource"),external=resources.filter(entry=>new URL(entry.name).origin!==location.origin),inspection=runtime.inspect(),expected=outcome==="win",failures=[];if(correct!==expected)failures.push("outcome mismatch");if(!controlEvidence?.touch||!controlEvidence?.keyboard)failures.push("touch/keyboard controls failed");if(external.length)failures.push("external request");if(!(inspection.disposed&&inspection.aborted&&inspection.timeouts===0&&inspection.frames===0&&inspection.listeners===0))failures.push("runtime cleanup failed");if(document.body.scrollWidth>width)failures.push("horizontal overflow");const report={status:failures.length?"fail":"pass",failures,outcome,correct,detail,viewport:{width,height:innerHeight,dpr:devicePixelRatio,touchEvents:"ontouchstart" in window,pointerEvents:"PointerEvent" in window,bodyScrollWidth:document.body.scrollWidth},controls:controlEvidence,canvas:initialGame?.canvas,runtime:inspection,resources:resources.map(entry=>new URL(entry.name).pathname)};const pre=document.createElement("pre");pre.id="report";pre.dataset.status=report.status;pre.textContent=JSON.stringify(report,null,2);document.body.replaceChildren(pre)},0);
};
runtime=createGameRuntime({host,reducedMotion:reduced,viewport:{width,height:innerHeight,dpr:devicePixelRatio},qa,onFinish:finishReport});
game.render(task,runtime.context);
const api=qa[game.metadata.id];initialGame=api.inspect();
if(auto){const stage=host.querySelector(".cgr-stage"),buttons=host.querySelectorAll(".cgr-key");buttons[1].dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,cancelable:true,pointerType:"touch"}));const touch=api.inspect().lane===1;stage.dispatchEvent(new KeyboardEvent("keydown",{bubbles:true,cancelable:true,key:"ArrowUp"}));const keyboard=api.inspect().lane===0&&document.activeElement===buttons[0];controlEvidence={touch,keyboard};api.setLane(0)}
const scene=params.get("scene");if(scene)api.showScene(scene,outcome==="win"?task.answer:[0,0,0]);
if(params.get("measure")==="1")setTimeout(()=>{monitoring=false;const stable=frameDeltas.slice(5),report={status:stable.length>=30?"pass":"fail",frames:stable.length,averageFrameMs:stable.reduce((sum,value)=>sum+value,0)/Math.max(1,stable.length),maxFrameMs:Math.max(0,...stable),game:api.inspect(),runtime:runtime.inspect()};runtime.dispose();const pre=document.createElement("pre");pre.id="report";pre.dataset.status=report.status;pre.textContent=JSON.stringify(report,null,2);document.body.replaceChildren(pre)},1200);
if(params.get("measureLog")==="1")setTimeout(()=>{monitoring=false;const stable=frameDeltas.slice(5),average=stable.reduce((sum,value)=>sum+value,0)/Math.max(1,stable.length),inspection=api.inspect(),query=new URLSearchParams({frames:String(stable.length),averageFrameMs:average.toFixed(3),maxFrameMs:Math.max(0,...stable).toFixed(3),gameFrames:String(inspection.frames),pixelWidth:String(inspection.canvas.pixelWidth),pixelHeight:String(inspection.canvas.pixelHeight),dpr:String(inspection.canvas.dpr)});location.replace(`calculation-gate-run-v1.performance-result.html?${query}`)},1500);
window.__GATE_FIXTURE__={game,task,qa,runtime,evidence(){const stable=frameDeltas.slice(5),sum=stable.reduce((total,value)=>total+value,0);return{outcome,reduced,width,dpr:devicePixelRatio,frames:stable.length,averageFrameMs:stable.length?sum/stable.length:0,maxFrameMs:stable.length?Math.max(...stable):0,task:structuredClone(task),runtime:runtime.inspect(),game:qa[game.metadata.id]?.inspect()||null}}};
