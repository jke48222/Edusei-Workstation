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

Re-measured on 2026-10-01 for version 1.1 at commit `450b6b2` of `jke48222/otto`, which is GitHub's `main` and the clean `v1.1` worktree at `~/otto-v1.1`. The `v1.1.0` tag sits on the parent commit `5231b66`; `450b6b2` changes two lines so CI's Xcode 26 compiles them, with no change in behavior. The 1.0 figures of 2026-09-27 (212 tests, 24 state-machine tests, 16,400 lines, zero dependencies) are retired.

| Claim | How | Evidence |
|---|---|---|
| 1,873 unit tests | The source build's full suite. GitHub Actions run 36681975085, job "Build & test" (Xcode 26.6) on `450b6b2`, 2026-09-30: "Executed 1873 tests, with 2 tests skipped and 0 failures". The 1.1.0 release gate records the same 1,873 with 0 failures on macOS 27.0. The 2 skips are opt-in probes (input provenance, snapshot baseline). **Caveat:** `grep -rhE 'func test' OttoTests \| wc -l` gives 2,133, because license and Setapp tests compile only into the signed flavors; the paid flavor's job runs 2,131 (9 skipped). Quote 1,873 | `OttoTests/`, `.github/workflows/ci.yml`, `CHANGELOG.md` (Release gate) |
| 51 pointer state-machine tests | `grep -c 'func test' OttoTests/NotchPointerMachineTests.swift` = 51, and the same CI run shows "Test Suite 'NotchPointerMachineTests' passed ... Executed 51 tests, with 0 failures". Hover, click, and drag live in a pure `NotchPointerMachine` that takes events and time and returns effects, so the tests need no window | `Otto/Notch/NotchPointerMachine.swift`, `OttoTests/NotchPointerMachineTests.swift` |
| 90 ms hover rest | `var hoverDwell: TimeInterval = 0.09` (line 21); a hover schedules `.hoverOpen` at the anchor time plus the dwell and cancels if the pointer leaves first. A design value tuned by hand, not a user study | `Otto/Notch/NotchPointerMachine.swift` |
| 71,000 lines of Swift | `find Otto -name '*.swift' \| xargs cat \| wc -l` = 71,050 across 253 files (`find Otto -name '*.swift' \| wc -l`), blank lines and comments included. **Caveat:** 7,996 of those (6 files) are the Debug tools, so 63,054 without them, and `Licensing/`, `Updates/` and `Setapp/` compile only into the signed flavors. Tests are another 42,402 lines in 116 files | `Otto/`, `Otto/Debug/`, `OttoTests/` |
| Apple frameworks only in the source build | `project.yml` declares no packages and every import in the source build is an Apple framework. The signed app adds Sparkle (`project-paid.yml`); the Setapp flavor adds the Setapp framework and is not offered in 1.1.0. Never call the signed app dependency-free | `project.yml`, `project-paid.yml`, `grep -rh '^import ' Otto` |
| Approval cards take hardware input only | Cards accept a click or key only when `eventSourceUnixProcessID == 0` and it was pressed after the card armed; posted, auto-repeated and held-over input is ignored. Release gate, run by Jalen on the signed build on 2026-09-30: a Command-Return posted by System Events, and one held down from before the card, both failed to approve. Pass | `Otto/Tools/InputProvenance.swift`, `CHANGELOG.md` (Release gate) |
| 10-minute Undo for added events and reminders | `static let undoWindow: Duration = .seconds(600)` | `Otto/Tools/ToolContracts.swift:94` |
| AppleScript lexer blocks risky scripts | `AppleScriptAnalyzer` tokenizes with `ScriptLexer` and blocks administrator privileges, run-time code, raw Apple event codes, AppleScriptObjC, hidden text and browser JavaScript | `Otto/Actions/Scripting/AppleScriptAnalyzer.swift`, `CHANGELOG.md` (Security) |
| No Accessibility permission to open | The global Option-Space shortcut uses Carbon `RegisterEventHotKey`, which needs no Accessibility grant; Accessibility is asked for only to paste into another app or read a selection | `Otto/App/HotKeyManager.swift`, README "Privacy & permissions" |
| Own SSE line splitter | Used instead of `AsyncBytes.lines`, which also splits on U+0085, U+2028, and U+2029, characters that can sit unescaped inside a JSON string and would cut an event in half | `Otto/API/SSEParser.swift` |
| macOS 14 or later | `deploymentTarget` in `project.yml`; `minMacOS` in `site/commerce.json` | `project.yml`, `site/commerce.json` |
| $19 once, 3 Macs, 14-day trial | `price.usd` 19, `seats` 3, `trialDays` 14; https://ottonotch.com/buy read on 2026-10-01: "$19 once. Up to 3 Macs. Every 1.x update." | `site/commerce.json`, `site/buy.html` |
| $14 launch price through 2026-10-06 | `launch.usd` 14, `startsAt` 2026-09-30T00:00-04:00, `endsAt` 2026-10-06T23:59-04:00; the live /buy page says "Launch price: $14 until Oct 6, 11:59 pm EDT". Time-bound: LinkedIn post only, never the CV or site | `site/commerce.json`, https://ottonotch.com/buy |
| 52-second film | `ffprobe` duration 51.73 s on `~/otto-v1.1/docs/media/otto-promo.mp4` (1920x1080, 22,244,889 bytes, the same size `curl -sI` reports for the copy at `film/1.1.0-launch/otto-promo.mp4` on Vercel Blob that the README and site link). Recorded from the real app; its end card reads ottonotch.com, "$19 once" and the not-affiliated line. LinkedIn media title only | `docs/media/otto-promo.mp4` (git-ignored), README "Watch the film" |
| Status | `gh repo view jke48222/otto`: public, MIT. `gh release view v1.1.0`: "Otto 1.1.0", published 2026-09-30T06:57:35Z, no assets (the disk image is served from Vercel Blob). https://ottonotch.com, /buy and /download answer 200; Polar is the merchant of record per /terms; the cask `jke48222/tap/otto` is at 1.1.0. Signed and notarized per the release gate (Gatekeeper "Notarized Developer ID", stapled); not re-run on a downloaded disk image in this pass. No sales, users, downloads or stars (0) are claimed anywhere; sales live in Polar, which was not read | GitHub, `CHANGELOG.md`, `homebrew-tap/Casks/otto.rb` |

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

