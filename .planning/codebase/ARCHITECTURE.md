# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Tauri desktop shell with a single-window vanilla TypeScript frontend and in-memory feature controllers

**Key Characteristics:**
- Thin Rust layer that boots the Tauri app and delegates almost all behavior to the frontend
- Feature-oriented frontend modules under `src/features/`
- In-memory state managed by small controller classes with subscription callbacks
- Event-driven UI refresh from a single bootstrap orchestrator in `src/app/bootstrap.ts`
- No backend, no persistence, no networked services

## Layers

**Native Shell Layer:**
- Purpose: Start the desktop app and declare native capabilities/window behavior
- Contains: Tauri config, Rust entry points, capability definitions
- Location: `src-tauri/`
- Depends on: Tauri runtime only
- Used by: Entire desktop app lifecycle

**Bootstrap/Orchestration Layer:**
- Purpose: Instantiate controllers, wire events together, and coordinate cross-feature side effects
- Contains: App startup, subscriptions, button handlers, image fallback wiring
- Location: `src/app/bootstrap.ts`, `src/app/main.ts`
- Depends on: All feature controllers plus UI rendering helpers
- Used by: Frontend entry point

**Presentation Layer:**
- Purpose: Build DOM markup and translate snapshots into visible UI state
- Contains: `mountApp`, `renderApp`, CSS-driven visual states
- Location: `src/app/ui.ts`, `src/styles/app.css`, `index.html`
- Depends on: Shared state types and asset manifest
- Used by: Bootstrap layer

**Feature/Domain Layer:**
- Purpose: Hold independent behavior for timer, pet visual state, audio playback, and desktop walking
- Contains: `PomodoroTimer`, `SpikyStateController`, `AudioPlayer`, `DesktopWalker`, `DesktopWindowController`
- Location: `src/features/**/*`
- Depends on: Browser APIs and Tauri frontend APIs as needed
- Used by: Bootstrap layer

**Shared Definitions Layer:**
- Purpose: Centralize asset paths, primitive types, and preset constants
- Contains: String unions, manifests, duration bounds
- Location: `src/shared/**/*`
- Depends on: No feature modules
- Used by: UI and feature modules

## Data Flow

**App Startup:**

1. `index.html` loads `src/app/main.ts`
2. `src/app/main.ts` imports global styles and calls `bootstrap(root)`
3. `bootstrap` constructs `PomodoroTimer`, `SpikyStateController`, `DesktopWalker`, and `AudioPlayer`
4. `mountApp` writes the DOM structure into `#app`
5. Feature subscriptions call `renderApp` whenever snapshots change
6. `DesktopWalker.start()` resolves native monitor bounds and begins window movement scheduling

**Timer Interaction Flow:**

1. User updates minutes or presses timer controls in the control dock
2. `bootstrap` forwards the event to `PomodoroTimer`
3. `PomodoroTimer` mutates its internal snapshot and emits to listeners
4. If status transitions to `finished`, `bootstrap` triggers `SpikyStateController.showTimerFinished()` and `AudioPlayer.play("timerFinished")`
5. `renderApp` updates labels, button states, and the displayed pet image

**Pet Click Flow:**

1. User clicks the pet button in `src/app/ui.ts`
2. `bootstrap` calls `SpikyStateController.triggerClick()`
3. If interaction is allowed, `DesktopWalker.reactToInteraction()` flips facing/rest timing
4. `AudioPlayer.play("click")` restarts the click sound
5. UI rerenders based on updated visual and walking snapshots

**Desktop Walking Flow:**

1. `DesktopWalker` asks `DesktopWindowController` for monitor work area and current window position
2. It chooses a random X target within the allowed desktop range
3. A `setInterval` loop advances the window position every `32ms`
4. When the target is reached, it pauses for a randomized rest duration and repeats

**State Management:**
- All state is ephemeral and kept in memory inside controller instances
- Controllers expose `getSnapshot()` and `subscribe()` rather than shared stores
- DOM is rerendered from current snapshots instead of diffing component trees

## Key Abstractions

**Snapshot Controllers:**
- Purpose: Encapsulate feature state and mutation rules
- Examples: `PomodoroTimer`, `SpikyStateController`, `DesktopWalker`
- Pattern: Mutable class with private snapshot + listener set

**Manifest Tables:**
- Purpose: Centralize mapping from semantic states/cues to asset paths
- Examples: `IMAGE_ASSET_BY_STATE`, `AUDIO_ASSET_BY_CUE` in `src/shared/assets/manifest.ts`
- Pattern: Immutable record lookup

**Bootstrap Coordinator:**
- Purpose: Keep cross-feature coupling in one place rather than embedding it in UI or timer logic
- Examples: Completion triggers in `src/app/bootstrap.ts`
- Pattern: Imperative wiring/orchestrator

## Entry Points

**Frontend Entry Point:**
- Location: `src/app/main.ts`
- Triggers: Webview loading `index.html`
- Responsibilities: Import styles, locate `#app`, start bootstrap

**Frontend Bootstrap:**
- Location: `src/app/bootstrap.ts`
- Triggers: Called from `src/app/main.ts`
- Responsibilities: Instantiate modules, bind DOM events, kick off walking, coordinate side effects

**Native Entry Point:**
- Location: `src-tauri/src/main.rs`
- Triggers: Desktop app launch
- Responsibilities: Delegate into library entry for Tauri startup

**Tauri Builder Entry:**
- Location: `src-tauri/src/lib.rs`
- Triggers: Called by `src-tauri/src/main.rs`
- Responsibilities: Build and run Tauri with generated context

## Error Handling

**Strategy:** Fail fast on missing required DOM elements or fatal Tauri startup issues; degrade gracefully for recoverable runtime behavior.

**Patterns:**
- `src/app/main.ts` throws if `#app` is missing
- `src/app/ui.ts` throws if required selectors are missing after `mountApp`
- `src-tauri/src/lib.rs` calls `.expect(...)` on Tauri startup failure
- `src/features/audio/audio-player.ts` catches playback failures and logs warnings
- `src/app/bootstrap.ts` catches desktop walker startup failures and logs warnings
- Invalid timer transitions typically return `false` instead of throwing

## Cross-Cutting Concerns

**Asset Routing:**
- Image/audio paths are centralized in `src/shared/assets/manifest.ts`
- UI chooses the correct pet image from semantic state rather than hardcoding paths

**Window Permissions:**
- Native window operations rely on `src-tauri/capabilities/default.json`
- Desktop movement is isolated behind `DesktopWindowController`

**Project Rules:**
- Product and architecture constraints are documented in `AGENTS.md`, `docs/product-rules.md`, and `docs/architecture-rules.md`
- Current code structure generally follows those rules: timer, visual state, audio, and window motion are separate modules

---

*Architecture analysis: 2026-03-27*
*Update when major patterns change*
