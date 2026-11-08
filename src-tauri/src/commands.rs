use tauri::Manager;

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub fn get_device_id() -> Result<String, String> {
    crate::device::create_device_id()
}

#[cfg(target_os = "android")]
#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AndroidDeviceId {
    device_id: String,
}

#[cfg(target_os = "android")]
#[tauri::command]
pub fn get_device_id(
    plugin: tauri::State<'_, tauri::plugin::PluginHandle<tauri::Wry>>,
) -> Result<String, String> {
    let response: AndroidDeviceId = plugin
        .run_mobile_plugin("getDeviceId", ())
        .map_err(|error| error.to_string())?;
    if response.device_id.trim().is_empty() {
        return Err("Android device identifier is unavailable.".to_string());
    }

    Ok(crate::device::hash_machine_identifier(&response.device_id))
}

#[cfg(target_os = "android")]
pub fn android_device_plugin() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    tauri::plugin::Builder::<tauri::Wry, ()>::new("device-id")
        .setup(|app, api| {
            let handle = api.register_android_plugin(
                "com.virex.cbt.device",
                "DeviceIdPlugin",
            )?;
            app.manage(handle);
            Ok(())
        })
        .build()
}
