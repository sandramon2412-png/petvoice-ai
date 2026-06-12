# PetVoice AI — Project Guide

## Overview
React Native (Expo) app que graba sonidos de mascotas, los analiza con IA, y muestra una traducción de emoción al dueño. Soporta múltiples mascotas (perro y gato) con historial separado por mascota.

## Tech Stack
- **Framework**: Expo SDK 54 / React Native 0.81
- **Navigation**: React Navigation v6 (native-stack)
- **Audio**: `expo-av` (Audio.Recording)
- **Fonts**: Inter via `@expo-google-fonts/inter`
- **Gradient**: `expo-linear-gradient`
- **Icons**: `@expo/vector-icons` → MaterialCommunityIcons
- **Storage**: `@react-native-async-storage/async-storage`
- **Safe areas**: `react-native-safe-area-context`
- **Animations**: `lottie-react-native` (dog.json / cat.json en assets/lottie/)

## Navigation Flow
```
Onboarding (steps 0-4)  →  Home (recorder)  →  Loading  →  Result
                                ↕                              ↕
                           History ←→ Settings           (addToHistory)
```
- Todas las pantallas usan `headerShown: false`.
- Loading screen tiene `gestureEnabled: false`.
- Bottom nav en Home, History, Settings.

## Key Files
| File | Purpose |
|---|---|
| `src/screens/OnboardingScreen.js` | 5 pasos: especie, nombre, edad, foto, listo |
| `src/screens/HomeScreen.js` | Grabadora + selector de mascota activa (si hay 2+) |
| `src/screens/LoadingScreen.js` | Animación orbital premium mientras corre la IA |
| `src/screens/ResultScreen.js` | Resultado emoción + imagen 3D + badge especie + consejos |
| `src/screens/HistoryScreen.js` | Tab Conversaciones (burbujas) + Tab Diario de Ánimo (gráfica + métricas) |
| `src/screens/SettingsScreen.js` | Perfil mascota activa + selector multi-mascota |
| `src/context/AppContext.js` | Estado global: pet, pets[], history, quota |
| `src/services/aiService.js` | Análisis IA diferenciado por especie (OpenAI / Claude / demo) |
| `src/navigation/AppNavigator.js` | Stack navigator con spinner mientras carga AsyncStorage |
| `src/components/ClayCharacter.js` | Fallback clay dog/cat |

## AppContext — Estado global
```js
// AsyncStorage keys
@petvoice_pet    → perfil mascota activa (objeto)
@petvoice_pets   → array de todos los perfiles de mascotas
@petvoice_history → array de entradas del historial

// Valores expuestos
pet          → mascota activa (objeto: name, species, age, photo)
pets         → array de todas las mascotas registradas
savePet(data)    → guarda/actualiza mascota en pets[] y la activa
switchPet(name)  → cambia la mascota activa sin crear perfil nuevo
history          → array completo de análisis
addToHistory(entry) → prepend + persiste
clearHistory(petName) → borra solo los de esa mascota
ready        → true cuando AsyncStorage terminó de cargar
FREE_DAILY_LIMIT = 20 (subido para pruebas, cambiar a 5 en producción)
```

## Estructura de una entrada de historial
```js
{
  id, ts, day, timestamp,
  emotion,        // "Feliz" | "Alerta" | etc.
  text,           // traducción humana
  petName,        // nombre de la mascota — CRÍTICO para el filtro
  petSpecies,     // "dog" | "cat"
  petPhoto,       // URI de la foto (guardada al momento del análisis)
  posture,
  environment,
}
```
**IMPORTANTE**: El filtro de historial usa `e.petName === activePet` estricto. Las entradas sin `petName` no aparecen en ninguna mascota.

## Multi-mascota
- `pets[]` guarda todos los perfiles. `pet` es el activo.
- `switchPet(name)` cambia el activo sin tocar el historial.
- HomeScreen muestra chips de mascota si `pets.length > 1`.
- SettingsScreen muestra selector con ✓ en la activa.
- HistoryScreen muestra tarjetas de mascota (foto o Lottie) centradas si ≤2, scroll si 3+.
- **PENDIENTE**: botón "Agregar mascota" en Ajustes sin pasar por onboarding completo.

## Emociones — íconos por especie
Los íconos `MaterialCommunityIcons` son distintos para perro y gato:

