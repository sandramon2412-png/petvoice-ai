# PetVoice AI — Project Guide

## Overview
React Native (Expo) app that records pet sounds, analyses them with an AI service, and displays an emotion translation to the owner.

## Tech Stack
- **Framework**: Expo SDK 54 / React Native 0.81
- **Navigation**: React Navigation v6 (native-stack)
- **Audio**: `expo-av` (Audio.Recording)
- **Fonts**: Inter via `@expo-google-fonts/inter`
- **Gradient**: `expo-linear-gradient`
- **Icons**: `@expo/vector-icons` → MaterialCommunityIcons
- **Storage**: `@react-native-async-storage/async-storage`
- **Safe areas**: `react-native-safe-area-context`

## Navigation Flow
```
Onboarding (steps 0-4)  →  Home (recorder)  →  Loading  →  Result
```
- All screens use `headerShown: false` and custom headers with SafeAreaView edges `["top","bottom"]`.
- Loading screen has `gestureEnabled: false`.

## Key Files
| File | Purpose |
|---|---|
| `src/screens/OnboardingScreen.js` | 5-step pet profile setup |
| `src/screens/HomeScreen.js` | Audio recorder with posture/context pickers |
| `src/screens/LoadingScreen.js` | Animated spectrogram while AI runs |
| `src/screens/ResultScreen.js` | Emotion result + translation card |
| `src/context/AppContext.js` | Global state (pet profile, results, quota) |
| `src/services/aiService.js` | Claude API call for emotion analysis |
| `src/navigation/AppNavigator.js` | Stack navigator |

## Design System
- **Primary gradient**: `["#4F46E5","#7C3AED"]` (indigo → violet)
- **Coral accent**: `#FF8A65` / `#F4511E` (record button)
- **Text**: `#1E293B` (dark), `#64748B` (muted)
- **Glass card**: `rgba(255,255,255,0.65)` + `border: rgba(255,255,255,0.5)` + soft shadow
- **Border radius**: cards 20-24px, chips 24px, buttons 14-18px
- **Typography**: Inter family (400/500/600/700/800)
- **Icons**: MaterialCommunityIcons, outline/linear style (no emoji-face icons)

## Dev Commands
```bash
npx expo start          # start Metro bundler
npx expo start --android
npx expo start --ios
```

## Audio Recording
- Uses `Audio.Recording.createAsync(HIGH_QUALITY)` from expo-av.
- **Always call `recording.stopAndUnloadAsync()`** before navigating away or re-recording to release the microphone.
- The recording ref is also cleaned up in a `useEffect` return (unmount guard).

## Safe Area Convention
Every screen wraps content in `<SafeAreaView edges={["top","bottom"]}>` inside a root `<View style={{flex:1}}>` (gradient fills with `StyleSheet.absoluteFill`).
