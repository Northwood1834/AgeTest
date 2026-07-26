const QUANTUM_MS=250;
const DURATION=36000;
const MAX_USEFUL_FLIPS=3;
const MIN_TOLERANCE_STEPS=8;
const PROMPT="焼き目、いま。";
const HELP="魚の色、つや、油の泡を見て返します。両面がちょうどよく焼けたら盛り付けてください。";

const VARIANTS=Object.freeze([
  Object.freeze({rates:Object.freeze([5,4]),good:Object.freeze([Object.freeze([280,345]),Object.freeze([280,345])]),warning:Object.freeze([360,360]),burn:Object.freeze([400,400])}),
  Object.freeze({rates:Object.freeze([4,5]),good:Object.freeze([Object.freeze([285,350]),Object.freeze([280,345])]),warning:Object.freeze([365,360]),burn:Object.freeze([405,400])}),
  Object.freeze({rates:Object.freeze([5,5]),good:Object.freeze([Object.freeze([280,345]),Object.freeze([285,350])]),warning:Object.freeze([360,365]),burn:Object.freeze([400,405])}),
  Object.freeze({rates:Object.freeze([4,4]),good:Object.freeze([Object.freeze([275,340]),Object.freeze([280,345])]),warning:Object.freeze([355,360]),burn:Object.freeze([395,400])}),
  Object.freeze({rates:Object.freeze([5,4]),good:Object.freeze([Object.freeze([285,350]),Object.freeze([275,340])]),warning:Object.freeze([365,355]),burn:Object.freeze([405,395])})
]);

const metadata=Object.freeze({
  id:"timing-fish-grill-v1",
  introducedIn:"2.0",
  tier:2,
  flavor:"satisfying",
  step:1,
  family:"timing-fish-grill",
  category:"timing"
});

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const clonePair=pair=>pair.map(value=>Array.isArray(value)?[...value]:value);
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);

function heatAt(task,flipAtStep,serveStep){
  const start=task.startingSide,other=1-start,after=Math.max(0,serveStep-flipAtStep),heat=[0,0];
  heat[start]=task.heatRates[start]*flipAtStep+task.carryoverHeat*after;
  heat[other]=task.carryoverHeat*flipAtStep+task.heatRates[other]*after;
  return heat;
}
const inGood=(task,heat)=>heat.every((value,side)=>value>=task.goodWindows[side][0]&&value<=task.goodWindows[side][1]);

function proveOneFlip(task){
  const maximum=Math.floor(task.duration/task.quantumMs);let best=null;
  for(let flipAtStep=1;flipAtStep<maximum;flipAtStep++){
    const valid=[];
    for(let serveStep=flipAtStep+1;serveStep<=maximum;serveStep++){
      if(inGood(task,heatAt(task,flipAtStep,serveStep)))valid.push(serveStep);
      else if(valid.length)break;
    }
    if(!valid.length)continue;
    const candidate={flipAtStep,serveFromStep:valid[0],serveToStep:valid.at(-1),toleranceSteps:valid.length};
    if(!best||candidate.toleranceSteps>best.toleranceSteps||(candidate.toleranceSteps===best.toleranceSteps&&candidate.serveFromStep<best.serveFromStep))best=candidate;
  }
  return best;
}

function makeTask(variant,startingSide,pattern){
  const task={
    kind:"fishGrill",
    prompt:PROMPT,
    help:HELP,
    heatRates:[...variant.rates],
    goodWindows:clonePair(variant.good),
    warningThresholds:[...variant.warning],
    burnThresholds:[...variant.burn],
    carryoverHeat:1,
    startingSide,
    maxUsefulFlips:MAX_USEFUL_FLIPS,
    quantumMs:QUANTUM_MS,
    duration:DURATION,
    pattern
  };
  const proof=proveOneFlip(task);
  if(!proof||proof.toleranceSteps<MIN_TOLERANCE_STEPS)throw new Error(`${metadata.id}: authored schedule has no tolerant solution`);
  return{...task,proof};
}

function generate({randomInt}){
  const variant=VARIANTS[randomInt(0,VARIANTS.length-1)]||VARIANTS[0];
  const startingSide=randomInt(0,1)===1?1:0,pattern=Math.max(0,Math.min(5,randomInt(0,5)));
  return makeTask(variant,startingSide,pattern);
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="fishGrill")issues.push("kind must remain fishGrill");
  if(task.prompt!==PROMPT)issues.push("prompt changed");
  if(task.help!==HELP)issues.push("help changed");
  if(!Array.isArray(task.heatRates)||task.heatRates.length!==2||task.heatRates.some(value=>!Number.isInteger(value)||value<4||value>5))issues.push("heatRates must contain two integers from the authored set");
  if(!Array.isArray(task.goodWindows)||task.goodWindows.length!==2||task.goodWindows.some(window=>!Array.isArray(window)||window.length!==2||!window.every(Number.isInteger)||window[0]<260||window[1]>360||window[1]-window[0]<55))issues.push("goodWindows must contain two broad authored intervals");
  if(!Array.isArray(task.warningThresholds)||task.warningThresholds.length!==2||task.warningThresholds.some(value=>!Number.isInteger(value)))issues.push("warningThresholds must contain two integers");
  if(!Array.isArray(task.burnThresholds)||task.burnThresholds.length!==2||task.burnThresholds.some(value=>!Number.isInteger(value)))issues.push("burnThresholds must contain two integers");
  for(let side=0;side<2;side++){
    const good=task.goodWindows?.[side],warning=task.warningThresholds?.[side],burn=task.burnThresholds?.[side];
    if(good&&Number.isInteger(warning)&&warning<=good[1])issues.push(`side ${side} warning must follow the good window`);
    if(Number.isInteger(warning)&&Number.isInteger(burn)&&(burn<=warning||burn-warning<35))issues.push(`side ${side} burn must follow a readable warning interval`);
    if(Number.isInteger(burn)&&(burn<390||burn>410))issues.push(`side ${side} burn threshold is outside the authored bound`);
  }
  if(task.carryoverHeat!==1)issues.push("carryoverHeat must remain 1");
  if(task.startingSide!==0&&task.startingSide!==1)issues.push("startingSide must be 0 or 1");
  if(task.maxUsefulFlips!==MAX_USEFUL_FLIPS)issues.push(`maxUsefulFlips must remain ${MAX_USEFUL_FLIPS}`);
  if(task.quantumMs!==QUANTUM_MS)issues.push(`quantumMs must remain ${QUANTUM_MS}`);
  if(task.duration!==DURATION)issues.push(`duration must remain ${DURATION}`);
  if(!Number.isInteger(task.pattern)||task.pattern<0||task.pattern>5)issues.push("pattern must be an integer from 0 to 5");
  const knownVariant=VARIANTS.some(variant=>same(task.heatRates,variant.rates)&&same(task.goodWindows,variant.good)&&same(task.warningThresholds,variant.warning)&&same(task.burnThresholds,variant.burn));
  if(!knownVariant)issues.push("heat schedule is not one of the finite authored variants");
  if(!issues.length){
    const proof=proveOneFlip(task);
    if(!proof)issues.push("no one-flip schedule reaches both good windows before the deadline");
    else{
      if(proof.toleranceSteps<MIN_TOLERANCE_STEPS)issues.push("winning schedule tolerance is too narrow");
      if(!same(task.proof,proof))issues.push("proof does not match the deterministic schedule");
      const first=heatAt(task,proof.flipAtStep,proof.serveFromStep),last=heatAt(task,proof.flipAtStep,proof.serveToStep);
      if(!inGood(task,first)||!inGood(task,last))issues.push("proof endpoints are not both successful");
      if([...first,...last].some((value,index)=>value>=task.burnThresholds[index%2]))issues.push("proof reaches a burn threshold");
    }
  }
  return[...new Set(issues)];
}

