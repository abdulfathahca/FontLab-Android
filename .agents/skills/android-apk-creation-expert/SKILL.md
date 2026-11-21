---
name: android-apk-creation-expert
description: >-
  Expert skill for creating, compiling, packaging, signing, and deploying Android APKs.
  Use this skill whenever the user asks to build an Android APK, create an APK from scratch,
  convert web applications (React, Vite, Vue, HTML/JS) into native Android APKs (via Capacitor or WebView),
  build APKs directly in Android terminal (using aapt2, d8/dx, javac, and apksigner), configure
  Gradle/AGP build pipelines, set up automated GitHub Actions CI/CD to build APKs, or install
  and debug APKs on physical Android devices using Shizuku rish or adb.
---

# Android APK Creation Expert

This skill guides you through the complete lifecycle of creating, compiling, packaging, signing, and deploying Android Application Packages (APKs).

Whether working with a web app (React, Vite, Vue), a standard native Android Gradle project, or building standalone APKs directly inside the terminal on an Android device, this runbook provides the exact procedures, commands, and best practices.

---

## 1. APK Build Architecture Decision Matrix

Choose the fastest and most robust path depending on the current codebase:

| Project Type | Target Architecture | Recommended Approach | Toolchain Required |
| :--- | :--- | :--- | :--- |
| **Web Project (React/Vite/Vue)** | Hybrid Native APK | **Capacitor Android** | Node.js, npm, Java 17+, Android SDK or GitHub CI |
| **Simple Web / HTML Dashboard** | Single-Activity WebView | **Native WebView Shell** | `aapt2`, `d8`, `javac`, `apksigner` |
| **Kotlin/Java Android App** | Standard Native APK | **Gradle Wrapper (`./gradlew`)** | OpenJDK 17/21, Android SDK |
| **Cloud / Automated CI** | GitHub Actions Pipeline | **`.github/workflows/build-apk.yml`** | None local; runs in GitHub Ubuntu runners |
| **Native Device Shell (Offline)** | Minimalist Standalone APK | **AGY `pkg` Toolchain** | `pkg install openjdk-17 aapt2 dx apksigner` |

---

## 2. Converting Web Apps (React, Vite, Tailwind) to APK via Capacitor

For projects with modern frontend web stacks (like Vite, React, Vue, Svelte):

### Step 1: Prepare the Web App
Ensure the web app has a production build output (typically `dist/` or `build/`):
```bash
npm run build
```

### Step 2: Install Capacitor Core & Android
```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
```

### Step 3: Initialize Capacitor
Initialize Capacitor with your app name and package ID:
```bash
npx cap init "AppName" "com.example.app" --web-dir "dist"
```

### Step 4: Add the Android Platform
```bash
npx cap add android
```
This generates a complete native Android project in `./android/` with standard Gradle build configuration, `AndroidManifest.xml`, icons, and native WebView wrapper.

### Step 5: Sync Assets
Whenever frontend code changes:
```bash
npm run build
npx cap sync android
```

---

## 3. Automated Cloud APK Creation via GitHub Actions (CI/CD)

The most reliable way to produce release or debug APKs without installing 10GB+ of local Android SDK and NDK is GitHub Actions.

Create `.github/workflows/build-apk.yml`:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Setup Node.js (if Web/Capacitor project)
        if: hashFiles('package.json') != ''
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Build Web Assets (if applicable)
        if: hashFiles('package.json') != ''
        run: |
          npm ci
          npm run build --if-present
          if [ -f "capacitor.config.json" ] || [ -f "capacitor.config.ts" ]; then
            npx cap sync android
          fi

      - name: Make Gradle Executable
        run: |
          if [ -f "android/gradlew" ]; then
            chmod +x android/gradlew
          elif [ -f "gradlew" ]; then
            chmod +x gradlew
          fi

      - name: Build Debug APK
        run: |
          if [ -d "android" ]; then
            cd android && ./gradlew assembleDebug --stacktrace
          else
            ./gradlew assembleDebug --stacktrace
          fi

      - name: Locate and Rename APK
        run: |
          APK_PATH=$(find . -name "*.apk" -path "*/build/outputs/apk/debug/*" | head -n 1)
          echo "Found APK at: $APK_PATH"
          mkdir -p output_apk
          cp "$APK_PATH" output_apk/app-debug.apk

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: output_apk/app-debug.apk
          retention-days: 14
