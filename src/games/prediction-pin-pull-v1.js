const metadata={
  id:"prediction-pin-pull-v1",
  introducedIn:"1.4",
  tier:2,
  flavor:"wild",
  step:1,
  family:"prediction-pin-pull",
  category:"prediction"
};

const PROMPT="ピンを抜く順番を読んで";
const HELP="順番を1つでも間違えると失敗です。溶岩は主人公にかけない、水は溶岩を固める、コインは主人公へ。";
const MATERIALS=["lava","water","coin"];
const MATERIAL_ICON={lava:"🔥",water:"💧",coin:"🪙",stone:"🪨"};
const MATERIAL_NAME={lava:"溶岩",water:"水",coin:"コイン",stone:"石"};
const ORDERS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const LAYOUTS=[
  {key:"funnel",chambers:[{x:20,y:26},{x:50,y:50},{x:80,y:26}],targets:[1,"hero",1],hero:{x:50,y:91}},
  {key:"cascade",chambers:[{x:22,y:22},{x:22,y:51},{x:74,y:35}],targets:[1,"hero",1],hero:{x:38,y:91}},
  {key:"tower",chambers:[{x:50,y:20},{x:50,y:44},{x:50,y:68}],targets:[1,2,"hero"],hero:{x:50,y:94}}
];

const sameOrder=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((value,index)=>value===b[index]);
const isOrder=value=>Array.isArray(value)&&value.length===3&&[...value].sort((a,b)=>a-b).join(",")==="0,1,2";
const layoutFor=key=>LAYOUTS.find(layout=>layout.key===key);
const orderLabel=order=>order.map(index=>index+1).join(" → ");

function mix(a,b){
  if(!a)return b;
  if(!b)return a;
  if(a==="stone"||b==="stone")return"stone";
  if((a==="lava"&&b==="water")||(a==="water"&&b==="lava"))return"stone";
  if(a==="lava"||b==="lava")return"lava";
  if(a==="coin"||b==="coin")return"coin";
  return"water";
}

function simulate(layout,contents,order){
  const chambers=contents.map(content=>({content,open:false}));
  const outcome={coins:0,totalCoins:contents.filter(content=>content==="coin").length,dead:false,pulled:0};
  const send=(flow,target,depth=0)=>{
    if(!flow||depth>6||outcome.dead)return;
    if(target==="hero"){
      if(flow==="lava")outcome.dead=true;
      else if(flow==="coin")outcome.coins++;
      return;
    }
    const chamber=chambers[target];
    if(!chamber)return;
    if(chamber.open)send(flow,layout.targets[target],depth+1);
    else chamber.content=mix(chamber.content,flow);
  };
  for(const index of order){
    const chamber=chambers[index];
    if(!chamber||chamber.open)continue;
    chamber.open=true;outcome.pulled++;
    const flow=chamber.content;chamber.content=null;
    send(flow,layout.targets[index]);
    if(outcome.dead)break;
  }
  return{...outcome,win:!outcome.dead&&outcome.totalCoins>0&&outcome.coins===outcome.totalCoins&&outcome.pulled===3};
}

function analyze(layout,contents){
  const outcomes=ORDERS.map(order=>({order:[...order],...simulate(layout,contents,order)}));
  return{
    outcomes,
    wins:outcomes.filter(outcome=>outcome.win),
    deaths:outcomes.filter(outcome=>outcome.dead),
    nonLethalWrong:outcomes.filter(outcome=>!outcome.win&&!outcome.dead)
  };
}

function contentTriples(){
  const values=[];
  MATERIALS.forEach(a=>MATERIALS.forEach(b=>MATERIALS.forEach(c=>{
    const contents=[a,b,c];
    if(contents.includes("lava")&&contents.includes("coin"))values.push(contents);
  })));
  return values;
}

// Finite candidate enumeration replaces rejection sampling. Every item in this
// table has been checked over all six orders before generate() can select it.
const CANDIDATES=LAYOUTS.flatMap(layout=>contentTriples().map(contents=>({layout,contents,analysis:analyze(layout,contents)})))
  .filter(candidate=>candidate.analysis.wins.length===1&&candidate.analysis.deaths.length>=2&&candidate.analysis.nonLethalWrong.length>=1);

