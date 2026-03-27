# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```text
spiky-pet/
├── docs/                    # Product and architecture rules
├── public/                  # Static image/audio assets served by Vite
│   └── assets/              # Pet PNGs and MP3 sound files
├── src/                     # Frontend application source
│   ├── app/                 # Frontend entry and orchestration
│   ├── features/            # Feature modules by concern
│   ├── shared/              # Shared assets, types, constants
│   └── styles/              # Global stylesheet
├── src-tauri/               # Native Tauri shell and app config
│   ├── capabilities/        # Tauri IPC/window permissions
│   ├── icons/               # Native app icon assets
│   └── src/                 # Rust entry points
├── .planning/               # Generated planning/codebase docs
├── index.html               # Webview HTML shell
├── package.json             # Frontend scripts and JS dependencies
├── pnpm-lock.yaml           # pnpm lockfile
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite dev/build config
```

## Directory Purposes

**`docs/`:**
- Purpose: Human-authored product and architecture rules outside executable code
- Contains: Markdown documents
- Key files: `docs/product-rules.md`, `docs/architecture-rules.md`
- Subdirectories: None currently

**`public/`:**
- Purpose: Static assets copied into the frontend build output
- Contains: Audio and image files
- Key files: `public/assets/images/image_1.png`, `public/assets/audio/click.mp3`
- Subdirectories: `assets/images/`, `assets/audio/`

**`src/app/`:**
- Purpose: Frontend entry point, bootstrap wiring, and DOM rendering helpers
- Contains: `main.ts`, `bootstrap.ts`, `ui.ts`
- Key files: `src/app/bootstrap.ts` orchestrates all features; `src/app/ui.ts` owns markup/rendering
- Subdirectories: None

**`src/features/`:**
- Purpose: Separate behavior by feature/domain concern
- Contains: Feature directories such as `timer/`, `spiky-state/`, `audio/`, `desktop-walker/`, `window-shell/`
- Key files: `src/features/timer/timer.ts`, `src/features/spiky-state/spiky-state.ts`, `src/features/desktop-walker/desktop-walker.ts`
- Subdirectories: One folder per concern

**`src/shared/`:**
- Purpose: Shared non-UI primitives reused across features
- Contains: Asset manifests, constants, shared state types
- Key files: `src/shared/assets/manifest.ts`, `src/shared/types/state.ts`
- Subdirectories: `assets/`, `constants/`, `types/`

**`src/styles/`:**
- Purpose: Global visual styling for the app shell
- Contains: CSS only
- Key files: `src/styles/app.css`
- Subdirectories: None

**`src-tauri/`:**
- Purpose: Tauri desktop shell and native build configuration
- Contains: Rust entry points, capability manifests, generated/build artifacts, app icons
- Key files: `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`
- Subdirectories: `capabilities/`, `icons/`, `src/`

## Key File Locations

**Entry Points:**
- `index.html`: Webview shell document that loads `src/app/main.ts`
- `src/app/main.ts`: Frontend bootstrap entry
- `src-tauri/src/main.rs`: Native executable entry
- `src-tauri/src/lib.rs`: Tauri builder entry

**Configuration:**
- `package.json`: JS scripts and dependencies
- `pnpm-lock.yaml`: Locked frontend dependency graph
- `tsconfig.json`: TypeScript compiler settings
- `vite.config.ts`: Vite dev server and build configuration
- `src-tauri/tauri.conf.json`: Tauri app/window configuration
- `src-tauri/capabilities/default.json`: Native permission scope for the main window
- `.gitignore`: Git exclusions for `node_modules`, `dist`, and `src-tauri/target`

**Core Logic:**
- `src/app/bootstrap.ts`: Feature construction and event orchestration
- `src/app/ui.ts`: DOM template + render mapping
- `src/features/timer/`: Timer state machine and helpers
- `src/features/spiky-state/`: Visual state transitions for default/clicked/finished
- `src/features/audio/`: Audio playback wrapper
- `src/features/desktop-walker/`: Random desktop walking behavior
- `src/features/window-shell/`: Tauri window monitor/position adapter
- `src/shared/assets/manifest.ts`: Single source of truth for asset paths

**Testing:**
- No test directories or test files currently present

**Documentation:**
- `AGENTS.md`: Project-specific operating rules
- `docs/product-rules.md`: User-facing behavior constraints
- `docs/architecture-rules.md`: Structural constraints
- `.planning/codebase/*.md`: Generated codebase map documents

## Naming Conventions

**Files:**
- `kebab-case.ts` for most frontend modules, such as `spiky-state.ts`, `audio-player.ts`, `desktop-window.ts`
- Simple reserved names for entry points/config, such as `main.ts`, `bootstrap.ts`, `ui.ts`
- `UPPERCASE.md` is not used inside the app code; docs are lower-case markdown names

**Directories:**
- Lower-case, purpose-driven directories such as `src/features/timer` and `src/shared/assets`
- Feature folders group one concern at a time

**Special Patterns:**
- `src/features/<feature>/<feature>.ts` or `<feature>-<role>.ts` for controller-style modules
- `src/shared/*` for reusable definitions that should not depend on feature modules

## Where to Add New Code

**New Feature:**
- Primary code: `src/features/<new-feature>/`
- Shared constants/types: `src/shared/constants/` or `src/shared/types/`
- UI wiring: `src/app/bootstrap.ts`
- UI rendering changes: `src/app/ui.ts` and `src/styles/app.css`

**New Component/Module:**
- Implementation: `src/features/` for domain behavior, `src/app/` for rendering/orchestration
- Types: `src/shared/types/`
- Asset path additions: `src/shared/assets/manifest.ts`

**New Native/Desktop Behavior:**
- Frontend bridge code: `src/features/window-shell/`
- Capability changes: `src-tauri/capabilities/default.json`
- Window defaults or packaging config: `src-tauri/tauri.conf.json`
- Rust-side native hooks: `src-tauri/src/`

**Utilities:**
- Shared helpers with no feature ownership: `src/shared/`

## Special Directories

**`dist/`:**
- Purpose: Frontend production build output
- Source: Generated by `pnpm build`
- Committed: No, ignored by `.gitignore`

**`src-tauri/target/`:**
- Purpose: Rust build artifacts
- Source: Generated by Cargo/Tauri builds
- Committed: No, ignored by `.gitignore`

**`.planning/`:**
- Purpose: Planning and codebase-map artifacts
- Source: Generated by GSD workflows
- Committed: Not ignored by default in this repo

---

*Structure analysis: 2026-03-27*
*Update when directory structure changes*
