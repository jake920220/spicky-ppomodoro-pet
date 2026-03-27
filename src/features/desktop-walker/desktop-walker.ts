import type { TimerStatus } from "../../shared/types/state";
import type { DesktopWalkerSnapshot } from "../../shared/types/state";
import {
  DesktopWindowController,
  type DesktopWalkBounds
} from "../window-shell/desktop-window";

type DesktopWalkerListener = (snapshot: DesktopWalkerSnapshot) => void;

const WALK_STEP_INTERVAL_MS = 32;
const WALK_SPEED_PX_PER_SECOND = 66;
const WALK_EDGE_PADDING_PX = 36;
const WALK_MIN_DISTANCE_PX = 72;
const WALK_REST_MIN_MS = 5_000;
const WALK_REST_MAX_MS = 10_000;
const FOCUS_WALK_REST_MIN_MS = 12_000;
const FOCUS_WALK_REST_MAX_MS = 22_000;
const STARTUP_WALK_REST_MIN_MS = 2_500;
const STARTUP_WALK_REST_MAX_MS = 6_000;
const CLICK_REST_MS = 1_600;
const HOVER_REST_MS = 900;
const DRAG_RESUME_MIN_MS = 1_000;
const DRAG_RESUME_MAX_MS = 2_500;
const FOCUS_DRAG_RESUME_MIN_MS = 4_000;
const FOCUS_DRAG_RESUME_MAX_MS = 8_000;

export class DesktopWalker {
  private snapshot: DesktopWalkerSnapshot = {
    facing: "right",
    isWalking: false
  };
  private readonly listeners = new Set<DesktopWalkerListener>();
  private readonly windowController: DesktopWindowController;
  private bounds: DesktopWalkBounds | null = null;
  private walkIntervalId: number | null = null;
  private restTimeoutId: number | null = null;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private lastTickAt = 0;
  private focusModeEnabled = false;
  private interactionPauseTimeoutId: number | null = null;
  private manualDragActive = false;

  constructor(windowController = new DesktopWindowController()) {
    this.windowController = windowController;
  }

  getSnapshot(): DesktopWalkerSnapshot {
    return this.snapshot;
  }

