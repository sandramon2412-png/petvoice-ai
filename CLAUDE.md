# PetVoice AI — Project Guide

## Overview
React Native (Expo) app que graba sonidos de mascotas, los analiza con Claude AI, y muestra una traducción de emoción al dueño.

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
- All screens use `headerShown: false` + SafeAreaView edges `["top","bottom"]`.
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
| `src/components/ClayCharacter.js` | Custom clay dog/cat (RN Views, fallback) |

## Assets — Microsoft Fluent Emoji 3D (MIT licence)
```
assets/
  pets/
    dog.png          ← perro 3D para botón Onboarding
    cat.png          ← gato 3D para botón Onboarding
  emotions/
    feliz.png        ← ⭐ estrella brillante
    jugueton.png     ← ⚡ rayo
    alerta.png       ← 🔔 campana
    curioso.png      ← 🔍 lupa
    estresado.png    ← 🔥 fuego
    asustado.png     ← ⛈️ nube tormenta
    tranquilo.png    ← 🍃 hoja
    hambriento.png   ← 🦴 hueso
```
Fuente: `github.com/microsoft/fluentui-emoji` (rama main, carpeta 3D, 256×256 RGBA PNG).
Para reemplazar: descarga el PNG correspondiente y sobreescribe el archivo.

## Design System

### Colores
- **Primary gradient**: `["#4F46E5","#7C3AED"]` (indigo → violet)
- **Coral accent**: `#FF8A65` / `#F4511E` (botón grabar)
- **Text dark**: `#1E293B` | **Text muted**: `#64748B`

### Glass card (burbuja de traducción)
```js
backgroundColor: "rgba(255,255,255,0.18)"
borderRadius: 32
borderWidth: 0.5
borderColor: "rgba(255,255,255,0.50)"
// Sin shadow — el gradiente de emoción se ve a través
```
**IMPORTANTE**: No agregar `borderWidth > 1` ni `shadowOpacity` alto — se ve tosco.

### Botones Perro/Gato (ClayPetCard)
- Tarjeta 148×178px, borderRadius 30
- Gradiente idle → active con crossfade Animated (380ms)
- Imagen 3D 110×110 con float (±5px loop) + bounce spring al seleccionar
- Sombra coloreada: naranja para perro, violeta para gato

### Pantalla de Resultados
- Fondo: `emo.iconColors[0] + "CC"` (80% opacidad) → crea el contexto para glassmorphism
- Icono emoción: Image Fluent 3D 120×120, sin contenedor, spring desde scale 0.55
- Burbuja: glass ultra-sutil (ver arriba)

## Emociones — EMOTION_MAP
```js
{ color, iconColors: [dark, light], barColors: [dark, light] }
```
| Emoción | Color | Imagen |
|---|---|---|
| Feliz | #10B981 | feliz.png |
| Juguetón | #3B82F6 | jugueton.png |
| Alerta | #D97706 | alerta.png |
| Curioso | #4F46E5 | curioso.png |
| Estresado | #EC4899 | estresado.png |
| Asustado | #7C3AED | asustado.png |
| Tranquilo | #64748B | tranquilo.png |
| Hambriento | #D97706 | hambriento.png |

## Dev Commands
```powershell
# Windows PowerShell (correr por separado, no &&)
git pull origin claude/blissful-hopper-GZPrS
npx expo start --clear
```

## Audio Recording
- Usa `Audio.Recording.createAsync(HIGH_QUALITY)` de expo-av.
- **Siempre llamar `recording.stopAndUnloadAsync()`** antes de navegar o re-grabar.
- El ref de grabación también se limpia en el `return` del `useEffect` (unmount guard).

## Safe Area Convention
Cada pantalla envuelve contenido en `<SafeAreaView edges={["top","bottom"]}>` dentro de `<View style={{flex:1}}>`. El gradiente llena con `StyleSheet.absoluteFill`.

## PR activo
`github.com/sandramon2412-png/petvoice-ai/pull/1` — branch `claude/blissful-hopper-GZPrS`

## Pendiente / Ideas futuras
- Lottie animations: `npx expo install lottie-react-native`, colocar `.json` en `assets/lottie/`, descomentar bloque en `ClayCharacter.js`
- Glassmorphism real (blur): `npx expo install expo-blur`, usar `<BlurView intensity={20}>` como fondo de la burbuja
- Avatar de mascota: si `pet.photo` está null, mostrar silueta del species en vez del ícono pata
