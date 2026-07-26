const COLORS=Object.freeze(["#F2953F","#EA7E9B","#5FB6E0","#66C08C","#A66DC2","#F2CE4B","#7C8CC4"]);
const HELP="左右に動くブロックをタップで落とします。はみ出た分は切り落とされ、外すと失敗です。";
const MISS_THRESHOLD=.01;
const PERFECT_THRESHOLD=.012;

const metadata=Object.freeze({
  id:"timing-tower-stack-v1",
  introducedIn:"1.12",
  tier:2,
  flavor:"wild",
  step:1,
  family:"timing-tower-stack",
  category:"timing"
});

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const shade=(hex,amount)=>{
  const value=Number.parseInt(hex.slice(1),16);
  const channels=[value>>16,value>>8&255,value&255].map(channel=>Math.round(clamp(amount<0?channel*(1+amount):channel+(255-channel)*amount,0,255)));
  return`rgb(${channels.join(",")})`;
};
const hundredthIn=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max&&Math.abs(value*100-Math.round(value*100))<1e-8;

function generate({randomInt}){
  const target=randomInt(5,6);
  return{
    kind:"towerStack",
    prompt:`${target}段まで積み上げて`,
    help:HELP,
    target,
    speed:randomInt(58,74)/100,
    startWidth:randomInt(52,62)/100,
    hue:randomInt(0,COLORS.length-1),
    duration:40000
  };
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="towerStack")issues.push("kind must remain towerStack");
  if(task.target!==5&&task.target!==6)issues.push("target must be 5 or 6");
  if(task.prompt!==`${task.target}段まで積み上げて`)issues.push("prompt must match target");
  if(task.help!==HELP)issues.push("help changed");
  if(!hundredthIn(task.speed,.58,.74))issues.push("speed must be a hundredth from 0.58 to 0.74");
  if(!hundredthIn(task.startWidth,.52,.62))issues.push("startWidth must be a hundredth from 0.52 to 0.62");
  if(!Number.isInteger(task.hue)||task.hue<0||task.hue>=COLORS.length)issues.push(`hue must be an integer from 0 to ${COLORS.length-1}`);
  if(task.duration!==40000)issues.push("duration must remain 40000ms");
  return[...new Set(issues)];
}

