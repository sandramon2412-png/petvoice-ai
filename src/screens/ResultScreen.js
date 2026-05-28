import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, ScrollView, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

const EMOTION_MAP = {
  Feliz:      { pillBg: "rgba(16,185,129,0.13)",  pillText: "#059669", barColors: ["#10B981","#34D399"], icon: "emoticon-happy-outline",  cardBg: "rgba(16,185,129,0.07)" },
  Juguetón:   { pillBg: "rgba(16,185,129,0.13)",  pillText: "#059669", barColors: ["#10B981","#34D399"], icon: "emoticon-excited-outline", cardBg: "rgba(16,185,129,0.07)" },
  Alerta:     { pillBg: "rgba(245,158,11,0.13)",  pillText: "#D97706", barColors: ["#F59E0B","#FBBF24"], icon: "alert-circle-outline",     cardBg: "rgba(245,158,11,0.07)" },
  Curioso:    { pillBg: "rgba(251,191,36,0.13)",  pillText: "#B45309", barColors: ["#FBBF24","#FCD34D"], icon: "help-circle-outline",      cardBg: "rgba(251,191,36,0.07)" },
  Estresado:  { pillBg: "rgba(239,68,68,0.13)",   pillText: "#DC2626", barColors: ["#EF4444","#F87171"], icon: "emoticon-sad-outline",     cardBg: "rgba(239,68,68,0.08)"  },
  Asustado:   { pillBg: "rgba(220,38,38,0.13)",   pillText: "#B91C1C", barColors: ["#DC2626","#EF4444"], icon: "shield-alert-outline",     cardBg: "rgba(220,38,38,0.08)"  },
  Tranquilo:  { pillBg: "rgba(100,116,139,0.13)", pillText: "#475569", barColors: ["#64748B","#94A3B8"], icon: "sleep",                    cardBg: "rgba(100,116,139,0.07)"},
  Hambriento: { pillBg: "rgba(249,115,22,0.13)",  pillText: "#EA580C", barColors: ["#F97316","#FB923C"], icon: "food-outline",             cardBg: "rgba(249,115,22,0.07)" },
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

// ─── Confidence bar ───────────────────────────────────────────────────────────
function ConfidenceBar({ pct, colors }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct / 100, tension: 60, friction: 8, useNativeDriver: false }).start();
  }, [pct]);
  const barWidth = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={styles.barTrack}>
      <Animated.View style={{ width: barWidth, height: "100%", overflow: "hidden", borderRadius: 3 }}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
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

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroSlide, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
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
    consejo_propietario: "Tu mascota está muy feliz ahora mismo. Refuerza este momento con una caricia o su juguete favorito.",
    keyword_publicidad: "bienestar_animal",
  };

  const emo = getEmo(result.emocion_principal);
  const petName    = pet?.name || "Tu mascota";
  const petInitial = petName[0]?.toUpperCase() || "?";

  return (
    <LinearGradient colors={["#F8FAFC", "#EEF2FF", "#F5F3FF"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.85}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Resultado</Text>
            <View style={{ width: 42 }} />
          </View>

          {/* ── Pet avatar ── */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.avatarBorder}>
              {pet?.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.petCircle} />
              ) : (
                <View style={[styles.petCircle, styles.petCircleFallback]}>
                  <Text style={styles.petCircleLetter}>{petInitial}</Text>
                </View>
              )}
            </LinearGradient>
            <Text style={styles.petSaysLabel}>{petName} dice:</Text>
          </View>

          {/* ── Hero: emotion pill + translation (sin tarjeta, sin comillas) ── */}
          <Animated.View
            style={[styles.heroSection, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}
          >
            <View style={[styles.emotionPill, { backgroundColor: emo.pillBg }]}>
              <MaterialCommunityIcons name={emo.icon} size={14} color={emo.pillText} style={{ marginRight: 5 }} />
              <Text style={[styles.emotionPillText, { color: emo.pillText }]}>
                {result.emocion_principal}
              </Text>
            </View>

            <View style={[styles.translationCard, { backgroundColor: emo.cardBg }]}>
              <Text style={styles.translationHero}>
                {result.traduccion_humana}
              </Text>
            </View>
          </Animated.View>

          {/* ── Tarjeta unificada: confianza + consejo ── */}
          <Animated.View
            style={[styles.unifiedCard, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}
          >
            {/* Confidence */}
            <View style={styles.confSection}>
              <View style={styles.confHeader}>
                <Text style={styles.confLabel}>Confianza del análisis</Text>
                <Text style={[styles.confPct, { color: emo.barColors[0] }]}>
                  {result.porcentaje_confianza}%
                </Text>
              </View>
              <ConfidenceBar pct={result.porcentaje_confianza} colors={emo.barColors} />
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
    </LinearGradient>
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
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14, shadowRadius: 6, elevation: 3,
  },
  topBarTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#1E293B" },

  avatarSection: { alignItems: "center", paddingTop: 8, paddingBottom: 28 },
  avatarBorder: {
    width: 88, height: 88, borderRadius: 44, padding: 3,
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 5,
  },
  petCircle: { width: "100%", height: "100%", borderRadius: 41 },
  petCircleFallback: {
    backgroundColor: "#EEF2FF", alignItems: "center",
    justifyContent: "center", borderRadius: 41,
  },
  petCircleLetter: { fontFamily: "Inter_800ExtraBold", fontSize: 32, color: "#4F46E5" },
  petSaysLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#64748B", marginTop: 12 },

  // Hero (no card)
  heroSection: { paddingHorizontal: 24, marginBottom: 28 },
  emotionPill: {
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center",
    borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16,
  },
  emotionPillText: { fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 0.1 },
  translationCard: {
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  translationHero: {
    fontFamily: "Inter_500Medium", fontSize: 18,
    color: "#1E293B", lineHeight: 30, letterSpacing: -0.2,
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
  confHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  confLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#1E293B" },
  confPct: { fontFamily: "Inter_800ExtraBold", fontSize: 22, letterSpacing: -0.5 },
  barTrack: {
    height: 6, backgroundColor: "#E2E8F0", borderRadius: 3,
    overflow: "hidden", marginBottom: 10,
  },
  confNote: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8" },

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
