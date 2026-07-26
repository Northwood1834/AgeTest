import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import {createGameRuntime} from "../src/game-kernel.js";

const moduleUrl=new URL("../src/games/spatial-park-jam-v1.js",import.meta.url);
const moduleSource=await readFile(moduleUrl,"utf8");
const importGame=async suffix=>(await import(`data:text/javascript;base64,${Buffer.from(`${moduleSource}\n// ${suffix}`).toString("base64")}`)).default;
const game=await importGame("primary");
const ID="spatial-park-jam-v1";

function randomHelpers(initialSeed=0x5eed1234){
  let seed=initialSeed>>>0;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/0x100000000);
  const randomInt=(min,max)=>min+Math.floor(random()*(max-min+1));
  const shuffle=values=>{const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=randomInt(0,i);[copy[i],copy[j]]=[copy[j],copy[i]]}return copy};
  return{random,randomInt,pick:values=>values[randomInt(0,values.length-1)],shuffle};
}

class FakeClassList{
  constructor(owner){this.owner=owner;this.values=new Set()}
  reset(value){this.values=new Set(String(value||"").split(/\s+/).filter(Boolean))}
  add(...values){values.forEach(value=>this.values.add(value));this.sync()}
  remove(...values){values.forEach(value=>this.values.delete(value));this.sync()}
  contains(value){return this.values.has(value)}
  sync(){this.owner._className=[...this.values].join(" ")}
}
class FakeStyle{constructor(){this.values=new Map()}setProperty(name,value){this.values.set(name,String(value))}}
const noop=()=>{};
function fakeCanvasContext(){
  const gradient={addColorStop:noop};
  return new Proxy({createLinearGradient:()=>gradient,measureText:()=>({width:10})},{get(target,key){return key in target?target[key]:noop},set(target,key,value){target[key]=value;return true}});
}
class FakeElement extends EventTarget{
  constructor(tagName,ownerDocument){super();this.tagName=tagName.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style=new FakeStyle();this.classList=new FakeClassList(this);this._className="";this.textContent="";this.type="";this.disabled=false;this.tabIndex=-1;this.width=0;this.height=0}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}
  setAttribute(name,value){this.attributes.set(name,String(value))}getAttribute(name){return this.attributes.get(name)??null}
  focus(){this.ownerDocument.activeElement=this}get offsetWidth(){return 390}
  getContext(kind){return this.tagName==="CANVAS"&&kind==="2d"?fakeCanvasContext():null}
  getBoundingClientRect(){const width=Number.parseFloat(this.style.width)||390,height=Number.parseFloat(this.style.height)||400;return{left:0,top:0,width,height,right:width,bottom:height}}
}
function createFakeDocument(name="document"){
  const view=new EventTarget();view.devicePixelRatio=3;
  const documentRef={name,activeElement:null,defaultView:view};documentRef.createElement=tag=>new FakeElement(tag,documentRef);return documentRef;
}
function installFakeDocument(){const previous=globalThis.document;globalThis.document=createFakeDocument("global");return()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}}
function createHarness({reducedMotion=false,viewport={width:390,height:844,dpr:2},ownerDocument=globalThis.document}={}){
  const controller=new AbortController(),host=ownerDocument.createElement("div"),qa={},pending=[],listeners=new Set(),finishes=[];let deadline=null,disposed=false;
  host.getBoundingClientRect=()=>({left:0,top:0,width:viewport.width-16,height:viewport.height});
  const context={host,signal:controller.signal,reducedMotion,viewport,qa,
    finish(correct,result){if(disposed||finishes.length)return false;finishes.push({correct,result});return true},
    setDeadline(ms,fn){deadline={ms,fn,active:true};return deadline},
    later(fn,ms){const job={fn,ms,active:true};pending.push(job);return job},frame(){throw new Error("park module does not need an animation-frame loop")},
    listen(target,type,fn,options){target.addEventListener(type,fn,options);const record={target,type,fn,options};listeners.add(record);return()=>{target.removeEventListener(type,fn,options);listeners.delete(record)}}};
  const runAll=()=>{while(pending.some(job=>job.active)){const jobs=pending.splice(0);jobs.forEach(job=>{if(job.active&&!disposed){job.active=false;job.fn()}})}};
  const triggerDeadline=()=>{if(deadline?.active&&!disposed){deadline.active=false;deadline.fn()}};
  const dispose=()=>{if(disposed)return;controller.abort();disposed=true;pending.forEach(job=>job.active=false);if(deadline)deadline.active=false;listeners.forEach(({target,type,fn,options})=>target.removeEventListener(type,fn,options));listeners.clear()};
  return{context,host,qa,finishes,runAll,triggerDeadline,dispose,get pendingCount(){return pending.filter(job=>job.active).length},get listenerCount(){return listeners.size}};
}
const eventWith=(type,properties={})=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.entries(properties).forEach(([key,value])=>Object.defineProperty(event,key,{value}));return event};
const play=(harness,moves)=>{for(const move of moves){assert.equal(harness.qa[ID].move(move),true);harness.runAll()}};
const carButtons=host=>host.children[1].children[1].children[1].children;
const moveButtons=host=>host.children[1].children[2].children;

