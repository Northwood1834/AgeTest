#!/usr/bin/env node
import {execFile} from "node:child_process";
import {mkdir,writeFile} from "node:fs/promises";
import {promisify} from "node:util";

const exec=promisify(execFile),tool="tools/qa-browser-lanes.mjs",lane="screw",base="http://127.0.0.1:8863/test/social-thread-vibe-v1.fixture.html",output="/tmp/social-thread-vibe-v1-visual";
const scenes=[
  ["initial",0,null],["input",0,null],["reply",0,null],["followup",0,null],["progress",0,null],
  ["cold",0,"cold"],["derail",0,"derail"],["flame",0,"flame"],["success",0,"success"],["timeout",0,"timeout"]
],viewports=[[393,852],[402,874]],motions=["normal","reduced"];
const call=async args=>(await exec(process.execPath,[tool,...args],{cwd:new URL("..",import.meta.url).pathname,maxBuffer:8*1024*1024})).stdout.trim();
const parse=outputValue=>JSON.parse(outputValue);
await mkdir(output,{recursive:true});
const status=parse(await call(["status",lane]));if(!status[0]?.ready||status[0].cdp!==9343||status[0].http!==8863)throw new Error("isolated screw lane is not ready");
const rows=[];
for(const [width,height] of viewports)for(const motion of motions)for(const [scene,family,expected] of scenes){
  const query=new URLSearchParams({scene,motion,width:String(width),family:String(family),run:`${Date.now()}-${rows.length}`}),url=`${base}?${query}`;
  await call(["navigate",lane,url,String(width),String(height),"3"]);
  const ready=parse(await call(["eval",lane,"(async()=>{for(let i=0;i<140&&!document.documentElement.dataset.ready;i++)await new Promise(r=>setTimeout(r,50));return document.documentElement.dataset.ready||'timeout'})()"]));
  if(ready!=="true")throw new Error(`${scene}/${width}/${motion} fixture did not become ready`);
  const image=`${output}/${scene}-${width}-${motion}.png`;await call(["screenshot",lane,image]);
  const expression=`(()=>{const r=window.__STV_FIXTURE__.report(),g=r.game,targets=r.touchTargets.filter(x=>x.width>0&&x.height>0);return{status:r.status,scene:r.scene,reduced:r.reduced,width:r.width,family:r.family,taskIdentity:r.taskIdentity,designatedChoice:r.designatedChoice,firstOwnPost:r.firstOwnPost,threadBoundary:r.threadBoundary,viewport:r.viewport,result:g?.result??null,done:g?.done??null,busy:g?.busy??null,turn:g?.turn??null,posts:g?.posts?.length??0,stats:g?.stats??null,dpr:g?.dpr??null,finishCalls:g?.finishCalls??null,runtime:r.runtime,outcome:r.outcome,focusVisible:r.focusVisible,designatedFocused:r.designatedFocused,minTouchHeight:targets.length?Math.min(...targets.map(x=>x.height)):null,resourcesAdded:r.resourcesAdded,external:r.external}})()`;
  const report=parse(await call(["eval",lane,expression]));
  const errors=[];if(report.status!=="pass")errors.push("fixture status");if(report.viewport.bodyScrollWidth>width)errors.push("horizontal overflow");if(report.dpr!==3||report.viewport.dpr!==3)errors.push("DPR");if(report.external.length||report.resourcesAdded)errors.push("external resources");if(report.result!==expected)errors.push(`result ${report.result} != ${expected}`);if(!report.threadBoundary?.complete)errors.push("partial post at thread top");
  if(expected){if(!report.done||report.finishCalls!==1||report.outcome?.correct!==(expected==="success"))errors.push("terminal finish")}else if(["reply","followup"].includes(scene)){if(!report.done||report.finishCalls!==0||!report.runtime.disposed)errors.push("frozen transition state")}else if(report.done||report.finishCalls!==0)errors.push("premature finish");
  if(scene==="initial"&&report.posts!==4)errors.push("initial post count");if(scene==="reply"&&(report.busy||report.posts!==5))errors.push("reply stage");if(scene==="followup"&&(report.busy||report.posts!==6))errors.push("follow-up stage");if(scene==="progress"&&(report.turn!==1||report.posts!==8||report.busy))errors.push("progress stage");if(scene==="input"&&(!report.focusVisible||!report.designatedFocused))errors.push("designated input focus");if(["reply","followup","progress","success"].includes(scene)&&report.firstOwnPost?.text!==report.designatedChoice?.text)errors.push("selected reply text differs from appended own post");if(!expected&&report.minTouchHeight<48)errors.push("touch target");
  rows.push({...report,image,expected,errors});if(errors.length)throw new Error(`${scene}/${width}/${motion}: ${errors.join(", ")}`);
  process.stdout.write(`PASS ${scene.padEnd(8)} ${width} ${motion}\n`);
}
const taskKeys=new Set(rows.map(row=>JSON.stringify(row.taskIdentity))),causalScenes=new Set(["reply","followup","progress","success"]);const evidence={game:"social-thread-vibe-v1",lane:{name:lane,cdp:9343,http:8863,browser:status[0].browser},persistedTask:rows[0].taskIdentity,matrix:{scenes:scenes.length,viewports:viewports.length,motions:motions.length,total:rows.length},checks:{allPass:rows.every(row=>!row.errors.length),singlePersistedTask:taskKeys.size===1,causalTextMatch:rows.filter(row=>causalScenes.has(row.scene)).every(row=>row.firstOwnPost?.text===row.designatedChoice?.text),fullPostBoundaries:rows.every(row=>row.threadBoundary?.complete),dpr3:rows.every(row=>row.dpr===3),noHorizontalOverflow:rows.every(row=>row.viewport.bodyScrollWidth<=row.width),noExternalResources:rows.every(row=>!row.external.length&&!row.resourcesAdded),touchTargets:rows.filter(row=>!row.expected).every(row=>row.minTouchHeight>=48),distinctTerminals:["cold","derail","flame","success","timeout"].every(result=>rows.some(row=>row.result===result))},rows};
if(Object.values(evidence.checks).some(value=>value!==true))throw new Error(`visual evidence summary failed: ${JSON.stringify(evidence.checks)}`);await writeFile("test/social-thread-vibe-v1.visual-report.json",`${JSON.stringify(evidence,null,2)}\n`);console.log(`PASS ${rows.length} visual scenes; one persisted task ${evidence.persistedTask.hash}; report test/social-thread-vibe-v1.visual-report.json`);
