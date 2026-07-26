const SIZE=5;
const EXIT_ROW=2;
const MIN_MOVES=4;
const MAX_MOVES=8;
const SPARE_MOVES=3;
const GENERATION_ATTEMPTS=360;
const SEARCH_NODE_LIMIT=60000;
const PROOF_CACHE_LIMIT=16;
const COLORS=["#EA6A5C","#5FB6E0","#66C08C","#F2CE4B","#A66DC2","#F2953F","#7C8CC4"];
const PUBLISHED_FALLBACK_CARS=[
  {r:2,c:0,len:2,dir:"h",color:COLORS[0],hero:true},
  {r:0,c:3,len:3,dir:"v",color:COLORS[1]},
  {r:3,c:1,len:2,dir:"h",color:COLORS[2]}
];
// The published len-3 blocker can never leave row 2. Rendering the exact saved
// descriptor with a len-2 blocker recovers its intended two-move puzzle.
const PUBLISHED_RECOVERY_CARS=[
  {...PUBLISHED_FALLBACK_CARS[0]},
  {...PUBLISHED_FALLBACK_CARS[1],len:2},
  {...PUBLISHED_FALLBACK_CARS[2]}
];

const metadata=Object.freeze({
  id:"spatial-park-jam-v1",
  introducedIn:"1.7",
  tier:3,
  flavor:"satisfying",
  step:1,
  family:"spatial-park-jam",
  category:"spatial"
});

const cloneCars=cars=>cars.map(car=>({...car}));
const stateKey=cars=>cars.map(car=>`${car.r},${car.c}`).join("|");
const solved=cars=>cars[0].c+cars[0].len-1>=SIZE-1;

function buildGrid(cars){
  const grid=Array.from({length:SIZE},()=>Array(SIZE).fill(-1));
  for(let index=0;index<cars.length;index++){
    const car=cars[index];
    for(let offset=0;offset<car.len;offset++){
      const r=car.r+(car.dir==="v"?offset:0),c=car.c+(car.dir==="h"?offset:0);
      if(r<0||r>=SIZE||c<0||c>=SIZE||grid[r][c]!==-1)return null;
      grid[r][c]=index;
    }
  }
  return grid;
}

function legalMoves(cars,indexFilter=null){
  const grid=buildGrid(cars),moves=[];
  if(!grid)return moves;
  cars.forEach((car,index)=>{
    if(indexFilter!==null&&index!==indexFilter)return;
    for(const step of[-1,1]){
      for(let distance=1;distance<SIZE;distance++){
        const shift=step*distance;
        const checkR=car.dir==="v"?(step>0?car.r+car.len-1+shift:car.r+shift):car.r;
        const checkC=car.dir==="h"?(step>0?car.c+car.len-1+shift:car.c+shift):car.c;
        if(checkR<0||checkR>=SIZE||checkC<0||checkC>=SIZE||grid[checkR][checkC]!==-1)break;
        moves.push({index,step,distance});
      }
    }
  });
  return moves;
}

function applyKnownMove(cars,move){
  const next=cloneCars(cars),car=next[move.index],shift=move.step*move.distance;
  if(car.dir==="h")car.c+=shift;else car.r+=shift;
  return next;
}

function applyMove(cars,move){
  if(!move||!legalMoves(cars,move.index).some(option=>option.index===move.index&&option.step===move.step&&option.distance===move.distance))return null;
  return applyKnownMove(cars,move);
}

function findSolution(initial,maxDepth=MAX_MOVES){
  if(solved(initial))return[];
  const queue=[{cars:cloneCars(initial),path:[]}],seen=new Set([stateKey(initial)]);
  let nodes=0;
  for(let cursor=0;cursor<queue.length;cursor++){
    const current=queue[cursor];
    if(current.path.length>=maxDepth)continue;
    for(const move of legalMoves(current.cars)){
      const cars=applyKnownMove(current.cars,move),path=[...current.path,{...move}];
      if(solved(cars))return path;
      const key=stateKey(cars);
      if(seen.has(key))continue;
      seen.add(key);queue.push({cars,path});nodes++;
      if(nodes>=SEARCH_NODE_LIMIT)return null;
    }
  }
  return null;
}

