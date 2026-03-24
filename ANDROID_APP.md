# 📱 Android App - Build Instructions

## Overview

A complete Android app version of RamadanCast has been created in the `android-app/` directory. This is a **native Android wrapper** around the web app using [Capacitor](https://capacitorjs.com/).

## 🎯 Quick Download (No PC Required!)

**Don't have access to your PC?** You can download a pre-built APK directly from GitHub Actions!

👉 **[Click here for download instructions](DOWNLOAD_APK.md)**

Or go to: [GitHub Actions](https://github.com/apon12934/RamadanCast/actions) → "Build Android APK" workflow → Download from artifacts

---

## 🔨 Build It Yourself (If You Have a PC)

## 🎯 What's Ready

✅ Complete Android project structure created
✅ Web app built and integrated
✅ Capacitor configured
✅ Android platform added and configured
✅ App properly branded as "RamadanCast"
✅ All necessary files in place
✅ Automated build script provided

## 🚀 Quick Build (3 Steps)

### Prerequisites
- Java Development Kit (JDK) 11+ ([Download](https://adoptium.net/))

### Build the APK

```bash
# Step 1: Navigate to the Android directory
cd android-app/android

# Step 2: Run the build script
../build-apk.sh

# Step 3: Find your APK
# Location: android-app/apk-output/RamadanCast-v1.0-debug.apk
```

That's it! The APK will be ready to install on any Android device.

## 📖 Detailed Instructions

For comprehensive build instructions, troubleshooting, and advanced options, see:

**[android-app/README.md](android-app/README.md)**

This includes:
- Alternative build methods (Android Studio, manual Gradle)
- How to build a release APK
- Installation instructions
- Troubleshooting guide
- How to update the app

## 📲 Installing the APK

1. Enable "Unknown Sources" in your Android device settings
2. Transfer the APK to your device
3. Tap to install

## 🔄 The Project is Untouched!

**Important:** No changes were made to the original RamadanCast web project. The Android app is in a completely separate `android-app/` directory and doesn't affect anything else.

## 📁 What's in android-app/

```
android-app/
├── README.md                    # Full Android app documentation
├── BUILD_INSTRUCTIONS.md        # Detailed build guide
├── build-apk.sh                 # Automated build script
├── android/                     # Native Android project
├── www/                         # Built web app
└── capacitor.config.json        # Capacitor config
```

## ✨ App Features

- Native Android app
- Works offline (PWA)
- Proper app icon and branding
- Splash screen
- Optimized for Android

## 🆘 Need Help?

Check the [android-app/README.md](android-app/README.md) for:
- Troubleshooting guide
- Alternative build methods
- FAQ

---

Built with ❤️ | Ramadan Mubarak! 🌙
