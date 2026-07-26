const SIZE=5;
const GENERATION_ATTEMPTS=40;
const BACKBITE_STEPS=420;
const MIN_PAIRS=4;
const MAX_PAIRS=5;
const MIN_PATH=3;
const DURATION=80000;
const COLORS=Object.freeze([
  Object.freeze({key:"orange",base:"#F2953F",edge:"#9B5518",light:"#FFD0A0"}),
  Object.freeze({key:"pink",base:"#EA7E9B",edge:"#9B3F61",light:"#FFC7DA"}),
  Object.freeze({key:"blue",base:"#5FB6E0",edge:"#286F9D",light:"#C0E6F8"}),
  Object.freeze({key:"green",base:"#66C08C",edge:"#317A54",light:"#C4EFD5"}),
  Object.freeze({key:"purple",base:"#A66DC2",edge:"#70418B",light:"#E0CBF0"}),
  Object.freeze({key:"yellow",base:"#F2CE4B",edge:"#9B7C13",light:"#FFEDA8"})
]);

const metadata=Object.freeze({
  id:"spatial-flow-link-v1",
  introducedIn:"1.9",
  tier:3,
  flavor:"satisfying",
  step:1,
  family:"spatial-flow-link",
  category:"spatial"
});

const idOf=(r,c)=>r*SIZE+c;
const same=(a,b)=>a.r===b.r&&a.c===b.c;
const clonePoint=point=>({r:point.r,c:point.c});
const clonePaths=paths=>paths.map(path=>path.map(clonePoint));
const adjacent=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1;
const inBoard=point=>Number.isInteger(point?.r)&&Number.isInteger(point?.c)&&point.r>=0&&point.r<SIZE&&point.c>=0&&point.c<SIZE;
const colorAt=index=>COLORS[index%COLORS.length];

function serpentine(){
  const path=[];
  for(let r=0;r<SIZE;r++)for(let offset=0;offset<SIZE;offset++)path.push({r,c:r%2?SIZE-1-offset:offset});
  return path;
}

function hamiltonian({random,pick}){
  const path=serpentine(),index=new Map(path.map((cell,i)=>[idOf(cell.r,cell.c),i]));
  const rebuild=()=>{index.clear();path.forEach((cell,i)=>index.set(idOf(cell.r,cell.c),i))};
  for(let step=0;step<BACKBITE_STEPS;step++){
    const fromTail=random()<.5,end=fromTail?path[path.length-1]:path[0];
    const neighbours=[[1,0],[-1,0],[0,1],[0,-1]].map(([dr,dc])=>({r:end.r+dr,c:end.c+dc}))
      .filter(cell=>inBoard(cell)).map(cell=>index.get(idOf(cell.r,cell.c)))
      .filter(i=>i!==undefined&&(fromTail?i<path.length-2:i>1));
    if(!neighbours.length)continue;
    const pivot=pick(neighbours);
    if(fromTail){const tail=path.splice(pivot+1);tail.reverse();path.push(...tail)}
    else{const head=path.splice(0,pivot);head.reverse();path.unshift(...head)}
    rebuild();
  }
  return path;
}

function taskFrom(solution){
  const endpoints=solution.map((segment,color)=>({color,a:clonePoint(segment[0]),b:clonePoint(segment[segment.length-1])}));
  return{kind:"flowLink",prompt:"同じ色をつないで",help:"色の点から指をなぞって同じ色へ。すべての色をつなぎ、全部のマスを埋めれば成功です。",endpoints,solution:clonePaths(solution),size:SIZE,duration:DURATION};
}

function publishedFallback(){
  return{kind:"flowLink",prompt:"同じ色をつないで",help:"色の点から指をなぞって同じ色へ。",endpoints:[
    {color:0,a:{r:0,c:0},b:{r:0,c:4}},{color:1,a:{r:2,c:0},b:{r:2,c:4}},
    {color:2,a:{r:4,c:0},b:{r:4,c:4}},{color:3,a:{r:1,c:0},b:{r:3,c:4}}
  ],solution:[],size:SIZE,duration:DURATION};
}