const proofCache=new Map();
const proofKey=task=>JSON.stringify([task.cars,task.minMoves,task.moveLimit,task.solution]);
const rememberProof=(task,solution)=>{
  const key=proofKey(task);proofCache.delete(key);proofCache.set(key,solution.map(move=>({...move})));
  if(proofCache.size>PROOF_CACHE_LIMIT)proofCache.delete(proofCache.keys().next().value);
};

function makeTask(cars,solution){
  const task={
    kind:"parkJam",
    prompt:"赤い車を出口へ",
    help:"車を選び、動かしたいマスをタップ。車は向いている方向にだけ動き、1回のスライドを1手と数えます。",
    cars:cloneCars(cars),
    minMoves:solution.length,
    moveLimit:solution.length+SPARE_MOVES,
    duration:75000,
    solution:solution.map(move=>({...move})),
    difficulty:{size:SIZE,exitRow:EXIT_ROW,minMoves:[MIN_MOVES,MAX_MOVES],spareMoves:SPARE_MOVES}
  };
  rememberProof(task,solution);
  return task;
}

function generate({random,randomInt}){
  for(let attempt=0;attempt<GENERATION_ATTEMPTS;attempt++){
    const cars=[{r:EXIT_ROW,c:randomInt(0,1),len:2,dir:"h",color:COLORS[0],hero:true}];
    const blockers=randomInt(4,6);
    for(let index=0;index<blockers;index++){
      for(let placement=0;placement<28;placement++){
        const dir=random()<.55?"v":"h",len=randomInt(2,3);
        const r=dir==="v"?randomInt(0,SIZE-len):randomInt(0,SIZE-1);
        const c=dir==="h"?randomInt(0,SIZE-len):randomInt(0,SIZE-1);
        if(dir==="h"&&r===EXIT_ROW)continue;
        const candidate={r,c,len,dir,color:COLORS[(index+1)%COLORS.length]};
        if(buildGrid([...cars,candidate])){cars.push(candidate);break}
      }
    }
    if(cars.length<5)continue;
    const solution=findSolution(cars);
    if(solution&&solution.length>=MIN_MOVES&&solution.length<=MAX_MOVES)return makeTask(cars,solution);
  }
  const cars=[
    {r:2,c:0,len:2,dir:"h",color:COLORS[0],hero:true},
    {r:1,c:2,len:2,dir:"v",color:COLORS[1]},
    {r:4,c:1,len:2,dir:"h",color:COLORS[2]},
    {r:2,c:3,len:2,dir:"v",color:COLORS[3]},
    {r:0,c:2,len:3,dir:"h",color:COLORS[4]},
    {r:0,c:0,len:2,dir:"v",color:COLORS[5]},
    {r:1,c:4,len:2,dir:"v",color:COLORS[6]}
  ];
  const solution=findSolution(cars);
  if(!solution||solution.length<MIN_MOVES||solution.length>MAX_MOVES)throw new Error(`${metadata.id}: authored fallback is invalid`);
  return makeTask(cars,solution);
}

