# Coding Conventions

**Analysis Date:** 2026-03-27

## Naming Patterns

**Files:**
- Lower-case file names dominate the codebase
- `kebab-case` is the default pattern for feature modules such as `audio-player.ts`, `spiky-state.ts`, `desktop-walker.ts`, `desktop-window.ts`
- Special short names are used for app entry/render files: `main.ts`, `bootstrap.ts`, `ui.ts`
- No test file naming pattern is established yet because there are no tests

**Functions:**
- `camelCase` for functions and methods, for example `bootstrap`, `renderApp`, `setDurationMinutes`, `showTimerFinished`
- Event handlers often follow action-oriented names like `handleTick` or inline anonymous callbacks
- Async functions do not use an `Async` suffix

**Variables:**
- `camelCase` for local variables and instance fields
- `UPPER_SNAKE_CASE` for module-level constants such as `CLICK_STATE_DURATION_MS`, `DEFAULT_AUDIO_VOLUME`, `WALK_SPEED_PX_PER_SECOND`
- Private class members do not use `_` prefixes; privacy is expressed with `private`

**Types:**
- `PascalCase` for interfaces, classes, and type aliases such as `TimerSnapshot`, `DesktopWalkerSnapshot`, `PomodoroTimer`
- String union values are lowercase or snake-style literals, e.g. `"timer_finished"`, `"running"`, `"left"`

## Code Style

**Formatting:**
- Two-space indentation
- Double quotes for strings
- Semicolons are required
- Trailing commas are used sparingly; multiline objects/arrays often omit the final trailing comma
- Line width is moderate but there is no explicit formatter config committed

**Linting:**
- No ESLint configuration found
- No Prettier configuration found
- The main enforced quality gate is `tsc` through `pnpm build`

## Import Organization

**Order:**
1. External packages first, e.g. `@tauri-apps/api/*`
2. Internal relative imports second
3. `import type` is used explicitly where type-only imports help clarity

**Grouping:**
- Imports are grouped with blank lines when crossing concern boundaries
- Relative imports are usually short and local rather than alias-based

**Path Aliases:**
- No TS/Vite path aliases are configured
- All internal modules use relative paths such as `../features/...` or `../../shared/...`

## Error Handling

**Patterns:**
- Throw immediately for invariant/setup failures, such as missing DOM elements in `src/app/main.ts` and `src/app/ui.ts`
- Return `boolean` for expected invalid state transitions in stateful controllers like `PomodoroTimer` and `SpikyStateController`
- Catch and warn for recoverable runtime issues like audio playback and desktop walking startup

**Error Types:**
- No custom error classes are defined yet
- Fatal native startup errors bubble to `.expect(...)` in `src-tauri/src/lib.rs`
- Recoverable issues are reported with `console.warn(...)`

## Logging

**Framework:**
- Plain `console.warn`

**Patterns:**
- Logging is minimal and only used at failure boundaries
- There is no structured logger or debug-level logging system
- Normal control flow is intentionally silent

## Comments

**When to Comment:**
- Comments are rare in the current codebase
- The code prefers descriptive names and short modules over explanatory comments
- Existing style suggests adding comments only when a piece of logic is not obvious from structure

**JSDoc/TSDoc:**
- Not currently used

**TODO Comments:**
- No TODO style is established in source files

## Function Design

**Size:**
- Functions and methods are kept compact
- Complex behavior is split into small private helper methods inside classes, especially in `src/features/timer/timer.ts` and `src/features/desktop-walker/desktop-walker.ts`

**Parameters:**
- Small parameter lists are preferred
- Shared or evolving state is usually wrapped in snapshot objects/interfaces instead of long argument lists

**Return Values:**
- Guard clauses are used heavily
- Methods that represent commands often return `boolean` to indicate whether a transition actually happened
- Rendering functions mutate the DOM directly and return `void`

## Module Design

**Exports:**
- Named exports are the default
- Most feature files expose one primary class or a small set of pure helpers

**Barrel Files:**
- No barrel files are used
- Modules are imported directly from their concrete file paths

**Separation of Concerns:**
- The codebase follows concern-based folders documented in `docs/architecture-rules.md`
- Timer logic, visual state, audio, window movement, and asset lookup live in separate modules and are coordinated centrally from `src/app/bootstrap.ts`

---

*Convention analysis: 2026-03-27*
*Update when patterns change*