const STYLE=`
.ats-stage{box-sizing:border-box;width:100%;max-width:430px;margin-inline:auto;padding:.25rem max(.25rem,env(safe-area-inset-left)) .2rem max(.25rem,env(safe-area-inset-right));display:grid;gap:.55rem;color:#44364c;contain:layout paint}
.ats-status{min-height:2.7em;margin:0;padding:.52rem .72rem;border:1px solid #ddcee5;border-radius:.86rem;background:linear-gradient(180deg,#fbf7fc,#efe7f4);color:#5d4b66;text-align:center;font-size:clamp(.88rem,3.7vw,.98rem);font-weight:900;line-height:1.38;box-shadow:inset 0 1px #fff}
.ats-board{position:relative;width:100%;overflow:hidden;border-radius:1.02rem;background:#e8e0ef;box-shadow:0 8px 20px rgba(45,28,55,.17),inset 0 0 0 1px rgba(255,255,255,.72);touch-action:manipulation;isolation:isolate}
.ats-canvas{display:block;width:100%;height:100%;cursor:pointer;touch-action:manipulation}.ats-canvas:focus-visible{outline:4px solid #69427d;outline-offset:-7px;border-radius:1rem}
.ats-effects{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}.ats-terminal{position:absolute;inset:0;display:grid;place-items:center;padding:1rem;background:rgba(48,28,53,.52);color:#fff;font-size:clamp(1.4rem,7vw,2rem);font-weight:950;letter-spacing:.08em;text-align:center;text-shadow:0 2px 7px rgba(0,0,0,.48);opacity:0;transform:scale(.96)}
.ats-board.ats-success{box-shadow:0 0 0 4px #ecc94a,0 13px 32px rgba(166,111,20,.34)}.ats-board.ats-success .ats-terminal{opacity:1;transform:none;place-items:start center;padding-top:.8rem;background:linear-gradient(180deg,rgba(255,248,194,.34),rgba(255,255,255,0) 34%);color:#285f42;font-size:clamp(1.15rem,5.6vw,1.55rem);text-shadow:0 1px #fff;transition:opacity .18s ease,transform .28s cubic-bezier(.2,.8,.2,1)}
.ats-board.ats-failure{box-shadow:0 0 0 4px #b34258,0 13px 30px rgba(92,28,43,.32)}.ats-board.ats-failure .ats-terminal,.ats-board.ats-timeout .ats-terminal{opacity:1;transform:none;transition:opacity .15s ease,transform .22s ease}.ats-board.ats-timeout{filter:saturate(.72);box-shadow:0 0 0 4px #80566d,0 12px 27px rgba(59,37,51,.28)}
.ats-ray{position:absolute;left:50%;top:43%;width:1.2rem;height:10rem;margin:-5rem -.6rem;border-radius:999px;background:linear-gradient(transparent,rgba(255,234,104,.85),transparent);opacity:0;transform:rotate(var(--angle)) translateY(-9rem);transform-origin:50% 50%}.ats-board.ats-success .ats-ray{animation:ats-ray .95s ease-out both;animation-delay:var(--delay)}
.ats-star{position:absolute;left:50%;top:42%;width:.72rem;height:.72rem;margin:-.36rem;background:var(--star);clip-path:polygon(50% 0,62% 34%,100% 38%,70% 61%,79% 100%,50% 78%,21% 100%,30% 61%,0 38%,38% 34%);opacity:0}.ats-board.ats-success .ats-star{animation:ats-star .92s cubic-bezier(.12,.72,.18,1) both;animation-delay:var(--delay)}
.ats-drop{box-sizing:border-box;width:100%;min-height:3rem;border:0;border-radius:.86rem;background:linear-gradient(145deg,#72458a,#4e2d62);color:#fff;font-size:.96rem;font-weight:950;letter-spacing:.05em;box-shadow:inset 0 1px rgba(255,255,255,.28),0 4px 11px rgba(70,38,85,.27);cursor:pointer;touch-action:manipulation}.ats-drop:active:not(:disabled){transform:translateY(2px);box-shadow:inset 0 1px rgba(255,255,255,.22),0 2px 5px rgba(70,38,85,.25)}.ats-drop:focus-visible{outline:4px solid #d9b6e9;outline-offset:2px}.ats-drop:disabled{opacity:.62;cursor:default}
.ats-instructions{margin:0;text-align:center;color:#76687d;font-size:.79rem;font-weight:800;line-height:1.35}.ats-stage[data-narrow=true] .ats-status{background:#fff4d8;border-color:#e2bd65;color:#775214}.ats-stage[data-result=success] .ats-status{background:#e8f7ed;border-color:#a8d7b5;color:#276143}.ats-stage[data-result=failure] .ats-status,.ats-stage[data-result=timeout] .ats-status{background:#fff0f2;border-color:#e6aab5;color:#8a2d40}
@keyframes ats-ray{0%{opacity:0;transform:rotate(var(--angle)) translateY(-5rem) scaleY(.35)}28%{opacity:.82}100%{opacity:0;transform:rotate(var(--angle)) translateY(-10rem) scaleY(1.1)}}
@keyframes ats-star{0%{opacity:0;transform:translate(0,0) scale(.25) rotate(0)}18%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.18) rotate(165deg)}}
.ats-stage[data-reduced=true] .ats-ray,.ats-stage[data-reduced=true] .ats-star{animation:none!important;display:none}.ats-stage[data-reduced=true] .ats-terminal{transition:none!important}.ats-stage[data-reduced=true] .ats-drop{transition:none!important}
@media(prefers-reduced-motion:reduce){.ats-ray,.ats-star{animation:none!important;display:none!important}.ats-terminal,.ats-drop{transition:none!important}}
`;

