# Phase 1: Overlay Shell Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 1-Overlay Shell Foundation
**Areas discussed:** Launch placement, Dock density, Drag behavior, Idle presentation

---

## Launch placement

| Option | Description | Selected |
|--------|-------------|----------|
| Lower-area launch | Start near the desktop's lower area so the pet feels grounded immediately | ✓ |
| Centered launch | Start in the middle of the screen like a popup utility window | |
| Remembered position | Reopen where the user last left the window | |

**User's choice:** Recommended default accepted
**Notes:** User approved the recommended approach for this area and wants to revisit UX only after trying the running app.

---

## Dock density

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal core controls | Keep only title, minute input, time/status, and core buttons | ✓ |
| Expanded utility panel | Add more helper copy and secondary information to the dock | |
| Hidden/hover-heavy controls | Keep controls mostly collapsed until hover or interaction | |

**User's choice:** Recommended default accepted
**Notes:** User wants the shell to stay compact and adjust later only if the runtime UX feels awkward.

---

## Drag behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Top handle only | Only the dedicated drag handle moves the window | ✓ |
| Entire dock draggable | Any click-drag on the control dock can move the window | |
| Full window draggable | Pet area and controls can both drag the window | |

**User's choice:** Recommended default accepted
**Notes:** Keeping pet interaction separate from window dragging was preferred.

---

## Idle presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Grounded pet-stage look | Default idle state already has shadow/stage cues and feels like a desktop pet | ✓ |
| Plain utility shell | Simple transparent utility panel with minimal stage treatment | |
| Decorative rich scene | Heavier atmospheric scene treatment from the first phase | |

**User's choice:** Recommended default accepted
**Notes:** The user wants the app to read as a desktop pet rather than a generic tool.

---

## the agent's Discretion

- Exact visual density, spacing, and styling details inside the chosen compact shell
- Exact lower-area launch implementation approach

## Deferred Ideas

- Separate settings window and pet-only overlay split
- Richer pet behavior beyond shell grounding
