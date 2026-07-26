const BANDS=5;
const LANES=Object.freeze(["left","center","right"]);
const LANE_X=Object.freeze({left:.24,center:.5,right:.76});
const PROMPT="気泡を端へ逃がして貼る";
const HELP="下端から押し上げます。気泡の反対側に指を置き、密閉したら一帯だけ剥がして直せます。";

const metadata=Object.freeze({
  id:"spatial-screen-protector-v1",
  introducedIn:"2.0",
  tier:3,
  flavor:"satisfying",
  step:1,
  family:"spatial-screen-protector",
  category:"spatial"
});

const AUTHORED=Object.freeze([
  Object.freeze({layout:"prism-fan",bubbles:Object.freeze([
    Object.freeze({id:"a",x:.63,band:1,exit:"right",radius:.058}),
    Object.freeze({id:"b",x:.37,band:2,exit:"left",radius:.052}),
    Object.freeze({id:"c",x:.50,band:3,exit:"top",radius:.061}),
    Object.freeze({id:"d",x:.62,band:4,exit:"right",radius:.047}),
    Object.freeze({id:"e",x:.50,band:5,exit:"top",radius:.054})
  ]),recoveryBand:2,wrongLane:"left"}),
  Object.freeze({layout:"silver-zig",bubbles:Object.freeze([
    Object.freeze({id:"a",x:.38,band:1,exit:"left",radius:.055}),
    Object.freeze({id:"b",x:.62,band:2,exit:"right",radius:.049}),
    Object.freeze({id:"c",x:.37,band:3,exit:"left",radius:.061}),
    Object.freeze({id:"d",x:.50,band:4,exit:"top",radius:.046}),
    Object.freeze({id:"e",x:.63,band:5,exit:"right",radius:.057})
  ]),recoveryBand:3,wrongLane:"left"}),
  Object.freeze({layout:"aurora-fold",bubbles:Object.freeze([
    Object.freeze({id:"a",x:.50,band:1,exit:"top",radius:.059}),
    Object.freeze({id:"b",x:.63,band:2,exit:"right",radius:.050}),
    Object.freeze({id:"c",x:.38,band:3,exit:"left",radius:.054}),
    Object.freeze({id:"d",x:.50,band:4,exit:"top",radius:.061}),
    Object.freeze({id:"e",x:.37,band:5,exit:"left",radius:.047})
  ]),recoveryBand:4,wrongLane:"left"})
]);

const cloneBubbles=bubbles=>bubbles.map(bubble=>({...bubble}));
const requiredLane=bubble=>bubble.exit==="right"?"left":bubble.exit==="left"?"right":"center";
const directionFor=(bubble,lane)=>{const delta=LANE_X[lane]-bubble.x;return delta<-.14?"right":delta>.14?"left":"top"};
const directResult=(bubbles,path)=>bubbles.every(bubble=>directionFor(bubble,path[bubble.band-1])===bubble.exit)?"success":"trapped";

function exhaustiveProof(descriptor){
  let successPaths=0,trappedPaths=0;
  for(const a of LANES)for(const b of LANES)for(const c of LANES)for(const d of LANES)for(const e of LANES){
    if(directResult(descriptor.bubbles,[a,b,c,d,e])==="success")successPaths++;else trappedPaths++;
  }
  const canonical=descriptor.bubbles.map(requiredLane),recovery=[...canonical];
  recovery[descriptor.recoveryBand-1]=descriptor.wrongLane;
  return{totalPaths:3**BANDS,successPaths,trappedPaths,canonical,recovery:{mistakeBand:descriptor.recoveryBand,wrongLane:descriptor.wrongLane,peelBands:1,resealLane:canonical[descriptor.recoveryBand-1],finishesAfterReseal:true}};
}

function makeTask(descriptor){
  return{kind:"screenProtector",prompt:PROMPT,help:HELP,layout:descriptor.layout,bands:BANDS,phone:{width:.78,height:.91,corner:.075},bubbles:cloneBubbles(descriptor.bubbles),maxPeel:1,duration:65000,solution:descriptor.bubbles.map(requiredLane),proof:exhaustiveProof(descriptor)};
}

