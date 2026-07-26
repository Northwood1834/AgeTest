const KINDS=Object.freeze([
  Object.freeze({key:"dog",emoji:"🐶",label:"いぬ",color:"#F5A94E",light:"#FFD9A0"}),
  Object.freeze({key:"cat",emoji:"🐱",label:"ねこ",color:"#EA7E9B",light:"#FFD1DF"}),
  Object.freeze({key:"panda",emoji:"🐼",label:"パンダ",color:"#8E9BC4",light:"#D6DCF2"}),
  Object.freeze({key:"smile",emoji:"😀",label:"えがお",color:"#F2CE4B",light:"#FFF0B0"}),
  Object.freeze({key:"glasses",emoji:"🤓",label:"めがね",color:"#66C08C",light:"#C4EFD5"}),
  Object.freeze({key:"money",emoji:"🤑",label:"おかね",color:"#5FB6E0",light:"#C3E8F8"})
]);
const COLS=7,ROWS=9,MATCH=4,DROPS=1,TARGET=3,MAX_GENERATION_ATTEMPTS=4000;
const PROMPT=`1手で${TARGET}連鎖を決めて`;
const HELP="落とす列をタップ。同じ顔が4つつながると消え、その上のブロックが落ちて次が揃うと連鎖します。消えるだけの場所もあります。";
const metadata=Object.freeze({id:"prediction-chain-puzzle-v1",introducedIn:"1.3",tier:2,flavor:"satisfying",step:1,family:"prediction-chain-puzzle",category:"prediction"});

const kindFor=key=>KINDS.find(kind=>kind.key===key);
const cloneBoard=board=>board.map(row=>[...row]);
const emptyBoard=()=>Array.from({length:ROWS},()=>Array(COLS).fill(null));
const key=(row,col)=>`${row},${col}`;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function settle(board){
  const moves=[];
  for(let col=0;col<COLS;col++){
    let write=ROWS-1;
    for(let row=ROWS-1;row>=0;row--){
      if(!board[row][col])continue;
      if(row!==write){board[write][col]=board[row][col];board[row][col]=null;moves.push({from:row,to:write,col})}
      write--;
    }
  }
  return moves;
}
function groups(board){
  const seen=Array.from({length:ROWS},()=>Array(COLS).fill(false)),found=[];
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
    const kind=board[row][col];if(!kind||seen[row][col])continue;
    const stack=[[row,col]],cells=[];seen[row][col]=true;
    while(stack.length){
      const [currentRow,currentCol]=stack.pop();cells.push([currentRow,currentCol]);
      for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nextRow=currentRow+dr,nextCol=currentCol+dc;
        if(nextRow<0||nextRow>=ROWS||nextCol<0||nextCol>=COLS||seen[nextRow][nextCol]||board[nextRow][nextCol]!==kind)continue;
        seen[nextRow][nextCol]=true;stack.push([nextRow,nextCol]);
      }
    }
    if(cells.length>=MATCH)found.push(cells);
  }
  return found;
}
function resolve(board){
  let chain=0,cleared=0;
  for(;;){
    settle(board);const found=groups(board);if(!found.length)break;chain++;
    found.forEach(cells=>cells.forEach(([row,col])=>{board[row][col]=null;cleared++}));
  }
  return{chain,cleared};
}
function drop(board,col,kind){
  if(!Number.isInteger(col)||col<0||col>=COLS)return-1;
  for(let row=ROWS-1;row>=0;row--)if(!board[row][col]){board[row][col]=kind;return row}
  return-1;
}
function component(board,row,col){
  const kind=board[row]?.[col];if(!kind)return 0;
  const seen=new Set([key(row,col)]),stack=[[row,col]];let size=0;
  while(stack.length){
    const [currentRow,currentCol]=stack.pop();size++;
    for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nextRow=currentRow+dr,nextCol=currentCol+dc,id=key(nextRow,nextCol);
      if(nextRow<0||nextRow>=ROWS||nextCol<0||nextCol>=COLS||seen.has(id)||board[nextRow][nextCol]!==kind)continue;
      seen.add(id);stack.push([nextRow,nextCol]);
    }
  }
  return size;
}
function outcomes(task){
  if(!Array.isArray(task?.board)||!Array.isArray(task?.queue)||!task.queue.length)return[];
  return Array.from({length:COLS},(_,col)=>{const board=cloneBoard(task.board);if(drop(board,col,task.queue[0])<0)return-1;return resolve(board).chain});
}

