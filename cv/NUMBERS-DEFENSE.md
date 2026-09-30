# Evidence for every number

Every metric on the resumes and CV, with how it was measured and where the evidence lives. Each caveat sits next to the claim it limits.

## Relay (order management)

| Claim | How it was measured / what it means | Evidence |
|---|---|---|
| 13-route JSON API | Count of REST routes in the Phoenix router (plus one WebSocket socket, counted separately) | `backend/lib/relay_web/router.ex` |
| Kafka-style transactional outbox | `order_events` table with a `bigserial` sequence as the offset analog; each state change and its event commit in one `Ecto.Multi`, fan-out over PubSub only after commit. "Kafka-style" = the pattern maps 1:1 to a Kafka producer/consumer-group setup (the architecture doc says exactly this); no actual Kafka runs | `workflow.ex`, `events.ex`, `docs/ARCHITECTURE.md` |
| 8-state machine, row locks, HTTP 409 | 8 statuses / 11 legal transitions in one map; every write locks the order row `FOR UPDATE`, validates the transition, and loser of a timer/cancel race gets `{:error, :invalid_transition}` → 409 | `state_machine.ex`, `workflow.ex` |
| Crash-safe worker, boot-time rehydration | GenServer `handle_continue(:rehydrate)` rescans non-terminal orders on boot; tested by creating an order while no worker runs, then starting one | `pipeline.ex`, `pipeline_test.exs` |
| Four facilities | Seed data: ATL-1, LAS-1, COL-1, DFW-1, with a deliberately scarce SKU for the stockout demo | `priv/repo/seeds.exs` |
| 52 failure-mode tests | 39 ExUnit (`test "` count, verified by running) + 13 Vitest; target oversell, no-partial-reservation, illegal transitions, idempotent replay, rehydration. **Caveat:** the oversell test runs two allocations sequentially under the lock path, not truly concurrently | `backend/test/`, `frontend/src/**/*.test.*`, CI runs green |
| `Idempotency-Key` replay (201 vs 200) | Unique index on the key; lookup-then-insert with unique-violation fallback; HTTP layer distinguishes create from replay | `workflow.ex`, `order_controller_test.exs` |

## Live Election Platform

| Claim | How | Evidence |
|---|---|---|
| 14 roles, 39 candidates | Seed file: 14 role slates, 62 candidate slots, 39 unique people | `lib/seed-data.mjs` |
| Three-state election machine | DB `CHECK (status IN ('waiting','voting','locked'))`; "Results" is the admin label for locked | `lib/schema.sql` |
| SHA-256 device fingerprint | Canvas `toDataURL` + AudioContext rendering + UA/screen/colorDepth/hardwareConcurrency/deviceMemory, hashed with `crypto.subtle.digest`. **Caveat:** switching browsers defeats it (audit finding F6, accepted risk); the dues-roster check-in gate is the compensating control | `lib/fingerprint.js`, `AUDIT_FINDINGS.md` |
| `UNIQUE(role_id, device_hash)` + silent 23505 | DB constraint; the vote route catches SQLSTATE 23505 and returns `{ok, duplicate: true}` so re-taps are idempotent | `schema.sql`, `api/vote/route.js` |
| 29-finding security audit, 42 HTTP tests | Pre-election audit dated 2026-04-10: 7 critical / 11 high / 8 medium / 3 low; 16 fixed; confirmed with 42 curl-based HTTP tests against the live stack (Playwright was tried and abandoned) | `AUDIT_FINDINGS.md` |
| 0–400 ms submission jitter | `Math.random() * 400` delay before vote POST, to spread the stampede when a poll opens | `app/page.js` |
| 60–80 voters (CV only) | Design target from the requirements, not a load-test result, so the CV says "designed for" | README |

## Exocortex