  subscribe(listener: DesktopWalkerListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async start(): Promise<void> {
    this.stop();
    this.bounds = await this.windowController.resolveWalkBounds();

    if (!this.bounds) {
      return;
    }

    const currentPosition = await this.windowController.getCurrentPosition();
    const midpoint = (this.bounds.minX + this.bounds.maxX) / 2;

    this.currentX = clamp(currentPosition?.x ?? midpoint, this.bounds.minX, this.bounds.maxX);
    this.currentY = clamp(
      currentPosition?.y ?? this.bounds.defaultY,
      this.bounds.minY,
      this.bounds.maxY
    );

    await this.windowController.setPosition(this.currentX, this.currentY);
    this.queueNextWalk(
      randomBetween(STARTUP_WALK_REST_MIN_MS, STARTUP_WALK_REST_MAX_MS)
    );
  }

  reactToInteraction(): void {
    if (!this.bounds) {
      return;
    }

    this.stopWalking();
    this.snapshot = {
      ...this.snapshot,
      facing: this.snapshot.facing === "right" ? "left" : "right"
    };
    this.emit();
    this.pauseForInteraction(CLICK_REST_MS);
  }

  pauseForInteraction(durationMs = CLICK_REST_MS): void {
    this.stopWalking();

    if (this.interactionPauseTimeoutId !== null) {
      window.clearTimeout(this.interactionPauseTimeoutId);
    }

    this.interactionPauseTimeoutId = window.setTimeout(() => {
      this.interactionPauseTimeoutId = null;
      this.queueNextWalk(this.getRestDuration());
    }, durationMs);
  }

  pauseForHover(): void {
    this.pauseForInteraction(HOVER_REST_MS);
  }

  beginManualDrag(): void {
    this.manualDragActive = true;
    this.clearScheduledMovement();
    this.stopWalking();
  }

  endManualDrag(): void {
    if (!this.manualDragActive) {
      return;
    }

    this.manualDragActive = false;
    this.queueNextWalk(this.getDragResumeDuration());
  }

  syncWindowPosition(position: { x: number; y: number }): void {
    if (this.bounds) {
      this.currentX = clamp(position.x, this.bounds.minX, this.bounds.maxX);
      this.currentY = clamp(position.y, this.bounds.minY, this.bounds.maxY);
      return;
    }

    this.currentX = position.x;
    this.currentY = position.y;
  }

  setTimerStatus(status: TimerStatus): void {
    this.focusModeEnabled = status === "running";
  }

  stop(): void {
    this.clearScheduledMovement();

    if (this.snapshot.isWalking) {
      this.snapshot = {
        ...this.snapshot,
        isWalking: false
      };
      this.emit();
    }
  }

  private async refreshBoundsAndWalk(): Promise<void> {
    const nextBounds = await this.windowController.resolveWalkBounds();

    if (!nextBounds) {
      return;
    }

    this.bounds = nextBounds;
    this.currentX = clamp(this.currentX, nextBounds.minX, nextBounds.maxX);
    this.currentY = clamp(this.currentY, nextBounds.minY, nextBounds.maxY);

    await this.windowController.setPosition(this.currentX, this.currentY);
    this.startWalking();
  }

  private startWalking(): void {
    if (!this.bounds || this.manualDragActive) {
      return;
    }

    const nextTarget = this.pickNextTarget(this.bounds);

    if (Math.abs(nextTarget - this.currentX) < WALK_MIN_DISTANCE_PX) {
      this.queueNextWalk(320);
      return;
    }

    this.targetX = nextTarget;
    this.lastTickAt = performance.now();
    this.snapshot = {
      facing: nextTarget >= this.currentX ? "right" : "left",
      isWalking: true
    };
    this.emit();

    this.walkIntervalId = window.setInterval(() => {
      this.handleTick();
    }, WALK_STEP_INTERVAL_MS);
  }

  private handleTick(): void {
    if (!this.snapshot.isWalking) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.lastTickAt;
    const stepDistance = (WALK_SPEED_PX_PER_SECOND * elapsed) / 1_000;
    const remainingDistance = this.targetX - this.currentX;

    this.lastTickAt = now;

    if (Math.abs(remainingDistance) <= stepDistance) {
      this.currentX = this.targetX;
      void this.windowController.setPosition(this.currentX, this.currentY);
      this.finishWalking();
      return;
    }

    this.currentX += Math.sign(remainingDistance) * stepDistance;
    void this.windowController.setPosition(this.currentX, this.currentY);
  }

  private finishWalking(): void {
    this.stopWalking();
    this.queueNextWalk(this.getRestDuration());
  }

  private stopWalking(): void {
    if (this.walkIntervalId !== null) {
      window.clearInterval(this.walkIntervalId);
      this.walkIntervalId = null;
    }

    this.lastTickAt = 0;

    if (!this.snapshot.isWalking) {
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      isWalking: false
    };
    this.emit();
  }

  private queueNextWalk(delayMs: number): void {
    if (this.interactionPauseTimeoutId !== null || this.manualDragActive) {
      return;
    }

    if (this.restTimeoutId !== null) {
      window.clearTimeout(this.restTimeoutId);
    }

    this.restTimeoutId = window.setTimeout(() => {
      this.restTimeoutId = null;
      void this.refreshBoundsAndWalk();
    }, delayMs);
  }

  private getRestDuration(): number {
    if (this.focusModeEnabled) {
      return randomBetween(FOCUS_WALK_REST_MIN_MS, FOCUS_WALK_REST_MAX_MS);
    }

    return randomBetween(WALK_REST_MIN_MS, WALK_REST_MAX_MS);
  }

  private getDragResumeDuration(): number {
    if (this.focusModeEnabled) {
      return randomBetween(FOCUS_DRAG_RESUME_MIN_MS, FOCUS_DRAG_RESUME_MAX_MS);
    }

    return randomBetween(DRAG_RESUME_MIN_MS, DRAG_RESUME_MAX_MS);
  }

  private clearScheduledMovement(): void {
    if (this.walkIntervalId !== null) {
      window.clearInterval(this.walkIntervalId);
      this.walkIntervalId = null;
    }

    if (this.restTimeoutId !== null) {
      window.clearTimeout(this.restTimeoutId);
      this.restTimeoutId = null;
    }

    if (this.interactionPauseTimeoutId !== null) {
      window.clearTimeout(this.interactionPauseTimeoutId);
      this.interactionPauseTimeoutId = null;
    }
  }

  private pickNextTarget(bounds: DesktopWalkBounds): number {
    const paddedMinX = Math.min(bounds.maxX, bounds.minX + WALK_EDGE_PADDING_PX);
    const paddedMaxX = Math.max(bounds.minX, bounds.maxX - WALK_EDGE_PADDING_PX);
    const minX = Math.min(paddedMinX, paddedMaxX);
    const maxX = Math.max(paddedMinX, paddedMaxX);
    const target = randomBetween(minX, maxX);

    if (Math.abs(target - this.currentX) >= WALK_MIN_DISTANCE_PX) {
      return target;
    }

    return this.currentX < (bounds.minX + bounds.maxX) / 2 ? maxX : minX;
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min: number, max: number): number {
  if (min === max) {
    return min;
  }

  return min + Math.random() * (max - min);
}
