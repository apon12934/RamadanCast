# RamadanCast Android App - Build Instructions

## Current Status

The Android project structure has been successfully created using Capacitor. However, due to network restrictions in the CI environment, the APK cannot be built automatically as Maven Central and Google's Maven repositories are not accessible.

## What Has Been Completed

✅ Web app built successfully (`dist/` folder)
✅ Capacitor project initialized
✅ Android platform added with proper configuration
✅ App properly configured with:
   - App ID: `com.ramadancast.app`
   - App Name: `RamadanCast`
   - All web assets copied to Android project

## Project Structure

```
android-app/
├── www/                           # Built web app (from dist/)
├── android/                       # Android native project
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── assets/public/     # Web app assets
│   │       └── res/               # Android resources
│   ├── build.gradle              # Android build configuration
│   └── gradlew                   # Gradle wrapper
├── capacitor.config.json         # Capacitor configuration
└── package.json                  # NPM configuration
```

## How to Build the APK Locally

### Prerequisites

1. [Node.js](https://nodejs.org/) v16+
2. [Android Studio](https://developer.android.com/studio) or Android SDK Command-line Tools
3. Java Development Kit (JDK) 11 or higher

### Option 1: Build Using Android Studio (Recommended)

1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to and select the `android-app/android` folder
4. Wait for Gradle sync to complete
5. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**
6. Once complete, find the APK at:
   ```
   android-app/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Option 2: Build Using Command Line

```bash
# Navigate to the android directory
cd android-app/android

# Build the debug APK
./gradlew assembleDebug

# Find the APK at:
# android-app/android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: Build Release APK (Signed)

For a production-ready APK:

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore ramadancast.keystore -alias ramadancast -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Create `android-app/android/keystore.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=ramadancast
   storeFile=ramadancast.keystore
   ```

3. Build the release APK:
   ```bash
   cd android-app/android
   ./gradlew assembleRelease
   ```

4. Find the signed APK at:
   ```
   android-app/android/app/build/outputs/apk/release/app-release.apk
   ```

## Installing the APK on Android Device

1. Enable "Unknown Sources" or "Install Unknown Apps" in your Android device settings
2. Transfer the APK file to your device
3. Tap the APK file to install
4. Grant any requested permissions

## App Features

The Android app is a native wrapper around the RamadanCast web app with:

- ✅ Full offline support (PWA features)
- ✅ Native Android app icon
- ✅ Splash screen
- ✅ Internet permission for API calls
- ✅ Proper app naming and branding

## Updating the Web App

To update the web app content in the Android app:

1. Build the web app:
   ```bash
   npm run build
   ```

2. Copy the new build to the Android project:
   ```bash
   cp -r dist/* android-app/www/
   ```

3. Sync with Capacitor:
   ```bash
   cd android-app
   npx cap sync android
   ```

4. Rebuild the APK using one of the methods above

## Troubleshooting

### Gradle Build Fails

- Ensure you have a stable internet connection
- Clear Gradle cache: `./gradlew clean`
- Delete `.gradle` folder and retry
- Update Gradle wrapper: `./gradlew wrapper --gradle-version=8.2`

### App Crashes on Launch

- Check that all web assets are properly copied to `android/app/src/main/assets/public/`
- Run `npx cap sync android` to ensure assets are synced

### White Screen on App Open

- Check the web app works in a browser first
- Ensure the `index.html` is in the correct location
- Check Android Logcat for JavaScript errors

## Support

For issues or questions:
- GitHub: https://github.com/apon12934/RamadanCast
- Author: Alamin Islam Apon
