import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, ScrollView, StatusBar, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import GlassView from "../components/GlassView";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useApp } from "../context/AppContext";

const { width: W, height: H } = Dimensions.get("window");

// Each emotion: rich multi-stop gradient + accent colors for glow blobs
const EMOTION_MAP = {
  Feliz:      { gradient:["#022C22","#064E3B","#065F46"], accent1:"#10B981", accent2:"#34D399", light:"#6EE7B7", icon:"emoticon-excited-outline" },
  "Juguetón": { gradient:["#0C1A4E","#1E3A8A","#2563EB"], accent1:"#60A5FA", accent2:"#93C5FD", light:"#BFDBFE", icon:"tennis-ball" },
  Alerta:     { gradient:["#1C0A00","#92400E","#B45309"], accent1:"#FBBF24", accent2:"#FCD34D", light:"#FEF08A", icon:"bell-ring-outline" },
  Curioso:    { gradient:["#0F0D2A","#1E1B4B","#312E81"], accent1:"#818CF8", accent2:"#A5B4FC", light:"#C7D2FE", icon:"eye-outline" },
  Estresado:  { gradient:["#200A0A","#7F1D1D","#991B1B"], accent1:"#F87171", accent2:"#FCA5A5", light:"#FECACA", icon:"lightning-bolt" },
  Asustado:   { gradient:["#130520","#3B0764","#5B21B6"], accent1:"#A78BFA", accent2:"#C4B5FD", light:"#DDD6FE", icon:"ghost-outline" },
  Tranquilo:  { gradient:["#06141A","#0C2E40","#0E3D52"], accent1:"#38BDF8", accent2:"#7DD3FC", light:"#BAE6FD", icon:"weather-night" },
  Hambriento: { gradient:["#1C0A00","#78350F","#92400E"], accent1:"#FB923C", accent2:"#FDBA74", light:"#FED7AA", icon:"food-drumstick-outline" },
};

function getEmo(e) { return EMOTION_MAP[e] || EMOTION_MAP["Tranquilo"]; }

function PressableScale({ onPress, children, style }) {
  const s = useRef(new Animated.Value(1)).current;
  const cfg = { useNativeDriver: true };
  return (
    <TouchableOpacity
      onPressIn={() => Animated.spring(s, { toValue: 0.96, tension: 300, friction: 12, ...cfg }).start()}
      onPressOut={() => Animated.spring(s, { toValue: 1, tension: 200, friction: 8, ...cfg }).start()}
      onPress={onPress} activeOpacity={1} style={style}
    >
      <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// Thin arc-style confidence indicator
function ConfidencePill({ pct, color }) {
  const barW = useRef(new Animated.Value(0)).current;
  const barMaxW = W - 140;
  useEffect(() => {
    Animated.spring(barW, { toValue: (pct / 100) * barMaxW, tension: 55, friction: 8, useNativeDriver: false }).start();
  }, []);
  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 28, color: "#fff", letterSpacing: -1 }}>{pct}%</Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: 6, marginTop: 4 }}>confianza</Text>
      </View>
      <View style={{ width: barMaxW, height: 3, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
        <Animated.View style={{ height: 3, borderRadius: 2, backgroundColor: color, width: barW,
          shadowColor: color, shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }} />
      </View>
    </View>
  );
}

// Floating light blob for depth
function LightBlob({ color, size, top, left, right, bottom, opacity = 0.18 }) {
  return (
    <View style={{
      position: "absolute", width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity,
      top, left, right, bottom,
      shadowColor: color, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1, shadowRadius: size * 0.5, elevation: 0,
    }} />
  );
}

