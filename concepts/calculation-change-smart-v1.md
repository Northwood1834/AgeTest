# calculation-change-smart-v1 — おつり上手

## Identity

- Stable ID: `calculation-change-smart-v1`
- Introduced: `2.0`
- Category: `calculation`
- Tier: `2`
- Flavor: `satisfying`
- Step: `1`
- Family: `calculation-change-smart`
- Intended duration: 40 seconds

## One-line fantasy

限られた日本の財布から支払いを組み、ぴったり払えない会計で、レジから返る硬貨をいちばん少なくする。

## Why this is not an exact-payment drill

Every authored wallet is exhaustively proven to make exact payment impossible. The ordinary ¥1000 bill is always legal, but always produces more change coins than a smarter amount. The player must reason about the register’s actual ¥500 / ¥100 / ¥50 / ¥10 / ¥5 / ¥1 greedy change, not merely cross the price or match it.

The wallet is concrete and limited: every visible bill or coin can be toggled once, duplicates are separate physical pieces, and the selected payment total updates on the leather tender mat. Paying too little is reversible. Paying enough reveals the exact returned coins; a suboptimal payment also reveals the uniquely better payment amount.

## Finite task model

Six authored checkout descriptors contain:

- a product and price,
- seven to nine individually identified wallet pieces,
- one ¥1000 bill,
- only Japanese denominations,
- a 40-second deadline,
- an exhaustive proof over every wallet subset.

For every descriptor, validation recomputes all `2^N` subsets and proves:

1. the exact price is unreachable,
2. ¥1000 is reachable and legal,
3. ¥1000 is suboptimal,
4. one and only one reachable **payment amount** minimizes returned coin count,
5. the proof’s optimal amount, change, denomination breakdown, ordinary-¥1000 breakdown, legal-amount count, and subset count are exact.

Generation chooses one finite authored descriptor with an exact fallback. The saved task is cloneable plain data and contains no DOM-derived state.

## Interaction

- Touch/click a physical wallet piece to add or remove it.
- Left/Right changes keyboard focus among pieces; Space toggles the focused piece.
- `R` empties the tender mat.
- Enter submits payment.
- The tender total and underpayment difference remain visible.

### Underpay

The register refuses the payment without ending the game. The selected pieces remain on the mat so the player can add or remove one and try again.

### Suboptimal legal payment

The register tray returns the actual greedy coin breakdown. The result explains both the chosen amount and the unique better amount with fewer coins. This is a distinct incorrect terminal, not generic “wrong.”

### Optimal payment

The selected tender slides toward the register and the smallest possible set of material coins lands in the leather tray. The receipt stamps `最少` and the result commits once.

### Timeout

The current selected total and remaining underpayment are retained with a distinct closed-register treatment.

## Authored examples

- Price ¥649, wallet includes ¥500 + ¥100 + ¥100: paying ¥700 returns ¥51 as ¥50 + ¥1 (2 coins), while ¥1000 returns 5 coins.
- Price ¥901, adding one ¥1 coin to the ordinary ¥1000 makes ¥1001 and returns one ¥100 coin, while ¥1000 alone returns 10 coins.
- Price ¥922, combining ¥1000 + ¥10 + ¥5 + ¥5 + ¥1 + ¥1 makes ¥1022 and returns one ¥100 coin.

The examples demonstrate that “pay more to receive less” may use either a coin-only combination or an extra coin alongside the bill.

## Visual direction

A warm Japanese checkout close-up rather than a generic calculator:

- amber register display and paper receipt,
- wood counter with subtle grain,
- dark brown leather tender mat and stitched wallet edge,
- ¥1000 paper fibers and watermark-like linework,
- bimetallic ¥500, cool nickel ¥100, holed ¥50, copper ¥10, brass holed ¥5, pale aluminum ¥1,
- denomination-scaled coins with ridges, holes, shadows, and highlights,
- final returned coins arranged in a shallow leather tray,
- optimal state uses restrained receipt stamp, register glow, and orderly coin placement.

No emoji, audio, network assets, or borrowed retail branding.

## Motion and lifecycle

- Transactions use a small finite set of tracked `context.later` stages: tender lift, register acceptance, coin return, settle.
- Reduced motion uses shorter but still nonzero readable stages and owns no continuous animation frame.
- Input is locked during settlement.
- Deadline, terminal result, and abort cancel all tracked jobs/listeners and QA exposure.
- DPR backing is capped at 3.

## Required QA frames

At 393×852 and 402×874 DPR3, normal and reduced where causal:

1. initial wallet and impossible-exact instruction,
2. partial/underpay selection,
3. reversible underpay feedback,
4. ordinary ¥1000 selected,
5. suboptimal ¥1000 actual change tray plus better amount,
6. smart mixed payment selected,
7. optimal returned coin tray,
8. success receipt stamp,
9. timeout retaining selected total.
