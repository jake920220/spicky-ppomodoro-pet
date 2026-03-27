# Roadmap: Spiky

## Overview

Spiky's roadmap moves from "correct overlay shell" to "believable companion behavior" to "reliable Pomodoro loop" and only then to cross-platform hardening. The goal is to validate the smallest local desktop pet timer that already feels like a companion, not a generic productivity app.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Overlay Shell Foundation** - Create the transparent desktop shell, top control dock, and default pet presence.
- [ ] **Phase 2: Pet Motion & Click Personality** - Make Spiky walk like a desktop companion and react instantly to clicks.
- [ ] **Phase 3: Pomodoro Feedback Loop** - Connect the pet to the focus-session timer and completion cues.
- [ ] **Phase 4: Cross-Platform Hardening** - Validate and stabilize the local-only experience on both desktop targets.

## Phase Details

### Phase 1: Overlay Shell Foundation
**Goal**: Deliver a transparent overlay window with a compact top control dock, no visible scrollbars, and a stable default Spiky presence.
**Depends on**: Nothing (first phase)
**Requirements**: DESK-01, DESK-02, DESK-03, PET-01
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can open Spiky as a transparent, always-on-top desktop overlay.
  2. User can use a compact top control dock and drag region without relying on native window chrome.
  3. No browser-style scrollbars appear during normal use.
  4. Spiky loads in its default visible idle state using `image_1`.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Configure the Tauri shell, permissions, icon assets, and overlay window defaults
- [ ] 01-02: Build the top control dock and no-scroll layout shell
- [ ] 01-03: Wire default pet asset loading and baseline UI rendering

### Phase 2: Pet Motion & Click Personality
**Goal**: Make Spiky feel alive through bounded walking, directional presentation, and instant click response.
**Depends on**: Phase 1
**Requirements**: PET-02, PET-03, AUD-01
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Spiky patrols horizontally within visible desktop bounds instead of staying static.
  2. Spiky's movement direction is visually readable while it patrols.
  3. Clicking Spiky immediately switches to the interaction state, then returns to idle.
  4. The click cue plays once per interaction without audible stacking.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Implement bounded desktop walking and movement-direction presentation
- [ ] 02-02: Implement click interaction state timing and click sound behavior

### Phase 3: Pomodoro Feedback Loop
**Goal**: Attach the desktop pet to a clear Pomodoro session loop with readable state, strong completion feedback, and conservative sound defaults.
**Depends on**: Phase 2
**Requirements**: TIME-01, TIME-02, TIME-03, TIME-04, TIME-05, AUD-02, AUD-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can set minutes and run a Pomodoro session with start, pause/resume, and reset controls.
  2. The top control dock shows live remaining time and timer status throughout the session.
  3. When the session finishes, Spiky switches to `image_3` and announces completion clearly.
  4. The completion state can be dismissed or reset without relaunching the app.
  5. Both click and completion sounds remain controlled and default to a non-intrusive volume level.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Implement the Pomodoro timer state machine and duration input rules
- [ ] 03-02: Wire timer-driven UI readouts and finished-state orchestration
- [ ] 03-03: Finalize completion sound playback, dismiss/reset flow, and cue volume defaults

### Phase 4: Cross-Platform Hardening
**Goal**: Prove that the same local-only companion timer loop works reliably on both macOS and Windows.
**Depends on**: Phase 3
**Requirements**: PLAT-01
**UI hint**: no
**Success Criteria** (what must be TRUE):
  1. The same core overlay, walking, click, timer, and completion loop behaves correctly on macOS and Windows.
  2. The app remains local-only and does not depend on backend or online services.
  3. Native-shell logic stays minimal and frontend-driven rather than drifting into Rust-heavy behavior.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Run cross-platform validation, tighten native shell edges, and harden packaging/runtime assumptions

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Overlay Shell Foundation | 0/3 | Not started | - |
| 2. Pet Motion & Click Personality | 0/2 | Not started | - |
| 3. Pomodoro Feedback Loop | 0/3 | Not started | - |
| 4. Cross-Platform Hardening | 0/1 | Not started | - |
