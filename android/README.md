# Octolabs Android development build

An online WebView shell for the published games at `https://octolabs.app/`, with OctoQuiz navigation at `https://octoquiz.octolabs.app/`. This is a new, separate Android app (`app.octolabs.games`); it does not replace the OctoHome or Letters & Numbers APKs.

- Android 8.0/API 26 or newer; requires a working internet connection and a current Android System WebView. Offline games are not bundled.
- Game rules, service backends and saves come from the live site. WebView local saves are separate from the phone's browser; installing this APK does not import browser progress.
- Only those two HTTPS hosts navigate inside the app. Other HTTPS links/downloads open the browser; non-HTTPS navigation is blocked. No native JavaScript bridge, file access, content access, cleartext traffic or SSL bypass. Only INTERNET permission is requested.
- Network/main-page errors show a native Try again screen; Android Back follows WebView history before leaving. Existing JavaScript confirmation prompts are supported.
- Version `0.1.0-dev` is signed with a generated development key, not a stable release key or Play Store signing. CI generates a new key for each fresh run. A different run's APK may require uninstalling the old app, which deletes its local saves. Do not uninstall an app with progress you want to keep.
- WebView clipboard/share, downloads, actual keyboard behavior and Android installation/runtime must still be checked on a physical device or emulator. Building and signature checks alone do not establish those behaviors.

## Build

Use `.github/workflows/octolabs-android.yml` on a pull request or main. It installs the JDK, Android platform 35 and build-tools 35.0.0, builds with the SDK tools, verifies signature/alignment, checks the packaged application identity and INTERNET-only permission, and uploads the development APK, SHA-256 checksum and source-commit metadata. No paid signing/build service is used.

For a local build, set `ANDROID_HOME` to that SDK and run `python3 android/build.py` with a JDK providing `javac`, `jar` and `keytool` on PATH. Outputs are in `android/build/`; do not commit the keystore or build intermediates. The artifact is a development APK, not a production/store release.

The initial target SDK is 34, following the repository's existing sideload app shell; SDK 35 supplies the compiler/platform tools. A target-SDK update and native edge-to-edge/device validation remain separate work before store distribution.
