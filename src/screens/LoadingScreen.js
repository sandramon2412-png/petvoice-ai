import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import SiriWave from "../components/SiriWave";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const MESSAGES_DOG = [
  "Iniciando captura… acogiendo espectrograma de audio en tiempo real.",
  "Aislando ruido ambiental… extrayendo frecuencia fundamental (F0).",
  "Analizando tasa de repetición y ráfagas de presión acústica.",
  "Cruzando bioacústica con el chip de postura corporal seleccionado.",
  "Validando vectores con el modelo etológico canino.",
  "Decodificando intención… generando traducción humana.",
];

const MESSAGES_CAT = [
  "Iniciando captura… captando oscilación del maullido y ronroneo.",
  "Filtrando audio… calculando modulación de frecuencia fundamental (F0).",
  "Analizando micro-patrones de onda y duración del pulso bioacústico.",
  "Cruzando datos con el selector de contexto y posición de orejas.",
  "Validando patrones con la base de datos etológica felina.",
  "Decodificando intención… generando traducción humana.",
];

const MSG_INTERVAL = 1400;
const TOTAL_DURATION = 8400;

const STEP_ICONS = ["microphone", "waveform", "chart-bar", "database-search", "brain", "translate"];

export default function LoadingScreen({ navigation }) {
  const { analysisResult, pet } = useApp();
  const MESSAGES = pet?.species === "cat" ? MESSAGES_CAT : MESSAGES_DOG;

  const [msgIndex, setMsgIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [waveIntensity, setWaveIntensity] = useState(0.55);

  const fadeMsg       = useRef(new Animated.Value(1)).current;
  const slideMsg      = useRef(new Animated.Value(0)).current;
  const progressAnim  = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(1)).current;
  const intensityAnim = useRef(new Animated.Value(0.55)).current;
  const ringRotate    = useRef(new Animated.Value(0)).current;
  const ring2Rotate   = useRef(new Animated.Value(0)).current;
  const glowPulse     = useRef(new Animated.Value(0.6)).current;
  const navigatedRef  = useRef(false);

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
        Animated.timing(logoScale, { toValue: 1.06, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1.0,  duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Rotating outer ring
  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotate, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // Counter-rotating inner ring
  useEffect(() => {
    Animated.loop(
      Animated.timing(ring2Rotate, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // Glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.5, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Wave intensity pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(intensityAnim, { toValue: 0.92, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(intensityAnim, { toValue: 0.45, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    const id = intensityAnim.addListener(({ value }) => setWaveIntensity(value));
    return () => { loop.stop(); intensityAnim.removeListener(id); };
  }, []);

  // Message cycle with slide-up transition
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeMsg,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideMsg, { toValue: -8, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        current += 1;
        if (current < MESSAGES.length) setMsgIndex(current);
        slideMsg.setValue(10);
        Animated.parallel([
          Animated.timing(fadeMsg,  { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(slideMsg, { toValue: 0, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]).start();
      });
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
      const t = setTimeout(() => {
        if (!navigatedRef.current) { navigatedRef.current = true; navigation.replace("Result"); }
      }, TOTAL_DURATION);
      return () => clearTimeout(t);
    }
  }, [analysisResult]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const ringDeg  = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const ring2Deg = ring2Rotate.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });

  return (
    <View style={{ flex: 1, backgroundColor: "#04051A" }}>
      {/* Base gradient */}
      <LinearGradient colors={["#04051A", "#07092B", "#0A0B22"]} style={StyleSheet.absoluteFill} />

      {/* Radial glow center */}
      <Animated.View style={[styles.radialGlow, { opacity: glowPulse }]} />

      {/* Ambient blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Top color sweep */}
      <LinearGradient
        colors={["#4F46E530", "transparent"]}
        style={[StyleSheet.absoluteFill, { height: SCREEN_H * 0.45 }]}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor="#04051A" />

        <View style={styles.container}>

          {/* ── Orbital ring + logo ── */}
          <View style={styles.orbitalWrapper}>
            {/* Outer dashed ring */}
            <Animated.View style={[styles.ringOuter, { transform: [{ rotate: ringDeg }] }]}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#4F46E500"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.ringOuterGrad}
              />
            </Animated.View>

            {/* Inner counter-ring */}
            <Animated.View style={[styles.ringInner, { transform: [{ rotate: ring2Deg }] }]}>
              <LinearGradient
                colors={["#818CF800", "#818CF8", "#818CF800"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ringInnerGrad}
              />
            </Animated.View>

            {/* Center logo */}
            <Animated.View style={[styles.logoCenter, { transform: [{ scale: logoScale }] }]}>
              <View style={styles.logoGlowHalo} />
              <LinearGradient colors={["#6366F1", "#4F46E5", "#7C3AED"]} style={styles.logoCircle}>
                <MaterialCommunityIcons name="waveform" size={30} color="#fff" />
              </LinearGradient>
            </Animated.View>

            {/* Orbiting dot */}
            <Animated.View style={[styles.orbitDotWrapper, { transform: [{ rotate: ringDeg }] }]}>
              <View style={styles.orbitDot} />
            </Animated.View>
          </View>

          {/* ── Title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>Analizando</Text>
            <Text style={styles.titleSub}>
              {pet?.name ? `${pet.name}  ·  ` : ""}PetVoice AI
            </Text>
          </View>

          {/* ── SiriWave stage ── */}
          <View style={styles.waveStage}>
            <View style={styles.waveGlow} />
            <SiriWave
              color="#818CF8"
              width={SCREEN_W - 48}
              height={90}
              intensity={waveIntensity}
              speed={1.1}
            />
            <View style={styles.echoWrap}>
              <SiriWave
                color="#6366F1"
                width={SCREEN_W - 80}
                height={52}
                intensity={waveIntensity * 0.5}
                speed={0.65}
              />
            </View>
          </View>

          {/* ── Progress ── */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View style={{ width: progressWidth, height: "100%", borderRadius: 3, overflow: "hidden" }}>
                <LinearGradient
                  colors={["#4F46E5", "#818CF8", "#C4B5FD"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>

          {/* ── Scientific log card ── */}
          <View style={styles.logCard}>
            {/* Glassmorphism inner */}
            <LinearGradient
              colors={["rgba(79,70,229,0.10)", "rgba(10,12,40,0.85)"]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Step progress dots */}
            <View style={styles.stepsRow}>
              {MESSAGES.map((_, i) => (
                <View key={i} style={[
                  styles.stepDot,
                  i < msgIndex  && styles.stepDotDone,
                  i === msgIndex && styles.stepDotActive,
                ]} />
              ))}
            </View>

            {/* Step icon + label */}
            <View style={styles.logHeader}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.stepIconCircle}>
                <MaterialCommunityIcons name={STEP_ICONS[msgIndex]} size={13} color="#fff" />
              </LinearGradient>
              <Text style={styles.stepLabel}>PASO {msgIndex + 1} / {MESSAGES.length}</Text>
              <View style={{ flex: 1 }} />
              <Animated.View style={{
                transform: [{ rotate: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "1080deg"] }) }],
              }}>
                <MaterialCommunityIcons name="loading" size={14} color="#6366F1" />
              </Animated.View>
            </View>

            {/* Message text with slide animation */}
            <Animated.View style={{ opacity: fadeMsg, transform: [{ translateY: slideMsg }] }}>
              <Text style={styles.logText}>{MESSAGES[msgIndex]}</Text>
            </Animated.View>

            {/* Bottom shimmer line */}
            <View style={styles.cardShimmer} />
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const ORBITAL_SIZE = 136;
const RING_OUTER   = ORBITAL_SIZE + 32;
const RING_INNER   = ORBITAL_SIZE + 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 0,
  },

  // Background effects
  radialGlow: {
    position: "absolute",
    width: SCREEN_W * 1.1,
    height: SCREEN_W * 1.1,
    borderRadius: SCREEN_W * 0.55,
    backgroundColor: "#4F46E5",
    opacity: 0.06,
    top: SCREEN_H * 0.1,
    alignSelf: "center",
  },
  blob1: {
    position: "absolute", width: 300, height: 300, borderRadius: 150,
    backgroundColor: "#6366F1", opacity: 0.14, top: -100, right: -100,
  },
  blob2: {
    position: "absolute", width: 240, height: 240, borderRadius: 120,
    backgroundColor: "#7C3AED", opacity: 0.11, bottom: 20, left: -90,
  },
  blob3: {
    position: "absolute", width: 160, height: 160, borderRadius: 80,
    backgroundColor: "#4F46E5", opacity: 0.09, top: "38%", left: -50,
  },

  // Orbital
  orbitalWrapper: {
    width: RING_OUTER + 16,
    height: RING_OUTER + 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ringOuter: {
    position: "absolute",
    width: RING_OUTER,
    height: RING_OUTER,
    borderRadius: RING_OUTER / 2,
    borderWidth: 1.5,
    borderColor: "transparent",
    overflow: "hidden",
  },
  ringOuterGrad: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_OUTER / 2,
    opacity: 0.6,
  },
  ringInner: {
    position: "absolute",
    width: RING_INNER,
    height: RING_INNER,
    borderRadius: RING_INNER / 2,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
  },
  ringInnerGrad: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_INNER / 2,
    opacity: 0.4,
  },
  logoCenter: {
    width: ORBITAL_SIZE,
    height: ORBITAL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlowHalo: {
    position: "absolute",
    width: ORBITAL_SIZE,
    height: ORBITAL_SIZE,
    borderRadius: ORBITAL_SIZE / 2,
    backgroundColor: "#4F46E5",
    opacity: 0.22,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
  orbitDotWrapper: {
    position: "absolute",
    width: RING_OUTER,
    height: RING_OUTER,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#818CF8",
    marginTop: 4,
    shadowColor: "#818CF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },

  // Title
  titleBlock: {
    alignItems: "center",
    marginBottom: 28,
    gap: 4,
  },
  titleMain: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#F1F5F9",
    letterSpacing: -0.8,
  },
  titleSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Wave
  waveStage: {
    width: SCREEN_W - 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  waveGlow: {
    position: "absolute",
    width: SCREEN_W * 0.65,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4F46E5",
    opacity: 0.08,
  },
  echoWrap: {
    position: "absolute",
    bottom: -8,
    opacity: 0.4,
  },

  // Progress
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: SCREEN_W - 48,
    marginBottom: 18,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressPct: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#818CF8",
    minWidth: 34,
    textAlign: "right",
  },

  // Log card
  logCard: {
    width: SCREEN_W - 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(99,102,241,0.30)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    position: "relative",
  },
  stepsRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 12,
  },
  stepDot: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "rgba(129,140,248,0.15)",
  },
  stepDotDone: {
    backgroundColor: "rgba(129,140,248,0.50)",
  },
  stepDotActive: {
    backgroundColor: "#818CF8",
    shadowColor: "#818CF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  stepIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#6366F1",
    letterSpacing: 1.2,
  },
  logText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#CBD5E1",
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  cardShimmer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(129,140,248,0.18)",
  },
});
