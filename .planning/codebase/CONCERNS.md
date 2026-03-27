# Codebase Concerns

**Analysis Date:** 2026-03-27

## Tech Debt

**Single-window UX composition:**
- Issue: The settings/control UI and the walking pet share the same window and lifecycle
- Files: `src/app/ui.ts`, `src/styles/app.css`, `src-tauri/tauri.conf.json`
- Why: Simpler MVP implementation
- Impact: Harder to achieve a true “settings window on top + independent pet on desktop” desktop-pet experience
- Fix approach: Split into dedicated windows or a tray/settings window plus a pet-only overlay window

**No persistence layer:**
- Issue: Timer duration, position preferences, and user settings are memory-only
- Files: `src/app/bootstrap.ts`, `src/features/timer/timer.ts`
- Why: Project scope intentionally avoided backend/storage complexity
- Impact: App restarts lose current preferences and any future customization options
- Fix approach: Add lightweight local persistence via Tauri store or a small config file abstraction

**Manually generated icon asset:**
- Issue: `src-tauri/icons/icon.png` is a generated compatibility file, not clearly sourced from the original art pipeline
- Files: `src-tauri/icons/icon.png`, `public/assets/images/*`
- Why: Tauri requires a valid icon asset at build time
- Impact: Future asset updates can drift from the real pet artwork or fail during packaging if formats change
- Fix approach: Add a repeatable icon-generation step or store canonical source assets explicitly

## Known Bugs

**Image assets may not match their file extensions:**
- Symptoms: Tauri/icon tooling can fail or behave unexpectedly when image tooling expects a real PNG
- Trigger: Reusing `public/assets/images/*.png` as source material for native icon generation or strict image tooling
- Workaround: Convert assets to real RGBA PNGs before native packaging use
- Root cause: At least `public/assets/images/image_1.png` was observed as JPEG data despite the `.png` extension

**Desktop walking silently disables outside Tauri/native context:**
- Symptoms: The pet does not move when the app is rendered in a plain browser context
- Trigger: Running frontend code without Tauri APIs available
- Workaround: Behavior is guarded with `isTauri()` and simply no-ops
- Root cause: `src/features/window-shell/desktop-window.ts` intentionally returns `null` when native APIs are unavailable

## Security Considerations

**Broad enough native window movement permission for the main window:**
- Risk: Frontend code can reposition the desktop window because `core:window:allow-set-position` is granted in `src-tauri/capabilities/default.json`
- Current mitigation: Scope is limited to the single `main` window
- Recommendations: Keep capability surface minimal and document every additional permission added to the frontend

**No integrity checks around local assets:**
- Risk: Missing or malformed audio/image files degrade runtime behavior
- Current mitigation: Image load errors fall back to text in `src/app/ui.ts`; audio failures are caught and warned in `src/features/audio/audio-player.ts`
- Recommendations: Add startup asset validation or a build-time asset check script

## Performance Bottlenecks

**Native window reposition loop:**
- Problem: `DesktopWalker` can issue `setPosition` calls roughly every `32ms`
- Files: `src/features/desktop-walker/desktop-walker.ts`, `src/features/window-shell/desktop-window.ts`
- Measurement: No formal measurement yet
- Cause: Window movement is implemented via interval-driven native calls
- Improvement path: Throttle more aggressively, switch to OS-level animation if needed, and profile on low-power hardware

**Full UI rerender on every timer state update:**
- Problem: The app rerenders the full DOM-backed snapshot view whenever timer/spiky/walker state changes
- Files: `src/app/bootstrap.ts`, `src/app/ui.ts`
- Measurement: Probably acceptable at current scale, but unmeasured
- Cause: Simplicity-first rendering model
- Improvement path: Keep current design for MVP; optimize only if more UI complexity is added

## Fragile Areas

**Bootstrap coordination logic:**
- Why fragile: `src/app/bootstrap.ts` is the single place that coordinates timer completion, pet state, audio, DOM events, and desktop movement
- Common failures: New side effects can accidentally break timer/visual/audio sequencing
- Safe modification: Add tests before changing orchestration rules and keep cross-feature behavior centralized
- Test coverage: None

**Desktop walking behavior:**
- Why fragile: Timing, monitor bounds, and native window APIs interact in one feature with no automated tests
- Common failures: Off-screen movement, jitter, incorrect monitor bounds, platform-specific behavior differences
- Safe modification: Mock `DesktopWindowController` in tests and validate behavior on both macOS and Windows
- Test coverage: None

**DOM template/query coupling:**
- Why fragile: `mountApp()` builds markup via `innerHTML`, then `queryElement()` assumes all selectors exist
- Files: `src/app/ui.ts`
- Common failures: Renaming an ID/class in markup without updating selectors or CSS
- Safe modification: Change markup, selectors, and render logic together
- Test coverage: None

## Scaling Limits

**App scope:**
- Current capacity: Single desktop window, single timer flow, local assets only
- Limit: No support for multiple pets, saved sessions, or richer workflows yet
- Symptoms at limit: Architectural pressure on `bootstrap`, `ui`, and `tauri.conf.json`
- Scaling path: Introduce multiple windows, persistence, and clearer app-shell abstractions only when requirements demand them

## Dependencies at Risk

**Tauri window API usage:**
- Risk: Platform-specific or version-specific behavior differences in window position/monitor APIs
- Impact: Walking behavior may differ across OSes or after Tauri upgrades
- Migration plan: Pin/test Tauri behavior before upgrades and keep window calls isolated in `src/features/window-shell/desktop-window.ts`

**No dedicated test dependency yet:**
- Risk: Regressions are caught only by build checks and manual QA
- Impact: Behavior regressions in timer/audio/window movement can slip through
- Migration plan: Introduce Vitest for unit/integration tests first, then add desktop smoke coverage

## Missing Critical Features

**Automated tests:**
- Problem: No repeatable regression suite exists
- Current workaround: Manual validation with `pnpm build`, `cargo check`, and `pnpm tauri dev`
- Blocks: Safe refactoring of timing, state transitions, and native window behavior
- Implementation complexity: Medium

**True settings-vs-pet window separation:**
- Problem: Current UX does not yet match the “settings window + independent desktop pet” mental model
- Current workaround: A combined control dock and pet stage live in one window
- Blocks: Cleaner desktop-pet feel and more flexible overlay behavior
- Implementation complexity: Medium to High

## Test Coverage Gaps

**Timer domain logic:**
- What's not tested: Start/pause/resume/reset/finish transitions in `src/features/timer/timer.ts`
- Risk: Timing regressions and invalid transition bugs
- Priority: High
- Difficulty to test: Low to Medium

**Desktop walker:**
- What's not tested: Random target selection, rest timing, and native position stepping
- Risk: Flaky movement or platform-specific breakage
- Priority: High
- Difficulty to test: Medium

**Bootstrap side effects:**
- What's not tested: Coupling between timer finish, visual state changes, and audio playback in `src/app/bootstrap.ts`
- Risk: Regressions in visible app behavior
- Priority: High
- Difficulty to test: Medium

---

*Concerns audit: 2026-03-27*
*Update as issues are fixed or new ones discovered*
