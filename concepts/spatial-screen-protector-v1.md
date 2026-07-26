# 光を逃がす保護フィルム

Status: owner implementation, focused Node QA, and isolated audit-lane browser/visual acceptance complete on the canonical 393×852 and 402×874 DPR3 matrix.

- Stable ID: `spatial-screen-protector-v1`
- Introduced in: `2.0`
- Category: `spatial`
- Tier: 3
- Flavor: `satisfying`
- Step: 1
- Family: `spatial-screen-protector`

## Core loop

スマートフォンの下端で保護フィルムを指に密着させ、浅い角度を保ちながら上へ貼る。フィルムの接着frontは指のすぐ前を進み、ガラスとの間にある気泡は圧力から逃げる方向へ扁平化して移動する。指を気泡の左へ置けば右端、右へ置けば左端、気泡の真上へ置けば未接着の上端へ押せる。各帯で指の横位置を変える必要があり、一本の直線wipeでは完成しない。

気泡を越えてfrontを閉じると、その気泡は接着済み領域へ密閉される。直後ならfrontを一帯だけ戻して角度を変え、再接着できる。剥がし戻しは一回だけ安全で、二回目はフィルムに白いtension creaseが走る `overpeel` failureになる。上端到達時に全気泡が左右端または上端へ物理的に出たときだけ成功する。気泡のtap消去、progress barだけの判定、入力なしの自動成功はない。

## Causal states and outcomes

- `invalid`: 下端以外から貼り始める、接着中に重複操作する、frontが下端なのに剥がす。入力は消費せず、赤い圧痕とlive messageを短く残す。
- `trapped`: 間違った側から圧力をかけ、気泡がfrontの後ろに密閉された状態。frontは濁り、その気泡は円ではなく押し潰された楕円になる。次の入力は一帯peel-backで回復できる。
- `overpeel`: 許容回数を超えて剥がし、film edgeに白い応力線が残るterminal failure。
- `success`: 第5帯の接着が完了し、気泡数が0。上端の余白へ最後の気泡が抜け、干渉縞が静まる。
- `timeout`: 現在のfront、残気泡、tensionを保持したまま終了。

途中の `trapped` は即時terminalではない。正しい回復は `peel → 別角度でreseal`。trapを残したまま上端へ進むと `trapped` terminalになる。

## Controls and accessibility

Canvasへのpointerdownは下端から開始する。pointermoveの上方向量が次の帯へ届くと、その時点のx位置からpressure vectorを作り、frontを一帯進める。下方向へ戻すと一帯peelする。pointer captureでtouch pathを保持し、各接着stage中は同じpointer以外の操作を拒否する。

Keyboardでは左右キーで圧力位置を左・中央・右へ変え、上キーまたはEnter/Spaceで一帯接着、下キーで一帯peelする。Canvasはapplication role、現在の帯・圧力位置・残気泡・trap/tensionをaria-labelとlive regionで読む。visible focusはガラス外周の二重ring。tapだけではfrontも気泡も変わらない。

Normal motionはtracked RAF一本で光の干渉、frontの浅い波、気泡の補間を約60fps描画する。Reduced motionは連続RAFを使わず、`pressure → deformation → settle` を非zeroのtracked `context.later` stagesで描く。どちらも入力から結果をteleportさせない。disposeはstages、deadline、listeners、frame、QA APIを全停止する。

## Product visual identity

縦長phoneは黒鉛色の薄いmetal rim、speaker slot、side button、丸いglass cornerを持つ。glassは青灰色の縦gradient、斜めの窓反射、指紋の薄いarcを描く。filmは無色透明ではなく、接着部分だけ青緑と紫の非常に薄い干渉縞、frontには白いmeniscusと二重edge highlightを置く。

気泡は白丸ではなく、glass reflectionを歪めるradial lens、暗い下縁、圧力方向へ伸びる楕円、移動側の細いcrescentで描く。trapは中心が鈍く濁り、overpeelはfrontから扇状のstress lines、successは気泡が抜けたedgeに小さい光滴だけを残す。浅い材質光を守り、派手なconfetti、emoji、audioは使わない。

## Finite authored model and proof

Taskはplain dataで `layout`, phone geometry, 5 bands, bubble ID/x/band/exit/radius, `solution`, `maxPeel`, `duration`, exhaustive proofを持つ。三つのauthored layoutだけを使用し、各bubbleのexitは位置とpressure laneから一意に決まる。全 `3^5 = 243` direct pressure pathsを列挙し、success/trapped数とcanonical solutionを保存する。

さらに各layoutはauthored recovery proofを持つ。指定帯で故意に誤ったlaneを使ってtrapを作り、一帯peelし、canonical laneでresealしてから完走できることをsimulationで再証明する。二回目peelは必ずoverpeel。Validationはauthored descriptor一致、全243 path counts、canonical success、recovery success、bubble ID/位置/exit、5 bands、maxPeel、durationを再計算し、 forged proof・未知layout・自動成功可能descriptorを拒否する。

## Distinction

これは画面を拭くゲームではない。汚れをtapや往復wipeで消すのではなく、移動する接着境界の前で圧力方向を読み、気泡がまだ逃げられる未接着領域と左右edgeへ導く空間課題である。直線progress、放置、自動処理では解けず、密閉順序と一回だけのpeel-backが結果を変える。
