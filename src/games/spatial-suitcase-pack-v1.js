const GRID_WIDTH=5;
const GRID_HEIGHT=4;
const LID_LIMIT=2;
const DURATION=60000;
const PROMPT="必須の荷物を全部入れて、ケースを閉じる";
const HELP="回転して置き、コートは一度だけ圧縮。高さ2以下で、われものの上に硬い物を置かないでください。";

const metadata=Object.freeze({
  id:"spatial-suitcase-pack-v1",
  introducedIn:"2.0",
  tier:3,
  flavor:"satisfying",
  step:1,
  family:"spatial-suitcase-pack",
  category:"spatial"
});

const SHAPES=Object.freeze({
  coat:Object.freeze([[1,0],[0,1],[1,1],[2,1],[3,1]].map(Object.freeze)),
  boots:Object.freeze([[0,0],[0,1],[1,1],[2,1]].map(Object.freeze)),
  glass:Object.freeze([[0,0],[1,0],[2,0],[3,0]].map(Object.freeze)),
  notebook:Object.freeze([[0,0],[0,1],[1,0]].map(Object.freeze)),
  pouch:Object.freeze([[0,0],[1,0]].map(Object.freeze))
});

const ITEM_DEFS=Object.freeze([
  Object.freeze({id:"coat",label:"コート",short:"衣",material:"soft",hard:false,fragile:false,compressible:true,height:3,compressedHeight:2,shape:SHAPES.coat}),
  Object.freeze({id:"boots",label:"ブーツ",short:"靴",material:"ribbed",hard:true,fragile:false,compressible:false,height:1,compressedHeight:1,shape:SHAPES.boots}),
  Object.freeze({id:"glass",label:"ガラスケース",short:"硝",material:"glass",hard:false,fragile:true,compressible:false,height:1,compressedHeight:1,shape:SHAPES.glass}),
  Object.freeze({id:"notebook",label:"ノート",short:"紙",material:"paper",hard:true,fragile:false,compressible:false,height:1,compressedHeight:1,shape:SHAPES.notebook}),
  Object.freeze({id:"pouch",label:"ポーチ",short:"袋",material:"woven",hard:true,fragile:false,compressible:false,height:1,compressedHeight:1,shape:SHAPES.pouch})
]);
const ITEM_IDS=Object.freeze(ITEM_DEFS.map(item=>item.id));
const AUTHORED=Object.freeze([
  Object.freeze({layout:"corner-pair",blocked:Object.freeze([0,4]),solutionCount:1}),
  Object.freeze({layout:"offset-pair",blocked:Object.freeze([1,4]),solutionCount:2}),
  Object.freeze({layout:"diagonal-pair",blocked:Object.freeze([0,14]),solutionCount:3})
]);

const sameJson=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
const cloneShape=shape=>shape.map(([x,y])=>[x,y]);
const normalize=shape=>{const minX=Math.min(...shape.map(cell=>cell[0])),minY=Math.min(...shape.map(cell=>cell[1]));return shape.map(([x,y])=>[x-minX,y-minY]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])};
const rotateShape=shape=>normalize(shape.map(([x,y])=>[-y,x]));
const shapeKey=shape=>normalize(shape).map(cell=>cell.join(",")).join(";");
function orientations(shape){const result=[];let current=normalize(shape);for(let turn=0;turn<4;turn++){if(!result.some(entry=>shapeKey(entry)===shapeKey(current)))result.push(current);current=rotateShape(current)}return result}
const ITEM_ORIENTATIONS=Object.freeze(Object.fromEntries(ITEM_DEFS.map(item=>[item.id,Object.freeze(orientations(item.shape).map(shape=>Object.freeze(shape.map(Object.freeze))))])));
const itemById=id=>ITEM_DEFS.find(item=>item.id===id);
const cellIndex=(x,y)=>y*GRID_WIDTH+x;
const cellPoint=index=>({x:index%GRID_WIDTH,y:Math.floor(index/GRID_WIDTH)});
const usableCells=blocked=>Array.from({length:GRID_WIDTH*GRID_HEIGHT},(_,index)=>index).filter(index=>!blocked.includes(index));

function candidatePlacements(item,blocked){
  const blockedSet=new Set(blocked),result=[];
  ITEM_ORIENTATIONS[item.id].forEach((shape,orientation)=>{
    const width=1+Math.max(...shape.map(cell=>cell[0])),height=1+Math.max(...shape.map(cell=>cell[1]));
    for(let y=0;y<=GRID_HEIGHT-height;y++)for(let x=0;x<=GRID_WIDTH-width;x++){
      const cells=shape.map(([dx,dy])=>cellIndex(x+dx,y+dy));
      if(!cells.some(cell=>blockedSet.has(cell)))result.push({orientation,x,y,cells});
    }
  });
  return result;
}

function exhaustiveSolutions(blocked,limit=4){
  const candidates=ITEM_DEFS.map(item=>candidatePlacements(item,blocked)),solutions=[];
  const visit=(remaining,occupied,placements)=>{
    if(solutions.length>=limit)return;
    if(!remaining.length){solutions.push(placements.map(value=>({...value,cells:[...value.cells]})));return}
    let selected=-1,available=null;
    for(const index of remaining){const next=candidates[index].filter(placement=>placement.cells.every(cell=>!occupied.has(cell)));if(!next.length)return;if(!available||next.length<available.length){selected=index;available=next}}
    for(const placement of available){placement.cells.forEach(cell=>occupied.add(cell));visit(remaining.filter(index=>index!==selected),occupied,[...placements,{itemIndex:selected,...placement}]);placement.cells.forEach(cell=>occupied.delete(cell))}
  };
  visit(ITEM_DEFS.map((_,index)=>index),new Set(blocked),[]);
  return{solutions,candidateCounts:candidates.map(list=>list.length)};
}

