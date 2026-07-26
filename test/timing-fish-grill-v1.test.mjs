import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import {createGameRuntime} from "../src/game-kernel.js";

const moduleUrl=new URL("../src/games/timing-fish-grill-v1.js",import.meta.url);
const moduleSource=await readFile(moduleUrl,"utf8");
const importGame=async suffix=>(await import(`data:text/javascript;base64,${Buffer.from(`${moduleSource}\n// ${suffix}`).toString("base64")}`)).default;
const game=await importGame("primary");
const ID="timing-fish-grill-v1";

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
function fakeCanvasContext(){const gradient={addColorStop:noop};return new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:()=>({width:10})},{get(target,key){return key in target?target[key]:noop},set(target,key,value){target[key]=value;return true}})}
class FakeElement extends EventTarget{
  constructor(tagName,ownerDocument){super();this.tagName=tagName.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style=new FakeStyle();this.classList=new FakeClassList(this);this._className="";this.textContent="";this.type="";this.disabled=false;this.tabIndex=-1;this.width=0;this.height=0}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}
  setAttribute(name,value){this.attributes.set(name,String(value))}getAttribute(name){return this.attributes.get(name)??null}
  focus(){this.ownerDocument.activeElement=this}get offsetWidth(){return this.ownerDocument.viewportWidth||390}
  getContext(kind){return this.tagName==="CANVAS"&&kind==="2d"?fakeCanvasContext():null}
  getBoundingClientRect(){const width=Number.parseFloat(this.style.width)||this.ownerDocument.viewportWidth||390,height=Number.parseFloat(this.style.height)||Math.round(width*.88);return{left:0,top:0,width,height,right:width,bottom:height}}
}
function createFakeDocument(name="document"){const view=new EventTarget();view.devicePixelRatio=3;view.performance=globalThis.performance;const documentRef={name,activeElement:null,defaultView:view,viewportWidth:390};documentRef.createElement=tag=>new FakeElement(tag,documentRef);return documentRef}
function installFakeDocument(){const previous=globalThis.document;globalThis.document=createFakeDocument("global");return()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}}

function createHarness({reducedMotion=false,viewport={width:393,height:852,dpr:3},ownerDocument=globalThis.document}={}){
  const controller=new AbortController(),host=ownerDocument.createElement("div"),qa={},pending=[],listeners=new Set(),frames=new Set(),finishes=[];
  let deadline=null,disposed=false,finishCalls=0,frameTime=performance.now(),timerClock=0;ownerDocument.viewportWidth=viewport.width;host.getBoundingClientRect=()=>({left:0,top:0,width:viewport.width,height:viewport.height,right:viewport.width,bottom:viewport.height});
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
const stageFrom=host=>host.children[1],boardFrom=host=>stageFrom(host).children[1],canvasFrom=host=>boardFrom(host).children[0],controlsFrom=host=>stageFrom(host).children[3];
const flipButtonFrom=host=>controlsFrom(host).children[0],serveButtonFrom=host=>controlsFrom(host).children[1];
function followProof(harness,task,{serve=true}={}){const api=harness.qa[ID];assert.equal(api.advanceSteps(task.proof.flipAtStep),task.proof.flipAtStep);assert.equal(api.flip(),"flipping");harness.runAll();assert.equal(api.advanceSteps(task.proof.serveFromStep-api.inspect().steps),task.proof.serveFromStep-api.inspect().steps+0);if(serve)return api.serve();return api}

test("metadata is the accepted original-game identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"2.0",tier:2,flavor:"satisfying",step:1,family:"timing-fish-grill",category:"timing"});assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("render owns every node through context.host.ownerDocument",()=>{
  const previous=globalThis.document,foreign=createFakeDocument("iframe");globalThis.document={createElement(){throw new Error("global document must not be used")}};
  try{const task=game.generate(randomHelpers(2)),harness=createHarness({ownerDocument:foreign});game.render(task,harness.context);const visit=node=>{assert.equal(node.ownerDocument,foreign);node.children.forEach(visit)};visit(harness.host);assert.equal(foreign.activeElement,canvasFrom(harness.host));harness.dispose()}
  finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}
});

