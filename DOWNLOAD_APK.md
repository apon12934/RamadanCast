# 📱 Download Android APK - Quick Guide

## 🎯 Immediate Solution: Download from GitHub Actions

Since you don't have access to your PC right now, I've set up an automated build workflow that will build the APK for you on GitHub's servers.

### Option 1: Download Pre-built APK (If Available)

1. Go to: https://github.com/apon12934/RamadanCast/actions
2. Click on the latest successful "Build Android APK" workflow run
3. Scroll down to "Artifacts" section
4. Click on "RamadanCast-Android-APK" to download
5. Extract the ZIP file to get the APK
6. Transfer to your phone and install

### Option 2: Trigger a New Build (Manual)

If no build is available yet, you can trigger one:

1. Go to: https://github.com/apon12934/RamadanCast/actions
2. Click on "Build Android APK" workflow (left sidebar)
3. Click "Run workflow" button (on the right)
4. Select the branch (usually 'main' or the current branch)
5. Click "Run workflow"
6. Wait 5-10 minutes for the build to complete
7. Download the APK from the artifacts section (see Option 1 above)

### 📲 Installing the APK

Once you have the APK file on your phone:

1. **Enable Unknown Sources:**
   - Go to Settings → Security
   - Enable "Install Unknown Apps" or "Unknown Sources"
   - Select your browser/file manager and allow installation

2. **Install:**
   - Open the downloaded APK file
   - Tap "Install"
   - Wait for installation to complete
   - Tap "Open" to launch RamadanCast!

### 🔧 Alternative: Build Locally Later

If you prefer to build it yourself when you have access to your PC:

```bash
cd android-app/android
../build-apk.sh
```

The APK will be at: `android-app/apk-output/RamadanCast-v1.0-debug.apk`

### 📝 APK Details

- **File Name:** RamadanCast-v1.0-debug.apk
- **Package:** com.ramadancast.app
- **Size:** ~6-8 MB (approximately)
- **Min Android:** 6.0 (API 23)
- **Safe to Install:** Yes - it's your own app!

### ⚠️ Note About Debug APK

The APK built by GitHub Actions is a **debug APK**, which means:
- ✅ Works perfectly fine on your device
- ✅ Contains all features of the app
- ⚠️ Not optimized for app stores (that requires a release build)
- ⚠️ Signed with a debug certificate (fine for personal use)

### 🆘 Troubleshooting

**Can't find the workflow?**
- Make sure you're logged into GitHub
- Check the "Actions" tab in the repository

**Build failed?**
- Check the build logs in the workflow run
- Try running the workflow again

**APK won't install?**
- Make sure "Unknown Sources" is enabled
- Check that you're on Android 6.0 or higher
- Try downloading the APK again

---

**Need immediate help?** Contact the repository owner or check the [android-app/README.md](android-app/README.md) for more details.