| Emoción | Perro | Gato |
|---|---|---|
| Feliz | `dog` | `cat` |
| Juguetón | `tennis-ball` | `mouse-variant-off` |
| Alerta | `bell-ring-outline` | `eye-outline` |
| Curioso | `nose` | `magnify` |
| Estresado | `lightning-bolt` | `lightning-bolt` |
| Asustado | `shield-alert-outline` | `ghost-outline` |
| Tranquilo | `sleep` | `weather-night` |
| Hambriento | `food-drumstick-outline` | `fish` |

## Assets — Microsoft Fluent Emoji 3D (MIT licence)
```
assets/
  pets/
    dog.png          ← perro 3D (Onboarding)
    cat.png          ← gato 3D (Onboarding)
  lottie/
    dog.json         ← animación Lottie perro
    cat.json         ← animación Lottie gato
  emotions/          ← imágenes 3D usadas en ResultScreen
    feliz.png        ← ⭐ estrella brillante
    jugueton.png     ← 🎾 pelota de tenis (Microsoft Teams emoji)
    alerta.png       ← 🔔 campana
    curioso.png      ← 🔍 lupa
    estresado.png    ← 🔥 fuego
    asustado.png     ← ⛈️ nube tormenta
    tranquilo.png    ← 🍃 hoja
    hambriento.png   ← 🦴 hueso
```

## ResultScreen — Estructura del ícono de emoción
```jsx
// Imagen 3D Fluent + badge pequeño de especie encima
<Image source={EMOTION_IMAGES[emotion]} style={{ width:120, height:120 }}/>
<View style={speciesBadge}>  // posición absolute bottom-right
  <MaterialCommunityIcons name={emo.icon} size={17} color={emo.accent1}/>
</View>
```

## HistoryScreen — Diario de Ánimo
Calcula datos REALES desde `petHistory` (filtrado por mascota activa):
- `buildWeekData(history)` → 7 barras diarias (% emociones positivas)
- `buildMetrics(history)` → 4 tarjetas: emoción predominante, días estrés, total análisis, día más feliz
- Emociones "buenas": Feliz, Juguetón, Tranquilo, Curioso
- Emociones "estrés": Estresado, Asustado, Alerta

## aiService — Diferenciación por especie
- Prompt incluye contexto de vocalización específico por especie (ladridos vs maullidos)
- Demo mode: arrays separados `DEMOS_DOG` y `DEMOS_CAT` con traducciones realistas
- Demo rota secuencialmente (no random) para ver las 8 emociones
- Soporta: OpenAI GPT-4o (`EXPO_PUBLIC_OPENAI_API_KEY`) o Claude (`EXPO_PUBLIC_ANTHROPIC_KEY`)

## Design System — Tema oscuro
```js
bg:     "#06071A"
card:   "rgba(255,255,255,0.07)"
border: "rgba(255,255,255,0.10)"
text:   "#F1F5F9"
muted:  "#64748B"
indigo: "#818CF8"
```
- Fondo multi-capa: `["#06071A","#0C0E2E","#080C24"]` + accent diagonal
- **NO usar** `overflow:"hidden"` en contenedores de tabs → clipping
- **NO usar** `LinearGradient` con `absoluteFill` dentro de `TouchableOpacity` sin `overflow:hidden` → tapa elementos vecinos

## Dev Commands
```powershell
# Windows PowerShell — correr por separado
git pull origin claude/blissful-hopper-GZPrS
npx expo start --clear
```

## Branch activo
`claude/blissful-hopper-GZPrS` en repo `sandramon2412-png/petvoice-ai`

## Pendiente (próximas tareas)
1. **Agregar mascota desde Ajustes** — botón "+" en SettingsScreen que abre un mini-onboarding (solo especie + nombre + foto) sin resetear la app
2. **Bajar FREE_DAILY_LIMIT a 5** en `AppContext.js` antes de producción
3. **Conectar API real** — agregar `.env` con `EXPO_PUBLIC_ANTHROPIC_KEY` o `EXPO_PUBLIC_OPENAI_API_KEY`
4. **Glassmorphism real** — `npx expo install expo-blur` → `<BlurView>` en burbujas
5. **Compartir resultado** — botón para exportar la traducción como imagen
6. **Notificaciones** — recordatorio diario para analizar a la mascota
