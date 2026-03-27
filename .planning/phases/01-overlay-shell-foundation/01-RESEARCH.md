# Phase 1: Overlay Shell Foundation - Research

**Researched:** 2026-03-27
**Domain:** Tauri 2 transparent desktop overlay shell
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Launch placement
- **D-01:** Spiky should launch near the desktop's lower area so it reads as a desktop pet from the first frame, not as a centered popup window.
- **D-02:** Initial placement should feel grounded against the desktop baseline even before full walking behavior is implemented in Phase 2.

### Dock density
- **D-03:** The top control dock should stay minimal: title, minute input, time/status readout, and core timer buttons only.
- **D-04:** Do not add dashboard-style extra copy, secondary panels, or informational clutter in Phase 1.

### Drag behavior
- **D-05:** Dragging should be available only from the dedicated top drag handle.
- **D-06:** The pet interaction area should remain reserved for pet behavior, not window dragging.

### Idle presentation
- **D-07:** The default idle presentation should already feel like a desktop pet stage with grounding cues such as shadow/stage treatment, not a plain utility box.
- **D-08:** The overlay should visually prioritize the pet over the controls, while still keeping the controls accessible at the top.

### Claude's Discretion
- Exact spacing, typography, and control sizing within the compact dock
- Exact shadow, glow, and stage treatment details as long as they preserve a lightweight desktop-pet feel
- The precise implementation used to establish the lower-area initial placement, provided it stays within Tauri 2 and minimal-Rust constraints

### Deferred Ideas (OUT OF SCOPE)
- Separate settings window / pet-only overlay split remains deferred to a later phase (`SHELL-01`) rather than being folded into Phase 1.
- Any richer pet animation, walking depth, or tamagotchi-like personality beyond basic shell grounding remains deferred to Phase 2+.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DESK-01 | User can launch Spiky as a transparent, always-on-top desktop overlay on macOS and Windows. | Use Tauri window config for `transparent`, `decorations: false`, `alwaysOnTop`, `shadow: false`; treat `visibleOnAllWorkspaces` as macOS-only behavior and do not rely on it for Windows. |
| DESK-02 | User can use a compact top control dock to view controls and drag the app without native window chrome. | Keep the dock small and top-aligned; confine dragging to a dedicated handle via `data-tauri-drag-region` or `startDragging()` only if needed. |
| DESK-03 | User does not see browser-style scrollbars during normal use of the overlay window. | Keep `html`, `body`, `#app`, and the shell at fixed height with `overflow: hidden`; do not depend on `scrollBarStyle` for cross-platform behavior. |
| PET-01 | User sees Spiky in its default idle state using `image_1` when the app is ready. | Keep the current shared asset manifest pattern and boot into a stable default pet stage with transparent root and centered grounded stage treatment. |
</phase_requirements>

## Summary

Phase 1 should stay inside the existing single-window Tauri 2 shell. The best launch-placement approach is to stop showing the window in the center first, then moving it. Instead, set the main window to `center: false` and `visible: false`, calculate a lower-area position from the monitor `workArea`, call `setPosition()`, and only then `show()` the window. That keeps Rust minimal, uses the current `src/features/window-shell/desktop-window.ts` adapter, and prevents the centered-popup first impression that violates D-01.

The drag solution should remain narrow and explicit. Tauri's window-customization docs state that `data-tauri-drag-region` only works on the element it is directly applied to so the current `drag-handle` with nested text spans is a likely source of dead drag spots. For Phase 1, the lowest-risk plan is to keep the dedicated top handle, apply the drag region to the actual non-interactive hit targets in that handle, and leave the pet stage completely non-draggable. Only switch to manual `startDragging()` if the declarative handle still feels inconsistent, because manual dragging requires an extra capability permission.

For the shell look, treat this as a desktop-pet stage, not a dialog. Keep the root window transparent, let the compact dock float at the top, and let the pet take most of the vertical space with a simple ground shadow and glow. Do not add plugins, acrylic blur, or taskbar-hiding behavior in this phase. The current Vite `public/` asset approach and centralized asset manifest are already the correct direction.

