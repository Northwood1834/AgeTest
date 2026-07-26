import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {gameManifest} from "../src/game-manifest.js";
import {gameCatalog,selectableGameCatalog,loadGame} from "../src/game-loader.js";

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
