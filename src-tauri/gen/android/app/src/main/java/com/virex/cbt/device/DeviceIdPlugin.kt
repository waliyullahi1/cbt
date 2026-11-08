package com.virex.cbt.device

import android.app.Activity
import android.provider.Settings
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin

@TauriPlugin
class DeviceIdPlugin(private val activity: Activity) : Plugin(activity) {
  @Command
  fun getDeviceId(invoke: Invoke) {
    val deviceId = Settings.Secure.getString(
      activity.contentResolver,
      Settings.Secure.ANDROID_ID,
    )

    if (deviceId.isNullOrBlank()) {
      invoke.reject("Android device identifier is unavailable.")
      return
    }

    val result = JSObject()
    result.put("deviceId", deviceId)
    invoke.resolve(result)
  }
}