function generateTask(randomInt){
  const candidate=CANDIDATES[randomInt(0,CANDIDATES.length-1)];
  if(!candidate)throw new RangeError("randomInt returned an out-of-range pin-pull candidate");
  return{
    kind:"pinPull",prompt:PROMPT,help:HELP,
    template:candidate.layout.key,
    contents:[...candidate.contents],
    answer:[...candidate.analysis.wins[0].order],
    duration:50000
  };
}

function validateTask(task){
  const issues=[];
  if(task?.kind!=="pinPull")issues.push("kind must be pinPull");
  if(task?.prompt!==PROMPT)issues.push("prompt changed");
  if(task?.help!==HELP)issues.push("help changed");
  if(task?.duration!==50000)issues.push("duration must remain 50000ms");
  const layout=layoutFor(task?.template);
  if(!layout)issues.push("unknown pin layout");
  if(!Array.isArray(task?.contents)||task.contents.length!==3||task.contents.some(content=>!MATERIALS.includes(content))){
    issues.push("contents must be three known materials");
  }else{
    if(!task.contents.includes("lava"))issues.push("contents must include lava");
    if(!task.contents.includes("coin"))issues.push("contents must include a coin");
  }
  if(!isOrder(task?.answer))issues.push("answer must be a permutation of all three pins");
  if(layout&&Array.isArray(task?.contents)&&task.contents.length===3&&task.contents.every(content=>MATERIALS.includes(content))){
    const analysis=analyze(layout,task.contents);
    if(analysis.outcomes.length!==6)issues.push("all six orders were not enumerated");
    if(analysis.wins.length!==1)issues.push("board must have exactly one winning order");
    if(analysis.deaths.length<2)issues.push("board must have at least two lethal orders");
    if(analysis.wins.length===1&&!sameOrder(task.answer,analysis.wins[0].order))issues.push("answer does not match the unique winning order");
  }
  return[...new Set(issues)];
}

function element(documentRef,name,className,text){
  const node=documentRef.createElement(name);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

function svgElement(documentRef,name,attributes={}){
  const node=documentRef.createElementNS("http://www.w3.org/2000/svg",name);
  Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,String(value)));
  return node;
}

