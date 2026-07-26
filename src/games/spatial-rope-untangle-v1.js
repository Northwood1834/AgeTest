const MIN_CROSSINGS=3;
const MAX_CROSSINGS=7;
const GENERATION_ATTEMPTS=400;
const COLORS=["#F2953F","#EA7E9B","#5FB6E0","#66C08C","#F2CE4B","#A66DC2","#7C8CC4"];
const PUBLISHED_FALLBACK_POINTS=[{x:.2,y:.2},{x:.8,y:.3},{x:.3,y:.8},{x:.75,y:.75},{x:.2,y:.5},{x:.55,y:.15}];

const metadata=Object.freeze({
  id:"spatial-rope-untangle-v1",
  introducedIn:"1.8",
  tier:2,
  flavor:"quirky",
  step:1,
  family:"spatial-rope-untangle",
  category:"spatial"
});

const clonePoints=points=>points.map(point=>({...point}));
const cycleEdges=nodes=>Array.from({length:nodes},(_,index)=>[index,(index+1)%nodes]);
const orientation=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const strictCross=(a,b,c,d)=>orientation(a,b,c)*orientation(a,b,d)<0&&orientation(c,d,a)*orientation(c,d,b)<0;

function crossingDetails(points,edges){
  const pairs=[],edgeSet=new Set(),locations=[];
  for(let first=0;first<edges.length;first++)for(let second=first+1;second<edges.length;second++){
    const[a,b]=edges[first],[c,d]=edges[second];
    if(a===c||a===d||b===c||b===d)continue;
    if(!strictCross(points[a],points[b],points[c],points[d]))continue;
    pairs.push([first,second]);edgeSet.add(first);edgeSet.add(second);
    const p=points[a],q=points[b],r=points[c],s=points[d],den=(p.x-q.x)*(r.y-s.y)-(p.y-q.y)*(r.x-s.x);
    const det1=p.x*q.y-p.y*q.x,det2=r.x*s.y-r.y*s.x;
    locations.push({x:(det1*(r.x-s.x)-(p.x-q.x)*det2)/den,y:(det1*(r.y-s.y)-(p.y-q.y)*det2)/den});
  }
  return{count:pairs.length,pairs,edgeSet,locations};
}

function convexSolution(nodes){
  return Array.from({length:nodes},(_,index)=>{const angle=-Math.PI/2+index*Math.PI*2/nodes;return{x:.5+Math.cos(angle)*.36,y:.5+Math.sin(angle)*.36}});
}

function minimumSeparation(points){
  let minimum=Infinity;
  for(let first=0;first<points.length;first++)for(let second=first+1;second<points.length;second++)minimum=Math.min(minimum,Math.hypot(points[first].x-points[second].x,points[first].y-points[second].y));
  return minimum;
}

function makeTask(points,edges){
  const start=crossingDetails(points,edges).count,nodes=points.length;
  return{kind:"ropeUntangle",prompt:"ロープの交差をゼロに",help:"杭をドラッグして動かします。交差した赤いロープがなくなれば成功です。",points:clonePoints(points),edges:edges.map(edge=>[...edge]),start,nodes,duration:70000,solution:convexSolution(nodes),difficulty:{crossings:[MIN_CROSSINGS,MAX_CROSSINGS],minimumPegGap:.16,convexRecovery:true}};
}

function generate({random,randomInt}){
  for(let attempt=0;attempt<GENERATION_ATTEMPTS;attempt++){
    const nodes=randomInt(6,7),edges=cycleEdges(nodes);
    if(nodes===7&&random()<.5)edges.push([0,3]);
    const points=Array.from({length:nodes},()=>({x:randomInt(18,82)/100,y:randomInt(16,84)/100}));
    if(minimumSeparation(points)<.16)continue;
    const count=crossingDetails(points,edges).count;
    if(count>=MIN_CROSSINGS&&count<=MAX_CROSSINGS)return makeTask(points,edges);
  }
  const points=[{x:.27,y:.24},{x:.39,y:.69},{x:.51,y:.5},{x:.79,y:.72},{x:.21,y:.52},{x:.2,y:.73}],edges=cycleEdges(6);
  const task=makeTask(points,edges);
  if(task.start<MIN_CROSSINGS||task.start>MAX_CROSSINGS)throw new Error(`${metadata.id}: authored fallback is invalid`);
  return task;
}

