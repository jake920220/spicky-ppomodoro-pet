# Project Research Summary

**Project:** Spiky Ppomodoro pet
**Domain:** desktop pet pomodoro timer
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

Spiky Ppomodoro pet sits at the intersection of two lightweight desktop product patterns: a local Pomodoro timer and a playful desktop pet overlay. The research strongly supports a small-scope Tauri 2 application with a transparent always-on-top window, a compact control dock, and a frontend-led behavior model that keeps timer logic, pet state, audio, and native window control separate.

The recommended approach is to treat the "desktop companion that helps you focus" loop as the entire MVP. That means one visible pet, immediate click response, bounded left/right movement, a basic Pomodoro session flow, and a clear completion alert with conservative audio defaults. This aligns with the project's explicit exclusions around backend, cloud sync, mobile support, analytics, and LLM integration.

The main risks are not stack selection but execution drift: off-screen movement, fragile asset handling, and feature creep from timer-app conventions. The roadmap should therefore front-load overlay shell correctness, pet behavior reliability, and timer feedback before any richer settings or gamification work.

## Key Findings

### Recommended Stack

The current repo is already on the right foundation: Tauri 2, TypeScript 5, Vite 7, and pnpm. For this product shape, that stack is preferable to heavier alternatives because it supports transparent/always-on-top desktop behavior while keeping the shell small and Rust minimal.

**Core technologies:**
- **Tauri 2:** desktop shell and native window control — best fit for a lightweight overlay app
- **Vanilla TypeScript:** frontend behavior and orchestration — enough for a small stateful pet/timer UI
- **Vite 7:** bundling and local development — simple and already wired into the repo

### Expected Features

The MVP should not chase the full feature set of larger Pomodoro tools. Users mainly expect a stable focus timer, clear finish feedback, and a pet that visibly feels alive.

**Must have (table stakes):**
- Transparent always-on-top overlay pet
- Default idle state, bounded walking, and immediate click reaction
- Start/pause/reset focus timer with visible remaining time
- Finish-state visual + audio alert
- Small control dock with no visible scrollbars

**Should have (competitive):**
- Tamagotchi-like personality through cadence and movement timing
- A control dock that feels ambient rather than like a standard settings window

**Defer (v2+):**
- Separate settings window
- Richer pet behaviors or drag/fling physics
- Reports, sync, analytics, or online integrations

### Architecture Approach

The strongest pattern for this app is a thin Tauri shell plus a frontend coordinator that wires together small controller modules. The major components are a native shell, a bootstrap/orchestration layer, feature controllers for timer/pet/audio/walking, and a small DOM/CSS presentation layer.

**Major components:**
1. **Native shell** — creates the transparent overlay and exposes window APIs
2. **Feature controllers** — own timer, pet, audio, and walking state separately
3. **Bootstrap + UI** — bind user actions, map snapshots to DOM, and coordinate side effects

### Critical Pitfalls

1. **Off-screen movement** — avoid by clamping to monitor work area and window size
2. **Feature coupling** — keep timer, visuals, audio, and shell behavior isolated behind modules
3. **Invalid assets** — validate image/audio formats early and make icon generation repeatable
4. **Lifeless pet feel** — prioritize immediate click response and randomized walking cadence
5. **Premature timer feature creep** — keep the MVP focused on the local companion-timer loop

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Overlay Shell Foundation
**Rationale:** The pet cannot feel native until the transparent overlay shell, control dock, and default asset loading are correct.
**Delivers:** Window configuration, top control dock, no-scroll shell, default pet presence
**Addresses:** Desktop shell must-haves
**Avoids:** Asset-format and native-window setup pitfalls

### Phase 2: Pet Motion & Click Personality
**Rationale:** Walking and immediate click feedback are what make the app read as a companion instead of a timer widget.
**Delivers:** Random bounded walking, facing logic, click state, click sound
**Uses:** Tauri window APIs and lightweight frontend animation patterns
**Implements:** Desktop walker + pet state controllers

### Phase 3: Pomodoro Feedback Loop
**Rationale:** Once the pet feels alive, tie it to the focus session loop with clear start/pause/reset and finished-state feedback.
**Delivers:** Timer controls, readout, finished state, completion sound, dismiss/reset loop
**Implements:** Timer controller + timer-driven orchestration

### Phase 4: Cross-Platform Hardening
**Rationale:** The MVP promise is desktop reliability on macOS and Windows, not just a local demo.
**Delivers:** Cross-platform validation, packaging confidence, asset/runtime hardening

### Phase Ordering Rationale

- Native shell and asset correctness must come before walking behavior.
- Walking behavior should come before richer timer polish so the pet's personality is established early.
- Timer completion feedback depends on both the timer controller and pet/audio modules already existing.
- Cross-platform hardening comes last because it validates the assembled experience.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Native window customization nuances on both macOS and Windows
- **Phase 4:** Packaging, signing, and cross-platform QA expectations

Phases with standard patterns (skip research-phase if desired):
- **Phase 2:** Small desktop-pet movement/state loops are straightforward once the window shell is working
- **Phase 3:** Basic Pomodoro state machines are well understood

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Matches both the user's explicit constraints and official Tauri capability surface |
| Features | HIGH | Current requirements are narrow and clearly scoped |
| Architecture | HIGH | Existing codebase already follows the recommended separation pattern |
| Pitfalls | HIGH | Main risks are concrete and already visible in similar desktop overlay projects |

**Overall confidence:** HIGH

### Gaps to Address

- Decide whether a single overlay window remains acceptable for v1 or whether a separate settings window must move earlier
- Validate transparent-window and always-on-top behavior on actual Windows hardware
- Add automated tests later for timer/walking/orchestration regressions

## Sources

### Primary (HIGH confidence)
- `idea.md`
- `AGENTS.md`
- `docs/product-rules.md`
- `docs/architecture-rules.md`
- Tauri Window Customization docs — https://v2.tauri.app/learn/window-customization/
- Tauri JavaScript Window API docs — https://v2.tauri.app/ko/reference/javascript/api/namespacewindow/

### Secondary (MEDIUM confidence)
- Pomofocus product page — https://www.pomofocus.io/
- Todoist Pomodoro technique guide — https://www.todoist.com/tr/productivity-methods/pomodoro-technique
- Desktop pet examples:
  - https://github.com/90shree/desktop-pet-kirby
  - https://github.com/ExtraNick/Chatty_desktop_pet

### Tertiary (LOW confidence)
- None

---
*Research completed: 2026-03-27*
*Ready for roadmap: yes*
