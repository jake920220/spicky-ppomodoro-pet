import { isTauri } from "@tauri-apps/api/core";
import { PhysicalPosition } from "@tauri-apps/api/dpi";
import {
  currentMonitor,
  getCurrentWindow,
  primaryMonitor
} from "@tauri-apps/api/window";

const WINDOW_BOTTOM_MARGIN_PX = 28;

export interface DesktopWalkBounds {
  minX: number;
  maxX: number;
  y: number;
}

export interface DesktopStartupPosition {
  x: number;
  y: number;
}

export class DesktopWindowController {
  private readonly appWindow = getCurrentWindow();

  async resolveWalkBounds(): Promise<DesktopWalkBounds | null> {
    if (!isTauri()) {
      return null;
    }

    const monitor = (await currentMonitor()) ?? (await primaryMonitor());

    if (!monitor) {
      return null;
    }

    const windowSize = await this.appWindow.outerSize();
    const minX = monitor.workArea.position.x;
    const maxX = Math.max(
      minX,
      monitor.workArea.position.x + monitor.workArea.size.width - windowSize.width
    );
    const y = Math.max(
      monitor.workArea.position.y,
      monitor.workArea.position.y +
        monitor.workArea.size.height -
        windowSize.height -
        WINDOW_BOTTOM_MARGIN_PX
    );

    return {
      minX,
      maxX,
      y
    };
  }

  async getCurrentPosition(): Promise<{ x: number; y: number } | null> {
    if (!isTauri()) {
      return null;
    }

    const position = await this.appWindow.outerPosition();

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
      y: bounds.y
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

  async setPosition(x: number, y: number): Promise<void> {
    if (!isTauri()) {
      return;
    }

    await this.appWindow.setPosition(
      new PhysicalPosition(Math.round(x), Math.round(y))
    );
  }
}