function isPublishedFallback(task){
  const fallback=publishedFallback();
  return task?.kind===fallback.kind&&task.prompt===fallback.prompt&&task.help===fallback.help&&task.size===SIZE&&task.duration===DURATION&&JSON.stringify(task.endpoints)===JSON.stringify(fallback.endpoints)&&Array.isArray(task.solution)&&task.solution.length===0;
}

function recoverySolution(){
  const route=serpentine(),lengths=[6,6,6,7],paths=[];let cursor=0;
  lengths.forEach(length=>{paths.push(route.slice(cursor,cursor+length));cursor+=length});
  return paths;
}

function playable(task){
  if(!isPublishedFallback(task))return{endpoints:task.endpoints.map(pair=>({color:pair.color,a:clonePoint(pair.a),b:clonePoint(pair.b)})),solution:clonePaths(task.solution)};
  const solution=recoverySolution();
  return{endpoints:solution.map((path,color)=>({color,a:clonePoint(path[0]),b:clonePoint(path[path.length-1])})),solution:clonePaths(solution)};
}

function generate({random,randomInt,pick}){
  if(typeof random!=="function"||typeof randomInt!=="function"||typeof pick!=="function")throw new TypeError(`${metadata.id}: random helpers are required`);
  for(let attempt=0;attempt<GENERATION_ATTEMPTS;attempt++){
    const path=hamiltonian({random,pick}),pairs=randomInt(MIN_PAIRS,MAX_PAIRS),cuts=[];
    let remaining=path.length,cursor=0,valid=true;
    for(let index=0;index<pairs;index++){
      const left=pairs-index-1,maxLength=remaining-left*MIN_PATH;
      if(maxLength<MIN_PATH){valid=false;break}
      const length=index===pairs-1?remaining:randomInt(MIN_PATH,Math.min(maxLength,7));
      cuts.push(path.slice(cursor,cursor+length));cursor+=length;remaining-=length;
    }
    if(!valid||remaining||cuts.some(segment=>segment.length<MIN_PATH))continue;
    const endpoints=cuts.flatMap(segment=>[segment[0],segment[segment.length-1]]),seen=new Set(endpoints.map(point=>idOf(point.r,point.c)));
    if(seen.size!==endpoints.length)continue;
    const task=taskFrom(cuts);if(solutionIssues(task).length)continue;
    return task;
  }
  return publishedFallback();
}

function solutionIssues(task){
  const issues=[],paths=Array.isArray(task.solution)?task.solution:[];
  if(paths.length!==task.endpoints.length){issues.push("solution must contain one path per color");return issues}
  const used=new Set();
  paths.forEach((path,index)=>{
    if(!Array.isArray(path)||path.length<MIN_PATH){issues.push(`solution path ${index} is too short`);return}
    const pair=task.endpoints[index],first=path[0],last=path[path.length-1];
    if(!(same(first,pair.a)&&same(last,pair.b))&&!(same(first,pair.b)&&same(last,pair.a)))issues.push(`solution path ${index} does not join its endpoints`);
    path.forEach((point,position)=>{
      if(!inBoard(point))issues.push(`solution path ${index} leaves the board`);
      if(position&&inBoard(point)&&inBoard(path[position-1])&&!adjacent(point,path[position-1]))issues.push(`solution path ${index} is not orthogonal`);
      if(inBoard(point)){const id=idOf(point.r,point.c);if(used.has(id))issues.push("solution paths overlap");used.add(id)}
    });
  });
  if(used.size!==SIZE*SIZE)issues.push("solution must fill all 25 cells");
  return issues;
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="flowLink")issues.push("kind must remain flowLink");
  if(task.prompt!=="同じ色をつないで")issues.push("prompt changed");
  if(task.help!=="色の点から指をなぞって同じ色へ。すべての色をつなぎ、全部のマスを埋めれば成功です。"&&task.help!=="色の点から指をなぞって同じ色へ。")issues.push("help changed");
  if(task.size!==SIZE)issues.push("size must remain 5");
  if(task.duration!==DURATION)issues.push("duration must remain 80000ms");
  if(!Array.isArray(task.endpoints)||task.endpoints.length<MIN_PAIRS||task.endpoints.length>MAX_PAIRS)issues.push("endpoints must contain 4 or 5 pairs");
  const endpoints=Array.isArray(task.endpoints)?task.endpoints:[],seen=new Set();
  endpoints.forEach((pair,index)=>{
    if(pair?.color!==index)issues.push(`endpoint color ${index} changed`);
    if(!inBoard(pair?.a)||!inBoard(pair?.b)||same(pair?.a||{},pair?.b||{}))issues.push(`endpoint pair ${index} is invalid`);
    [pair?.a,pair?.b].filter(inBoard).forEach(point=>{const id=idOf(point.r,point.c);if(seen.has(id))issues.push("endpoint cells must be unique");seen.add(id)});
  });
  if(!Array.isArray(task.solution))issues.push("solution must be an array");
  if(!issues.length&&!isPublishedFallback(task))issues.push(...solutionIssues(task));
  return[...new Set(issues)];
}