| Claim | How | Evidence |
|---|---|---|
| 14 life-log streams | `SELECT count(DISTINCT source)` on the live store = 14 (iMessage + tapbacks, Chrome, Safari, Claude Code, Gmail, IMAP, and 8 iPhone-backup types). **Caveat:** clipboard / accessibility-focus / filesystem capture paths exist in code but held 0 rows at audit | live `phase1.db`, capture code |
| 100,000-event store | Live count 100,321 on 2026-08-22; backup docs record 100,318 restored | store; `BACKUP.md` |
| 31,000+ recovered iMessages | 26,719 → 58,047 readable messages after writing a typedstream parser for the `attributedBody` column Apple moved bodies into in 2026 (+31,328) | `RESULTS.md`, `IMessage.swift` |
| 0.95 vs 0.55 Recall@1 | Controlled eval: 20 hand-authored documents, 20 hand-written paraphrase queries, one correct answer each. BM25 alone: 11/20 = 0.55. Binary vector index + int8 rescore: 19/20 = 0.95. Why Recall@1: the product surfaces a single answer, so top-1 is the metric that matters. The first eval was retracted because its ground truth had been generated using the system's own retrieval (circular); the published number comes from the independent redo | `tests/retrieval_eval.py`, `RESULTS.md` |
| 17 ms over 91M vectors (CV) | Synthetic benchmark: 91,000,000 random 1024-bit vectors, multicore popcount scan (`concurrentPerform` + `nonzeroBitCount`), 15 cores, scan only, which excludes top-k bookkeeping and the rescore tier. The real index is ~70k vectors; the benchmark answers "does this design have headroom" | `VectorIndex.swift`, `RESULTS.md` |
| 1.00 precision / 0.67 recall (commitments) | 12 hand-labelled messages: 4 true positives, 2 false negatives, 0 false positives. Small n: a direction-of-effect check, not a benchmark | `RESULTS.md` |
| 105/105 regression checks | Nine CLI `*-test` suites with `chk()` assertions, counted and run against fixtures | `main.swift` |
| MCP: 9 tools, 4 trust tiers, 8/8 invariants | Frozen contract v1.0.0; tools enumerated in the schema; trust assigned server-side by connection channel; 8 security invariants (no mass read, egress sanitization vs. link exfiltration à la EchoLeak CVE-2025-32711, canary rows, hash-chained audit log) verified manually against the live store | `mcp-bus/CONTRACT.md`, `schema/tools.json`, `server.py`, `store.py` |

## WindowPet

| Claim | How | Evidence |
|---|---|---|
| 131 unit tests | `func test` count across 15 XCTest files; `swift test` runs all 131 in ~0.02 s because physics/behavior/codecs are pure functions with no UI dependency | `Tests/`, test run output |
| 93-check end-to-end rig | Self-driving rig that launches the real app on the real desktop: 28 assertions + 50 condition-wait steps + 16 immediate checks (one if/else pair collapses two) = 93; last live run 93/93. Needs Accessibility permission; it's an integration harness, not XCTest | `TestRig.swift` |
| 0.24% idle / 1.04% moving / 48 MB | Self-instrumenting benchmark: `getrusage` CPU deltas over 15-second phases (asleep, perched, riding a moving window) on an M5 Pro, wake-word listening off. Budgets are asserted, not just logged. **Caveats:** self-reported, one machine, wake-word cost unmeasured | `Bench.swift`, `ENERGY.md` |
| 60 / 10 / 4 Hz polling ladder | Adaptive rate policy: 60 Hz while the ridden window moves, 10 Hz settled, 4 Hz after 20 s quiet | `RatePolicy.swift` |
| Zero dependencies | `Package.swift` declares no external packages; AppKit/CoreGraphics/Speech only | `Package.swift` |
| Confirmation gating | Destructive ops and `run_admin` always confirm; AppleScript confirms when classified dangerous (harmless scripts run, and the rig asserts that too); root actions need a typed password, never stored | `Assistant.swift`, `AgentSession.swift`, `TestRig.swift` |

## Otto

Measured on 2026-09-27 at commit `8cec069` of `jke48222/otto` (a clean `git archive` export, so nothing uncommitted counts).

