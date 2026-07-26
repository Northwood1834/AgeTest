import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import game from "../src/games/calculation-gate-run-v1.js";
import {createGameRuntime} from "../src/game-kernel.js";

const ID="calculation-gate-run-v1";
const moduleUrl=new URL("../src/games/calculation-gate-run-v1.js",import.meta.url);
const source=await readFile(moduleUrl,"utf8");

function randomHelpers(initialSeed=0x61a7e){
  let seed=initialSeed>>>0;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/0x100000000);
  const randomInt=(min,max)=>min+Math.floor(random()*(max-min+1));
  const shuffle=values=>{const copy=[...values];for(let index=copy.length-1;index>0;index--){const other=randomInt(0,index);[copy[index],copy[other]]=[copy[other],copy[index]]}return copy};
  return{random,randomInt,pick:values=>values[randomInt(0,values.length-1)],shuffle};
}

const apply=(count,op)=>op.kind==="add"?count+op.value:op.kind==="mul"?count*op.value:op.kind==="sub"?Math.max(0,count-op.value):Math.floor(count/op.value);
function pathsFor(task){
  return Array.from({length:8},(_,mask)=>{let count=task.start;const choice=[];for(let row=0;row<3;row++){const lane=mask>>row&1;choice.push(lane);count=apply(count,task.gates[row][lane])}return{choice,count}});
}
const samePath=(a,b)=>a.every((lane,index)=>lane===b[index]);

class FakeClassList{
  constructor(owner){this.owner=owner;this.values=new Set()}
  reset(value){this.values=new Set(String(value||"").split(/\s+/).filter(Boolean))}
  add(...values){values.forEach(value=>this.values.add(value));this.owner._className=[...this.values].join(" ")}
  remove(...values){values.forEach(value=>this.values.delete(value));this.owner._className=[...this.values].join(" ")}
  contains(value){return this.values.has(value)}
}
class FakeGradient{addColorStop(){} }
class FakeContext{
  constructor(){this.texts=[];this.transforms=[];this.fillStyle="";this.strokeStyle="";this.font="";this.textAlign="";this.textBaseline="";this.lineWidth=1;this.globalAlpha=1}
  setTransform(...args){this.transforms.push(args)}clearRect(){}save(){}restore(){}translate(){}fillRect(){}beginPath(){}moveTo(){}lineTo(){}closePath(){}ellipse(){}fill(){}arc(){}roundRect(){}stroke(){}
  fillText(text,x,y){this.texts.push({text:String(text),x,y})}
  createLinearGradient(){return new FakeGradient()}
}
class FakeElement extends EventTarget{
  constructor(tagName,ownerDocument){super();this.tagName=tagName.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style={};this.classList=new FakeClassList(this);this._className="";this.textContent="";this.type="";this.tabIndex=-1;this.width=0;this.height=0;this.clientWidth=390;this.context=this.tagName==="CANVAS"?new FakeContext():null}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}
  setAttribute(name,value){this.attributes.set(name,String(value))}getAttribute(name){return this.attributes.get(name)??null}
  focus(){this.ownerDocument.activeElement=this}
  getContext(type){return type==="2d"?this.context:null}
  getBoundingClientRect(){const width=Number.parseFloat(this.style.width)||this.clientWidth||390,height=Number.parseFloat(this.style.height)||300;return{left:0,top:0,width,height,right:width,bottom:height}}
}
class FakeView extends EventTarget{constructor(dpr=3){super();this.devicePixelRatio=dpr}}
function createDocument(dpr=3){
  const documentRef={activeElement:null,defaultView:new FakeView(dpr)};
  documentRef.createElement=tag=>new FakeElement(tag,documentRef);
  return documentRef;
}
function eventWith(type,properties={}){const event=new Event(type,{bubbles:true,cancelable:true});for(const[key,value]of Object.entries(properties))Object.defineProperty(event,key,{value});return event}

function createHarness({reducedMotion=false,viewport={width:393,height:852,dpr:3},ownerDocument=createDocument(viewport.dpr)}={}){
  const controller=new AbortController(),host=ownerDocument.createElement("div"),qa={},jobs=[],listeners=new Set(),finishes=[];
  let deadline=null,frameFn=null,now=0,disposed=false;
  const removeListeners=()=>{listeners.forEach(record=>record.target.removeEventListener(record.type,record.fn,record.options));listeners.clear()};
  const dispose=()=>{if(disposed)return;disposed=true;controller.abort();jobs.forEach(job=>job.active=false);if(deadline)deadline.active=false;frameFn=null;removeListeners()};
  const context={host,signal:controller.signal,reducedMotion,viewport,qa,
    finish(correct,result){if(disposed||finishes.length)return false;finishes.push({correct:Boolean(correct),result});dispose();return true},
    setDeadline(ms,fn){deadline={due:now+ms,fn,active:true};return deadline},
    later(fn,ms){const job={due:now+Math.max(0,ms),fn,active:true};jobs.push(job);return job},
    frame(fn){frameFn=fn;return()=>{frameFn=null}},
    listen(target,type,fn,options){target.addEventListener(type,fn,options);const record={target,type,fn,options};listeners.add(record);return()=>{target.removeEventListener(type,fn,options);listeners.delete(record)}}
  };
  const runTo=target=>{assert.ok(target>=now);while(true){const dueJobs=jobs.filter(job=>job.active&&job.due<=target).sort((a,b)=>a.due-b.due);const nextJob=dueJobs[0],deadlineDue=deadline?.active&&deadline.due<=target?deadline:null;if(!nextJob&&!deadlineDue)break;if(deadlineDue&&(!nextJob||deadline.due<=nextJob.due)){now=deadline.due;deadline.active=false;deadline.fn()}else{now=nextJob.due;nextJob.active=false;nextJob.fn()}}now=target};
  const stepFrame=target=>{runTo(target);if(frameFn){const callback=frameFn;if(callback(target)===false&&frameFn===callback)frameFn=null}};
  const triggerDeadline=()=>{if(deadline?.active){now=deadline.due;deadline.active=false;deadline.fn()}};
  return{context,host,ownerDocument,qa,finishes,runTo,stepFrame,triggerDeadline,dispose,get listenerCount(){return listeners.size},get pendingCount(){return jobs.filter(job=>job.active).length},get frameActive(){return Boolean(frameFn)}};
}

