export type AudioCue = "click" | "timerFinished";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type SpikyVisualState = "default" | "clicked" | "timer_finished";

export type PetFacing = "left" | "right";

export type PetMotionMode = "ambient" | "focus" | "finished_alert";

export interface TimerSnapshot {
  status: TimerStatus;
  totalMs: number;
  remainingMs: number;
}

export interface SpikyStateSnapshot {
  visual: SpikyVisualState;
  isInteractionBlocked: boolean;
}

export interface DesktopWalkerSnapshot {
  facing: PetFacing;
  isWalking: boolean;
  motionMode: PetMotionMode;
}