function generate({randomInt,random}={}){
  const index=typeof randomInt==="function"?randomInt(0,AUTHORED.length-1):Math.floor((typeof random==="function"?random():0)*AUTHORED.length);
  return makeTask(AUTHORED[Math.max(0,Math.min(AUTHORED.length-1,index))]);
}

const sameJson=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="screenProtector")issues.push("kind must remain screenProtector");
  if(task.prompt!==PROMPT)issues.push("prompt changed");
  if(task.help!==HELP)issues.push("help changed");
  const descriptor=AUTHORED.find(entry=>entry.layout===task.layout);
  if(!descriptor)issues.push("layout must be an authored screen protector layout");
  if(task.bands!==BANDS)issues.push("bands must remain 5");
  if(!sameJson(task.phone,{width:.78,height:.91,corner:.075}))issues.push("phone geometry changed");
  if(!Array.isArray(task.bubbles)||task.bubbles.length!==BANDS)issues.push("bubbles must contain one authored bubble per band");
  if(descriptor&&!sameJson(task.bubbles,descriptor.bubbles))issues.push("bubble geometry or escape edge changed");
  if(task.maxPeel!==1)issues.push("maxPeel must remain one bounded correction");
  if(task.duration!==65000)issues.push("duration must remain 65000ms");
  if(descriptor){
    const expected=exhaustiveProof(descriptor),solution=descriptor.bubbles.map(requiredLane);
    if(!sameJson(task.solution,solution))issues.push("solution does not match pressure geometry");
    if(!sameJson(task.proof,expected))issues.push("proof does not match exhaustive authored paths and recovery");
    if(expected.totalPaths!==243||expected.successPaths!==1||expected.trappedPaths!==242)issues.push("authored path proof is not unique");
    const wrong=[...solution];wrong[descriptor.recoveryBand-1]=descriptor.wrongLane;
    if(directResult(descriptor.bubbles,wrong)!=="trapped")issues.push("authored recovery does not first create a trap");
    wrong[descriptor.recoveryBand-1]=solution[descriptor.recoveryBand-1];
    if(directResult(descriptor.bubbles,wrong)!=="success")issues.push("authored peel and reseal does not recover");
  }
  return[...new Set(issues)];
}