test("5000 generated schedules terminate, clone, validate, and retain multi-second winning tolerance",()=>{
  const helpers=randomHelpers(),variants=new Set(),starts=new Set(),patterns=new Set(),started=performance.now();
  for(let index=0;index<5000;index++){const task=game.generate(helpers),issues=game.validate(task);assert.deepEqual(issues,[],`generation ${index}: ${issues.join("; ")}`);assert.doesNotThrow(()=>structuredClone(task));assert.ok(task.proof.toleranceSteps>=8);assert.ok((task.proof.toleranceSteps*task.quantumMs)>=2000);assert.ok(task.proof.serveToStep*task.quantumMs<=task.duration);variants.add(JSON.stringify([task.heatRates,task.goodWindows]));starts.add(task.startingSide);patterns.add(task.pattern)}
  assert.equal(variants.size,5);assert.deepEqual([...starts].sort(),[0,1]);assert.equal(patterns.size,6);assert.ok(performance.now()-started<30000,"5000 proof validations exceeded the runaway guard");
});

test("generation has a bounded authored fallback under hostile integer helpers",()=>{
  const low=game.generate({randomInt:()=>-999}),high=game.generate({randomInt:()=>999});assert.deepEqual(game.validate(low),[]);assert.deepEqual(game.validate(high),[]);assert.equal(low.startingSide,0);assert.equal(low.pattern,0);assert.equal(high.startingSide,0);assert.equal(high.pattern,5)
});

test("validator rejects corrupted rates, windows, threshold order, quantum, and proof",()=>{
  const task=game.generate(randomHelpers(12));const broken=structuredClone(task);broken.heatRates[0]=9;broken.goodWindows[0]=[340,341];broken.warningThresholds[1]=broken.goodWindows[1][1];broken.burnThresholds[1]=broken.warningThresholds[1]+2;broken.quantumMs=17;broken.proof.serveFromStep++;
  const issues=game.validate(broken).join(" | ");assert.match(issues,/heatRates/);assert.match(issues,/goodWindows/);assert.match(issues,/warning/);assert.match(issues,/burn/);assert.match(issues,/quantumMs/);
  const proof=structuredClone(task);proof.proof.serveFromStep++;assert.match(game.validate(proof).join(" | "),/proof does not match/);
});

test("the fish itself advances through raw, pearly, gold, amber, blister, and char materials",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate({randomInt:min=>min}),harness=createHarness(),apiTask=structuredClone(task);game.render(apiTask,harness.context);const api=harness.qa[ID],side=task.startingSide,rate=task.heatRates[side],advanceTo=value=>api.advanceSteps(Math.max(0,Math.ceil((value-api.inspect().heat[side])/rate)));
    assert.equal(api.inspect().materials[side],"raw");advanceTo(Math.ceil(task.goodWindows[side][0]*.31));assert.equal(api.inspect().materials[side],"pearly");advanceTo(Math.ceil(task.goodWindows[side][0]*.64));assert.equal(api.inspect().materials[side],"gold");advanceTo(task.goodWindows[side][0]);assert.equal(api.inspect().materials[side],"amber");advanceTo(task.warningThresholds[side]);assert.equal(api.inspect().materials[side],"blister");advanceTo(task.burnThresholds[side]);assert.equal(api.inspect().materials[side],"char");assert.equal(api.inspect().result,"burn")}
  finally{restore()}
});

test("plain-data resume follows the stored tolerant proof and serves correct exactly once",async()=>{
  const restore=installFakeDocument();
  try{const generated=game.generate(randomHelpers(22)),plain=structuredClone(generated),fresh=await importGame(`resume-${Date.now()}`),harness=createHarness();assert.deepEqual(fresh.validate(plain),[]);fresh.render(plain,harness.context);const api=harness.qa[ID];api.advanceSteps(plain.proof.flipAtStep);api.flip();harness.runAll();api.advanceSteps(plain.proof.serveFromStep-api.inspect().steps);assert.deepEqual(api.outcomes(),{current:"ready",good:true,materials:["amber","amber"]});assert.equal(api.serve(),"success");harness.runAll();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[true]);assert.equal(harness.finishes[0].result.reason,"served");assert.ok(harness.finishes[0].result.quality>=0&&harness.finishes[0].result.quality<=1);harness.triggerDeadline();api.serve();harness.runAll();assert.equal(harness.finishes.length,1);assert.equal(harness.finishCalls,1)}finally{restore()}
});

