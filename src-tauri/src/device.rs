use sha2::{Digest, Sha256};

/// ============================================================
/// GET MACHINE IDENTIFIER
/// ============================================================
///
/// Windows  -> Windows MachineGuid
/// Linux    -> /etc/machine-id
/// macOS    -> IOPlatformUUID
///
/// The raw machine identifier is NOT returned to the frontend.
/// It is hashed into a stable VIREX device ID.
/// ============================================================

#[cfg(target_os = "windows")]
use std::process::Command;

#[cfg(target_os = "windows")]
pub fn get_machine_identifier() -> Result<String, String> {
    // Windows MachineGuid
    let output = Command::new("reg")
        .args([
            "query",
            r"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography",
            "/v",
            "MachineGuid",
        ])
        .output()
        .map_err(|e| format!("Failed to read Windows MachineGuid: {}", e))?;

    if !output.status.success() {
        return Err("Failed to read Windows MachineGuid".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Example:
    //
    // HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography
    //     MachineGuid    REG_SZ    12345678-....
    //
    let uuid = stdout
        .lines()
        .find_map(|line| {
            if line.contains("MachineGuid") {
                line.split_whitespace().last().map(|v| v.to_string())
            } else {
                None
            }
        })
        .ok_or_else(|| "Windows MachineGuid was not found".to_string())?;

    if uuid.trim().is_empty() {
        return Err("Windows MachineGuid is empty".to_string());
    }

    Ok(uuid.trim().to_string())
}

/// ============================================================
/// LINUX
/// ============================================================

#[cfg(target_os = "linux")]
pub fn get_machine_identifier() -> Result<String, String> {
    // Linux standard machine ID
    let paths = ["/etc/machine-id", "/var/lib/dbus/machine-id"];

    for path in paths {
        match std::fs::read_to_string(path) {
            Ok(value) => {
                let machine_id = value.trim().to_string();

                if !machine_id.is_empty() {
                    return Ok(machine_id);
                }
            }

            Err(_) => {
                continue;
            }
        }
    }

    Err("Linux machine ID could not be found".to_string())
}

/// ============================================================
/// macOS
/// ============================================================

#[cfg(target_os = "macos")]
use std::process::Command;

#[cfg(target_os = "macos")]
pub fn get_machine_identifier() -> Result<String, String> {
    let output = Command::new("ioreg")
        .args(["-rd1", "-c", "IOPlatformExpertDevice"])
        .output()
        .map_err(|e| format!("Failed to execute ioreg: {}", e))?;

    if !output.status.success() {
        return Err("Failed to read macOS IOPlatformUUID".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    for line in stdout.lines() {
        if line.contains("IOPlatformUUID") {
            if let Some((_, value)) = line.split_once('=') {
                let uuid = value.trim().trim_matches('"').to_string();

                if !uuid.is_empty() {
                    return Ok(uuid);
                }
            }
        }
    }

    Err("macOS IOPlatformUUID was not found".to_string())
}

/// ============================================================
/// FALLBACK FOR OTHER PLATFORMS
/// ============================================================

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
pub fn get_machine_identifier() -> Result<String, String> {
    Err("Device ID is not supported on this platform".to_string())
}

/// ============================================================
/// CREATE VIREX DEVICE ID
/// ============================================================
///
/// Raw:
///
///     MachineGuid / machine-id / IOPlatformUUID
///
///             ↓
///
///     SHA-256
///
///             ↓
///
///     VIREX DEVICE ID
///
/// This means your server never needs the raw OS identifier.
/// ============================================================

pub fn create_device_id() -> Result<String, String> {
    let machine_id = get_machine_identifier()?;

    let mut hasher = Sha256::new();

    // Application-specific namespace.
    //
    // Changing this value would generate completely
    // different device IDs, so DON'T change it after
    // deploying your application.
    hasher.update(b"VIREX-CBT-DEVICE-V1:");

    hasher.update(machine_id.trim().as_bytes());

    let result = hasher.finalize();

    Ok(hex::encode(result))
}
