import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, ScrollView, StatusBar, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import SiriWave from "../components/SiriWave";

const { width: SCREEN_W } = Dimensions.get("window");

// Color palette — Estresado updated to soft periwinkle per design spec
const EMOTION_MAP = {
  Feliz:      { color: "#10B981", bg: ["#059669CC","#34D39955"], wave: "#16D98B", barColors: ["#10B981","#34D399"] },
  Juguetón:   { color: "#3B82F6", bg: ["#2563EBCC","#60A5FA55"], wave: "#60B4FF", barColors: ["#3B82F6","#60A5FA"] },
  Alerta:     { color: "#D97706", bg: ["#D97706CC","#FCD34D55"], wave: "#FBBF24", barColors: ["#F59E0B","#FCD34D"] },
  Curioso:    { color: "#4F46E5", bg: ["#4338CACC","#818CF855"], wave: "#818CF8", barColors: ["#4F46E5","#818CF8"] },
  Estresado:  { color: "#6366F1", bg: ["#4F46E5CC","#A5B4FC55"], wave: "#A5B4FC", barColors: ["#6366F1","#A5B4FC"] },
  Asustado:   { color: "#7C3AED", bg: ["#6D28D9CC","#8B5CF655"], wave: "#A78BFA", barColors: ["#6D28D9","#8B5CF6"] },
  Tranquilo:  { color: "#64748B", bg: ["#475569CC","#94A3B855"], wave: "#94A3B8", barColors: ["#64748B","#94A3B8"] },
  Hambriento: { color: "#D97706", bg: ["#B45309CC","#FBBF2455"], wave: "#FCD34D", barColors: ["#D97706","#FBBF24"] },
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

// ─── Slim arc confidence ring ─────────────────────────────────────────────────
function ConfidenceArc({ pct, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct / 100, tension: 50, friction: 7, useNativeDriver: false }).start();
  }, [pct]);

  const SIZE = 110;
  const STROKE = 8;
  const R = SIZE / 2;

  const rightRot = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-180deg", "0deg", "0deg"] });
  const leftRot  = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-180deg", "-180deg", "0deg"] });

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ position: "absolute", width: SIZE, height: SIZE, borderRadius: R, borderWidth: STROKE, borderColor: "rgba(0,0,0,0.06)" }} />
      <View style={{ position: "absolute", width: R, height: SIZE, left: R, overflow: "hidden" }}>
        <Animated.View style={{ width: SIZE, height: SIZE, borderRadius: R, borderWidth: STROKE, borderColor: color, position: "absolute", left: -R, transform: [{ rotate: rightRot }] }} />
      </View>
      <View style={{ position: "absolute", width: R, height: SIZE, left: 0, overflow: "hidden" }}>
        <Animated.View style={{ width: SIZE, height: SIZE, borderRadius: R, borderWidth: STROKE, borderColor: color, position: "absolute", left: 0, transform: [{ rotate: leftRot }] }} />
      </View>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 22, color, letterSpacing: -0.5 }}>{pct}%</Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 9, color: "#94A3B8", letterSpacing: 1.4, marginTop: 1 }}>CONFIANZA</Text>
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
          <MaterialCommunityIcons name="paw" size={18} color="#4F46E5" />
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
        <MaterialCommunityIcons name="open-in-new" size={14} color="#CBD5E1" />
      </View>
    </View>
  );
}