**Primary recommendation:** Use a hidden-first startup flow with runtime lower-area positioning, keep dragging limited to the top handle, and avoid any new dependencies or Rust beyond small config/capability changes.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tauri-apps/api` | `2.10.1` | Frontend access to monitor, position, visibility, and window shell APIs | Official Tauri window APIs already cover startup placement and shell behavior without extra plugins |
| `@tauri-apps/cli` | `2.10.1` | `tauri dev`, `tauri build`, and icon generation | Official CLI path for build and packaging tasks |
| `tauri` crate | `2.x` | Native window host and config backing | Keeps native behavior minimal while still supporting transparency and desktop-window features |
| `typescript` | `5.9.3` in repo | App logic and shell orchestration | Current repo baseline is sufficient; no Phase 1 value in toolchain churn |
| `vite` | `7.3.1` in repo | Dev server, build pipeline, and `public/` asset serving | Already configured, lightweight, and aligned with the project's no-framework frontend choice |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Browser DOM + CSS | Built-in | Control dock layout, grounded pet stage, and no-scroll overlay styling | Use for the Phase 1 shell instead of introducing a component framework |
| Tauri capabilities | Built-in | Grant JS window commands safely | Keep `core:window:allow-set-position`; add `core:window:allow-start-dragging` only if manual drag is adopted |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Core Tauri window APIs | `tauri-plugin-positioner` | Unnecessary dependency for a simple lower-area startup placement; core monitor APIs are enough |
| Declarative drag region on a small handle | Manual `startDragging()` | Manual drag gives more control but needs extra permission and more event logic |
| Visible taskbar icon | `skipTaskbar: true` | Hiding the taskbar icon makes the pet feel more overlay-like but hurts recoverability before a tray or settings window exists |

**Installation:**
```bash
pnpm install
```

**Version verification:**
- Installed locally via `pnpm list --depth 0`: `@tauri-apps/api@2.10.1`, `@tauri-apps/cli@2.10.1`, `typescript@5.9.3`, `vite@7.3.1`
- Registry current via `npm view` on 2026-03-27:
  - `@tauri-apps/api`: `2.10.1` (registry modified `2026-02-03`)
  - `@tauri-apps/cli`: `2.10.1` (registry modified `2026-03-04`)
  - `typescript`: latest `6.0.2` (registry modified `2026-03-24`)
  - `vite`: latest `8.0.3` (registry modified `2026-03-26`)
- Recommendation: stay on the repo's installed TypeScript and Vite versions for Phase 1. This phase is about shell correctness, not build-tool upgrades.

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/                   # bootstrap and shell markup wiring
├── features/window-shell/ # launch placement and shell-native adapter logic
├── features/spiky-state/  # pet visual state only
├── features/timer/        # timer domain only
├── shared/assets/         # centralized image/audio paths
└── styles/                # overlay shell and stage styling
```

### Pattern 1: Hidden-First Lower-Area Startup
**What:** Start the window hidden, compute placement from monitor `workArea`, then show it after positioning.

**When to use:** App startup and any future "reset to home position" behavior.

**Example:**
```json
// Source: https://v2.tauri.app/reference/config/
{
  "center": false,
  "visible": false,
  "decorations": false,
  "transparent": true,
  "alwaysOnTop": true,
  "shadow": false
}
```

```ts
// Source: https://v2.tauri.app/reference/javascript/api/namespacewindow/
import { PhysicalPosition } from "@tauri-apps/api/dpi";
import {
  currentMonitor,
  getCurrentWindow,
  primaryMonitor
} from "@tauri-apps/api/window";

const BOTTOM_MARGIN_PX = 28;

export async function placeShellForLaunch(): Promise<void> {
  const appWindow = getCurrentWindow();
  const monitor = (await currentMonitor()) ?? (await primaryMonitor());

  if (!monitor) {
    await appWindow.show();
    return;
  }

  const size = await appWindow.outerSize();
  const x =
    monitor.workArea.position.x +
    Math.max(0, Math.round((monitor.workArea.size.width - size.width) / 2));
  const y = Math.max(
    monitor.workArea.position.y,
    monitor.workArea.position.y +
      monitor.workArea.size.height -
      size.height -
      BOTTOM_MARGIN_PX
  );

  await appWindow.setPosition(new PhysicalPosition(x, y));
  await appWindow.show();
}
```