function publishedFallback(task){
  if(task?.solution!==undefined||task?.minMoves!==2||task?.moveLimit!==5)return false;
  const expected=PUBLISHED_FALLBACK_CARS;
  return Array.isArray(task.cars)&&task.cars.length===expected.length&&expected.every((car,index)=>{
    const actual=task.cars[index];return actual&&Object.keys(actual).length===Object.keys(car).length&&Object.entries(car).every(([key,value])=>actual[key]===value);
  });
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="parkJam")issues.push("kind must remain parkJam");
  if(task.prompt!=="赤い車を出口へ")issues.push("prompt changed");
  if(!Array.isArray(task.cars)||task.cars.length<3||task.cars.length>7)issues.push("cars must contain 3-7 vehicles");
  const cars=Array.isArray(task.cars)?task.cars:[];
  cars.forEach((car,index)=>{
    if(!Number.isInteger(car?.r)||!Number.isInteger(car?.c))issues.push(`car ${index} position must be integral`);
    if(car?.dir!=="h"&&car?.dir!=="v")issues.push(`car ${index} direction must be h or v`);
    if(car?.len!==2&&car?.len!==3)issues.push(`car ${index} length must be 2 or 3`);
    if(typeof car?.color!=="string"||!/^#[0-9A-F]{6}$/i.test(car.color))issues.push(`car ${index} color must be a hex color`);
  });
  const hero=cars[0];
  if(!hero||hero.hero!==true||hero.dir!=="h"||hero.len!==2||hero.r!==EXIT_ROW||hero.color!==COLORS[0])issues.push("car 0 must be the red horizontal hero on the exit row");
  if(cars.slice(1).some(car=>car?.hero===true))issues.push("only car 0 may be the hero");
  if(cars.slice(1).some(car=>car?.dir==="h"&&car.r===EXIT_ROW))issues.push("only the hero may occupy the exit row horizontally");
  if(cars.length&&buildGrid(cars)===null)issues.push("cars must be in bounds without collisions");
  const legacy=publishedFallback(task);
  if(!Number.isInteger(task.minMoves)||(legacy?task.minMoves!==2:task.minMoves<MIN_MOVES||task.minMoves>MAX_MOVES))issues.push(legacy?"published fallback minMoves changed":`minMoves must be ${MIN_MOVES}-${MAX_MOVES}`);
  if(task.moveLimit!==task.minMoves+SPARE_MOVES)issues.push(`moveLimit must equal minMoves + ${SPARE_MOVES}`);
  if(task.duration!==75000)issues.push("duration must remain 75000ms");
  if(!issues.length&&!legacy){
    const shortest=proofCache.get(proofKey(task))||findSolution(cars,Math.max(MAX_MOVES,task.minMoves));
    if(!shortest)issues.push("layout has no solution within the authored bound");
    else if(shortest.length!==task.minMoves)issues.push("minMoves does not match exhaustive search");
    if(task.solution!==undefined){
      if(!Array.isArray(task.solution)||task.solution.length!==task.minMoves)issues.push("solution must be a shortest path");
      else{
        let replay=cloneCars(cars),legal=true;
        for(const move of task.solution){const next=applyMove(replay,move);if(!next){legal=false;break}replay=next}
        if(!legal)issues.push("solution contains an illegal move");
        else if(!solved(replay))issues.push("solution does not move the hero to the exit");
      }
    }
  }
  return[...new Set(issues)];
}

