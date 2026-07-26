# attention-driving-safety-v1 — 危険を読む運転席

## Identity

- Stable ID: `attention-driving-safety-v1`
- Introduced: `2.0`
- Category: `attention`
- Tier: `2`
- Flavor: `classic`
- Step: `1`
- Family: `attention-driving-safety`
- Intended duration: 55 seconds
- Source label shown in-game: 「本試験形式・警察庁教則準拠」

## One-line fantasy

運転席から五つの道路場面を読み、○か×を判断した直後に、車と危険がどう動くべきかを一枚ずつ確かめる安全確認シート。

## Authorship and source boundary

This is an original AgeTest safety-knowledge game. It does not claim to contain official past questions and does not reproduce driving-test question text. The five statements, compositions, explanations, and motion beats are newly authored from the current official principles below.

Primary source, confirmed 2026-07-26:

- 警察庁「交通の方法に関する教則」
  - https://www.npa.go.jp/bureau/traffic/20241113kyousoku.pdf
  - PDF metadata: created/modified 2024-11-12 JST, 148 pages.
  - Locally verified SHA-256 for the consulted file: `bf2f0c9d9f56bb487729ad344b1552f204ca0bd250a20020c0e106b72fec8027`.

Official cross-reference, confirmed 2026-07-26:

- 警察庁「みんなで守る『飲酒運転を絶対にしない、させない』」
  - https://www.npa.go.jp/bureau/traffic/insyu/info.html
  - Confirms that even low alcohol concentration affects driving and that alcohol may remain the next morning.

The source is used for factual rules only. No PDF page art, diagrams, layouts, or sentences are copied into the game.

## Five authored judgments and source mapping

PDF page numbers below are printed page numbers in the 148-page file.

1. **Pedestrian crossing — ○**
   - Original statement: 「横断しようとしている人がいる。横断歩道の手前で止まり、先に渡ってもらう。」
   - Correct action: stop before the crossing/stop line and yield.
   - Reason: a vehicle must slow enough to stop unless no one is clearly crossing, and must stop and yield when a person is crossing or about to cross.
   - Source: Chapter 5 「自動車や一般原動機付自転車の運転の方法」, Section 3 「歩行者の保護など」, 2(2), pp.46–47.

2. **Phone use — ×**
   - Original statement: 「車がゆっくり動いている間なら、短い通知だけ画面で確認してもよい。」
   - Correct action: do not use or look at the phone while driving; silence it before driving.
   - Reason: phone use and fixation on displayed images make attention to surrounding traffic insufficient and are dangerous.
   - Source: Chapter 5, Section 1 「安全な発進」, 2(4), p.41.

3. **Railway crossing — ×**
   - Original statement: 「警報機が鳴っておらず、前の車も渡ったので、自分は止まらず続いてよい。」
   - Correct action: stop at the crossing and check safety oneself even when following another car.
   - Reason: the driver must stop immediately before the crossing/stop line and check left and right; following the preceding vehicle does not remove this duty. A signal-equipped crossing is the stated exception.
   - Source: Chapter 6 「危険な場所などでの運転」, Section 1 「踏切」, 1(1) and 1(4), pp.64–65.

4. **Alcohol the next morning — ×**
   - Original statement: 「前夜に酒を飲んでも、眠って目が覚めれば朝は運転してよい。」
   - Correct action: do not drive while affected by alcohol; account for alcohol remaining the next morning.
   - Reason: alcohol from the previous night can still affect driving the next morning. The NPA cross-reference also states that low concentrations affect driving and alcohol may remain after late-night drinking.
   - Source: Chapter 4 「自動車を運転する前の心得」, Section 1 「運転に当たっての注意」, 4, p.30; NPA drink-driving page above.

5. **Fatigue and sleepiness — ○**
   - Original statement: 「少しでも眠気を感じたら、安全な場所に止め、休息して眠気を覚ましてから運転する。」
   - Correct action: promptly take a break in a safe place and resume only after sleepiness has cleared.
   - Reason: the guide calls for a break at least every two hours during long driving, prompt rest when sleepy, and stopping in a safe place when sleepiness begins during monotonous driving.
   - Source: Chapter 4, Section 1, 2–3, pp.29–30; Chapter 6, Section 3 「夜間」, 1(5), p.66.

## Task model

A task is finite JSON-serialisable data selected from authored scene-order variants. It contains:

- `kind: "drivingSafety"`,
- a 55-second duration,
- the source label and source date,
- five question descriptors with stable IDs, original statements, authored scene IDs, correct boolean answers, correct-action copy, reason copy, and source references,
- an authored order index and its five question IDs,
- a plain proof equal to the five expected answers.

Validation rebuilds the descriptor from the authored order index and rejects changed statements, answers, explanations, sources, duration, proof, extra fields, or duplicate/missing topics. Generation is bounded and has an exact authored fallback.

## Interaction and causality

1. The current scene fills the canvas: windshield, road surface, hazard, mirrors/dashboard, and exam-sheet marks share one composition rather than sitting behind a generic question card.
2. The player selects the large **○** or **×** control by touch/click, Left/Right + Enter, or direct `O` / `X` keys.
3. Selection locks immediately. The scene then performs its authored correction beat:
   - crossing: the car stops and the pedestrian crosses;
   - phone: the phone dims and attention returns to the road;
   - railway: the car stops at the line and a train passes;
   - alcohol: the key remains on the table and alternate travel is indicated;
   - fatigue: the car leaves the night road for a lit rest area.
