# Requirements: Spiky

**Defined:** 2026-03-27
**Core Value:** Spiky must feel like a small desktop companion that makes focus sessions visible and playful without getting in the user's way.

## v1 Requirements

### Desktop Shell

- [ ] **DESK-01**: User can launch Spiky as a transparent, always-on-top desktop overlay on macOS and Windows.
- [ ] **DESK-02**: User can use a compact top control dock to view controls and drag the app without native window chrome.
- [ ] **DESK-03**: User does not see browser-style scrollbars during normal use of the overlay window.

### Pet Presence

- [ ] **PET-01**: User sees Spiky in its default idle state using `image_1` when the app is ready.
- [ ] **PET-02**: Spiky patrols horizontally within visible desktop bounds and visually reflects its movement direction.
- [ ] **PET-03**: Clicking Spiky immediately switches it to the interaction state using `image_2`, then returns it to idle.

### Timer

- [ ] **TIME-01**: User can set a focus duration in whole minutes before starting a Pomodoro session.
- [ ] **TIME-02**: User can start, pause/resume, and reset a Pomodoro session.
- [ ] **TIME-03**: User can see the live remaining time and current timer status from the top control dock.
- [ ] **TIME-04**: When a focus session ends, Spiky switches to the timer-finished state using `image_3`.
- [ ] **TIME-05**: User can dismiss or reset the timer-finished state and return the app to normal idle use without relaunching.

### Audio

- [ ] **AUD-01**: Clicking Spiky plays MP3 1 once without overlapping repeated click audio.
- [ ] **AUD-02**: Timer completion plays MP3 2 once without overlapping repeated completion audio.
- [ ] **AUD-03**: Spiky's default cue playback volume is 50% of full volume.

### Platform

- [ ] **PLAT-01**: User gets the same local-only core companion timer flow on macOS and Windows using Tauri 2 with minimal Rust-owned app logic.

## v2 Requirements

### Shell & Personalization

- **SHELL-01**: User can open a separate settings window while the pet remains in its own overlay window.
- **SHELL-02**: User can customize click-state and finish-state durations.
- **SHELL-03**: User can persist local preferences such as timer duration and audio level between launches.

### Timer Expansion

- **TIME-06**: User can run automatic short-break / long-break cycles.
- **TIME-07**: User can choose from multiple focus presets instead of only direct minute input.

### Pet Depth

- **PET-04**: User sees additional pet behaviors beyond walking/clicking/finished (for example resting or playful reactions).
- **PET-05**: User can interact with the pet through richer gestures such as drag or fling behaviors.

## Out of Scope

| Feature | Reason |
|---------|--------|
| LLM-driven pet conversation | Explicitly excluded from current scope and would require online/backend support |
| Backend or online APIs | Breaks the local-only lightweight goal |
| Login/authentication | No account system is needed for the MVP |
| Cloud sync | Not necessary until local behavior is validated |
| Mobile app | Current product is desktop-only |
| Analytics/reporting system | Not essential to proving the core desktop companion timer loop |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESK-01 | Phase 1 | Pending |
| DESK-02 | Phase 1 | Pending |
| DESK-03 | Phase 1 | Pending |
| PET-01 | Phase 1 | Pending |
| PET-02 | Phase 2 | Pending |
| PET-03 | Phase 2 | Pending |
| AUD-01 | Phase 2 | Pending |
| TIME-01 | Phase 3 | Pending |
| TIME-02 | Phase 3 | Pending |
| TIME-03 | Phase 3 | Pending |
| TIME-04 | Phase 3 | Pending |
| TIME-05 | Phase 3 | Pending |
| AUD-02 | Phase 3 | Pending |
| AUD-03 | Phase 3 | Pending |
| PLAT-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after initial definition*
