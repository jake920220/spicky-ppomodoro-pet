# Spiky

## What This Is

Spiky is a lightweight desktop pet timer for macOS and Windows. It lives on top of the desktop as a small transparent companion, uses prepared PNG and MP3 assets for its states, and gives the user a playful Pomodoro flow instead of a heavy productivity dashboard. The current vision is a compact top control dock plus a pet that walks, reacts to clicks immediately, and announces focus-session completion clearly.

## Core Value

Spiky must feel like a small desktop companion that makes focus sessions visible and playful without getting in the user's way.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Deliver a transparent desktop overlay pet for macOS and Windows using Tauri 2.
- [ ] Make the pet feel alive through random walking, immediate click reactions, and distinct default/clicked/finished visual states.
- [ ] Keep the Pomodoro loop small and clear: duration input, start/pause/reset, and a strong completion alert.
- [ ] Keep the app local-only, lightweight, and driven primarily from the frontend with minimal Rust.

### Out of Scope

- LLM integration — explicitly excluded from the current product direction.
- Online API or backend services — the app should work locally without server dependencies.
- Login/authentication and cloud sync — unnecessary for the MVP companion-timer loop.
- Mobile support — current product is desktop-only.
- Analytics/reporting stack — not core to validating the desktop pet timer concept.
- Rich physics, drag/fling gimmicks, or complex gamification — defer until the core companion feel is stable.

## Context

The project already has a working early codebase and a generated codebase map under `.planning/codebase/`, but the product is still effectively in MVP definition mode rather than validated production use. The core product assets are fixed for now: three pet images (`image_1`, `image_2`, `image_3`) and two sound cues (click and timer-finished). Recent clarification from the user tightened the desired feel: the control surface should stay at the top, browser-style scrollbars should never show, the pet should move like a tamagotchi-style desktop companion, and default sound output should be conservative rather than loud.

The strongest design pressure is not technical novelty but product restraint. The app should remain light, simple, and local. That means keeping behavior split across window shell, timer logic, pet state, audio, and assets instead of growing a generalized app platform too early.

## Constraints

- **Tech stack**: Tauri 2 + Vanilla TypeScript + pnpm — explicitly chosen in `idea.md` and existing repo setup.
- **Platform**: macOS and Windows only — mobile and web distribution are not goals.
- **Assets**: Must use the prepared PNG 3장 and MP3 2개 — v1 should not introduce dynamic asset systems.
- **Architecture**: Keep Rust minimal — frontend should own the main interaction logic unless a true native need appears.
- **Product scope**: Local-only and lightweight — no backend, sync, analytics, or auth.
- **UX**: Click feedback must be immediate, completion feedback must be both visual and audio, and the UI must stay compact and unobtrusive.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Tauri 2 with Vanilla TypeScript for v1 | Matches the lightweight desktop-only goal while keeping iteration fast | — Pending |
| Keep the MVP local-only | Avoids backend/auth/cloud scope creep and preserves simplicity | — Pending |
| Treat the pet/timer loop as the whole product | The companion feel is the core differentiator; advanced productivity features can wait | — Pending |
| Keep timer, pet state, audio, assets, and window shell as separate concerns | Reduces coupling and follows the project's architecture rules | — Pending |
| Default sound cues to a conservative volume | The app should feel ambient, not intrusive | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after initialization*