const STYLE=`
.afl-stage{box-sizing:border-box;position:relative;width:100%;max-width:430px;margin:auto;padding:.1rem max(.2rem,env(safe-area-inset-left)) .08rem max(.2rem,env(safe-area-inset-right));display:grid;gap:.28rem;color:#44364d;contain:layout paint}.afl-status{position:absolute;width:1px;height:1px;margin:0;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.afl-status.afl-error{color:#a13750}.afl-status.afl-success{color:#28694a}
.afl-canvas{box-sizing:border-box;display:block;width:100%;border:0;border-radius:1rem;background:transparent;box-shadow:none;touch-action:none;outline:none}.afl-stage[data-keyboard=true]:not([data-result=success]):not([data-result=timeout]) .afl-canvas:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 5px #68417e,0 8px 20px rgba(54,33,65,.15)}.afl-canvas.afl-invalid{animation:afl-no .26s ease}
.afl-hint{min-height:0;margin:0;text-align:center;color:#6d5c75;font-size:clamp(.78rem,3.25vw,.88rem);font-weight:820;line-height:1.35}.afl-stage[data-result=success] .afl-hint{padding:.38rem .65rem;border-radius:999px;background:#e7f7ed;color:#28734b;font-size:.9rem;font-weight:950}
@keyframes afl-no{25%,75%{transform:translateX(-3px)}50%{transform:translateX(3px)}}.afl-stage[data-reduced=true] .afl-canvas{animation:none}@media(prefers-reduced-motion:reduce){.afl-canvas{animation:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,model=playable(task),endpoints=model.endpoints,solution=model.solution,size=SIZE;
  const style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="afl-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.dataset.result="";stage.dataset.keyboard="false";
  const status=documentRef.createElement("p");status.className="afl-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const canvas=documentRef.createElement("canvas");canvas.className="afl-canvas";canvas.tabIndex=0;canvas.setAttribute("role","application");canvas.setAttribute("aria-label","5かける5の盤面で同じ色の点を線でつなぐパズル。矢印キーで移動し、Enterで線を開始または確定します");
  const hint=documentRef.createElement("p");hint.className="afl-hint";
  const legend=documentRef.createElement("div");legend.className="afl-legend";legend.setAttribute("aria-hidden","true");endpoints.forEach((pair,index)=>{const key=documentRef.createElement("i"),color=colorAt(index);key.className="afl-key";key.style.setProperty("--base",color.base);key.style.setProperty("--edge",color.edge);legend.append(key)});
  stage.append(status,canvas,hint);context.host.replaceChildren(style,stage);
  const drawing=canvas.getContext("2d"),paths=endpoints.map(pair=>[clonePoint(pair.a)]),sparks=[];
  const state={drag:-1,done:false,disposed:false,result:null,invalid:false,invalidCell:null,cursor:clonePoint(endpoints[0].a),changes:0,frames:0};
  let width=390,height=398,cell=70,padX=20,padY=30,clock=0,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1)),stopFrame=null,invalidNonce=0;
  const cx=c=>padX+c*cell+cell/2,cy=r=>padY+r*cell+cell/2;
  const endpointAt=(r,c)=>endpoints.findIndex(pair=>same(pair.a,{r,c})||same(pair.b,{r,c}));
  const owner=(r,c)=>paths.findIndex(path=>path.some(point=>point.r===r&&point.c===c));
  const connected=index=>{const path=paths[index],pair=endpoints[index];if(path.length<2)return false;return same(path[0],pair.a)&&same(path[path.length-1],pair.b)||same(path[0],pair.b)&&same(path[path.length-1],pair.a)};
  const filled=()=>new Set(paths.flatMap(path=>path.map(point=>idOf(point.r,point.c)))).size;
  const completed=()=>endpoints.every((pair,index)=>connected(index))&&filled()===size*size;
  const addBurst=(x,y,color,count=12)=>{for(let i=0;i<(context.reducedMotion?4:count);i++){const angle=i*Math.PI*2/count+.19,speed=cell*(.65+(i%5)*.21);sparks.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-cell*.35,size:cell*(.025+(i%3)*.014),color,life:1})}};
  const drawGrid=()=>{
    const plate=drawing.createLinearGradient(padX,padY,padX,padY+cell*size);plate.addColorStop(0,"#fbf7fd");plate.addColorStop(1,"#e9e0f1");drawing.fillStyle=plate;drawing.shadowColor="rgba(63,39,74,.2)";drawing.shadowBlur=cell*.14;drawing.shadowOffsetY=cell*.07;drawing.beginPath();drawing.roundRect(padX-cell*.075,padY-cell*.075,cell*size+cell*.15,cell*size+cell*.15,cell*.22);drawing.fill();drawing.shadowBlur=0;drawing.shadowOffsetY=0;
    for(let r=0;r<size;r++)for(let c=0;c<size;c++){const x=padX+c*cell+cell*.075,y=padY+r*cell+cell*.075;drawing.fillStyle=(r+c)%2?"#eee6f4":"#f6eff9";drawing.beginPath();drawing.roundRect(x,y,cell*.85,cell*.85,cell*.17);drawing.fill()}
  };
  const strokePath=(path,index)=>{
    if(path.length<2)return;const color=colorAt(index),first=path[0],last=path[path.length-1],gradient=drawing.createLinearGradient(cx(first.c),cy(first.r),cx(last.c),cy(last.r));gradient.addColorStop(0,color.base);gradient.addColorStop(.55,color.base);gradient.addColorStop(1,color.base);drawing.lineCap="round";drawing.lineJoin="round";
    const trace=()=>{drawing.beginPath();path.forEach((point,i)=>i?drawing.lineTo(cx(point.c),cy(point.r)):drawing.moveTo(cx(point.c),cy(point.r)))};
    drawing.save();drawing.globalAlpha=.44;drawing.strokeStyle=color.edge;drawing.lineWidth=cell*.45;drawing.shadowColor=color.base;drawing.shadowBlur=cell*.065;drawing.shadowOffsetY=cell*.04;trace();drawing.stroke();drawing.restore();
    drawing.strokeStyle=gradient;drawing.lineWidth=cell*.37;trace();drawing.stroke();drawing.strokeStyle="rgba(255,255,255,.35)";drawing.lineWidth=cell*.05;trace();drawing.stroke();
  };
  const drawEndpoints=()=>endpoints.forEach((pair,index)=>{const color=colorAt(index),done=connected(index);[pair.a,pair.b].forEach(point=>{const x=cx(point.c),y=cy(point.r),radius=cell*.29;drawing.fillStyle="rgba(44,25,52,.22)";drawing.beginPath();drawing.ellipse(x,y+radius*.42,radius*.92,radius*.34,0,0,Math.PI*2);drawing.fill();const gem=drawing.createRadialGradient(x-radius*.34,y-radius*.38,radius*.06,x,y,radius);gem.addColorStop(0,"#fff");gem.addColorStop(.18,color.light);gem.addColorStop(.68,color.base);gem.addColorStop(1,color.edge);drawing.fillStyle=gem;drawing.beginPath();drawing.arc(x,y,radius,0,Math.PI*2);drawing.fill();drawing.strokeStyle=done?"#fff":"rgba(255,255,255,.72)";drawing.lineWidth=Math.max(2,cell*.055);drawing.stroke();drawing.fillStyle="rgba(255,255,255,.78)";drawing.beginPath();drawing.arc(x-radius*.25,y-radius*.27,radius*.18,0,Math.PI*2);drawing.fill();if(done){drawing.strokeStyle=`rgba(255,255,255,${context.reducedMotion?.75:.55+Math.sin(clock*.006)*.2})`;drawing.lineWidth=Math.max(2,cell*.035);drawing.beginPath();drawing.arc(x,y,radius*1.3,0,Math.PI*2);drawing.stroke()}})});
  const drawCursor=()=>{const x=cx(state.cursor.c),y=cy(state.cursor.r),active=state.drag>=0;if(active){const color=colorAt(state.drag);drawing.save();drawing.globalAlpha=.3;drawing.fillStyle=color.light;drawing.shadowColor=color.base;drawing.shadowBlur=cell*.18;drawing.beginPath();drawing.arc(x,y,cell*.24,0,Math.PI*2);drawing.fill();drawing.restore()}else if(stage.dataset.keyboard==="true"){drawing.strokeStyle="#674477";drawing.lineWidth=Math.max(2,cell*.035);drawing.beginPath();drawing.roundRect(x-cell*.37,y-cell*.37,cell*.74,cell*.74,cell*.16);drawing.stroke()}};
  const drawHud=()=>{const done=endpoints.filter((pair,index)=>connected(index)).length;drawing.font=`900 ${Math.round(width*.043)}px system-ui,sans-serif`;drawing.textBaseline="top";drawing.fillStyle="#574461";drawing.fillText(`つながった ${done} / ${endpoints.length}`,width*.045,height*.016);drawing.textAlign="right";drawing.fillStyle="#6d5e74";drawing.fillText(`マス ${filled()} / ${size*size}`,width*.955,height*.016);drawing.textAlign="left"};
  const drawResult=()=>{if(state.result==="timeout"){drawing.fillStyle="rgba(64,31,48,.48)";drawing.fillRect(0,0,width,height);drawing.fillStyle="rgba(157,57,79,.96)";drawing.beginPath();drawing.roundRect(width*.21,height*.42,width*.58,height*.15,height*.07);drawing.fill();drawing.fillStyle="#fff";drawing.font=`950 ${Math.round(width*.058)}px system-ui,sans-serif`;drawing.textAlign="center";drawing.textBaseline="middle";drawing.fillText("時間切れ",width/2,height*.495);drawing.textAlign="left"}};
  const paint=()=>{drawing.clearRect(0,0,width,height);drawGrid();paths.forEach(strokePath);drawEndpoints();if(!state.done||state.drag>=0)drawCursor();if(state.invalidCell){drawing.strokeStyle=`rgba(186,55,80,${context.reducedMotion?.9:.65+Math.sin(clock*.014)*.25})`;drawing.lineWidth=cell*.075;drawing.beginPath();drawing.moveTo(cx(state.invalidCell.c)-cell*.13,cy(state.invalidCell.r)-cell*.13);drawing.lineTo(cx(state.invalidCell.c)+cell*.13,cy(state.invalidCell.r)+cell*.13);drawing.moveTo(cx(state.invalidCell.c)+cell*.13,cy(state.invalidCell.r)-cell*.13);drawing.lineTo(cx(state.invalidCell.c)-cell*.13,cy(state.invalidCell.r)+cell*.13);drawing.stroke()}sparks.forEach(spark=>{drawing.globalAlpha=Math.max(0,Math.min(1,spark.life));drawing.fillStyle=spark.color;drawing.beginPath();drawing.arc(spark.x,spark.y,spark.size,0,Math.PI*2);drawing.fill();drawing.globalAlpha=1});drawHud();drawResult()};
  const resize=()=>{const rect=canvas.parentElement?.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{};width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*1.02);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;cell=Math.floor(Math.min(width*.91,height*.82)/size);padX=Math.round((width-cell*size)/2);padY=Math.round((height-cell*size)/2+height*.035);drawing.setTransform(dpr,0,0,dpr,0,0);paint()};
  const setMessage=(message,type="")=>{status.textContent=message;status.className=`afl-status${type?` afl-${type}`:""}`};
  const reject=(spot,message)=>{state.invalid=true;state.invalidCell=clonePoint(spot);invalidNonce++;const nonce=invalidNonce;canvas.classList.remove("afl-invalid");void canvas.offsetWidth;canvas.classList.add("afl-invalid");setMessage(message,"error");hint.textContent="";paint();context.later(()=>{if(state.disposed||nonce!==invalidNonce)return;state.invalid=false;state.invalidCell=null;canvas.classList.remove("afl-invalid");if(!state.done)setMessage(state.drag>=0?"線を同じ色の点まで伸ばしてください":"色の点を選んで線を引きます");paint()},context.reducedMotion?0:520);return false};
  const startDrag=spot=>{if(state.done||state.disposed||!inBoard(spot))return false;state.cursor=clonePoint(spot);const endpointIndex=endpointAt(spot.r,spot.c);if(endpointIndex>=0){paths[endpointIndex]=[clonePoint(spot)];state.drag=endpointIndex;state.changes++;setMessage(`${colorAt(endpointIndex).key}の線を引いています`);hint.textContent="指を離さず、同じ色の点までなぞります";paint();return true}const index=owner(spot.r,spot.c);if(index<0)return reject(spot,"色の点か、引いた線から始めてください");const position=paths[index].findIndex(point=>same(point,spot));paths[index]=paths[index].slice(0,position+1);state.drag=index;state.changes++;setMessage("線の途中から引き直しています");paint();return true};
  const extend=spot=>{const index=state.drag;if(index<0||state.done||!inBoard(spot))return false;const path=paths[index],last=path[path.length-1];state.cursor=clonePoint(spot);if(same(last,spot))return true;if(!adjacent(last,spot))return false;const own=path.findIndex(point=>same(point,spot));if(own>=0){paths[index]=path.slice(0,own+1);paint();return true}const endpointIndex=endpointAt(spot.r,spot.c);if(endpointIndex>=0&&endpointIndex!==index)return reject(spot,"ほかの色の点には線を通せません");const other=owner(spot.r,spot.c);if(other>=0&&other!==index){const otherPath=paths[other],position=otherPath.findIndex(point=>same(point,spot));paths[other]=otherPath.slice(0,Math.max(1,position));setMessage("交差した線を押し戻しました")}
    const pair=endpoints[index],target=same(pair.b,path[0])?pair.a:pair.b,wasDone=connected(index);path.push(clonePoint(spot));state.changes++;if(!wasDone&&same(spot,target)){addBurst(cx(spot.c),cy(spot.r),colorAt(index).light,12);setMessage(`${index+1}色目がつながりました！`)}paint();return true};
  const moveTo=spot=>{if(state.drag<0||!inBoard(spot))return false;for(let guard=0;guard<size*size;guard++){const path=paths[state.drag],last=path[path.length-1];if(same(last,spot))return true;const dr=Math.sign(spot.r-last.r),dc=Math.sign(spot.c-last.c),options=[];if(Math.abs(spot.r-last.r)>=Math.abs(spot.c-last.c)){if(dr)options.push({r:last.r+dr,c:last.c});if(dc)options.push({r:last.r,c:last.c+dc})}else{if(dc)options.push({r:last.r,c:last.c+dc});if(dr)options.push({r:last.r+dr,c:last.c})}let moved=false;for(const step of options){const before=paths[state.drag]?.length||0;if(extend(step)&&same(paths[state.drag][paths[state.drag].length-1],step)){moved=true;break}if((paths[state.drag]?.length||0)!==before){moved=true;break}}if(!moved)return false}return false};
  const finishSuccess=()=>{if(state.done||state.disposed||!completed())return false;state.done=true;state.result="success";stage.dataset.result="success";endpoints.forEach((pair,index)=>addBurst(cx(pair.b.c),cy(pair.b.r),colorAt(index).light,14));setMessage(`${endpoints.length}色すべてをつなぎました！`,"success");hint.textContent="25マスすべて完成です";paint();context.later(()=>context.finish(true,{quality:Math.max(0,Math.min(1,.9-state.changes*.006)),detail:`${endpoints.length}色すべてをつなぎました。`}),context.reducedMotion?0:900);return true};
  const release=()=>{if(state.drag<0)return false;const index=state.drag;state.drag=-1;if(!connected(index)&&paths[index].length>1){setMessage("同じ色の点まで届かせてください");hint.textContent="途中の線から続けられます"}else{setMessage(connected(index)?`${index+1}色目がつながりました`:"色の点を選んで線を引きます");hint.textContent="すべての線で25マスを埋めます"}paint();if(completed())finishSuccess();return true};
  const cellAt=event=>{const rect=canvas.getBoundingClientRect(),localX=(event.clientX-rect.left)*width/Math.max(1,rect.width),localY=(event.clientY-rect.top)*height/Math.max(1,rect.height),c=Math.floor((localX-padX)/cell),r=Math.floor((localY-padY)/cell);return inBoard({r,c})?{r,c}:null};
  const pointerDown=event=>{if(state.done)return;event.preventDefault();stage.dataset.keyboard="false";const spot=cellAt(event);if(!spot)return;startDrag(spot);try{canvas.setPointerCapture?.(event.pointerId)}catch{}};
  const pointerMove=event=>{if(state.drag<0||state.done)return;event.preventDefault();const spot=cellAt(event);if(spot)moveTo(spot)};
  context.listen(canvas,"pointerdown",pointerDown);context.listen(canvas,"pointermove",pointerMove);context.listen(canvas,"pointerup",release);context.listen(canvas,"pointercancel",release);
  context.listen(canvas,"keydown",event=>{if(state.done)return;stage.dataset.keyboard="true";const vectors={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};if(vectors[event.key]){event.preventDefault();const[dr,dc]=vectors[event.key],spot={r:Math.max(0,Math.min(size-1,state.cursor.r+dr)),c:Math.max(0,Math.min(size-1,state.cursor.c+dc))};state.cursor=spot;if(state.drag>=0)extend(spot);else paint()}else if(event.key==="Enter"||event.key===" "){event.preventDefault();state.drag>=0?release():startDrag(state.cursor)}else if(event.key==="Escape"&&state.drag>=0){event.preventDefault();release()}});
  if(view)context.listen(view,"resize",resize,{passive:true});
  setMessage("指でなぞるか、矢印キーとEnterで色をつなぎます");hint.textContent="色の点から指をなぞってつなぎます";resize();canvas.focus({preventScroll:true});
  if(!context.reducedMotion)stopFrame=context.frame(time=>{if(state.disposed)return false;const delta=Math.min(.05,Math.max(0,(time-clock)/1000));clock=time;for(let i=sparks.length-1;i>=0;i--){const spark=sparks[i];spark.life-=delta*1.65;if(spark.life<=0){sparks.splice(i,1);continue}spark.x+=spark.vx*delta;spark.y+=spark.vy*delta;spark.vy+=cell*4.2*delta}state.frames++;paint();return!state.disposed});
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;state.result="timeout";stage.dataset.result="timeout";const done=endpoints.filter((pair,index)=>connected(index)).length;setMessage(`時間切れ。${done}色までつながりました`,"error");hint.textContent="もう一度なら、線の途中から引き直せます";paint();context.finish(false,{detail:`時間切れ。${done}色までつながりました。`})});
  const reset=()=>{paths.splice(0,paths.length,...endpoints.map(pair=>[clonePoint(pair.a)]));sparks.length=0;state.drag=-1;state.done=false;state.result=null;state.invalid=false;state.invalidCell=null;state.changes=0;state.cursor=clonePoint(endpoints[0].a);stage.dataset.result="";stage.dataset.keyboard="false";canvas.classList.remove("afl-invalid")};
  const solve=()=>{if(state.done||state.disposed)return false;paths.splice(0,paths.length,...clonePaths(solution));state.changes++;paint();return finishSuccess()};
  const showScene=scene=>{if(!context.qa||state.disposed)return false;stopFrame?.();reset();if(scene==="drag"){paths[0]=solution[0].slice(0,Math.min(3,solution[0].length)).map(clonePoint);state.drag=0;state.cursor=clonePoint(paths[0][paths[0].length-1]);setMessage("線を引いています");hint.textContent="線を引いています"}else if(scene==="progress"){paths[0]=clonePaths([solution[0]])[0];paths[1]=clonePaths([solution[1]])[0];if(solution[2])paths[2]=solution[2].slice(0,Math.max(2,Math.floor(solution[2].length/2))).map(clonePoint);state.cursor=clonePoint(paths[Math.min(2,paths.length-1)][paths[Math.min(2,paths.length-1)].length-1]);setMessage("2色完成・残り2色");hint.textContent="2色完成・残り2色"}else if(scene==="illegal"){paths[0]=solution[0].slice(0,Math.min(2,solution[0].length)).map(clonePoint);state.drag=0;state.cursor=clonePoint(paths[0][paths[0].length-1]);state.invalid=true;state.invalidCell=clonePoint(endpoints[1].a);canvas.classList.add("afl-invalid");setMessage("ほかの色の点には線を通せません","error");hint.textContent=""}else if(scene==="success"){paths.splice(0,paths.length,...clonePaths(solution));state.done=true;state.result="success";stage.dataset.result="success";endpoints.forEach((pair,index)=>addBurst(cx(pair.b.c),cy(pair.b.r),colorAt(index).light,14));setMessage(`${endpoints.length}色すべてをつなぎました！`,"success");hint.textContent="25マスすべて完成です"}else if(scene==="timeout"){paths[0]=clonePaths([solution[0]])[0];if(solution[1])paths[1]=solution[1].slice(0,Math.max(2,Math.floor(solution[1].length/2))).map(clonePoint);state.done=true;state.result="timeout";stage.dataset.result="timeout";setMessage("時間切れ。1色までつながりました","error");hint.textContent="線をつなぎ切れませんでした"}else{setMessage("指でなぞるか、矢印キーとEnterで色をつなぎます");hint.textContent="色の点から指をなぞってつなぎます"}paint();return true};
  const qaApi={start:startDrag,extend,moveTo,release,solve,showScene,solution:()=>clonePaths(solution),inspect:()=>({paths:clonePaths(paths),endpoints:endpoints.map(pair=>({color:pair.color,a:clonePoint(pair.a),b:clonePoint(pair.b)})),drag:state.drag,done:state.done,disposed:state.disposed,result:state.result,invalid:state.invalid,cursor:clonePoint(state.cursor),connected:endpoints.filter((pair,index)=>connected(index)).length,filled:filled(),changes:state.changes,frames:state.frames,status:status.textContent,canvas:{cssWidth:width,cssHeight:height,pixelWidth:canvas.width,pixelHeight:canvas.height,dpr}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;stopFrame?.();if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