### Pattern 2: Dedicated Drag Handle Only
**What:** Make only the top handle draggable, and keep controls plus pet stage outside the drag zone.

**When to use:** Entire Phase 1 and Phase 2 shell behavior.

**Example:**
```html
<!-- Source: https://v2.tauri.app/learn/window-customization/ -->
<div class="drag-handle" data-tauri-drag-region>
  <span class="drag-handle__title" data-tauri-drag-region>Spiky</span>
  <span class="drag-handle__subtitle" data-tauri-drag-region>
    desktop pet timer
  </span>
</div>
```

```ts
// Source: https://v2.tauri.app/learn/window-customization/
// Use only if declarative drag regions still feel inconsistent.
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();
const dragHandle = document.getElementById("drag-handle");

dragHandle.addEventListener("mousedown", (event) => {
  if (event.buttons !== 1) {
    return;
  }

  void appWindow.startDragging();
});
```

### Pattern 3: Desktop-Pet-First Shell Composition
**What:** Keep the dock visually separate and compact while the pet stage owns the remaining space and baseline shadow.

**When to use:** Phase 1 layout and styling.

**Example:**
```css
/* Source: project shell pattern + CSS overflow guidance from Tauri/Vite docs */
html,
body,
#app {
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.app-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.pet-stage {
  align-content: end;
}
```

### Anti-Patterns to Avoid
- **Center-then-jump startup:** `center: true` plus runtime reposition produces the exact popup feel the phase is trying to avoid.
- **Whole-shell drag regions:** making the entire dock or pet stage draggable will block later pet interactions and can break control clicks.
- **Cross-platform reliance on `visibleOnAllWorkspaces`:** Tauri documents it as unsupported on Windows, so it cannot be the Phase 1 cross-platform guarantee.
- **Fancy window effects in v1:** blur/acrylic adds platform-specific rendering and drag/resizing caveats without improving the core shell requirement.
- **Taskbar-hiding too early:** without a tray or secondary window, `skipTaskbar` makes recovery and debugging harder.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lower-area launch placement | Hardcoded per-platform screen offsets | `currentMonitor()` / `primaryMonitor()` + `workArea` + `setPosition()` | Handles taskbar/dock offsets, multi-monitor coordinates, and DPI correctly |
| Window dragging | Custom `mousemove` drag math | `data-tauri-drag-region` or `startDragging()` | Uses native window drag behavior and avoids click-handling edge cases |
| Asset path resolution | Relative path guessing scattered through UI files | `public/` assets plus `src/shared/assets/manifest.ts` | Vite serves `/assets/...` in dev and copies them to `dist` as-is |
| Scrollbar suppression | OS-specific scrollbar hacks | `overflow: hidden` on the root shell | Works on both target platforms and matches current CSS structure |
| Window effects | Bespoke blur/acrylic shell | Plain transparent window + CSS styling | Lower risk, lighter feel, and fewer Windows rendering side effects |

**Key insight:** Phase 1 is a window-shell correctness problem. The core Tauri window APIs and the existing project structure already cover it. Extra plugins would add surface area without removing the real risks.

## Common Pitfalls

### Pitfall 1: Center Flash Before Reposition
**What goes wrong:** The window appears centered, then visibly jumps to the lower area.

**Why it happens:** The current config uses `center: true`, so the OS shows the window before JS placement runs.

**How to avoid:** Set `center: false` and `visible: false`; compute placement first, then call `show()`.

**Warning signs:** A one-frame centered popup in `tauri dev`.

### Pitfall 2: Drag Works Only on Empty Parts of the Handle
**What goes wrong:** Clicking the handle text does not drag, even though the handle background does.

**Why it happens:** Tauri documents that `data-tauri-drag-region` only works on the element it is directly applied to.

**How to avoid:** Apply the drag attribute to the actual non-interactive children in the handle, or adopt manual `startDragging()` with the required capability.

**Warning signs:** The current `.drag-handle` title/subtitle text behaves like dead zones.

