// Visual reference isolated verbatim from published commit a8761a1; only this fixture shell is new.
const RUN_LANES=[-5.6,0,5.6],RUN_THEMES=[
  {key:"dawn",sky:["#12203F","#3E5C8C","#F0A26B"],sun:"#FFD9A0",sunY:.74,hills:["#2C3F63","#3B5273"],grass:["#3F6B49","#345C3E"],road:["#8E7A63","#7A6853"],line:"#F3E5C5",fog:"#C79A78"},
  {key:"noon",sky:["#2E6FB7","#5C9BD8","#BFE0F2"],sun:"#FFF3C4",sunY:.3,hills:["#4E7A5C","#5E8B68"],grass:["#5C8F45","#4E7C3B"],road:["#B79E77","#A48C68"],line:"#FFF8E0",fog:"#CFE4F2"},
  {key:"dusk",sky:["#241436","#5B2F63","#E2734F"],sun:"#FFC178",sunY:.8,hills:["#3A2450","#4A2F5E"],grass:["#4A5A46","#3D4C3B"],road:["#8A7768","#75645A"],line:"#F6E3C8",fog:"#B57A6C"}
];
let task={"kind":"laneRun","prompt":"走るコースをタップで切り抜けて","help":"左右ボタンで位置、画面タップでジャンプ。穴と木箱は跳ぶ。岩と赤いTNTは跳ばずによける。","theme":"dawn","obstacles":[{"type":"pit","lane":0,"z":150},{"type":"pit","lane":1,"z":150},{"type":"pit","lane":2,"z":150},{"type":"tnt","lane":0,"z":227},{"type":"crate","lane":2,"z":227},{"type":"author","lane":1,"z":263,"phase":5.5358134883083405,"sweep":1},{"type":"rock","lane":2,"z":309,"seed":0.7787498377729207},{"type":"pit","lane":0,"z":309},{"type":"crate","lane":1,"z":368},{"type":"crate","lane":2,"z":368},{"type":"pit","lane":0,"z":426},{"type":"pit","lane":1,"z":426},{"type":"pit","lane":2,"z":426},{"type":"rock","lane":1,"z":495,"seed":0.012592751998454332},{"type":"tnt","lane":2,"z":495},{"type":"rock","lane":1,"z":559,"seed":0.31975393183529377},{"type":"rock","lane":0,"z":559,"seed":0.6494561152067035}],"scenery":[{"z":40,"side":-1,"offset":22,"kind":"tree","seed":0.5827319058589637},{"z":55,"side":1,"offset":13,"kind":"tree","seed":0.42368656978942454},{"z":71,"side":-1,"offset":19,"kind":"bush","seed":0.9770266469568014},{"z":93,"side":1,"offset":20,"kind":"tree","seed":0.023384853033348918},{"z":122,"side":1,"offset":14,"kind":"tree","seed":0.2129572001285851},{"z":149,"side":1,"offset":22,"kind":"tree","seed":0.21171909128315747},{"z":179,"side":-1,"offset":21,"kind":"stone","seed":0.5801617568358779},{"z":209,"side":1,"offset":23,"kind":"tree","seed":0.34526814124546945},{"z":234,"side":-1,"offset":16,"kind":"stone","seed":0.9465897134505212},{"z":256,"side":1,"offset":20,"kind":"tree","seed":0.9370880725327879},{"z":282,"side":-1,"offset":18,"kind":"bush","seed":0.4713407978415489},{"z":309,"side":1,"offset":13,"kind":"tree","seed":0.2827821902465075},{"z":327,"side":1,"offset":16,"kind":"tree","seed":0.7080834195949137},{"z":354,"side":-1,"offset":14,"kind":"tree","seed":0.8166888554114848},{"z":372,"side":1,"offset":17,"kind":"stone","seed":0.3906782204285264},{"z":401,"side":-1,"offset":21,"kind":"bush","seed":0.5694029235746711},{"z":425,"side":-1,"offset":23,"kind":"tree","seed":0.6740781138651073},{"z":440,"side":-1,"offset":18,"kind":"tree","seed":0.8722606843803078},{"z":470,"side":1,"offset":24,"kind":"stone","seed":0.6240839157253504},{"z":492,"side":-1,"offset":21,"kind":"tree","seed":0.36164474743418396},{"z":522,"side":1,"offset":24,"kind":"tree","seed":0.12160497950389981},{"z":548,"side":-1,"offset":18,"kind":"bush","seed":0.938504382269457},{"z":566,"side":1,"offset":20,"kind":"tree","seed":0.383207063190639},{"z":596,"side":1,"offset":15,"kind":"tree","seed":0.6988383827265352},{"z":613,"side":1,"offset":13,"kind":"bush","seed":0.8124249665997922},{"z":642,"side":1,"offset":22,"kind":"tree","seed":0.5315515885595232},{"z":658,"side":1,"offset":20,"kind":"tree","seed":0.1980752907693386},{"z":680,"side":1,"offset":13,"kind":"bush","seed":0.14357275958172977}],"stageLength":690,"speed":36,"duration":45000};
const params=new URLSearchParams(location.search),scene=params.get("scene")||"initial",causal=params.get("causal")||"",reducedQuery=params.get("motion")==="reduced",width=Number(params.get("width"))||393;document.body.style.width=`${width}px`;
const nativeMatchMedia=window.matchMedia.bind(window);window.matchMedia=query=>{const result=nativeMatchMedia(query);if(query!=="(prefers-reduced-motion: reduce)")return result;return new Proxy(result,{get(target,key){if(key==="matches")return reducedQuery;const value=Reflect.get(target,key,target);return typeof value==="function"?value.bind(target):value}})};
const causalTask=kind=>{const first=kind.startsWith("crate")?"crate":kind,kinds=[first,"rock","pit","crate","tnt","rock","pit","crate","rock","pit","crate","rock","author"],obstacles=kinds.map((type,index)=>({type,lane:index?0:1,z:100+index*58,...(type==="rock"?{seed:.37}:{}),...(type==="author"?{phase:index?1.2:1.385,sweep:1}:{})}));return{...task,obstacles,stageLength:980}};if(causal)task=causalTask(causal);
const $=id=>document.getElementById(id),clamp=(value,min,max)=>Math.max(min,Math.min(max,value));let seed=0x91e10,questionAnswered=false,questionStartedAt=performance.now();
const randomFloat=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32),extraRafs=[],questionTimers=[],later=(fn,ms)=>setTimeout(fn,ms),startDeadline=()=>{},finishTask=(correct,result)=>{questionAnswered=true;const output=document.querySelector("#legacy-result");output.hidden=false;output.dataset.correct=String(correct);output.textContent=result.detail};
window.__SHORO_QA__={};const nativeRaf=window.requestAnimationFrame;window.requestAnimationFrame=causal?nativeRaf:()=>0;
function renderLaneRun(task){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const theme=RUN_THEMES.find(item=>item.key===task.theme)||RUN_THEMES[0];
  const CAM_Y=6.4,PLAYER_Z=11,ROAD=9.4;
  const wrap=document.createElement("div");wrap.className="run-stage";
  const canvas=document.createElement("canvas");canvas.className="run-canvas";
  canvas.setAttribute("role","img");canvas.setAttribute("aria-label","奥へ走るコース。タップでジャンプ");
  const pad=document.createElement("div");pad.className="run-pad";
  const left=document.createElement("button"),jump=document.createElement("button"),right=document.createElement("button");
  [[left,"◀","左へ"],[jump,"ジャンプ","ジャンプ"],[right,"▶","右へ"]].forEach(([button,text,label])=>{
    button.type="button";button.className="run-key";button.textContent=text;button.setAttribute("aria-label",label);
  });
  jump.classList.add("wide");
  pad.append(left,jump,right);wrap.append(canvas,pad);$("challenge").append(wrap);
  const ctx=canvas.getContext("2d");
  let W=0,H=0,HY=0,FOCAL=0;
  const resize=()=>{
    const dpr=Math.min(window.devicePixelRatio||1,3);
    W=Math.max(220,Math.round(canvas.clientWidth||wrap.clientWidth||320));
    H=Math.round(W*.64);
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
    canvas.style.height=`${H}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    HY=H*.44;FOCAL=W*.54;
  };
  const state={z:0,lane:1,x:RUN_LANES[1],y:0,vy:0,run:0,done:false,crates:0,land:0,speed:reduced?Math.round(task.speed*.78):task.speed};
  const items=task.obstacles.map(item=>({...item,hit:false,x:RUN_LANES[item.lane]}));
  const particles=[];
  const move=step=>{if(state.done)return;state.lane=clamp(state.lane+step,0,2)};
  const doJump=()=>{if(state.done||state.y>0)return;state.vy=25};
  const press=(button,run)=>{
    button.addEventListener("pointerdown",event=>{event.preventDefault();run()});
    button.addEventListener("click",event=>{if(event.detail===0)run()});
  };
  press(left,()=>move(-1));press(right,()=>move(1));press(jump,doJump);
  canvas.addEventListener("pointerdown",event=>{event.preventDefault();doJump()});
  wrap.tabIndex=0;
  wrap.addEventListener("keydown",event=>{
    if(event.key==="ArrowLeft"){event.preventDefault();move(-1)}
    else if(event.key==="ArrowRight"){event.preventDefault();move(1)}
    else if(event.key===" "||event.key==="Enter"){event.preventDefault();doJump()}
  });
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
    for(let i=0;i<14;i++)particles.push({x,y:randomFloat()*3+1,z,vx:(randomFloat()-.5)*13,vy:randomFloat()*11+3,vz:(randomFloat()-.5)*9,life:1,color});
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
  const paint=dt=>{
    ctx.clearRect(0,0,W,H);
    drawSky();drawHills();drawGround();drawFog();drawScenery();drawGoal();
    items.filter(item=>item.z-state.z>2&&item.z-state.z<400).sort((a,b)=>b.z-a.z).forEach(item=>{
      const z=item.z-state.z;
      if(item.type==="pit")drawPit(item,z);
      else if(item.type==="crate"&&!item.hit)drawCrate(item,z);
      else if(item.type==="tnt"&&!item.hit)drawTnt(item,z);
      else if(item.type==="rock")drawRock(item,z);
      else if(item.type==="author"&&!item.hit)drawAuthor(item,z);
    });
    drawHero();drawParticles(dt);drawHud();
  };
  const stop=(won,detail)=>{
    if(state.done||questionAnswered)return;state.done=true;
    if(!won){wrap.classList.add("crashed");burst(state.x,state.z+PLAYER_Z,"#E8C766")}
    const elapsed=performance.now()-questionStartedAt;
    later(()=>finishTask(won,{quality:won?clamp(.55+state.crates*.08-elapsed/task.duration*.25,0,1):0,detail}),reduced?120:won?460:560);
  };
  let last=performance.now();const token={id:null};extraRafs.push(token);
  const tick=now=>{
    if(questionAnswered)return;
    const dt=Math.min(Math.max((now-last)/1000,0),.05);last=now;clock+=dt;
    if(!state.done){
      state.z+=state.speed*dt;
      const previousY=state.y;
      state.x+=clamp(RUN_LANES[state.lane]-state.x,-26*dt,26*dt);
      if(state.vy||state.y>0){state.vy-=62*dt;state.y+=state.vy*dt;if(state.y<=0){state.y=0;state.vy=0;if(previousY>0){state.land=1;burst(state.x,state.z+PLAYER_Z,"#D9C39B")}}}
      state.run+=dt*(state.y>0?4:15);
      state.land=Math.max(0,state.land-dt*4);
      camX+=(state.x*.42-camX)*Math.min(1,dt*7);
      roll+=((RUN_LANES[state.lane]-state.x)*.03-roll)*Math.min(1,dt*6);
      camBob=reduced?0:Math.sin(state.run*.5)*.09+(state.y>0?.18:0);
      items.forEach(item=>{
        if(item.type==="author"&&!item.hit)item.x=Math.sin(state.z*.055*item.sweep+item.phase)*6.1;
        if(item.hit)return;
        const gap=item.z-(state.z+PLAYER_Z);
        if(gap>2.6||gap<-2.4)return;
        if(Math.abs(item.x-state.x)>2.7)return;
        if(item.type==="rock"){item.hit=true;burst(item.x,item.z,"#8C8697");stop(false,"岩にぶつかりました。空いた道をさがそう。");return}
        if(item.type==="tnt"){
          item.hit=true;burst(item.x,item.z,"#FFA33C");burst(item.x,item.z,"#E5573F");
          stop(false,state.y>=1.7?"TNTに跳び乗って爆発しました。赤い箱は跳ばずによけよう。":"TNTにぶつかりました。赤い箱はよけて通ろう。");return;
        }
        if(item.type==="pit"){if(state.y<1.7){item.hit=true;stop(false,"穴に落ちました。手前でジャンプ。")}return}
        if(item.type==="author"){if(state.y<1.7){item.hit=true;stop(false,"作者に激突しました。作者は跳び越えよう。")}return}
        if(state.y<1.7){item.hit=true;burst(item.x,item.z,"#C08541");stop(false,"木箱に激突しました。跳んでこわそう。");return}
        item.hit=true;state.crates++;state.vy=Math.max(state.vy,13);burst(item.x,item.z,"#D69B55");
      });
      if(state.z>=task.stageLength-PLAYER_Z)stop(true,`ゴール！ 木箱を ${state.crates} 個こわしました。`);
    }
    paint(dt);
    token.id=requestAnimationFrame(tick);
  };
  resize();
  const onResize=()=>{resize();paint(0)};
  window.addEventListener("resize",onResize,{passive:true});
  questionTimers.push(setTimeout(()=>window.removeEventListener("resize",onResize),task.duration+4000));
  if(window.__SHORO_QA__)window.__SHORO_QA__.run={state,items,task,move,jump:doJump};
  paint(0);token.id=requestAnimationFrame(tick);
  startDeadline(task.duration,()=>stop(false,"時間内にゴールできませんでした。"));
}
renderLaneRun(task);
const api=window.__SHORO_QA__.run,{state,items}=api,reset=()=>{Object.assign(state,{z:0,lane:1,x:0,y:0,vy:0,run:0,done:false,crates:0,land:0});items.forEach((item,index)=>Object.assign(item,task.obstacles[index],{hit:false,x:RUN_LANES[item.lane]}));document.querySelector(".run-stage").classList.remove("crashed");const output=document.querySelector("#legacy-result");output.hidden=true;questionAnswered=false};
if(causal){if(causal==="crate-air"){const toHit=89/state.speed*1000;setTimeout(()=>api.jump(),Math.max(0,toHit-450))}const ready=()=>{const hit=items[0]?.hit,output=document.querySelector("#legacy-result"),complete=causal==="crate-air"?hit&&state.crates>0:state.done&&!output.hidden;if(complete){cancelAnimationFrame(extraRafs[0]?.id);document.documentElement.dataset.ready="true"}else nativeRaf(ready)};ready()}else{reset();const type=["rock","pit","crate","tnt","author"].includes(scene)?scene:null,item=type?items.find(entry=>entry.type===type):null;if(scene==="input"){state.lane=2;state.x=RUN_LANES[2]}else if(scene==="jump"){state.y=4;state.vy=8}else if(scene==="motion")state.z=72;else if(scene==="progress")state.z=task.stageLength*.52;else if(scene==="goal")state.z=task.stageLength-46;else if(item){state.z=item.z-11-18;state.lane=item.lane;state.x=item.type==="author"?0:RUN_LANES[item.lane];if(scene==="crate")state.y=3.4}else if(scene==="collision"||scene==="failure"){state.z=(items.find(entry=>entry.type==="rock")?.z||150)-11;state.done=true;document.querySelector(".run-stage").classList.add("crashed");const output=document.querySelector("#legacy-result");output.hidden=false;output.textContent="岩にぶつかりました。"}else if(scene==="invalid"){state.z=(items.find(entry=>entry.type==="tnt")?.z||150)-11;state.y=3;state.done=true;document.querySelector(".run-stage").classList.add("crashed");const output=document.querySelector("#legacy-result");output.hidden=false;output.textContent="TNTに跳び乗って爆発しました。"}else if(scene==="success"){state.z=task.stageLength-11;state.done=true;const output=document.querySelector("#legacy-result");output.hidden=false;output.dataset.correct="true";output.textContent="ゴール！"}else if(scene==="timeout"){state.z=task.stageLength*.4;state.done=true;const output=document.querySelector("#legacy-result");output.hidden=false;output.textContent="時間内にゴールできませんでした。"}dispatchEvent(new Event("resize"));window.requestAnimationFrame=nativeRaf;document.documentElement.dataset.ready="true"}
window.__LANE_LEGACY_FIXTURE__={task,state,items,scene,causal,width,evidence(){const canvas=document.querySelector("canvas"),rect=canvas.getBoundingClientRect();return{scene,causal,reducedQuery,reducedMatches:matchMedia("(prefers-reduced-motion: reduce)").matches,speed:state.speed,width,dpr:devicePixelRatio,task:structuredClone(task),canvas:{cssWidth:rect.width,cssHeight:rect.height,pixelWidth:canvas.width,pixelHeight:canvas.height},state:{...state},firstItem:{...items[0]},result:document.querySelector("#legacy-result").textContent}}};
