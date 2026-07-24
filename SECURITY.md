# Security and privacy design

## Current data boundary

- The app is a static client-only website.
- Up to six user-chosen local nicknames/emoji avatars, gameplay state, experience, category results, and up to 30 session summaries per profile are stored under the single localStorage key `shoro-test-state-v1`.
- No email address, online account identifier, health record, symptom, or diagnosis is requested. Nicknames never leave the device.
- The page Content Security Policy allows no network connection (`connect-src 'none'`).
- There is no telemetry, advertising, cloud sync, cross-app access, or online ranking.
- Sharing occurs only after the user presses the share button. The shared text contains the game grade, score, correct count, level, hashtag, and public app URL; it does not include local history.

localStorage is not encrypted. The stored material is game progress rather than a secret, but anyone who can inspect the same browser profile can read or change it. Clearing site data deletes all progress. The app does not claim tamper-resistant competitive scores.

## Health boundary

「処老」「初老」「中老」「大老」 and the 0–100 score are game outcomes. They are not validated clinical measures and must not be presented as screening, diagnosis, risk estimation, or evidence for or against a specific disease. The app does not ask for symptoms and does not vary its wording based on inferred health status.

Black humor is kept at the fictional game-grade layer. A persistent result note directs concerns about daily-life changes away from the game and toward an appropriate professional, without naming or implying a diagnosis.

## Browser boundary

The app refuses to run inside an iframe. CSP blocks scripts, frames, objects, forms, and network destinations not required by the app. Application JavaScript is loaded from the same origin. Manual update adds a one-time cache-busting query parameter and then removes it.

A hostile script running on the same origin, a compromised browser profile, or physical access to an unlocked device is outside this design's protection.
