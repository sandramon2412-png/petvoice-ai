import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import SiriWave from "../components/SiriWave";

const { width: SCREEN_W } = Dimensions.get("window");

const MESSAGES = [
  "Escuchando la voz única de tu mascota…",
  "Detectando patrones emocionales…",
  "Analizando parámetros de bioacústica…",
  "Correlacionando postura y contexto…",
  "¡Casi listo! Generando tu traducción…",
];
const MSG_INTERVAL = 840;
const TOTAL_DURATION = 4200;

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export default function LoadingScreen({ navigation }) {
  const { analysisResult } = useApp();
  const [msgIndex, setMsgIndex]     = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const fadeMsg      = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(1)).current;
  // Intensity drives wave amplitude — pulses gently while analyzing
  const intensityAnim = useRef(new Animated.Value(0.55)).current;
  const [waveIntensity, setWaveIntensity] = useState(0.55);
  const navigatedRef = useRef(false);

  // Progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: TOTAL_DURATION - 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    const id = progressAnim.addListener(({ value }) => setProgressPct(Math.round(value * 100)));
    return () => progressAnim.removeListener(id);
  }, []);

  // Logo breathe
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.08, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1.0,  duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Wave intensity pulse — drives SiriWave reactivity
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(intensityAnim, { toValue: 0.95, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(intensityAnim, { toValue: 0.50, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    const id = intensityAnim.addListener(({ value }) => setWaveIntensity(value));
    return () => { loop.stop(); intensityAnim.removeListener(id); };
  }, []);

  // Message cycle
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeMsg, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(fadeMsg, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      current += 1;
      if (current < MESSAGES.length) setMsgIndex(current);
      else clearInterval(interval);
    }, MSG_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Navigate when done
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigatedRef.current) { navigatedRef.current = true; navigation.replace("Result"); }
    }, TOTAL_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (analysisResult && !navigatedRef.current) {
      const t = setTimeout(() => { navigatedRef.current = true; navigation.replace("Result"); }, 1800);
      return () => clearTimeout(t);
    }
  }, [analysisResult]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={{ flex: 1, backgroundColor: "#06071A" }}>
      <LinearGradient colors={["#06071A", "#0C0E2E", "#080C24"]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["#4F46E518", "transparent", "#7C3AED12"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
      />
      {/* Depth blobs */}
      <View style={{ position:"absolute", width:250, height:250, borderRadius:125,
        backgroundColor:"#6366F1", opacity:0.09, top:-80, right:-60 }} />
      <View style={{ position:"absolute", width:180, height:180, borderRadius:90,
        backgroundColor:"#8B5CF6", opacity:0.08, bottom:60, left:-50 }} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor="#06071A" />

        <View style={styles.container}>

          {/* Branded header */}
          <View style={styles.header}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <View style={styles.logoGlow} />
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.logoCircle}>
                <MaterialCommunityIcons name="waveform" size={24} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Analizando…</Text>
              <Text style={styles.headerSub}>PetVoice AI · Procesando audio</Text>
            </View>
          </View>

          {/* ── Siri Wave — primary layer ── */}
          <View style={styles.waveContainer}>
            {/* Ambient glow */}
            <View style={styles.waveGlowBlob} />

            <SiriWave
              color="#818CF8"
              width={SCREEN_W - 48}
              height={110}
              intensity={waveIntensity}
              speed={1.0}
            />
            {/* Echo / second layer */}
            <View style={styles.echoLayer}>
              <SiriWave
                color="#6366F1"
                width={SCREEN_W - 80}
                height={64}
                intensity={waveIntensity * 0.55}
                speed={0.68}
              />
            </View>
          </View>

          {/* Message */}
          <View style={styles.msgWrap}>
            <Animated.Text style={[styles.msgText, { opacity: fadeMsg }]}>
              {MESSAGES[msgIndex]}
            </Animated.Text>
          </View>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View style={{ width: progressWidth, height: "100%", overflow: "hidden", borderRadius: 4 }}>
                <LinearGradient
                  colors={["#4F46E5", "#818CF8"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>

          {/* Science tag */}
          <View style={styles.scienceBadge}>
            <MaterialCommunityIcons name="flask-outline" size={11} color="#818CF8" style={{ marginRight: 5 }} />
            <Text style={styles.scienceText}>Etología computacional · Análisis multimodal</Text>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 52 },
  logoGlow: {
    position: "absolute",
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "#6366F1",
    opacity: 0.18,
    top: -7, left: -7,
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 14, elevation: 8,
  },
  headerText: { gap: 3 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#F1F5F9", letterSpacing: -0.6 },
  headerSub:   { fontFamily: "Inter_400Regular", fontSize: 12, color: "#475569", letterSpacing: 0.1 },

  // Wave stage
  waveContainer: {
    width: SCREEN_W - 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  waveGlowBlob: {
    position: "absolute",
    width: SCREEN_W * 0.7, height: 80,
    borderRadius: 40,
    backgroundColor: "#4F46E5",
    opacity: 0.07,
  },
  echoLayer: {
    position: "absolute",
    bottom: -10,
    opacity: 0.45,
  },

  // Message
  msgWrap: { height: 56, alignItems: "center", justifyContent: "center", marginBottom: 28, marginTop: 18 },
  msgText: {
    fontFamily: "Inter_400Regular", fontSize: 15, color: "#94A3B8",
    textAlign: "center", letterSpacing: 0, lineHeight: 22,
  },

  // Progress
  progressRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    width: SCREEN_W - 48, marginBottom: 28,
  },
  progressTrack: {
    flex: 1, height: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4, overflow: "hidden",
  },
  progressPct: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#818CF8",
    minWidth: 36, textAlign: "right",
  },

  scienceBadge: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 0.5, borderColor: "rgba(129,140,248,0.25)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: "rgba(79,70,229,0.08)",
  },
  scienceText: {
    fontFamily: "Inter_400Regular", fontSize: 11, color: "#64748B", letterSpacing: 0.2,
  },
});
