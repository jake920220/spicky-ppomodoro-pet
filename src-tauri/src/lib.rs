use tauri::{Manager, PhysicalPosition, Runtime};

const MAIN_WINDOW_LABEL: &str = "main";
const WINDOW_BOTTOM_MARGIN_PX: i32 = 28;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            place_main_window_before_show(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Spiky Ppomodoro pet");
}

// Hidden-first startup should be resolved in the shell layer so the window does
// not stay invisible when the frontend bridge is not ready yet.
fn place_main_window_before_show<R: Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };

    let monitor = match window.current_monitor()? {
        Some(monitor) => Some(monitor),
        None => window.primary_monitor()?,
    };

    if let Some(monitor) = monitor {
        let work_area = monitor.work_area();
        let window_size = window.outer_size()?;
        let min_x = work_area.position.x;
        let max_x = min_x.max(
            work_area.position.x + work_area.size.width as i32 - window_size.width as i32,
        );
        let min_y = work_area.position.y;
        let max_y = min_y.max(
            work_area.position.y + work_area.size.height as i32 - window_size.height as i32 - WINDOW_BOTTOM_MARGIN_PX,
        );

        window.set_position(PhysicalPosition::new((min_x + max_x) / 2, max_y))?;
    }

    window.show()?;

    Ok(())
}
