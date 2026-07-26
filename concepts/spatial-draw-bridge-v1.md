# spatial-draw-bridge-v1 — 一本線のLoad Bridge

Status: concept, self-contained module, focused deterministic proof, fixture, and isolated audit-lane visual acceptance complete on canonical 393×852 / 402×874 DPR3, with 390 / 430 supplemental smoke.

## Stable identity

- ID: `spatial-draw-bridge-v1`
- introducedIn: `2.0`
- category: `spatial`
- tier: `3`
- flavor: `satisfying`
- step: `1`
- family: `spatial-draw-bridge`

## Product promise

左右のlegal anchorを一本の連続strokeで結び、限られたmaterial内でreleaseする。その後、小型の抽象vehicleが実際に橋へ荷重を掛けて渡る。線の存在だけを判定するDraw Shelter型ではない。入力strokeの全node/segmentをgraphとして保持し、segment長、joint角、arch rise、剛性、重力sag、moving load、前後wheel contact、車体傾斜が結果を決める。

Static hitbox、spanの自動補正、正解線への吸着、canned crossing、generic line check、広告artの模倣は使わない。

## Authored layouts and bounded simulation

三つのplain authored layoutを持つ。

- `basalt-canyon`: 600-unit gap、material 950
- `rain-culvert`: 640-unit gap、material 1020
- `slate-cut`: 560-unit gap、material 900

各layoutはarena、左右anchor、bottom、budget、vehicle mass/wheelbase、canonical shallow archを保存する。Strokeは10-unit latticeへquantizeし、重複点を除き最大64 nodes。一端が各anchorから24-unit外なら`unanchored`、総segment長がbudget超過なら`overbudget`で、endpointを自動修正しない。

Valid graphは固定 `1/120s`、最大1800 tickでsimulationする。Internal nodeは元形状へ働くstiffnessと重力sag、vehicle位置に応じたload sag、velocity/dampingを持つ。Endpoint nodeだけ固定する。Stiffnessはarch rise、joint数、最大segment長から再計算される。

Vehicleは前後wheelそれぞれのxで現在のstroke segmentを補間し、contact yを得る。Body y/angleは二接点から決まり、柔らかいspanでは速度が低下する。Joint stressは実turn角、最大segment、現在load距離、deflectionから更新する。各sampleはnodes、vehicle、rear/front contact、stressを保存し、frame rateから物理結果を分離する。

各layoutはcanonicalと、unanchored、overbudget、bottomOut、jointSnap、wheelLoss、stalledSpanの有限example pathをplain proofに持つ。Validatorはauthored geometryと全proof path/outcomeを照合する。Canonicalは両輪が対岸へ抜けるまで成功しない。

## Outcomes

- `unanchored`: 一本線の始点または終点がlegal anchor外。
- `overbudget`: actual polyline lengthがmaterial budget超過。
- `bottomOut`: 重力とloadで動いたnodeがcanyon bottomへ到達。
- `jointSnap`: 鋭いjointへmoving load stressが集中して破断。
- `wheelLoss`: segment contact喪失、または前後contact差が38°を超えてrollover。
- `stalledSpan`: 柔らかいspanのdeflectionでvehicle speedが停止、またはbounded ticks内に渡れない。
- `success`: rear wheelまで右anchorの外へ抜ける。
- `timeout`: 描画中のstrokeを保持して終了。

Finishは一度だけ。Failureは互いのreason、event、visualを分ける。

## Input and visual identity

Touchはboard上のpointerdownからmove sampleを連続追加し、pointerupでreleaseする。Keyboardはboard focus、Enterで開始/release、矢印で20-unit lattice cursorを動かし、描画中は各moveを連続nodeとして追加、Spaceでreleaseする。Release後は全inputをlockする。

Visualは銃器や既存広告ではなく、灰青の卓上canyon model。白いbolt anchor、緑→黄→赤のtension stroke、黄銅joint、岩のbottomをDPR3 Canvasで描く。Vehicleは抽象的な橙body、二輪、個別suspension、contactに応じたbody tilt、後輪dustを持つ。Material bar、actual length、stress、tiltはtext DOMでも読める。

Normalはowned `context.frame`でelapsed sampleを約60fps表示する。Reduced motionはcontinuous RAFを持たず、85msの非zero tracked stageで同じsimulation sampleを順に進める。DOMは`context.host.ownerDocument`のみ。Frame、later、deadline、listeners、QAはcontext lifetimeでdisposeする。Audio、network、external runtime asset、emojiはない。

## Focused fixture scenes

`initial`, `draw`, `load`, `sag`, `unanchored`, `overbudget`, `bottomOut`, `jointSnap`, `wheelLoss`, `stalledSpan`, `success`, `timeout`。
