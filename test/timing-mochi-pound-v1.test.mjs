import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {setTimeout as delay} from "node:timers/promises";
import {createGameRuntime} from "../src/game-kernel.js";

const moduleUrl=new URL("../src/games/timing-mochi-pound-v1.js",import.meta.url);
const moduleSource=await readFile(moduleUrl,"utf8");
const importGame=async suffix=>(await import(`data:text/javascript;base64,${Buffer.from(`${moduleSource}\n// ${suffix}`).toString("base64")}`)).default;
const game=await importGame("primary");
const ID="timing-mochi-pound-v1";
const PERIODS=[40,38,36,34,32,30,29,28,27,26,25,24];

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
function fakeCanvasContext(){const gradient={addColorStop:noop};return new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:()=>({width:10})},{get(target,key){return key in target?target[key]:noop},set(target,key,value){target[key]=value;return true}})}
class FakeElement extends EventTarget{
  constructor(tagName,ownerDocument){super();this.tagName=tagName.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style=new FakeStyle();this.classList=new FakeClassList(this);this._className="";this.textContent="";this.tabIndex=-1;this.width=0;this.height=0}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=[...nodes]}
  setAttribute(name,value){this.attributes.set(name,String(value))}getAttribute(name){return this.attributes.get(name)??null}
  focus(){this.ownerDocument.activeElement=this}
  getContext(kind){return this.tagName==="CANVAS"&&kind==="2d"?fakeCanvasContext():null}
  getBoundingClientRect(){const width=Number.parseFloat(this.style.width)||this.ownerDocument.viewportWidth||393,height=Number.parseFloat(this.style.height)||Math.round(width*.84);return{left:0,top:0,width,height,right:width,bottom:height}}
}
function createFakeDocument(name="document"){const view=new EventTarget();view.devicePixelRatio=3;view.performance=globalThis.performance;const documentRef={name,activeElement:null,defaultView:view,viewportWidth:393};documentRef.createElement=tag=>new FakeElement(tag,documentRef);return documentRef}
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
  const runFor=ms=>{const target=timerClock+Math.max(0,Number(ms)||0);let guard=0,job=nextPending();while(job&&job.at<=target&&!disposed&&guard++<1000){timerClock=job.at;job.active=false;job.fn();job=nextPending()}if(guard>=1000)throw new Error("timed work did not settle");timerClock=target};
  const stepFrames=(count=1,step=1000/60)=>{for(let index=0;index<count;index++){frameTime+=step;for(const loop of[...frames])if(loop.active&&loop.fn(frameTime)===false){loop.active=false;frames.delete(loop)}}};
  const triggerDeadline=()=>{if(deadline?.active&&!disposed){deadline.active=false;deadline.fn();return true}return false};
  const dispose=()=>{if(disposed)return;disposed=true;if(deadline)deadline.active=false;pending.forEach(job=>job.active=false);frames.clear();controller.abort();listeners.forEach(({target,type,fn,options})=>target.removeEventListener(type,fn,options));listeners.clear()};
  return{context,host,qa,finishes,runFor,stepFrames,triggerDeadline,dispose,get pendingCount(){return pending.filter(job=>job.active).length},get listenerCount(){return listeners.size},get frameCount(){return frames.size},get finishCalls(){return finishCalls}};
}
const eventWith=(type,properties={})=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.entries(properties).forEach(([key,value])=>Object.defineProperty(event,key,{value}));return event};
const stageFrom=host=>host.children[1],boardFrom=host=>stageFrom(host).children[1],canvasFrom=host=>boardFrom(host).children[0],fictionLabelFrom=host=>stageFrom(host).children[3];
function followDwell(api,task,dwellTicks){
  for(let strikeIndex=0;strikeIndex<task.strikeCount;strikeIndex++){
    const state=api.inspect();assert.equal(state.strikeIndex,strikeIndex);assert.equal(state.phaseTick,0);
    const holdFrom=6,releaseAt=holdFrom+dwellTicks;assert.equal(api.advanceTicks(holdFrom),holdFrom);assert.equal(api.hold(),true);assert.equal(api.advanceTicks(dwellTicks),dwellTicks);assert.equal(api.release(),true);api.advanceTicks(task.periodTicks[strikeIndex]-releaseAt);
  }
}

 test("metadata is the accepted original-game identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"2.0",tier:3,flavor:"wild",step:1,family:"timing-mochi-pound",category:"timing"});assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("the finite authored task clones, validates, accelerates, and enumerates every proof branch",()=>{
  const started=performance.now(),signatures=new Set();for(let index=0;index<10000;index++){const task=game.generate({randomInt:()=>{throw new Error("generation must not depend on randomness")}});assert.deepEqual(game.validate(task),[]);assert.doesNotThrow(()=>structuredClone(task));signatures.add(JSON.stringify(task))}
  const task=game.generate();assert.equal(signatures.size,1);assert.deepEqual(task.periodTicks,PERIODS);assert.equal(task.periodTicks.length,12);for(let index=1;index<12;index++)assert.ok(Number.isInteger(task.periodTicks[index])&&task.periodTicks[index]<task.periodTicks[index-1]);assert.deepEqual(task.safeWindows,PERIODS.map(period=>[4,period-7]));assert.deepEqual(task.proof.failures.map(item=>item.reason),["safety-stop","under","over","stick","timeout"]);assert.equal(task.proof.finishPolicy,"single-commit");assert.equal(task.proof.resumePolicy,"plain-json");assert.ok(performance.now()-started<2500,"authored generation exceeded its finite guard");
});

