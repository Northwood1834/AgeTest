# social-date-v1 — 三つの会話から、ひとつの誘いへ

Status: published compatibility-port specification. Browser acceptance is deferred until the audit lane is explicitly handed over.

## Stable identity

- ID: `social-date-v1`
- introducedIn: `1.0`
- category: `social`
- tier: `2`
- flavor: `wild`
- step: `1`
- family: `social-date`

This is a compatibility port of the currently published `DATE_SCENARIOS` factory and `renderDateSim` path. The current `app.js` is the sole content and behavior authority. It is not a rewrite, a dialogue revision, or a claim about general social ability.

## Exact task contract

Generation receives injected `pick` and `shuffle` helpers. `pick` selects exactly one of the three published scenarios. The selected scenario is deep-cloned, then `shuffle` is called once for each step's three choices, in step order. No scenario field or dialogue string changes.

Every generated or resumed task is plain data with exactly:

```text
kind: "dateSim"
prompt: "会話をつないで、デートに誘って"
help: "相手の話を受けて、3回選びます。"
scenario: one exact published scenario, with only each choices array permuted
duration: 18000
```

The scenario has exactly `name`, `age`, `role`, `image`, `alt`, `closing`, and `steps`. Every step has exactly `line`, `answer`, and `choices`. The validator accepts all six permutations of each authored three-choice set, but rejects changed copy, added partner-mood fields, unknown images, missing options, forged answers, changed duration, and additive task/scenario/step fields.

## Frozen authored scenario families

### 蒼真・26歳 — ブックカフェで会った青年

- Local portrait: `assets/date-anime.webp`
- Alt: `夕方のブックカフェにいる架空の成人男性`
- Closing: `その誘い、うれしい。次の休みに行こう。`

1. `この店、静かで落ち着くんだ。よく来るの？`
   - answer: `初めて。おすすめの本、教えてくれる？`
   - other choices: `静かすぎて眠くなりそう` / `本よりスマホのほうが好き`
2. `映画の原作になった短編が好きかな。君は映画も観る？`
   - answer: `観るよ。原作と比べるのも楽しそう`
   - other choices: `結末だけ教えて` / `長い話は全部苦手`
3. `今度、その作品の上映があるんだ。`
   - answer: `よかったら、一緒に観に行かない？`
   - other choices: `ひとりで楽しんできて` / `感想だけあとで送って`

### 蓮・32歳 — 架空の映画俳優

- Local portrait: `assets/date-actor.webp`
- Alt: `夕暮れの映画セットにいる架空の成人男性俳優`
- Closing: `いいね。撮影のない日に、二人で行こう。`

1. `やっと撮影が終わった。今日は少し難しい場面でね。`
   - answer: `おつかれさま。どんなところが難しかったの？`
   - other choices: `有名人も大変だね` / `それより写真を撮って`
2. `言葉より表情で伝える場面だったんだ。静かな映画は好き？`
   - answer: `好き。表情を追うのも面白いよね`
   - other choices: `派手な場面だけ観たい` / `途中で寝るかも`
3. `小さな映画館で、昔の作品を観直したいと思ってる。`
   - answer: `今度、その映画館に一緒に行かない？`
   - other choices: `場所だけ教えて` / `誰か誘えば？`

### 理一郎・58歳 — 美術館で会った紳士

- Local portrait: `assets/date-gentleman.webp`
- Alt: `閉館前の美術館ラウンジにいる架空の成人男性紳士`
- Closing: `喜んで。次は作品の続きを、ゆっくり話しましょう。`

1. `この絵の前では、時間が少しゆっくり流れる気がします。`
   - answer: `わかります。どこが一番お好きですか？`
   - other choices: `値段が気になります` / `そろそろ閉館ですよ`
2. `光の描き方ですね。近くに、この画家の小さな展示もあります。`
   - answer: `それも見てみたいです。詳しいんですね`
   - other choices: `有名なら見ます` / `説明は短めでお願いします`
3. `来週からだそうです。静かな午後にちょうどよさそうだ。`
   - answer: `よろしければ、来週ご一緒しませんか？`
   - other choices: `パンフレットだけください` / `おひとりでどうぞ`

## Exact loop and outcomes

The portrait, identity badge, current quoted line, heart progression, and current three choices remain visible. Initial hearts are `♡♡♡`; each correct answer advances one stable step and produces `♥♡♡`, then `♥♥♡`. The third correct answer immediately replaces the line with the exact authored closing, paints `♥♥♥`, clears the choices, and starts the published 450 ms finish delay.

Any wrong choice immediately finishes false with exactly `会話はここでクランクアップしました。` It does not reveal or auto-select the correct choice. Timeout at 18000 ms immediately finishes false with exactly `考えている間に、閉館時間になりました。` The current portrait, line, choice order, completed hearts, and step index stay retained in the terminal frame. The task object is never mutated.

Success commits once after the 450 ms delay with:

- `quality = clamp(1 - elapsed / 18000, 0, 1)` at commit time;
- detail `${scenario.name}とのデート成立。予定表も動きました。`.

## Production presentation

The module remains recognizably the published portrait-and-chat date invitation. It uses the same three checked-in 768×960 WebP portraits and exact alt text; it does not fetch, replace, or generate any asset. A plum paper-and-glass frame, current-step ledger, quote bubble, restrained heart row, and invitation ticket strengthen production hierarchy without changing authored content. The portrait keeps the published 42/58 composition and center-top crop. A CSS silhouette is only a local load-failure fallback.

The base hit area for each of the three response buttons is at least 44 CSS pixels. Portrait resolution remains sufficient for the DPR3 rendered footprint at 393–430 CSS-pixel viewports. No audio, network call, external font, or new asset is introduced.

## Input, motion, and lifetime

- Touch/pointer selects the same response as a click.
- Native Tab focus and visible focus rings are retained; Up/Down moves through the current three options and Enter/Space selects the focused option.
- Correct non-final selections use finite, context-owned acknowledgement stages before the next line. Reduced motion has deterministic non-zero stages at 70, 140, and 220 ms and owns no frame loop.
- The third correct answer preserves the published immediate closing frame and exact 450 ms finish delay.
- Input is locked while a correct transition or final commit is pending so one action cannot advance twice.
- Deadline, stages, listeners, image fallback, and QA exposure are context-owned. Disposal cancels all delayed progression and finish work and removes QA synchronously.
- DOM is created only through `context.host.ownerDocument`.

## Required pre-browser proof

Focused Node proof covers metadata, all three exact scenarios, injected pick and per-step shuffle order, strict validation, plain JSON resume, all three success paths, every wrong option, exact hearts/lines/options/closing, 450 ms success and quality, partial timeout retention, touch and keyboard paths, deterministic reduced stages, image/alt/local-path retention, DPR cap, source ownership, and disposal during both transition and final delay.

## Required parity evidence after lane handoff

One frozen plain task per authored scenario family is shared by the legacy and module fixtures. At 393×852 and 402×874 CSS pixels, DPR3, in normal and reduced modes, capture full-resolution side-by-side source frames for:

1. initial (`♡♡♡`);
2. step1 (`♥♡♡`);
3. step2 (`♥♥♡`);
4. wrong immediate terminal;
5. success closing and detail;
6. timeout retaining the current step.

The 144 canonical frames are checked for exact task JSON, identity/age/role/image/alt/closing, current line, option order, answer-selected progression, hearts, wrong/success/timeout detail, quality formula, portrait crop, local-only resources, responsive overflow, focus visibility, reduced staging/disposal, and finish-once behavior. Supplemental 390/430 smoke checks cover card fit, target size, image sharpness, errors, external requests, and performance.
