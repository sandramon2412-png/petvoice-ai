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

// ─── ClayPetCard ──────────────────────────────────────────────────────────────
function ClayPetCard({ petKey, label, selected, onPress }) {
  const isdog = petKey === "dog";

  const IDLE_COLORS  = isdog ? ["#FFF0D9","#FFD9A0","#FFC272"]   : ["#EDD9FF","#D9B8F5","#C699E8"];
  const ACTV_COLORS  = isdog ? ["#FFB84D","#FF9800","#E57C00"]   : ["#CE7BEE","#A855F7","#861FD5"];
  const SHADOW_ACTV  = isdog ? "#E57C00" : "#861FD5";
  const BG_IDLE      = isdog ? "#FFD9A0" : "#D9B8F5";

  const breathScale  = useRef(new Animated.Value(1)).current;
  const floatY       = useRef(new Animated.Value(0)).current;
  const charScale    = useRef(new Animated.Value(1)).current;
  const gradFade     = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    const loop = Animated.parallel([
      Animated.loop(Animated.sequence([
        Animated.timing(breathScale, { toValue: 0.966, duration: 2100, useNativeDriver: true }),
        Animated.timing(breathScale, { toValue: 1.0,   duration: 2100, useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(floatY, { toValue: -5, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 4,  duration: 2500, useNativeDriver: true }),
      ])),
    ]);
    loop.start();
    return () => loop.stop();
  }, []);

  const prevSel = useRef(selected);
  useEffect(() => {
    Animated.timing(gradFade, { toValue: selected ? 1 : 0, duration: 380, useNativeDriver: true }).start();
    if (selected && !prevSel.current) {
      Animated.sequence([
        Animated.spring(charScale, { toValue: 1.28, tension: 420, friction: 5, useNativeDriver: true }),
        Animated.spring(charScale, { toValue: 1.0,  tension: 220, friction: 9, useNativeDriver: true }),
      ]).start();
    }
    prevSel.current = selected;
  }, [selected]);

  const labelColor = selected ? (isdog ? "#B45309" : "#7C3AED") : C.muted;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
      <Animated.View style={{ transform: [{ scale: breathScale }] }}>
        {/* Shadow wrapper — provides elevation; background needed for iOS shadow engine */}
        <View style={[s.clayShadow, {
          backgroundColor: BG_IDLE,
          shadowColor: selected ? SHADOW_ACTV : "#1E293B",
          shadowOpacity: selected ? 0.42 : 0.14,
        }]}>
          {/* Gradient clipping container */}
          <View style={s.clayCard}>
            {/* Idle gradient */}
            <LinearGradient colors={IDLE_COLORS} style={StyleSheet.absoluteFill} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} />
            {/* Active gradient crossfade */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: gradFade }]}>
              <LinearGradient colors={ACTV_COLORS} style={StyleSheet.absoluteFill} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} />
            </Animated.View>
            {/* Clay top-left shine */}
            <View style={s.clayShine} />
            {/* Character */}
            <Animated.View style={{ transform: [{ translateY: floatY }, { scale: charScale }] }}>
              <Text style={s.clayEmoji}>{isdog ? "🐶" : "🐱"}</Text>
            </Animated.View>
          </View>
        </View>
        <Text style={[s.clayLabel, { color: labelColor, fontFamily: selected ? "Inter_700Bold" : "Inter_600SemiBold" }]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
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

          {/* Top nav back button — visible on steps 1+ */}
          {step > 0 && (
            <View style={s.topNav}>
              <TouchableOpacity onPress={goBack} style={s.topNavBack} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-left" size={22} color={C.muted} />
                <Text style={s.topNavBackText}>Atrás</Text>
              </TouchableOpacity>
            </View>
          )}

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
                  <ClayPetCard petKey="dog" label="Perro" selected={species === "dog"} onPress={() => setSpecies("dog")} />
                  <ClayPetCard petKey="cat" label="Gato"  selected={species === "cat"} onPress={() => setSpecies("cat")} />
                </View>
              </View>
            )}

            {/* PASO 2 — Nombre */}
            {step === 1 && (
              <View>
                <View style={s.stepIconWrap}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.stepIconBadge}>
                    <MaterialCommunityIcons name="tag-heart-outline" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={s.title}>¿Cómo se llama?</Text>
                <Text style={s.subtitle}>Usaremos el nombre en cada traducción</Text>
                <View style={s.inputRow}>
                  <View style={s.inputIconBox}>
                    <MaterialCommunityIcons name="paw" size={18} color={C.indigo} />
                  </View>
                  <TextInput
                    style={s.inputWithIcon}
                    placeholder="Ej: Max, Luna, Pelusa…"
                    placeholderTextColor={C.muted}
                    value={petName}
                    onChangeText={setPetName}
                    autoFocus
                    maxLength={24}
                  />
                </View>
                <Text style={s.charCount}>{petName.length}/24 caracteres</Text>
              </View>
            )}

            {/* PASO 3 — Edad */}
            {step === 2 && (
              <View>
                <View style={s.stepIconWrap}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.stepIconBadge}>
                    <MaterialCommunityIcons name="calendar-heart" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={s.title}>¿Cuántos años tiene?</Text>
                <Text style={s.subtitle}>Opcional — mejora la precisión del análisis</Text>
                <View style={s.ageStepper}>
                  <TouchableOpacity
                    style={s.ageStepBtn}
                    onPress={() => {
                      const v = parseInt(petAge || "0") - 1;
                      if (v >= 0) setPetAge(String(v));
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color={C.indigo} />
                  </TouchableOpacity>
                  <View style={s.ageDisplayBox}>
                    <Text style={s.ageNumber}>{petAge || "0"}</Text>
                    <Text style={s.ageUnit}>años</Text>
                  </View>
                  <TouchableOpacity
                    style={s.ageStepBtn}
                    onPress={() => {
                      const v = parseInt(petAge || "0") + 1;
                      if (v <= 30) setPetAge(String(v));
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color={C.indigo} />
                  </TouchableOpacity>
                </View>
                <Text style={s.skipNote}>Deja en 0 para continuar sin especificar</Text>
              </View>
            )}

            {/* PASO 4 — Foto */}
            {step === 3 && (
              <View>
                <View style={s.stepIconWrap}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.stepIconBadge}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={s.title}>Agrega una foto</Text>
                <Text style={s.subtitle}>Aparecerá en la pantalla de resultados</Text>
                <View style={s.photoArea}>
                  {petPhoto ? (
                    <PressableScale onPress={pickPhoto} activeScale={0.96}>
                      <View>
                        <View style={s.photoRingOuter}>
                          <Image source={{ uri: petPhoto }} style={s.photoPreview} />
                        </View>
                        <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.photoEditBtn}>
                          <MaterialCommunityIcons name="pencil" size={15} color="#fff" />
                        </LinearGradient>
                      </View>
                    </PressableScale>
                  ) : (
                    <View style={s.photoPlaceholderOuter}>
                      <View style={s.photoPlaceholder}>
                        <View style={s.cameraCircle}>
                          <MaterialCommunityIcons name="camera-plus-outline" size={30} color={C.indigo} />
                        </View>
                        <Text style={s.photoHint}>{petName || "Tu mascota"}</Text>
                        <Text style={s.photoSubHint}>Toca para agregar foto</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View style={s.photoActions}>
                  {[{ label: "Cámara", icon: "camera", fn: takePhoto }, { label: "Galería", icon: "image-multiple-outline", fn: pickPhoto }].map(b => (
                    <PressableScale key={b.label} onPress={b.fn} activeScale={0.95}>
                      <View style={s.photoBtn}>
                        <LinearGradient colors={["#4F46E5","#7C3AED"]} style={s.photoBtnIcon}>
                          <MaterialCommunityIcons name={b.icon} size={16} color="#fff" />
                        </LinearGradient>
                        <Text style={s.photoBtnText}>{b.label}</Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}

            {/* PASO 5 — Confirmación */}
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

          {/* Nav row (bottom) */}
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

  // Top navigation back button (header area)
  topNav: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 8, paddingBottom: 4, paddingHorizontal: 0,
  },
  topNavBack: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  topNavBackText: { fontFamily: "Inter_500Medium", fontSize: 15, color: C.muted },

  logoSection: { alignItems: "center", paddingTop: 20, paddingBottom: 24 },
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

  speciesRow: { flexDirection: "row", justifyContent: "center", gap: 22, marginTop: 4 },

  clayShadow: {
    borderRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 12,
  },
  clayCard: {
    width: 148, height: 178,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
  },
  clayShine: {
    position: "absolute",
    top: 14, left: 14,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  clayEmoji: { fontSize: 66, lineHeight: 78 },
  clayLabel: {
    fontSize: 17,
    textAlign: "center",
    marginTop: 14,
  },

  // Step icon badge (steps 2-4)
  stepIconWrap: { alignItems: "center", marginBottom: 18 },
  stepIconBadge: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
  },

  // Name input with icon prefix
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1.5, borderColor: C.inputBorder,
    borderRadius: 14, overflow: "hidden",
  },
  inputIconBox: {
    width: 46, alignItems: "center", justifyContent: "center",
    borderRightWidth: 1, borderRightColor: "rgba(203,213,225,0.6)",
    paddingVertical: 14,
  },
  inputWithIcon: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14,
    fontFamily: "Inter_500Medium", fontSize: 16, color: C.text,
  },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 8, textAlign: "right" },

  // Age stepper
  ageStepper: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 20, marginVertical: 12,
  },
  ageStepBtn: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: C.indigoLight, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(79,70,229,0.18)",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  ageDisplayBox: {
    width: 96, height: 80, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1.5, borderColor: "rgba(79,70,229,0.2)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 3,
  },
  ageNumber: { fontFamily: "Inter_800ExtraBold", fontSize: 36, color: C.indigo, letterSpacing: -1 },
  ageUnit: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted, marginTop: 2 },

  skipNote: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted, marginTop: 12, textAlign: "center" },

  // Photo step
  photoArea: { alignItems: "center", marginBottom: 24 },
  photoPlaceholderOuter: {
    width: 168, height: 168, borderRadius: 84,
    padding: 3,
    backgroundColor: "rgba(79,70,229,0.15)",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 16, elevation: 6,
  },
  photoPlaceholder: {
    flex: 1, borderRadius: 81,
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(79,70,229,0.12)",
  },
  cameraCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  photoHint: { fontFamily: "Inter_700Bold", fontSize: 13, color: C.indigo, textAlign: "center" },
  photoSubHint: { fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 3, textAlign: "center" },
  photoRingOuter: {
    width: 168, height: 168, borderRadius: 84,
    borderWidth: 3, borderColor: C.indigo,
    overflow: "hidden",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 7,
  },
  photoPreview: { width: "100%", height: "100%", borderRadius: 81 },
  photoEditBtn: {
    position: "absolute", bottom: 8, right: 8, width: 36, height: 36,
    borderRadius: 18, alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  photoActions: { flexDirection: "row", gap: 14, justifyContent: "center" },
  photoBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(79,70,229,0.15)",
    gap: 8,
  },
  photoBtnIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  photoBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.indigo },

  // Completion step
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