The KUL Enterprises website rows were re-measured on 2026-10-08 at `09c3edc`, the merge of PR #1 on `main` of `jke48222/kul-enterprises-website` (a private repository). Vercel's production deployment of kulenterprises.com was built from that commit. Paths in those rows are in that repository. The earlier figures (an 83-token design system, 17 collections, an 88-property token system, a 482-line search file) are retired.

| Claim | How | Evidence |
|---|---|---|
| 22 statically generated pages | 15 hand-kept routes in `app/sitemap.ts` plus the 7 service slugs in `content/services.json`, each prerendered; nothing in `app/`, `components/` or `lib/` sets `force-dynamic` or `revalidate`. The smoke run in CI reads "sitemap.xml is served and lists pages (22 pages)", and the live sitemap lists 22 URLs | `app/sitemap.ts`, `content/services.json`, GitHub Actions run 37363768541 |
| 12 directions / 20 variants | `multiverse/variants/` at commit `04cd418` holds 20 folders: styles 01 to 08 built twice each (`s01a` to `s08b`) and styles 09 to 12 once, as recreations of four reference sites. The folders left the tree in `1ce3b5b`, when the chosen direction moved to the root, so they survive only in history | `multiverse/variants/` at `04cd418`, README "Results" |
| 73-token design system | Unique custom properties declared in `app/globals.css`: `grep -oE -- '--[a-z0-9-]+:' app/globals.css \| sort -u \| wc -l` = 73, the count `tests/readme.test.ts` checks. **Caveat:** 5 are component-scoped `--k-sc-*` scroll-carousel variables, so 68 without them | `app/globals.css`, `tests/readme.test.ts` |
| 19 typed CMS collections | `schema.collections` in `tina/tina-lock.json` has 19 entries, and `tina/config.ts` declares the same 19: site, services and FAQ, twelve page collections from the shared `page()` factory, then navigation, search, forms and legal | `tina/tina-lock.json`, `tina/config.ts` |
| Search: 545 lines, 0 dependencies | `wc -l lib/search.ts` = 545, the count `tests/readme.test.ts` checks; the file has no `import` statement, and `package.json` lists no search package | `lib/search.ts`, `package.json` |
| 36-entry freight synonym sheet | Keys of the `SYNONYMS` record in `lib/search.ts` = 36, each mapping an industry word to words the site uses (`refrigerated` to reefer, `coi` to insurance certificate) | `lib/search.ts` |
| Contrast: ink 12.25:1, gold 4.57:1 and 7.34:1 | WCAG 2.x ratios recomputed from the hex values with `contrast_check.py`: ink `#2c2c2c` on paper `#f0f0f0` 12.25:1, gold `#a05c08` on paper 4.57:1, gold-lit `#d6a145` on charcoal `#1c1c1c` 7.34:1. Gold is two tokens because one value cannot clear AA on both grounds. Eight text colors (three inks, three tones for dark grounds, two golds) carry a measured ratio in a comment beside the token; grounds, rules and the error red do not, so no surface says every token carries one. The file also records two earlier grey figures it caught wrong and their replacements. **Caveat:** contrast only; no full WCAG audit, Lighthouse or axe result is committed | `app/globals.css` (tokens at lines 115 to 149) |
| Four rate-limited, spam-protected forms | Four route handlers (`contact`, `driver`, `packet`, `quote`), each calling `rateLimit()` (in-memory sliding window, 5 per 10 min per IP, then 429), `readForm()` for server-side validation and the `botcheck` honeypot, `sendViaResend()`, and `recordLead()`, which writes every submission to the server log as one JSON line and to an optional webhook. **Caveat:** whether `RESEND_FROM` is set in production lives in the hosting environment, not the repository, so email delivery from the live forms is unverified | `lib/ratelimit.ts`, `lib/email.ts`, `app/api/*/route.ts`, README "Environment variables" |
| 433 Vitest tests | GitHub Actions run 37363768541 on `09c3edc`, 2026-10-05: "Test Files 29 passed (29)" and "Tests 433 passed (433)". PR #1 reports the same 433 at the branch tip, whose tree is identical to the merge | `tests/`, `.github/workflows/ci.yml`, PR #1 |
| 74-step smoke test of the production build | `scripts/smoke.mjs` runs `next start` on the built site with no mail key and checks every sitemap page, the security headers and the four form endpoints over HTTP; the same CI run logs "smoke: 74 passed, 0 failed, 0 known gaps". It runs against a local production build, not the live domain | `scripts/smoke.mjs`, GitHub Actions run 37363768541 |
| CI on every push | `.github/workflows/ci.yml` runs on `push` and `pull_request`: `npm ci`, lint, typecheck, `npm test`, the build and the smoke test | `.github/workflows/ci.yml` |
| Film: 1080p and 720x1280 portrait H.264 cuts | `ffprobe` on `public/videos/kul-intro.mp4` (h264 High, 1920x1080, 15.70 s, 10,362,514 bytes) and `kul-intro-mobile.mp4` (h264 High, 720x1280, 15.58 s, 3,349,406 bytes); the live site serves both at those byte counts. Jalen made it from the owner's storyboard with ChatGPT, Higgsfield Cinema Studio 3.5 and Final Cut Pro; an earlier Blender film was superseded and is not on the site. The 1080p and 720p pairs (`kul-hero`, `dash-*`) are the background films, not the opening | `components/brand/LoadingOverlay.tsx` lines 220 to 222, `public/videos/` |
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
