# FitQuest – Gamified Health & Fitness Application
### Caleb University | Department of Computer Science | Final Year Project 2024/2025

---

## Project Overview

FitQuest is a React Native mobile application implementing a gamified health and fitness
platform with social competition features for university students. Developed as a final
year project using Agile methodology.

**Stack:** React Native 0.72 · Firebase (Firestore, Auth, Functions, FCM) · JavaScript

---

## Project Structure

```
FitQuest_App/
├── App.js                          ← Entry point
├── package.json                    ← Dependencies
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          ← Registration & Login
│   │   ├── HomeScreen.js           ← Dashboard
│   │   ├── ActivityScreen.js       ← Fitness Activity Logging
│   │   ├── LeaderboardScreen.js    ← Rankings & Social Competition
│   │   ├── ChallengesScreen.js     ← Group Challenges
│   │   └── ProfileScreen.js        ← User Profile & Badges
│   ├── navigation/
│   │   └── AppNavigator.js         ← React Navigation setup
│   ├── context/
│   │   └── AuthContext.js          ← Global auth state (Context API)
│   ├── services/
│   │   └── firebaseConfig.js       ← Firebase service layer
│   └── utils/
│       └── gamificationUtils.js    ← Points, XP, Badges, Levels logic
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ (LTS)
- npm 9+
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android) or Xcode (for iOS)
- A Firebase project with Firestore, Auth, Functions, and FCM enabled

### Step 1 — Clone / Open in VS Code
Open this folder in VS Code.

### Step 2 — Install Dependencies
```bash
cd FitQuest_App
npm install
```

### Step 3 — Firebase Configuration
1. Go to https://console.firebase.google.com
2. Create a new project named "FitQuest"
3. Enable: Authentication (Email/Password), Cloud Firestore, Functions, Storage, Messaging
4. Download `google-services.json` (Android) → place in `android/app/`
5. Download `GoogleService-Info.plist` (iOS) → place in `ios/FitQuestApp/`

### Step 4 — iOS Setup (macOS only)
```bash
cd ios && pod install && cd ..
```

### Step 5 — Run the App
```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

---

## Key Features Implemented

| Module | Description |
|--------|-------------|
| Authentication | Email/password registration, login, Google OAuth, password reset |
| Activity Tracking | Log 12 activity types, MET calorie formula, GPS distance |
| Gamification Engine | XP points, 20 levels, 24 badges, streak multipliers (1.25×–2×) |
| Leaderboards | Weekly & All-Time rankings, friends filter, real-time sync |
| Group Challenges | Create/join challenges, progress tracking, auto-ranking |
| Progress Analytics | Activity heatmap, charts, personal bests |
| Report Generation | PDF export via react-native-html-to-pdf |

---

## Gamification Formula Reference

**Calories (MET Formula):**
```
Calories = MET × Weight(kg) × Duration(hours)
```

**XP Points:**
```
XP = basePoints + floor(duration × basePoints/30) × streakMultiplier
```

**Streak Multipliers:**
- 3+ days → 1.25×
- 7+ days → 1.50×
- 14+ days → 1.75×
- 30+ days → 2.00×

**Level Threshold:** `XP_required(n) = 100 × n²`

---

## Running Tests
```bash
npm test
```

---

## Developer Notes

- All Firestore security rules should be deployed from the Firebase Console
- Cloud Functions for leaderboard computation and badge evaluation are triggered
  automatically by Firestore write events
- Offline persistence is enabled via Firestore's built-in cache
- FCM push notifications require a physical device (not emulator)

---

*Caleb University · B.Sc. Computer Science · 2024/2025*
