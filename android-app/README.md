# 🌙 RamadanCast Android App

This directory contains the complete Android app project for RamadanCast, built using [Capacitor](https://capacitorjs.com/).

## 📱 What's Inside

This is a **ready-to-build** Android project that wraps the RamadanCast web app into a native Android application. Everything is pre-configured and ready to build - you just need to run the build command!

### Project Structure

```
android-app/
├── android/                      # Native Android project (Capacitor-generated)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── assets/public/   # Your web app files
│   │   │   ├── res/             # Android resources & icons
│   │   │   └── java/            # Native Java code
│   │   └── build.gradle         # App-level build config
│   ├── build.gradle             # Project-level build config
│   └── gradlew                  # Gradle wrapper (build tool)
├── www/                         # Built web app
├── capacitor.config.json        # Capacitor configuration
├── package.json                 # NPM configuration
├── build-apk.sh                 # Automated build script ⭐
└── BUILD_INSTRUCTIONS.md        # Detailed build guide
```

## 🚀 Quick Start - Build the APK

### Prerequisites

- **Java Development Kit (JDK)** 11 or higher
  - Check: `java -version`
  - Install: [Download JDK](https://adoptium.net/)

### Build Steps

#### Option 1: Using the Build Script (Easiest)

```bash
cd android-app/android
../build-apk.sh
```

The script will:
- ✅ Clean previous builds
- ✅ Build the debug APK
- ✅ Copy the APK to `apk-output/` folder
- ✅ Show you the APK location

#### Option 2: Manual Build

```bash
cd android-app/android
./gradlew assembleDebug
```

Find your APK at:
```
android-app/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Option 3: Using Android Studio

1. Open Android Studio
2. `File > Open` → Select the `android-app/android` folder
3. Wait for Gradle sync
4. `Build > Build Bundle(s) / APK(s) > Build APK(s)`

## 📦 App Details

- **Package Name:** `com.ramadancast.app`
- **App Name:** RamadanCast
- **Version:** 1.0
- **Min SDK:** Android 6.0 (API 23)
- **Target SDK:** Android 14 (API 34)

## 📲 Installing the APK

### On Physical Device

1. **Enable Installation from Unknown Sources:**
   - Go to `Settings > Security`
   - Enable "Unknown Sources" or "Install Unknown Apps"

2. **Transfer the APK:**
   - Connect your device via USB and copy the APK
   - Or email the APK to yourself
   - Or use a cloud service (Google Drive, Dropbox, etc.)

3. **Install:**
   - Tap the APK file on your device
   - Follow the installation prompts
   - Grant any requested permissions

### On Emulator

```bash
adb install android-app/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 Updating the Web App

If you make changes to the web app and want to rebuild:

```bash
# 1. Build the web app (from project root)
npm run build

# 2. Copy to Android project
cp -r dist/* android-app/www/

# 3. Sync with Capacitor
cd android-app
npx cap sync android

# 4. Rebuild the APK
cd android
./gradlew assembleDebug
```

## 🔐 Building a Release APK (Production)

For a production-ready, signed APK:

### 1. Generate a Keystore

```bash
keytool -genkey -v -keystore ramadancast.keystore \
  -alias ramadancast \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 2. Configure Signing

Create `android-app/android/keystore.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=ramadancast
storeFile=ramadancast.keystore
```

### 3. Build Release APK

```bash
cd android-app/android
./gradlew assembleRelease
```

Release APK location:
```
android-app/android/app/build/outputs/apk/release/app-release.apk
```

## ✨ Features

The Android app includes:

- ✅ Native Android app wrapper
- ✅ Proper app icon and branding
- ✅ Splash screen
- ✅ Internet permission for prayer times API
- ✅ Network state permission
- ✅ Full PWA capabilities
- ✅ Offline support via Service Worker
- ✅ Optimized for performance

## 🐛 Troubleshooting

### Build Fails with "Could not resolve"

**Problem:** Gradle can't download dependencies

**Solution:**
- Ensure you have a stable internet connection
- Clear Gradle cache: `./gradlew clean`
- Delete the `.gradle` folder and retry

### App Shows White Screen

**Problem:** Web assets not loaded

**Solution:**
- Run `npx cap sync android` from `android-app` directory
- Check that `www/` folder contains the built web app
- Rebuild the web app: `npm run build`

### Permission Denied on build-apk.sh

**Problem:** Script is not executable

**Solution:**
```bash
chmod +x build-apk.sh
```

### Java Not Found

**Problem:** JDK not installed or not in PATH

**Solution:**
- Install JDK: https://adoptium.net/
- Add to PATH or use Android Studio's embedded JDK

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) - Detailed build instructions

## 💡 Notes

- The original web project remains **completely untouched** - this is a separate Android wrapper
- No changes were made to the main RamadanCast project
- This Android app is safe to install - it's just your web app in native Android wrapper
- The APK is signed with a debug key - for production, create a release build with your own keystore

## 🆘 Support

For issues or questions:
- **GitHub:** https://github.com/apon12934/RamadanCast
- **Author:** Alamin Islam Apon

---

**Built with ❤️ using Capacitor** | Ramadan Mubarak! 🌙
