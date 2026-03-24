#!/bin/bash

# RamadanCast Android APK Build Script
# This script builds the Android APK from the Capacitor project

set -e  # Exit on error

echo "======================================"
echo "RamadanCast Android APK Builder"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in android directory
if [ ! -f "gradlew" ]; then
    echo -e "${RED}Error: This script must be run from the android-app/android directory${NC}"
    echo "Usage: cd android-app/android && ../build-apk.sh"
    exit 1
fi

# Check for Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java is not installed${NC}"
    echo "Please install JDK 11 or higher"
    exit 1
fi

# Print Java version
echo -e "${GREEN}Java version:${NC}"
java -version
echo ""

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
./gradlew clean

# Build debug APK
echo -e "${YELLOW}Building debug APK...${NC}"
./gradlew assembleDebug

# Check if build was successful
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo -e "${GREEN}======================================"
    echo "✅ BUILD SUCCESSFUL!"
    echo "======================================${NC}"
    echo ""
    echo "APK Location:"
    echo "  $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "APK Size:"
    ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print "  " $5}'
    echo ""
    echo "To install on your Android device:"
    echo "  1. Enable 'Unknown Sources' in Settings"
    echo "  2. Transfer the APK to your device"
    echo "  3. Tap to install"
    echo ""

    # Create output directory and copy APK
    mkdir -p ../../apk-output
    cp app/build/outputs/apk/debug/app-debug.apk ../../apk-output/RamadanCast-v1.0-debug.apk
    echo -e "${GREEN}APK also copied to: android-app/apk-output/RamadanCast-v1.0-debug.apk${NC}"
    echo ""
else
    echo -e "${RED}======================================"
    echo "❌ BUILD FAILED"
    echo "======================================${NC}"
    echo "Check the error messages above for details"
    exit 1
fi
