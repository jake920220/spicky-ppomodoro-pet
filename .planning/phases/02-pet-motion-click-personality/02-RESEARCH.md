# Phase 2: Pet Motion & Click Personality - Research

**Researched:** 2026-03-28
**Domain:** desktop pet interaction timing, motion cadence, and audio-driven state transitions
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Keep the current relaxed movement direction, but reduce walking frequency further so Spiky spends longer periods resting.
- Both walking duration and rest duration should be random within bounded ranges rather than feeling periodic or fixed-cycle.
- The overall feeling should be “가끔 움직이고 오래 쉬는 펫” rather than a constantly busy desktop pet.
- Clicking Spiky should not forcibly reverse direction.
- If Spiky is already moving, it should keep the current movement path and only react visually/audibly to the click.
- `image_2` should remain active until the click MP3 playback really ends, not on a fixed short timeout.
- If exact playback-end tracking fails, a fail-safe fallback timeout is acceptable, but the primary design should be audio-end-driven rather than hardcoded duration-driven.
- While the Pomodoro timer is running, walking frequency should be reduced to less than half of the current level so Spiky feels much quieter.
- While moving during timer-running state, the pet caption should stay the same as normal walking (`데스크톱 산책 중.`), not switch to a special patrol phrase.
- When the timer finishes, MP3 2 should repeat until the user explicitly dismisses the alert.
- Repeated playback should have an approximately 2-second gap between loops so the alert does not feel harsh.
- While in timer-finished state, Spiky should stop lateral walking and instead use a “폴짝폴짝” in-place jump animation.
- When the user presses `알림 해제`, the repeated audio stops, the jump animation stops, and Spiky immediately returns to the default `image_1` idle state.
- Phase 2 implementation should be done on a dedicated branch rather than directly on `master`.
- After review passes, the branch should be shipped by opening a PR targeting `master`.

### the agent's Discretion
- Exact numeric ranges for walk-duration/rest-duration randomness, as long as they clearly feel less periodic than the current implementation
- Exact easing and vertical amplitude of the in-place jump animation, as long as it reads as a playful alert state rather than horizontal movement
- Exact fallback strategy when audio-end events are unavailable, as long as audio-end-driven restoration remains the primary behavior

### Deferred Ideas (OUT OF SCOPE)
- Separate settings window / pet-only overlay split remains outside this phase.
- Broader timer feature expansion stays in later phases.
- Any richer physics or bigger gameplay-like pet behaviors remain future work beyond Phase 2.

</user_constraints>

<research_summary>
## Summary

Phase 2 is best implemented by preserving the current concern split: `DesktopWalker` owns cadence and movement, `SpikyStateController` owns visual-state transitions, `AudioPlayer` owns playback semantics, and `bootstrap.ts` coordinates the interactions between them. The strongest implementation choice in this phase is to stop using fixed click timeouts as the source of truth for `image_2` and instead treat the click audio lifecycle as the primary signal for when the clicked visual state should end.

For movement, the current code already has the right shape: randomized rest durations, timer-aware cadence, drag pausing, and runtime position synchronization. The refinement needed is not architectural but behavioral: widen the random rest window, make timer-running cadence substantially quieter, and keep drag/click interruptions from feeling like hard state resets. This supports the “가끔 움직이고 오래 쉬는 펫” direction without introducing a new state management model.

**Primary recommendation:** Keep all Phase 2 work in the existing frontend modules, drive click-state restoration from audio-end events with a fail-safe fallback, and treat timer-finished alert behavior as a separate movement mode that pauses lateral walking and loops the alert sound with a scheduled cooldown.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Browser `Audio` API | Webview built-in | Playback, `ended` event, loop scheduling, currentTime reset | Enough for two local cues without introducing extra dependencies |
| CSS keyframes + data attributes | Browser built-in | Idle/walk/alert animation variants | Lightweight and already used in the current shell |
| Vanilla TypeScript controllers | current | Coordinated in-memory motion/state/audio logic | Matches the current codebase and keeps Rust minimal |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `setTimeout` / `setInterval` | Browser built-in | Random cadence windows and delayed repeat audio | Use for pet rest windows and 2-second finished-alert gaps |
| Tauri window movement APIs | 2.x | Continue using current movement path and drag sync behavior | Use via the existing window-shell adapter only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Audio-ended-driven click restoration | Hardcoded `3000ms` timeout | Simpler, but couples behavior to the current asset and breaks when audio changes |
| CSS-driven finished-state jump | JS-driven transform loop | More control, but unnecessary complexity for a simple alert animation |

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/                        # orchestration and captions
├── features/desktop-walker/    # cadence, drag pause, movement mode
├── features/spiky-state/       # visual-state transitions
├── features/audio/             # playback lifecycle and repeat scheduling
└── styles/                     # animation variants
```

### Pattern 1: Audio lifecycle drives clicked visual state
**What:** The click visual state starts on click and returns to idle only when click audio playback ends successfully, with a fallback timeout if audio metadata or playback fails.
**When to use:** Use for the `image_2` lifetime because the user explicitly wants the visual to match the cue duration.
**Example:**
```typescript
const cancel = audioPlayer.play("click", {
  onEnded: () => spikyState.endClickReaction()
});