function materialFor(task,side,heat){
  const good=task.goodWindows[side],warning=task.warningThresholds[side],burn=task.burnThresholds[side];
  if(heat>=burn)return"char";
  if(heat>=warning)return"blister";
  if(heat>=good[0])return"amber";
  if(heat>=good[0]*.62)return"gold";
  if(heat>=good[0]*.3)return"pearly";
  return"raw";
}
const descriptionFor=material=>({raw:"まだ生っぽい",pearly:"白く締まりはじめた",gold:"焼き色がついた",amber:"ちょうどよさそう",blister:"焦げる寸前",char:"真っ黒に焦げた"})[material];

const STYLE=`
.afg-stage{box-sizing:border-box;width:100%;max-width:430px;margin-inline:auto;padding:.2rem max(.2rem,env(safe-area-inset-left)) .15rem max(.2rem,env(safe-area-inset-right));display:grid;gap:.5rem;color:#43383f;contain:layout paint}
.afg-status{min-height:2.75em;margin:0;padding:.52rem .7rem;border:1px solid #dfd1e4;border-radius:.84rem;background:linear-gradient(180deg,#fbf7fc,#f0e9f3);color:#5e4c63;text-align:center;font-size:clamp(.86rem,3.65vw,.98rem);font-weight:900;line-height:1.4;box-shadow:inset 0 1px #fff}
.afg-board{position:relative;width:100%;overflow:hidden;border-radius:1.05rem;background:#2d2b31;box-shadow:0 9px 23px rgba(43,27,43,.22),inset 0 0 0 1px rgba(255,255,255,.4);touch-action:manipulation;isolation:isolate}.afg-canvas{display:block;width:100%;height:100%;cursor:pointer;touch-action:manipulation}.afg-canvas:focus-visible{outline:4px solid #f1c45d;outline-offset:-7px;border-radius:1rem}
.afg-effects{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.afg-terminal{position:absolute;inset:0;display:grid;place-items:center;padding:1rem;background:rgba(45,24,33,.5);color:#fff;font-size:clamp(1.3rem,6.5vw,1.85rem);font-weight:950;letter-spacing:.07em;text-align:center;text-shadow:0 2px 7px rgba(0,0,0,.48);opacity:0}.afg-impact{position:absolute;left:64%;top:43%;font-size:clamp(2rem,10vw,3.2rem);font-weight:1000;color:#fff4c5;text-shadow:0 0 6px #fff,0 0 17px #f19534,0 3px 0 #9b3a20;opacity:0;transform:translate(-50%,-50%) scale(.35) rotate(-8deg)}
.afg-stamp{position:absolute;right:7%;top:8%;padding:.35rem .6rem;border:4px double #aa3d31;border-radius:.38rem;color:#9d332b;background:rgba(255,248,221,.84);font-size:1.05rem;font-weight:1000;letter-spacing:.1em;opacity:0;transform:rotate(-8deg) scale(1.35)}
.afg-board.afg-success{box-shadow:0 0 0 4px #dfb947,0 12px 28px rgba(159,104,24,.32)}.afg-board.afg-success .afg-stamp{opacity:1;transform:rotate(-8deg) scale(1);transition:opacity .18s ease,transform .42s cubic-bezier(.2,.85,.2,1)}.afg-board.afg-burn{box-shadow:0 0 0 4px #b13d38,0 12px 29px rgba(91,24,26,.37)}.afg-board.afg-burn .afg-impact{animation:afg-pop .72s cubic-bezier(.15,.75,.18,1) both}.afg-board.afg-burn .afg-terminal,.afg-board.afg-undercooked .afg-terminal,.afg-board.afg-overdone .afg-terminal,.afg-board.afg-timeout .afg-terminal{opacity:1;place-items:start center;padding-top:.62rem;background:linear-gradient(180deg,rgba(44,25,31,.68),rgba(44,25,31,.2) 24%,rgba(44,25,31,0) 48%);font-size:clamp(1.05rem,5.1vw,1.4rem)}.afg-board.afg-undercooked .afg-terminal,.afg-board.afg-timeout .afg-terminal{background:linear-gradient(180deg,rgba(40,75,96,.7),rgba(40,75,96,.16) 25%,rgba(40,75,96,0) 49%)}.afg-board.afg-undercooked{box-shadow:0 0 0 4px #5d86a4,0 11px 25px rgba(40,77,101,.3)}.afg-board.afg-overdone,.afg-board.afg-timeout{box-shadow:0 0 0 4px #8a5961,0 11px 25px rgba(62,35,42,.3)}
.afg-memory{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}.afg-side{min-width:0;padding:.42rem .5rem;border:1px solid #ded2e3;border-radius:.72rem;background:#fbf9fc;color:#6d6071;text-align:center;font-size:.74rem;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.afg-side[data-visible=true]{border-color:#c7954c;background:#fff7e4;color:#6b481e;box-shadow:inset 0 0 0 1px rgba(255,255,255,.8)}
.afg-controls{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.afg-action{min-height:3.5rem;border:0;border-radius:.9rem;font-size:.95rem;font-weight:950;letter-spacing:.04em;cursor:pointer;touch-action:manipulation}.afg-flip{background:linear-gradient(145deg,#704587,#4d2d5e);color:#fff;box-shadow:inset 0 1px rgba(255,255,255,.27),0 5px 12px rgba(66,36,79,.27)}.afg-serve{border:2px solid #bd8d3e;background:linear-gradient(145deg,#fff8df,#ead09a);color:#6a4818;box-shadow:inset 0 1px #fff,0 4px 10px rgba(119,78,24,.18)}.afg-action:active:not(:disabled){transform:translateY(2px);box-shadow:none}.afg-action:focus-visible{outline:4px solid #d7b5e4;outline-offset:2px}.afg-action:disabled{opacity:.48;cursor:default;filter:saturate(.55)}
.afg-hint{margin:0;text-align:center;color:#776b7b;font-size:.77rem;font-weight:780;line-height:1.35}.afg-stage[data-result=success] .afg-status{background:#e9f7ed;border-color:#a9d8b6;color:#286244}.afg-stage[data-result=burn] .afg-status,.afg-stage[data-result=overdone] .afg-status{background:#fff0ed;border-color:#e4aaa3;color:#8a312d}.afg-stage[data-result=undercooked] .afg-status,.afg-stage[data-result=timeout] .afg-status{background:#edf5fa;border-color:#b7d0e0;color:#345d78}
@keyframes afg-pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.25) rotate(-15deg)}22%{opacity:1;transform:translate(-50%,-50%) scale(1.3) rotate(5deg)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1.05) rotate(-5deg)}}
.afg-stage[data-reduced=true] .afg-impact{animation:none!important;opacity:.9!important;transform:translate(-50%,-50%) scale(1)!important}.afg-stage[data-reduced=true] .afg-stamp{transition:none!important}.afg-stage[data-reduced=true] .afg-action{transition:none!important}
@media(prefers-reduced-motion:reduce){.afg-impact{animation:none!important}.afg-stamp,.afg-action{transition:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="afg-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.dataset.result="";
  const status=documentRef.createElement("p");status.className="afg-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="afg-board";
  const canvas=documentRef.createElement("canvas");canvas.className="afg-canvas";canvas.tabIndex=0;canvas.setAttribute("role","application");canvas.setAttribute("aria-label","網の上で魚の両面を焼く。Enterかスペースで返し、Sで盛り付ける");
  const effects=documentRef.createElement("div");effects.className="afg-effects";effects.setAttribute("aria-hidden","true");
  const terminal=documentRef.createElement("strong");terminal.className="afg-terminal";
  const impact=documentRef.createElement("b");impact.className="afg-impact";impact.textContent="パン";
  const stamp=documentRef.createElement("b");stamp.className="afg-stamp";stamp.textContent="焼き上がり";effects.append(impact,stamp,terminal);board.append(canvas,effects);
  const memory=documentRef.createElement("div");memory.className="afg-memory";memory.setAttribute("aria-label","両面の見た目の記憶");
  const sideNodes=[0,1].map(side=>{const node=documentRef.createElement("span");node.className="afg-side";memory.append(node);return node});
  const controls=documentRef.createElement("div");controls.className="afg-controls";
  const flipButton=documentRef.createElement("button");flipButton.type="button";flipButton.className="afg-action afg-flip";flipButton.textContent="ひっくり返す";
  const serveButton=documentRef.createElement("button");serveButton.type="button";serveButton.className="afg-action afg-serve";serveButton.textContent="盛り付ける";controls.append(flipButton,serveButton);
  const hint=documentRef.createElement("p");hint.className="afg-hint";hint.textContent="Space / Enter：返す　・　S：盛り付ける";
  stage.append(status,board,memory,controls,hint);context.host.replaceChildren(style,stage);

  const drawing=canvas.getContext("2d");if(!drawing)throw new Error(`${metadata.id}: 2D canvas is unavailable`);
  const state={heat:[0,0],visible:task.startingSide,seen:[false,false],lastSeen:["まだ見ていない","まだ見ていない"],steps:0,flips:0,flipping:null,busy:false,done:false,disposed:false,result:null,frames:0,burst:0,smoke:0,plating:null,plated:false,steam:0};state.seen[state.visible]=true;
  let width=390,height=332,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1)),clock=0,lastTime=null;
  const startedAt=Number(view?.performance?.now?.())||Number(globalThis.performance?.now?.())||0;
  const now=()=>Number(view?.performance?.now?.())||Number(globalThis.performance?.now?.())||clock;
  const rounded=(x,y,w,h,r)=>{drawing.beginPath();drawing.roundRect(x,y,w,h,r)};
  const material=side=>materialFor(task,side,state.heat[side]);
  const describe=side=>descriptionFor(material(side));
  const bothSeen=()=>state.seen[0]&&state.seen[1];
  const outcome=()=>{
    if(state.heat.some((value,side)=>value>=task.burnThresholds[side]))return"burn";
    if(state.heat.some((value,side)=>value<task.goodWindows[side][0]))return"undercooked";
    if(state.heat.some((value,side)=>value>task.goodWindows[side][1]))return"overdone";
    return"ready";
  };
  const materialColors=(side,heat)=>{
    const name=materialFor(task,side,heat),palette={raw:["#80AAB0","#D3E7E4","#486E78"],pearly:["#C3C5B9","#EFE9D9","#7D8980"],gold:["#BBA57C","#E8D4AD","#746142"],amber:["#B86B31","#E2A558","#75401F"],blister:["#864522","#C87835","#43241B"],char:["#302925","#5B4434","#151515"]};return{name,colors:palette[name]};
  };
  const displaySide=()=>state.flipping&&state.flipping.progress<.5?state.flipping.from:state.visible;

  const drawCountertop=()=>{
    const back=drawing.createLinearGradient(0,0,0,height);back.addColorStop(0,"#F2E8E0");back.addColorStop(.58,"#DCCDC8");back.addColorStop(1,"#B9A8AA");drawing.fillStyle=back;drawing.fillRect(0,0,width,height);
    drawing.strokeStyle="rgba(105,72,66,.09)";drawing.lineWidth=1;for(let y=height*.08;y<height;y+=height*.12){drawing.beginPath();drawing.moveTo(0,y);drawing.bezierCurveTo(width*.28,y-5,width*.64,y+5,width,y);drawing.stroke()}
    drawing.fillStyle="rgba(54,30,34,.2)";drawing.beginPath();drawing.ellipse(width*.5,height*.88,width*.38,height*.055,0,0,Math.PI*2);drawing.fill();
  };
  const drawGrill=(alpha=1)=>{
    drawing.save();drawing.globalAlpha=alpha;const x=width*.07,y=height*.18,w=width*.86,h=height*.66;
    drawing.fillStyle="rgba(30,21,24,.3)";rounded(x+5,y+8,w,h,h*.1);drawing.fill();
    const shell=drawing.createLinearGradient(x,y,x,y+h);shell.addColorStop(0,"#57545A");shell.addColorStop(.16,"#36343A");shell.addColorStop(.78,"#1F2025");shell.addColorStop(1,"#12151A");drawing.fillStyle=shell;rounded(x,y,w,h,h*.09);drawing.fill();
    drawing.strokeStyle="rgba(255,255,255,.28)";drawing.lineWidth=2;rounded(x+4,y+4,w-8,h-8,h*.075);drawing.stroke();
    const glow=drawing.createRadialGradient(width*.5,height*.52,0,width*.5,height*.52,width*.38);glow.addColorStop(0,"rgba(244,91,37,.48)");glow.addColorStop(.52,"rgba(178,48,24,.2)");glow.addColorStop(1,"rgba(0,0,0,0)");drawing.fillStyle=glow;rounded(x+w*.06,y+h*.1,w*.88,h*.78,h*.05);drawing.fill();
    drawing.strokeStyle="rgba(238,83,35,.66)";drawing.lineWidth=Math.max(3,width*.012);drawing.lineCap="round";for(let row=0;row<3;row++){drawing.beginPath();const yy=y+h*(.3+row*.2);drawing.moveTo(x+w*.16,yy);drawing.bezierCurveTo(x+w*.35,yy-10,x+w*.65,yy+10,x+w*.84,yy);drawing.stroke()}
    drawing.strokeStyle="rgba(202,205,210,.57)";drawing.lineWidth=Math.max(1.2,width*.004);for(let line=0;line<13;line++){const xx=x+w*(.08+line*.07);drawing.beginPath();drawing.moveTo(xx,y+h*.08);drawing.lineTo(xx,y+h*.9);drawing.stroke()}for(let line=0;line<8;line++){const yy=y+h*(.1+line*.115);drawing.beginPath();drawing.moveTo(x+w*.06,yy);drawing.lineTo(x+w*.94,yy);drawing.stroke()}
    drawing.fillStyle="#25242A";for(const fx of[x+w*.14,x+w*.86]){rounded(fx-w*.055,y+h,w*.11,h*.13,h*.025);drawing.fill()}
    drawing.restore();
  };
  const drawPlate=(alpha=1)=>{
    drawing.save();drawing.globalAlpha=alpha;const cx=width*.5,cy=height*.56,rx=width*.41,ry=height*.3;
    drawing.fillStyle="rgba(57,38,43,.22)";drawing.beginPath();drawing.ellipse(cx+4,cy+8,rx,ry,0,0,Math.PI*2);drawing.fill();
    const ceramic=drawing.createRadialGradient(cx-width*.12,cy-height*.1,width*.03,cx,cy,rx);ceramic.addColorStop(0,"#FFFFFF");ceramic.addColorStop(.68,"#F3F0E7");ceramic.addColorStop(1,"#B9C6C6");drawing.fillStyle=ceramic;drawing.beginPath();drawing.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);drawing.fill();drawing.strokeStyle="#638C92";drawing.lineWidth=4;drawing.stroke();drawing.strokeStyle="rgba(255,255,255,.9)";drawing.lineWidth=2;drawing.beginPath();drawing.ellipse(cx,cy,rx*.88,ry*.82,0,0,Math.PI*2);drawing.stroke();
    drawing.fillStyle="#F0C83F";drawing.beginPath();drawing.moveTo(width*.77,height*.32);drawing.arc(width*.77,height*.32,width*.075,-.65,2.25);drawing.closePath();drawing.fill();drawing.strokeStyle="#FFF1A1";drawing.lineWidth=2;drawing.stroke();
    drawing.fillStyle="#4F8D62";drawing.beginPath();drawing.ellipse(width*.205,height*.675,width*.085,height*.052,-.35,0,Math.PI*2);drawing.fill();drawing.strokeStyle="rgba(255,255,255,.34)";drawing.lineWidth=1;for(let vein=-2;vein<=2;vein++){drawing.beginPath();drawing.moveTo(width*.15,height*(.674+vein*.008));drawing.lineTo(width*.255,height*.67);drawing.stroke()}
    drawing.fillStyle="#F8F4E9";for(let index=0;index<24;index++){const angle=index*2.39,r=width*(.009+index%6*.006);drawing.beginPath();drawing.ellipse(width*.21+Math.cos(angle)*r,height*.665+Math.sin(angle)*r*.58,width*(.01+index%2*.002),width*.007,angle,0,Math.PI*2);drawing.fill()}drawing.fillStyle="#E6C9C3";drawing.beginPath();drawing.arc(width*.208,height*.659,width*.018,0,Math.PI*2);drawing.fill();
    drawing.strokeStyle="#63A269";drawing.lineWidth=3;drawing.beginPath();drawing.moveTo(width*.2,height*.64);drawing.quadraticCurveTo(width*.15,height*.57,width*.18,height*.52);drawing.stroke();drawing.restore();
  };
  const drawFish=(side,heat,flipProgress=0,platingProgress=0)=>{
    const {name,colors}=materialColors(side,heat),burn=task.burnThresholds[side],ratio=clamp(heat/burn),cx=width*.51,baseY=height*(state.plated?.53:.51),lift=Math.sin(Math.PI*flipProgress)*height*.16+Math.sin(Math.PI*platingProgress)*height*.12,scaleY=flipProgress?Math.max(.09,Math.abs(Math.cos(Math.PI*flipProgress))):1,contract=1-ratio*.055,length=width*.69*contract,fishH=height*.245*(1-ratio*.035);
    drawing.save();drawing.fillStyle=`rgba(24,18,18,${.34-.2*Math.sin(Math.PI*flipProgress)})`;drawing.beginPath();drawing.ellipse(cx+3,baseY+fishH*.34,length*(.42-.08*Math.sin(Math.PI*flipProgress)),fishH*(.27-.12*Math.sin(Math.PI*flipProgress)),0,0,Math.PI*2);drawing.fill();drawing.restore();
    if(flipProgress>.22&&flipProgress<.78){
      const from=state.flipping?.from??side,to=state.flipping?.to??side,fromLook=materialColors(from,state.heat[from]),toLook=materialColors(to,state.heat[to]),half=fishH*(.19+Math.abs(flipProgress-.5)*.18),tilt=-.1;
      drawing.save();drawing.translate(cx,baseY-lift);drawing.rotate(tilt);drawing.transform(1,0,.16,1,0,0);
      const edgeBody=()=>{drawing.beginPath();drawing.moveTo(-length*.44,0);drawing.bezierCurveTo(-length*.28,-half*1.15,length*.22,-half*1.05,length*.47,-half*.34);drawing.quadraticCurveTo(length*.52,0,length*.46,half*.43);drawing.bezierCurveTo(length*.19,half*1.18,-length*.27,half*1.08,-length*.44,0);drawing.closePath()};
      drawing.fillStyle="rgba(24,17,18,.3)";drawing.beginPath();drawing.ellipse(0,half*.9,length*.4,half*.5,0,0,Math.PI*2);drawing.fill();
      const upper=drawing.createLinearGradient(0,-half,0,half*.1);upper.addColorStop(0,fromLook.colors[1]);upper.addColorStop(.6,fromLook.colors[0]);upper.addColorStop(1,fromLook.colors[2]);drawing.fillStyle=upper;edgeBody();drawing.fill();
      drawing.save();edgeBody();drawing.clip();const underside=drawing.createLinearGradient(0,-half*.05,0,half*1.2);underside.addColorStop(0,toLook.colors[2]);underside.addColorStop(.25,toLook.colors[0]);underside.addColorStop(1,toLook.colors[1]);drawing.fillStyle=underside;drawing.fillRect(-length*.48,-half*.02,length,half*1.3);drawing.fillStyle="rgba(255,255,255,.5)";drawing.beginPath();drawing.ellipse(length*.02,half*.45,length*.27,half*.22,0,0,Math.PI*2);drawing.fill();drawing.restore();
      drawing.strokeStyle="rgba(48,31,29,.64)";drawing.lineWidth=Math.max(1.5,width*.006);edgeBody();drawing.stroke();drawing.strokeStyle="rgba(255,232,187,.62)";drawing.lineWidth=width*.006;drawing.beginPath();drawing.moveTo(-length*.38,half*.02);drawing.quadraticCurveTo(0,half*.35,length*.4,half*.06);drawing.stroke();
      drawing.strokeStyle="rgba(84,41,21,.7)";drawing.lineWidth=width*.009;for(let mark=0;mark<3;mark++){const x=-length*.12+mark*length*.13;drawing.beginPath();drawing.moveTo(x,-half*.82);drawing.lineTo(x+length*.04,-half*.04);drawing.stroke()}
      drawing.fillStyle=fromLook.colors[2];drawing.beginPath();drawing.moveTo(-length*.42,0);drawing.lineTo(-length*.57,-half*1.4);drawing.lineTo(-length*.51,half*.04);drawing.lineTo(-length*.57,half*1.45);drawing.closePath();drawing.fill();
      drawing.fillStyle="#28262A";drawing.beginPath();drawing.arc(length*.4,-half*.23,width*.013,0,Math.PI*2);drawing.fill();drawing.fillStyle="#fff";drawing.beginPath();drawing.arc(length*.396,-half*.27,width*.004,0,Math.PI*2);drawing.fill();drawing.restore();return;
    }
    drawing.save();drawing.translate(cx,baseY-lift);drawing.rotate(-Math.sin(Math.PI*flipProgress)*.13);drawing.transform(1,0,Math.sin(Math.PI*2*flipProgress)*.22,1,0,0);drawing.scale(1,scaleY);
    const tailX=-length*.5,headX=length*.38;
    drawing.fillStyle=colors[2];drawing.beginPath();drawing.moveTo(tailX+length*.09,0);drawing.lineTo(tailX-length*.11,-fishH*.48);drawing.quadraticCurveTo(tailX-length*.01,0,tailX-length*.11,fishH*.48);drawing.closePath();drawing.fill();
    drawing.fillStyle=colors[2];drawing.beginPath();drawing.moveTo(-length*.08,-fishH*.36);drawing.quadraticCurveTo(-length*.18,-fishH*.7,length*.04,-fishH*.42);drawing.closePath();drawing.fill();drawing.beginPath();drawing.moveTo(-length*.04,fishH*.34);drawing.quadraticCurveTo(-length*.15,fishH*.68,length*.08,fishH*.4);drawing.closePath();drawing.fill();
    const traceBody=()=>{drawing.beginPath();drawing.moveTo(-length*.45,0);drawing.bezierCurveTo(-length*.34,-fishH*.47,-length*.02,-fishH*.58,length*.2,-fishH*.46);drawing.bezierCurveTo(length*.36,-fishH*.37,length*.48,-fishH*.18,length*.48,0);drawing.bezierCurveTo(length*.45,fishH*.22,length*.29,fishH*.41,length*.12,fishH*.48);drawing.bezierCurveTo(-length*.14,fishH*.54,-length*.37,fishH*.37,-length*.45,0);drawing.closePath()};
    const body=drawing.createLinearGradient(-length*.45,-fishH*.25,length*.43,fishH*.3);body.addColorStop(0,colors[2]);body.addColorStop(.16,colors[0]);body.addColorStop(.4,colors[1]);body.addColorStop(.68,colors[0]);body.addColorStop(1,colors[2]);drawing.fillStyle=body;traceBody();drawing.fill();
    drawing.save();traceBody();drawing.clip();const patchStrength=clamp((heat-task.goodWindows[side][0]*.38)/(task.warningThresholds[side]-task.goodWindows[side][0]*.38));for(let patch=0;patch<9;patch++){const px=-length*.3+((patch*37+task.pattern*17+side*11)%100)/100*length*.64,py=(-.3+((patch*61+task.pattern*7)%100)/100*.6)*fishH,r=width*(.025+(patch%4)*.007),sear=drawing.createRadialGradient(px-r*.18,py-r*.15,0,px,py,r);sear.addColorStop(0,`rgba(104,48,20,${patchStrength*(.3+patch%3*.12)})`);sear.addColorStop(.58,`rgba(162,82,29,${patchStrength*.2})`);sear.addColorStop(1,"rgba(139,67,27,0)");drawing.fillStyle=sear;drawing.fillRect(px-r,py-r,r*2,r*2)}for(let grain=0;grain<74;grain++){const gx=-length*.38+((grain*43+task.pattern*29)%101)/101*length*.78,gy=(-.36+((grain*67+side*23)%103)/103*.72)*fishH,dot=width*(.0018+(grain%3)*.0008);drawing.fillStyle=name==="raw"?"rgba(236,255,251,.22)":`rgba(71,40,25,${.08+patchStrength*.13})`;drawing.beginPath();drawing.arc(gx,gy,dot,0,Math.PI*2);drawing.fill()}drawing.restore();
    if(flipProgress>.16&&flipProgress<.84){drawing.fillStyle=`rgba(54,41,37,${.3+.48*Math.sin(Math.PI*flipProgress)})`;drawing.beginPath();drawing.moveTo(-length*.43,-fishH*.07);drawing.quadraticCurveTo(0,fishH*.11,length*.45,-fishH*.05);drawing.lineTo(length*.4,fishH*.16);drawing.quadraticCurveTo(0,fishH*.33,-length*.4,fishH*.13);drawing.closePath();drawing.fill();drawing.strokeStyle="rgba(255,222,170,.52)";drawing.lineWidth=width*.007;drawing.beginPath();drawing.moveTo(-length*.39,fishH*.1);drawing.quadraticCurveTo(0,fishH*.28,length*.38,fishH*.12);drawing.stroke()}
    drawing.strokeStyle=name==="char"?"#171514":"rgba(55,48,43,.45)";drawing.lineWidth=Math.max(1.2,width*.004);drawing.stroke();
    const scaleAlpha=name==="raw"?.54:name==="pearly"?.4:.25;drawing.lineWidth=Math.max(1,width*.003);for(let row=-2;row<=2;row++)for(let col=0;col<9;col++){const variation=((row+2)*11+col*7+task.pattern*3)%9/100,x=-length*.3+col*length*.071+(Math.abs(row)%2)*length*.033,y=row*fishH*.13;drawing.strokeStyle=`rgba(255,255,255,${Math.max(.12,scaleAlpha-variation)})`;drawing.beginPath();drawing.arc(x,y,length*(.027+variation*.18),0,Math.PI);drawing.stroke()}
    drawing.strokeStyle=name==="raw"?"rgba(214,246,247,.56)":"rgba(91,53,31,.33)";drawing.lineWidth=Math.max(1.2,width*.004);drawing.beginPath();drawing.moveTo(-length*.33,fishH*.06);drawing.bezierCurveTo(-length*.08,fishH*.16,length*.17,fishH*.12,length*.35,fishH*.03);drawing.stroke();
    const scoreDark=name==="raw"?"rgba(61,85,87,.28)":name==="char"?"rgba(8,8,8,.9)":"rgba(91,46,24,.62)";drawing.strokeStyle=scoreDark;drawing.lineWidth=Math.max(2,width*.007);drawing.lineCap="round";for(let cut=0;cut<4;cut++){const x=-length*.16+cut*length*.115;drawing.beginPath();drawing.moveTo(x,-fishH*.31);drawing.lineTo(x-length*.055,fishH*.28);drawing.stroke()}
    const freckleStart=task.goodWindows[side][0]*.48,freckles=Math.max(0,Math.min(30,Math.floor((heat-freckleStart)/6)));drawing.fillStyle=name==="char"?"rgba(5,5,5,.82)":"rgba(113,55,24,.62)";for(let index=0;index<freckles;index++){const px=-length*.32+((index*47+task.pattern*19)%100)/100*length*.68,py=(-.3+((index*31+side*17)%100)/100*.6)*fishH;drawing.beginPath();drawing.ellipse(px,py,width*(.006+index%3*.002),width*.004,(index%5)*.4,0,Math.PI*2);drawing.fill()}
    if(name==="gold"||name==="amber"||name==="blister"||name==="char"){drawing.strokeStyle=name==="gold"?"rgba(132,72,28,.38)":"rgba(82,38,19,.58)";drawing.lineWidth=width*(name==="gold"?.014:.02);for(let mark=0;mark<3;mark++){const mx=-length*.16+mark*length*.16;drawing.beginPath();drawing.moveTo(mx-length*.04,-fishH*.34);drawing.lineTo(mx+length*.045,fishH*.31);drawing.stroke()}}
    if(name==="raw"||name==="pearly"){const sheen=drawing.createLinearGradient(-length*.3,-fishH*.34,length*.22,fishH*.08);sheen.addColorStop(0,"rgba(255,255,255,.08)");sheen.addColorStop(.48,`rgba(255,255,255,${name==="raw"?.82:.46})`);sheen.addColorStop(1,"rgba(255,255,255,0)");drawing.strokeStyle=sheen;drawing.lineWidth=fishH*.15;drawing.beginPath();drawing.moveTo(-length*.32,-fishH*.22);drawing.quadraticCurveTo(-length*.02,-fishH*.45,length*.25,-fishH*.18);drawing.stroke();if(name==="raw"){drawing.fillStyle="rgba(241,177,171,.18)";drawing.beginPath();drawing.ellipse(length*.04,fishH*.2,length*.25,fishH*.17,0,0,Math.PI*2);drawing.fill()}}
    const oilCount=Math.min(11,Math.floor(heat/38));for(let index=0;index<oilCount;index++){const ox=-length*.27+((index*37+task.pattern*13)%100)/100*length*.58,oy=(-.22+((index*61)%100)/100*.44)*fishH,r=width*(.006+index%3*.002);const oil=drawing.createRadialGradient(ox-r*.4,oy-r*.4,0,ox,oy,r);oil.addColorStop(0,"rgba(255,255,235,.94)");oil.addColorStop(.42,"rgba(255,200,82,.72)");oil.addColorStop(1,"rgba(143,72,26,.25)");drawing.fillStyle=oil;drawing.beginPath();drawing.arc(ox,oy,r,0,Math.PI*2);drawing.fill()}
    if(name==="blister"||name==="char"){for(let index=0;index<4;index++){const bx=-length*.1+index*length*.09,by=(index%2?-.12:.12)*fishH,r=width*(.014+index*.002);drawing.fillStyle=name==="char"?"#1A1715":"rgba(82,38,20,.66)";drawing.beginPath();drawing.arc(bx,by,r,0,Math.PI*2);drawing.fill();drawing.strokeStyle="rgba(255,190,88,.48)";drawing.lineWidth=1.5;drawing.stroke()}}
    drawing.fillStyle=name==="char"?"#171411":"#353338";drawing.beginPath();drawing.arc(headX+length*.018,-fishH*.08,width*.017,0,Math.PI*2);drawing.fill();drawing.fillStyle="rgba(255,255,255,.9)";drawing.beginPath();drawing.arc(headX+length*.012,-fishH*.087,width*.005,0,Math.PI*2);drawing.fill();
    drawing.strokeStyle="rgba(55,34,31,.55)";drawing.lineWidth=1.5;drawing.beginPath();drawing.arc(headX+length*.065,fishH*.07,width*.025,.2,2.2);drawing.stroke();
    drawing.restore();
  };
  const drawSteamAndHaze=(side,heat)=>{
    const good=task.goodWindows[side],steamStrength=clamp((heat-good[0]*.25)/(good[0]*.7));drawing.save();drawing.lineCap="round";
    for(let index=0;index<6;index++){const phase=(clock/900+index*.19)%1,x=width*(.29+index*.085+Math.sin(index*2.3+clock/700)*.012),y=height*(.38-phase*.28),alpha=steamStrength*(1-phase)*.35;drawing.strokeStyle=`rgba(255,255,255,${alpha})`;drawing.lineWidth=width*.008;drawing.beginPath();drawing.moveTo(x,y);drawing.bezierCurveTo(x-width*.025,y-height*.045,x+width*.03,y-height*.075,x,y-height*.12);drawing.stroke()}
    if(state.result==="burn"){for(let index=0;index<5;index++){const phase=(clock/1500+index*.14)%1,x=width*(.38+index*.07+Math.sin(clock/600+index)*.025),y=height*(.42-phase*.38);drawing.strokeStyle=`rgba(48,41,42,${.52*(1-phase)})`;drawing.lineWidth=width*(.025+index*.002);drawing.beginPath();drawing.moveTo(x,y);drawing.bezierCurveTo(x-width*.08,y-height*.08,x+width*.07,y-height*.16,x-width*.02,y-height*.24);drawing.stroke()}}
    drawing.restore();
  };
  const drawBurnImpact=()=>{
    if(state.result!=="burn")return;const x=width*.64,y=height*.49;drawing.save();drawing.strokeStyle="rgba(255,190,64,.85)";drawing.lineWidth=3;drawing.lineCap="round";for(let index=0;index<14;index++){const angle=index/14*Math.PI*2,length=width*(.055+(index%4)*.015);drawing.beginPath();drawing.moveTo(x+Math.cos(angle)*width*.025,y+Math.sin(angle)*width*.025);drawing.lineTo(x+Math.cos(angle)*length,y+Math.sin(angle)*length);drawing.stroke()}for(let index=0;index<18;index++){const angle=index*2.17,r=width*(.045+(index%6)*.018),size=width*(.006+(index%3)*.003);const oil=drawing.createRadialGradient(x+Math.cos(angle)*r-size*.3,y+Math.sin(angle)*r-size*.3,0,x+Math.cos(angle)*r,y+Math.sin(angle)*r,size);oil.addColorStop(0,"#FFF4B0");oil.addColorStop(.45,"#F4A333");oil.addColorStop(1,"#9A3E20");drawing.fillStyle=oil;drawing.beginPath();drawing.arc(x+Math.cos(angle)*r,y+Math.sin(angle)*r,size,0,Math.PI*2);drawing.fill()}drawing.restore();
  };
  const drawTongs=progress=>{
    if(!state.flipping)return;const lift=Math.sin(Math.PI*progress)*height*.16,cx=width*.62,cy=height*.51-lift,gap=height*(.075-.018*Math.sin(Math.PI*progress));drawing.save();drawing.lineCap="round";drawing.lineJoin="round";drawing.shadowColor="rgba(0,0,0,.3)";drawing.shadowBlur=5;drawing.strokeStyle="#686B70";drawing.lineWidth=Math.max(8,width*.025);drawing.beginPath();drawing.moveTo(width*.97,height*.035);drawing.quadraticCurveTo(width*.82,height*.13,cx+width*.035,cy-gap);drawing.quadraticCurveTo(cx-width*.005,cy-gap,cx-width*.018,cy-gap*1.02);drawing.moveTo(width*.91,-height*.015);drawing.quadraticCurveTo(width*.76,height*.1,cx+width*.018,cy+gap);drawing.quadraticCurveTo(cx-width*.015,cy+gap,cx-width*.025,cy+gap*1.02);drawing.stroke();drawing.shadowBlur=0;drawing.strokeStyle="#E6E8EA";drawing.lineWidth=Math.max(4,width*.012);drawing.beginPath();drawing.moveTo(width*.97,height*.035);drawing.quadraticCurveTo(width*.82,height*.13,cx+width*.035,cy-gap);drawing.quadraticCurveTo(cx-width*.005,cy-gap,cx-width*.018,cy-gap*1.02);drawing.moveTo(width*.91,-height*.015);drawing.quadraticCurveTo(width*.76,height*.1,cx+width*.018,cy+gap);drawing.quadraticCurveTo(cx-width*.015,cy+gap,cx-width*.025,cy+gap*1.02);drawing.stroke();drawing.fillStyle="#B9BDC2";for(const yy of[cy-gap*1.02,cy+gap*1.02]){drawing.beginPath();drawing.ellipse(cx-width*.023,yy,width*.028,height*.019,0,0,Math.PI*2);drawing.fill();drawing.strokeStyle="#686B70";drawing.lineWidth=1.5;drawing.stroke()}drawing.restore()};

  const paint=()=>{
    drawing.clearRect(0,0,width,height);drawCountertop();
    const platingProgress=state.plating?clamp((clock-state.plating.started)/state.plating.duration):state.plated?1:0;
    if(platingProgress>0){drawGrill(1-platingProgress);drawPlate(platingProgress)}else drawGrill();
    const flipProgress=state.flipping?state.flipping.progress:0,side=state.result==="burn"?state.failureSide??displaySide():displaySide(),heat=state.heat[side];
    if(!platingProgress&&heat>task.goodWindows[side][0]*.42){const activity=clamp(heat/task.warningThresholds[side]);drawing.save();for(let bead=0;bead<9;bead++){const angle=bead*2.31+clock/1600,r=width*(.27+bead%3*.025),x=width*.51+Math.cos(angle)*r,y=height*.52+Math.sin(angle)*height*.18,size=width*(.004+bead%3*.002);drawing.strokeStyle=`rgba(255,196,73,${.25+activity*.36})`;drawing.lineWidth=1.5;drawing.beginPath();drawing.arc(x,y,size*(1.3+Math.sin(clock/180+bead)*.25),0,Math.PI*2);drawing.stroke()}drawing.restore()}
    drawFish(side,heat,flipProgress,platingProgress);drawBurnImpact();drawSteamAndHaze(side,heat);drawTongs(flipProgress);
    if(state.result==="success"&&platingProgress>0){drawing.save();drawing.globalAlpha=platingProgress*.6;drawing.strokeStyle="rgba(255,244,164,.86)";drawing.lineWidth=width*.026;drawing.lineCap="round";const sweep=(platingProgress-.5)*width*.52;drawing.beginPath();drawing.moveTo(width*.31+sweep,height*.39);drawing.quadraticCurveTo(width*.5+sweep,height*.49,width*.66+sweep,height*.56);drawing.stroke();drawing.restore()}
  };
  const updateMemory=()=>{
    state.lastSeen[state.visible]=describe(state.visible);sideNodes.forEach((node,side)=>{node.dataset.visible=String(side===state.visible);node.textContent=`${side===0?"表":"裏"}：${state.seen[side]?state.lastSeen[side]:"まだ見ていない"}`});
    serveButton.disabled=state.done||state.busy||!bothSeen();flipButton.disabled=state.done||state.busy;stage.dataset.result=state.result||"";
    canvas.setAttribute("aria-label",`${state.visible===0?"表":"裏"}面、${describe(state.visible)}。${bothSeen()?"盛り付け可能":"反対面はまだ見ていない"}`);
  };
  const setStatus=message=>{status.textContent=message;updateMemory()};
  const finishLater=(correct,result,delay)=>{context.later(()=>{if(!state.disposed)context.finish(correct,result)},delay)};
  const failBurn=side=>{
    if(state.done||state.disposed)return;state.done=true;state.busy=false;state.result="burn";state.failureSide=side;state.burst=1;state.smoke=1;board.classList.add("afg-burn");terminal.textContent="焦げました";setStatus(`${side===0?"表":"裏"}面の油がはじけて焦げました`);paint();finishLater(false,{reason:"burn",detail:`${side===0?"表":"裏"}面を焦がしました。`},context.reducedMotion?0:850);
  };
  const advanceOne=()=>{
    if(state.done||state.disposed)return false;const visible=state.visible,hidden=1-visible;state.heat[visible]+=task.heatRates[visible];state.heat[hidden]+=task.carryoverHeat;state.steps++;state.lastSeen[visible]=describe(visible);const burnt=state.heat.findIndex((value,side)=>value>=task.burnThresholds[side]);if(burnt>=0){failBurn(burnt);return false}return true;
  };
  const advanceSteps=count=>{let advanced=0;for(let index=0;index<Math.max(0,Math.floor(count));index++){if(!advanceOne())break;advanced++}if(!state.done){setStatus(`${state.visible===0?"表":"裏"}面は「${describe(state.visible)}」`);paint()}return advanced};
  const completeFlip=record=>{if(state.disposed||state.done||state.flipping!==record)return false;record.progress=1;state.flipping=null;state.busy=false;state.lastSeen[state.visible]=describe(state.visible);state.steam=1;setStatus(`${state.visible===0?"表":"裏"}面を上にしました。${describe(state.visible)}`);paint();return true};
  const flip=()=>{
    if(state.done||state.disposed||state.busy)return false;const from=state.visible,to=1-from,duration=context.reducedMotion?120:620,record={from,to,started:now(),duration,progress:0};state.visible=to;state.seen[to]=true;state.flips++;state.busy=true;state.flipping=record;setStatus("トングで持ち上げて返しています…");paint();context.later(()=>{if(state.flipping===record){record.progress=.42;paint()}},duration/3);context.later(()=>{if(state.flipping===record){record.progress=.72;paint()}},duration*2/3);context.later(()=>completeFlip(record),duration);return"flipping";
  };
  const serve=()=>{
    if(state.done||state.disposed||state.busy)return false;if(!bothSeen()){setStatus("両面を一度見てから盛り付けます");return"locked"}const result=outcome();
    if(result==="ready"){
      state.done=true;state.busy=true;state.result="success";const duration=context.reducedMotion?120:780;state.plating={started:now(),duration};board.classList.add("afg-success");terminal.textContent="";setStatus("両面ちょうど。皿へ盛り付けています");paint();context.later(()=>{if(state.disposed)return;state.plated=true;state.busy=false;state.plating=null;setStatus("香ばしく焼き上がりました");paint();const centers=task.goodWindows.map(window=>(window[0]+window[1])/2),distance=state.heat.reduce((sum,value,side)=>sum+Math.abs(value-centers[side])/(task.goodWindows[side][1]-task.goodWindows[side][0]),0);context.finish(true,{reason:"served",quality:clamp(1-distance*.2-Math.max(0,state.flips-1)*.04),detail:`両面を${state.flips}回返して、ちょうどよく焼きました。`})},duration);return"success";
    }
    state.done=true;state.result=result;board.classList.add(result==="undercooked"?"afg-undercooked":"afg-overdone");terminal.textContent=result==="undercooked"?"まだ生です":"焼きすぎです";setStatus(result==="undercooked"?"中がまだ生っぽいまま盛り付けました":"香ばしい範囲を過ぎています");paint();finishLater(false,{reason:result,detail:result==="undercooked"?"どちらかの面がまだ生でした。":"焼きすぎてから盛り付けました。"},context.reducedMotion?0:650);return result;
  };
  const tick=time=>{
    if(state.disposed)return false;clock=Number(time)||now();if(lastTime===null)lastTime=clock;lastTime=clock;const targetSteps=Math.min(Math.floor(task.duration/task.quantumMs),Math.floor(Math.max(0,clock-startedAt)/task.quantumMs));while(!state.done&&state.steps<targetSteps)advanceOne();if(state.flipping)state.flipping.progress=clamp((clock-state.flipping.started)/state.flipping.duration);state.frames++;paint();return true;
  };
  const resize=()=>{const rect=board.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{};width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*.88);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;board.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);paint()};
  const flipInput=event=>{event?.preventDefault?.();flip()},serveInput=event=>{event?.preventDefault?.();serve()};
  context.listen(flipButton,"pointerdown",flipInput);context.listen(serveButton,"pointerdown",serveInput);context.listen(flipButton,"click",event=>{if(event.detail===0)flipInput(event)});context.listen(serveButton,"click",event=>{if(event.detail===0)serveInput(event)});
  context.listen(canvas,"pointerdown",flipInput);context.listen(canvas,"keydown",event=>{if(event.key===" "||event.key==="Enter")flipInput(event);else if(event.key.toLowerCase()==="s")serveInput(event)});context.listen(flipButton,"keydown",event=>{if(event.key.toLowerCase()==="s")serveInput(event)});context.listen(serveButton,"keydown",event=>{if(event.key===" "||event.key==="Enter")return;if(event.key.toLowerCase()==="f"){event.preventDefault();flip()}});
  if(view)context.listen(view,"resize",resize,{passive:true});
  setStatus(`${state.visible===0?"表":"裏"}面は、まだ生っぽく光っています`);resize();canvas.focus({preventScroll:true});if(!context.reducedMotion)context.frame(tick);
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;state.result="timeout";board.classList.add("afg-timeout");terminal.textContent="時間切れ";const current=outcome();setStatus(current==="undercooked"?"時間切れ。まだ生の面があります":"時間切れ。焼き上がりを逃しました");paint();context.finish(false,{reason:"timeout",detail:current==="undercooked"?"時間切れで、まだ生の面が残りました。":"時間切れになりました。"})});
  const qaApi={flip,serve,advanceSteps,outcomes:()=>({current:outcome(),good:inGood(task,state.heat),materials:[material(0),material(1)]}),paint,inspect:()=>({heat:[...state.heat],visible:state.visible,seen:[...state.seen],lastSeen:[...state.lastSeen],steps:state.steps,flips:state.flips,flipping:state.flipping?{from:state.flipping.from,to:state.flipping.to,progress:state.flipping.progress}:null,busy:state.busy,done:state.done,disposed:state.disposed,result:state.result,frames:state.frames,plated:state.plated,materials:[material(0),material(1)],descriptions:[describe(0),describe(1)],status:status.textContent,proof:{...task.proof},canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr},viewport:{...context.viewport}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
