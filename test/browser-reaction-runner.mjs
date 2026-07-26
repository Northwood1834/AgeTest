const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=(check,timeout=8000)=>new Promise((resolve,reject)=>{const started=performance.now();const poll=()=>{let value;try{value=check()}catch{}if(value)return resolve(value);if(performance.now()-started>timeout)return reject(new Error("wait timeout"));setTimeout(poll,20)};poll()});
const resourceStats=entries=>({
  requests:entries.length,
  transferBytes:entries.reduce((sum,entry)=>sum+(entry.transferSize||0),0),
  encodedBytes:entries.reduce((sum,entry)=>sum+(entry.encodedBodySize||0),0),
  decodedBytes:entries.reduce((sum,entry)=>sum+(entry.decodedBodySize||0),0),
  paths:entries.map(entry=>new URL(entry.name).pathname)
});

export async function runReactionBrowserQa(qa){
  const params=new URLSearchParams(location.search),width=Number(params.get("width"))||innerWidth,height=Number(params.get("height"))||innerHeight,full=params.get("full")!=="0",resumeStage=sessionStorage.getItem("reactionQaStage")==="resume";
  const saved=JSON.parse(sessionStorage.getItem("reactionQaEvidence")||"null")||{failures:[],errors:[],evidence:{}};
  const {failures,errors,evidence}=saved,assert=(condition,message)=>{if(!condition)failures.push(message)};
  addEventListener("error",event=>errors.push(event.message||"page error"));
  addEventListener("unhandledrejection",event=>errors.push(String(event.reason)));
  const finish=()=>{
    const resources=performance.getEntriesByType("resource").map(entry=>entry.name),external=resources.filter(url=>new URL(url).origin!==location.origin);
    evidence.resources=[...(evidence.resources||[]),...resources];assert(external.length===0,`external network: ${external.join(",")}`);assert(errors.length===0,`page errors: ${errors.join(";")}`);
    sessionStorage.removeItem("reactionQaStage");sessionStorage.removeItem("reactionQaEvidence");
    const report={status:failures.length?"fail":"pass",width,height,full,evidence,failures,errors},pre=document.createElement("pre");pre.id="result";pre.dataset.status=report.status;pre.textContent=JSON.stringify(report,null,2);document.body.replaceChildren(pre);document.title=`reaction QA ${report.status}`;
  };

  try{
    document.documentElement.style.width=`${width}px`;document.body.style.width=`${width}px`;document.body.style.margin="0";
    await sleep(0);
    evidence.viewport={width:innerWidth,height:innerHeight,dpr:devicePixelRatio,touchEvents:"ontouchstart" in window,pointerEvents:"PointerEvent" in window,testedContentWidth:width,bodyScrollWidth:document.body.scrollWidth};
    assert(document.body.scrollWidth<=width,"horizontal overflow");
    if(!full){finish();return}

    if(resumeStage){
      const button=await wait(()=>document.querySelector("#challenge .signal-button"));
      await wait(()=>button.textContent==="いま！",2500);button.click();
      assert(document.querySelector("#feedback-title").textContent==="正解","published plain-data resume failed");evidence.resume=true;
      const legacy=await qa.preview("calculation-half-v1",6500),legacyButton=[...document.querySelectorAll("#challenge button")].find(item=>item.textContent===legacy.answer);
      assert(Boolean(legacyButton),"legacy answer control missing");legacyButton?.click();
      assert(["正解","LEVEL UP!"].includes(document.querySelector("#feedback-title").textContent),"legacy session regression");evidence.legacy=legacy.templateId;
      finish();return;
    }

    const initialResources=performance.getEntriesByType("resource"),navigation=performance.getEntriesByType("navigation")[0],initialGameModules=initialResources.filter(entry=>/\/src\/games\//.test(new URL(entry.name).pathname));
    evidence.performance={
      cold:{...resourceStats(initialResources),documentParseAndStartupMs:Math.max(0,(navigation?.domInteractive||0)-(navigation?.responseEnd||0)),gameModuleRequests:initialGameModules.map(entry=>new URL(entry.name).pathname)}
    };
    assert(initialGameModules.length===0,"cold load eagerly fetched game modules");

    qa.home();
    const sessionResourceStart=performance.getEntriesByType("resource").length,sessionStartedAt=performance.now();
    document.querySelector("#start-button").click();
    const selected=await wait(()=>{const tasks=qa.sessionTasks();return tasks.length===12&&document.querySelector("#challenge")?.childElementCount?tasks:null},10000);
    const sessionResources=performance.getEntriesByType("resource").slice(sessionResourceStart),selectedModules=sessionResources.filter(entry=>/\/src\/games\//.test(new URL(entry.name).pathname));
    evidence.performance.sessionStart={...resourceStats(sessionResources),durationMs:performance.now()-sessionStartedAt,selectedTemplates:selected,moduleRequests:selectedModules.map(entry=>new URL(entry.name).pathname)};
    assert(new Set(selected).size===12,"session selection failed");
    assert(selectedModules.every(entry=>selected.some(id=>new URL(entry.name).pathname.endsWith(`/src/games/${id}.js`))),"session loaded an unselected game module");

    const firstTask=qa.activeTask()?.templateId,nextResourceStart=performance.getEntriesByType("resource").length,nextStartedAt=performance.now(),nextTask=await qa.next(),nextResources=performance.getEntriesByType("resource").slice(nextResourceStart);
    evidence.performance.nextQuestion={...resourceStats(nextResources),durationMs:performance.now()-nextStartedAt,from:firstTask,to:nextTask?.templateId||null};
    assert(Boolean(nextTask)&&nextTask.templateId!==firstTask,"next-question transition failed");
    qa.home();

    const validation=await qa.validate(2);evidence.catalog={factories:validation.factories,issues:validation.issues};
    assert(validation.factories===79&&validation.issues.length===0,"catalog validation failed");
    const sampled=await qa.sampleSession(1);assert(sampled.length===12&&new Set(sampled.map(task=>task.templateId)).size===12,"session selection failed");

    await qa.preview("reaction-signal-v1",4300);
    let button=document.querySelector("#challenge .signal-button");
    assert(button===document.activeElement,"signal button not focused");
    await wait(()=>button.textContent==="いま！",3500);button.click();button.click();
    assert(document.querySelector("#feedback-title").textContent==="正解","correct path failed");
    let stored=JSON.parse(localStorage.getItem("shoro-test-state-v1")),profile=stored.profiles.find(item=>item.id===stored.activeProfileId);
    assert(profile.activeSession.answers.length===1,"double finish committed twice");evidence.correct=profile.activeSession.answers[0];

    await qa.preview("reaction-signal-v1",4300);button=document.querySelector("#challenge .signal-button");button.click();
    assert(document.querySelector("#feedback-title").textContent==="残念","false start path failed");
    assert(document.querySelector("#feedback-detail").textContent.includes("フライング"),"false start detail missing");

    await qa.preview("reaction-signal-v1",4300);await wait(()=>document.querySelector("#feedback-detail")?.textContent.includes("合図は帰りました"),5200);
    assert(document.querySelector("#feedback-title").textContent==="残念","timeout path failed");

    await qa.preview("reaction-signal-v1",4300);qa.home();await sleep(2400);
    const disposed=qa.runtime();evidence.disposed=disposed;
    assert(disposed?.disposed&&disposed.aborted&&disposed.timeouts===0&&disposed.frames===0&&disposed.listeners===0,"home disposal leaked lifetime work");
    assert(document.querySelector("#home-view").hidden===false,"home did not render after disposal");

    const oldTask={templateId:"reaction-signal-v1",introducedIn:"1.0",tier:1,flavor:"classic",step:1,family:"reaction-signal",category:"reaction",kind:"signal",prompt:"合図が出たら、すぐタップ",help:"フライングは不正解です。",delay:900,duration:4300};
    stored=JSON.parse(localStorage.getItem("shoro-test-state-v1"));profile=stored.profiles.find(item=>item.id===stored.activeProfileId);profile.activeSession={id:"qa-resume",startedAt:Date.now(),contentPack:"1.12",paceMode:"standard",tasks:[oldTask],currentIndex:0,answers:[],earnedXp:0};stored.updatedAt=Date.now();localStorage.setItem("shoro-test-state-v1",JSON.stringify(stored));
    sessionStorage.setItem("reactionQaStage","resume");sessionStorage.setItem("reactionQaEvidence",JSON.stringify(saved));location.reload();
  }catch(error){failures.push(error.stack||String(error));finish()}
}