const publishedFallback=()=>JSON.parse('{"kind":"gateRun","prompt":"軍団を増やして敵を倒せ","help":"門を選ぶと兵の数が変わります。最後の敵より多ければ勝ちです。","start":8,"gates":[[{"kind":"mul","value":3},{"kind":"sub","value":5}],[{"kind":"add","value":12},{"kind":"div","value":2}],[{"kind":"mul","value":2},{"kind":"add","value":4}]],"enemy":40,"best":72,"answer":[0,0,0],"duration":35000}');

function stageParts(harness){const style=harness.host.children[0],stage=harness.host.children[1],[canvas,status,pad]=stage.children;return{style,stage,canvas,status,pad,buttons:pad.children}}

function playReduced(task,path){
  const harness=createHarness({reducedMotion:true});game.render(task,harness.context);const api=harness.qa[ID];
  harness.runTo(2900);
  for(let row=0;row<3;row++){api.setLane(path[row]);harness.runTo(3950+row*950)}
  harness.runTo(6800);return harness;
}

test("metadata keeps the published stable identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"1.6",tier:2,flavor:"wild",step:1,family:"calculation-gate-run",category:"calculation"});
  assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("10,000 generations terminate, clone, enumerate all eight paths, and keep one or two wins",()=>{
  const helpers=randomHelpers(),winnerCounts=new Map(),started=performance.now();
  for(let index=0;index<10000;index++){
    const task=game.generate(helpers),paths=pathsFor(task),winners=paths.filter(path=>path.count>task.enemy);
    assert.deepEqual(game.validate(task),[],`generation ${index}`);assert.doesNotThrow(()=>structuredClone(task));assert.equal(paths.length,8);assert.equal(new Set(paths.map(path=>path.choice.join(""))).size,8);
    assert.ok(winners.length===1||winners.length===2);assert.equal(task.best,Math.max(...paths.map(path=>path.count)));assert.ok(samePath(task.answer,winners[0].choice));winnerCounts.set(winners.length,(winnerCounts.get(winners.length)||0)+1);
  }
  assert.deepEqual([...winnerCounts.keys()].sort(),[1,2]);assert.ok(performance.now()-started<5000,"generation exploration is unexpectedly slow");
});

test("generation has a bounded published fallback",()=>{
  const task=game.generate({randomInt:min=>min,shuffle:()=>["sub","div","add","mul"]});
  assert.deepEqual(task,publishedFallback());assert.deepEqual(game.validate(task),[]);
});

test("validator rejects changed rules, malformed operations, false best, and bad winning metadata",()=>{
  const task=game.generate(randomHelpers(7));
  const mutations=[
    {...task,kind:"choice"},{...task,prompt:"changed"},{...task,start:5},{...task,duration:34999},{...task,best:task.best+1},{...task,answer:[2,0,0]},
    {...task,gates:task.gates.slice(0,2)},
    {...task,gates:task.gates.map((pair,row)=>row?[...pair]:[{kind:"div",value:3},pair[1]])},
    {...task,enemy:task.best}
  ];
  mutations.forEach((changed,index)=>assert.ok(game.validate(changed).length>0,`mutation ${index} was accepted`));
});

test("published plain-data task resumes and completes correct and wrong paths",()=>{
  const task=publishedFallback(),paths=pathsFor(task),winner=paths.find(path=>path.count>task.enemy),loser=paths.find(path=>path.count<=task.enemy);
  assert.deepEqual(game.validate(task),[]);
  const correct=playReduced(task,winner.choice);assert.equal(correct.finishes.length,1);assert.equal(correct.finishes[0].correct,true);assert.match(correct.finishes[0].result.detail,/72対40で勝利/);assert.equal(ID in correct.qa,false);
  const wrong=playReduced(task,loser.choice);assert.equal(wrong.finishes.length,1);assert.equal(wrong.finishes[0].correct,false);assert.match(wrong.finishes[0].result.detail,/敗北/);assert.equal(ID in wrong.qa,false);
});

test("the first 2.9 seconds expose no canvas text or enemy number",()=>{
  const harness=createHarness(),task=publishedFallback();game.render(task,harness.context);const {canvas,buttons}=stageParts(harness),ctx=canvas.context;
  assert.deepEqual(ctx.texts,[]);assert.deepEqual(buttons.map(button=>button.textContent),["▲","▼"]);
  harness.stepFrame(0);harness.stepFrame(2800);assert.deepEqual(ctx.texts,[]);
  harness.runTo(2899);assert.deepEqual(ctx.texts,[]);
  harness.runTo(2900);assert.ok(ctx.texts.length>0);assert.deepEqual(buttons.map(button=>button.textContent),["▲ 上の門","▼ 下の門"]);harness.dispose();
});

test("normal motion runs smoothly through every gate and commits once",()=>{
  const task=publishedFallback(),harness=createHarness(),winner=pathsFor(task).find(path=>path.count>task.enemy).choice;game.render(task,harness.context);const api=harness.qa[ID];
  for(let time=0;time<=15000&&!harness.finishes.length;time+=16){const row=api.inspect().row;if(row<3)api.setLane(winner[row]);harness.stepFrame(time)}
  harness.runTo(17000);assert.equal(harness.finishes.length,1);assert.equal(harness.finishes[0].correct,true);assert.ok(harness.finishes[0].result.quality>=0&&harness.finishes[0].result.quality<=1);
});

test("touch, canvas pointer, and keyboard controls move the visible lane focus",()=>{
  const harness=createHarness(),task=publishedFallback();game.render(task,harness.context);const {stage,canvas,buttons}=stageParts(harness),api=harness.qa[ID];
  buttons[1].dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));assert.equal(api.inspect().lane,1);
  stage.dispatchEvent(eventWith("keydown",{key:"ArrowUp"}));assert.equal(api.inspect().lane,0);assert.equal(harness.ownerDocument.activeElement,buttons[0]);
  const rect=canvas.getBoundingClientRect();canvas.dispatchEvent(eventWith("pointerdown",{clientY:rect.height*.8,pointerType:"touch"}));assert.equal(api.inspect().lane,1);harness.dispose();
});

