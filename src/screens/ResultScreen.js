import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, ScrollView, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { ClayCharacter } from "../components/ClayCharacter";

const EMOTION_MAP = {
  Feliz:      { color: "#10B981", icon: "star",                    doodleBg: "#D1FAE5", iconColors: ["#059669","#34D399"], barColors: ["#10B981","#34D399"] },
  Juguetón:   { color: "#3B82F6", icon: "lightning-bolt",          doodleBg: "#DBEAFE", iconColors: ["#2563EB","#60A5FA"], barColors: ["#3B82F6","#60A5FA"] },
  Alerta:     { color: "#D97706", icon: "bell-ring",               doodleBg: "#FEF3C7", iconColors: ["#D97706","#FCD34D"], barColors: ["#F59E0B","#FCD34D"] },
  Curioso:    { color: "#4F46E5", icon: "telescope",               doodleBg: "#EEF2FF", iconColors: ["#4338CA","#818CF8"], barColors: ["#4F46E5","#818CF8"] },
  Estresado:  { color: "#EC4899", icon: "fire",                    doodleBg: "#FCE7F3", iconColors: ["#DB2777","#F472B6"], barColors: ["#DB2777","#F472B6"] },
  Asustado:   { color: "#7C3AED", icon: "weather-lightning-rainy", doodleBg: "#F5F3FF", iconColors: ["#6D28D9","#8B5CF6"], barColors: ["#6D28D9","#8B5CF6"] },
  Tranquilo:  { color: "#64748B", icon: "leaf",                    doodleBg: "#F1F5F9", iconColors: ["#475569","#94A3B8"], barColors: ["#64748B","#94A3B8"] },
  Hambriento: { color: "#D97706", icon: "bone",                    doodleBg: "#FEF3C7", iconColors: ["#B45309","#FBBF24"], barColors: ["#D97706","#FBBF24"] },
};

function getEmo(emocion) {
  return EMOTION_MAP[emocion] || EMOTION_MAP["Tranquilo"];
}


// ─── PressableScale ───────────────────────────────────────────────────────────
function PressableScale({ onPress, style, children, disabled }) {
  const anim = useRef(new Animated.Value(1)).current;
  const cfg = { useNativeDriver: true };
  const press = () => Animated.spring(anim, { toValue: 0.97, tension: 300, friction: 12, ...cfg }).start();
  const release = () => Animated.spring(anim, { toValue: 1, tension: 200, friction: 8, ...cfg }).start();
  return (
    <TouchableOpacity onPressIn={press} onPressOut={release} onPress={onPress} disabled={disabled} activeOpacity={1} style={style}>
      <Animated.View style={{ transform: [{ scale: anim }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// ─── Circular confidence indicator ───────────────────────────────────────────
function CircleProgress({ pct, colors }) {
  const SIZE = 148;
  const STROKE = 13;
  const R = SIZE / 2;
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animVal, { toValue: pct / 100, tension: 55, friction: 7, useNativeDriver: false }).start();
  }, [pct]);

  // Right fill covers 0→50%, left fill covers 50→100%
  const rightRot = animVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-180deg", "0deg", "0deg"],
  });
  const leftRot = animVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-180deg", "-180deg", "0deg"],
  });

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      {/* Gray track */}
      <View style={{ position: "absolute", width: SIZE, height: SIZE, borderRadius: R, borderWidth: STROKE, borderColor: "#E2E8F0" }} />
      {/* Right half fill */}
      <View style={{ position: "absolute", width: R, height: SIZE, left: R, overflow: "hidden" }}>
        <Animated.View style={{
          width: SIZE, height: SIZE, borderRadius: R, borderWidth: STROKE, borderColor: colors[0],
          position: "absolute", left: -R, transform: [{ rotate: rightRot }],
        }} />
      </View>
      {/* Left half fill */}
      <View style={{ position: "absolute", width: R, height: SIZE, left: 0, overflow: "hidden" }}>
        <Animated.View style={{
          width: SIZE, height: SIZE, borderRadius: R, borderWidth: STROKE, borderColor: colors[0],
          position: "absolute", left: 0, transform: [{ rotate: leftRot }],
        }} />
      </View>
      {/* Center text */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "Inter_800ExtraBold", fontSize: 30, color: colors[0], letterSpacing: -1 }}>{pct}%</Text>
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#94A3B8", letterSpacing: 1.2, marginTop: 2 }}>CONFIANZA</Text>
      </View>
    </View>
  );
}

