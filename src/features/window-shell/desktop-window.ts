import { isTauri } from "@tauri-apps/api/core";
import { PhysicalPosition } from "@tauri-apps/api/dpi";
import {
  currentMonitor,
  getCurrentWindow,
  primaryMonitor,
  type Window
} from "@tauri-apps/api/window";

const WINDOW_BOTTOM_MARGIN_PX = 28;

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
    const position = await this.resolveStartupPosition();

    if (!position) {
      return null;
    }

    await this.setPosition(position.x, position.y);

    return position;
  }

  async startDragging(): Promise<void> {
    const appWindow = this.getAppWindow();

    if (!appWindow) {
      return;
    }

    await appWindow.startDragging();
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
    if (!isTauri()) {
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
