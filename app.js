(() => {
"use strict";
if (window.top !== window.self) {
  document.body.textContent = "このページは埋め込み表示では動きません。ブラウザで直接ひらいてください。";
  return;
}

const APP_VERSION = "1.3.3";
const CONTENT_PACK = "1.0";
const STORAGE_KEY = "shoro-test-state-v1";
const PACE_STANDARD = "standard";
const PACE_RELAXED = "relaxed";
const RELAXED_DURATION_MULTIPLIER = 1.5;
const TRAINING_WINDOW_MS = 20 * 60 * 60 * 1000;
const MID_BLOCK_BREAK_MS = 10 * 60 * 1000;
const SETS_PER_BLOCK = 3;
const MAX_SETS_PER_WINDOW = 6;
const SESSION_SIZE = 12;
const HISTORY_LIMIT = 30;
const FLASH_EXPOSURE_MS = 5000;
const MEMORY_PATH_RECALL_MS = 5000;
const MEMORY_PATH_FLASH_START_MS = 600;
const MEMORY_PATH_FLASH_STEP_MS = 1300;
const MEMORY_PATH_FLASH_ON_MS = 750;
const $ = id => document.getElementById(id);

const CATEGORIES = {
  reaction:{label:"反射神経",icon:"⚡"},
  memory:{label:"記憶力",icon:"◈"},
  language:{label:"言語力",icon:"あ"},
  spatial:{label:"空間認識",icon:"◇"},
  prediction:{label:"未来予知",icon:"✦"},
  inhibition:{label:"抑制力",icon:"止"},
  calculation:{label:"計算力",icon:"＋"},
  attention:{label:"注意力",icon:"◎"},
  timing:{label:"時間感覚",icon:"◷"},
  social:{label:"会話力",icon:"♡"}
};
const GRADES = [
  {min:85,name:"処老",message:"乙女のようにフレッシュな脳ですね。この調子でいきましょう！"},
  {min:60,name:"初老",message:"少し間違えが多かったかも。鍛錬して伸ばしていこう！"},
  {min:40,name:"中老",message:"考え事してたのかな？苦労が多くなる年頃だよね。またやろう！"},
  {min:0,name:"大老",message:"大事な契約書や遺言など、目につくところに整理を始めよう！また、忘れないで来てね！"}
];

const randomInt = (min,max) => {
  const range=max-min+1,limit=Math.floor(0x100000000/range)*range,a=new Uint32Array(1);
  do { crypto.getRandomValues(a); } while(a[0]>=limit);
  return min+(a[0]%range);
};
const randomFloat = () => { const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/0x100000000; };
const pick = values => values[randomInt(0,values.length-1)];
const shuffle = values => { const a=[...values];for(let i=a.length-1;i>0;i--){const j=randomInt(0,i);[a[i],a[j]]=[a[j],a[i]]}return a; };
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const uuid = () => crypto.randomUUID?.() || `s-${Date.now().toString(36)}-${randomInt(0,0xffffff).toString(36)}`;

const PROFILE_AVATARS=["🤓","😀","🤑","🐼","🐶","🐱"];
function defaultProfile(name="プレイヤー1",avatar="🤓"){return{id:uuid(),name,avatar,paceMode:PACE_STANDARD,xp:0,sessionsCompleted:0,bestScore:0,templateWins:{},recentTemplates:[],categoryStats:{},history:[],activeSession:null,trainingWindowStartedAt:0,setsInWindow:0,cooldownUntil:0,lastResult:null,pendingResult:false,createdAt:Date.now(),updatedAt:Date.now()};}
function normalizeProfile(value,index=0){const base=defaultProfile(`プレイヤー${index+1}`,PROFILE_AVATARS[index%PROFILE_AVATARS.length]),p=value||{};return{...base,...p,id:typeof p.id==="string"&&p.id?p.id:base.id,name:typeof p.name==="string"&&p.name.trim()?p.name.trim().slice(0,12):base.name,avatar:PROFILE_AVATARS.includes(p.avatar)?p.avatar:base.avatar,paceMode:p.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD,templateWins:p.templateWins&&typeof p.templateWins==="object"?p.templateWins:{},recentTemplates:Array.isArray(p.recentTemplates)?p.recentTemplates.slice(0,30):[],categoryStats:p.categoryStats&&typeof p.categoryStats==="object"?p.categoryStats:{},history:Array.isArray(p.history)?p.history.slice(0,HISTORY_LIMIT):[],activeSession:p.activeSession&&Array.isArray(p.activeSession.tasks)?p.activeSession:null,trainingWindowStartedAt:Number(p.trainingWindowStartedAt)||0,setsInWindow:clamp(Number(p.setsInWindow)||0,0,MAX_SETS_PER_WINDOW),cooldownUntil:(Number(p.trainingWindowStartedAt)||Number(p.setsInWindow))?Number(p.cooldownUntil)||0:0,lastResult:p.lastResult||null,pendingResult:!!p.pendingResult};}
function attachStateAccessors(target){
  Object.defineProperty(target,"profile",{configurable:true,enumerable:false,get(){return target.profiles.find(profile=>profile.id===target.activeProfileId)||target.profiles[0]}});
  ["activeSession","cooldownUntil","lastResult","pendingResult"].forEach(field=>Object.defineProperty(target,field,{configurable:true,enumerable:false,get(){return target.profile[field]},set(value){target.profile[field]=value;target.profile.updatedAt=Date.now()}}));
  return target;
}
function defaultState(){const profile=defaultProfile();return attachStateAccessors({schema:"shoro-test",schemaVersion:1,appVersion:APP_VERSION,contentPack:CONTENT_PACK,profiles:[profile],activeProfileId:profile.id,createdAt:Date.now(),updatedAt:Date.now()});}
function normalizeState(value){
  if(!value||value.schema!=="shoro-test"||value.schemaVersion!==1)return defaultState();
  let profiles;
  if(Array.isArray(value.profiles)&&value.profiles.length)profiles=value.profiles.slice(0,6).map(normalizeProfile);
  else profiles=[normalizeProfile({...value.profile,activeSession:value.activeSession,cooldownUntil:value.cooldownUntil,lastResult:value.lastResult,pendingResult:value.pendingResult},0)];
  if(value.appVersion==="1.1.0")profiles.forEach(profile=>{profile.cooldownUntil=profile.setsInWindow===SETS_PER_BLOCK&&profile.cooldownUntil?profile.cooldownUntil+5*60*1000:0});
  const activeProfileId=profiles.some(profile=>profile.id===value.activeProfileId)?value.activeProfileId:profiles[0].id;
  const out={...value,schema:"shoro-test",schemaVersion:1,appVersion:value.appVersion||APP_VERSION,contentPack:value.contentPack||CONTENT_PACK,profiles,activeProfileId,createdAt:value.createdAt||Date.now(),updatedAt:value.updatedAt||Date.now()};
  ["profile","activeSession","cooldownUntil","lastResult","pendingResult"].forEach(field=>delete out[field]);
  return attachStateAccessors(out);
}
function loadState(){try{return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)))}catch{return defaultState()}}
let state=loadState();
function saveState(){state.appVersion=APP_VERSION;state.contentPack=CONTENT_PACK;state.updatedAt=Date.now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch{toast("記録を保存できませんでした");return false}}
const breadthPoints = (profile=state.profile) => Object.values(profile.templateWins).reduce((sum,n)=>sum+Math.min(3,Number(n)||0),0);
const currentLevel = (profile=state.profile) => 1+Math.min(Math.floor(profile.xp/120),Math.floor(breadthPoints(profile)/6));
function trainingWindowStatus(profile=state.profile,now=Date.now()){
  const startedAt=Number(profile.trainingWindowStartedAt)||0,sets=clamp(Number(profile.setsInWindow)||0,0,MAX_SETS_PER_WINDOW),endsAt=startedAt+TRAINING_WINDOW_MS,expired=!startedAt||now>=endsAt;
  return expired?{startedAt:0,endsAt:0,sets:0,remaining:MAX_SETS_PER_WINDOW,expired:true}:{startedAt,endsAt,sets,remaining:MAX_SETS_PER_WINDOW-sets,expired:false};
}

const COLOR_NAMES=["むらさき","みどり","オレンジ","あお"];
const COLOR_CLASSES={"むらさき":"ink-purple","みどり":"ink-green","オレンジ":"ink-orange","あお":"ink-blue"};
const CUBE_COLORS=[
  {name:"むらさき",hex:"#A66DC2"},{name:"みどり",hex:"#6BAE8E"},{name:"きいろ",hex:"#D5A93F"},
  {name:"あお",hex:"#5A88BE"},{name:"ピンク",hex:"#D983A0"},{name:"しろ",hex:"#D8D4DC"}
];
const CUBE_TURN_LABELS={right:"右面→正面",left:"左面→正面",up:"上面→正面",down:"下面→正面"};
const CUBE_TURN_SEQUENCES=[
  ["right","up"],["up","right"],["right","left"],["up","down"],
  ["right","up","left"],["up","right","down"],["right","left","up"],["up","down","right"],
  ["right","left","right"],["up","down","up"]
];
function cubeFaceAfterTurns(turns){
  let state=[0,1,2,3,4,5];
  turns.forEach(turn=>{const [front,right,back,left,top,bottom]=state;if(turn==="right")state=[right,back,left,front,top,bottom];else if(turn==="left")state=[left,front,right,back,top,bottom];else if(turn==="up")state=[top,right,bottom,left,back,front];else state=[bottom,right,top,left,front,back]});
  return state[0]
}
const DATE_SCENARIOS=[
  {name:"蒼真",age:26,role:"ブックカフェで会った青年",image:"assets/date-anime.webp",alt:"夕方のブックカフェにいる架空の成人男性",closing:"その誘い、うれしい。次の休みに行こう。",steps:[
    {line:"この店、静かで落ち着くんだ。よく来るの？",answer:"初めて。おすすめの本、教えてくれる？",choices:["初めて。おすすめの本、教えてくれる？","静かすぎて眠くなりそう","本よりスマホのほうが好き"]},
    {line:"映画の原作になった短編が好きかな。君は映画も観る？",answer:"観るよ。原作と比べるのも楽しそう",choices:["観るよ。原作と比べるのも楽しそう","結末だけ教えて","長い話は全部苦手"]},
    {line:"今度、その作品の上映があるんだ。",answer:"よかったら、一緒に観に行かない？",choices:["よかったら、一緒に観に行かない？","ひとりで楽しんできて","感想だけあとで送って"]}]},
  {name:"蓮",age:32,role:"架空の映画俳優",image:"assets/date-actor.webp",alt:"夕暮れの映画セットにいる架空の成人男性俳優",closing:"いいね。撮影のない日に、二人で行こう。",steps:[
    {line:"やっと撮影が終わった。今日は少し難しい場面でね。",answer:"おつかれさま。どんなところが難しかったの？",choices:["おつかれさま。どんなところが難しかったの？","有名人も大変だね","それより写真を撮って"]},
    {line:"言葉より表情で伝える場面だったんだ。静かな映画は好き？",answer:"好き。表情を追うのも面白いよね",choices:["好き。表情を追うのも面白いよね","派手な場面だけ観たい","途中で寝るかも"]},
    {line:"小さな映画館で、昔の作品を観直したいと思ってる。",answer:"今度、その映画館に一緒に行かない？",choices:["今度、その映画館に一緒に行かない？","場所だけ教えて","誰か誘えば？"]}]},
  {name:"理一郎",age:58,role:"美術館で会った紳士",image:"assets/date-gentleman.webp",alt:"閉館前の美術館ラウンジにいる架空の成人男性紳士",closing:"喜んで。次は作品の続きを、ゆっくり話しましょう。",steps:[
    {line:"この絵の前では、時間が少しゆっくり流れる気がします。",answer:"わかります。どこが一番お好きですか？",choices:["わかります。どこが一番お好きですか？","値段が気になります","そろそろ閉館ですよ"]},
    {line:"光の描き方ですね。近くに、この画家の小さな展示もあります。",answer:"それも見てみたいです。詳しいんですね",choices:["それも見てみたいです。詳しいんですね","有名なら見ます","説明は短めでお願いします"]},
    {line:"来週からだそうです。静かな午後にちょうどよさそうだ。",answer:"よろしければ、来週ご一緒しませんか？",choices:["よろしければ、来週ご一緒しませんか？","パンフレットだけください","おひとりでどうぞ"]}]}
];
const PARTNER_MOOD_SCENARIO={name:"直樹",age:36,role:"少し不機嫌なパートナー",image:"assets/partner-mood.webp",alt:"雨の夜のキッチンで対話を待つ架空の成人男性パートナー",closing:"うん。ちゃんと話せたら、少し気持ちがほどけた。",successDetail:"低気圧を会話で通過。関係修復ミッション成功。",failureDetail:"その一言で、室内の気圧がさらに下がりました。",steps:[
  {line:"今日の予定、変更になったのを後から知ったんだけど。",answer:"先に伝えなくてごめん。今、話しても大丈夫？",choices:["先に伝えなくてごめん。今、話しても大丈夫？","そんなに怒ること？","顔がこわいよ"]},
  {line:"楽しみにしてたから、置いていかれた気がした。",answer:"楽しみにしてた気持ちを、軽く扱ってしまったね",choices:["楽しみにしてた気持ちを、軽く扱ってしまったね","でも仕事だから仕方ないよ","代わりに何か買えばいい？"]},
  {line:"埋め合わせって、どう考えてる？",answer:"都合を聞いて、二人で次の予定を決めたい",choices:["都合を聞いて、二人で次の予定を決めたい","今すぐ機嫌を直して","同じ予定を勝手に予約しておく"]}
]};
const TEMPLATE_TIERS={
  "language-meaning-v1":2,"language-order-v1":2,"spatial-cube-v1":2,
  "prediction-symbol-v1":2,"calculation-compare-v1":2,"memory-reverse-v1":2,
  "timing-three-v1":2,"spatial-mirror-v1":3,"prediction-alternating-v1":3,
  "inhibition-parity-v1":3,"attention-kana-count-v1":3,
  "reaction-emoji-runner-v1":2,"attention-author-boss-v1":2,"spatial-golf-putt-v1":2,
  "spatial-emoji-fps-v1":3,"prediction-lane3d-v1":3,
  "memory-position-v1":2,"language-proverb-v1":2,"spatial-grid-v1":2,
  "prediction-clock-v1":2,"inhibition-opposite-v1":2,"calculation-missing-v1":2,
  "attention-search-v1":2,"timing-five-v1":2,
  "memory-nback-v1":3,"language-anagram-v1":3,"spatial-perspective-v1":3,
  "prediction-double-v1":3,"inhibition-rule-switch-v1":3,"calculation-multistep-v1":3,
  "attention-dual-v1":3,"social-date-v1":2,"social-partner-mood-v1":2,"language-english-v1":2
};
const tierFor = templateId => TEMPLATE_TIERS[templateId]||1;
const TEMPLATE_FLAVORS={
  "reaction-target-v1":"wild","reaction-emoji-runner-v1":"wild","attention-author-boss-v1":"wild","spatial-emoji-fps-v1":"wild","prediction-lane3d-v1":"wild","spatial-golf-putt-v1":"wild","timing-three-v1":"wild","timing-five-v1":"wild",
  "memory-missing-v1":"quirky","reaction-emoji-match-v1":"quirky","attention-animal-count-v1":"quirky","inhibition-parity-v1":"quirky","attention-kana-count-v1":"quirky","attention-dual-v1":"quirky","language-anagram-v1":"quirky","social-partner-mood-v1":"quirky","social-date-v1":"wild",
  "memory-path-v1":"satisfying","spatial-cube-v1":"satisfying","spatial-rotation-v1":"satisfying","prediction-number-v1":"satisfying","prediction-double-v1":"satisfying","calculation-mental-v1":"satisfying","calculation-multistep-v1":"satisfying","attention-odd-v1":"satisfying","attention-search-v1":"satisfying"
};
const flavorFor = templateId => TEMPLATE_FLAVORS[templateId]||"classic";
const PACE_FIXED_KINDS = new Set(["signal","target","timing","runner"]);
function tuneTaskForPace(task,paceMode){
  if(paceMode!==PACE_RELAXED)return task;
  if(task.kind==="runner")return{...task,runnerClearance:26};
  if(PACE_FIXED_KINDS.has(task.kind))return task;
  return{...task,standardDuration:task.duration,duration:Math.round(task.duration*RELAXED_DURATION_MULTIPLIER)};
}

