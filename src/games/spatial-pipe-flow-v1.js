const SIZE=4;
const DURATION=70000;
const MAX_ATTEMPTS=200;
const DIRS=Object.freeze([{dr:-1,dc:0},{dr:0,dc:1},{dr:1,dc:0},{dr:0,dc:-1}]);
const PROMPT="水を通せ";
const HELP="パイプをタップすると回ります。左の水源から右のゴールまでつなげてください。";
const LEGACY_FALLBACK_HELP="パイプをタップすると回ります。";
const metadata=Object.freeze({id:"spatial-pipe-flow-v1",introducedIn:"1.10",tier:2,flavor:"satisfying",step:1,family:"spatial-pipe-flow",category:"spatial"});
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const keyOf=(r,c)=>`${r},${c}`;
const cloneCells=cells=>cells.map(cell=>({r:cell.r,c:cell.c,mask:cell.mask,turn:cell.turn,role:cell.role}));
const hasOpening=(cell,dir)=>((cell.mask>>((dir+4-cell.turn)%4))&1)===1;

function connected(cells,size=SIZE){
  const source=cells.find(cell=>cell.role==="source"),goal=cells.find(cell=>cell.role==="goal");
  if(!source||!goal)return{ok:false,lit:new Set()};
  const byKey=new Map(cells.map(cell=>[keyOf(cell.r,cell.c),cell])),lit=new Set([keyOf(source.r,source.c)]),stack=[source];
  while(stack.length){
    const cell=stack.pop();
    DIRS.forEach((step,dir)=>{
      if(!hasOpening(cell,dir))return;
      const r=cell.r+step.dr,c=cell.c+step.dc;if(r<0||r>=size||c<0||c>=size)return;
      const next=byKey.get(keyOf(r,c));if(!next||!hasOpening(next,(dir+2)%4))return;
      const key=keyOf(r,c);if(lit.has(key))return;lit.add(key);stack.push(next);
    });
  }
  return{ok:lit.has(keyOf(goal.r,goal.c)),lit};
}

function solvedRoute(cells,size=SIZE){
  const solved=cloneCells(cells).map(cell=>({...cell,turn:0})),source=solved.find(cell=>cell.role==="source"),goal=solved.find(cell=>cell.role==="goal");
  if(!source||!goal)return[];
  const byKey=new Map(solved.map(cell=>[keyOf(cell.r,cell.c),cell])),queue=[source],parents=new Map([[keyOf(source.r,source.c),null]]);
  for(let cursor=0;cursor<queue.length;cursor++){
    const cell=queue[cursor];if(cell.r===goal.r&&cell.c===goal.c)break;
    DIRS.forEach((step,dir)=>{if(!hasOpening(cell,dir))return;const next=byKey.get(keyOf(cell.r+step.dr,cell.c+step.dc));if(!next||!hasOpening(next,(dir+2)%4))return;const key=keyOf(next.r,next.c);if(parents.has(key))return;parents.set(key,keyOf(cell.r,cell.c));queue.push(next)});
  }
  const goalKey=keyOf(goal.r,goal.c);if(!parents.has(goalKey))return[];
  const route=[];for(let key=goalKey;key;key=parents.get(key)){const cell=byKey.get(key);route.push({r:cell.r,c:cell.c})}return route.reverse();
}

