#!/usr/bin/env bash
set -euo pipefail

# Script: install-apk-device.sh
# Purpose: Install APK on Android device via Shizuku rish or ADB

APK_PATH="${1:-}"

if [ -z "$APK_PATH" ] || [ ! -f "$APK_PATH" ]; then
  echo "Usage: bash install-apk-device.sh <path-to-apk>"
  exit 1
fi

REAL_PATH=$(realpath "$APK_PATH")

echo "==> Attempting installation of $REAL_PATH..."

# 1. Try Shizuku elevated shell (rish)
if command -v rish >/dev/null 2>&1; then
  echo "==> Using Shizuku (rish)..."
  if rish -c "pm install -r -d '$REAL_PATH'"; then
    echo "==> Successfully installed via Shizuku!"
    exit 0
  else
    echo "Warning: Shizuku install failed. Falling back to ADB..."
  fi
fi

# 2. Try standard ADB
if command -v adb >/dev/null 2>&1; then
  echo "==> Using ADB..."
  adb install -r -d "$REAL_PATH"
  echo "==> Successfully installed via ADB!"
  exit 0
fi

echo "Error: Neither Shizuku (rish) nor adb was able to install the APK."
echo "Please make sure Shizuku service is running or an ADB device is connected."
exit 1
