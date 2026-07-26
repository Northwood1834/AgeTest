# 焼き目、いま。

Status: implemented and independently accepted (`88fb13c`, reduced-motion correction `a50015f`).

- Provisional stable ID: `timing-fish-grill-v1`
- Category: `timing`
- Tier: 2
- Flavor: `satisfying`
- Family: `timing-fish-grill`

## Core loop

One whole fish cooks under a compact tabletop grill for roughly 30–45 seconds. The visible side changes continuously from moist and translucent to pearly, then lightly gold, evenly browned, deeply amber, blistered, and finally charred. Oil beads gather and the edge tightens as heat accumulates. The player flips the fish based on those visible cues and finishes only when both sides are inside their good-doneness windows.

The main action is `ひっくり返す`. Flipping reveals the other side and preserves the exact previous browning state. The player may correct an early flip, but every extra exposure continues cooking; there is no reset. A final `盛り付ける` action becomes available once both sides have been seen, so the player must decide whether the current color is genuinely ready or only looks close.

If either side passes its burn threshold, an oil blister swells and bursts with a sharp visual `パン`, the skin blackens around it, and a dark smell haze rises: immediate failure. Serving with either side undercooked also fails. Serving both sides in range clears the game; timeout leaves the fish undercooked or burnt according to its real final state.

## Visual and interaction contract

The fish is authored high-resolution Canvas/SVG material, not an emoji or low-resolution handmade prop. Scales, silver-blue skin, moist highlights, scored flesh, fins, salt crystals, rendered oil, grill mesh, ceramic tray, reflected heat, shadows, steam, and progressive browning remain crisp at both required DPR3 viewports.

Doneness must be readable without a number: translucent wet sheen decreases, flesh becomes opaque, small golden freckles join into an even caramel layer, edges contract, oil becomes more active, and the first danger blister appears before failure. Color is reinforced by texture, steam density, edge shape, and an accessible live description such as `まだ生っぽい`, `焼き色がついた`, `ちょうどよさそう`, or `焦げる寸前`.

Flip lifts the fish with tongs, bends it slightly, turns it in perspective, drops it onto the mesh, and briefly releases steam. Reduced motion uses lift/cross-fade/settle stages rather than an unexplained image swap. Success moves the fish onto a glazed plate, adds lemon and grated radish, sends a warm highlight across the crisp skin, and stamps `焼き上がり`. Failure keeps the final charred frame visible beneath the oil burst and smell haze. AgeTest remains silent; `パン` is visual lettering and impact only.

Pointer users receive separate 56px-or-larger flip and serve controls. Keyboard users use Space/Enter to flip and `S` to serve, with visible focus. Input locks only during the short causal flip sequence. Safe areas and horizontal overflow remain clean from 390 to 430 CSS pixels.

## Plain-data and proof contract

Task data stores the two side heat rates, good-doneness intervals, warning and burn thresholds, carryover heat, starting side, maximum useful flips, and duration. Rates and thresholds come from finite bounded sets. Runtime integrates elapsed heat with a fixed quantized step so QA replay is deterministic.

Validation proves that both sides can enter their good windows before either burn threshold under at least one finite flip/serve schedule; the winning schedule has meaningful timing tolerance rather than a single frame; initial state is raw; warning always precedes burn; serving early and burning produce distinct failures; all values are bounded and structured-cloneable; and a verified authored fallback exists. Tests cover early flip, repeated flip, perfect serve, undercooked serve, oil-burst burn, timeout, reduced motion, disposal, and resume from the original plain task.

## Distinction

This is not a generic stop-the-meter skin. The fish itself is the meter: two persistent sides, changing materials, hidden-side memory, carryover heat, a deliberate flip, and a separate serve decision create the timing problem. Its identity comes from watching real cooking cues and the escalating oil behavior described by the user.
