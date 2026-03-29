import type { AudioCue } from "../../shared/types/state";

interface PlaybackOptions {
  onEnded?: () => void;
  onError?: (error: unknown) => void;
}

interface RepeatOptions {
  gapAfterEndedMs: number;
}

interface CueRuntimeState {
  playbackToken: number;
  repeatToken: number;
  repeatTimeoutId: number | null;
  cleanupPlaybackListeners: (() => void) | null;
}

const DEFAULT_AUDIO_VOLUME = 0.5;

export class AudioPlayer {
  private readonly audioByCue: Record<AudioCue, HTMLAudioElement>;
  private readonly runtimeByCue: Record<AudioCue, CueRuntimeState>;

  constructor(assetByCue: Record<AudioCue, string>) {
    this.audioByCue = {
      click: this.createAudio(assetByCue.click),
      timerFinished: this.createAudio(assetByCue.timerFinished)
    };
    this.runtimeByCue = {
      click: createRuntimeState(),
      timerFinished: createRuntimeState()
    };
  }

  async play(cue: AudioCue, options: PlaybackOptions = {}): Promise<void> {
    await this.playCue(cue, options, false);
  }

  startRepeating(cue: AudioCue, options: RepeatOptions): void {
    const runtime = this.runtimeByCue[cue];
    const repeatToken = runtime.repeatToken + 1;

    this.stop(cue);
    runtime.repeatToken = repeatToken;

    const playNext = (): void => {
      if (runtime.repeatToken !== repeatToken) {
        return;
      }

      void this.playCue(
        cue,
        {
          onEnded: () => {
            if (runtime.repeatToken !== repeatToken) {
              return;
            }

            runtime.repeatTimeoutId = window.setTimeout(() => {
              runtime.repeatTimeoutId = null;
              playNext();
            }, options.gapAfterEndedMs);
          },
          onError: (error) => {
            console.warn(`Failed to repeat cue: ${cue}`, error);
          }
        },
        true
      );
    };

    playNext();
  }

  stop(cue: AudioCue): void {
    const runtime = this.runtimeByCue[cue];
    const audio = this.audioByCue[cue];

    runtime.repeatToken += 1;
    this.clearRepeatTimeout(runtime);
    this.teardownPlayback(runtime);
    runtime.playbackToken += 1;
    audio.pause();
    audio.currentTime = 0;
  }

  stopAll(): void {
    this.stop("click");
    this.stop("timerFinished");
  }

  getCueDurationMs(cue: AudioCue): number | null {
    const duration = this.audioByCue[cue].duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      return null;
    }

    return duration * 1_000;
  }

  private async playCue(
    cue: AudioCue,
    options: PlaybackOptions,
    keepRepeatState: boolean
  ): Promise<void> {
    const runtime = this.runtimeByCue[cue];
    const audio = this.audioByCue[cue];

    if (!keepRepeatState) {
      runtime.repeatToken += 1;
      this.clearRepeatTimeout(runtime);
    }

    runtime.playbackToken += 1;
    const playbackToken = runtime.playbackToken;

    this.teardownPlayback(runtime);
    audio.pause();
    audio.currentTime = 0;

    const cleanup = this.attachPlaybackListeners(cue, runtime, playbackToken, options);
    runtime.cleanupPlaybackListeners = cleanup;

    try {
      await audio.play();
    } catch (error) {
      cleanup();
      if (runtime.cleanupPlaybackListeners === cleanup) {
        runtime.cleanupPlaybackListeners = null;
      }
      console.warn(`Failed to play cue: ${cue}`, error);
      options.onError?.(error);
    }
  }

  private attachPlaybackListeners(
    cue: AudioCue,
    runtime: CueRuntimeState,
    playbackToken: number,
    options: PlaybackOptions
  ): () => void {
    const audio = this.audioByCue[cue];

    const cleanup = (): void => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };

    const handleEnded = (): void => {
      if (runtime.playbackToken !== playbackToken) {
        cleanup();
        return;
      }

      cleanup();
      if (runtime.cleanupPlaybackListeners === cleanup) {
        runtime.cleanupPlaybackListeners = null;
      }
      options.onEnded?.();
    };

    const handleError = (): void => {
      if (runtime.playbackToken !== playbackToken) {
        cleanup();
        return;
      }

      cleanup();
      if (runtime.cleanupPlaybackListeners === cleanup) {
        runtime.cleanupPlaybackListeners = null;
      }
      options.onError?.(new Error(`Audio element emitted an error for cue: ${cue}`));
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return cleanup;
  }

  private teardownPlayback(runtime: CueRuntimeState): void {
    if (runtime.cleanupPlaybackListeners) {
      runtime.cleanupPlaybackListeners();
      runtime.cleanupPlaybackListeners = null;
    }
  }

  private clearRepeatTimeout(runtime: CueRuntimeState): void {
    if (runtime.repeatTimeoutId !== null) {
      window.clearTimeout(runtime.repeatTimeoutId);
      runtime.repeatTimeoutId = null;
    }
  }

  private createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);

    audio.preload = "auto";
    audio.volume = DEFAULT_AUDIO_VOLUME;
    return audio;
  }
}

function createRuntimeState(): CueRuntimeState {
  return {
    playbackToken: 0,
    repeatToken: 0,
    repeatTimeoutId: null,
    cleanupPlaybackListeners: null
  };
}
