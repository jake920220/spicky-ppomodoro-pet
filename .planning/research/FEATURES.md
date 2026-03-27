# Feature Research

**Domain:** desktop pet pomodoro timer
**Researched:** 2026-03-27
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Transparent always-on-top overlay pet | Desktop pet apps are expected to feel like part of the desktop rather than a normal app window | MEDIUM | Requires careful Tauri window config and cross-platform QA. |
| Visible idle/walk loop | A desktop pet that does not move or feel alive reads like a static widget | MEDIUM | Random lateral walking and subtle idle motion are enough for MVP. |
| Immediate click response | Users expect the pet to react instantly when clicked | LOW | State swap + audio cue are sufficient for v1. |
| Basic Pomodoro controls | Focus timer apps need start, pause/resume, reset, and visible remaining time | MEDIUM | Use a simple in-memory timer loop first. |
| Completion alert with sound + visual change | Timer products are expected to clearly announce session completion | LOW | Image swap and single audio cue meet the need. |
| Small, unobtrusive controls | A desktop companion should stay visible without taking over the screen | LOW | Fits the user's "small and simple" UI rule. |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tamagotchi-like personality in movement | Makes the timer feel companion-like instead of purely utilitarian | MEDIUM | The user's stated goal is explicitly closer to a tamagotchi feel. |
| Top control dock paired with a walking pet | Blends "quick timer" and "desktop companion" without a full settings window | MEDIUM | Strong fit for the current vision. |
| Separate settings window + pet-only overlay | Closer to polished desktop-pet UX once the core loop is stable | HIGH | Good v1.1/v2 candidate if the single-window MVP feels cramped. |
| More pet behaviors beyond walking/clicking | Builds delight and retention | HIGH | Add only after core timer flow is stable. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| LLM/chat pet behavior | Sounds fun and modern | Directly out of scope and adds backend/API cost and reliability issues | Keep the pet expressive through motion, states, and sound only |
| Cloud sync/accounts | Feels like "more complete" productivity software | Not needed for a desktop local timer and breaks the lightweight/offline goal | Local-only preferences if needed later |
| Complex drag/fling physics in v1 | Desktop pets often have throw/gravity gimmicks | Adds substantial state/physics complexity before the timer loop is reliable | Start with bounded walking and immediate click feedback |
| Heavy analytics/reporting | Common in productivity tools | Not core to the companion-timer value and explicitly excluded | Defer until the basic pet-timer loop proves useful |

## Feature Dependencies

```text
[Transparent overlay shell]
    └──requires──> [Tauri window config]
                       └──enables──> [Walking pet]
                       └──enables──> [Top control dock]

[Pomodoro timer]
    └──drives──> [Finished visual state]
    └──drives──> [Completion sound]

[Click interaction]
    └──enhances──> [Pet personality]
    └──requires──> [Immediate asset swap + sound cue]

[Separate settings window]
    └──builds on──> [Stable pet-only overlay]
```

### Dependency Notes

- **Walking pet requires desktop shell control:** Without transparent window bounds and native position control, the pet cannot convincingly patrol the desktop.
- **Finished state depends on timer engine:** `image_3` and MP3 2 should be driven from the timer domain, not hardcoded from UI clicks.
- **Top control dock depends on unobtrusive layout:** Timer controls must stay small and visible without introducing scrollbars.
- **Separate settings window should wait:** It is a structural enhancement, not a prerequisite for validating the MVP.

## MVP Definition

### Launch With (v1)

- [ ] Transparent always-on-top desktop overlay
- [ ] Default idle state using `image_1`
- [ ] Random bounded horizontal walking
- [ ] Immediate click response using `image_2` and MP3 1
- [ ] Simple Pomodoro duration input + start/pause/reset
- [ ] Timer completion alert using `image_3` and MP3 2
- [ ] Compact top control dock with no visible scrollbars
- [ ] Local-only behavior on macOS and Windows

### Add After Validation (v1.x)

- [ ] Separate settings window if the single-window control dock feels cramped
- [ ] Custom click-state / finish-state duration controls
- [ ] Break presets or automatic long-break cycle
- [ ] Remembered local settings such as last timer length or volume

### Future Consideration (v2+)

- [ ] Additional pet behaviors (sleeping, reactions, drag/fling)
- [ ] Richer stats/history
- [ ] Theme/skin customization

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Transparent overlay shell | HIGH | MEDIUM | P1 |
| Random bounded walking | HIGH | MEDIUM | P1 |
| Immediate click interaction | HIGH | LOW | P1 |
| Pomodoro timer controls | HIGH | MEDIUM | P1 |
| Completion alert + sound | HIGH | LOW | P1 |
| Separate settings window | MEDIUM | HIGH | P2 |
| Custom durations for pet states | MEDIUM | LOW | P2 |
| Advanced pet behaviors | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Pomodoro core loop | Pomofocus emphasizes customizable focus/break timers and alarm settings | Todoist's Pomodoro guidance emphasizes 25/5 cycles and longer breaks after four rounds | Keep a lightweight local Pomodoro flow first; long-break automation can wait |
| Desktop pet motion | `desktop-pet-kirby` uses idle + random movement around the screen | `Chatty_desktop_pet` emphasizes taskbar walking and click/pet interactions | Start with bounded left/right patrol and immediate click response, not physics-heavy behavior |
| Control surface | Most pomodoro tools expose a full app UI | Desktop pets often minimize visible controls to stay ambient | Use a compact top control dock paired with a visible pet |

## Sources

- `idea.md`
- `AGENTS.md`
- `docs/product-rules.md`
- Pomofocus product page — https://www.pomofocus.io/
- Todoist Pomodoro technique guide — https://www.todoist.com/tr/productivity-methods/pomodoro-technique
- GitHub desktop pet examples:
  - https://github.com/90shree/desktop-pet-kirby
  - https://github.com/ExtraNick/Chatty_desktop_pet

---
*Feature research for: desktop pet pomodoro timer*
*Researched: 2026-03-27*
