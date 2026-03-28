import { AudioPlayer } from "../features/audio/audio-player";
import { DesktopWalker } from "../features/desktop-walker/desktop-walker";
import { SpikyStateController } from "../features/spiky-state/spiky-state";
import { PomodoroTimer } from "../features/timer/timer";
import { DesktopWindowController } from "../features/window-shell/desktop-window";
import { AUDIO_ASSET_BY_CUE } from "../shared/assets/manifest";
import { DEFAULT_POMODORO_MINUTES } from "../shared/constants/timer-presets";
import {
  hideImageFallback,
  mountApp,
  renderApp,
  showImageFallback
} from "./ui";

export function bootstrap(root: HTMLElement): void {
  const timer = new PomodoroTimer(DEFAULT_POMODORO_MINUTES);
  const spikyState = new SpikyStateController();
  const windowController = new DesktopWindowController();
  const desktopWalker = new DesktopWalker(windowController);
  const audioPlayer = new AudioPlayer(AUDIO_ASSET_BY_CUE);
  const elements = mountApp(root, DEFAULT_POMODORO_MINUTES);

  const render = (): void => {
    renderApp(
      elements,
      timer.getSnapshot(),
      spikyState.getSnapshot(),
      desktopWalker.getSnapshot()
    );
  };

  const renderInitialShell = (): void => {
    hideImageFallback(elements);
    render();
  };

  elements.spikyImage.addEventListener("load", () => {
    hideImageFallback(elements);
  });

  elements.spikyImage.addEventListener("error", () => {
    showImageFallback(elements);
  });

  renderInitialShell();

  let previousTimerStatus = timer.getSnapshot().status;

  timer.subscribe((snapshot) => {
    desktopWalker.setTimerStatus(snapshot.status);

    if (snapshot.status === "finished" && previousTimerStatus !== "finished") {
      spikyState.showTimerFinished();
      void audioPlayer.play("timerFinished");
    }

    previousTimerStatus = snapshot.status;
    render();
  });

  spikyState.subscribe(render);
  desktopWalker.subscribe(render);

  elements.durationInput.addEventListener("change", () => {
    timer.setDurationMinutes(Number(elements.durationInput.value));
    render();
  });

  elements.dragHandle.addEventListener("mousedown", (event) => {
    if (event.buttons !== 1) {
      return;
    }

    const handleDragRelease = async (): Promise<void> => {
      cleanupDragReleaseListeners();

      const currentPosition = await windowController.getCurrentPosition();

      if (currentPosition) {
        desktopWalker.syncWindowPosition(currentPosition);
      }

      desktopWalker.endManualDrag();
    };

    const cleanupDragReleaseListeners = (): void => {
      window.removeEventListener("pointerup", onPointerRelease, true);
      window.removeEventListener("pointercancel", onPointerRelease, true);
      window.removeEventListener("mouseup", onPointerRelease, true);
      window.removeEventListener("blur", onWindowBlur);
    };

    const onPointerRelease = (): void => {
      void handleDragRelease();
    };

    const onWindowBlur = (): void => {
      void handleDragRelease();
    };

    desktopWalker.beginManualDrag();
    window.addEventListener("pointerup", onPointerRelease, true);
    window.addEventListener("pointercancel", onPointerRelease, true);
    window.addEventListener("mouseup", onPointerRelease, true);
    window.addEventListener("blur", onWindowBlur);

    void windowController.startDragging().catch((error) => {
      cleanupDragReleaseListeners();
      desktopWalker.endManualDrag();
      console.warn("Failed to drag window from handle.", error);
    });
  });

  elements.startButton.addEventListener("click", () => {
    timer.start();
  });

  elements.pauseButton.addEventListener("click", () => {
    const timerStatus = timer.getSnapshot().status;

    if (timerStatus === "running") {
      timer.pause();
      return;
    }

    if (timerStatus === "paused") {
      timer.resume();
    }
  });

  elements.resetButton.addEventListener("click", () => {
    timer.reset();
    spikyState.dismissTimerFinished();
    audioPlayer.stopAll();
  });

  elements.dismissButton.addEventListener("click", () => {
    timer.reset();
    spikyState.dismissTimerFinished();
    audioPlayer.stop("timerFinished");
  });

  elements.spikyButton.addEventListener("click", () => {
    const didChange = spikyState.triggerClick();

    if (!didChange) {
      return;
    }

    desktopWalker.reactToInteraction();
    void audioPlayer.play("click");
  });

  elements.spikyButton.addEventListener("pointerenter", () => {
    desktopWalker.pauseForHover();
  });

  elements.spikyButton.addEventListener("pointerdown", () => {
    desktopWalker.pauseForInteraction();
  });

  void initializeDesktopShell(windowController, desktopWalker);
}

async function initializeDesktopShell(
  windowController: DesktopWindowController,
  desktopWalker: DesktopWalker
): Promise<void> {
  try {
    await windowController.onMoved((position) => {
      desktopWalker.syncWindowPosition(position);
    });
    await windowController.placeAtStartup();
    await desktopWalker.start();
  } catch (error) {
    console.warn("Failed to initialize desktop shell.", error);
  }
}