function generate({randomInt,shuffle}={}){
  if(typeof randomInt!=="function"||typeof shuffle!=="function")throw new TypeError(`${metadata.id}: randomInt and shuffle are required`);
  for(let attempt=0;attempt<MAX_ATTEMPTS;attempt++){
    const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)cells.push({r,c,mask:0,turn:0,role:"empty"});
    const byKey=new Map(cells.map(cell=>[keyOf(cell.r,cell.c),cell])),at=(r,c)=>byKey.get(keyOf(r,c)),start={r:randomInt(0,SIZE-1),c:0},visited=new Set([keyOf(start.r,0)]),route=[start];
    let current=start,length=0;
    while(length<12){
      const options=shuffle([0,1,1,2,3]).map(dir=>({dir,r:current.r+DIRS[dir].dr,c:current.c+DIRS[dir].dc})).filter(next=>next.r>=0&&next.r<SIZE&&next.c>=0&&next.c<SIZE&&!visited.has(keyOf(next.r,next.c)));
      if(!options.length)break;const next=options[0];at(current.r,current.c).mask|=1<<next.dir;at(next.r,next.c).mask|=1<<((next.dir+2)%4);visited.add(keyOf(next.r,next.c));current={r:next.r,c:next.c};route.push(current);length++;if(current.c===SIZE-1&&route.length>=6)break;
    }
    if(current.c!==SIZE-1||route.length<6)continue;at(start.r,start.c).role="source";at(current.r,current.c).role="goal";
    cells.filter(cell=>!cell.mask).slice(0,4).forEach(cell=>{const dir=randomInt(0,3),r=cell.r+DIRS[dir].dr,c=cell.c+DIRS[dir].dc;if(r<0||r>=SIZE||c<0||c>=SIZE)return;const other=at(r,c);if(other.role!=="empty"||!other.mask)return;cell.mask|=1<<dir});
    let scrambled=0;cells.forEach(cell=>{if(!cell.mask)return;cell.turn=randomInt(0,3);if(cell.turn)scrambled++});
    if(scrambled<4||connected(cells).ok)continue;const solved=cloneCells(cells).map(cell=>({...cell,turn:0}));if(!connected(solved).ok)continue;
    return{kind:"pipeFlow",prompt:PROMPT,help:HELP,cells:cloneCells(cells),size:SIZE,duration:DURATION};
  }
  const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)cells.push({r,c,mask:0,turn:0,role:"empty"});
  for(let c=0;c<SIZE;c++){const cell=cells.find(item=>item.r===1&&item.c===c);cell.mask=(c>0?1<<3:0)|(c<SIZE-1?1<<1:0);cell.turn=c%2?1:0;if(c===0)cell.role="source";if(c===SIZE-1)cell.role="goal"}
  return{kind:"pipeFlow",prompt:PROMPT,help:LEGACY_FALLBACK_HELP,cells,size:SIZE,duration:DURATION};
}

function isPublishedFallback(task){
  if(task?.help!==LEGACY_FALLBACK_HELP||!Array.isArray(task.cells)||task.cells.length!==SIZE*SIZE)return false;
  return task.cells.every(cell=>{if(cell.r!==1)return cell.mask===0&&cell.turn===0&&cell.role==="empty";const expectedMask=(cell.c>0?1<<3:0)|(cell.c<SIZE-1?1<<1:0),expectedRole=cell.c===0?"source":cell.c===SIZE-1?"goal":"empty";return cell.mask===expectedMask&&cell.turn===cell.c%2&&cell.role===expectedRole});
}

function validate(task){
  const issues=[];if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="pipeFlow")issues.push("kind must remain pipeFlow");if(task.prompt!==PROMPT)issues.push("prompt changed");if(task.help!==HELP&&task.help!==LEGACY_FALLBACK_HELP)issues.push("help changed");if(task.size!==SIZE)issues.push(`size must remain ${SIZE}`);if(task.duration!==DURATION)issues.push(`duration must remain ${DURATION}ms`);
  if(!Array.isArray(task.cells)||task.cells.length!==SIZE*SIZE)issues.push(`cells must contain ${SIZE*SIZE} entries`);
  const cells=Array.isArray(task.cells)?task.cells:[],positions=new Set();
  cells.forEach((cell,index)=>{if(!cell||typeof cell!=="object"){issues.push(`cell ${index} must be an object`);return}if(!Number.isInteger(cell.r)||!Number.isInteger(cell.c)||cell.r<0||cell.r>=SIZE||cell.c<0||cell.c>=SIZE)issues.push(`cell ${index} has invalid coordinates`);else{const key=keyOf(cell.r,cell.c);if(positions.has(key))issues.push(`duplicate cell ${key}`);positions.add(key)}if(!Number.isInteger(cell.mask)||cell.mask<0||cell.mask>15)issues.push(`cell ${index} has invalid mask`);if(!Number.isInteger(cell.turn)||cell.turn<0||cell.turn>3)issues.push(`cell ${index} has invalid turn`);if(!["empty","source","goal"].includes(cell.role))issues.push(`cell ${index} has invalid role`)});
  if(cells.filter(cell=>cell?.role==="source").length!==1)issues.push("exactly one source is required");if(cells.filter(cell=>cell?.role==="goal").length!==1)issues.push("exactly one goal is required");
  const source=cells.find(cell=>cell?.role==="source"),goal=cells.find(cell=>cell?.role==="goal");if(source&&source.c!==0)issues.push("source must remain on the left edge");if(goal&&goal.c!==SIZE-1)issues.push("goal must remain on the right edge");if(source&&!source.mask)issues.push("source needs a pipe");if(goal&&!goal.mask)issues.push("goal needs a pipe");
  if(!issues.length){if(connected(cells,SIZE).ok)issues.push("initial board must not already be connected");const solved=cloneCells(cells).map(cell=>({...cell,turn:0}));if(!connected(solved,SIZE).ok)issues.push("zero-rotation board must connect source to goal");if(solvedRoute(cells,SIZE).length<6&&!isPublishedFallback(task))issues.push("solved route must contain at least six cells")}
  return[...new Set(issues)];
}

