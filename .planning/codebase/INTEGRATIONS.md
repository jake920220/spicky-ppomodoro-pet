# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**Networked Services:**
- None currently. The project rules explicitly exclude online APIs, backend services, login/auth, analytics, and cloud sync in `AGENTS.md` and `docs/product-rules.md`.

**Desktop Platform APIs:**
- Tauri window/monitor bridge - Used for native desktop behavior from the frontend
  - SDK/Client: `@tauri-apps/api/window` and `@tauri-apps/api/core`
  - Usage: `src/features/window-shell/desktop-window.ts`
  - Capabilities used: monitor lookup, window size lookup, and native window repositioning

**Media Assets:**
- Local bundled audio and image assets - Used for pet states and sound cues
  - Source paths: `public/assets/images/image_1.png`, `public/assets/images/image_2.png`, `public/assets/images/image_3.png`, `public/assets/audio/click.mp3`, `public/assets/audio/timer-finished.mp3`
  - Asset registry: `src/shared/assets/manifest.ts`

## Data Storage

**Databases:**
- None

**File Storage:**
- No external storage provider
- Assets are served locally from the Vite/Tauri bundle under `public/assets/`

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None

**OAuth Integrations:**
- None

## Monitoring & Observability

**Error Tracking:**
- None

**Analytics:**
- None

**Logs:**
- Minimal console warnings only
  - Audio playback failures are logged in `src/features/audio/audio-player.ts`
  - Desktop walking startup failures are logged in `src/app/bootstrap.ts`

## CI/CD & Deployment

**Hosting:**
- Not a hosted web app
- Distribution target is a packaged desktop application built with Tauri

**CI Pipeline:**
- No CI configuration found under `.github/workflows/` or equivalent

## Environment Configuration

**Development:**
- No app-specific secrets required
- Dev/build environment relies on Tauri-injected variables handled in `vite.config.ts`
- The app expects the Vite dev server on `http://localhost:1420` via `src-tauri/tauri.conf.json`

**Staging:**
- No separate staging environment configured

**Production:**
- No external secrets management or failover setup because the app is local-only

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Native/Desktop Integrations

**Window Management:**
- Main window is configured as undecorated, transparent, always-on-top, and visible on all workspaces in `src-tauri/tauri.conf.json`
- Frontend-controlled repositioning is allowed by `src-tauri/capabilities/default.json`

**Audio Playback:**
- HTML audio playback via the webview runtime
- Reset behavior ensures sounds do not overlap by pausing and rewinding before replay in `src/features/audio/audio-player.ts`

---

*Integration audit: 2026-03-27*
*Update when adding/removing external services*
