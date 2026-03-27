import type { SpikyVisualState } from "../types/state";

export const IMAGE_ASSET_BY_STATE: Record<SpikyVisualState, string> = {
  default: "/assets/images/image_1.png",
  clicked: "/assets/images/image_2.png",
  timer_finished: "/assets/images/image_3.png"
};

export const DEFAULT_IDLE_IMAGE_ASSET = IMAGE_ASSET_BY_STATE.default;

export const AUDIO_ASSET_BY_CUE = {
  click: "/assets/audio/click.mp3",
  timerFinished: "/assets/audio/timer-finished.mp3"
} as const;