test("authored safe intervals have exact boundaries and at least a three-tick final margin",()=>{
  const task=game.generate(),sequence=task.proof.safeSequence;assert.equal(sequence.length,12);assert.equal(sequence.reduce((sum,item)=>sum+item.dwellTicks,0),72);sequence.forEach((item,index)=>{assert.deepEqual(item,{strikeIndex:index,holdFromTick:6,releaseAtTick:12,dwellTicks:6,safeEndTick:PERIODS[index]-7,marginTicks:PERIODS[index]-19});assert.equal(task.proof.boundaries.lastSafeTicks[index],item.safeEndTick-1);assert.equal(task.proof.boundaries.lateTicks[index],item.safeEndTick);assert.ok(item.marginTicks>=3)});assert.equal(sequence.at(-1).marginTicks,5);assert.equal(task.proof.boundaries.beforeSafeTick,3);assert.equal(task.proof.boundaries.firstSafeTick,4);
});

test("validator rejects changed schedule, boundaries, outcome proofs, finish policy, and unknown fields",()=>{
  const broken=game.generate();broken.periodTicks[4]++;broken.safeWindows[11][1]++;broken.proof.safeSequence[11].marginTicks=2;broken.proof.failures.pop();broken.proof.finishPolicy="retry";broken.duration=1;broken.extra=true;const issues=game.validate(broken).join(" | ");assert.match(issues,/periodTicks/);assert.match(issues,/safeWindows/);assert.match(issues,/proof/);assert.match(issues,/failure/);assert.match(issues,/finish/);assert.match(issues,/duration/);assert.match(issues,/unexpected field/);assert.deepEqual(game.validate(null),["task must be an object"]);
});

test("render creates every node through context.host.ownerDocument and starts with a withdrawn hand",()=>{
  const previous=globalThis.document,foreign=createFakeDocument("iframe");globalThis.document={createElement(){throw new Error("global document must not be used")}};
  try{const task=game.generate(),harness=createHarness({ownerDocument:foreign});game.render(task,harness.context);const visit=node=>{assert.equal(node.ownerDocument,foreign);node.children.forEach(visit)};visit(harness.host);const state=harness.qa[ID].inspect();assert.equal(state.globalTick,0);assert.equal(state.stage,"landed");assert.equal(state.handVisible,false);assert.equal(fictionLabelFrom(harness.host).textContent,"架空の安全連動ゲーム");assert.equal(foreign.activeElement,boardFrom(harness.host));harness.dispose()}finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}
});

test("exact before, first-safe, last-safe, and late boundaries gate the hand causally",()=>{
  const restore=installFakeDocument();try{
    const task=game.generate(),early=createHarness();game.render(task,early.context);const earlyApi=early.qa[ID];earlyApi.advanceTicks(3);assert.equal(earlyApi.hold(),false);earlyApi.advanceTicks(1);assert.equal(earlyApi.inspect().phaseTick,4);assert.equal(earlyApi.inspect().handVisible,false);assert.equal(earlyApi.hold(),true);earlyApi.advanceTicks(1);assert.equal(earlyApi.inspect().turnTicks,1);earlyApi.release();early.dispose();
    const exact=createHarness();game.render(task,exact.context);const exactApi=exact.qa[ID],safeEnd=task.safeWindows[0][1];exactApi.advanceTicks(6);exactApi.hold();exactApi.advanceTicks(safeEnd-6-1);assert.equal(exactApi.inspect().phaseTick,safeEnd-1);assert.equal(exactApi.inspect().done,false);assert.equal(exactApi.release(),true);exactApi.advanceTicks(1);assert.equal(exactApi.inspect().phaseTick,safeEnd);assert.equal(exactApi.inspect().result,null);assert.equal(exactApi.inspect().handVisible,false);exact.dispose();
    const late=createHarness();game.render(task,late.context);const lateApi=late.qa[ID];lateApi.advanceTicks(6);lateApi.hold();lateApi.advanceTicks(safeEnd-6);const stopped=lateApi.inspect();assert.equal(stopped.phaseTick,safeEnd);assert.equal(stopped.stage,"stopped");assert.equal(stopped.result,"safety-stop");assert.equal(stopped.strikes,0);assert.equal(stopped.handVisible,false);assert.match(stopped.status,/接触はありません/);assert.deepEqual(late.finishes.map(item=>item.correct),[false]);assert.equal(late.finishes[0].result.reason,"safety-stop");
  }finally{restore()}
});

