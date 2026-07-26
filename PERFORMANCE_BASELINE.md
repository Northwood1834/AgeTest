# Modular runtime performance baseline

## Post-P08/N07 integration check

Rechecked at `f81bcf9` on the owned `director` lane (393×852, DPR 3, cache disabled). The catalogue contained 98 IDs and the generated manifest contained 45 accepted modules: 26 published ports and 19 originals.

| Metric | Result |
|---|---:|
| Cold requests | 10 |
| Cold transfer / response bodies | 328,020 / 325,020 B |
| Cold JavaScript transfer | 201,346 B |
| `app.js` transfer / body | 181,844 / 181,544 B |
| DOMContentLoaded / load | 22.0 / 23.0 ms |
| Cold game-module fetches | 0 |
| External requests / horizontal overflow / long tasks | 0 / 0 / 0 |
| Level 1 session build / first frame | 4.0 / 11.6 ms |
| Level 1 modular fetches | 3, 24,191 B |
| Level 5 session build / first frame | 34.0 / 34.1 ms |
| Level 5 modular fetches | 6, 155,395 B |

Both samples contained exactly 12 tasks and fetched only selected modules. The Level 1 sample fetched `reaction-signal-v1`, `reaction-target-v1`, and `spatial-flip-v1`; Level 5 fetched six selected modules including `spatial-draw-bridge-v1`. Cold home remained at zero game-module requests and total transfer stayed near 328 KB. Clean integration completed with 709 tests passing and 45 acceptance records verified.

## Post-P06/N06 integration check

Rechecked at `b7c0f60` on the owned `director` lane (393×852, DPR 3, cache disabled). The catalogue contained 97 IDs and the generated manifest contained 36 accepted modules: 18 published ports and 18 originals.

| Metric | Result |
|---|---:|
| Cold requests | 10 |
| Cold transfer / response bodies | 328,312 / 325,312 B |
| Cold JavaScript transfer | 201,638 B |
| `app.js` transfer / body | 184,474 / 184,174 B |
| DOMContentLoaded / load | 19.5 / 20.1 ms |
| Cold game-module fetches | 0 |
| External requests / horizontal overflow | 0 / 0 |
| Level 1 session build / first frame | 3.2 / 15.8 ms |
| Level 1 modular fetches | 1, 8,957 B |
| Level 5 session build / first frame | 133.8 / 133.9 ms |
| Level 5 modular fetches | 5, 206,325 B |

Both random samples contained exactly 12 tasks and fetched only selected modular games. The Level 1 sample fetched `reaction-target-v1`. The Level 5 sample fetched `timing-tower-stack-v1`, `calculation-rpg-battle-v1`, `prediction-desk-ruler-duel-v1`, `spatial-sheep-home-v1`, and `attention-farm-close-v1`; the larger uncached startup reflects importing and generating those five production modules, not cold-home cost. Cold home still fetched zero game modules, had zero long tasks, and remained entirely same-origin. Clean integration at this point completed with 564 tests passing and 36 acceptance records verified.

## Post-N03 integration check

Rechecked at `81a4022` on the owned `director` lane (393×852, DPR 3, cache disabled). The catalogue contained 88 IDs and the generated manifest contained 22 accepted modules.

| Metric | Result |
|---|---:|
| Cold requests | 10 |
| Cold transfer / response bodies | 326,159 / 323,159 B |
| Cold JavaScript transfer | 199,485 B |
| `app.js` transfer / body | 186,228 / 185,928 B |
| DOMContentLoaded / load | 24.8 / 26.4 ms |
| Cold game-module fetches | 0 |
| External requests / horizontal overflow | 0 / 0 |
| Level 1 session build / first frame | 0.6 / 15.8 ms |
| Level 1 modular fetches | 0 |
| Level 5 session build / first frame | 4.7 / 10.5 ms |
| Level 5 modular fetches | 1, 27,543 B |

Both sampled sessions contained exactly 12 tasks. The random Level 1 sample selected only legacy tasks and fetched no module. The Level 5 sample fetched only its selected `timing-tower-stack-v1` module. Cold home fetched no game module, had zero long tasks, and remained entirely same-origin. The clean N03 integration run completed with 323 tests passing, generated-manifest agreement, and 22 acceptance records verified.

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
