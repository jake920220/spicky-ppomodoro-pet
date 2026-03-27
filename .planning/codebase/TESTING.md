# Testing Patterns

**Analysis Date:** 2026-03-27

## Test Framework

**Runner:**
- No automated test runner is configured yet
- No `vitest`, `jest`, `playwright`, or Rust test harness usage is declared in project scripts

**Assertion Library:**
- None configured

**Run Commands:**
```bash
pnpm build          # Frontend type-check + production bundle validation
cargo check         # Rust/Tauri compile validation from src-tauri/
pnpm tauri dev      # Manual runtime verification in the desktop app
```

## Test File Organization

**Location:**
- No `tests/`, `__tests__/`, or `*.test.*` files found

**Naming:**
- No naming convention established yet

**Structure:**
```text
Current state:
- No automated test files present
- Validation is manual and build-oriented
```

## Test Structure

**Suite Organization:**
- Not established

**Patterns:**
- Current workflow appears to rely on:
  - `pnpm build` for frontend regressions
  - `cargo check` for native-shell regressions
  - Manual desktop verification for behavior like window movement, click states, and audio playback

## Mocking

**Framework:**
- None configured

**Patterns:**
- Not established

**What to Mock (recommended when tests are added):**
- Tauri window APIs used by `src/features/window-shell/desktop-window.ts`
- Browser timers used by `src/features/timer/timer.ts` and `src/features/desktop-walker/desktop-walker.ts`
- `Audio` playback in `src/features/audio/audio-player.ts`

**What NOT to Mock (recommended):**
- Pure snapshot helpers in `src/features/timer/timer-state.ts`
- Simple manifest lookup logic in `src/shared/assets/manifest.ts`

## Fixtures and Factories

**Test Data:**
- No fixture or factory pattern exists yet

**Suggested future candidates:**
- Timer snapshot factories for `TimerSnapshot`
- Walker bounds factories for `DesktopWalkBounds`
- Synthetic DOM fixtures for `src/app/ui.ts`

## Coverage

**Requirements:**
- No coverage targets configured
- No CI gate enforces test or coverage thresholds

**Configuration:**
- None

**View Coverage:**
```bash
# Not available yet
```

## Test Types

**Unit Tests (recommended additions):**
- `src/features/timer/timer-state.ts` - minute sanitization and remaining-time math
- `src/features/spiky-state/spiky-state.ts` - click and finished-state transitions
- `src/features/audio/audio-player.ts` - replay/stop semantics with mocked `Audio`

**Integration Tests (recommended additions):**
- `src/app/bootstrap.ts` - timer finish triggers visual + audio side effects
- `src/app/ui.ts` - render behavior for timer/walker/spiky snapshot combinations
- `src/features/desktop-walker/desktop-walker.ts` with mocked `DesktopWindowController`

**E2E Tests (recommended additions):**
- Desktop interaction flows using Tauri-compatible smoke tests or Playwright/webview automation
- Manual QA is currently the only substitute

## Common Patterns

**Current Manual QA Pattern:**
- Start the app with `pnpm tauri dev`
- Verify timer start/pause/reset
- Verify image swaps for `default`, `clicked`, and `timer_finished`
- Verify sound playback and volume
- Verify desktop walking behavior and window positioning on supported OS targets

**Highest-Risk Untested Areas:**
- Native window movement behavior across macOS and Windows
- Timer/walker/audio coordination in `src/app/bootstrap.ts`
- Asset validity mismatches between expected and actual image file formats

---

*Testing analysis: 2026-03-27*
*Update when test patterns change*