function renderTask(task,context){
  const validation=validateTask(task);
  if(validation.length)throw new Error(`${metadata.id}: ${validation.join("; ")}`);
  const{host,signal,finish,setDeadline,later,frame,listen,reducedMotion,viewport,qa}=context;
  const documentRef=host.ownerDocument;
  const layout=layoutFor(task.template);
  const chambers=task.contents.map(content=>({content,open:false}));
  const state={busy:false,ended:false,coins:0,total:task.contents.filter(content=>content==="coin").length,dead:false,pulled:[]};
  let activeAnimations=0,statusText="番号ボタンか、キーボードの1・2・3でピンを抜きます。";

  const style=element(documentRef,"style");
  style.textContent=`
    [data-pin-pull]{box-sizing:border-box;width:min(100%,27rem);margin-inline:auto;padding-inline:max(.15rem,env(safe-area-inset-left));color:#392f42}
    [data-pin-pull] *{box-sizing:border-box}
    .pp-board{display:block;width:100%;height:auto;aspect-ratio:1/1.13;border-radius:1rem;background:#21192b;box-shadow:0 .65rem 1.6rem rgba(37,23,46,.24);touch-action:manipulation}
    .pp-route{fill:none;stroke:#91839c;stroke-width:4;stroke-linecap:round;stroke-dasharray:2 7;marker-end:url(#pp-arrow)}
    .pp-room{fill:#392d45;stroke:#9b8ca8;stroke-width:1.4}.pp-room-ring{fill:none;stroke:#e8c85e;stroke-width:1;opacity:.72}
    .pp-material{font-size:9px;text-anchor:middle;dominant-baseline:middle}.pp-number{fill:#fff;font:800 5px system-ui,sans-serif;text-anchor:middle}
    .pp-pin{transform-box:fill-box;transform-origin:center}.pp-pin-bar{stroke:#e9bf4d;stroke-width:3.2;stroke-linecap:round}.pp-pin-ring{fill:none;stroke:#fff0a0;stroke-width:1.3}
    .pp-hit{fill:transparent;cursor:pointer;touch-action:manipulation}.pp-flow-dot{stroke:#fff;stroke-width:1.1}.pp-flow-icon{font-size:6px;text-anchor:middle;dominant-baseline:middle}
    .pp-hero-ring{fill:#e8ddec;stroke:#fff;stroke-width:1.1}.pp-hero-ring.is-danger{fill:#7e2929;stroke:#ffb69a}.pp-hero-ring.is-win{fill:#286349;stroke:#a8ecc7}
    .pp-hero{font-size:11px;text-anchor:middle;dominant-baseline:middle}
    .pp-status{min-height:2.8rem;margin:.62rem .1rem .52rem;padding:.6rem .7rem;border-radius:.8rem;background:#f1ebf4;color:#4a3a53;font-weight:750;line-height:1.45;text-align:center}
    .pp-status[data-tone="danger"]{background:#f9e2dd;color:#762d24}.pp-status[data-tone="success"]{background:#dff1e7;color:#20593e}
    .pp-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}.pp-key{min-width:0;min-height:3.25rem;border:2px solid #c7a23c;border-radius:.85rem;background:linear-gradient(#fff0a2,#e3b849);color:#523811;font:900 1rem system-ui,sans-serif;box-shadow:0 .2rem .5rem rgba(45,28,52,.16);cursor:pointer;touch-action:manipulation}
    .pp-key:not(:disabled):active{transform:translateY(2px);box-shadow:none}.pp-key:focus-visible,[data-pin-pull]:focus-visible{outline:3px solid #72428c;outline-offset:3px}.pp-key:disabled{opacity:.46;cursor:not-allowed}
    .pp-legend{display:flex;flex-wrap:wrap;justify-content:center;gap:.3rem .7rem;margin:.58rem .2rem 0;color:#66586e;font-size:.82rem}
    @media(prefers-reduced-motion:reduce){.pp-key:not(:disabled):active{transform:none}}
  `;
  const stage=element(documentRef,"section");stage.dataset.pinPull="";stage.tabIndex=0;stage.setAttribute("role","group");stage.setAttribute("aria-label","3本のピンで溶岩・水・コインの流れを変えるパズル");
  const svg=svgElement(documentRef,"svg",{class:"pp-board",viewBox:"0 0 100 113",role:"img","aria-labelledby":"pp-title pp-description"});
  const title=svgElement(documentRef,"title",{id:"pp-title"});title.textContent="3本のピン抜き盤面";
  const description=svgElement(documentRef,"desc",{id:"pp-description"});description.textContent="水で溶岩を石に変え、コインを主人公へ届けます";svg.append(title,description);
  const defs=svgElement(documentRef,"defs"),gradient=svgElement(documentRef,"linearGradient",{id:"pp-background",x1:0,y1:0,x2:0,y2:1});
  [["0%","#382941"],["55%","#281e32"],["100%","#18111f"]].forEach(([offset,color])=>gradient.append(svgElement(documentRef,"stop",{offset,"stop-color":color})));
  const arrow=svgElement(documentRef,"marker",{id:"pp-arrow",viewBox:"0 0 6 6",refX:5,refY:3,markerWidth:3.2,markerHeight:3.2,orient:"auto"});
  arrow.append(svgElement(documentRef,"path",{d:"M 0 0 L 6 3 L 0 6 Z",fill:"#b4a8bc"}));defs.append(gradient,arrow);svg.append(defs,svgElement(documentRef,"rect",{width:100,height:113,rx:6,fill:"url(#pp-background)"}));

  const routePaths=[];
  const targetPoint=target=>target==="hero"?layout.hero:layout.chambers[target];
  layout.targets.forEach((target,index)=>{
    const from=layout.chambers[index],to=targetPoint(target),bendX=(from.x+to.x)/2+(index-1)*4,bendY=(from.y+to.y)/2;
    const path=svgElement(documentRef,"path",{class:"pp-route",d:`M ${from.x} ${from.y+8} Q ${bendX} ${bendY} ${to.x} ${to.y-8}`});routePaths.push(path);svg.append(path);
  });

  const materialNodes=[],pinNodes=[],hitNodes=[];
  layout.chambers.forEach((spot,index)=>{
    const group=svgElement(documentRef,"g");group.append(svgElement(documentRef,"circle",{class:"pp-room",cx:spot.x,cy:spot.y,r:10}),svgElement(documentRef,"circle",{class:"pp-room-ring",cx:spot.x,cy:spot.y,r:8.5}));
    const material=svgElement(documentRef,"text",{class:"pp-material",x:spot.x,y:spot.y});material.textContent=MATERIAL_ICON[task.contents[index]];materialNodes.push(material);group.append(material);
    const number=svgElement(documentRef,"text",{class:"pp-number",x:spot.x,y:spot.y-12});number.textContent=String(index+1);group.append(number);
    const pin=svgElement(documentRef,"g",{class:"pp-pin"});pin.append(svgElement(documentRef,"line",{class:"pp-pin-bar",x1:spot.x-8,y1:spot.y+8,x2:spot.x+8,y2:spot.y+8}),svgElement(documentRef,"circle",{class:"pp-pin-ring",cx:spot.x-10.5,cy:spot.y+8,r:2.7}));pinNodes.push(pin);group.append(pin);
    const hit=svgElement(documentRef,"circle",{class:"pp-hit",cx:spot.x,cy:spot.y,r:14,"aria-hidden":"true"});hitNodes.push(hit);group.append(hit);svg.append(group);
  });
  const heroRing=svgElement(documentRef,"circle",{class:"pp-hero-ring",cx:layout.hero.x,cy:layout.hero.y,r:10}),hero=svgElement(documentRef,"text",{class:"pp-hero",x:layout.hero.x,y:layout.hero.y});hero.textContent="🧑";svg.append(heroRing,hero);
  const status=element(documentRef,"p","pp-status",statusText);status.setAttribute("aria-live","polite");
  const controls=element(documentRef,"div","pp-controls");
  const buttons=[0,1,2].map(index=>{const button=element(documentRef,"button","pp-key",`ピン ${index+1}`);button.type="button";button.setAttribute("aria-label",`${index+1}番のピンを抜く`);controls.append(button);return button});
  const legend=element(documentRef,"p","pp-legend");
  [["💧＋🔥＝🪨"],["🪙 → 🧑"],["🔥 → 🧑 は失敗"]].forEach(([text])=>legend.append(element(documentRef,"span",null,text)));
  stage.append(svg,status,controls,legend);host.replaceChildren(style,stage);

  const setStatus=(message,tone="normal")=>{statusText=message;status.textContent=message;status.dataset.tone=tone};
  const updateControls=()=>buttons.forEach((button,index)=>{button.disabled=state.ended||signal.aborted||state.busy||chambers[index].open;button.setAttribute("aria-pressed",String(chambers[index].open))});
  const updateChamber=index=>{materialNodes[index].textContent=chambers[index].content?MATERIAL_ICON[chambers[index].content]:""};
  const finishOnce=(correct,result)=>{if(state.ended||signal.aborted)return false;state.ended=true;state.busy=false;updateControls();return finish(correct,result)};
  const tween=(duration,draw,done)=>{
    if(signal.aborted||state.ended)return;
    if(reducedMotion){draw(1);later(()=>{if(!signal.aborted&&!state.ended)done()},0);return}
    activeAnimations++;let started=null;
    frame(now=>{
      if(signal.aborted||state.ended){activeAnimations=Math.max(0,activeAnimations-1);return false}
      if(started===null)started=now;
      const linear=Math.min(1,Math.max(0,(now-started)/duration)),progress=1-Math.pow(1-linear,3);draw(progress);
      if(linear<1)return true;
      activeAnimations=Math.max(0,activeAnimations-1);done();return false;
    });
  };
  const pullSteps=index=>{
    const steps=[],chamber=chambers[index];
    if(chamber.open)return steps;
    chamber.open=true;const flow=chamber.content;chamber.content=null;
    if(!flow)return steps;
    let source=index,target=layout.targets[index];
    for(let depth=0;depth<6;depth++){
      steps.push({from:source,to:target,flow});
      if(target==="hero")break;
      if(!chambers[target].open)break;
      source=target;target=layout.targets[target];
    }
    return steps;
  };
  const arrive=(step,done)=>{
    if(step.to==="hero"){
      if(step.flow==="lava"){
        state.dead=true;heroRing.classList.add("is-danger");hero.textContent="😵";setStatus("溶岩が主人公へ流れました。","danger");
        later(()=>finishOnce(false,{reason:"lethal",detail:"溶岩を水で固める順番が必要でした。"}),reducedMotion?0:140);return;
      }
      if(step.flow==="coin"){state.coins++;heroRing.classList.add("is-win");hero.textContent="🙌"}
      done();return;
    }
    if(!chambers[step.to].open){chambers[step.to].content=mix(chambers[step.to].content,step.flow);updateChamber(step.to)}
    done();
  };
  const animateStep=(step,done)=>{
    const path=routePaths[step.from],group=svgElement(documentRef,"g"),dot=svgElement(documentRef,"circle",{class:"pp-flow-dot",r:3.8,fill:step.flow==="lava"?"#ed633b":step.flow==="water"?"#55bde6":step.flow==="coin"?"#edc64e":"#8d8796"}),icon=svgElement(documentRef,"text",{class:"pp-flow-icon"});icon.textContent=MATERIAL_ICON[step.flow];group.append(dot,icon);svg.append(group);
    tween(410,progress=>{const length=path.getTotalLength(),point=path.getPointAtLength(length*progress);group.setAttribute("transform",`translate(${point.x} ${point.y})`)},()=>{group.remove();arrive(step,done)});
  };
  const runSteps=(steps,index,done)=>{
    if(signal.aborted||state.ended)return;
    if(index>=steps.length){done();return}
    animateStep(steps[index],()=>runSteps(steps,index+1,done));
  };
  const settle=()=>{
    if(signal.aborted||state.ended)return;
    state.busy=false;updateControls();
    if(state.pulled.length===3){
      if(state.coins===state.total){setStatus("コインが主人公へ届きました！","success");later(()=>finishOnce(true,{reason:"solved",detail:"3本の流れを読み切りました。"}),reducedMotion?0:160)}
      else{setStatus("コインが届きませんでした。","danger");later(()=>finishOnce(false,{reason:"wrong-order",detail:`正しい順番は ${orderLabel(task.answer)} です。`}),reducedMotion?0:160)}
    }else setStatus(`現在の順番: ${orderLabel(state.pulled)}`);
  };
  const pull=index=>{
    if(state.busy||state.ended||signal.aborted||!chambers[index]||chambers[index].open)return false;
    state.busy=true;state.pulled.push(index);const material=chambers[index].content,steps=pullSteps(index);updateChamber(index);updateControls();setStatus(`ピン ${index+1}: ${MATERIAL_NAME[material]}を流しています…`);
    tween(150,progress=>{pinNodes[index].setAttribute("transform",`translate(${-11*progress} ${7*progress}) rotate(${-18*progress})`);pinNodes[index].setAttribute("opacity",String(1-progress*.65))},()=>runSteps(steps,0,settle));return true;
  };

  buttons.forEach((button,index)=>{
    listen(button,"pointerdown",event=>{event.preventDefault();pull(index)});
    listen(button,"click",event=>{if(event.detail===0)pull(index)});
  });
  hitNodes.forEach((hit,index)=>listen(hit,"pointerdown",event=>{event.preventDefault();pull(index)}));
  listen(stage,"keydown",event=>{if(["1","2","3"].includes(event.key)){event.preventDefault();pull(Number(event.key)-1)}});
  setDeadline(task.duration,()=>{setStatus("時間切れです。","danger");finishOnce(false,{reason:"timeout",detail:"3本の順番を決められませんでした。"})});
  updateControls();buttons[0].focus({preventScroll:true});

  if(qa&&typeof qa==="object")Object.assign(qa,{
    id:metadata.id,task,answer:[...task.answer],
    outcomes:analyze(layout,task.contents).outcomes.map(outcome=>({...outcome,order:[...outcome.order]})),
    pull,
    snapshot:()=>({pulled:[...state.pulled],contents:chambers.map(chamber=>chamber.content),open:chambers.map(chamber=>chamber.open),coins:state.coins,total:state.total,dead:state.dead,busy:state.busy,ended:state.ended||signal.aborted,activeAnimations:signal.aborted?0:activeAnimations,status:statusText,width:stage.getBoundingClientRect().width,scrollWidth:stage.scrollWidth,viewport:{...viewport}})
  });
}

export default{
  metadata,
  generate({randomInt}){
    if(typeof randomInt!=="function")throw new TypeError("prediction-pin-pull-v1 requires randomInt");
    return generateTask(randomInt);
  },
  validate(task){return validateTask(task)},
  render(task,context){renderTask(task,context)}
};