function authoredFallback(){
  const board=emptyBoard(),palette=KINDS.slice(0,4).map(kind=>kind.key);
  [0,1,2].forEach(index=>{board[ROWS-1-index][0]=palette[0]});
  [0,1,2].forEach(index=>{board[ROWS-1-index][1]=palette[1]});
  return{kind:"chainPuzzle",prompt:"ブロックを消して",help:"落とす列をタップ。同じ顔が4つつながると消えます。",board,queue:[palette[0],palette[1],palette[1]],target:1,best:1,bestCol:0,decoys:0,palette,duration:60000};
}
function generate({random,randomInt,pick,shuffle}){
  if(typeof random!=="function"||typeof randomInt!=="function"||typeof pick!=="function"||typeof shuffle!=="function")throw new TypeError(`${metadata.id} requires random, randomInt, pick, and shuffle`);
  for(let attempt=0;attempt<MAX_GENERATION_ATTEMPTS;attempt++){
    const palette=shuffle(KINDS).slice(0,4).map(kind=>kind.key),[first,second,third]=palette;
    if(palette.length!==4)continue;
    const board=emptyBoard(),mirrored=random()<.5,offset=randomInt(0,COLS-5),lane=index=>{const raw=offset+index;return mirrored?COLS-1-raw:raw},[a,b,c,d,e]=[0,1,2,3,4].map(lane),heightA=randomInt(2,3),row2=heightA+1,row3=row2+1,heights={},fixed={};
    const reserve=(col,index,kind)=>{fixed[key(col,index)]=kind};
    heights[a]=heightA;reserve(a,heightA-1,first);
    heights[b]=row3+4;reserve(b,heightA-1,first);reserve(b,heightA,first);reserve(b,row2+2,second);reserve(b,row3+3,third);
    [c,d,e].forEach(col=>{heights[col]=row3+2;reserve(col,row2,second);reserve(col,row3+1,third)});
    const spare=Array.from({length:COLS},(_,col)=>col).filter(col=>![a,b,c,d,e].includes(col)),used=[];
    shuffle(spare).forEach(col=>{
      const nearTrigger=Math.abs(col-a)<=1||Math.abs(col-b)<=1,low=nearTrigger?heightA+5:3,high=nearTrigger?ROWS:6,options=[];
      for(let height=low;height<=high;height++){
        if(used.some(other=>Math.abs(other-height)<4&&spare.some(candidate=>Math.abs(candidate-col)===1)))continue;
        options.push(height);
      }
      if(!options.length){heights[col]=randomInt(2,3);return}
      const height=pick(options);used.push(height);heights[col]=height;
      for(let index=1;index<=3;index++)reserve(col,height-index,first);
    });
    let ok=true;
    for(let index=0;index<ROWS&&ok;index++)for(let col=0;col<COLS&&ok;col++){
      if(index>=heights[col])continue;
      const row=ROWS-1-index,forced=fixed[key(col,index)];
      if(forced){board[row][col]=forced;if(component(board,row,col)>=MATCH)ok=false;continue}
      const choice=shuffle(palette).find(kind=>{board[row][col]=kind;return component(board,row,col)<MATCH});
      if(!choice)ok=false;else board[row][col]=choice;
    }
    if(!ok||groups(board).length)continue;
    const task={kind:"chainPuzzle",prompt:PROMPT,help:HELP,board,queue:[first,pick(palette),pick(palette)],target:TARGET,best:0,bestCol:a,decoys:0,palette,duration:60000},result=outcomes(task);
    task.best=Math.max(...result);task.decoys=result.filter(chain=>chain>=1&&chain<TARGET).length;
    if(result.filter(chain=>chain>=TARGET).length!==1||result[a]<TARGET||task.decoys<2)continue;
    return task;
  }
  return authoredFallback();
}

