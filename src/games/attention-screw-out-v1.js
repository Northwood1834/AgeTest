const GRID=3;
const GENERATION_ATTEMPTS=400;
const COLORS=["#F2953F","#5FB6E0","#66C08C","#A66DC2","#EA7E9B","#F2CE4B"];
const PROMPT="ボルトを抜く順番を読んで";
const HELP="上に乗った板の下のボルトは回せません。3枚すべて外せば成功です。";
const LEGACY_HELP="上に乗った板の下のボルトは回せません。";

const metadata=Object.freeze({
  id:"attention-screw-out-v1",
  introducedIn:"1.11",
  tier:2,
  flavor:"quirky",
  step:1,
  family:"attention-screw-out",
  category:"attention"
});

const hole=(row,col)=>row*GRID+col;
const factorial=value=>{let out=1;for(let item=2;item<=value;item++)out*=item;return out};
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
const clonePlate=plate=>({...plate,bolts:[...plate.bolts],covers:[...plate.covers]});
const span=plate=>{
  if(plate?.dir==="h"&&Number.isInteger(plate.r)&&Number.isInteger(plate.c0)&&Number.isInteger(plate.c1)&&plate.c1>=plate.c0)return Array.from({length:plate.c1-plate.c0+1},(_,index)=>hole(plate.r,plate.c0+index));
  if(plate?.dir==="v"&&Number.isInteger(plate.c)&&Number.isInteger(plate.r0)&&Number.isInteger(plate.r1)&&plate.r1>=plate.r0)return Array.from({length:plate.r1-plate.r0+1},(_,index)=>hole(plate.r0+index,plate.c));
  return[];
};

function simulate(plates,order){
  const removed=new Set(),dropped=new Set();
  for(const bolt of order){
    const blocker=plates.find(plate=>!dropped.has(plate.id)&&plate.covers.includes(bolt));
    if(blocker)return{ok:false,blocked:bolt,blocker:blocker.id,removed:[...removed],dropped:[...dropped]};
    removed.add(bolt);
    plates.forEach(plate=>{if(!dropped.has(plate.id)&&plate.bolts.every(item=>removed.has(item)))dropped.add(plate.id)});
  }
  return{ok:dropped.size===plates.length,blocked:null,blocker:null,removed:[...removed],dropped:[...dropped]};
}

function analyze(plates,bolts){
  let wins=0,first=null;
  const visit=(remaining,removed,dropped,order)=>{
    if(!remaining.length){if(dropped.size===plates.length){wins++;if(!first)first=[...order]}return}
    remaining.forEach((bolt,index)=>{
      if(plates.some(plate=>!dropped.has(plate.id)&&plate.covers.includes(bolt)))return;
      const nextRemoved=new Set(removed);nextRemoved.add(bolt);
      const nextDropped=new Set(dropped);
      plates.forEach(plate=>{if(!nextDropped.has(plate.id)&&plate.bolts.every(item=>nextRemoved.has(item)))nextDropped.add(plate.id)});
      visit([...remaining.slice(0,index),...remaining.slice(index+1)],nextRemoved,nextDropped,[...order,bolt]);
    });
  };
  visit([...bolts],new Set(),new Set(),[]);
  return{wins,total:factorial(bolts.length),first};
}

function expectedCovers(plates,index){
  const top=plates[index],cells=span(top),out=[];
  plates.slice(index+1).forEach(lower=>lower.bolts.forEach(bolt=>{
    if(cells.includes(bolt)&&!top.bolts.includes(bolt)&&!out.includes(bolt))out.push(bolt);
  }));
  return out;
}

const AUTHORED_PLATES=Object.freeze([
  {id:0,layer:0,dir:"h",r:0,c0:0,c1:2,color:COLORS[0],bolts:[0,2],covers:[1]},
  {id:1,layer:1,dir:"h",r:2,c0:0,c1:2,color:COLORS[1],bolts:[6,8],covers:[7]},
  {id:2,layer:2,dir:"v",c:1,r0:0,r1:2,color:COLORS[2],bolts:[1,7],covers:[]}
].map(plate=>Object.freeze({...plate,bolts:Object.freeze([...plate.bolts]),covers:Object.freeze([...plate.covers])})));
const AUTHORED_BOLTS=[0,2,6,8,1,7];
const AUTHORED_ANALYSIS=analyze(AUTHORED_PLATES,AUTHORED_BOLTS);

