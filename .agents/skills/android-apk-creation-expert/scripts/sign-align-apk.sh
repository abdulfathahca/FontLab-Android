#!/usr/bin/env bash
set -euo pipefail

# Script: sign-align-apk.sh
# Purpose: Generate keystore if needed, and sign/verify an APK file

INPUT_APK="${1:-}"
OUTPUT_APK="${2:-${INPUT_APK%.*}-signed.apk}"
KEYSTORE="${3:-debug.keystore}"
KEY_ALIAS="${4:-androiddebugkey}"
STORE_PASS="${5:-android}"

if [ -z "$INPUT_APK" ] || [ ! -f "$INPUT_APK" ]; then
  echo "Usage: bash sign-align-apk.sh <input-apk> [output-apk] [keystore-path] [key-alias] [password]"
  exit 1
fi

if [ ! -f "$KEYSTORE" ]; then
  echo "==> Generating debug keystore: $KEYSTORE"
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$STORE_PASS" \
    -keypass "$STORE_PASS" \
    -dname "CN=Android Debug,O=Android,C=US"
fi

echo "==> Signing APK with apksigner..."
apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass "pass:$STORE_PASS" \
  --key-pass "pass:$STORE_PASS" \
  --out "$OUTPUT_APK" \
  "$INPUT_APK"

echo "==> Verifying signature..."
apksigner verify -v "$OUTPUT_APK"

echo "==> Success! Signed APK generated at: $OUTPUT_APK"