const STYLE=`
.spf-stage{box-sizing:border-box;width:100%;max-width:430px;margin-inline:auto;display:grid;gap:.5rem;justify-items:center;contain:layout paint;color:#3d3544}.spf-stage:focus-visible{outline:3px solid #5c3f78;outline-offset:3px;border-radius:1rem}.spf-canvas{box-sizing:border-box;display:block;max-width:100%;border-radius:1rem;background:#eef1f5;box-shadow:0 9px 24px rgba(42,34,51,.18);touch-action:none}.spf-status{width:100%;min-height:1.35rem;margin:0;text-align:center;color:#62566c;font-size:clamp(.8rem,3.5vw,.94rem);font-weight:850;line-height:1.35}.spf-stage[data-result=success] .spf-status{color:#356c52}.spf-stage[data-result=timeout] .spf-status{color:#9c4567}.spf-help{margin:0;color:#75697d;font-size:.76rem;font-weight:750;text-align:center}@media(prefers-reduced-motion:reduce){.spf-stage{scroll-behavior:auto}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);const view=documentRef.defaultView||globalThis;
  const style=documentRef.createElement("style");style.textContent=STYLE;const stage=documentRef.createElement("section");stage.className="spf-stage";stage.tabIndex=0;stage.dataset.done="false";stage.dataset.result="";stage.setAttribute("aria-label","4かける4のパイプを回して水源とゴールをつなぐパズル");const canvas=documentRef.createElement("canvas");canvas.className="spf-canvas";canvas.setAttribute("role","img");canvas.setAttribute("aria-label","回転できる金属パイプ盤面");const status=documentRef.createElement("p");status.className="spf-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");const help=documentRef.createElement("p");help.className="spf-help";help.textContent="矢印キーで移動・EnterかSpaceで回転";stage.append(canvas,status,help);context.host.replaceChildren(style,stage);const ctx=canvas.getContext("2d");if(!ctx)throw new Error(`${metadata.id}: 2D canvas is unavailable`);
  const cells=cloneCells(task.cells).map(cell=>({...cell,spin:0})),route=solvedRoute(cells,task.size),state={done:false,disposed:false,result:null,glow:0,taps:0,selected:0,rotating:null,flowPhase:0,frames:0};let lit=new Set(),W=0,H=0,unit=0,padX=0,padY=0,dpr=1,lastFrame=null,stopAnimation=null;const sparks=[];
  const byPosition=(r,c)=>cells.find(cell=>cell.r===r&&cell.c===c),cellCentre=item=>({x:padX+item.c*unit+unit/2,y:padY+item.r*unit+unit/2});
  const recount=()=>{const result=connected(cells,task.size);lit=result.lit;return result.ok};
  const resize=()=>{const measured=stage.getBoundingClientRect?.().width||stage.clientWidth||context.viewport?.width||320;W=clamp(Math.round(measured),240,430);H=Math.round(W*1.02);dpr=clamp(Number(context.viewport?.dpr||view.devicePixelRatio||1),1,3);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;ctx.setTransform(dpr,0,0,dpr,0,0);unit=Math.floor(Math.min(W*.9,H*.86)/task.size);padX=Math.round((W-unit*task.size)/2);padY=Math.round((H-unit*task.size)/2)};
  const drawArm=(step,length)=>{ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(step.dc*length,step.dr*length);ctx.stroke()};
  const drawCell=item=>{const{x,y}=cellCentre(item),isLit=lit.has(keyOf(item.r,item.c)),selected=cells[state.selected]===item,boxX=padX+item.c*unit+unit*.035,boxY=padY+item.r*unit+unit*.035;
    const tile=ctx.createLinearGradient(boxX,boxY,boxX+unit,boxY+unit);tile.addColorStop(0,(item.r+item.c)%2?"#f8f4fb":"#fff");tile.addColorStop(1,(item.r+item.c)%2?"#ded7e8":"#e8e2ee");ctx.fillStyle=tile;ctx.beginPath();ctx.roundRect(boxX,boxY,unit*.93,unit*.93,unit*.13);ctx.fill();ctx.strokeStyle=selected?"#84649a":"rgba(107,87,119,.075)";ctx.lineWidth=selected?Math.max(2,unit*.032):Math.max(1,unit*.012);ctx.stroke();if(!item.mask)return;
    ctx.save();ctx.translate(x,y);ctx.rotate((item.turn+item.spin)*Math.PI/2);const arm=unit*.5,thick=unit*.29;
    if(isLit){ctx.shadowColor="rgba(76,190,238,.68)";ctx.shadowBlur=unit*.09;ctx.strokeStyle="rgba(73,174,222,.28)";ctx.lineWidth=thick*1.08;ctx.lineCap="round";DIRS.forEach((step,dir)=>{if(item.mask>>dir&1)drawArm(step,arm) });ctx.shadowBlur=0}
    ctx.strokeStyle="#656b76";ctx.lineWidth=thick;ctx.lineCap="round";DIRS.forEach((step,dir)=>{if(item.mask>>dir&1)drawArm(step,arm)});ctx.strokeStyle="#b9c0c9";ctx.lineWidth=thick*.72;DIRS.forEach((step,dir)=>{if(item.mask>>dir&1)drawArm(step,arm)});ctx.strokeStyle=isLit?"#4bbce9":"#929aa6";ctx.lineWidth=thick*.42;DIRS.forEach((step,dir)=>{if(item.mask>>dir&1)drawArm(step,arm)});
    if(isLit){ctx.save();ctx.strokeStyle="rgba(225,249,255,.88)";ctx.lineWidth=thick*.1;ctx.setLineDash([unit*.12,unit*.1]);ctx.lineDashOffset=-state.flowPhase*unit*.35;DIRS.forEach((step,dir)=>{if(item.mask>>dir&1)drawArm(step,arm*.92)});ctx.restore()}
    if(item.spin>0){ctx.strokeStyle="rgba(107,67,132,.75)";ctx.lineWidth=Math.max(2,unit*.025);ctx.setLineDash([unit*.055,unit*.045]);ctx.beginPath();ctx.arc(0,0,unit*.35,-Math.PI*.8,Math.PI*.55);ctx.stroke();ctx.setLineDash([])}
    const hub=ctx.createRadialGradient(-thick*.14,-thick*.18,thick*.05,0,0,thick*.48);hub.addColorStop(0,"#eef1f4");hub.addColorStop(.5,isLit?"#64c9ef":"#aab1bb");hub.addColorStop(1,isLit?"#277fa7":"#5f6570");ctx.fillStyle=hub;ctx.beginPath();ctx.arc(0,0,thick*.46,0,Math.PI*2);ctx.fill();ctx.restore();
    if(item.role==="source"){ctx.fillStyle="#237da9";ctx.beginPath();ctx.roundRect(x-unit*.27,y-unit*.27,unit*.54,unit*.54,unit*.14);ctx.fill();ctx.fillStyle="#bdeaff";ctx.beginPath();ctx.arc(x,y,unit*.135,0,Math.PI*2);ctx.fill()}
    if(item.role==="goal"){const reached=lit.has(keyOf(item.r,item.c));ctx.fillStyle=reached?"#55b77d":"#8f98a5";ctx.beginPath();ctx.arc(x,y,unit*.25,0,Math.PI*2);ctx.fill();ctx.strokeStyle=reached?"#d9ffe7":"#d8dce2";ctx.lineWidth=unit*.055;ctx.stroke();ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(unit*.25)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(reached?"◎":"?",x,y);ctx.textAlign="left"}
  };
  const paint=()=>{ctx.clearRect(0,0,W,H);const back=ctx.createLinearGradient(0,0,0,H);back.addColorStop(0,"#f8f5fb");back.addColorStop(1,"#e5e8ee");ctx.fillStyle=back;ctx.fillRect(0,0,W,H);cells.forEach(drawCell);sparks.forEach(spark=>{ctx.globalAlpha=clamp(spark.life,0,1);ctx.fillStyle=spark.color;ctx.beginPath();ctx.arc(spark.x,spark.y,spark.size,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1});if(state.glow>0){ctx.fillStyle=`rgba(168,231,251,${state.glow*.22})`;ctx.fillRect(0,0,W,H)}if(state.result==="timeout"){ctx.fillStyle="rgba(156,69,103,.94)";ctx.beginPath();ctx.roundRect(W*.2,H*.025,W*.6,H*.13,H*.06);ctx.fill();ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(W*.052)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("時間切れ",W/2,H*.09);ctx.textAlign="left"}ctx.fillStyle="rgba(59,49,67,.9)";ctx.font=`800 ${Math.round(W*.043)}px system-ui,sans-serif`;ctx.textBaseline="top";ctx.fillText(`回した回数 ${state.taps}`,W*.05,H*.018)};
  const updateStatus=message=>{const item=cells[state.selected];status.textContent=message||`選択 ${item.r+1}行${item.c+1}列。${state.taps}回回転`;canvas.setAttribute("aria-label",`パイプ盤面。選択は${item.r+1}行${item.c+1}列。回転${state.taps}回`)};
  const burst=()=>{route.forEach((point,index)=>{const item=byPosition(point.r,point.c),centre=cellCentre(item);for(let n=0;n<(context.reducedMotion?1:4);n++){const angle=(index*1.7+n*1.57)%6.28,speed=unit*(.7+n*.28);sparks.push({x:centre.x,y:centre.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-unit*.45,size:unit*(.025+n*.008),life:1})}})};
  const finishWin=()=>{if(state.done||state.disposed)return;state.done=true;state.result="success";state.glow=1;stage.dataset.done="true";stage.dataset.result="success";updateStatus(`${state.taps}回まわして水がゴールへ到達！`);burst();context.later(()=>context.finish(true,{quality:clamp(.9-state.taps*.025,0,1),detail:`${state.taps}回まわして水を通しました。`}),context.reducedMotion?0:900)};
  const commitRotation=item=>{item.spin=0;item.turn=(item.turn+1)%4;state.rotating=null;if(recount())finishWin();else{updateStatus();paint()}};
  const rotate=item=>{if(state.done||state.disposed||state.rotating||!item?.mask)return false;state.selected=cells.indexOf(item);state.taps++;if(context.reducedMotion){commitRotation(item);return true}state.rotating={item,started:null};updateStatus("パイプを回転中");return true};
  const select=(row,col)=>{const item=byPosition((row+task.size)%task.size,(col+task.size)%task.size);if(!item)return;state.selected=cells.indexOf(item);updateStatus();paint()};
  const tick=now=>{if(state.disposed)return false;if(lastFrame===null)lastFrame=now;const dt=Math.min(Math.max((now-lastFrame)/1000,0),.05);lastFrame=now;state.frames++;state.flowPhase=(state.flowPhase+dt)%10;state.glow=Math.max(0,state.glow-dt*1.2);for(let index=sparks.length-1;index>=0;index--){const spark=sparks[index];spark.life-=dt*1.8;if(spark.life<=0){sparks.splice(index,1);continue}spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=unit*3.5*dt}if(state.rotating){if(state.rotating.started===null)state.rotating.started=now;const t=clamp((now-state.rotating.started)/170,0,1);state.rotating.item.spin=1-(1-t)*(1-t);if(t>=1)commitRotation(state.rotating.item)}paint();return!state.done||sparks.length>0};
  context.listen(canvas,"pointerdown",event=>{event.preventDefault();if(state.done)return;const rect=canvas.getBoundingClientRect(),col=Math.floor((event.clientX-rect.left-padX)/unit),row=Math.floor((event.clientY-rect.top-padY)/unit),item=byPosition(row,col);if(item)rotate(item)});
  context.listen(stage,"keydown",event=>{const item=cells[state.selected];if(["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"].includes(event.key)){event.preventDefault();const dir=["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"].indexOf(event.key),step=DIRS[dir];select(item.r+step.dr,item.c+step.dc)}else if(event.key==="Enter"||event.key===" "){event.preventDefault();rotate(item)}});
  if(view&&typeof view.dispatchEvent==="function")context.listen(view,"resize",()=>{resize();paint()},{passive:true});
  resize();recount();updateStatus("パイプを選んで回してください");paint();stage.focus({preventScroll:true});if(!context.reducedMotion)stopAnimation=context.frame(tick);context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;state.result="timeout";stage.dataset.done="true";stage.dataset.result="timeout";updateStatus("時間切れ。水はゴールまで届きませんでした");paint();context.finish(false,{detail:"時間切れ。水はゴールまで届きませんでした。"})});
  const solution=()=>cells.map((cell,index)=>({index,turns:(4-cell.turn)%4})).filter(step=>cells[step.index].mask&&step.turns);
  const showScene=scene=>{if(!context.qa||state.disposed)return false;stopAnimation?.();cells.splice(0,cells.length,...cloneCells(task.cells).map(cell=>({...cell,spin:0})));state.done=false;state.result=null;state.glow=0;state.taps=0;state.selected=0;state.rotating=null;stage.dataset.done="false";stage.dataset.result="";sparks.length=0;const routeCells=route.map(point=>byPosition(point.r,point.c));if(scene==="rotation"){const item=routeCells.find(cell=>cell.role==="empty"&&cell.mask!==5&&cell.mask!==10)||routeCells.find(cell=>cell.role==="empty");state.selected=cells.indexOf(item);item.spin=.58;state.taps=1}else if(scene==="partial-flow"){routeCells.slice(0,Math.max(2,Math.floor(routeCells.length*.55))).forEach(cell=>cell.turn=0);state.taps=4}else if(scene==="near-solve"){cells.forEach(cell=>{if(cell.mask)cell.turn=0});const blocker=routeCells.at(-2);blocker.turn=1;state.selected=cells.indexOf(blocker);state.taps=9}else if(scene==="success"){cells.forEach(cell=>{if(cell.mask)cell.turn=0});state.taps=10;state.done=true;state.result="success";state.glow=1;stage.dataset.done="true";stage.dataset.result="success"}else if(scene==="timeout"){state.done=true;state.result="timeout";stage.dataset.done="true";stage.dataset.result="timeout"}recount();updateStatus(scene==="timeout"?"時間切れ。水はゴールまで届きませんでした":scene==="success"?"水がゴールへ到達！":undefined);paint();return true};
  const qaApi={rotate:index=>rotate(cells[index]),showScene,solution,route:()=>route.map(point=>({...point})),inspect:()=>({cells:cloneCells(cells),lit:[...lit],route:route.map(point=>({...point})),done:state.done,disposed:state.disposed,result:state.result,taps:state.taps,selected:state.selected,rotating:Boolean(state.rotating),frames:state.frames,status:status.textContent,canvas:{cssWidth:W,cssHeight:H,pixelWidth:canvas.width,pixelHeight:canvas.height,dpr},viewport:{...context.viewport}})};if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;stopAnimation?.();if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
