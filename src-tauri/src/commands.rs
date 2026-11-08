#[tauri::command]

pub fn get_device_id() -> Result<String, String> {
    crate::device::create_device_id()
}
