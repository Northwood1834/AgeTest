# social-partner-mood-v1 — 三つの返答で予定を結び直す

Status: published compatibility-port specification. Browser acceptance waits for explicit audit-lane handoff.

## Stable identity

- ID: `social-partner-mood-v1`
- introducedIn: `1.0`
- category: `social`
- tier: `2`
- flavor: `quirky`
- step: `1`
- family: `social-partner-mood`

This is a compatibility port of the current `PARTNER_MOOD_SCENARIO` factory and `renderDateSim` branch. The current `app.js` is the sole behavior and authored-content authority. The port does not diagnose either character, present therapy advice, add a sentiment meter, or generalize the three authored answers into a rule about relationships.

## Exact task and generation contract

Generation takes injected `shuffle`, deep-clones the single published scenario, and calls `shuffle` once for each step's three choices in step order. No scenario picker exists. Every generated or resumed task has exactly:

```text
kind: "dateSim"
prompt: "不機嫌なパートナーと話して"
help: "火に油を注がず、3回会話をつなぎます。"
scenario: exact PARTNER_MOOD_SCENARIO with only each choices array permuted
duration: 20000
```

The scenario has exactly `name`, `age`, `role`, `image`, `alt`, `closing`, `successDetail`, `failureDetail`, and `steps`. Every step has exactly `line`, `answer`, and `choices`. Validation accepts all six permutations of each exact three-choice set and rejects changed text, answer, portrait path, age/role, result details, duration, missing options, and additive fields.

## Frozen authored scenario

- Name: `直樹`
- Age: `36`
- Role: `少し不機嫌なパートナー`
- Local portrait: `assets/partner-mood.webp`
- Alt: `雨の夜のキッチンで対話を待つ架空の成人男性パートナー`
- Closing: `うん。ちゃんと話せたら、少し気持ちがほどけた。`
- Success detail: `低気圧を会話で通過。関係修復ミッション成功。`
- Failure detail: `その一言で、室内の気圧がさらに下がりました。`

### Step 1

- Line: `今日の予定、変更になったのを後から知ったんだけど。`
- Answer: `先に伝えなくてごめん。今、話しても大丈夫？`
- Other choices: `そんなに怒ること？` / `顔がこわいよ`

### Step 2

- Line: `楽しみにしてたから、置いていかれた気がした。`
- Answer: `楽しみにしてた気持ちを、軽く扱ってしまったね`
- Other choices: `でも仕事だから仕方ないよ` / `代わりに何か買えばいい？`

### Step 3

- Line: `埋め合わせって、どう考えてる？`
- Answer: `都合を聞いて、二人で次の予定を決めたい`
- Other choices: `今すぐ機嫌を直して` / `同じ予定を勝手に予約しておく`

No line is softened, expanded, corrected, or replaced under the port label.

## Exact progression and outcomes

The portrait, identity badge, current quoted line, exact current choice order, and hearts remain visible. Initial hearts are `♡♡♡`; the first and second correct answers advance to `♥♡♡` and `♥♥♡`. The third correct answer immediately paints the exact closing, clears choices, paints `♥♥♥`, and starts the published 450 ms delayed finish.

- Any wrong choice immediately finishes false with exactly `その一言で、室内の気圧がさらに下がりました。` It does not expose or mark the correct answer.
- Timeout at 20000 ms immediately finishes false with exactly `考えている間に、閉館時間になりました。` The current portrait, line, choice order, completed hearts, and step stay retained.
- Success commits once after the exact 450 ms delay with exact detail `低気圧を会話で通過。関係修復ミッション成功。` and `quality = clamp(1 - elapsed / 20000, 0, 1)` at commit time.
- As in the published renderer, a deadline firing inside the 450 ms closing window wins; the delayed success cannot overwrite it.
- Rendering and play do not mutate the plain saved task.

## Presentation

The module retains the existing portrait-and-dialogue date card identity and the exact checked-in `assets/partner-mood.webp` portrait. The 768×960 local image keeps its published center-top crop and exact alt. No new, downloaded, generated, or external asset is introduced.

A rain-window plum frame, restrained conversation ledger, quote panel, heart row, and response cards strengthen finish while preserving the published 42/58 portrait/dialogue composition. The rain treatment is environmental, not a mood diagnosis or numerical sentiment mechanic. A CSS silhouette appears only if the exact local image fails.

No outcome text or correctness marker exists before selection. In particular, no pre-choice `data-answer`, hidden answer label, sentiment score, success preview, or failure preview is emitted.

## Input, motion, accessibility, and lifetime

- Touch/pointer activates the same exact option as native click.
- Native Tab and a visible focus ring remain available. Up/Down and Left/Right move among current choices; Enter/Space and number keys 1–3 activate the focused/indexed choice.
- A correct non-final answer has finite context-owned acknowledgement stages. Reduced mode exposes deterministic non-zero stages at 70 ms, 140 ms, and 220 ms and owns no frame loop.
- The third correct answer preserves the immediate closing and exact 450 ms finish delay.
- Input locks while acknowledgement or final completion is pending.
- Every choice has at least a 44 CSS-pixel base hit area.
- DOM uses only `context.host.ownerDocument`. Deadline, stages, image fallback, input listeners, and QA are context-owned. Disposal removes QA synchronously and cancels delayed progression/success.
- DPR is capped at 3 for production inspection. No audio, network request, external font, or runtime asset generation is used.

## Pre-browser proof

Focused Node proof must cover metadata; exact source strings; all six choice permutations; strict shape validation; plain JSON resume; all three correct steps; all six wrong options at their authored steps; exact lines/options/hearts/closing/details; 450 ms success quality; initial, partial, and closing-window timeout; no answer leak; touch/keyboard/focus; local portrait/alt/fallback; deterministic reduced stages; DPR; transition/final disposal; real reduced kernel cleanup; and source ownership.

## Parity gate after lane handoff

Use one exact frozen task for each of the six full choice permutations, shared byte-for-byte by legacy and module fixtures. At 393×852 and 402×874 DPR3, normal and reduced, capture side-by-side source frames for:

1. initial;
2. step1;
3. step2;
4. wrong;
5. success;
6. timeout retaining one completed step.

The canonical matrix therefore contains 288 images: 2 sources × 2 sizes × 2 motion modes × 6 permutations × 6 states. Review exact task JSON, option order, prompt/help, portrait/alt, line, hearts, closing, all details, quality/timing, and absence of pre-choice answer/outcome leakage. Supplemental real-browser checks cover all six wrongs, touch/keyboard/focus/input lock, reduced stages, final delay, actual deadline, disposal, local-only resources, 390/430 overflow and image sharpness, and performance.