// ─── ResultScreen ─────────────────────────────────────────────────────────────
export default function ResultScreen({ navigation }) {
  const { pet, analysisResult } = useApp();

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide   = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide   = useRef(new Animated.Value(28)).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(waveOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(heroSlide,   { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(heroOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(cardSlide,   { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const result = analysisResult || {
    emocion_principal: "Feliz",
    porcentaje_confianza: 91,
    traduccion_humana: "¡Estoy tan contento de verte! Eres mi persona favorita.",
    consejo_propietario: "Tu mascota está muy feliz. Refuerza con una caricia o juguete.",
    keyword_publicidad: "bienestar_animal",
  };

  const emo     = getEmo(result.emocion_principal);
  const petName = pet?.name || "Tu mascota";

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Emotion background — soft top wash */}
      <LinearGradient
        colors={emo.bg}
        style={[StyleSheet.absoluteFill, { height: 380 }]}
      />
      {/* Bottom fade to off-white */}
      <LinearGradient
        colors={["rgba(248,250,252,0)", "#F1F5F9"]}
        style={[StyleSheet.absoluteFill, { top: 300 }]}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.85}>
              <View style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#1E293B" />
              </View>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Resultado</Text>
            <View style={{ width: 42 }} />
          </View>

          {/* ── Pet avatar ── */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarBorder, { borderColor: emo.color + "66" }]}>
              {pet?.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.petCircle} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="paw" size={24} color={emo.color + "AA"} />
                </View>
              )}
            </View>
            <Text style={styles.petSaysLabel}>{petName} dice:</Text>
          </View>

          {/* ── Hero: Siri wave + emotion name ── */}
          <Animated.View
            style={[styles.heroSection, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}
          >
            {/* Siri wave center stage */}
            <Animated.View style={[styles.waveWrap, { opacity: waveOpacity }]}>
              {/* Soft ambient glow behind wave */}
              <View style={[styles.waveGlow, { backgroundColor: emo.wave + "28" }]} />
              {/* Primary wave */}
              <SiriWave
                color={emo.wave}
                width={SCREEN_W - 64}
                height={92}
                intensity={0.78}
                speed={0.9}
              />
              {/* Echo wave — thinner, offset, half-opacity */}
              <View style={styles.echoWrap}>
                <SiriWave
                  color={emo.color}
                  width={SCREEN_W - 64}
                  height={52}
                  intensity={0.45}
                  speed={0.62}
                />
              </View>
            </Animated.View>

            {/* Emotion label */}
            <Text style={[styles.emotionName, { color: emo.color }]}>
              {result.emocion_principal}
            </Text>
            <View style={[styles.emotionAccent, { backgroundColor: emo.color }]} />

            {/* ── Glass translation card ── */}
            <View style={styles.translationCard}>
              <Text style={styles.translationText}>{result.traduccion_humana}</Text>
            </View>
          </Animated.View>

          {/* ── Unified card: confidence + advice ── */}
          <Animated.View
            style={[styles.unifiedCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}
          >
            {/* Confidence */}
            <View style={styles.confSection}>
              <Text style={styles.confLabel}>Confianza del análisis</Text>
              <View style={{ alignItems: "center", paddingVertical: 18 }}>
                <ConfidenceArc pct={result.porcentaje_confianza} color={emo.color} />
              </View>
              <Text style={styles.confNote}>Basado en audio, postura corporal y entorno</Text>
            </View>

            <View style={styles.divider} />

            {/* Advice */}
            <View style={styles.adviceSection}>
              <View style={styles.adviceHeader}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.adviceIconGrad}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={13} color="#fff" />
                </LinearGradient>
                <Text style={styles.adviceTitle}>{petName} también te dice:</Text>
              </View>
              <Text style={styles.adviceText}>{result.consejo_propietario}</Text>
            </View>
          </Animated.View>

          {/* ── Ad ── */}
          <AdBlock keyword={result.keyword_publicidad} />

          {/* ── CTA ── */}
          <PressableScale onPress={() => navigation.navigate("Home")} style={{ marginHorizontal: 20 }}>
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <MaterialCommunityIcons name="microphone" size={18} color="#fff" style={{ marginRight: 8 }} />
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
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)",
  },
  topBarTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: "#1E293B", letterSpacing: -0.2 },

  // Avatar
  avatarSection: { alignItems: "center", paddingTop: 4, paddingBottom: 20 },
  avatarBorder: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 1.5, overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.55)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  petCircle: { width: "100%", height: "100%", borderRadius: 38 },
  avatarPlaceholder: {
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.40)",
  },
  petSaysLabel: {
    fontFamily: "Inter_400Regular", fontSize: 14,
    color: "rgba(30,41,59,0.65)", marginTop: 10, letterSpacing: 0.1,
  },

  // Hero
  heroSection: { paddingHorizontal: 32, marginBottom: 24 },

  // Siri wave
  waveWrap: {
    alignItems: "center",
    marginBottom: 28,
    position: "relative",
  },
  waveGlow: {
    position: "absolute",
    width: "100%", height: "100%",
    borderRadius: 60,
    top: 4,
  },
  echoWrap: {
    position: "absolute",
    bottom: -8,
    opacity: 0.5,
  },

  // Emotion label
  emotionName: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 32,
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: 10,
  },
  emotionAccent: {
    width: 40, height: 3, borderRadius: 2,
    alignSelf: "center", opacity: 0.7, marginBottom: 22,
  },

  // Glassmorphism translation card
  translationCard: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  translationText: {
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    color: "#1E293B",
    lineHeight: 28,
    letterSpacing: -0.1,
    textAlign: "center",
  },

  // Unified card
  unifiedCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 14, elevation: 4,
    overflow: "hidden",
  },
  confSection: { padding: 20, paddingBottom: 14 },
  confLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#64748B", letterSpacing: 0.1 },
  confNote: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 2 },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(0,0,0,0.07)", marginHorizontal: 20 },

  adviceSection: { padding: 20, paddingTop: 14 },
  adviceHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  adviceIconGrad: {
    width: 24, height: 24, borderRadius: 7,
    alignItems: "center", justifyContent: "center",
  },
  adviceTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#4F46E5" },
  adviceText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#374151", lineHeight: 22, letterSpacing: 0 },

  // Ad
  adBlock: {
    marginHorizontal: 20, marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(226,232,240,0.9)",
    borderRadius: 16, padding: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  adLabel: {
    fontFamily: "Inter_400Regular", fontSize: 9, color: "#CBD5E1",
    marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8,
  },
  adInner: { flexDirection: "row", alignItems: "center" },
  adIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center",
  },
  adTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#1E293B", marginBottom: 2 },
  adSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#64748B" },

  // CTA
  ctaBtn: {
    borderRadius: 16, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 7,
  },
  ctaBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff", letterSpacing: 0.1 },
});
