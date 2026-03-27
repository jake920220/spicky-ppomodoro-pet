# Phase 1: Overlay Shell Foundation - Research

**Researched:** 2026-03-27
**Domain:** Tauri desktop overlay shell + lightweight frontend layout
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Spiky should launch near the desktop's lower area so it reads as a desktop pet from the first frame, not as a centered popup window.
- Initial placement should feel grounded against the desktop baseline even before full walking behavior is implemented in Phase 2.
- The top control dock should stay minimal: title, minute input, time/status readout, and core timer buttons only.
- Do not add dashboard-style extra copy, secondary panels, or informational clutter in Phase 1.
- Dragging should be available only from the dedicated top drag handle.
- The pet interaction area should remain reserved for pet behavior, not window dragging.
- The default idle presentation should already feel like a desktop pet stage with grounding cues such as shadow/stage treatment, not a plain utility box.
- The overlay should visually prioritize the pet over the controls, while still keeping the controls accessible at the top.

### the agent's Discretion
- Exact spacing, typography, and control sizing within the compact dock
- Exact shadow, glow, and stage treatment details as long as they preserve a lightweight desktop-pet feel
- The precise implementation used to establish the lower-area initial placement, provided it stays within Tauri 2 and minimal-Rust constraints

### Deferred Ideas (OUT OF SCOPE)
- Separate settings window / pet-only overlay split remains deferred to a later phase (`SHELL-01`) rather than being folded into Phase 1.
- Any richer pet animation, walking depth, or tamagotchi-like personality beyond basic shell grounding remains deferred to Phase 2+.

</user_constraints>

<research_summary>
## Summary

Phase 1 is best implemented by keeping Rust as a thin Tauri launcher and doing shell behavior from the frontend using the existing `@tauri-apps/api/window` adapter pattern. The current codebase already has the right foundations: transparent undecorated Tauri window config, a top drag handle with `data-tauri-drag-region`, overflow-hidden CSS, and a reusable window adapter for monitor-aware placement.

The key recommendation is to stop relying on `center: true` semantics for the shell and move to explicit startup positioning based on monitor work area plus current window size. That approach better honors the "desktop pet, not popup" constraint, works with the already-added `core:window:allow-set-position` capability, and keeps later walking behavior compatible with the same window adapter.

**Primary recommendation:** Treat Phase 1 as a shell-hardening phase: explicit lower-area startup placement, compact top-only dock, hidden overflow at every layout boundary, and a grounded idle stage using existing DOM/CSS structure.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tauri` | 2.x | Native desktop shell | Standard lightweight desktop runtime for transparent/always-on-top overlays in this project |
| `@tauri-apps/api/window` | 2.x | Monitor lookup and native window positioning | Official way to control window placement and screen bounds from the frontend |
| Vanilla TypeScript + DOM APIs | current | Layout/render orchestration | Sufficient for a compact shell UI without framework overhead |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tauri-apps/api/core` | 2.x | Runtime detection with `isTauri()` | Use whenever shell logic should no-op in pure browser contexts |
| CSS layout + animation | browser built-in | Shell density, grounded stage, subtle motion | Use for all Phase 1 visual treatment |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Frontend window positioning | Rust-native startup positioning | More native, but violates the project's "keep Rust minimal" preference for no clear Phase 1 benefit |
| Single compact dock | Separate settings window | Closer to long-term pet UX, but out of scope for this phase |

**Installation:**
```bash
pnpm install
cd src-tauri && cargo check
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/                # bootstrap + DOM template/render
├── features/
│   └── window-shell/   # Tauri window/monitor adapter
├── shared/             # assets/types/constants
└── styles/             # shell visuals
```

### Pattern 1: Frontend-owned startup placement
**What:** Resolve current/primary monitor work area in the frontend and position the shell explicitly after mount.
**When to use:** Use when the product wants deliberate overlay placement and later movement behavior from the same adapter.
**Example:**
```typescript
const bounds = await windowController.resolveWalkBounds();
if (bounds) {
  const centeredX = (bounds.minX + bounds.maxX) / 2;
  await windowController.setPosition(centeredX, bounds.y);
}
```

### Pattern 2: Top-handle-only drag region
**What:** Constrain `data-tauri-drag-region` to a dedicated header strip instead of the whole shell.
**When to use:** Use whenever the lower UI or pet area needs independent click/hover interactions later.
**Example:**
```html
<div class="drag-handle" data-tauri-drag-region>
  <span class="drag-handle__title">Spiky</span>
</div>
```

