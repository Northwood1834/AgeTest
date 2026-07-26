const CAPACITY=4;
const BOTTLE_COUNT=5;
const COLOR_COUNT=3;
const MIN_MOVES=4;
const MAX_MOVES=7;
const SPARE_MOVES=3;
const MAX_GENERATION_ATTEMPTS=192;
const MAX_SEARCH_NODES=30000;

const COLORS=Object.freeze([
  Object.freeze({key:"orange",label:"オレンジ",fill:"#E99732",edge:"#965B16",pattern:"diagonal"}),
  Object.freeze({key:"pink",label:"ピンク",fill:"#DF6E91",edge:"#963C5C",pattern:"dots"}),
  Object.freeze({key:"blue",label:"ブルー",fill:"#4D91C7",edge:"#2A608A",pattern:"grid"}),
  Object.freeze({key:"green",label:"グリーン",fill:"#4FA878",edge:"#286A4B",pattern:"waves"}),
  Object.freeze({key:"yellow",label:"イエロー",fill:"#D8B229",edge:"#876B11",pattern:"bars"}),
  Object.freeze({key:"purple",label:"パープル",fill:"#9668BA",edge:"#5D3C79",pattern:"cross"})
]);

const metadata=Object.freeze({
  id:"attention-water-sort-v1",
  introducedIn:"1.5",
  tier:2,
  flavor:"satisfying",
  step:1,
  family:"attention-water-sort",
  category:"attention"
});

const cloneTubes=tubes=>tubes.map(tube=>[...tube]);
const colorFor=key=>COLORS.find(color=>color.key===key);
const top=tube=>tube[tube.length-1];

function complete(tubes,colors){
  const finished=tubes.filter(tube=>tube.length===CAPACITY&&tube.every(unit=>unit===tube[0]));
  return finished.length===colors.length&&tubes.every(tube=>!tube.length||finished.includes(tube));
}

function pourAmount(tubes,from,to){
  if(!Number.isInteger(from)||!Number.isInteger(to)||from===to||from<0||to<0||from>=tubes.length||to>=tubes.length)return 0;
  const source=tubes[from],destination=tubes[to];
  if(!source.length||destination.length>=CAPACITY)return 0;
  const unit=top(source);
  if(destination.length&&top(destination)!==unit)return 0;
  let run=1;
  while(run<source.length&&source[source.length-1-run]===unit)run++;
  return Math.min(run,CAPACITY-destination.length);
}

function applyPour(tubes,from,to){
  const amount=pourAmount(tubes,from,to);
  if(!amount)return null;
  const next=cloneTubes(tubes);
  next[to].push(...next[from].splice(next[from].length-amount,amount));
  return{tubes:next,amount,color:top(next[to])};
}

// Bottle identity does not affect solvability. Canonicalising equivalent bottle
// permutations keeps exhaustive breadth-first search bounded without pruning moves.
const searchKey=tubes=>tubes.map(tube=>tube.join(",")).sort().join("|");

function solve(initial,colors,maxDepth=MAX_MOVES){
  if(complete(initial,colors))return[];
  const queue=[{tubes:cloneTubes(initial),path:[]}],seen=new Set([searchKey(initial)]);
  let nodes=0;
  for(let cursor=0;cursor<queue.length;cursor++){
    const current=queue[cursor];
    if(current.path.length>=maxDepth)continue;
    for(let from=0;from<BOTTLE_COUNT;from++)for(let to=0;to<BOTTLE_COUNT;to++){
      const result=applyPour(current.tubes,from,to);
      if(!result)continue;
      const path=[...current.path,[from,to]];
      if(complete(result.tubes,colors))return path;
      const key=searchKey(result.tubes);
      if(seen.has(key))continue;
      seen.add(key);queue.push({tubes:result.tubes,path});nodes++;
      if(nodes>=MAX_SEARCH_NODES)return null;
    }
  }
  return null;
}

