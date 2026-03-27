---
phase: 01-overlay-shell-foundation
plan: 03
subsystem: ui
tags: [tauri, vanilla-typescript, css, overlay-shell, pet-stage]
requires:
  - phase: 01-01
    provides: frontend-owned startup placement through the window-shell adapter
  - phase: 01-02
    provides: compact control dock markup and scroll-free pet-stage shell boundaries
provides:
  - explicit idle-first shell rendering with safe pet image fallback handling
  - grounded pet-stage visuals that make image_1 read as a desktop companion presence
affects: [02-01, 02-02, 03-02, idle-shell]
tech-stack:
  added: []
  patterns:
    - idle-first shell render before async window-shell startup
    - centralized default idle asset mapping for pet state rendering
    - layered pet-stage grounding via DOM and CSS instead of native shell work
key-files:
  created: []
  modified:
    - src/app/bootstrap.ts
    - src/app/ui.ts
    - src/styles/app.css
    - src/shared/assets/manifest.ts
    - src/features/spiky-state/spiky-state.ts
key-decisions:
  - "Rendered the idle shell before async desktop-shell initialization so Spiky appears immediately on startup."
  - "Kept the grounded stage treatment in DOM and CSS so the shell stays frontend-owned and Rust remains minimal."
patterns-established:
  - "Spiky image rendering updates src only when the visual state changes, while load/error handlers own fallback visibility."
  - "The pet stage uses a glow + ground layering pattern so future walking/click behavior can reuse the same shell composition."
requirements-completed: [PET-01]
duration: 8min
completed: 2026-03-27
---

# Phase 01 Plan 03: Idle Shell Pet Presence Summary

**Idle-first Spiky shell startup with safe image fallback handling and a grounded desktop-pet stage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-27T08:18:16Z
- **Completed:** 2026-03-27T08:26:16Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Made the shell render the default Spiky state immediately on startup instead of waiting for later interaction flow.
- Kept `image_1` as the canonical idle asset while tightening image src/fallback behavior around load and error events.
- Rebalanced the stage visuals so the dock stays compact and the idle pet reads as grounded and companion-like.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make default idle rendering explicit and safe on startup** - `b7074a4` (feat)
2. **Task 2: Reinforce grounded idle-stage presentation in the shell visuals** - `0ba1a98` (feat)

Plan metadata for this execution is captured in the docs commit after summary/state updates.

## Files Created/Modified

- `src/app/bootstrap.ts` - renders the idle shell immediately and keeps image fallback hooks attached before startup shell initialization.
- `src/app/ui.ts` - syncs pet image src more safely, adds grounded stage markup, and updates idle copy to stay pet-first.
- `src/styles/app.css` - adds stage grounding layers and rebalances shell emphasis so the pet remains visually primary.
- `src/shared/assets/manifest.ts` - preserves `image_1` as the canonical idle asset mapping and exposes the default idle asset constant.
- `src/features/spiky-state/spiky-state.ts` - centralizes the idle-state snapshot used on startup and when interactive states settle.
- `.planning/phases/01-overlay-shell-foundation/01-03-SUMMARY.md` - records this plan's implementation, verification, and follow-up context.

## Decisions Made

- Rendered the idle shell before async window placement/walking startup so the first visible state is already a stable pet presence.
- Used CSS/DOM grounding layers instead of adding any new native-shell behavior or dependencies.
- Kept the top dock minimal and moved the default idle caption away from control instructions so the shell feels like a companion first.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Parallel `git add` calls briefly contended on `.git/index.lock`; resolved by staging task files sequentially for the rest of execution.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 can add walking and click personality on top of an idle shell that already starts in the correct default state.
- The pet stage now has stable visual grounding that later motion/state transitions can reuse without reworking the shell structure.

## Self-Check: PASSED

- Found `.planning/phases/01-overlay-shell-foundation/01-03-SUMMARY.md`.
- Verified task commit `b7074a4` exists in git history.
- Verified task commit `0ba1a98` exists in git history.