test("early flip preserves both heat histories and an early serve fails undercooked",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate(randomHelpers(31)),harness=createHarness();game.render(task,harness.context);const api=harness.qa[ID];api.advanceSteps(12);const before=api.inspect().heat;api.flip();harness.runAll();api.advanceSteps(6);api.flip();harness.runAll();const after=api.inspect();assert.equal(after.flips,2);assert.ok(after.heat[0]>=before[0]&&after.heat[1]>=before[1]);assert.equal(api.serve(),"undercooked");harness.runAll();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.equal(harness.finishes[0].result.reason,"undercooked");assert.equal(boardFrom(harness.host).classList.contains("afg-undercooked"),true)}finally{restore()}
});

test("serve stays locked until both sides have been seen",()=>{
  const restore=installFakeDocument();try{const task=game.generate(randomHelpers(35)),harness=createHarness();game.render(task,harness.context);assert.equal(harness.qa[ID].serve(),"locked");assert.equal(harness.finishes.length,0);assert.equal(serveButtonFrom(harness.host).disabled,true)}finally{restore()}
});

test("crossing the burn threshold creates oil-burst failure once",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate(randomHelpers(41)),harness=createHarness();game.render(task,harness.context);const api=harness.qa[ID],side=task.startingSide,steps=Math.ceil(task.burnThresholds[side]/task.heatRates[side]);api.advanceSteps(steps);const state=api.inspect();assert.equal(state.result,"burn");assert.equal(state.materials[side],"char");assert.equal(boardFrom(harness.host).classList.contains("afg-burn"),true);harness.runAll();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.equal(harness.finishes[0].result.reason,"burn");harness.triggerDeadline();assert.equal(harness.finishes.length,1)}finally{restore()}
});

test("timeout reports the real undercooked state and commits once",()=>{
  const restore=installFakeDocument();try{const task=game.generate(randomHelpers(51)),harness=createHarness();game.render(task,harness.context);harness.qa[ID].advanceSteps(20);harness.triggerDeadline();harness.triggerDeadline();assert.deepEqual(harness.finishes.map(entry=>entry.correct),[false]);assert.equal(harness.finishes[0].result.reason,"timeout");assert.match(harness.finishes[0].result.detail,/まだ生/);assert.equal(boardFrom(harness.host).classList.contains("afg-timeout"),true)}finally{restore()}
});

test("dispose during flip removes pending stages, deadline, frame, listeners, QA, and finish",()=>{
  const restore=installFakeDocument();try{const task=game.generate(randomHelpers(61)),harness=createHarness();game.render(task,harness.context);harness.qa[ID].flip();assert.ok(harness.pendingCount>=3);assert.equal(harness.frameCount,1);harness.dispose();harness.runAll();harness.stepFrames(3);harness.triggerDeadline();assert.equal(harness.finishes.length,0);assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.frameCount,0);assert.equal(harness.qa[ID],undefined)}finally{restore()}
});

test("controlled reduced-motion clock cooks without QA heat mutation and reaches the timed proof",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate(randomHelpers(64)),harness=createHarness({reducedMotion:true}),apiTask=structuredClone(task);game.render(apiTask,harness.context);const api=harness.qa[ID];assert.equal(api.inspect().steps,0);assert.equal(harness.frameCount,0);harness.runFor(task.proof.flipAtStep*task.quantumMs);assert.equal(api.inspect().steps,task.proof.flipAtStep);assert.ok(api.inspect().heat.some(value=>value>0));assert.equal(api.flip(),"flipping");harness.runFor(120);assert.equal(api.inspect().flipping,null);const remaining=task.proof.serveFromStep-api.inspect().steps;harness.runFor(remaining*task.quantumMs);assert.equal(api.inspect().steps,task.proof.serveFromStep);assert.equal(api.outcomes().current,"ready");assert.equal(api.serve(),"success");harness.runFor(120);assert.deepEqual(harness.finishes.map(entry=>entry.correct),[true]);harness.dispose();assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.frameCount,0)}finally{restore()}
});