const TASK_FACTORIES = [
  {id:"reaction-signal-v1",version:"1.0",category:"reaction",make:()=>({kind:"signal",prompt:"合図が出たら、すぐタップ",help:"フライングは不正解です。",delay:randomInt(900,2200),duration:4300})},
  {id:"reaction-target-v1",version:"1.0",category:"reaction",make:()=>({kind:"target",prompt:"逃げる紫をつかまえて",help:"背景を押すと逃亡成功です。",x:randomInt(8,72),y:randomInt(10,62),duration:5000})},
  {id:"memory-path-v1",version:"1.0",category:"memory",make:()=>({kind:"memoryPath",prompt:"光る順番を覚えて",help:"あとで同じ順番にタップ。",path:shuffle([0,1,2,3,4,5,6,7,8]).slice(0,3),duration:7200})},
  {id:"memory-missing-v1",version:"1.0",category:"memory",make:()=>{const all=["🍇","鍵","傘","月","猫","靴","山","時計","魚","本"],shown=shuffle(all).slice(0,5),absent=pick(all.filter(x=>!shown.includes(x))),others=shuffle(shown).slice(0,3);return{kind:"flashChoice",prompt:"なかったものを選んで",help:"まず5つを覚えてください。",shown,options:shuffle([absent,...others]),answer:absent,duration:7500}}},
  {id:"language-meaning-v1",version:"1.0",category:"language",make:()=>{const rows=[
    ["『端的』に近い意味は？","要点がはっきり",["遠回し","あいまい","感情的"]],
    ["『杞憂』に近い意味は？","いらぬ心配",["深い眠り","うれしい誤算","昔の約束"]],
    ["『おもむろに』の意味は？","ゆっくり動き出す",["突然走り出す","思いのままに","主に室内で"]]
  ],r=pick(rows);return{kind:"choice",prompt:r[0],help:"雰囲気で押すと、語彙が泣きます。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:8000}}},
  {id:"language-spelling-v1",version:"1.0",category:"language",make:()=>{const rows=[
    ["正しい表記はどれ？","コミュニケーション",["コミニュケーション","コミニケーション","コミュニケーシヨン"]],
    ["正しい表記はどれ？","シミュレーション",["シュミレーション","シミレーション","シミュレイション"]],
    ["正しい表記はどれ？","うろ覚え",["うる覚え","うろ憶れ","うる憶え"]]
  ],r=pick(rows);return{kind:"choice",prompt:r[0],help:"よく見る顔ほど、名前があやしい。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:8000}}},
  {id:"language-order-v1",version:"1.0",category:"language",make:()=>{const rows=[
    [["あさがお","あじさい","あめだま","あんず"],"あじさい"],
    [["かかし","かえる","かがみ","かばん"],"かがみ"],
    [["さかな","さくら","さとう","さなぎ"],"さくら"]
  ],r=pick(rows);return{kind:"choice",prompt:"五十音順で2番目は？",help:r[0].join("・"),options:shuffle(r[0]),answer:r[1],duration:9000}}},
  {id:"inhibition-stroop-v1",version:"1.0",category:"inhibition",make:()=>{const word=pick(COLOR_NAMES),ink=pick(COLOR_NAMES.filter(x=>x!==word));return{kind:"stroop",prompt:"文字ではなく、インクの色は？",help:"読んだら負け。見てください。",word,ink,options:shuffle(COLOR_NAMES),answer:ink,duration:6500}}},
  {id:"inhibition-flanker-v1",version:"1.0",category:"inhibition",make:()=>{const answer=pick(["左","右"]),center=answer==="左"?"←":"→",outer=answer==="左"?"→":"←";return{kind:"flanker",prompt:"真ん中の矢印はどっち？",help:"外野の声は無視。",line:`${outer} ${outer} ${center} ${outer} ${outer}`,options:["左","右"],answer,duration:5500}}},
  {id:"spatial-cube-v1",version:"1.0",category:"spatial",make:()=>{const colors=shuffle(CUBE_COLORS),turns=pick(CUBE_TURN_SEQUENCES),answer=colors[cubeFaceAfterTurns(turns)].name;return{kind:"cube",prompt:"色の位置を覚えて、最後の正面は？",help:"見えている3面を覚えてください。回転すると色が隠れます。",colors,turns,answer,options:shuffle([answer,...shuffle(colors.filter(color=>color.name!==answer)).slice(0,3).map(color=>color.name)]),duration:8500}}},
  {id:"spatial-rotation-v1",version:"1.0",category:"spatial",make:()=>{const degrees=pick([90,180,270]),arrows=["↑","→","↓","←"],answer=arrows[(degrees/90)%4];return{kind:"rotation",prompt:`この矢印を右に${degrees}度回すと？`,help:"首は回さなくて大丈夫です。",symbol:"↑",options:shuffle(arrows),answer,duration:6500}}},
  {id:"prediction-number-v1",version:"1.0",category:"prediction",make:()=>{const start=randomInt(1,6),step=randomInt(2,5),seq=[0,1,2,3].map(i=>start+i*step),answer=start+4*step;return{kind:"pattern",prompt:"次に来る数を未来予知",help:"法則はひとつだけ。たぶん。",sequence:seq,options:shuffle([answer,answer+step,answer-1,answer+1]).map(String),answer:String(answer),duration:7500}}},
  {id:"prediction-symbol-v1",version:"1.0",category:"prediction",make:()=>{const rows=[[["○","△","○","△"],"○",["△","□","☆"]],[["↑","→","↓","←"],"↑",["→","↓","←"]],[["●","●","○","●","●"],"○",["●","△","□"]]],r=pick(rows);return{kind:"pattern",prompt:"？に入るものを未来予知",help:"水晶玉は使用禁止です。",sequence:r[0],options:shuffle([r[1],...r[2]]),answer:r[1],duration:7000}}},
  {id:"calculation-mental-v1",version:"1.0",category:"calculation",make:()=>{const a=randomInt(8,29),b=randomInt(3,15),minus=randomFloat()<.45,answer=minus?a-b:a+b,op=minus?"−":"＋";const ds=new Set([answer]);while(ds.size<4)ds.add(answer+pick([-4,-3,-2,-1,1,2,3,4]));return{kind:"expression",prompt:"暗算してください",help:"指の使用は黙認します。",expression:`${a} ${op} ${b}`,options:shuffle([...ds].map(String)),answer:String(answer),duration:6500}}},
  {id:"calculation-compare-v1",version:"1.0",category:"calculation",make:()=>{let a,b,c,d,left,right;do{a=randomInt(3,12);b=randomInt(2,9);c=randomInt(3,12);d=randomInt(2,9);left=a+b;right=c+d}while(left===right);const l=`${a}＋${b}`,r=`${c}＋${d}`;return{kind:"compare",prompt:"答えが大きいのはどっち？",help:"計算してから、堂々と。",options:shuffle([l,r]),answer:left>right?l:r,duration:6500}}},
  {id:"attention-count-v1",version:"1.0",category:"attention",make:()=>{const cells=[];for(let i=0;i<20;i++)cells.push({shape:pick(["circle","triangle","square"]),color:pick(["purple","green","orange"])});let count=cells.filter(x=>x.shape==="circle"&&x.color==="purple").length;if(count<2){cells[0]={shape:"circle",color:"purple"};cells[1]={shape:"circle",color:"purple"};count=cells.filter(x=>x.shape==="circle"&&x.color==="purple").length}const opts=new Set([count]);while(opts.size<4)opts.add(Math.max(0,count+pick([-3,-2,-1,1,2,3])));return{kind:"countShapes",prompt:"紫の丸はいくつ？",help:"色も形も両方です。",cells,options:shuffle([...opts].map(String)),answer:String(count),duration:8000}}},
  {id:"attention-odd-v1",version:"1.0",category:"attention",make:()=>{const pair=pick([["シ","ツ"],["ぬ","め"],["8","B"],["老","考"]]),oddIndex=randomInt(0,24);return{kind:"oddGrid",prompt:"ひとつだけ違うものをタップ",help:"老眼鏡の持ち込み可。",normal:pair[0],odd:pair[1],oddIndex,duration:7000}}},
  {id:"timing-three-v1",version:"1.0",category:"timing",make:()=>({kind:"timing",prompt:"体内時計で3秒を測って",help:"スタート後、3秒だと思ったらタップ。",duration:9000})},
  {id:"memory-reverse-v1",version:"1.0",category:"memory",make:()=>{const digits=shuffle([1,2,3,4,5,6,7,8,9]).slice(0,4).map(String),answer=[...digits].reverse().join(" → "),forward=digits.join(" → "),shift=[digits[2],digits[3],digits[0],digits[1]].join(" → "),swap=[digits[3],digits[1],digits[2],digits[0]].join(" → ");return{kind:"flashChoice",prompt:"数字を逆から思い出して",help:"4つの順番を覚えてください。",afterHelp:"逆の順番はどれ？",shown:digits,options:shuffle([answer,forward,shift,swap]),answer,duration:8500}}},
  {id:"language-opposite-v1",version:"1.0",category:"language",make:()=>{const rows=[["『増加』の反対の言葉は？","減少",["成長","余裕","停止"]],["『開始』の反対の言葉は？","終了",["継続","再開","準備"]],["『肯定』の反対の言葉は？","否定",["同意","決定","承認"]]],r=pick(rows);return{kind:"choice",prompt:r[0],help:"反対側からお迎えします。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:7500}}},
  {id:"spatial-mirror-v1",version:"1.0",category:"spatial",make:()=>{const rows=[["↗","↖"],["↘","↙"],["◖","◗"]],r=pick(rows);const distractors=shuffle(["↗","↖","↘","↙","◖","◗"].filter(value=>value!==r[1])).slice(0,3);return{kind:"rotation",prompt:"縦の鏡に映すとどれ？",help:"左右だけが反対になります。",symbol:r[0],options:shuffle([r[1],...distractors]),answer:r[1],duration:6500}}},
  {id:"prediction-alternating-v1",version:"1.0",category:"prediction",make:()=>{const start=randomInt(1,5),small=randomInt(1,3),large=small+randomInt(2,4),seq=[start,start+small,start+small+large,start+small+large+small],answer=start+small+large+small+large;return{kind:"pattern",prompt:"交互の法則を未来予知",help:`増え方は +${small}、+${large} のくり返し。`,sequence:seq,options:shuffle([answer,answer+small,answer+large,answer-1]).map(String),answer:String(answer),duration:8000}}},
  {id:"inhibition-parity-v1",version:"1.0",category:"inhibition",make:()=>{const n=randomInt(12,39),answer=n%2===0?"押す":"押さない";return{kind:"choice",prompt:`${n} は偶数。正しければ？`,help:"文章を最後まで読んで判断。",options:["押す","押さない"],answer,duration:5000}}},
  {id:"attention-kana-count-v1",version:"1.0",category:"attention",make:()=>{const target=pick(["さ","き","の"]),chars=Array.from({length:18},()=>pick(["さ","き","の","ち","ら"])),count=chars.filter(x=>x===target).length,opts=new Set([count]);while(opts.size<4)opts.add(Math.max(0,count+pick([-3,-2,-1,1,2,3])));return{kind:"expression",prompt:`「${target}」はいくつある？`,help:"似た文字にご注意。",expression:chars.join(" "),options:shuffle([...opts].map(String)),answer:String(count),duration:8000}}},
  {id:"reaction-emoji-runner-v1",version:"1.0",category:"reaction",make:()=>({kind:"runner",prompt:"タップでジャンプ！丸太を越えて",help:"「よーい…」のあと、横から来る 🪵 に合わせて1回タップ。",hero:pick(["😀","🤓","🤑","🐼"]),leadInMs:1500,travelMs:2800,duration:4800})},
  {id:"attention-author-boss-v1",version:"1.0",category:"attention",make:()=>({kind:"authorBoss",prompt:"変則ムーブの作者を3回つかまえて",help:"残像・フェイント・画面外逃走を見切ってタップ。",hits:3,duration:10000})},
  {id:"spatial-golf-putt-v1",version:"1.0",category:"spatial",make:()=>{const ball={x:randomInt(22,38),y:randomInt(66,80)},hole={x:randomInt(58,78),y:randomInt(22,39)},slope={x:randomInt(-3,3),y:randomInt(-2,2)},mounds=Array.from({length:3},()=>({x:randomInt(15,85),y:randomInt(16,84),size:randomInt(28,52)}));if(!slope.x&&!slope.y)slope.x=2;return{kind:"golfPutt",prompt:"グリーンを読んでホールイン",help:"白いボールを押さえ、打ちたい方向と反対へ引いて離す。",ball,hole,slope,mounds,duration:14000}}},
  {id:"spatial-emoji-fps-v1",version:"1.0",category:"spatial",make:()=>({kind:"emojiFps",prompt:"🤓だけを3体ロックオン",help:"😀・🤑・動物は押さないで。",targets:shuffle(["🤓","😀","🐶","🤓","🤑","🐱","🐼","🤓"]),duration:8000})},
  {id:"prediction-lane3d-v1",version:"1.0",category:"prediction",make:()=>{const safe=randomInt(0,2),lanes=[0,1,2].map(i=>i===safe?pick(["✨","🍀","⭐"]):pick(["🚗","🚌","🦖"]));return{kind:"lane3d",prompt:"安全なレーンを未来予知",help:"障害物がない道を選んで。",lanes,options:["左","中央","右"],answer:["左","中央","右"][safe],duration:7000}}},
  {id:"reaction-emoji-match-v1",version:"1.0",category:"reaction",make:()=>{const emojis=["😀","🤓","🤑","🐼","🐶","🐱"],answer=pick(emojis);return{kind:"choice",prompt:`${answer} と同じ顔をすぐ選んで`,help:"同じものをタップ。",options:shuffle([answer,...shuffle(emojis.filter(x=>x!==answer)).slice(0,3)]),answer,duration:4000}}},
  {id:"memory-first-v1",version:"1.0",category:"memory",make:()=>{const shown=shuffle(["😀","🤓","🤑","🐼","🐶","🐱"]).slice(0,4);return{kind:"flashChoice",prompt:"最初の絵文字を覚えて",help:"左から順に見てください。",afterHelp:"いちばん最初はどれ？",shown,options:shuffle(shown),answer:shown[0],duration:7000}}},
  {id:"language-reading-v1",version:"1.0",category:"language",make:()=>{const rows=[["『海月』の読みは？","くらげ",["ひとで","なまこ","あさり"]],["『木綿』の読みは？","もめん",["きぬ","あさ","きわた"]],["『五月雨』の読みは？","さみだれ",["しぐれ","ゆうだち","こさめ"]]],r=pick(rows);return{kind:"choice",prompt:r[0],help:"素直に読めない日本語です。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:7500}}},
  {id:"calculation-double-v1",version:"1.0",category:"calculation",make:()=>{const n=randomInt(3,14),answer=n*2;return{kind:"expression",prompt:"2倍にしてください",help:"落ち着けば一瞬です。",expression:`${n} × 2`,options:shuffle([answer,answer+2,answer-2,answer+1].map(String)),answer:String(answer),duration:5500}}},
  {id:"attention-animal-count-v1",version:"1.0",category:"attention",make:()=>{const target=pick(["🐶","🐱","🐼"]),line=Array.from({length:14},()=>pick(["🐶","🐱","🐼","🐰"])),count=line.filter(x=>x===target).length,opts=new Set([count]);while(opts.size<4)opts.add(Math.max(0,count+pick([-2,-1,1,2,3])));return{kind:"expression",prompt:`${target} は何匹？`,help:"ほかの動物に釣られないで。",expression:line.join(" "),options:shuffle([...opts].map(String)),answer:String(count),duration:7000}}},
  {id:"memory-position-v1",version:"1.0",category:"memory",make:()=>{const shown=shuffle(["🍎","🍋","🍇","🍙","🍩","☕"]).slice(0,4);return{kind:"flashChoice",prompt:"3番目を覚えて",help:"左から3番目です。",afterHelp:"3番目にあったものは？",shown,options:shuffle(shown),answer:shown[2],duration:7500}}},
  {id:"language-proverb-v1",version:"1.0",category:"language",make:()=>{const rows=[["急がば？","回れ",["走れ","止まれ","眠れ"]],["石の上にも？","三年",["一日","百年","五分"]],["猿も木から？","落ちる",["登る","眠る","叫ぶ"]]],r=pick(rows);return{kind:"choice",prompt:r[0],help:"ことわざを完成させて。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:6500}}},
  {id:"spatial-grid-v1",version:"1.0",category:"spatial",make:()=>{const index=randomInt(0,3),labels=["左上","右上","左下","右下"],cells=["□","□","□","□"];cells[index]="★";return{kind:"expression",prompt:"★はどこ？",help:"2×2の位置を答えて。",expression:`${cells[0]}　${cells[1]}\n${cells[2]}　${cells[3]}`,options:shuffle(labels),answer:labels[index],duration:6000}}},
  {id:"prediction-clock-v1",version:"1.0",category:"prediction",make:()=>{const start=randomInt(1,6),seq=[start,start+2,start+4,start+6],answer=start+8;return{kind:"pattern",prompt:"2時間ずつ進む時計。次は？",help:"12を超える前のやさしい時計です。",sequence:seq.map(n=>`${n}時`),options:shuffle([answer,answer-1,answer+1,answer+2].map(n=>`${n}時`)),answer:`${answer}時`,duration:6500}}},
  {id:"inhibition-opposite-v1",version:"1.0",category:"inhibition",make:()=>{const shown=pick(["左","右"]),answer=shown==="左"?"右":"左";return{kind:"choice",prompt:`「${shown}」と反対を選んで`,help:"読んだとおりには押さない。",options:["左","右"],answer,duration:4500}}},
  {id:"calculation-missing-v1",version:"1.0",category:"calculation",make:()=>{const x=randomInt(3,12),a=randomInt(4,13),sum=x+a;return{kind:"expression",prompt:"？に入る数は？",help:"逆算します。",expression:`？ ＋ ${a} ＝ ${sum}`,options:shuffle([x,x+1,x-1,x+2].map(String)),answer:String(x),duration:6500}}},
  {id:"attention-search-v1",version:"1.0",category:"attention",make:()=>{const pair=pick([["😀","😃"],["🐶","🐕"],["🍎","🍅"],["6","9"]]),oddIndex=randomInt(0,24);return{kind:"oddGrid",prompt:"違うものをひとつ探して",help:"似ているだけで、同じではありません。",normal:pair[0],odd:pair[1],oddIndex,duration:6500}}},
  {id:"timing-five-v1",version:"1.0",category:"timing",make:()=>({kind:"timing",prompt:"体内時計で5秒を測って",help:"スタート後、5秒だと思ったらタップ。",targetSeconds:5,toleranceMs:800,duration:12000})},
  {id:"memory-nback-v1",version:"1.0",category:"memory",make:()=>{const shown=shuffle(["○","△","□","☆","♡","♧"]).slice(0,5),answer=shown.at(-3);return{kind:"flashChoice",prompt:"最後から3つ前を覚えて",help:"5つの並びを記憶。",afterHelp:"最後から3つ前はどれ？",shown,options:shuffle(shown.slice(0,4)),answer,duration:8500}}},
  {id:"language-anagram-v1",version:"1.0",category:"language",make:()=>{const rows=[["ご・ん・り","りんご",["ごりん","りごん","ろんぎ"]],["め・が・ね","めがね",["がねめ","ねがめ","めねが"]],["だ・ぱ・ん","ぱんだ",["だんぱ","ぱだん","んだぱ"]]],r=pick(rows);return{kind:"choice",prompt:`並べ替えると？　${r[0]}`,help:"見慣れた言葉になります。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:7000}}},
  {id:"spatial-perspective-v1",version:"1.0",category:"spatial",make:()=>{const dirs=["北","東","南","西"],turns=shuffle([1,1,-1]).slice(0,3),answer=dirs[(turns.reduce((sum,n)=>sum+n,0)+4)%4],text=turns.map(n=>n===1?"右":"左").join(" → ");return{kind:"choice",prompt:`北向きから　${text}`,help:"最後に向いている方角は？",options:shuffle(dirs),answer,duration:8000}}},
  {id:"prediction-double-v1",version:"1.0",category:"prediction",make:()=>{const start=randomInt(1,3),seq=[start,start*2,start*4,start*8],answer=start*16;return{kind:"pattern",prompt:"倍々で増えます。次は？",help:"増え方に注目。",sequence:seq,options:shuffle([...new Set([answer,answer+2,answer/2,answer+start,answer-1])].slice(0,4)).map(String),answer:String(answer),duration:7000}}},
  {id:"inhibition-rule-switch-v1",version:"1.0",category:"inhibition",make:()=>{const n=randomInt(10,29),answer=n%2===0?"押さない":"押す";return{kind:"choice",prompt:`${n}：奇数なら押す、偶数なら押さない`,help:"いつもの偶数問題とルールが逆です。",options:["押す","押さない"],answer,duration:5000}}},
  {id:"calculation-multistep-v1",version:"1.0",category:"calculation",make:()=>{const a=randomInt(3,8),b=randomInt(2,5),c=randomInt(1,6),answer=a*b-c;return{kind:"expression",prompt:"かけ算を先に計算",help:"順番を間違えないで。",expression:`${a} × ${b} − ${c}`,options:shuffle([...new Set([answer,answer+c,answer-1,answer+2,answer+3])].slice(0,4).map(String)),answer:String(answer),duration:7500}}},
  {id:"attention-dual-v1",version:"1.0",category:"attention",make:()=>{const line=Array.from({length:16},()=>pick(["🐶","🐱","🐼","🐰"])),count=line.filter(x=>x==="🐶"||x==="🐼").length,opts=new Set([count]);while(opts.size<4)opts.add(Math.max(0,count+pick([-3,-2,-1,1,2,3])));return{kind:"expression",prompt:"🐶と🐼を合わせて何匹？",help:"2種類だけを同時に数えます。",expression:line.join(" "),options:shuffle([...opts].map(String)),answer:String(count),duration:8500}}},
  {id:"language-english-v1",version:"1.0",category:"language",make:()=>{const rows=[
    {prompt:"Which sentence is grammatically correct?",help:"Choose one sentence.",answer:"She goes to work by train.",wrong:["She go to work by train.","She going to work by train.","She does goes to work by train."]},
    {prompt:"Complete the sentence: I have lived here ___ 2020, and I still live here.",help:"Choose the best word for the blank.",answer:"since",wrong:["for","during","ago"]},
    {prompt:"Which word is closest in meaning to “brief”?",help:"Choose the nearest meaning.",answer:"short",wrong:["noisy","ancient","heavy"]},
    {prompt:"Choose the most natural reply: “Would you like some tea?”",help:"Pick the best response.",answer:"Yes, please.",wrong:["Yes, I like.","Tea is a leaf.","I would some."]}
  ],r=pick(rows);return{kind:"choice",prompt:r.prompt,help:r.help,options:shuffle([r.answer,...r.wrong]),answer:r.answer,duration:8500}}},
  {id:"social-date-v1",version:"1.0",category:"social",make:()=>{const scenario=structuredClone(pick(DATE_SCENARIOS));scenario.steps.forEach(step=>step.choices=shuffle(step.choices));return{kind:"dateSim",prompt:"会話をつないで、デートに誘って",help:"相手の話を受けて、3回選びます。",scenario,duration:18000}}},
  {id:"social-partner-mood-v1",version:"1.0",category:"social",make:()=>{const scenario=structuredClone(PARTNER_MOOD_SCENARIO);scenario.steps.forEach(step=>step.choices=shuffle(step.choices));return{kind:"dateSim",prompt:"不機嫌なパートナーと話して",help:"火に油を注がず、3回会話をつなぎます。",scenario,duration:20000}}}
];

function buildTasks(profile=state.profile,paceMode=profile.paceMode||PACE_STANDARD){
  const recent=new Set(profile.recentTemplates.slice(0,10)),level=currentLevel(profile);
  const available=TASK_FACTORIES.filter(factory=>tierFor(factory.id)<=level);
  const ranked=available.map(factory=>{
    const stat=profile.categoryStats[factory.category],accuracy=stat?.asked?stat.correct/stat.asked:.5;
    const unseen=profile.templateWins[factory.id]?0:1.15;
    return{factory,score:randomFloat()+unseen+(1-accuracy)*.55-(recent.has(factory.id)?.55:0)};
  }).sort((a,b)=>b.score-a.score);
  const chosen=[],counts={},boss=level>=2?available.find(factory=>factory.id==="attention-author-boss-v1"):null,flavors=["classic","satisfying","quirky","wild"],flavorOrder=flavors.sort((a,b)=>available.filter(factory=>flavorFor(factory.id)===a).length-available.filter(factory=>flavorFor(factory.id)===b).length);
  if(boss){flavorOrder.splice(flavorOrder.indexOf("wild"),1);flavorOrder.unshift("wild")}
  flavorOrder.forEach(flavor=>{const item=ranked.find(row=>(flavor!=="wild"||!boss||row.factory===boss)&&flavorFor(row.factory.id)===flavor&&(counts[row.factory.category]||0)<2);if(item){chosen.push(item.factory);counts[item.factory.category]=(counts[item.factory.category]||0)+1}});
  for(const item of ranked){if(chosen.length===SESSION_SIZE)break;if(chosen.includes(item.factory)||(counts[item.factory.category]||0)>=2)continue;chosen.push(item.factory);counts[item.factory.category]=(counts[item.factory.category]||0)+1}
  for(const item of ranked){if(chosen.length===SESSION_SIZE)break;if(!chosen.includes(item.factory))chosen.push(item.factory)}
  if(boss&&!chosen.includes(boss)){const same=chosen.map((factory,index)=>factory.category===boss.category?index:-1).filter(index=>index>=0),wild=chosen.findIndex(factory=>flavorFor(factory.id)==="wild"),replace=same.length>=2?same.at(-1):wild>=0?wild:chosen.length-1;chosen[replace]=boss}
  let ordered=shuffle(chosen);
  if(boss&&ordered.includes(boss)){ordered=shuffle(ordered.filter(factory=>factory!==boss));ordered.splice(Math.min(5,ordered.length),0,boss)}
  return ordered.map(factory=>tuneTaskForPace({templateId:factory.id,introducedIn:factory.version,tier:tierFor(factory.id),flavor:flavorFor(factory.id),category:factory.category,...factory.make()},paceMode));
}

let cooldownTicker=null,questionTimers=[],timerRaf=null,extraRafs=[],deadlineTimeout=null,questionAnswered=false,questionStartedAt=0;
function clearQuestionTimers(){questionTimers.forEach(clearTimeout);questionTimers=[];clearTimeout(deadlineTimeout);deadlineTimeout=null;cancelAnimationFrame(timerRaf);timerRaf=null;extraRafs.forEach(token=>cancelAnimationFrame(typeof token==="object"?token.id:token));extraRafs=[]}
function later(fn,ms){const id=setTimeout(fn,ms);questionTimers.push(id);return id}
function showView(id){["home-view","game-view","result-view"].forEach(x=>$(x).hidden=x!==id);window.scrollTo(0,0)}
function formatRemaining(ms){const total=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;return h?`${h}時間 ${String(m).padStart(2,"0")}分`:m?`${m}分 ${String(s).padStart(2,"0")}秒`:`${s}秒`}
function gradeFor(score){return GRADES.find(g=>score>=g.min)||GRADES.at(-1)}

function renderHome(){
  clearQuestionTimers();$("feedback").hidden=true;showView("home-view");
  $("profile-avatar").textContent=state.profile.avatar;$("profile-name").textContent=state.profile.name;
  const selectedPace=state.profile.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD,sessionPace=state.activeSession?.paceMode||PACE_STANDARD;
  $("pace-note").textContent=state.activeSession&&sessionPace!==selectedPace?`進行中は${sessionPace===PACE_RELAXED?"ゆったり":"標準"}。次のセットから${selectedPace===PACE_RELAXED?"ゆったり":"標準"}です。`:selectedPace===PACE_RELAXED?"ゆったりモード（番付対象外）":"標準モード（番付対象）";
  const level=currentLevel(),breadth=breadthPoints(),xpTarget=level*120,breadthTarget=level*6;
  $("level-value").textContent=level;$("xp-value").textContent=`${state.profile.xp.toLocaleString("ja-JP")} XP`;
  $("xp-next").textContent=`${Math.min(state.profile.xp,xpTarget)} / ${xpTarget}`;$("breadth-next").textContent=`${Math.min(breadth,breadthTarget)} / ${breadthTarget}`;
  $("xp-bar").style.width=`${clamp((state.profile.xp-(level-1)*120)/120*100,0,100)}%`;
  $("breadth-bar").style.width=`${clamp((breadth-(level-1)*6)/6*100,0,100)}%`;
  const unlocked=TASK_FACTORIES.filter(factory=>tierFor(factory.id)<=level).length;
  $("unlock-note").textContent=`Tier ${Math.min(level,3)}まで ${unlocked}/${TASK_FACTORIES.length}タイプ解放中。レベルには経験値と問題の幅が必要です。`;
  renderCategoryStats();refreshHomeButton();clearInterval(cooldownTicker);cooldownTicker=setInterval(refreshHomeButton,1000);
}
function refreshHomeButton(){
  const button=$("start-button"),text=$("cooldown-text");
  if(state.activeSession){button.disabled=false;button.textContent=`${state.activeSession.currentIndex+1}問目からつづける`;text.textContent=`回答済み${state.activeSession.currentIndex}問の経験値と得意度は反映済み。残りの問題は保存されています。`;text.className="cooldown";return}
  const now=Date.now(),window=trainingWindowStatus(state.profile,now),remaining=(state.cooldownUntil||0)-now,completed=window.sets,phase=completed<SETS_PER_BLOCK?`前半 ${completed}/${SETS_PER_BLOCK}`:`後半 ${completed-SETS_PER_BLOCK}/${SETS_PER_BLOCK}`;
  if(remaining<=0&&window.remaining>0){button.disabled=false;button.textContent=state.profile.sessionsCompleted?"次の老いを測る":"はじめての老いを測る";text.textContent=`20時間枠：${phase}・残り${window.remaining}セット`;text.className="cooldown ready"}
  else{button.disabled=true;button.textContent=completed>=MAX_SETS_PER_WINDOW?"6セット完了":"10分休憩中";text.textContent=completed>=MAX_SETS_PER_WINDOW?`次の20時間枠まで ${formatRemaining(Math.max(0,window.endsAt-now))}`:`前半3セット完了。後半まで ${formatRemaining(Math.max(0,remaining))}`;text.className="cooldown"}
}
function renderCategoryStats(){
  const stats=state.profile.categoryStats,card=$("category-card"),root=$("category-bars");root.replaceChildren();
  const entries=Object.entries(CATEGORIES).filter(([key])=>stats[key]?.asked);
  card.hidden=!entries.length;if(!entries.length)return;
  $("session-count").textContent=`${state.profile.sessionsCompleted}セット`;
  entries.forEach(([key,meta])=>{const s=stats[key],pct=Math.round(s.correct/s.asked*100),row=document.createElement("div");row.className="category-row";const label=document.createElement("span");label.className="category-label";label.textContent=`${meta.icon} ${meta.label}`;const track=document.createElement("span");track.className="category-track";const fill=document.createElement("i");fill.style.width=`${pct}%`;track.append(fill);const value=document.createElement("span");value.className="category-pct";value.textContent=`${pct}%`;row.append(label,track,value);root.append(row)});
}

function startOrResume(){
  if(state.activeSession){renderCurrentTask();return}
  const now=Date.now(),window=trainingWindowStatus();
  if(window.expired){state.profile.trainingWindowStartedAt=0;state.profile.setsInWindow=0;state.cooldownUntil=0}
  if((state.cooldownUntil||0)>now||state.profile.setsInWindow>=MAX_SETS_PER_WINDOW)return;
  if(!state.profile.trainingWindowStartedAt)state.profile.trainingWindowStartedAt=now;
  const paceMode=state.profile.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD;
  state.activeSession={id:uuid(),startedAt:now,trainingWindowStartedAt:state.profile.trainingWindowStartedAt,contentPack:CONTENT_PACK,paceMode,tasks:buildTasks(state.profile,paceMode),currentIndex:0,answers:[],earnedXp:0};
  state.pendingResult=false;saveState();renderCurrentTask();
}
function renderCurrentTask(){
  clearInterval(cooldownTicker);clearQuestionTimers();$("feedback").hidden=true;
  const session=state.activeSession;if(!session)return renderHome();
  if(session.currentIndex>=session.tasks.length){finalizeSession();return}
  questionAnswered=false;questionStartedAt=performance.now();showView("game-view");
  const index=session.currentIndex,task=session.tasks[index],meta=CATEGORIES[task.category];
  $("question-count").textContent=`${index+1} / ${session.tasks.length}`;$("game-xp").textContent=`+${session.earnedXp||0} XP`;$("game-level").textContent=`Lv.${currentLevel()}`;
  $("game-progress-bar").style.width=`${(index+1)/session.tasks.length*100}%`;
  $("category-icon").textContent=meta.icon;$("category-name").textContent=meta.label;$("task-tier").textContent=`Tier ${task.tier||1}`;
  const reveal=$("category-reveal");reveal.classList.remove("category-reveal");void reveal.offsetWidth;reveal.classList.add("category-reveal");
  $("question-kicker").textContent=`問題タイプ · ${meta.label}${session.paceMode===PACE_RELAXED?" · ゆったり":""}`;$("question-prompt").textContent=task.prompt;$("question-help").textContent=task.help||"";$("challenge").replaceChildren();$("timer-bar").parentElement.hidden=false;
  renderTask(task);
}
function startDeadline(duration,onExpire){
  const started=performance.now(),bar=$("timer-bar");bar.style.width="100%";
  const paint=now=>{const left=clamp(1-(now-started)/duration,0,1);bar.style.width=`${left*100}%`;if(left>0&&!questionAnswered)timerRaf=requestAnimationFrame(paint)};timerRaf=requestAnimationFrame(paint);
  deadlineTimeout=setTimeout(()=>{if(!questionAnswered)onExpire()},duration);
}
function makeChoices(task,{disabled=false,symbol=false,onChoose=null}={}){
  const wrap=document.createElement("div");wrap.className="choices";
  task.options.forEach(value=>{const button=document.createElement("button");button.type="button";button.className=`choice${symbol?" symbol":""}${task.options.length===3&&task.options.indexOf(value)===2?" full":""}`;button.textContent=value;button.disabled=disabled;button.addEventListener("click",()=>{(onChoose||((v)=>finishTask(v===task.answer,{answerLabel:task.answer})))(value)});wrap.append(button)});
  $("challenge").append(wrap);return wrap;
}
function createStage3D(sceneClass,label){
  const root=document.createElement("div"),world=document.createElement("div");root.className=`stage3d ${sceneClass}`;root.setAttribute("role","group");root.setAttribute("aria-label",label);world.className="stage3d-world";root.append(world);return{root,world};
}
function addEmojiEntity(world,{emoji,label,x,y,z=0,scale=1,onSelect}){
  const button=document.createElement("button");button.type="button";button.className="stage3d-entity";button.textContent=emoji;button.setAttribute("aria-label",label||emoji);button.style.setProperty("--entity-x",`${x}%`);button.style.setProperty("--entity-y",`${y}%`);button.style.setProperty("--entity-z",`${z}px`);button.style.setProperty("--entity-scale",scale);button.addEventListener("click",onSelect);world.append(button);return button;
}
function genericTimeout(task){finishTask(false,{detail:"時間切れです。脳は定時退社しました。",answerLabel:task.answer})}
function renderTask(task){
  const root=$("challenge");
  if(task.kind==="choice"){makeChoices(task);startDeadline(task.duration,()=>genericTimeout(task));return}
  if(task.kind==="expression"||task.kind==="compare"){
    const visual=document.createElement("div");visual.className=task.kind==="expression"?"expression":"pattern-line";visual.textContent=task.kind==="expression"?task.expression:task.options.join("　vs　");root.append(visual);makeChoices(task);startDeadline(task.duration,()=>genericTimeout(task));return
  }
  if(task.kind==="rotation"){
    const visual=document.createElement("div");visual.className="big-symbol";visual.textContent=task.symbol;root.append(visual);makeChoices(task,{symbol:true});startDeadline(task.duration,()=>genericTimeout(task));return
  }
  if(task.kind==="pattern"){
    const line=document.createElement("div");line.className="pattern-line";task.sequence.forEach(value=>{const s=document.createElement("span");s.textContent=value;line.append(s)});const q=document.createElement("span");q.className="unknown";q.textContent="?";line.append(q);root.append(line);makeChoices(task,{symbol:true});startDeadline(task.duration,()=>genericTimeout(task));return
  }
  if(task.kind==="flanker"){
    const line=document.createElement("div");line.className="expression";line.textContent=task.line;root.append(line);makeChoices(task,{symbol:true});startDeadline(task.duration,()=>genericTimeout(task));return
  }
  if(task.kind==="stroop"){
    const word=document.createElement("div");word.className=`stroop-word ${COLOR_CLASSES[task.ink]}`;word.textContent=task.word;root.append(word);makeChoices(task);startDeadline(task.duration,()=>genericTimeout(task));return
  }
  if(task.kind==="signal"){
    const button=document.createElement("button");button.type="button";button.className="signal-button";button.textContent="まだ…";let goAt=0;button.addEventListener("click",()=>{if(!goAt){finishTask(false,{detail:"フライングです。若さが暴走しました。"});return}const ms=performance.now()-goAt;finishTask(ms<=1500,{reactionMs:Math.round(ms),quality:clamp(1-(ms-180)/1500,0,1),detail:ms<=1500?`${Math.round(ms)} ms`:`${Math.round(ms)} ms。少し遅かったようです。`})});root.append(button);later(()=>{if(questionAnswered)return;goAt=performance.now();button.textContent="いま！";button.classList.add("go")},task.delay);startDeadline(task.duration,()=>finishTask(false,{detail:"合図は帰りました。"}));return
  }
  if(task.kind==="target"){
    const arena=document.createElement("div");arena.className="target-arena";const target=document.createElement("button");target.type="button";target.className="moving-target";target.setAttribute("aria-label","紫の的");target.hidden=true;let appeared=0,caught=false,x=0,y=0,vx=0,vy=0;const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;const catchTarget=event=>{event.preventDefault();event.stopPropagation();if(caught||questionAnswered||!appeared)return;caught=true;const ms=performance.now()-appeared;finishTask(true,{reactionMs:Math.round(ms),quality:clamp(1-ms/4000,0,1),detail:`確保まで ${Math.round(ms)} ms`})};target.addEventListener("pointerdown",catchTarget);target.addEventListener("click",event=>{event.stopPropagation();if(event.detail===0)catchTarget(event)});arena.addEventListener("click",event=>{if(event.target===target||target.contains(event.target))return;finishTask(false,{detail:"そこにはもう、紫はいません。"})});arena.append(target);root.append(arena);
    later(()=>{if(questionAnswered)return;appeared=performance.now();target.hidden=false;const width=arena.clientWidth,height=arena.clientHeight,maxX=Math.max(0,width-target.offsetWidth),maxY=Math.max(0,height-target.offsetHeight);x=clamp(task.x/100*width,0,maxX);y=clamp(task.y/100*height,0,maxY);const paint=()=>{target.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`};paint();if(reducedMotion)return;const xSpeed=()=>arena.clientWidth*(.4+randomFloat()*.1),ySpeed=()=>arena.clientHeight*(.36+randomFloat()*.1);vx=(randomFloat()<.5?-1:1)*xSpeed();vy=(randomFloat()<.5?-1:1)*ySpeed();let last=performance.now();const token={id:null};extraRafs.push(token);const tick=now=>{if(questionAnswered)return;const dt=Math.min(Math.max((now-last)/1000,0),.04),right=Math.max(0,arena.clientWidth-target.offsetWidth),bottom=Math.max(0,arena.clientHeight-target.offsetHeight);last=now;x+=vx*dt;y+=vy*dt;if(x<=0){x=0;vx=xSpeed()}else if(x>=right){x=right;vx=-xSpeed()}if(y<=0){y=0;vy=ySpeed()}else if(y>=bottom){y=bottom;vy=-ySpeed()}paint();token.id=requestAnimationFrame(tick)};token.id=requestAnimationFrame(tick)},450);startDeadline(task.duration,()=>finishTask(false,{detail:"紫は逃げ切りました。"}));return
  }
  if(task.kind==="memoryPath"){renderMemoryPath(task);return}
  if(task.kind==="flashChoice"){renderFlashChoice(task);return}
  if(task.kind==="cube"){renderCube(task);return}
  if(task.kind==="countShapes"){renderCountShapes(task);return}
  if(task.kind==="oddGrid"){renderOddGrid(task);return}
  if(task.kind==="timing"){renderTiming(task);return}
  if(task.kind==="runner"){renderRunner(task);return}
  if(task.kind==="authorBoss"){renderAuthorBoss(task);return}
  if(task.kind==="emojiFps"){renderEmojiFps(task);return}
  if(task.kind==="lane3d"){renderLane3D(task);return}
  if(task.kind==="golfPutt"){renderGolfPutt(task);return}
  if(task.kind==="dateSim"){renderDateSim(task);return}
}
function renderMemoryPath(task){
  const grid=document.createElement("div");grid.className="memory-grid";const buttons=[];for(let i=0;i<9;i++){const b=document.createElement("button");b.type="button";b.className="memory-tile";b.disabled=true;b.setAttribute("aria-label",`${i+1}番のマス`);grid.append(b);buttons.push(b)}$("challenge").append(grid);
  task.path.forEach((index,step)=>{const startsAt=MEMORY_PATH_FLASH_START_MS+step*MEMORY_PATH_FLASH_STEP_MS;later(()=>buttons[index].classList.add("flash"),startsAt);later(()=>buttons[index].classList.remove("flash"),startsAt+MEMORY_PATH_FLASH_ON_MS)});
  later(()=>{let cursor=0;$("question-help").textContent="同じ順番でタップしてください。";buttons.forEach((button,index)=>{button.disabled=false;button.addEventListener("click",()=>{if(index!==task.path[cursor]){button.classList.add("wrong");finishTask(false,{detail:"順番が迷子になりました。"});return}button.classList.add("chosen");later(()=>button.classList.remove("chosen"),180);cursor++;if(cursor===task.path.length)finishTask(true,{quality:clamp(1-(performance.now()-questionStartedAt)/9000,0,1),detail:"順番どおりです。"})})});startDeadline(task.duration,()=>finishTask(false,{detail:"記憶が時間切れになりました。"}))},task.recallAfterMs||MEMORY_PATH_RECALL_MS);
}
function renderFlashChoice(task){
  const items=document.createElement("div");items.className="flash-items";task.shown.forEach(value=>{const s=document.createElement("span");s.textContent=value;items.append(s)});$("challenge").append(items);const choices=makeChoices(task,{disabled:true,symbol:true});choices.hidden=true;
  later(()=>{items.classList.add("covered");$("question-help").textContent=task.afterHelp||"さっき、なかったものは？";choices.hidden=false;choices.querySelectorAll("button").forEach(b=>b.disabled=false);startDeadline(task.duration,()=>genericTimeout(task))},task.exposureMs||FLASH_EXPOSURE_MS);
}
function renderCube(task){
  const scene=createStage3D("cube-scene","色を隠して順番に回転する立方体"),view=document.createElement("div"),cube=document.createElement("div"),turns=document.createElement("div");view.className="cube-view";cube.className="cube";turns.className="cube-turns";turns.hidden=true;turns.setAttribute("aria-label",`回転順: ${task.turns.map(turn=>CUBE_TURN_LABELS[turn]).join("、")}`);const badges=task.turns.map((turn,index)=>{const badge=document.createElement("span");badge.textContent=`${index+1}. ${CUBE_TURN_LABELS[turn]}`;turns.append(badge);return badge}),names=["front","right","back","left","top","bottom"];names.forEach((name,index)=>{const face=document.createElement("div");face.className=`cube-face cube-${name}`;face.style.background=task.colors[index].hex;face.textContent=task.colors[index].name;face.setAttribute("aria-hidden","true");cube.append(face)});view.append(cube);scene.world.append(view);$("challenge").append(scene.root,turns);const choices=makeChoices(task,{disabled:true}),reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches,turnDelay=reducedMotion?320:700,rotations={right:[0,1,0,-90],left:[0,1,0,90],up:[1,0,0,-90],down:[1,0,0,90]};
  later(()=>{if(questionAnswered)return;cube.classList.add("masked");turns.hidden=false;$("question-help").textContent=`色は隠れました。${task.turns.map(turn=>CUBE_TURN_LABELS[turn]).join(" → ")} の順です。`;let matrix=new DOMMatrix(),step=0;const advance=()=>{if(questionAnswered)return;if(step>=task.turns.length){badges.forEach(badge=>{badge.classList.remove("active");badge.classList.add("done")});choices.querySelectorAll("button").forEach(button=>button.disabled=false);$("question-help").textContent="最後に正面へ来た色を、記憶で選んで。";startDeadline(task.duration,()=>genericTimeout(task));return}badges.forEach((badge,index)=>{badge.classList.toggle("active",index===step);badge.classList.toggle("done",index<step)});const [x,y,z,degrees]=rotations[task.turns[step]];matrix=new DOMMatrix().rotateAxisAngle(x,y,z,degrees).multiply(matrix);cube.style.transform=matrix.toString();step++;later(advance,turnDelay)};later(advance,reducedMotion?120:260)},2400);
}
function renderCountShapes(task){
  const colors={purple:"#A66DC2",green:"#62A384",orange:"#D88745"},grid=document.createElement("div");grid.className="shape-grid";task.cells.forEach(cell=>{const s=document.createElement("span");s.className=`shape ${cell.shape}`;s.style.setProperty("--shape-color",colors[cell.color]);grid.append(s)});$("challenge").append(grid);makeChoices(task);startDeadline(task.duration,()=>genericTimeout(task));
}
function renderOddGrid(task){
  const grid=document.createElement("div");grid.className="odd-grid";for(let i=0;i<25;i++){const b=document.createElement("button");b.type="button";b.className="odd-cell";b.textContent=i===task.oddIndex?task.odd:task.normal;b.setAttribute("aria-label",`${i+1}番目 ${b.textContent}`);b.addEventListener("click",()=>finishTask(i===task.oddIndex,{detail:i===task.oddIndex?"見つかってしまいました。":"そっくりさんでした。"}));grid.append(b)}$("challenge").append(grid);startDeadline(task.duration,()=>finishTask(false,{detail:"違うものは群衆に紛れました。"}));
}
function renderTiming(task){
  const display=document.createElement("div");display.className="timing-display";const orb=document.createElement("div");orb.className="timing-orb";display.append(orb);const button=document.createElement("button");button.type="button";button.className="signal-button";button.textContent="3";button.disabled=true;button.setAttribute("aria-live","polite");let started=0;const seconds=task.targetSeconds||3,target=seconds*1000,tolerance=task.toleranceMs||650;
  const begin=()=>{if(questionAnswered)return;started=performance.now();button.disabled=false;button.textContent=`${seconds}秒だと思ったら、タップ！`;orb.classList.add("running");$("question-help").textContent="数字は出ません。己を信じて。";button.focus({preventScroll:true});startDeadline(target+2200,()=>finishTask(false,{detail:`${seconds+2}秒を超えました。時空から戻ってください。`}))};
  button.addEventListener("click",()=>{if(!started)return;const elapsed=performance.now()-started,diff=Math.abs(elapsed-target),ok=diff<=tolerance;finishTask(ok,{reactionMs:Math.round(elapsed),quality:clamp(1-diff/(tolerance*2.6),0,1),detail:`あなたの${seconds}秒は ${(elapsed/1000).toFixed(2)} 秒でした。`})});$("challenge").append(display,button);$("question-help").textContent="3・2・1のあと、自動で計測が始まります。";$("timer-bar").parentElement.hidden=true;$("timer-bar").style.width="100%";later(()=>button.textContent="2",1000);later(()=>button.textContent="1",2000);later(begin,3000);
}
function renderRunner(task){
  const scene=document.createElement("div"),hero=document.createElement("span"),obstacle=document.createElement("span"),ground=document.createElement("div"),cue=document.createElement("span"),leadIn=task.leadInMs||1500;scene.className="runner-stage";scene.setAttribute("role","button");scene.tabIndex=0;scene.setAttribute("aria-label","よーい。丸太が走り出したらタップでジャンプ");hero.className="runner-hero";hero.textContent=task.hero;obstacle.className="runner-obstacle";obstacle.textContent="🪵";obstacle.hidden=true;ground.className="runner-ground";ground.innerHTML="<span>🌳</span><span>🐿️</span><span>🌲</span><span>🐢</span>";cue.className="runner-cue";cue.textContent="よーい…";cue.setAttribute("aria-live","polite");scene.append(ground,hero,obstacle,cue);$("challenge").append(scene);$("timer-bar").style.width="100%";
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){let ready=false;const dodge=()=>{if(!ready||questionAnswered)return;finishTask(true,{detail:"静止画モードで、丸太を回避しました。"})};scene.addEventListener("click",dodge);scene.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();dodge()}});later(()=>{if(questionAnswered)return;ready=true;cue.remove();obstacle.hidden=false;obstacle.style.left="24%";scene.setAttribute("aria-label","丸太が現れました。タップで回避");$("question-help").textContent="丸太が現れました。タップで回避。";startDeadline(task.duration,()=>finishTask(false,{detail:"丸太が待ちくたびれました。"}))},leadIn);return}
  let jumpAt=0,start=0,running=false,token={id:null},travel=task.travelMs||2800,jumpDuration=780*Math.max(1,travel/2800);extraRafs.push(token);const jump=()=>{if(!running)return;const now=performance.now();if(!jumpAt||now-jumpAt>jumpDuration)jumpAt=now};scene.addEventListener("click",jump);scene.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();jump()}});
  const requiredClearance=task.runnerClearance||38;const tick=now=>{if(questionAnswered)return;const elapsed=now-start,x=110-elapsed/travel*125,jumpElapsed=now-jumpAt,y=jumpAt&&jumpElapsed<jumpDuration?Math.sin(jumpElapsed/jumpDuration*Math.PI)*76:0;hero.style.transform=`translateY(${-y}px)`;obstacle.style.left=`${x}%`;if(x<30&&x>14&&y<requiredClearance){finishTask(false,{detail:"丸太に老いを置いてきました。"});return}if(x<4){finishTask(true,{quality:clamp(1-elapsed/6000,0,1),detail:"華麗なひと跳びです。"});return}token.id=requestAnimationFrame(tick)};
  later(()=>{if(questionAnswered)return;running=true;start=performance.now();cue.remove();obstacle.hidden=false;scene.setAttribute("aria-label","丸太が走り出しました。タップでジャンプ");$("question-help").textContent="丸太が走り出しました。タイミングを見てタップ。";token.id=requestAnimationFrame(tick);startDeadline(task.duration,()=>finishTask(false,{detail:"ゴールが先に帰りました。"}))},leadIn);
}
function renderAuthorBoss(task){
  const scene=createStage3D("boss-stage","変則ムーブで逃げる作者アイコン"),button=document.createElement("button"),img=document.createElement("img"),counter=document.createElement("span"),modeStatus=document.createElement("span");button.type="button";button.className="boss-target";button.setAttribute("aria-label","中ボスの作者");img.src="author.png";img.alt="";counter.className="boss-counter";counter.textContent=`0 / ${task.hits}`;modeStatus.className="boss-mode";modeStatus.setAttribute("aria-live","polite");button.append(img);scene.world.append(button,counter,modeStatus);$("challenge").append(scene.root);
  let hits=0,ready=false,activeMode="",ghost=null,last={x:-99,y:-99};const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches,modes=shuffle(["afterimage","dance","vanish"]);const position=(range={x:[6,56],y:[18,48]})=>{let next;for(let i=0;i<12;i++){next={x:randomInt(...range.x),y:randomInt(...range.y)};if(Math.hypot(next.x-last.x,next.y-last.y)>=22)break}last=next;return next};const place=pos=>{button.style.left=`${pos.x}%`;button.style.top=`${pos.y}%`;button.style.setProperty("--boss-turn",`${randomInt(-14,14)}deg`)};const clearVisuals=()=>{ready=false;button.classList.remove("dance","returning","bonk");ghost?.remove();ghost=null};const show=pos=>{place(pos);button.hidden=false;ready=true};
  const danceStep=()=>{if(questionAnswered||!ready||activeMode!=="dance")return;button.style.setProperty("--dance-x1",`${randomInt(-38,-24)}px`);button.style.setProperty("--dance-y1",`${randomInt(-12,5)}px`);button.style.setProperty("--dance-x2",`${randomInt(25,40)}px`);button.style.setProperty("--dance-y2",`${randomInt(-5,13)}px`);button.style.setProperty("--dance-x3",`${randomInt(-25,22)}px`);button.style.setProperty("--dance-y3",`${randomInt(-14,14)}px`);button.classList.remove("dance");void button.offsetWidth;button.classList.add("dance");later(danceStep,reducedMotion?1800:1650)};
  const enterMode=()=>{clearVisuals();activeMode=modes[hits];modeStatus.dataset.mode=activeMode;if(activeMode==="afterimage"){const pos=position();modeStatus.textContent="残像の先を読め";button.hidden=true;ghost=document.createElement("span");ghost.className="boss-afterimage";ghost.setAttribute("aria-hidden","true");const ghostImg=document.createElement("img");ghostImg.src="author.png";ghostImg.alt="";ghost.append(ghostImg);ghost.style.left=`${pos.x}%`;ghost.style.top=`${pos.y}%`;scene.world.append(ghost);later(()=>{if(questionAnswered)return;ghost?.remove();ghost=null;show(pos);modeStatus.textContent="瞬間移動！"},reducedMotion?650:520);return}if(activeMode==="dance"){modeStatus.textContent="フェイントダンス";show(position({x:[18,40],y:[20,38]}));danceStep();return}const side=randomFloat()<.5?"left":"right",pos=position({x:side==="left"?[6,14]:[50,56],y:[18,44]});modeStatus.textContent="画面外へ逃走…";button.hidden=true;later(()=>{if(questionAnswered)return;place(pos);button.style.setProperty("--return-x",side==="left"?"-115px":"115px");button.hidden=false;button.classList.add("returning");ready=true;modeStatus.textContent="突然帰還！"},reducedMotion?600:430)};
  const catchBoss=event=>{event.preventDefault();event.stopPropagation();if(!ready||questionAnswered)return;ready=false;button.classList.remove("dance","returning");hits++;counter.textContent=`${hits} / ${task.hits}`;button.classList.remove("bonk");void button.offsetWidth;button.classList.add("bonk");if(hits>=task.hits){clearVisuals();finishTask(true,{quality:clamp(1-(performance.now()-questionStartedAt)/task.duration,0,1),detail:"変則ムーブごと作者を確保しました。"});return}later(enterMode,240)};button.addEventListener("pointerdown",catchBoss);button.addEventListener("click",event=>{event.stopPropagation();if(event.detail===0)catchBoss(event)});enterMode();startDeadline(task.duration,()=>{clearVisuals();finishTask(false,{detail:"作者は変則ムーブで締切の向こうへ逃げました。"})});
}
function renderEmojiFps(task){
  const scene=createStage3D("fps-stage","絵文字をロックオンする3D通路"),tunnel=document.createElement("div"),crosshair=document.createElement("span"),counter=document.createElement("span"),positions=[[21,25,-30,.9],[49,22,20,1.05],[76,28,-10,.95],[29,50,35,1.13],[67,52,5,1],[20,69,-20,.88],[49,72,45,1.16],[78,67,-5,.94]];tunnel.className="fps-tunnel";crosshair.className="fps-crosshair";crosshair.textContent="＋";counter.className="fps-counter";counter.textContent="LOCK 0 / 3";scene.world.append(tunnel,crosshair,counter);$("challenge").append(scene.root);let hits=0;task.targets.forEach((emoji,index)=>{const [x,y,z,scale]=positions[index],entity=addEmojiEntity(scene.world,{emoji,label:`${emoji}をロックオン`,x,y,z,scale,onSelect:event=>{event.stopPropagation();if(emoji!=="🤓"){finishTask(false,{detail:`${emoji}は一般通行人でした。`});return}event.currentTarget.remove();hits++;counter.textContent=`LOCK ${hits} / 3`;if(hits===3)finishTask(true,{quality:clamp(1-(performance.now()-questionStartedAt)/task.duration,0,1),detail:"🤓を全員ロックオンしました。"})}});entity.classList.add("fps-target");entity.style.setProperty("--float-delay",`${index*-.18}s`)});startDeadline(task.duration,()=>finishTask(false,{detail:"🤓が3D通路へ消えました。"}));
}
function renderLane3D(task){
  const scene=createStage3D("lane-stage","三本のレーンがある3D道路"),road=document.createElement("div");road.className="lane-road";task.lanes.forEach((emoji,index)=>{const lane=document.createElement("div");lane.className="lane-strip";const marker=document.createElement("span");marker.textContent=emoji;marker.setAttribute("aria-hidden","true");lane.append(marker);road.append(lane)});scene.world.append(road);$("challenge").append(scene.root);makeChoices(task);startDeadline(task.duration,()=>genericTimeout(task));
}
function renderDateSim(task){
  const scenario=task.scenario,scene=document.createElement("div"),portrait=document.createElement("figure"),img=document.createElement("img"),copy=document.createElement("div"),badge=document.createElement("span"),speech=document.createElement("p"),hearts=document.createElement("div"),choices=document.createElement("div");scene.className="date-scene";portrait.className="date-portrait";img.src=scenario.image;img.alt=scenario.alt;img.addEventListener("error",()=>{img.hidden=true;portrait.classList.add("fallback")});portrait.append(img);copy.className="date-copy";badge.className="date-badge";badge.textContent=`${scenario.name}・${scenario.age}歳　${scenario.role}`;speech.className="date-speech";hearts.className="date-hearts";choices.className="date-choices";copy.append(badge,speech,hearts);scene.append(portrait,copy);$("challenge").append(scene,choices);let stepIndex=0;
  const paint=()=>{const step=scenario.steps[stepIndex];speech.textContent=`「${step.line}」`;hearts.textContent=`${"♥".repeat(stepIndex)}${"♡".repeat(scenario.steps.length-stepIndex)}`;choices.replaceChildren();step.choices.forEach(value=>{const button=document.createElement("button");button.type="button";button.textContent=value;button.addEventListener("click",()=>{if(value!==step.answer){finishTask(false,{detail:scenario.failureDetail||"会話はここでクランクアップしました。"});return}stepIndex++;if(stepIndex>=scenario.steps.length){speech.textContent=`「${scenario.closing}」`;hearts.textContent="♥♥♥";choices.replaceChildren();later(()=>finishTask(true,{quality:clamp(1-(performance.now()-questionStartedAt)/task.duration,0,1),detail:scenario.successDetail||`${scenario.name}とのデート成立。予定表も動きました。`}),450)}else paint()});choices.append(button)})};paint();startDeadline(task.duration,()=>finishTask(false,{detail:"考えている間に、閉館時間になりました。"}));
}
function renderGolfPutt(task){
  const scene=createStage3D("golf-stage","起伏のあるパターゴルフのグリーン"),green=document.createElement("div"),hole=document.createElement("span"),ball=document.createElement("span"),putter=document.createElement("span"),aim=document.createElement("span"),slope=document.createElement("span");green.className="golf-green";green.tabIndex=0;green.setAttribute("role","button");green.setAttribute("aria-label","白いボールを押さえ、打ちたい方向と反対へ引いて離す。キーボードではEnterで打つ");hole.className="golf-hole";hole.textContent="⛳";ball.className="golf-ball";putter.className="golf-putter";putter.textContent="⌟";aim.className="golf-aim";aim.hidden=true;slope.className="golf-slope";slope.textContent="傾斜 ➜";hole.style.left=`${task.hole.x}%`;hole.style.top=`${task.hole.y}%`;ball.style.left=`${task.ball.x}%`;ball.style.top=`${task.ball.y}%`;putter.style.left=`${task.ball.x}%`;putter.style.top=`${task.ball.y}%`;slope.style.transform=`rotate(${Math.atan2(task.slope.y,task.slope.x)*180/Math.PI}deg)`;
  task.mounds.forEach(mound=>{const bump=document.createElement("i");bump.className="golf-mound";bump.style.left=`${mound.x}%`;bump.style.top=`${mound.y}%`;bump.style.width=`${mound.size}px`;bump.style.height=`${mound.size}px`;green.append(bump)});green.append(hole,aim,ball,putter,slope);scene.world.append(green);$("challenge").append(scene.root);
  let dragging=false,played=false,start={x:0,y:0},pull={x:0,y:0};const powerScale=2,vector=(dx,dy)=>({x:dx,y:dy,length:Math.hypot(dx,dy)});const paintPutter=(shotX,shotY)=>{const length=Math.max(1,Math.hypot(shotX,shotY)),visual=Math.min(58,Math.max(22,length*.42)),ux=shotX/length,uy=shotY/length;putter.style.setProperty("--pull-x",`${(-ux*visual).toFixed(1)}px`);putter.style.setProperty("--pull-y",`${(-uy*visual).toFixed(1)}px`);putter.style.setProperty("--strike-x",`${(ux*10).toFixed(1)}px`);putter.style.setProperty("--strike-y",`${(uy*10).toFixed(1)}px`);putter.style.setProperty("--putter-angle",`${(Math.atan2(shotY,shotX)*180/Math.PI+45).toFixed(1)}deg`)};const ideal=()=>{const rect=green.getBoundingClientRect();return{x:(task.hole.x-task.ball.x-task.slope.x)*rect.width/100,y:(task.hole.y-task.ball.y-task.slope.y)*rect.height/100}};paintPutter(ideal().x,ideal().y);
  const putt=(dx,dy)=>{const shot=vector(dx,dy);if(played||shot.length<18)return;played=true;aim.hidden=true;paintPutter(shot.x,shot.y);putter.classList.remove("swing");void putter.offsetWidth;putter.classList.add("swing");const rect=green.getBoundingClientRect(),shotX=shot.x/rect.width*100,shotY=shot.y/rect.height*100,finalX=clamp(task.ball.x+shotX+task.slope.x,3,97),finalY=clamp(task.ball.y+shotY+task.slope.y,3,97);ball.classList.add("putting");ball.style.left=`${finalX}%`;ball.style.top=`${finalY}%`;later(()=>{const distance=Math.hypot(finalX-task.hole.x,finalY-task.hole.y),inside=distance<=7.5;if(inside){ball.classList.add("in-hole");finishTask(true,{quality:clamp(1-distance/8,0,1),detail:"ナイスイン！引きと傾斜を読み切りました。"})}else finishTask(false,{detail:`カップまで、あと${Math.max(1,Math.round(distance))}歩でした。`})},950)};
  green.addEventListener("keydown",event=>{if(event.key!=="Enter"&&event.key!==" ")return;event.preventDefault();const shot=ideal();putt(shot.x,shot.y)});
  green.addEventListener("pointerdown",event=>{if(played)return;const b=ball.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;if(Math.hypot(event.clientX-cx,event.clientY-cy)>48){$("question-help").textContent="白いボールを押さえ、打ちたい方向と反対へ引きます。";return}event.preventDefault();dragging=true;start={x:event.clientX,y:event.clientY};pull={x:0,y:0};try{green.setPointerCapture?.(event.pointerId)}catch{}aim.hidden=false;aim.style.left=`${task.ball.x}%`;aim.style.top=`${task.ball.y}%`});
  green.addEventListener("pointermove",event=>{if(!dragging)return;event.preventDefault();pull=vector(event.clientX-start.x,event.clientY-start.y);const shotX=-pull.x*powerScale,shotY=-pull.y*powerScale;aim.style.width=`${Math.min(170,pull.length*powerScale)}px`;aim.style.transform=`rotate(${Math.atan2(shotY,shotX)*180/Math.PI}deg)`;paintPutter(shotX,shotY);$("question-help").textContent="引いた反対方向へ飛びます。長く引くほど強く。"});
  const reset=()=>{dragging=false;aim.hidden=true;const shot=ideal();paintPutter(shot.x,shot.y)};const release=()=>{if(!dragging)return;dragging=false;if(pull.length<18){reset();$("question-help").textContent="もう少し後ろへ引いてから離します。";return}putt(-pull.x*powerScale,-pull.y*powerScale)};green.addEventListener("pointerup",release);green.addEventListener("pointercancel",reset);startDeadline(task.duration,()=>finishTask(false,{detail:"芝を読んでいる間に日が暮れました。"}));
}

function finishTask(correct,meta={}){
  if(questionAnswered||!state.activeSession)return;questionAnswered=true;clearQuestionTimers();
  const session=state.activeSession,index=session.currentIndex,task=session.tasks[index],elapsed=Math.max(1,performance.now()-questionStartedAt),beforeLevel=currentLevel();
  let quality=Number.isFinite(meta.quality)?clamp(meta.quality,0,1):clamp(1-elapsed/(task.duration||8000)*.7,0,1),xp=0;
  if(correct){const wins=Number(state.profile.templateWins[task.templateId]||0);xp=8+Math.round(quality*4)+(wins===0?6:wins<3?2:0);state.profile.xp+=xp;state.profile.templateWins[task.templateId]=wins+1;session.earnedXp=(session.earnedXp||0)+xp}
  const stat=state.profile.categoryStats[task.category]||{asked:0,correct:0};stat.asked++;if(correct)stat.correct++;if(meta.reactionMs&&(stat.bestMs==null||meta.reactionMs<stat.bestMs))stat.bestMs=meta.reactionMs;state.profile.categoryStats[task.category]=stat;
  session.answers.push({index,templateId:task.templateId,category:task.category,correct,quality:Number(quality.toFixed(3)),elapsedMs:Math.round(elapsed),reactionMs:meta.reactionMs||null,xp});session.currentIndex++;
  state.profile.recentTemplates=[task.templateId,...state.profile.recentTemplates.filter(id=>id!==task.templateId)].slice(0,30);saveState();
  const afterLevel=currentLevel(),panel=$("feedback-panel");panel.classList.toggle("bad",!correct);$("feedback-mark").textContent=correct?"○":"×";$("feedback-title").textContent=correct?(afterLevel>beforeLevel?"LEVEL UP!":"正解"):"残念";
  let detail=meta.detail||"";if(correct)detail=[detail,`+${xp} XP`].filter(Boolean).join("　");else if(meta.answerLabel)detail=[detail,`正解は「${meta.answerLabel}」`].filter(Boolean).join(" ");if(afterLevel>beforeLevel)detail+=`　Lv.${afterLevel}になりました`;
  $("feedback-detail").textContent=detail;$("next-button").textContent=session.currentIndex>=session.tasks.length?"格付けを見る":"次の問題";$("feedback").hidden=false;
}
function finalizeSession(){
  const session=state.activeSession;if(!session)return state.pendingResult&&state.lastResult?renderResult(state.lastResult):renderHome();
  if(session.currentIndex<session.tasks.length)return renderCurrentTask();
  const total=session.tasks.length,answers=session.answers.slice(0,total),correct=answers.filter(a=>a.correct).length,avgQuality=answers.reduce((sum,a)=>sum+a.quality,0)/Math.max(1,answers.length),categories=new Set(answers.map(a=>a.category)).size;
  const score=clamp(Math.round(correct/total*75+avgQuality*15+Math.min(1,categories/8)*10),0,100),grade=gradeFor(score),completedAt=Date.now(),paceMode=session.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD,ranked=paceMode===PACE_STANDARD;
  const result={id:session.id,profileId:state.profile.id,profileName:state.profile.name,profileAvatar:state.profile.avatar,paceMode,ranked,score,grade:grade.name,message:grade.message,correct,total,xp:session.earnedXp||0,level:currentLevel(),startedAt:session.startedAt,completedAt,categories:[...new Set(answers.filter(a=>a.correct).map(a=>a.category))]};
  state.profile.sessionsCompleted++;if(ranked){state.profile.bestScore=Math.max(state.profile.bestScore||0,score);state.profile.history=[result,...state.profile.history].slice(0,HISTORY_LIMIT)}state.lastResult=result;state.pendingResult=true;
  const windowStart=Number(session.trainingWindowStartedAt)||Number(state.profile.trainingWindowStartedAt)||completedAt;state.profile.trainingWindowStartedAt=windowStart;state.profile.setsInWindow=clamp((Number(state.profile.setsInWindow)||0)+1,1,MAX_SETS_PER_WINDOW);state.cooldownUntil=state.profile.setsInWindow>=MAX_SETS_PER_WINDOW?windowStart+TRAINING_WINDOW_MS:state.profile.setsInWindow===SETS_PER_BLOCK?Math.min(completedAt+MID_BLOCK_BREAK_MS,windowStart+TRAINING_WINDOW_MS):0;
  state.activeSession=null;saveState();renderResult(result);
}
function renderResult(result){
  showView("result-view");const grade=GRADES.find(g=>g.name===result.grade)||gradeFor(result.score),relaxed=result.paceMode===PACE_RELAXED;$("grade-name").textContent=grade.name;$("grade-message").textContent=grade.message;$("result-mode").textContent=relaxed?"ゆったりモード · 番付対象外":"標準モード · 番付対象";$("result-score").textContent=result.score;$("result-correct").textContent=`${result.correct} / ${result.total}`;$("result-xp").textContent=`+${result.xp} XP`;$("result-level").textContent=`Lv.${result.level}`;
  const root=$("result-breakdown");root.replaceChildren();(result.categories||[]).forEach(key=>{const s=document.createElement("span");s.textContent=`${CATEGORIES[key]?.icon||"•"} ${CATEGORIES[key]?.label||key} 正解`;root.append(s)});refreshResultCooldown();clearInterval(cooldownTicker);cooldownTicker=setInterval(refreshResultCooldown,1000);
}
function refreshResultCooldown(){const now=Date.now(),window=trainingWindowStatus(state.profile,now),left=(state.cooldownUntil||0)-now;$("next-session-text").textContent=window.sets>=MAX_SETS_PER_WINDOW?`6セット完了。次の20時間枠まで ${formatRemaining(Math.max(0,window.endsAt-now))}`:window.sets===SETS_PER_BLOCK&&left>0?`前半3セット完了。後半まで ${formatRemaining(left)}`:`セット ${window.sets}/${MAX_SETS_PER_WINDOW} 完了。残り${window.remaining}セット`}

let profileAvatarChoice="🤓";
function renderProfiles(){
  const root=$("profiles-list");root.replaceChildren();state.profiles.forEach(profile=>{const row=document.createElement("div"),avatar=document.createElement("span"),main=document.createElement("div"),name=document.createElement("strong"),meta=document.createElement("span"),actions=document.createElement("div");row.className=`profile-row-card ${profile.id===state.activeProfileId?"active":""}`;avatar.className="profile-row-avatar";avatar.textContent=profile.avatar;main.className="profile-row-main";name.textContent=profile.name;meta.textContent=`Lv.${currentLevel(profile)} · ベスト ${profile.bestScore||0}点 · ${profile.paceMode===PACE_RELAXED?"ゆったり":"標準"}`;main.append(name,meta);actions.className="profile-row-actions";
    const select=document.createElement("button");select.type="button";select.textContent=profile.id===state.activeProfileId?"使用中":"切替";select.disabled=profile.id===state.activeProfileId;select.addEventListener("click",()=>{state.activeProfileId=profile.id;saveState();renderProfiles();renderHome()});
    const rename=document.createElement("button");rename.type="button";rename.textContent="名前";rename.addEventListener("click",()=>{const next=prompt("新しい名前（12文字まで）",profile.name)?.trim().slice(0,12);if(!next)return;if(state.profiles.some(other=>other.id!==profile.id&&other.name===next)){toast("同じ名前があります");return}profile.name=next;profile.updatedAt=Date.now();saveState();renderProfiles();renderHome()});actions.append(select,rename);
    if(state.profiles.length>1){const del=document.createElement("button");del.type="button";del.className="danger";del.textContent="削除";del.addEventListener("click",()=>{if(!confirm(`「${profile.name}」のレベル・記録・途中の問題を削除しますか？`))return;state.profiles=state.profiles.filter(item=>item.id!==profile.id);if(state.activeProfileId===profile.id)state.activeProfileId=state.profiles[0].id;saveState();renderProfiles();renderHome()});actions.append(del)}row.append(avatar,main,actions);root.append(row)});
  const paceMode=state.profile.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD;[["pace-standard",PACE_STANDARD],["pace-relaxed",PACE_RELAXED]].forEach(([id,value])=>{const button=$(id),active=paceMode===value;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active))});$("pace-current").textContent=paceMode===PACE_RELAXED?"ゆったり":"標準";$("pace-apply-note").textContent=state.activeSession?"変更は保存中のセットではなく、次のセットから反映されます。":"次に始めるセットから反映されます。";
  const picker=$("avatar-picker");picker.replaceChildren();PROFILE_AVATARS.forEach(value=>{const button=document.createElement("button");button.type="button";button.textContent=value;button.className=value===profileAvatarChoice?"active":"";button.setAttribute("aria-label",`${value}を選ぶ`);button.addEventListener("click",()=>{profileAvatarChoice=value;renderProfiles()});picker.append(button)});$("profile-error").textContent=state.profiles.length>=6?"この端末では6人までです。":"";
}
function renderRecords(){
  const history=[...state.profile.history].sort((a,b)=>b.score-a.score||a.completedAt-b.completedAt),summary=$("record-summary");summary.replaceChildren();[[`${state.profile.avatar} ${state.profile.name}`,`Lv.${currentLevel()}`],["自己ベスト",`${state.profile.bestScore||0}点`]].forEach(([label,value])=>{const d=document.createElement("div"),s=document.createElement("span"),b=document.createElement("strong");s.textContent=label;b.textContent=value;d.append(s,b);summary.append(d)});
  const ranking=$("profile-ranking");ranking.replaceChildren();[...state.profiles].sort((a,b)=>(b.bestScore||0)-(a.bestScore||0)||b.xp-a.xp||a.createdAt-b.createdAt).forEach(profile=>{const li=document.createElement("li"),b=document.createElement("b"),span=document.createElement("span");b.textContent=`${profile.avatar} ${profile.name}`;span.textContent=`${profile.bestScore||0}点 · Lv.${currentLevel(profile)}`;li.append(b,span);ranking.append(li)});
  const list=$("records-list");list.replaceChildren();if(!history.length){const li=document.createElement("li"),b=document.createElement("b"),span=document.createElement("span");b.textContent="記録なし";span.textContent="最初の老いを測りましょう";li.append(b,span);list.append(li)}else history.slice(0,10).forEach(r=>{const li=document.createElement("li"),b=document.createElement("b"),span=document.createElement("span");b.textContent=`${r.grade} · ${r.score}点`;span.textContent=new Date(r.completedAt).toLocaleDateString("ja-JP");li.append(b,span);list.append(li)})
}
async function shareResult(){
  const r=state.lastResult;if(!r)return;const mode=r.paceMode===PACE_RELAXED?"｜ゆったりモード":"";const text=`初老テストで「${r.grade}」でした。\n脳力スコア ${r.score}/100｜${r.correct}/${r.total}問正解｜Lv.${r.level}${mode}\n#初老テスト`;
  try{if(navigator.share){await navigator.share({title:"初老テスト。",text,url:location.origin+location.pathname});return}await navigator.clipboard.writeText(`${text}\n${location.origin+location.pathname}`);toast("結果をコピーしました")}catch(error){if(error?.name!=="AbortError")fallbackCopy(`${text}\n${location.href}`)}
}
function fallbackCopy(text){const area=document.createElement("textarea");area.value=text;area.setAttribute("readonly","");area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();const ok=document.execCommand("copy");area.remove();toast(ok?"結果をコピーしました":"共有できませんでした")}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove("show"),2200)}

if(["127.0.0.1","localhost"].includes(location.hostname))window.__SHORO_QA__={
  catalog:TASK_FACTORIES.map(factory=>({id:factory.id,tier:tierFor(factory.id),flavor:flavorFor(factory.id),category:factory.category})),
  grade(score){return gradeFor(score).name},
  sampleSession(level=1,paceMode=PACE_STANDARD){if(![1,2,3].includes(level))throw new Error("invalid level");if(![PACE_STANDARD,PACE_RELAXED].includes(paceMode))throw new Error("invalid pace");const profile=defaultProfile("QA","🤓");profile.xp=(level-1)*120;profile.paceMode=paceMode;TASK_FACTORIES.filter(factory=>tierFor(factory.id)===1).slice(0,(level-1)*6).forEach(factory=>profile.templateWins[factory.id]=1);return buildTasks(profile,paceMode)},
  validate(iterations=20){const issues=[],ids=new Set();TASK_FACTORIES.forEach(factory=>{if(ids.has(factory.id))issues.push(`${factory.id}: duplicate id`);ids.add(factory.id);if(!CATEGORIES[factory.category])issues.push(`${factory.id}: unknown category`);if(![1,2,3].includes(tierFor(factory.id)))issues.push(`${factory.id}: invalid tier`);for(let i=0;i<iterations;i++){let task;try{task=factory.make()}catch(error){issues.push(`${factory.id}: generator ${error.message}`);break}if(!task?.kind||!Number.isFinite(task.duration))issues.push(`${factory.id}: missing kind/duration`);if(Array.isArray(task.options)){if(task.answer!=null&&!task.options.includes(task.answer))issues.push(`${factory.id}: answer absent`);if(new Set(task.options).size!==task.options.length)issues.push(`${factory.id}: duplicate option`)}}});return{factories:TASK_FACTORIES.length,iterations,issues:[...new Set(issues)]}},
  preview(templateId,duration=60000,slowRunner=true){const factory=TASK_FACTORIES.find(item=>item.id===templateId);if(!factory)throw new Error("unknown template");const task={templateId:factory.id,introducedIn:factory.version,tier:tierFor(factory.id),flavor:flavorFor(factory.id),category:factory.category,...factory.make()};task.duration=Math.max(task.duration,duration);if(task.kind==="runner"&&slowRunner)task.travelMs=Math.max(task.travelMs||2800,9000);document.querySelectorAll("dialog[open]").forEach(dialog=>dialog.close());state.activeSession={id:uuid(),startedAt:Date.now(),contentPack:CONTENT_PACK,tasks:[task],currentIndex:0,answers:[],earnedXp:0};state.pendingResult=false;saveState();renderCurrentTask();return task}
};

$("start-button").addEventListener("click",startOrResume);
$("next-button").addEventListener("click",()=>{if(!state.activeSession)return finalizeSession();$("feedback").hidden=true;if(state.activeSession.currentIndex>=state.activeSession.tasks.length)finalizeSession();else renderCurrentTask()});
$("quit-button").addEventListener("click",()=>{if(!state.activeSession)return renderHome();if(confirm("回答済みの経験値と脳内人事評価は反映済みです。残りの問題を保存してホームに戻りますか？"))renderHome()});
$("home-button").addEventListener("click",()=>{state.pendingResult=false;saveState();renderHome()});
$("share-button").addEventListener("click",shareResult);
$("profile-open").addEventListener("click",()=>{profileAvatarChoice=PROFILE_AVATARS.find(value=>!state.profiles.some(profile=>profile.avatar===value))||"🤓";$("profile-input").value="";renderProfiles();$("profiles-dialog").showModal()});
$("profile-form").addEventListener("submit",event=>{event.preventDefault();const name=$("profile-input").value.trim().slice(0,12);if(state.profiles.length>=6){$("profile-error").textContent="この端末では6人までです。";return}if(!name){$("profile-error").textContent="名前を入力してください。";return}if(state.profiles.some(profile=>profile.name===name)){$("profile-error").textContent="同じ名前があります。";return}const profile=defaultProfile(name,profileAvatarChoice);state.profiles.push(profile);state.activeProfileId=profile.id;saveState();$("profile-input").value="";profileAvatarChoice=PROFILE_AVATARS.find(value=>!state.profiles.some(item=>item.avatar===value))||"🤓";renderProfiles();renderHome();toast(`${name}を追加しました`)});
[["pace-standard",PACE_STANDARD],["pace-relaxed",PACE_RELAXED]].forEach(([id,value])=>$(id).addEventListener("click",()=>{state.profile.paceMode=value;state.profile.updatedAt=Date.now();saveState();renderProfiles();renderHome();toast(value===PACE_RELAXED?"次のセットをゆったりにしました":"次のセットを標準にしました")}));
$("records-open").addEventListener("click",()=>{renderRecords();$("records-dialog").showModal()});
$("about-open").addEventListener("click",()=>$("about-dialog").showModal());
document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>$(button.dataset.close).close()));
document.querySelectorAll("dialog").forEach(dialog=>dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()}));
$("reload-latest").addEventListener("click",event=>{const b=event.currentTarget;b.disabled=true;b.textContent="読み込み中…";const u=new URL(location.href);u.searchParams.set("_st_refresh",Date.now());location.replace(u.href)});
{
  const u=new URL(location.href);if(u.searchParams.has("_st_refresh")){u.searchParams.delete("_st_refresh");history.replaceState(null,"",u.pathname+u.search+u.hash)}
}
window.addEventListener("storage",event=>{if(event.key===STORAGE_KEY&&!state.activeSession){state=loadState();renderHome()}});
window.addEventListener("pagehide",saveState);

if(!window.crypto?.getRandomValues||!window.localStorage){$("start-button").disabled=true;$("cooldown-text").textContent="このブラウザでは記録を保存できません。"}
else if(state.activeSession&&Array.isArray(state.activeSession.tasks)&&state.activeSession.tasks.length>0){renderCurrentTask()}
else if(state.pendingResult&&state.lastResult){renderResult(state.lastResult)}
else{state.activeSession=null;renderHome()}
})();
