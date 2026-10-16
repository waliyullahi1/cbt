# Android Release Signing

This guide documents the existing Examtips Android signing setup and safe
release workflow. It contains no passwords, private keys, or other credentials.

## Project signing setup

- Project root: `C:\Users\HP\Documents\code\CBT\cbt`
- Generated Android project and Gradle root: `src-tauri\gen\android`
- Android application module: `src-tauri\gen\android\app`
- Release Gradle configuration: `src-tauri\gen\android\app\build.gradle.kts`
- Local signing properties: `src-tauri\gen\android\keystore.properties`
- Release keystore path currently configured: `C:\Users\HP\cbt-release-key.jks`
- Release alias currently configured: `cbt`
- Application ID: `com.virex.cbt`

The generated `app\build.gradle.kts` loads `keystore.properties` from the
generated Android project root. For each setting, the corresponding
`CBT_RELEASE_*` environment variable takes precedence over the property file:

| Release setting | Environment variable | `keystore.properties` key | Used by Gradle |
|---|---|---|---|
| Keystore file | `CBT_RELEASE_KEYSTORE_FILE` | `storeFile` | `storeFile = rootProject.file(releaseStoreFile)` |
| Keystore password | `CBT_RELEASE_KEYSTORE_PASSWORD` | `storePassword` | `storePassword = releaseStorePassword` |
| Key alias | `CBT_RELEASE_KEY_ALIAS` | `keyAlias` | `keyAlias = releaseKeyAlias` |
| Key password | `CBT_RELEASE_KEY_PASSWORD` | `keyPassword` | `keyPassword = releaseKeyPassword` |

Gradle assigns this signing config to the `release` build type only when all
four values are nonblank. The configured property file is ignored by Git, as
are `.jks` and `.keystore` files. Keep it local and do not add it to source
control. Tauri's Android project is generated under `src-tauri\gen\android`;
after running Android initialization, check that the signing configuration
still exists before relying on it.

**Current local status:** The `storePassword` and `keyPassword` entries were
removed from the local `keystore.properties` at the user's request. The
`storeFile` and `keyAlias` entries remain. No passwords are now supplied by
that file; a release build cannot use this local signing configuration until
valid credentials for the original key are recovered. No replacement key was
created.

The inspected `src-tauri\tauri.conf.json` sets `npm run build` as Tauri's
`beforeBuildCommand`. The `android:apk` script in the root `package.json`
first runs `scripts\configure-android-splash.mjs`, then runs
`tauri android build --apk`.

## Build the next release

Use PowerShell from the project root:

```powershell
Set-Location "C:\Users\HP\Documents\code\CBT\cbt"
npm run android:apk
```

The script's exit code must be zero. Locate the generated APKs without
assuming a particular ABI or universal output directory:

```powershell
Get-ChildItem -LiteralPath "src-tauri\gen\android\app\build\outputs\apk" -Recurse -File -Filter "*.apk"
```

Inspect an APK's public signing certificate and SHA-256 fingerprint:

```powershell
keytool -printcert -jarfile "C:\path\to\app.apk"
```

Run this once for the newly built APK and once for the original distributed
APK, if available. Compare the `SHA256:` certificate fingerprints. Matching
fingerprints confirm the APKs use the same signing certificate; also check
that the package identity is `com.virex.cbt` and the new version code is
greater than the installed version. Do not claim update compatibility without
the comparison evidence.

## Before Every Release

- Confirm `C:\Users\HP\cbt-release-key.jks` is present and is the original key.
- Confirm the local `keystore.properties` path and alias are correct.
- Confirm no `CBT_RELEASE_*` environment variable unintentionally overrides
  the local values.
- Ensure signing values are available from your authorized password manager
  or other secure record; do not put them in source control, shell history,
  logs, or chat.
- Run `npm run android:apk` from the project root and check its exit status.
- Locate the APK and compare its certificate SHA-256 fingerprint with the
  distributed APK when available.
- Keep a protected backup of the original keystore and its credentials.

## What to Do If Signing Fails

1. Stop after the first repeatable signing error. Do not keep retrying the
   same build with the same rejected credentials.
2. Check that the configured path points to the original keystore and that
   the file exists. Check for an environment-variable override before trusting
   the local property file.
3. Check the property names and alias in
   `src-tauri\gen\android\keystore.properties`. The build reads `storeFile`,
   `storePassword`, `keyAlias`, and `keyPassword`; the environment variable
   names and precedence are listed above. The inspected build script does not
   read signing values from Gradle project properties. No signing-related
   process, user, or machine environment variables, or user Gradle properties,
   were configured during the investigation below.
4. If the store password is available from an authorized secure record, use
   this interactive command to check that the file opens and the alias exists.
   `keytool` prompts for the password; do not put it in the command line:

   ```powershell
   keytool -list -v -keystore "C:\Users\HP\cbt-release-key.jks" -alias cbt
   ```

5. If that check succeeds, use the authenticated local values for one release
   build. A later `Cannot recover key` or key-password error means the key
   password still needs to be checked against an authorized record. A missing
   alias indicates an alias mismatch; a missing-file or file-open error points
   to a path, access, or file problem.
