#!/usr/bin/env node
import {spawnSync} from "node:child_process";
import {mkdirSync,readdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const root=resolve(new URL("..",import.meta.url).pathname),out=process.argv[2]||"/tmp/calculation-rpg-battle-v1-visual",laneTool=resolve(root,"tools/qa-browser-lanes.mjs");
mkdirSync(out,{recursive:true});
const run=(args,{json=false}={})=>{const result=spawnSync(process.execPath,[laneTool,...args],{cwd:root,encoding:"utf8"});if(result.status!==0)throw new Error(`${args.join(" ")}: ${result.stderr||result.stdout}`);return json?JSON.parse(result.stdout):result.stdout};
run(["start","screw"]);
const scenes=["initial","question","input","attack","wrong-hit","progress","sweep","call","success","failure"],viewports=[[393,852],[402,874]],motions=["normal","reduced"];
for(const[width,height]of viewports)for(const motion of motions)for(const scene of scenes)for(const variant of["legacy","module"]){
  const fixture=variant==="legacy"?"calculation-rpg-battle-v1.legacy-fixture.html":"calculation-rpg-battle-v1.fixture.html",url=`http://127.0.0.1:8863/test/${fixture}?scene=${scene}&motion=${motion}&width=${width}`;
  run(["navigate","screw",url,String(width),String(height),"3"]);run(["eval","screw","document.documentElement.dataset.ready"],{json:true});run(["screenshot","screw",resolve(out,`${width}x${height}-${scene}-${variant}-${motion}.png`)]);
}
const rows=[];
for(const moduleName of readdirSync(out).filter(name=>name.endsWith("-module-normal.png")||name.endsWith("-module-reduced.png")).sort()){
  const legacyName=moduleName.replace("-module-","-legacy-"),result=spawnSync("compare",["-metric","RMSE",resolve(out,legacyName),resolve(out,moduleName),"null:"],{encoding:"utf8"}),match=(result.stderr||result.stdout).match(/\(([^)]+)\)/),normalizedRmse=match?Number(match[1]):null;
  rows.push({pair:moduleName.replace("-module-","-").replace(/\.png$/,"") ,normalizedRmse,pass:Number.isFinite(normalizedRmse)&&normalizedRmse<.18});
}
const report={status:rows.length>=24&&rows.every(row=>row.pass)?"pass":"fail",pairedComparisons:rows.length,fullResolutionScreenshots:readdirSync(out).filter(name=>name.endsWith(".png")).length,viewports:["393x852 DPR3","402x874 DPR3"],motions,scenes,threshold:.18,maxNormalizedRmse:Math.max(...rows.map(row=>row.normalizedRmse)),rows};
writeFileSync(resolve(root,"test/calculation-rpg-battle-v1.visual-report.json"),JSON.stringify(report,null,2)+"\n");
const width=402,height=874,url=`http://127.0.0.1:8863/test/calculation-rpg-battle-v1.fixture.html?scene=question&motion=normal&width=${width}`;run(["navigate","screw",url,String(width),String(height),"3"]);
const interaction=run(["eval","screw",`(()=>{const stage=document.querySelector('.crb-stage'),first=document.querySelector('.crb-command');stage.dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true,cancelable:true}));const keyboardFocus=document.activeElement===first;first.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',bubbles:true,cancelable:true}));const api=window.__RPG_FIXTURE__.qa['calculation-rpg-battle-v1'];return{keyboardFocus,touchCommand:api.inspect().phase==='target',targetFocus:document.activeElement?.classList.contains('crb-sprite'),inspection:api.inspect(),report:window.__RPG_FIXTURE__.report()}})()`],{json:true});
const evidence={status:report.status==="pass"&&interaction.keyboardFocus&&interaction.touchCommand&&interaction.targetFocus&&interaction.report.status==="pass"?"pass":"fail",lane:{name:"screw",cdp:9343,http:8863,isolated:true},interaction:{viewport:"402x874 DPR3",keyboardFocus:interaction.keyboardFocus,touchCommand:interaction.touchCommand,targetFocus:interaction.targetFocus,phase:interaction.inspection.phase,focused:interaction.inspection.focused,spritePixels:interaction.inspection.spritePixels},performance:{fixtureElapsedMs:interaction.report.elapsedMs,bodyScrollWidth:interaction.report.viewport.bodyScrollWidth,runtimeFrames:interaction.report.runtime.frames,runtimeTimeouts:interaction.report.runtime.timeouts,resourcesAdded:interaction.report.resourcesAdded},runtime:interaction.report.runtime,external:interaction.report.external,visualArtifacts:out,visualReport:"test/calculation-rpg-battle-v1.visual-report.json"};
writeFileSync(resolve(root,"test/calculation-rpg-battle-v1.browser-evidence.json"),JSON.stringify(evidence,null,2)+"\n");console.log(JSON.stringify({report,evidence},null,2));if(report.status!=="pass"||evidence.status!=="pass")process.exitCode=1;