| Claim | How | Evidence |
|---|---|---|
| 212 unit tests | `xcodegen generate` then `xcodebuild -scheme Otto test` on the export: "Executed 212 tests, with 0 failures"; `grep -rh 'func test' OttoTests \| wc -l` also gives 212. GitHub Actions runs the same suite on every push and pull request to `main` (run 36320471653 on `8cec069` passed) | `OttoTests/`, `.github/workflows/ci.yml` |
| 24 pointer state-machine tests | `grep -c 'func test' OttoTests/NotchPointerMachineTests.swift` = 24. Hover, click, and drag live in a pure `NotchPointerMachine` that takes events and time and returns effects, so the tests need no window | `Otto/Notch/NotchPointerMachine.swift`, `OttoTests/NotchPointerMachineTests.swift` |
| 90 ms hover rest | `hoverDwell = 0.09`; a hover schedules `.hoverOpen` at the anchor time plus the dwell and cancels if the pointer leaves first. A design value tuned by hand, not a user study | `NotchPointerMachine.swift` |
| 16,400 lines of Swift | `find Otto -name '*.swift' \| xargs cat \| wc -l` = 16,437, blank lines and comments included. **Caveat:** 3,720 of those are the Debug tools (self-test, snapshot renderer, promo stage), so 12,717 without them. Tests are another 4,461 lines | `Otto/`, `Otto/Debug/`, `OttoTests/` |
| Zero dependencies | `project.yml` declares no packages; every import is an Apple framework (AppKit, SwiftUI, Foundation, os, Carbon, PDFKit, Security, and a few more) | `project.yml`, `grep -rh '^import ' Otto` |
| No Accessibility permission | The global Option-Space shortcut uses Carbon `RegisterEventHotKey`, which needs no Accessibility grant; the browser tab chip uses AppleScript (Automation, asked per browser) | `Otto/App/HotKeyManager.swift`, `Otto/Otto.entitlements` |
| Own SSE line splitter | Used instead of `AsyncBytes.lines`, which also splits on U+0085, U+2028, and U+2029, characters that can sit unescaped inside a JSON string and would cut an event in half | `Otto/API/SSEParser.swift` |
| macOS 14 or later | `deploymentTarget` in `project.yml` | `project.yml` |
| Status | `gh repo view jke48222/otto`: public, MIT. `curl -sI https://otto-sandy.vercel.app`: 200. No tag or GitHub release yet (the changelog lists 1.0.0 as unreleased), and the signed app is not on sale, so no sales, users, stars, or downloads appear anywhere | GitHub, Vercel, `CHANGELOG.md` |

## Thataway (formerly Screen-Coach AI)

Measured on 2026-09-30 at commit `a6b5ad5` of `jke48222/thataway` unless a row says otherwise. The repo's `docs/BENCHMARKS.md` holds every figure with its source file.

| Claim | How | Evidence |
|---|---|---|
| 233 tests | `swift test`: 132 Core + 83 Kit + 18 Bench XCTest cases, 0 failures; `grep -rh 'func test' Tests \| wc -l` also gives 233 | `Tests/` |
| 12 of 12 targets at 0.067 ms p50 | `thataway-bench axplan` on a committed Google Chrome accessibility snapshot: `ax_hit_rate: 1` over 12 plans, `resolve_p50_ms: 0.067166`. **Caveat:** one Chrome window, and seven of the twelve targets are bookmarks-bar buttons, so this is a narrow result, not a general accuracy figure. CI reproduces the 12 of 12; the timing moves with the machine | `bench-data/axplan-chrome.json`, `docs/BENCHMARKS.md` |
| Local 4-bit vision model on MLX | Holo1.5-7B quantized from the 16.6 GB BF16 build to a 5.65 GB 4-bit MLX build, called through a Python sidecar only when the tree can't answer | `PHASE-0-FINDINGS.md` Finding 6, `Tools/` |
| Cold reads 6 to 10x slower than warm | Logic Pro: 220 ms cold against 21 ms warm, which is why the `AXObserver`-driven cache exists | `PHASE-0-FINDINGS.md` Finding 1, `docs/ARCHITECTURE.md` |
| Batching cut extraction 3.1x | Batched attribute reads at 0.81 ms p50 against 2.54 ms one attribute at a time | `PHASE-0-FINDINGS.md` Finding 2 |
| 7.9 ms against 204 ms at p90 | A warm ScreenCaptureKit stream against spawning `screencapture(1)` per frame | `PHASE-0-FINDINGS.md` Finding 4 |
| Not claimed | Idle CPU and memory were never recorded, and the "aimed crops match full-frame accuracy at 3x the speed" result did not hold on a second run (10 of 12 against 11 of 12). Neither appears on the resume | `docs/BENCHMARKS.md` |

