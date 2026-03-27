# Architecture Research

**Domain:** desktop pet pomodoro timer
**Researched:** 2026-03-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Native Desktop Shell                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Window cfg  │  │ Permissions │  │ Packaging   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │
├─────────┴────────────────┴────────────────┴────────────────┤
│                 Frontend Orchestration Layer               │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ bootstrap.ts wires timer, pet state, audio, walker   │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     Feature Controller Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Timer    │  │ Pet      │  │ Audio    │  │ Walker   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│                   Presentation + Assets Layer              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ UI DOM   │  │ CSS      │  │ PNG/MP3  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Native shell | Create the transparent overlay window and expose safe window APIs | Tauri config + minimal Rust entry point |
| Bootstrap coordinator | Connect independent feature controllers and bind DOM events | One imperative startup module |
| Timer controller | Own the Pomodoro session state machine | Class with snapshot + interval loop |
| Pet state controller | Own `default` / `clicked` / `timer_finished` visual state transitions | Small state controller with timeouts |
| Desktop walker | Convert desktop bounds into randomized left/right motion | Feature module wrapping native window position APIs |
| UI renderer | Translate snapshots into DOM state and CSS hooks | `mountApp` + `renderApp` functions |

## Recommended Project Structure

```text
src/
├── app/                # frontend entry, bootstrap, DOM rendering
│   ├── main.ts         # root entry
│   ├── bootstrap.ts    # controller wiring
│   └── ui.ts           # DOM template + render
├── features/           # behavior by concern
│   ├── timer/          # pomodoro logic
│   ├── spiky-state/    # visual state machine
│   ├── audio/          # sound playback
│   ├── desktop-walker/ # walking behavior
│   └── window-shell/   # Tauri window bridge
├── shared/             # manifests, constants, shared types
└── styles/             # global CSS
```

### Structure Rationale

- **`app/`:** Keeps orchestration and rendering distinct from feature logic.
- **`features/`:** Matches the product rule to separate timer, pet, audio, and shell concerns.
- **`shared/`:** Centralizes asset paths and state primitives so features do not hardcode each other's details.
- **`src-tauri/`:** Holds only native shell responsibilities, keeping Rust minimal.

## Architectural Patterns

### Pattern 1: Snapshot Controller per Concern

**What:** Each concern owns a private snapshot and exposes `getSnapshot()` + `subscribe()`.
**When to use:** Use for timer state, pet state, and walking state in a lightweight app.
**Trade-offs:** Very explicit and easy to debug, but less scalable than a unified state library if the app becomes much larger.

**Example:**
```typescript
class PomodoroTimer {
  private snapshot;
  private listeners = new Set();
}
```

### Pattern 2: Single Bootstrap Coordinator

**What:** Cross-feature effects live in one place instead of spreading across modules.
**When to use:** Use when timer completion must trigger pet visuals and audio together.
**Trade-offs:** Clear dependency graph for MVP, but it can become crowded if too many behaviors accumulate.

**Example:**
```typescript
timer.subscribe((snapshot) => {
  if (snapshot.status === "finished") {
    spikyState.showTimerFinished();
    void audioPlayer.play("timerFinished");
  }
});
```

### Pattern 3: Native Adapter Boundary

**What:** Wrap Tauri window calls behind a small frontend adapter.
**When to use:** Use for monitor bounds, native position reads, and window movement.
**Trade-offs:** Keeps native API usage isolated, but introduces an extra module even for simple calls.

## Data Flow

### Request Flow

```text
[User click / timer action]
    ↓
[UI event handler]
    ↓
[Feature controller mutation]
    ↓
[Snapshot emit]
    ↓
[renderApp]
    ↓
[DOM + CSS update]

[Timer finished]
    ↓
[bootstrap side effects]
    ↓
[Pet finished state + completion sound]
```

### State Management

```text
[Feature snapshot]
    ↓ subscribe
[bootstrap render()]
    ↓
[UI data-* attributes and text]
    ↔
[User input events]
```

### Key Data Flows

1. **Walking loop:** Desktop walker reads monitor bounds, picks a target X, and issues native window position updates.
2. **Interaction loop:** UI click invokes pet state change, optional walking reaction, and click sound.
3. **Timer completion loop:** Timer status transition drives visual completion state and completion audio cue.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| MVP / single pet | Current monolithic frontend + small feature controllers is ideal |
| More settings / persistence | Add a local store adapter and maybe a dedicated settings window |
| Richer pet behaviors | Introduce a higher-level behavior scheduler instead of hardcoding each animation path |

### Scaling Priorities

1. **First bottleneck:** Too much orchestration in `bootstrap.ts` — split into coordination helpers if more behaviors are added.
2. **Second bottleneck:** Window-movement edge cases across OSes — isolate more platform quirks behind the window-shell adapter.

## Anti-Patterns

### Anti-Pattern 1: Mixing Timer Rules into UI Rendering

**What people do:** Put finish-state rules and timer transitions directly inside DOM event handlers or render functions.
**Why it's wrong:** UI becomes the owner of business logic, making state transitions fragile.
**Do this instead:** Keep timer rules in the timer controller and orchestrate cross-feature effects in bootstrap.

### Anti-Pattern 2: Letting Rust Own MVP App Logic

**What people do:** Move timer, animation, and UI state logic into Rust too early.
**Why it's wrong:** Slows iteration and fights the project's "minimal Rust" constraint.
**Do this instead:** Keep Rust as the shell and only move logic native-side if a real platform limitation appears.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Tauri window APIs | Frontend adapter via `@tauri-apps/api/window` | Required for positioning and monitor queries |
| Browser audio | Native `Audio` objects | Fine for two simple sound cues |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `timer` ↔ `bootstrap` | Snapshot subscription | Timer does not directly know about visuals or sound |
| `spiky-state` ↔ `ui` | Snapshot rendering | UI only consumes visual state |
| `desktop-walker` ↔ `window-shell` | Direct adapter calls | Keeps native API usage isolated |
| `shared/assets` ↔ all consumers | Direct imports | Single source of truth for asset paths |

## Sources

- `AGENTS.md`
- `docs/architecture-rules.md`
- `.planning/codebase/ARCHITECTURE.md`
- Tauri window customization docs — https://v2.tauri.app/learn/window-customization/
- Tauri window namespace docs — https://v2.tauri.app/ko/reference/javascript/api/namespacewindow/

---
*Architecture research for: desktop pet pomodoro timer*
*Researched: 2026-03-27*