function taskFrom(colors,tubes,solution){
  return{
    kind:"waterSort",
    prompt:"色ごとに分けて",
    help:"ボトルを2つ選んで注ぎます。同じ色の上か空のボトルにだけ注げます。手数に限りがあります。",
    tubes:cloneTubes(tubes),
    minMoves:solution.length,
    moveLimit:solution.length+SPARE_MOVES,
    colors:[...colors],
    duration:75000,
    solution:solution.map(move=>[...move]),
    difficulty:{colors:COLOR_COUNT,bottles:BOTTLE_COUNT,capacity:CAPACITY,minMoves:[MIN_MOVES,MAX_MOVES],spareMoves:SPARE_MOVES}
  };
}

function generate({shuffle}){
  const keys=COLORS.map(color=>color.key);
  for(let attempt=0;attempt<MAX_GENERATION_ATTEMPTS;attempt++){
    const colors=shuffle(keys).slice(0,COLOR_COUNT);
    const units=shuffle(colors.flatMap(color=>Array(CAPACITY).fill(color)));
    const tubes=[units.slice(0,4),units.slice(4,8),units.slice(8,12),[],[]];
    if(tubes.slice(0,3).some(tube=>tube.every(unit=>unit===tube[0])))continue;
    const solution=solve(tubes,colors);
    if(solution&&solution.length>=MIN_MOVES&&solution.length<=MAX_MOVES)return taskFrom(colors,tubes,solution);
  }
  // Fixed, independently searched six-move board guarantees termination even if
  // an injected random source repeatedly returns unsuitable permutations.
  const colors=keys.slice(0,COLOR_COUNT);
  const tubes=[
    [colors[0],colors[0],colors[1],colors[2]],
    [colors[2],colors[2],colors[2],colors[1]],
    [colors[1],colors[0],colors[0],colors[1]],
    [],[]
  ];
  const solution=solve(tubes,colors);
  if(!solution||solution.length<MIN_MOVES||solution.length>MAX_MOVES)throw new Error(`${metadata.id}: authored fallback failed validation`);
  return taskFrom(colors,tubes,solution);
}

function isPublishedFallback(task){
  if(task?.solution!==undefined||task?.minMoves!==6||task?.moveLimit!==9)return false;
  const colors=["orange","pink","blue"];
  const expected=[
    [colors[0],colors[1],colors[0],colors[1]],
    [colors[1],colors[0],colors[1],colors[0]],
    [colors[2],colors[2],colors[2],colors[2]],[],[]
  ];
  return JSON.stringify(task.colors)===JSON.stringify(colors)&&JSON.stringify(task.tubes)===JSON.stringify(expected);
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="waterSort")issues.push("kind must remain waterSort");
  if(task.prompt!=="色ごとに分けて")issues.push("prompt changed");
  if(!Array.isArray(task.colors)||task.colors.length!==COLOR_COUNT||new Set(task.colors).size!==COLOR_COUNT)issues.push(`colors must contain ${COLOR_COUNT} unique keys`);
  const known=new Set(COLORS.map(color=>color.key));
  if(Array.isArray(task.colors)&&task.colors.some(color=>!known.has(color)))issues.push("unknown color key");
  if(!Array.isArray(task.tubes)||task.tubes.length!==BOTTLE_COUNT)issues.push(`tubes must contain ${BOTTLE_COUNT} bottles`);
  const tubes=Array.isArray(task.tubes)?task.tubes:[];
  if(tubes.some(tube=>!Array.isArray(tube)||tube.length>CAPACITY))issues.push("invalid or over-capacity tube");
  const units=tubes.flatMap(tube=>Array.isArray(tube)?tube:[]);
  if(units.some(unit=>!task.colors?.includes(unit)))issues.push("tube contains a color outside task.colors");
  if(Array.isArray(task.colors))task.colors.forEach(color=>{
    if(units.filter(unit=>unit===color).length!==CAPACITY)issues.push(`${color} must have ${CAPACITY} units`);
  });
  if(!Number.isInteger(task.minMoves)||task.minMoves<MIN_MOVES||task.minMoves>MAX_MOVES)issues.push(`minMoves must be ${MIN_MOVES}-${MAX_MOVES}`);
  if(task.moveLimit!==task.minMoves+SPARE_MOVES)issues.push(`moveLimit must equal minMoves + ${SPARE_MOVES}`);
  if(task.duration!==75000)issues.push("duration must remain 75000ms");
  if(!issues.length){
    const shortest=solve(tubes,task.colors);
    if(!shortest)issues.push("board has no solution within the authored difficulty");
    // The published generator had a fixed emergency board labelled as six moves;
    // exhaustive search shows seven. Accept that exact plain-data descriptor so a
    // vanishingly rare saved fallback session remains resumable, while all newly
    // generated boards must carry their exact minimum.
    else if(shortest.length!==task.minMoves&&!isPublishedFallback(task))issues.push("minMoves does not match exhaustive search");
    // Published resumable tasks predate the additive solution field. When it is
    // present, verify it; when absent, the exhaustive search above derives it.
    if(task.solution!==undefined){
      if(!Array.isArray(task.solution)||task.solution.length!==task.minMoves)issues.push("solution must contain a shortest path");
      else{
        let replay=cloneTubes(tubes),legal=true;
        for(const move of task.solution){
          if(!Array.isArray(move)||move.length!==2){legal=false;break}
          const result=applyPour(replay,move[0],move[1]);
          if(!result){legal=false;break}
          replay=result.tubes;
        }
        if(!legal)issues.push("solution contains an illegal pour");
        else if(!complete(replay,task.colors))issues.push("solution does not finish the board");
      }
    }
  }
  return[...new Set(issues)];
}

