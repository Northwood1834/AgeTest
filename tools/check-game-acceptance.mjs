import {access,readdir,readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {gameManifest} from "../src/game-manifest.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const directory=path.join(root,"acceptance");
const requiredViewports=["393x852@3","402x874@3"];
const issues=[],records=new Map();

for(const file of (await readdir(directory)).filter(name=>name.endsWith(".json")).sort()){
  let record;
  try{record=JSON.parse(await readFile(path.join(directory,file),"utf8"))}catch(error){issues.push(`${file}: ${error.message}`);continue}
  if(record?.id&&records.has(record.id))issues.push(`${file}: duplicate id ${record.id}`);
  if(record?.id)records.set(record.id,record);
  if(file!==`${record?.id}.json`)issues.push(`${file}: filename must match id`);
  if(record?.schemaVersion!==1)issues.push(`${file}: schemaVersion must be 1`);
  if(record?.status!=="accepted")issues.push(`${file}: status must be accepted`);
  if(!/^[0-9a-f]{40}$/.test(record?.acceptedCommit||""))issues.push(`${file}: acceptedCommit must be a full commit hash`);
  if(!["published-port","original"].includes(record?.compatibility))issues.push(`${file}: invalid compatibility`);
  if(record?.visualReview?.status!=="passed")issues.push(`${file}: visual review has not passed`);
  if(JSON.stringify(record?.visualReview?.viewports)!==JSON.stringify(requiredViewports))issues.push(`${file}: required DPR3 viewports are missing`);
  if(typeof record?.test!=="string")issues.push(`${file}: test path is missing`);
  else try{await access(path.join(root,record.test))}catch{issues.push(`${file}: test path does not exist`)}
}

for(const entry of gameManifest)if(!records.has(entry.id))issues.push(`${entry.id}: missing acceptance record`);
for(const id of records.keys())if(!gameManifest.some(entry=>entry.id===id))issues.push(`${id}: acceptance record has no manifest entry`);
if(issues.length){console.error(issues.join("\n"));process.exitCode=1}else console.log(`verified ${records.size} accepted game records`);
