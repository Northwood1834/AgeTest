const RUN_LANES=Object.freeze([-5.6,0,5.6]);
const RUN_THEMES=Object.freeze([
  Object.freeze({key:"dawn",sky:["#12203F","#3E5C8C","#F0A26B"],sun:"#FFD9A0",sunY:.74,hills:["#2C3F63","#3B5273"],grass:["#3F6B49","#345C3E"],road:["#8E7A63","#7A6853"],line:"#F3E5C5",fog:"#C79A78"}),
  Object.freeze({key:"noon",sky:["#2E6FB7","#5C9BD8","#BFE0F2"],sun:"#FFF3C4",sunY:.3,hills:["#4E7A5C","#5E8B68"],grass:["#5C8F45","#4E7C3B"],road:["#B79E77","#A48C68"],line:"#FFF8E0",fog:"#CFE4F2"}),
  Object.freeze({key:"dusk",sky:["#241436","#5B2F63","#E2734F"],sun:"#FFC178",sunY:.8,hills:["#3A2450","#4A2F5E"],grass:["#4A5A46","#3D4C3B"],road:["#8A7768","#75645A"],line:"#F6E3C8",fog:"#B57A6C"})
]);
const PROMPT="走るコースをタップで切り抜けて";
const HELP="左右ボタンで位置、画面タップでジャンプ。穴と木箱は跳ぶ。岩と赤いTNTは跳ばずによける。";
const DURATION=45000;
const SPEED=36;
const metadata=Object.freeze({id:"spatial-lane-run-v1",introducedIn:"1.2",tier:2,flavor:"wild",step:1,family:"spatial-lane-run",category:"spatial"});
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function generate({random,randomInt,pick,shuffle}={}){
  if(typeof random!=="function"||typeof randomInt!=="function"||typeof pick!=="function"||typeof shuffle!=="function")throw new TypeError(`${metadata.id}: random, randomInt, pick, and shuffle are required`);
  const theme=pick(RUN_THEMES),obstacles=[];
  const groups=shuffle(["wall","trench","crates","gauntlet","trench","wall","crates","gauntlet"]).slice(0,randomInt(6,8));
  if(!groups.includes("trench"))groups[randomInt(0,groups.length-1)]="trench";
  if(!groups.includes("wall"))groups[0]="wall";
  const authorAt=new Set(shuffle(groups.map((group,index)=>index)).slice(0,randomInt(1,2)));
  let z=150;
  groups.forEach((group,index)=>{
    if(group==="wall")shuffle([0,1,2]).slice(0,2).forEach(lane=>obstacles.push({type:"rock",lane,z,seed:random()}));
    else if(group==="trench")[0,1,2].forEach(lane=>obstacles.push({type:"pit",lane,z}));
    else if(group==="crates"){
      const lanes=shuffle([0,1,2]),free=lanes[0],tnt=random()<.62?lanes[1]:-1;
      [0,1,2].forEach(lane=>{if(lane!==free)obstacles.push({type:lane===tnt?"tnt":"crate",lane,z})});
    }else{
      const lanes=shuffle([0,1,2]),rock=lanes[0],second=lanes[1],free=lanes[2];
      obstacles.push({type:"rock",lane:rock,z,seed:random()});
      obstacles.push({type:random()<.4?"tnt":"pit",lane:second,z});
      if(random()<.4)obstacles.push({type:"crate",lane:free,z});
    }
    z+=randomInt(58,78);
    if(authorAt.has(index)){obstacles.push({type:"author",lane:1,z:z-randomInt(26,34),phase:random()*6.28,sweep:random()<.5?1:-1});z+=randomInt(14,24)}
  });
  const scenery=[];
  for(let sz=40;sz<z+80;sz+=randomInt(14,30))scenery.push({z:sz,side:random()<.5?-1:1,offset:randomInt(13,26),kind:pick(["tree","tree","bush","stone"]),seed:random()});
  return{kind:"laneRun",prompt:PROMPT,help:HELP,theme:theme.key,obstacles,scenery,stageLength:z+70,speed:SPEED,duration:DURATION};
}

const finite=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="laneRun")issues.push("kind must remain laneRun");
  if(task.prompt!==PROMPT)issues.push("prompt changed");
  if(task.help!==HELP)issues.push("help changed");
  if(!RUN_THEMES.some(theme=>theme.key===task.theme))issues.push("theme must be dawn, noon, or dusk");
  if(task.speed!==SPEED)issues.push(`speed must remain ${SPEED}`);
  if(task.duration!==DURATION)issues.push(`duration must remain ${DURATION}ms`);
  if(!Number.isInteger(task.stageLength)||task.stageLength<500||task.stageLength>1000)issues.push("stageLength is out of range");
  const obstacles=Array.isArray(task.obstacles)?task.obstacles:[];
  if(!Array.isArray(task.obstacles)||obstacles.length<13||obstacles.length>30)issues.push("obstacles must contain a complete course");
  let previousZ=-Infinity;
  obstacles.forEach((item,index)=>{
    if(!item||typeof item!=="object"||!["rock","pit","crate","tnt","author"].includes(item.type)){issues.push(`obstacle ${index} has an invalid type`);return}
    if(!Number.isInteger(item.lane)||item.lane<0||item.lane>2)issues.push(`obstacle ${index} has an invalid lane`);
    if(!Number.isInteger(item.z)||item.z<100||item.z>=task.stageLength)issues.push(`obstacle ${index} has an invalid distance`);
    if(Number.isFinite(item.z)&&item.z<previousZ)issues.push("obstacles must remain ordered");previousZ=Math.max(previousZ,Number(item.z)||-Infinity);
    if(item.type==="rock"&&!finite(item.seed,0,1))issues.push(`rock ${index} has an invalid seed`);
    if(item.type==="author"&&(!finite(item.phase,0,6.28)||![1,-1].includes(item.sweep)))issues.push(`author ${index} has invalid motion`);
  });
  for(const required of["rock","pit","author"])if(!obstacles.some(item=>item?.type===required))issues.push(`${required} obstacle is required`);
  const clusters=new Map();obstacles.filter(item=>item?.type!=="author"&&Number.isFinite(item?.z)).forEach(item=>{const row=clusters.get(item.z)||[];row.push(item);clusters.set(item.z,row)});
  clusters.forEach((row,z)=>{if(new Set(row.map(item=>item.lane)).size!==row.length)issues.push(`distance ${z} repeats a lane`);if(![0,1,2].some(lane=>!row.some(item=>item.lane===lane)||row.find(item=>item.lane===lane)?.type==="pit"||row.find(item=>item.lane===lane)?.type==="crate"))issues.push(`distance ${z} has no causal route`)});
  const scenery=Array.isArray(task.scenery)?task.scenery:[];
  if(!Array.isArray(task.scenery)||!scenery.length)issues.push("scenery must be a non-empty array");
  previousZ=-Infinity;scenery.forEach((item,index)=>{if(!Number.isInteger(item?.z)||item.z<40||item.z>task.stageLength+80||item.z<=previousZ)issues.push(`scenery ${index} has an invalid distance`);previousZ=item?.z??previousZ;if(![-1,1].includes(item?.side)||!Number.isInteger(item?.offset)||item.offset<13||item.offset>26||!["tree","bush","stone"].includes(item?.kind)||!finite(item?.seed,0,1))issues.push(`scenery ${index} is invalid`)});
  if(obstacles.length&&Number.isInteger(task.stageLength)&&task.stageLength-Math.max(...obstacles.map(item=>item.z))<40)issues.push("goal must remain beyond the final obstacle");
  return[...new Set(issues)];
}