spikyState.beginClickReaction();
```

### Pattern 2: Movement mode split
**What:** Treat walking cadence, timer-running cadence, and timer-finished alert behavior as distinct movement modes instead of a single generic rest loop.
**When to use:** Use when `running`, `finished`, and drag states should feel clearly different.
**Example:**
```typescript
if (timerStatus === "finished") {
  walker.enterAlertMode();
} else if (timerStatus === "running") {
  walker.setFocusModeEnabled(true);
}
```

### Anti-Patterns to Avoid
- **Fixed click-state timeout as primary behavior:** This fights the user request and will drift if audio assets change.
- **Looping the finished audio with the HTMLAudio `loop` flag:** It removes the required 2-second breathing gap.
- **Using horizontal walking during timer-finished alert state:** The user explicitly wants in-place jumping instead.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting click-audio completion | Polling `currentTime` manually every frame | `ended` event + fallback timeout | Cleaner, lower overhead, and directly tied to playback completion |
| Repeating finished audio with delay | Constant interval that ignores actual playback state | Chain `play` → wait for `ended` → schedule next start after 2 seconds | Prevents overlapping or clipped repeats |
| Alert-state movement | Separate ad-hoc DOM toggles in multiple files | One explicit alert mode + `data-spiky-state="timer_finished"` CSS animation | Keeps presentation and logic coordinated |

**Key insight:** Phase 2 should mostly be about choosing the right lifecycle triggers, not adding more infrastructure.
</dont_hand-roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Click audio and image state drift out of sync
**What goes wrong:** `image_2` reverts before the sound finishes, or gets stuck if audio errors.
**Why it happens:** The visual state is driven by an unrelated timeout rather than the playback lifecycle.
**How to avoid:** Use `ended` as the primary signal and keep a fail-safe timeout for error cases.
**Warning signs:** Different click assets require code changes to keep behavior aligned.

### Pitfall 2: Timer-running cadence still feels busy
**What goes wrong:** The pet technically moves less often, but still feels distracting during focus time.
**Why it happens:** Only speed is lowered, while rest intervals stay too short.
**How to avoid:** Increase rest windows significantly rather than only slowing movement speed.
**Warning signs:** Users still describe it as “뽈뽈거린다” during timer-running periods.

### Pitfall 3: Finished-state alert loop becomes annoying
**What goes wrong:** The alert feels harsh because repeats fire too quickly or overlap.
**Why it happens:** Repeats are scheduled on a rigid interval or with the native `loop` flag.
**How to avoid:** Schedule the next repeat only after playback ends, then add the explicit 2-second cooldown.
**Warning signs:** The second repeat starts before the previous playback feels fully settled.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from current sources:

### Current movement cadence controller
```typescript
// Source: src/features/desktop-walker/desktop-walker.ts
private queueNextWalk(delayMs: number): void {
  this.restTimeoutId = window.setTimeout(() => {
    void this.refreshBoundsAndWalk();
  }, delayMs);
}
```

### Current click-state timeout (to be replaced)
```typescript
// Source: src/features/spiky-state/spiky-state.ts
this.clickTimeoutId = window.setTimeout(() => {
  this.snapshot = createIdleSnapshot();
}, CLICK_STATE_DURATION_MS);
```

### Current finished-state orchestration hook
```typescript
// Source: src/app/bootstrap.ts
if (snapshot.status === "finished" && previousTimerStatus !== "finished") {
  spikyState.showTimerFinished();
  void audioPlayer.play("timerFinished");
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed animation durations tied to guessed audio length | Event-driven media lifecycle + fail-safe fallback | Mature browser media APIs, current best practice | Better maintainability when assets change |
| Busy companion movement loops | Lower-frequency ambient behavior with longer rest windows | Ongoing UX preference in desktop companion tools | More acceptable as a background app |

**New tools/patterns to consider:**
- Treat “movement mode” and “visual state” as related but separate layers
- Use audio lifecycle callbacks to keep UI behavior aligned with real media playback

**Deprecated/outdated:**
- Hardcoding interaction lengths to specific MP3 durations as the main mechanism
</sota_updates>

<open_questions>
## Open Questions

1. **How aggressive should the timer-finished jump animation feel**
   - What we know: It should be in-place and noticeably different from walking
   - What's unclear: Exact amplitude and tempo
   - Recommendation: Start with restrained “폴짝폴짝” timing and refine with human testing

2. **How long the fallback timeout should be if click audio events fail**
   - What we know: It should not be the primary behavior
   - What's unclear: Exact fail-safe window if metadata is unavailable
   - Recommendation: Use actual audio duration when available; otherwise a conservative fallback near the current click asset length
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `.planning/phases/02-pet-motion-click-personality/02-CONTEXT.md`
- `src/features/desktop-walker/desktop-walker.ts`
- `src/features/spiky-state/spiky-state.ts`
- `src/features/audio/audio-player.ts`
- `src/app/bootstrap.ts`
- `src/app/ui.ts`
- `src/styles/app.css`

### Secondary (MEDIUM confidence)
- Browser media event model as documented by standard `HTMLAudioElement` behavior

### Tertiary (LOW confidence - needs validation)
- None
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: pet motion cadence and audio-driven interaction lifecycle
- Ecosystem: current browser audio APIs and existing code structure
- Patterns: click-state restoration, quiet focus cadence, finished-state alert mode
- Pitfalls: sync drift, over-busy movement, harsh repeat alerts

**Confidence breakdown:**
- Standard stack: HIGH - all required primitives already exist in the project
- Architecture: HIGH - changes fit the existing module boundaries
- Pitfalls: HIGH - all directly observable in the current behavior
- Code examples: HIGH - derived from current source

**Research date:** 2026-03-28
**Valid until:** 2026-04-27
</metadata>

---

*Phase: 02-pet-motion-click-personality*
*Research completed: 2026-03-28*
*Ready for planning: yes*