const STYLE=`
.apj-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;padding-block:.35rem;padding-left:max(.25rem,env(safe-area-inset-left));padding-right:max(.25rem,env(safe-area-inset-right));display:grid;gap:.55rem;color:#3d3344}
.apj-status{min-height:2.5em;margin:0;padding:.5rem .65rem;border-radius:.8rem;background:#f4eef8;text-align:center;font-size:.9rem;font-weight:850;line-height:1.35}
.apj-board{position:relative;width:100%;border-radius:1rem;overflow:hidden;background:#eee5f5;box-shadow:0 8px 22px rgba(49,30,58,.16);touch-action:manipulation}
.apj-canvas{display:block;width:100%;height:100%}.apj-cars{position:absolute;inset:0}.apj-car{position:absolute;border:2px solid rgba(41,27,50,.48);border-radius:.65rem;background:linear-gradient(145deg,color-mix(in srgb,var(--car) 75%,white),var(--car));box-shadow:inset 0 0 0 3px rgba(255,255,255,.22),0 3px 7px rgba(24,15,29,.3);color:#fff;font-size:clamp(.85rem,3.6vw,1.05rem);font-weight:950;text-shadow:0 1px 3px rgba(0,0,0,.58);cursor:pointer;touch-action:none;transition:left .2s ease,top .2s ease,transform .16s ease,box-shadow .16s ease}
.apj-car::before{content:"";position:absolute;inset:24%;border-radius:.3rem;background:rgba(31,24,42,.5);box-shadow:inset 0 0 0 2px rgba(255,255,255,.36)}
.apj-car span{position:relative;z-index:1}.apj-car:focus-visible{outline:4px solid #fff;outline-offset:-7px;box-shadow:0 0 0 4px #5b3473,0 5px 10px rgba(0,0,0,.3)}
.apj-car[aria-pressed=true]{transform:scale(1.055);box-shadow:0 0 0 3px #fff,0 0 0 6px #68407e,0 7px 14px rgba(0,0,0,.32)}
.apj-car.apj-dragging{z-index:3;transition:none;filter:brightness(1.08);cursor:grabbing}
.apj-car.apj-escape{transform:translateX(125%);opacity:.18}.apj-board.apj-invalid{animation:apj-shake .28s ease;box-shadow:0 0 0 4px #c84f5f,0 8px 22px rgba(117,35,51,.24)}
.apj-board.apj-invalid::after{content:"移動できません";position:absolute;right:.65rem;top:.55rem;z-index:8;padding:.3rem .62rem;border-radius:999px;background:#a93349;color:#fff;font-size:.78rem;font-weight:950;box-shadow:0 3px 9px rgba(88,20,34,.28)}
.apj-board.apj-invalid .apj-car[aria-pressed=true]{box-shadow:0 0 0 3px #fff0f1,0 0 0 7px #c23f55,0 7px 14px rgba(75,18,31,.35)}.apj-status.apj-error{background:#fff0f1;color:#922d40}
.apj-board.apj-success{box-shadow:0 0 0 4px #f2ce4b,0 8px 26px rgba(190,137,24,.32)}.apj-status.apj-success-text{background:#fff5bd;color:#664a08}
.apj-effects{position:absolute;inset:0;z-index:6;pointer-events:none}.apj-exit{box-sizing:border-box;position:absolute;z-index:7;display:grid;place-items:center;border:2px solid rgba(111,76,20,.35);border-radius:.48rem;background:#f2ce4b;color:#513a15;font-size:.82rem;font-weight:950;line-height:1;box-shadow:0 3px 8px rgba(89,60,12,.22);pointer-events:none}.apj-impact,.apj-spark{position:absolute;left:var(--exit-x);top:var(--exit-y);opacity:0}.apj-impact{width:1px;height:1px;border-radius:50%;box-shadow:0 0 0 0 rgba(255,220,70,.98)}.apj-impact::before{content:"✦";position:absolute;left:0;top:0;color:#fff5a3;font-size:3.8rem;font-weight:950;line-height:1;text-shadow:0 0 9px #f2b91f,0 0 20px #ffd843;transform:translate(-50%,-50%)}
.apj-spark{width:.78rem;height:.78rem;margin:-.39rem;border-radius:32% 68% 45% 55%;background:var(--spark,#f2ce4b);box-shadow:0 0 10px color-mix(in srgb,var(--spark,#f2ce4b) 82%,white)}
.apj-effects.apj-celebrate .apj-impact{animation:apj-impact .82s ease-out both}.apj-effects.apj-celebrate .apj-spark{animation:apj-burst .86s cubic-bezier(.1,.7,.2,1) both;animation-delay:var(--delay,0ms)}
.apj-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.35rem}.apj-move{min-height:2.85rem;border:2px solid #c9b4d5;border-radius:.75rem;background:#fff;color:#513165;font-size:.9rem;font-weight:950}.apj-move:focus-visible{outline:3px solid #68407e;outline-offset:2px}.apj-move:disabled{opacity:1;background:#f3eef5;color:#817287;border-color:#d8cddd}
.apj-progress{margin:0;text-align:center;color:#65586d;font-size:.84rem;font-weight:850}
@keyframes apj-shake{25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
@keyframes apj-impact{0%{opacity:1;box-shadow:0 0 0 0 rgba(255,224,73,.98);transform:scale(.55)}55%{opacity:1;box-shadow:0 0 0 3rem rgba(255,213,58,.32);transform:scale(1.12)}100%{opacity:0;box-shadow:0 0 0 3.8rem rgba(255,213,58,0);transform:scale(1.3)}}
@keyframes apj-burst{0%{opacity:0;transform:translate(0,0) scale(.3)}18%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.15)}}
.apj-stage[data-reduced=true] .apj-car{transition:none}.apj-stage[data-reduced=true] .apj-board{animation:none}.apj-stage[data-reduced=true] .apj-spark{display:none}.apj-stage[data-reduced=true] .apj-effects.apj-celebrate .apj-impact{animation:none;opacity:.7;box-shadow:0 0 0 2rem rgba(255,213,58,.2)}
@media(prefers-reduced-motion:reduce){.apj-car{transition:none!important}.apj-board{animation:none!important}.apj-spark{display:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView;
  const style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="apj-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));
  const status=documentRef.createElement("p");status.className="apj-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="apj-board";
  const canvas=documentRef.createElement("canvas");canvas.className="apj-canvas";canvas.setAttribute("role","img");canvas.setAttribute("aria-label","5×5の駐車場。赤いGOの車を右の出口へ動かすパズル");
  const carLayer=documentRef.createElement("div");carLayer.className="apj-cars";carLayer.setAttribute("role","group");carLayer.setAttribute("aria-label","駐車中の車");
  const effects=documentRef.createElement("div");effects.className="apj-effects";effects.setAttribute("aria-hidden","true");
  const impact=documentRef.createElement("i");impact.className="apj-impact";effects.append(impact);
  const sparkVectors=[[-108,-58],[-84,-88],[-55,-68],[-30,-104],[-4,-78],[18,-104],[38,-70],[45,-34],[40,14],[24,57],[-4,82],[-35,68],[-66,86],[-88,48],[-114,22],[-96,-16]];
  sparkVectors.forEach(([dx,dy],index)=>{const spark=documentRef.createElement("i");spark.className="apj-spark";spark.style.setProperty("--dx",`${dx}px`);spark.style.setProperty("--dy",`${dy}px`);spark.style.setProperty("--delay",`${index%3*28}ms`);spark.style.setProperty("--spark",["#F2CE4B","#FFD86A","#FFFFFF","#F2953F"][index%4]);effects.append(spark)});
  const exitBadge=documentRef.createElement("span");exitBadge.className="apj-exit";exitBadge.textContent="出口";exitBadge.setAttribute("aria-hidden","true");
  const controls=documentRef.createElement("div");controls.className="apj-controls";controls.setAttribute("aria-label","選択した車の移動先");
  const progress=documentRef.createElement("p");progress.className="apj-progress";
  board.append(canvas,carLayer,effects,exitBadge);stage.append(status,board,controls,progress);context.host.replaceChildren(style,stage);
  const recoveredLegacy=publishedFallback(task),drawing=canvas.getContext("2d"),cars=cloneCars(recoveredLegacy?PUBLISHED_RECOVERY_CARS:task.cars),buttons=[],moveButtons=[];
  const state={selected:-1,moves:0,busy:false,done:false,disposed:false,drag:null,recoveredLegacy};
  let width=390,height=400,cell=60,padX=20,padY=50,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1));

  const carLabel=(car,index)=>`${car.hero?"赤い脱出車":"車"}${index+1}。${car.dir==="h"?"横向き":"縦向き"}${car.len}マス。${car.dir==="h"?`${car.r+1}行${car.c+1}列から`:`${car.c+1}列${car.r+1}行から`}`;
  const positionButtons=()=>buttons.forEach((button,index)=>{const car=cars[index];button.style.left=`${padX+car.c*cell+cell*.07}px`;button.style.top=`${padY+car.r*cell+cell*.07}px`;button.style.width=`${(car.dir==="h"?car.len:1)*cell-cell*.14}px`;button.style.height=`${(car.dir==="v"?car.len:1)*cell-cell*.14}px`;button.setAttribute("aria-label",carLabel(car,index));button.setAttribute("aria-pressed",String(state.selected===index))});
  const paintLot=()=>{
    drawing.clearRect(0,0,width,height);const lotX=padX-cell*.12,lotY=padY-cell*.12,lotW=cell*SIZE+cell*.24;
    drawing.fillStyle="#494252";drawing.beginPath();drawing.roundRect(lotX,lotY,lotW,lotW,cell*.18);drawing.fill();
    drawing.fillStyle="#5C5567";drawing.beginPath();drawing.roundRect(padX,padY,cell*SIZE,cell*SIZE,cell*.08);drawing.fill();
    drawing.strokeStyle="rgba(255,255,255,.25)";drawing.lineWidth=Math.max(1,cell*.025);
    for(let line=1;line<SIZE;line++){drawing.beginPath();drawing.moveTo(padX+line*cell,padY);drawing.lineTo(padX+line*cell,padY+SIZE*cell);drawing.stroke();drawing.beginPath();drawing.moveTo(padX,padY+line*cell);drawing.lineTo(padX+SIZE*cell,padY+line*cell);drawing.stroke()}
    const exitX=padX+SIZE*cell,exitY=padY+EXIT_ROW*cell;drawing.fillStyle="#F2CE4B";drawing.beginPath();drawing.roundRect(exitX+cell*.03,exitY+cell*.14,cell*.62,cell*.72,cell*.11);drawing.fill();drawing.strokeStyle="rgba(111,76,20,.35)";drawing.lineWidth=Math.max(1,cell*.025);drawing.stroke();drawing.fillStyle="#513A15";drawing.font=`900 ${Math.round(cell*.25)}px system-ui`;drawing.textAlign="center";drawing.textBaseline="middle";drawing.fillText("出口",exitX+cell*.34,exitY+cell*.5);drawing.textAlign="left";
  };
  const paintProgress=()=>{progress.textContent=`あと ${Math.max(0,task.moveLimit-state.moves)}手　／　最短 ${task.minMoves}手`};
  const refreshControls=()=>{
    const options=state.selected<0?[]:legalMoves(cars,state.selected);
    moveButtons.forEach((button,index)=>{const move=options[index];button.disabled=!move||state.busy||state.done;button._move=move||null;button.textContent=move?`${move.step<0?(cars[move.index].dir==="h"?"←":"↑"):(cars[move.index].dir==="h"?"→":"↓")} ${move.distance}マス`:"—";button.setAttribute("aria-label",move?`選択中の車を${move.step<0?"後ろ":"前"}へ${move.distance}マス動かす`:"移動できません")});
  };
  const paint=()=>{paintLot();positionButtons();paintProgress();refreshControls()};
  const resize=()=>{const rect=board.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{};width=Math.max(300,Math.min(430,Math.round(rect.width||context.viewport?.width||390)));height=Math.round(width*1.04);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;board.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);cell=Math.floor(Math.min(width*.82,height*.78)/SIZE);padX=Math.round(Math.max(12,(width-cell*(SIZE+.7))/2));padY=Math.round(height*.13);effects.style.setProperty("--exit-x",`${padX+(SIZE-.08)*cell}px`);effects.style.setProperty("--exit-y",`${padY+(EXIT_ROW+.5)*cell}px`);exitBadge.style.left=`${padX+(SIZE+.03)*cell}px`;exitBadge.style.top=`${padY+(EXIT_ROW+.14)*cell}px`;exitBadge.style.width=`${cell*.62}px`;exitBadge.style.height=`${cell*.72}px`;paint()};
  const reject=message=>{status.textContent=message;status.classList.add("apj-error");board.classList.remove("apj-invalid");void board.offsetWidth;board.classList.add("apj-invalid");context.later(()=>{board.classList.remove("apj-invalid");status.classList.remove("apj-error")},650)};
  const finishMove=(index)=>{
    if(state.disposed||state.done)return;state.busy=false;paint();
    if(solved(cars)){state.done=true;refreshControls();status.textContent=`${state.moves}手で脱出！`;status.classList.add("apj-success-text");board.classList.add("apj-success");buttons[0].classList.add("apj-escape");effects.classList.add("apj-celebrate");context.later(()=>context.finish(true,{quality:Math.max(0,Math.min(1,1-(state.moves-task.minMoves)/(SPARE_MOVES+1))),detail:`${state.moves}手で脱出。最短は${task.minMoves}手です。`}),context.reducedMotion?0:800)}
    else if(state.moves>=task.moveLimit){state.done=true;refreshControls();status.textContent="手数を使い切りました";context.finish(false,{detail:`手数上限は${task.moveLimit}手。最短${task.minMoves}手で脱出できます。`})}
    else{status.textContent=`車${index+1}を移動しました。次の車を選んでください`;refreshControls()}
  };
  const moveCar=move=>{
    if(state.done||state.disposed||state.busy||!move)return false;
    const next=applyMove(cars,move);if(!next){reject("その位置へは動かせません");return false}
    cars.splice(0,cars.length,...next);state.moves++;state.busy=true;state.drag=null;state.selected=move.index;positionButtons();paintProgress();refreshControls();status.textContent=`車${move.index+1}を動かしています`;context.later(()=>finishMove(move.index),context.reducedMotion?0:220);return true;
  };
  const select=index=>{if(state.done||state.disposed||state.busy||!Number.isInteger(index)||index<0||index>=cars.length)return;state.selected=state.selected===index?-1:index;status.textContent=state.selected<0?"選択を解除しました":`車${index+1}を選択。移動先をタップしてください`;positionButtons();refreshControls()};
  const beginDrag=(index,event)=>{
    select(index);if(!Number.isFinite(event.clientX)||!Number.isFinite(event.clientY)||state.done||state.busy)return;
    state.selected=index;state.drag={index,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,offset:0};buttons[index].classList.add("apj-dragging");try{buttons[index].setPointerCapture?.(event.pointerId)}catch{}positionButtons();refreshControls();status.textContent=`車${index+1}を指でスライドできます`;
  };
  const updateDrag=event=>{const drag=state.drag;if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const car=cars[drag.index],raw=car.dir==="h"?event.clientX-drag.startX:event.clientY-drag.startY,limit=cell*(SIZE-car.len);drag.offset=Math.max(-limit,Math.min(limit,raw));buttons[drag.index].style.transform=car.dir==="h"?`translateX(${drag.offset}px) scale(1.055)`:`translateY(${drag.offset}px) scale(1.055)`};
  const endDrag=event=>{const drag=state.drag;if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();const button=buttons[drag.index],car=cars[drag.index],step=Math.sign(drag.offset),wanted=Math.max(1,Math.round(Math.abs(drag.offset)/cell));button.classList.remove("apj-dragging");button.style.transform="";state.drag=null;if(Math.abs(drag.offset)<cell*.22){positionButtons();return}const options=legalMoves(cars,drag.index).filter(move=>move.step===step);if(!options.length){reject("ほかの車が道をふさいでいます");positionButtons();return}const move=options.reduce((best,option)=>Math.abs(option.distance-wanted)<Math.abs(best.distance-wanted)?option:best,options[0]);moveCar(move)};
  const cancelDrag=event=>{if(!state.drag||event.pointerId!==state.drag.pointerId)return;const button=buttons[state.drag.index];button.classList.remove("apj-dragging");button.style.transform="";state.drag=null;positionButtons()};
  const cellFromEvent=event=>{const rect=canvas.getBoundingClientRect(),scaleX=width/Math.max(1,rect.width),scaleY=height/Math.max(1,rect.height),c=Math.floor(((event.clientX-rect.left)*scaleX-padX)/cell),r=Math.floor(((event.clientY-rect.top)*scaleY-padY)/cell);return r>=0&&r<SIZE&&c>=0&&c<SIZE?{r,c}:null};
  const chooseCell=(r,c)=>{
    if(state.done||state.disposed||state.busy)return;
    const grid=buildGrid(cars),index=grid?.[r]?.[c]??-1;if(index>=0){select(index);return}
    if(state.selected<0){reject("先に動かす車を選んでください");return}
    const car=cars[state.selected];if((car.dir==="h"&&r!==car.r)||(car.dir==="v"&&c!==car.c)){reject("車は向いている方向にだけ動かせます");return}
    const wanted=car.dir==="h"?c-car.c:r-car.r,step=Math.sign(wanted),distance=Math.abs(wanted);
    const options=legalMoves(cars,state.selected).filter(move=>move.step===step);
    if(!options.length){reject("ほかの車が道をふさいでいます");return}
    const move=options.reduce((best,option)=>Math.abs(option.distance-distance)<Math.abs(best.distance-distance)?option:best,options[0]);moveCar(move);
  };

  cars.forEach((car,index)=>{const button=documentRef.createElement("button"),label=documentRef.createElement("span");button.type="button";button.className="apj-car";button.style.setProperty("--car",car.color);label.textContent=car.hero?"GO":String(index+1);button.append(label);context.listen(button,"pointerdown",event=>{event.preventDefault();event.stopPropagation();beginDrag(index,event)});context.listen(button,"pointermove",updateDrag);context.listen(button,"pointerup",endDrag);context.listen(button,"pointercancel",cancelDrag);context.listen(button,"click",event=>{if(event.detail===0)select(index)});context.listen(button,"keydown",event=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)){const negative=event.key==="ArrowLeft"||event.key==="ArrowUp",options=legalMoves(cars,index).filter(move=>negative?move.step<0:move.step>0);if(options.length){event.preventDefault();state.selected=index;refreshControls();const target=moveButtons.find(control=>control._move&&control._move.step===options[0].step);target?.focus({preventScroll:true})}}});buttons.push(button);carLayer.append(button)});
  for(let index=0;index<4;index++){const button=documentRef.createElement("button");button.type="button";button.className="apj-move";context.listen(button,"pointerdown",event=>{event.preventDefault();moveCar(button._move)});context.listen(button,"click",event=>{if(event.detail===0)moveCar(button._move)});context.listen(button,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();moveCar(button._move)}});moveButtons.push(button);controls.append(button)}
  context.listen(canvas,"pointerdown",event=>{event.preventDefault();const spot=cellFromEvent(event);if(spot)chooseCell(spot.r,spot.c)});
  if(view)context.listen(view,"resize",resize,{passive:true});
  status.textContent="車をタップして選んでください";resize();buttons[0].focus({preventScroll:true});
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;refreshControls();status.textContent="時間切れです";context.finish(false,{detail:`時間切れ。最短${task.minMoves}手で出せる配置でした。`})});
  const qaApi={select,chooseCell,move:moveCar,inspect:()=>({cars:cloneCars(cars),selected:state.selected,moves:state.moves,busy:state.busy,dragging:state.drag?.index??-1,done:state.done,disposed:state.disposed,recoveredLegacy:state.recoveredLegacy,status:status.textContent,canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;state.busy=false;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
