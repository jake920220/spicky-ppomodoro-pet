# Phase 1: Overlay Shell Foundation - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the transparent desktop overlay shell, the compact top control dock, a scrollbar-free layout, and a stable default idle Spiky presence. It does not add richer pet behaviors, separate settings windows, or timer-finish interaction depth beyond what is required to make the shell feel grounded and ready for subsequent phases.

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- Exact spacing, typography, and control sizing within the compact dock
- Exact shadow, glow, and stage treatment details as long as they preserve a lightweight desktop-pet feel
- The precise implementation used to establish the lower-area initial placement, provided it stays within Tauri 2 and minimal-Rust constraints

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and success criteria
- `.planning/ROADMAP.md` — Phase 1 goal, requirements mapping, success criteria, and plan placeholders
- `.planning/REQUIREMENTS.md` — `DESK-01`, `DESK-02`, `DESK-03`, and `PET-01` define the required shell behavior for this phase
- `.planning/PROJECT.md` — core value, product constraints, and the existing product framing for Spiky

### Product and architecture rules
- `AGENTS.md` — project-wide implementation rules, scope boundaries, and UX principles
- `docs/product-rules.md` — explicit product behavior constraints for pet states, audio, timer, and desktop-only scope
- `docs/architecture-rules.md` — separation-of-concerns rules that constrain how shell work should be organized

### Current source anchors
- `src-tauri/tauri.conf.json` — current overlay window configuration and sizing defaults
- `src/app/ui.ts` — current control dock and pet-stage markup
- `src/styles/app.css` — current shell layout, no-scroll behavior, and visual treatment

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/ui.ts`: already has a `control-dock`, `drag-handle`, and `pet-stage` structure that can be refined instead of rebuilt
- `src/styles/app.css`: already enforces hidden overflow and contains baseline dock/stage styling patterns
- `src/features/window-shell/desktop-window.ts`: provides a native window adapter that can support explicit lower-area launch placement
- `src/shared/assets/manifest.ts`: already centralizes image/audio asset paths
- `public/assets/images/image_1.png`: current default idle asset for Phase 1 presence

### Established Patterns
- Feature concerns are split into separate folders under `src/features/` and coordinated from `src/app/bootstrap.ts`
- Rendering is DOM + CSS driven, not component-framework driven
- Tauri-native calls are isolated behind small adapter modules rather than spread across UI code
- Named exports and small files are the existing source pattern

### Integration Points
- `src-tauri/tauri.conf.json` is the main integration point for overlay shell defaults like transparency, decorations, and window sizing
- `src/app/ui.ts` is where compact dock structure and top-handle behavior are expressed
- `src/styles/app.css` is where scrollbar suppression, shell density, and idle visual grounding should be tuned
- `src/app/bootstrap.ts` is where startup-time shell adjustments or initial placement coordination can be wired

</code_context>

<specifics>
## Specific Ideas

- The user accepted the recommended defaults for all four Phase 1 gray areas and prefers to revisit awkward UX only after running the app.
- The desired feel remains "desktop pet first, utility shell second."
- The control surface should stay at the top while the pet reads as grounded near the lower part of the desktop.

</specifics>

<deferred>
## Deferred Ideas

- Separate settings window / pet-only overlay split remains deferred to a later phase (`SHELL-01`) rather than being folded into Phase 1.
- Any richer pet animation, walking depth, or tamagotchi-like personality beyond basic shell grounding remains deferred to Phase 2+.

</deferred>

---

*Phase: 01-overlay-shell-foundation*
*Context gathered: 2026-03-27*
