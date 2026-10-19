package com.virex.cbt

import android.os.Bundle
import android.os.Handler
import android.os.Looper
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

  override fun onCreate(savedInstanceState: Bundle?) {
    val splash = installSplashScreen()
    splash.setKeepOnScreenCondition { !appReady }

    // Safety net: never keep the splash longer than 15 seconds
    Handler(Looper.getMainLooper()).postDelayed({ appReady = true }, 15000)

    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)

    // Removes the white or black flash while the page is loading
    webView.setBackgroundColor(0xFFEEF5FF.toInt())
    webView.addJavascriptInterface(SplashBridge(), "SplashBridge")

    // Keep the page out from under the status bar, the gesture/navigation bar,
    // the camera cut-out and the keyboard
    ViewCompat.setOnApplyWindowInsetsListener(webView) { view, insets ->
      val bars = insets.getInsets(
        WindowInsetsCompat.Type.systemBars() or
          WindowInsetsCompat.Type.displayCutout() or
          WindowInsetsCompat.Type.ime()
      )
      view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
      WindowInsetsCompat.CONSUMED
    }
    ViewCompat.requestApplyInsets(webView)
  }
}