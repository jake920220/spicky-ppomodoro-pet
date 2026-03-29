# Phase 2: Pet Motion & Click Personality - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes Spiky feel alive through bounded walking, directional presentation, and click interaction personality. It clarifies the timing, tone, and motion behavior of the pet itself, but does not introduce a separate settings window or expand the timer feature set beyond the behavior changes already implied by the roadmap.

</domain>

<decisions>
## Implementation Decisions

### Movement cadence
- **D-01:** Keep the current relaxed movement direction, but reduce walking frequency further so Spiky spends longer periods resting.
- **D-02:** Both walking duration and rest duration should be random within bounded ranges rather than feeling periodic or fixed-cycle.
- **D-03:** The overall feeling should be “가끔 움직이고 오래 쉬는 펫” rather than a constantly busy desktop pet.

### Direction behavior
- **D-04:** Clicking Spiky should not forcibly reverse direction.
- **D-05:** If Spiky is already moving, it should keep the current movement path and only react visually/audibly to the click.

### Click reaction timing
- **D-06:** `image_2` should remain active until the click MP3 playback really ends, not on a fixed short timeout.
- **D-07:** If exact playback-end tracking fails, a fail-safe fallback timeout is acceptable, but the primary design should be audio-end-driven rather than hardcoded duration-driven.

### Timer-running behavior
- **D-08:** While the Pomodoro timer is running, walking frequency should be reduced to less than half of the current level so Spiky feels much quieter.
- **D-09:** While moving during timer-running state, the pet caption should stay the same as normal walking (`데스크톱 산책 중.`), not switch to a special patrol phrase.

### Timer-finished behavior
- **D-10:** When the timer finishes, MP3 2 should repeat until the user explicitly dismisses the alert.
- **D-11:** Repeated playback should have an approximately 2-second gap between loops so the alert does not feel harsh.
- **D-12:** While in timer-finished state, Spiky should stop lateral walking and instead use a “폴짝폴짝” in-place jump animation.
- **D-13:** When the user presses `알림 해제`, the repeated audio stops, the jump animation stops, and Spiky immediately returns to the default `image_1` idle state.

### Branching workflow
- **D-14:** Phase 2 implementation should be done on a dedicated branch rather than directly on `master`.
- **D-15:** After review passes, the branch should be shipped by opening a PR targeting `master`.

### the agent's Discretion
- Exact numeric ranges for walk-duration/rest-duration randomness, as long as they clearly feel less periodic than the current implementation
- Exact easing and vertical amplitude of the in-place jump animation, as long as it reads as a playful alert state rather than horizontal movement
- Exact fallback strategy when audio-end events are unavailable, as long as audio-end-driven restoration remains the primary behavior

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` — Phase 2 goal, requirements, success criteria, and planned scope
- `.planning/REQUIREMENTS.md` — `PET-02`, `PET-03`, and `AUD-01` define the required outcomes for this phase
- `.planning/PROJECT.md` — core value, product constraints, and lightweight desktop-pet direction

### Prior phase decisions and current behavior
- `.planning/phases/01-overlay-shell-foundation/01-CONTEXT.md` — existing shell constraints and Phase 1 UX decisions that Phase 2 must preserve
- `.planning/phases/01-overlay-shell-foundation/01-RESEARCH.md` — shell behavior research that still constrains motion and drag interactions
- `.planning/phases/01-overlay-shell-foundation/01-01-SUMMARY.md` — startup placement and overlay-shell implementation summary
- `.planning/phases/01-overlay-shell-foundation/01-02-SUMMARY.md` — compact dock and no-scroll shell summary
- `.planning/phases/01-overlay-shell-foundation/01-03-SUMMARY.md` — idle shell startup and grounded pet-stage summary

### Product and architecture rules
- `AGENTS.md` — project-wide implementation rules and constraints
- `docs/product-rules.md` — current state/audio/timer behavior expectations
- `docs/architecture-rules.md` — separation-of-concerns rules that still apply to Phase 2

### Current implementation anchors
- `src/features/desktop-walker/desktop-walker.ts` — current walking cadence, drag pause, and movement logic
- `src/features/spiky-state/spiky-state.ts` — current clicked/default/finished state transitions
- `src/features/audio/audio-player.ts` — current audio playback model
- `src/app/bootstrap.ts` — current orchestration of clicks, timer state, and walker behavior
- `src/app/ui.ts` — current pet captions and render mapping
- `src/styles/app.css` — current idle/walking visual animation hooks

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/desktop-walker/desktop-walker.ts`: already owns movement speed, rest intervals, drag pausing, and timer-sensitive cadence
- `src/features/spiky-state/spiky-state.ts`: already owns click-state timing and can be adapted to audio-end-driven restoration
- `src/features/audio/audio-player.ts`: central point for audio playback behavior and a likely extension point for playback-end/repeat logic
- `src/app/bootstrap.ts`: central orchestrator for click reactions, timer state changes, and walker integration
- `src/styles/app.css`: already exposes `idle-bob` and `walk-bob` animation hooks that can be extended for finished-state jumping

### Established Patterns
- Motion/state/audio remain split by concern and coordinated from bootstrap
- Tauri-specific window behavior lives behind the window-shell adapter
- DOM/CSS remain the preferred surface for presentation changes instead of moving logic into Rust
- User-facing behavior is validated incrementally through human feedback, not just code-only assumptions

### Integration Points
- `DesktopWalker` is the main integration point for slower/randomized walking and timer-running cadence reduction
- `SpikyStateController` and `AudioPlayer` will need to cooperate to keep click state alive until audio playback actually ends
- `bootstrap.ts` will need to connect timer-finished looped audio, finished-state animation control, and dismiss behavior
- `app.css` and `ui.ts` will need coordinated changes for finished-state jump animation and caption consistency

</code_context>

<specifics>
## Specific Ideas

- The current direction is already close to the desired feel; Phase 2 should refine cadence and reaction quality rather than reimagine the pet.
- Click reaction should be immediate and clear, but not overacted.
- Timer-finished state should feel noticeably different: repeated alert sound with breathing room, and in-place bouncing rather than lateral roaming.
- The user plans to implement Phase 2 on a dedicated branch and only merge to `master` after review and PR flow.

</specifics>

<deferred>
## Deferred Ideas

- Separate settings window / pet-only overlay split remains outside this phase.
- Broader timer feature expansion stays in later phases.
- Any richer physics or bigger gameplay-like pet behaviors remain future work beyond Phase 2.

</deferred>

---

*Phase: 02-pet-motion-click-personality*
*Context gathered: 2026-03-28*