function publishedFallback(task){
  if(task?.solution!==undefined||task?.nodes!==6||task?.start!==2||task?.duration!==70000)return false;
  if(!Array.isArray(task.points)||task.points.length!==PUBLISHED_FALLBACK_POINTS.length)return false;
  return PUBLISHED_FALLBACK_POINTS.every((point,index)=>Object.keys(task.points[index]||{}).length===2&&task.points[index].x===point.x&&task.points[index].y===point.y)&&JSON.stringify(task.edges)===JSON.stringify(cycleEdges(6));
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="ropeUntangle")issues.push("kind must remain ropeUntangle");
  if(task.prompt!=="ロープの交差をゼロに")issues.push("prompt changed");
  if(task.nodes!==6&&task.nodes!==7)issues.push("nodes must be 6 or 7");
  if(!Array.isArray(task.points)||task.points.length!==task.nodes)issues.push("points must match nodes");
  const points=Array.isArray(task.points)?task.points:[];
  points.forEach((point,index)=>{if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y)||point.x<.05||point.x>.95||point.y<.05||point.y>.95)issues.push(`point ${index} must be inside the board`)});
  if(!Array.isArray(task.edges))issues.push("edges must be an array");
  const expected=task.nodes===6?cycleEdges(6):null,edges=Array.isArray(task.edges)?task.edges:[];
  edges.forEach((edge,index)=>{if(!Array.isArray(edge)||edge.length!==2||!edge.every(value=>Number.isInteger(value)&&value>=0&&value<task.nodes)||edge[0]===edge[1])issues.push(`edge ${index} is invalid`)});
  const validSeven=task.nodes===7&&(JSON.stringify(edges)===JSON.stringify(cycleEdges(7))||JSON.stringify(edges)===JSON.stringify([...cycleEdges(7),[0,3]]));
  if(task.nodes===6&&JSON.stringify(edges)!==JSON.stringify(expected))issues.push("six-peg edges must remain the published cycle");
  if(task.nodes===7&&!validSeven)issues.push("seven-peg edges must be the published cycle with optional 0-3 chord");
  const legacy=publishedFallback(task);
  if(points.length===task.nodes&&minimumSeparation(points)<.159&&!legacy)issues.push("pegs must begin at least 0.16 apart");
  if(!Number.isInteger(task.start)||(legacy?task.start!==2:task.start<MIN_CROSSINGS||task.start>MAX_CROSSINGS))issues.push(legacy?"published fallback start changed":`start must be ${MIN_CROSSINGS}-${MAX_CROSSINGS}`);
  if(task.duration!==70000)issues.push("duration must remain 70000ms");
  if(!issues.length){
    const actual=crossingDetails(points,edges).count;if(actual!==task.start)issues.push("start does not match strict segment intersections");
    const canonical=convexSolution(task.nodes);if(crossingDetails(canonical,edges).count!==0)issues.push("edge graph has no convex untangled placement");
    if(task.solution!==undefined){
      if(!Array.isArray(task.solution)||task.solution.length!==task.nodes||task.solution.some(point=>!Number.isFinite(point?.x)||!Number.isFinite(point?.y)))issues.push("solution must contain one point per peg");
      else if(crossingDetails(task.solution,edges).count!==0)issues.push("solution still contains crossings");
    }
  }
  return[...new Set(issues)];
}

