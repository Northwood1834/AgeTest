const PROMPT="3レスでスレの適温を保て";
const HELP="文脈・勢い・温度・既出度を読み、短さとアンカーを選びます。最大ウケではなく適温維持が目標です。";
const DURATION=70000,TURNS=3,CHOICES=3,TOTAL_PATHS=27;
const metadata=Object.freeze({id:"social-thread-vibe-v1",introducedIn:"2.0",tier:3,flavor:"quirky",step:1,family:"social-thread-vibe",category:"social"});
const clamp=(value,min=0,max=12)=>Math.max(min,Math.min(max,value));
const clone=value=>structuredClone(value);
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
const post=(no,time,id,text)=>({no,time,id,author:"匿名乗組員",text});
const reaction=(time,id,text)=>({time,id,author:"匿名乗組員",text});
const choice=(id,text,replyTo,motif,delta,reactions)=>({id,text,replyTo,motif,delta,reactions});
const turn=(incoming,choices)=>({incoming,choices});

const SCENARIOS=Object.freeze([
  {
    id:"serious-tool",label:"真面目質問",title:"古い道具、直すか買い替えるか",topic:"repair",initial:{heat:3,momentum:4,stale:0,drift:0},band:{heatMin:2,heatMax:5,momentumMin:4,momentumMax:8,staleMax:4,driftMax:3},
    seed:[post(41,"20:14:08","RLY-A4Q","十年使った小さいラジオ、つまみだけ空回りする"),post(42,"20:14:35","RLY-K8M",">>41 ネジ締めで済む型もある。まず裏の型番見たい"),post(43,"20:15:02","RLY-N2C","買い替え一択は早い。部品あるなら直したい派")],
    turns:[
      turn(post(44,"20:15:41","RLY-A4Q",">>42 型番はTR-18。開ける前に見る場所ある？"),[
        choice("s1-good",">>44 電池を抜いて、つまみ横の小ネジ。そこが緩い例ある",44,"specific",{heat:0,momentum:1,stale:0,drift:0},[reaction("20:16:03","RLY-K8M","そこ先でいい。いきなり基板まで行かなくて済む"),reaction("20:16:18","RLY-A4Q","小ネジ見えた、少し浮いてる")]),
        choice("s1-cold",">>44 分解は危ないから全部店に任せるべき。以上",44,"lecture",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("20:16:04","RLY-P5V","それを聞く前にできる確認の話では"),reaction("20:16:21","RLY-A4Q","店が遠いから聞いたんだ")]),
        choice("s1-hot","十年物なら博物館へ寄贈で解決",44,"pileon",{heat:3,momentum:2,stale:0,drift:0},[reaction("20:16:05","RLY-T3J","一回なら笑うけど質問は残ってる"),reaction("20:16:20","RLY-K8M",">>44 小ネジを先に")])
      ]),
      turn(post(48,"20:17:02","RLY-A4Q","締めたら空回り止まった。音量だけ少しガリガリ"),[
        choice("s2-good",">>48 直ったのはでかい。ガリは電源切って数回ゆっくり回すと軽くなることも",48,"next-step",{heat:0,momentum:1,stale:0,drift:0},[reaction("20:17:24","RLY-N2C","段階踏んでてよい"),reaction("20:17:37","RLY-A4Q","三往復で少し静かになった")]),
        choice("s2-cold","接点復活剤。接点復活剤。とにかく大量に",48,"lecture",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("20:17:20","RLY-K8M","大量はやめろ、場所も選ぶ"),reaction("20:17:39","RLY-A4Q","量の加減が分からん")]),
        choice("s2-drift","ラジオといえば深夜番組の話していい？",48,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("20:17:23","RLY-P5V","あとで聞く。今ガリの話"),reaction("20:17:40","RLY-T3J","脱線用の桟橋はまだ先")])
      ]),
      turn(post(52,"20:18:11","RLY-A4Q","普通に聞ける程度まで戻った。買わずに済みそう"),[
        choice("s3-good",">>52 勝ち。今日はそこで閉じて、型番と直した箇所だけメモしとくと次が楽",52,"close",{heat:0,momentum:1,stale:0,drift:0},[reaction("20:18:33","RLY-K8M","触りすぎず撤収までが修理"),reaction("20:18:51","RLY-A4Q","メモした。助かった")]),
        choice("s3-cold","だから最初から修理が正義だと言った",52,"lecture",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("20:18:31","RLY-N2C","誰も勝敗つけてない"),reaction("20:18:49","RLY-P5V","締めが説教だと冷える")]),
        choice("s3-drift","じゃあ次は真空管を集めよう。沼は深いぞ",52,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("20:18:32","RLY-A4Q","そこまでは行かない予定"),reaction("20:18:48","RLY-T3J","別航路が開いた")])
      ])
    ]
  },
  {
    id:"joke-curry",label:"ネタ",title:"カレーの隠し味、会議が長い",topic:"joke",initial:{heat:4,momentum:5,stale:0,drift:0},band:{heatMin:4,heatMax:6,momentumMin:5,momentumMax:9,staleMax:4,driftMax:3},
    seed:[post(81,"21:03:10","RLY-B7R","隠し味を隠しすぎて本人が行方不明"),post(82,"21:03:28","RLY-F2D",">>81 捜索願は鍋の横に出した"),post(83,"21:03:49","RLY-M9K","しょうゆ一滴の話が大事件になってて草")],
    turns:[
      turn(post(84,"21:04:12","RLY-C4H","現場から小さじが発見されました"),[
        choice("j1-good",">>84 小さじは黙秘。鍋だけが煮えている",84,"callback-spoon",{heat:1,momentum:1,stale:0,drift:0},[reaction("21:04:31","RLY-B7R","容疑者が硬い"),reaction("21:04:45","RLY-F2D","火だけ弱めとく")]),
        choice("j1-cold",">>84 料理では計量が重要です。正しい分量を守りましょう",84,"explain",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("21:04:30","RLY-M9K","急に家庭科"),reaction("21:04:44","RLY-C4H","会見終了")]),
        choice("j1-hot","小さじ逮捕！大さじも連座！鍋は無期懲役！",84,"pileon",{heat:3,momentum:2,stale:0,drift:0},[reaction("21:04:29","RLY-F2D","盛りすぎて焦げた"),reaction("21:04:46","RLY-B7R","鍋は返して")])
      ]),
      turn(post(88,"21:05:17","RLY-M9K","で、結局なに入れたらうまいんだよ"),[
        choice("j2-good",">>88 しょうゆ一滴。ここだけ急に供述が具体的",88,"answer-callback",{heat:0,momentum:1,stale:0,drift:0},[reaction("21:05:39","RLY-C4H","実用情報が紛れ込んだ"),reaction("21:05:51","RLY-M9K","一滴だけ試す")]),
        choice("j2-cold","隠し味の定義から説明すると、まず味覚には五味があり",88,"explain",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("21:05:38","RLY-B7R","長い 三行で"),reaction("21:05:53","RLY-F2D","カレー冷める")]),
        choice("j2-drift","うちの近所の定食屋ランキング貼っていい？",88,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("21:05:40","RLY-M9K","今は鍋の中の話"),reaction("21:05:52","RLY-C4H","別スレなら見る")])
      ]),
      turn(post(92,"21:06:20","RLY-M9K","一滴で角が取れた。小さじは釈放する"),[
        choice("j3-good",">>92 小さじ、証拠品だけ残して帰港",92,"release",{heat:-1,momentum:1,stale:0,drift:0},[reaction("21:06:41","RLY-B7R","きれいに閉廷"),reaction("21:06:55","RLY-F2D","次は普通に作れ")]),
        choice("j3-cold","最初の行方不明ネタ、もう一回やろうぜ",92,"explain",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("21:06:40","RLY-C4H","同じオチ三周目は重い"),reaction("21:06:54","RLY-M9K","解散で")]),
        choice("j3-drift","ところでカレー皿の色は白か黒か",92,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("21:06:42","RLY-F2D","新議題を立てるな"),reaction("21:06:56","RLY-B7R","航路それた")])
      ])
    ]
  },
  {
    id:"failure-train",label:"失敗談",title:"降りる駅で弁当だけ旅を続けた",topic:"failure",initial:{heat:4,momentum:4,stale:0,drift:0},band:{heatMin:3,heatMax:6,momentumMin:4,momentumMax:8,staleMax:4,driftMax:3},
    seed:[post(121,"22:10:02","RLY-D6S","電車降りた瞬間、網棚の弁当と目が合った"),post(122,"22:10:25","RLY-H3A",">>121 扉の向こうで単独旅行開始"),post(123,"22:10:47","RLY-Q8L","笑ったけど本人は昼抜きか")],
    turns:[
      turn(post(124,"22:11:09","RLY-D6S","駅員さんに伝えた。弁当は二駅先で保護予定"),[
        choice("f1-good",">>124 保護予定で安心。自分は傘を終点まで送ったことある",124,"small-share",{heat:0,momentum:1,stale:0,drift:0},[reaction("22:11:28","RLY-H3A","忘れ物だけ妙に旅慣れてる"),reaction("22:11:43","RLY-D6S","仲間いたか")]),
        choice("f1-cold","忘れ物をする人は注意力の仕組みから見直すべき",124,"diagnose",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("22:11:27","RLY-Q8L","弁当一個で診断始まった"),reaction("22:11:44","RLY-D6S","反省はしてる")]),
        choice("f1-hot","弁当かわいそう！持ち主失格！",124,"pileon",{heat:3,momentum:2,stale:0,drift:0},[reaction("22:11:30","RLY-H3A","弁当側の代理人が強い"),reaction("22:11:45","RLY-Q8L","責めるほどではない")])
      ]),
      turn(post(128,"22:12:13","RLY-D6S","問題は受け取り駅まで往復四十分なこと"),[
        choice("f2-good",">>128 四十分で昼飯と再会なら、帰りは勝利の車窓だ",128,"reframe",{heat:0,momentum:1,stale:0,drift:0},[reaction("22:12:32","RLY-Q8L","交通費込みの高級弁当"),reaction("22:12:47","RLY-D6S","もうイベントとして行く")]),
        choice("f2-cold","時間管理が甘い。移動コストも事前に計算すべき",128,"diagnose",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("22:12:31","RLY-H3A","起きた後に言っても戻らん"),reaction("22:12:48","RLY-D6S","はい")]),
        choice("f2-drift","駅弁なら海鮮派？肉派？",128,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("22:12:33","RLY-D6S","今日は唐揚げ"),reaction("22:12:46","RLY-Q8L","飯スレへ曲がり始めた")])
      ]),
      turn(post(132,"22:13:20","RLY-D6S","回収した。ちょっと傾いてるが無事"),[
        choice("f3-good",">>132 おかえり弁当。傾きは旅の勲章ということで食え",132,"welcome",{heat:0,momentum:1,stale:0,drift:0},[reaction("22:13:39","RLY-H3A","無事帰港"),reaction("22:13:53","RLY-D6S","いただきます")]),
        choice("f3-cold","今後は網棚を使わない。それが唯一の対策",132,"diagnose",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("22:13:38","RLY-Q8L","もう回収した後だぞ"),reaction("22:13:55","RLY-D6S","今日はそれで閉めよう")]),
        choice("f3-drift","唐揚げの写真まだ？断面も頼む",132,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("22:13:40","RLY-D6S","食べさせてくれ"),reaction("22:13:54","RLY-H3A","食レポ航路へ")])
      ])
    ]
  },
  {
    id:"tangent-desk",label:"軽い脱線",title:"机の配線から謎の鍵が出た",topic:"tangent",initial:{heat:3,momentum:5,stale:0,drift:1},band:{heatMin:2,heatMax:5,momentumMin:4,momentumMax:9,staleMax:4,driftMax:3},
    seed:[post(201,"19:40:03","RLY-E5W","配線整理したら用途不明の小さい鍵が一本"),post(202,"19:40:21","RLY-J7B",">>201 机の裏に宝箱あるぞ"),post(203,"19:40:44","RLY-R2N","ケーブルの話がもう冒険になった")],
    turns:[
      turn(post(204,"19:41:08","RLY-E5W","鍵には307って刻印。引き出しは全部開く"),[
        choice("t1-good",">>204 宝箱説は一旦保留。307なら古いロッカー鍵っぽい形？",204,"bridge",{heat:1,momentum:1,stale:0,drift:-1},[reaction("19:41:27","RLY-J7B","冒険を残しつつ現場へ戻した"),reaction("19:41:42","RLY-E5W","確かにロッカー鍵くらいの大きさ")]),
        choice("t1-cold","鍵の管理台帳を作成し、全所有物を番号順に並べるべき",204,"procedure",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("19:41:26","RLY-R2N","整理の規模がでかい"),reaction("19:41:44","RLY-E5W","一本だけなんだ")]),
        choice("t1-hot","307号室に突入だ！今夜決行！",204,"pileon",{heat:3,momentum:2,stale:0,drift:0},[reaction("19:41:28","RLY-J7B","物件を作るな"),reaction("19:41:43","RLY-R2N","勢いだけ満室")])
      ]),
      turn(post(208,"19:42:12","RLY-E5W","前の職場のロッカー番号が307だった気がする"),[
        choice("t2-good",">>208 たぶん帰ってきた忘れ物だな。鍵箱に『前職場？』で隔離しとけ",208,"bridge-back",{heat:0,momentum:1,stale:0,drift:-1},[reaction("19:42:31","RLY-R2N","捨てずに保留できる答え"),reaction("19:42:47","RLY-E5W","付箋つけた")]),
        choice("t2-cold","退職時の返却確認が不十分だった可能性があります",208,"procedure",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("19:42:30","RLY-J7B","監査が来た"),reaction("19:42:48","RLY-E5W","五年前なので記憶がない")]),
        choice("t2-drift","前職場の変な人ランキングも聞こう",208,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("19:42:33","RLY-E5W","鍵から離れすぎ"),reaction("19:42:46","RLY-R2N","新スレ案件")])
      ]),
      turn(post(212,"19:43:15","RLY-E5W","配線は片付いた。鍵だけ保留箱へ入れた"),[
        choice("t3-good",">>212 本題の配線が片付いたなら勝ち。鍵の続編は判明した時だけ頼む",212,"close-loop",{heat:0,momentum:1,stale:0,drift:0},[reaction("19:43:34","RLY-J7B","宝箱編は凍結"),reaction("19:43:49","RLY-E5W","判明したら戻る")]),
        choice("t3-cold","保留では解決になっていない。今すぐ照合を続けるべき",212,"procedure",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("19:43:33","RLY-R2N","配線は解決したぞ"),reaction("19:43:50","RLY-E5W","今日は終わる")]),
        choice("t3-drift","保留箱の中身を全部実況しよう",212,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("19:43:35","RLY-J7B","第二部を始めるな"),reaction("19:43:48","RLY-R2N","脱線が本線になった")])
      ])
    ]
  },
  {
    id:"near-flame-rules",label:"荒れかけ",title:"共有棚のルール、誰が変えた",topic:"near-flame",initial:{heat:5,momentum:5,stale:1,drift:0},band:{heatMin:3,heatMax:6,momentumMin:4,momentumMax:8,staleMax:4,driftMax:3},
    seed:[post(301,"23:01:04","RLY-G4T","共有棚、予約札なしで使う方式に変わった？"),post(302,"23:01:22","RLY-L9C",">>301 昨日から札が箱ごと消えてる"),post(303,"23:01:40","RLY-V2F","勝手に持ってった人いるなら戻してほしい")],
    turns:[
      turn(post(304,"23:02:03","RLY-X6P",">>303 すぐ犯人扱いはどうなん。管理側が片付けたかも"),[
        choice("a1-good",">>304 そこは未確認だな。まず札の箱を移動したか管理メモだけ見よう",304,"fact-check",{heat:-1,momentum:1,stale:0,drift:0},[reaction("23:02:22","RLY-G4T","確認先が一個に絞れた"),reaction("23:02:37","RLY-V2F","犯人扱いは撤回する")]),
        choice("a1-cold","双方落ち着いて。ネットマナーを守って丁寧に話しましょう",304,"moderate",{heat:-2,momentum:-1,stale:2,drift:0},[reaction("23:02:21","RLY-L9C","自治の話じゃなく札の場所"),reaction("23:02:38","RLY-X6P","話が止まった")]),
        choice("a1-hot",">>304 持ってった本人っぽい反応で草",304,"pileon",{heat:3,momentum:2,stale:0,drift:0},[reaction("23:02:20","RLY-X6P","そういう決めつけが嫌なんだよ"),reaction("23:02:39","RLY-G4T","棚の話から人の話になってる")])
      ]),
      turn(post(308,"23:03:07","RLY-L9C","管理メモに『札は洗浄中、明朝戻す』ってあった"),[
        choice("a2-good",">>308 原因判明。今日は棚に時刻だけ書いた紙を置けば衝突しなさそう",308,"temporary-fix",{heat:-1,momentum:1,stale:0,drift:0},[reaction("23:03:26","RLY-G4T","仮運用それでいける"),reaction("23:03:41","RLY-X6P","紙置いてきた")]),
        choice("a2-cold","最初から管理メモを読む習慣を全員が持つべきでした",308,"moderate",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("23:03:25","RLY-V2F","正論の表彰式はいらない"),reaction("23:03:42","RLY-L9C","今夜どうするかだけでいい")]),
        choice("a2-drift","洗浄って何で洗ってるか気になる",308,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("23:03:28","RLY-G4T","そこではない"),reaction("23:03:40","RLY-X6P","札の衛生スレになった")])
      ]),
      turn(post(312,"23:04:12","RLY-V2F","紙で予約できた。決めつけた件はすまん"),[
        choice("a3-good",">>312 収まったならそれで。明朝札が戻るかだけ確認して閉じよう",312,"close-fact",{heat:0,momentum:1,stale:0,drift:0},[reaction("23:04:31","RLY-X6P","了解、こっちも言い方きつかった"),reaction("23:04:46","RLY-G4T","棚もスレも適温")]),
        choice("a3-cold","謝罪文としては短すぎる。経緯を整理して再投稿を",312,"moderate",{heat:-1,momentum:-1,stale:2,drift:0},[reaction("23:04:30","RLY-L9C","もう収まってるのに再点火するな"),reaction("23:04:47","RLY-V2F","これ以上は書かない")]),
        choice("a3-drift","この勢いで共有冷蔵庫ルールも決める？",312,"tangent",{heat:0,momentum:1,stale:0,drift:2},[reaction("23:04:33","RLY-X6P","別件を混ぜるな"),reaction("23:04:45","RLY-G4T","今日は棚だけ")])
      ])
    ]
  }
]);
const SCENARIO_IDS=new Set(SCENARIOS.map(item=>item.id));