const PUBLISHED_FALLBACK=Object.freeze({
  plates:[
    {id:0,layer:0,dir:"h",r:1,c0:0,c1:2,color:COLORS[0],bolts:[3,5],covers:[4]},
    {id:1,layer:1,dir:"v",c:1,r0:0,r1:2,color:COLORS[1],bolts:[1,7],covers:[]},
    {id:2,layer:2,dir:"h",r:2,c0:0,c1:1,color:COLORS[2],bolts:[6,7],covers:[]}
  ],bolts:[3,5,1,7,6],answer:[3,5,1,7,6],wins:1,total:120
});
const isPublishedFallback=task=>task?.help===LEGACY_HELP&&same(task.plates,PUBLISHED_FALLBACK.plates)&&same(task.bolts,PUBLISHED_FALLBACK.bolts)&&same(task.answer,PUBLISHED_FALLBACK.answer)&&task.wins===1&&task.total===120;

function makeTask(plates,bolts,analysis){
  return{kind:"screwOut",prompt:PROMPT,help:HELP,plates:plates.map(clonePlate),bolts:[...bolts],answer:[...analysis.first],wins:analysis.wins,total:analysis.total,duration:60000};
}

function generate({random,randomInt}){
  if(typeof random!=="function"||typeof randomInt!=="function")throw new TypeError(`${metadata.id} requires random and randomInt`);
  for(let attempt=0;attempt<GENERATION_ATTEMPTS;attempt++){
    const plates=[];
    for(let layer=0;layer<3;layer++){
      if(random()<.5){
        const r=randomInt(0,GRID-1),c0=randomInt(0,GRID-2),c1=randomInt(c0+1,GRID-1);
        plates.push({id:layer,layer,dir:"h",r,c0,c1,color:COLORS[layer],bolts:[hole(r,c0),hole(r,c1)],covers:[]});
      }else{
        const c=randomInt(0,GRID-1),r0=randomInt(0,GRID-2),r1=randomInt(r0+1,GRID-1);
        plates.push({id:layer,layer,dir:"v",c,r0,r1,color:COLORS[layer],bolts:[hole(r0,c),hole(r1,c)],covers:[]});
      }
    }
    const bolts=[...new Set(plates.flatMap(plate=>plate.bolts))];
    if(bolts.length!==6)continue;
    plates.forEach((plate,index)=>plate.covers.push(...expectedCovers(plates,index)));
    if(!plates.some(plate=>plate.covers.length))continue;
    const analysis=analyze(plates,bolts);
    if(!analysis.wins||analysis.wins/analysis.total>.2)continue;
    return makeTask(plates,bolts,analysis);
  }
  return makeTask(AUTHORED_PLATES,AUTHORED_BOLTS,AUTHORED_ANALYSIS);
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="screwOut")issues.push("kind must remain screwOut");
  if(task.prompt!==PROMPT)issues.push("prompt changed");
  if(task.help!==HELP&&task.help!==LEGACY_HELP)issues.push("help changed");
  if(task.duration!==60000)issues.push("duration must remain 60000ms");
  const plates=Array.isArray(task.plates)?task.plates:[];
  if(plates.length!==3)issues.push("plates must contain exactly three layers");
  plates.forEach((plate,index)=>{
    if(plate?.id!==index||plate?.layer!==index)issues.push(`plate ${index} identity or layer changed`);
    if(plate?.color!==COLORS[index])issues.push(`plate ${index} color changed`);
    if(plate?.dir!=="h"&&plate?.dir!=="v")issues.push(`plate ${index} direction is invalid`);
    if(plate?.dir==="h"&&(!Number.isInteger(plate.r)||plate.r<0||plate.r>=GRID||!Number.isInteger(plate.c0)||!Number.isInteger(plate.c1)||plate.c0<0||plate.c1>=GRID||plate.c0>=plate.c1))issues.push(`plate ${index} horizontal span is invalid`);
    if(plate?.dir==="v"&&(!Number.isInteger(plate.c)||plate.c<0||plate.c>=GRID||!Number.isInteger(plate.r0)||!Number.isInteger(plate.r1)||plate.r0<0||plate.r1>=GRID||plate.r0>=plate.r1))issues.push(`plate ${index} vertical span is invalid`);
    if(!Array.isArray(plate?.bolts)||plate.bolts.length!==2||plate.bolts.some(bolt=>!Number.isInteger(bolt)||bolt<0||bolt>=GRID*GRID)||new Set(plate.bolts).size!==2)issues.push(`plate ${index} bolts are invalid`);
    else if((plate.dir==="h"||plate.dir==="v")&&!same(plate.bolts,[span(plate)[0],span(plate).at(-1)]))issues.push(`plate ${index} bolts must remain at its endpoints`);
    if(!Array.isArray(plate?.covers)||plate.covers.some(bolt=>!Number.isInteger(bolt)||bolt<0||bolt>=GRID*GRID)||new Set(plate.covers).size!==plate.covers.length)issues.push(`plate ${index} covers are invalid`);
  });
  const legacy=isPublishedFallback(task),bolts=Array.isArray(task.bolts)?task.bolts:[];
  if(!Array.isArray(task.bolts)||bolts.length<5||bolts.length>6||bolts.some(bolt=>!Number.isInteger(bolt)||bolt<0||bolt>=GRID*GRID)||new Set(bolts).size!==bolts.length)issues.push("bolts must be five or six unique board holes");
  if(plates.length===3&&plates.every(plate=>Array.isArray(plate?.bolts))){
    const union=[...new Set(plates.flatMap(plate=>plate.bolts))];
    if(!same(bolts,union))issues.push("bolts must preserve plate endpoint order");
    if(!legacy&&union.length!==6)issues.push("generated plate bolts must not be shared");
    if(!legacy)plates.forEach((plate,index)=>{if(!same(plate.covers,expectedCovers(plates,index)))issues.push(`plate ${index} cover dependency changed`)});
  }
  if(!Array.isArray(task.answer)||!same([...task.answer].sort((a,b)=>a-b),[...bolts].sort((a,b)=>a-b)))issues.push("answer must be a permutation of every bolt");
  if(!Number.isInteger(task.wins)||task.wins<1)issues.push("wins must be a positive integer");
  if(task.total!==factorial(bolts.length))issues.push("total must equal every bolt permutation");
  if(!issues.length&&!legacy){
    const analysis=analyze(plates,bolts);
    if(!analysis.wins)issues.push("plate dependencies are not solvable");
    if(task.wins!==analysis.wins)issues.push("wins does not match exhaustive solvability");
    if(!same(task.answer,analysis.first))issues.push("answer must remain the first exhaustive winning order");
    if(!simulate(plates,task.answer).ok)issues.push("answer is blocked or incomplete");
    if(analysis.wins/analysis.total>.2)issues.push("winning order rate must remain at most 20%");
  }
  return[...new Set(issues)];
}

