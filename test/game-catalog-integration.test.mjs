import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {gameManifest} from "../src/game-manifest.js";
import {gameCatalog,selectableGameCatalog,RETIRED_GAME_IDS,generateGameTask,loadGame,stripGameTaskEnvelope} from "../src/game-loader.js";

const appSource=await readFile(new URL("../app.js",import.meta.url),"utf8");
const publishedIds=JSON.parse(await readFile(new URL("./published-game-ids.json",import.meta.url),"utf8"));
const legacyStart=appSource.indexOf("const LEGACY_TASK_FACTORIES = [");
const legacyEnd=appSource.indexOf("\n];",legacyStart);
assert.ok(legacyStart>=0&&legacyEnd>legacyStart,"legacy factory section is present during migration");
const legacySection=appSource.slice(legacyStart,legacyEnd);
const legacyIds=[...legacySection.matchAll(/\{id:"([^"]+)"/g)].map(match=>match[1]);
const manifestIds=gameManifest.map(entry=>entry.id);

test("the growing catalogue retains every published ID without legacy/module overlap",()=>{
  const allIds=new Set([...legacyIds,...manifestIds]),published=new Set(publishedIds),newIds=[...allIds].filter(id=>!published.has(id));
  assert.equal(published.size,79,"published baseline has 79 unique IDs");
  assert.equal(new Set(legacyIds).size,legacyIds.length,"legacy IDs are unique");
  assert.equal(new Set(manifestIds).size,manifestIds.length,"manifest IDs are unique");
  assert.deepEqual(legacyIds.filter(id=>manifestIds.includes(id)),[],"accepted modules have no legacy factory left");
  assert.deepEqual(publishedIds.filter(id=>!allIds.has(id)),[],"no published stable ID was lost");
  assert.deepEqual(newIds.filter(id=>!manifestIds.includes(id)),[],"new games exist only as modules");
  assert.ok(allIds.size>=79&&allIds.size<=300,`catalogue size ${allIds.size} is outside the production target`);
  assert.equal(gameCatalog.length,manifestIds.length);
  assert.ok(selectableGameCatalog.every(entry=>manifestIds.includes(entry.id)));
});

test("every accepted manifest entry loads its own matching game module",async()=>{
  for(const entry of gameManifest){
    const game=await loadGame(entry.id);
    assert.equal(game.metadata.id,entry.id);
    for(const field of ["introducedIn","tier","flavor","step","family","category"]){
      assert.equal(game.metadata[field],entry[field],`${entry.id} ${field}`);
    }
  }
});

test("withheld games leave new selection but remain loadable for saved sessions",async()=>{
  const ids=["inhibition-parity-v1","memory-phone-pin-v1","memory-table-restore-v1","prediction-card-combo-v1","social-care-package-v1","social-postcard-send-v1","spatial-cube-v1","spatial-draw-bridge-v1","timing-mochi-pound-v1"];
  assert.deepEqual([...RETIRED_GAME_IDS].sort(),[...ids].sort());
  for(const id of ids){
    assert.equal(gameCatalog.some(entry=>entry.id===id),true);
    assert.equal(selectableGameCatalog.some(entry=>entry.id===id),false);
    assert.equal((await loadGame(id)).metadata.id,id);
  }
});

test("production envelopes strip to exact valid game data for every manifest module",async()=>{
  const envelopeKeys=["templateId","introducedIn","tier","flavor","step","family","category"],envelopeSet=new Set(envelopeKeys),helpers={random:()=>.25,randomInt:min=>min,pick:values=>values[0],shuffle:values=>[...values]};
  for(const entry of gameManifest){
    const game=await loadGame(entry.id),stored=await generateGameTask(entry.id,helpers),before=structuredClone(stored),data=stripGameTaskEnvelope(stored),expected=Object.fromEntries(Object.entries(stored).filter(([key])=>!envelopeSet.has(key)));
    assert.notEqual(data,stored,`${entry.id} returns a fresh object`);
    assert.equal(Object.getPrototypeOf(data),Object.prototype,`${entry.id} returns a plain object`);
    assert.deepEqual(envelopeKeys.filter(key=>Object.hasOwn(data,key)),[],`${entry.id} removes all envelope keys`);
    assert.deepEqual(data,expected,`${entry.id} retains every game-data field`);
    assert.deepEqual(stored,before,`${entry.id} stored task is not mutated`);
    assert.deepEqual(game.validate(data),[],`${entry.id} stripped data validates`);
  }
  const retained=stripGameTaskEnvelope({templateId:"x",introducedIn:"1",tier:1,flavor:"f",step:1,family:"x",category:"reaction",kind:"demo",unexpected:"game-data"});
  assert.deepEqual(retained,{kind:"demo",unexpected:"game-data"},"only the seven known envelope keys are removed");
  assert.match(appSource,/game\.render\(stripGameTaskEnvelope\(task\),runtime\.context\)/,"production render strips metadata before calling the module");
  assert.match(appSource,/return factory\.modular\?task:tuneTaskForPace\(task,paceMode\)/,"standard and relaxed modular sessions retain identical authored task data");
});
