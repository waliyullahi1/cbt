import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
)
const androidRoot = path.join(
  projectRoot,
  "src-tauri",
  "gen",
  "android",
)
const mainSource = path.join(
  androidRoot,
  "app",
  "src",
  "main",
)

if (!fs.existsSync(mainSource)) {
  throw new Error(
    "Generated Android project not found. Run npm run android:init first.",
  )
}

fs.cpSync(
  path.join(projectRoot, "src-tauri", "android-splash", "res"),
  path.join(mainSource, "res"),
  { recursive: true },
)

function updateFile(relativePath, update) {
  const filePath = path.join(mainSource, relativePath)
  const original = fs.readFileSync(filePath, "utf8")
  const updated = update(original)

  if (updated === original) {
    return
  }

  fs.writeFileSync(filePath, updated)
}

updateFile("AndroidManifest.xml", (manifest) => {
  const activityTag = /<activity\b(?=[^>]*android:name="\.MainActivity")[^>]*>/
  const match = manifest.match(activityTag)

  if (!match) {
    throw new Error("Could not find the Android MainActivity manifest entry.")
  }

  const updatedTag = match[0]
    .replace(/\s+android:theme="[^"]*"/, "")
    .replace(
      "<activity",
      '<activity android:theme="@style/Theme.app.Splash"',
    )

  return manifest.replace(match[0], updatedTag)
})

updateFile(
  path.join("java", "com", "virex", "cbt", "MainActivity.kt"),
  (activity) => {
    let updated = activity.replace(/\r\n/g, "\n")

    if (!updated.includes("import androidx.core.splashscreen.SplashScreen")) {
      updated = updated.replace(
        /^import android\.os\.Bundle$/m,
        "import android.os.Bundle\nimport androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen",
      )
    }

    if (!updated.includes("installSplashScreen()")) {
      updated = updated.replace(
        /^([ \t]*)enableEdgeToEdge\(\)$/m,
        "$1installSplashScreen()\n$1enableEdgeToEdge()",
      )
    }

    if (!updated.includes("installSplashScreen()")) {
      throw new Error("Could not add the native splash setup to MainActivity.")
    }

    return updated
  },
)

const gradlePath = path.join(androidRoot, "app", "build.gradle.kts")
const gradle = fs.readFileSync(gradlePath, "utf8")
if (!gradle.includes('androidx.core:core-splashscreen')) {
  const updated = gradle.replace(
    /dependencies\s*\{/,
    (block) =>
      `${block}\n    implementation("androidx.core:core-splashscreen:1.0.1")`,
  )

  if (updated === gradle) {
    throw new Error("Could not add AndroidX core-splashscreen dependency.")
  }

  fs.writeFileSync(gradlePath, updated)
}

console.info("Configured the native ExamTips Android launch splash.")
