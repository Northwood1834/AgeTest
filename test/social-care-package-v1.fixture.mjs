import game from "../src/games/social-care-package-v1.js";
import {createGameRuntime} from "../src/game-kernel.js";

const params=new URLSearchParams(location.search),scene=params.get("scene")||"initial",reduced=params.get("motion")==="reduced",width=Number(params.get("width"))||393,scenario=Math.max(0,Math.min(2,Number(params.get("scenario"))||0)),deadlineOverride=Math.max(0,Number(params.get("deadline"))||0);document.body.style.width=`${width}px`;
const task=game.generate({randomInt:()=>scenario}),host=document.querySelector("#challenge"),label=document.querySelector("#scene-label"),resultNode=document.querySelector("#fixture-result"),qa={},errors=[],started=performance.now();let outcome=null;
addEventListener("error",event=>errors.push(String(event.error?.stack||event.message)));addEventListener("unhandledrejection",event=>errors.push(String(event.reason?.stack||event.reason)));
const runtime=createGameRuntime({host,qa,reducedMotion:reduced,viewport:{width,height:innerHeight,dpr:devicePixelRatio},onFinish:(correct,detail)=>{outcome={correct,detail};resultNode.textContent=`${correct?"成功":"未完了"} · ${detail.outcome}`}}),renderContext=deadlineOverride?{...runtime.context,setDeadline:(_ms,fn)=>runtime.context.setDeadline(deadlineOverride,fn)}:runtime.context;game.render(structuredClone(task),renderContext);const api=qa[game.metadata.id],wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),moveWait=reduced?130:220;
async function pack(ids){for(const id of ids){api.pack(id);await wait(moveWait)}}
async function runScene(name){
  if(name==="drag"){api.pack("rice");await wait(reduced?70:80)}
  else if(name==="packed")await pack(["rice","canned","gift"]);
  else if(name==="repacked"){await pack(["rice","canned"]);api.remove("canned");await wait(moveWait);await pack(["socks","gift"])}
  else if(name==="capacity-invalid"){await pack(["rice","noodles","pasta","canned"]);api.pack("gift");await wait(45)}
  else if(name==="mixed"){await pack(["canned","socks"]);api.finish();await wait(reduced?230:310)}
  else if(name==="intrusive-photo"){await pack(["noodles","pasta","gravure"]);api.finish();await wait(reduced?230:310)}
  else if(name==="intrusive-friends"){await pack(["rice","gift","friends"]);api.finish();await wait(reduced?230:310)}
  else if(name==="success-reply"){await pack(task.proof.answer);api.finish();await wait(reduced?95:150)}
  else if(name==="success-video"){await pack(task.proof.answer);api.finish();await wait(650)}
  else if(name==="timeout"){await pack(["rice","gift"]);api.timeout();await wait(reduced?125:220)}
  else if(name!=="initial")throw new Error(`unknown scene: ${name}`);
  await wait(name==="success-reply"?0:25);document.documentElement.dataset.ready="true";document.body.dataset.scene=name;document.body.dataset.motion=reduced?"reduced":"normal";label.textContent=`${task.scenarioId} · ${name}`;
}
await runScene(scene);
const report=()=>{const state=api?.inspect()||null,resources=performance.getEntriesByType("resource"),external=resources.filter(entry=>new URL(entry.name).origin!==location.origin),targets=[...document.querySelectorAll(".scp-item")].map(node=>{const rect=node.getBoundingClientRect();return{id:node.dataset.id,width:rect.width,height:rect.height}});return{status:external.length||document.body.scrollWidth>width||errors.length?"fail":"pass",scene,reduced,width,scenario,task:structuredClone(task),game:state,runtime:runtime.inspect(),outcome,elapsedMs:performance.now()-started,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,bodyScrollWidth:document.body.scrollWidth,bodyScrollHeight:document.body.scrollHeight},targets,resources:resources.map(entry=>entry.name),external:external.map(entry=>entry.name),errors:[...errors]}};
window.__CARE_PACKAGE_FIXTURE__={game,task,qa,runtime,scene,reduced,report,inspect:()=>api?.inspect()||null,errors:()=>[...errors]};
