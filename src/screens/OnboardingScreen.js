import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, Animated, StatusBar, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";

const TOTAL_STEPS = 4;
const CARD_SIZE = 110;

const C = {
  text: "#1E293B", muted: "#64748B", border: "#E2E8F0",
  indigo: "#4F46E5", violet: "#7C3AED", indigoLight: "#EEF2FF",
  inputBorder: "#CBD5E1",
};

const GLASS = {
  backgroundColor: "rgba(255,255,255,0.92)",
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.05)",
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 5,
};

// ─── PressableScale ───────────────────────────────────────────────────────────
function PressableScale({ onPress, style, children, disabled, activeScale = 0.97 }) {
  const anim = useRef(new Animated.Value(1)).current;
  const cfg = { useNativeDriver: true };
  const press = () => Animated.spring(anim, { toValue: activeScale, tension: 300, friction: 12, ...cfg }).start();
  const release = () => Animated.spring(anim, { toValue: 1, tension: 200, friction: 8, ...cfg }).start();
  return (
    <TouchableOpacity onPressIn={press} onPressOut={release} onPress={onPress} disabled={disabled} activeOpacity={1} style={style}>
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// ─── GradientButton ───────────────────────────────────────────────────────────
function GradientButton({ onPress, disabled, label, icon }) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} activeScale={0.96}>
      <LinearGradient
        colors={disabled ? ["#CBD5E1", "#CBD5E1"] : ["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.gradBtn}
      >
        <Text style={s.gradBtnText}>{label}</Text>
        {icon && <MaterialCommunityIcons name={icon} size={17} color="#fff" style={{ marginLeft: 6 }} />}
      </LinearGradient>
    </PressableScale>
  );
}

// ─── AnimatedProgressBar ──────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: step / total, duration: 320,
      easing: Easing.inOut(Easing.ease), useNativeDriver: false,
    }).start();
  }, [step]);
  const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={s.progressTrack}>
      <Animated.View style={[s.progressFillWrap, { width: barW }]}>
        <LinearGradient colors={["#6366F1", "#8B5CF6", "#A78BFA"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

// ─── OnboardingScreen ─────────────────────────────────────────────────────────
export default function OnboardingScreen({ navigation }) {
  const { savePet } = useApp();
  const [step, setStep] = useState(0);
  const [species, setSpecies] = useState(null);
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petPhoto, setPetPhoto] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const animStep = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -16, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const goNext = () => { animStep(); setStep(n => n + 1); };
  const goBack = () => { animStep(); setStep(n => Math.max(0, n - 1)); };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets?.[0]?.uri) setPetPhoto(r.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets?.[0]?.uri) setPetPhoto(r.assets[0].uri);
  };

  const finish = () => {
    savePet({ name: petName.trim(), species, age: petAge.trim(), photo: petPhoto });
    navigation.replace("Home");
  };

  const canContinue = () => {
    if (step === 0) return !!species;
    if (step === 1) return petName.trim().length > 0;
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#EEF2FF", "#F0EAFF", "#FAF8FF"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoSection}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.logoCircle}>
              <MaterialCommunityIcons name="waveform" size={28} color="#fff" />
            </LinearGradient>
            <Text style={s.logoTitle}>PetVoice AI</Text>
            <Text style={s.logoTagline}>Entiende a tu mascota con inteligencia artificial</Text>
            <View style={[s.badge, GLASS, { borderRadius: 20 }]}>
              <MaterialCommunityIcons name="flask-outline" size={13} color={C.indigo} style={{ marginRight: 4 }} />
              <Text style={s.badgeText}>Etología computacional</Text>
            </View>
          </View>

          {/* Progress */}
          <View style={s.progressSection}>
            <ProgressBar step={step} total={TOTAL_STEPS} />
            <Text style={s.progressLabel}>Paso {step + 1} de {TOTAL_STEPS + 1}</Text>
          </View>

          {/* Step card */}
          <Animated.View style={[s.card, GLASS, { opacity: cardOpacity, transform: [{ translateX: slideAnim }] }]}>

            {/* PASO 1 — Especie */}
            {step === 0 && (
              <View>
                <Text style={s.title}>¿Qué tipo de mascota tienes?</Text>
                <Text style={s.subtitle}>El modelo de análisis se adapta por especie</Text>
                <View style={s.speciesRow}>
                  {[{ key: "dog", label: "Perro", icon: "dog" }, { key: "cat", label: "Gato", icon: "cat" }].map(sp => {
                    const active = species === sp.key;
                    return (
                      <PressableScale key={sp.key} onPress={() => setSpecies(sp.key)} activeScale={0.95}>
                        <View style={[s.speciesCard, active && s.speciesCardActive]}>
                          <MaterialCommunityIcons name={sp.icon} size={40} color={active ? C.indigo : C.muted} />
                          <Text style={[s.speciesLabel, active && { color: C.indigo }]}>{sp.label}</Text>
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
            )}

            {/* PASO 2 — Nombre */}
            {step === 1 && (
              <View>
                <Text style={s.title}>¿Cómo se llama?</Text>
                <Text style={s.subtitle}>Usaremos el nombre en las traducciones</Text>
                <Text style={s.fieldLabel}>Nombre de tu mascota</Text>
                <TextInput style={s.input} placeholder="Ej: Max, Luna, Pelusa..."
                  placeholderTextColor={C.muted} value={petName} onChangeText={setPetName} autoFocus maxLength={24} />
              </View>
            )}

            {/* PASO 3 — Edad */}
            {step === 2 && (
              <View>
                <Text style={s.title}>¿Cuántos años tiene?</Text>
                <Text style={s.subtitle}>Opcional - mejora la precisión del análisis</Text>
                <Text style={s.fieldLabel}>Edad (años)</Text>
                <TextInput style={[s.input, { width: 120 }]} placeholder="Ej: 2"
                  placeholderTextColor={C.muted} value={petAge} onChangeText={setPetAge}
                  keyboardType="numeric" maxLength={2} autoFocus />
                <Text style={s.skipNote}>Puedes dejarlo en blanco y continuar</Text>
              </View>
            )}

            {/* PASO 4 — Foto */}
            {step === 3 && (
              <View>
                <Text style={s.title}>Agrega una foto</Text>
                <Text style={s.subtitle}>Aparecerá en la pantalla de resultados</Text>
                <View style={s.photoArea}>
                  {petPhoto ? (
                    <PressableScale onPress={pickPhoto} activeScale={0.96}>
                      <View>
                        <Image source={{ uri: petPhoto }} style={s.photoPreview} />
                        <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.photoEditBtn}>
                          <MaterialCommunityIcons name="pencil" size={15} color="#fff" />
                        </LinearGradient>
                      </View>
                    </PressableScale>
                  ) : (
                    <LinearGradient colors={["#EEF2FF", "#F5F3FF"]} style={s.photoPlaceholder}>
                      <View style={s.cameraCircle}>
                        <MaterialCommunityIcons name="camera-outline" size={28} color={C.indigo} />
                      </View>
                      <Text style={s.photoHint}>Foto de {petName || "tu mascota"}</Text>
                      <Text style={s.photoSubHint}>Opcional (JPG o PNG)</Text>
                    </LinearGradient>
                  )}
                </View>
                <View style={s.photoActions}>
                  {[{ label: "Cámara", icon: "camera", fn: takePhoto }, { label: "Galería", icon: "image-outline", fn: pickPhoto }].map(b => (
                    <PressableScale key={b.label} onPress={b.fn} activeScale={0.95}>
                      <LinearGradient colors={["#EEF2FF", "#F5F3FF"]} style={s.photoBtn}>
                        <MaterialCommunityIcons name={b.icon} size={16} color={C.indigo} style={{ marginRight: 6 }} />
                        <Text style={s.photoBtnText}>{b.label}</Text>
                      </LinearGradient>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}

            {/* PASO 5 — Confirmación (sin óvalo vacío) */}
            {step === 4 && (
              <View style={s.completionWrap}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.completionIcon}>
                  <MaterialCommunityIcons name="check-circle-outline" size={36} color="#fff" />
                </LinearGradient>
                <Text style={s.completionTitle}>¡Todo listo!</Text>
                <Text style={s.completionBody}>
                  El perfil biológico de {petName || "tu mascota"} ha sido configurado correctamente para calibrar el algoritmo de análisis.
                </Text>
              </View>
            )}

          </Animated.View>

          {/* Nav */}
          <View style={s.navRow}>
            {step > 0 && (
              <TouchableOpacity style={s.backBtn} onPress={goBack}>
                <MaterialCommunityIcons name="arrow-left" size={17} color={C.muted} style={{ marginRight: 4 }} />
                <Text style={s.backBtnText}>Atrás</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <GradientButton
              onPress={step < TOTAL_STEPS ? goNext : finish}
              disabled={!canContinue()}
              label={step < TOTAL_STEPS ? "Continuar" : "¡Empezar!"}
              icon={step < TOTAL_STEPS ? "arrow-right" : "check"}
            />
          </View>

          {/* Dots */}
          <View style={s.dotsRow}>
            {[...Array(TOTAL_STEPS + 1)].map((_, i) => (
              <View key={i} style={[s.dot, i === step && s.dotActive]} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },

  logoSection: { alignItems: "center", paddingTop: 28, paddingBottom: 24 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 14,
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16, shadowRadius: 12, elevation: 6,
  },
  logoTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 28, color: C.text, marginBottom: 6, letterSpacing: -0.8 },
  logoTagline: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 21, marginBottom: 14, paddingHorizontal: 16 },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontFamily: "Inter_500Medium", fontSize: 12, color: C.indigo },

  progressSection: { marginBottom: 20 },
  progressTrack: { height: 6, backgroundColor: "rgba(0,0,0,0.07)", borderRadius: 3, overflow: "hidden", marginBottom: 8 },
  progressFillWrap: { height: "100%", borderRadius: 3, overflow: "hidden" },
  progressLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: C.muted, textAlign: "right" },

  card: { borderRadius: 24, padding: 26, paddingBottom: 28, marginBottom: 24 },
  title: { fontFamily: "Inter_700Bold", fontSize: 21, color: C.text, marginBottom: 7, letterSpacing: -0.4 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 21 },

  speciesRow: { flexDirection: "row", gap: 16, justifyContent: "center" },
  speciesCard: {
    width: CARD_SIZE, height: CARD_SIZE,
    backgroundColor: "#F8FAFC", borderRadius: 16,
    borderWidth: 1, borderColor: "#E2E8F0",
    alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  speciesCardActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4F46E5", borderWidth: 1.5,
    shadowColor: "#4F46E5", shadowOpacity: 0.12,
    shadowRadius: 12, elevation: 4,
  },
  speciesLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.muted },

  fieldLabel: { fontFamily: "Inter_700Bold", fontSize: 13, color: C.text, marginBottom: 9 },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)", borderWidth: 1.5, borderColor: C.inputBorder,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: "Inter_500Medium", fontSize: 16, color: C.text,
  },
  skipNote: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted, marginTop: 12 },

  photoArea: { alignItems: "center", marginBottom: 22 },
  photoPlaceholder: {
    width: 160, height: 160, borderRadius: 80, alignItems: "center", justifyContent: "center", padding: 16,
    borderWidth: 2, borderColor: "rgba(79,70,229,0.2)",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  cameraCircle: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  photoHint: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.indigo, textAlign: "center" },
  photoSubHint: { fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 4, textAlign: "center" },
  photoPreview: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: C.indigo },
  photoEditBtn: {
    position: "absolute", bottom: 6, right: 6, width: 34, height: 34,
    borderRadius: 17, alignItems: "center", justifyContent: "center",
  },
  photoActions: { flexDirection: "row", gap: 14, justifyContent: "center" },
  photoBtn: {
    flexDirection: "row", alignItems: "center", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 11,
    borderWidth: 1, borderColor: "rgba(79,70,229,0.18)",
  },
  photoBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.indigo },

  // Completion step (step 4)
  completionWrap: { alignItems: "center", paddingVertical: 12 },
  completionIcon: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  completionTitle: {
    fontFamily: "Inter_800ExtraBold", fontSize: 24, color: C.text,
    letterSpacing: -0.5, marginBottom: 14, textAlign: "center",
  },
  completionBody: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: C.muted,
    textAlign: "center", lineHeight: 24, paddingHorizontal: 8,
  },

  navRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8 },
  backBtnText: { fontFamily: "Inter_500Medium", fontSize: 15, color: C.muted },
  gradBtn: {
    flexDirection: "row", alignItems: "center", borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  gradBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },

  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.12)" },
  dotActive: { width: 24, backgroundColor: C.indigo },
});
