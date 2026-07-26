# Modular runtime performance baseline

## Post-N02 integration check

Rechecked at `19508a7` on the owned `director` lane (393×852, DPR 3, cache disabled). The catalogue contained 85 IDs and the generated manifest contained 19 accepted modules.

| Metric | Result |
|---|---:|
| Cold requests | 10 |
| Cold transfer / response bodies | 325,310 / 322,310 B |
| Cold JavaScript transfer | 198,636 B |
| `app.js` transfer / body | 186,228 / 185,928 B |
| DOMContentLoaded / load | 23.1 / 24.0 ms |
| Cold game-module fetches | 0 |
| External requests / horizontal overflow | 0 / 0 |
| Level 1 session build / first frame | 5.8 / 21.4 ms |
| Level 1 modular fetches | 1, 2,797 B |
| Level 5 session build / first frame | 11.3 / 20.8 ms |
| Level 5 modular fetches | 2, 48,211 B |

Both sampled sessions contained exactly 12 tasks. The Level 1 sample fetched only `reaction-signal-v1`; the Level 5 sample fetched only its selected `attention-farm-close-v1` and `reaction-signal-v1` modules. Cold home fetched no game module. The clean N02 integration run completed with 277 tests passing, generated-manifest agreement, and 19 acceptance records verified.

## Post-N01 integration check

Rechecked at `566a55d` on the owned `audit` lane (393×852, DPR 3, cache disabled). The catalogue contained 82 IDs: every published baseline ID plus the three accepted original games.

| Metric | Result |
|---|---:|
| Cold requests | 10 |
| Cold transfer / response bodies | 323,924 / 320,924 B |
| Cold JavaScript transfer | 197,250 B |
| `app.js` transfer / body | 186,513 / 186,213 B |
| DOMContentLoaded / load | 22.8 / 27.4 ms |
| Cold game-module fetches | 0 |
| External requests / horizontal overflow | 0 / 0 |
| Level 1 session build / first frame | 3.7 / 4.9 ms |
| Level 1 modular fetches | 1, 2,797 B |
| Level 5 session build / first frame | 11.7 / 26.7 ms |
| Level 5 modular fetches | 2, 59,309 B |

Both sampled sessions contained exactly 12 tasks. Only modular games selected into each session were fetched; the cold home still fetched none. The definitive catalogue run completed with 180 tests passing and `check:games` passing.

## Original migration baseline

Measured on commit `2bfde83` using the owned `audit` lane from `tools/qa-browser-lanes.mjs`: isolated headless Google Chrome, 393×852 CSS pixels, DPR 3, cache disabled and cleared inside the navigation session, empty local storage, local static HTTP server. No Vivaldi or shared browser session was used.

## Cold home load

| Metric | Result |
|---|---:|
| Requests | 10, all local HTTP 200 |
| Transfer | 358,467 B |
| Response bodies | 355,467 B |
| JavaScript requests | 4 |
| JavaScript transfer | 231,793 B |
| `app.js` transfer/body | 222,716 / 222,416 B |
| DOMContentLoaded | 16.5 ms |
| Load | 17.5 ms |
| Last response | 20.6 ms |
| Game-module requests | 0 |
| Long tasks | 0 |
| External requests | 0 |
| Horizontal overflow | 0 |

The HTML favicon uses the authored 32×32 derivative (`2,238 B` transfer); the install manifest retains the 192×192 icon (`38,850 B`). This reduced cold transfer by 36,615 B (9.27%) from the same audit with two 192px icon loads.

## Twelve-game session start

| Profile | Build tasks | First task visible | Selected modular fetches | Module transfer |
|---|---:|---:|---:|---:|
| New Level 1 | 3.1 ms | 4.0 ms | 1 (`reaction-signal-v1`) | 2,797 B |
| Seeded Level 5 | 29.5 ms | 31.4 ms | 4 (`spatial-rope-untangle-v1`, `prediction-pin-pull-v1`, `attention-water-sort-v1`, `spatial-park-jam-v1`) | 104,558 B |

Each run fetched exactly the selected modular games, with no duplicate module request. Both runs had zero console/page errors, external requests, long tasks, and horizontal overflow.

The mixed catalogue contained all 79 stable IDs. Browser validation over 300 iterations completed with `issues=[]` in 15,120.7 ms. This exhaustive QA timing is not part of session startup.

## Interpretation

The loader meets the migration-stage invariants: home load fetches no game module, and session generation fetches no more modules than selected modular games. The remaining 72 published games still live in the temporary legacy adapter inside `app.js`; its cold contribution will continue to fall as each accepted module replaces and removes one legacy implementation.
