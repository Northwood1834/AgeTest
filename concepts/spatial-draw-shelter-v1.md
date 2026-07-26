# spatial-draw-shelter-v1 — リボンで庭便を守れ

## Product promise

小さな庭の配達員と荷物へ、上空からツノバチの群れが近づく。プレイヤーは庭杭から**一本だけ**保護リボンを引き、指を離して展開する。リボンは絵ではなく、重さ・張力・固定端を持つ。群れが当たればたわみ、蜂は面に沿って滑り、片端だけなら回転して落ちる。短い実時間の襲来を、配達員にも荷物にも触れさせず耐える。

広告ゲームで見かける「線を描いて守る」操作を、既存の犬・蜂・巣・UI・アートから切り離す。架空の庭便、織物リボン、真鍮杭、ツノバチ、植木鉢を自作し、静止した当たり判定ではなく線の物理変形と衝突をゲームの中心にする。

## Stable identity

- ID: `spatial-draw-shelter-v1`
- introducedIn: `2.0`
- category: `spatial`
- tier: `3`
- flavor: `wild`
- step: `1`
- family: `spatial-draw-shelter`

## Core loop

1. 固定された庭杭、地形、配達員、荷物、接近方向を読む。
2. 合法な杭の圧力領域からpointer/touchを押し始める。
3. 一本の連続線を、残りリボン長の範囲で引く。入力点は間引きと補間を行い、最大点数を越えない。
4. 指を離す。終点が別の杭の圧力領域なら両端固定、そうでなければ片端だけが固定される。
5. 短い襲来phaseで、リボン節点を重力と距離constraintで更新する。蜂は保護対象を追い、リボンへ衝突すると法線方向へ押し戻され、接線方向へ滑る。
6. 規定時間を耐えればsuccess。蜂接触はsting、リボンが対象へ落ちればcollapse。全体deadlineはtimeout。

合法でない場所からの開始と予算超過strokeは展開されず、明示的に拒否される。合法strokeが展開された後は削除・自動円化・再描画をできない。

## Physics contract

World座標は0〜1のplain number。simulationは固定 `25ms` stepで有限に進む。

- strokeは最大64入力点。点間が短すぎる入力は無視し、長いpointer jumpは一定間隔で補間する。
- release時にstrokeを最大14節点へ等距離resampleする。
- 各節点はVerlet位置と前位置を持つ。重力→4回の長さconstraint→杭固定→庭面constraintの順で更新する。
- 蜂はauthored speed、phase、targetを持ち、targetへの加速と小さな横揺れで進む。
- 蜂と各変形segmentの最短距離を毎step計算し、penetrationを解消して法線速度を反射、接線速度を残す。
- リボンsegmentと配達員/荷物の円が重なるとcollapse。蜂とどちらかが重なるとsting。
- `surviveMs`到達でsuccess。terminalは一度だけcommitする。

Normal motionはtracked frameで約60fps描画し、elapsed timeを上記固定stepへ積む。Reduced motionはcontinuous frameを使わず、非ゼロのtracked timerごとに決定論的な複数stepを進める。両者のsimulation結果は同じ。

## Authored finite proof

4つの庭layoutを完全authored dataとして持つ。

- **門柱アーチ**: 左右の杭を高い弧で結び、中央の配達員と箱を覆う。
- **鉢棚のひさし**: 高低差のある杭間へ片流れの屋根を張る。
- **小径の天幕**: 離れた二杭を浅いM字で結び、左右から来る群れを滑らせる。
- **温室前の庇**: 三杭のうち外側二本を使い、荷物側を厚く覆う。

各taskにlattice上のcanonical stroke、collapse witness、sting witnessを保存する。生成時とvalidate時に同じ有限simulationを実行し、canonical=`success`、collapse witness=`collapse`、sting witness=`sting`、step数上限内を証明する。canonicalはlength budget内、合法anchor開始、別杭固定でなければならない。taskはJSON round-trip後やfresh moduleでも同じproofになる。

## Visual identity

- 奥行きのある夕方の庭: 空、遠い生垣、柵、手前の芝と植木鉢をcanvas層で描く。
- 配達員は青緑の帽子と丸い郵便鞄、荷物は紐付きの杏色箱。既存ミーム動物は出さない。
- リボンは濃い影、橙の織り面、明るい縫い目の三層。節点間の張りとたわみを常に見せる。
- ツノバチは黒金の小型昆虫。半透明の直近trajectoryと速度向きで接近方向を読める。
- 上部に「残りリボン」を巻尺として表示するが、時間progress barにはしない。
- draw / armed / deployed / impact / collapse / sting / success / timeoutを別hierarchyにする。

## Input and accessibility

- Pointer/touch: 杭から押し、移動、release。
- Keyboard: 杭buttonを選ぶとlattice cursorが始点へ移動する。矢印で連続リボンを伸ばし、Enterでrelease、Escapeで未展開strokeだけを取消。
- Boardはfocusableでvisible focusを持ち、statusはaria-live。杭button、残量、phase、keyboard説明をlabelする。
- 48px以上の操作領域、393×852 / 402×874 DPR3、横overflowなし。

## Lifetime and safety

DOMは `context.host.ownerDocument` のみ。listen/later/frame/deadlineはcontext ownership。dispose後はsimulation、paint、finishを行わない。network/audio/外部asset/実在サービス要素なし。

## Required evidence scenes

`initial`, `anchor-focus`, `drawing`, `over-budget`, `deployed`, `impact`, `collapse`, `sting`, `success`, `timeout`。Browser evidenceはscrew laneの明示handoff後にのみ行う。