test("plain JSON resume follows all twelve authored intervals and finishes glossy exactly once",async()=>{
  const restore=installFakeDocument();try{const plain=structuredClone(game.generate()),before=structuredClone(plain),fresh=await importGame(`resume-${Date.now()}`),harness=createHarness();fresh.render(plain,harness.context);const api=harness.qa[ID];followDwell(api,plain,6);const state=api.inspect();assert.deepEqual(plain,before,"render mutated the saved task");assert.equal(state.result,"success");assert.equal(state.strikes,12);assert.equal(state.turnTicks,72);assert.equal(state.smoothness,264);assert.equal(state.shape,148);assert.equal(state.material,"glossy");assert.deepEqual(harness.finishes,[{correct:true,result:{reason:"success",strikes:12,turnTicks:72,smoothness:264,shape:148,emptyStrikes:0,material:"glossy"}}]);harness.triggerDeadline();api.advanceTicks(20);api.hold();assert.equal(harness.finishes.length,1);assert.equal(harness.finishCalls,1)}finally{restore()}
});

test("five safe dwell ticks per strike reaches the retained under-turned grainy outcome",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),harness=createHarness();game.render(task,harness.context);const api=harness.qa[ID];followDwell(api,task,5);const state=api.inspect();assert.equal(state.result,"under");assert.equal(state.strikes,12);assert.equal(state.turnTicks,60);assert.equal(state.smoothness,228);assert.equal(state.shape,136);assert.equal(state.material,"grainy");assert.deepEqual(harness.finishes.map(item=>item.result.reason),["under"])}finally{restore()}
});

test("over-turn has both an exact final-classification boundary and an immediate tear boundary",()=>{
  const restore=installFakeDocument();try{
    const task=game.generate(),finalHarness=createHarness();game.render(task,finalHarness.context);const finalApi=finalHarness.qa[ID];followDwell(finalApi,task,7);assert.equal(finalApi.inspect().turnTicks,84);assert.equal(finalApi.inspect().strikes,12);assert.equal(finalApi.inspect().result,"over");assert.equal(finalApi.inspect().material,"torn");
    const tearHarness=createHarness();game.render(task,tearHarness.context);const tearApi=tearHarness.qa[ID];for(let index=0;index<11;index++){tearApi.advanceTicks(6);tearApi.hold();tearApi.advanceTicks(7);tearApi.release();tearApi.advanceTicks(task.periodTicks[index]-13)}tearApi.advanceTicks(6);tearApi.hold();tearApi.advanceTicks(8);const torn=tearApi.inspect();assert.equal(torn.turnTicks,85);assert.equal(torn.strikes,11);assert.equal(torn.result,"over");assert.deepEqual(tearHarness.finishes.map(item=>item.result.reason),["over"]);
  }finally{restore()}
});

test("three consecutive empty autonomous strikes stick without contact and finish once",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),harness=createHarness();game.render(task,harness.context);const api=harness.qa[ID];api.advanceTicks(PERIODS[0]+PERIODS[1]+PERIODS[2]);const state=api.inspect();assert.equal(state.result,"stick");assert.equal(state.strikes,3);assert.equal(state.emptyStrikes,3);assert.equal(state.turnTicks,0);assert.equal(state.smoothness,3);assert.equal(state.shape,97);assert.equal(state.material,"stuck");assert.deepEqual(harness.finishes.map(item=>item.result.reason),["stick"]);harness.triggerDeadline();assert.equal(harness.finishes.length,1)}finally{restore()}
});