function occupiedCells(cars){const cells=new Set();for(const car of cars)for(let i=0;i<car.len;i++)cells.add(`${car.r+(car.dir==="v"?i:0)},${car.c+(car.dir==="h"?i:0)}`);return cells}

test("metadata is the published stable identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"1.7",tier:3,flavor:"satisfying",step:1,family:"spatial-park-jam",category:"spatial"});
  assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("render is isolated to context.host.ownerDocument",()=>{
  const previous=globalThis.document,foreign=createFakeDocument("iframe");globalThis.document={createElement(){throw new Error("global document must not be used")}};
  try{const harness=createHarness({ownerDocument:foreign}),task=game.generate(randomHelpers(2));game.render(task,harness.context);const visit=node=>{assert.equal(node.ownerDocument,foreign);node.children.forEach(visit)};visit(harness.host);assert.equal(foreign.activeElement,carButtons(harness.host)[0]);harness.dispose()}
  finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}
});

test("600 generated layouts are cloneable, collision-free, and exhaustively proven in 4-8 moves",()=>{
  const helpers=randomHelpers(),distribution=new Map(),started=performance.now();
  for(let index=0;index<600;index++){
    const task=game.generate(helpers),issues=game.validate(task);assert.deepEqual(issues,[],`generation ${index}: ${issues.join("; ")}`);assert.doesNotThrow(()=>structuredClone(task));
    assert.equal(task.cars[0].r,2);assert.equal(task.cars[0].dir,"h");assert.equal(task.cars[0].hero,true);assert.ok(task.minMoves>=4&&task.minMoves<=8);assert.equal(task.moveLimit,task.minMoves+3);assert.equal(occupiedCells(task.cars).size,task.cars.reduce((sum,car)=>sum+car.len,0));
    distribution.set(task.minMoves,(distribution.get(task.minMoves)||0)+1);
  }
  assert.ok(distribution.size>=3,`poor spread: ${JSON.stringify(Object.fromEntries(distribution))}`);assert.ok(performance.now()-started<15000,"generate + immediate validate exceeded the bounded QA budget");
});

test("one generated puzzle plus validation and a twelve-question selection stay interactive",()=>{
  const helpers=randomHelpers(90),oneStart=performance.now(),one=game.generate(helpers);assert.deepEqual(game.validate(one),[]);const oneMs=performance.now()-oneStart;
  const twelveStart=performance.now();for(let index=0;index<12;index++){const task=game.generate(helpers);assert.deepEqual(game.validate(task),[])}const twelveMs=performance.now()-twelveStart;
  assert.ok(oneMs<250,`one park puzzle took ${oneMs.toFixed(1)}ms`);assert.ok(twelveMs<1500,`twelve park puzzles took ${twelveMs.toFixed(1)}ms`);
});

