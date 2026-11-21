#!/usr/bin/env bash
set -euo pipefail

# Script: init-capacitor-apk.sh
# Purpose: Initialize Capacitor Android for a React/Vite/Web project to build an APK

APP_NAME="${1:-MyWebApp}"
APP_ID="${2:-com.antigravity.webapp}"
WEB_DIR="${3:-dist}"

echo "==> [1/4] Building web application assets..."
if [ -f "package.json" ]; then
  npm run build || {
    echo "Warning: npm run build failed or not found, continuing with existing files in $WEB_DIR..."
  }
fi

if [ ! -d "$WEB_DIR" ]; then
  mkdir -p "$WEB_DIR"
  echo "Created empty fallback web directory: $WEB_DIR"
fi

echo "==> [2/4] Installing Capacitor dependencies..."
npm install --save @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli

echo "==> [3/4] Initializing Capacitor configuration..."
npx cap init "$APP_NAME" "$APP_ID" --web-dir "$WEB_DIR"

echo "==> [4/4] Adding Android native platform..."
if [ ! -d "android" ]; then
  npx cap add android
else
  echo "Android directory already exists, syncing assets..."
  npx cap sync android
fi

echo "==> Done! Android project generated in ./android"
echo "You can now build the APK via Gradle or push to GitHub Actions."
