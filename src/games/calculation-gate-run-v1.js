const INTRO_MS=2900;
const ROWS=3;
const PATH_COUNT=1<<ROWS;
const DURATION=35000;
const MAX_ATTEMPTS=400;
const metadata=Object.freeze({
  id:"calculation-gate-run-v1",
  introducedIn:"1.6",
  tier:2,
  flavor:"wild",
  step:1,
  family:"calculation-gate-run",
  category:"calculation"
});

const PROMPT="軍団を増やして敵を倒せ";
const HELP="門を選ぶと兵の数が変わります。最後の敵より多ければ勝ちです。";
const OP_KINDS=Object.freeze(["add","mul","sub","div"]);
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const cloneOp=op=>({kind:op.kind,value:op.value});
const cloneGates=gates=>gates.map(pair=>pair.map(cloneOp));
const samePath=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===ROWS&&a.every((lane,index)=>lane===b[index]);

function applyGate(count,op){
  if(op.kind==="add")return count+op.value;
  if(op.kind==="mul")return count*op.value;
  if(op.kind==="sub")return Math.max(0,count-op.value);
  return Math.floor(count/op.value);
}

function enumeratePaths(start,gates){
  const paths=[];
  for(let mask=0;mask<PATH_COUNT;mask++){
    let count=start;
    const choice=[];
    for(let row=0;row<ROWS;row++){
      const lane=(mask>>row)&1;
      choice.push(lane);
      count=applyGate(count,gates[row][lane]);
    }
    paths.push({choice,count});
  }
  return paths;
}

function makeOperation(kind,randomInt){
  if(kind==="add")return{kind,value:randomInt(4,18)};
  if(kind==="mul")return{kind,value:randomInt(2,3)};
  if(kind==="sub")return{kind,value:randomInt(3,14)};
  return{kind,value:2};
}

function taskFrom(start,gates,enemy,best,answer){
  return{kind:"gateRun",prompt:PROMPT,help:HELP,start,gates:cloneGates(gates),enemy,best,answer:[...answer],duration:DURATION};
}

function generate({randomInt,shuffle}={}){
  if(typeof randomInt!=="function"||typeof shuffle!=="function")throw new TypeError(`${metadata.id}: randomInt and shuffle are required`);
  for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
    const start=randomInt(6,14),gates=[];
    for(let row=0;row<ROWS;row++){
      const kinds=shuffle(OP_KINDS);
      if(!Array.isArray(kinds)||kinds.length<2)throw new TypeError(`${metadata.id}: shuffle must return an array`);
      gates.push(kinds.slice(0,2).map(kind=>makeOperation(kind,randomInt)));
    }
    const paths=enumeratePaths(start,gates),counts=paths.map(path=>path.count),best=Math.max(...counts),worst=Math.min(...counts);
    if(best<12||best-worst<10)continue;
    const enemy=Math.round(best*.72),winners=paths.filter(path=>path.count>enemy);
    if(winners.length<1||winners.length>2)continue;
    return taskFrom(start,gates,enemy,best,winners[0].choice);
  }
  const gates=[[{kind:"mul",value:3},{kind:"sub",value:5}],[{kind:"add",value:12},{kind:"div",value:2}],[{kind:"mul",value:2},{kind:"add",value:4}]];
  return taskFrom(8,gates,40,72,[0,0,0]);
}

