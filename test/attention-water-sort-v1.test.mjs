import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import {createGameRuntime} from "../src/game-kernel.js";

const moduleUrl=new URL("../src/games/attention-water-sort-v1.js",import.meta.url);
const moduleSource=await readFile(moduleUrl,"utf8");
const game=(await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`)).default;
const ID="attention-water-sort-v1";

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
class FakeElement extends EventTarget{
  constructor(tagName,ownerDocument){super();this.tagName=tagName.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style=new FakeStyle();this.classList=new FakeClassList(this);this._className="";this.textContent="";this.type="";this.disabled=false;this.tabIndex=-1}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  append(...nodes){this.children.push(...nodes)}
  replaceChildren(...nodes){this.children=[...nodes]}
  setAttribute(name,value){this.attributes.set(name,String(value))}
  getAttribute(name){return this.attributes.get(name)??null}
  focus(){this.ownerDocument.activeElement=this}
  get offsetWidth(){return 64}
}

function createFakeDocument(name="document"){
  const documentRef={name,activeElement:null};
  documentRef.createElement=tag=>new FakeElement(tag,documentRef);
  return documentRef;
}
function installFakeDocument(){
  const previous=globalThis.document;
  globalThis.document=createFakeDocument("global");
  return()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous};
}

function createHarness({reducedMotion=false,viewport={width:390,height:844,dpr:2},ownerDocument=globalThis.document}={}){
  const controller=new AbortController(),host=ownerDocument.createElement("div"),qa={};
  const pending=[],listeners=new Set(),finishes=[];
  let deadline=null,disposed=false,frameCalls=0;
  const context={
    host,signal:controller.signal,reducedMotion,viewport,qa,
    finish(correct,result){if(disposed||finishes.length)return;finishes.push({correct,result})},
    setDeadline(ms,fn){deadline={ms,fn,active:true};return deadline},
    later(fn,ms){const job={fn,ms,active:true};pending.push(job);return job},
    frame(){frameCalls++},
    listen(target,type,fn,options){target.addEventListener(type,fn,options);const record={target,type,fn,options};listeners.add(record);return record}
  };
  const runAll=()=>{while(pending.some(job=>job.active)){const jobs=pending.splice(0);jobs.forEach(job=>{if(job.active&&!disposed){job.active=false;job.fn()}})}};
  const triggerDeadline=()=>{if(deadline?.active&&!disposed){deadline.active=false;deadline.fn()}};
  const dispose=()=>{if(disposed)return;controller.abort();disposed=true;pending.forEach(job=>job.active=false);if(deadline)deadline.active=false;listeners.forEach(({target,type,fn,options})=>target.removeEventListener(type,fn,options));listeners.clear()};
  return{context,host,qa,finishes,runAll,triggerDeadline,dispose,get pendingCount(){return pending.filter(job=>job.active).length},get listenerCount(){return listeners.size},get frameCalls(){return frameCalls}};
}

const play=(harness,moves)=>{const api=harness.qa[ID];for(const[from,to]of moves){api.choose(from);api.choose(to);harness.runAll()}};
const bottlesFrom=harness=>harness.qa[ID].inspect().tubes;

function bottleButtons(host){
  const stage=host.children[1],board=stage.children[1];
  return board.children;
}
function eventWith(type,properties={}){const event=new Event(type,{bubbles:true,cancelable:true});Object.entries(properties).forEach(([key,value])=>Object.defineProperty(event,key,{value}));return event}

test("metadata is the published stable identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"1.5",tier:2,flavor:"satisfying",step:1,family:"attention-water-sort",category:"attention"});
  assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("render creates every node from context.host.ownerDocument, not global document",()=>{
  const previous=globalThis.document,foreign=createFakeDocument("iframe");
  globalThis.document={activeElement:null,createElement(){throw new Error("global document must not be used")}};
  try{
    const task=game.generate(randomHelpers(3)),harness=createHarness({ownerDocument:foreign});
    assert.doesNotThrow(()=>game.render(task,harness.context));
    const visit=node=>{assert.equal(node.ownerDocument,foreign);node.children.forEach(visit)};
    visit(harness.host);assert.equal(foreign.activeElement,bottleButtons(harness.host)[0]);harness.dispose();
  }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}
});

test("2000 generated boards are cloneable, exhaustively solvable, and stay in the 4-7 + 3 difficulty",()=>{
  const helpers=randomHelpers(),distribution=new Map(),started=performance.now();
  for(let i=0;i<2000;i++){
    const task=game.generate(helpers),issues=game.validate(task);
    assert.deepEqual(issues,[],`generation ${i}: ${issues.join("; ")}`);
    assert.doesNotThrow(()=>structuredClone(task));
    assert.ok(task.minMoves>=4&&task.minMoves<=7);
    assert.equal(task.moveLimit,task.minMoves+3);
    assert.equal(task.tubes.length,5);assert.equal(task.tubes.filter(tube=>!tube.length).length,2);
    distribution.set(task.minMoves,(distribution.get(task.minMoves)||0)+1);
  }
  assert.ok(distribution.size>=3,`poor difficulty spread: ${JSON.stringify(Object.fromEntries(distribution))}`);
  assert.ok(performance.now()-started<15000,"generation/search took unexpectedly long");
});

test("generation has a bounded deterministic fallback",()=>{
  const identity=values=>[...values];
  const task=game.generate({random:()=>0,randomInt:min=>min,pick:values=>values[0],shuffle:identity});
  assert.deepEqual(game.validate(task),[]);assert.ok(task.minMoves>=4&&task.minMoves<=7);assert.equal(task.moveLimit,task.minMoves+3);
});

test("validator rejects corrupted counts, limits, paths, and solvability metadata",()=>{
  const task=game.generate(randomHelpers(17));
  const badCounts=structuredClone(task);badCounts.tubes[0].push(badCounts.colors[0]);badCounts.moveLimit++;
  const countIssues=game.validate(badCounts).join(" | ");
  assert.match(countIssues,/over-capacity|must have 4 units/);assert.match(countIssues,/moveLimit/);

  const badMinimum=structuredClone(task);badMinimum.minMoves=task.minMoves===4?5:4;badMinimum.moveLimit=badMinimum.minMoves+3;delete badMinimum.solution;
  assert.match(game.validate(badMinimum).join(" | "),/minMoves does not match/);

  const badPath=structuredClone(task);badPath.solution=Array.from({length:task.minMoves},()=>[0,0]);
  assert.match(game.validate(badPath).join(" | "),/solution contains an illegal pour/);
});

test("the exact published emergency descriptor remains accepted for saved-session compatibility",()=>{
  const colors=["orange","pink","blue"];
  const legacy={kind:"waterSort",prompt:"色ごとに分けて",help:"ボトルを2つタップして注ぎます。同じ色の上にだけ注げます。",tubes:[[colors[0],colors[1],colors[0],colors[1]],[colors[1],colors[0],colors[1],colors[0]],[colors[2],colors[2],colors[2],colors[2]],[],[]],minMoves:6,moveLimit:9,colors,duration:75000};
  assert.deepEqual(game.validate(legacy),[]);
});

test("published plain-data task without additive solution resumes and completes correctly once",()=>{
  const restore=installFakeDocument();
  try{
    const generated=game.generate(randomHelpers(22)),legacy=structuredClone(generated),solution=legacy.solution;
    delete legacy.solution;delete legacy.difficulty;
    assert.deepEqual(game.validate(legacy),[]);
    const harness=createHarness();game.render(structuredClone(legacy),harness.context);play(harness,solution);
    assert.equal(harness.finishes.length,1);assert.equal(harness.finishes[0].correct,true);assert.match(harness.finishes[0].result.detail,/最短/);
    harness.triggerDeadline();play(harness,solution);assert.equal(harness.finishes.length,1,"double finish escaped module/kernel guards");
  }finally{restore()}
});

test("invalid pour is rejected without consuming a move",()=>{
  const restore=installFakeDocument();
  try{
    const task=game.generate(randomHelpers(31)),harness=createHarness();game.render(task,harness.context);
    const before=bottlesFrom(harness);harness.qa[ID].choose(0);harness.qa[ID].choose(1);harness.runAll();const state=harness.qa[ID].inspect();
    assert.equal(state.moves,0);assert.deepEqual(state.tubes,before);assert.match(state.status,/注げません/);assert.equal(harness.finishes.length,0);
  }finally{restore()}
});

test("using every allowed move without solving finishes incorrect",()=>{
  const restore=installFakeDocument();
  try{
    const task=game.generate(randomHelpers(41)),harness=createHarness();game.render(task,harness.context);
    const moves=[[0,3]];for(let i=1;i<task.moveLimit;i++)moves.push(i%2?[3,4]:[4,3]);
    play(harness,moves);
    assert.equal(harness.qa[ID].inspect().moves,task.moveLimit);assert.equal(harness.finishes.length,1);assert.equal(harness.finishes[0].correct,false);assert.match(harness.finishes[0].result.detail,/手数上限/);
  }finally{restore()}
});

test("timeout finishes incorrect exactly once",()=>{
  const restore=installFakeDocument();
  try{
    const task=game.generate(randomHelpers(51)),harness=createHarness();game.render(task,harness.context);harness.triggerDeadline();harness.triggerDeadline();
    assert.deepEqual(harness.finishes.map(result=>result.correct),[false]);assert.match(harness.finishes[0].result.detail,/時間切れ/);
  }finally{restore()}
});

test("dispose cancels a pending animation and leaves no listener, deadline, QA handle, timer, or frame",()=>{
  const restore=installFakeDocument();
  try{
    const task=game.generate(randomHelpers(61)),harness=createHarness();game.render(task,harness.context);
    harness.qa[ID].choose(task.solution[0][0]);harness.qa[ID].choose(task.solution[0][1]);assert.ok(harness.pendingCount>0);
    harness.dispose();harness.runAll();harness.triggerDeadline();
    assert.equal(harness.finishes.length,0);assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.frameCalls,0);assert.equal(harness.qa[ID],undefined);
  }finally{restore()}
});

test("real createGameRuntime abort removes the QA hook and cancels pending module work",async()=>{
  const restore=installFakeDocument(),previousRaf=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),0);
  globalThis.cancelAnimationFrame=id=>clearTimeout(id);
  try{
    const task=game.generate(randomHelpers(66)),qa={},finishes=[],host=document.createElement("div");
    const runtime=createGameRuntime({host,qa,reducedMotion:false,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});
    game.render(task,runtime.context);
    qa[ID].choose(task.solution[0][0]);qa[ID].choose(task.solution[0][1]);
    assert.ok(runtime.inspect().timeouts>=2,"expected deadline plus pour animation");
    runtime.dispose();
    assert.equal(qa[ID],undefined,"module abort callback did not remove QA exposure");
    await delay(400);
    assert.deepEqual(finishes,[]);
    assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true});
  }finally{
    restore();
    if(previousRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=previousRaf;
    if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel;
  }
});

test("pointer/touch and keyboard controls select bottles and move visible focus",()=>{
  const restore=installFakeDocument();
  try{
    const task=game.generate(randomHelpers(71)),harness=createHarness({reducedMotion:true,viewport:{width:430,height:932,dpr:3}});game.render(task,harness.context);
    const buttons=bottleButtons(harness.host);assert.equal(document.activeElement,buttons[0]);
    buttons[0].dispatchEvent(eventWith("keydown",{key:"ArrowRight"}));assert.equal(document.activeElement,buttons[1]);
    buttons[0].dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));assert.equal(harness.qa[ID].inspect().selected,0);
    buttons[0].dispatchEvent(eventWith("keydown",{key:"Escape"}));assert.equal(harness.qa[ID].inspect().selected,-1);
    buttons[0].dispatchEvent(eventWith("click",{detail:0}));buttons[3].dispatchEvent(eventWith("click",{detail:0}));harness.runAll();assert.equal(harness.qa[ID].inspect().moves,1);
    assert.equal(harness.host.children[1].dataset.reduced,"true");assert.equal(harness.qa[ID].inspect().viewport.dpr,3);
  }finally{restore()}
});

test("game source uses ownerDocument, tracked lifetime primitives, and no network path",()=>{
  assert.match(moduleSource,/context\.host\?\.ownerDocument/);
  assert.doesNotMatch(moduleSource,/\bdocument\.createElement\s*\(/);
  assert.doesNotMatch(moduleSource,/\b(?:setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame|addEventListener)\s*\(/);
  assert.doesNotMatch(moduleSource,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/);
});