### Pitfall 3: Windows Border or Halo on an Undecorated Overlay
**What goes wrong:** The transparent overlay still shows a border or odd window edge on Windows.

**Why it happens:** Tauri documents that `shadow: true` on undecorated Windows windows introduces a white border and rounded corners.

**How to avoid:** Keep `shadow: false` for this overlay shell.

**Warning signs:** A faint 1px light outline around the window on Windows 11.

### Pitfall 4: Treating All-Workspaces as Cross-Platform
**What goes wrong:** The macOS build stays across spaces, but the Windows build does not.

**Why it happens:** Tauri documents `visibleOnAllWorkspaces` as unsupported on Windows.

**How to avoid:** Treat `alwaysOnTop` as the actual cross-platform Phase 1 behavior and leave workspace semantics as a platform-specific bonus.

**Warning signs:** The pet disappears when switching Windows virtual desktops.

### Pitfall 5: Transparent Window With an Opaque App Box
**What goes wrong:** The user still sees a rectangle around the pet or dock.

**Why it happens:** A non-transparent root background or a nonzero alpha background color at the window layer can reintroduce a visible box.

**How to avoid:** Keep `html`, `body`, and `#app` transparent and avoid using window-level background colors for the shell.

**Warning signs:** White, gray, or tinted fill behind the pet stage.

### Pitfall 6: Packaging With Only `icon.png`
**What goes wrong:** Built macOS and Windows bundles use incomplete or low-quality icons.

**Why it happens:** The repo currently only has `src-tauri/icons/icon.png`, while Tauri recommends a full generated icon set including `icon.icns` and `icon.ico`.

**How to avoid:** Generate the desktop icon set with `pnpm tauri icon` before packaging-focused work.

**Warning signs:** Default or mismatched icons in Finder, Explorer, or installer artifacts.

## Code Examples

Verified patterns from official sources:

### Lower-Area Startup Without First-Frame Popup
```ts
// Source: https://v2.tauri.app/reference/javascript/api/namespacewindow/
import { PhysicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWindow, primaryMonitor } from "@tauri-apps/api/window";

export async function showInLowerArea(): Promise<void> {
  const appWindow = getCurrentWindow();
  const monitor = await primaryMonitor();

  if (!monitor) {
    await appWindow.show();
    return;
  }

  const size = await appWindow.outerSize();
  const x =
    monitor.workArea.position.x +
    Math.round((monitor.workArea.size.width - size.width) / 2);
  const y =
    monitor.workArea.position.y +
    monitor.workArea.size.height -
    size.height -
    28;

  await appWindow.setPosition(new PhysicalPosition(x, y));
  await appWindow.show();
}
```

### Manual Drag Fallback
```ts
// Source: https://v2.tauri.app/learn/window-customization/
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

document.getElementById("drag-handle")?.addEventListener("mousedown", (e) => {
  if (e.buttons === 1) {
    void appWindow.startDragging();
  }
});
```

