import {gameManifest} from "./game-manifest.js";

export const RETIRED_GAME_IDS=new Set([
  "prediction-card-combo-v1",
]);
export const gameCatalog=Object.freeze(gameManifest.map(entry=>Object.freeze({...entry})));
export const selectableGameCatalog=Object.freeze(gameCatalog.filter(entry=>!RETIRED_GAME_IDS.has(entry.id)));
const entriesById=new Map(gameCatalog.map(entry=>[entry.id,entry]));
const moduleCache=new Map();

export function manifestEntry(templateId){
  return entriesById.get(templateId)||null;
}

export function isModularGame(templateId){
  return entriesById.has(templateId);
}

function assertMetadata(entry,metadata){
  const fields=["id","introducedIn","tier","flavor","step","family","category"];
  const mismatches=fields.filter(field=>metadata?.[field]!==entry[field]);
  if(mismatches.length)throw new Error(`Game module metadata mismatch for ${entry.id}: ${mismatches.join(", ")}`);
}

export async function loadGame(templateId){
  const entry=manifestEntry(templateId);
  if(!entry)throw new Error(`Game module not found in manifest: ${templateId}`);
  if(!moduleCache.has(templateId)){
    const url=new URL(entry.module,import.meta.url);
    url.searchParams.set("h",entry.hash);
    moduleCache.set(templateId,import(url.href).then(namespace=>{
      const game=namespace.default;
      if(!game||typeof game.generate!=="function"||typeof game.validate!=="function"||typeof game.render!=="function")throw new Error(`Invalid game module exports: ${templateId}`);
      assertMetadata(entry,game.metadata);
      return game;
    }).catch(error=>{moduleCache.delete(templateId);throw error}));
  }
  return moduleCache.get(templateId);
}

export function stripGameTaskEnvelope(task){
  const {templateId,introducedIn,tier,flavor,step,family,category,...data}=task;
  return data;
}

export async function generateGameTask(templateId,randomHelpers){
  const entry=manifestEntry(templateId),game=await loadGame(templateId);
  const data=game.generate(randomHelpers),issues=game.validate(data);
  if(!Array.isArray(issues))throw new Error(`${templateId} validate() must return an array`);
  if(issues.length)throw new Error(`${templateId} generated invalid task: ${issues.join("; ")}`);
  try{structuredClone(data)}catch(error){throw new Error(`${templateId} generated non-cloneable task: ${error.message}`)}
  return{
    templateId:entry.id,introducedIn:entry.introducedIn,tier:entry.tier,flavor:entry.flavor,
    step:entry.step,family:entry.family,category:entry.category,...data
  };
}

export function clearGameModuleCache(){
  moduleCache.clear();
}