test("timeout retains exact count, shape, smoothness, turns, empty count, and material",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),harness=createHarness();game.render(task,harness.context);const api=harness.qa[ID];for(let index=0;index<2;index++){api.advanceTicks(6);api.hold();api.advanceTicks(6);api.release();api.advanceTicks(task.periodTicks[index]-12)}api.advanceTicks(22);const before=api.inspect();assert.deepEqual({strikes:before.strikes,turnTicks:before.turnTicks,smoothness:before.smoothness,shape:before.shape,emptyStrikes:before.emptyStrikes,material:before.material},{strikes:2,turnTicks:12,smoothness:44,shape:108,emptyStrikes:0,material:"grainy"});assert.equal(harness.triggerDeadline(),true);const after=api.inspect(),result=harness.finishes[0].result;assert.equal(after.result,"timeout");assert.deepEqual({strikes:result.strikes,turnTicks:result.turnTicks,smoothness:result.smoothness,shape:result.shape,emptyStrikes:result.emptyStrikes,material:result.material},{strikes:before.strikes,turnTicks:before.turnTicks,smoothness:before.smoothness,shape:before.shape,emptyStrikes:before.emptyStrikes,material:before.material});assert.match(after.status,/形108/);assert.equal(harness.finishCalls,1)}finally{restore()}
});

test("reduced motion preserves nonzero landed, up, descending stages and exact period timing with no RAF",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),harness=createHarness({reducedMotion:true}),apiTask=structuredClone(task);game.render(apiTask,harness.context);const api=harness.qa[ID];assert.equal(api.inspect().stage,"landed");assert.equal(api.inspect().phaseTick,0);assert.equal(harness.frameCount,0);harness.runFor(100);assert.equal(api.inspect().phaseTick,2);assert.equal(api.inspect().stage,"up");harness.runFor(1550);assert.equal(api.inspect().phaseTick,33);assert.equal(api.inspect().stage,"descending");harness.runFor(250);assert.equal(api.inspect().phaseTick,38);assert.equal(api.inspect().stage,"landed");harness.runFor(100);assert.equal(api.inspect().strikes,1);assert.equal(api.inspect().phaseTick,0);assert.equal(api.inspect().stage,"landed");assert.equal(api.inspect().frames,0);assert.equal(harness.frameCount,0);harness.dispose();assert.equal(harness.pendingCount,0)}finally{restore()}
});

test("touch and keyboard holds withdraw fully while updating real material state",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),harness=createHarness({viewport:{width:402,height:874,dpr:3}});game.render(task,harness.context);const api=harness.qa[ID],board=boardFrom(harness.host);api.advanceTicks(6);board.dispatchEvent(eventWith("pointerdown",{pointerType:"touch"}));assert.equal(api.inspect().handVisible,true);api.advanceTicks(3);board.dispatchEvent(eventWith("pointerup",{pointerType:"touch"}));assert.equal(api.inspect().handVisible,false);assert.equal(api.inspect().turnTicks,3);api.advanceTicks(task.periodTicks[0]-9+6);board.dispatchEvent(eventWith("keydown",{key:"Enter",repeat:false}));assert.equal(api.inspect().holding,true);api.advanceTicks(3);board.dispatchEvent(eventWith("keyup",{key:"Enter"}));const state=api.inspect();assert.equal(state.handVisible,false);assert.equal(state.turnTicks,6);assert.ok(state.smoothness>0);assert.notEqual(state.shape,100);assert.equal(document.activeElement,board);assert.equal(state.canvas.dpr,3);assert.equal(state.canvas.pixelWidth,state.canvas.cssWidth*3);assert.equal(state.canvas.pixelHeight,state.canvas.cssHeight*3);harness.dispose()}finally{restore()}
});

test("normal and reduced runtimes expose the same deterministic proof state",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),normal=createHarness(),reduced=createHarness({reducedMotion:true});game.render(task,normal.context);game.render(structuredClone(task),reduced.context);const normalApi=normal.qa[ID],reducedApi=reduced.qa[ID];for(const api of[normalApi,reducedApi]){for(let index=0;index<4;index++){api.advanceTicks(6);api.hold();api.advanceTicks(6);api.release();api.advanceTicks(task.periodTicks[index]-12)}}const pick=state=>({globalTick:state.globalTick,strikeIndex:state.strikeIndex,phaseTick:state.phaseTick,strikes:state.strikes,turnTicks:state.turnTicks,smoothness:state.smoothness,shape:state.shape,emptyStrikes:state.emptyStrikes,material:state.material,result:state.result});assert.deepEqual(pick(normalApi.inspect()),pick(reducedApi.inspect()));assert.equal(normal.frameCount,1);assert.equal(reduced.frameCount,0);normal.dispose();reduced.dispose()}finally{restore()}
});