test("high-DPR canvas uses capped physical pixels and reduced motion avoids a running frame loop",()=>{
  const high=createHarness({viewport:{width:402,height:874,dpr:4}});game.render(publishedFallback(),high.context);const canvas=high.qa[ID].inspect().canvas;
  assert.equal(canvas.dpr,3);assert.equal(canvas.pixelWidth,canvas.cssWidth*3);assert.equal(canvas.pixelHeight,canvas.cssHeight*3);assert.equal(high.frameActive,true);high.dispose();
  const reduced=createHarness({reducedMotion:true});game.render(publishedFallback(),reduced.context);assert.equal(reduced.frameActive,false);reduced.runTo(2900);assert.equal(reduced.qa[ID].inspect().revealed,true);reduced.dispose();
});

test("deadline times out exactly once",()=>{
  const harness=createHarness({reducedMotion:true});game.render(publishedFallback(),harness.context);harness.triggerDeadline();harness.triggerDeadline();assert.equal(harness.finishes.length,1);assert.equal(harness.finishes[0].correct,false);assert.match(harness.finishes[0].result.detail,/時間切れ/);
});

test("dispose aborts real kernel work, clears QA, and preserves the final painted frame",async()=>{
  const previousRaf=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;let next=0;const frames=new Map();globalThis.requestAnimationFrame=fn=>{const id=++next;frames.set(id,fn);return id};globalThis.cancelAnimationFrame=id=>frames.delete(id);
  try{
    const ownerDocument=createDocument(3),host=ownerDocument.createElement("div"),qa={},runtime=createGameRuntime({host,onFinish:()=>assert.fail("disposed game finished"),reducedMotion:false,viewport:{width:393,height:852,dpr:3},qa});
    game.render(publishedFallback(),runtime.context);const canvas=stageParts({host}).canvas;assert.ok(qa[ID]);assert.ok(frames.size>0);runtime.dispose();await delay(5);
    assert.equal(ID in qa,false);assert.ok(canvas.width>1);assert.ok(canvas.height>1);assert.equal(frames.size,0);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true});
  }finally{if(previousRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=previousRaf;if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("render owns DOM through host.ownerDocument and source has no untracked lifetime or network primitive",()=>{
  const foreign=createDocument(),globalDocument=globalThis.document;globalThis.document={createElement(){throw new Error("global document must not be used")}};
  try{const harness=createHarness({ownerDocument:foreign});game.render(publishedFallback(),harness.context);const visit=node=>{assert.equal(node.ownerDocument,foreign);node.children.forEach(visit)};visit(harness.host);harness.dispose()}finally{if(globalDocument===undefined)delete globalThis.document;else globalThis.document=globalDocument}
  assert.doesNotMatch(source,/\b(?:setTimeout|setInterval|requestAnimationFrame|addEventListener|fetch|XMLHttpRequest|WebSocket)\b/);
});