function proofFor(descriptor){
  const exhaustive=exhaustiveSolutions(descriptor.blocked),itemCells=ITEM_DEFS.reduce((sum,item)=>sum+item.shape.length,0),allRequireRotation=exhaustive.solutions.every(solution=>solution.some(placement=>placement.orientation!==0));
  return{grid:[GRID_WIDTH,GRID_HEIGHT],usableCells:usableCells(descriptor.blocked).length,itemCells,totalCandidatePlacements:exhaustive.candidateCounts.reduce((sum,count)=>sum+count,0),solutionCount:exhaustive.solutions.length,allRequireRotation,allRequireCompression:true,compressedHeight:LID_LIMIT,rawHeight:LID_LIMIT+1,heightLimit:LID_LIMIT,oneOver:true};
}

const copyItems=()=>ITEM_DEFS.map(item=>({id:item.id,label:item.label,short:item.short,material:item.material,hard:item.hard,fragile:item.fragile,compressible:item.compressible,height:item.height,compressedHeight:item.compressedHeight,shape:cloneShape(item.shape)}));
const initialState=()=>({items:ITEM_DEFS.map(item=>({id:item.id,orientation:0,compressed:false,placement:null})),nextOrder:1});
function makeTask(descriptor,itemOrder){return{kind:"suitcasePack",prompt:PROMPT,help:HELP,layout:descriptor.layout,width:GRID_WIDTH,height:GRID_HEIGHT,blocked:[...descriptor.blocked],limit:LID_LIMIT,duration:DURATION,items:copyItems(),itemOrder:[...itemOrder],proof:proofFor(descriptor),state:initialState()}}
function generate({pick,shuffle}={}){
  const chosen=typeof pick==="function"?pick(AUTHORED):AUTHORED[0],descriptor=AUTHORED.includes(chosen)?chosen:AUTHORED[0],shuffled=typeof shuffle==="function"?shuffle([...ITEM_IDS]):[...ITEM_IDS],itemOrder=Array.isArray(shuffled)&&shuffled.length===ITEM_IDS.length&&new Set(shuffled).size===ITEM_IDS.length&&shuffled.every(id=>ITEM_IDS.includes(id))?shuffled:[...ITEM_IDS];
  return makeTask(descriptor,itemOrder);
}

const exactKeys=(value,keys)=>value&&typeof value==="object"&&!Array.isArray(value)&&sameJson(Object.keys(value).sort(),[...keys].sort());
function validate(task){
  const issues=[];
  if(!task||typeof task!=="object"||Array.isArray(task))return["task must be an object"];
  const rootKeys=["kind","prompt","help","layout","width","height","blocked","limit","duration","items","itemOrder","proof","state"];
  if(!exactKeys(task,rootKeys))issues.push("task fields must remain exact");
  if(task.kind!=="suitcasePack")issues.push("kind must remain suitcasePack");
  if(task.prompt!==PROMPT||task.help!==HELP)issues.push("copy changed");
  const descriptor=AUTHORED.find(entry=>entry.layout===task.layout);
  if(!descriptor)issues.push("layout must be authored");
  if(task.width!==GRID_WIDTH||task.height!==GRID_HEIGHT)issues.push("grid must remain 5 by 4");
  if(descriptor&&!sameJson(task.blocked,descriptor.blocked))issues.push("wheel wells changed");
  if(task.limit!==LID_LIMIT||task.duration!==DURATION)issues.push("height limit or duration changed");
  if(!sameJson(task.items,copyItems()))issues.push("item definitions changed");
  if(!Array.isArray(task.itemOrder)||task.itemOrder.length!==ITEM_IDS.length||new Set(task.itemOrder).size!==ITEM_IDS.length||task.itemOrder.some(id=>!ITEM_IDS.includes(id)))issues.push("item order must be an exact inventory permutation");
  if(descriptor){const expected=proofFor(descriptor);if(!sameJson(task.proof,expected))issues.push("exhaustive proof changed");if(expected.solutionCount!==descriptor.solutionCount||expected.solutionCount<1||expected.solutionCount>3)issues.push("authored solution count is outside 1 to 3");if(!expected.allRequireRotation||!expected.allRequireCompression||!expected.oneOver||expected.usableCells!==18||expected.itemCells!==18)issues.push("authored proof lost a required boundary")}
  const state=task.state;
  if(!exactKeys(state,["items","nextOrder"]))issues.push("state fields must remain exact");
  const records=Array.isArray(state?.items)?state.items:[];
  if(records.length!==ITEM_IDS.length||records.map(record=>record?.id).sort().join("|")!==[...ITEM_IDS].sort().join("|"))issues.push("state must retain every item exactly once");
  const orders=[];
  for(const record of records){
    const item=itemById(record?.id);
    if(!item)continue;
    if(!exactKeys(record,["id","orientation","compressed","placement"]))issues.push(`${item.id} state fields changed`);
    const options=ITEM_ORIENTATIONS[item.id];
    if(!Number.isInteger(record.orientation)||record.orientation<0||record.orientation>=options.length)issues.push(`${item.id} orientation is invalid`);
    if(typeof record.compressed!=="boolean"||record.compressed&& !item.compressible)issues.push(`${item.id} compression is invalid`);
    if(record.placement!==null){
      const placement=record.placement;
      if(!exactKeys(placement,["x","y","order"])||![placement.x,placement.y,placement.order].every(Number.isInteger)||placement.order<1)issues.push(`${item.id} placement is invalid`);
      else if(options[record.orientation]){const cells=options[record.orientation].map(([dx,dy])=>({x:placement.x+dx,y:placement.y+dy}));if(cells.some(cell=>cell.x<0||cell.x>=GRID_WIDTH||cell.y<0||cell.y>=GRID_HEIGHT||task.blocked?.includes(cellIndex(cell.x,cell.y))))issues.push(`${item.id} placement leaves the usable case`);orders.push(placement.order)}
    }
  }
  if(new Set(orders).size!==orders.length)issues.push("placement orders must be unique");
  const maxOrder=orders.length?Math.max(...orders):0;
  if(!Number.isInteger(state?.nextOrder)||state.nextOrder<1||state.nextOrder<=maxOrder)issues.push("nextOrder must follow every placement");
  return[...new Set(issues)];
}