function classify(stats,band){
  if(stats.heat>band.heatMax||stats.momentum>band.momentumMax)return"flame";
  if(stats.drift>band.driftMax)return"derail";
  if(stats.heat<band.heatMin||stats.momentum<band.momentumMin||stats.stale>band.staleMax)return"cold";
  return"success";
}
function simulate(task,path){
  const stats={...task.initial},seen=new Map(),steps=[];
  for(let index=0;index<TURNS;index++){
    const selected=task.turns[index]?.choices.find(item=>item.id===path[index]);if(!selected)return{outcome:"invalid",stats,steps};
    const repeats=seen.get(selected.motif)||0;seen.set(selected.motif,repeats+1);
    stats.heat=clamp(stats.heat+selected.delta.heat);stats.momentum=clamp(stats.momentum+selected.delta.momentum);stats.stale=clamp(stats.stale+selected.delta.stale+(repeats?2:0));stats.drift=clamp(stats.drift+selected.delta.drift);
    steps.push({choiceId:selected.id,repeats,stats:{...stats}});
  }
  return{outcome:classify(stats,task.band),stats,steps};
}
function analyze(task){
  const paths=[],counts={success:0,cold:0,derail:0,flame:0},path=[];
  const visit=index=>{if(index===TURNS){const result=simulate(task,path);counts[result.outcome]=(counts[result.outcome]||0)+1;paths.push({choices:[...path],outcome:result.outcome,stats:result.stats});return}task.turns[index].choices.forEach(item=>{path[index]=item.id;visit(index+1)})};visit(0);
  return{total:paths.length,wins:counts.success||0,counts,answer:paths.find(item=>item.outcome==="success")?.choices||null,paths};
}
function buildTask(source,shuffle){
  const scenario=clone(source);scenario.turns.forEach(item=>{item.choices=shuffle(item.choices)});
  const task={kind:"threadVibe",prompt:PROMPT,help:HELP,scenarioId:scenario.id,label:scenario.label,title:scenario.title,topic:scenario.topic,seed:scenario.seed,turns:scenario.turns,initial:scenario.initial,band:scenario.band,duration:DURATION,total:TOTAL_PATHS,wins:0,answer:[],outcomes:null},proof=analyze(task);
  task.wins=proof.wins;task.answer=proof.answer;task.outcomes=proof.counts;return task;
}
function generate({pick,shuffle}={}){
  if(typeof pick!=="function"||typeof shuffle!=="function")throw new TypeError(`${metadata.id} requires pick and shuffle`);
  const selected=pick(SCENARIOS);if(!SCENARIOS.includes(selected))throw new TypeError(`${metadata.id}: pick must return a supplied scenario`);
  const probe=shuffle([0,1,2]);if(!Array.isArray(probe)||probe.length!==3)throw new TypeError(`${metadata.id}: shuffle must return a complete array`);
  return buildTask(selected,values=>{const order=shuffle(values);if(!Array.isArray(order)||order.length!==values.length)throw new TypeError(`${metadata.id}: shuffle must return a complete array`);return order});
}
function validatePost(value,label,issues,{number=true}={}){
  if(!value||typeof value!=="object"){issues.push(`${label} must be an object`);return}
  if(number&&(!Number.isInteger(value.no)||value.no<1||value.no>9999))issues.push(`${label} number is invalid`);
  if(!/^\d{2}:\d{2}:\d{2}$/.test(value.time||""))issues.push(`${label} time is invalid`);
  if(!/^RLY-[A-Z0-9]{2,5}$/.test(value.id||""))issues.push(`${label} fictional ID is invalid`);
  if(value.author!=="匿名乗組員")issues.push(`${label} author changed`);
  if(typeof value.text!=="string"||value.text.length<2||value.text.length>96)issues.push(`${label} text length is invalid`);
  if(/https?:|(?:2|5)ちゃんねる|@|#[A-Za-z0-9_]{3,}/i.test(value.text||""))issues.push(`${label} contains copied-service or external identity syntax`);
}
function validate(task){
  const issues=[];if(!task||typeof task!=="object")return["task must be an object"];
  if(task.kind!=="threadVibe")issues.push("kind must remain threadVibe");if(task.prompt!==PROMPT)issues.push("prompt changed");if(task.help!==HELP)issues.push("help changed");if(task.duration!==DURATION)issues.push(`duration must remain ${DURATION}ms`);
  if(!SCENARIO_IDS.has(task.scenarioId))issues.push("scenarioId is invalid");if(typeof task.label!=="string"||typeof task.title!=="string"||typeof task.topic!=="string")issues.push("thread identity is invalid");
  if(!Array.isArray(task.seed)||task.seed.length!==3)issues.push("seed must contain three posts");else task.seed.forEach((item,index)=>validatePost(item,`seed ${index+1}`,issues));
  if(!task.initial||["heat","momentum","stale","drift"].some(key=>!Number.isInteger(task.initial[key])||task.initial[key]<0||task.initial[key]>10))issues.push("initial meters are invalid");
  const band=task.band;if(!band||!Number.isInteger(band.heatMin)||!Number.isInteger(band.heatMax)||band.heatMin>=band.heatMax||!Number.isInteger(band.momentumMin)||!Number.isInteger(band.momentumMax)||band.momentumMin>=band.momentumMax||!Number.isInteger(band.staleMax)||!Number.isInteger(band.driftMax))issues.push("band is invalid");
  const ids=new Set(),turns=Array.isArray(task.turns)?task.turns:[];if(turns.length!==TURNS)issues.push("turns must contain exactly three rounds");
  turns.forEach((item,turnIndex)=>{validatePost(item?.incoming,`turn ${turnIndex+1} incoming`,issues);const choices=Array.isArray(item?.choices)?item.choices:[];if(choices.length!==CHOICES)issues.push(`turn ${turnIndex+1} must contain three choices`);choices.forEach((option,choiceIndex)=>{const label=`turn ${turnIndex+1} choice ${choiceIndex+1}`;if(typeof option?.id!=="string"||ids.has(option.id))issues.push(`${label} id is invalid or duplicate`);else ids.add(option.id);if(typeof option?.text!=="string"||option.text.length<4||option.text.length>88)issues.push(`${label} text is invalid`);if(!Number.isInteger(option?.replyTo)||option.replyTo!==item?.incoming?.no)issues.push(`${label} anchor must target the incoming post`);if(typeof option?.motif!=="string"||option.motif.length<3||option.motif.length>24)issues.push(`${label} motif is invalid`);const delta=option?.delta;if(!delta||["heat","momentum","stale","drift"].some(key=>!Number.isInteger(delta[key])||delta[key]<-3||delta[key]>3))issues.push(`${label} delta is invalid`);if(!Array.isArray(option?.reactions)||option.reactions.length!==2)issues.push(`${label} must contain two follow-up posts`);else option.reactions.forEach((reply,index)=>validatePost(reply,`${label} reaction ${index+1}`,issues,{number:false}))})});
  if(task.total!==TOTAL_PATHS)issues.push(`total must remain ${TOTAL_PATHS}`);if(!Number.isInteger(task.wins)||task.wins<1||task.wins>=TOTAL_PATHS)issues.push("wins must describe a proper success subset");if(!Array.isArray(task.answer)||task.answer.length!==TURNS)issues.push("answer must contain three choice IDs");
  if(!task.outcomes||["success","cold","derail","flame"].some(key=>!Number.isInteger(task.outcomes[key])||task.outcomes[key]<1))issues.push("every authored terminal outcome must be reachable");
  const authored=SCENARIOS.find(item=>item.id===task.scenarioId);if(authored){if(task.label!==authored.label||task.title!==authored.title||task.topic!==authored.topic||!same(task.seed,authored.seed)||!same(task.initial,authored.initial)||!same(task.band,authored.band))issues.push("authored thread identity or seed changed");if(turns.length===TURNS)turns.forEach((item,index)=>{const expected=authored.turns[index],ordered=Array.isArray(item?.choices)?[...item.choices].sort((left,right)=>String(left?.id).localeCompare(String(right?.id))):[],expectedOrdered=[...expected.choices].sort((left,right)=>left.id.localeCompare(right.id));if(!same(item?.incoming,expected.incoming)||!same(ordered,expectedOrdered))issues.push(`turn ${index+1} authored posts or choices changed`)})}
  if(!issues.length){const proof=analyze(task);if(proof.total!==TOTAL_PATHS)issues.push("exhaustive path total changed");if(proof.wins!==task.wins)issues.push("wins does not match exhaustive proof");if(!same(proof.answer,task.answer))issues.push("answer must be the first exhaustive success path");if(!same(proof.counts,task.outcomes))issues.push("outcome counts do not match exhaustive proof");if(simulate(task,task.answer).outcome!=="success")issues.push("answer is not successful")}
  return[...new Set(issues)];
}

const STYLE=`
.stv-stage{box-sizing:border-box;width:100%;max-width:430px;margin:auto;display:grid;gap:.5rem;padding:.55rem;border:1px solid #273349;border-radius:1rem;background:linear-gradient(155deg,#172235,#101826);color:#e9edf3;box-shadow:0 13px 30px rgba(22,27,39,.3);contain:layout paint;overflow:hidden}.stv-stage:focus-visible{outline:3px solid #86a8d8;outline-offset:3px}.stv-head{display:grid;gap:.36rem;padding:.48rem .55rem;border:1px solid #3c4a61;border-radius:.7rem;background:linear-gradient(180deg,#263248,#1d273a)}.stv-brand{display:flex;align-items:center;justify-content:space-between;gap:.4rem;color:#9eb5d2;font:800 .65rem/1.2 system-ui;letter-spacing:.08em}.stv-brand b{color:#f0f4f8;font-size:.73rem}.stv-title{margin:0;color:#fff;font:900 clamp(.9rem,4vw,1.05rem)/1.3 system-ui}.stv-meters{display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem}.stv-meter{display:grid;grid-template-columns:auto auto;justify-content:space-between;gap:.15rem;padding:.24rem .3rem .3rem;border-radius:.38rem;background:#172236;color:#bdc9d8;font:800 .59rem/1.2 system-ui}.stv-meter b{min-width:1.25rem;border-radius:.25rem;background:#2e3c52;color:#fff;text-align:center}.stv-meter-track{grid-column:1/-1;height:.36rem;border-radius:1rem;background:#0d1420;overflow:hidden}.stv-meter-track i{display:block;width:var(--value);height:100%;border-radius:inherit;background:var(--color);transition:width .28s ease;box-shadow:0 0 8px var(--color)}
.stv-thread{box-sizing:border-box;height:18rem;overflow:auto;overscroll-behavior:contain;border:1px solid #b8b2a6;border-radius:.72rem;background:linear-gradient(165deg,#f3f0e7,#e8e3d6);color:#20242a;box-shadow:inset 0 2px 7px rgba(59,51,42,.13);scrollbar-color:#8390a0 transparent}.stv-post{padding:.42rem .52rem;border-bottom:1px solid rgba(91,86,76,.16);font-family:"SFMono-Regular",Menlo,Consolas,"Noto Sans Mono CJK JP",monospace}.stv-post:last-child{border-bottom:0}.stv-post.is-you{border-left:4px solid #596fc2;background:#eef1fb}.stv-post.is-reaction{border-left:4px solid #72a57a;background:#edf5ea}.stv-post.is-incoming{border-left:4px solid #c38749;background:#f7efe4}.stv-meta{display:flex;flex-wrap:wrap;gap:.28rem;color:#48515a;font-size:.62rem;font-weight:650;line-height:1.25}.stv-meta b{color:#34744d}.stv-meta .stv-no{color:#8b4c34;font-weight:950}.stv-body{margin:.2rem 0 0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:clamp(.72rem,3.2vw,.8rem);font-weight:650;line-height:1.42}.stv-anchor{color:#315fb7;font-weight:900}.stv-new{animation:stv-arrive .28s ease-out both}
.stv-status{min-height:2.3rem;margin:0;padding:.42rem .55rem;border:1px solid #485970;border-radius:.66rem;background:#202d42;color:#e5edf7;text-align:center;font:850 .73rem/1.35 system-ui}.stv-status.is-hot{border-color:#bd6755;background:#4a2729;color:#ffe4dd}.stv-status.is-cold{border-color:#66839e;background:#203143;color:#dfeeff}.stv-compose{display:grid;gap:.34rem}.stv-compose h3{margin:0;color:#c9d4e3;font:900 .68rem/1.2 system-ui;letter-spacing:.04em}.stv-options{display:grid;gap:.3rem}.stv-option{box-sizing:border-box;width:100%;min-height:3rem;display:grid;grid-template-columns:3.4rem 1fr;align-items:center;gap:.38rem;border:1px solid #52627a;border-radius:.68rem;background:linear-gradient(145deg,#2a3850,#202b40);color:#f4f7fb;padding:.42rem .5rem;text-align:left;font-family:"SFMono-Regular",Menlo,Consolas,"Noto Sans Mono CJK JP",monospace;cursor:pointer;touch-action:manipulation}.stv-option small{color:#82aaf0;font-size:.63rem;font-weight:950}.stv-option span{font-size:.69rem;font-weight:750;line-height:1.35}.stv-option:focus-visible{outline:3px solid #a9c7f0;outline-offset:2px}.stv-option.is-picked{border-color:#e3a864;background:linear-gradient(145deg,#4a3a30,#2f2e38);box-shadow:inset 0 0 0 1px rgba(255,210,145,.28)}.stv-option:active:not(:disabled){transform:translateY(2px)}.stv-option:disabled{opacity:.48;cursor:default}.stv-option.is-picked:disabled{opacity:1}.stv-terminal{display:none;gap:.22rem;padding:.58rem .68rem;border:1px solid #75859b;border-radius:.7rem;background:#172236}.stv-terminal strong{font:950 1rem/1.2 system-ui}.stv-terminal span{color:#d3dce8;font:750 .72rem/1.4 system-ui}.stv-terminal em{width:max-content;max-width:100%;padding:.18rem .4rem;border-radius:.35rem;background:rgba(4,12,20,.25);color:#f3f6fa;font:850 .68rem/1.3 system-ui;font-style:normal;white-space:nowrap}.stv-stage[data-result=success] .stv-terminal{display:grid;border-color:#69b486;background:#17392f}.stv-stage[data-result=cold] .stv-terminal{display:grid;border-color:#6f91b0;background:#203349}.stv-stage[data-result=derail] .stv-terminal{display:grid;border-color:#9a78b6;background:#352744}.stv-stage[data-result=flame] .stv-terminal{display:grid;border-color:#d16e5e;background:#542726}.stv-stage[data-result=timeout] .stv-terminal{display:grid;border-color:#9b7689;background:#392735}.stv-stage[data-result] .stv-compose,.stv-stage[data-result] .stv-status{display:none}.stv-thread::after{content:"";display:block;height:var(--tail-pad,0px)}
@keyframes stv-arrive{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.stv-stage[data-reduced=true] *{animation:none!important;transition:none!important}@media(prefers-reduced-motion:reduce){.stv-stage *{animation:none!important;transition:none!important}}@media(max-width:400px){.stv-stage{padding:.45rem}.stv-thread{height:17rem}.stv-option{grid-template-columns:3rem 1fr;padding-inline:.42rem}}
`;

function render(task,context){
  const issues=validate(task);if(issues.length)throw new Error(`${metadata.id}: ${issues.join("; ")}`);
  const documentRef=context.host?.ownerDocument;if(!documentRef?.createElement)throw new TypeError(`${metadata.id}: context.host.ownerDocument is required`);const view=documentRef.defaultView||globalThis;
  const style=documentRef.createElement("style");style.textContent=STYLE;const stage=documentRef.createElement("section");stage.className="stv-stage";stage.dataset.reduced=String(Boolean(context.reducedMotion));stage.tabIndex=0;stage.setAttribute("aria-label","匿名掲示板の流れを三返信で整えるゲーム");
  const head=documentRef.createElement("header");head.className="stv-head";const brand=documentRef.createElement("div");brand.className="stv-brand";const brandName=documentRef.createElement("b");brandName.textContent="匿名航路 / THREAD DECK";const label=documentRef.createElement("span");label.textContent=task.label;brand.append(brandName,label);const title=documentRef.createElement("h2");title.className="stv-title";title.textContent=task.title;const meters=documentRef.createElement("div");meters.className="stv-meters";
  const meterData=[{key:"momentum",label:"勢い",color:"#5aa6d6"},{key:"heat",label:"温度",color:"#df8b50"},{key:"stale",label:"既出",color:"#9a78c3"}],meterNodes={};meterData.forEach(item=>{const box=documentRef.createElement("div");box.className="stv-meter";const name=documentRef.createElement("span");name.textContent=item.label;const value=documentRef.createElement("b");const track=documentRef.createElement("span");track.className="stv-meter-track";const fill=documentRef.createElement("i");fill.style.setProperty("--color",item.color);track.append(fill);box.append(name,value,track);meters.append(box);meterNodes[item.key]={box,value,fill}});head.append(brand,title,meters);
  const thread=documentRef.createElement("div");thread.className="stv-thread";thread.setAttribute("role","log");thread.setAttribute("aria-live","polite");thread.setAttribute("aria-label","匿名航路の投稿一覧");const status=documentRef.createElement("p");status.className="stv-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");const compose=documentRef.createElement("section");compose.className="stv-compose";const composeTitle=documentRef.createElement("h3");const options=documentRef.createElement("div");options.className="stv-options";compose.append(composeTitle,options);const terminal=documentRef.createElement("section");terminal.className="stv-terminal";const terminalTitle=documentRef.createElement("strong");const terminalBody=documentRef.createElement("span");const terminalMetrics=documentRef.createElement("em");terminal.append(terminalTitle,terminalBody,terminalMetrics);stage.append(head,thread,status,compose,terminal);context.host.replaceChildren(style,stage);
  const stats={...task.initial},seen=new Map(),path=[],posts=[],buttons=[];let turnIndex=0,nextNo=task.turns[0].incoming.no+1,busy=false,done=false,disposed=false,result=null,finishCalls=0;
  const later=(fn,ms)=>context.later(()=>{if(!disposed)fn()},context.reducedMotion?Math.max(70,Math.min(ms,110)):ms);
  const appendText=(node,text)=>{String(text).split(/(>>\d+)/).filter(Boolean).forEach(part=>{if(/^>>\d+$/.test(part)){const anchor=documentRef.createElement("span");anchor.className="stv-anchor";anchor.textContent=part;node.append(anchor)}else node.append(part)})};
  const snapThreadTail=()=>{const children=[...thread.children],height=Number(thread.clientHeight);thread.style.setProperty("--tail-pad","0px");const contentHeight=Number(thread.scrollHeight);if(!children.length||!Number.isFinite(height)||height<=0||!Number.isFinite(contentHeight))return;if(contentHeight<=height){thread.scrollTop=0;return}const base=Number(children[0].offsetTop)||0;let top=Math.max(0,(Number(children.at(-1).offsetTop)||base)-base);for(let index=children.length-1;index>=0;index--){const candidate=Math.max(0,(Number(children[index].offsetTop)||base)-base);if(contentHeight-candidate<=height)top=candidate;else break}let padding=Math.max(1,height-(contentHeight-top)+25);thread.style.setProperty("--tail-pad",`${padding}px`);void thread.scrollHeight;thread.scrollTop=top;const deficit=top-thread.scrollTop;if(deficit>1){padding+=deficit+2;thread.style.setProperty("--tail-pad",`${padding}px`);void thread.scrollHeight;thread.scrollTop=top}};
  const appendPost=(source,kind="")=>{const article=documentRef.createElement("article");article.className=`stv-post stv-new${kind?` is-${kind}`:""}`;const meta=documentRef.createElement("div");meta.className="stv-meta";const no=documentRef.createElement("span");no.className="stv-no";no.textContent=String(source.no);const author=documentRef.createElement("b");author.textContent=source.author;const time=documentRef.createElement("span");time.textContent=source.time;const id=documentRef.createElement("span");id.textContent=`ID:${source.id}`;meta.append(no,author,time,id);const body=documentRef.createElement("p");body.className="stv-body";appendText(body,source.text);article.append(meta,body);thread.append(article);posts.push({...source,kind});snapThreadTail();return article};
  const paintMeters=()=>meterData.forEach(item=>{const value=stats[item.key];meterNodes[item.key].value.textContent=String(value);meterNodes[item.key].fill.style.setProperty("--value",`${value/10*100}%`);meterNodes[item.key].box.setAttribute("aria-label",`${item.label} ${value}`)});
  const applyChoice=selected=>{const repeats=seen.get(selected.motif)||0;seen.set(selected.motif,repeats+1);stats.heat=clamp(stats.heat+selected.delta.heat);stats.momentum=clamp(stats.momentum+selected.delta.momentum);stats.stale=clamp(stats.stale+selected.delta.stale+(repeats?2:0));stats.drift=clamp(stats.drift+selected.delta.drift);paintMeters()};
  const makeRuntimePost=(source,kind)=>({...source,no:nextNo++,kind});
  const finalCopy={success:["適温で完走","短さと距離感が噛み合い、三返信後も会話が続きました。"],cold:["スレが冷えた","勢いか温度が落ちた、または既出ネタを擦りすぎました。"],derail:["航路がそれた","軽い脱線が本線を押し流しました。元の投稿への橋が不足です。"],flame:["温度上限を突破","勢いを取りに行きすぎ、論点より反応が熱くなりました。"],timeout:["DAT落ち前に間に合わず","返信を選ぶ前に流れが止まりました。"]};
  const finish=(outcome,reason=outcome)=>{if(done||disposed)return false;done=true;busy=false;result=outcome;finishCalls++;stage.dataset.result=outcome;buttons.forEach(button=>button.disabled=true);const copy=finalCopy[outcome];terminalTitle.textContent=copy[0];terminalBody.textContent=copy[1];terminalMetrics.textContent=`勢い${stats.momentum} / 温度${stats.heat} / 既出${stats.stale} / 脱線${stats.drift}`;status.className=`stv-status${outcome==="flame"?" is-hot":outcome==="cold"?" is-cold":""}`;status.textContent=copy[0];snapThreadTail();later(()=>context.finish(outcome==="success",{reason,quality:outcome==="success"?clamp(.9-(stats.stale+stats.drift)*.06,0,1):0,detail:`${terminalBody.textContent}　${terminalMetrics.textContent}`}),outcome==="success"?620:420);return true};
  const updateButtons=()=>buttons.forEach(button=>button.disabled=busy||done);
  const renderChoices=()=>{buttons.length=0;options.replaceChildren();const current=task.turns[turnIndex];composeTitle.textContent=`今回の返信 ${turnIndex+1} / ${TURNS}　候補をタップで投稿`;current.choices.forEach((selected,index)=>{const button=documentRef.createElement("button");button.type="button";button.className="stv-option";button.dataset.id=selected.id;const anchor=documentRef.createElement("small");anchor.textContent=`${index+1}　>>${selected.replyTo}`;const text=documentRef.createElement("span");text.textContent=selected.text.replace(new RegExp(`^>>${selected.replyTo}\\s*`),"");button.append(anchor,text);const choose=event=>{event?.preventDefault?.();select(selected.id)};context.listen(button,"pointerdown",choose);context.listen(button,"click",event=>{if(event.detail===0)choose(event)});options.append(button);buttons.push(button)});updateButtons()};
  const advanceAfterChoice=selected=>{const first=makeRuntimePost(selected.reactions[0],"reaction");appendPost(first,"reaction");applyChoice(selected);status.textContent=`追従レスで変化：勢い${stats.momentum} / 温度${stats.heat} / 既出${stats.stale}`;later(()=>{const second=makeRuntimePost(selected.reactions[1],"reaction");appendPost(second,"reaction");turnIndex++;if(turnIndex>=TURNS){finish(classify(stats,task.band));return}const incoming=task.turns[turnIndex].incoming;appendPost(incoming,"incoming");nextNo=Math.max(nextNo,incoming.no+1);busy=false;status.textContent=`新着 >>${incoming.no}。流れを読んで短く返してください`;renderChoices()},320)};
  const select=id=>{if(done||disposed||busy)return false;const current=task.turns[turnIndex],selected=current.choices.find(item=>item.id===id);if(!selected)return false;busy=true;path.push(selected.id);buttons.forEach(button=>button.dataset.id===selected.id?button.classList.add("is-picked"):button.classList.remove("is-picked"));updateButtons();const [hour,minute,second]=current.incoming.time.split(":").map(Number),stamp=(hour*3600+minute*60+second+5)%86400,ownTime=[Math.floor(stamp/3600),Math.floor(stamp%3600/60),stamp%60].map(value=>String(value).padStart(2,"0")).join(":"),own=post(nextNo++,ownTime,"RLY-YOU",selected.text);appendPost(own,"you");status.textContent=`>>${selected.replyTo} へ送信。追従レスを待っています…`;later(()=>advanceAfterChoice(selected),300);return true};
  context.listen(stage,"keydown",event=>{if(done||busy)return;const numeric=Number(event.key)-1;if(numeric>=0&&numeric<buttons.length){event.preventDefault();select(task.turns[turnIndex].choices[numeric].id);return}const current=buttons.indexOf(documentRef.activeElement);if(event.key==="ArrowDown"||event.key==="ArrowUp"){event.preventDefault();const direction=event.key==="ArrowDown"?1:-1,index=current<0?(direction>0?0:buttons.length-1):clamp(current+direction,0,buttons.length-1);buttons[index]?.focus({preventScroll:true})}});
  task.seed.forEach(item=>appendPost(item));appendPost(task.turns[0].incoming,"incoming");paintMeters();status.textContent="1手で最大ウケを狙わず、3レス後も読める温度へ";renderChoices();context.setDeadline(task.duration,()=>finish("timeout","timeout"));
  const proof=analyze(task),qaApi={select,timeout:()=>finish("timeout","timeout"),pathFor:outcome=>proof.paths.find(item=>item.outcome===outcome)?.choices||null,simulate:pathValue=>simulate(task,pathValue),inspect:()=>({turn:turnIndex,busy,done,disposed,result,finishCalls,stats:{...stats},path:[...path],posts:posts.map(item=>({...item})),visibleOptions:buttons.map(button=>button.textContent),activeElement:documentRef.activeElement?.textContent||null,dpr:Math.max(1,Math.min(3,Number(context.viewport?.dpr)||Number(view.devicePixelRatio)||1)),viewport:{...context.viewport}})};
  if(context.qa&&typeof context.qa==="object")context.qa[metadata.id]=qaApi;context.listen(context.signal,"abort",()=>{disposed=true;done=true;busy=false;if(context.qa?.[metadata.id]===qaApi)delete context.qa[metadata.id]},{once:true});
}

export default Object.freeze({metadata,generate,validate,render});