### Static Asset Path Pattern
```ts
// Source: https://vite.dev/guide/assets
export const IMAGE_ASSET_BY_STATE = {
  default: "/assets/images/image_1.png",
  clicked: "/assets/images/image_2.png",
  timer_finished: "/assets/images/image_3.png"
} as const;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Start centered and reposition after mount | Start hidden, compute from monitor `workArea`, then show | Supported by current Tauri 2 window APIs | Prevents popup flash and keeps startup deterministic |
| Make the whole titlebar area draggable with `app-region: drag` | Use small `data-tauri-drag-region` targets or manual `startDragging()` | Tauri reverted broad Windows drag behavior during the 2.0 beta line | Buttons and inputs remain clickable and right-click stays sane |
| Use `scrollBarStyle` as a no-scroll solution | Use CSS `overflow: hidden` for the overlay shell | Current config docs show `scrollBarStyle` is meaningful only on Windows | Cross-platform no-scroll behavior stays consistent |
| Add blur/acrylic for a "desktop app" look | Use transparent window + CSS-only dock/stage styling | Current Tauri docs note platform-specific window effect caveats | Lower risk and better aligned with lightweight desktop-pet UX |

**Deprecated/outdated:**
- Treating `visibleOnAllWorkspaces` as a Windows feature is incorrect. Tauri documents it as unsupported on Windows.
- Treating broad `app-region: drag` as the safest interactive-titlebar strategy is outdated for this use case. Tauri's own release notes document Windows interaction problems that caused a rollback.

## Open Questions

1. **Should initial X placement be centered or slightly offset?**
   - What we know: the lower-area requirement is locked, and Tauri monitor APIs support precise placement.
   - What's unclear: whether the current art feels most grounded at center-bottom or slightly off-center.
   - Recommendation: center horizontally within the current monitor `workArea` for Phase 1, then revisit once walking exists in Phase 2.

2. **Will declarative drag regions be enough for the current handle markup?**
   - What we know: current markup has nested spans inside the handle, and Tauri says drag regions only apply to the element directly marked.
   - What's unclear: whether mirroring the drag attribute onto the child spans fully solves the hit area on both target platforms.
   - Recommendation: start with declarative drag on all non-interactive handle nodes; fall back to manual `startDragging()` only if QA still finds dead spots.

3. **Should the app hide from the taskbar in Phase 1?**
   - What we know: `skipTaskbar` is supported on Windows but there is no tray or secondary recovery path yet.
   - What's unclear: whether the product wants pet-only presence immediately or easier recovery during MVP iteration.
   - Recommendation: keep the taskbar icon for now and revisit after tray/settings work exists.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev/build pipeline | yes | `v25.8.1` | none |
| pnpm | Project scripts | yes | `10.33.0` | `npm` is possible but not the project standard |
| Tauri CLI | `tauri dev`, `tauri build`, `tauri icon` | yes | `2.10.1` | none |
| Rust toolchain | Native shell compilation | yes | `cargo 1.94.1`, `rustc 1.94.1` | none |
| macOS host | Local overlay smoke testing | yes | `macOS 26.3.1` | none |
| Full Xcode app bundle tooling | macOS packaging/signing verification | partial | `xcodebuild` unavailable; Command Line Tools active | dev-loop work can proceed, but full packaging/signing verification is deferred |
| Windows host or CI runner | Real Windows overlay validation | no | - | defer to Phase 4 or use a Windows machine/CI |

**Missing dependencies with no fallback:**
- A Windows runtime environment for verifying real Windows overlay behavior during this research session.

**Missing dependencies with fallback:**
- Full Xcode packaging/signing tooling. Phase 1 planning can proceed and shell development can continue, but packaged macOS verification is deferred.

## Sources

### Primary (HIGH confidence)
- Official Tauri config reference - checked window config semantics for `alwaysOnTop`, `center`, `decorations`, `shadow`, `skipTaskbar`, `transparent`, `visible`, `visibleOnAllWorkspaces`, `x`, `y`, `scrollBarStyle`, and `backgroundColor`: https://v2.tauri.app/reference/config/
- Official Tauri JS window API reference - checked `currentMonitor`, `primaryMonitor`, `outerSize`, `setPosition`, `show`, and `startDragging`: https://v2.tauri.app/reference/javascript/api/namespacewindow/
- Official Tauri window customization guide - checked `data-tauri-drag-region` behavior, manual `startDragging()`, and the capability requirement for manual drag: https://v2.tauri.app/learn/window-customization/
- Official Tauri app icons guide - checked icon generation and required desktop icon outputs: https://v2.tauri.app/develop/icons/
- Official Vite asset guide - checked `public/` asset serving and root-absolute path requirements: https://vite.dev/guide/assets
- npm registry lookups on 2026-03-27 using `npm view` for `@tauri-apps/api`, `@tauri-apps/cli`, `typescript`, and `vite`

### Secondary (MEDIUM confidence)
- Official Tauri release note documenting why broad Windows `app-region: drag` behavior was reverted during Tauri 2 beta: https://v2.tauri.app/release/tauri/v2.0.0-beta.22/

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - confirmed from the repo, `pnpm list`, and current npm registry metadata.
- Architecture: HIGH - based on current code structure plus official Tauri window/config docs.
- Pitfalls: HIGH - core pitfalls are directly documented by Tauri or are evident from the current repo configuration and markup.

**Research date:** 2026-03-27
**Valid until:** 2026-04-26