test("real reduced-motion runtime advances heat on its tracked scheduler and disposes it",async()=>{
  const restore=installFakeDocument(),previousCancel=globalThis.cancelAnimationFrame;globalThis.cancelAnimationFrame=()=>{};
  try{const task=game.generate(randomHelpers(65)),qa={},finishes=[],host=document.createElement("div");host.getBoundingClientRect=()=>({width:393,height:852});const runtime=createGameRuntime({host,qa,reducedMotion:true,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});game.render(task,runtime.context);assert.equal(qa[ID].inspect().steps,0);assert.equal(runtime.inspect().frames,0);assert.ok(runtime.inspect().timeouts>=2);await delay(285);assert.ok(qa[ID].inspect().steps>=1);assert.ok(qa[ID].inspect().heat.some(value=>value>0));runtime.dispose();assert.equal(qa[ID],undefined);await delay(300);assert.deepEqual(finishes,[]);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true})}finally{restore();if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("real createGameRuntime disposal leaves no surviving owned work",async()=>{
  const restore=installFakeDocument(),previousRaf=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;let nextId=0;const timers=new Map();globalThis.requestAnimationFrame=callback=>{const id=++nextId,timer=setTimeout(()=>{timers.delete(id);callback(performance.now())},1);timers.set(id,timer);return id};globalThis.cancelAnimationFrame=id=>{clearTimeout(timers.get(id));timers.delete(id)};
  try{const task=game.generate(randomHelpers(66)),qa={},finishes=[],host=document.createElement("div");host.getBoundingClientRect=()=>({width:393,height:852});const runtime=createGameRuntime({host,qa,reducedMotion:false,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});game.render(task,runtime.context);qa[ID].flip();assert.ok(runtime.inspect().timeouts>=4);assert.ok(runtime.inspect().frames>=1);runtime.dispose();assert.equal(qa[ID],undefined);await delay(700);assert.deepEqual(finishes,[]);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true})}
  finally{restore();timers.forEach(clearTimeout);if(previousRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=previousRaf;if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("touch flip, keyboard serve, visible focus, reduced stages, and DPR backing remain usable",()=>{
  const restore=installFakeDocument();
  try{const task=game.generate(randomHelpers(71)),harness=createHarness({reducedMotion:true,viewport:{width:402,height:874,dpr:3}});game.render(task,harness.context);const api=harness.qa[ID],canvas=canvasFrom(harness.host);assert.equal(document.activeElement,canvas);api.advanceSteps(task.proof.flipAtStep);flipButtonFrom(harness.host).dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));assert.ok(harness.pendingCount>=4);harness.runFor(120);api.advanceSteps(task.proof.serveFromStep-api.inspect().steps);canvas.dispatchEvent(eventWith("keydown",{key:"s"}));harness.runFor(120);assert.deepEqual(harness.finishes.map(entry=>entry.correct),[true]);const view=api.inspect().canvas;assert.equal(view.dpr,3);assert.equal(view.width,view.cssWidth*3);assert.equal(view.height,view.cssHeight*3);assert.equal(stageFrom(harness.host).dataset.reduced,"true");assert.equal(harness.frameCount,0)}finally{restore()}
});

test("tracked high-resolution painting sustains a 60fps-equivalent workload",()=>{
  const restore=installFakeDocument();try{const task=game.generate(randomHelpers(81)),harness=createHarness({viewport:{width:430,height:932,dpr:3}});game.render(task,harness.context);const started=performance.now();harness.stepFrames(600);const elapsed=performance.now()-started,state=harness.qa[ID].inspect();assert.equal(state.frames,600);assert.ok(elapsed<800,`600 frames took ${elapsed.toFixed(1)}ms`);assert.equal(harness.frameCount,1);harness.dispose()}finally{restore()}
});

test("source uses ownerDocument, tracked context lifetime APIs, and no network/audio/emoji path",()=>{
  assert.match(moduleSource,/context\.host\?\.ownerDocument/);assert.doesNotMatch(moduleSource,/\bdocument\.createElement\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame|addEventListener)\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|AudioContext|HTMLAudioElement)\b/);assert.doesNotMatch(moduleSource,/[\u{1F300}-\u{1FAFF}]/u)
});
