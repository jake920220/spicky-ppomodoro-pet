# Stack Research

**Domain:** desktop pet pomodoro timer
**Researched:** 2026-03-27
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tauri | 2.x | Desktop shell, packaging, native window control | Matches the project's lightweight desktop-only requirement and provides transparent/always-on-top window control without shipping a full Chromium/Electron-sized shell. |
| TypeScript | 5.x | Frontend application logic | Keeps the UI and timer logic explicit and type-safe while staying close to the current codebase. |
| Vite | 7.x | Frontend bundling and dev server | Simple, fast, and already aligned with the current Tauri frontend setup. |
| CSS animations + DOM APIs | Current browser runtime | Lightweight motion, idle bobbing, and state-based UI changes | Good fit for a small desktop pet where heavyweight rendering libraries would add complexity without clear value. |
| `@tauri-apps/api/window` | 2.x | Monitor lookup and native window positioning | Necessary for desktop-pet walking behavior, monitor bounds checks, and top-level overlay control. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tauri-apps/api/core` | 2.x | Runtime capability checks like `isTauri()` | Use whenever frontend behavior should degrade safely in browser-only contexts. |
| Native `Audio` API | Webview built-in | Click and completion sound playback | Use for MVP sound cues before considering any audio abstraction or library. |
| `@tauri-apps/plugin-store` | 2.x optional | Local persistence for settings or saved durations | Only add if v1.1+ requires remembered preferences. |
| Image conversion/build tooling | Optional | Repeatable native icon generation | Use if asset validation and icon generation need to become part of the build. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `pnpm` | Package management | Already chosen in `idea.md`; lockfile is present. |
| Cargo | Rust compile/build tooling | Needed for `cargo check`, `tauri dev`, and packaged desktop builds. |
| `tsc` | Type checking | Keep strict mode enabled to catch orchestration regressions early. |
| Manual desktop QA | Runtime validation | Needed for window movement, transparency, and cross-platform behavior that static checks cannot prove. |

## Installation

```bash
# Core
pnpm install

# Desktop shell
cd src-tauri && cargo check

# Run app
pnpm tauri dev
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Tauri 2 | Electron | Use Electron only if the app later needs Node-heavy desktop integrations that Tauri cannot cover easily. |
| Vanilla TypeScript | React/Vue/Svelte | Use a framework only if the control surface becomes significantly more stateful or multi-window UI complexity grows. |
| CSS + timer-driven motion | Canvas/game-engine stack | Use a game-oriented renderer only if the pet evolves into high-frame-rate physics, particle effects, or complex sprite systems. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Electron for v1 | Conflicts with the project's "light and simple" constraint | Tauri 2 |
| Heavy frontend state libraries | Adds ceremony to a small DOM-driven overlay app | Small controller classes with snapshots |
| Backend or online API integration | Explicitly out of scope and unnecessary for the MVP | Local-only app logic |
| Complex physics/scene frameworks in v1 | Distracts from core desktop pet timer loop and raises cross-platform risk | Simple bounded motion with window APIs and CSS motion |

## Stack Patterns by Variant

**If keeping a single MVP window:**
- Use one transparent Tauri window with a compact top control dock and pet stage.
- Because it minimizes shell complexity and keeps the Rust layer tiny.

**If later separating settings and pet:**
- Use Tauri multiwindow with a small settings window plus a pet-only overlay window.
- Because it matches the "desktop pet + settings" mental model more closely once v1 behavior is stable.

**If adding local persistence later:**
- Use a local Tauri store or config file only.
- Because the project explicitly excludes backend/cloud sync.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `tauri` 2.x | `tauri-build` 2.x | Native shell and build tooling should stay on the same major version. |
| `@tauri-apps/api` 2.x | `@tauri-apps/cli` 2.x | Frontend API layer should track the Tauri 2 toolchain. |
| TypeScript 5.x | Vite 7.x | Current repo already uses this pairing successfully. |

## Sources

- `idea.md` — product intent and explicit stack constraints
- `AGENTS.md` — current scope, architecture rules, exclusions
- `docs/product-rules.md` — product boundaries and desktop-only focus
- `docs/architecture-rules.md` — separation-of-concerns rules
- Tauri Window Customization docs — https://v2.tauri.app/learn/window-customization/
- Tauri JavaScript Window API docs — https://v2.tauri.app/ko/reference/javascript/api/namespacewindow/

---
*Stack research for: desktop pet pomodoro timer*
*Researched: 2026-03-27*
