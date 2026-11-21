# Android APK Build Troubleshooting Guide

## 1. Permission Denied (126) on Android Storage
- **Issue**: Running binaries or scripts in `/storage/emulated/0` fails with `Permission denied`.
- **Reason**: Android mounts external storage with `noexec`.
- **Solution**: Always execute scripts with explicit interpreters (`bash script.sh`, `python script.py`) or move compiled executables to internal storage (`$PREFIX/bin` or `$HOME`).

## 2. Git "detected dubious ownership"
- **Issue**: Git refuses to operate inside shared storage paths.
- **Solution**:
  ```bash
  export GIT_CONFIG_NOSYSTEM=1
  git config --global --add safe.directory "*"
  ```

## 3. Git / Curl SSL Certificate Errors
- **Issue**: `error adding trust anchors from file: /data/data/com.termux/files/...`
- **Solution**:
  Point Git to the valid Android userspace CA bundle:
  ```bash
  git config --global http.sslCAInfo /data/user/0/com.agy/files/usr/etc/tls/cert.pem
  ```

## 4. Cleartext HTTP Traffic Blocked
- **Issue**: The app cannot connect to backend HTTP APIs on Android 9+.
- **Solution**:
  Add `android:usesCleartextTraffic="true"` inside `<application>` in `AndroidManifest.xml` or use HTTPS.

## 5. Dex Version / Java Bytecode Mismatch
- **Issue**: `dx` or `d8` fails because class file version is too modern (e.g. Java 17/21 bytecode without desugaring).
- **Solution**:
  Compile Java with `-source 1.8 -target 1.8` when using older `dx`, or use `d8` with `--min-api 26`.
