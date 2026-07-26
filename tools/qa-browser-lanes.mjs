#!/usr/bin/env node
import {spawn} from "node:child_process";
import {mkdir,open,readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const ROOT=resolve(new URL("..",import.meta.url).pathname);
const BASE="/tmp/agetest-isolated-browser";
const LANES=Object.freeze({
  director:{cdp:9330,http:8860},
  flow:{cdp:9331,http:8861},
  audit:{cdp:9332,http:8862},
  screw:{cdp:9343,http:8863}
});
const [command="status",laneName,...args]=process.argv.slice(2);

function lane(name){
  const value=LANES[name];
  if(!value)throw new Error(`unknown lane ${name||"(missing)"}; use ${Object.keys(LANES).join(", ")}`);
  if(value.cdp===9222||value.cdp<9330)throw new Error("refusing non-isolated CDP port");
  return{...value,name,profile:`${BASE}/${name}/profile`,marker:`${BASE}/${name}/owner.json`};
}
async function json(url,timeout=1200){
  const signal=AbortSignal.timeout(timeout),response=await fetch(url,{signal});
  if(!response.ok)throw new Error(`${response.status} ${url}`);return response.json();
}
async function alive(port){try{return await json(`http://127.0.0.1:${port}/json/version`)}catch{return null}}
async function serverAlive(port){try{const response=await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(1000)});return response.ok}catch{return false}}
async function waitFor(probe,label){for(let i=0;i<50;i++){const value=await probe();if(value)return value;await new Promise(resolve=>setTimeout(resolve,100))}throw new Error(`${label} did not start`)}
async function detached(binary,argv,logPath){const log=await open(logPath,"a");const child=spawn(binary,argv,{detached:true,stdio:["ignore",log.fd,log.fd],cwd:ROOT});child.unref();await log.close();return child.pid}
async function verifyOwner(config){
  const marker=JSON.parse(await readFile(config.marker,"utf8"));
  if(marker.lane!==config.name||marker.cdp!==config.cdp||marker.http!==config.http)throw new Error(`ownership marker mismatch for ${config.name}`);
  return marker;
}
async function start(name){
  const config=lane(name),dir=`${BASE}/${name}`,versionBefore=await alive(config.cdp),serverBefore=await serverAlive(config.http);let owned=false;
  try{await verifyOwner(config);owned=true}catch{}
  if((versionBefore||serverBefore)&&!owned)throw new Error(`lane ${name} ports are already in use without an ownership marker; refusing to attach`);
  if(!owned){await mkdir(config.profile,{recursive:true});await writeFile(config.marker,JSON.stringify({owner:"AgeTest isolated QA",lane:name,cdp:config.cdp,http:config.http,profile:config.profile},null,2))}
  if(!serverBefore){
    await detached("python",["-m","http.server",String(config.http),"--bind","127.0.0.1","--directory",ROOT],`${dir}/http.log`);
    await waitFor(()=>serverAlive(config.http),`HTTP ${config.http}`);
  }
  let version=versionBefore;
  if(!version){
    const chrome="/opt/google/chrome/chrome";
    await detached(chrome,["--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check","--remote-debugging-address=127.0.0.1",`--remote-debugging-port=${config.cdp}`,`--user-data-dir=${config.profile}`,"--window-size=393,852","--remote-allow-origins=*",`http://127.0.0.1:${config.http}/`],`${dir}/chrome.log`);
    version=await waitFor(()=>alive(config.cdp),`CDP ${config.cdp}`);
  }
  console.log(JSON.stringify({lane:name,cdp:config.cdp,http:config.http,browser:version.Browser,isolated:true}));
}
async function status(name){
  const names=name?[name]:Object.keys(LANES),rows=[];
  for(const current of names){const config=lane(current),version=await alive(config.cdp),http=await serverAlive(config.http);let owned=false;try{await verifyOwner(config);owned=true}catch{}rows.push({lane:current,cdp:config.cdp,http:config.http,browser:version?.Browser||null,server:http,owned,ready:Boolean(version&&http&&owned)})}
  console.log(JSON.stringify(rows,null,2));
}
async function pageSocket(config){
  await verifyOwner(config);const pages=await json(`http://127.0.0.1:${config.cdp}/json/list`);const page=pages.find(item=>item.type==="page");if(!page)throw new Error(`no page target in ${config.name}`);return page.webSocketDebuggerUrl;
}
async function cdp(config,run){
  const socket=new WebSocket(await pageSocket(config)),pending=new Map();let sequence=0;
  await new Promise((resolve,reject)=>{socket.addEventListener("open",resolve,{once:true});socket.addEventListener("error",reject,{once:true})});
  socket.addEventListener("message",event=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const {resolve,reject}=pending.get(message.id);pending.delete(message.id);message.error?reject(new Error(message.error.message)):resolve(message.result)}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
  try{return await run(send)}finally{socket.close()}
}
async function navigate(name,url){
  const config=lane(name),allowed=new URL(url);if(!["127.0.0.1","localhost"].includes(allowed.hostname)||Number(allowed.port)!==config.http)throw new Error(`lane ${name} may navigate only its own HTTP port ${config.http}`);
  await cdp(config,async send=>{await send("Page.enable");await send("Emulation.setDeviceMetricsOverride",{width:393,height:852,deviceScaleFactor:3,mobile:true});await send("Page.navigate",{url:allowed.href});for(let i=0;i<100;i++){const result=await send("Runtime.evaluate",{expression:"document.readyState",returnByValue:true});if(result.result.value==="complete")break;await new Promise(resolve=>setTimeout(resolve,50))}});console.log(allowed.href);
}
async function evaluate(name,expression){const result=await cdp(lane(name),send=>send("Runtime.evaluate",{expression,awaitPromise:true,returnByValue:true}));if(result.exceptionDetails)throw new Error(result.exceptionDetails.text||"evaluation failed");console.log(JSON.stringify(result.result.value));}
async function screenshot(name,path){const output=resolve(path);const result=await cdp(lane(name),async send=>{await send("Page.enable");return send("Page.captureScreenshot",{format:"png",fromSurface:true,captureBeyondViewport:false})});await writeFile(output,Buffer.from(result.data,"base64"));console.log(output);}

try{
  if(command==="start")await start(laneName);
  else if(command==="status")await status(laneName);
  else if(command==="navigate")await navigate(laneName,args[0]);
  else if(command==="eval")await evaluate(laneName,args.join(" "));
  else if(command==="screenshot")await screenshot(laneName,args[0]);
  else throw new Error("usage: qa-browser-lanes.mjs start|status|navigate|eval|screenshot [lane] [...]");
}catch(error){console.error(error.message);process.exitCode=1}