const STYLE=`
.aws-stage{box-sizing:border-box;width:100%;max-width:430px;margin-inline:auto;padding-block:clamp(.35rem,2vw,.65rem);padding-left:max(clamp(.35rem,2vw,.65rem),env(safe-area-inset-left));padding-right:max(clamp(.35rem,2vw,.65rem),env(safe-area-inset-right));display:grid;gap:.7rem;color:#392f40;contain:layout paint}
.aws-status{min-height:2.6em;margin:0;padding:.55rem .7rem;border-radius:.8rem;background:#f4eef8;font-weight:800;font-size:clamp(.88rem,3.8vw,1rem);line-height:1.3;text-align:center}
.aws-board{box-sizing:border-box;width:100%;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:clamp(4px,1.6vw,9px);align-items:end;padding:.6rem 0 1.35rem}
.aws-bottle{box-sizing:border-box;position:relative;min-width:0;height:clamp(178px,53vw,225px);padding:clamp(5px,1.3vw,8px);border:3px solid #8b7996;border-top-color:#c3b4cb;border-radius:.55rem .55rem 1.25rem 1.25rem;background:linear-gradient(105deg,rgba(255,255,255,.92),rgba(236,227,243,.5));box-shadow:inset 7px 0 0 rgba(255,255,255,.45),0 5px 12px rgba(47,31,56,.12);display:grid;grid-template-rows:repeat(4,1fr);gap:2px;cursor:pointer;touch-action:manipulation;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.aws-bottle::before{content:attr(data-number);position:absolute;inset:auto 0 -1.35rem;text-align:center;font-size:.78rem;font-weight:900;color:#66586f}
.aws-bottle:hover{border-color:#75568a}.aws-bottle:focus-visible{outline:4px solid #5c3f78;outline-offset:3px}
.aws-bottle[aria-pressed=true]{transform:translateY(-10px);border-color:#7550a1;box-shadow:inset 7px 0 0 rgba(255,255,255,.48),0 10px 18px rgba(88,52,113,.24)}
.aws-slot{box-sizing:border-box;border-radius:.28rem;background:rgba(224,216,230,.38);border:1px solid rgba(111,91,123,.12);overflow:hidden;position:relative}
.aws-liquid{position:absolute;inset:0;border:2px solid var(--edge);background-color:var(--fill)}
.aws-liquid::after{content:"";position:absolute;inset:0;opacity:.42;background-size:12px 12px}
.aws-liquid[data-pattern=dots]::after{background-image:radial-gradient(#fff 1.6px,transparent 1.8px)}
.aws-liquid[data-pattern=diagonal]::after{background-image:repeating-linear-gradient(135deg,transparent 0 6px,#fff 6px 8px)}
.aws-liquid[data-pattern=waves]::after{background-image:radial-gradient(ellipse at 50% 0,transparent 55%,#fff 58%,transparent 64%)}
.aws-liquid[data-pattern=grid]::after{background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)}
.aws-liquid[data-pattern=cross]::after{background-image:linear-gradient(45deg,transparent 44%,#fff 45% 55%,transparent 56%),linear-gradient(-45deg,transparent 44%,#fff 45% 55%,transparent 56%)}
.aws-liquid[data-pattern=bars]::after{background-image:repeating-linear-gradient(90deg,transparent 0 7px,#fff 7px 10px)}
.aws-bottle.aws-pour-from{animation:aws-tip .34s ease}.aws-bottle.aws-pour-to{animation:aws-receive .34s ease}.aws-bottle.aws-invalid{animation:aws-no .28s ease}
.aws-legend{display:flex;justify-content:center;flex-wrap:wrap;gap:.35rem .65rem;font-size:.75rem;font-weight:800;color:#66586f}
.aws-key{display:inline-flex;align-items:center;gap:.25rem}.aws-swatch{width:.85rem;height:.85rem;border-radius:.25rem;background:var(--fill);border:2px solid var(--edge)}
.aws-progress{margin:0;text-align:center;font-size:.88rem;font-weight:900;color:#5c4c66}
@keyframes aws-tip{45%{transform:translateY(-12px) rotate(7deg)}}
@keyframes aws-receive{50%{transform:scale(1.045)}}
@keyframes aws-no{25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
.aws-stage[data-reduced=true] .aws-bottle{transition:none}.aws-stage[data-reduced=true] .aws-bottle[class*=aws-]{animation:none}
@media(prefers-reduced-motion:reduce){.aws-bottle{transition:none!important;animation:none!important}}
@media(max-width:400px){.aws-stage{padding-left:max(.2rem,env(safe-area-inset-left));padding-right:max(.2rem,env(safe-area-inset-right))}.aws-board{gap:4px}.aws-bottle{border-width:2px}.aws-status{font-size:.88rem}}
`;

