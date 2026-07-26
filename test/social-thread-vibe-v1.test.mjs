import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const moduleUrl=new URL("../src/games/social-thread-vibe-v1.js",import.meta.url);
const source=await readFile(moduleUrl,"utf8");
const importGame=async suffix=>(await import(`data:text/javascript;base64,${Buffer.from(`${source}\n// ${suffix}`).toString("base64")}`)).default;
const game=await importGame("primary"),ID="social-thread-vibe-v1";

function helpers(initial=0x51a17){
  let seed=initial>>>0;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
  const randomInt=(min,max)=>min+Math.floor(random()*(max-min+1));
  const shuffle=values=>{const result=[...values];for(let index=result.length-1;index>0;index--){const other=randomInt(0,index);[result[index],result[other]]=[result[other],result[index]]}return result};
  return{pick:values=>values[randomInt(0,values.length-1)],shuffle};
}
const scenarioTask=index=>game.generate({pick:values=>values[index],shuffle:values=>[...values]});

class FakeClassList{
  constructor(owner){this.owner=owner;this.values=new Set()}
  reset(value){this.values=new Set(String(value||"").split(/\s+/).filter(Boolean))}
  add(...values){values.forEach(value=>this.values.add(value));this.sync()}
  remove(...values){values.forEach(value=>this.values.delete(value));this.sync()}
  contains(value){return this.values.has(value)}
  sync(){this.owner._className=[...this.values].join(" ")}
}
class FakeStyle{constructor(){this.values=new Map()}setProperty(key,value){this.values.set(key,String(value))}getPropertyValue(key){return this.values.get(key)||""}}
class FakeText{constructor(text,ownerDocument){this.nodeType=3;this.data=String(text);this.ownerDocument=ownerDocument;this.children=[]}get textContent(){return this.data}set textContent(value){this.data=String(value)}}
class FakeElement extends EventTarget{
  constructor(tag,ownerDocument){super();this.tagName=tag.toUpperCase();this.ownerDocument=ownerDocument;this.children=[];this.attributes=new Map();this.dataset={};this.style=new FakeStyle();this.classList=new FakeClassList(this);this._className="";this._text="";this.disabled=false;this.type="";this.tabIndex=-1;this.scrollTop=0;this.scrollHeight=500}
  set className(value){this._className=String(value);this.classList.reset(value)}get className(){return this._className}
  set textContent(value){this._text=String(value);this.children=[]}get textContent(){return this._text+this.children.map(child=>child?.textContent??String(child)).join("")}
  append(...nodes){nodes.forEach(node=>this.children.push(typeof node==="string"?new FakeText(node,this.ownerDocument):node))}
  replaceChildren(...nodes){this.children=[];this._text="";this.append(...nodes)}
  setAttribute(key,value){this.attributes.set(key,String(value))}getAttribute(key){return this.attributes.get(key)??null}
  focus(){this.ownerDocument.activeElement=this}
  getBoundingClientRect(){return{left:0,top:0,width:393,height:852,right:393,bottom:852}}
}
function fakeDocument(name="fixture"){
  const view=new EventTarget();view.devicePixelRatio=3;
  const documentRef={name,defaultView:view,activeElement:null};
  documentRef.createElement=tag=>new FakeElement(tag,documentRef);
  return documentRef;
}
function installDocument(){const previous=globalThis.document;globalThis.document=fakeDocument();return()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}}
function harness({reducedMotion=false,viewport={width:393,height:852,dpr:3},ownerDocument=globalThis.document}={}){
  const controller=new AbortController(),host=ownerDocument.createElement("div"),qa={},jobs=[],listeners=new Set(),finishes=[];
  let deadline=null,disposed=false;
  const context={host,signal:controller.signal,qa,reducedMotion,viewport,
    finish(correct,detail){if(disposed||finishes.length)return false;finishes.push({correct,detail});return true},
    later(fn,ms){const job={fn,ms,active:true};jobs.push(job);return job},
    setDeadline(ms,fn){deadline={ms,fn,active:true};return deadline},
    listen(target,type,fn,options){target.addEventListener(type,fn,options);const row={target,type,fn,options};listeners.add(row);return()=>{target.removeEventListener(type,fn,options);listeners.delete(row)}}
  };
  const runNext=()=>{const ready=jobs.splice(0);ready.forEach(job=>{if(job.active&&!disposed){job.active=false;job.fn()}})};
  const runAll=()=>{let guard=0;while(jobs.some(job=>job.active)){if(++guard>100)throw new Error("pending-job loop");runNext()}};
  const triggerDeadline=()=>{if(deadline?.active&&!disposed){deadline.active=false;deadline.fn()}};
  const dispose=()=>{if(disposed)return;controller.abort();disposed=true;jobs.forEach(job=>job.active=false);if(deadline)deadline.active=false;for(const row of listeners)row.target.removeEventListener(row.type,row.fn,row.options);listeners.clear()};
  return{context,host,qa,finishes,runNext,runAll,triggerDeadline,dispose,get delays(){return jobs.filter(job=>job.active).map(job=>job.ms)},get jobs(){return jobs.filter(job=>job.active).length},get listeners(){return listeners.size}};
}
const event=(type,props={})=>{const value=new Event(type,{bubbles:true,cancelable:true});for(const [key,item] of Object.entries(props))Object.defineProperty(value,key,{value:item});return value};
const stage=host=>host.children[1],thread=host=>stage(host).children[1],options=host=>stage(host).children[3].children[1].children;
const play=(task,h,path)=>{for(const choiceId of path){assert.equal(h.qa[ID].select(choiceId),true);h.runAll()}};
function independentOutcome(task,path){
  const stats={...task.initial},seen=new Map();
  for(let index=0;index<3;index++){
    const selected=task.turns[index].choices.find(choice=>choice.id===path[index]);
    const repeats=seen.get(selected.motif)||0;seen.set(selected.motif,repeats+1);
    for(const key of ["heat","momentum","drift"])stats[key]=Math.max(0,Math.min(12,stats[key]+selected.delta[key]));
    stats.stale=Math.max(0,Math.min(12,stats.stale+selected.delta.stale+(repeats?2:0)));
  }
  if(stats.heat>task.band.heatMax||stats.momentum>task.band.momentumMax)return"flame";
  if(stats.drift>task.band.driftMax)return"derail";
  if(stats.heat<task.band.heatMin||stats.momentum<task.band.momentumMin||stats.stale>task.band.staleMax)return"cold";
  return"success";
}
function enumerate(task){
  const counts={success:0,cold:0,derail:0,flame:0},paths=[];
  for(const one of task.turns[0].choices)for(const two of task.turns[1].choices)for(const three of task.turns[2].choices){const choices=[one.id,two.id,three.id],outcome=independentOutcome(task,choices);counts[outcome]++;paths.push({choices,outcome})}
  return{counts,paths};
}

test("metadata preserves the reserved social identity",()=>{
  assert.deepEqual(game.metadata,{id:ID,introducedIn:"2.0",tier:3,flavor:"quirky",step:1,family:"social-thread-vibe",category:"social"});
  assert.equal(typeof game.generate,"function");assert.equal(typeof game.validate,"function");assert.equal(typeof game.render,"function");
});

test("10,000 bounded generations stay plain, validated, authored, and finite",()=>{
  const random=helpers(0x2026),families=new Set(),answers=new Set(),started=performance.now();
  for(let index=0;index<10000;index++){
    const task=game.generate(random);assert.deepEqual(game.validate(task),[],`task ${index}`);assert.deepEqual(structuredClone(task),task);assert.equal(task.turns.length,3);assert.equal(task.total,27);assert.ok(task.wins>0&&task.wins<27);assert.equal(task.answer.length,3);families.add(task.scenarioId);answers.add(task.answer.join("/"));
  }
  assert.equal(families.size,5);assert.ok(answers.size>=5);assert.ok(performance.now()-started<9000);
});

test("each authored family independently enumerates 27 paths and all four outcomes",()=>{
  const identities=new Set(),winningPaths=new Set();
  for(let index=0;index<5;index++){
    const task=scenarioTask(index),proof=enumerate(task),firstWin=proof.paths.find(path=>path.outcome==="success");
    assert.equal(proof.paths.length,27);assert.deepEqual(proof.counts,task.outcomes);assert.equal(proof.counts.success,task.wins);assert.deepEqual(firstWin.choices,task.answer);
    for(const outcome of ["success","cold","derail","flame"])assert.ok(proof.counts[outcome]>0,`${task.scenarioId} lacks ${outcome}`);
    identities.add(`${task.label}/${task.title}/${task.topic}`);winningPaths.add(task.answer.join("/"));
    for(const round of task.turns)for(const reply of round.choices){assert.equal(reply.replyTo,round.incoming.no);assert.equal(reply.reactions.length,2);assert.ok(reply.reactions.every(post=>post.id.startsWith("RLY-")))}
  }
  assert.equal(identities.size,5);assert.equal(winningPaths.size,5);
});

test("authored criteria reward local context rather than one reusable nice reply",()=>{
  const [serious,joke,failure,tangent,flame]=[0,1,2,3,4].map(scenarioTask);
  assert.match(serious.answer.join("/"),/^s/);assert.match(joke.answer.join("/"),/^j/);assert.match(failure.answer.join("/"),/^f/);assert.match(tangent.answer.join("/"),/^t/);assert.match(flame.answer.join("/"),/^a/);
  assert.match(serious.turns[0].choices.find(choice=>choice.id==="s1-good").text,/小ネジ/);
  assert.match(joke.turns[0].choices.find(choice=>choice.id==="j1-good").text,/小さじ/);
  assert.match(failure.turns[0].choices.find(choice=>choice.id==="f1-good").text,/傘/);
  assert.match(tangent.turns[0].choices.find(choice=>choice.id==="t1-good").text,/307/);
  assert.match(flame.turns[0].choices.find(choice=>choice.id==="a1-good").text,/管理メモ/);
});

test("validator rejects forged proof, bad anchors, copied service syntax, malformed effects, and copy changes",()=>{
  const task=scenarioTask(0),mutate=fn=>{const value=structuredClone(task);fn(value);return game.validate(value).join(" | ")};
  assert.match(mutate(value=>value.wins++),/wins/);assert.match(mutate(value=>value.answer.reverse()),/answer/);assert.match(mutate(value=>value.outcomes.flame++),/outcome counts/);
  assert.match(mutate(value=>value.turns[0].choices[0].replyTo=999),/anchor/);assert.match(mutate(value=>value.turns[0].incoming.text="https:\/\/example.test"),/external identity/);assert.match(mutate(value=>value.turns[1].choices[1].delta.heat=9),/delta/);assert.match(mutate(value=>value.turns[2].choices[0].text="どの場面にも使える感じのよい返信"),/authored posts or choices/);assert.match(mutate(value=>value.title="実在サービスから転載したスレ"),/authored thread identity/);
  assert.match(mutate(value=>{value.prompt="感じよく返せ";value.duration=1}),/prompt changed/);assert.match(mutate(value=>value.seed[0].id="real-user-1"),/fictional ID/);
  assert.doesNotThrow(()=>game.validate({kind:"threadVibe",turns:[null],seed:null,answer:null}));assert.ok(game.validate(null).length>0);
});

test("plain JSON resumes in a fresh module and the canonical path succeeds once",async()=>{
  const restore=installDocument();try{
    const task=JSON.parse(JSON.stringify(scenarioTask(4))),fresh=await importGame(`resume-${Date.now()}`),h=harness({reducedMotion:true});assert.deepEqual(fresh.validate(task),[]);fresh.render(task,h.context);play(task,h,task.answer);
    const state=h.qa[ID].inspect();assert.equal(state.done,true);assert.equal(state.result,"success");assert.equal(state.path.length,3);assert.equal(state.posts.length,15);assert.deepEqual(state.posts.map(post=>post.no),Array.from({length:15},(_,index)=>301+index));assert.deepEqual(h.finishes.map(item=>item.correct),[true]);h.triggerDeadline();h.runAll();assert.equal(h.finishes.length,1);
  }finally{restore()}
});

test("a selected reply becomes a post, receives actual follow-ups, changes meters, then reveals the next incoming post",()=>{
  const restore=installDocument();try{
    const task=scenarioTask(2),h=harness({reducedMotion:true});game.render(task,h.context);const before=h.qa[ID].inspect(),selected=task.turns[0].choices[0];assert.equal(before.posts.length,4);assert.equal(h.qa[ID].select(selected.id),true);assert.equal(h.qa[ID].select(selected.id),false);let state=h.qa[ID].inspect();assert.equal(state.posts.at(-1).kind,"you");assert.equal(state.posts.at(-1).text,selected.text);assert.equal(state.posts.at(-1).time,"22:11:14");assert.deepEqual(state.stats,before.stats);
    h.runNext();state=h.qa[ID].inspect();assert.equal(state.posts.at(-1).text,selected.reactions[0].text);assert.equal(state.posts.at(-1).kind,"reaction");assert.notDeepEqual(state.stats,before.stats);assert.equal(state.busy,true);
    h.runNext();state=h.qa[ID].inspect();assert.equal(state.turn,1);assert.equal(state.busy,false);assert.equal(state.posts.at(-2).text,selected.reactions[1].text);assert.equal(state.posts.at(-1).text,task.turns[1].incoming.text);assert.equal(thread(h.host).children.length,8);
  }finally{restore()}
});

test("success, cold, derail, and flame render distinct terminal hierarchy and finish once",()=>{
  const restore=installDocument();try{
    const task=scenarioTask(0),copies=new Set();
    for(const outcome of ["success","cold","derail","flame"]){const h=harness({reducedMotion:true});game.render(structuredClone(task),h.context);const path=h.qa[ID].pathFor(outcome);assert.equal(path.length,3);play(task,h,path);const state=h.qa[ID].inspect();assert.equal(state.result,outcome);assert.equal(stage(h.host).dataset.result,outcome);assert.equal(h.finishes.length,1);assert.equal(h.finishes[0].correct,outcome==="success");const terminal=stage(h.host).children[4];copies.add(terminal.children[0].textContent);assert.match(terminal.children[2].textContent,/勢い\d+ \/ 温度\d+ \/ 既出\d+ \/ 脱線\d+/);h.triggerDeadline();h.runAll();assert.equal(h.finishes.length,1);h.dispose()}
    assert.equal(copies.size,4);
  }finally{restore()}
});

test("deadline has its own DAT terminal and cannot double-finish",()=>{
  const restore=installDocument();try{const task=scenarioTask(1),h=harness();game.render(task,h.context);h.triggerDeadline();assert.equal(h.qa[ID].inspect().result,"timeout");assert.equal(stage(h.host).dataset.result,"timeout");assert.match(stage(h.host).children[4].textContent,/DAT落ち/);h.runAll();assert.deepEqual(h.finishes.map(item=>item.correct),[false]);assert.equal(h.finishes[0].detail.reason,"timeout");h.triggerDeadline();h.runAll();assert.equal(h.finishes.length,1)}finally{restore()}
});

test("dispose during a pending reply cancels reactions, finish, deadline, listeners, and QA",()=>{
  const restore=installDocument();try{const task=scenarioTask(3),h=harness();game.render(task,h.context);h.qa[ID].select(task.answer[0]);assert.ok(h.jobs>0);const count=h.qa[ID].inspect().posts.length;h.dispose();h.runAll();h.triggerDeadline();assert.equal(h.finishes.length,0);assert.equal(h.jobs,0);assert.equal(h.listeners,0);assert.equal(h.qa[ID],undefined);assert.equal(thread(h.host).children.length,count)}finally{restore()}
});

test("touch, number keys, arrows, visible focus, nonzero reduced staging, and DPR3 are exposed",()=>{
  const restore=installDocument();try{
    const task=scenarioTask(1),h=harness({reducedMotion:true,viewport:{width:402,height:874,dpr:3}});game.render(task,h.context);const buttons=options(h.host);assert.equal(buttons.length,3);assert.equal(document.activeElement,null);stage(h.host).dispatchEvent(event("keydown",{key:"ArrowDown"}));assert.equal(document.activeElement,buttons[0]);stage(h.host).dispatchEvent(event("keydown",{key:"ArrowDown"}));assert.equal(document.activeElement,buttons[1]);stage(h.host).dispatchEvent(event("keydown",{key:"ArrowUp"}));assert.equal(document.activeElement,buttons[0]);assert.equal(h.qa[ID].inspect().dpr,3);assert.equal(stage(h.host).dataset.reduced,"true");assert.equal(stage(h.host).getAttribute("aria-label"),"匿名掲示板の流れを三返信で整えるゲーム");assert.ok(h.delays.every(ms=>ms>0));
    buttons[0].dispatchEvent(event("pointerdown",{pointerType:"touch"}));assert.equal(h.qa[ID].inspect().path.length,1);buttons[0].dispatchEvent(event("click",{detail:1}));assert.equal(h.qa[ID].inspect().path.length,1);h.runAll();stage(h.host).dispatchEvent(event("keydown",{key:"2"}));assert.equal(h.qa[ID].inspect().path.length,2);
  }finally{restore()}
});

test("render creates every node from host.ownerDocument",()=>{
  const previous=globalThis.document,foreign=fakeDocument("foreign");globalThis.document={createElement(){throw new Error("global document used")}};
  try{const h=harness({ownerDocument:foreign});game.render(scenarioTask(0),h.context);const visit=node=>{assert.equal(node.ownerDocument,foreign);for(const child of node.children||[])visit(child)};visit(h.host);h.dispose()}finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous}
});

test("source is tracked-lifetime, ownerDocument-only, network-free, audio-free, and asset-free",()=>{
  assert.match(source,/context\.host\?\.ownerDocument/);assert.doesNotMatch(source,/\bdocument\.createElement\s*\(/);assert.doesNotMatch(source,/\b(?:setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame|addEventListener)\s*\(/);assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|AudioContext|webkitAudioContext|new Audio)\b/);assert.doesNotMatch(source,/<img|\.png|\.jpe?g|\.webp|\.svg/i);
});
