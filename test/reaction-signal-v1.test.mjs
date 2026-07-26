import test from "node:test";
import assert from "node:assert/strict";
import game from "../src/games/reaction-signal-v1.js";
import {createGameRuntime} from "../src/game-kernel.js";
import {readFile} from "node:fs/promises";
import {gameCatalog,generateGameTask,loadGame,RETIRED_GAME_IDS,selectableGameCatalog} from "../src/game-loader.js";

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
if(!globalThis.requestAnimationFrame)globalThis.requestAnimationFrame=fn=>setTimeout(()=>fn(performance.now()),1);
if(!globalThis.cancelAnimationFrame)globalThis.cancelAnimationFrame=clearTimeout;

class FakeClassList{
  #values=new Set();
  add(...values){values.forEach(value=>this.#values.add(value))}
  contains(value){return this.#values.has(value)}
}
class FakeButton extends EventTarget{
  constructor(){super();this.type="";this.className="";this.textContent="";this.attributes={};this.classList=new FakeClassList();this.focused=false}
  setAttribute(name,value){this.attributes[name]=String(value)}
  focus(){this.focused=true}
  click(){this.dispatchEvent(new Event("click"))}
}
const ownerDocument={createElement:tag=>{assert.equal(tag,"button");return new FakeButton()}};
class FakeHost{
  constructor(document=ownerDocument){this.children=[];this.ownerDocument=document}
  append(...children){this.children.push(...children)}
  getBoundingClientRect(){return{width:390,height:300}}
}
const oldDocument=globalThis.document;
globalThis.document={createElement(){throw new Error("global document must not own game DOM")}};

test.after(()=>{if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument});

function helpers(){
  return{random:Math.random,randomInt:(min,max)=>min+Math.floor(Math.random()*(max-min+1)),pick:values=>values[0],shuffle:values=>[...values]};
}
function quickTask(overrides={}){
  return{...game.generate({randomInt:()=>5}),delay:5,duration:50,responseWindow:25,...overrides};
}
function render(task){
  const host=new FakeHost(),commits=[];
  const runtime=createGameRuntime({host,onFinish:(correct,result)=>commits.push({correct,result}),reducedMotion:false,viewport:{width:390,height:300,dpr:2}});
  game.render(task,runtime.context);
  return{host,button:host.children[0],commits,runtime};
}

test("manifest and loader resolve the one authoritative module",async()=>{
  assert.deepEqual(game.metadata,{id:"reaction-signal-v1",introducedIn:"1.0",tier:1,flavor:"classic",step:1,family:"reaction-signal",category:"reaction"});
  const entry=gameCatalog.find(item=>item.id==="reaction-signal-v1");
  assert.ok(entry);
  assert.ok(selectableGameCatalog.some(item=>item.id==="reaction-signal-v1"));
  for(const id of RETIRED_GAME_IDS){
    assert.ok(gameCatalog.some(item=>item.id===id),`${id} remains in the loadable manifest`);
    assert.ok(!selectableGameCatalog.some(item=>item.id===id),`${id} is excluded from normal selection`);
  }
  const loaderSource=await readFile(new URL("../src/game-loader.js",import.meta.url),"utf8");
  assert.doesNotMatch(loaderSource,/\bfrom\s+["']\.\/games\//,"loader must not eagerly import game modules");
  const loaded=await loadGame("reaction-signal-v1");
  assert.deepEqual(loaded.metadata,game.metadata);
  const task=await generateGameTask("reaction-signal-v1",helpers());
  assert.equal(task.templateId,"reaction-signal-v1");
  assert.equal(task.family,"reaction-signal");
  assert.equal(task.step,1);
  assert.deepEqual(game.validate(task),[]);
});

test("3,000 generations terminate, clone, and retain published invariants",()=>{
  for(let i=0;i<3000;i++){
    const task=game.generate(helpers());
    assert.deepEqual(game.validate(task),[]);
    assert.doesNotThrow(()=>structuredClone(task));
    assert.ok(task.delay>=900&&task.delay<=2200);
  }
});

test("validator rejects changed timing, copy, and response rules",()=>{
  const valid=game.generate({randomInt:()=>900});
  for(const broken of [
    {...valid,kind:"choice"},{...valid,prompt:"changed"},{...valid,help:"changed"},
    {...valid,delay:899},{...valid,delay:2201},{...valid,duration:4299},
    {...valid,responseWindow:1499},{...valid,delay:3000}
  ])assert.ok(game.validate(broken).length>0);
});

test("game source has no raw lifetime or network primitive",async()=>{
  const source=await readFile(new URL("../src/games/reaction-signal-v1.js",import.meta.url),"utf8");
  assert.doesNotMatch(source,/\b(?:setTimeout|setInterval|requestAnimationFrame|addEventListener|fetch|XMLHttpRequest|WebSocket)\b/);
});

test("render owns DOM through host.ownerDocument, not the global document",()=>{
  const separateDocument={createElement:tag=>{assert.equal(tag,"button");const button=new FakeButton();button.fromSeparateDocument=true;return button}},host=new FakeHost(separateDocument),runtime=createGameRuntime({host,onFinish:()=>{},reducedMotion:false});
  game.render(quickTask(),runtime.context);
  assert.equal(host.children[0].fromSeparateDocument,true);runtime.dispose();
});

test("published plain-data JSON without responseWindow resumes correctly",async()=>{
  const published=JSON.parse('{"kind":"signal","prompt":"合図が出たら、すぐタップ","help":"フライングは不正解です。","delay":5,"duration":4300}'),{button,commits}=render(published);
  await sleep(12);button.click();assert.equal(commits.length,1);assert.equal(commits[0].correct,true);
});

test("correct response commits once and disposes all lifetime work",async()=>{
  const {button,commits,runtime}=render(quickTask());
  assert.equal(button.focused,true);
  await sleep(12);button.click();button.click();
  assert.equal(commits.length,1);assert.equal(commits[0].correct,true);
  assert.match(commits[0].result.detail,/ms$/);
  assert.deepEqual(runtime.inspect(),{disposed:true,finished:true,finishCalls:1,commits:1,timeouts:0,frames:0,listeners:0,aborted:true});
});

test("false start is incorrect and cannot double finish",()=>{
  const {button,commits,runtime}=render(quickTask());
  button.click();button.click();
  assert.equal(commits.length,1);assert.equal(commits[0].correct,false);
  assert.match(commits[0].result.detail,/フライング/);
  assert.equal(runtime.inspect().commits,1);
});

test("deadline times out through the kernel",async()=>{
  const {commits,runtime}=render(quickTask({delay:5,duration:18,responseWindow:8}));
  await sleep(30);
  assert.equal(commits.length,1);assert.equal(commits[0].correct,false);
  assert.match(commits[0].result.detail,/合図は帰りました/);
  assert.equal(runtime.inspect().timeouts,0);
});

test("home-style disposal removes listener/timers and makes finish inert",async()=>{
  const {button,commits,runtime}=render(quickTask());
  runtime.dispose();button.click();await sleep(60);
  assert.equal(commits.length,0);
  assert.equal(runtime.context.finish(true,{}),false);
  assert.deepEqual(runtime.inspect(),{disposed:true,finished:false,finishCalls:1,commits:0,timeouts:0,frames:0,listeners:0,aborted:true});
});

test("kernel tracks listener, timeout, frame and commits at most once",async()=>{
  const host=new FakeHost(),target=new EventTarget(),commits=[];
  const qa={handle:{active:true}},runtime=createGameRuntime({host,onFinish:value=>commits.push(value),reducedMotion:true,qa});
  const moduleState={active:true};let events=0,ticks=0,abortCleanups=0;
  runtime.context.listen(target,"ping",()=>events++);
  runtime.context.listen(runtime.context.signal,"abort",()=>{abortCleanups++;moduleState.active=false;delete qa.handle});
  runtime.context.later(()=>events++,40);
  runtime.context.frame(()=>{ticks++;return true});
  target.dispatchEvent(new Event("ping"));assert.equal(events,1);
  assert.equal(runtime.context.finish(true),true);
  assert.equal(runtime.context.finish(false),false);
  target.dispatchEvent(new Event("ping"));await sleep(50);
  assert.equal(events,1);assert.ok(ticks>=0);assert.deepEqual(commits,[true]);
  assert.equal(abortCleanups,1);assert.equal(moduleState.active,false);assert.equal("handle" in qa,false);
  runtime.dispose();assert.equal(abortCleanups,1);
  const state=runtime.inspect();assert.equal(state.finishCalls,2);assert.equal(state.commits,1);assert.equal(state.listeners,0);assert.equal(state.timeouts,0);assert.equal(state.frames,0);
});
