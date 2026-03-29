import type { SpikyStateSnapshot } from "../../shared/types/state";

type SpikyStateListener = (snapshot: SpikyStateSnapshot) => void;

const CLICK_STATE_FALLBACK_MS = 1_600;

function createIdleSnapshot(): SpikyStateSnapshot {
  return {
    visual: "default",
    isInteractionBlocked: false
  };
}

export class SpikyStateController {
  private snapshot: SpikyStateSnapshot = createIdleSnapshot();
  private readonly listeners = new Set<SpikyStateListener>();
  private clickFallbackTimeoutId: number | null = null;

  getSnapshot(): SpikyStateSnapshot {
    return this.snapshot;
  }

  subscribe(listener: SpikyStateListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  triggerClick(fallbackDurationMs = CLICK_STATE_FALLBACK_MS): boolean {
    if (this.snapshot.isInteractionBlocked) {
      return false;
    }

    this.clearClickFallback();
    this.snapshot = {
      visual: "clicked",
      isInteractionBlocked: false
    };
    this.emit();

    this.clickFallbackTimeoutId = window.setTimeout(() => {
      this.restoreDefaultState();
    }, fallbackDurationMs);

    return true;
  }

  restoreClickState(): void {
    if (this.snapshot.visual !== "clicked") {
      return;
    }

    this.restoreDefaultState();
  }

  showTimerFinished(): void {
    this.clearClickFallback();
    this.snapshot = {
      visual: "timer_finished",
      isInteractionBlocked: true
    };
    this.emit();
  }

  dismissTimerFinished(): void {
    this.restoreDefaultState();
  }

  private restoreDefaultState(): void {
    this.clearClickFallback();
    this.snapshot = createIdleSnapshot();
    this.emit();
  }

  private clearClickFallback(): void {
    if (this.clickFallbackTimeoutId !== null) {
      window.clearTimeout(this.clickFallbackTimeoutId);
      this.clickFallbackTimeoutId = null;
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}