function analyze(task,records){
  const stacks=Array.from({length:GRID_WIDTH*GRID_HEIGHT},()=>[]),recordMap=new Map(records.map(record=>[record.id,record]));
  for(const record of records){if(!record.placement)continue;const item=itemById(record.id),shape=ITEM_ORIENTATIONS[item.id][record.orientation],height=record.compressed?item.compressedHeight:item.height;for(const[dx,dy]of shape){const index=cellIndex(record.placement.x+dx,record.placement.y+dy);stacks[index].push({id:item.id,order:record.placement.order,height,hard:item.hard,fragile:item.fragile})}}
  stacks.forEach(stack=>stack.sort((a,b)=>a.order-b.order));
  const heights=stacks.map(stack=>stack.reduce((sum,entry)=>sum+entry.height,0)),highest=Math.max(0,...heights),missing=ITEM_IDS.filter(id=>!recordMap.get(id)?.placement),crushed=[];
  for(const item of ITEM_DEFS.filter(entry=>entry.fragile)){const record=recordMap.get(item.id);if(!record?.placement)continue;const broken=stacks.some(stack=>{const fragile=stack.find(entry=>entry.id===item.id);return fragile&&stack.some(entry=>entry.hard&&entry.order>fragile.order)});if(broken)crushed.push(item.id)}
  const usable=new Set(usableCells(task.blocked)),gaps=[...usable].filter(index=>!stacks[index].length),overlaps=[...usable].filter(index=>stacks[index].length>1);
  const outcome=missing.length?"missing-essential":crushed.length?"crushed-fragile":highest>task.limit?"raised-lid":gaps.length||overlaps.length?"bad-pack":"success";
  return{outcome,stacks:stacks.map(stack=>stack.map(entry=>({...entry}))),heights,highest,missing,crushed,gaps,overlaps,placed:ITEM_IDS.length-missing.length};
}

