# social-thread-vibe-v1 — 匿名航路の適温レス

## Product promise

匿名掲示板らしい短文、投稿番号、時刻、架空ID、`>>` アンカー、雑な相づちと急なマジレスを材料に、3回の返信でスレッドの適温を保つ。正解は「最も優しい文」でも「最大のウケ」でもない。いまの文脈、勢い、温度、すでに擦られた話題を読み、短さと距離感を毎回変える social game である。

既存掲示板のロゴ、配色、固有板名、実投稿、実ID、実在人物、差別語は使わない。文化的な粗さは、架空サービス **匿名航路 / THREAD DECK**、自作スレ、架空ID、等幅組版で再構成する。

## Stable identity

- ID: `social-thread-vibe-v1`
- introducedIn: `2.0`
- category: `social`
- tier: `3`
- flavor: `quirky`
- step: `1`
- family: `social-thread-vibe`

## Core loop

1. 既存の3投稿と、その時点で返すべき最新投稿を読む。
2. 温度・勢い・既出度メーターを見る。ただし最大値を目指さない。
3. 3つの短い返信案から1つを選ぶ。各案はアンカー、長さ、冗談量、マジレス量、脱線量が異なる。
4. 自分の投稿が実際にスレへ追加され、続く1〜2件の追従レスが表示される。
5. 追従レスとともに温度・勢い・既出度・脱線度が変わる。これを3回行う。
6. 最後に band 内なら success。冷え、脱線、炎上は別の失敗として説明する。時間切れも独立結果。

## Authored thread families

同じ「感じのよい返信」を流用できないよう、各threadの基準を変える。

- **真面目質問**: 直近の質問番号へ短くアンカーし、具体例を1つ。長い説教、根拠なし断言、ネタ逃げは冷える。
- **ネタ進行**: 直前の語を一度だけ拾って短く上乗せ。説明、同じオチの三度擦り、突然のマジレスは失速する。
- **失敗談**: 失敗の具体を拾い、自分の小さな失敗を返す。勝手な診断や大げさな励ましは距離を壊す。
- **軽い脱線**: 脱線を一拍だけ楽しみ、元の話題への橋を残す。新しい自分語りを始めるとderailになる。
- **荒れかけ**: 人ではなく論点へアンカーし、短い事実か確認を置く。自治説教は冷え、煽り返しはflameになる。

各threadは3ターン分を完全 authored data として持つ。選択肢には、投稿本文、返信先、効果量、実際の追従レスが保存される。

## State model and finite proof

Plain task contains:

- authored thread identity/title/topic
- seed posts and 3 incoming posts
- each turn’s 3 choices and fictional follow-up posts
- initial `heat`, `momentum`, `stale`, `drift`
- acceptable bands
- duration
- exhaustive `answer`, `wins`, `total`

全経路は `3 × 3 × 3 = 27`。simulationは各choiceの authored deltaを順に適用し、同じmotifを繰り返すたび既出度へ追加penaltyを加える。最終分類の優先順は:

1. heat上限またはmomentum上限超過 → `flame`
2. drift上限超過 → `derail`
3. heat下限 / momentum下限 / stale上限逸脱 → `cold`
4. 全band内 → `success`

生成時に全27経路を列挙し、少なくとも1つのsuccessとcold/derail/flame各失敗が存在することを証明する。`answer` は最初のsuccess経路。taskはJSON clone可能で、module再読込後も同じ結果になる。

## Visual identity

- 暖灰の紙面、濃紺の筐体、青い`>>anchor`、緑の匿名名、橙の温度、紫の既出度。
- 本文と投稿metaは等幅。投稿番号・架空時刻・`ID:` を一段にまとめ、本文を最優先に読む。
- 最上段は「匿名航路 / THREAD DECK」、thread title、3本のband meter。
- 中央は実際に増えるthread log。自分の返信と追従レスを色・左borderで区別する。
- 下段は3つの返信候補。選択後はcomposerをlockし、追従レス→meter変化→次のincomingの順を明示する。
- terminalはthreadを残したまま、success/cold/derail/flame/timeoutごとに見出し・原因・最終meterを表示する。

## Accessibility and lifetime

- 候補はbutton。touch/clickに加え `1`〜`3`、上下矢印、Enterを提供。
- visible focus、aria-live status、thread log、meterの数値labelを持つ。
- reduced motionでも返信→追従→次投稿の因果順は非ゼロのtracked stageで保持し、装飾animationだけを止める。
- DOMは `context.host.ownerDocument` のみ。timer/listener/deadlineはcontext ownership。dispose後は追加投稿・finishなし。
- network/audio/実アセットなし。393×852 / 402×874 DPR3で横overflowさせない。

## Acceptance scenes

`initial`, `input`, `reply`, `followup`, `progress`, `cold`, `derail`, `flame`, `success`, `timeout`。少なくとも5 authored familiesを用い、各familyで正解経路が異なることをNode proofに含める。
