# PetVoice AI — Estado del Proyecto

## Qué es esto
App React Native / Expo que analiza sonidos de mascotas con IA y devuelve una "traducción" emocional en español. El usuario graba el sonido de su perro o gato, selecciona postura y contexto, y recibe una emoción principal + consejo al dueño.

## Stack
- **React Native + Expo** (SDK 50+)
- **React Navigation** (native-stack + bottom-tabs)
- **expo-av** para grabación de audio
- **expo-image-picker** para fotos de mascota
- **expo-linear-gradient** para UI
- **@react-native-async-storage/async-storage** para persistencia
- **@expo-google-fonts/inter** (pesos 400–800)
- Lenguaje: **JavaScript ES6+** (sin TypeScript)
- Todo el texto UI en **español**

## Estructura de archivos clave

```
App.js                          ← entry point, carga fuentes, monta AppProvider
src/
  context/AppContext.js         ← estado global (pet, análisis, límites diarios)
  navigation/AppNavigator.js    ← stack navigation (Onboarding→Home→Loading→Result)
  screens/
    OnboardingScreen.js         ← setup de mascota en 5 pasos
    HomeScreen.js               ← grabación + selección postura/entorno
    LoadingScreen.js            ← animación de análisis (4.2 s)
    ResultScreen.js             ← resultado de la emoción con imágenes Fluent
    SettingsScreen.js           ← ajustes, perfil mascota, herramientas demo
    HistoryScreen.js            ← historial de análisis como chat
    PaywallScreen.js            ← pantalla premium ($4.99/mes o $29.99/año)
  components/
    ChatBubble.js               ← burbujas de historial con avatar y DateSeparator
    RecordButton.js             ← botón circular con anillos animados
    EmotionCard.js              ← tarjeta de emoción con colores y consejo
    NativeAdBanner.js           ← banner de anuncio nativo (oculto si premium)
  services/
    aiService.js                ← llama a OpenAI o Claude; devuelve demo si no hay API key
    storageService.js           ← persistencia con AsyncStorage (pet, history, user)
  constants/
    colors.js                   ← PRIMARY #4F46E5, ACCENT #FF8A65, + colores de emoción
    typography.js               ← FONTS.size y FONTS.weight (Inter)
```

## Estado global (AppContext)

```js
pet              // { name, species, age, photo }
savePet(data)
analysisResult   // último resultado de IA
saveResult(result)
recordingsToday  // contador del día (FREE_DAILY_LIMIT = 5, bajar a 3 antes de producción)
remaining        // FREE_DAILY_LIMIT - recordingsToday
canRecord        // boolean
lastAnalysisAudio, setLastAnalysisAudio
lastPosture, setLastPosture
lastEnvironment, setLastEnvironment
```

**NOTA:** AppContext actualmente NO expone `user`, `clearHistory`, ni `setPremium` — SettingsScreen los usa pero no están implementados en el contexto. Es una deuda técnica conocida.

## Navegación actual

```
Stack: Onboarding → Home → Loading → Result
```

- Si `pet` existe en contexto → arranca en Home
- Si no → arranca en Onboarding
- SettingsScreen e HistoryScreen existen como archivos pero **no están registradas** en AppNavigator

## Análisis de IA (aiService.js)

Función principal: `analyzeSound(species, name, posture, environment)`

Orden de intentos:
1. OpenAI GPT-4o si `EXPO_PUBLIC_OPENAI_API_KEY`
2. Claude Haiku 4.5 si `EXPO_PUBLIC_ANTHROPIC_KEY`
3. Modo demo: rota las 8 emociones hardcodeadas

Respuesta JSON esperada:
```json
{
  "emocion_principal": "Feliz",
  "porcentaje_confianza": 87,
  "color_interfaz": "#10B981",
  "traduccion_humana": "¡Estoy muy contento de verte!",
  "consejo_propietario": "Aprovecha este momento para reforzar el vínculo con tu mascota.",
  "keyword_publicidad": "premio mascotas"
}
```

## Emociones soportadas (8)
Feliz, Alerta, Estresado, Tranquilo, Hambriento, Juguetón, Miedoso, Dominante

## Diseño
- **Glassmorphism**: cards con `rgba(255,255,255,0.92)` y borde sutil
- **Gradientes**: índigo→violeta para botones, coral para grabación
- **Animaciones**: anillos pulsantes en grabación, barra de confianza animada, espectrograma en LoadingScreen
- **Safe Area**: `useSafeAreaInsets()` en todas las pantallas
- ResultScreen usa imágenes 3D Fluent de Microsoft (emojis/ilustraciones)

## Lo que ya está implementado ✅
- Onboarding de 5 pasos con foto, especie, nombre y edad
- Grabación de audio real con expo-av
- Modo demo que rota las 8 emociones
- Historial persistente por mascota (ChatBubble, DateSeparator)
- Íconos diferenciados por especie (perro/gato)
- Imágenes 3D Fluent en ResultScreen
- Diario de ánimo con datos reales
- Multi-mascota en contexto (pets array)
- Límite diario de 5 análisis gratuitos
- Pantalla de Paywall con planes mensual/anual
- Herramienta dev: toggle premium en Ajustes

## PENDIENTES — en orden de prioridad

### 1. 🔴 URGENTE: Agregar mascota desde Ajustes (sin onboarding completo)
**Problema:** Para agregar una segunda mascota hay que reiniciar el onboarding completo.  
**Solución:** Añadir botón "Agregar mascota" en SettingsScreen que lance el flujo de onboarding en modo "nueva mascota" (no sobreescribir la actual).  
**Archivos a tocar:** `SettingsScreen.js`, `OnboardingScreen.js`, `AppContext.js`, `AppNavigator.js`

### 2. 🔴 Restablecer límite diario a 3 antes de producción
**Archivo:** `AppContext.js` línea 5 → `const FREE_DAILY_LIMIT = 5` → cambiar a `3`

### 3. 🟡 Conectar API real
Variables de entorno necesarias en `.env`:
```
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_ANTHROPIC_KEY=sk-ant-...
```

### 4. 🟡 OnboardingScreen — revisar con tema actual
Validar que los colores y fuentes se ven bien con el tema actual post-rediseño.

### 5. 🟡 LoadingScreen — verificar apariencia premium
Asegurar que el espectrograma y los mensajes de estado se ven bien tras los cambios recientes.

### 6. 🟡 HomeScreen — botón de grabar y tarjeta de estado
Revisar layout del botón de grabación y la tarjeta de estado de la mascota.

### 7. 🟢 Notificaciones — recordatorio diario
Implementar con `expo-notifications`. Recordar al usuario analizar a su mascota cada día.

### 8. 🟢 Compartir resultado
Botón "Compartir" en ResultScreen que genere una imagen del resultado (usar `react-native-view-shot` + `expo-sharing`).

## Deudas técnicas conocidas

1. `SettingsScreen.js` usa `user`, `clearHistory`, `setPremium` desde `useApp()` pero **AppContext no los expone** — esto causará crash si se navega a Settings. Hay que completar el contexto.
2. `AppNavigator.js` no registra `SettingsScreen`, `HistoryScreen`, ni `PaywallScreen` — hay que añadirlas al Stack o a un Tab Navigator.
3. `storageService.js` existe pero AppContext no lo usa para persistir `pet` entre sesiones — al recargar la app se pierde la mascota.

## Rama activa
`claude/intelligent-noether-699xiw`

## Comandos útiles
```bash
npx expo start          # iniciar dev server
npx expo start --ios    # simulador iOS
npx expo start --android # emulador Android
```
