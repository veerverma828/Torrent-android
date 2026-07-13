# 🚀 Torrent Debrid Android Application

This repository contains the standalone mobile application for Android, built with React, Vite, and Capacitor.

## ⚙️ Project Structure
- `frontend/` - Contains the React frontend and the Android native configurations.
  - `frontend/android/` - The Android Studio Gradle project.
  - `frontend/src/` - React components, hooks, and native-player bridges.

## 🚀 Setup & Execution

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (version 22+)
- Android Studio & Android SDK
- Gradle

### 2. Install dependencies
```bash
npm install
cd frontend
npm install
```

### 3. Running local development
To run the web preview of the app:
```bash
npm run dev
```

### 4. Running/Testing on Android Device or Emulator
Sync the web assets to the Android native folder and open Android Studio:
```bash
# Sync web code with Capacitor Android wrapper
npm run cap:sync

# Open the project in Android Studio to run on device/emulator
npm run cap:open
```

## 🏗️ Building Android APK
This repository has a GitHub Actions workflow configured under `.github/workflows/build-apk.yml`. 
Every push to the `main` branch will automatically build a signed release APK and post it as a new GitHub Release.
The build numbers are automatically offset by `+100` to remain ahead of the legacy repository's releases, allowing proper in-app updates.