const STYLE=`
.aru-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;padding:.3rem max(.25rem,env(safe-area-inset-left)) .2rem max(.25rem,env(safe-area-inset-right));display:grid;gap:.5rem;color:#3f3347}
.aru-status{min-height:2.7em;margin:0;padding:.52rem .72rem;border-radius:.8rem;background:#f3edf7;color:#5e4869;text-align:center;font-size:.96rem;font-weight:900;line-height:1.45}.aru-status.aru-error{background:#fff0f1;color:#932f42}.aru-status.aru-success{background:#e9f8ed;color:#276847}
.aru-board{position:relative;width:100%;overflow:hidden;border-radius:1.05rem;background:#eee7f5;box-shadow:0 9px 24px rgba(49,30,58,.18);touch-action:none}.aru-board.aru-invalid{box-shadow:0 0 0 4px #c64b60,0 9px 24px rgba(100,28,44,.26)}.aru-board.aru-done{box-shadow:0 0 0 4px #70bd88,0 10px 28px rgba(43,125,76,.27)}
.aru-canvas{display:block;width:100%;height:100%}.aru-pegs{position:absolute;inset:0}.aru-peg{box-sizing:border-box;position:absolute;display:grid;place-items:end center;border:2px solid #8c6b46;border-radius:50%;padding:0 0 .18rem;background:radial-gradient(circle at 34% 26%,#fff8e9 0 9%,#e9d4ad 38%,#b38b5d 72%,#7d5936 100%);color:#4f3724;font-size:.68rem;font-weight:950;line-height:1;box-shadow:inset 3px 3px 5px rgba(255,255,255,.55),inset -4px -5px 7px rgba(79,47,24,.24),0 5px 7px rgba(43,27,51,.28);touch-action:none;cursor:grab;transform:translate(-50%,-50%);transition:left .16s ease,top .16s ease,transform .14s ease,box-shadow .14s ease}
.aru-peg::before{content:"";position:absolute;left:31%;top:32%;width:10%;height:12%;border-radius:50%;background:#4d3929;box-shadow:1.05rem 0 0 #4d3929}.aru-peg::after{content:"⌣";position:absolute;left:50%;top:34%;transform:translateX(-50%);font-size:1rem;font-weight:950;color:#60452e}.aru-peg[aria-pressed=true]{z-index:4;transform:translate(-50%,-50%) scale(1.14);box-shadow:0 0 0 3px #fff,0 0 0 7px #663e7b,0 7px 13px rgba(43,27,51,.34)}.aru-peg.aru-dragging{z-index:9;transition:none;cursor:grabbing;transform:translate(-50%,-58%) scale(1.25);filter:brightness(1.08);box-shadow:0 0 0 3px #fff,0 0 0 8px #633878,0 16px 20px rgba(34,19,43,.48)}.aru-peg:focus-visible{outline:4px solid #fff;outline-offset:-6px;box-shadow:0 0 0 4px #633c78,0 6px 12px rgba(43,27,51,.35)}
.aru-board.aru-invalid::after{content:"杭が近すぎます";position:absolute;z-index:10;right:1rem;top:1rem;padding:.46rem .82rem;border-radius:999px;background:#a93249;color:#fff;font-size:.86rem;font-weight:950;box-shadow:0 4px 12px rgba(89,20,34,.3)}
.aru-board.aru-timeout{box-shadow:0 0 0 4px #9f4053,0 10px 28px rgba(71,24,39,.3);filter:saturate(.78)}.aru-board.aru-timeout::after{content:"時間切れ";position:absolute;inset:0;z-index:10;display:grid;place-items:center;background:rgba(56,28,45,.42);color:#fff;font-size:1.35rem;font-weight:950;letter-spacing:.08em;text-shadow:0 2px 5px rgba(0,0,0,.35);pointer-events:none}
.aru-controls{display:grid;grid-template-columns:repeat(4,1fr) 1.35fr;gap:.32rem}.aru-control{min-height:2.8rem;border:2px solid #cbb8d5;border-radius:.72rem;background:#fff;color:#563568;font-size:.96rem;font-weight:950}.aru-control:last-child{font-size:.84rem}.aru-control:disabled{opacity:1;background:#f3eef5;color:#84778a;border-color:#d9cfe0}.aru-control:focus-visible{outline:3px solid #68407e;outline-offset:2px}
.aru-progress{margin:0;text-align:center;color:#67576f;font-size:.9rem;font-weight:900}.aru-effects{position:absolute;inset:0;z-index:6;pointer-events:none}.aru-spark{position:absolute;left:50%;top:50%;width:.7rem;height:.7rem;margin:-.35rem;border-radius:50%;opacity:0;background:var(--spark);box-shadow:0 0 9px var(--spark)}.aru-effects.aru-celebrate .aru-spark{animation:aru-burst .85s ease-out both;animation-delay:var(--delay)}
@keyframes aru-burst{0%{opacity:0;transform:translate(0,0) scale(.2)}18%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.2)}}
.aru-stage[data-reduced=true] .aru-peg{transition:none}.aru-stage[data-reduced=true] .aru-spark{display:none}
@media(prefers-reduced-motion:reduce){.aru-peg{transition:none!important}.aru-spark{display:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="aru-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));
  const status=documentRef.createElement("p");status.className="aru-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="aru-board";
  const canvas=documentRef.createElement("canvas");canvas.className="aru-canvas";canvas.setAttribute("role","img");canvas.setAttribute("aria-label",`${task.nodes}本の杭を動かして、赤いロープの交差${task.start}本をなくすパズル`);
  const pegLayer=documentRef.createElement("div");pegLayer.className="aru-pegs";pegLayer.setAttribute("role","group");pegLayer.setAttribute("aria-label","動かせる杭");
  const effects=documentRef.createElement("div");effects.className="aru-effects";effects.setAttribute("aria-hidden","true");
  const sparkVectors=[[-92,-58],[-65,-88],[-30,-72],[0,-96],[34,-76],[68,-88],[92,-48],[82,-10],[94,32],[56,68],[18,86],[-22,78],[-58,88],[-86,48],[-98,8],[-70,-20]];
  sparkVectors.forEach(([dx,dy],index)=>{const spark=documentRef.createElement("i");spark.className="aru-spark";spark.style.setProperty("--dx",`${dx}px`);spark.style.setProperty("--dy",`${dy}px`);spark.style.setProperty("--delay",`${index%4*24}ms`);spark.style.setProperty("--spark",["#70C68C","#F2CE4B","#FFFFFF","#5FB6E0"][index%4]);effects.append(spark)});
  const controls=documentRef.createElement("div");controls.className="aru-controls";controls.setAttribute("aria-label","選択した杭の移動");
  const progress=documentRef.createElement("p");progress.className="aru-progress";
  board.append(canvas,pegLayer,effects);stage.append(status,board,controls,progress);context.host.replaceChildren(style,stage);
  const drawing=canvas.getContext("2d"),points=clonePoints(task.points),solution=task.solution?clonePoints(task.solution):convexSolution(task.nodes),pegButtons=[],controlButtons=[];
  const state={selected:-1,drag:-1,origin:null,invalid:false,done:false,disposed:false,best:task.start,changes:0};
  let width=390,height=370,clock=0,crossing=crossingDetails(points,task.edges),dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1));

  const pointPixels=point=>({x:point.x*width,y:point.y*height});
  const positionPegs=()=>pegButtons.forEach((button,index)=>{const{x,y}=pointPixels(points[index]),size=Math.max(46,width*.105);button.style.left=`${x}px`;button.style.top=`${y}px`;button.style.width=`${size}px`;button.style.height=`${size}px`;button.setAttribute("aria-pressed",String(state.selected===index));button.setAttribute("aria-label",`杭${index+1}。横${Math.round(points[index].x*100)}、縦${Math.round(points[index].y*100)}`)});
  const recount=()=>{crossing=crossingDetails(points,task.edges);state.best=Math.min(state.best,crossing.count)};
  const drawBackground=()=>{const gradient=drawing.createLinearGradient(0,0,width,height);gradient.addColorStop(0,"#FAF4FD");gradient.addColorStop(.52,"#EDE8F6");gradient.addColorStop(1,"#DDECF2");drawing.fillStyle=gradient;drawing.fillRect(0,0,width,height);drawing.fillStyle="rgba(255,255,255,.34)";for(let row=0;row<5;row++)for(let col=0;col<5;col++){drawing.beginPath();drawing.arc(width*(.1+col*.2),height*(.12+row*.2),Math.max(1,width*.004),0,Math.PI*2);drawing.fill()}};
  const drawRope=(edge,index)=>{const a=pointPixels(points[edge[0]]),b=pointPixels(points[edge[1]]),tangled=crossing.edgeSet.has(index),ropeWidth=width*.026,color=tangled?"#E34E4D":COLORS[index%COLORS.length];drawing.lineCap="round";drawing.strokeStyle="rgba(35,20,45,.25)";drawing.lineWidth=ropeWidth*1.65;drawing.beginPath();drawing.moveTo(a.x,a.y+ropeWidth*.35);drawing.lineTo(b.x,b.y+ropeWidth*.35);drawing.stroke();if(tangled){drawing.strokeStyle=`rgba(226,62,65,${.25+(context.reducedMotion?0:.18*(1+Math.sin(clock*.006)))})`;drawing.lineWidth=ropeWidth*2.15;drawing.beginPath();drawing.moveTo(a.x,a.y);drawing.lineTo(b.x,b.y);drawing.stroke()}drawing.strokeStyle=color;drawing.lineWidth=ropeWidth;drawing.beginPath();drawing.moveTo(a.x,a.y);drawing.lineTo(b.x,b.y);drawing.stroke();drawing.strokeStyle="rgba(255,255,255,.55)";drawing.lineWidth=ropeWidth*.25;drawing.beginPath();drawing.moveTo(a.x,a.y-ropeWidth*.14);drawing.lineTo(b.x,b.y-ropeWidth*.14);drawing.stroke()};
  const segmentAround=(edge,location,length)=>{const a=points[edge[0]],b=points[edge[1]],magnitude=Math.max(.0001,Math.hypot((b.x-a.x)*width,(b.y-a.y)*height)),ux=(b.x-a.x)*width/magnitude,uy=(b.y-a.y)*height/magnitude,{x,y}=pointPixels(location);return{x1:x-ux*length,y1:y-uy*length,x2:x+ux*length,y2:y+uy*length,ux,uy}};
  const strokeSegment=(segment,color,lineWidth,lineCap="round",offsetX=0,offsetY=0)=>{drawing.strokeStyle=color;drawing.lineWidth=lineWidth;drawing.lineCap=lineCap;drawing.beginPath();drawing.moveTo(segment.x1+offsetX,segment.y1+offsetY);drawing.lineTo(segment.x2+offsetX,segment.y2+offsetY);drawing.stroke()};
  const strokeBridge=(segment,color,lineWidth,lift,offsetY=0)=>{const midX=(segment.x1+segment.x2)/2-segment.uy*lift,midY=(segment.y1+segment.y2)/2+segment.ux*lift+offsetY;drawing.strokeStyle=color;drawing.lineWidth=lineWidth;drawing.lineCap="round";drawing.beginPath();drawing.moveTo(segment.x1,segment.y1+offsetY);drawing.quadraticCurveTo(midX,midY,segment.x2,segment.y2+offsetY);drawing.stroke()};
  const drawIntersections=()=>crossing.pairs.forEach((pair,index)=>{const ropeWidth=width*.026,location=crossing.locations[index],under=segmentAround(task.edges[pair[0]],location,ropeWidth*1.85),over=segmentAround(task.edges[pair[1]],location,ropeWidth*2.2);strokeSegment(under,"rgba(54,31,63,.5)",ropeWidth*1.78,"butt");drawing.save();drawing.globalCompositeOperation="destination-out";strokeSegment(under,"#000",ropeWidth*1.32,"butt");drawing.restore();strokeBridge(over,"rgba(48,19,29,.62)",ropeWidth*1.78,ropeWidth*.68,ropeWidth*.34);strokeBridge(over,"#F05B52",ropeWidth,ropeWidth*.68);strokeBridge(over,"rgba(255,255,255,.82)",ropeWidth*.23,ropeWidth*.82)});
  const paint=()=>{drawing.clearRect(0,0,width,height);drawBackground();task.edges.forEach(drawRope);drawIntersections();drawing.fillStyle=crossing.count?"#9B3045":"#28734B";drawing.font=`900 ${Math.round(width*.052)}px system-ui`;drawing.textBaseline="top";drawing.fillText(crossing.count?`交差 ${crossing.count}`:"交差なし！",width*.045,height*.035)};
  const paintProgress=()=>{progress.textContent=`交差 ${crossing.count}本　／　開始 ${task.start}本`};
  const refresh=()=>{positionPegs();paintProgress();const disabled=state.selected<0||state.done;controlButtons.forEach(button=>button.disabled=disabled);paint()};
  const resize=()=>{const rect=board.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{};width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*.94);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;board.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);refresh()};
  const tooClose=index=>points.some((point,other)=>other!==index&&Math.hypot(point.x-points[index].x,point.y-points[index].y)<.11);
  const reject=message=>{state.invalid=true;board.classList.add("aru-invalid");status.className="aru-status aru-error";status.textContent=message;context.later(()=>{state.invalid=false;board.classList.remove("aru-invalid");status.classList.remove("aru-error")},650)};
  const celebrate=()=>{board.classList.add("aru-done");status.className="aru-status aru-success";status.textContent=`交差${task.start}本をほどきました！`;effects.classList.add("aru-celebrate")};
  const finishSuccess=()=>{if(state.done||state.disposed||crossing.count)return false;state.done=true;celebrate();refresh();context.later(()=>context.finish(true,{quality:Math.max(0,Math.min(1,.7+(task.start-state.changes)*.04)),detail:`交差${task.start}本をほどきました。`}),context.reducedMotion?0:800);return true};
  const checkWin=()=>{recount();refresh();if(!crossing.count)finishSuccess()};
  const select=index=>{if(state.done||state.disposed||!Number.isInteger(index)||index<0||index>=points.length)return;state.selected=state.selected===index?-1:index;status.textContent=state.selected<0?"選択を解除しました":`杭${index+1}を選択。矢印またはドラッグで動かします`;refresh()};
  const moveSelected=(dx,dy)=>{if(state.selected<0||state.done)return false;const index=state.selected,before={...points[index]};points[index].x=Math.max(.06,Math.min(.94,points[index].x+dx));points[index].y=Math.max(.08,Math.min(.92,points[index].y+dy));if(tooClose(index)){points[index]=before;reject("ほかの杭に近すぎるため戻しました");refresh();return false}state.changes++;checkWin();return true};
  const alignSelected=()=>{if(state.selected<0||state.done)return false;points[state.selected]={...solution[state.selected]};state.changes++;checkWin();return true};
  const beginDrag=(index,event)=>{if(state.done)return;event.preventDefault();state.selected=index;state.drag=index;state.origin={...points[index]};pegButtons[index].classList.add("aru-dragging");try{pegButtons[index].setPointerCapture?.(event.pointerId)}catch{}status.textContent=`杭${index+1}を動かしています`;refresh()};
  const dragMove=(index,event)=>{if(state.drag!==index||state.done)return;event.preventDefault();const rect=board.getBoundingClientRect(),x=(event.clientX-rect.left)/Math.max(1,rect.width),y=(event.clientY-rect.top)/Math.max(1,rect.height);points[index].x=Math.max(.06,Math.min(.94,x));points[index].y=Math.max(.08,Math.min(.92,y));state.invalid=tooClose(index);board.classList.toggle?.("aru-invalid",state.invalid);recount();positionPegs();paintProgress();if(context.reducedMotion)paint()};
  const releaseDrag=index=>{if(state.drag!==index)return;pegButtons[index].classList.remove("aru-dragging");state.drag=-1;if(state.invalid){points[index]=state.origin;state.origin=null;reject("ほかの杭に近すぎるため元へ戻しました");recount();refresh();return}state.origin=null;state.changes++;checkWin();if(!state.done)status.textContent=`交差はあと${crossing.count}本です`};

  points.forEach((point,index)=>{const button=documentRef.createElement("button");button.type="button";button.className="aru-peg";button.textContent=String(index+1);context.listen(button,"pointerdown",event=>beginDrag(index,event));context.listen(button,"pointermove",event=>dragMove(index,event));context.listen(button,"pointerup",()=>releaseDrag(index));context.listen(button,"pointercancel",()=>releaseDrag(index));context.listen(button,"click",event=>{if(event.detail===0)select(index)});context.listen(button,"keydown",event=>{const delta=event.shiftKey?.08:.035;if(event.key==="ArrowLeft"){event.preventDefault();state.selected=index;moveSelected(-delta,0)}else if(event.key==="ArrowRight"){event.preventDefault();state.selected=index;moveSelected(delta,0)}else if(event.key==="ArrowUp"){event.preventDefault();state.selected=index;moveSelected(0,-delta)}else if(event.key==="ArrowDown"){event.preventDefault();state.selected=index;moveSelected(0,delta)}else if(event.key==="Home"){event.preventDefault();state.selected=index;alignSelected()}});pegButtons.push(button);pegLayer.append(button)});
  const actions=[[-.035,0,"←"],[0,-.035,"↑"],[0,.035,"↓"],[.035,0,"→"],[0,0,"外周へ"]];
  actions.forEach(([dx,dy,label],index)=>{const button=documentRef.createElement("button");button.type="button";button.className="aru-control";button.textContent=label;const act=()=>index===4?alignSelected():moveSelected(dx,dy);context.listen(button,"pointerdown",event=>{event.preventDefault();act()});context.listen(button,"click",event=>{if(event.detail===0)act()});context.listen(button,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();act()}});controlButtons.push(button);controls.append(button)});
  if(view)context.listen(view,"resize",resize,{passive:true});
  status.textContent="杭をドラッグして赤い交差をほどきます";recount();resize();pegButtons[0].focus({preventScroll:true});
  if(!context.reducedMotion)context.frame(time=>{if(state.disposed||state.done)return false;clock=time;paint();return true});
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;board.classList.add("aru-timeout");status.className="aru-status aru-error";refresh();status.textContent=`時間切れ。交差が${crossing.count}本残りました`;context.finish(false,{detail:`時間切れ。交差は${crossing.count}本残っていました。`})});
  const qaApi={select,move:moveSelected,align:alignSelected,release:index=>releaseDrag(index),solve(){if(state.done)return false;points.splice(0,points.length,...clonePoints(solution));state.changes++;checkWin();return true},inspect:()=>({points:clonePoints(points),crossings:crossing.count,pairs:crossing.pairs.map(pair=>[...pair]),selected:state.selected,drag:state.drag,invalid:state.invalid,best:state.best,changes:state.changes,done:state.done,disposed:state.disposed,canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr},status:status.textContent})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
