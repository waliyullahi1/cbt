package com.virex.cbt

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

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
  }
}