### Anti-Patterns to Avoid
- **Centered popup launch:** `center: true` alone makes the app read like a dialog instead of a grounded desktop companion.
- **Whole-window drag regions:** Later pet interactions and button clicks become ambiguous or fragile.
- **Scroll suppression in only one container:** If `html`, `body`, and `#app` are not all constrained, browser-like scrollbars leak back in.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Native shell startup placement | Custom Rust coordinate math for v1 | Existing `DesktopWindowController` adapter + `setPosition` | Keeps the shell frontend-led and reuses the same boundary logic as later walking |
| Drag behavior | Custom pointer-based drag logic | Tauri `data-tauri-drag-region` | Official support already exists and is simpler/safer |
| Shell scroll handling | Per-component overflow hacks only | Shell-level overflow discipline on `html`, `body`, `#app`, and layout containers | Prevents scrollbar regressions from layout growth |

**Key insight:** Phase 1 should mostly refine official Tauri/window/CSS primitives already present in the repo rather than inventing new abstractions.
</dont_hand-roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Startup placement conflicts with shell config
**What goes wrong:** The app still launches centered or visibly jumps after render.
**Why it happens:** Static `tauri.conf.json` positioning and runtime `setPosition()` behavior are not reconciled.
**How to avoid:** Remove or neutralize centering behavior and use one explicit startup positioning path.
**Warning signs:** The app flashes in the center before moving down.

### Pitfall 2: Drag region and interaction region overlap
**What goes wrong:** Buttons or the pet area start dragging the whole window.
**Why it happens:** The drag region is placed too broadly.
**How to avoid:** Keep the drag region scoped to the handle only and verify button/pet hit targets separately.
**Warning signs:** Clicking the pet or controls sometimes moves the window.

### Pitfall 3: Idle shell feels like a utility panel
**What goes wrong:** The shell technically works but visually reads as a widget or dev tool panel.
**Why it happens:** Too much dock emphasis or too little grounded stage treatment.
**How to avoid:** Keep controls dense and secondary; let the idle stage and shadow treatment carry the visual identity.
**Warning signs:** The pet looks embedded in a card instead of living on the desktop.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official/current sources:

### Scoped drag region
```html
<!-- Source: current code + Tauri window customization guidance -->
<div class="drag-handle" data-tauri-drag-region>
  <span class="drag-handle__title">Spiky</span>
</div>
```

### Explicit runtime position update
```typescript
// Source: current code in src/features/window-shell/desktop-window.ts
await this.appWindow.setPosition(
  new PhysicalPosition(Math.round(x), Math.round(y))
);
```

### Shell-level overflow suppression
```css
/* Source: current code in src/styles/app.css */
html,
body,
#app {
  overflow: hidden;
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Heavy Electron shell for desktop companions | Tauri 2 is a strong default for lightweight native overlays | Recent Tauri 2 adoption cycle | Better fit for small ambient desktop apps |
| Framework-first desktop shell UI | Small DOM/CSS shells are increasingly acceptable for focused overlays | Ongoing | Reduces complexity for MVP desktop utilities |

**New tools/patterns to consider:**
- Tauri 2 capability scoping — keep native power explicit and narrow
- Frontend-owned monitor-aware positioning — enough for MVP shell placement and later walking logic

**Deprecated/outdated:**
- Centered undecorated overlay windows as a default aesthetic — they read as popups unless the product specifically wants that
</sota_updates>

<open_questions>
## Open Questions

1. **Exact horizontal startup placement**
   - What we know: It should be near the lower area, not centered like a popup
   - What's unclear: Whether the best default is lower-center, lower-left, or lower-right
   - Recommendation: Treat this as the agent's discretion in planning, but keep the implementation isolated so UX can be adjusted later

2. **How much grounded stage treatment is enough**
   - What we know: The shell should already feel like a desktop pet
   - What's unclear: The exact visual density that feels playful without being heavy
   - Recommendation: Plan for a restrained shadow/stage pass now and expect UX tuning after manual runtime review
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-overlay-shell-foundation/01-CONTEXT.md` — locked phase decisions
- `src-tauri/tauri.conf.json` — current native shell config
- `src/features/window-shell/desktop-window.ts` — current official Tauri window API usage
- `src/app/ui.ts` and `src/styles/app.css` — current shell structure and layout patterns

### Secondary (MEDIUM confidence)
- Tauri Window Customization docs — https://v2.tauri.app/learn/window-customization/
- Tauri JavaScript Window API docs — https://v2.tauri.app/ko/reference/javascript/api/namespacewindow/

### Tertiary (LOW confidence - needs validation)
- None
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Tauri overlay shell behavior
- Ecosystem: official Tauri window APIs, current code patterns
- Patterns: startup placement, drag region scoping, no-scroll shell layout
- Pitfalls: popup feel, drag overlap, shell density

**Confidence breakdown:**
- Standard stack: HIGH - already reflected in the current repo
- Architecture: HIGH - current codebase follows the recommended separation
- Pitfalls: HIGH - directly relevant to current shell/UI code
- Code examples: HIGH - drawn from current source and official API usage

**Research date:** 2026-03-27
**Valid until:** 2026-04-26
</metadata>

---

*Phase: 01-overlay-shell-foundation*
*Research completed: 2026-03-27*
*Ready for planning: yes*
