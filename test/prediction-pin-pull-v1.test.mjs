import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import game from "../src/games/prediction-pin-pull-v1.js";

const ORDERS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const LAYOUTS={
  funnel:{targets:[1,"hero",1]},
  cascade:{targets:[1,"hero",1]},
  tower:{targets:[1,2,"hero"]}
};
const sameOrder=(a,b)=>a.length===b.length&&a.every((value,index)=>value===b[index]);
const keyFor=task=>`${task.template}:${task.contents.join(",")}`;

// Independent test oracle: intentionally does not use module internals.
function mix(a,b){
  if(!a)return b;if(!b)return a;
  if(a==="stone"||b==="stone")return"stone";
  if(new Set([a,b]).size===2&&[a,b].includes("lava")&&[a,b].includes("water"))return"stone";
  if(a==="lava"||b==="lava")return"lava";
  if(a==="coin"||b==="coin")return"coin";
  return"water";
}

function play(task,order){
  const targets=LAYOUTS[task.template].targets;
  const rooms=task.contents.map(content=>({content,open:false}));
  let coins=0,dead=false,pulled=0;
  const send=(flow,target,depth=0)=>{
    if(!flow||dead||depth>6)return;
    if(target==="hero"){
      if(flow==="lava")dead=true;
      else if(flow==="coin")coins++;
      return;
    }
    const room=rooms[target];
    if(room.open)send(flow,targets[target],depth+1);
    else room.content=mix(room.content,flow);
  };
  for(const index of order){
    const room=rooms[index];room.open=true;pulled++;
    const flow=room.content;room.content=null;send(flow,targets[index]);
    if(dead)break;
  }
  const total=task.contents.filter(content=>content==="coin").length;
  return{win:!dead&&pulled===3&&total>0&&coins===total,dead,coins,pulled};
}

function analyze(task){
  const outcomes=ORDERS.map(order=>({order,...play(task,order)}));
  return{
    outcomes,
    wins:outcomes.filter(outcome=>outcome.win),
    deaths:outcomes.filter(outcome=>outcome.dead),
    nonLethalWrong:outcomes.filter(outcome=>!outcome.win&&!outcome.dead)
  };
}

test("metadata keeps the published stable identity",()=>{
  assert.deepEqual(game.metadata,{
    id:"prediction-pin-pull-v1",introducedIn:"1.4",tier:2,flavor:"wild",step:1,
    family:"prediction-pin-pull",category:"prediction"
  });
  assert.equal(typeof game.generate,"function");
  assert.equal(typeof game.validate,"function");
  assert.equal(typeof game.render,"function");
});

test("finite generation exposes and reaches every prevalidated board",()=>{
  let upper=-1;
  const first=game.generate({randomInt:(min,max)=>{assert.equal(min,0);upper=max;return min}});
  assert.ok(upper>=0);
  assert.deepEqual(game.validate(first),[]);

  const generated=[];
  for(let index=0;index<=upper;index++){
    const task=game.generate({randomInt:(min,max)=>{assert.equal(min,0);assert.equal(max,upper);return index}});
    generated.push(task);
  }
  assert.equal(new Set(generated.map(keyFor)).size,generated.length,"candidate table contains duplicates");
  assert.deepEqual(new Set(generated.map(task=>task.template)),new Set(["funnel","cascade","tower"]));

  for(const task of generated){
    assert.deepEqual(game.validate(task),[],keyFor(task));
    assert.doesNotThrow(()=>structuredClone(task));
    assert.deepEqual(game.validate(JSON.parse(JSON.stringify(task))),[],"JSON resume changed task meaning");
    const proof=analyze(task);
    assert.equal(proof.outcomes.length,6);
    assert.equal(proof.wins.length,1,`${keyFor(task)} is not uniquely solvable`);
    assert.ok(proof.deaths.length>=2,`${keyFor(task)} lacks multiple lethal orders`);
    assert.ok(proof.nonLethalWrong.length>=1,`${keyFor(task)} lacks a non-lethal wrong order`);
    assert.ok(sameOrder(task.answer,proof.wins[0].order),`${keyFor(task)} answer disagrees with oracle`);
  }
});

test("10,000 generated tasks terminate and all six orders preserve invariants",()=>{
  let state=0x8f31a2c7;
  const randomInt=(min,max)=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;state>>>=0;
    return min+(state%(max-min+1));
  };
  const started=performance.now();
  for(let iteration=0;iteration<10000;iteration++){
    const task=game.generate({randomInt});
    const proof=analyze(task);
    assert.equal(proof.outcomes.length,6);
    assert.equal(proof.wins.length,1);
    assert.ok(proof.deaths.length>=2);
    assert.ok(proof.nonLethalWrong.length>=1);
    assert.ok(sameOrder(task.answer,proof.wins[0].order));
    assert.deepEqual(game.validate(task),[]);
  }
  assert.ok(performance.now()-started<5000,"generation/validation exceeded the stopping budget");
});

test("validator rejects changed answers, rules, and unsolvable data",()=>{
  const task=game.generate({randomInt:()=>0});
  const wrongAnswer=structuredClone(task);wrongAnswer.answer=[...wrongAnswer.answer].reverse();
  if(sameOrder(wrongAnswer.answer,task.answer))wrongAnswer.answer=[1,0,2];
  assert.ok(game.validate(wrongAnswer).some(issue=>issue.includes("answer")));

  const unknownLayout={...structuredClone(task),template:"unknown"};
  assert.ok(game.validate(unknownLayout).some(issue=>issue.includes("layout")));
  const noLava={...structuredClone(task),contents:["water","coin","coin"]};
  assert.ok(game.validate(noLava).some(issue=>issue.includes("lava")||issue.includes("winning")));
  const noCoin={...structuredClone(task),contents:["lava","water","water"]};
  assert.ok(game.validate(noCoin).some(issue=>issue.includes("coin")||issue.includes("winning")));
  const duplicatePin={...structuredClone(task),answer:[0,0,1]};
  assert.ok(game.validate(duplicatePin).some(issue=>issue.includes("permutation")));
  const changedTiming={...structuredClone(task),duration:1};
  assert.ok(game.validate(changedTiming).some(issue=>issue.includes("50000")));
});

test("generate is DOM-free and rejects a broken random helper",()=>{
  const previous=globalThis.document;
  Object.defineProperty(globalThis,"document",{configurable:true,get(){throw new Error("generate touched document")}});
  try{assert.doesNotThrow(()=>game.generate({randomInt:()=>0}))}finally{
    if(previous===undefined)delete globalThis.document;
    else Object.defineProperty(globalThis,"document",{configurable:true,writable:true,value:previous});
  }
  assert.throws(()=>game.generate({}),/requires randomInt/);
  assert.throws(()=>game.generate({randomInt:()=>Number.MAX_SAFE_INTEGER}),/out-of-range/);
});

test("module contains no untracked lifetime or external-network primitive",async()=>{
  const source=await readFile(new URL("../src/games/prediction-pin-pull-v1.js",import.meta.url),"utf8");
  for(const forbidden of ["setTimeout(","setInterval(","requestAnimationFrame(","addEventListener(","fetch(","XMLHttpRequest","WebSocket("]){
    assert.equal(source.includes(forbidden),false,`forbidden primitive: ${forbidden}`);
  }
  assert.match(source,/\blater\(/);
  assert.match(source,/\bframe\(/);
  assert.match(source,/\blisten\(/);
  assert.match(source,/\bsetDeadline\(/);
});