const STYLE=`
.aso-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;padding:.25rem max(.25rem,env(safe-area-inset-left)) .2rem max(.25rem,env(safe-area-inset-right));display:grid;gap:.48rem;color:#44364c}
.aso-status{min-height:2.75em;margin:0;padding:.55rem .76rem;border-radius:.82rem;background:linear-gradient(180deg,#f8f2fa,#eee5f3);border:1px solid #ded0e6;color:#5c4865;text-align:center;font-size:.96rem;font-weight:900;line-height:1.4;box-shadow:inset 0 1px #fff}.aso-status.aso-error{background:#fff0f1;border-color:#e8aeb8;color:#8f293d}.aso-status.aso-success{background:#e8f8ed;border-color:#a9d8b5;color:#256443}
.aso-board{position:relative;width:100%;overflow:hidden;border-radius:1.08rem;background:#e8e0ef;box-shadow:0 10px 25px rgba(46,28,55,.2),inset 0 0 0 1px rgba(255,255,255,.65);touch-action:manipulation}.aso-board.aso-blocked{box-shadow:0 0 0 4px #bd4056,0 12px 28px rgba(93,25,42,.3)}.aso-board.aso-success{box-shadow:0 0 0 4px #63b980,0 13px 30px rgba(36,116,68,.3)}.aso-board.aso-timeout{filter:saturate(.72);box-shadow:0 0 0 4px #994154,0 12px 28px rgba(69,23,38,.32)}
.aso-canvas{display:block;width:100%;height:100%}.aso-bolts,.aso-effects{position:absolute;inset:0}.aso-bolts{z-index:3}.aso-effects{z-index:5;pointer-events:none}.aso-hit{box-sizing:border-box;position:absolute;display:grid;place-items:center;width:3.2rem;height:3.2rem;padding:0;border:2px solid transparent;border-radius:50%;background:transparent;color:transparent;transform:translate(-50%,-50%);touch-action:manipulation;cursor:pointer}.aso-hit:hover:not(:disabled){border-color:rgba(91,55,111,.38);background:rgba(255,255,255,.12)}.aso-hit.aso-covered{border-style:dashed;border-color:rgba(72,52,79,.32)}.aso-hit.aso-removing{border-color:#fff3b1;box-shadow:0 0 0 4px rgba(230,177,47,.45)}.aso-hit:disabled{cursor:default}.aso-hit:focus-visible{outline:none;border-color:transparent;box-shadow:inset 0 0 0 3px #633c78,inset 0 0 0 6px rgba(255,255,255,.92),0 4px 9px rgba(45,25,54,.24)}
.aso-badge{position:absolute;right:.7rem;top:.68rem;max-width:62%;padding:.5rem .78rem;border-radius:999px;background:#a92f46;color:#fff;font-size:.9rem;font-weight:950;letter-spacing:.02em;box-shadow:0 5px 14px rgba(88,19,34,.34);opacity:0;transform:translateY(-8px) scale(.9)}.aso-board.aso-blocked .aso-badge{opacity:1;transform:none;transition:transform .16s ease-out,opacity .16s}.aso-impact{position:absolute;width:3rem;height:3rem;margin:-1.5rem;border:4px solid #f7a2ae;border-radius:50%;opacity:0}.aso-board.aso-blocked .aso-impact{animation:aso-impact .62s ease-out both}
.aso-terminal{position:absolute;inset:0;display:grid;place-items:center;background:rgba(54,27,44,.5);color:#fff;font-size:1.34rem;font-weight:950;letter-spacing:.06em;text-shadow:0 2px 6px rgba(0,0,0,.4);opacity:0}.aso-board.aso-timeout .aso-terminal{opacity:1}.aso-board.aso-success .aso-terminal{opacity:1;background:linear-gradient(135deg,rgba(31,116,65,.1),rgba(246,214,77,.22));color:#1f6641;text-shadow:0 1px #fff}
.aso-spark{position:absolute;left:50%;top:50%;width:.68rem;height:.68rem;margin:-.34rem;border-radius:50%;background:var(--color);box-shadow:0 0 10px var(--color);opacity:0}.aso-board.aso-success .aso-spark{animation:aso-spark .9s ease-out both;animation-delay:var(--delay)}
.aso-progress{margin:0;text-align:center;color:#66566e;font-size:.91rem;font-weight:900}.aso-instructions{margin:0;text-align:center;color:#74677a;font-size:.8rem;font-weight:750;white-space:nowrap}
@keyframes aso-impact{0%{opacity:1;transform:scale(.35)}100%{opacity:0;transform:scale(2.5)}}@keyframes aso-spark{0%{opacity:0;transform:translate(0,0) scale(.2)}18%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.15)}}
.aso-stage[data-reduced=true] .aso-impact,.aso-stage[data-reduced=true] .aso-spark{animation:none!important;display:none}.aso-stage[data-reduced=true] *{scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){.aso-impact,.aso-spark{animation:none!important;display:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="aso-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));
  const status=documentRef.createElement("p");status.className="aso-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="aso-board";
  const canvas=documentRef.createElement("canvas");canvas.className="aso-canvas";canvas.setAttribute("role","img");canvas.setAttribute("aria-label","3枚の金属プレートを留めるボルトを、上の板から順に外すパズル");
  const boltLayer=documentRef.createElement("div");boltLayer.className="aso-bolts";boltLayer.setAttribute("role","group");boltLayer.setAttribute("aria-label","外すボルト");
  const effects=documentRef.createElement("div");effects.className="aso-effects";effects.setAttribute("aria-hidden","true");
  const badge=documentRef.createElement("span");badge.className="aso-badge";badge.textContent="板の下で回せません";
  const impact=documentRef.createElement("i");impact.className="aso-impact";
  const terminal=documentRef.createElement("strong");terminal.className="aso-terminal";
  const sparkVectors=[[-110,-52],[-84,-91],[-48,-108],[-6,-118],[40,-106],[82,-86],[112,-43],[120,4],[101,52],[72,92],[28,112],[-18,118],[-64,101],[-102,70],[-122,25],[-117,-18]];
  sparkVectors.forEach(([dx,dy],index)=>{const spark=documentRef.createElement("i");spark.className="aso-spark";spark.style.setProperty("--dx",`${dx}px`);spark.style.setProperty("--dy",`${dy}px`);spark.style.setProperty("--delay",`${index%4*22}ms`);spark.style.setProperty("--color",["#F5CD50","#FFFFFF","#69C58A","#65BDE5"][index%4]);effects.append(spark)});
  effects.append(badge,impact,terminal);board.append(canvas,boltLayer,effects);
  const progress=documentRef.createElement("p");progress.className="aso-progress";
  const instructions=documentRef.createElement("p");instructions.className="aso-instructions";instructions.textContent="タップで外す。矢印で移動、Enterで決定";
  stage.append(status,board,progress,instructions);context.host.replaceChildren(style,stage);

  const drawing=canvas.getContext("2d"),plates=task.plates.map(plate=>({...clonePlate(plate),gone:false,drop:0,dropStart:0,dropComplete:false,shakeUntil:0})),removed=new Set(),buttons=new Map();
  const state={done:false,disposed:false,busy:false,selected:task.bolts[0],order:[],blocked:null,blocker:null,removing:null,remaining:plates.length,result:null};
  let width=390,height=359,step=96,originX=99,originY=90,clock=0,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1));
  const now=()=>Number(view?.performance?.now?.())||performance.now();
  const holeX=col=>originX+col*step,holeY=row=>originY+row*step;
  const boltPoint=bolt=>({x:holeX(bolt%GRID),y:holeY(Math.floor(bolt/GRID))});
  const activePlates=()=>plates.filter(plate=>!plate.gone);
  const blockerFor=bolt=>activePlates().find(plate=>plate.covers.includes(bolt));
  const shade=(color,amount)=>{const value=Number.parseInt(color.slice(1),16),channels=[value>>16,value>>8&255,value&255].map(channel=>Math.round(Math.max(0,Math.min(255,amount<0?channel*(1+amount):channel+(255-channel)*amount))));return`rgb(${channels.join(",")})`};
  const rounded=(rect,radius)=>{drawing.beginPath();drawing.roundRect(rect.x,rect.y,rect.w,rect.h,radius)};
  const plateRect=plate=>{const thickness=step*.54,pad=step*.35,drop=plate.drop*height;if(plate.dir==="h")return{x:holeX(plate.c0)-pad,y:holeY(plate.r)-thickness/2+drop,w:(plate.c1-plate.c0)*step+pad*2,h:thickness};return{x:holeX(plate.c)-thickness/2,y:holeY(plate.r0)-pad+drop,w:thickness,h:(plate.r1-plate.r0)*step+pad*2}};
  const drawPlate=plate=>{
    const rect=plateRect(plate),radius=Math.min(rect.w,rect.h)*.38,shake=plate.shakeUntil>clock?Math.sin(clock*.08)*width*.012:0;
    drawing.save();drawing.translate(shake,0);
    drawing.fillStyle="rgba(35,20,43,.24)";rounded({x:rect.x+width*.017,y:rect.y+width*.025,w:rect.w,h:rect.h},radius);drawing.fill();
    drawing.fillStyle=shade(plate.color,-.38);rounded({x:rect.x,y:rect.y+step*.075,w:rect.w,h:rect.h},radius);drawing.fill();
    const body=drawing.createLinearGradient(rect.x,rect.y,rect.x+rect.w,rect.y+rect.h);body.addColorStop(0,shade(plate.color,.34));body.addColorStop(.24,shade(plate.color,.12));body.addColorStop(.62,plate.color);body.addColorStop(1,shade(plate.color,-.28));drawing.fillStyle=body;rounded(rect,radius);drawing.fill();
    drawing.strokeStyle="rgba(255,255,255,.72)";drawing.lineWidth=Math.max(1.4,step*.024);rounded({x:rect.x+step*.045,y:rect.y+step*.045,w:rect.w-step*.09,h:rect.h-step*.09},radius*.82);drawing.stroke();
    drawing.strokeStyle="rgba(74,40,79,.15)";drawing.lineWidth=1;for(let line=.22;line<.82;line+=.15){drawing.beginPath();if(plate.dir==="h"){drawing.moveTo(rect.x+rect.w*.14,rect.y+rect.h*line);drawing.lineTo(rect.x+rect.w*.86,rect.y+rect.h*line)}else{drawing.moveTo(rect.x+rect.w*line,rect.y+rect.h*.14);drawing.lineTo(rect.x+rect.w*line,rect.y+rect.h*.86)}drawing.stroke()}
    drawing.restore();
  };
  const removalProgress=bolt=>state.removing?.bolt===bolt?Math.max(0,Math.min(1,(clock-state.removing.started)/state.removing.duration)):0;
  const drawBolt=(bolt,plate)=>{
    if(removed.has(bolt))return;const point=boltPoint(bolt),lift=removalProgress(bolt),x=point.x,y=point.y+plate.drop*height-lift*step*.22,r=step*.19,alpha=1-lift*.84;
    drawing.save();drawing.globalAlpha=alpha;drawing.fillStyle="rgba(29,19,37,.34)";drawing.beginPath();drawing.ellipse(x+2,y+r*.37+4,r*.95,r*.58,0,0,Math.PI*2);drawing.fill();
    const rim=drawing.createRadialGradient(x-r*.38,y-r*.46,r*.08,x,y,r);rim.addColorStop(0,"#FFFDF0");rim.addColorStop(.24,"#E9DBB1");rim.addColorStop(.57,"#B99A58");rim.addColorStop(.82,"#8A692E");rim.addColorStop(1,"#4F3716");drawing.fillStyle=rim;drawing.beginPath();drawing.arc(x,y,r*(1+lift*.08),0,Math.PI*2);drawing.fill();drawing.strokeStyle="#654310";drawing.lineWidth=Math.max(1.2,r*.13);drawing.stroke();
    drawing.translate(x,y);drawing.rotate(lift*Math.PI*2.5);drawing.strokeStyle="#684711";drawing.lineWidth=Math.max(1.4,r*.19);drawing.lineCap="round";drawing.beginPath();drawing.moveTo(-r*.52,-r*.22);drawing.lineTo(r*.52,r*.22);drawing.stroke();drawing.beginPath();drawing.moveTo(-r*.22,r*.52);drawing.lineTo(r*.22,-r*.52);drawing.stroke();drawing.strokeStyle="rgba(255,255,255,.48)";drawing.lineWidth=Math.max(1,r*.07);drawing.beginPath();drawing.arc(0,0,r*.68,Math.PI*1.08,Math.PI*1.78);drawing.stroke();drawing.restore();
  };
  const paint=()=>{
    drawing.clearRect(0,0,width,height);const back=drawing.createLinearGradient(0,0,0,height);back.addColorStop(0,"#FBF6FD");back.addColorStop(.52,"#ECE5F2");back.addColorStop(1,"#DCD1E7");drawing.fillStyle=back;drawing.fillRect(0,0,width,height);
    const bay={x:originX-step*.67,y:originY-step*.67,w:step*3.34,h:step*3.34};drawing.fillStyle="rgba(69,43,79,.11)";rounded(bay,step*.34);drawing.fill();drawing.strokeStyle="rgba(255,255,255,.72)";drawing.lineWidth=2;rounded({x:bay.x+5,y:bay.y+5,w:bay.w-10,h:bay.h-10},step*.3);drawing.stroke();
    for(let row=0;row<GRID;row++)for(let col=0;col<GRID;col++){const x=holeX(col),y=holeY(row),r=step*.105;drawing.fillStyle="rgba(52,34,61,.25)";drawing.beginPath();drawing.arc(x,y+2,r,0,Math.PI*2);drawing.fill();drawing.strokeStyle="rgba(255,255,255,.45)";drawing.lineWidth=1.3;drawing.beginPath();drawing.arc(x,y,r*.78,0,Math.PI*2);drawing.stroke()}
    [...plates].sort((a,b)=>b.layer-a.layer).forEach(plate=>{if(plate.drop>1.38)return;drawPlate(plate);plate.bolts.forEach(bolt=>drawBolt(bolt,plate))});
    activePlates().forEach(plate=>plate.bolts.forEach(bolt=>{if(removed.has(bolt)||!blockerFor(bolt))return;const{x,y}=boltPoint(bolt),r=step*.17;drawing.fillStyle="rgba(34,22,40,.58)";drawing.beginPath();drawing.arc(x,y,r,0,Math.PI*2);drawing.fill();drawing.strokeStyle="rgba(255,255,255,.3)";drawing.lineWidth=2;drawing.setLineDash?.([3,3]);drawing.stroke();drawing.setLineDash?.([])}));
    drawing.fillStyle=state.done&&state.result==="success"?"#2D714C":"#55455D";drawing.font=`900 ${Math.round(width*.047)}px system-ui`;drawing.textBaseline="top";drawing.fillText(`のこり ${activePlates().length}枚`,width*.05,height*.035);
  };
  const positionButtons=()=>task.bolts.forEach(bolt=>{const button=buttons.get(bolt),point=boltPoint(bolt),size=Math.max(48,step*.52);button.style.left=`${point.x}px`;button.style.top=`${point.y}px`;button.style.width=`${size}px`;button.style.height=`${size}px`;button.disabled=state.done||removed.has(bolt)||state.busy;button.classList.toggle("aso-covered",Boolean(blockerFor(bolt)));button.classList.toggle("aso-removing",state.removing?.bolt===bolt);button.setAttribute("aria-pressed",String(state.selected===bolt));const row=Math.floor(bolt/GRID),col=bolt%GRID,names=["上","中","下"];button.setAttribute("aria-label",`${names[row]}段${["左","中央","右"][col]}のボルト${blockerFor(bolt)?"。板の下":""}`)});
  const refresh=()=>{state.remaining=activePlates().length;progress.textContent=`外したボルト ${removed.size} / ${task.bolts.length}　・　プレート ${3-state.remaining} / 3`;positionButtons();paint()};
  const resize=()=>{const rect=board.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{};width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*.92);step=Math.min(width,height)*.27;originX=(width-step*(GRID-1))/2;originY=(height-step*(GRID-1))/2+height*.03;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;board.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);refresh()};
  const finishOnce=(correct,result,delay)=>{if(state.result)return false;state.result=correct?"success":"failure";context.later(()=>{if(!state.disposed)context.finish(correct,result)},delay);return true};
  const completeDrop=plate=>{if(plate.dropComplete||state.disposed)return;plate.drop=1.45;plate.dropComplete=true;refresh();if(!activePlates().length&&plates.every(item=>!item.gone||item.dropComplete)&&!state.done){state.done=true;state.result="success";board.classList.add("aso-success");terminal.textContent="全プレート解除！";status.className="aso-status aso-success";status.textContent="3枚すべて外れました！";refresh();context.later(()=>context.finish(true,{quality:Math.max(0,Math.min(1,.78-state.order.length*.025)),detail:"3枚すべて外しました。"}),context.reducedMotion?0:850)}};
  const beginDrops=()=>plates.filter(plate=>!plate.gone&&plate.bolts.every(bolt=>removed.has(bolt))).forEach(plate=>{plate.gone=true;plate.dropStart=now();const duration=context.reducedMotion?1:560;context.later(()=>completeDrop(plate),duration)});
  const completeRemoval=bolt=>{
    if(state.disposed||state.done||state.removing?.bolt!==bolt)return false;removed.add(bolt);state.order.push(bolt);state.removing=null;state.busy=false;beginDrops();status.textContent="外れました。次のボルトを見きわめて";refresh();return true;
  };
  const pull=bolt=>{
    if(state.done||state.disposed||state.busy||removed.has(bolt)||!task.bolts.includes(bolt))return false;state.selected=bolt;const blocker=blockerFor(bolt);
    if(blocker){state.done=true;state.blocked=bolt;state.blocker=blocker.id;blocker.shakeUntil=now()+(context.reducedMotion?1:520);board.classList.add("aso-blocked");status.className="aso-status aso-error";status.textContent="板の下です。上のプレートから外してください";const point=boltPoint(bolt);impact.style.left=`${point.x}px`;impact.style.top=`${point.y}px`;refresh();finishOnce(false,{reason:"blocked",detail:"板の下のボルトでした。上に乗っている板から外します。"},context.reducedMotion?0:700);return"blocked"}
    state.busy=true;const duration=context.reducedMotion?1:360;state.removing={bolt,started:now(),duration};status.textContent="ボルトを回して引き抜いています…";refresh();context.later(()=>completeRemoval(bolt),duration);return"started";
  };
  const focusBolt=bolt=>{const button=buttons.get(bolt);if(button&&!button.disabled){state.selected=bolt;button.focus({preventScroll:true});refresh();return true}return false};
  const moveFocus=(bolt,key)=>{const row=Math.floor(bolt/GRID),col=bolt%GRID,direction={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[key];if(!direction)return false;const candidates=task.bolts.filter(item=>!removed.has(item)&&item!==bolt).map(item=>({item,row:Math.floor(item/GRID),col:item%GRID})).filter(item=>direction[0]?Math.sign(item.row-row)===direction[0]:Math.sign(item.col-col)===direction[1]).sort((a,b)=>(Math.abs(a.row-row)+Math.abs(a.col-col))-(Math.abs(b.row-row)+Math.abs(b.col-col)));return candidates.length?focusBolt(candidates[0].item):false};

  task.bolts.forEach((bolt,index)=>{const button=documentRef.createElement("button");button.type="button";button.className="aso-hit";button.textContent=String(index+1);context.listen(button,"pointerdown",event=>{event.preventDefault();pull(bolt)});context.listen(button,"click",event=>{if(event.detail===0)pull(bolt)});context.listen(button,"keydown",event=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)){event.preventDefault();moveFocus(bolt,event.key)}else if(event.key==="Home"){event.preventDefault();focusBolt(task.bolts.find(item=>!removed.has(item)))}else if(event.key==="End"){event.preventDefault();focusBolt([...task.bolts].reverse().find(item=>!removed.has(item)))}else if(event.key==="Enter"||event.key===" "){event.preventDefault();pull(bolt)}});buttons.set(bolt,button);boltLayer.append(button)});
  if(view)context.listen(view,"resize",resize,{passive:true});
  status.textContent="上のプレートから順にボルトを外します";resize();
  if(!context.reducedMotion)context.frame(time=>{if(state.disposed)return false;clock=time;plates.forEach(plate=>{if(plate.gone&&!plate.dropComplete){const elapsed=Math.max(0,clock-plate.dropStart),progressValue=Math.min(1,elapsed/560);plate.drop=progressValue*progressValue*1.45}});paint();return true});
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;state.result="timeout";board.classList.add("aso-timeout");terminal.textContent="時間切れ";status.className="aso-status aso-error";status.textContent="時間切れ。上に乗ったプレートから順に外します";refresh();context.finish(false,{reason:"timeout",detail:"時間切れ。上に乗った板から順に外します。"})});
  const qaApi={pull,completeRemoval,focus:focusBolt,blockedBolt:()=>task.bolts.find(bolt=>Boolean(blockerFor(bolt)))??null,simulate:order=>simulate(task.plates,order),inspect:()=>({removed:[...removed],order:[...state.order],done:state.done,disposed:state.disposed,busy:state.busy,selected:state.selected,blocked:state.blocked,blocker:state.blocker,remaining:activePlates().length,result:state.result,covered:task.bolts.filter(bolt=>Boolean(blockerFor(bolt))),plates:plates.map(plate=>({id:plate.id,gone:plate.gone,drop:plate.drop,dropComplete:plate.dropComplete})),status:status.textContent,canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