const STYLE=`
.run-stage{box-sizing:border-box;width:100%;max-width:430px;margin-inline:auto;display:grid;gap:.55rem;contain:layout paint;color:#392f40}.run-stage:focus-visible{outline:3px solid #6b4384;outline-offset:3px;border-radius:1rem}.run-canvas{box-sizing:border-box;width:100%;display:block;border-radius:1rem;border:1px solid rgba(255,255,255,.5);box-shadow:0 10px 26px rgba(49,30,58,.28),inset 0 0 0 1px rgba(0,0,0,.12);background:#1B1430;touch-action:manipulation}.run-stage.crashed .run-canvas{animation:run-crash .42s cubic-bezier(.36,.07,.19,.97) 2}.run-pad{display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:.45rem}.run-key{box-sizing:border-box;min-width:0;min-height:3.2rem;border:1.5px solid #d8cadf;border-radius:.9rem;background:#fff;color:#5c3674;font:900 1.1rem/1.15 system-ui,sans-serif;box-shadow:0 3px 10px rgba(49,30,58,.08);touch-action:manipulation}.run-key.wide{background:linear-gradient(135deg,#5c3674,#633C75);color:#fff;font-size:.95rem;border-color:transparent;box-shadow:0 5px 14px rgba(80,45,100,.32)}.run-key:focus-visible{outline:4px solid #6b4384;outline-offset:2px}.run-key:active{transform:translateY(2px);box-shadow:none}.run-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@keyframes run-crash{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}.run-stage[data-reduced=true] .run-canvas{animation:none}@media(prefers-reduced-motion:reduce){.run-canvas{animation:none!important}}
`;
function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView||globalThis,reduced=Boolean(context.reducedMotion),theme=RUN_THEMES.find(item=>item.key===task.theme)||RUN_THEMES[0];
  const CAM_Y=6.4,PLAYER_Z=11,ROAD=9.4;
  const style=documentRef.createElement("style");style.textContent=STYLE;
  const wrap=documentRef.createElement("section");wrap.className="run-stage";wrap.dataset.reduced=String(reduced);wrap.tabIndex=0;wrap.setAttribute("aria-label","三車線のコースを左右移動とジャンプで走るゲーム");
  const canvas=documentRef.createElement("canvas");canvas.className="run-canvas";canvas.setAttribute("role","img");canvas.setAttribute("aria-label","奥へ走るコース。タップでジャンプ");
  const pad=documentRef.createElement("div");pad.className="run-pad";
  const left=documentRef.createElement("button"),jump=documentRef.createElement("button"),right=documentRef.createElement("button"),buttons=[left,jump,right];
  [[left,"◀","左へ"],[jump,"ジャンプ","ジャンプ"],[right,"▶","右へ"]].forEach(([button,text,label])=>{button.type="button";button.className="run-key";button.textContent=text;button.setAttribute("aria-label",label)});
  jump.classList.add("wide");
  const status=documentRef.createElement("p");status.className="run-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.textContent="中央の車線を走っています";
  pad.append(left,jump,right);wrap.append(canvas,pad,status);context.host.replaceChildren(style,wrap);
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error(`${metadata.id}: 2D canvas is unavailable`);
  let W=0,H=0,HY=0,FOCAL=0,dpr=1;
  const resize=()=>{
    const measured=wrap.getBoundingClientRect?.().width||wrap.clientWidth||context.viewport?.width||320;
    dpr=clamp(Number(context.viewport?.dpr||view.devicePixelRatio||1),1,3);W=clamp(Math.round(measured),220,430);H=Math.round(W*.64);
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);HY=H*.44;FOCAL=W*.54;
  };
  const state={z:0,lane:1,x:RUN_LANES[1],y:0,vy:0,run:0,done:false,disposed:false,result:null,detail:"",crates:0,land:0,elapsed:0,frames:0,speed:reduced?Math.round(task.speed*.78):task.speed};
  const items=task.obstacles.map(item=>({...item,hit:false,x:RUN_LANES[item.lane]})),particles=[];
  let particleSeed=0x51a9e,stopFrame=null;
  const particleRandom=()=>((particleSeed=(Math.imul(particleSeed,1664525)+1013904223)>>>0)/0x100000000);
  const updatePressed=()=>{left.setAttribute("aria-pressed",String(state.lane===0));jump.setAttribute("aria-pressed",String(state.y>0));right.setAttribute("aria-pressed",String(state.lane===2))};
  const move=(step,focus=false)=>{if(state.done||state.disposed)return false;state.lane=clamp(state.lane+step,0,2);status.textContent=`${["左","中央","右"][state.lane]}の車線へ移動`;updatePressed();if(focus)(step<0?left:right).focus({preventScroll:true});return true};
  const doJump=(focus=false)=>{if(state.done||state.disposed||state.y>0)return false;state.vy=25;status.textContent="ジャンプ";updatePressed();if(focus)jump.focus({preventScroll:true});return true};
  const press=(button,run)=>{context.listen(button,"pointerdown",event=>{event.preventDefault();run(false)});context.listen(button,"click",event=>{if(event.detail===0)run(true)})};
  press(left,focus=>move(-1,focus));press(right,focus=>move(1,focus));press(jump,doJump);
  context.listen(canvas,"pointerdown",event=>{event.preventDefault();doJump()});
  context.listen(wrap,"keydown",event=>{if(event.key==="ArrowLeft"){event.preventDefault();move(-1,true)}else if(event.key==="ArrowRight"){event.preventDefault();move(1,true)}else if(event.key===" "||event.key==="Enter"){event.preventDefault();doJump(true)}});
  wrap.focus({preventScroll:true});
  let camX=0,camBob=0,roll=0,clock=0;
  const px=(x,z)=>W/2+(x-camX)*FOCAL/z;
  const py=(y,z)=>HY+(CAM_Y+camBob-y)*FOCAL/z;
  const scale=z=>FOCAL/z;
  const shade=(color,amount)=>{
    const n=parseInt(color.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,mix=v=>Math.round(clamp(amount<0?v*(1+amount):v+(255-v)*amount,0,255));
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  };
  const quad=(x1,y1,x2,y2,x3,y3,x4,y4,fill)=>{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.lineTo(x4,y4);ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();
  };
  const drawSky=()=>{
    const sky=ctx.createLinearGradient(0,0,0,HY+H*.06);
    sky.addColorStop(0,theme.sky[0]);sky.addColorStop(.62,theme.sky[1]);sky.addColorStop(1,theme.sky[2]);
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,HY+1);
    const sunX=W*.5+Math.sin(task.stageLength*.01)*W*.22,sunY=HY*theme.sunY,r=W*.055;
    const glow=ctx.createRadialGradient(sunX,sunY,r*.3,sunX,sunY,r*5);
    glow.addColorStop(0,`${theme.sun}cc`);glow.addColorStop(.35,`${theme.sun}33`);glow.addColorStop(1,"#00000000");
    ctx.fillStyle=glow;ctx.fillRect(0,0,W,HY+1);
    ctx.fillStyle=theme.sun;ctx.beginPath();ctx.arc(sunX,sunY,r,0,Math.PI*2);ctx.fill();
    for(let i=0;i<5;i++){
      const cx=((i*.27+.08+state.z*.0004)%1.25-.12)*W,cy=HY*(.16+(i%3)*.16),cw=W*(.07+(i%2)*.035);
      ctx.globalAlpha=.16+(i%2)*.1;
      const puff=ctx.createRadialGradient(cx,cy,cw*.15,cx,cy,cw*1.5);
      puff.addColorStop(0,"#ffffff");puff.addColorStop(1,"#ffffff00");
      ctx.fillStyle=puff;
      [[0,0,1],[cw*.75,cw*.12,.8],[-cw*.7,cw*.16,.7]].forEach(([dx,dy,k])=>{
        ctx.beginPath();ctx.ellipse(cx+dx,cy+dy,cw*k,cw*k*.42,0,0,Math.PI*2);ctx.fill();
      });
    }
    ctx.globalAlpha=1;
  };
  const drawHills=()=>{
    [0,1].forEach(layer=>{
      const height=HY*(layer?.2:.3),drift=state.z*(layer?.02:.012);
      ctx.fillStyle=theme.hills[layer];ctx.beginPath();ctx.moveTo(0,HY+1);
      for(let i=0;i<=14;i++){
        const t=i/14,x=t*W;
        const h=height*(.45+.55*Math.abs(Math.sin(t*4.7+layer*2.1+drift*.05)));
        ctx.lineTo(x,HY+1-h);
      }
      ctx.lineTo(W,HY+1);ctx.closePath();ctx.fill();
    });
  };
  const drawGround=()=>{
    const grass=ctx.createLinearGradient(0,HY,0,H);
    grass.addColorStop(0,shade(theme.grass[0],.16));grass.addColorStop(.35,theme.grass[0]);grass.addColorStop(1,shade(theme.grass[1],-.12));
    ctx.fillStyle=grass;ctx.fillRect(0,HY,W,H-HY);
    const rows=[];
    for(let y=H;y>HY+1;y-=Math.max(3,(y-HY)*.16))rows.push(y);
    rows.push(HY+1.2);
    for(let i=0;i<rows.length-1;i++){
      const yn=rows[i],yf=rows[i+1];
      const zn=FOCAL*(CAM_Y+camBob)/(yn-HY),zf=FOCAL*(CAM_Y+camBob)/(yf-HY);
      const band=Math.floor((zf+state.z)/16)%2;
      const halfN=ROAD*scale(zn),halfF=ROAD*scale(zf),cN=px(0,zn),cF=px(0,zf);
      quad(cF-halfF,yf,cF+halfF,yf,cN+halfN,yn,cN-halfN,yn,band?theme.road[0]:shade(theme.road[0],-.05));
      quad(cF-halfF*1.09,yf,cF-halfF,yf,cN-halfN,yn,cN-halfN*1.09,yn,band?shade(theme.grass[1],-.26):shade(theme.grass[1],-.16));
      quad(cF+halfF,yf,cF+halfF*1.09,yf,cN+halfN*1.09,yn,cN+halfN,yn,band?shade(theme.grass[1],-.26):shade(theme.grass[1],-.16));
      if(Math.floor((zf+state.z)/7)%2===0){
        [-2.8,2.8].forEach(offset=>{
          const wN=.16*scale(zn),wF=.16*scale(zf);
          quad(px(offset,zf)-wF,yf,px(offset,zf)+wF,yf,px(offset,zn)+wN,yn,px(offset,zn)-wN,yn,theme.line);
        });
      }
    }
  };
  const drawScenery=()=>{
    (task.scenery||[]).forEach(item=>{
      const z=item.z-state.z;if(z<6||z>340)return;
      const s=scale(z),x=item.side*item.offset,baseY=py(0,z),baseX=px(x,z);
      ctx.globalAlpha=clamp((340-z)/120,0,1);
      if(item.kind==="tree"){
        const h=s*(13+item.seed*7),trunk=s*(.9+item.seed*.4);
        ctx.fillStyle="rgba(18,12,22,.22)";ctx.beginPath();ctx.ellipse(baseX,baseY,trunk*2.4,trunk*.8,0,0,Math.PI*2);ctx.fill();
        const bark=ctx.createLinearGradient(baseX-trunk,0,baseX+trunk,0);
        bark.addColorStop(0,"#4A3524");bark.addColorStop(.5,"#6B4E33");bark.addColorStop(1,"#3B2A1C");
        ctx.fillStyle=bark;ctx.fillRect(baseX-trunk/2,baseY-h*.52,trunk,h*.52);
        [[0,-h*.62,s*3.2],[-s*1.7,-h*.5,s*2.3],[s*1.6,-h*.46,s*2.1]].forEach(([dx,dy,r],i)=>{
          const crown=ctx.createRadialGradient(baseX+dx-r*.35,baseY+dy-r*.4,r*.15,baseX+dx,baseY+dy,r);
          crown.addColorStop(0,shade(theme.grass[0],.34-i*.06));crown.addColorStop(1,shade(theme.grass[1],-.3));
          ctx.fillStyle=crown;ctx.beginPath();ctx.ellipse(baseX+dx,baseY+dy,r,r*.86,0,0,Math.PI*2);ctx.fill();
        });
      }else if(item.kind==="bush"){
        ctx.fillStyle="rgba(18,12,22,.18)";ctx.beginPath();ctx.ellipse(baseX,baseY,s*2.4,s*.7,0,0,Math.PI*2);ctx.fill();
        [[0,0,s*2],[-s*1.4,s*.3,s*1.4],[s*1.3,s*.35,s*1.3]].forEach(([dx,dy,r])=>{
          const bush=ctx.createRadialGradient(baseX+dx-r*.3,baseY+dy-r*1.2,r*.1,baseX+dx,baseY+dy-r*.6,r);
          bush.addColorStop(0,shade(theme.grass[0],.18));bush.addColorStop(1,shade(theme.grass[1],-.24));
          ctx.fillStyle=bush;ctx.beginPath();ctx.ellipse(baseX+dx,baseY+dy-r*.55,r,r*.75,0,0,Math.PI*2);ctx.fill();
        });
      }else{
        ctx.fillStyle="rgba(18,12,22,.2)";ctx.beginPath();ctx.ellipse(baseX,baseY,s*1.5,s*.5,0,0,Math.PI*2);ctx.fill();
        const stone=ctx.createLinearGradient(baseX-s,baseY-s*1.6,baseX+s,baseY);
        stone.addColorStop(0,"#A9A3B4");stone.addColorStop(1,"#5F5A6D");
        ctx.fillStyle=stone;ctx.beginPath();ctx.ellipse(baseX,baseY-s*.7,s*1.3,s*.95,0,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    });
  };
  const drawPit=(item,z)=>{
    const s=scale(z),cx=px(item.x,z),cy=py(0,z),rx=3.1*s,ry=1.05*s;
    ctx.fillStyle="rgba(20,14,24,.55)";ctx.beginPath();ctx.ellipse(cx,cy+ry*.35,rx*1.05,ry*1.15,0,0,Math.PI*2);ctx.fill();
    const hole=ctx.createRadialGradient(cx,cy-ry*.25,ry*.2,cx,cy,rx);
    hole.addColorStop(0,"#000000");hole.addColorStop(.62,"#140F1C");hole.addColorStop(1,"#2A2033");
    ctx.fillStyle=hole;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=shade(theme.road[0],-.35);ctx.lineWidth=Math.max(1,s*.12);
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,Math.PI*.05,Math.PI*.95);ctx.stroke();
    ctx.strokeStyle=shade(theme.road[0],.22);
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  };
  const drawCrate=(item,z)=>{
    const s=scale(z),size=4.4,half=size/2*s,h=size*s;
    const zBack=z+size*.9,sBack=scale(zBack);
    const fx=px(item.x,z),fy=py(0,z),bx=px(item.x,zBack),by=py(0,zBack),hb=size/2*sBack,hh=size*sBack;
    ctx.fillStyle="rgba(20,14,24,.34)";ctx.beginPath();ctx.ellipse(fx,fy,half*1.15,half*.4,0,0,Math.PI*2);ctx.fill();
    quad(bx-hb,by-hh,bx+hb,by-hh,fx+half,fy-h,fx-half,fy-h,"#B98246");            // top
    quad(bx+hb,by-hh,bx+hb,by,fx+half,fy,fx+half,fy-h,"#7E5327");                 // side
    const wood=ctx.createLinearGradient(fx-half,fy-h,fx+half,fy);
    wood.addColorStop(0,"#D69B55");wood.addColorStop(.5,"#C08541");wood.addColorStop(1,"#9C6A31");
    ctx.fillStyle=wood;ctx.fillRect(fx-half,fy-h,half*2,h);
    ctx.strokeStyle="#5E3D1B";ctx.lineWidth=Math.max(1,s*.16);ctx.strokeRect(fx-half,fy-h,half*2,h);
    ctx.beginPath();ctx.moveTo(fx-half,fy-h);ctx.lineTo(fx+half,fy);ctx.moveTo(fx+half,fy-h);ctx.lineTo(fx-half,fy);ctx.stroke();
    ctx.fillStyle="#6E5A3E";
    [fy-h,fy-s*.4].forEach(y=>ctx.fillRect(fx-half,y,half*2,Math.max(1,s*.28)));
  };
  const drawTnt=(item,z)=>{
    const s=scale(z),cx=px(item.x,z),cy=py(0,z),half=2.2*s,h=4.4*s;
    ctx.fillStyle="rgba(20,14,24,.34)";ctx.beginPath();ctx.ellipse(cx,cy,half*1.15,half*.4,0,0,Math.PI*2);ctx.fill();
    const zBack=z+4,sBack=scale(zBack),bx=px(item.x,zBack),by=py(0,zBack),hb=2.2*sBack,hh=4.4*sBack;
    quad(bx-hb,by-hh,bx+hb,by-hh,cx+half,cy-h,cx-half,cy-h,"#8E2130");
    quad(bx+hb,by-hh,bx+hb,by,cx+half,cy,cx+half,cy-h,"#6A1523");
    const body=ctx.createLinearGradient(cx-half,cy-h,cx+half,cy);
    body.addColorStop(0,"#E5573F");body.addColorStop(.5,"#C93327");body.addColorStop(1,"#8E1D1C");
    ctx.fillStyle=body;ctx.fillRect(cx-half,cy-h,half*2,h);
    ctx.fillStyle="#2A1620";ctx.fillRect(cx-half,cy-h*.62,half*2,Math.max(1,s*.34));
    ctx.fillRect(cx-half,cy-h*.18,half*2,Math.max(1,s*.34));
    ctx.strokeStyle="#5C1018";ctx.lineWidth=Math.max(1,s*.16);ctx.strokeRect(cx-half,cy-h,half*2,h);
    ctx.fillStyle="#F7E5A8";ctx.font=`800 ${Math.max(7,s*1.5)}px "Hiragino Maru Gothic ProN",sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("TNT",cx,cy-h*.42);ctx.textAlign="left";
    ctx.strokeStyle="#3B2A1C";ctx.lineWidth=Math.max(1,s*.2);
    ctx.beginPath();ctx.moveTo(cx,cy-h);ctx.quadraticCurveTo(cx+s*.9,cy-h-s*1.1,cx+s*.3,cy-h-s*1.9);ctx.stroke();
    const spark=.6+Math.abs(Math.sin(clock*9))*.6;
    const glow=ctx.createRadialGradient(cx+s*.3,cy-h-s*1.9,0,cx+s*.3,cy-h-s*1.9,s*spark);
    glow.addColorStop(0,"#FFF3C4");glow.addColorStop(.5,"#FFA33C");glow.addColorStop(1,"#FF6A0000");
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx+s*.3,cy-h-s*1.9,s*spark,0,Math.PI*2);ctx.fill();
  };
  const drawRock=(item,z)=>{
    const s=scale(z),cx=px(item.x,z),cy=py(0,z),w=3*s,h=5.4*s,seed=item.seed||.5;
    ctx.fillStyle="rgba(20,14,24,.36)";ctx.beginPath();ctx.ellipse(cx,cy,w*1.12,w*.4,0,0,Math.PI*2);ctx.fill();
    const body=ctx.createLinearGradient(cx-w,cy-h,cx+w,cy);
    body.addColorStop(0,"#A9A3B4");body.addColorStop(.45,"#847E93");body.addColorStop(1,"#5C566B");
    ctx.fillStyle=body;ctx.beginPath();
    ctx.moveTo(cx-w,cy);
    ctx.lineTo(cx-w*(.72+seed*.15),cy-h*.55);
    ctx.lineTo(cx-w*.28,cy-h*(.92+seed*.06));
    ctx.lineTo(cx+w*.35,cy-h*.86);
    ctx.lineTo(cx+w*(.84-seed*.1),cy-h*.42);
    ctx.lineTo(cx+w,cy);
    ctx.closePath();ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.16)";ctx.beginPath();
    ctx.moveTo(cx-w*.28,cy-h*(.92+seed*.06));ctx.lineTo(cx+w*.35,cy-h*.86);ctx.lineTo(cx+w*.1,cy-h*.5);ctx.lineTo(cx-w*.5,cy-h*.52);
    ctx.closePath();ctx.fill();
    ctx.fillStyle=shade(theme.grass[0],-.1);
    ctx.beginPath();ctx.ellipse(cx-w*.35,cy-h*.1,w*.45,h*.09,0,0,Math.PI*2);ctx.fill();
  };
  const drawAuthor=(item,z)=>{
    const s=scale(z),cx=px(item.x,z),cy=py(0,z),u=s*.42;
    ctx.fillStyle="rgba(20,14,24,.34)";ctx.beginPath();ctx.ellipse(cx,cy,u*2.4,u*.75,0,0,Math.PI*2);ctx.fill();
    const wave=Math.sin(clock*7)*.5;
    ctx.fillStyle="#2B2434";
    [-1,1].forEach(side=>{ctx.beginPath();ctx.ellipse(cx+side*u*1.5,cy-u*.6,u*.55,u*.75,side*.3,0,Math.PI*2);ctx.fill()});   // legs
    ctx.beginPath();ctx.ellipse(cx-u*2.1,cy-u*3.2-wave*u,u*.55,u*.85,-.5-wave,0,Math.PI*2);ctx.fill();                       // waving arm
    ctx.beginPath();ctx.ellipse(cx+u*2.1,cy-u*2.9,u*.55,u*.8,.4,0,Math.PI*2);ctx.fill();
    const body=ctx.createLinearGradient(cx-u*2,cy-u*4,cx+u*2,cy);
    body.addColorStop(0,"#FFFFFF");body.addColorStop(1,"#D9D2E2");
    ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(cx,cy-u*2.3,u*1.9,u*2.1,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#241C2E";
    [-1,1].forEach(side=>{ctx.beginPath();ctx.arc(cx+side*u*2,cy-u*6.4,u*.75,0,Math.PI*2);ctx.fill()});                       // ears
    const head=ctx.createRadialGradient(cx-u*.8,cy-u*6,u*.4,cx,cy-u*5,u*3);
    head.addColorStop(0,"#FFFFFF");head.addColorStop(1,"#DCD4E6");
    ctx.fillStyle=head;ctx.beginPath();ctx.ellipse(cx,cy-u*5,u*2.5,u*2.2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#241C2E";
    [-1,1].forEach(side=>{ctx.beginPath();ctx.ellipse(cx+side*u*1.05,cy-u*5.3,u*.75,u*.85,side*.25,0,Math.PI*2);ctx.fill()}); // eye patches
    ctx.strokeStyle="#A66DC2";ctx.lineWidth=Math.max(1,u*.28);
    [-1,1].forEach(side=>{ctx.beginPath();ctx.arc(cx+side*u*1.05,cy-u*5.3,u*.95,0,Math.PI*2);ctx.stroke()});
    ctx.beginPath();ctx.moveTo(cx-u*.15,cy-u*5.3);ctx.lineTo(cx+u*.15,cy-u*5.3);ctx.stroke();
    ctx.fillStyle="#FFFFFF";[-1,1].forEach(side=>{ctx.beginPath();ctx.arc(cx+side*u*1.05-u*.2,cy-u*5.5,u*.26,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle="#241C2E";ctx.beginPath();ctx.ellipse(cx,cy-u*4.1,u*.42,u*.32,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#241C2E";ctx.lineWidth=Math.max(1,u*.2);
    ctx.beginPath();ctx.arc(cx,cy-u*3.9,u*.6,.2*Math.PI,.8*Math.PI);ctx.stroke();
  };
  const drawHero=()=>{
    const z=PLAYER_Z,s=scale(z),cx=px(state.x,z),ground=py(0,z),cy=py(state.y,z),u=s*.46;
    const airborne=state.y>.05,phase=state.run,swing=Math.sin(phase)*(airborne?.25:1),squash=state.land>0?1+state.land*.32:1;
    const shadow=clamp(1-state.y/6,.25,1);
    ctx.fillStyle=`rgba(18,12,22,${.36*shadow})`;
    ctx.beginPath();ctx.ellipse(cx,ground,u*2.5*shadow,u*.8*shadow,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(roll*.6);ctx.scale(squash,1/squash);
    const fur=ctx.createLinearGradient(-u*2.2,-u*6,u*2.2,0);
    fur.addColorStop(0,"#B4611F");fur.addColorStop(.42,"#D9803C");fur.addColorStop(1,"#9C531E");
    // legs, alternating behind the body
    [[-1,swing],[1,-swing]].forEach(([side,offset])=>{
      const lift=airborne?(side>0?1.15:.35):Math.max(0,offset)*1.35;
      ctx.fillStyle="#A85A27";
      ctx.beginPath();ctx.ellipse(side*u*.95,-u*(.8+lift*.45),u*.62,u*(1.05+lift*.18),side*offset*.3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#4E2C13";
      ctx.beginPath();ctx.ellipse(side*u*.95,-u*(.25+lift*.5),u*.66,u*.4,side*offset*.25,0,Math.PI*2);ctx.fill();
    });
    // tail sweeping behind
    const tailAngle=.35+Math.sin(phase*.5)*.28;
    const tail=ctx.createLinearGradient(0,-u*5,0,-u*2);
    tail.addColorStop(0,"#F3E1C4");tail.addColorStop(.45,"#C86F2C");tail.addColorStop(1,"#A85A27");
    ctx.fillStyle=tail;ctx.save();ctx.translate(u*.2,-u*3.1);ctx.rotate(tailAngle);
    ctx.beginPath();ctx.ellipse(0,-u*1.5,u*.85,u*2.3,0,0,Math.PI*2);ctx.fill();ctx.restore();
    // torso seen from behind
    ctx.fillStyle=fur;ctx.beginPath();ctx.ellipse(0,-u*3.1,u*1.95,u*2.35,0,0,Math.PI*2);ctx.fill();
    const spine=ctx.createLinearGradient(0,-u*5.2,0,-u*1.4);
    spine.addColorStop(0,"rgba(255,225,180,.42)");spine.addColorStop(1,"rgba(120,60,20,.18)");
    ctx.fillStyle=spine;ctx.beginPath();ctx.ellipse(-u*.15,-u*3.3,u*.9,u*1.9,0,0,Math.PI*2);ctx.fill();
    // arms swinging at the sides
    [[-1,-swing],[1,swing]].forEach(([side,offset])=>{
      ctx.fillStyle="#C06A26";
      ctx.beginPath();ctx.ellipse(side*u*2,-u*(3.3+offset*.6),u*.58,u*1.2,side*(-.3+offset*.45),0,Math.PI*2);ctx.fill();
    });
    // head from behind, with ears
    ctx.fillStyle="#B4611F";
    [-1,1].forEach(side=>{
      ctx.beginPath();
      ctx.moveTo(side*u*1.55,-u*6.5);ctx.lineTo(side*u*.75,-u*8.2);ctx.lineTo(side*u*.1,-u*6.4);
      ctx.closePath();ctx.fill();
    });
    ctx.fillStyle="#7C3E15";
    [-1,1].forEach(side=>{
      ctx.beginPath();
      ctx.moveTo(side*u*1.25,-u*6.6);ctx.lineTo(side*u*.8,-u*7.7);ctx.lineTo(side*u*.5,-u*6.5);
      ctx.closePath();ctx.fill();
    });
    const head=ctx.createRadialGradient(-u*.7,-u*6.2,u*.3,0,-u*5.6,u*2.4);
    head.addColorStop(0,"#E89347");head.addColorStop(1,"#A85A27");
    ctx.fillStyle=head;ctx.beginPath();ctx.ellipse(0,-u*5.7,u*2,u*1.8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="rgba(255,230,195,.3)";
    ctx.beginPath();ctx.ellipse(-u*.5,-u*6.2,u*.85,u*.5,-.3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  };
  const drawGoal=()=>{
    const z=task.stageLength-state.z;if(z<2||z>420)return;
    const s=scale(z),top=py(12,z),base=py(0,z),lx=px(-ROAD*1.05,z),rx=px(ROAD*1.05,z);
    ctx.fillStyle="#6B5470";ctx.fillRect(lx-s*.5,top,s,base-top);ctx.fillRect(rx-s*.5,top,s,base-top);
    const banner=ctx.createLinearGradient(lx,top,rx,top+s*3);
    banner.addColorStop(0,"#F0C24E");banner.addColorStop(.5,"#F7DE8F");banner.addColorStop(1,"#E0A93C");
    ctx.fillStyle=banner;
    ctx.beginPath();ctx.moveTo(lx,top);
    for(let i=0;i<=8;i++){const t=i/8;ctx.lineTo(lx+(rx-lx)*t,top+Math.sin(t*6+clock*3)*s*.25)}
    for(let i=8;i>=0;i--){const t=i/8;ctx.lineTo(lx+(rx-lx)*t,top+s*2.6+Math.sin(t*6+clock*3)*s*.25)}
    ctx.closePath();ctx.fill();
    ctx.fillStyle="#5A3B1C";ctx.font=`700 ${Math.max(8,s*1.5)}px "Hiragino Maru Gothic ProN",sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("GOAL",(lx+rx)/2,top+s*1.3);ctx.textAlign="left";
  };
  const drawFog=()=>{
    const fog=ctx.createLinearGradient(0,HY-H*.015,0,HY+H*.13);
    fog.addColorStop(0,`${theme.fog}b0`);fog.addColorStop(.45,`${theme.fog}55`);fog.addColorStop(1,`${theme.fog}00`);
    ctx.fillStyle=fog;ctx.fillRect(0,HY-H*.015,W,H*.15);
  };
  const burst=(x,z,color)=>{
    const count=reduced?4:14;for(let i=0;i<count;i++)particles.push({x,y:particleRandom()*3+1,z,vx:(particleRandom()-.5)*13,vy:particleRandom()*11+3,vz:(particleRandom()-.5)*9,life:1,color});
  };
  const drawParticles=dt=>{
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];
      p.life-=dt*1.5;if(p.life<=0){particles.splice(i,1);continue}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=34*dt;
      const z=p.z-state.z;if(z<2)continue;
      const s=scale(z);
      ctx.globalAlpha=clamp(p.life,0,1);ctx.fillStyle=p.color;
      ctx.fillRect(px(p.x,z)-s*.25,py(Math.max(p.y,0),z)-s*.25,Math.max(1,s*.5),Math.max(1,s*.5));
      ctx.globalAlpha=1;
    }
  };
  const drawHud=()=>{
    const progress=clamp(state.z/task.stageLength,0,1),barW=W-24,barH=Math.max(7,H*.038);
    ctx.fillStyle="rgba(22,16,30,.42)";
    ctx.beginPath();ctx.roundRect(12,10,barW,barH,barH/2);ctx.fill();
    const fill=ctx.createLinearGradient(12,0,12+barW,0);
    fill.addColorStop(0,"#F5D76E");fill.addColorStop(1,"#F0A26B");
    ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(12,10,Math.max(barH,barW*progress),barH,barH/2);ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.92)";
    ctx.font=`700 ${Math.max(10,H*.05)}px "Hiragino Maru Gothic ProN",sans-serif`;ctx.textBaseline="top";
    ctx.fillText(`木箱 ${state.crates}`,12,12+barH);
  };
  const drawOutcome=()=>{if(!state.result)return;const success=state.result==="success",timeout=state.result==="timeout",label=success?"GOAL!":timeout?"時間切れ":"失敗",reason=success?`木箱 ${state.crates}個`:state.detail.replace(/[。].*$/,"").slice(0,18);ctx.fillStyle=success?"rgba(45,126,77,.91)":"rgba(139,43,58,.91)";ctx.beginPath();ctx.roundRect(W*.24,H*.32,W*.52,H*.24,H*.06);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=Math.max(2,W*.008);ctx.stroke();ctx.fillStyle="#fff";ctx.font=`900 ${Math.round(W*.068)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(label,W/2,H*.4);ctx.font=`800 ${Math.round(W*.032)}px system-ui,sans-serif`;ctx.fillText(reason,W/2,H*.49);ctx.textAlign="left"};
  const paint=dt=>{
    ctx.clearRect(0,0,W,H);drawSky();drawHills();drawGround();drawFog();drawScenery();drawGoal();
    items.filter(item=>item.z-state.z>2&&item.z-state.z<400).sort((a,b)=>b.z-a.z).forEach(item=>{const z=item.z-state.z;if(item.type==="pit")drawPit(item,z);else if(item.type==="crate"&&!item.hit)drawCrate(item,z);else if(item.type==="tnt"&&!item.hit)drawTnt(item,z);else if(item.type==="rock")drawRock(item,z);else if(item.type==="author"&&!item.hit)drawAuthor(item,z)});
    drawHero();drawParticles(dt);drawHud();drawOutcome();
  };
  const stop=(won,detail,result=won?"success":"failure")=>{
    if(state.done||state.disposed)return false;state.done=true;state.result=result;state.detail=detail;status.textContent=detail;
    if(!won){wrap.classList.add("crashed");burst(state.x,state.z+PLAYER_Z,"#E8C766")}paint(0);
    context.later(()=>context.finish(won,{quality:won?clamp(.55+state.crates*.08-state.elapsed/task.duration*.25,0,1):0,detail}),reduced?120:won?460:560);return true;
  };
  const update=dt=>{
    if(state.done||state.disposed)return;
    state.elapsed+=dt*1000;clock+=dt;state.z+=state.speed*dt;
    const previousY=state.y;state.x+=clamp(RUN_LANES[state.lane]-state.x,-26*dt,26*dt);
    if(state.vy||state.y>0){state.vy-=62*dt;state.y+=state.vy*dt;if(state.y<=0){state.y=0;state.vy=0;updatePressed();if(previousY>0){state.land=1;burst(state.x,state.z+PLAYER_Z,"#D9C39B")}}else if(previousY===0)updatePressed()}
    state.run+=dt*(state.y>0?4:15);state.land=Math.max(0,state.land-dt*4);camX+=(state.x*.42-camX)*Math.min(1,dt*7);roll+=((RUN_LANES[state.lane]-state.x)*.03-roll)*Math.min(1,dt*6);camBob=reduced?0:Math.sin(state.run*.5)*.09+(state.y>0?.18:0);
    items.forEach(item=>{
      if(item.type==="author"&&!item.hit)item.x=Math.sin(state.z*.055*item.sweep+item.phase)*6.1;if(item.hit||state.done)return;
      const gap=item.z-(state.z+PLAYER_Z);if(gap>2.6||gap<-2.4||Math.abs(item.x-state.x)>2.7)return;
      if(item.type==="rock"){item.hit=true;burst(item.x,item.z,"#8C8697");stop(false,"岩にぶつかりました。空いた道をさがそう。");return}
      if(item.type==="tnt"){item.hit=true;burst(item.x,item.z,"#FFA33C");burst(item.x,item.z,"#E5573F");stop(false,state.y>=1.7?"TNTに跳び乗って爆発しました。赤い箱は跳ばずによけよう。":"TNTにぶつかりました。赤い箱はよけて通ろう。");return}
      if(item.type==="pit"){if(state.y<1.7){item.hit=true;stop(false,"穴に落ちました。手前でジャンプ。")}return}
      if(item.type==="author"){if(state.y<1.7){item.hit=true;stop(false,"作者に激突しました。作者は跳び越えよう。")}return}
      if(state.y<1.7){item.hit=true;burst(item.x,item.z,"#C08541");stop(false,"木箱に激突しました。跳んでこわそう。");return}
      item.hit=true;state.crates++;state.vy=Math.max(state.vy,13);status.textContent=`木箱をこわしました。${state.crates}個`;burst(item.x,item.z,"#D69B55");
    });
    if(!state.done&&state.z>=task.stageLength-PLAYER_Z)stop(true,`ゴール！ 木箱を ${state.crates} 個こわしました。`);
  };
  let last=null;
  const tick=now=>{if(state.disposed)return false;if(last===null)last=now;const dt=Math.min(Math.max((now-last)/1000,0),.05);last=now;update(dt);state.frames++;paint(dt);return!state.disposed};
  const advance=milliseconds=>{if(state.done||state.disposed||!Number.isFinite(milliseconds)||milliseconds<0)return false;let left=milliseconds/1000;while(left>0&&!state.done){const dt=Math.min(left,.016);update(dt);left-=dt}paint(0);return true};
  const resetScene=()=>{state.z=0;state.lane=1;state.x=0;state.y=0;state.vy=0;state.run=0;state.done=false;state.result=null;state.detail="";state.crates=0;state.land=0;state.elapsed=0;camX=0;camBob=0;roll=0;clock=0;particles.length=0;items.forEach((item,index)=>Object.assign(item,task.obstacles[index],{hit:false,x:RUN_LANES[item.lane]}));wrap.classList.remove("crashed");status.textContent="中央の車線を走っています";updatePressed()};
  const showScene=scene=>{if(!context.qa||state.disposed)return false;stopFrame?.();resetScene();const type=["rock","pit","crate","tnt","author"].includes(scene)?scene:null,item=type?items.find(entry=>entry.type===type):null;if(scene==="input"){state.lane=2;state.x=RUN_LANES[2]}else if(scene==="jump"){state.y=4;state.vy=8}else if(scene==="motion")state.z=72;else if(scene==="progress")state.z=task.stageLength*.52;else if(scene==="goal")state.z=task.stageLength-46;else if(item){state.z=item.z-PLAYER_Z-18;state.lane=item.lane;state.x=item.type==="author"?0:RUN_LANES[item.lane];if(scene==="crate")state.y=3.4}else if(scene==="collision"||scene==="failure"){state.z=(items.find(entry=>entry.type==="rock")?.z||150)-PLAYER_Z;state.done=true;state.result="failure";state.detail="岩にぶつかりました。";wrap.classList.add("crashed")}else if(scene==="invalid"){state.z=(items.find(entry=>entry.type==="tnt")?.z||150)-PLAYER_Z;state.y=3;state.done=true;state.result="failure";state.detail="TNTに跳び乗って爆発しました。";wrap.classList.add("crashed")}else if(scene==="success"){state.z=task.stageLength-PLAYER_Z;state.done=true;state.result="success";state.detail="ゴール！"}else if(scene==="timeout"){state.z=task.stageLength*.4;state.done=true;state.result="timeout";state.detail="時間内にゴールできませんでした。"}else if(scene!=="initial")return false;status.textContent=state.detail||status.textContent;updatePressed();paint(0);return true};
  const qaApi={move,jump:doJump,advance,pause:()=>{stopFrame?.();return true},showScene,inspect:()=>({z:state.z,lane:state.lane,x:state.x,y:state.y,vy:state.vy,done:state.done,disposed:state.disposed,result:state.result,detail:state.detail,crates:state.crates,particles:particles.length,elapsed:state.elapsed,frames:state.frames,speed:state.speed,status:status.textContent,items:items.map(item=>({type:item.type,lane:item.lane,z:item.z,x:item.x,hit:item.hit})),canvas:{cssWidth:W,cssHeight:H,pixelWidth:canvas.width,pixelHeight:canvas.height,dpr},viewport:{...context.viewport}})};
  resize();updatePressed();paint(0);if(view&&typeof view.dispatchEvent==="function")context.listen(view,"resize",()=>{resize();paint(0)},{passive:true});
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;stopFrame=context.frame(tick);
  context.setDeadline(task.duration,()=>stop(false,"時間内にゴールできませんでした。","timeout"));
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;stopFrame?.();if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