6. If the store password is rejected, do not change the alias, regenerate the
   key, or change the application ID. Check secure password records and
   authorized keystore backups. A rejected password alone cannot establish
   whether the password is wrong, the keystore format assumption is wrong, or
   the file is damaged. Do not attempt password cracking or upload the key to
   an online service.
7. If the original password and all usable backups are unavailable, stop. Do
   not replace the key. Obtain the original signing credentials from their
   secure record or backup before attempting another release.

Checks that do not require the keystore password include confirming that the
configured path exists, checking whether expected environment variables are
set, verifying the Gradle property-to-signing-config mapping, and comparing
public certificate fingerprints from APKs that can already be opened. These
checks do not prove the key can sign a new release. Without the store password,
the keystore's alias, certificate, and private-key usability have not been
verified.

## What I Must Never Change

- Never delete, overwrite, rename, or regenerate the original keystore.
- Never create a new release key as an automatic fallback.
- Never change the Android application ID as a shortcut for a signing error.
- Never advise users to uninstall the existing app as a first-line fix.
- Never commit a keystore, password, private key, or credential-bearing
  properties file.
- Never claim that a newly built APK can update existing installations until
  its signing identity and package identity have been verified.

Direct APK updates generally require the same signing identity and compatible
package identity. Losing access to the original signing key may prevent
updating existing installations. A new application identity is a separate
migration decision and must not be silently substituted for this app.

## Next Time I Want to Build Examtips

1. Open PowerShell and change to
   `C:\Users\HP\Documents\code\CBT\cbt`.
2. Confirm the original keystore is safe and the credentials are available
   locally. Do not paste them into chat or commit them.
3. Run `npm run android:apk`.
4. Locate the APK under
   `src-tauri\gen\android\app\build\outputs\apk`.
5. Inspect its certificate with `keytool -printcert -jarfile` and compare the
   SHA-256 fingerprint with the distributed APK when available.

## Investigation record

**Date:** 2026-10-14

### Confirmed

- The existing generated Gradle script reads release values from
  `src-tauri\gen\android\keystore.properties`, with the four documented
  environment variables taking precedence.
- The local properties file is Git-ignored and contains nonempty values for
  the configured signing properties at the time of the initial investigation.
  Following the user's later request, both password entries were removed;
  only the keystore path and alias remain. Secret values are intentionally not
  recorded here.
- The configured keystore path is `C:\Users\HP\cbt-release-key.jks`, the
  configured alias is `cbt`, and the file exists.
- No matching keystore backup files were found in the project or Downloads
  folders searched during this investigation.
- No release APK was found in the generated Android APK output directory.
- The application ID in the generated Gradle configuration is
  `com.virex.cbt`.
- Git status was checked before editing. The existing unrelated changes were
  left untouched.

### Reported and corroborated by user-supplied output

- On 2026-10-14, the user supplied the release build log showing
  `:app:packageUniversalRelease` failed with
  `Failed to read key cbt from store "C:\Users\HP\cbt-release-key.jks":
  keystore password was incorrect`.
- The user also supplied output from
  `keytool -list -v -keystore "C:\Users\HP\cbt-release-key.jks" -alias cbt`.
  It failed in `PKCS12KeyStore.engineLoad` with
  `keystore password was incorrect` and an `UnrecoverableKeyException`.
- These supplied outputs confirm that the attempted store password cannot
  open the file. They do not distinguish a forgotten/incorrect password from
  a damaged or unexpected keystore file. The configured alias and key password
  cannot be authenticated until the keystore opens.

### Not verified / unresolved

- The original signing identity remains **unverified**. The key file was not
  modified or replaced.
- The local `storePassword` and `keyPassword` properties have been removed.
  No new key was generated. The original password must be recovered to sign
  updates for the existing app identity.
- No candidate keystore backups were found in the project or Downloads folders
  searched. No release APK was found in the generated Android output
  directory, and no original distributed APK was supplied for comparison.
- No Gradle signing implementation or app identity was changed. The two local
  password properties were removed at the user's request. No release APK build
  was run after this change; with the password entries absent, this local
  configuration cannot sign a release.
- Android keystore format, alias presence, private-key integrity, key password,
  and compatibility with already installed app copies remain unverified.

### Files inspected

- `package.json`
- `src-tauri\tauri.conf.json`
- `src-tauri\tauri.android.conf.json`
- `src-tauri\gen\android\app\build.gradle.kts`
- `src-tauri\gen\android\keystore.properties` (secret values not displayed)
- `src-tauri\gen\android\gradle.properties`
- `src-tauri\gen\android\local.properties`
- `.gitignore`
- `src-tauri\gen\android\.gitignore`
- `README.md`

### Commands and validation

- `git status --short --untracked-files=all` — completed; existing changes
  were preserved.
- `npm run android:apk` — **not run**; the configured store password is
  reported rejected and no safe signing fix was available.
- `.\gradlew.bat :app:tasks --quiet` from `src-tauri\gen\android` — completed
  successfully (exit code 0), with nonfatal Java/Kotlin warnings. This
  non-packaging task-discovery check does not authenticate the signing password
  or produce an APK.
- Removed `storePassword` and `keyPassword` lines from the ignored local
  `src-tauri\gen\android\keystore.properties` file. Verified both keys are
  absent and `storeFile` and `keyAlias` remain; secret values were not printed.
