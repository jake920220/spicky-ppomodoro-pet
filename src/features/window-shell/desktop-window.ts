import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import {
  currentMonitor,
  getCurrentWindow,
  primaryMonitor,
  type Window
} from "@tauri-apps/api/window";
import type { TimerStatus } from "../../shared/types/state";

const WINDOW_BOTTOM_MARGIN_PX = 28;
const FINISHED_LAYOUT_EXTRA_HEIGHT_PX = 48;

function hasTauriWindowContext(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export interface DesktopWalkBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  defaultY: number;
}

export interface DesktopStartupPosition {
  x: number;
  y: number;
}

export class DesktopWindowController {
  private appWindow: Window | null = null;
  private baseWindowHeight: number | null = null;
  private isFinishedLayoutApplied = false;

  async resolveWalkBounds(): Promise<DesktopWalkBounds | null> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return null;
    }

    const monitor = (await currentMonitor()) ?? (await primaryMonitor());

    if (!monitor) {
      return null;
    }

    const windowSize = await appWindow.outerSize();
    const minX = monitor.workArea.position.x;
    const maxX = Math.max(
      minX,
      monitor.workArea.position.x + monitor.workArea.size.width - windowSize.width
    );
    const minY = monitor.workArea.position.y;
    const maxY = Math.max(
      minY,
      monitor.workArea.position.y,
      monitor.workArea.position.y +
        monitor.workArea.size.height -
        windowSize.height -
        WINDOW_BOTTOM_MARGIN_PX
    );

    return {
      minX,
      maxX,
      minY,
      maxY,
      defaultY: maxY
    };
  }

  async getCurrentPosition(): Promise<{ x: number; y: number } | null> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return null;
    }

    const position = await appWindow.outerPosition();

    return {
      x: position.x,
      y: position.y
    };
  }

  async resolveStartupPosition(): Promise<DesktopStartupPosition | null> {
    const bounds = await this.resolveWalkBounds();

    if (!bounds) {
      return null;
    }

    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: bounds.defaultY
    };
  }

  async placeAtStartup(): Promise<DesktopStartupPosition | null> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return null;
    }

    const position = await this.resolveStartupPosition();

    if (position) {
      await this.setPosition(position.x, position.y);
    }

    await appWindow.show();
    return position;
  }

  async onMoved(
    handler: (position: { x: number; y: number }) => void
  ): Promise<() => void> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return () => {};
    }

    return appWindow.onMoved(({ payload }) => {
      handler({
        x: payload.x,
        y: payload.y
      });
    });
  }

  async startDragging(): Promise<void> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return;
    }

    await appWindow.startDragging();
  }

  async syncLayoutForTimerStatus(
    status: TimerStatus
  ): Promise<{ x: number; y: number } | null> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return null;
    }

    const shouldApplyFinishedLayout = status === "finished";

    if (shouldApplyFinishedLayout === this.isFinishedLayoutApplied) {
      return this.getCurrentPosition();
    }

    const currentPosition = await this.getCurrentPosition();
    const currentSize = await appWindow.outerSize();
    const baseWindowHeight = this.getBaseWindowHeight(currentSize.height);
    const targetHeight = shouldApplyFinishedLayout
      ? baseWindowHeight + FINISHED_LAYOUT_EXTRA_HEIGHT_PX
      : baseWindowHeight;

    if (currentSize.height === targetHeight) {
      this.isFinishedLayoutApplied = shouldApplyFinishedLayout;
      return currentPosition;
    }

    await appWindow.setSize(
      new PhysicalSize(currentSize.width, targetHeight)
    );

    if (!currentPosition) {
      this.isFinishedLayoutApplied = shouldApplyFinishedLayout;
      return null;
    }

    const resizedBounds = await this.resolveWalkBounds();
    const nextPosition = {
      x: resizedBounds
        ? clamp(currentPosition.x, resizedBounds.minX, resizedBounds.maxX)
        : currentPosition.x,
      y: resizedBounds
        ? clamp(
            currentPosition.y - (targetHeight - currentSize.height),
            resizedBounds.minY,
            resizedBounds.maxY
          )
        : currentPosition.y - (targetHeight - currentSize.height)
    };

    await this.setPosition(nextPosition.x, nextPosition.y);
    this.isFinishedLayoutApplied = shouldApplyFinishedLayout;
    return nextPosition;
  }

  async setPosition(x: number, y: number): Promise<void> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return;
    }

    await appWindow.setPosition(
      new PhysicalPosition(Math.round(x), Math.round(y))
    );
  }

  private getAppWindow(): Window | null {
    if (!hasTauriWindowContext()) {
      return null;
    }

    if (this.appWindow) {
      return this.appWindow;
    }

    try {
      this.appWindow = getCurrentWindow();
      return this.appWindow;
    } catch (error) {
      console.warn("Failed to access current Tauri window during startup.", error);
      return null;
    }
  }

  private getBaseWindowHeight(currentHeight: number): number {
    if (this.baseWindowHeight === null || !this.isFinishedLayoutApplied) {
      this.baseWindowHeight = currentHeight;
    }

    return this.baseWindowHeight;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