test("all ten required visual source scenes are deterministic and preserve terminal materials",()=>{
  const restore=installFakeDocument();try{for(const name of["initial","safe-hold","withdraw","strike","under","over","safety-stop","stick","success","timeout"]){const harness=createHarness(),task=game.generate();game.render(task,harness.context);const api=harness.qa[ID];assert.equal(api.showScene(name),true);const state=api.inspect();assert.equal(state.frames,0);if(name==="safe-hold")assert.equal(state.handVisible,true);if(name==="withdraw")assert.equal(state.handVisible,false);if(["under","over","safety-stop","stick","success","timeout"].includes(name))assert.equal(state.result,name);harness.dispose()}}finally{restore()}
});

test("dispose cancels tracked stage work, deadline, frame, listeners, QA, and finish",()=>{
  const restore=installFakeDocument();try{for(const reducedMotion of[false,true]){const task=game.generate(),harness=createHarness({reducedMotion});game.render(task,harness.context);const api=harness.qa[ID];api.advanceTicks(6);api.hold();assert.ok(harness.listenerCount>0);if(reducedMotion)assert.ok(harness.pendingCount>0);else assert.equal(harness.frameCount,1);harness.dispose();harness.runFor(500);harness.stepFrames(5);harness.triggerDeadline();assert.equal(harness.finishes.length,0);assert.equal(harness.pendingCount,0);assert.equal(harness.listenerCount,0);assert.equal(harness.frameCount,0);assert.equal(harness.qa[ID],undefined)}}finally{restore()}
});

test("real createGameRuntime disposal leaves no surviving lifetime-bound work",async()=>{
  const restore=installFakeDocument(),previousRaf=globalThis.requestAnimationFrame,previousCancel=globalThis.cancelAnimationFrame;let nextId=0;const timers=new Map();globalThis.requestAnimationFrame=callback=>{const id=++nextId,timer=setTimeout(()=>{timers.delete(id);callback(performance.now())},1);timers.set(id,timer);return id};globalThis.cancelAnimationFrame=id=>{clearTimeout(timers.get(id));timers.delete(id)};
  try{const task=game.generate(),qa={},finishes=[],host=document.createElement("div");host.getBoundingClientRect=()=>({width:393,height:852});const runtime=createGameRuntime({host,qa,reducedMotion:false,viewport:{width:393,height:852,dpr:3},onFinish:(correct,result)=>finishes.push({correct,result})});game.render(task,runtime.context);qa[ID].advanceTicks(6);qa[ID].hold();assert.ok(runtime.inspect().timeouts>=1);assert.ok(runtime.inspect().frames>=1);runtime.dispose();assert.equal(qa[ID],undefined);await delay(120);assert.deepEqual(finishes,[]);assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:0,commits:0,timeouts:0,frames:0,listeners:0,aborted:true})}finally{restore();timers.forEach(clearTimeout);if(previousRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=previousRaf;if(previousCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=previousCancel}
});

test("tracked DPR3 canvas painting stays bounded before the first autonomous strike",()=>{
  const restore=installFakeDocument();try{const task=game.generate(),harness=createHarness({viewport:{width:430,height:932,dpr:3}});game.render(task,harness.context);const started=performance.now();harness.stepFrames(100);const elapsed=performance.now()-started,state=harness.qa[ID].inspect();assert.equal(state.frames,100);assert.equal(state.done,false);assert.ok(elapsed<400,`100 DPR3 frames took ${elapsed.toFixed(1)}ms`);assert.equal(harness.frameCount,1);assert.deepEqual(state.canvas,{cssWidth:430,cssHeight:361,pixelWidth:1290,pixelHeight:1083,dpr:3});harness.dispose()}finally{restore()}
});

test("source uses ownerDocument and tracked context APIs with no raw timer, network, audio, emoji, or metronome path",()=>{
  assert.match(moduleSource,/context\.host\?\.ownerDocument/);assert.doesNotMatch(moduleSource,/\bdocument\.createElement\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame|addEventListener)\s*\(/);assert.doesNotMatch(moduleSource,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|AudioContext|HTMLAudioElement)\b/);assert.doesNotMatch(moduleSource,/[\u{1F300}-\u{1FAFF}]/u);assert.doesNotMatch(moduleSource,/metronome|oscillator/i);assert.match(moduleSource,/context\.frame\(/);assert.match(moduleSource,/context\.later\(/);assert.match(moduleSource,/context\.listen\(/);assert.match(moduleSource,/context\.setDeadline\(/);
});
