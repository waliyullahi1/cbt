package com.virex.cbt

import android.content.Context
import android.content.res.Configuration
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.DisplayMetrics
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  @Volatile private var appReady = false

  inner class SplashBridge {
    @JavascriptInterface
    fun ready() { appReady = true }
  }

  // Ignore the phone's Font size and Display size settings
  override fun attachBaseContext(newBase: Context) {
    val config = Configuration(newBase.resources.configuration)
    config.fontScale = 1.0f
    config.densityDpi = DisplayMetrics.DENSITY_DEVICE_STABLE
    super.attachBaseContext(newBase.createConfigurationContext(config))
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    val splash = installSplashScreen()
    splash.setKeepOnScreenCondition { !appReady }

    // Safety net: never keep the splash longer than 15 seconds
    Handler(Looper.getMainLooper()).postDelayed({ appReady = true }, 15000)

    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    // Push the whole app below the status bar and above the navigation
    // bar / gesture bar, the camera cut-out and the keyboard
    val content = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val bars = insets.getInsets(
        WindowInsetsCompat.Type.systemBars() or
          WindowInsetsCompat.Type.displayCutout() or
          WindowInsetsCompat.Type.ime()
      )
      view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
      WindowInsetsCompat.CONSUMED
    }
    ViewCompat.requestApplyInsets(content)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    // Ignore the phone's font size setting inside the web content
    webView.settings.textZoom = 100

    // Removes the white or black flash while the page is loading
    webView.setBackgroundColor(0xFFEEF5FF.toInt())
    webView.addJavascriptInterface(SplashBridge(), "SplashBridge")

    // Background update download + install
    webView.addJavascriptInterface(AppUpdater(this), "AppUpdater")
  }
}