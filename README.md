# CBT desktop and Android app

## Build the Android app

The Tauri app can be packaged for Android phones as an APK. Install Android
Studio with its Android SDK and NDK, and install a supported JDK before building.
Set `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) and `JAVA_HOME` in your environment,
then open a new terminal in this project:

```powershell
npm install
npm run android:init
npm run android:apk
```

The generated APK is under `src-tauri/gen/android/app/build/outputs/apk`.
For Google Play, build an Android App Bundle instead:

```powershell
npm run android:aab
```

To run the app on a connected Android device during development, enable USB
debugging and run:

```powershell
npm run android:dev
```

The Android dev command forwards port 3000 through ADB and uses
`localhost:3000` for the WebView dev server. Keep the device connected over
ADB while using Android hot reload.

Android uses the native launch splash on Android 12 and later. Its animated
icon resources are kept in `src-tauri/android-splash/res` and are applied to
the generated Tauri Android project automatically by the Android init, dev,
APK, and AAB commands. The operating system controls splash duration; Android
does not support a full-screen launch animation.

The app keeps its SQLite databases and activation state in the app's private
storage. Bundled database files are copied there on first launch; existing
user databases are not overwritten. Android assigns a persistent installation
ID for activation. Reinstalling the app may create a new ID.

## Web development

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
# cbt-desktop
