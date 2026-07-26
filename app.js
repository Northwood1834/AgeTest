import {createGameRuntime} from "./src/game-kernel.js";
import {generateGameTask,isModularGame,loadGame,manifestEntry,selectableGameCatalog} from "./src/game-loader.js";

(() => {
"use strict";
if (window.top !== window.self) {
  document.body.textContent = "このページは埋め込み表示では動きません。ブラウザで直接ひらいてください。";
  return;
}

const APP_VERSION = "1.16.0";
const CONTENT_PACK = "1.12";
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
const MONSTER_SPRITES={
  blob:[["........................","........................","........................","........................","........................","........................","........................",".........111111.........","......111222222111......",".....13332222222221.....","....1332422222242221....","...122244422224442221...","..12224554422445542221..","..12222554222245522221..","..12222242222224222221..",".1222222222222222222221.","..12222225222252222221..","..12222222555522222221..","..12222222222222222221..","..12222222222222222221..","..12222222222222222221..","...111222222222222111...","......111222222111......",".........111111........."],["........................","........................","........................","........................","........................","........................","........................","........................","........................","......1111111111........",".....1333222222211......","....133242222224221.....","....1224442222444221....","...122455442244554221...","..12222554222245522221..","..12222242222224222221..",".1222222222222222222221.","..12222225222252222221..","..12222222555522222221..","...122222222222222221...","..12222222222222222221..","..12222222222222222221..","...111112222222211111...","........11111111........"]],
  bat:[["..1..................1..",".161................161.",".1661....1....1....1661.",".16661..121..121..16661.",".166661.12111121.166661.",".1666611222222221166661.",".1666661222222221666661.",".1666666442222446666661.",".1666666554224556666661.","..16666644222244666661..","...111661222222166111...","......161244442161......",".......1233443321.......",".......1233333321.......",".......1233333321.......",".......1233333321.......","........13333331........","........12222221........",".........122221.........","........16222261........",".........161161.........","..........1..1..........","........................","........................"],["........................","........................",".........1....1.........","........121..121........","........12111121........",".......1222222221.......",".......1222222221.......",".......1442222441.......","......145542245541......",".......1442222441.......","........12222221........","........12444421........","......112334433211......",".....16623333332661.....","....1666233333326661....","..11666623333332666611..",".1666666133333316666661.",".1666666122222216666661.",".1666611.122221.1166661.",".166661.16222261.166661.",".16661...161161...16661.",".16661....1..1....16661.",".1661..............1661.",".1661..............1661."]],
  skeleton:[["........................","........................","...........11...........",".........113311.........","........13333331........",".......1555335551.......",".......1555335551.......","......135553355531......",".......1355335531.......",".......1333553331.......",".......1331313131..1....",".......1311111131.161...","........11333311..161...",".......111333311116661..","......133333333331161...",".......11111111111161...","........1133331113161...",".......13333333313361...",".......11133331111361...","......1333333333317771..",".......1113333111.171...",".......1333333331..1....","........11111111........","........13333331........"],["........................","........................","...........11......1....",".........113311...161...","........13333331..161...",".......155533555116661..",".......1555335551.161...","......135553355531161...",".......1355335531.161...",".......1333553331.161...",".......1331313131.161...",".......131111113117771..","........11333311..171...",".......1113333111.131...","......133333333331331...",".......1111111111331....","........11333311131.....",".......13333333311......",".......1113333111.......","......133333333331......",".......1113333111.......",".......1333333331.......","........11111111........","........13333331........"]],
  mage:[["........................","........................","........................","...........11...........","...1......1661..........","..141....166661.........",".14441..16666661........","..141..1666666661.......","...1..166666666661......","..17116666666666661.....","..171655555555555561....","..1766554455554455661...","..1766555555555555661...","..1766666666666666661...","..171222222222222221....","..171222222222222221....","..1722222222222222221...","..1722222222222222221...","..17222222333332222221..","..17222222333332222221..",".1272222223333322222221.",".1272222223333322222221.","..12222222333332222221..","...111111111111111111..."],["........................","........................","........................","...........11...........","....1.....1661..........","...141...166661.........","..14441.16666661........","...141.1666666661.......","....1.166666666661......","...1716666666666661.....","...17655555555555561....","...176554455554455661...","...176555555555555661...","...176666666666666661...","...17222222222222221....","...17122222222222211....","...172222222222222221...","...172222222222222211...","..12722222333332222221..","..11722222333332222211..",".1227222223333322222221.","..12722222333332222221..","..12222222333332222221..","...111111111111111111..."]],
  ghost:[["........................","........................","........................",".......11111111.........","......1333222221........",".....133222222221.......","......122222222221......",".....12222222222221.....",".....12555222255521.....","....1225452222545221....","....1225552222555221....","...112255522225552211...","..12222222222222222221..","..12222222255222222221..","..12222222555522222221..",".1222222222552222222221.","..11122222222222222111..","....1222222222222221....","....1222222222222221....","....1222222222222221....","....1221122112211221....","....1221122112211221....",".....11..11..11..11.....","........................"],["........................","........................","........................","........................",".......11111111.........","......1333222221........",".....133222222221.......","......122222222221......",".....12222222222221.....",".....12555222255521.....","....1225452222545221....","....1225552222555221....","...112255522225552211...","..12222222222222222221..","..12222222255222222221..","..12222222555522222221..",".1222222222552222222221.","..11122222222222222111..","....1222222222222221....","....1222222222222221....","....1222222222222221....",".....11221122112211.....","......122112211221......",".......11..11..11......."]]
};
const MONSTER_SPECIES=[
  {key:"blob",names:["どろまんじゅう","ぬまスライム","はいいろゼリー"],hp:[15,21],atk:[2,4],hue:[95,215],acts:["attack","attack","guard","call"]},
  {key:"bat",names:["よなきコウモリ","ゆうやみバット","つじぎりコウモリ"],hp:[13,19],atk:[2,5],hue:[250,330],acts:["attack","attack","call","flee"]},
  {key:"skeleton",names:["ほねのけんし","かれこつへい","さびたつわもの"],hp:[18,25],atk:[3,6],hue:[30,60],acts:["attack","attack","charge","guard"]},
  {key:"mage",names:["ずきんのまどうし","くろローブ","よまわりの導師"],hp:[14,19],atk:[2,4],hue:[260,300],acts:["spell","heal","sleep","attack"]},
  {key:"ghost",names:["さまよう亡霊","うらみの影","よふけの霊"],hp:[19,26],atk:[3,6],hue:[170,300],acts:["attack","breath","charge","attack"]}
];
const BATTLE_ELEMENTS={fire:{label:"炎",spell:"かえん",color:"#E4643C"},ice:{label:"氷",spell:"ひょうけつ",color:"#4FA3D1"},wind:{label:"風",spell:"かまいたち",color:"#6FBE86"}};
const BATTLE_ALLIES=[
  {name:"ムームー",icon:"🐮",text:"たいあたり",kind:"strike",power:[9,13]},
  {name:"ポイント",icon:"✨",text:"ポイントかんげん",kind:"heal",power:[12,16]},
  {name:"日本円",icon:"💴",text:"こばん投げ",kind:"sweep",power:[5,8]},
  {name:"メガネ",icon:"🤓",text:"じゃくてん解析",kind:"scan"},
  {name:"スマイル",icon:"😀",text:"えがおの声援",kind:"cheer"},
  {name:"パンダ",icon:"🐼",text:"ささ竹うち",kind:"strike",power:[10,15]},
  {name:"イヌ",icon:"🐶",text:"かみつき",kind:"strike",power:[8,12]},
  {name:"ネコ",icon:"🐱",text:"ねこだまし",kind:"stun"}
];
function makeBattleTask(){
  const size=randomInt(2,3),used=new Set(),enemies=[];
  for(let i=0;i<size;i++){
    const species=pick(MONSTER_SPECIES.filter(s=>!used.has(s.key)||MONSTER_SPECIES.every(x=>used.has(x.key))));used.add(species.key);
    const monster=makeMonster(species);
    if(size===3){monster.maxHp=Math.round(monster.maxHp*.8);monster.atk=Math.max(2,monster.atk-1)}
    enemies.push(monster);
  }
  const suffix=["Ａ","Ｂ","Ｃ","Ｄ"];
  MONSTER_SPECIES.forEach(species=>{const same=enemies.filter(e=>e.species===species.key);if(same.length>1)same.forEach((e,i)=>e.name=`${e.name}${suffix[i]}`)});
  return{kind:"rpgBattle",prompt:"まものを ぜんめつさせよ",help:"コマンドをえらんで たたかいます。「にげる」は その場で不正解です。",
    enemies,heroHp:60,heroMp:12,allies:shuffle(BATTLE_ALLIES).slice(0,2).map(a=>({...a})),
    items:{herb:2,water:1,wand:1},duration:90000};
}
function makeMonster(species){
  const element=pick(Object.keys(BATTLE_ELEMENTS));
  return{species:species.key,name:pick(species.names),maxHp:randomInt(species.hp[0],species.hp[1]),
    atk:randomInt(species.atk[0],species.atk[1]),weak:element,hue:randomInt(species.hue[0],species.hue[1]),
    acts:shuffle(species.acts)};
}
function monsterPalette(hue){
  return{"1":`hsl(${hue} 45% 13%)`,"2":`hsl(${hue} 48% 45%)`,"3":`hsl(${hue} 55% 63%)`,"4":"#F6F1E4",
    "5":`hsl(${hue} 45% 18%)`,"6":`hsl(${(hue+165)%360} 52% 52%)`,"7":`hsl(${(hue+165)%360} 45% 33%)`};
}
function paintSprite(canvas,species,frame,hue){
  const rows=MONSTER_SPRITES[species][frame],palette=monsterPalette(hue),ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,24,24);
  rows.forEach((row,y)=>{for(let x=0;x<row.length;x++){const c=row[x];if(c===".")continue;ctx.fillStyle=palette[c]||"#000";ctx.fillRect(x,y,1,1)}});
}

const RUN_LANES=[-5.6,0,5.6];
const RUN_THEMES=[
  {key:"dawn",sky:["#12203F","#3E5C8C","#F0A26B"],sun:"#FFD9A0",sunY:.74,hills:["#2C3F63","#3B5273"],
   grass:["#3F6B49","#345C3E"],road:["#8E7A63","#7A6853"],line:"#F3E5C5",fog:"#C79A78"},
  {key:"noon",sky:["#2E6FB7","#5C9BD8","#BFE0F2"],sun:"#FFF3C4",sunY:.3,hills:["#4E7A5C","#5E8B68"],
   grass:["#5C8F45","#4E7C3B"],road:["#B79E77","#A48C68"],line:"#FFF8E0",fog:"#CFE4F2"},
  {key:"dusk",sky:["#241436","#5B2F63","#E2734F"],sun:"#FFC178",sunY:.8,hills:["#3A2450","#4A2F5E"],
   grass:["#4A5A46","#3D4C3B"],road:["#8A7768","#75645A"],line:"#F6E3C8",fog:"#B57A6C"}
];
function makeRunStage(){
  const theme=pick(RUN_THEMES),obstacles=[];
  const groups=shuffle(["wall","trench","crates","gauntlet","trench","wall","crates","gauntlet"]).slice(0,randomInt(6,8));
  if(!groups.includes("trench"))groups[randomInt(0,groups.length-1)]="trench";
  if(!groups.includes("wall"))groups[0]="wall";
  const authorAt=new Set(shuffle(groups.map((group,index)=>index)).slice(0,randomInt(1,2)));
  let z=150;
  groups.forEach((group,index)=>{
    if(group==="wall")shuffle([0,1,2]).slice(0,2).forEach(lane=>obstacles.push({type:"rock",lane,z,seed:randomFloat()}));
    else if(group==="trench")[0,1,2].forEach(lane=>obstacles.push({type:"pit",lane,z}));
    else if(group==="crates"){
      const lanes=shuffle([0,1,2]),free=lanes[0],tnt=randomFloat()<.62?lanes[1]:-1;
      [0,1,2].forEach(lane=>{
        if(lane===free)return;
        obstacles.push({type:lane===tnt?"tnt":"crate",lane,z});
      });
    }else{
      const lanes=shuffle([0,1,2]),rock=lanes[0],second=lanes[1],free=lanes[2];
      obstacles.push({type:"rock",lane:rock,z,seed:randomFloat()});
      obstacles.push({type:randomFloat()<.4?"tnt":"pit",lane:second,z});
      if(randomFloat()<.4)obstacles.push({type:"crate",lane:free,z});
    }
    z+=randomInt(58,78);
    if(authorAt.has(index)){obstacles.push({type:"author",lane:1,z:z-randomInt(26,34),phase:randomFloat()*6.28,sweep:randomFloat()<.5?1:-1});z+=randomInt(14,24)}
  });
  const scenery=[];
  for(let sz=40;sz<z+80;sz+=randomInt(14,30))scenery.push({z:sz,side:randomFloat()<.5?-1:1,offset:randomInt(13,26),kind:pick(["tree","tree","bush","stone"]),seed:randomFloat()});
  return{kind:"laneRun",prompt:"走るコースをタップで切り抜けて",help:"左右ボタンで位置、画面タップでジャンプ。穴と木箱は跳ぶ。岩と赤いTNTは跳ばずによける。",
    theme:theme.key,obstacles,scenery,stageLength:z+70,speed:36,duration:45000};
}
const PUZZLE_KINDS=[
  {key:"dog",emoji:"🐶",color:"#F5A94E",light:"#FFD9A0"},
  {key:"cat",emoji:"🐱",color:"#EA7E9B",light:"#FFD1DF"},
  {key:"panda",emoji:"🐼",color:"#8E9BC4",light:"#D6DCF2"},
  {key:"smile",emoji:"😀",color:"#F2CE4B",light:"#FFF0B0"},
  {key:"glasses",emoji:"🤓",color:"#66C08C",light:"#C4EFD5"},
  {key:"money",emoji:"🤑",color:"#5FB6E0",light:"#C3E8F8"}
];
const PUZZLE_COLS=7,PUZZLE_ROWS=9,PUZZLE_MATCH=4,PUZZLE_DROPS=1;
const puzzleKind=key=>PUZZLE_KINDS.find(kind=>kind.key===key);
const puzzleClone=board=>board.map(row=>[...row]);
const puzzleEmpty=()=>Array.from({length:PUZZLE_ROWS},()=>Array(PUZZLE_COLS).fill(null));
function puzzleSettle(board){
  const moves=[];
  for(let c=0;c<PUZZLE_COLS;c++){
    let write=PUZZLE_ROWS-1;
    for(let r=PUZZLE_ROWS-1;r>=0;r--){
      if(!board[r][c])continue;
      if(r!==write){board[write][c]=board[r][c];board[r][c]=null;moves.push({from:r,to:write,col:c})}
      write--;
    }
  }
  return moves;
}
function puzzleGroups(board){
  const seen=Array.from({length:PUZZLE_ROWS},()=>Array(PUZZLE_COLS).fill(false)),groups=[];
  for(let r=0;r<PUZZLE_ROWS;r++)for(let c=0;c<PUZZLE_COLS;c++){
    const kind=board[r][c];if(!kind||seen[r][c])continue;
    const stack=[[r,c]],cells=[];seen[r][c]=true;
    while(stack.length){
      const [cr,cc]=stack.pop();cells.push([cr,cc]);
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
        const nr=cr+dr,nc=cc+dc;
        if(nr<0||nr>=PUZZLE_ROWS||nc<0||nc>=PUZZLE_COLS||seen[nr][nc]||board[nr][nc]!==kind)return;
        seen[nr][nc]=true;stack.push([nr,nc]);
      });
    }
    if(cells.length>=PUZZLE_MATCH)groups.push(cells);
  }
  return groups;
}
function puzzleResolve(board){
  let chain=0,cleared=0;
  for(;;){
    puzzleSettle(board);
    const groups=puzzleGroups(board);
    if(!groups.length)break;
    chain++;
    groups.forEach(cells=>cells.forEach(([r,c])=>{board[r][c]=null;cleared++}));
  }
  return{chain,cleared};
}
function puzzleDrop(board,col,kind){
  for(let r=PUZZLE_ROWS-1;r>=0;r--)if(!board[r][col]){board[r][col]=kind;return r}
  return -1;
}
function puzzleBestChain(board,kind){
  let best=0,bestCol=0;
  for(let col=0;col<PUZZLE_COLS;col++){
    const copy=puzzleClone(board);
    if(puzzleDrop(copy,col,kind)<0)continue;
    const{chain}=puzzleResolve(copy);
    if(chain>best){best=chain;bestCol=col}
  }
  return{best,bestCol};
}
function puzzleComponent(board,r,c){
  const kind=board[r][c];if(!kind)return 0;
  const seen=new Set([`${r},${c}`]),stack=[[r,c]];let size=0;
  while(stack.length){
    const[cr,cc]=stack.pop();size++;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
      const nr=cr+dr,nc=cc+dc,id=`${nr},${nc}`;
      if(nr<0||nr>=PUZZLE_ROWS||nc<0||nc>=PUZZLE_COLS||seen.has(id)||board[nr][nc]!==kind)return;
      seen.add(id);stack.push([nr,nc]);
    });
  }
  return size;
}
function makePuzzleTask(){
  const target=3;
  for(let attempt=0;attempt<4000;attempt++){
    const palette=shuffle(PUZZLE_KINDS).slice(0,4).map(kind=>kind.key),[k1,k2,k3]=palette;
    const board=puzzleEmpty();
    const mirrored=randomFloat()<.5,offset=randomInt(0,PUZZLE_COLS-5);
    const lane=index=>{const raw=offset+index;return mirrored?PUZZLE_COLS-1-raw:raw};
    const [a,b,c,d,e]=[0,1,2,3,4].map(lane);
    const hA=randomInt(2,3),row2=hA+1,row3=row2+1;
    const heights={},fixed={};
    const reserve=(col,index,kind)=>{fixed[`${col},${index}`]=kind};
    heights[a]=hA;reserve(a,hA-1,k1);
    heights[b]=row3+4;reserve(b,hA-1,k1);reserve(b,hA,k1);reserve(b,row2+2,k2);reserve(b,row3+3,k3);
    [c,d,e].forEach(col=>{heights[col]=row3+2;reserve(col,row2,k2);reserve(col,row3+1,k3)});
    // decoys: three of the same face stacked on open columns. Dropping there clears,
    // but nothing sits above them, so the clear stops at one step.
    const spare=[...Array(PUZZLE_COLS).keys()].filter(col=>![a,b,c,d,e].includes(col));
    const used=[];
    shuffle(spare).forEach(col=>{
      // a decoy stack must not touch the k1 trigger in a or b, nor the other decoy
      const nearTrigger=Math.abs(col-a)<=1||Math.abs(col-b)<=1;
      const low=nearTrigger?hA+5:3,high=nearTrigger?PUZZLE_ROWS:6;
      const options=[];
      for(let height=low;height<=high;height++){
        if(used.some(other=>Math.abs(other-height)<4&&spare.some(s=>Math.abs(s-col)===1)))continue;
        options.push(height);
      }
      if(!options.length){heights[col]=randomInt(2,3);return}
      const height=pick(options);used.push(height);heights[col]=height;
      for(let i=1;i<=3;i++)reserve(col,height-i,k1);
    });
    let ok=true;
    for(let index=0;index<PUZZLE_ROWS&&ok;index++){
      for(let col=0;col<PUZZLE_COLS&&ok;col++){
        if(index>=heights[col])continue;
        const row=PUZZLE_ROWS-1-index,forced=fixed[`${col},${index}`];
        if(forced){
          board[row][col]=forced;
          if(puzzleComponent(board,row,col)>=PUZZLE_MATCH)ok=false;
          continue;
        }
        const choice=shuffle(palette).find(kind=>{
          board[row][col]=kind;
          return puzzleComponent(board,row,col)<PUZZLE_MATCH;
        });
        if(!choice)ok=false;else board[row][col]=choice;
      }
    }
    if(!ok||puzzleGroups(board).length)continue;
    const outcome=[];
    for(let col=0;col<PUZZLE_COLS;col++){
      const probe=puzzleClone(board);
      if(puzzleDrop(probe,col,k1)<0){outcome.push(-1);continue}
      outcome.push(puzzleResolve(probe).chain);
    }
    const solutions=outcome.filter(chain=>chain>=target).length;
    const decoys=outcome.filter(chain=>chain>=1&&chain<target).length;
    if(solutions!==1||outcome[a]<target||decoys<2)continue;      // one answer, several tempting traps
    return{kind:"chainPuzzle",prompt:`1手で${target}連鎖を決めて`,
      help:"落とす列をタップ。同じ顔が4つつながると消え、その上のブロックが落ちて次が揃うと連鎖します。消えるだけの場所もあります。",
      board,queue:[k1,pick(palette),pick(palette)],target,best:Math.max(...outcome),bestCol:a,decoys,palette,duration:60000};
  }
  const board=puzzleEmpty(),palette=PUZZLE_KINDS.slice(0,4).map(kind=>kind.key);
  [0,1,2].forEach(index=>{board[PUZZLE_ROWS-1-index][0]=palette[0]});
  [0,1,2].forEach(index=>{board[PUZZLE_ROWS-1-index][1]=palette[1]});
  return{kind:"chainPuzzle",prompt:"ブロックを消して",help:"落とす列をタップ。同じ顔が4つつながると消えます。",
    board,queue:[palette[0],palette[1],palette[1]],target:1,best:1,bestCol:0,decoys:0,palette,duration:60000};
}
const WORD_ORDER_ITEMS=[
  {chunks:["I","have lived","in this town","for","twenty years"],
   accepted:[["I","have lived","in this town","for","twenty years"]],
   note:"Present perfect with a length of time."},
  {chunks:["She","asked me","to call her","after","the meeting"],
   accepted:[["She","asked me","to call her","after","the meeting"]],
   note:"ask + person + to do."},
  {chunks:["The train","was","so crowded","that","I could not sit down"],
   accepted:[["The train","was","so crowded","that","I could not sit down"]],
   note:"so ... that ..."},
  {chunks:["Could you","tell me","where","the station","is"],
   accepted:[["Could you","tell me","where","the station","is"]],
   note:"Indirect question keeps subject before verb."},
  {chunks:["I","am looking forward to","seeing","you","again"],
   accepted:[["I","am looking forward to","seeing","you","again"]],
   note:"look forward to + -ing."},
  {chunks:["He","has been","working here","since","last spring"],
   accepted:[["He","has been","working here","since","last spring"]],
   note:"since + a point in time."},
  {chunks:["This is","the book","that","my sister","recommended"],
   accepted:[["This is","the book","that","my sister","recommended"]],
   note:"Relative clause as object."},
  {chunks:["I","would rather","stay home","than","go out tonight"],
   accepted:[["I","would rather","stay home","than","go out tonight"]],
   note:"would rather A than B."},
  {chunks:["Please","let me know","if","you need","any help"],
   accepted:[["Please","let me know","if","you need","any help"]],
   note:"let + person + know."},
  {chunks:["It","took me","three hours","to finish","the report"],
   accepted:[["It","took me","three hours","to finish","the report"]],
   note:"It takes + person + time + to do."},
  {chunks:["I","have never","been","to","Okinawa"],
   accepted:[["I","have never","been","to","Okinawa"]],
   note:"Experience with the present perfect."},
  {chunks:["The doctor","told him","not to","drink","too much coffee"],
   accepted:[["The doctor","told him","not to","drink","too much coffee"]],
   note:"tell + person + not to do."},
  {chunks:["Do you know","how long","the museum","stays","open"],
   accepted:[["Do you know","how long","the museum","stays","open"]],
   note:"Embedded question after do you know."},
  {chunks:["I","was too tired","to","cook","dinner last night"],
   accepted:[["I","was too tired","to","cook","dinner last night"]],
   note:"too ... to do."},
  {chunks:["My glasses","are","not","where","I left them"],
   accepted:[["My glasses","are","not","where","I left them"]],
   note:"where clause as a complement."},
  {chunks:["If","it rains tomorrow","we","will stay","at home"],
   accepted:[["If","it rains tomorrow","we","will stay","at home"]],
   note:"First conditional: present in the if clause."}
];
function makeWordOrderTask(){
  const item=pick(WORD_ORDER_ITEMS);
  const answer=item.accepted[0];
  let chunks=shuffle(item.chunks);
  for(let guard=0;guard<20&&chunks.join("|")===answer.join("|");guard++)chunks=shuffle(item.chunks);
  return{kind:"wordOrder",
    prompt:"Put the words in the right order",
    help:"Tap the words one by one to build the sentence. Tap a word you placed to take it back.",
    chunks,accepted:item.accepted,answer,note:item.note,duration:45000};
}
const ENGLISH_GAPS=[
  {sentence:["We have known each other ___ we were children."],answer:"since",wrong:["for","when","during"],note:"since + a point in the past."},
  {sentence:["I will call you as soon as I ___ home."],answer:"get",wrong:["will get","got","am getting"],note:"Present tense after as soon as."},
  {sentence:["She is very good ___ remembering names."],answer:"at",wrong:["in","on","for"],note:"be good at + -ing."},
  {sentence:["There is ___ milk left in the bottle."],answer:"little",wrong:["few","a few","many"],note:"little for uncountable nouns."},
  {sentence:["He apologised ___ being late."],answer:"for",wrong:["to","of","with"],note:"apologise for + -ing."},
  {sentence:["Would you mind ___ the window?"],answer:"opening",wrong:["to open","open","opened"],note:"mind + -ing."},
  {sentence:["This is the ___ film I have ever seen."],answer:"best",wrong:["better","well","most"],note:"Superlative with have ever seen."},
  {sentence:["If I ___ you, I would take the earlier train."],answer:"were",wrong:["am","will be","have been"],note:"Second conditional: if I were you."}
];
const ENGLISH_ERRORS=[
  {answer:"He don't like coffee.",wrong:["He doesn't like coffee.","She doesn't drink tea.","They don't like milk."],note:"Third person singular takes doesn't."},
  {answer:"I have seen him yesterday.",wrong:["I saw him yesterday.","I have seen him before.","I met him last week."],note:"The present perfect cannot take yesterday."},
  {answer:"She suggested to go to the museum.",wrong:["She suggested going to the museum.","She offered to go to the museum.","She wanted to go to the museum."],note:"suggest takes -ing, not to."},
  {answer:"There is many people in the hall.",wrong:["There are many people in the hall.","There is a lot of noise in the hall.","There are few people in the hall."],note:"people is plural, so are."},
  {answer:"I look forward to see you.",wrong:["I look forward to seeing you.","I want to see you.","I hope to see you."],note:"look forward to + -ing."},
  {answer:"He is married with a doctor.",wrong:["He is married to a doctor.","He is friendly with a doctor.","He works with a doctor."],note:"married to, not married with."}
];
const ENGLISH_FORMS=[
  {sentence:"Yesterday she ___ three letters. (write)",answer:"wrote",wrong:["writes","has written","was writing"],note:"Simple past with yesterday."},
  {sentence:"By the time we arrived, the show ___. (start)",answer:"had started",wrong:["starts","has started","was starting"],note:"Past perfect for the earlier action."},
  {sentence:"He promised ___ me tomorrow. (help)",answer:"to help",wrong:["helping","helped","help"],note:"promise + to do."},
  {sentence:"I do not mind ___ a few minutes. (wait)",answer:"waiting",wrong:["to wait","waited","wait"],note:"mind + -ing."},
  {sentence:"The room ___ every morning. (clean)",answer:"is cleaned",wrong:["cleans","is cleaning","has cleaned"],note:"Passive: the room does not clean itself."},
  {sentence:"If it ___ sunny tomorrow, we will walk. (be)",answer:"is",wrong:["will be","would be","was"],note:"Present tense in the if clause."}
];
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
  "attention-dual-v1":3,"calculation-rpg-battle-v1":2,"spatial-lane-run-v1":2,"prediction-chain-puzzle-v1":2,"attention-water-sort-v1":2,"calculation-gate-run-v1":2,"spatial-park-jam-v1":3,"spatial-rope-untangle-v1":2,"spatial-flow-link-v1":3,"spatial-pipe-flow-v1":2,"attention-screw-out-v1":2,"timing-tower-stack-v1":2,"language-word-order-v1":2,"language-english-gap-v1":2,"language-english-error-v1":3,"language-english-form-v1":2,"social-date-v1":2,"social-partner-mood-v1":2,"language-english-v1":2
};
const MAX_TIER=5;
const tierFor = templateId => manifestEntry(templateId)?.tier??(TEMPLATE_TIERS[templateId]||1);
const TEMPLATE_FLAVORS={
  "reaction-target-v1":"wild","reaction-emoji-runner-v1":"wild","attention-author-boss-v1":"wild","spatial-emoji-fps-v1":"wild","prediction-lane3d-v1":"wild","spatial-golf-putt-v1":"wild","spatial-lane-run-v1":"wild","spatial-park-jam-v1":"satisfying","spatial-flow-link-v1":"satisfying","spatial-pipe-flow-v1":"satisfying","spatial-rope-untangle-v1":"quirky","calculation-rpg-battle-v1":"wild","calculation-gate-run-v1":"wild","timing-three-v1":"wild","timing-five-v1":"wild","timing-tower-stack-v1":"wild",
  "memory-missing-v1":"quirky","reaction-emoji-match-v1":"quirky","attention-animal-count-v1":"quirky","inhibition-parity-v1":"quirky","attention-kana-count-v1":"quirky","attention-dual-v1":"quirky","language-anagram-v1":"quirky","language-word-order-v1":"satisfying","social-partner-mood-v1":"quirky","social-date-v1":"wild",
  "memory-path-v1":"satisfying","spatial-cube-v1":"satisfying","spatial-rotation-v1":"satisfying","prediction-number-v1":"satisfying","prediction-double-v1":"satisfying","prediction-chain-puzzle-v1":"satisfying","attention-water-sort-v1":"satisfying","attention-screw-out-v1":"quirky","calculation-mental-v1":"satisfying","calculation-multistep-v1":"satisfying","attention-odd-v1":"satisfying","attention-search-v1":"satisfying"
};
const flavorFor = templateId => manifestEntry(templateId)?.flavor??(TEMPLATE_FLAVORS[templateId]||"classic");
// Every family ships its basic form as step 1. A harder version of the same play
// is added as a new stable ID with a higher step, never as a retune of an old ID,
// so history and category strength keep their meaning.
const TEMPLATE_STEPS={};
const stepFor = templateId => manifestEntry(templateId)?.step??(TEMPLATE_STEPS[templateId]||1);
const familyOf = templateId => manifestEntry(templateId)?.family??templateId.replace(/-v\d+$/,"").replace(/-(hard|pro)$/,"");
const PACE_FIXED_KINDS = new Set(["signal","target","timing","runner"]);
function tuneTaskForPace(task,paceMode){
  if(paceMode!==PACE_RELAXED)return task;
  if(task.kind==="runner")return{...task,runnerClearance:26};
  if(task.kind==="laneRun")return{...task,speed:Math.round(task.speed*.8),duration:Math.round(task.duration*RELAXED_DURATION_MULTIPLIER)};
  if(PACE_FIXED_KINDS.has(task.kind))return task;
  return{...task,standardDuration:task.duration,duration:Math.round(task.duration*RELAXED_DURATION_MULTIPLIER)};
}