function validate(task){
  const issues=[];
  if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="chainPuzzle")issues.push("kind must remain chainPuzzle");
  const publishedFallback=task.target===1&&task.prompt==="ブロックを消して"&&task.help==="落とす列をタップ。同じ顔が4つつながると消えます。";
  if(!publishedFallback&&task.prompt!==PROMPT)issues.push("prompt changed");
  if(!publishedFallback&&task.help!==HELP)issues.push("help changed");
  if(task.duration!==60000)issues.push("duration must remain 60000ms");
  if(!Array.isArray(task.palette)||task.palette.length!==4||new Set(task.palette).size!==4||task.palette.some(kind=>!kindFor(kind)))issues.push("palette must contain four unique known faces");
  if(!Array.isArray(task.queue)||task.queue.length!==3||task.queue.some(kind=>!task.palette?.includes(kind)))issues.push("queue must contain three palette faces");
  if(!Array.isArray(task.board)||task.board.length!==ROWS||task.board.some(row=>!Array.isArray(row)||row.length!==COLS))issues.push(`board must be ${ROWS} by ${COLS}`);
  const board=Array.isArray(task.board)?task.board:[];
  if(board.some(row=>Array.isArray(row)&&row.some(kind=>kind!==null&&!task.palette?.includes(kind))))issues.push("board contains a face outside palette");
  if(!Number.isInteger(task.target)||task.target<1||task.target>TARGET)issues.push("target must be an integer from 1 to 3");
  if(!Number.isInteger(task.best)||task.best<task.target||task.best>6)issues.push("best chain is invalid");
  if(!Number.isInteger(task.bestCol)||task.bestCol<0||task.bestCol>=COLS)issues.push("bestCol is invalid");
  if(!Number.isInteger(task.decoys)||task.decoys<0||task.decoys>COLS-1)issues.push("decoys is invalid");
  if(!issues.length){
    if(groups(board).length)issues.push("board must not begin with a clearable group");
    const settled=cloneBoard(board);settle(settled);if(JSON.stringify(settled)!==JSON.stringify(board))issues.push("board must begin settled");
    const result=outcomes(task),best=Math.max(...result),solutions=result.filter(chain=>chain>=task.target).length,decoys=result.filter(chain=>chain>=1&&chain<task.target).length;
    if(best!==task.best)issues.push("best does not match exhaustive column search");
    if(result[task.bestCol]!==best)issues.push("bestCol does not produce best chain");
    if(task.target===TARGET&&solutions!==1)issues.push("three-chain task must have exactly one solution");
    if(task.target===TARGET&&decoys<2)issues.push("three-chain task must have at least two tempting decoys");
    if(decoys!==task.decoys)issues.push("decoys does not match exhaustive column search");
  }
  return[...new Set(issues)];
}

