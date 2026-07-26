# 朝の一席

Status: implemented; exhaustive Node, isolated browser, and independent full-resolution visual QC passed.

- Stable ID: `spatial-commuter-seat-v1`
- Category: `spatial`
- Tier: 2
- Flavor: `satisfying`
- Step: 1
- Family: `spatial-commuter-seat`
- Concept owner: screw lane owner

## Core loop

朝の通勤車両で、ドア脇に立つ主人公を一つだけ見えている空席まで4回以内の短い移動で導く、20–40秒の空間予測ゲーム。各手では次の足場候補を選ぶ。床の点を結ぶだけの抽象gridではなく、座席の張地、通路の実幅、金属ポール、吊革、窓、立客の肩幅と向き、鞄の張り出しを読んで「左を抜ける・中央を横切る・右へ寄る・ドア脇で待つ」を判断する。

乗客は選択前に短い予告姿勢を見せる。降車客はドアへ向けた足と肩の向き、立客は新聞やスマートフォンへ向いた体、別客は空席へ向かう薄い予告軌跡を持つ。プレイヤーは人に触れず、降車客の移動帯を横切らず、別客が着席する4手目までに空席へ入る。ドア脇に留まる初手は閉扉に取り残される。成功時は派手な爆発ではなく、主人公が朝光の当たる座面へ腰を下ろし、肩を下げ、吊革の揺れが収まる短い `ほっ…` の安堵で終える。

## Outcomes and causal movement

選択した足場は先に輪郭と短い予告線を見せ、主人公が通路を移動してから結果を判定する。入力直後に状態を飛ばさない。

- `collision`: 立客の肩、身体、または張り出した鞄へ接触。
- `blocked-alighter`: 降車客と同期して通路を横切り、その移動帯を塞ぐ。
- `seat-taken`: 最終手で空席へ入らず、別客が先に着席。
- `door-close`: 初手でドア領域を出ず閉扉。
- `timeout`: 制限時間内に経路を選び切れない。
- `success`: 4手以内に空席へ入り、上記の危険をすべて回避。

危険な足場を選ぶこととUI上の不正入力は分ける。存在しない・過去の足場などの不正入力は赤い床反射と案内だけで戻り、手数も経路も消費しない。身体すれすれで安全距離を保つ経路は `肩が近い…` のnear-miss表示を経て続行できる。

## Controls and accessibility

現在手で選べる床位置を56px以上のDOM buttonとして車内の透視図上へ置く。touch/clickで経路を一手選び、左右キーで同じ列の候補を移動、上下キーで中央寄り／外側候補へ移動、Enter/Spaceで確定する。フォーカスは白と紺の二重輪で常に見える。候補のARIA labelは「左側」「中央」「右側」「ドア脇」と、視覚的に読み取れる近傍の立客・鞄・降車方向を言語化する。live regionは現在手、接近、移動中、衝突理由、残り手、席の状態を読む。

reduced motionでもteleportしない。`予告 → 移動中 → 到着／接触` を各120–180msの非zero tracked stageで残し、連続RAFは使わない。disposeは移動途中・成功待ち・deadline・listeners・QA公開をすべて止める。

## Product-grade visual identity

縦長の車内を一枚の高解像度CanvasとDOM人物で構成する。えんじ色と細い金糸の座席布、座面の縫い目と圧痕、ブラッシュ金属の縦ポール、吊革の半透明樹脂、窓の二重反射、朝の斜光、床の滑り止め粒、ドア溝をDPR backingで描く。人は絵文字ではなく、頭・肩・上着・脚・靴・鞄をCSS形状と陰影で組み、身体の向きが分かる。降車客は靴先と肩、立客は胴と鞄の張り出し、競争客は空席への視線と床上の予告反射で区別する。

足場候補はゲーム盤の升目に見せず、床へ投影された短い靴形／光の楕円として透視縮小する。選択経路は床の継ぎ目に沿う細い光で、通過済みだけを残す。near-missでは鞄がわずかに揺れ、接触では主人公が止まって赤い床反射、降車妨害では青い降車帯が閉じる。着席成功では座布地が沈み、窓光が少し温まり、主人公の肩が下がる。失敗・timeoutも最後の車内と経路を読めるcompact outcome panelで示す。音声・audio API・emojiは使わない。

## Plain-data and bounded time-expanded proof

Task plain data contains carriage dimensions and aisle bounds; four time layers of uniquely identified route nodes; player radius and start; standing passengers and luggage with bounded radii and five time-indexed poses; one alighting passenger with five poses; target seat and competitor arrival; door-clear boundary/step; seat deadline; duration; canonical winning route; near-miss winning route; exhaustive `wins`, `total`, and per-reason failure counts.

A route is a path through one node in each time layer. Each edge is checked in continuous normalized carriage coordinates. Standing people and luggage use segment-to-body clearance. The alighting passenger uses synchronized segment-to-segment distance over the same time interval, so crossing their path is not reduced to an endpoint check. Door clearance is checked at the authored close step; target occupancy at the seat deadline. Exhaustive enumeration is bounded to at most 108 paths (`4 × 3 × 3 × 3`).

Generation chooses from bounded geometric templates and bounded perturbations, then recomputes every path. It accepts only tasks with at least two distinct winning routes, at least one safe near-miss route, and reachable examples of all four authored non-timeout failures. An authored fallback satisfies the same proof. Validation reconstructs geometry, re-enumerates all paths, verifies the canonical and near-miss routes, exact win/total/failure counts, unique IDs, bounds, radii, copy, duration, no initial success, and deterministic structured-clone resume. It rejects changed clearance, forged answers, false counts, missing failure classes, collisions in the claimed route, and unknown roles.

## Distinction

This is not a skinned grid pathfinder: there are no square cells, maze walls, or abstract occupied tiles. The decision comes from human-scale aisle width, shoulder orientation, projected luggage, synchronized opposing movement, a closing door, and a seat competitor. It is also not a reflex runner; all relevant motion is previewed and the player chooses only four deliberate positions. The quiet commute, materials, people, terminology, silhouette language, and outcome presentation are original to AgeTest and imitate no transport game or commercial property.
