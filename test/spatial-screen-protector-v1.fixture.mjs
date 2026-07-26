import game from "../src/games/spatial-screen-protector-v1.js";
import {createGameRuntime} from "../src/game-kernel.js";

const params=new URLSearchParams(location.search),width=Number(params.get("width"))||393,reduced=params.get("motion")==="reduced",scene=params.get("scene")||"initial";document.body.style.width=`${width}px`;
const task=game.generate({randomInt:()=>0}),host=document.querySelector("#challenge"),label=document.querySelector("#scenario-label"),resultNode=document.querySelector("#fixture-result"),qa={},errors=[],frameDeltas=[];
let result=null,monitoring=true,previous=performance.now();
addEventListener("error",event=>errors.push(String(event.error?.stack||event.message)));addEventListener("unhandledrejection",event=>errors.push(String(event.reason?.stack||event.reason)));
const monitor=now=>{if(!monitoring)return;frameDeltas.push(now-previous);previous=now;if(frameDeltas.length<900)requestAnimationFrame(monitor)};requestAnimationFrame(monitor);
const runtime=createGameRuntime({host,qa,reducedMotion:reduced,viewport:{width,height:innerHeight,dpr:devicePixelRatio},onFinish:(correct,detail)=>{result={correct,detail};resultNode.textContent=`${correct?"成功":"失敗"} · ${detail.detail||detail.outcome||""}`}});game.render(task,runtime.context);const api=qa[game.metadata.id],wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function seal(lane,delay=260){api.seal(lane);await wait(delay)}
async function makeTrap(){await seal(task.solution[0]);await seal(task.proof.recovery.wrongLane)}
async function runScene(name){
  if(name==="pressure"){api.seal(task.solution[0]);await wait(125)}
  else if(name==="progress"){await seal(task.solution[0]);await seal(task.solution[1])}
  else if(name==="invalid"){api.showScene("invalid");await wait(80)}
  else if(name==="trapped")await makeTrap();
  else if(name==="peeled"){await makeTrap();api.peel();await wait(260)}
  else if(name==="resealed"){await makeTrap();api.peel();await wait(260);await seal(task.solution[1])}
  else if(name==="overpeel"){await seal(task.solution[0]);api.peel();await wait(260);await seal(task.solution[0]);api.peel();await wait(260)}
  else if(name==="success"){for(const lane of task.solution)await seal(lane);await wait(560)}
  else if(name==="timeout"){await seal(task.solution[0]);api.showScene("timeout");await wait(120)}
  else if(name!=="initial")throw new Error(`unknown scene: ${name}`);
  await wait(35);document.documentElement.dataset.ready="true";document.body.dataset.scene=name;document.body.dataset.motion=reduced?"reduced":"normal";label.textContent=`${task.layout} · ${name}`;
}
await runScene(scene);
if(params.get("measure")==="1")setTimeout(()=>{monitoring=false;const stable=frameDeltas.slice(5),state=qa[game.metadata.id]?.inspect()||null,resources=performance.getEntriesByType("resource"),external=resources.filter(entry=>new URL(entry.name).origin!==location.origin),report={status:stable.length>=30&&!external.length&&document.body.scrollWidth<=width&&state?.canvas?.dpr===Math.min(3,devicePixelRatio)?"pass":"fail",frames:stable.length,averageFrameMs:stable.reduce((sum,value)=>sum+value,0)/Math.max(1,stable.length),maxFrameMs:Math.max(0,...stable),canvas:state?.canvas,viewport:{width,height:innerHeight,dpr:devicePixelRatio,scrollWidth:document.body.scrollWidth},external:external.map(entry=>entry.name),errors:[...errors]};runtime.dispose();const pre=document.createElement("pre");pre.id="report";pre.dataset.status=report.status;pre.textContent=JSON.stringify(report,null,2);document.body.replaceChildren(pre)},1450);
window.__SCREEN_PROTECTOR_FIXTURE__={game,task,qa,runtime,scene,reduced,inspect:()=>qa[game.metadata.id]?.inspect()||null,result:()=>result?structuredClone(result):null,errors:()=>[...errors],evidence(){const stable=frameDeltas.slice(5);return{scene,reduced,width,task:structuredClone(task),game:qa[game.metadata.id]?.inspect()||null,result:result?structuredClone(result):null,frames:stable.length,averageFrameMs:stable.reduce((sum,value)=>sum+value,0)/Math.max(1,stable.length),maxFrameMs:Math.max(0,...stable),resources:performance.getEntriesByType("resource").map(entry=>entry.name),errors:[...errors]}}};