```

---

## 4. Standalone Terminal APK Toolchain on Native Android (`pkg`)

Inside Antigravity on Android, you can compile and package lightweight Android APKs directly using native packages:

### Prerequisites:
```bash
pkg install openjdk-17 aapt2 dx apksigner
```

### Complete Compilation Sequence:
1. **Compile Resources with `aapt2`:**
   ```bash
   aapt2 compile --dir res/ -o compiled_res.zip
   ```
2. **Link Resources & Generate `resources.ap_` and `R.java`:**
   ```bash
   aapt2 link -I "$PREFIX/share/android/android.jar" \
     --manifest AndroidManifest.xml \
     --java src \
     -o intermediate.apk \
     compiled_res.zip
   ```
3. **Compile Java Sources:**
   ```bash
   javac -cp "$PREFIX/share/android/android.jar" -d bin src/**/*.java
   ```
4. **Convert Bytecode to Dalvik Executable (`classes.dex`):**
   ```bash
   dx --dex --output=classes.dex bin/
   ```
5. **Package DEX into APK:**
   ```bash
   cp intermediate.apk unaligned.apk
   zip -u unaligned.apk classes.dex
   ```
6. **Sign the APK:**
   ```bash
   apksigner sign --ks debug.keystore \
     --ks-pass pass:android \
     --out final-app.apk unaligned.apk
   ```

---

## 5. Keystore Generation & APK Signing

To generate a debug keystore for signing:
```bash
keytool -genkeypair -v \
  -keystore debug.keystore \
  -alias androiddebugkey \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass android \
  -keypass android \
  -dname "CN=Android Debug,O=Android,C=US"
```

To sign an existing unaligned APK:
```bash
apksigner sign --ks debug.keystore \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out app-signed.apk \
  app-unsigned.apk
```

To verify APK signature:
```bash
apksigner verify -v app-signed.apk
```

---

## 6. On-Device APK Installation & Testing (Shizuku `rish`)

On Android in Antigravity, APKs can be directly installed and launched via Shizuku elevated shell (`rish`):

### 1. Install APK directly:
```bash
rish -c "pm install -r -d /absolute/path/to/app-signed.apk"
```

### 2. Verify installation:
```bash
rish -c "pm list packages | grep com.example.app"
```

### 3. Launch the app:
```bash
rish -c "am start -n com.example.app/.MainActivity"
```

### 4. Capture runtime logs:
```bash
rish -c "logcat -d -t 150 | grep -E 'AndroidRuntime|FATAL|com.example.app'"
```

---

## 7. Common Pitfalls & Solutions

1. **`Permission denied (126)` on shared storage (`/storage/emulated/0`)**:
   Shared storage is mounted `noexec`. Always copy or build APK binaries within `$HOME` or userspace (`$PREFIX`).
2. **`fatal: detected dubious ownership` in Git**:
   ```bash
   export GIT_CONFIG_NOSYSTEM=1
   git config --global --add safe.directory "*"
   ```
3. **Android SSL Certificate Resolution**:
   When cloning or downloading dependencies via git/curl on Android userspace:
   ```bash
   export GIT_SSL_CAINFO=/data/user/0/com.agy/files/usr/etc/tls/cert.pem
   ```
4. **`CLEAR_TEXT_TRAFFIC` error on Android 9+**:
   If WebView or API requests fail in the APK, add `android:usesCleartextTraffic="true"` to `<application>` in `AndroidManifest.xml` or use HTTPS.
5. **`minSdkVersion` Compatibility**:
   Ensure `minSdkVersion >= 24` (Android 7.0+) for modern WebView and JavaScript ES6+ compatibility.
