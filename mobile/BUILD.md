# Android Build Guide — ZAIan Studio

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java JDK | 17+ | `sdk install java 17-zulu` (sdkman) |
| Android SDK | API 34 | Android Studio → SDK Manager |
| Node.js | 20+ | https://nodejs.org |

Set environment variables:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
export ANDROID_HOME=$HOME/Android/Sdk           # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

---

## Quick Start (Debug APK)

```bash
cd mobile
npm install
npx cap sync android
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Release Build (Signed APK)

### 1. Generate a keystore (one-time)

```bash
keytool -genkey -v \
  -keystore zaian-studio.keystore \
  -alias zaian \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

### 2. Build

```bash
cd mobile/android
./gradlew assembleRelease \
  -PKEYSTORE_PATH=/path/to/zaian-studio.keystore \
  -PKEYSTORE_PASSWORD=<store-pass> \
  -PKEY_ALIAS=zaian \
  -PKEY_PASSWORD=<key-pass>
```

Output: `app/build/outputs/apk/release/app-release.apk`

### 3. App Bundle (Play Store)

```bash
./gradlew bundleRelease \
  -PKEYSTORE_PATH=... -PKEYSTORE_PASSWORD=... \
  -PKEY_ALIAS=zaian -PKEY_PASSWORD=...
```

Output: `app/build/outputs/bundle/release/app-release.aab`

---

## Update App (after web changes)

```bash
cd mobile
npx cap sync android   # copies new web assets + updates plugins
```

No APK rebuild needed — the app loads the live URL from Vercel.

---

## App Configuration

| Setting | Value |
|---------|-------|
| App ID | `com.zaian.studio` |
| App Name | `ZAIan Studio` |
| Min SDK | 22 (Android 5.1+) |
| Target SDK | 34 (Android 14) |
| Production URL | Vercel deployment URL |
| Version | 0.14.0 (build 14) |

Override the server URL for staging:
```bash
CAPACITOR_SERVER_URL=https://staging.example.com npx cap sync android
```
