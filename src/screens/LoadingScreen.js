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

const MESSAGES_DOG = [
  "Iniciando captura... Acogiendo espectrograma de audio en tiempo real.",
  "Aislando ruido ambiental... Extrayendo frecuencia fundamental (F0).",
  "Analizando tasa de repetición y ráfagas de presión acústica...",
  "Cruzando bioacústica con el chip de postura corporal seleccionado...",
  "Validando vectores con el modelo etológico canino...",
  "Decodificando intención... Generando traducción humana.",
];

const MESSAGES_CAT = [
  "Iniciando captura... Capturando oscilación del maullido/ronroneo.",
  "Filtrando audio... Calculando modulación de frecuencia fundamental (F0).",
  "Analizando micro-patrones de onda y duración del pulso bioacústico...",
  "Cruzando datos con el selector de contexto y posición de orejas/cola...",
  "Validando patrones con la base de datos etológica felina...",
  "Decodificando intención... Generando traducción humana.",
];

const MSG_INTERVAL = 1400;
const TOTAL_DURATION = 8400;

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export default function LoadingScreen({ navigation }) {
  const { analysisResult, pet } = useApp();
  const MESSAGES = pet?.species === "cat" ? MESSAGES_CAT : MESSAGES_DOG;
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

  // Navigate when done — always wait full duration so all messages are readable
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigatedRef.current) { navigatedRef.current = true; navigation.replace("Result"); }
    }, TOTAL_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // If AI responds early, still wait until all messages shown (TOTAL_DURATION)
  useEffect(() => {
    if (analysisResult && !navigatedRef.current) {
      const remaining = TOTAL_DURATION - (MSG_INTERVAL * MESSAGES.length);
      const wait = Math.max(remaining, 1000);
      const t = setTimeout(() => { navigatedRef.current = true; navigation.replace("Result"); }, wait);
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
      <View style={{ position:"absolute", width:280, height:280, borderRadius:140,
        backgroundColor:"#6366F1", opacity:0.22, top:-100, right:-80 }} />
      <View style={{ position:"absolute", width:220, height:220, borderRadius:110,
        backgroundColor:"#8B5CF6", opacity:0.18, bottom:40, left:-70 }} />
      <View style={{ position:"absolute", width:160, height:160, borderRadius:80,
        backgroundColor:"#4F46E5", opacity:0.14, top:"40%", left:-40 }} />
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
              <Text style={styles.headerSub}>
                {pet?.name ? `${pet.name} · ` : ""}PetVoice AI · Procesando audio
              </Text>
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

          {/* Glassmorphism scientific log pill */}
          <Animated.View style={[styles.logPill, { opacity: fadeMsg }]}>
            <View style={styles.logStepBar}>
              {MESSAGES.map((_, i) => (
                <View key={i} style={[styles.logStep, { backgroundColor: i <= msgIndex ? "#818CF8" : "rgba(129,140,248,0.2)" }]} />
              ))}
            </View>
            <View style={styles.logPillInner}>
              <Animated.View style={{
                transform: [{ rotate: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "1080deg"] }) }],
                marginRight: 10,
              }}>
                <MaterialCommunityIcons name="loading" size={15} color="#818CF8" />
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Text style={styles.logStep_label}>Paso {msgIndex + 1} de {MESSAGES.length}</Text>
                <Text style={styles.logText}>{MESSAGES[msgIndex]}</Text>
              </View>
            </View>
          </Animated.View>

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

  // Progress
  progressRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    width: SCREEN_W - 48, marginBottom: 20,
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

  // Scientific log pill
  logPill: {
    width: SCREEN_W - 48,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(129,140,248,0.35)",
    backgroundColor: "rgba(10,12,40,0.72)",
    marginTop: 8,
  },
  logStepBar: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  logStep: {
    flex: 1, height: 2, borderRadius: 2,
  },
  logPillInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  logStep_label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#6366F1",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  logText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#CBD5E1",
    letterSpacing: 0.1,
    lineHeight: 20,
  },
});
