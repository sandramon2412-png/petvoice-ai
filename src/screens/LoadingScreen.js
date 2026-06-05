import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

const { width: SCREEN_W } = Dimensions.get("window");
const BAR_COUNT = 36;
const MESSAGES = [
  "Escuchando la voz única de tu mascota...",
  "Detectando patrones emocionales...",
  "Analizando 247 parámetros de bioacústica...",
  "Correlacionando postura y contexto...",
  "¡Casi listo! Generando tu traducción...",
];
const MSG_INTERVAL = 800;
const TOTAL_DURATION = 4200;

function barColor(index, total) {
  const ratio = index / total;
  if (ratio < 0.25) return "#60A5FA";
  if (ratio < 0.5)  return "#818CF8";
  if (ratio < 0.75) return "#A78BFA";
  return "#F472B6";
}

// ─── Spectrogram bar ──────────────────────────────────────────────────────────
function SpectroBar({ index, total }) {
  const anim = useRef(new Animated.Value(0.15)).current;
  const r1 = useRef(Math.random()).current;
  const r2 = useRef(Math.random()).current;
  const r3 = useRef(Math.random()).current;

  useEffect(() => {
    const delay = (index / total) * 350;
    const duration = 380 + r1 * 320;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 0.2 + r2 * 0.8,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0.05 + r3 * 0.25,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [index]);

  const maxHeight = 116;
  const barHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, maxHeight],
  });

  const color = barColor(index, total);
  const barW = Math.floor((SCREEN_W - 48 - (BAR_COUNT - 1) * 2) / BAR_COUNT);

  return (
    <Animated.View
      style={{
        width: barW,
        height: barHeight,
        backgroundColor: color,
        borderRadius: 2,
        minHeight: 3,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 5,
        elevation: 6,
      }}
    />
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export default function LoadingScreen({ navigation }) {
  const { analysisResult } = useApp();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoGlow = useRef(new Animated.Value(0.4)).current;
  const navigatedRef = useRef(false);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: TOTAL_DURATION - 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => {
      setProgressPct(Math.round(value * 100));
    });
    return () => progressAnim.removeListener(listener);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 1.12, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(logoGlow,  { toValue: 1.0,  duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 1.0,  duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(logoGlow,  { toValue: 0.4,  duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      current += 1;
      if (current < MESSAGES.length) setMsgIndex(current);
      else clearInterval(interval);
    }, MSG_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigation.replace("Result");
      }
    }, TOTAL_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (analysisResult && !navigatedRef.current) {
      const t = setTimeout(() => {
        navigatedRef.current = true;
        navigation.replace("Result");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [analysisResult]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient colors={["#08091A", "#0D1030", "#0A0F2E"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor="#08091A" />

        <View style={styles.container}>

          {/* Branded header */}
          <View style={styles.header}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <Animated.View style={[styles.logoGlowRing, { opacity: logoGlow }]} />
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.logoCircle}>
                <MaterialCommunityIcons name="waveform" size={28} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Analizando...</Text>
              <Text style={styles.headerSub}>PetVoice AI · Procesando audio</Text>
            </View>
          </View>

          {/* Spectrogram with glow backdrop */}
          <View style={styles.spectroWrap}>
            <View style={styles.spectroGlow} />
            <View style={styles.spectroContainer}>
              {[...Array(BAR_COUNT)].map((_, i) => (
                <SpectroBar key={i} index={i} total={BAR_COUNT} />
              ))}
            </View>
            <View style={styles.spectroAxisLine} />
          </View>

          {/* Frequency labels */}
          <View style={styles.freqLabels}>
            <Text style={styles.freqLabel}>0 Hz</Text>
            <Text style={styles.freqLabel}>500 Hz</Text>
            <Text style={styles.freqLabel}>2 kHz</Text>
            <Text style={styles.freqLabel}>8 kHz</Text>
          </View>

          {/* Message */}
          <View style={styles.msgWrap}>
            <Animated.Text style={[styles.msgText, { opacity: fadeAnim }]}>
              {MESSAGES[msgIndex]}
            </Animated.Text>
          </View>

          {/* Progress bar + percentage */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View style={{ width: progressWidth, height: "100%", overflow: "hidden", borderRadius: 4 }}>
                <LinearGradient
                  colors={["#4F46E5", "#7C3AED", "#A855F7"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>

          {/* Science badge */}
          <View style={styles.scienceBadge}>
            <MaterialCommunityIcons name="flask-outline" size={12} color="#818CF8" style={{ marginRight: 6 }} />
            <Text style={styles.scienceText}>
              Etología computacional · Análisis multimodal
            </Text>
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24,
  },

  // Branded header
  header: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 48 },
  logoGlowRing: {
    position: "absolute",
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "#6366F1",
    top: -8, left: -8,
  },
  logoCircle: {
    width: 54, height: 54, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6, shadowRadius: 14, elevation: 8,
  },
  headerText: { gap: 4 },
  headerTitle: {
    fontFamily: "Inter_800ExtraBold", fontSize: 28, color: "#F1F5F9", letterSpacing: -0.8,
  },
  headerSub: {
    fontFamily: "Inter_500Medium", fontSize: 13, color: "#64748B", letterSpacing: 0.1,
  },

  // Spectrogram
  spectroWrap: { width: SCREEN_W - 48, marginBottom: 10, position: "relative" },
  spectroGlow: {
    position: "absolute", bottom: 0, left: "10%", right: "10%", height: 40,
    backgroundColor: "#6366F1", opacity: 0.08, borderRadius: 20,
  },
  spectroContainer: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    height: 128, width: "100%",
  },
  spectroAxisLine: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 1, backgroundColor: "rgba(255,255,255,0.07)",
  },

  freqLabels: {
    flexDirection: "row", justifyContent: "space-between",
    width: SCREEN_W - 48, marginBottom: 40,
  },
  freqLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#475569" },

  // Message
  msgWrap: { height: 58, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  msgText: {
    fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#CBD5E1",
    textAlign: "center", letterSpacing: 0,
  },

  // Progress row
  progressRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    width: SCREEN_W - 48, marginBottom: 28,
  },
  progressTrack: {
    flex: 1, height: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 4, overflow: "hidden",
  },
  progressPct: {
    fontFamily: "Inter_800ExtraBold", fontSize: 15, color: "#818CF8",
    minWidth: 40, textAlign: "right",
  },

  scienceBadge: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(129,140,248,0.3)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: "rgba(79,70,229,0.1)",
  },
  scienceText: {
    fontFamily: "Inter_400Regular", fontSize: 11, color: "#818CF8", letterSpacing: 0.3,
  },
});