// ─── Ad block ─────────────────────────────────────────────────────────────────
function AdBlock({ keyword }) {
  return (
    <View style={styles.adBlock}>
      <Text style={styles.adLabel}>Patrocinado</Text>
      <View style={styles.adInner}>
        <View style={styles.adIconBox}>
          <MaterialCommunityIcons name="paw" size={20} color="#4F46E5" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.adTitle}>Productos para tu mascota</Text>
          <Text style={styles.adSub}>
            {keyword === "veterinario"
              ? "Consulta online con veterinarios certificados"
              : keyword === "comida_mascotas"
              ? "Alimento premium con envío gratis"
              : "Juguetes y accesorios recomendados por expertos"}
          </Text>
        </View>
        <MaterialCommunityIcons name="open-in-new" size={16} color="#94A3B8" />
      </View>
    </View>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────
export default function ResultScreen({ navigation }) {
  const { pet, analysisResult } = useApp();
  const heroSlide   = useRef(new Animated.Value(24)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(32)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const doodleScale  = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(doodleScale, { toValue: 1, tension: 90, friction: 7, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.spring(cardSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const result = analysisResult || {
    emocion_principal: "Feliz",
    porcentaje_confianza: 91,
    traduccion_humana: "¡Estoy tan contento de verte! Eres mi persona favorita.",
    consejo_propietario: "Tu mascota está muy feliz. Refuerza con una caricia o juguete.",
    keyword_publicidad: "bienestar_animal",
  };

  const emo       = getEmo(result.emocion_principal);
  const petName   = pet?.name    || "Tu mascota";
  const petSpecies = pet?.species || "dog";

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Emotion-tinted background gradient — changes with each emotion */}
      <LinearGradient
        colors={[emo.iconColors[0] + "CC", emo.iconColors[1] + "77", "rgba(248,250,252,0)"]}
        style={[StyleSheet.absoluteFill, { height: 430 }]}
      />
      <LinearGradient colors={["rgba(248,250,252,0)", "#EEF2FF", "#F5F3FF"]} style={[StyleSheet.absoluteFill, { top: 340 }]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Top bar with back button ── */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.85}>
              <View style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={22} color="#1E293B" />
              </View>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Resultado</Text>
            <View style={{ width: 42 }} />
          </View>

          {/* ── Pet avatar — marco minimalista ── */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarBorder, { borderColor: emo.color + "99" }]}>
              {pet?.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.petCircle} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="paw" size={28} color={emo.color + "AA"} />
                </View>
              )}
            </View>
            <Text style={styles.petSaysLabel}>{petName} dice:</Text>
          </View>

          {/* ── Hero: personaje clay + nombre emoción + traducción ── */}
          <Animated.View
            style={[styles.heroSection, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}
          >
            <View style={styles.emotionHero}>
              {/* Aura de color detrás del personaje */}
              <View style={[styles.clayAura, { backgroundColor: emo.iconColors[0] + "40" }]} />
              {/* Personaje clay animado con spring de entrada */}
              <Animated.View style={{ marginBottom: 18, transform: [{ scale: doodleScale }] }}>
                <ClayCharacter species={petSpecies} active={true} size={100} />
              </Animated.View>
              <Text style={[styles.emotionName, { color: emo.color }]}>
                {result.emocion_principal}
              </Text>
              <View style={[styles.emotionAccent, { backgroundColor: emo.color }]} />
            </View>

            {/* Tarjeta glassmorphism */}
            <View style={styles.translationCard}>
              <Text style={styles.translationText}>{result.traduccion_humana}</Text>
            </View>
          </Animated.View>

          {/* ── Tarjeta unificada: confianza + consejo ── */}
          <Animated.View
            style={[styles.unifiedCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}
          >
            {/* Confidence */}
            <View style={styles.confSection}>
              <Text style={styles.confLabel}>Confianza del análisis</Text>
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <View style={{
                  shadowColor: emo.barColors[0],
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 18,
                  elevation: 12,
                }}>
                  <CircleProgress pct={result.porcentaje_confianza} colors={emo.barColors} />
                </View>
              </View>
              <Text style={styles.confNote}>Basado en audio, postura corporal y entorno</Text>
            </View>

            <View style={styles.divider} />

            {/* Advice */}
            <View style={styles.adviceSection}>
              <View style={styles.adviceHeader}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.adviceIconGrad}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color="#fff" />
                </LinearGradient>
                <Text style={styles.adviceTitle}>{petName} también te dice:</Text>
              </View>
              <Text style={styles.adviceText}>{result.consejo_propietario}</Text>
            </View>
          </Animated.View>

          {/* ── AdMob ── */}
          <AdBlock keyword={result.keyword_publicidad} />

          {/* ── CTA ── */}
          <PressableScale onPress={() => navigation.navigate("Home")} style={{ marginHorizontal: 20 }}>
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <MaterialCommunityIcons name="microphone" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.ctaBtnText}>Analizar otro sonido</Text>
            </LinearGradient>
          </PressableScale>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 48 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
  },
  topBarTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#1E293B" },

  avatarSection: { alignItems: "center", paddingTop: 4, paddingBottom: 24 },
  avatarBorder: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.55)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 5,
  },
  petCircle: { width: "100%", height: "100%", borderRadius: 42 },
  avatarPlaceholder: {
    width: "100%", height: "100%", borderRadius: 42,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.40)",
  },
  petSaysLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "rgba(30,41,59,0.75)", marginTop: 12 },

  heroSection: { paddingHorizontal: 24, marginBottom: 28 },
  emotionHero: { alignItems: "center", marginBottom: 24 },
  clayAura: {
    position: "absolute",
    width: 150, height: 150, borderRadius: 75,
  },
  emotionName: {
    fontFamily: "Inter_800ExtraBold", fontSize: 34,
    letterSpacing: -1.2, marginBottom: 14,
  },
  emotionAccent: {
    width: 52, height: 4, borderRadius: 2, opacity: 0.8,
  },
  // Free-floating translation text — no card box
  translationCard: {
    backgroundColor: "rgba(255,255,255,0.26)",
    borderRadius: 28,
    paddingHorizontal: 28, paddingVertical: 28,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, shadowRadius: 24, elevation: 6,
    alignItems: "center",
  },
  translationText: {
    fontFamily: "Inter_600SemiBold", fontSize: 18,
    color: "#1E293B", lineHeight: 30, letterSpacing: -0.2,
    textAlign: "center",
  },

  // Unified card
  unifiedCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 16, elevation: 5,
    overflow: "hidden",
  },
  confSection: { padding: 20, paddingBottom: 16 },
  confLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#1E293B" },
  confNote: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8", textAlign: "center" },

  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)", marginHorizontal: 20 },

  adviceSection: { padding: 20, paddingTop: 16 },
  adviceHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  adviceIconGrad: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  adviceTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#4F46E5" },
  adviceText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#374151", lineHeight: 22 },

  // Ad
  adBlock: {
    marginHorizontal: 20, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(226,232,240,0.8)",
    borderRadius: 18, padding: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  adLabel: {
    fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8",
    marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
  },
  adInner: { flexDirection: "row", alignItems: "center" },
  adIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
  },
  adTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#1E293B", marginBottom: 2 },
  adSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#64748B" },

  // CTA
  ctaBtn: {
    borderRadius: 18, paddingVertical: 17,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
});