export default function ResultScreen({ navigation }) {
  const { pet, analysisResult, addToHistory, lastPosture, lastEnvironment } = useApp();
  const savedRef = React.useRef(false);

  const titleY   = useRef(new Animated.Value(50)).current;
  const titleO   = useRef(new Animated.Value(0)).current;
  const imgScale = useRef(new Animated.Value(0.5)).current;
  const imgO     = useRef(new Animated.Value(0)).current;
  const card1Y   = useRef(new Animated.Value(40)).current;
  const card1O   = useRef(new Animated.Value(0)).current;
  const card2Y   = useRef(new Animated.Value(55)).current;
  const card2O   = useRef(new Animated.Value(0)).current;
  const floatY   = useRef(new Animated.Value(0)).current;

  // Save to history once per result
  useEffect(() => {
    if (analysisResult && !savedRef.current) {
      savedRef.current = true;
      const now = new Date();
      const ts  = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      const today = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
      const dayLabel = now >= today ? "Hoy"
        : now >= yesterday ? "Ayer"
        : now.toLocaleDateString("es-ES", { weekday:"long" }).replace(/^\w/, c=>c.toUpperCase());
      addToHistory({
        id:        Date.now().toString(),
        ts,
        day:       dayLabel,
        timestamp: now.toISOString(),
        emotion:   analysisResult.emocion_principal,
        text:      analysisResult.traduccion_humana,
        posture:   lastPosture,
        environment: lastEnvironment,
      });
    }
  }, [analysisResult]);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(titleY, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        Animated.timing(titleO, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(imgScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(imgO, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(card1Y, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(card1O, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(card2Y, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(card2O, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    // Gentle float for emotion image
    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -8, duration: 2400, useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration: 2400, useNativeDriver: true }),
    ])).start();
  }, []);

  const result = analysisResult || {
    emocion_principal: "Feliz",
    porcentaje_confianza: 91,
    traduccion_humana: "¡Estoy tan contento de verte! Eres mi persona favorita en el mundo.",
    consejo_propietario: "Tu mascota está en su mejor momento emocional. Una caricia o juguete reforzará este vínculo.",
  };

  const emo     = getEmo(result.emocion_principal);
  const petName = pet?.name || "Tu mascota";

  return (
    <View style={{ flex: 1, backgroundColor: emo.gradient[0] }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* === Multi-layer background for depth === */}
      <LinearGradient
        colors={[emo.gradient[0], emo.gradient[1], emo.gradient[2]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      {/* Second diagonal light layer */}
      <LinearGradient
        colors={[emo.accent1 + "22", "transparent", emo.accent2 + "14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
      />

      {/* Light blobs — scattered light sources for depth */}
      <LightBlob color={emo.accent1} size={260} top={-80} left={-60} opacity={0.22} />
      <LightBlob color={emo.accent2} size={200} top={H * 0.3} right={-80} opacity={0.18} />
      <LightBlob color={emo.light}   size={150} top={H * 0.55} left={-40} opacity={0.12} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.75}>
              <GlassView intensity={20} tint="dark" style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
              </GlassView>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Análisis</Text>
            {pet?.photo
              ? <Image source={{ uri: pet.photo }} style={styles.petAvatar} />
              : <GlassView intensity={20} tint="dark" style={styles.petAvatarBlur}>
                  <Text style={styles.petAvatarLetter}>{petName[0]?.toUpperCase()}</Text>
                </GlassView>
            }
          </View>

          {/* === HERO SECTION === */}
          <View style={styles.heroSection}>

            {/* Pet name label */}
            <Animated.View style={{ opacity: titleO, transform: [{ translateY: titleY }] }}>
              <View style={styles.petLabelRow}>
                <View style={[styles.petLabelDot, { backgroundColor: emo.accent1 }]} />
                <Text style={styles.petLabelText}>{petName} siente:</Text>
              </View>
            </Animated.View>

            {/* Emotion name — the real hero */}
            <Animated.Text
              style={[styles.emotionName, { opacity: titleO, transform: [{ translateY: titleY }] }]}
            >
              {result.emocion_principal}
            </Animated.Text>

            {/* Thin accent underline */}
            <Animated.View style={{ opacity: titleO }}>
              <LinearGradient
                colors={[emo.accent2, emo.accent1, "transparent"]}
                style={styles.accentLine}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </Animated.View>

            {/* Emotion icon — floating, right-aligned with glow */}
            <Animated.View style={[
              styles.emotionImgWrapper,
              { opacity: imgO, transform: [{ scale: imgScale }, { translateY: floatY }] }
            ]}>
              {/* Outer glow blob */}
              <View style={[styles.emotionImgGlow, { backgroundColor: emo.accent1 }]} />
              {/* Premium icon: gradient circle + large icon */}
              <LinearGradient
                colors={[emo.accent2, emo.accent1]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.emotionIconCircle}
              >
                <MaterialCommunityIcons name={emo.icon} size={52} color="#fff" />
              </LinearGradient>
            </Animated.View>

            {/* Confidence strip */}
            <Animated.View style={{ opacity: titleO, transform: [{ translateY: titleY }], marginTop: 4 }}>
              <ConfidencePill pct={result.porcentaje_confianza} color={emo.accent2} />
            </Animated.View>
          </View>

          {/* === TRANSLATION CARD === */}
          <Animated.View style={{ opacity: card1O, transform: [{ translateY: card1Y }] }}>
            <View style={styles.sectionLabel}>
              <MaterialCommunityIcons name="chat-outline" size={13} color={emo.light} />
              <Text style={[styles.sectionLabelText, { color: emo.light }]}>Lo que siente</Text>
            </View>
            <GlassView intensity={32} tint="light" style={styles.translationCard}>
              {/* Quote mark decoration */}
              <Text style={[styles.quoteMark, { color: emo.accent1 }]}>"</Text>
              <Text style={styles.translationText}>{result.traduccion_humana}</Text>
            </GlassView>
          </Animated.View>

          {/* === ADVICE CARD === */}
          <Animated.View style={{ opacity: card2O, transform: [{ translateY: card2Y }] }}>
            <View style={styles.sectionLabel}>
              <MaterialCommunityIcons name="lightbulb-outline" size={13} color={emo.light} />
              <Text style={[styles.sectionLabelText, { color: emo.light }]}>Consejo para ti</Text>
            </View>
            <GlassView intensity={18} tint="dark" style={styles.adviceCard}>
              <LinearGradient
                colors={[emo.accent1 + "28", "transparent"]}
                style={styles.adviceCardAccent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              />
              <View style={[styles.adviceStripe, { backgroundColor: emo.accent1 }]} />
              <Text style={styles.adviceText}>{result.consejo_propietario}</Text>
            </GlassView>
          </Animated.View>

          {/* CTA */}
          <Animated.View style={{ opacity: card2O, marginTop: 8, marginBottom: 20 }}>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                navigation.navigate("Home");
              }}
              style={{ marginHorizontal: 20 }}
            >
              <LinearGradient
                colors={[emo.accent1, emo.accent2]}
                style={styles.ctaBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="microphone" size={17} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.ctaBtnText}>Analizar otro sonido</Text>
              </LinearGradient>
            </PressableScale>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 16 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  topBarTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 },
  petAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)" },
  petAvatarBlur: {
    width: 36, height: 36, borderRadius: 18, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  petAvatarLetter: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },

  // Hero
  heroSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  petLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  petLabelDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  petLabelText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: 0.2 },

  emotionName: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 58,
    color: "#fff",
    letterSpacing: -2.5,
    lineHeight: 62,
    marginBottom: 14,
  },

  accentLine: {
    width: 80, height: 3, borderRadius: 2, marginBottom: 28,
  },

  // Emotion image — floating in hero space, positioned to right
  emotionImgWrapper: {
    alignSelf: "flex-end",
    marginRight: 12,
    marginTop: -24,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    width: 110, height: 110,
  },
  emotionIconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  emotionImgGlow: {
    position: "absolute",
    width: 120, height: 120, borderRadius: 60,
    opacity: 0.35,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 36,
    elevation: 12,
  },
  emotionImg: {
    width: 82, height: 82,
  },

  // Section labels
  sectionLabel: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 24, marginBottom: 8,
  },
  sectionLabelText: {
    fontFamily: "Inter_600SemiBold", fontSize: 11,
    letterSpacing: 0.8, textTransform: "uppercase",
    marginLeft: 5, opacity: 0.85,
  },

  // Translation card
  translationCard: {
    marginHorizontal: 20, marginBottom: 20,
    borderRadius: 24, overflow: "hidden",
    paddingHorizontal: 24, paddingVertical: 24,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.35)",
  },
  quoteMark: { fontFamily: "Inter_800ExtraBold", fontSize: 40, lineHeight: 36, marginBottom: 4, opacity: 0.7 },
  translationText: {
    fontFamily: "Inter_400Regular", fontSize: 17,
    color: "#1E293B", lineHeight: 28, letterSpacing: -0.1,
  },

  // Advice card
  adviceCard: {
    marginHorizontal: 20, marginBottom: 20,
    borderRadius: 24, overflow: "hidden",
    paddingHorizontal: 24, paddingVertical: 20,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row", alignItems: "flex-start",
  },
  adviceCardAccent: { ...StyleSheet.absoluteFillObject },
  adviceStripe: { width: 3, borderRadius: 2, marginRight: 14, minHeight: 50, alignSelf: "stretch" },
  adviceText: {
    fontFamily: "Inter_400Regular", fontSize: 14,
    color: "rgba(255,255,255,0.85)", lineHeight: 22, flex: 1,
  },

  // CTA
  ctaBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  ctaBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff", letterSpacing: 0.1 },
});