const STYLE=`
.ssp-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;padding:.25rem max(.2rem,env(safe-area-inset-left)) .2rem max(.2rem,env(safe-area-inset-right));display:grid;gap:.48rem;color:#332f3c}
.ssp-status{min-height:2.65em;margin:0;padding:.48rem .7rem;border:1px solid #ddd4e5;border-radius:.82rem;background:#f7f3fa;color:#584c64;text-align:center;font-size:.88rem;font-weight:900;line-height:1.4}.ssp-status.ssp-warn{border-color:#e0a5ae;background:#fff0f2;color:#8c3041}.ssp-status.ssp-good{border-color:#9fcdb0;background:#eefaf2;color:#236447}
.ssp-board{position:relative;width:100%;overflow:hidden;border-radius:1.2rem;background:linear-gradient(145deg,#e9e5ec,#cbc9d0);box-shadow:0 11px 30px rgba(31,25,40,.23);touch-action:none}.ssp-board:focus-visible{outline:4px solid #fff;outline-offset:-7px;box-shadow:0 0 0 4px #67417c,0 12px 30px rgba(31,25,40,.28)}.ssp-board.ssp-invalid{box-shadow:0 0 0 4px #c74459,0 11px 30px rgba(90,24,39,.28)}.ssp-board.ssp-success{box-shadow:0 0 0 4px #67bd91,0 12px 32px rgba(36,112,77,.3)}.ssp-board.ssp-overpeel{box-shadow:0 0 0 4px #e9d8c0,0 12px 32px rgba(91,62,54,.33)}.ssp-board.ssp-timeout{filter:saturate(.62);box-shadow:0 0 0 4px #975166,0 12px 32px rgba(69,29,45,.3)}
.ssp-canvas{display:block;width:100%;height:100%}
.ssp-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:.34rem}.ssp-lane,.ssp-action{min-height:2.75rem;border:2px solid #c8b8d2;border-radius:.75rem;background:#fff;color:#533566;font-size:.86rem;font-weight:950}.ssp-lane[aria-pressed=true]{border-color:#68407e;background:#eee3f5;box-shadow:inset 0 0 0 2px #fff}.ssp-lane:focus-visible,.ssp-action:focus-visible{outline:3px solid #68407e;outline-offset:2px}.ssp-actions{display:grid;grid-template-columns:1.2fr 1fr;gap:.34rem}.ssp-action:first-child{border-color:#90b6bd;background:#edf8f8;color:#285966}.ssp-action:last-child{border-color:#d7bcae;background:#fff8f1;color:#714a38}.ssp-action:disabled,.ssp-lane:disabled{opacity:1;background:#eee9f0;color:#887f8d;border-color:#d5ced9}
.ssp-readout{margin:0;text-align:center;color:#675d6d;font-size:.82rem;font-weight:850}.ssp-stage[data-reduced=true] .ssp-board{transition:none}@media(prefers-reduced-motion:reduce){.ssp-board{transition:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="ssp-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));
  const status=documentRef.createElement("p");status.className="ssp-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="ssp-board";board.tabIndex=0;board.setAttribute("role","application");
  const canvas=documentRef.createElement("canvas");canvas.className="ssp-canvas";canvas.setAttribute("aria-hidden","true");
  const controls=documentRef.createElement("div");controls.className="ssp-controls";controls.setAttribute("role","group");controls.setAttribute("aria-label","圧力をかける指の位置");
  const actions=documentRef.createElement("div");actions.className="ssp-actions";
  const sealButton=documentRef.createElement("button");sealButton.type="button";sealButton.className="ssp-action";sealButton.textContent="一帯を貼る";
  const peelButton=documentRef.createElement("button");peelButton.type="button";peelButton.className="ssp-action";peelButton.textContent="一帯だけ戻す";
  const readout=documentRef.createElement("p");readout.className="ssp-readout";
  actions.append(sealButton,peelButton);stage.append(status,board,controls,actions,readout);board.append(canvas);context.host.replaceChildren(style,stage);
  const drawing=canvas.getContext("2d"),laneButtons=[];
  const sourceBubbles=cloneBubbles(task.bubbles).map(bubble=>({...bubble,y:1-(bubble.band-.5)/BANDS}));
  const state={front:0,lane:"center",bubbles:cloneBubbles(sourceBubbles).map(b=>({...b,escaped:false,trapped:false,rx:b.radius,ry:b.radius})),history:{},totalPeel:0,tension:0,justPeeled:false,busy:false,done:false,disposed:false,outcome:"active",invalidCount:0,dragging:false,pointerId:null,animation:null,lastPressure:null};
  let width=390,height=560,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1)),clock=0;
  const remaining=()=>state.bubbles.filter(bubble=>!bubble.escaped).length;
  const trapped=()=>state.bubbles.filter(bubble=>bubble.trapped&&!bubble.escaped).length;
  const frontY=front=>height*(.84-front*.135);
  const phone={x:()=>width*.105,y:()=>height*.035,w:()=>width*.79,h:()=>height*.91,r:()=>width*.085};
  const roundedRect=(x,y,w,h,r)=>{drawing.beginPath();drawing.moveTo(x+r,y);drawing.arcTo(x+w,y,x+w,y+h,r);drawing.arcTo(x+w,y+h,x,y+h,r);drawing.arcTo(x,y+h,x,y,r);drawing.arcTo(x,y,x+w,y,r);drawing.closePath()};
  const lensPosition=bubble=>({x:phone.x()+phone.w()*(.08+bubble.x*.84),y:phone.y()+phone.h()*(.075+bubble.y*.84)});
  const visualBubble=bubble=>{
    const animation=state.animation;
    if(!animation||animation.bubbleId!==bubble.id)return{x:bubble.x,y:bubble.y,rx:bubble.rx,ry:bubble.ry};
    const p=animation.progress,eased=1-(1-p)*(1-p),dir=animation.direction;
    if(!animation.correct)return{x:bubble.x,y:bubble.y,rx:bubble.radius*(1+.72*p),ry:bubble.radius*(1-.44*p)};
    const targetX=dir==="left"?-.08:dir==="right"?1.08:bubble.x,targetY=dir==="top"?-.08:bubble.y;
    return{x:bubble.x+(targetX-bubble.x)*eased,y:bubble.y+(targetY-bubble.y)*eased,rx:bubble.radius*(1+(dir==="top"?.15:.8)*Math.sin(p*Math.PI)),ry:bubble.radius*(1-.38*Math.sin(p*Math.PI))};
  };
  const drawPhone=()=>{
    const{x,y,w,h,r}={x:phone.x(),y:phone.y(),w:phone.w(),h:phone.h(),r:phone.r()};
    drawing.save();drawing.shadowColor="rgba(16,18,26,.46)";drawing.shadowBlur=width*.045;drawing.shadowOffsetY=height*.018;roundedRect(x,y,w,h,r);drawing.fillStyle="#20242d";drawing.fill();drawing.restore();
    roundedRect(x+width*.013,y+width*.013,w-width*.026,h-width*.026,r-width*.012);const glass=drawing.createLinearGradient(x,y,x+w,y+h);glass.addColorStop(0,"#34485a");glass.addColorStop(.5,"#182936");glass.addColorStop(1,"#0e1824");drawing.fillStyle=glass;drawing.fill();
    drawing.save();roundedRect(x+width*.013,y+width*.013,w-width*.026,h-width*.026,r-width*.012);drawing.clip();
    const fy=frontY(state.front),glassTop=y+width*.013,glassBottom=y+h-width*.013;
    const hovering=drawing.createLinearGradient(x,glassTop,x+w,fy);hovering.addColorStop(0,"rgba(224,250,255,.11)");hovering.addColorStop(.55,"rgba(180,223,238,.035)");hovering.addColorStop(1,"rgba(235,255,255,.16)");drawing.fillStyle=hovering;drawing.fillRect(x,glassTop,w,Math.max(0,fy-glassTop));drawing.strokeStyle="rgba(219,250,255,.3)";drawing.lineWidth=width*.003;drawing.beginPath();drawing.moveTo(x+width*.02,glassTop+width*.02);drawing.lineTo(x+width*.02,Math.min(fy,glassBottom));drawing.moveTo(x+w-width*.02,glassTop+width*.02);drawing.lineTo(x+w-width*.02,Math.min(fy,glassBottom));drawing.stroke();
    const film=drawing.createLinearGradient(0,fy,0,glassBottom);film.addColorStop(0,"rgba(207,255,252,.35)");film.addColorStop(.32,"rgba(110,220,226,.18)");film.addColorStop(.68,"rgba(197,140,238,.12)");film.addColorStop(1,"rgba(230,255,255,.25)");drawing.fillStyle=film;drawing.fillRect(x,fy,w,glassBottom-fy);
    drawing.globalAlpha=.12;drawing.strokeStyle="#a5fff4";drawing.lineWidth=width*.018;for(let index=-2;index<8;index++){drawing.beginPath();drawing.moveTo(x+index*w*.18,glassBottom);drawing.lineTo(x+(index+2.7)*w*.18,fy);drawing.stroke()}drawing.globalAlpha=1;
    const reflection=drawing.createLinearGradient(x,y,x+w*.72,y+h);reflection.addColorStop(0,"rgba(255,255,255,.27)");reflection.addColorStop(.32,"rgba(255,255,255,.025)");reflection.addColorStop(.65,"rgba(159,222,255,.12)");reflection.addColorStop(1,"rgba(255,255,255,0)");drawing.fillStyle=reflection;drawing.beginPath();drawing.moveTo(x+w*.08,y);drawing.lineTo(x+w*.45,y);drawing.lineTo(x+w*.82,y+h);drawing.lineTo(x+w*.57,y+h);drawing.closePath();drawing.fill();
    state.bubbles.filter(bubble=>!bubble.escaped||state.animation?.bubbleId===bubble.id).forEach(bubble=>{const visual=visualBubble(bubble),p=lensPosition(visual),rx=visual.rx*phone.w(),ry=visual.ry*phone.w(),gradient=drawing.createRadialGradient(p.x-rx*.28,p.y-ry*.3,1,p.x,p.y,Math.max(rx,ry));gradient.addColorStop(0,bubble.trapped?"rgba(247,229,239,.82)":"rgba(255,255,255,.66)");gradient.addColorStop(.48,bubble.trapped?"rgba(182,127,174,.24)":"rgba(164,229,238,.12)");gradient.addColorStop(.78,bubble.trapped?"rgba(99,70,112,.58)":"rgba(160,214,235,.22)");gradient.addColorStop(1,"rgba(11,25,38,.68)");drawing.fillStyle=gradient;drawing.beginPath();drawing.ellipse(p.x,p.y,Math.max(2,rx),Math.max(2,ry),state.lastPressure?.direction==="left"?-.18:.18,0,Math.PI*2);drawing.fill();drawing.strokeStyle=bubble.trapped?"rgba(255,220,242,.96)":"rgba(236,255,255,.72)";drawing.lineWidth=bubble.trapped?width*.007:1.3;drawing.stroke();if(bubble.trapped){drawing.fillStyle="rgba(248,238,247,.7)";drawing.beginPath();drawing.ellipse(p.x-rx*.24,p.y-ry*.18,rx*.18,ry*.15,0,0,Math.PI*2);drawing.fill()}});
    if(state.front<BANDS){const wave=context.reducedMotion?0:Math.sin(clock*.006)*height*.002;drawing.shadowColor="rgba(5,18,27,.55)";drawing.shadowBlur=width*.014;drawing.shadowOffsetY=width*.012;const ridge=drawing.createLinearGradient(x,0,x+w,0);ridge.addColorStop(0,"rgba(255,255,255,.46)");ridge.addColorStop(.5,"rgba(247,255,255,1)");ridge.addColorStop(1,"rgba(156,233,231,.48)");drawing.strokeStyle=ridge;drawing.lineWidth=width*.011;drawing.beginPath();drawing.moveTo(x,fy);drawing.quadraticCurveTo(x+w*.5,fy+wave,x+w,fy);drawing.stroke();drawing.shadowColor="transparent";drawing.strokeStyle="rgba(103,231,228,.76)";drawing.lineWidth=width*.003;drawing.beginPath();drawing.moveTo(x,fy+width*.011);drawing.lineTo(x+w,fy+width*.011);drawing.stroke();drawing.fillStyle="rgba(224,252,253,.58)";roundedRect(x+w*.4,fy-width*.012,w*.2,width*.03,width*.014);drawing.fill()}
    if(state.justPeeled){const lift=height*.1,flap=drawing.createLinearGradient(0,fy-lift,0,fy+width*.02);flap.addColorStop(0,"rgba(229,249,255,.12)");flap.addColorStop(.72,"rgba(192,239,244,.45)");flap.addColorStop(1,"rgba(255,255,255,.72)");drawing.fillStyle=flap;drawing.shadowColor="rgba(8,18,29,.55)";drawing.shadowBlur=width*.025;drawing.beginPath();drawing.moveTo(x+w*.06,fy);drawing.quadraticCurveTo(x+w*.3,fy-lift,x+w*.5,fy-lift*.56);drawing.quadraticCurveTo(x+w*.72,fy-lift,x+w*.94,fy);drawing.quadraticCurveTo(x+w*.5,fy+width*.025,x+w*.06,fy);drawing.fill();drawing.shadowColor="transparent";drawing.strokeStyle="rgba(239,255,255,.9)";drawing.lineWidth=width*.006;drawing.stroke()}
    if(state.tension>0){if(state.outcome==="overpeel"){drawing.fillStyle="rgba(225,245,247,.28)";drawing.beginPath();drawing.moveTo(x+w*.03,fy);drawing.quadraticCurveTo(x+w*.5,fy+height*.13,x+w*.97,fy);drawing.lineTo(x+w*.9,glassBottom);drawing.lineTo(x+w*.1,glassBottom);drawing.closePath();drawing.fill();drawing.strokeStyle="rgba(255,244,228,.98)";drawing.lineWidth=width*.009}else{drawing.strokeStyle="rgba(255,229,205,.48)";drawing.lineWidth=width*.004}for(let i=0;i<(state.outcome==="overpeel"?7:3);i++){drawing.beginPath();drawing.moveTo(x+w*(.17+i*.105),fy);drawing.quadraticCurveTo(x+w*(.2+i*.1),fy-height*(state.outcome==="overpeel"?.12:.055),x+w*(.26+i*.095),fy-height*(state.outcome==="overpeel"?.17:.09));drawing.stroke()}}
    if(state.lastPressure&&!state.done&&!state.justPeeled&&state.outcome!=="trapped"){const px=x+w*(.08+LANE_X[state.lane]*.84),py=Math.min(glassBottom,fy+height*.048),pulse=context.reducedMotion?1:.96+.04*Math.sin(clock*.008),skin=drawing.createRadialGradient(px-width*.018,py-height*.012,width*.004,px,py,width*.075);skin.addColorStop(0,"rgba(255,226,205,.94)");skin.addColorStop(.72,"rgba(226,166,135,.9)");skin.addColorStop(1,"rgba(143,86,74,.76)");drawing.fillStyle=skin;drawing.shadowColor="rgba(5,10,18,.48)";drawing.shadowBlur=width*.018;drawing.beginPath();drawing.ellipse(px,py,width*.057*pulse,height*.043,0,0,Math.PI*2);drawing.fill();drawing.shadowColor="transparent";drawing.fillStyle="rgba(255,237,224,.64)";drawing.beginPath();drawing.ellipse(px,py-height*.013,width*.028,height*.013,0,Math.PI,Math.PI*2);drawing.fill();drawing.strokeStyle="rgba(224,255,255,.88)";drawing.lineWidth=width*.005;drawing.beginPath();drawing.ellipse(px,fy+width*.006,width*.052,width*.019,0,0,Math.PI*2);drawing.stroke()}
    drawing.restore();
    drawing.fillStyle="rgba(5,8,13,.88)";roundedRect(x+w*.38,y+width*.025,w*.24,width*.018,width*.009);drawing.fill();
    drawing.fillStyle="rgba(184,192,202,.78)";roundedRect(x+w-width*.004,y+h*.27,width*.012,h*.14,width*.006);drawing.fill();
  };
  const drawOverlay=()=>{if(!state.done)return;drawing.save();drawing.fillStyle="rgba(9,17,28,.12)";drawing.fillRect(0,0,width,height);drawing.shadowColor="rgba(0,0,0,.38)";drawing.shadowBlur=width*.035;drawing.fillStyle=state.outcome==="success"?"rgba(20,82,65,.88)":state.outcome==="overpeel"?"rgba(91,56,51,.9)":"rgba(36,32,51,.88)";roundedRect(width*.13,height*.405,width*.74,height*.145,width*.035);drawing.fill();drawing.shadowColor="transparent";drawing.textAlign="center";drawing.textBaseline="middle";drawing.fillStyle="#fff";drawing.font=`950 ${Math.round(width*.06)}px system-ui`;const title=state.outcome==="success"?"気泡なし":state.outcome==="overpeel"?"剥がしすぎ":state.outcome==="timeout"?"時間切れ":"気泡を密閉";drawing.fillText(title,width*.5,height*.448);drawing.font=`800 ${Math.round(width*.032)}px system-ui`;drawing.fillStyle="rgba(255,255,255,.9)";drawing.fillText(state.outcome==="success"?"滑らかな接着面が完成":`残った気泡 ${remaining()}個`,width*.5,height*.505);drawing.restore()};
  const paint=()=>{drawing.clearRect(0,0,width,height);const bg=drawing.createLinearGradient(0,0,width,height);bg.addColorStop(0,"#e8e5ea");bg.addColorStop(1,"#bfc2c9");drawing.fillStyle=bg;drawing.fillRect(0,0,width,height);drawPhone();drawOverlay()};
  const aria=()=>`保護フィルム。接着 ${state.front}/${BANDS}帯、圧力 ${state.lane==="left"?"左":state.lane==="right"?"右":"中央"}、残り気泡 ${remaining()}、密閉 ${trapped()}、剥がし ${state.totalPeel}/${task.maxPeel}`;
  const refresh=()=>{board.setAttribute("aria-label",aria());laneButtons.forEach((button,index)=>{button.setAttribute("aria-pressed",String(state.lane===LANES[index]));button.disabled=state.done});sealButton.disabled=state.done;peelButton.disabled=state.done||state.front===0;readout.textContent=`接着 ${state.front}/${BANDS}帯　残り ${remaining()}個　tension ${state.totalPeel}/${task.maxPeel}`;paint()};
  const resize=()=>{const rect=context.host.getBoundingClientRect?.()||{};width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*1.36);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;board.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);refresh()};
  const setMessage=(text,tone="")=>{status.className=`ssp-status${tone?` ${tone}`:""}`;status.textContent=text};
  const reject=message=>{if(state.done||state.disposed)return false;const previous=state.outcome;state.outcome="invalid";state.invalidCount++;board.classList.add("ssp-invalid");setMessage(message,"ssp-warn");refresh();context.later(()=>{if(state.disposed||state.done)return;state.outcome=previous;board.classList.remove("ssp-invalid");setMessage(trapped()?"気泡が密閉されています。一帯だけ戻してください":"圧力位置を選び、次の帯へ押し上げます",trapped()?"ssp-warn":"");refresh()},420);return false};
  const finish=(outcome,correct,detail)=>{if(state.done||state.disposed)return false;state.done=true;state.busy=false;state.outcome=outcome;board.classList.add(`ssp-${outcome}`);setMessage(detail,correct?"ssp-good":"ssp-warn");refresh();context.later(()=>context.finish(correct,{outcome,detail,front:state.front,remaining:remaining(),tension:state.totalPeel}),context.reducedMotion?80:520);return true};
  const scheduleStages=(middle,settle)=>{context.later(()=>{if(state.disposed||state.done)return;state.animation.progress=.52;middle();if(context.reducedMotion)paint()},context.reducedMotion?90:110);context.later(()=>{if(state.disposed||state.done)return;state.animation.progress=1;if(context.reducedMotion)paint();settle()},context.reducedMotion?190:230)};
  const setLane=lane=>{if(!LANES.includes(lane)||state.done)return false;state.lane=lane;setMessage(`${lane==="left"?"左":lane==="right"?"右":"中央"}から圧力をかけます`);refresh();return true};
  const seal=lane=>{if(lane!==undefined&&!setLane(lane))return false;if(state.done)return false;if(state.busy)return reject("接着が落ち着くまで待ってください");if(state.front>=BANDS)return reject("上端まで接着済みです");
    const next=state.front+1,bubble=state.bubbles.find(item=>item.band===next),direction=directionFor(bubble,state.lane),correct=direction===bubble.exit;
    state.busy=true;state.justPeeled=false;state.history[next]={bubbles:cloneBubbles(state.bubbles),outcome:state.outcome};state.animation={type:"seal",bubbleId:bubble.id,direction,correct,progress:.08};state.lastPressure={lane:state.lane,direction};setMessage(correct?"気泡が圧力から端へ変形しています":"圧力が逃げ道と反対です",correct?"":"ssp-warn");refresh();
    scheduleStages(()=>{},()=>{if(correct){bubble.escaped=true;bubble.trapped=false;bubble.x=direction==="left"?-.08:direction==="right"?1.08:bubble.x;bubble.y=direction==="top"?-.08:bubble.y}else{bubble.trapped=true;bubble.rx=bubble.radius*1.65;bubble.ry=bubble.radius*.58}state.front=next;state.busy=false;state.animation=null;state.outcome=trapped()?"trapped":"active";
      if(state.front===BANDS){if(!remaining())finish("success",true,"すべての気泡を端へ逃がしました");else finish("trapped",false,`気泡${remaining()}個を密閉しました`)}else{setMessage(trapped()?"気泡が密閉されました。一帯だけ戻せます":`第${next}帯を接着。次の気泡へ`,trapped()?"ssp-warn":"");refresh()}});return true};
  const peel=()=>{if(state.done)return false;if(state.busy)return reject("接着が落ち着くまで待ってください");if(state.front<=0)return reject("下端より剥がせません");state.totalPeel++;state.tension=state.totalPeel/task.maxPeel;
    if(state.totalPeel>task.maxPeel){state.busy=true;state.justPeeled=true;state.animation={type:"overpeel",bubbleId:null,direction:"down",correct:false,progress:.08};setMessage("張力が限界を超えています","ssp-warn");scheduleStages(()=>{},()=>{state.animation=null;finish("overpeel",false,"剥がしすぎて応力線が残りました")});return true}
    const current=state.front,snapshot=state.history[current];state.busy=true;state.animation={type:"peel",bubbleId:null,direction:"down",correct:true,progress:.08};setMessage("frontを一帯だけ剥がし戻しています");scheduleStages(()=>{},()=>{state.bubbles=cloneBubbles(snapshot.bubbles);delete state.history[current];state.front=current-1;state.busy=false;state.justPeeled=true;state.animation=null;state.outcome=trapped()?"trapped":"active";setMessage("一帯戻しました。圧力位置を変えて再接着します");refresh()});return true};
  const localPoint=event=>{const rect=board.getBoundingClientRect(),x=(event.clientX-rect.left)/Math.max(1,rect.width),y=(event.clientY-rect.top)/Math.max(1,rect.height);return{x,y}};
  const laneAt=x=>x<.38?"left":x>.62?"right":"center";
  const pointerDown=event=>{if(state.done)return;event.preventDefault();const point=localPoint(event);if(point.y<.72&&state.front===0){reject("フィルム下端から始めてください");return}state.dragging=true;state.pointerId=event.pointerId;setLane(laneAt(point.x));try{board.setPointerCapture?.(event.pointerId)}catch{}};
  const pointerMove=event=>{if(!state.dragging||event.pointerId!==state.pointerId||state.done)return;event.preventDefault();const point=localPoint(event);setLane(laneAt(point.x));const target=Math.max(0,Math.min(BANDS,Math.floor((.86-point.y)/.135)+1));if(target>state.front&&!state.busy)seal();else if(target<state.front&&!state.busy)peel()};
  const pointerUp=event=>{if(event.pointerId!==state.pointerId)return;state.dragging=false;state.pointerId=null};
  const keyboard=event=>{if(state.done)return;if(event.key==="ArrowLeft"){event.preventDefault();setLane(state.lane==="right"?"center":"left")}else if(event.key==="ArrowRight"){event.preventDefault();setLane(state.lane==="left"?"center":"right")}else if(event.key==="ArrowUp"||event.key==="Enter"||event.key===" "){event.preventDefault();seal()}else if(event.key==="ArrowDown"){event.preventDefault();peel()}};
  LANES.forEach((lane,index)=>{const button=documentRef.createElement("button");button.type="button";button.className="ssp-lane";button.textContent=["左から","中央から","右から"][index];const act=()=>setLane(lane);context.listen(button,"pointerdown",event=>{event.preventDefault();act()});context.listen(button,"click",event=>{if(event.detail===0)act()});context.listen(button,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();act()}});laneButtons.push(button);controls.append(button)});
  context.listen(sealButton,"pointerdown",event=>{event.preventDefault();seal()});context.listen(sealButton,"click",event=>{if(event.detail===0)seal()});context.listen(peelButton,"pointerdown",event=>{event.preventDefault();peel()});context.listen(peelButton,"click",event=>{if(event.detail===0)peel()});
  context.listen(board,"pointerdown",pointerDown);context.listen(board,"pointermove",pointerMove);context.listen(board,"pointerup",pointerUp);context.listen(board,"pointercancel",pointerUp);context.listen(board,"keydown",keyboard);if(view)context.listen(view,"resize",resize,{passive:true});
  setMessage("下端から押し上げ、気泡を左右または上端へ逃がします");resize();board.focus({preventScroll:true});
  if(!context.reducedMotion)context.frame(time=>{if(state.disposed||state.done)return false;clock=time;if(state.animation){const duration=state.animation.type==="seal"?230:190;state.animation.progress=Math.max(state.animation.progress,Math.min(.98,state.animation.progress+.016*1000/duration))}paint();return true});
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;finish("timeout",false,`時間切れ。接着${state.front}/${BANDS}帯、気泡${remaining()}個`) });
  const qaApi={setLane,seal,peel,runSolution(){if(state.done||state.busy)return false;const lane=task.solution[state.front];return seal(lane)},showScene(name){if(state.done||state.busy)return false;if(name==="initial")return true;if(name==="invalid")return reject("フィルム下端から始めてください");if(name==="trapped"){const lane=LANES.find(value=>value!==task.solution[state.front]);return seal(lane)}if(name==="overpeel"){if(state.front===0)return seal(task.solution[0]);return peel()}if(name==="timeout")return finish("timeout",false,"時間切れ。気泡が残りました");return false},inspect:()=>({front:state.front,lane:state.lane,bubbles:cloneBubbles(state.bubbles),remaining:remaining(),trapped:trapped(),totalPeel:state.totalPeel,tension:state.tension,justPeeled:state.justPeeled,busy:state.busy,done:state.done,disposed:state.disposed,outcome:state.outcome,invalidCount:state.invalidCount,dragging:state.dragging,animation:state.animation?{...state.animation}:null,status:status.textContent,aria:board.getAttribute("aria-label"),canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;state.dragging=false;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
