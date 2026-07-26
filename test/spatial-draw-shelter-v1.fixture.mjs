import game from "../src/games/spatial-draw-shelter-v1.js";
import {createGameRuntime} from "../src/game-kernel.js";

const params=new URLSearchParams(location.search),scene=params.get("scene")||"initial",reduced=params.get("motion")==="reduced",width=Number(params.get("width"))||393,layout=Math.max(0,Math.min(3,Number(params.get("layout"))||0));document.body.style.width=`${width}px`;
const persisted=game.generate({pick:values=>values[layout]}),task=JSON.parse(JSON.stringify(persisted)),host=document.querySelector("#challenge"),qa={},started=performance.now(),resourcesBefore=performance.getEntriesByType("resource").length;let outcome=null;
const runtime=createGameRuntime({host,qa,reducedMotion:reduced,viewport:{width,height:innerHeight,dpr:devicePixelRatio},onFinish:(correct,detail)=>{outcome={correct,detail}}});game.render(structuredClone(task),runtime.context);const api=qa[game.metadata.id],wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
if(scene==="anchor-focus")document.querySelector(".sds-anchor")?.focus();
else if(scene==="drawing"){api.begin(task.anchors[0]);task.canonical.slice(1,4).forEach(point=>api.append(point))}
else if(scene==="over-budget"){api.begin(task.anchors[0]);for(let index=0;index<20&&!api.inspect().overBudget;index++)api.append({x:index%2?.96:.04,y:.08+(index%7)*.11})}
else if(scene==="deployed"){api.deploy(task.canonical);runtime.dispose()}
else if(scene==="impact"){api.deploy(task.canonical);api.advance(70);runtime.dispose()}
else if(scene==="collapse"){api.deploy(task.witnesses.collapse);api.advance(110);await wait(reduced?130:470)}
else if(scene==="sting"){api.deploy(task.witnesses.sting);api.advance(110);await wait(reduced?130:470)}
else if(scene==="success"){api.solve();await wait(reduced?130:470)}
else if(scene==="timeout"){api.timeout();await wait(reduced?130:470)}
await wait(reduced?20:300);
const report=()=>{const resources=performance.getEntriesByType("resource"),external=resources.filter(entry=>new URL(entry.name).origin!==location.origin),state=api.inspect(),buttons=[...document.querySelectorAll(".sds-anchor,.sds-release")];return{status:external.length||document.body.scrollWidth>width?"fail":"pass",scene,reduced,width,layout,elapsedMs:performance.now()-started,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,bodyScrollWidth:document.body.scrollWidth,bodyScrollHeight:document.body.scrollHeight},task:{layoutId:task.layoutId,title:task.title,proof:task.proof},game:state,runtime:runtime.inspect(),outcome,focusVisible:buttons.includes(document.activeElement)||document.activeElement===document.querySelector(".sds-board"),touchTargets:buttons.map(button=>{const rect=button.getBoundingClientRect();return{width:rect.width,height:rect.height}}),resourcesAdded:resources.length-resourcesBefore,external:external.map(entry=>entry.name)}};
window.__SDS_FIXTURE__={game,task,qa,runtime,report};document.documentElement.dataset.ready="true";
