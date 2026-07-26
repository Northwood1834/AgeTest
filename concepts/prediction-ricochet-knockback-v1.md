# prediction-ricochet-knockback-v1 — Padded Ricochet Lab

Status: concept, self-contained module, deterministic proof, focused Node harness, fixture, and isolated audit-lane visual acceptance complete on canonical 393×852 / 402×874 DPR3, with 390 / 430 supplemental smoke.

## Stable identity

- ID: `prediction-ricochet-knockback-v1`
- introducedIn: `2.0`
- category: `prediction`
- tier: `3`
- flavor: `wild`
- step: `1`
- family: `prediction-ricochet-knockback`

## Product promise

卓上の訓練galleryで、一発だけの有限energy projectileを壁へ反射させ、二体の赤茶色のpadded targetをそれぞれの小さな足場から押し出す。青い保護ring内の見学者には当てず、下部の射出位置へ危険な反射を戻さない。

これはgolfの穴や得点距離を狙うゲームではない。実際の入射方向から法線反射を計算し、反射のたびにenergyを失い、接触時の進行方向へknockbackが発生する。Targetの中心が足場の有効範囲を越えた時だけoccupancyが変わる。既成trajectory、tap target、銃器UI、流血、実在武器の材質は使わない。

## Authored geometries and proof

三つのauthored layoutをplain dataで持つ。

- `double-cushion`: 左壁、上壁を使うcanonical `angle -55° / power 4`
- `mirror-cushion`: 右壁、上壁を使うcanonical `angle +55° / power 4`
- `tight-corner`: 左上の短い二反射を使うcanonical `angle -48° / power 4`

各layoutにはarena bounds、shooter、二つのhostile figure、小型platform、保護platformとbystander、抵抗値、canonical controlが明示される。Aimは整数角度 `-70..+70` とpower `1..4` にquantizeされるため、全入力空間は `141 × 4 = 564` shotsで有限である。

Validatorとgeneratorは全564 shotsを固定 `1/120s` tickで再計算する。各tickの位置・速度・energyは6桁にquantizeし、最大1600 tick、最大3 bounce、energy 8未満で必ず停止する。Wall crossing時は軸法線で速度成分を反転し、bounce energyを0.76倍にする。Path distanceでもenergyが減り、figure impact後は0.82倍になる。

Hostile impactでは `max(0, remainingEnergy - resistance) × 1.1` を実knockback距離とする。進行単位vectorを掛けたbefore/after中心を保存し、platformの幅・marginからafter centerが有効領域外かを判定する。Proofはoutcome count、各outcomeの実control例、canonical bounce数、impact order `h1 → h2`、final energyを保存する。各layoutでnear miss、insufficient、collateral、self-hit、successが一つ以上存在し、canonicalは二つのhostile occupancyをoffへ変える。

## Core loop

1. 上面視のpadded tabletop、深さのある三つのplatform、二つのhostile、保護ring内のbystander、下部の発射padを読む。
2. Pointerを発射padからdragし、方向を整数angle、長さを4段階energyへquantizeする。Releaseで一発を放つ。
3. Keyboardでは盤またはcontrolへfocusし、Left/Rightでangle、Up/Downでpower、Enter/Spaceで発射する。Buttonsでも角度・energyを一段ずつ変更できる。
4. Aim previewは発射点から最初の壁までと、最初の反射後の短い110-unit以下だけを破線表示する。Target hit、二反射目、完全解は表示しない。
5. 発射後は実simulation samplesを順に再生する。Wallでは入射/反射arrowと等角値、impactではenergy、direction arrow、before/after occupancyを表示する。一発後の再照準や二発目はない。

## Outcomes

- `nearMiss`: hostile figureへのimpactが一度もない。経路は最後まで実simulationされたまま残る。
- `insufficient`: hostileへimpactしたが、抵抗を越えるknockbackが不足するか、一体以上がplatform上に残る。
- `collateral`: 青い保護ring内のbystanderへ実trajectoryが接触する。Bystanderを敵扱いせず、安全経路を優先する説明にする。
- `selfHit`: bounce後のprojectileが60 tick以降にshooter radiusへ戻る。危険なreboundとして独立表示する。
- `success`: 二体とも実impact後の中心が各platform有効領域外になった時だけ成立する。
- `timeout`: 発射前または照準中のまま時間切れ。No-shot stateを保持する。

全outcomeは一度だけfinishする。Success以外はincorrect。Timeout以外の五分類は564-shot proof内でreachableで、timeoutはdeadlineによる独立pathである。

## Visual identity

実在射撃場ではなく、紺色の机上training modelとして描く。Arena wallは厚い灰青色のpadding、platformは上面gradientと下側のshadow/depthを持つ。Hostileは赤茶色の丸いpadding bodyと白いhead、bystanderは青緑body、白青の二重保護ringで区別する。銃、照準器、弾痕、人体損傷は描かない。Projectileは小さな橙色training ballで、通過軌跡とbounce dustだけを残す。

Remaining energyは数値とbar、angle/powerはmonospace readoutで表示する。Bounceではincoming/outgoing vectorと `incidence° = reflection°`、impactではgreenまたはamber knockback arrowを実event dataから描く。Figureがplatform外へ移動したら薄くなり、occupied target countとterminal copyも一致する。

CanvasはDPR3 backingを持ち、arena比率を保つ。Runtime asset、image、audio、networkはない。

## Motion, accessibility, and lifetime

- Normal motionは`context.frame`所有の約60fps repaintで、elapsed timeからquantized sample indexを求める。Browser frame rateで物理結果は変わらない。
- Reduced motionはcontinuous RAFを使わず、90msのnonzero tracked stageを最大10段で進める。同じprecomputed simulationのtick位置とeventを順に適用し、teleportしない。
- Canvas boardはapplication labelとvisible focusを持つ。Controlsは44px級button、readout/status/terminalはtext DOMで読み取れる。
- Pointer captureとpointer cancel、keyboard focus、single-shot lockを提供する。
- DOMは`context.host.ownerDocument`のみから生成する。Listener、frame、later、deadline、QA APIはcontext lifetimeへ所有させ、dispose後にsimulation、finish、listenerを残さない。
- Audio、network、external asset、emoji、copied service UIを使わない。

## Focused fixture scenes

`initial`, `aim`, `bounce`, `impact`, `nearMiss`, `insufficient`, `collateral`, `selfHit`, `success`, `timeout`。

Browser captureはisolated audit CDP9332 / HTTP8862で実行し、canonical normal/reduced matrix、actual touch/keyboard、deadline/dispose/performanceとsupplemental 390/430 smokeを保存する。
