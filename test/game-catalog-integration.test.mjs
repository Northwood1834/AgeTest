import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {gameManifest} from "../src/game-manifest.js";
import {gameCatalog,selectableGameCatalog,loadGame} from "../src/game-loader.js";

const appSource=await readFile(new URL("../app.js",import.meta.url),"utf8");
const legacyStart=appSource.indexOf("const LEGACY_TASK_FACTORIES = [");
const legacyEnd=appSource.indexOf("\n];",legacyStart);
assert.ok(legacyStart>=0&&legacyEnd>legacyStart,"legacy factory section is present during migration");
const legacySection=appSource.slice(legacyStart,legacyEnd);
const legacyIds=[...legacySection.matchAll(/\{id:"([^"]+)"/g)].map(match=>match[1]);
const manifestIds=gameManifest.map(entry=>entry.id);

test("the mixed migration catalogue retains all 79 unique stable IDs",()=>{
  assert.equal(new Set(legacyIds).size,legacyIds.length,"legacy IDs are unique");
  assert.equal(new Set(manifestIds).size,manifestIds.length,"manifest IDs are unique");
  assert.deepEqual(legacyIds.filter(id=>manifestIds.includes(id)),[],"accepted modules have no legacy factory left");
  assert.equal(new Set([...legacyIds,...manifestIds]).size,79);
  assert.equal(gameCatalog.length,manifestIds.length);
  assert.equal(selectableGameCatalog.length,manifestIds.length);
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