4. The feedback panel always reveals **正しい行動** and **理由**, whether the answer was right or wrong. The player deliberately advances with 「次の場面」.
5. Each answered question stamps the five-position exam strip, increments the score only when correct, and determines the final result. Nothing is decorative: all five answers are required before the sole completion commit.
6. After question five, one terminal safety sheet shows the score and a textual **正解 / 不正解** performance badge for every topic. Terminal performance never reuses ○/×, because those symbols denote the proposition answers. `context.finish(score===5, …)` is called once. A real deadline produces one distinct timeout commit with progress and score preserved.

## Five visual scenes

All scenes are authored in high-resolution DPR-aware canvas and viewed from or anchored to the driver’s position. They share charcoal dashboard leather, warm ivory test-paper details, vermilion safety marks, and blue-green road shadows, while each has a distinct composition.

1. **Crosswalk / rain-cleared shopping street**
   - Wide windshield with zebra stripes foreshortened toward the driver, wet asphalt reflections, left curb shops, and an adult waiting with one foot oriented toward the crossing.
   - The stop line is bright and spatially in front of the hood. Feedback animates a red brake glow, stationary hood, then the pedestrian’s crossing path.

2. **Phone / slow urban traffic**
   - Tight driver-seat crop: steering wheel and lane ahead remain visible, while a lit notification phone in a dash cradle pulls light toward the lower corner.
   - A bicycle and brake lights occupy the attention path ahead. Feedback extinguishes the notification and sharpens/emphasises the bicycle and following distance.

3. **Railway crossing / open barrier**
   - Low morning sun, rails cutting diagonally across the road, barrier raised, warning lamps unlit, and a preceding car already beyond the crossing.
   - Feedback halts the hood behind the stop line, sends a commuter train across the middle plane, then shows left/right check arcs.

4. **Alcohol / next-morning departure decision**
   - Exam-sheet / departure composition rather than a moving car: car key, bedside clock at 07:10, last night’s glass silhouette and receipt, parked car seen through the entry window.
   - Feedback leaves the key on the tray, adds a no-drive seal, and lights a transit/taxi route outside. No implication is made that sleeping alone guarantees sobriety.

5. **Fatigue / night expressway**
   - Driver-eye tunnel of lane reflectors, softened tail lights, heavy eyelid vignette, repeated utility-light rhythm, and a rest-area sign branching left.
   - Feedback activates the indicator, moves the car into the rest-area lane, stabilises the horizon, and lights a parked/rest symbol.

## Visual hierarchy and finish states

- Top: compact test heading, source label, and `1/5`–`5/5` position strip.
- Middle: scene-first canvas occupying the dominant area; statement is integrated as an ivory exam caption along its lower edge.
- Bottom during judgment: two large physical answer seals, ○ and ×, with selected/pressed/focus states.
- Bottom during review: a colored verdict ribbon, then separate 「正しい行動」 and 「理由」 lines and the next button.
- Success: five crisp red 「正解」 performance badges, a gold-edged 「安全確認 合格」 sheet, and all five topic labels.
- Incomplete final: score-led 「もう一度確認」 sheet with incorrect positions visibly called out; it is not visually confused with timeout.
- Timeout: desaturated windshield, amber hazard pulse, 「時間切れ」 and the exact answered count/score.

## Motion and accessibility

- Normal mode owns one tracked `context.frame` loop for restrained road/reflection breathing and finite authored answer transitions.
- Reduced motion owns no continuous frame. Each correction lands through a few tracked `context.later` stages without panning, flashing, or parallax.
- Motion never delays the appearance of the correct action and reason beyond a short transition.
- Touch targets are at least 48 CSS px high. Buttons have textual names; ○ is labelled 「正しいと思う」 and × 「誤りと思う」.
- The scene canvas has a current, descriptive ARIA label. Status and feedback use a polite live region, with the verdict announced before the explanation.
- Focus is visible; answering moves focus to 「次の場面」, and advancing returns focus to the answer group.
- Color is never the only correctness cue: the verdict states the chosen ○/× and correct ○/×; terminal performance uses the words 「正解」 and 「不正解」 rather than proposition-answer symbols.
- Canvas backing is CSS size × DPR capped at 3.
- Deadline, terminal state, and abort make pending transitions inert; disposal removes QA exposure and leaves no frame, listener, or timeout alive.
- No network request, audio, emoji, external asset, or borrowed character/IP treatment.

## Required QA frames

For the same authored task at 393×852 and 402×874, both DPR3:

1. initial pedestrian-crossing judgment,
2. selected/pressed ○ state,
3. crossing correct-action feedback with pedestrian motion,
4. phone scene and its × feedback,
5. railway stop/train feedback,
6. next-morning alcohol scene,
7. fatigue rest-area feedback,
8. all-correct final sheet,
9. mixed-answer final sheet,
10. timeout after partial progress,
11. visible keyboard focus,
12. reduced-motion feedback landed state.

Browser capture and independent visual review are deferred until the assigned `qa-browser-lanes.mjs` audit lane is available; no direct/shared browser is used.
