const defaultViewport = host => {
  const rect=host?.getBoundingClientRect?.()||{width:0,height:0};
  return{width:rect.width,height:rect.height,dpr:globalThis.devicePixelRatio||1};
};

export function createGameRuntime({host,onFinish,timerBar=null,reducedMotion,viewport,qa=null}={}){
  if(!host||typeof onFinish!=="function")throw new TypeError("host and onFinish are required");
  const controller=new AbortController(),timeouts=new Set(),frames=new Set(),listeners=new Set();
  let disposed=false,finished=false,deadline=null,deadlineFrame=null,finishCalls=0,commits=0;

  const cancelTimeout=id=>{if(id!=null){clearTimeout(id);timeouts.delete(id)}};
  const cancelFrame=id=>{if(id!=null){cancelAnimationFrame(id);frames.delete(id)}};
  const scheduleFrame=fn=>{
    if(disposed)return null;
    let id=null;
    id=requestAnimationFrame(time=>{frames.delete(id);if(!disposed)fn(time)});
    frames.add(id);return id;
  };
  const clearDeadline=()=>{
    cancelTimeout(deadline);deadline=null;
    cancelFrame(deadlineFrame);deadlineFrame=null;
  };
  const dispose=()=>{
    if(disposed)return;
    disposed=true;clearDeadline();
    timeouts.forEach(clearTimeout);timeouts.clear();
    frames.forEach(cancelAnimationFrame);frames.clear();
    // Abort while signal listeners are still attached so modules get exactly one
    // synchronous disposal callback. The disposed flag already makes every
    // context scheduling/finish primitive inert during that callback.
    controller.abort();
    listeners.forEach(remove=>remove());listeners.clear();
  };
  const finish=(correct,result={})=>{
    finishCalls++;
    if(disposed||finished)return false;
    finished=true;commits++;dispose();onFinish(Boolean(correct),result);return true;
  };
  const later=(fn,ms)=>{
    if(disposed)return null;
    let id=null;
    id=setTimeout(()=>{timeouts.delete(id);if(!disposed)fn()},Math.max(0,Number(ms)||0));
    timeouts.add(id);return id;
  };
  const frame=fn=>{
    if(typeof fn!=="function")throw new TypeError("frame callback required");
    let stopped=false,id=null;
    const tick=time=>{id=null;if(disposed||stopped)return;if(fn(time)!==false)id=scheduleFrame(tick)};
    id=scheduleFrame(tick);
    return()=>{stopped=true;cancelFrame(id)};
  };
  const listen=(target,type,fn,options)=>{
    if(disposed)return()=>{};
    if(!target?.addEventListener)throw new TypeError("event target required");
    target.addEventListener(type,fn,options);
    const remove=()=>{target.removeEventListener(type,fn,options);listeners.delete(remove)};
    listeners.add(remove);return remove;
  };
  const setDeadline=(ms,fn)=>{
    if(disposed)return null;
    clearDeadline();
    const duration=Math.max(0,Number(ms)||0),started=performance.now();
    if(timerBar){
      timerBar.style.width="100%";
      const paint=now=>{const left=Math.max(0,1-(now-started)/Math.max(1,duration));timerBar.style.width=`${left*100}%`;if(left>0&&!disposed&&!finished)deadlineFrame=scheduleFrame(paint)};
      deadlineFrame=scheduleFrame(paint);
    }
    deadline=setTimeout(()=>{timeouts.delete(deadline);deadline=null;if(!disposed&&!finished)fn()},duration);
    timeouts.add(deadline);return deadline;
  };
  const context={
    host,signal:controller.signal,finish,setDeadline,later,frame,listen,
    reducedMotion:reducedMotion??Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
    viewport:viewport||defaultViewport(host),qa
  };
  return{
    context,dispose,
    inspect:()=>({disposed,finished,finishCalls,commits,timeouts:timeouts.size,frames:frames.size,listeners:listeners.size,aborted:controller.signal.aborted})
  };
}
