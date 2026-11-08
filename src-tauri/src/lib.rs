#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod device;

use tauri::Manager;

// ==========================================
// SPLASH SCREEN COMMAND
// ==========================================

#[tauri::command]
fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(main) = app.get_webview_window("main") {
        main.show().map_err(|e| e.to_string())?;
        main.set_focus().map_err(|e| e.to_string())?;
    }

    if let Some(splash) = app.get_webview_window("splashscreen") {
        splash.close().map_err(|e| e.to_string())?;
    }

    Ok(())
}

// ==========================================
// APPLICATION ENTRY POINT
// ==========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()

        .plugin(tauri_plugin_http::init())

        // ==========================================
        // KEYRING STORAGE
        // ==========================================
        //
        // Securely stores the software private key and
        // other secret material in the platform keychain.
        //
        .plugin(tauri_plugin_keyring_store::init())

        // ==========================================
        // OPENER
        // ==========================================
        .plugin(tauri_plugin_opener::init())

        // ==========================================
        // OPERATING SYSTEM
        // ==========================================
        .plugin(tauri_plugin_os::init())

        // Desktop-only: mobile operating systems manage app instances.
        ;

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    let builder = builder.plugin(
            tauri_plugin_single_instance::init(
                |app, _args, _cwd| {
                    println!(
                        "Abanise CBT is already running."
                    );

                    // Focus existing main window
                    if let Some(main) =
                        app.get_webview_window("main")
                    {
                        let _ = main.show();
                        let _ = main.set_focus();
                    }
                },
            ),
        );

    builder
        // ==========================================
        // FILESYSTEM
        // ==========================================
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
         .plugin(tauri_plugin_os::init())
        // ==========================================
        // LOGGING
        // ==========================================
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )

        // ==========================================
        // STORE
        // ==========================================
        .plugin(
            tauri_plugin_store::Builder::default()
                .build(),
        )

        // ==========================================
        // SQLITE
        // ==========================================
        .plugin(
            tauri_plugin_sql::Builder::default()
                .build(),
        )

        // ==========================================
        // COMMANDS
        // ==========================================
        .invoke_handler(
            tauri::generate_handler![
                commands::get_device_id,
                show_main_window,
            ],
        )

        // ==========================================
        // RUN
        // ==========================================
        .run(tauri::generate_context!())
        .expect(
            "error while running Tauri application",
        );
}