test("bounded generation falls back to an authored five-move board",()=>{
  const task=game.generate({random:()=>0,randomInt:min=>min,pick:values=>values[0],shuffle:values=>[...values]});assert.deepEqual(game.validate(task),[]);assert.equal(task.minMoves,5);assert.equal(task.moveLimit,8)
});

test("validator rejects overlap, exit-row changes, illegal solution paths, and false minima",()=>{
  const task=game.generate(randomHelpers(12));
  const overlap=structuredClone(task);overlap.cars[1].r=overlap.cars[0].r;overlap.cars[1].c=overlap.cars[0].c;assert.match(game.validate(overlap).join(" | "),/collisions/);
  const hero=structuredClone(task);hero.cars[0].r=1;assert.match(game.validate(hero).join(" | "),/exit row/);
  const badPath=structuredClone(task);badPath.solution=Array.from({length:task.minMoves},()=>({index:0,step:-1,distance:4}));assert.match(game.validate(badPath).join(" | "),/illegal move/);
  const badMinimum=structuredClone(task);badMinimum.minMoves=task.minMoves===4?5:4;badMinimum.moveLimit=badMinimum.minMoves+3;delete badMinimum.solution;assert.match(game.validate(badMinimum).join(" | "),/minMoves does not match/);
});

test("the exact published emergency JSON is normalized to its intended playable two-move puzzle",()=>{
  const restore=installFakeDocument();
  try{
    const legacy={kind:"parkJam",prompt:"赤い車を出口へ",help:"車をタップして、動かしたいマスをタップ。",cars:[{r:2,c:0,len:2,dir:"h",color:"#EA6A5C",hero:true},{r:0,c:3,len:3,dir:"v",color:"#5FB6E0"},{r:3,c:1,len:2,dir:"h",color:"#66C08C"}],minMoves:2,moveLimit:5,duration:75000};
    assert.deepEqual(game.validate(legacy),[]);const harness=createHarness();game.render(structuredClone(legacy),harness.context);const initial=harness.qa[ID].inspect();assert.equal(initial.recoveredLegacy,true);assert.equal(initial.cars[1].len,2);assert.equal(legacy.cars[1].len,3,"normalization mutated saved JSON");play(harness,[{index:1,step:1,distance:3},{index:0,step:1,distance:3}]);assert.equal(harness.qa[ID].inspect().moves,2);assert.deepEqual(harness.finishes.map(entry=>entry.correct),[true]);assert.match(harness.finishes[0].result.detail,/2手/);assert.equal(harness.host.children[1].children[1].children[2].classList.contains("apj-celebrate"),true)
  }finally{restore()}
});

test("plain-data resume without additive fields performs a fresh proof and finishes once",async()=>{
  const restore=installFakeDocument();
  try{const generated=game.generate(randomHelpers(22)),legacy=structuredClone(generated),solution=legacy.solution;delete legacy.solution;delete legacy.difficulty;const fresh=await importGame(`fresh-${Date.now()}`);assert.deepEqual(fresh.validate(legacy),[]);const harness=createHarness();fresh.render(structuredClone(legacy),harness.context);play(harness,solution);assert.equal(harness.finishes.length,1);assert.equal(harness.finishes[0].correct,true);harness.triggerDeadline();assert.equal(harness.finishes.length,1)}finally{restore()}
});

test("an off-axis or blocked target is illegal and consumes no move",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate(randomHelpers(31)),harness=createHarness();game.render(task,harness.context);harness.qa[ID].select(0);const occupied=occupiedCells(task.cars);let target=null;for(let r=0;r<5&&!target;r++)for(let c=0;c<5;c++)if(r!==2&&!occupied.has(`${r},${c}`)){target={r,c};break}harness.qa[ID].chooseCell(target.r,target.c);const stage=harness.host.children[1],board=stage.children[1];assert.equal(board.classList.contains("apj-invalid"),true);assert.equal(stage.children[0].classList.contains("apj-error"),true);harness.runAll();const state=harness.qa[ID].inspect();assert.equal(state.moves,0);assert.match(state.status,/方向/);assert.equal(harness.finishes.length,0)}finally{restore()}
});