const STYLE=`
.pcp-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;padding:.08rem max(.12rem,env(safe-area-inset-left)) .12rem max(.12rem,env(safe-area-inset-right));display:grid;gap:.32rem;justify-items:center;color:#493b52;contain:layout paint}
.pcp-status{box-sizing:border-box;width:100%;min-height:2.15rem;margin:0;padding:.35rem .6rem;border:1px solid rgba(122,84,150,.2);border-radius:.82rem;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(244,237,249,.94));box-shadow:0 4px 13px rgba(49,30,58,.09);font-size:.82rem;font-weight:900;line-height:1.35;text-align:center}.pcp-status.pcp-error{border-color:#dc7890;background:#fff0f3;color:#96344e}.pcp-status.pcp-good{border-color:#d8ad3f;background:#fff8dc;color:#7d5017}
.pcp-canvas{display:block;max-width:100%;border-radius:1rem;background:linear-gradient(160deg,#fbf7fe,#efe6f8);box-shadow:0 10px 26px rgba(49,30,58,.18);touch-action:manipulation;cursor:pointer}
.pcp-pad{display:grid;gap:0;width:var(--board-width,100%)}.pcp-key{box-sizing:border-box;min-width:0;min-height:2.5rem;margin:0 .1rem;border:1.5px solid #d8cadf;border-radius:.7rem;background:linear-gradient(#fff,#f7f0fa);color:#704584;font-size:.95rem;font-weight:950;box-shadow:0 3px 8px rgba(49,30,58,.09);touch-action:manipulation;cursor:pointer}.pcp-key:active,.pcp-key.is-pressed{transform:translateY(2px);box-shadow:none}.pcp-key:disabled{color:#a99dad;background:#eee8f0;box-shadow:none}.pcp-key:focus-visible,.pcp-stage:focus-visible{outline:3px solid #754f8a;outline-offset:3px}
.pcp-stage[data-outcome=success] .pcp-canvas{box-shadow:0 0 0 3px #efc453,0 12px 32px rgba(217,142,39,.36)}.pcp-stage[data-outcome=failure] .pcp-canvas,.pcp-stage[data-outcome=timeout] .pcp-canvas{box-shadow:0 0 0 3px #cc6882,0 12px 30px rgba(125,44,70,.25)}
.pcp-stage[data-reduced=true] *{transition:none!important;animation:none!important}@media(prefers-reduced-motion:reduce){.pcp-stage *{transition:none!important;animation:none!important}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);
  const view=documentRef.defaultView,style=documentRef.createElement("style");style.textContent=STYLE;
  const stage=documentRef.createElement("section");stage.className="pcp-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.tabIndex=0;stage.setAttribute("aria-label",`${COLS}列の連鎖パズル`);
  const status=documentRef.createElement("p");status.className="pcp-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const canvas=documentRef.createElement("canvas");canvas.className="pcp-canvas";canvas.tabIndex=0;canvas.setAttribute("role","img");canvas.setAttribute("aria-label",`${COLS}列、${ROWS}段の連鎖パズル盤面。左右キーで列を選び、Enterで落とします`);
  const pad=documentRef.createElement("div");pad.className="pcp-pad";pad.style.gridTemplateColumns=`repeat(${COLS},1fr)`;const buttons=[];
  for(let col=0;col<COLS;col++){const button=documentRef.createElement("button");button.type="button";button.className="pcp-key";button.textContent="▼";button.setAttribute("aria-label",`${col+1}列目に落とす`);buttons.push(button);pad.append(button)}
  stage.append(status,canvas,pad);context.host.replaceChildren(style,stage);
  const drawing=canvas.getContext("2d");if(!drawing)throw new Error(`${metadata.id}: 2D canvas is required`);
  const board=cloneBoard(task.board),queue=[...task.queue],offsets=new Map(),pops=[],particles=[],rings=[];
  const state={busy:false,drops:DROPS,chain:0,bestChain:0,cursor:task.bestCol??2,shake:0,banner:null,done:false,disposed:false,invalid:false,result:null,phase:"ready"};
  let width=0,height=0,cell=0,boardY=0,headHeight=0,clock=0,dpr=Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view?.devicePixelRatio)||1));
  const startedAt=Number(view?.performance?.now?.()??globalThis.performance?.now?.()??0);
  const cellX=col=>col*cell,cellY=row=>boardY+row*cell;
  const shade=(color,amount)=>{const number=parseInt(color.slice(1),16),red=number>>16,green=number>>8&255,blue=number&255,mix=value=>Math.round(clamp(amount<0?value*(1+amount):value+(255-value)*amount,0,255));return`rgb(${mix(red)},${mix(green)},${mix(blue)})`};
  const drawGem=(x,y,size,kindKey,{scale=1,alpha=1,glow=0}={})=>{const kind=kindFor(kindKey);if(!kind)return;const scaled=size*scale,cx=x+size/2,cy=y+size/2,r=scaled*.42;drawing.save();drawing.globalAlpha=alpha;drawing.fillStyle="rgba(40,24,52,.16)";drawing.beginPath();drawing.ellipse(cx,cy+r*.86,r*.86,r*.28,0,0,Math.PI*2);drawing.fill();if(glow>0){const halo=drawing.createRadialGradient(cx,cy,r*.3,cx,cy,r*2.1);halo.addColorStop(0,`${kind.light}ee`);halo.addColorStop(1,"#ffffff00");drawing.fillStyle=halo;drawing.beginPath();drawing.arc(cx,cy,r*2.1*glow,0,Math.PI*2);drawing.fill()}const body=drawing.createRadialGradient(cx-r*.35,cy-r*.45,r*.15,cx,cy,r*1.15);body.addColorStop(0,kind.light);body.addColorStop(.55,kind.color);body.addColorStop(1,shade(kind.color,-.22));drawing.fillStyle=body;drawing.beginPath();drawing.roundRect(cx-r,cy-r,r*2,r*2,r*.55);drawing.fill();drawing.strokeStyle="rgba(255,255,255,.68)";drawing.lineWidth=Math.max(1,scaled*.035);drawing.beginPath();drawing.roundRect(cx-r*.97,cy-r*.97,r*1.94,r*1.94,r*.52);drawing.stroke();drawing.fillStyle="rgba(255,255,255,.55)";drawing.beginPath();drawing.ellipse(cx-r*.36,cy-r*.52,r*.4,r*.22,-.5,0,Math.PI*2);drawing.fill();drawing.font=`${Math.round(scaled*.52)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;drawing.textAlign="center";drawing.textBaseline="middle";drawing.fillText(kind.emoji,cx,cy+scaled*.03);drawing.restore()};
  const drawBoard=()=>{const boardHeight=cell*ROWS,back=drawing.createLinearGradient(0,boardY,width,boardY+boardHeight);back.addColorStop(0,"#f7f1fb");back.addColorStop(1,"#e9dff4");drawing.fillStyle=back;drawing.beginPath();drawing.roundRect(0,boardY,width,boardHeight,12);drawing.fill();drawing.strokeStyle="rgba(122,84,150,.22)";drawing.lineWidth=1;for(let col=0;col<=COLS;col++){drawing.beginPath();drawing.moveTo(cellX(col),boardY);drawing.lineTo(cellX(col),boardY+boardHeight);drawing.stroke()}for(let row=0;row<=ROWS;row++){drawing.beginPath();drawing.moveTo(0,cellY(row));drawing.lineTo(width,cellY(row));drawing.stroke()}if(!state.busy&&!state.done){drawing.fillStyle=state.invalid?"rgba(205,74,104,.22)":"rgba(166,109,194,.16)";drawing.fillRect(cellX(state.cursor),boardY,cell,boardHeight)}};
  const drawPieces=()=>{for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){const kind=board[row][col];if(kind)drawGem(cellX(col),cellY(row)+(offsets.get(key(row,col))?.dy||0),cell,kind)}pops.forEach(pop=>{const life=clamp(pop.life,0,1);drawGem(cellX(pop.col),cellY(pop.row),cell,pop.kind,{scale:1+(1-life)*.85,alpha:life,glow:1-life})})};
  const drawHead=()=>{drawing.fillStyle="rgba(255,255,255,.94)";drawing.beginPath();drawing.roundRect(0,2,width,headHeight-10,12);drawing.fill();drawing.strokeStyle="rgba(122,84,150,.18)";drawing.beginPath();drawing.roundRect(.5,2.5,width-1,headHeight-11,12);drawing.stroke();const size=headHeight*.58,y=2+(headHeight-10-size)/2;drawing.fillStyle="#6f6078";drawing.font=`800 ${Math.round(headHeight*.2)}px "Hiragino Maru Gothic ProN",sans-serif`;drawing.textAlign="left";drawing.textBaseline="middle";drawing.fillText("つぎ",10,2+(headHeight-10)/2);drawGem(46,y,size,queue[0]);drawing.textAlign="right";drawing.fillStyle="#493b52";drawing.font=`900 ${Math.round(headHeight*.26)}px "Hiragino Maru Gothic ProN",sans-serif`;drawing.fillText(`${task.target}連鎖`,width-10,2+(headHeight-10)*.36);drawing.fillStyle=state.drops<=1?"#a64763":"#6f6078";drawing.font=`800 ${Math.round(headHeight*.2)}px "Hiragino Maru Gothic ProN",sans-serif`;drawing.fillText(state.drops>0?`のこり ${state.drops}手`:"けっか",width-10,2+(headHeight-10)*.72);drawing.textAlign="left"};
  const drawEffects=()=>{rings.forEach(ring=>{const life=clamp(ring.life,0,1);drawing.strokeStyle=`${ring.color}${Math.round(life*180).toString(16).padStart(2,"0")}`;drawing.lineWidth=Math.max(2,cell*.12*life);drawing.beginPath();drawing.arc(ring.x,ring.y,cell*(.3+(1-life)*1.5),0,Math.PI*2);drawing.stroke()});particles.forEach(particle=>{drawing.globalAlpha=clamp(particle.life,0,1);drawing.fillStyle=particle.color;drawing.beginPath();drawing.arc(particle.x,particle.y,particle.size*(.4+particle.life*.6),0,Math.PI*2);drawing.fill();drawing.globalAlpha=1});if(state.banner){const banner=state.banner,life=clamp(banner.life,0,1),scale=life>.8?1-(life-.8)*4:1,pop=1+Math.max(0,(1-life)-.7)*2;drawing.save();drawing.translate(width/2,boardY+cell*ROWS*.42);drawing.scale(clamp(scale*pop,.2,1.6),clamp(scale*pop,.2,1.6));drawing.globalAlpha=clamp(life*1.6,0,1);drawing.font=`900 ${Math.round(cell*(banner.small?.78:1.15))}px "Hiragino Maru Gothic ProN",sans-serif`;drawing.textAlign="center";drawing.textBaseline="middle";drawing.lineWidth=cell*.28;drawing.strokeStyle="#fff";drawing.strokeText(banner.text,0,0);const fill=drawing.createLinearGradient(0,-cell*.6,0,cell*.6);fill.addColorStop(0,banner.color[0]);fill.addColorStop(1,banner.color[1]);drawing.fillStyle=fill;drawing.fillText(banner.text,0,0);drawing.restore()}};
  const paint=()=>{drawing.clearRect(0,0,width,height);drawing.save();if(state.shake>0&&!context.reducedMotion){const power=state.shake*cell*.16;drawing.translate(Math.sin(clock*.067)*power,Math.cos(clock*.053)*power*.55)}drawBoard();drawPieces();drawEffects();drawing.restore();drawHead()};
  const burst=(row,col,kindKey,power=1)=>{const kind=kindFor(kindKey),x=cellX(col)+cell/2,y=cellY(row)+cell/2;rings.push({x,y,life:1,color:kind.light});const count=context.reducedMotion?4:12;for(let index=0;index<count;index++){const angle=index/count*Math.PI*2+(row*7+col*3)*.17,speed=cell*(2+(index%5)*.65)*(1+power*.15);particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-cell*2,size:cell*(.06+(index%4)*.025),color:index%2?kind.color:kind.light,life:1})}};
  const updateControls=()=>buttons.forEach((button,col)=>{button.disabled=state.done||state.busy;button.classList.toggle("is-pressed",col===state.cursor&&!state.done);button.setAttribute("aria-current",col===state.cursor?"true":"false")});
  const announce=(message,tone="")=>{status.className=`pcp-status${tone?` pcp-${tone}`:""}`;status.textContent=message};
  const finish=(correct,reason)=>{if(state.done||state.disposed)return false;state.done=true;state.busy=false;state.result=correct?"success":reason;state.phase="terminal";stage.dataset.outcome=state.result;updateControls();if(correct){state.banner={text:"CLEAR!",life:1.6,color:["#f0c24e","#d9803c"]};announce(`${state.bestChain}連鎖！ 1手で決めました。`,"good");for(let index=0;index<(context.reducedMotion?5:22);index++)context.later(()=>{if(!state.disposed)burst(2+index%(ROWS-2),index%COLS,task.palette[index%task.palette.length],4)},Math.max(1,index*32));context.later(()=>{if(!state.disposed)context.finish(true,{quality:clamp(.55+(state.bestChain-task.target)*.12-((Number(view?.performance?.now?.()??globalThis.performance?.now?.()??startedAt)-startedAt)/task.duration)*.25,0,1),detail:`${state.bestChain}連鎖！ 1手で決めました。`})},context.reducedMotion?1:760)}else{state.banner={text:reason==="timeout"?"TIME OVER":"MISS",life:1.45,small:reason==="timeout",color:["#df7892","#9e3655"]};announce(reason==="timeout"?`時間切れ。最大${task.best}連鎖の置き場所がありました。`:`最高${state.bestChain}連鎖。最大${task.best}連鎖の列がありました。`,"error");context.later(()=>{if(!state.disposed)context.finish(false,{reason,detail:reason==="timeout"?`時間切れ。最大${task.best}連鎖の置き場所がありました。`:`最高${state.bestChain}連鎖でした。最大${task.best}連鎖の置き場所があります。`})},context.reducedMotion?1:430)}return true};
  const endTurn=()=>{if(state.done||state.disposed)return;if(state.chain>=task.target){finish(true,"clear");return}state.bestChain=Math.max(state.bestChain,state.chain);if(state.drops<=0){finish(false,"chain");return}state.chain=0;state.busy=false;state.phase="ready";announce("落とす列を選んでください");updateControls()};
  const resolveLoop=()=>{if(state.done||state.disposed)return;const moves=settle(board);if(moves.length){offsets.clear();moves.forEach(move=>offsets.set(key(move.to,move.col),{dy:(move.from-move.to)*cell}));state.phase="settling";context.later(()=>{if(state.done||state.disposed)return;offsets.clear();resolveLoop()},context.reducedMotion?1:210);return}const found=groups(board);if(!found.length){endTurn();return}state.chain++;state.bestChain=Math.max(state.bestChain,state.chain);state.banner={text:`${state.chain}連鎖！`,life:1,color:[["#8e6bd0","#5b3e9e"],["#4fa3d1","#2e6fa8"],["#4fb07a","#2c7a52"],["#e8a33c","#c06a1e"]][Math.min(state.chain,4)-1]};state.shake=Math.min(1,.35+state.chain*.22);found.forEach(cells=>cells.forEach(([row,col])=>{pops.push({row,col,kind:board[row][col],life:1});burst(row,col,board[row][col],state.chain);board[row][col]=null}));announce(`${state.chain}連鎖！ ブロックが落ちます`,state.chain>=task.target?"good":"");state.phase="clearing";context.later(resolveLoop,context.reducedMotion?1:300)};
  const reject=(col,message)=>{if(state.done||state.disposed)return false;state.cursor=clamp(Number.isInteger(col)?col:state.cursor,0,COLS-1);state.invalid=true;state.shake=.5;announce(message,"error");updateControls();context.later(()=>{if(state.done||state.disposed)return;state.invalid=false;announce(state.busy?"連鎖を判定しています…":"落とす列を選んでください");paint()},context.reducedMotion?1:340);return false};
  const choose=col=>{if(state.done||state.disposed)return false;if(state.busy)return reject(col,"連鎖の判定が終わるまで待ってください");if(!Number.isInteger(col)||col<0||col>=COLS)return reject(state.cursor,"その列には置けません");state.cursor=col;const row=drop(board,col,queue[0]);if(row<0)return reject(col,"その列はいっぱいです。別の列を選んでください");state.busy=true;state.drops--;state.chain=0;state.phase="dropping";queue.shift();queue.push(task.palette[(col+state.bestChain+1)%task.palette.length]);offsets.set(key(row,col),{dy:-(row+1)*cell});announce(`${col+1}列目へ落としています…`);updateControls();context.later(()=>{if(state.done||state.disposed)return;offsets.clear();state.shake=Math.max(state.shake,.25);resolveLoop()},context.reducedMotion?1:170+row*14);return true};
  const columnAt=event=>{const rect=canvas.getBoundingClientRect();return clamp(Math.floor((event.clientX-rect.left)/Math.max(1,cell)),0,COLS-1)};
  buttons.forEach((button,col)=>{context.listen(button,"pointerdown",event=>{event.preventDefault();choose(col)});context.listen(button,"click",event=>{if(event.detail===0)choose(col)});context.listen(button,"keydown",event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();const next=clamp(col+(event.key==="ArrowRight"?1:-1),0,COLS-1);state.cursor=next;buttons[next].focus({preventScroll:true});updateControls()}})});
  context.listen(canvas,"pointermove",event=>{if(!state.busy&&!state.done){state.cursor=columnAt(event);updateControls()}});context.listen(canvas,"pointerdown",event=>{event.preventDefault();choose(columnAt(event))});
  context.listen(stage,"keydown",event=>{if(event.target!==stage&&event.target!==canvas)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();state.cursor=clamp(state.cursor+(event.key==="ArrowRight"?1:-1),0,COLS-1);buttons[state.cursor].focus({preventScroll:true});updateControls()}else if(event.key===" "||event.key==="Enter"){event.preventDefault();choose(state.cursor)}});
  function resize(){const rect=stage.getBoundingClientRect?.()||context.host.getBoundingClientRect?.()||{},available=Math.max(240,Math.min(430,Math.round(rect.width||context.viewport?.width||393)));headHeight=Math.round(available*.17);cell=Math.floor(Math.min(available/COLS,(Math.min(438,available*1.34)-headHeight)/ROWS));width=cell*COLS;height=headHeight+cell*ROWS;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;drawing.setTransform(dpr,0,0,dpr,0,0);boardY=headHeight;stage.style.setProperty("--board-width",`${width}px`);paint()}
  if(view)context.listen(view,"resize",resize,{passive:true});
  resize();announce("1手で3連鎖。落とす列を選んでください");updateControls();stage.focus({preventScroll:true});
  if(!context.reducedMotion)context.frame(time=>{if(state.disposed)return false;const delta=Math.min(Math.max((time-clock)/1000,0),.05);clock=time;state.shake=Math.max(0,state.shake-delta*3);if(state.banner){state.banner.life-=delta*1.25;if(state.banner.life<=0)state.banner=null}for(let index=pops.length-1;index>=0;index--){pops[index].life-=delta*3.4;if(pops[index].life<=0)pops.splice(index,1)}for(let index=rings.length-1;index>=0;index--){rings[index].life-=delta*2.2;if(rings[index].life<=0)rings.splice(index,1)}for(let index=particles.length-1;index>=0;index--){const particle=particles[index];particle.life-=delta*1.5;if(particle.life<=0){particles.splice(index,1);continue}particle.x+=particle.vx*delta;particle.y+=particle.vy*delta;particle.vy+=cell*14*delta}paint();return true});else paint();
  context.setDeadline(task.duration,()=>{if(state.done||state.disposed)return;finish(false,"timeout")});
  const qaApi={choose,outcomes:()=>outcomes(task),inspect:()=>({board:cloneBoard(board),queue:[...queue],busy:state.busy,drops:state.drops,chain:state.chain,bestChain:state.bestChain,cursor:state.cursor,done:state.done,disposed:state.disposed,invalid:state.invalid,result:state.result,phase:state.phase,status:status.textContent,banner:state.banner?.text||null,canvas:{width:canvas.width,height:canvas.height,cssWidth:width,cssHeight:height,dpr},activeElement:documentRef.activeElement?.getAttribute?.("aria-label")||null})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;
  context.listen(context.signal,"abort",()=>{state.disposed=true;state.done=true;state.busy=false;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
