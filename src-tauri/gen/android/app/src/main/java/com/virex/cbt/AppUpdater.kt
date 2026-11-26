package com.virex.cbt

import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.Settings
import android.webkit.JavascriptInterface
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File

/**
 * Exposed to the web app as window.AppUpdater.
 * Android's DownloadManager keeps downloading even if the app is closed.
 */
class AppUpdater(private val activity: Activity) {

  private val prefs = activity.getSharedPreferences("app_update", Context.MODE_PRIVATE)
  private val dm = activity.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

  private fun apkFile(versionCode: Long) = File(
    activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
    "update-$versionCode.apk"
  )

  @JavascriptInterface
  fun currentVersionCode(): Long {
    val info = activity.packageManager.getPackageInfo(activity.packageName, 0)
    return info.longVersionCode
  }

  /** Starts the background download. Returns false if it could not start. */
  @JavascriptInterface
  fun start(url: String, versionCode: Long): Boolean {
    return try {
      // Already downloading or finished for this version? Do nothing.
      val s = JSONObject(status())
      if (s.optLong("versionCode") == versionCode &&
        (s.optString("state") == "downloading" || s.optString("state") == "ready")
      ) return true

      cleanup(keepVersionCode = -1)

      val request = DownloadManager.Request(Uri.parse(url))
        .setTitle("Updating app")
        .setDescription("Downloading new version")
        .setMimeType("application/vnd.android.package-archive")
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
        .setDestinationInExternalFilesDir(
          activity,
          Environment.DIRECTORY_DOWNLOADS,
          "update-$versionCode.apk"
        )

      val id = dm.enqueue(request)
      prefs.edit().putLong("download_id", id).putLong("version_code", versionCode).apply()
      true
    } catch (e: Exception) {
      false
    }
  }

  /** JSON: {state: none|downloading|ready|failed, progress: 0-100, versionCode} */
  @JavascriptInterface
  fun status(): String {
    val out = JSONObject()
    val id = prefs.getLong("download_id", -1)
    val vc = prefs.getLong("version_code", -1)
    out.put("versionCode", vc)

    if (id == -1L) return out.put("state", "none").put("progress", 0).toString()

    val cursor = dm.query(DownloadManager.Query().setFilterById(id))
    cursor.use {
      if (!it.moveToFirst()) {
        return out.put("state", "none").put("progress", 0).toString()
      }
      val status = it.getInt(it.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
      val done = it.getLong(it.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
      val total = it.getLong(it.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
      val progress = if (total > 0) ((done * 100) / total).toInt() else 0

      return when (status) {
        DownloadManager.STATUS_SUCCESSFUL ->
          if (apkFile(vc).exists()) out.put("state", "ready").put("progress", 100).toString()
          else out.put("state", "none").put("progress", 0).toString()
        DownloadManager.STATUS_FAILED ->
          out.put("state", "failed").put("progress", 0).toString()
        else ->
          out.put("state", "downloading").put("progress", progress).toString()
      }
    }
  }

  /** Opens Android's install screen for the downloaded APK. */
  @JavascriptInterface
  fun install(): Boolean {
    val vc = prefs.getLong("version_code", -1)
    val file = apkFile(vc)
    if (!file.exists()) return false

    activity.runOnUiThread {
      // First time only: user must allow "Install unknown apps" for this app.
      if (!activity.packageManager.canRequestPackageInstalls()) {
        val settings = Intent(
          Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
          Uri.parse("package:${activity.packageName}")
        )
        activity.startActivity(settings)
        return@runOnUiThread
      }

      val uri = FileProvider.getUriForFile(
        activity,
        "${activity.packageName}.fileprovider",
        file
      )
      val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uri, "application/vnd.android.package-archive")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      activity.startActivity(intent)
    }
    return true
  }

  /** Deletes old APK files. Call on launch so finished updates don't pile up. */
  @JavascriptInterface
  fun cleanup(keepVersionCode: Long) {
    val dir = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: return
    dir.listFiles()?.forEach { f ->
      if (f.name.startsWith("update-") && f.name != "update-$keepVersionCode.apk") f.delete()
    }
    if (keepVersionCode == -1L) prefs.edit().clear().apply()
  }
}
