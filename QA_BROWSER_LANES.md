# Isolated QA browser lanes

AgeTest QA must never use the user's Vivaldi, its tabs, its profile, or CDP port 9222. The generic Pi `browser_*` route is not used for this project because its target is not lane-scoped.

All browser work runs through `tools/qa-browser-lanes.mjs`, which accepts only localhost URLs on the lane's own HTTP port and refuses every CDP port below 9330. Each lane has a separate Google Chrome process, profile, static server, logs, and ownership marker under `/tmp/agetest-isolated-browser/`.

| Lane | Purpose | CDP | HTTP |
|---|---|---:|---:|
| `director` | integration review | 9330 | 8860 |
| `flow` | flow-link owner | 9331 | 8861 |
| `audit` | performance audit | 9332 | 8862 |
| `screw` | screw-out owner | 9343 | 8863 |

Commands:

```sh
node tools/qa-browser-lanes.mjs start director
node tools/qa-browser-lanes.mjs status
node tools/qa-browser-lanes.mjs navigate director http://127.0.0.1:8860/
node tools/qa-browser-lanes.mjs eval director '({ready:document.readyState,width:innerWidth})'
node tools/qa-browser-lanes.mjs screenshot director /tmp/agetest-director.png
```

There is intentionally no stop or kill command. A lane never attaches to an existing unowned port and never performs recovery actions against another browser. If ownership verification fails, work stops rather than falling back to Vivaldi or another process.
