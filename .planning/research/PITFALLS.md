# Pitfalls Research

**Domain:** desktop pet pomodoro timer
**Researched:** 2026-03-27
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Off-screen or jittery pet movement

**What goes wrong:**
The pet window drifts outside visible bounds, jitters at screen edges, or jumps unpredictably across monitors.

**Why it happens:**
Window movement is driven without using monitor work-area bounds, current window size, or native coordinate systems correctly.

**How to avoid:**
Resolve movement bounds from the current or primary monitor, clamp X movement, and keep the pet on a consistent baseline near the desktop edge.

**Warning signs:**
- Pet disappears partially off screen
- Edge movement vibrates or overshoots
- Different behavior appears on different monitors

**Phase to address:**
Phase 2

---

### Pitfall 2: Timer state and pet state become tightly coupled

**What goes wrong:**
Click logic, finish logic, and timer logic start mutating each other directly, making regressions hard to isolate.

**Why it happens:**
Desktop pets feel simple, so developers often wire side effects inline until the app becomes tangled.

**How to avoid:**
Keep timer, visual state, audio, and window movement in separate modules and coordinate them from one bootstrap layer.

**Warning signs:**
- Render code starts deciding timer transitions
- Timer code directly manipulates DOM or audio
- Fixing one interaction breaks another

**Phase to address:**
Phase 1

---

### Pitfall 3: Asset files look correct but are invalid for native tooling

**What goes wrong:**
Tauri build steps fail because image files have the wrong actual format or lack alpha support.

**Why it happens:**
Desktop pet projects often reuse art assets with inconsistent export settings or misleading file extensions.

**How to avoid:**
Validate image/audio assets early, generate native icon assets from a repeatable step, and keep asset path lookup centralized.

**Warning signs:**
- Build-time icon errors
- Broken transparency around sprites
- Sounds or images load in browser but fail in packaging

**Phase to address:**
Phase 1

---

### Pitfall 4: The pet feels like a widget, not a companion

**What goes wrong:**
The app technically works but feels lifeless because motion, click latency, and visual response are too weak.

**Why it happens:**
Developers optimize for feature completion and skip micro-behavior polish.

**How to avoid:**
Prioritize immediate click feedback, subtle idle motion, random walking cadence, and directional facing before adding more features.

**Warning signs:**
- Clicking feels delayed or blocked
- The pet stands still for too long
- Motion has no personality or timing variance

**Phase to address:**
Phase 2

---

### Pitfall 5: Pomodoro flow grows beyond the MVP too early

**What goes wrong:**
The project adds statistics, tasks, long-break automation, sync, or social features before the core pet timer loop feels solid.

**Why it happens:**
Pomodoro tools invite feature creep because many existing apps include a lot more than a timer.

**How to avoid:**
Lock the MVP to duration input, basic session controls, finish feedback, and local-only behavior.

**Warning signs:**
- New requirements focus on dashboards or integrations
- Core pet behavior is still unstable while new timer modes are being added

**Phase to address:**
Phase 3 and Phase 4

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| One combined overlay window | Faster MVP delivery | Harder to evolve into separate settings + pet windows later | Acceptable for v1 if documented clearly |
| Manual icon/asset conversion | Unblocks builds quickly | Easy to forget or break when assets change | Acceptable only until a repeatable build step is added |
| No automated tests | Fast initial iteration | Cross-feature regressions are easy to miss | Acceptable very early, but should not persist past core loop stabilization |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Tauri window permissions | Assuming `core:window:default` allows all window mutations | Explicitly add capabilities like `core:window:allow-set-position` when needed |
| Native window positioning | Using logical/physical coordinates interchangeably | Pick one coordinate system deliberately and clamp bounds |
| Audio playback | Letting repeated clicks stack audio instances | Pause and rewind existing sound before replay |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Over-frequent native position updates | Jitter, CPU waste, battery drain | Keep movement intervals modest and movement behavior simple | Low-power hardware or multi-monitor setups |
| Full app rerender on every tiny state change | Unnecessary UI churn | Keep DOM small and state transitions explicit | When the control surface becomes much richer |
| Heavy animation systems for simple motion | Increased complexity without clear value | Use CSS and lightweight timer loops first | Immediately for a tiny MVP |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Granting broad Tauri capabilities without need | Frontend can invoke more native behavior than intended | Scope permissions narrowly and document every added capability |
| Assuming local-only means no safety concerns | Broken or malformed local assets can still crash or degrade the app | Validate assets and fail predictably |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Scrollbars visible on a pet overlay | Makes the app feel like a broken web page | Hide overflow at the shell level and size the layout intentionally |
| Timer controls too large or intrusive | Pet no longer feels ambient | Keep the control dock compact and visually secondary to the pet |
| Completion feedback too subtle or too loud | Users miss the alert or get annoyed by it | Pair image + sound, and tune default volume conservatively |

## "Looks Done But Isn't" Checklist

- [ ] **Overlay shell:** Often missing correct always-on-top / transparency behavior — verify on both macOS and Windows
- [ ] **Walking pet:** Often missing edge-boundary logic — verify the pet never leaves the screen
- [ ] **Click interaction:** Often missing low-latency feedback — verify the image swap and sound trigger immediately
- [ ] **Timer finish:** Often missing a stable dismiss/reset loop — verify the app returns cleanly to idle
- [ ] **Assets:** Often missing native-format validation — verify images/audio package correctly

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Off-screen movement | MEDIUM | Clamp movement logic, reproduce on target monitor layout, and add regression checks |
| State coupling | MEDIUM | Pull side effects back into bootstrap and restore feature boundaries |
| Invalid assets | LOW to MEDIUM | Re-export/convert source files, regenerate icons, and centralize the asset pipeline |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Off-screen movement | Phase 2 | Pet remains within visible desktop bounds during repeated patrol cycles |
| State coupling | Phase 1 | Timer, pet, audio, and shell modules stay separated in source structure |
| Invalid assets | Phase 1 | `pnpm build`, `cargo check`, and packaging-related checks succeed with valid assets |
| Widget-like feel | Phase 2 | Clicks and walking give immediate, noticeable feedback |
| Premature scope creep | Phase 3 / 4 | Roadmap stays focused on local pet timer must-haves before extras |

## Sources

- `AGENTS.md`
- `.planning/codebase/CONCERNS.md`
- Tauri window docs — https://v2.tauri.app/learn/window-customization/
- Tauri window API docs — https://v2.tauri.app/ko/reference/javascript/api/namespacewindow/
- Desktop pet examples:
  - https://github.com/90shree/desktop-pet-kirby
  - https://github.com/ExtraNick/Chatty_desktop_pet

---
*Pitfalls research for: desktop pet pomodoro timer*
*Researched: 2026-03-27*