const STYLE=`
.spk-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;padding:.15rem max(.12rem,env(safe-area-inset-left)) .2rem max(.12rem,env(safe-area-inset-right));display:grid;gap:.38rem;color:#392d3d}.spk-status{min-height:2.75rem;margin:0;padding:.48rem .65rem;border:1px solid #d8cadc;border-radius:.78rem;background:#f7f1f7;color:#604563;text-align:center;font-size:.79rem;font-weight:900;line-height:1.4}.spk-status.warn{border-color:#d8989f;background:#fff0f1;color:#8a3040}.spk-status.good{border-color:#8fc7a0;background:#ebf8ef;color:#286645}.spk-meter{display:flex;justify-content:space-between;align-items:center;min-height:2.75rem;padding:.35rem .62rem;border-radius:.72rem;background:linear-gradient(#eee5dd,#dfd1c3);color:#5b4438;font-size:.74rem;font-weight:950;box-shadow:inset 0 1px #fff}.spk-height{padding:.28rem .55rem;border-radius:999px;background:#fff;border:2px solid #876276;font-size:.82rem}.spk-height.over{border-color:#b63e50;background:#fff0f1;color:#9a2e40}
.spk-case{position:relative;min-height:17.25rem;padding-top:4.2rem;overflow:hidden;border-radius:1.05rem;background:linear-gradient(145deg,#baa6b8,#755a75 48%,#49384e);box-shadow:0 12px 25px rgba(46,28,48,.28);touch-action:none}.spk-case:focus-within{box-shadow:0 0 0 3px #fff,0 0 0 6px #6e3d76,0 12px 25px rgba(46,28,48,.3)}.spk-lid{position:absolute;z-index:3;left:4%;right:4%;top:.45rem;height:3.55rem;border:3px solid #5b4159;border-radius:1rem 1rem .55rem .55rem;background:repeating-linear-gradient(125deg,rgba(255,255,255,.08) 0 2px,transparent 2px 9px),linear-gradient(145deg,#a47c9d,#674b6b);box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 5px 11px rgba(35,20,38,.24);transform-origin:50% 100%;transition:transform .34s ease,top .34s ease,height .34s ease}.spk-lid::before{content:"FICTIONAL CASE";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:.22rem .52rem;border:1px solid rgba(255,255,255,.45);border-radius:999px;color:#f8edf5;font-size:.56rem;font-weight:950;letter-spacing:.08em;white-space:nowrap}.spk-case.closing .spk-lid{transform:perspective(280px) rotateX(-38deg);top:1.4rem}.spk-case.pressed .spk-lid,.spk-case.success .spk-lid{z-index:40;top:4.2rem;height:calc(100% - 4.5rem);transform:none;border-radius:.85rem}.spk-case.raised-lid .spk-lid{z-index:40;top:3.35rem;transform:perspective(280px) rotateX(-11deg);box-shadow:0 13px 0 #f1d1c2,0 17px 22px rgba(49,24,38,.42)}.spk-case.timeout{filter:saturate(.65)}.spk-case.success{box-shadow:0 0 0 4px #72bd89,0 13px 30px rgba(40,112,67,.3)}.spk-case.crushed-fragile{box-shadow:0 0 0 4px #c64b59,0 13px 28px rgba(104,27,43,.32)}
.spk-grid{position:relative;z-index:5;width:calc(100% - 1.2rem);max-width:19rem;margin:0 auto .58rem;aspect-ratio:5/4;border:4px solid #3f3042;border-radius:.65rem;overflow:hidden;background:#d7c4aa;box-shadow:inset 0 0 0 3px #f0e2cf,inset 0 8px 16px rgba(77,52,48,.2)}.spk-base,.spk-piece,.spk-ghost{box-sizing:border-box;position:absolute;width:20%;height:25%}.spk-base{z-index:1;border:1px solid rgba(91,67,61,.26);background:linear-gradient(145deg,rgba(255,255,255,.24),rgba(122,91,72,.08));color:#715d50;font-size:.6rem}.spk-base.blocked{background:repeating-linear-gradient(135deg,#5a4657 0 5px,#80677d 5px 10px);color:#fff}.spk-base:focus-visible,.spk-item:focus-visible,.spk-action:focus-visible,.spk-close:focus-visible,.spk-piece:focus-visible{outline:3px solid #fff;outline-offset:-5px;box-shadow:0 0 0 4px #632f70}.spk-piece{z-index:10;display:grid;place-items:center;border:2px solid var(--edge);background:var(--fill);color:var(--ink);font-size:.72rem;font-weight:950;text-shadow:0 1px rgba(255,255,255,.45);box-shadow:inset 2px 2px rgba(255,255,255,.35),inset -3px -3px rgba(60,35,44,.16),0 3px 6px rgba(48,30,40,.22);transition:left .16s ease,top .16s ease,transform .16s ease}.spk-piece.soft{--fill:repeating-linear-gradient(135deg,#d9a7a3 0 7px,#cd9293 7px 14px);--edge:#8f565d;--ink:#5c3139}.spk-piece.ribbed{--fill:repeating-linear-gradient(90deg,#a66d52 0 5px,#87553f 5px 9px);--edge:#593b32;--ink:#fff}.spk-piece.glass{--fill:linear-gradient(135deg,rgba(241,255,255,.92),rgba(111,188,202,.74));--edge:#397b8b;--ink:#234f59;clip-path:polygon(8% 0,92% 0,100% 15%,100% 85%,92% 100%,8% 100%,0 85%,0 15%)}.spk-piece.paper{--fill:repeating-linear-gradient(0deg,#f1d995 0 8px,#d5b66f 8px 10px);--edge:#8c6b36;--ink:#5c451f}.spk-piece.woven{--fill:repeating-linear-gradient(45deg,#91b58e 0 5px,#759c79 5px 10px);--edge:#496e50;--ink:#fff}.spk-piece.compressed{transform:scale(.94);border-style:dashed}.spk-piece.selected{filter:brightness(1.1);box-shadow:inset 2px 2px rgba(255,255,255,.35),0 0 0 3px #fff,0 0 0 6px #6d3675,0 7px 10px rgba(45,25,48,.35)}.spk-piece.crushed{background:repeating-linear-gradient(45deg,rgba(143,25,50,.86) 0 4px,rgba(213,230,232,.75) 4px 10px);border-color:#a52f45}.spk-ghost{z-index:35;border:3px dashed #fff;background:rgba(102,50,114,.3);pointer-events:none}.spk-height-mark{position:absolute;z-index:36;display:grid;place-items:center;width:1.15rem;height:1.15rem;border-radius:50%;background:#443144;color:#fff;font-size:.58rem;font-weight:950;pointer-events:none;transform:translate(4px,4px)}.spk-piece[hidden],.spk-ghost[hidden],.spk-height-mark[hidden]{display:none!important}
.spk-items{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.18rem}.spk-item{position:relative;min-width:0;min-height:5.7rem;padding:.25rem .05rem;border:2px solid var(--edge);border-radius:.68rem;background:var(--fill);color:var(--ink);font-size:.58rem;font-weight:950;line-height:1.12;box-shadow:inset 1px 1px rgba(255,255,255,.42),0 3px 6px rgba(48,34,42,.12)}.spk-item::after{content:"必須";display:block;width:max-content;margin:.11rem auto 0;padding:.07rem .2rem;border-radius:999px;background:rgba(255,255,255,.78);color:#5c3f58;font-size:.46rem}.spk-mini{position:relative;display:block;width:2.45rem;height:1.72rem;margin:0 auto .88rem;filter:drop-shadow(0 1px 1px rgba(42,28,38,.26))}.spk-mini i{box-sizing:border-box;position:absolute;border:1.5px solid currentColor;border-radius:.13rem;background:rgba(255,255,255,.82)}.spk-mini::after{content:attr(data-height);position:absolute;left:50%;top:calc(100% + .12rem);transform:translateX(-50%);display:grid;place-items:center;min-width:1.28rem;height:.72rem;padding:0 .15rem;border-radius:999px;background:#3f3341;color:#fff;font-size:.42rem;font-style:normal;letter-spacing:.02em;box-shadow:0 1px 2px rgba(0,0,0,.24)}.spk-mini.compressed i{border-style:dashed;background:rgba(255,255,255,.6);transform:scale(.92)}.spk-item-name,.spk-item-kind{display:block;white-space:normal}.spk-item-kind{margin-top:.06rem;font-size:.47rem;opacity:.92}.spk-item.soft{--fill:linear-gradient(#efd0cd,#dba6a4);--edge:#9e6569;--ink:#60383d}.spk-item.ribbed{--fill:linear-gradient(#be896b,#95634c);--edge:#644334;--ink:#fff}.spk-item.glass{--fill:linear-gradient(#e8fbff,#a7dce5);--edge:#4c8e9b;--ink:#27545d}.spk-item.paper{--fill:linear-gradient(#f5e4ac,#d8bc75);--edge:#92713c;--ink:#60491f}.spk-item.woven{--fill:linear-gradient(#b3d0ad,#7fa482);--edge:#54745a;--ink:#fff}.spk-item.selected{box-shadow:0 0 0 3px #fff,0 0 0 6px #6c3775,0 6px 11px rgba(55,29,57,.25)}.spk-item.placed::before{content:"収納中";position:absolute;right:.12rem;top:.12rem;padding:.08rem .18rem;border-radius:.25rem;background:#3d3240;color:#fff;font-size:.45rem}.spk-item.compressed{border-style:dashed}.spk-item.dragging{transform:translateY(-4px);filter:brightness(1.08)}
.spk-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:.28rem}.spk-action,.spk-close{min-height:2.75rem;border:2px solid #bcaabc;border-radius:.68rem;background:#fff;color:#5b3c5f;font-size:.72rem;font-weight:950}.spk-action:disabled,.spk-close:disabled{opacity:1;background:#eee8ed;color:#8f858e;border-color:#d7ced5}.spk-close{min-height:3rem;border-color:#74526e;background:linear-gradient(#7f5e7b,#5a405c);color:#fff;font-size:.86rem;box-shadow:0 4px 8px rgba(55,35,56,.24)}.spk-stage[data-reduced=true] .spk-lid,.spk-stage[data-reduced=true] .spk-piece{transition:none}@media(prefers-reduced-motion:reduce){.spk-lid,.spk-piece{transition:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="spk-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));
  const status=documentRef.createElement("p");status.className="spk-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const meter=documentRef.createElement("div");meter.className="spk-meter";const inventoryText=documentRef.createElement("span"),heightText=documentRef.createElement("strong");heightText.className="spk-height";meter.append(inventoryText,heightText);
  const caseNode=documentRef.createElement("section");caseNode.className="spk-case";caseNode.setAttribute("aria-label","架空のケース");
  const lid=documentRef.createElement("div");lid.className="spk-lid";lid.setAttribute("aria-hidden","true");
  const grid=documentRef.createElement("div");grid.className="spk-grid";grid.setAttribute("role","grid");grid.setAttribute("aria-label","5列4行のケース内部");
  const itemsNode=documentRef.createElement("div");itemsNode.className="spk-items";itemsNode.setAttribute("role","group");itemsNode.setAttribute("aria-label","すべて必須の荷物");
  const actions=documentRef.createElement("div");actions.className="spk-actions";
  const rotateButton=documentRef.createElement("button"),compressButton=documentRef.createElement("button"),removeButton=documentRef.createElement("button"),closeButton=documentRef.createElement("button");
  [rotateButton,compressButton,removeButton,closeButton].forEach(button=>button.type="button");rotateButton.className=compressButton.className=removeButton.className="spk-action";closeButton.className="spk-close";rotateButton.textContent="右へ回転";compressButton.textContent="一度だけ圧縮";removeButton.textContent="ケースから出す";closeButton.textContent="ケースを閉じる";actions.append(rotateButton,compressButton,removeButton);caseNode.append(lid,grid);stage.append(status,meter,caseNode,itemsNode,actions,closeButton);context.host.replaceChildren(style,stage);

  const records=task.state.items.map(record=>({id:record.id,orientation:record.orientation,compressed:record.compressed,placement:record.placement?{...record.placement}:null})),recordMap=new Map(records.map(record=>[record.id,record])),gridButtons=[],itemButtons=new Map(),miniCells=new Map(),pieceButtons=new Map(),ghostNodes=[],heightMarks=[];
  const state={selected:null,cursor:{x:0,y:0},drag:null,ghost:null,nextOrder:task.state.nextOrder,snapStage:0,lid:"open",closeStage:0,outcome:"active",done:false,disposed:false,committed:false,invalid:0,revision:0};
  const blockedSet=new Set(task.blocked);
  const position=(node,x,y)=>{node.style.left=`${x*20}%`;node.style.top=`${y*25}%`};
  for(let index=0;index<GRID_WIDTH*GRID_HEIGHT;index++){
    const point=cellPoint(index),button=documentRef.createElement("button");button.type="button";button.className=`spk-base${blockedSet.has(index)?" blocked":""}`;button.textContent=blockedSet.has(index)?"WELL":"";button.disabled=blockedSet.has(index);button.setAttribute("role","gridcell");button.setAttribute("aria-label",blockedSet.has(index)?`${point.y+1}行${point.x+1}列 ホイール部分`:`${point.y+1}行${point.x+1}列`);position(button,point.x,point.y);gridButtons.push(button);grid.append(button);
  }
  for(let index=0;index<5;index++){const ghost=documentRef.createElement("i");ghost.className="spk-ghost";ghost.hidden=true;ghostNodes.push(ghost);grid.append(ghost)}
  for(let index=0;index<GRID_WIDTH*GRID_HEIGHT;index++){const mark=documentRef.createElement("span");mark.className="spk-height-mark";mark.hidden=true;position(mark,index%GRID_WIDTH,Math.floor(index/GRID_WIDTH));heightMarks.push(mark);grid.append(mark)}
  for(const id of task.itemOrder){const item=itemById(id),button=documentRef.createElement("button"),mini=documentRef.createElement("span"),name=documentRef.createElement("span"),kind=documentRef.createElement("span"),cells=[];button.type="button";button.className=`spk-item ${item.material}`;mini.className="spk-mini";mini.setAttribute("aria-hidden","true");for(let index=0;index<item.shape.length;index++){const cell=documentRef.createElement("i");cells.push(cell);mini.append(cell)}name.className="spk-item-name";name.textContent=item.label;kind.className="spk-item-kind";kind.textContent=item.fragile?"われもの":item.compressible?"やわらかい":"かたい";button.append(mini,name,kind);button.setAttribute("aria-label",`${item.label}、必須、${item.fragile?"われもの":item.compressible?"やわらかい、圧縮できます":"かたい"}`);itemButtons.set(id,button);miniCells.set(id,{mini,cells});itemsNode.append(button)}
  for(const item of ITEM_DEFS){const buttons=[];for(let index=0;index<item.shape.length;index++){const button=documentRef.createElement("button");button.type="button";button.className=`spk-piece ${item.material}`;button.hidden=true;button.textContent=index===0?item.short:"";buttons.push(button);grid.append(button)}pieceButtons.set(item.id,buttons)}

  const currentAnalysis=()=>analyze(task,records);
  const snapshot=()=>({items:records.map(record=>({id:record.id,orientation:record.orientation,compressed:record.compressed,placement:record.placement?{...record.placement}:null})),nextOrder:state.nextOrder});
  const shapeFor=record=>ITEM_ORIENTATIONS[record.id][record.orientation];
  const placementCells=(record,placement=record.placement)=>placement?shapeFor(record).map(([dx,dy])=>({x:placement.x+dx,y:placement.y+dy,index:cellIndex(placement.x+dx,placement.y+dy)})):[];
  const canPlace=(record,x,y)=>placementCells(record,{x,y,order:1}).every(cell=>cell.x>=0&&cell.x<GRID_WIDTH&&cell.y>=0&&cell.y<GRID_HEIGHT&&!blockedSet.has(cell.index));
  const setMessage=(text,tone="")=>{status.className=`spk-status${tone?` ${tone}`:""}`;status.textContent=text};
  const detailFor=outcome=>outcome==="success"?"高さ2で、われものを守って閉じました。":outcome==="missing-essential"?"必須の荷物がケースの外に残っています。":outcome==="crushed-fragile"?"われものの上に硬い荷物が重なっています。":outcome==="raised-lid"?"最高3で、ふたが1段ぶん浮きました。":outcome==="bad-pack"?"重なりと空きが残る、直せる配置でした。":"時間切れです。配置と高さはそのまま残ります。";
  const refresh=()=>{
    const analysis=currentAnalysis();inventoryText.textContent=`収納 ${analysis.placed} / ${ITEM_IDS.length}`;heightText.textContent=`最高 ${analysis.highest} / ${task.limit}`;heightText.classList.toggle("over",analysis.highest>task.limit);
    caseNode.className=`spk-case${state.lid!=="open"?` ${state.lid}`:""}${state.outcome!=="active"?` ${state.outcome}`:""}`;
    for(const item of ITEM_DEFS){const record=recordMap.get(item.id),tray=itemButtons.get(item.id);tray.className=`spk-item ${item.material}${state.selected===item.id?" selected":""}${record.placement?" placed":""}${record.compressed?" compressed":""}${state.drag?.id===item.id?" dragging":""}`;tray.disabled=state.done;const preview=miniCells.get(item.id),previewShape=shapeFor(record),previewWidth=1+Math.max(...previewShape.map(cell=>cell[0])),previewHeight=1+Math.max(...previewShape.map(cell=>cell[1])),previewValue=record.compressed?item.compressedHeight:item.height;preview.mini.className=`spk-mini${record.compressed?" compressed":""}`;preview.mini.setAttribute("data-height",`H${previewValue}`);preview.cells.forEach((cell,index)=>{const[x,y]=previewShape[index];cell.style.left=`${x/previewWidth*100}%`;cell.style.top=`${y/previewHeight*100}%`;cell.style.width=`${100/previewWidth}%`;cell.style.height=`${100/previewHeight}%`});const buttons=pieceButtons.get(item.id),cells=placementCells(record),isCrushed=analysis.crushed.includes(item.id);buttons.forEach((button,index)=>{const cell=cells[index];button.hidden=!cell;if(!cell)return;position(button,cell.x,cell.y);button.style.zIndex=String(10+record.placement.order);button.className=`spk-piece ${item.material}${record.compressed?" compressed":""}${state.selected===item.id?" selected":""}${isCrushed?" crushed":""}`;button.disabled=state.done;button.setAttribute("aria-label",`${item.label}、${cell.y+1}行${cell.x+1}列、高さ${record.compressed?item.compressedHeight:item.height}${isCrushed?"、われています":""}`)})}
    ghostNodes.forEach(node=>node.hidden=true);if(state.ghost&&state.selected){const record=recordMap.get(state.selected),cells=placementCells(record,{x:state.ghost.x,y:state.ghost.y,order:1});cells.forEach((cell,index)=>{const node=ghostNodes[index];node.hidden=false;position(node,cell.x,cell.y)})}
    heightMarks.forEach((mark,index)=>{mark.hidden=!analysis.heights[index];mark.textContent=String(analysis.heights[index]);mark.setAttribute("aria-label",`${cellPoint(index).y+1}行${cellPoint(index).x+1}列 高さ${analysis.heights[index]}`)});
    itemButtons.forEach((button,id)=>button.setAttribute("aria-pressed",String(state.selected===id)));rotateButton.disabled=state.done||!state.selected;const selected=state.selected?recordMap.get(state.selected):null,selectedDef=state.selected?itemById(state.selected):null;compressButton.disabled=state.done||!selectedDef?.compressible||selected?.compressed;removeButton.disabled=state.done||!selected?.placement;closeButton.disabled=state.done;gridButtons.forEach((button,index)=>button.disabled=state.done||blockedSet.has(index));grid.setAttribute("aria-label",`5列4行。収納${analysis.placed}個。最高${analysis.highest}/${task.limit}。選択${state.selected?itemById(state.selected).label:"なし"}`);
  };
  const reject=message=>{if(state.done||state.disposed)return false;state.invalid++;setMessage(message,"warn");state.revision++;const revision=state.revision;context.later(()=>{if(state.done||state.disposed||revision!==state.revision)return;setMessage("荷物を選び、回転してケースへ置きます")},context.reducedMotion?40:280);refresh();return false};
  const select=id=>{if(state.done||state.disposed||!ITEM_IDS.includes(id))return false;state.selected=id;state.ghost=null;setMessage(`${itemById(id).label}を選びました`);refresh();return true};
  const rotate=()=>{if(state.done||!state.selected)return false;const record=recordMap.get(state.selected),count=ITEM_ORIENTATIONS[record.id].length,next=(record.orientation+1)%count,previous=record.orientation;record.orientation=next;if(record.placement&&!canPlace(record,record.placement.x,record.placement.y)){record.orientation=previous;return reject("その場では回転できません。別の位置へ動かしてください")};state.snapStage=1;state.revision++;const revision=state.revision;setMessage(`${itemById(record.id).label}を右へ回しました`);refresh();context.later(()=>{if(state.done||state.disposed||revision!==state.revision)return;state.snapStage=2;refresh()},context.reducedMotion?24:120);return true};
  const compress=()=>{if(state.done||!state.selected)return false;const record=recordMap.get(state.selected),item=itemById(record.id);if(!item.compressible||record.compressed)return reject("この荷物は圧縮できません");record.compressed=true;state.snapStage=1;state.revision++;const revision=state.revision;setMessage(`${item.label}を一度だけ圧縮。高さ${item.compressedHeight}です`);refresh();context.later(()=>{if(state.done||state.disposed||revision!==state.revision)return;state.snapStage=2;refresh()},context.reducedMotion?24:120);return true};
  const place=(id,x,y)=>{if(state.done||state.disposed||!ITEM_IDS.includes(id)||!Number.isInteger(x)||!Number.isInteger(y))return false;const record=recordMap.get(id);if(!canPlace(record,x,y))return reject("ケースの外やホイール部分には置けません");record.placement={x,y,order:state.nextOrder++};state.selected=id;state.cursor={x,y};state.ghost=null;state.snapStage=1;state.revision++;const revision=state.revision,analysis=currentAnalysis();setMessage(analysis.crushed.length?"硬い荷物がわれものの上です":"グリッドへ置きました",analysis.crushed.length?"warn":"");refresh();context.later(()=>{if(state.done||state.disposed||revision!==state.revision)return;state.snapStage=2;refresh()},context.reducedMotion?24:120);return true};
  const remove=()=>{if(state.done||!state.selected)return false;const record=recordMap.get(state.selected);if(!record.placement)return false;record.placement=null;state.revision++;state.snapStage=1;setMessage(`${itemById(record.id).label}をケースから出しました`);refresh();const revision=state.revision;context.later(()=>{if(state.done||state.disposed||revision!==state.revision)return;state.snapStage=2;refresh()},context.reducedMotion?24:120);return true};
  const finalize=(analysis,revision)=>{if(state.disposed||state.committed||revision!==state.revision)return false;state.closeStage=2;state.lid=analysis.outcome;state.outcome=analysis.outcome;state.committed=true;const correct=analysis.outcome==="success",detail=detailFor(analysis.outcome);setMessage(detail,correct?"good":"warn");refresh();context.finish(correct,{outcome:analysis.outcome,detail,state:snapshot(),analysis:{highest:analysis.highest,heights:[...analysis.heights],missing:[...analysis.missing],crushed:[...analysis.crushed],gaps:[...analysis.gaps],overlaps:[...analysis.overlaps]}});return true};
  const close=()=>{if(state.done||state.disposed)return false;const analysis=currentAnalysis();state.done=true;state.outcome=analysis.outcome;state.lid="closing";state.closeStage=0;state.revision++;const revision=state.revision;setMessage("ふたを下ろしています");refresh();context.later(()=>{if(state.disposed||revision!==state.revision)return;state.closeStage=1;state.lid=analysis.outcome==="raised-lid"?"raised-lid":"pressed";refresh()},context.reducedMotion?35:130);context.later(()=>finalize(analysis,revision),context.reducedMotion?85:390);return true};
  const completeSnap=()=>{if(state.done)return false;state.revision++;state.snapStage=2;refresh();return true};
  const completeClose=()=>{if(!state.done||state.committed)return false;const analysis=currentAnalysis();state.revision++;return finalize(analysis,state.revision)};
  const timeout=()=>{if(state.done||state.disposed)return false;const analysis=currentAnalysis();state.done=true;state.outcome="timeout";state.lid="timeout";state.committed=true;state.revision++;const detail=detailFor("timeout");setMessage(detail,"warn");refresh();context.finish(false,{outcome:"timeout",detail,state:snapshot(),analysis:{highest:analysis.highest,heights:[...analysis.heights],missing:[...analysis.missing],crushed:[...analysis.crushed],gaps:[...analysis.gaps],overlaps:[...analysis.overlaps]}});return true};

  const beginDrag=(id,event)=>{if(state.done)return;event.preventDefault();select(id);state.drag={id,pointerId:event.pointerId};state.ghost=null;refresh()};
  const dragMove=event=>{if(!state.drag||event.pointerId!==state.drag.pointerId||state.done)return;const rect=grid.getBoundingClientRect(),localX=(event.clientX-rect.left)/Math.max(1,rect.width),localY=(event.clientY-rect.top)/Math.max(1,rect.height),x=Math.max(0,Math.min(GRID_WIDTH-1,Math.floor(localX*GRID_WIDTH))),y=Math.max(0,Math.min(GRID_HEIGHT-1,Math.floor(localY*GRID_HEIGHT))),record=recordMap.get(state.drag.id);state.ghost=canPlace(record,x,y)?{x,y}:null;refresh()};
  const dragEnd=event=>{if(!state.drag||event.pointerId!==state.drag.pointerId)return;const drag=state.drag,ghost=state.ghost;state.drag=null;state.ghost=null;if(ghost)place(drag.id,ghost.x,ghost.y);else refresh()};
  const moveCursor=(dx,dy)=>{state.cursor={x:Math.max(0,Math.min(GRID_WIDTH-1,state.cursor.x+dx)),y:Math.max(0,Math.min(GRID_HEIGHT-1,state.cursor.y+dy))};gridButtons[cellIndex(state.cursor.x,state.cursor.y)].focus({preventScroll:true})};

  itemButtons.forEach((button,id)=>{context.listen(button,"pointerdown",event=>beginDrag(id,event));context.listen(button,"click",event=>{if(event.detail===0)select(id)});context.listen(button,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();select(id)}})});
  pieceButtons.forEach((buttons,id)=>buttons.forEach(button=>{context.listen(button,"pointerdown",event=>beginDrag(id,event));context.listen(button,"click",event=>{if(event.detail===0)select(id)});context.listen(button,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();select(id)}})}));
  gridButtons.forEach((button,index)=>{const point=cellPoint(index);context.listen(button,"pointerdown",event=>{if(!state.selected||blockedSet.has(index))return;event.preventDefault();place(state.selected,point.x,point.y)});context.listen(button,"click",event=>{if(event.detail===0&&state.selected&&!blockedSet.has(index))place(state.selected,point.x,point.y)});context.listen(button,"keydown",event=>{if(event.key==="ArrowLeft"){event.preventDefault();moveCursor(-1,0)}else if(event.key==="ArrowRight"){event.preventDefault();moveCursor(1,0)}else if(event.key==="ArrowUp"){event.preventDefault();moveCursor(0,-1)}else if(event.key==="ArrowDown"){event.preventDefault();moveCursor(0,1)}else if((event.key==="Enter"||event.key===" ")&&state.selected){event.preventDefault();place(state.selected,point.x,point.y)}})});
  const bindAction=(button,action)=>{context.listen(button,"pointerdown",event=>{event.preventDefault();action()});context.listen(button,"click",event=>{if(event.detail===0)action()});context.listen(button,"keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();action()}})};bindAction(rotateButton,rotate);bindAction(compressButton,compress);bindAction(removeButton,remove);bindAction(closeButton,close);
  if(view){context.listen(view,"pointermove",dragMove,{passive:true});context.listen(view,"pointerup",dragEnd);context.listen(view,"pointercancel",dragEnd)}

  const applySolution=(solutionIndex=0,compressed=true)=>{if(state.done)return false;const descriptor=AUTHORED.find(entry=>entry.layout===task.layout),solutions=exhaustiveSolutions(descriptor.blocked).solutions,solution=solutions[solutionIndex];if(!solution)return false;solution.forEach((placement,order)=>{const item=ITEM_DEFS[placement.itemIndex],record=recordMap.get(item.id);record.orientation=placement.orientation;record.compressed=item.compressible?Boolean(compressed):false;record.placement={x:placement.x,y:placement.y,order:order+1}});state.nextOrder=ITEM_IDS.length+1;state.selected=null;state.snapStage=2;state.revision++;refresh();return true};
  const setRecoverable=()=>{applySolution(0,true);const glass=recordMap.get("glass"),original=new Set(placementCells(glass).map(cell=>cell.index)),coatCells=new Set(placementCells(recordMap.get("coat")).map(cell=>cell.index)),candidates=candidatePlacements(itemById("glass"),task.blocked),candidate=candidates.find(entry=>entry.cells.some(cell=>!original.has(cell))&&entry.cells.some(cell=>currentAnalysis().stacks[cell]?.length===1)&&entry.cells.every(cell=>!coatCells.has(cell)));if(candidate){glass.orientation=candidate.orientation;glass.placement={x:candidate.x,y:candidate.y,order:state.nextOrder++}}refresh()};
  const setCrushed=()=>{applySolution(0,true);const glassCells=new Set(placementCells(recordMap.get("glass")).map(cell=>cell.index));for(const hard of ITEM_DEFS.filter(item=>item.hard)){const candidate=candidatePlacements(hard,task.blocked).find(entry=>entry.cells.some(cell=>glassCells.has(cell)));if(!candidate)continue;const record=recordMap.get(hard.id);record.orientation=candidate.orientation;record.placement={x:candidate.x,y:candidate.y,order:state.nextOrder++};break}refresh()};
  const scene=name=>{if(state.done)return false;if(name==="initial")return true;if(name==="selected")return select("coat");if(name==="rotated"){select("coat");return rotate()}if(name==="compressed"){select("coat");return compress()}if(name==="placed"){select("pouch");const candidate=candidatePlacements(itemById("pouch"),task.blocked)[0];return place("pouch",candidate.x,candidate.y)}if(name==="bad-pack"){setRecoverable();return true}if(name==="raised-lid"){applySolution(0,false);return true}if(name==="missing-essential"){applySolution(0,true);recordMap.get("pouch").placement=null;refresh();return true}if(name==="crushed-fragile"){setCrushed();return true}if(name==="success")return applySolution(0,true);return false};
  const qaApi={select,rotate,compress,place,remove,close,timeout,completeSnap,completeClose,applySolution,scene,snapshotTask:()=>({...task,state:snapshot()}),elements:{stage,status,meter,caseNode,lid,grid,gridButtons,itemButtons,miniCells,pieceButtons,rotateButton,compressButton,removeButton,closeButton},inspect:()=>{const analysis=currentAnalysis();return{selected:state.selected,cursor:{...state.cursor},drag:state.drag?{...state.drag}:null,ghost:state.ghost?{...state.ghost}:null,nextOrder:state.nextOrder,snapStage:state.snapStage,lid:state.lid,closeStage:state.closeStage,outcome:state.outcome,done:state.done,disposed:state.disposed,committed:state.committed,invalid:state.invalid,state:snapshot(),analysis:{...analysis,stacks:analysis.stacks.map(stack=>stack.map(entry=>({...entry}))),heights:[...analysis.heights],missing:[...analysis.missing],crushed:[...analysis.crushed],gaps:[...analysis.gaps],overlaps:[...analysis.overlaps]},status:status.textContent,disabled:[...itemButtons.values(),...gridButtons,rotateButton,compressButton,removeButton,closeButton].filter(button=>button.disabled).length}}};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;state.drag=null;state.ghost=null;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
  context.setDeadline(task.duration,timeout);setMessage("荷物を選び、回転してケースへ置きます");refresh();
}

export default Object.freeze({metadata,generate,validate,render});
