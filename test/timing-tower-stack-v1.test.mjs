import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import {createGameRuntime} from "../src/game-kernel.js";

const moduleUrl=new URL("../src/games/timing-tower-stack-v1.js",import.meta.url);
const moduleSource=await readFile(moduleUrl,"utf8");
const game=(await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`)).default;
const ID="timing-tower-stack-v1";
const PUBLISHED_TASK={kind:"towerStack",prompt:"5段まで積み上げて",help:"左右に動くブロックをタップで落とします。はみ出た分は切り落とされ、外すと失敗です。",target:5,speed:.66,startWidth:.57,hue:3,duration:40000};

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
  toggle(value,force){const next=force===undefined?!this.values.has(value):Boolean(force);if(next)this.values.add(value);else this.values.delete(value);this.sync();return next}
  sync(){this.owner._className=[...this.values].join(" ")}
}
class FakeStyle{constructor(){this.values=new Map()}setProperty(name,value){this.values.set(name,String(value))}}
const noop=()=>{};
function fakeCanvasContext(){
  const gradient={addColorStop:noop};
  return new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:()=>({width:10})},{get(target,key){return key in target?target[key]:noop},set(target,key,value){target[key]=value;return true}});
}
class FakeElement extends EventTarget{
  constructor(tagName,ownerDocument){super();this.tagName=tagName.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style=new FakeStyle();this.classList=new FakeClassList(this);this._className="";this.textContent="";this.type="";this.disabled=false;this.tabIndex=-1;this.width=0;this.height=0}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}
  setAttribute(name,value){this.attributes.set(name,String(value))}getAttribute(name){return this.attributes.get(name)??null}
  focus(){this.ownerDocument.activeElement=this}get offsetWidth(){return this.ownerDocument.viewportWidth||390}
  getContext(kind){return this.tagName==="CANVAS"&&kind==="2d"?fakeCanvasContext():null}
  getBoundingClientRect(){const width=Number.parseFloat(this.style.width)||this.ownerDocument.viewportWidth||390,height=Number.parseFloat(this.style.height)||Math.round(width*1.06);return{left:0,top:0,width,height,right:width,bottom:height}}
}
function createFakeDocument(name="document"){
  const view=new EventTarget();view.devicePixelRatio=3;view.performance=globalThis.performance;
  const documentRef={name,activeElement:null,defaultView:view,viewportWidth:390};documentRef.createElement=tag=>new FakeElement(tag,documentRef);return documentRef;
}
function installFakeDocument(){const previous=globalThis.document;globalThis.document=createFakeDocument("global");return()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}}

function createHarness({reducedMotion=false,viewport={width:393,height:852,dpr:3},ownerDocument=globalThis.document}={}){
  const controller=new AbortController(),host=ownerDocument.createElement("div"),qa={},pending=[],listeners=new Set(),frames=new Set(),finishes=[];
  let deadline=null,disposed=false,finishCalls=0,frameTime=performance.now(),timerClock=0;ownerDocument.viewportWidth=viewport.width;
  host.getBoundingClientRect=()=>({left:0,top:0,width:viewport.width,height:viewport.height,right:viewport.width,bottom:viewport.height});
  const context={host,signal:controller.signal,reducedMotion,viewport,qa,
    finish(correct,result){finishCalls++;if(disposed||finishes.length)return false;finishes.push({correct,result});return true},
    setDeadline(ms,fn){deadline={ms,fn,active:true};return deadline},
    later(fn,ms){const job={fn,ms,at:timerClock+Math.max(0,Number(ms)||0),active:true};pending.push(job);return job},
    frame(fn){const loop={fn,active:true};frames.add(loop);return()=>{loop.active=false;frames.delete(loop)}},
    listen(target,type,fn,options){target.addEventListener(type,fn,options);const record={target,type,fn,options};listeners.add(record);return()=>{target.removeEventListener(type,fn,options);listeners.delete(record)}}
  };
  const nextPending=()=>pending.filter(item=>item.active).sort((a,b)=>a.at-b.at)[0]||null;
  const runNext=()=>{const job=nextPending();if(!job||disposed)return false;timerClock=job.at;job.active=false;job.fn();return true};
  const runFor=ms=>{const target=timerClock+Math.max(0,Number(ms)||0);let guard=0,job=nextPending();while(job&&job.at<=target&&!disposed&&guard++<1000){timerClock=job.at;job.active=false;job.fn();job=nextPending()}if(guard>=1000)throw new Error("timed work did not settle");timerClock=target};
  const runAll=()=>{let guard=0,job=nextPending();while(job&&!disposed&&guard++<100){timerClock=job.at;job.active=false;job.fn();job=nextPending()}if(guard>=100)throw new Error("pending work did not settle")};
  const stepFrames=(count=1,step=1000/60)=>{for(let index=0;index<count;index++){frameTime+=step;for(const loop of[...frames])if(loop.active&&loop.fn(frameTime)===false){loop.active=false;frames.delete(loop)}}};
  const triggerDeadline=()=>{if(deadline?.active&&!disposed){deadline.active=false;deadline.fn();return true}return false};
  const dispose=()=>{if(disposed)return;disposed=true;if(deadline)deadline.active=false;pending.forEach(job=>job.active=false);frames.clear();controller.abort();listeners.forEach(({target,type,fn,options})=>target.removeEventListener(type,fn,options));listeners.clear()};
  return{context,host,qa,finishes,runNext,runFor,runAll,stepFrames,triggerDeadline,dispose,get timerClock(){return timerClock},get pendingCount(){return pending.filter(job=>job.active).length},get listenerCount(){return listeners.size},get frameCount(){return frames.size},get finishCalls(){return finishCalls}};
}
const eventWith=(type,properties={})=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.entries(properties).forEach(([key,value])=>Object.defineProperty(event,key,{value}));return event};
const stageFrom=host=>host.children[1];
const boardFrom=host=>stageFrom(host).children[1];
const canvasFrom=host=>boardFrom(host).children[0];
const dropButtonFrom=host=>stageFrom(host).children[2];
const landPerfect=harness=>{const api=harness.qa[ID];assert.equal(api.align(),true);assert.equal(api.drop(),"perfect");assert.equal(harness.runNext(),true)};


test("metadata is the published stable identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"1.12",tier:2,flavor:"wild",step:1,family:"timing-tower-stack",category:"timing"});
  assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("render creates every node from context.host.ownerDocument",()=>{
  const previous=globalThis.document,foreign=createFakeDocument("iframe");globalThis.document={createElement(){throw new Error("global document must not be used")}};
  try{const harness=createHarness({ownerDocument:foreign}),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const visit=node=>{assert.equal(node.ownerDocument,foreign);node.children.forEach(visit)};visit(harness.host);assert.equal(foreign.activeElement,canvasFrom(harness.host));harness.dispose()}
  finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}
});

test("10000 generated tasks are cloneable, bounded, valid, and retain the published plain-data shape",()=>{
  const helpers=randomHelpers(),targets=new Set(),speeds=new Set(),widths=new Set(),hues=new Set(),started=performance.now(),keys=Object.keys(PUBLISHED_TASK).sort();
  for(let index=0;index<10000;index++){
    const task=game.generate(helpers);assert.deepEqual(game.validate(task),[],`generation ${index}`);assert.doesNotThrow(()=>structuredClone(task));assert.deepEqual(Object.keys(task).sort(),keys);targets.add(task.target);speeds.add(task.speed);widths.add(task.startWidth);hues.add(task.hue);
  }
  assert.deepEqual([...targets].sort(),[5,6]);assert.equal(speeds.size,17);assert.equal(widths.size,11);assert.equal(hues.size,7);assert.ok(performance.now()-started<1500,"generation exceeded its bounded QA budget");
});

test("generation remains finite with deterministic injected extrema",()=>{
  const low=game.generate({randomInt:min=>min}),high=game.generate({randomInt:(_min,max)=>max});
  assert.deepEqual(low,{...PUBLISHED_TASK,target:5,prompt:"5段まで積み上げて",speed:.58,startWidth:.52,hue:0});
  assert.deepEqual(high,{...PUBLISHED_TASK,target:6,prompt:"6段まで積み上げて",speed:.74,startWidth:.62,hue:6});
  assert.deepEqual(game.validate(low),[]);assert.deepEqual(game.validate(high),[]);
});

test("validator rejects changed semantics and accepts an exact published saved task",()=>{
  assert.deepEqual(game.validate(structuredClone(PUBLISHED_TASK)),[]);
  const broken=structuredClone(PUBLISHED_TASK);broken.target=7;broken.prompt="7段";broken.speed=.575;broken.startWidth=.9;broken.hue=9;broken.duration=1;
  const issues=game.validate(broken).join(" | ");assert.match(issues,/target/);assert.match(issues,/prompt/);assert.match(issues,/speed/);assert.match(issues,/startWidth/);assert.match(issues,/hue/);assert.match(issues,/duration/);
});

test("published plain-data resume reaches the target and commits correct exactly once",()=>{
  const restore=installFakeDocument();
  try{const task=structuredClone(PUBLISHED_TASK),before=structuredClone(task),harness=createHarness();game.render(task,harness.context);for(let level=0;level<task.target;level++)landPerfect(harness);assert.deepEqual(task,before,"render mutated saved task");const state=harness.qa[ID].inspect();assert.equal(state.stack.length-1,task.target);assert.equal(state.result,"success");assert.equal(boardFrom(harness.host).classList.contains("ats-success"),true);harness.runAll();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[true]);assert.match(harness.finishes[0].result.detail,/5段/);harness.triggerDeadline();harness.qa[ID].drop();harness.runAll();assert.equal(harness.finishes.length,1);assert.equal(harness.finishCalls,1)}finally{restore()}
});

test("partial overlap visibly trims the next block and records the cut",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness(),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const api=harness.qa[ID],before=api.inspect().stack.at(-1);api.setX(before.x+.11);assert.equal(api.drop(),"trim");assert.ok(Math.abs(api.inspect().landing.placed.w-(before.w-.11))<1e-9);assert.ok(api.inspect().chips.length>0);harness.runNext();const state=api.inspect();assert.ok(state.stack.at(-1).w<before.w);assert.equal(state.cuts,1);assert.match(state.status,/切断/);assert.equal(harness.finishes.length,0)}finally{restore()}
});

test("overlap just above the miss threshold lands as a near miss instead of failing",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness(),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const api=harness.qa[ID],below=api.inspect().stack.at(-1);api.setX(below.x+below.w-.02);assert.equal(api.drop(),"trim");harness.runNext();const state=api.inspect();assert.ok(state.stack.at(-1).w>.01&&state.stack.at(-1).w<.021);assert.equal(state.narrow,true);assert.equal(state.done,false);assert.equal(stageFrom(harness.host).dataset.narrow,"true");assert.equal(harness.finishes.length,0)}finally{restore()}
});

test("a complete miss falls away and finishes incorrect once",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness(),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const api=harness.qa[ID];api.setX(1.15);assert.equal(api.drop(),"miss");assert.equal(api.inspect().result,"failure");assert.ok(api.inspect().miss);assert.equal(boardFrom(harness.host).classList.contains("ats-failure"),true);harness.runAll();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.equal(harness.finishes[0].result.reason,"miss");harness.triggerDeadline();api.drop();harness.runAll();assert.equal(harness.finishes.length,1)}finally{restore()}
});

test("deadline shows the retained tower height and finishes incorrect exactly once",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness(),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);landPerfect(harness);harness.triggerDeadline();harness.triggerDeadline();const state=harness.qa[ID].inspect();assert.equal(state.result,"timeout");assert.match(state.status,/1段/);assert.equal(boardFrom(harness.host).classList.contains("ats-timeout"),true);assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.equal(harness.finishes[0].result.reason,"timeout")}
  finally{restore()}
});

test("dispose during landing cancels timers, frame, deadline, listeners, QA, and finish",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness(),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);harness.qa[ID].align();harness.qa[ID].drop();assert.ok(harness.pendingCount>0);assert.equal(harness.frameCount,1);harness.dispose();harness.runAll();harness.stepFrames(3);harness.triggerDeadline();assert.equal(harness.finishes.length,0);assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.frameCount,0);assert.equal(harness.qa[ID],undefined)}finally{restore()}
});

test("real createGameRuntime disposal leaves no surviving lifetime-bound work",async()=>{
  const restore=installFakeDocument(),previousRaf=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;let nextId=0;const timers=new Map();globalThis.requestAnimationFrame=callback=>{const id=++nextId,timer=setTimeout(()=>{timers.delete(id);callback(performance.now())},1);timers.set(id,timer);return id};globalThis.cancelAnimationFrame=id=>{clearTimeout(timers.get(id));timers.delete(id)};
  try{const task=structuredClone(PUBLISHED_TASK),qa={},finishes=[],host=document.createElement("div");host.getBoundingClientRect=()=>({width:393,height:852});const runtime=createGameRuntime({host,qa,reducedMotion:false,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});game.render(task,runtime.context);qa[ID].align();qa[ID].drop();assert.ok(runtime.inspect().timeouts>=2);assert.ok(runtime.inspect().frames>=1);runtime.dispose();assert.equal(qa[ID],undefined);await delay(260);assert.deepEqual(finishes,[]);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true})}
  finally{restore();timers.forEach(clearTimeout);if(previousRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=previousRaf;if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("controlled reduced-motion steps move without QA positioning and allow pointer plus keyboard drops",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness({reducedMotion:true,viewport:{width:393,height:852,dpr:3}}),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const api=harness.qa[ID],canvas=canvasFrom(harness.host),initial=api.inspect();assert.equal(initial.frames,0);assert.equal(harness.frameCount,0);assert.ok(harness.pendingCount>=1);harness.runFor(360);const moved=api.inspect();assert.notEqual(moved.x,initial.x);assert.equal(moved.frames,0);canvas.dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));const lockedX=api.inspect().x;assert.ok(api.inspect().landing);harness.runFor(.5);assert.equal(api.inspect().x,lockedX);assert.ok(api.inspect().landing);harness.runFor(.5);assert.equal(api.inspect().drops,1);const nextStart=api.inspect().x;harness.runFor(359);assert.notEqual(api.inspect().x,nextStart);canvas.dispatchEvent(eventWith("keydown",{key:"Enter"}));assert.ok(api.inspect().landing);harness.runFor(1);assert.equal(api.inspect().drops,2);assert.equal(api.inspect().frames,0);assert.equal(harness.frameCount,0);harness.dispose();assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.frameCount,0);assert.equal(harness.qa[ID],undefined)}finally{restore()}
});

test("real reduced-motion runtime moves, accepts a touch drop, and clears its staged timer",async()=>{
  const restore=installFakeDocument(),previousCancel=globalThis.cancelAnimationFrame;globalThis.cancelAnimationFrame=()=>{};
  try{const task=structuredClone(PUBLISHED_TASK),qa={},finishes=[],host=document.createElement("div");host.getBoundingClientRect=()=>({width:393,height:852});const runtime=createGameRuntime({host,qa,reducedMotion:true,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});game.render(task,runtime.context);const initialX=qa[ID].inspect().x;assert.equal(runtime.inspect().frames,0);assert.ok(runtime.inspect().timeouts>=2);await delay(390);assert.notEqual(qa[ID].inspect().x,initialX);canvasFrom(host).dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));await delay(20);assert.equal(qa[ID].inspect().drops,1);assert.equal(qa[ID].inspect().frames,0);assert.equal(runtime.inspect().frames,0);runtime.dispose();assert.equal(qa[ID],undefined);await delay(160);assert.deepEqual(finishes,[]);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true})}finally{restore();if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("touch, keyboard, focus, reduced motion, and DPR backing dimensions remain usable",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness({reducedMotion:true,viewport:{width:402,height:874,dpr:3}}),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const api=harness.qa[ID],canvas=canvasFrom(harness.host),button=dropButtonFrom(harness.host);assert.equal(document.activeElement,canvas);api.align();canvas.dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));harness.runNext();assert.equal(api.inspect().drops,1);api.align();canvas.dispatchEvent(eventWith("keydown",{key:"Enter"}));harness.runNext();assert.equal(api.inspect().drops,2);api.align();button.dispatchEvent(eventWith("click",{detail:0}));harness.runNext();assert.equal(api.inspect().drops,3);const view=api.inspect().canvas;assert.equal(view.dpr,3);assert.equal(view.width,view.cssWidth*3);assert.equal(view.height,view.cssHeight*3);assert.equal(stageFrom(harness.host).dataset.reduced,"true");assert.equal(harness.frameCount,0)}finally{restore()}
});

test("reduced-motion deadline stops staged movement without rebooking",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness({reducedMotion:true}),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);harness.runFor(120);const api=harness.qa[ID],atDeadline=api.inspect().x;assert.equal(harness.triggerDeadline(),true);assert.equal(api.inspect().result,"timeout");harness.runFor(600);assert.equal(api.inspect().x,atDeadline);assert.equal(api.inspect().frames,0);assert.equal(harness.pendingCount,0);assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);harness.dispose();assert.equal(harness.listenerCount,0)}finally{restore()}
});

test("tracked canvas animation sustains a 60fps-equivalent workload without long synchronous work",()=>{
  const restore=installFakeDocument();
  try{const harness=createHarness({viewport:{width:430,height:932,dpr:3}}),task=structuredClone(PUBLISHED_TASK);game.render(task,harness.context);const started=performance.now();harness.stepFrames(600);const elapsed=performance.now()-started,state=harness.qa[ID].inspect();assert.equal(state.frames,600);assert.ok(elapsed<700,`600 painted frames took ${elapsed.toFixed(1)}ms`);assert.equal(harness.frameCount,1);harness.dispose()}
  finally{restore()}
});

test("source uses ownerDocument, tracked context APIs, and no network path",()=>{
  assert.match(moduleSource,/context\.host\?\.ownerDocument/);assert.doesNotMatch(moduleSource,/\bdocument\.createElement\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame|addEventListener)\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/)
});
