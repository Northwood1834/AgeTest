# Future online ranking boundary

## Current decision

v1 has only local records: a best-ten list for the selected profile and a leaderboard among the up to six profiles created in the same browser. It has no account, server, upload, cross-app link, telemetry, or global ranking. Scores are not tamper-resistant and must not be represented as such.

## Why global ranking is a separate mode

The public promise “data is stored only on this device” is incompatible with silently uploading a score, stable identifier, or anti-cheat trace. A future global ranking therefore requires an explicit online mode, not a storage migration disguised as a feature update.

## Minimum contract for a future mode

Before enabling online ranking, the UI and privacy specification must separately state:

1. exactly what leaves the device (public display name, score, grade, app/content version, submission time, and only the minimum proof needed);
2. destination, retention period, deletion path, moderation rule, and operator;
3. that local gameplay history remains local and is not uploaded in bulk;
4. that participation is opt-in and the game remains fully playable without it;
5. that consent to one submission is not consent to telemetry or automatic future submissions;
6. how minors, abusive names, ties, score-version comparability, and cheating are handled.

A first implementation should prefer an ephemeral “today's board” with no account and a user-chosen one-time display name. It must live behind a clear network boundary and a revised CSP. Local and online records remain separate namespaces.

## Comparability

Submissions must include `appVersion`, `contentPack`, session size, and scoring-version identifiers. Scores from materially different question packs or scoring rules must not be silently merged into one competitive table.

This document is a design constraint, not authorization to add networking or change the current local-only promise.