## Freelance work

| Claim | How | Evidence |
|---|---|---|
| 22 statically generated pages | 15 fixed `page.tsx` routes + 7 CMS-driven service pages emitted at build | `app/`, `sitemap.ts`, `content/services.json` |
| 12 directions / 20 variants (CV) | Brief archive: styles 01–08 built twice each + 4 reference recreations; 11 survivors and 1 elimination recorded | `briefs/README.md`, `phase2-snapshots.json` |
| WCAG AA contrast 12.25:1 / 4.57:1 | Ratios computed per token per background and recorded next to the token definitions, including two re-measurements where a token failed on its real ground (why two gold tokens exist) | `app/globals.css` |
| Rate-limited, spam-protected forms | In-memory sliding window (5 per 10 min per IP → 429), shared honeypot, server-side re-validation, Resend REST delivery plus a structured-log/webhook fallback so an outage never loses a lead | `lib/ratelimit.ts`, `lib/email.ts`, `app/api/*/route.ts` |
| Portal: 12 questions, 4 roles | The client's twelve screening questions verbatim in a typed constant; `app_role` enum = dispatcher/operations/accounting/admin. The Postgres schema (RLS, triggers, functions) is in `supabase/migrations/` | `lib/screening.ts`, `lib/database.types.ts`, `supabase/migrations/` |
| Akilah: ~46 MB payload cut, 2,700-line deletion | three.js code-split off release routes + WebGL mount deferred to idle (commit series); the Shopify cart removal commit shows −2,698 lines with the rationale in its message | git history (`ee615e5`, `0b15f8b`) |

## AnimalDot (capstone)

| Claim | How | Evidence |
|---|---|---|
| Led all software, 36 of 37 commits | `git shortlog -sne` on the org repo; the one non-Jalen commit is a teammate's standalone sensor test sketch | `AnimalDot/animaldot` history |
| ~53 tests, two iOS CI pipelines | Backend 24 + web 18 + mobile 11; GitHub Actions simulator build + Codemagic IPA packaging | `backend/src/**/*.test.ts`, `.github/workflows/ios-publish.yml`, `codemagic.yaml` |
| 200 Hz sampling, 0.67–3 Hz band | Firmware config: geophone sampled at 200 Hz; heart-rate band-pass 0.67–3.0 Hz (40–180 BPM), zero-phase Butterworth with hand-derived biquad coefficients. Note: the BedDot-ecosystem clients process 100 Hz streams, so one rate does not cover both | `firmware/include/config.h`, `signal_processor.cpp` |

## Others

| Claim | How | Evidence |
|---|---|---|
| Capital One 60M+ accounts | CreditWise's publicly stated user base: a company figure the business case was scoped against, not a measurement | public CreditWise figures |
| PrimeForge: all 5,761,455 primes below 10⁸ (CV) | Equals π(10⁸) exactly; a hardware photo shows the running system displaying PRIMES: 5,761,455 / MAX: 99,999,999 with the correct last-20 list | `FinalProj/docs/photos/IMG_8806.jpeg` |
| Trading harness: t = 2.91, corrected p = 0.021 (CV) | Portfolio-level timing effect over 105 months, 10,000-resample bootstrap with drift benchmark, Bonferroni-corrected across all 53 configurations ever tried; the recent-era subsample is not significant, which is why capital stays frozen | `docs/trial_07*.md`, `data/trials.csv` |

## AI-assisted development

The resume lists AI-paired development. Jalen directs the architecture, writes the specs and evaluation criteria, reviews every change, and verifies every number above independently; AI tools pair on implementation speed.