function validOperation(op){
  if(!op||typeof op!=="object"||!OP_KINDS.includes(op.kind)||!Number.isInteger(op.value))return false;
  if(op.kind==="add")return op.value>=4&&op.value<=18;
  if(op.kind==="mul")return op.value>=2&&op.value<=3;
  if(op.kind==="sub")return op.value>=3&&op.value<=14;
  return op.value===2;
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="gateRun")issues.push("kind must remain gateRun");
  if(task.prompt!==PROMPT)issues.push("prompt changed");
  if(task.help!==HELP)issues.push("help changed");
  if(!Number.isInteger(task.start)||task.start<6||task.start>14)issues.push("start must be an integer from 6 to 14");
  if(!Array.isArray(task.gates)||task.gates.length!==ROWS)issues.push(`gates must contain ${ROWS} rows`);
  const gates=Array.isArray(task.gates)?task.gates:[];
  gates.forEach((pair,row)=>{
    if(!Array.isArray(pair)||pair.length!==2){issues.push(`gate row ${row+1} must contain two lanes`);return}
    if(pair.some(op=>!validOperation(op)))issues.push(`gate row ${row+1} contains an invalid operation`);
    if(pair.every(validOperation)&&pair[0].kind===pair[1].kind)issues.push(`gate row ${row+1} must use two operation kinds`);
  });
  if(!Number.isInteger(task.enemy)||task.enemy<0)issues.push("enemy must be a non-negative integer");
  if(!Number.isInteger(task.best)||task.best<0)issues.push("best must be a non-negative integer");
  if(!Array.isArray(task.answer)||task.answer.length!==ROWS||task.answer.some(lane=>lane!==0&&lane!==1))issues.push("answer must contain three lane choices");
  if(task.duration!==DURATION)issues.push(`duration must remain ${DURATION}ms`);
  if(!issues.length){
    const paths=enumeratePaths(task.start,gates);
    if(paths.length!==PATH_COUNT)issues.push(`exactly ${PATH_COUNT} paths are required`);
    const best=Math.max(...paths.map(path=>path.count)),winners=paths.filter(path=>path.count>task.enemy);
    if(task.best!==best)issues.push("best does not match exhaustive path enumeration");
    if(winners.length<1||winners.length>2)issues.push("task must have one or two winning paths");
    if(!winners.some(path=>samePath(path.choice,task.answer)))issues.push("answer is not a winning path");
    else if(!samePath(winners[0].choice,task.answer))issues.push("answer must remain the first enumerated winning path");
  }
  return[...new Set(issues)];
}

const labelFor=op=>op.kind==="add"?`＋${op.value}`:op.kind==="mul"?`×${op.value}`:op.kind==="sub"?`−${op.value}`:`÷${op.value}`;
const STYLE=`
.cgr-stage{box-sizing:border-box;width:100%;max-width:430px;margin-inline:auto;display:grid;gap:.55rem;justify-items:center;contain:layout paint;color:#392f40}
.cgr-stage:focus-visible{outline:3px solid #6b4384;outline-offset:3px;border-radius:1rem}
.cgr-canvas{box-sizing:border-box;display:block;max-width:100%;border-radius:1rem;background:#e8eef8;box-shadow:0 8px 22px rgba(49,30,58,.16);touch-action:none}
.cgr-status{box-sizing:border-box;width:100%;min-height:1.4rem;margin:0;text-align:center;color:#5d4d67;font-size:clamp(.82rem,3.6vw,.96rem);font-weight:850;line-height:1.35}
.cgr-pad{box-sizing:border-box;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:.45rem}
.cgr-key{box-sizing:border-box;min-width:0;min-height:3rem;border:1.5px solid #d8cadf;border-radius:.9rem;background:#fff;color:#5c3674;font:900 clamp(.9rem,4vw,1rem)/1.15 system-ui,sans-serif;box-shadow:0 3px 10px rgba(49,30,58,.08);touch-action:manipulation}
.cgr-key[aria-pressed=true]{border-color:#6b4384;background:#f0e6f6;box-shadow:inset 0 0 0 2px #6b4384}
.cgr-key:focus-visible{outline:4px solid #5c3f78;outline-offset:2px}
.cgr-key:active{transform:translateY(2px);box-shadow:none}
.cgr-stage[data-reduced=true] .cgr-key{transition:none}
@media(max-width:400px){.cgr-stage{gap:.42rem}.cgr-key{min-height:2.85rem}}
@media(prefers-reduced-motion:reduce){.cgr-key{transition:none!important}}
`;

