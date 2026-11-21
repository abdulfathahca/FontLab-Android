#!/usr/bin/env bash
set -euo pipefail

echo "==> [1/6] Compiling Android resources..."
mkdir -p bin
aapt2 compile --dir res -o compiled_res.zip

echo "==> [2/6] Linking resources & assets..."
aapt2 link -I "$PREFIX/share/android/android.jar" \
  --manifest AndroidManifest.xml \
  --java src \
  -o unaligned.apk \
  -A assets \
  compiled_res.zip

echo "==> [3/6] Compiling Java classes..."
javac -source 1.8 -target 1.8 \
  -cp "$PREFIX/share/android/android.jar:src" \
  -d bin src/com/antigravity/fontlab/*.java

echo "==> [4/6] Creating Dalvik executable (classes.dex)..."
dx --dex --output=classes.dex bin/

echo "==> [5/6] Adding classes.dex to APK package..."
jar uf unaligned.apk classes.dex

echo "==> [6/6] Signing APK..."
if [ ! -f debug.keystore ]; then
  keytool -genkeypair -v \
    -keystore debug.keystore \
    -alias androiddebugkey \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass android \
    -keypass android \
    -dname "CN=FontLab Android,O=Antigravity,C=US"
fi

apksigner sign \
  --ks debug.keystore \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out FontLab-8-Android.apk \
  unaligned.apk

echo "==> Verifying signature..."
apksigner verify -v FontLab-8-Android.apk

echo "==> Copying to /storage/emulated/0/Download/FontLab-8-Android.apk..."
cp -f FontLab-8-Android.apk /storage/emulated/0/Download/FontLab-8-Android.apk

echo "==> Build finished successfully! APK: /storage/emulated/0/Download/FontLab-8-Android.apk"