function render(task,context){
  const issues=validate(task);
  if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;
  if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="aws-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.setAttribute("aria-label","5本のボトルで遊ぶ水ソートパズル");
  const status=documentRef.createElement("p");status.className="aws-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const board=documentRef.createElement("div");board.className="aws-board";
  const progress=documentRef.createElement("p");progress.className="aws-progress";
  const legend=documentRef.createElement("div");legend.className="aws-legend";legend.setAttribute("aria-label","色と模様の凡例");
  const tubes=cloneTubes(task.tubes),buttons=[];
  const state={selected:-1,moves:0,busy:false,done:false,disposed:false};

  task.colors.forEach(key=>{
    const color=colorFor(key),item=documentRef.createElement("span"),swatch=documentRef.createElement("i"),label=documentRef.createElement("span");
    item.className="aws-key";swatch.className="aws-swatch";swatch.style.setProperty("--fill",color.fill);swatch.style.setProperty("--edge",color.edge);swatch.setAttribute("aria-hidden","true");label.textContent=color.label;item.append(swatch,label);legend.append(item);
  });

  const describe=index=>{
    const contents=tubes[index].length?tubes[index].map(key=>colorFor(key).label).join("、"):"空";
    return`ボトル${index+1}。下から ${contents}`;
  };
  const paint=()=>{
    buttons.forEach((button,index)=>{
      button.replaceChildren();button.setAttribute("aria-label",`${describe(index)}${state.selected===index?"。注ぐ元に選択中":""}`);button.setAttribute("aria-pressed",String(state.selected===index));
      for(let level=CAPACITY-1;level>=0;level--){
        const slot=documentRef.createElement("span");slot.className="aws-slot";const key=tubes[index][level];
        if(key){const color=colorFor(key),liquid=documentRef.createElement("i");liquid.className="aws-liquid";liquid.dataset.pattern=color.pattern;liquid.style.setProperty("--fill",color.fill);liquid.style.setProperty("--edge",color.edge);liquid.setAttribute("aria-hidden","true");slot.append(liquid)}
        button.append(slot);
      }
    });
    progress.textContent=`あと ${Math.max(0,task.moveLimit-state.moves)}手　／　最短 ${task.minMoves}手`;
  };
  const reject=(index,message)=>{
    status.textContent=message;
    if(index>=0&&buttons[index]){buttons[index].classList.remove("aws-invalid");void buttons[index].offsetWidth;buttons[index].classList.add("aws-invalid");context.later(()=>buttons[index]?.classList.remove("aws-invalid"),context.reducedMotion?0:300)}
  };
  const finishPour=(from,to,result)=>{
    if(state.disposed||state.done)return;
    tubes.splice(0,tubes.length,...result.tubes.map(tube=>[...tube]));state.moves++;state.busy=false;state.selected=-1;buttons[from].classList.remove("aws-pour-from");buttons[to].classList.remove("aws-pour-to");paint();
    if(complete(tubes,task.colors)){state.done=true;status.textContent=`${state.moves}手で完成！`;context.finish(true,{quality:Math.max(0,Math.min(1,1-(state.moves-task.minMoves)/(SPARE_MOVES+1))),detail:`${state.moves}手でそろえました。最短は${task.minMoves}手です。`})}
    else if(state.moves>=task.moveLimit){state.done=true;status.textContent="手数を使い切りました";context.finish(false,{detail:`手数上限は${task.moveLimit}手。最短${task.minMoves}手で解けます。`})}
    else status.textContent="次に動かすボトルを選んでください";
  };
  const choose=index=>{
    if(state.done||state.disposed||state.busy||!Number.isInteger(index)||index<0||index>=BOTTLE_COUNT)return;
    if(state.selected<0){if(!tubes[index].length){reject(index,"空のボトルからは注げません");return}state.selected=index;status.textContent=`ボトル${index+1}を選択。注ぎ先を選んでください`;paint();return}
    if(state.selected===index){state.selected=-1;status.textContent="選択を解除しました";paint();return}
    const from=state.selected,result=applyPour(tubes,from,index);
    if(!result){state.selected=-1;paint();reject(index,"その組み合わせには注げません。同じ色の上か空を選んでください");return}
    state.busy=true;status.textContent=`${colorFor(result.color).label}を注いでいます`;buttons[from].classList.add("aws-pour-from");buttons[index].classList.add("aws-pour-to");context.later(()=>finishPour(from,index,result),context.reducedMotion?0:360);
  };

  for(let index=0;index<BOTTLE_COUNT;index++){
    const button=documentRef.createElement("button");button.type="button";button.className="aws-bottle";button.dataset.number=String(index+1);
    context.listen(button,"pointerdown",event=>{event.preventDefault();choose(index)});
    context.listen(button,"click",event=>{if(event.detail===0)choose(index)});
    context.listen(button,"keydown",event=>{
      if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();const direction=event.key==="ArrowRight"?1:-1;buttons[(index+direction+BOTTLE_COUNT)%BOTTLE_COUNT].focus({preventScroll:true})}
      else if(event.key==="Escape"&&state.selected>=0){event.preventDefault();state.selected=-1;status.textContent="選択を解除しました";paint()}
    });
    buttons.push(button);board.append(button);
  }
  stage.append(status,board,progress,legend);context.host.replaceChildren(style,stage);status.textContent="動かすボトルを選んでください";paint();buttons[0].focus({preventScroll:true});
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;state.done=true;status.textContent="時間切れです";context.finish(false,{detail:`時間切れ。最短${task.minMoves}手で解ける盤面でした。`})});

  const qaApi={choose,inspect:()=>({tubes:cloneTubes(tubes),selected:state.selected,moves:state.moves,busy:state.busy,done:state.done,disposed:state.disposed,status:status.textContent,viewport:{...context.viewport}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;state.busy=false;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