const LEGACY_TASK_FACTORIES = [
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
  {id:"social-partner-mood-v1",version:"1.0",category:"social",make:()=>{const scenario=structuredClone(PARTNER_MOOD_SCENARIO);scenario.steps.forEach(step=>step.choices=shuffle(step.choices));return{kind:"dateSim",prompt:"不機嫌なパートナーと話して",help:"火に油を注がず、3回会話をつなぎます。",scenario,duration:20000}}},
  {id:"language-word-order-v1",version:"1.13",category:"language",make:()=>makeWordOrderTask()},
  {id:"language-english-gap-v1",version:"1.14",category:"language",make:()=>{const row=pick(ENGLISH_GAPS);return{kind:"expression",prompt:"Choose the best word for the blank",help:"Read the whole sentence first.",expression:row.sentence[0],options:shuffle([row.answer,...row.wrong]),answer:row.answer,duration:9000}}},
  {id:"language-english-error-v1",version:"1.14",category:"language",make:()=>{const row=pick(ENGLISH_ERRORS);return{kind:"choice",prompt:"Which sentence is wrong?",help:"Three of them are correct English.",options:shuffle([row.answer,...row.wrong]),answer:row.answer,duration:11000}}},
  {id:"language-english-form-v1",version:"1.14",category:"language",make:()=>{const row=pick(ENGLISH_FORMS);return{kind:"expression",prompt:"Put the verb in the right form",help:"The verb is given in brackets.",expression:row.sentence,options:shuffle([row.answer,...row.wrong]),answer:row.answer,duration:9500}}},
  {id:"calculation-subtract-v1",version:"1.15",category:"calculation",make:()=>{const a=randomInt(12,38),b=randomInt(3,11),answer=a-b;const set=new Set([answer]);while(set.size<4)set.add(Math.max(0,answer+pick([-3,-2,-1,1,2,3])));return{kind:"expression",prompt:"引き算をしてください",help:"ゆっくりで大丈夫です。",expression:`${a} − ${b}`,options:shuffle([...set].map(String)),answer:String(answer),duration:7000}}},
  {id:"calculation-half-v1",version:"1.15",category:"calculation",make:()=>{const n=randomInt(3,19)*2,answer=n/2;return{kind:"expression",prompt:"半分にしてください",help:"2で割ります。",expression:`${n} ÷ 2`,options:shuffle([answer,answer+1,answer-1,answer+2].map(String)),answer:String(answer),duration:6500}}},
  {id:"language-kanji-read-v1",version:"1.15",category:"language",make:()=>{const rows=[["『速い』の読みは？","はやい",["おそい","つよい","かるい"]],["『暖かい』の読みは？","あたたかい",["すずしい","つめたい","あかるい"]],["『笑顔』の読みは？","えがお",["わらいがお","しょうがん","えみかお"]],["『年賀状』の読みは？","ねんがじょう",["としがじょう","ねんかじょう","ねんがしょう"]]],r=pick(rows);return{kind:"choice",prompt:r[0],help:"よく見る漢字です。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:7000}}},
  {id:"language-katakana-v1",version:"1.15",category:"language",make:()=>{const rows=[["体温をはかる道具は？","タイオンケイ",["タイヨウケイ","タイオンキ","オンドケイキ"]],["食事の前に洗うのは？","テ",["アシ","カオ","ハ"]],["『病院で診てもらう人』は？","カンジャ",["イシャ","カンゴ","ヤクザイ"]]],r=pick(rows);return{kind:"choice",prompt:r[0],help:"素直に選んでください。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:7000}}},
  {id:"memory-color-v1",version:"1.15",category:"memory",make:()=>{const shown=shuffle(["赤","青","黄","緑","紫"]).slice(0,3);return{kind:"flashChoice",prompt:"3つの色を覚えて",help:"順番も見ておいてください。",afterHelp:"2番目の色はどれ？",shown,options:shuffle(["赤","青","黄","緑","紫"]),answer:shown[1],duration:7000}}},
  {id:"attention-shape-count-v1",version:"1.15",category:"attention",make:()=>{const target=pick(["★","●","▲"]),others=["★","●","▲","■"].filter(x=>x!==target);const line=Array.from({length:12},()=>randomFloat()<.32?target:pick(others));if(line.filter(x=>x===target).length<2){line[randomInt(0,5)]=target;line[randomInt(6,11)]=target}const count=line.filter(x=>x===target).length;const options=[count,count+1,Math.max(0,count-1),count+2].map(String);const unique=[...new Set(options)];let extra=count+3;while(unique.length<4){if(!unique.includes(String(extra)))unique.push(String(extra));extra++}return{kind:"expression",prompt:`${target} はいくつ？`,help:"落ち着いて数えましょう。",expression:line.join(" "),options:shuffle(unique.slice(0,4)),answer:String(count),duration:8000}}},
  {id:"prediction-shape-v1",version:"1.15",category:"prediction",make:()=>{const pair=pick([["○","△"],["●","□"],["☆","♡"]]),seq=[pair[0],pair[1],pair[0],pair[1]],answer=pair[0];return{kind:"pattern",prompt:"次に来るのは？",help:"交互にならんでいます。",sequence:seq,options:shuffle([pair[0],pair[1],"◇","▽"]),answer,duration:6500}}},
  {id:"spatial-flip-v1",version:"1.15",category:"spatial",make:()=>{const rows=[["→","←"],["←","→"],["↗","↖"],["↘","↙"],["↖","↗"],["↙","↘"]],r=pick(rows);const pool=["→","←","↗","↖","↘","↙"].filter(value=>value!==r[0]&&value!==r[1]);return{kind:"rotation",prompt:"左右をひっくり返すと？",help:"鏡に映した形です。",symbol:r[0],options:shuffle([r[1],...shuffle(pool).slice(0,3)]),answer:r[1],duration:6500}}},
  {id:"timing-two-v1",version:"1.15",category:"timing",make:()=>({kind:"timing",prompt:"体内時計で2秒を測って",help:"スタート後、2秒だと思ったらタップ。",targetSeconds:2,toleranceMs:600,duration:8000})},
  {id:"reaction-shape-v1",version:"1.15",category:"reaction",make:()=>{const answer=pick(["まる","さんかく","しかく"]),marks={"まる":"●","さんかく":"▲","しかく":"■"};return{kind:"rotation",prompt:`${marks[answer]} の名前は？`,help:"見たままを選んでください。",symbol:marks[answer],options:shuffle(["まる","さんかく","しかく"]),answer,duration:5000}}},
  {id:"social-greeting-v1",version:"1.15",category:"social",make:()=>{const rows=[["朝、近所の人に会いました。","おはようございます",["おやすみなさい","いただきます","ごちそうさま"]],["お店で先に会計を譲ってもらいました。","ありがとうございます",["いってきます","おかえりなさい","はじめまして"]],["久しぶりに友人に会いました。","お久しぶりです",["いってらっしゃい","おつかれさま、また明日","ただいま"]]],r=pick(rows);return{kind:"choice",prompt:`${r[0]} なんと言う？`,help:"いちばん自然なあいさつを。",options:shuffle([r[1],...r[2]]),answer:r[1],duration:7000}}}
];

const TASK_FACTORIES=[
  ...selectableGameCatalog.map(entry=>({id:entry.id,version:entry.introducedIn,category:entry.category,modular:true})),
  ...LEGACY_TASK_FACTORIES.filter(factory=>!isModularGame(factory.id))
];

async function buildTasks(profile=state.profile,paceMode=profile.paceMode||PACE_STANDARD){
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
  return Promise.all(ordered.map(async factory=>{
    const task=factory.modular
      ?await generateGameTask(factory.id,{random:randomFloat,randomInt,pick,shuffle})
      :{templateId:factory.id,introducedIn:factory.version,tier:tierFor(factory.id),flavor:flavorFor(factory.id),step:stepFor(factory.id),family:familyOf(factory.id),category:factory.category,...factory.make()};
    return tuneTaskForPace(task,paceMode);
  }));
}

let cooldownTicker=null,questionTimers=[],timerRaf=null,extraRafs=[],deadlineTimeout=null,questionAnswered=false,questionStartedAt=0,activeGameRuntime=null,lastGameRuntimeState=null,questionRenderToken=0,sessionStarting=false;
const gameQaHooks={};
function clearQuestionTimers(){questionTimers.forEach(clearTimeout);questionTimers=[];clearTimeout(deadlineTimeout);deadlineTimeout=null;cancelAnimationFrame(timerRaf);timerRaf=null;extraRafs.forEach(token=>cancelAnimationFrame(typeof token==="object"?token.id:token));extraRafs=[]}
function releaseGameRuntime(){if(!activeGameRuntime)return;activeGameRuntime.dispose();lastGameRuntimeState=activeGameRuntime.inspect();activeGameRuntime=null}
function disposeCurrentQuestion(){questionRenderToken++;releaseGameRuntime();clearQuestionTimers();return questionRenderToken}
function later(fn,ms){const id=setTimeout(fn,ms);questionTimers.push(id);return id}
function showView(id){["home-view","game-view","result-view"].forEach(x=>$(x).hidden=x!==id);window.scrollTo(0,0)}
function formatRemaining(ms){const total=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;return h?`${h}時間 ${String(m).padStart(2,"0")}分`:m?`${m}分 ${String(s).padStart(2,"0")}秒`:`${s}秒`}
function gradeFor(score){return GRADES.find(g=>score>=g.min)||GRADES.at(-1)}

function renderHome(){
  disposeCurrentQuestion();$("feedback").hidden=true;showView("home-view");
  $("profile-avatar").textContent=state.profile.avatar;$("profile-name").textContent=state.profile.name;
  const selectedPace=state.profile.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD,sessionPace=state.activeSession?.paceMode||PACE_STANDARD;
  $("pace-note").textContent=state.activeSession&&sessionPace!==selectedPace?`進行中は${sessionPace===PACE_RELAXED?"ゆったり":"標準"}。次のセットから${selectedPace===PACE_RELAXED?"ゆったり":"標準"}です。`:selectedPace===PACE_RELAXED?"ゆったりモード（番付対象外）":"標準モード（番付対象）";
  const level=currentLevel(),breadth=breadthPoints(),xpTarget=level*120,breadthTarget=level*6;
  $("level-value").textContent=level;$("xp-value").textContent=`${state.profile.xp.toLocaleString("ja-JP")} XP`;
  $("xp-next").textContent=`${Math.min(state.profile.xp,xpTarget)} / ${xpTarget}`;$("breadth-next").textContent=`${Math.min(breadth,breadthTarget)} / ${breadthTarget}`;
  $("xp-bar").style.width=`${clamp((state.profile.xp-(level-1)*120)/120*100,0,100)}%`;
  $("breadth-bar").style.width=`${clamp((breadth-(level-1)*6)/6*100,0,100)}%`;
  const unlocked=TASK_FACTORIES.filter(factory=>tierFor(factory.id)<=level).length;
  $("unlock-note").textContent=`Tier ${Math.min(level,MAX_TIER)}まで ${unlocked}/${TASK_FACTORIES.length}タイプ解放中。レベルには経験値と問題の幅が必要です。`;
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

async function startOrResume(){
  if(state.activeSession){void renderCurrentTask();return}
  if(sessionStarting)return;
  const now=Date.now(),window=trainingWindowStatus(),profile=state.profile;
  if(window.expired){profile.trainingWindowStartedAt=0;profile.setsInWindow=0;state.cooldownUntil=0}
  if((state.cooldownUntil||0)>now||profile.setsInWindow>=MAX_SETS_PER_WINDOW)return;
  const paceMode=profile.paceMode===PACE_RELAXED?PACE_RELAXED:PACE_STANDARD,profileId=profile.id;
  sessionStarting=true;$("start-button").disabled=true;$("start-button").textContent="問題を準備中…";
  try{
    const tasks=await buildTasks(profile,paceMode);
    if(state.profile.id!==profileId||state.activeSession)return;
    if(!profile.trainingWindowStartedAt)profile.trainingWindowStartedAt=now;
    state.activeSession={id:uuid(),startedAt:now,trainingWindowStartedAt:profile.trainingWindowStartedAt,contentPack:CONTENT_PACK,paceMode,tasks,currentIndex:0,answers:[],earnedXp:0};
    state.pendingResult=false;saveState();void renderCurrentTask();
  }catch(error){console.error("session generation failed",error);toast("問題を読み込めませんでした")}
  finally{sessionStarting=false;if(!state.activeSession)refreshHomeButton()}
}
async function renderCurrentTask(){
  clearInterval(cooldownTicker);const renderToken=disposeCurrentQuestion();$("feedback").hidden=true;
  const session=state.activeSession;if(!session)return renderHome();
  if(session.currentIndex>=session.tasks.length){finalizeSession();return}
  questionAnswered=false;questionStartedAt=performance.now();showView("game-view");
  const index=session.currentIndex,task=session.tasks[index],meta=CATEGORIES[task.category];
  $("question-count").textContent=`${index+1} / ${session.tasks.length}`;$("game-xp").textContent=`+${session.earnedXp||0} XP`;$("game-level").textContent=`Lv.${currentLevel()}`;
  $("game-progress-bar").style.width=`${(index+1)/session.tasks.length*100}%`;
  $("category-icon").textContent=meta.icon;$("category-name").textContent=meta.label;$("task-tier").textContent=`Tier ${task.tier||1}`;
  const reveal=$("category-reveal");reveal.classList.remove("category-reveal");void reveal.offsetWidth;reveal.classList.add("category-reveal");
  $("question-kicker").textContent=`問題タイプ · ${meta.label}${session.paceMode===PACE_RELAXED?" · ゆったり":""}`;$("question-prompt").textContent=task.prompt;$("question-help").textContent=task.help||"";$("challenge").replaceChildren();$("timer-bar").parentElement.hidden=false;
  if(!isModularGame(task.templateId)){renderTask(task);return}
  try{
    const game=await loadGame(task.templateId);
    if(renderToken!==questionRenderToken||state.activeSession!==session||session.currentIndex!==index)return;
    let runtime=null;
    runtime=createGameRuntime({host:$("challenge"),timerBar:$("timer-bar"),onFinish:(correct,result)=>{lastGameRuntimeState=runtime.inspect();if(activeGameRuntime===runtime)activeGameRuntime=null;finishTask(correct,result)},qa:window.__SHORO_QA__?gameQaHooks:null});
    activeGameRuntime=runtime;lastGameRuntimeState=null;game.render(task,runtime.context);
  }catch(error){
    if(renderToken!==questionRenderToken)return;
    releaseGameRuntime();console.error("game compatibility error",error);
    const message=document.createElement("p");message.className="inline-error";message.setAttribute("role","alert");message.textContent="この問題を読み込めません。最新版を読み込んでください。";$("challenge").append(message);
  }
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
  if(task.kind==="rpgBattle"){renderRpgBattle(task);return}
  if(task.kind==="laneRun"){renderLaneRun(task);return}
  if(task.kind==="chainPuzzle"){renderChainPuzzle(task);return}
  if(task.kind==="wordOrder"){renderWordOrder(task);return}
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

function renderRpgBattle(task){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const box=document.createElement("div");box.className="rpg-battle";
  const field=document.createElement("div");field.className="rpg-field";
  const flash=document.createElement("div");flash.className="rpg-flash";
  const status=document.createElement("div");status.className="rpg-window rpg-status";
  const log=document.createElement("div");log.className="rpg-window rpg-log";log.setAttribute("aria-live","polite");
  const menu=document.createElement("div");menu.className="rpg-window rpg-menu";
  box.append(field,flash,status,log,menu);$("challenge").append(box);
  const hero={name:state.profile.name,hp:task.heroHp,maxHp:task.heroHp,mp:task.heroMp,maxMp:task.heroMp,charge:false,cheer:false,sleep:0};
  const enemies=task.enemies.map(source=>({...source,hp:source.maxHp,alive:true,guard:false,charge:false,stunned:0,revealed:false,called:false}));
  const items={...task.items},allies=task.allies.map(ally=>({...ally,used:false}));
  let turnLock=false,ended=false;
  const living=()=>enemies.filter(enemy=>enemy.alive);
  const buildEnemy=enemy=>{
    const cell=document.createElement("div");cell.className="rpg-enemy";
    const button=document.createElement("button");button.type="button";button.className="rpg-sprite";button.disabled=true;
    const canvas=document.createElement("canvas");canvas.width=24;canvas.height=24;canvas.setAttribute("role","img");
    button.append(canvas);
    const name=document.createElement("span");name.className="rpg-enemy-name";
    const bar=document.createElement("span");bar.className="rpg-enemy-hp";const fill=document.createElement("i");bar.append(fill);
    cell.append(button,name,bar);field.append(cell);
    enemy.dom={cell,button,canvas,name,fill};enemy.frame=0;
    paintSprite(canvas,enemy.species,0,enemy.hue);
    canvas.setAttribute("aria-label",enemy.name);
    const idle=()=>{if(ended||questionAnswered||!enemy.alive)return;enemy.frame=enemy.frame?0:1;paintSprite(canvas,enemy.species,enemy.frame,enemy.hue);later(idle,reduced?900:randomInt(420,620))};
    later(idle,randomInt(120,700));
    return cell;
  };
  enemies.forEach(buildEnemy);
  const paint=()=>{
    status.innerHTML="";
    const line=document.createElement("div");line.className="rpg-status-row";
    line.innerHTML=`<span class="rpg-hero-name"></span><span>HP <b class="rpg-hp-value"></b>/${hero.maxHp}</span><span>MP <b class="rpg-mp-value"></b>/${hero.maxMp}</span>`;
    line.querySelector(".rpg-hero-name").textContent=hero.name;
    line.querySelector(".rpg-hp-value").textContent=hero.hp;
    line.querySelector(".rpg-mp-value").textContent=hero.mp;
    line.classList.toggle("low",hero.hp<=hero.maxHp*.3);
    status.append(line);
    enemies.forEach(enemy=>{
      if(!enemy.dom)return;
      enemy.dom.cell.classList.toggle("down",!enemy.alive);
      enemy.dom.name.textContent=enemy.revealed?`${enemy.name} 弱点${BATTLE_ELEMENTS[enemy.weak].label}`:enemy.name;
      enemy.dom.fill.style.width=`${clamp(enemy.hp/enemy.maxHp*100,0,100)}%`;
    });
  };
  const say=(lines,done)=>{
    const queue=[...lines];log.replaceChildren();
    const step=()=>{
      if(ended||questionAnswered)return;
      if(!queue.length){done?.();return}
      const p=document.createElement("p");p.textContent=queue.shift();log.append(p);
      while(log.children.length>3)log.firstChild.remove();
      later(step,reduced?380:520);
    };step();
  };
  const shake=(element,cls)=>{if(reduced||!element)return;element.classList.remove(cls);void element.offsetWidth;element.classList.add(cls);later(()=>element.classList.remove(cls),700)};
  const spellFlash=color=>{if(reduced)return;flash.style.setProperty("--flash-color",color);flash.classList.remove("on");void flash.offsetWidth;flash.classList.add("on");later(()=>flash.classList.remove("on"),520)};
  const popDamage=(enemy,text,cls="")=>{
    if(!enemy.dom)return;const tag=document.createElement("span");tag.className=`rpg-damage ${cls}`;tag.textContent=text;enemy.dom.cell.append(tag);later(()=>tag.remove(),900);
  };
  const damageEnemy=(enemy,amount)=>{
    enemy.hp=Math.max(0,enemy.hp-amount);popDamage(enemy,`${amount}`);shake(enemy.dom?.button,"hit");
    if(enemy.hp===0){enemy.alive=false;enemy.dom?.cell.classList.add("dying");later(()=>enemy.dom?.cell.classList.add("down"),reduced?0:520)}
    paint();
  };
  const damageHero=(amount,label)=>{
    hero.hp=Math.max(0,hero.hp-amount);shake(box,"quake");paint();return label;
  };
  const finish=(won,detail)=>{
    if(ended||questionAnswered)return;ended=true;
    finishTask(won,{quality:clamp(1-(performance.now()-questionStartedAt)/task.duration,0,1),detail});
  };
  const afterAction=()=>{
    if(ended||questionAnswered)return;
    if(!living().length){say([`まものを ぜんめつさせた！`],()=>finish(true,`${hero.name}たちは たたかいに かった！`));return}
    if(hero.hp<=0){finish(false,`${hero.name}は ちからつきた…`);return}
    later(enemyPhase,reduced?260:420);
  };
  const enemyPhase=()=>{
    if(ended||questionAnswered)return;
    const actors=living().slice();
    const step=()=>{
      if(ended||questionAnswered)return;
      const enemy=actors.shift();
      if(!enemy){paint();if(hero.hp<=0){finish(false,`${hero.name}は ちからつきた…`);return}later(playerTurn,reduced?200:320);return}
      if(!enemy.alive){step();return}
      enemy.guard=false;
      if(enemy.stunned>0){enemy.stunned--;say([`${enemy.name}は ようすを 見ている。`],()=>later(step,reduced?150:260));return}
      resolveEnemy(enemy,()=>later(step,reduced?180:320));
    };step();
  };
  const lunge=enemy=>{if(reduced||!enemy.dom)return;enemy.dom.button.classList.remove("lunge");void enemy.dom.button.offsetWidth;enemy.dom.button.classList.add("lunge");later(()=>enemy.dom.button.classList.remove("lunge"),620)};
  const resolveEnemy=(enemy,done)=>{
    const pool=enemy.acts.filter(act=>{
      if(act==="call")return !enemy.called&&enemies.length<4;
      if(act==="heal")return living().some(other=>other.hp<other.maxHp);
      if(act==="sleep")return hero.sleep<=0;
      if(act==="flee")return living().length>1&&randomFloat()<.35;
      return true;
    }),act=pool.length?pick(pool):"attack";
    if(act==="attack"){
      lunge(enemy);const power=enemy.charge?2:1;enemy.charge=false;
      const amount=Math.max(1,randomInt(enemy.atk,enemy.atk+2)*power);
      say([`${enemy.name}の こうげき！`,`${hero.name}は ${amount}の ダメージを うけた！`],()=>{damageHero(amount);done()});
      return;
    }
    if(act==="spell"||act==="breath"){
      const element=enemy.weak==="fire"?"ice":"fire",label=act==="breath"?(enemy.species==="ghost"?"つめたい息":"かえんのいき"):BATTLE_ELEMENTS[element].spell;
      lunge(enemy);spellFlash(BATTLE_ELEMENTS[element].color);
      const amount=randomInt(enemy.atk+1,enemy.atk+4);
      say([`${enemy.name}は ${label}を はなった！`,`${hero.name}は ${amount}の ダメージを うけた！`],()=>{damageHero(amount);done()});
      return;
    }
    if(act==="heal"){
      const target=pick(living().filter(other=>other.hp<other.maxHp))||enemy,amount=randomInt(8,14);
      target.hp=Math.min(target.maxHp,target.hp+amount);popDamage(target,`+${amount}`,"heal");paint();
      say([`${enemy.name}は いやしの光を となえた！`,`${target.name}の きずが かいふくした。`],done);return;
    }
    if(act==="sleep"){
      spellFlash("#8E7BD0");hero.sleep=randomInt(1,2);
      say([`${enemy.name}は ねむりのうたを うたった！`,`${hero.name}は ねむってしまった！`],done);return;
    }
    if(act==="charge"){enemy.charge=true;say([`${enemy.name}は ちからを ためている！`],done);return}
    if(act==="guard"){enemy.guard=true;say([`${enemy.name}は 身をまもっている。`],done);return}
    if(act==="call"){
      enemy.called=true;const species=MONSTER_SPECIES.find(item=>item.key===enemy.species),fresh={...makeMonster(species),hp:0,alive:true,guard:false,charge:false,stunned:1,revealed:false,called:true};
      fresh.hp=fresh.maxHp;enemies.push(fresh);buildEnemy(fresh);paint();
      say([`${enemy.name}は なかまを よんだ！`,`${fresh.name}が あらわれた！`],done);return;
    }
    enemy.alive=false;enemy.dom?.cell.classList.add("fled");later(()=>enemy.dom?.cell.classList.add("down"),reduced?0:400);paint();
    say([`${enemy.name}は にげだした！`],()=>{if(!living().length){say(["まものは いなくなった！"],()=>finish(true,"まものを 追いはらいました。"));return}done()});
  };
  const buttons=(list,{back=null}={})=>{
    menu.replaceChildren();menu.hidden=false;
    list.forEach(entry=>{
      const button=document.createElement("button");button.type="button";button.className="rpg-command";
      button.textContent=entry.label;button.disabled=!!entry.disabled;
      if(entry.note){const note=document.createElement("small");note.textContent=entry.note;button.append(note)}
      button.addEventListener("click",()=>{if(turnLock)return;entry.run()});menu.append(button);
    });
    if(back){const button=document.createElement("button");button.type="button";button.className="rpg-command back";button.textContent="もどる";button.addEventListener("click",back);menu.append(button)}
  };
  const chooseTarget=(label,run)=>{
    say([`${label}　だれに？`]);
    menu.replaceChildren();menu.hidden=false;
    const cancel=document.createElement("button");cancel.type="button";cancel.className="rpg-command back";cancel.textContent="やめる";
    cancel.addEventListener("click",()=>{clearTargets();playerTurn()});menu.append(cancel);
    const clearTargets=()=>enemies.forEach(enemy=>{if(!enemy.dom)return;enemy.dom.button.disabled=true;enemy.dom.cell.classList.remove("selectable");enemy.dom.button.onclick=null});
    living().forEach(enemy=>{
      enemy.dom.button.disabled=false;enemy.dom.cell.classList.add("selectable");
      enemy.dom.button.onclick=()=>{if(turnLock)return;clearTargets();run(enemy)};
    });
  };
  const act=(lines,effect)=>{
    turnLock=true;menu.replaceChildren();menu.hidden=true;
    say(lines,()=>{effect?.();later(()=>{turnLock=false;afterAction()},reduced?120:260)});
  };
  const playerTurn=()=>{
    if(ended||questionAnswered)return;
    turnLock=false;paint();
    if(hero.sleep>0){hero.sleep--;act([`${hero.name}は ねむっている…`]);return}
    say([`${hero.name}の ターン。コマンドを えらんで。`]);
    buttons([
      {label:"たたかう",run:()=>chooseTarget("たたかう",target=>{
        const power=(hero.charge?2:1)*(hero.cheer?1.5:1);hero.charge=false;hero.cheer=false;
        const amount=Math.max(1,Math.round(randomInt(6,9)*power/(target.guard?2:1)));
        act([`${hero.name}の こうげき！`,`${target.name}に ${amount}の ダメージ！`,...(target.hp-amount<=0?[`${target.name}を たおした！`]:[])],()=>damageEnemy(target,amount));
      })},
      {label:"まほう",run:()=>buttons(Object.entries(BATTLE_ELEMENTS).map(([key,element])=>({
        label:element.spell,note:`MP3 ${element.label}`,disabled:hero.mp<3,
        run:()=>chooseTarget(element.spell,target=>{
          hero.mp-=3;paint();const weak=target.weak===key,amount=Math.round(randomInt(10,13)*(weak?2:1)/(target.guard?2:1));
          target.revealed=true;spellFlash(element.color);
          act([`${hero.name}は ${element.spell}を となえた！`,weak?`${target.name}に ${amount}の 大ダメージ！ 弱点だ！`:`${target.name}に ${amount}の ダメージ！`,...(target.hp-amount<=0?[`${target.name}を たおした！`]:[])],()=>damageEnemy(target,amount));
        })
      })),{back:playerTurn})},
      {label:"とくぎ",run:()=>buttons([
        {label:"みやぶる",note:"弱点を しらべる",run:()=>act([`${hero.name}は まものを みやぶった！`],()=>{enemies.forEach(enemy=>enemy.revealed=true);paint()})},
        {label:"ちからため",note:"次の攻撃2倍",run:()=>act([`${hero.name}は ちからを ためた！`],()=>{hero.charge=true})},
        {label:"さみだれ斬り",note:"MP2 全体",disabled:hero.mp<2,run:()=>{
          hero.mp-=2;paint();const rolls=living().map(enemy=>({enemy,amount:randomInt(3,6)}));
          act([`${hero.name}の さみだれ斬り！`,...rolls.map(roll=>`${roll.enemy.name}に ${roll.amount}の ダメージ！`)],()=>rolls.forEach(roll=>damageEnemy(roll.enemy,roll.amount)));
        }}
      ],{back:playerTurn})},
      {label:"どうぐ",run:()=>buttons([
        {label:`やくそう ×${items.herb}`,disabled:!items.herb,run:()=>{items.herb--;const amount=randomInt(18,24);
          act([`${hero.name}は やくそうを つかった！`,`HPが ${amount} かいふくした。`],()=>{hero.hp=Math.min(hero.maxHp,hero.hp+amount);paint()})}},
        {label:`まりょくの水 ×${items.water}`,disabled:!items.water,run:()=>{items.water--;
          act([`${hero.name}は まりょくの水を のんだ！`,"MPが 6 かいふくした。"],()=>{hero.mp=Math.min(hero.maxMp,hero.mp+6);paint()})}},
        {label:`いかずちの杖 ×${items.wand}`,disabled:!items.wand,run:()=>{items.wand--;spellFlash("#E8C766");
          const rolls=living().map(enemy=>({enemy,amount:randomInt(9,13)}));
          act([`${hero.name}は いかずちの杖を かかげた！`,...rolls.map(roll=>`${roll.enemy.name}に ${roll.amount}の ダメージ！`)],()=>rolls.forEach(roll=>damageEnemy(roll.enemy,roll.amount)))}}
      ],{back:playerTurn})},
      {label:"なかま",run:()=>buttons(allies.map(ally=>({
        label:`${ally.icon} ${ally.name}`,note:ally.used?"使用ずみ":ally.text,disabled:ally.used,
        run:()=>runAlly(ally)
      })),{back:playerTurn})},
      {label:"にげる",run:()=>{turnLock=true;menu.replaceChildren();menu.hidden=true;say([`${hero.name}は にげだした！`],()=>finish(false,"背中を見せた者に 勝利はありません。"))}}
    ]);
  };
  const runAlly=ally=>{
    if(ally.kind==="strike"){chooseTarget(ally.name,target=>{ally.used=true;const amount=randomInt(ally.power[0],ally.power[1]);
      act([`${ally.name}の ${ally.text}！`,`${target.name}に ${amount}の ダメージ！`,...(target.hp-amount<=0?[`${target.name}を たおした！`]:[])],()=>damageEnemy(target,amount))});return}
    if(ally.kind==="stun"){chooseTarget(ally.name,target=>{ally.used=true;target.stunned=1;
      act([`${ally.name}の ${ally.text}！`,`${target.name}は ひるんでいる！`])});return}
    ally.used=true;
    if(ally.kind==="heal"){const amount=randomInt(ally.power[0],ally.power[1]);
      act([`${ally.name}の ${ally.text}！`,`${hero.name}の HPが ${amount} かいふくした。`],()=>{hero.hp=Math.min(hero.maxHp,hero.hp+amount);paint()});return}
    if(ally.kind==="sweep"){const rolls=living().map(enemy=>({enemy,amount:randomInt(ally.power[0],ally.power[1])}));
      act([`${ally.name}の ${ally.text}！`,...rolls.map(roll=>`${roll.enemy.name}に ${roll.amount}の ダメージ！`)],()=>rolls.forEach(roll=>damageEnemy(roll.enemy,roll.amount)));return}
    if(ally.kind==="scan"){act([`${ally.name}の ${ally.text}！`,"まものの 弱点が わかった！"],()=>{enemies.forEach(enemy=>enemy.revealed=true);paint()});return}
    act([`${ally.name}の ${ally.text}！`,`${hero.name}の 次の こうげきが 強くなった！`],()=>{hero.cheer=true});
  };
  paint();playerTurn();
  startDeadline(task.duration,()=>{if(!ended)finish(false,"日が暮れて まものは 去っていきました。")});
}

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
function renderChainPuzzle(task){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap=document.createElement("div");wrap.className="puzzle-stage";
  const canvas=document.createElement("canvas");canvas.className="puzzle-canvas";
  canvas.setAttribute("role","img");canvas.setAttribute("aria-label",`${PUZZLE_COLS}列の連鎖パズル`);
  const pad=document.createElement("div");pad.className="puzzle-pad";
  pad.style.gridTemplateColumns=`repeat(${PUZZLE_COLS},1fr)`;
  const buttons=[];
  for(let col=0;col<PUZZLE_COLS;col++){
    const button=document.createElement("button");button.type="button";button.className="puzzle-key";
    button.textContent="▼";button.setAttribute("aria-label",`${col+1}列目に落とす`);
    pad.append(button);buttons.push(button);
  }
  wrap.append(canvas,pad);$("challenge").append(wrap);
  const ctx=canvas.getContext("2d");
  const board=task.board.map(row=>[...row]);
  const queue=[...task.queue];
  const offsets=new Map(),pops=[],particles=[],rings=[];
  const state={busy:false,drops:PUZZLE_DROPS,chain:0,bestChain:0,cursor:task.bestCol??2,shake:0,banner:null,clear:0,done:false};
  let W=0,H=0,cell=0,boardX=0,boardY=0,headH=0,clock=0;
  const resize=()=>{
    const dpr=Math.min(window.devicePixelRatio||1,3);
    const avail=Math.max(240,Math.round(wrap.clientWidth||canvas.clientWidth||320));
    headH=Math.round(avail*.17);
    cell=Math.floor(Math.min(avail/PUZZLE_COLS,(Math.min(438,avail*1.34)-headH)/PUZZLE_ROWS));
    W=cell*PUZZLE_COLS;H=headH+cell*PUZZLE_ROWS;
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
    canvas.style.width=`${W}px`;canvas.style.height=`${H}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    boardX=0;boardY=headH;
    wrap.style.setProperty("--board-width",`${W}px`);
  };
  const key=(r,c)=>`${r},${c}`;
  const cellX=c=>boardX+c*cell,cellY=r=>boardY+r*cell;
  const drawGem=(x,y,size,kindKey,{scale=1,alpha=1,glow=0}={})=>{
    const kind=puzzleKind(kindKey);if(!kind)return;
    const s=size*scale,cx=x+size/2,cy=y+size/2,r=s*.42;
    ctx.save();ctx.globalAlpha=alpha;
    ctx.fillStyle="rgba(40,24,52,.16)";
    ctx.beginPath();ctx.ellipse(cx,cy+r*.86,r*.86,r*.28,0,0,Math.PI*2);ctx.fill();
    if(glow>0){
      const halo=ctx.createRadialGradient(cx,cy,r*.3,cx,cy,r*2.1);
      halo.addColorStop(0,`${kind.light}ee`);halo.addColorStop(1,"#ffffff00");
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*2.1*glow,0,Math.PI*2);ctx.fill();
    }
    const body=ctx.createRadialGradient(cx-r*.35,cy-r*.45,r*.15,cx,cy,r*1.15);
    body.addColorStop(0,kind.light);body.addColorStop(.55,kind.color);body.addColorStop(1,shadeHex(kind.color,-.22));
    ctx.fillStyle=body;
    ctx.beginPath();ctx.roundRect(cx-r,cy-r,r*2,r*2,r*.55);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.65)";ctx.lineWidth=Math.max(1,s*.035);
    ctx.beginPath();ctx.roundRect(cx-r*.97,cy-r*.97,r*1.94,r*1.94,r*.52);ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.55)";
    ctx.beginPath();ctx.ellipse(cx-r*.36,cy-r*.52,r*.4,r*.22,-.5,0,Math.PI*2);ctx.fill();
    ctx.font=`${Math.round(s*.52)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(kind.emoji,cx,cy+s*.03);
    ctx.textAlign="left";ctx.restore();
  };
  const shadeHex=(color,amount)=>{
    const n=parseInt(color.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;
    const mix=v=>Math.round(clamp(amount<0?v*(1+amount):v+(255-v)*amount,0,255));
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  };
  const drawBoard=()=>{
    const bw=cell*PUZZLE_COLS,bh=cell*PUZZLE_ROWS;
    const back=ctx.createLinearGradient(boardX,boardY,boardX+bw,boardY+bh);
    back.addColorStop(0,"#F7F1FB");back.addColorStop(1,"#E9DFF4");
    ctx.fillStyle=back;ctx.beginPath();ctx.roundRect(boardX,boardY,bw,bh,12);ctx.fill();
    ctx.strokeStyle="rgba(122,84,150,.22)";ctx.lineWidth=1;
    for(let c=0;c<=PUZZLE_COLS;c++){ctx.beginPath();ctx.moveTo(cellX(c),boardY);ctx.lineTo(cellX(c),boardY+bh);ctx.stroke()}
    for(let r=0;r<=PUZZLE_ROWS;r++){ctx.beginPath();ctx.moveTo(boardX,cellY(r));ctx.lineTo(boardX+bw,cellY(r));ctx.stroke()}
    if(!state.busy&&!state.done){
      ctx.fillStyle="rgba(166,109,194,.16)";
      ctx.fillRect(cellX(state.cursor),boardY,cell,bh);
    }
  };
  const drawPieces=()=>{
    for(let r=0;r<PUZZLE_ROWS;r++)for(let c=0;c<PUZZLE_COLS;c++){
      const kindKey=board[r][c];if(!kindKey)continue;
      const offset=offsets.get(key(r,c));
      drawGem(cellX(c),cellY(r)+(offset?.dy||0),cell,kindKey);
    }
    pops.forEach(pop=>{
      const life=clamp(pop.life,0,1),scale=1+(1-life)*.85;
      drawGem(cellX(pop.c),cellY(pop.r),cell,pop.kind,{scale,alpha:life,glow:1-life});
    });
  };
  const drawHead=()=>{
    ctx.fillStyle="rgba(255,255,255,.92)";
    ctx.beginPath();ctx.roundRect(0,2,W,headH-10,12);ctx.fill();
    ctx.strokeStyle="rgba(122,84,150,.18)";ctx.lineWidth=1;
    ctx.beginPath();ctx.roundRect(.5,2.5,W-1,headH-11,12);ctx.stroke();
    const size=headH*.58,y=2+(headH-10-size)/2;
    ctx.fillStyle="#6F6078";ctx.font=`800 ${Math.round(headH*.2)}px "Hiragino Maru Gothic ProN",sans-serif`;
    ctx.textBaseline="middle";ctx.fillText("つぎ",10,2+(headH-10)/2);
    queue.slice(0,PUZZLE_DROPS>1?2:1).forEach((kindKey,index)=>{
      drawGem(46+index*(size*.92),y,size*(index?.72:1),kindKey,{alpha:index?.75:1});
    });
    const right=W-10;
    ctx.textAlign="right";
    ctx.fillStyle="#493B52";ctx.font=`900 ${Math.round(headH*.26)}px "Hiragino Maru Gothic ProN",sans-serif`;
    ctx.fillText(`${task.target}連鎖`,right,2+(headH-10)*.36);
    ctx.fillStyle=state.drops<=1?"#A64763":"#6F6078";ctx.font=`800 ${Math.round(headH*.2)}px "Hiragino Maru Gothic ProN",sans-serif`;
    ctx.fillText(state.drops>0?`のこり ${state.drops}手`:"けっか",right,2+(headH-10)*.72);
    ctx.textAlign="left";
  };
  const drawEffects=()=>{
    rings.forEach(ring=>{
      const life=clamp(ring.life,0,1);
      ctx.strokeStyle=`${ring.color}${Math.round(life*180).toString(16).padStart(2,"0")}`;
      ctx.lineWidth=Math.max(2,cell*.12*life);
      ctx.beginPath();ctx.arc(ring.x,ring.y,cell*(.3+(1-life)*1.5),0,Math.PI*2);ctx.stroke();
    });
    particles.forEach(p=>{
      const life=clamp(p.life,0,1);
      ctx.globalAlpha=life;ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*(.4+life*.6),0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    });
    if(state.banner){
      const banner=state.banner,life=clamp(banner.life,0,1),pop=1+Math.max(0,(1-life)-.7)*2;
      const scale=life>.8?(1-(life-.8)*4):1;
      ctx.save();
      ctx.translate(W/2,boardY+cell*PUZZLE_ROWS*.42);
      ctx.scale(clamp(scale*pop,.2,1.6),clamp(scale*pop,.2,1.6));
      ctx.globalAlpha=clamp(life*1.6,0,1);
      const text=banner.text;
      ctx.font=`900 ${Math.round(cell*1.15)}px "Hiragino Maru Gothic ProN",sans-serif`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.lineWidth=cell*.28;ctx.strokeStyle="#FFFFFF";ctx.strokeText(text,0,0);
      const fill=ctx.createLinearGradient(0,-cell*.6,0,cell*.6);
      fill.addColorStop(0,banner.color[0]);fill.addColorStop(1,banner.color[1]);
      ctx.fillStyle=fill;ctx.fillText(text,0,0);
      ctx.restore();ctx.textAlign="left";ctx.globalAlpha=1;
    }
  };
  const paint=()=>{
    ctx.clearRect(0,0,W,H);
    ctx.save();
    if(state.shake>0){
      const power=state.shake*cell*.22;
      ctx.translate((randomFloat()-.5)*power,(randomFloat()-.5)*power);
    }
    drawBoard();drawPieces();drawEffects();ctx.restore();drawHead();
  };
  const burst=(r,c,kindKey,power)=>{
    const kind=puzzleKind(kindKey),cx=cellX(c)+cell/2,cy=cellY(r)+cell/2;
    rings.push({x:cx,y:cy,life:1,color:kind.light});
    for(let i=0;i<(reduced?4:12);i++){
      const angle=randomFloat()*Math.PI*2,speed=cell*(2+randomFloat()*4)*(1+power*.15);
      particles.push({x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-cell*2,
        size:cell*(.06+randomFloat()*.1),color:randomFloat()<.5?kind.color:kind.light,life:1});
    }
  };
  const chainBanner=chain=>{
    const palette=[["#8E6BD0","#5B3E9E"],["#4FA3D1","#2E6FA8"],["#4FB07A","#2C7A52"],["#E8A33C","#C06A1E"],["#E5573F","#A8241F"]];
    state.banner={text:`${chain}連鎖！`,life:1,color:palette[Math.min(chain,5)-1]};
    state.shake=Math.min(1,.35+chain*.22);
  };
  const animateSettle=done=>{
    const moves=puzzleSettle(board);
    if(!moves.length){done();return}
    offsets.clear();
    moves.forEach(move=>{const dy=(move.from-move.to)*cell;offsets.set(key(move.to,move.col),{dy,dy0:dy})});
    const duration=reduced?60:210,started=performance.now();
    const step=now=>{
      if(questionAnswered)return;
      const t=clamp((now-started)/duration,0,1),ease=1-(1-t)*(1-t);
      offsets.forEach(offset=>{offset.dy=offset.dy0*(1-ease)});
      if(t<1){requestAnimationFrame(step);return}
      offsets.clear();done();
    };
    requestAnimationFrame(step);
  };
  const resolveLoop=()=>{
    if(questionAnswered)return;
    animateSettle(()=>{
      const groups=puzzleGroups(board);
      if(!groups.length){endTurn();return}
      state.chain++;state.bestChain=Math.max(state.bestChain,state.chain);
      chainBanner(state.chain);
      groups.forEach(cells=>cells.forEach(([r,c])=>{
        pops.push({r,c,kind:board[r][c],life:1});
        burst(r,c,board[r][c],state.chain);
        board[r][c]=null;
      }));
      later(resolveLoop,reduced?90:300);
    });
  };
  const endTurn=()=>{
    if(questionAnswered||state.done)return;
    if(state.chain>=task.target){
      state.done=true;state.clear=1;
      state.banner={text:"CLEAR!",life:1.6,color:["#F0C24E","#D9803C"]};
      for(let i=0;i<(reduced?6:26);i++)later(()=>burst(randomInt(2,PUZZLE_ROWS-1),randomInt(0,PUZZLE_COLS-1),pick(task.palette),4),i*40);
      const elapsed=performance.now()-questionStartedAt;
      later(()=>finishTask(true,{quality:clamp(.55+(state.bestChain-task.target)*.12-elapsed/task.duration*.25,0,1),
        detail:`${state.bestChain}連鎖！ ${PUZZLE_DROPS-state.drops}手で決めました。`}),reduced?300:1100);
      return;
    }
    state.chain=0;
    if(state.drops<=0){
      state.done=true;
      later(()=>finishTask(false,{detail:`最高${state.bestChain}連鎖でした。最大${task.best}連鎖の置き場所があります。`}),reduced?150:500);
      return;
    }
    state.busy=false;
  };
  const drop=col=>{
    if(state.busy||state.done||questionAnswered)return;
    const row=puzzleDrop(board,col,queue[0]);
    if(row<0)return;
    state.busy=true;state.drops--;state.chain=0;
    queue.shift();queue.push(pick(task.palette));
    offsets.set(key(row,col),{dy:-(row+1)*cell,dy0:-(row+1)*cell});
    const duration=reduced?70:170+row*14,started=performance.now(),from=-(row+1)*cell;
    const step=now=>{
      if(questionAnswered)return;
      const t=clamp((now-started)/duration,0,1),ease=t*t;
      const offset=offsets.get(key(row,col));
      if(offset)offset.dy=from*(1-ease);
      if(t<1){requestAnimationFrame(step);return}
      offsets.clear();state.shake=Math.max(state.shake,.25);
      later(resolveLoop,reduced?40:90);
    };
    requestAnimationFrame(step);
  };
  buttons.forEach((button,col)=>{
    button.addEventListener("pointerdown",event=>{event.preventDefault();state.cursor=col;drop(col)});
    button.addEventListener("click",event=>{if(event.detail===0){state.cursor=col;drop(col)}});
  });
  const columnAt=event=>{
    const rect=canvas.getBoundingClientRect();
    return clamp(Math.floor((event.clientX-rect.left-boardX)/cell),0,PUZZLE_COLS-1);
  };
  canvas.addEventListener("pointermove",event=>{if(!state.busy)state.cursor=columnAt(event)});
  canvas.addEventListener("pointerdown",event=>{event.preventDefault();const col=columnAt(event);state.cursor=col;drop(col)});
  wrap.tabIndex=0;
  wrap.addEventListener("keydown",event=>{
    if(event.key==="ArrowLeft"){event.preventDefault();state.cursor=clamp(state.cursor-1,0,PUZZLE_COLS-1)}
    else if(event.key==="ArrowRight"){event.preventDefault();state.cursor=clamp(state.cursor+1,0,PUZZLE_COLS-1)}
    else if(event.key===" "||event.key==="Enter"){event.preventDefault();drop(state.cursor)}
  });
  wrap.focus({preventScroll:true});
  let last=performance.now();const token={id:null};extraRafs.push(token);
  const tick=now=>{
    if(questionAnswered)return;
    const dt=Math.min(Math.max((now-last)/1000,0),.05);last=now;clock+=dt;
    state.shake=Math.max(0,state.shake-dt*3);
    if(state.banner){state.banner.life-=dt*1.25;if(state.banner.life<=0)state.banner=null}
    for(let i=pops.length-1;i>=0;i--){pops[i].life-=dt*3.4;if(pops[i].life<=0)pops.splice(i,1)}
    for(let i=rings.length-1;i>=0;i--){rings[i].life-=dt*2.2;if(rings[i].life<=0)rings.splice(i,1)}
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];p.life-=dt*1.5;
      if(p.life<=0){particles.splice(i,1);continue}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=cell*14*dt;
    }
    paint();
    token.id=requestAnimationFrame(tick);
  };
  resize();
  const onResize=()=>{resize();paint()};
  window.addEventListener("resize",onResize,{passive:true});
  questionTimers.push(setTimeout(()=>window.removeEventListener("resize",onResize),task.duration+4000));
  if(window.__SHORO_QA__)window.__SHORO_QA__.puzzle={state,board,queue,task,drop};
  paint();token.id=requestAnimationFrame(tick);
  startDeadline(task.duration,()=>{
    if(state.done||questionAnswered)return;state.done=true;
    finishTask(false,{detail:`時間切れ。最大${task.best}連鎖の置き場所がありました。`});
  });
}
function renderWordOrder(task){
  const wrap=document.createElement("div");wrap.className="order-stage";
  const line=document.createElement("div");line.className="order-line";line.setAttribute("aria-live","polite");
  const pool=document.createElement("div");pool.className="order-pool";
  const actions=document.createElement("div");actions.className="order-actions";
  const clear=document.createElement("button");clear.type="button";clear.className="order-clear";clear.textContent="Clear";
  actions.append(clear);
  wrap.append(line,pool,actions);$("challenge").append(wrap);
  const placed=[],state={done:false};
  const draw=()=>{
    line.replaceChildren();
    if(!placed.length){
      const ghost=document.createElement("span");ghost.className="order-ghost";
      ghost.textContent="Your sentence appears here";line.append(ghost);
    }
    placed.forEach((entry,index)=>{
      const chip=document.createElement("button");chip.type="button";chip.className="order-chip placed";
      chip.textContent=entry.text;chip.setAttribute("aria-label",`Remove ${entry.text}`);
      chip.addEventListener("click",()=>{
        if(state.done)return;
        placed.splice(index,1);entry.button.disabled=false;entry.button.classList.remove("used");draw();
      });
      line.append(chip);
    });
    clear.disabled=!placed.length||state.done;
  };
  const check=()=>{
    const sentence=placed.map(entry=>entry.text);
    const ok=task.accepted.some(option=>option.length===sentence.length&&option.every((word,index)=>word===sentence[index]));
    state.done=true;
    pool.querySelectorAll("button").forEach(button=>{button.disabled=true});
    clear.disabled=true;
    line.classList.add(ok?"correct":"wrong");
    later(()=>finishTask(ok,{
      quality:clamp(1-(performance.now()-questionStartedAt)/task.duration,0,1),
      detail:ok?`“${task.answer.join(" ")}” — ${task.note}`:`Correct: “${task.answer.join(" ")}” — ${task.note}`
    }),ok?420:520);
  };
  task.chunks.forEach(text=>{
    const button=document.createElement("button");button.type="button";button.className="order-chip";
    button.textContent=text;
    button.addEventListener("click",()=>{
      if(state.done||button.disabled)return;
      button.disabled=true;button.classList.add("used");
      placed.push({text,button});draw();
      if(placed.length===task.chunks.length)later(check,220);
    });
    pool.append(button);
  });
  clear.addEventListener("click",()=>{
    if(state.done)return;
    placed.splice(0).forEach(entry=>{entry.button.disabled=false;entry.button.classList.remove("used")});
    draw();
  });
  draw();
  startDeadline(task.duration,()=>{
    if(state.done||questionAnswered)return;state.done=true;
    finishTask(false,{detail:`Time is up. Correct: “${task.answer.join(" ")}”`});
  });
}
function finishTask(correct,meta={}){
  if(questionAnswered||!state.activeSession)return;questionAnswered=true;releaseGameRuntime();clearQuestionTimers();
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
  catalog:TASK_FACTORIES.map(factory=>({id:factory.id,tier:tierFor(factory.id),flavor:flavorFor(factory.id),step:stepFor(factory.id),family:familyOf(factory.id),category:factory.category,modular:!!factory.modular})),
  games:gameQaHooks,
  grade(score){return gradeFor(score).name},
  async sampleSession(level=1,paceMode=PACE_STANDARD){if(!Number.isInteger(level)||level<1||level>MAX_TIER)throw new Error("invalid level");if(![PACE_STANDARD,PACE_RELAXED].includes(paceMode))throw new Error("invalid pace");const profile=defaultProfile("QA","🤓");profile.xp=(level-1)*120;profile.paceMode=paceMode;TASK_FACTORIES.filter(factory=>tierFor(factory.id)===1).slice(0,(level-1)*6).forEach(factory=>profile.templateWins[factory.id]=1);return buildTasks(profile,paceMode)},
  async validate(iterations=20){const issues=[],ids=new Set();for(const factory of TASK_FACTORIES){if(ids.has(factory.id))issues.push(`${factory.id}: duplicate id`);ids.add(factory.id);if(!CATEGORIES[factory.category])issues.push(`${factory.id}: unknown category`);if(![1,2,3,4,5].includes(tierFor(factory.id)))issues.push(`${factory.id}: invalid tier`);for(let i=0;i<iterations;i++){let task;try{task=factory.modular?await generateGameTask(factory.id,{random:randomFloat,randomInt,pick,shuffle}):factory.make()}catch(error){issues.push(`${factory.id}: generator ${error.message}`);break}if(!task?.kind||!Number.isFinite(task.duration))issues.push(`${factory.id}: missing kind/duration`);if(Array.isArray(task.options)){if(task.answer!=null&&!task.options.includes(task.answer))issues.push(`${factory.id}: answer absent`);if(new Set(task.options).size!==task.options.length)issues.push(`${factory.id}: duplicate option`)}}}return{factories:TASK_FACTORIES.length,iterations,issues:[...new Set(issues)]}},
  async preview(templateId,duration=60000,slowRunner=true){const factory=TASK_FACTORIES.find(item=>item.id===templateId)||(manifestEntry(templateId)?{id:templateId,modular:true}:null);if(!factory)throw new Error("unknown template");const task=factory.modular?await generateGameTask(factory.id,{random:randomFloat,randomInt,pick,shuffle}):{templateId:factory.id,introducedIn:factory.version,tier:tierFor(factory.id),flavor:flavorFor(factory.id),step:stepFor(factory.id),family:familyOf(factory.id),category:factory.category,...factory.make()};task.duration=Math.max(task.duration,duration);if(task.kind==="runner"&&slowRunner)task.travelMs=Math.max(task.travelMs||2800,9000);document.querySelectorAll("dialog[open]").forEach(dialog=>dialog.close());state.activeSession={id:uuid(),startedAt:Date.now(),contentPack:CONTENT_PACK,paceMode:PACE_STANDARD,tasks:[task],currentIndex:0,answers:[],earnedXp:0};state.pendingResult=false;saveState();await renderCurrentTask();return task},
  home(){renderHome()},
  runtime(){return activeGameRuntime?.inspect()||lastGameRuntimeState},
  activeTask(){return state.activeSession?.tasks[state.activeSession.currentIndex]||null},
  sessionTasks(){return state.activeSession?.tasks.map(task=>task.templateId)||[]},
  async next(){if(!state.activeSession)return null;state.activeSession.currentIndex++;await renderCurrentTask();return state.activeSession?.tasks[state.activeSession.currentIndex]||null}
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

if(window.__SHORO_QA__){
  const params=new URLSearchParams(location.search),templateId=params.get("preview");
  if(templateId)window.__SHORO_QA__.preview(templateId,Number(params.get("ms"))||600000).catch(error=>console.warn("preview:",error.message));
  if(params.get("browserTest")==="reaction-signal-v1")import("./test/browser-reaction-runner.mjs").then(module=>module.runReactionBrowserQa(window.__SHORO_QA__)).catch(error=>console.error("browser QA:",error));
}
})();
