import {
  DEFAULT_IDLE_IMAGE_ASSET,
  IMAGE_ASSET_BY_STATE
} from "../shared/assets/manifest";
import type {
  DesktopWalkerSnapshot,
  SpikyStateSnapshot,
  SpikyVisualState,
  TimerSnapshot,
  TimerStatus
} from "../shared/types/state";

export interface AppElements {
  root: HTMLElement;
  dragHandle: HTMLElement;
  durationInput: HTMLInputElement;
  timerDisplay: HTMLElement;
  timerStatus: HTMLElement;
  startButton: HTMLButtonElement;
  pauseButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  dismissButton: HTMLButtonElement;
  spikyButton: HTMLButtonElement;
  spikyImage: HTMLImageElement;
  spikyCaption: HTMLElement;
}

const visualStateLabels: Record<SpikyVisualState, string> = {
  default: "기본 상태",
  clicked: "클릭 반응",
  timer_finished: "타이머 종료"
};

const timerStatusLabels: Record<TimerStatus, string> = {
  idle: "대기 중",
  running: "집중 시간",
  paused: "일시정지",
  finished: "완료됨"
};

export function mountApp(
  root: HTMLElement,
  initialMinutes: number
): AppElements {
  root.innerHTML = `
    <main class="app-shell">
      <section class="control-dock" aria-label="타이머 컨트롤 도크">
        <div
          class="drag-handle"
          data-tauri-drag-region
          aria-label="창 이동 핸들"
        >
          <span class="drag-handle__title">Spiky Ppomodoro pet</span>
        </div>
        <div class="control-row">
          <label class="field" for="timer-minutes">
            <span class="field-label">뽀모도로 분</span>
            <input
              class="field-input"
              id="timer-minutes"
              type="number"
              inputmode="numeric"
              min="1"
              max="120"
              step="1"
              value="${initialMinutes}"
            />
          </label>
          <div class="timer-readout" aria-live="polite">
            <p class="timer-display" id="timer-display"></p>
            <p class="timer-status" id="timer-status"></p>
          </div>
        </div>
        <div class="timer-actions">
          <button class="action-button action-button--primary" id="start-button" type="button">시작</button>
          <button class="action-button" id="pause-button" type="button">일시정지</button>
          <button class="action-button" id="reset-button" type="button">리셋</button>
        </div>
        <button class="action-button action-button--warning" id="dismiss-button" type="button" hidden>
          종료 알림 해제
        </button>
      </section>
      <section class="pet-stage" aria-label="Spiky 데스크톱 펫 스테이지">
        <button class="pet-button" id="spiky-button" type="button" aria-label="Spiky 캐릭터">
          <span class="pet-sprite">
            <img class="pet-image" id="spiky-image" alt="" />
          </span>
        </button>
        <p class="pet-caption" id="spiky-caption"></p>
      </section>
    </main>
  `;

  return {
    root,
    dragHandle: queryElement(root, ".drag-handle"),
    durationInput: queryElement<HTMLInputElement>(root, "#timer-minutes"),
    timerDisplay: queryElement(root, "#timer-display"),
    timerStatus: queryElement(root, "#timer-status"),
    startButton: queryElement<HTMLButtonElement>(root, "#start-button"),
    pauseButton: queryElement<HTMLButtonElement>(root, "#pause-button"),
    resetButton: queryElement<HTMLButtonElement>(root, "#reset-button"),
    dismissButton: queryElement<HTMLButtonElement>(root, "#dismiss-button"),
    spikyButton: queryElement<HTMLButtonElement>(root, "#spiky-button"),
    spikyImage: queryElement<HTMLImageElement>(root, "#spiky-image"),
    spikyCaption: queryElement(root, "#spiky-caption")
  };
}

export function renderApp(
  elements: AppElements,
  timer: TimerSnapshot,
  spiky: SpikyStateSnapshot,
  walker: DesktopWalkerSnapshot
): void {
  elements.root.dataset.timerStatus = timer.status;
  elements.root.dataset.spikyState = spiky.visual;
  elements.root.dataset.petFacing = walker.facing;
  elements.root.dataset.petWalking = String(walker.isWalking);
  elements.root.dataset.petMotionMode = walker.motionMode;
  elements.durationInput.value = String(Math.round(timer.totalMs / 60_000));
  elements.durationInput.disabled = timer.status !== "idle";
  elements.timerDisplay.textContent = formatDuration(timer.remainingMs);
  elements.timerStatus.textContent = `타이머 상태: ${timerStatusLabels[timer.status]}`;
  syncSpikyImage(elements, spiky.visual);
  elements.spikyCaption.textContent = getPetCaption(timer.status, spiky.visual, walker);
  elements.spikyButton.disabled = spiky.isInteractionBlocked;
  elements.startButton.disabled = timer.status !== "idle";
  elements.pauseButton.disabled = !["running", "paused"].includes(timer.status);
  elements.pauseButton.textContent =
    timer.status === "paused" ? "재개" : "일시정지";
  elements.dismissButton.hidden = timer.status !== "finished";
}

export function showImageFallback(elements: AppElements): void {
  elements.spikyImage.hidden = true;
}

export function hideImageFallback(elements: AppElements): void {
  elements.spikyImage.hidden = false;
}

function syncSpikyImage(
  elements: AppElements,
  visualState: SpikyVisualState
): void {
  const nextAsset =
    IMAGE_ASSET_BY_STATE[visualState] ?? DEFAULT_IDLE_IMAGE_ASSET;

  if (elements.spikyImage.getAttribute("src") !== nextAsset) {
    hideImageFallback(elements);
    elements.spikyImage.src = nextAsset;
  }

  elements.spikyImage.alt = visualStateLabels[visualState];
}

function formatDuration(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getPetCaption(
  timerStatus: TimerStatus,
  visualState: SpikyVisualState,
  walker: DesktopWalkerSnapshot
): string {
  if (visualState === "timer_finished") {
    return "집중 끝. 쉬어갈 시간이야.";
  }

  if (visualState === "clicked") {
    return "찌릿. 방금 건드렸어.";
  }

  if (walker.isWalking) {
    return "데스크톱 산책 중.";
  }

  if (timerStatus === "running") {
    return "스피키가 집중중이에요.";
  }

  if (timerStatus === "paused") {
    return "잠깐 쉬는 중이에요.";
  }

  return "스피키가 쉬고 있어요.";
}

function queryElement<T extends HTMLElement = HTMLElement>(
  root: ParentNode,
  selector: string
): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing element for selector: ${selector}`);
  }

  return element;
}
