import type { TimerSnapshot } from "../../shared/types/state";

type TimerListener = (snapshot: TimerSnapshot) => void;

const MIN_TIMER_MINUTES = 1;
const MAX_TIMER_MINUTES = 120;
const TIMER_TICK_MS = 250;

function createSnapshot(minutes: number): TimerSnapshot {
  const totalMs = minutes * 60_000;

  return {
    status: "idle",
    totalMs,
    remainingMs: totalMs
  };
}

export class PomodoroTimer {
  private snapshot: TimerSnapshot;
  private readonly listeners = new Set<TimerListener>();
  private tickIntervalId: number | null = null;
  private targetEndAt: number | null = null;

  constructor(initialMinutes: number) {
    this.snapshot = createSnapshot(clampMinutes(initialMinutes));
  }

  getSnapshot(): TimerSnapshot {
    return this.snapshot;
  }

  subscribe(listener: TimerListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  setDurationMinutes(minutes: number): boolean {
    if (this.snapshot.status !== "idle") {
      return false;
    }

    const nextMinutes = clampMinutes(minutes);
    const nextSnapshot = createSnapshot(nextMinutes);

    if (
      nextSnapshot.totalMs === this.snapshot.totalMs &&
      nextSnapshot.remainingMs === this.snapshot.remainingMs
    ) {
      return false;
    }

    this.snapshot = nextSnapshot;
    this.emit();
    return true;
  }

  start(): boolean {
    if (this.snapshot.status !== "idle") {
      return false;
    }

    this.snapshot = {
      ...this.snapshot,
      status: "running",
      remainingMs: this.snapshot.totalMs
    };
    this.targetEndAt = Date.now() + this.snapshot.remainingMs;
    this.startTicking();
    this.emit();
    return true;
  }

  pause(): boolean {
    if (this.snapshot.status !== "running") {
      return false;
    }

    this.syncRemainingMs();
    this.stopTicking();
    this.targetEndAt = null;
    this.snapshot = {
      ...this.snapshot,
      status: "paused"
    };
    this.emit();
    return true;
  }

  resume(): boolean {
    if (this.snapshot.status !== "paused") {
      return false;
    }

    this.snapshot = {
      ...this.snapshot,
      status: "running"
    };
    this.targetEndAt = Date.now() + this.snapshot.remainingMs;
    this.startTicking();
    this.emit();
    return true;
  }

  reset(): boolean {
    if (
      this.snapshot.status === "idle" &&
      this.snapshot.remainingMs === this.snapshot.totalMs
    ) {
      return false;
    }

    this.stopTicking();
    this.targetEndAt = null;
    this.snapshot = {
      status: "idle",
      totalMs: this.snapshot.totalMs,
      remainingMs: this.snapshot.totalMs
    };
    this.emit();
    return true;
  }

  private startTicking(): void {
    this.stopTicking();
    this.tickIntervalId = window.setInterval(() => {
      this.handleTick();
    }, TIMER_TICK_MS);
  }

  private stopTicking(): void {
    if (this.tickIntervalId !== null) {
      window.clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  private handleTick(): void {
    if (this.snapshot.status !== "running" || this.targetEndAt === null) {
      return;
    }

    this.syncRemainingMs();

    if (this.snapshot.remainingMs <= 0) {
      this.finish();
      return;
    }

    this.emit();
  }

  private finish(): void {
    this.stopTicking();
    this.targetEndAt = null;
    this.snapshot = {
      ...this.snapshot,
      status: "finished",
      remainingMs: 0
    };
    this.emit();
  }

  private syncRemainingMs(): void {
    if (this.targetEndAt === null) {
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      remainingMs: Math.max(0, this.targetEndAt - Date.now())
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

function clampMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_TIMER_MINUTES;
  }

  return Math.min(MAX_TIMER_MINUTES, Math.max(MIN_TIMER_MINUTES, Math.round(value)));
}
