# Game acceptance records

One accepted manifest entry has one `<stable-id>.json` record. The record is durable release evidence, not a substitute for inspecting full-resolution source frames.

The integration reviewer creates or updates the record only after game-specific tests, browser lifecycle checks, and independent visual review pass. `acceptedCommit` identifies the reviewed game implementation. Ports use `published-port`; new games use `original`.

`npm test` rejects a manifest entry without a matching accepted record, a record without a manifest entry, a missing test file, or an incomplete DPR3 visual-review declaration.