function render(task,context){
  const issues=validate(task);
  if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;
  if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView||globalThis;
  const style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="cgr-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.tabIndex=0;stage.setAttribute("aria-label","上下三組の計算門を選んで軍団を増やすゲーム");
  const canvas=documentRef.createElement("canvas");canvas.className="cgr-canvas";canvas.setAttribute("role","img");canvas.setAttribute("aria-label","軍団が計算門へ向かって走っています");
  const status=documentRef.createElement("p");status.className="cgr-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const pad=documentRef.createElement("div");pad.className="cgr-pad";
  const buttons=[0,1].map(lane=>{const button=documentRef.createElement("button");button.type="button";button.className="cgr-key";button.textContent=lane===0?"▲":"▼";button.setAttribute("aria-label",lane===0?"上の門を選ぶ":"下の門を選ぶ");pad.append(button);return button});
  stage.append(canvas,status,pad);context.host.replaceChildren(style,stage);
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error(`${metadata.id}: 2D canvas is unavailable`);

  const paths=enumeratePaths(task.start,task.gates),state={count:task.start,lane:0,row:0,distance:0,elapsed:0,revealed:false,done:false,disposed:false,result:null,shake:0,flash:0,pop:0,frames:0};
  const sparks=[];
  const troops=Array.from({length:60},(_,index)=>({ox:(index*.61803398875)%1,oy:(index*.75487766625+.17)%1,phase:(index*2.39996323)%6.28}));
  let W=0,H=0,dpr=1,lastFrame=null,stopAnimation=null;
  const laneY=lane=>H*(lane?.68:.36),gateX=row=>W*(.8+row*.66-state.distance),enemyX=()=>W*(.8+ROWS*.66+.45-state.distance);

  const resize=()=>{
    const measured=stage.getBoundingClientRect?.().width||stage.clientWidth||context.viewport?.width||320;
    W=clamp(Math.round(measured),240,430);H=Math.round(W*.76);dpr=clamp(Number(context.viewport?.dpr||view.devicePixelRatio||1),1,3);
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const drawCrowd=(x,y,count,colors,scale=1)=>{
    const shown=Math.min(count,60),rows=Math.max(2,Math.ceil(Math.sqrt(shown*.58))),columns=Math.ceil(shown/rows),unit=W*.0195*scale,stepX=unit*1.62,stepY=unit*1.48;
    for(let index=0;index<shown;index++){
      const troop=troops[index],row=Math.floor(index/columns),column=index%columns,rowCount=Math.min(columns,shown-row*columns),cx=x+(column-(rowCount-1)/2)*stepX+(troop.ox-.5)*unit*.25,cy=y+(row-(rows-1)/2)*stepY+(troop.oy-.5)*unit*.18+Math.sin(state.elapsed/1000*7+troop.phase)*unit*.12;
      ctx.fillStyle="rgba(30,18,44,.1)";ctx.beginPath();ctx.ellipse(cx,cy+unit*1.08,unit*.66,unit*.22,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=colors.body;ctx.beginPath();ctx.ellipse(cx,cy,unit*.72,unit*.9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=colors.head;ctx.beginPath();ctx.arc(cx,cy-unit*1.05,unit*.62,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#241814";ctx.beginPath();ctx.arc(cx-unit*.2,cy-unit*1.1,unit*.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+unit*.2,cy-unit*1.1,unit*.12,0,Math.PI*2);ctx.fill();
    }
  };
  const drawBadge=(x,y,text,colors,size)=>{
    ctx.fillStyle=colors[0];ctx.beginPath();ctx.roundRect(x-size*1.5,y-size*.6,size*3,size*1.2,size*.6);ctx.fill();ctx.strokeStyle=colors[1];ctx.lineWidth=Math.max(1,size*.12);ctx.stroke();
    ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(size*.95)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,x,y);ctx.textAlign="left";
  };
  const drawGate=(row)=>{
    const x=gateX(row);if(row!==state.row||x<-W*.3||x>W*1.08)return;
    ctx.save();ctx.globalAlpha=clamp((1.08-x/W)/.18,0,1);
    task.gates[row].forEach((op,lane)=>{
      const y=laneY(lane),h=H*.26,w=W*.16,positive=op.kind==="add"||op.kind==="mul",gradient=ctx.createLinearGradient(x-w/2,y-h/2,x+w/2,y+h/2);
      gradient.addColorStop(0,positive?"rgba(102,192,140,.88)":"rgba(234,126,155,.88)");gradient.addColorStop(1,positive?"rgba(46,122,84,.94)":"rgba(168,65,106,.94)");ctx.fillStyle=gradient;
      ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,W*.02);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.78)";ctx.lineWidth=Math.max(2,W*.008);ctx.stroke();
      if(state.revealed){ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(W*.075)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(labelFor(op),x,y);ctx.textAlign="left"}
    });ctx.restore();
  };
  const paint=()=>{
    ctx.clearRect(0,0,W,H);ctx.save();
    if(state.shake>0&&!context.reducedMotion){const power=state.shake*W*.012;ctx.translate(Math.sin(state.elapsed*.09)*power,Math.cos(state.elapsed*.07)*power)}
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#dcebf9");sky.addColorStop(.5,"#efe4f8");sky.addColorStop(1,"#cde6d6");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="rgba(255,255,255,.54)";ctx.fillRect(0,H*.5-2,W,4);
    const roadDistance=state.distance+(state.revealed?0:state.elapsed/1000*.08);
    for(let index=0;index<12;index++){const x=((index*W*.24-roadDistance*W*.6)%(W*1.4)+W*1.4)%(W*1.4)-W*.2,depth=.45+.55*(1-clamp(x/W,0,1));ctx.fillStyle="rgba(122,84,150,.06)";ctx.beginPath();ctx.ellipse(x,H*.5,W*.075*depth,H*.022*depth,0,0,Math.PI*2);ctx.fill()}
    task.gates.forEach((pair,row)=>drawGate(row));
    const worldFoeX=enemyX(),resulting=Boolean(state.result),heroX=resulting?W*.27:W*.22,foeX=resulting?W*.73:worldFoeX,battleBlend=resulting?1:clamp((state.distance-2.45)/.42,0,1),heroY=resulting?H*.62:laneY(state.lane)*(1-battleBlend)+H*.55*battleBlend,foeY=resulting?H*.62:H*.52;
    if(worldFoeX<=W*1.5||resulting){drawCrowd(foeX,foeY,task.enemy,{body:"#6b4e8f",head:"#8e6bd0"});if(state.revealed)drawBadge(foeX,resulting?H*.3:H*.28,String(task.enemy),["#4a2a72","#b79be0"],W*.06)}
    drawCrowd(heroX,heroY,state.count,{body:"#c06a26",head:"#f0a25a"},1.08+state.pop*.12);if(state.revealed)drawBadge(heroX,resulting?H*.3:heroY-H*.18,String(state.count),["#8c5a1e","#ffd9a0"],W*.06);
    sparks.forEach(spark=>{ctx.globalAlpha=clamp(spark.life,0,1);ctx.fillStyle=spark.color;ctx.beginPath();ctx.arc(spark.x,spark.y,spark.size,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1});
    if(state.flash>0&&!context.reducedMotion){ctx.fillStyle=`rgba(255,255,255,${state.flash*.5})`;ctx.fillRect(0,0,W,H)}ctx.restore();
    if(state.result&&state.revealed){const color=state.result==="win"?"rgba(46,122,84,.94)":"rgba(168,65,106,.94)";ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(W*.31,H*.035,W*.38,H*.16,H*.07);ctx.fill();ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(W*.09)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(state.result==="win"?"勝った！":"負け…",W/2,H*.115);ctx.textAlign="left"}
  };
  const burst=(x,y,color,count)=>{if(context.reducedMotion)return;for(let index=0;index<count;index++){const angle=index/count*Math.PI*2,speed=W*(.05+(index%5)*.018);sparks.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-W*.05,size:W*(.006+(index%4)*.002),color,life:1})}};
  const updateButtons=()=>buttons.forEach((button,lane)=>button.setAttribute("aria-pressed",String(state.lane===lane)));
  const setLane=(lane,focus=false)=>{if(state.done||state.disposed||lane!==0&&lane!==1)return false;state.lane=lane;updateButtons();if(focus)buttons[lane].focus({preventScroll:true});paint();return true};
  const reveal=()=>{if(state.revealed||state.done||state.disposed)return;state.revealed=true;buttons[0].textContent="▲ 上の門";buttons[1].textContent="▼ 下の門";status.textContent="上か下の門を選んでください";paint()};
  const crossGate=()=>{
    if(state.row>=ROWS||state.done)return;
    const op=task.gates[state.row][state.lane],before=state.count;state.count=applyGate(state.count,op);state.row++;state.pop=1;state.flash=.45;state.shake=.35;status.textContent=`${labelFor(op)} の門で ${before}人 → ${state.count}人`;burst(W*.22,laneY(state.lane),state.count>=before?"#7fd08c":"#ea7e9b",18);
  };
  const complete=()=>{
    if(state.done||state.disposed)return;state.done=true;state.shake=1;state.flash=.7;burst(W*.3,H*.5,"#ffd9a0",30);const won=state.count>task.enemy;state.result=won?"win":"lose";status.textContent=won?`${state.count}対${task.enemy}で勝利`:`${state.count}対${task.enemy}で敗北`;paint();
    const detail=won?`${state.count}対${task.enemy}で勝利。最大は${task.best}人でした。`:`${state.count}対${task.enemy}で敗北。${task.best}人まで増やせる道がありました。`;
    context.later(()=>context.finish(won,{quality:won?clamp(.6-state.elapsed/DURATION*.3,0,1):0,detail}),context.reducedMotion?0:1100);
  };
  const animateSparks=dt=>{state.shake=Math.max(0,state.shake-dt*2.5);state.flash=Math.max(0,state.flash-dt*2);state.pop=Math.max(0,state.pop-dt*3);for(let index=sparks.length-1;index>=0;index--){const spark=sparks[index];spark.life-=dt*1.6;if(spark.life<=0){sparks.splice(index,1);continue}spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=W*.6*dt}};
  const tick=now=>{
    if(state.disposed)return false;
    if(lastFrame===null)lastFrame=now;
    const dt=Math.min(Math.max((now-lastFrame)/1000,0),.05);lastFrame=now;state.elapsed+=dt*1000;state.frames++;animateSparks(dt);
    if(state.revealed&&!state.done){state.distance+=.36*dt;while(state.row<ROWS&&gateX(state.row)<=W*.22)crossGate();if(state.row>=ROWS&&enemyX()<=W*.29)complete()}
    paint();return!state.done||sparks.length>0;
  };

  buttons.forEach((button,lane)=>{
    context.listen(button,"pointerdown",event=>{event.preventDefault();setLane(lane)});
    context.listen(button,"click",event=>{if(event.detail===0)setLane(lane,true)});
  });
  context.listen(canvas,"pointerdown",event=>{event.preventDefault();const rect=canvas.getBoundingClientRect();setLane(event.clientY-rect.top<rect.height/2?0:1)});
  context.listen(stage,"keydown",event=>{if(event.key==="ArrowUp"||event.key==="ArrowDown"){event.preventDefault();setLane(event.key==="ArrowUp"?0:1,true)}});
  if(view&&typeof view.dispatchEvent==="function")context.listen(view,"resize",()=>{resize();paint()},{passive:true});

  resize();updateButtons();paint();stage.focus({preventScroll:true});context.later(reveal,INTRO_MS);
  if(context.reducedMotion){
    const advance=()=>{if(state.done||state.disposed)return;if(state.row<ROWS){crossGate();paint();context.later(advance,950)}else complete()};
    context.later(()=>{reveal();context.later(advance,950)},INTRO_MS);
  }else stopAnimation=context.frame(tick);
  context.setDeadline(DURATION,()=>{if(state.done||state.disposed)return;state.done=true;state.result="lose";status.textContent="時間切れです";paint();context.finish(false,{detail:"時間切れです。"})});

  const showScene=(scene,path=task.answer)=>{
    if(state.disposed||!context.qa)return false;
    stopAnimation?.();state.count=task.start;state.lane=0;state.row=0;state.distance=0;state.elapsed=0;state.revealed=false;state.done=false;state.result=null;state.shake=0;state.flash=0;state.pop=0;sparks.length=0;buttons[0].textContent="▲";buttons[1].textContent="▼";status.textContent="";
    if(scene!=="intro")reveal();
    const crossed=scene==="count-change"?1:["enemy","success","failure"].includes(scene)?ROWS:0;
    for(let row=0;row<crossed;row++){state.lane=path[row]??0;state.count=applyGate(state.count,task.gates[row][state.lane]);state.row++}
    if(scene==="pre-gate")state.distance=.5;
    else if(scene==="count-change"){state.distance=.72;state.pop=.8;status.textContent=`人数が ${state.count}人に変わりました`}
    else if(scene==="enemy"){state.distance=2.65;status.textContent=`${state.count}人で敵${task.enemy}人へ進軍`}
    else if(scene==="success"||scene==="failure"){state.distance=3;state.result=state.count>task.enemy?"win":"lose";status.textContent=state.result==="win"?`${state.count}対${task.enemy}で勝利`:`${state.count}対${task.enemy}で敗北`}
    state.done=true;updateButtons();paint();return true;
  };
  const qaApi={setLane,showScene,paths:()=>paths.map(path=>({choice:[...path.choice],count:path.count})),inspect:()=>({count:state.count,lane:state.lane,row:state.row,revealed:state.revealed,done:state.done,disposed:state.disposed,result:state.result,frames:state.frames,status:status.textContent,canvas:{cssWidth:W,cssHeight:H,pixelWidth:canvas.width,pixelHeight:canvas.height,dpr},viewport:{...context.viewport}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;stopAnimation?.();if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
