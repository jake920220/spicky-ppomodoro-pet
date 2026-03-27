import type {
  SpikyStateSnapshot
} from "../../shared/types/state";

type SpikyStateListener = (snapshot: SpikyStateSnapshot) => void;

const CLICK_STATE_DURATION_MS = 1_200;

function createIdleSnapshot(): SpikyStateSnapshot {
  return {
    visual: "default",
    isInteractionBlocked: false
  };
}

export class SpikyStateController {
  private snapshot: SpikyStateSnapshot = createIdleSnapshot();
  private readonly listeners = new Set<SpikyStateListener>();
  private clickTimeoutId: number | null = null;

  getSnapshot(): SpikyStateSnapshot {
    return this.snapshot;
  }

  subscribe(listener: SpikyStateListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  triggerClick(): boolean {
    if (this.snapshot.isInteractionBlocked) {
      return false;
    }

    this.clearClickTimeout();
    this.snapshot = {
      visual: "clicked",
      isInteractionBlocked: false
    };
    this.emit();

    this.clickTimeoutId = window.setTimeout(() => {
      this.snapshot = createIdleSnapshot();
      this.emit();
      this.clickTimeoutId = null;
    }, CLICK_STATE_DURATION_MS);

    return true;
  }

  showTimerFinished(): void {
    this.clearClickTimeout();
    this.snapshot = {
      visual: "timer_finished",
      isInteractionBlocked: true
    };
    this.emit();
  }

  dismissTimerFinished(): void {
    this.clearClickTimeout();
    this.snapshot = createIdleSnapshot();
    this.emit();
  }

  private clearClickTimeout(): void {
    if (this.clickTimeoutId !== null) {
      window.clearTimeout(this.clickTimeoutId);
      this.clickTimeoutId = null;
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}
