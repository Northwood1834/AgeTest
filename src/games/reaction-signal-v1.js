const RESPONSE_WINDOW=1500;
const metadata={
  id:"reaction-signal-v1",
  introducedIn:"1.0",
  tier:1,
  flavor:"classic",
  step:1,
  family:"reaction-signal",
  category:"reaction"
};

export default {
  metadata,

  generate({randomInt}){
    return{
      kind:"signal",
      prompt:"合図が出たら、すぐタップ",
      help:"フライングは不正解です。",
      delay:randomInt(900,2200),
      duration:4300
    };
  },

  validate(task){
    const issues=[];
    if(task?.kind!=="signal")issues.push("kind must be signal");
    if(task?.prompt!=="合図が出たら、すぐタップ")issues.push("prompt changed");
    if(task?.help!=="フライングは不正解です。")issues.push("help changed");
    if(!Number.isInteger(task?.delay)||task.delay<900||task.delay>2200)issues.push("delay must be an integer from 900 to 2200ms");
    if(task?.duration!==4300)issues.push("duration must remain 4300ms");
    if(task?.responseWindow!==undefined&&task.responseWindow!==RESPONSE_WINDOW)issues.push("response window must remain 1500ms when present");
    if(Number.isFinite(task?.delay)&&task.delay+RESPONSE_WINDOW>task.duration)issues.push("response window exceeds deadline");
    return issues;
  },

  render(task,context){
    const button=context.host.ownerDocument.createElement("button");
    button.type="button";
    button.className="signal-button";
    button.textContent="まだ…";
    button.setAttribute("aria-label","合図待ち。いま、と表示されたら押す");
    context.host.append(button);
    button.focus({preventScroll:true});

    let goAt=0;
    const respond=()=>{
      if(!goAt){
        context.finish(false,{detail:"フライングです。若さが暴走しました。"});
        return;
      }
      const responseWindow=task.responseWindow??RESPONSE_WINDOW,ms=performance.now()-goAt,correct=ms<=responseWindow;
      context.finish(correct,{
        reactionMs:Math.round(ms),
        quality:Math.max(0,Math.min(1,1-(ms-180)/responseWindow)),
        detail:correct?`${Math.round(ms)} ms`:`${Math.round(ms)} ms。少し遅かったようです。`
      });
    };
    context.listen(button,"click",respond);
    context.later(()=>{
      goAt=performance.now();
      button.textContent="いま！";
      button.setAttribute("aria-label","いま押す");
      button.classList.add("go");
    },task.delay);
    context.setDeadline(task.duration,()=>context.finish(false,{detail:"合図は帰りました。"}));
  }
};
