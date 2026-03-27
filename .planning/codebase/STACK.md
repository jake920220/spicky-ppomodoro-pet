# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**
- TypeScript 5.x - Frontend application logic in `src/**/*.ts`
- CSS - Visual styling in `src/styles/app.css`
- HTML - Shell document in `index.html`

**Secondary:**
- Rust 2021 edition - Native Tauri shell in `src-tauri/src/*.rs`
- JSON - Desktop app configuration in `src-tauri/tauri.conf.json` and capability files

## Runtime

**Environment:**
- Node.js - Frontend tooling and dev server via `vite` and `pnpm` scripts in `package.json`
- Browser/WebView runtime - The UI runs inside the Tauri webview and uses DOM APIs (`src/app/main.ts`, `src/app/ui.ts`)
- Native desktop runtime - Tauri 2 host process for macOS and Windows (`src-tauri/src/main.rs`, `src-tauri/src/lib.rs`)

**Package Manager:**
- `pnpm` - Project package manager
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Tauri 2 - Desktop shell and frontend/native bridge (`@tauri-apps/api`, `@tauri-apps/cli`, `tauri`, `tauri-build`)
- Vanilla TypeScript - UI orchestration and feature logic without React/Vue/Svelte (`src/app/bootstrap.ts`, `src/features/**/*`)

**Testing:**
- No automated test framework configured yet

**Build/Dev:**
- Vite 7 - Frontend dev server and production bundling (`vite.config.ts`)
- TypeScript compiler - Type checking during `pnpm build` (`tsconfig.json`)
- Cargo - Rust build/check for the Tauri shell (`src-tauri/Cargo.toml`)

## Key Dependencies

**Critical:**
- `@tauri-apps/api` `^2` - Accesses native window APIs from the frontend, including monitor/window positioning used by `src/features/window-shell/desktop-window.ts`
- `@tauri-apps/cli` `^2` - Drives `pnpm tauri:dev` and `pnpm tauri:build`
- `tauri` `2.x` - Native desktop application runtime in `src-tauri/Cargo.toml`
- `tauri-build` `2.x` - Generates Tauri context and build metadata during Rust compilation
- `typescript` `^5` - Strict type checking for the frontend codebase
- `vite` `^7` - Bundles the webview frontend and serves dev assets on port `1420`

**Infrastructure:**
- Browser built-ins - `Audio`, DOM events, timers, and CSS animations power most app behavior
- Tauri window APIs - `currentMonitor`, `primaryMonitor`, `getCurrentWindow`, `setPosition` drive desktop walking behavior

## Configuration

**Environment:**
- No committed `.env` file or custom application secrets are required
- Tauri/Vite integration uses environment variables like `TAURI_DEV_HOST`, `TAURI_ENV_PLATFORM`, and `TAURI_ENV_DEBUG` in `vite.config.ts`

**Build:**
- `package.json` - Frontend scripts and dependency manifest
- `tsconfig.json` - Strict TypeScript compilation rules for `src/`
- `vite.config.ts` - Dev server, HMR, and production target configuration
- `src-tauri/tauri.conf.json` - Window shape, dev URL, build commands, and app metadata
- `src-tauri/Cargo.toml` - Rust crate metadata and Tauri dependency versions
- `src-tauri/capabilities/default.json` - Window permission scope, including `core:window:allow-set-position`

## Platform Requirements

**Development:**
- macOS or Windows target environment for the actual desktop app behavior
- Node.js + `pnpm` for frontend development
- Rust toolchain + Cargo for Tauri compilation
- Tauri desktop prerequisites installed locally

**Production:**
- Desktop-only target: macOS and Windows, as defined by project rules in `AGENTS.md` and `docs/product-rules.md`
- Web frontend is bundled into `dist/`; Rust shell packages the app via Tauri build commands

---

*Stack analysis: 2026-03-27*
*Update after major dependency changes*
