# フォイル・ストライク

Status: accepted concept; implementation waits for the current migration wave to integrate.

- Provisional stable ID: `prediction-card-combo-v1`
- Category: `prediction`
- Tier: 3
- Flavor: `wild`
- Family: `prediction-card-combo`
- Concept owner: screw lane owner

## Core loop

A complete original card battle lasts three rounds and about 45 seconds. Every round visibly advances through `DRAW → DEPLOY → SET → NORMAL ATTACK`.

Five physical cards fan from the deck: three units and two preparations. The enemy core exposes armor, a weak crest, and its next counterattack. The player deploys one unit to the launch dais, sets one preparation face down on a separate dais, then commits a normal attack. The preparation flips; a matching condition adds damage or penetration; attack minus armor damages the core. Insufficient damage triggers the shown counterattack and costs one player durability.

The player wins by destroying the core within three rounds. Player durability reaching zero, remaining enemy HP after round three, or timeout is failure. Invalid placement is reversible and does not become an accidental terminal loss.

## Controls and accessibility

Cards are DOM buttons with 56px-or-larger effective targets. Pointer input selects a card and its destination. Keyboard input moves through unit and preparation rows, Enter/Space places, Escape returns a card, and `A` commits the attack. Focus is always visible. ARIA labels expose card name, attack, crest, preparation condition, and predicted damage; phase, damage, and outcome use a live region. Crest is expressed by shape, name, and color.

Reduced motion keeps the causal draw, flip, deploy, attack, and impact sequence as short staged cross-fades with no continuous frame loop.

## Product-grade visual identity

The hierarchy is enemy core and HP ring at top, launch and preparation daises in the middle, and a physical fan of cards below, with a thin four-phase rail above. Cards use an original diagonally cut `foil shard` silhouette rather than a familiar trading-card frame. Resolution-independent rendering supplies card-stock edges, linen texture, embossed crests, foil sweeps, contact shadows, and deliberate typography.

Draw fans five cards with depth and foil light. Deploy straightens and lands the selected card while its crest rises as an original abstract light construct. Set flips to an obsidian-foil back and briefly connects the two daises. Attack reveals the preparation, shows a concise attack-plus-modifier-minus-armor chip, launches the construct, and resolves a core impact. Victory breaks the HP ring with screen-safe shock rings and foil fragments; failure visibly folds sparks against armor and returns a counter-beam. Timeout darkens the board, stops the phase rail in red, and leaves a readable final state. The game remains silent under the AgeTest product contract.

## Plain-data and proof contract

A task contains three rounds, each with three uniquely identified units and two uniquely identified preparations; one enemy state; initial player durability; duration; canonical winning choices; exhaustive win count; and total choice count. Known preparation-rule enums and bounded numeric ranges are mandatory. Rendering state, functions, and clocks are never stored.

Generation uses a finite authored template pool, bounded attempts, and a verified fallback. At most 216 complete choice sequences are exhaustively simulated. Validation recomputes damage, counterattacks, remaining HP, predicted per-round damage, `wins`, `total`, and the canonical first winning sequence. At least one solution exists, winning density remains at or below 15%, IDs are unique, every weak crest is meaningful, and saved structured-clone data produces the same result after reload. Unknown rules, duplicate IDs, false answers/counts, impossible wins, changed copy, and changed duration are rejected.

## Distinction and homage boundary

Unlike one-tap choice or pattern games, the player reads public state, assigns two cards to different purposes, reveals their interaction, and carries HP/durability consequences across three rounds. Physical card movement and stacking communicate state rather than decorate it.

Only general card concepts—deck, hand, HP, and normal attack—are retained. Names, creatures, card art, frames, backs, terminology, zones, effect prose, palette, resources, and screen composition are original. There are no five-slot fields, graveyards, mana, star levels, attack/defense pairs, booster packs, rarity sales, collection, or monetization imagery associated with a specific commercial card property.