function render(task,context){
  const issues=validate(task);
  if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;
  if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView;
  const style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="ats-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.dataset.result="";stage.dataset.narrow="false";
  const status=documentRef.createElement("p");status.className="ats-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="ats-board";
  const canvas=documentRef.createElement("canvas");canvas.className="ats-canvas";canvas.tabIndex=0;canvas.setAttribute("role","button");canvas.setAttribute("aria-label","左右に動くブロックを落として塔を積む。タップ、Enter、またはスペースで落とす");
  const effects=documentRef.createElement("div");effects.className="ats-effects";effects.setAttribute("aria-hidden","true");
  const terminal=documentRef.createElement("strong");terminal.className="ats-terminal";
  for(let index=0;index<10;index++){
    const ray=documentRef.createElement("i");ray.className="ats-ray";ray.style.setProperty("--angle",`${index*36}deg`);ray.style.setProperty("--delay",`${index%3*28}ms`);effects.append(ray);
  }
  const starVectors=[[-128,-78],[-94,-122],[-48,-142],[-4,-126],[44,-148],[86,-112],[132,-72],[144,-16],[124,38],[82,82],[34,118],[-18,126],[-70,106],[-118,70],[-142,18],[-136,-34]];
  starVectors.forEach(([dx,dy],index)=>{const star=documentRef.createElement("i");star.className="ats-star";star.style.setProperty("--dx",`${dx}px`);star.style.setProperty("--dy",`${dy}px`);star.style.setProperty("--delay",`${index%4*24}ms`);star.style.setProperty("--star",["#F2CE4B","#FFFFFF","#66C08C","#F2953F","#5FB6E0"][index%5]);effects.append(star)});
  effects.append(terminal);board.append(canvas,effects);
  const dropButton=documentRef.createElement("button");dropButton.type="button";dropButton.className="ats-drop";dropButton.textContent="ブロックを落とす";
  const instructions=documentRef.createElement("p");instructions.className="ats-instructions";instructions.textContent="タップ / Enter / Space　・　はみ出した分だけ細くなります";
  stage.append(status,board,dropButton,instructions);context.host.replaceChildren(style,stage);

  const drawing=canvas.getContext("2d");
  if(!drawing)throw new Error(`${metadata.id}: 2D canvas is unavailable`);
  const stack=[{x:.5-task.startWidth/2,w:task.startWidth,perfect:true,cutLeft:false,cutRight:false}];
  const chips=[],sparks=[];
  const state={done:false,disposed:false,dir:1,x:.06,landing:null,miss:null,shake:0,flash:0,perfect:0,combo:0,drops:0,cuts:0,result:null,frames:0,narrow:false,cutFlash:null};
  let width=390,height=413,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1)),lastTime=null,clock=0;
  const startedAt=Number(view?.performance?.now?.())||Number(globalThis.performance?.now?.())||0;
  const now=()=>Number(view?.performance?.now?.())||Number(globalThis.performance?.now?.())||clock;
  const blockStep=()=>height*.088;
  const blockHeight=()=>height*.092;
  const baseY=()=>height*.89;
  const colorFor=index=>COLORS[(task.hue+index)%COLORS.length];
  const rounded=(x,y,w,h,r)=>{drawing.beginPath();drawing.roundRect(x,y,w,h,r)};

  const drawBlock=(block,y,color,alpha=1,rotation=0)=>{
    const x=block.x*width,w=block.w*width,h=blockHeight(),depth=Math.min(11,Math.max(5,h*.2));
    drawing.save();drawing.globalAlpha=alpha;drawing.translate(x+w/2,y-h/2);drawing.rotate(rotation);drawing.translate(-x-w/2,-y+h/2);
    drawing.fillStyle="rgba(35,20,43,.22)";rounded(x+3,y-h+4,w,h,h*.11);drawing.fill();
    drawing.fillStyle=shade(color,-.42);rounded(x,y-h+depth*.42,w,h-depth*.04,h*.1);drawing.fill();
    const body=drawing.createLinearGradient(x,y-h,x+w,y);body.addColorStop(0,shade(color,.38));body.addColorStop(.16,shade(color,.13));body.addColorStop(.55,color);body.addColorStop(1,shade(color,-.32));drawing.fillStyle=body;rounded(x,y-h,w,h-depth*.3,h*.105);drawing.fill();
    const top=drawing.createLinearGradient(x,y-h,x,y-h+depth);top.addColorStop(0,shade(color,.58));top.addColorStop(.56,shade(color,.2));top.addColorStop(1,color);drawing.fillStyle=top;drawing.beginPath();drawing.moveTo(x+h*.08,y-h+depth*.03);drawing.lineTo(x+w-h*.08,y-h+depth*.03);drawing.lineTo(x+w-h*.01,y-h+depth*.48);drawing.lineTo(x+h*.01,y-h+depth*.48);drawing.closePath();drawing.fill();
    drawing.fillStyle=shade(color,-.34);drawing.beginPath();drawing.moveTo(x+w-h*.055,y-h+depth*.05);drawing.lineTo(x+w,y-h+depth*.38);drawing.lineTo(x+w,y-depth*.14);drawing.lineTo(x+w-h*.055,y-depth*.02);drawing.closePath();drawing.fill();
    drawing.strokeStyle="rgba(255,255,255,.62)";drawing.lineWidth=Math.max(1.3,h*.045);drawing.beginPath();drawing.moveTo(x+h*.14,y-h+depth*.14);drawing.lineTo(x+w-h*.17,y-h+depth*.14);drawing.stroke();
    drawing.strokeStyle="rgba(63,37,67,.17)";drawing.lineWidth=1;for(let grain=.36;grain<.82;grain+=.22){drawing.beginPath();drawing.moveTo(x+w*.08,y-h+h*grain);drawing.bezierCurveTo(x+w*.3,y-h+h*(grain-.035),x+w*.68,y-h+h*(grain+.035),x+w*.92,y-h+h*grain);drawing.stroke()}
    drawing.fillStyle="rgba(255,246,214,.62)";for(const capX of[x+h*.18,x+w-h*.18]){drawing.beginPath();drawing.arc(capX,y-h*.27,Math.max(1.5,h*.055),0,Math.PI*2);drawing.fill()}
    if(block.active){drawing.strokeStyle="rgba(255,222,86,.82)";drawing.lineWidth=Math.max(1.6,h*.052);rounded(x-1.5,y-h-1.5,w+3,h+1.5,h*.12);drawing.stroke()} 
    if(block.cutLeft||block.cutRight){const edgeX=block.cutLeft?x:x+w;drawing.strokeStyle="#FFF0BD";drawing.lineWidth=Math.max(2,h*.07);drawing.setLineDash?.([2,3]);drawing.beginPath();drawing.moveTo(edgeX,y-h+depth*.34);drawing.lineTo(edgeX,y-depth*.16);drawing.stroke();drawing.setLineDash?.([])}
    drawing.restore();drawing.globalAlpha=1;
  };
  const drawBackdrop=()=>{
    const wall=drawing.createLinearGradient(0,0,0,height);wall.addColorStop(0,"#D6EDF5");wall.addColorStop(.48,"#E8E0F0");wall.addColorStop(1,"#D3C8DC");drawing.fillStyle=wall;drawing.fillRect(0,0,width,height);
    const light=drawing.createRadialGradient(width*.18,height*.13,0,width*.18,height*.13,width*.38);light.addColorStop(0,"rgba(255,248,203,.72)");light.addColorStop(1,"rgba(255,255,255,0)");drawing.fillStyle=light;drawing.fillRect(0,0,width,height*.58);
    drawing.strokeStyle="rgba(87,66,101,.09)";drawing.lineWidth=1;for(let x=width*.08;x<width;x+=width*.12){drawing.beginPath();drawing.moveTo(x,0);drawing.lineTo(x,baseY());drawing.stroke()}
    for(let level=1;level<=task.target;level++){const y=baseY()-level*blockStep();drawing.strokeStyle=level===task.target?"rgba(126,83,43,.38)":"rgba(83,61,96,.13)";drawing.lineWidth=level===task.target?2:1;drawing.setLineDash?.(level===task.target?[5,5]:[2,6]);drawing.beginPath();drawing.moveTo(width*.1,y);drawing.lineTo(width*.91,y);drawing.stroke();drawing.setLineDash?.([]);if(level===task.target){drawing.fillStyle="rgba(99,66,34,.76)";drawing.font=`900 ${Math.round(width*.028)}px system-ui`;drawing.textAlign="right";drawing.fillText(`目標 ${level}F`,width*.94,y+3)}}drawing.textAlign="left";
    drawing.fillStyle="rgba(64,39,72,.17)";drawing.beginPath();drawing.ellipse(width*.5,baseY()+height*.026,width*.29,height*.038,0,0,Math.PI*2);drawing.fill();
    drawing.fillStyle="rgba(71,49,79,.2)";drawing.fillRect(0,baseY()+height*.055,width,height*.12);
  };
  const drawPlatform=()=>{
    const y=baseY(),x=width*.14,w=width*.72,h=height*.055;
    drawing.fillStyle="rgba(40,25,48,.28)";rounded(x+6,y+8,w,h,h*.18);drawing.fill();
    const face=drawing.createLinearGradient(x,y,x,y+h);face.addColorStop(0,"#8C7A97");face.addColorStop(.2,"#74647E");face.addColorStop(1,"#4F4358");drawing.fillStyle=face;rounded(x,y,w,h,h*.18);drawing.fill();
    drawing.fillStyle="rgba(255,255,255,.3)";rounded(x+h*.14,y+h*.12,w-h*.28,h*.16,h*.08);drawing.fill();
    drawing.fillStyle="#403648";for(const cx of[x+w*.17,x+w*.83]){drawing.beginPath();drawing.arc(cx,y+h*.58,h*.11,0,Math.PI*2);drawing.fill()}
  };
  const addSparks=(x,y,color,count)=>{for(let index=0;index<(context.reducedMotion?4:count);index++){const angle=(index/count)*Math.PI*2+(index%3)*.18,speed=width*(.045+(index%5)*.018);sparks.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-width*.055,size:Math.max(2,width*(.005+(index%3)*.003)),color,life:1})}};
  const paint=()=>{
    drawing.clearRect(0,0,width,height);drawBackdrop();drawing.save();
    if(state.shake>0&&!context.reducedMotion){const power=state.shake*width*.015;drawing.translate(Math.sin(clock*.08)*power,Math.cos(clock*.11)*power*.55)}
    drawPlatform();
    stack.forEach((block,index)=>drawBlock(block,baseY()-index*blockStep(),colorFor(index)));
    if(state.landing){const progress=clamp((clock-state.landing.started)/state.landing.duration),ease=1-(1-progress)*(1-progress),bottom=baseY()-stack.length*blockStep()-(1-ease)*height*.19;drawBlock(state.landing.placed,bottom,colorFor(stack.length),1,0)}
    else if(state.miss){drawBlock(state.miss,baseY()-stack.length*blockStep()+state.miss.y,colorFor(stack.length),clamp(state.miss.life),state.miss.rotation)}
    else if(!state.done){const activeY=baseY()-stack.length*blockStep(),activeW=stack.at(-1).w,activeX=state.x*width;drawing.strokeStyle="rgba(83,57,92,.28)";drawing.lineWidth=2;drawing.beginPath();drawing.moveTo(activeX+activeW*width*.16,height*.025);drawing.lineTo(activeX+activeW*width*.16,activeY-blockHeight());drawing.moveTo(activeX+activeW*width*.84,height*.025);drawing.lineTo(activeX+activeW*width*.84,activeY-blockHeight());drawing.stroke();drawing.fillStyle="rgba(255,238,132,.14)";rounded(activeX-width*.014,activeY-blockHeight()-2,activeW*width+width*.028,blockHeight()+4,blockHeight()*.16);drawing.fill();drawing.strokeStyle="rgba(82,56,93,.5)";drawing.lineWidth=2.2;drawing.lineCap="round";const arrowY=activeY-blockHeight()*.5,leftX=Math.max(width*.045,activeX-width*.035),rightX=Math.min(width*.955,activeX+activeW*width+width*.035);drawing.beginPath();drawing.moveTo(leftX+7,arrowY-5);drawing.lineTo(leftX,arrowY);drawing.lineTo(leftX+7,arrowY+5);drawing.moveTo(rightX-7,arrowY-5);drawing.lineTo(rightX,arrowY);drawing.lineTo(rightX-7,arrowY+5);drawing.stroke();drawBlock({x:state.x,w:activeW,active:true},activeY,colorFor(stack.length),1,0)};
    chips.forEach(chip=>drawBlock({x:chip.x,w:chip.w},chip.y,colorFor(chip.level),clamp(chip.life),chip.rotation));
    if(state.cutFlash&&clock<state.cutFlash.until){const alpha=clamp((state.cutFlash.until-clock)/420);drawing.save();drawing.globalAlpha=alpha;drawing.strokeStyle="#FFF4B4";drawing.lineWidth=4;drawing.setLineDash?.([4,4]);drawing.beginPath();drawing.moveTo(state.cutFlash.x*width,state.cutFlash.y-blockHeight());drawing.lineTo(state.cutFlash.x*width,state.cutFlash.y+3);drawing.stroke();drawing.setLineDash?.([]);drawing.restore()}
    drawing.restore();
    sparks.forEach(spark=>{drawing.globalAlpha=clamp(spark.life);drawing.fillStyle=spark.color;drawing.beginPath();drawing.arc(spark.x,spark.y,spark.size,0,Math.PI*2);drawing.fill()});drawing.globalAlpha=1;
    if(state.flash>0){drawing.fillStyle=`rgba(255,255,255,${state.flash*.34})`;drawing.fillRect(0,0,width,height)}
    if(state.perfect>0){drawing.globalAlpha=clamp(state.perfect);drawing.fillStyle="#286945";drawing.font=`950 ${Math.round(width*.066)}px system-ui`;drawing.textAlign="center";drawing.fillText("ピッタリ！",width/2,height*.16);drawing.textAlign="left";drawing.globalAlpha=1}
    if(state.done&&state.result==="success"){const top=stack.at(-1),flagX=(top.x+top.w/2)*width,flagY=baseY()-(stack.length-1)*blockStep()-blockHeight();drawing.strokeStyle="#5A3C33";drawing.lineWidth=4;drawing.beginPath();drawing.moveTo(flagX,flagY);drawing.lineTo(flagX,flagY-height*.13);drawing.stroke();drawing.fillStyle="#F2CE4B";drawing.beginPath();drawing.moveTo(flagX,flagY-height*.13);drawing.lineTo(flagX+width*.11,flagY-height*.1);drawing.lineTo(flagX,flagY-height*.065);drawing.closePath();drawing.fill()}
  };
  const refreshStatus=message=>{
    status.textContent=message||`${stack.length-1} / ${task.target}段。狙って落としてください`;
    dropButton.disabled=state.done||Boolean(state.landing);
    stage.dataset.narrow=String(state.narrow&&!state.done);
    stage.dataset.result=state.result||"";
    canvas.setAttribute("aria-label",`${stack.length-1}/${task.target}段。${state.done?status.textContent:"動くブロックを落とす"}`);
  };
  const resize=()=>{
    const rect=board.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{};
    width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*1.06);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;board.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);paint();
  };
  const terminalFinish=(correct,result,delay)=>{
    if(state.disposed)return false;
    context.later(()=>{if(!state.disposed)context.finish(correct,result)},delay);return true;
  };
  const completeLanding=landing=>{
    if(state.disposed||state.done||state.landing!==landing)return false;
    stack.push({...landing.placed});state.landing=null;state.drops++;state.shake=Math.max(state.shake,.32);state.flash=Math.max(state.flash,.18);
    const impactX=(landing.placed.x+landing.placed.w/2)*width,impactY=baseY()-(stack.length-1)*blockStep();addSparks(impactX,impactY,landing.perfect?"#F5D865":"#FFF1BC",landing.perfect?22:12);
    if(stack.length-1>=task.target){
      state.done=true;state.result="success";board.classList.add("ats-success");terminal.textContent="塔が完成！";refreshStatus(`${task.target}段の塔が完成！${state.combo?` ピッタリ${state.combo}回。`:""}`);addSparks(impactX,impactY,"#F2CE4B",34);
      const elapsed=Math.max(0,now()-startedAt);terminalFinish(true,{reason:"target",quality:clamp(.5+state.combo*.12-elapsed/task.duration*.2),detail:`${task.target}段まで積みました。${state.combo?`ピッタリ${state.combo}回。`:""}`},context.reducedMotion?0:850);
    }else{
      state.x=stack.length%2===0?.04:1-landing.placed.w-.04;state.dir=state.x<.5?1:-1;refreshStatus(landing.perfect?`ピッタリ！ ${stack.length-1}/${task.target}段`:`はみ出しを切断。残り幅 ${Math.round(landing.placed.w*100)}%`);
    }
    paint();return true;
  };
  const drop=()=>{
    if(state.done||state.disposed||state.landing)return false;
    const below=stack.at(-1),x=state.x,w=below.w,left=Math.max(x,below.x),right=Math.min(x+w,below.x+below.w),overlap=right-left;
    if(overlap<=MISS_THRESHOLD){
      state.done=true;state.result="failure";state.shake=1;state.flash=.62;state.miss={x,w,y:0,vy:-height*.025,rotation:0,spin:x<below.x?-3.4:3.4,life:1};board.classList.add("ats-failure");terminal.textContent="塔から外れた！";refreshStatus(`${stack.length-1}段で外しました。塔から離れています`);addSparks(clamp(x+w/2)*width,baseY()-stack.length*blockStep(),"#EA7E9B",24);terminalFinish(false,{reason:"miss",detail:`${stack.length-1}段で外しました。`},context.reducedMotion?0:760);paint();return"miss";
    }
    const perfect=Math.abs(x-below.x)<PERFECT_THRESHOLD;
    if(perfect){state.perfect=1;state.combo++}else state.combo=0;
    const placed={x:left,w:perfect?below.w:overlap,perfect,cutLeft:!perfect&&x<below.x,cutRight:!perfect&&x+w>below.x+below.w};
    const y=baseY()-stack.length*blockStep();
    if(!perfect){
      state.cuts++;
      if(x<below.x)chips.push({x,w:below.x-x,y,vy:-height*.02,rotation:0,spin:-3.3,life:1,level:stack.length});
      if(x+w>below.x+below.w)chips.push({x:below.x+below.w,w:(x+w)-(below.x+below.w),y,vy:-height*.02,rotation:0,spin:3.3,life:1,level:stack.length});
      const cutX=placed.cutLeft?placed.x:placed.x+placed.w;state.cutFlash={x:cutX,y,until:now()+(context.reducedMotion?1:420)};addSparks(cutX*width,y-blockHeight()*.35,"#FFF0A4",10);
    }
    state.narrow=placed.w<.12;const duration=context.reducedMotion?1:190,landing={placed,perfect,started:now(),duration};state.landing=landing;refreshStatus(perfect?"中心がそろいました。着地中…":state.narrow?"ぎりぎり残りました。細い塔を立て直して":"はみ出した部分を切り落としています…");paint();context.later(()=>completeLanding(landing),duration);return perfect?"perfect":"trim";
  };
  const setX=value=>{if(state.done||state.disposed||state.landing||!Number.isFinite(value))return false;state.x=clamp(value,-1,2);paint();return true};
  const align=()=>setX(stack.at(-1).x);
  const advanceMotion=(dt,current,countFrame)=>{
    clock=current;if(countFrame)state.frames++;
    state.shake=Math.max(0,state.shake-dt*2.5);state.flash=Math.max(0,state.flash-dt*2.2);state.perfect=Math.max(0,state.perfect-dt*1.25);
    if(!state.done&&!state.landing){const movingWidth=stack.at(-1).w,speed=(task.speed+(stack.length-1)*.06)*(context.reducedMotion?.7:1);state.x+=state.dir*speed*dt;if(state.x<.03){state.x=.03;state.dir=1}if(state.x+movingWidth>.97){state.x=.97-movingWidth;state.dir=-1}}
    if(state.miss){state.miss.vy+=height*1.7*dt;state.miss.y+=state.miss.vy*dt;state.miss.rotation+=state.miss.spin*dt;state.miss.life=Math.max(0,state.miss.life-dt*.65)}
    for(let index=chips.length-1;index>=0;index--){const chip=chips[index];chip.life-=dt*1.05;if(chip.life<=0){chips.splice(index,1);continue}chip.vy+=height*1.65*dt;chip.y+=chip.vy*dt;chip.rotation+=chip.spin*dt}
    for(let index=sparks.length-1;index>=0;index--){const spark=sparks[index];spark.life-=dt*1.65;if(spark.life<=0){sparks.splice(index,1);continue}spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=width*.62*dt}
    paint();return true;
  };
  const tick=time=>{
    if(state.disposed)return false;const current=Number(time)||now();if(lastTime===null)lastTime=current;const dt=clamp((current-lastTime)/1000,0,.05);lastTime=current;return advanceMotion(dt,current,true);
  };
  const reducedStep=()=>{
    if(state.disposed||state.done)return;advanceMotion(.12,now(),false);if(!state.disposed&&!state.done)context.later(reducedStep,120);
  };
  const activate=event=>{event?.preventDefault?.();drop()};
  context.listen(canvas,"pointerdown",activate);context.listen(dropButton,"pointerdown",activate);
  context.listen(dropButton,"click",event=>{if(event.detail===0)activate(event)});
  context.listen(canvas,"keydown",event=>{if(event.key==="Enter"||event.key===" ")activate(event)});
  context.listen(dropButton,"keydown",event=>{if(event.key==="ArrowUp"){event.preventDefault();canvas.focus({preventScroll:true})}});
  if(view)context.listen(view,"resize",resize,{passive:true});
  refreshStatus();resize();canvas.focus({preventScroll:true});
  if(!context.reducedMotion)context.frame(tick);
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;state.result="timeout";board.classList.add("ats-timeout");terminal.textContent="時間切れ";refreshStatus(`時間切れ。${stack.length-1}段まででした`);paint();context.finish(false,{reason:"timeout",detail:`時間切れ。${stack.length-1}段まででした。`})});
  if(context.reducedMotion)context.later(reducedStep,120);
  const qaApi={drop,setX,align,completeLanding:()=>state.landing?completeLanding(state.landing):false,paint,inspect:()=>({stack:stack.map(block=>({...block})),x:state.x,dir:state.dir,landing:state.landing?{placed:{...state.landing.placed},perfect:state.landing.perfect}:null,miss:state.miss?{...state.miss}:null,done:state.done,disposed:state.disposed,result:state.result,combo:state.combo,drops:state.drops,cuts:state.cuts,narrow:state.narrow,frames:state.frames,chips:chips.map(chip=>({...chip})),sparks:sparks.length,status:status.textContent,canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr},viewport:{...context.viewport}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