test("reversing one legal slide until the move limit finishes incorrect",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate(randomHelpers(41)),harness=createHarness();game.render(task,harness.context);const first=task.solution[0],reverse={...first,step:-first.step};for(let move=0;move<task.moveLimit;move++){assert.equal(harness.qa[ID].move(move%2?reverse:first),true);harness.runAll()}assert.equal(harness.qa[ID].inspect().moves,task.moveLimit);assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.match(harness.finishes[0].result.detail,/手数上限/)}finally{restore()}
});

test("deadline finishes incorrect exactly once",()=>{
  const restore=installFakeDocument();try{const harness=createHarness(),task=game.generate(randomHelpers(51));game.render(task,harness.context);harness.triggerDeadline();harness.triggerDeadline();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.match(harness.finishes[0].result.detail,/時間切れ/)}finally{restore()}
});

test("dispose cancels movement, deadline, listeners, and QA exposure",()=>{
  const restore=installFakeDocument();try{const harness=createHarness(),task=game.generate(randomHelpers(61));game.render(task,harness.context);harness.qa[ID].move(task.solution[0]);assert.ok(harness.pendingCount>0);harness.dispose();harness.runAll();harness.triggerDeadline();assert.equal(harness.finishes.length,0);assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.qa[ID],undefined)}finally{restore()}
});

test("real createGameRuntime disposal synchronously removes QA and pending work",async()=>{
  const restore=installFakeDocument(),previousRaf=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;globalThis.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),0);globalThis.cancelAnimationFrame=id=>clearTimeout(id);
  try{const task=game.generate(randomHelpers(66)),qa={},finishes=[],host=document.createElement("div");host.getBoundingClientRect=()=>({width:393,height:852});const runtime=createGameRuntime({host,qa,reducedMotion:false,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});game.render(task,runtime.context);qa[ID].move(task.solution[0]);assert.ok(runtime.inspect().timeouts>=2);runtime.dispose();assert.equal(qa[ID],undefined);await delay(300);assert.deepEqual(finishes,[]);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true})}
  finally{restore();if(previousRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=previousRaf;if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("touch and keyboard paths select cars, expose every slide distance, and preserve DPR",()=>{
  const restore=installFakeDocument();try{const harness=createHarness({reducedMotion:true,viewport:{width:402,height:874,dpr:3}}),task=game.generate(randomHelpers(71));game.render(task,harness.context);const cars=carButtons(harness.host),moves=moveButtons(harness.host),movable=task.solution[0].index,direction=task.solution[0].step<0?(task.cars[movable].dir==="h"?"ArrowLeft":"ArrowUp"):(task.cars[movable].dir==="h"?"ArrowRight":"ArrowDown");assert.equal(document.activeElement,cars[0]);cars[movable].dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));assert.equal(harness.qa[ID].inspect().selected,movable);assert.ok([...moves].some(button=>!button.disabled));cars[movable].dispatchEvent(eventWith("keydown",{key:direction}));assert.ok([...moves].includes(document.activeElement));const enabled=[...moves].find(button=>!button.disabled);enabled.dispatchEvent(eventWith("click",{detail:0}));harness.runAll();assert.equal(harness.qa[ID].inspect().moves,1);const view=harness.qa[ID].inspect().canvas;assert.equal(view.dpr,3);assert.equal(view.width,view.cssWidth*3);assert.equal(harness.host.children[1].dataset.reduced,"true")}finally{restore()}
});

test("source uses ownerDocument, tracked lifetime APIs, and no network path",()=>{
  assert.match(moduleSource,/context\.host\?\.ownerDocument/);assert.doesNotMatch(moduleSource,/\bdocument\.createElement\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame|addEventListener)\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/)
});
