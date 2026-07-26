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
    .pp-board{display:block;width:100%;height:auto;aspect-ratio:1/1.13;border-radius:1rem;background:#17111f;box-shadow:0 .8rem 1.8rem rgba(24,13,31,.38),inset 0 0 0 1px rgba(255,255,255,.08);touch-action:manipulation;overflow:hidden}
    .pp-rock{fill:#54445f;stroke:#71617d;stroke-width:.55}.pp-rock.is-deep{fill:#271e30;stroke:#3b2e47}.pp-crack{fill:none;stroke:#17111e;stroke-width:.7;stroke-linecap:round;opacity:.72}
    .pp-route-shadow,.pp-route-shell,.pp-route-bore,.pp-route-rim{fill:none;stroke-linecap:round;stroke-linejoin:round}.pp-route-shadow{stroke:#100b16;stroke-width:9;opacity:.85}.pp-route-shell{stroke:url(#pp-pipe-metal);stroke-width:7}.pp-route-bore{stroke:#1a1421;stroke-width:4.2}.pp-route-rim{stroke:#9d90a8;stroke-width:1.15;stroke-dasharray:2 4;opacity:.8}.pp-route-group.is-flowing .pp-route-rim{stroke:#fff3bd;opacity:1}
    .pp-collar-shadow{fill:#100b16}.pp-collar{fill:url(#pp-pipe-metal);stroke:#b2a6bb;stroke-width:.65}.pp-collar-hole{fill:#19131f;stroke:#5e5168;stroke-width:.55}
    .pp-room-shadow{fill:#100b16;opacity:.8}.pp-room-shell{fill:url(#pp-room-metal);stroke:#b5a5bf;stroke-width:1.2}.pp-room-inner{fill:#160f1d;stroke:#766881;stroke-width:.8}.pp-room-glint{fill:none;stroke:rgba(255,255,255,.28);stroke-width:.8;stroke-linecap:round}.pp-room-group.is-collision .pp-room-shell{stroke:#e7f7ff;stroke-width:2}.pp-room-group.is-open .pp-room-shell{stroke:#746780}
    .pp-number-plate{fill:#1b1322;stroke:#e7c95e;stroke-width:.55}.pp-number{fill:#fff;font:900 5px system-ui,sans-serif;text-anchor:middle;dominant-baseline:middle}
    .pp-pin{transform-box:fill-box;transform-origin:center}.pp-pin-shadow{stroke:#4b2d0e;stroke-width:4.6;stroke-linecap:round}.pp-pin-bar{stroke:url(#pp-pin-metal);stroke-width:3.4;stroke-linecap:round}.pp-pin-highlight{stroke:#fff2a5;stroke-width:.65;stroke-linecap:round;opacity:.9}.pp-pin-ring-shadow{fill:#2b1909;stroke:#4b2d0e;stroke-width:1.2}.pp-pin-ring{fill:url(#pp-pin-metal);stroke:#fff0a0;stroke-width:.65}.pp-pin-hole{fill:#211421;stroke:#68461c;stroke-width:.5}.pp-pin.is-open{opacity:.22}
    .pp-hit{fill:transparent;cursor:pointer;touch-action:manipulation}.pp-material-shine{fill:none;stroke:#fff;stroke-linecap:round;opacity:.7}.pp-lava-glow{fill:#ff6d2f;opacity:.2;filter:url(#pp-lava-glow)}.pp-lava{fill:url(#pp-lava);stroke:#ffbd54;stroke-width:.45}.pp-lava-hot{fill:#ffd875}.pp-water{fill:url(#pp-water);stroke:#bcecff;stroke-width:.5}.pp-water-line{fill:none;stroke:#e9fbff;stroke-width:.55;stroke-linecap:round}.pp-coin-back{fill:#9a6517;stroke:#4d2d0c;stroke-width:.45}.pp-coin{fill:url(#pp-gold);stroke:#fff1a2;stroke-width:.48;filter:url(#pp-coin-glow)}.pp-coin-mark{fill:#7c4c0e;font:900 4.2px system-ui,sans-serif;text-anchor:middle;dominant-baseline:middle}.pp-stone{fill:url(#pp-stone);stroke:#d8d4df;stroke-width:.45}
    .pp-flow{filter:url(#pp-flow-shadow)}.pp-flow-core{stroke:#fff;stroke-width:.75}.pp-flow-trail{fill:none;stroke-width:2.2;stroke-linecap:round;opacity:.6}
    .pp-hero-shadow{fill:#0c0710;opacity:.6}.pp-hero-aura{fill:#efe6f2;stroke:#fff;stroke-width:1.05}.pp-hero-body{fill:url(#pp-hero-fur);stroke:#713b1d;stroke-width:.55}.pp-hero-muzzle{fill:#f3d8b3}.pp-hero-eye{fill:#24130f}.pp-hero-x{display:none;fill:none;stroke:#fff5df;stroke-width:1.05;stroke-linecap:round;paint-order:stroke;filter:url(#pp-flow-shadow)}.pp-hero-mouth{fill:none;stroke:#5c2919;stroke-width:.6;stroke-linecap:round}.pp-hero-group.is-danger .pp-hero-aura{fill:#732322;stroke:#ffb083;filter:url(#pp-lava-glow)}.pp-hero-group.is-danger{transform-box:fill-box;transform-origin:center}.pp-hero-group.is-danger .pp-hero-eye{display:none}.pp-hero-group.is-danger .pp-hero-x{display:block}.pp-hero-group.is-win .pp-hero-aura{fill:#286349;stroke:#bff6d6;filter:url(#pp-coin-glow)}.pp-hero-group.is-win .pp-hero-body{filter:url(#pp-coin-glow)}
    .pp-monster-shadow{fill:#0b0710;opacity:.55}.pp-monster-body{fill:url(#pp-monster);stroke:#d3a8ff;stroke-width:.55}.pp-monster-eye{fill:#fff}.pp-monster-pupil{fill:#24122c}.pp-monster-mouth{fill:#25102d}.pp-monster-group.is-startled,.pp-monster-group.is-defeated,.pp-monster-group.is-cheering{transform-box:fill-box;transform-origin:center}.pp-monster-group.is-defeated{opacity:.16}.pp-monster-group.is-cheering .pp-monster-body{filter:url(#pp-lava-glow)}.pp-monster-group.is-cheering .pp-monster-eye{fill:#ffd36d}
    .pp-bloom{opacity:0;pointer-events:none}.pp-bloom.is-gold{fill:url(#pp-gold-bloom)}.pp-bloom.is-lava{fill:url(#pp-lava-bloom)}.pp-bloom.is-visible{opacity:.72}.pp-sparkles{opacity:0}.pp-sparkles.is-visible{opacity:1}.pp-sparkle{fill:#fff4a6;stroke:#b17a19;stroke-width:.35;filter:url(#pp-coin-glow)}
    .pp-status{min-height:2.8rem;margin:.62rem .1rem .52rem;padding:.6rem .7rem;border-radius:.8rem;background:linear-gradient(#f7f1f8,#eee6f1);border:1px solid #dfd2e5;color:#4a3a53;font-weight:750;line-height:1.45;text-align:center;box-shadow:inset 0 1px #fff}
    .pp-status[data-tone="danger"]{background:#f9e2dd;color:#762d24;border-color:#e9b7aa}.pp-status[data-tone="success"]{background:#dff1e7;color:#20593e;border-color:#acd8be}
    .pp-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}.pp-key{min-width:0;min-height:3.25rem;border:2px solid #b88924;border-radius:.85rem;background:linear-gradient(#fff4b7 0%,#efcc65 45%,#c88d24 100%);color:#4b310d;font:900 1rem system-ui,sans-serif;box-shadow:inset 0 1px #fff9d5,inset 0 -3px rgba(94,53,8,.2),0 .24rem .55rem rgba(45,28,52,.2);cursor:pointer;touch-action:manipulation}
    .pp-key:not(:disabled):active{transform:translateY(2px);box-shadow:inset 0 1px rgba(75,42,8,.2)}.pp-key:focus-visible,[data-pin-pull]:focus-visible{outline:3px solid #72428c;outline-offset:3px}.pp-key:disabled{opacity:.48;cursor:not-allowed;filter:saturate(.65)}
    .pp-legend{display:flex;flex-wrap:wrap;justify-content:center;gap:.3rem .7rem;margin:.58rem .2rem 0;color:#66586e;font-size:.82rem}
    @media(prefers-reduced-motion:reduce){.pp-key:not(:disabled):active{transform:none}}
  `;
  const stage=element(documentRef,"section");stage.dataset.pinPull="";stage.tabIndex=0;stage.setAttribute("role","group");stage.setAttribute("aria-label","3本のピンで溶岩・水・コインの流れを変えるパズル");
  const svg=svgElement(documentRef,"svg",{class:"pp-board",viewBox:"0 0 100 113",role:"img","aria-labelledby":"pp-title pp-description"});
  const title=svgElement(documentRef,"title",{id:"pp-title"});title.textContent="3本のピン抜き盤面";
  const description=svgElement(documentRef,"desc",{id:"pp-description"});description.textContent="水で溶岩を石に変え、コインを主人公へ届けます";svg.append(title,description);
  const defs=svgElement(documentRef,"defs");
  const linear=(id,stops,x1=0,y1=0,x2=0,y2=1)=>{const gradient=svgElement(documentRef,"linearGradient",{id,x1,y1,x2,y2});stops.forEach(([offset,color,opacity])=>gradient.append(svgElement(documentRef,"stop",{offset,"stop-color":color,...(opacity===undefined?{}:{"stop-opacity":opacity})})));defs.append(gradient)};
  const radial=(id,stops)=>{const gradient=svgElement(documentRef,"radialGradient",{id,cx:"50%",cy:"45%",r:"60%"});stops.forEach(([offset,color,opacity])=>gradient.append(svgElement(documentRef,"stop",{offset,"stop-color":color,...(opacity===undefined?{}:{"stop-opacity":opacity})})));defs.append(gradient)};
  linear("pp-background",[["0%","#46354f"],["48%","#2b2035"],["100%","#15101c"]]);linear("pp-pipe-metal",[["0%","#87798f"],["38%","#4a3e54"],["58%","#2b2234"],["100%","#796b83"]],0,0,1,1);linear("pp-room-metal",[["0%","#a497ad"],["22%","#62546d"],["70%","#33283e"],["100%","#776982"]],0,0,1,1);linear("pp-pin-metal",[["0%","#fff1a0"],["26%","#f2c95d"],["64%","#bd7920"],["100%","#73400f"]],0,0,1,1);linear("pp-lava",[["0%","#ffd45f"],["38%","#ff8a31"],["72%","#db361c"],["100%","#72120d"]]);linear("pp-water",[["0%","#d5f5ff"],["32%","#65cbed"],["76%","#2689c2"],["100%","#10517c"]]);linear("pp-gold",[["0%","#fff3a5"],["44%","#efc64e"],["100%","#9e6516"]],0,0,1,1);linear("pp-stone",[["0%","#e5e2ea"],["48%","#9a94a4"],["100%","#514b5c"]],0,0,1,1);linear("pp-hero-fur",[["0%","#ffc078"],["48%","#df7e35"],["100%","#8e421e"]],0,0,1,1);linear("pp-monster",[["0%","#c08bf0"],["45%","#7443a2"],["100%","#3c205f"]],0,0,1,1);radial("pp-gold-bloom",[["0%","#fff3a1",.9],["42%","#d6b642",.4],["100%","#d6b642",0]]);radial("pp-lava-bloom",[["0%","#ffd073",.9],["38%","#ef4b24",.55],["100%","#7d160d",0]]);
  const filter=(id,blur)=>{const f=svgElement(documentRef,"filter",{id,x:"-60%",y:"-60%",width:"220%",height:"220%"});f.append(svgElement(documentRef,"feGaussianBlur",{stdDeviation:blur}));defs.append(f)};filter("pp-lava-glow",2.4);filter("pp-coin-glow",1.1);filter("pp-flow-shadow",.7);
  svg.append(defs,svgElement(documentRef,"rect",{width:100,height:113,rx:6,fill:"url(#pp-background)"}));
  const rocks=[[2,5,18,8,15,22,1,18],[82,2,99,5,98,21,87,17],[1,83,14,77,22,109,3,111],[77,88,98,79,99,111,83,109],[29,1,45,5,39,17,24,13],[55,2,73,1,78,14,63,18]];
  rocks.forEach((points,index)=>svg.append(svgElement(documentRef,"polygon",{class:`pp-rock${index%2?" is-deep":""}`,points:points.join(" ")})));
  [[7,7,13,13,9,21],[92,8,87,15,91,24],[6,91,14,96,10,105],[91,90,84,98,89,107],[34,4,31,11,36,15],[68,4,72,10,67,16]].forEach(points=>svg.append(svgElement(documentRef,"path",{class:"pp-crack",d:`M${points[0]} ${points[1]} L${points[2]} ${points[3]} L${points[4]} ${points[5]}`})));
  svg.append(svgElement(documentRef,"ellipse",{cx:50,cy:57,rx:54,ry:62,fill:"none",stroke:"rgba(0,0,0,.36)","stroke-width":12}));

  const routePaths=[],routeGroups=[];
  const targetPoint=target=>target==="hero"?layout.hero:layout.chambers[target];
  layout.targets.forEach((target,index)=>{
    const from=layout.chambers[index],to=targetPoint(target),bendX=(from.x+to.x)/2+(index-1)*4,bendY=(from.y+to.y)/2,d=`M ${from.x} ${from.y+8} Q ${bendX} ${bendY} ${to.x} ${to.y-8}`;
    const group=svgElement(documentRef,"g",{class:"pp-route-group"});
    group.append(svgElement(documentRef,"path",{class:"pp-route-shadow",d}),svgElement(documentRef,"path",{class:"pp-route-shell",d}),svgElement(documentRef,"path",{class:"pp-route-bore",d}));
    const path=svgElement(documentRef,"path",{class:"pp-route-rim",d});group.append(path);routePaths.push(path);routeGroups.push(group);svg.append(group);
    [[from.x,from.y+8],[to.x,to.y-8]].forEach(([cx,cy])=>{svg.append(svgElement(documentRef,"circle",{class:"pp-collar-shadow",cx,cy,r:5.1}),svgElement(documentRef,"circle",{class:"pp-collar",cx,cy,r:4.35}),svgElement(documentRef,"circle",{class:"pp-collar-hole",cx,cy,r:2.55}))});
  });

  const materialGraphic=(content,x=0,y=0,scale=1)=>{
    const g=svgElement(documentRef,"g",{class:`pp-material pp-material-${content||"empty"}`,transform:`translate(${x} ${y}) scale(${scale})`});
    if(content==="lava")g.append(svgElement(documentRef,"circle",{class:"pp-lava-glow",r:9}),svgElement(documentRef,"path",{class:"pp-lava",d:"M-7 4 C-8 0 -5 -6 -2 -7 C-1 -4 1 -3 2 -7 C6 -4 8 0 7 5 C3 8 -4 8 -7 4Z"}),svgElement(documentRef,"circle",{class:"pp-lava-hot",cx:-2.7,cy:1,r:1.25}),svgElement(documentRef,"circle",{class:"pp-lava-hot",cx:2.4,cy:3,r:.8}));
    else if(content==="water")g.append(svgElement(documentRef,"path",{class:"pp-water",d:"M0 -8 C-1 -5 -7 -1 -7 3 C-7 7 -4 9 0 9 C4 9 7 7 7 3 C7 -1 1 -5 0 -8Z"}),svgElement(documentRef,"path",{class:"pp-water-line",d:"M-4 2 Q-1 .4 2 1.7 Q4 2.7 5 1.7"}),svgElement(documentRef,"path",{class:"pp-material-shine",d:"M-3 -1 Q-2 -4 0 -5","stroke-width":1}));
    else if(content==="coin"){[[-3.2,2.2],[3.1,1.5],[0,-3]].forEach(([cx,cy],i)=>g.append(svgElement(documentRef,"circle",{class:i?"pp-coin":"pp-coin-back",cx,cy,r:4.1})));const mark=svgElement(documentRef,"text",{class:"pp-coin-mark",x:3.1,y:1.8});mark.textContent="¥";g.append(mark,svgElement(documentRef,"path",{class:"pp-material-shine",d:"M1 -4 L2.5 -5.4 M5 -3.3 L6.3 -4","stroke-width":.7}))}
    else if(content==="stone")g.append(svgElement(documentRef,"path",{class:"pp-stone",d:"M-7 5 L-6 -3 L-2 -7 L4 -6 L8 0 L5 7 L-2 8Z"}),svgElement(documentRef,"path",{class:"pp-crack",d:"M-1 -6 L1 -1 L-2 2 L2 7"}));
    return g;
  };

  const materialNodes=[],pinNodes=[],hitNodes=[],roomGroups=[];
  layout.chambers.forEach((spot,index)=>{
    const group=svgElement(documentRef,"g",{class:"pp-room-group",transform:`translate(${spot.x} ${spot.y})`});roomGroups.push(group);
    group.append(svgElement(documentRef,"circle",{class:"pp-room-shadow",cx:1.1,cy:1.8,r:12}),svgElement(documentRef,"circle",{class:"pp-room-shell",r:11}),svgElement(documentRef,"circle",{class:"pp-room-inner",r:8.7}),svgElement(documentRef,"path",{class:"pp-room-glint",d:"M-6 -5 A8 8 0 0 1 3 -8"}));
    const material=materialGraphic(task.contents[index]);materialNodes.push(material);group.append(material);
    group.append(svgElement(documentRef,"circle",{class:"pp-number-plate",cx:0,cy:-13,r:4}));const number=svgElement(documentRef,"text",{class:"pp-number",x:0,y:-13});number.textContent=String(index+1);group.append(number);
    const pin=svgElement(documentRef,"g",{class:"pp-pin"});pin.append(svgElement(documentRef,"line",{class:"pp-pin-shadow",x1:-8,y1:8.8,x2:8,y2:8.8}),svgElement(documentRef,"line",{class:"pp-pin-bar",x1:-8,y1:8,x2:8,y2:8}),svgElement(documentRef,"line",{class:"pp-pin-highlight",x1:-7.2,y1:7.35,x2:7.2,y2:7.35}),svgElement(documentRef,"circle",{class:"pp-pin-ring-shadow",cx:-10.7,cy:8.8,r:3.5}),svgElement(documentRef,"circle",{class:"pp-pin-ring",cx:-10.7,cy:8,r:3.15}),svgElement(documentRef,"circle",{class:"pp-pin-hole",cx:-10.7,cy:8,r:1.65}));pinNodes.push(pin);group.append(pin);
    const hit=svgElement(documentRef,"circle",{class:"pp-hit",r:15});hitNodes.push(hit);group.append(hit);svg.append(group);
  });

  const heroGroup=svgElement(documentRef,"g",{class:"pp-hero-group",transform:`translate(${layout.hero.x} ${layout.hero.y})`});
  const heroRing=svgElement(documentRef,"circle",{class:"pp-hero-aura",r:10});heroGroup.append(svgElement(documentRef,"ellipse",{class:"pp-hero-shadow",cx:0,cy:9,rx:8,ry:2.2}),heroRing,svgElement(documentRef,"ellipse",{class:"pp-hero-body",cx:0,cy:3.8,rx:5.6,ry:5.1}),svgElement(documentRef,"path",{class:"pp-hero-body",d:"M-5 -3 L-3 -9 L-.5 -4 M5 -3 L3 -9 L.5 -4"}),svgElement(documentRef,"circle",{class:"pp-hero-body",cy:-2.3,r:5}),svgElement(documentRef,"ellipse",{class:"pp-hero-muzzle",cy:.2,rx:2.8,ry:2}),svgElement(documentRef,"circle",{class:"pp-hero-eye",cx:-1.8,cy:-2.8,r:.65}),svgElement(documentRef,"circle",{class:"pp-hero-eye",cx:1.8,cy:-2.8,r:.65}),svgElement(documentRef,"circle",{class:"pp-hero-eye",cy:-.1,r:.7}),svgElement(documentRef,"path",{class:"pp-hero-x",d:"M-2.6 -3.5 l1.5 1.5 m0 -1.5 l-1.5 1.5 M1.1 -3.5 l1.5 1.5 m0 -1.5 l-1.5 1.5"}),svgElement(documentRef,"path",{class:"pp-hero-mouth",d:"M-2 1 Q0 2.5 2 1"}));svg.append(heroGroup);
  const monsterX=layout.hero.x>60?18:84,monsterY=layout.hero.y;
  const monsterGroup=svgElement(documentRef,"g",{class:"pp-monster-group",transform:`translate(${monsterX} ${monsterY})`});monsterGroup.append(svgElement(documentRef,"ellipse",{class:"pp-monster-shadow",cy:8.5,rx:7.5,ry:2}),svgElement(documentRef,"path",{class:"pp-monster-body",d:"M-8 7 C-9 0 -7 -7 -3 -8 L-1 -11 L1 -8 C6 -8 9 -2 8 7Z"}));[-2.4,2.4].forEach(cx=>monsterGroup.append(svgElement(documentRef,"circle",{class:"pp-monster-eye",cx,cy:-2,r:1.7}),svgElement(documentRef,"circle",{class:"pp-monster-pupil",cx,cy:-1.8,r:.75})));monsterGroup.append(svgElement(documentRef,"path",{class:"pp-monster-mouth",d:"M-3 3 Q0 6 3 3 Q0 4 -3 3"}));svg.append(monsterGroup);
  const bloom=svgElement(documentRef,"circle",{class:"pp-bloom",cx:layout.hero.x,cy:layout.hero.y,r:18});svg.insertBefore(bloom,heroGroup);
  const sparkles=svgElement(documentRef,"g",{class:"pp-sparkles"});[[-12,-9],[-9,8],[10,-8],[13,5]].forEach(([dx,dy])=>sparkles.append(svgElement(documentRef,"path",{class:"pp-sparkle",d:`M ${layout.hero.x+dx} ${layout.hero.y+dy-2} L ${layout.hero.x+dx+1} ${layout.hero.y+dy-1} L ${layout.hero.x+dx+3} ${layout.hero.y+dy} L ${layout.hero.x+dx+1} ${layout.hero.y+dy+1} L ${layout.hero.x+dx} ${layout.hero.y+dy+3} L ${layout.hero.x+dx-1} ${layout.hero.y+dy+1} L ${layout.hero.x+dx-3} ${layout.hero.y+dy} L ${layout.hero.x+dx-1} ${layout.hero.y+dy-1} Z`})));svg.append(sparkles);
  const status=element(documentRef,"p","pp-status",statusText);status.setAttribute("aria-live","polite");
  const controls=element(documentRef,"div","pp-controls");
  const buttons=[0,1,2].map(index=>{const button=element(documentRef,"button","pp-key",`ピン ${index+1}`);button.type="button";button.setAttribute("aria-label",`${index+1}番のピンを抜く`);controls.append(button);return button});
  const legend=element(documentRef,"p","pp-legend");
  [["💧＋🔥＝🪨"],["🪙 → 主人公"],["🔥 → 主人公 は失敗"]].forEach(([text])=>legend.append(element(documentRef,"span",null,text)));
  stage.append(svg,status,controls,legend);host.replaceChildren(style,stage);

  const setStatus=(message,tone="normal")=>{statusText=message;status.textContent=message;status.dataset.tone=tone};
  const updateControls=()=>buttons.forEach((button,index)=>{button.disabled=state.ended||signal.aborted||state.busy||chambers[index].open;button.setAttribute("aria-pressed",String(chambers[index].open))});
  const updateChamber=index=>{const next=materialGraphic(chambers[index].content);materialNodes[index].replaceWith(next);materialNodes[index]=next};
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
  const showBloom=(tone)=>{bloom.setAttribute("class",`pp-bloom is-${tone} is-visible`);if(tone==="gold")sparkles.classList.add("is-visible");const target=tone==="lava"?24:28;if(!reducedMotion)tween(300,progress=>bloom.setAttribute("r",String(18+progress*(target-18))),()=>{});else bloom.setAttribute("r",String(target))};
  const arrive=(step,done)=>{
    if(step.to==="hero"){
      if(step.flow==="lava"){
        state.dead=true;heroGroup.classList.add("is-danger");monsterGroup.classList.add("is-startled","is-cheering");monsterGroup.setAttribute("transform",`translate(${monsterX} ${monsterY-2}) scale(1.08)`);showBloom("lava");setStatus("溶岩が主人公へ流れました。","danger");
        if(!reducedMotion)tween(260,progress=>heroGroup.setAttribute("transform",`translate(${layout.hero.x+Math.sin(progress*28)*(1-progress)*2.2} ${layout.hero.y+progress*1.2}) rotate(${Math.sin(progress*18)*(1-progress)*8})`),()=>{});
        later(()=>finishOnce(false,{reason:"lethal",detail:"溶岩を水で固める順番が必要でした。"}),reducedMotion?0:360);return;
      }
      if(step.flow==="coin"){state.coins++;heroGroup.classList.add("is-win");showBloom("gold")}
      done();return;
    }
    if(!chambers[step.to].open){const before=chambers[step.to].content;chambers[step.to].content=mix(before,step.flow);updateChamber(step.to);if(before&&chambers[step.to].content==="stone"){roomGroups[step.to].classList.add("is-collision");later(()=>roomGroups[step.to].classList.remove("is-collision"),reducedMotion?0:260)}}
    done();
  };
  const animateStep=(step,done)=>{
    const path=routePaths[step.from],group=svgElement(documentRef,"g",{class:"pp-flow"}),trail=svgElement(documentRef,"path",{class:"pp-flow-trail",stroke:step.flow==="lava"?"#ff6a2e":step.flow==="water"?"#66d2f4":"#f4ce54",d:"M-8 0 L-2 0"}),core=svgElement(documentRef,"circle",{class:"pp-flow-core",r:4.7,fill:step.flow==="lava"?"#ef4b26":step.flow==="water"?"#4abce5":"#edc34d"}),material=materialGraphic(step.flow,0,0,.52);group.append(trail,core,material);svg.append(group);routeGroups[step.from].classList.add("is-flowing");
    tween(700,progress=>{const length=path.getTotalLength(),point=path.getPointAtLength(length*progress),angle=progress<.98?(()=>{const b=path.getPointAtLength(length*Math.min(1,progress+.02));return Math.atan2(b.y-point.y,b.x-point.x)*180/Math.PI})():0;group.setAttribute("transform",`translate(${point.x} ${point.y}) rotate(${angle})`)},()=>{group.remove();routeGroups[step.from].classList.remove("is-flowing");arrive(step,done)});
  };
  const runSteps=(steps,index,done)=>{if(signal.aborted||state.ended)return;if(index>=steps.length){done();return}animateStep(steps[index],()=>runSteps(steps,index+1,done))};
  const settle=()=>{
    if(signal.aborted||state.ended)return;
    state.busy=false;updateControls();
    if(state.pulled.length===3){
      if(state.coins===state.total){heroGroup.classList.add("is-win");monsterGroup.classList.add("is-defeated");monsterGroup.setAttribute("transform",`translate(${monsterX} ${monsterY+3}) rotate(10)`);showBloom("gold");setStatus("コインが主人公へ届きました！","success");later(()=>finishOnce(true,{reason:"solved",detail:"3本の流れを読み切りました。"}),reducedMotion?0:360)}
      else{setStatus("コインが届きませんでした。","danger");later(()=>finishOnce(false,{reason:"wrong-order",detail:`正しい順番は ${orderLabel(task.answer)} です。`}),reducedMotion?0:220)}
    }else setStatus(`現在の順番: ${orderLabel(state.pulled)}`);
  };
  const pull=index=>{
    if(state.busy||state.ended||signal.aborted||!chambers[index]||chambers[index].open)return false;
    state.busy=true;state.pulled.push(index);const material=chambers[index].content,steps=pullSteps(index);updateChamber(index);updateControls();setStatus(`ピン ${index+1} を抜いています…`);
    roomGroups[index].classList.add("is-open");
    tween(210,progress=>{const kick=Math.sin(progress*Math.PI)*2.2;pinNodes[index].setAttribute("transform",`translate(${-8*progress-kick} ${5.5*progress}) rotate(${-34*progress})`);pinNodes[index].setAttribute("opacity",String(1-progress*.62))},()=>{pinNodes[index].classList.add("is-open");setStatus(`ピン ${index+1}: ${MATERIAL_NAME[material]}を流しています…`);runSteps(steps,0,settle)});return true;
  };

  buttons.forEach((button,index)=>{listen(button,"pointerdown",event=>{event.preventDefault();pull(index)});listen(button,"click",event=>{if(event.detail===0)pull(index)})});
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
