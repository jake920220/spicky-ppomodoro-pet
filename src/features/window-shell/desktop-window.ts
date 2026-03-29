import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import {
  currentMonitor,
  getCurrentWindow,
  primaryMonitor,
  type Window
} from "@tauri-apps/api/window";
import type { TimerStatus } from "../../shared/types/state";

const WINDOW_BOTTOM_MARGIN_PX = 28;
const DEFAULT_WINDOW_HEIGHT_PX = 460;
const FINISHED_WINDOW_HEIGHT_PX = 508;

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
    await appWindow.setFocus();
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
    const targetHeight = shouldApplyFinishedLayout
      ? FINISHED_WINDOW_HEIGHT_PX
      : DEFAULT_WINDOW_HEIGHT_PX;

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

    const nextPosition = {
      x: currentPosition.x,
      y: currentPosition.y - (targetHeight - currentSize.height)
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
}
