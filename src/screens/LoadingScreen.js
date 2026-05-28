import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../context/AppContext";

const { width: SCREEN_W } = Dimensions.get("window");
const BAR_COUNT = 36;
const MESSAGES = [
  "Extrayendo frecuencia fundamental (F0)...",
  "Analizando variaciones de tono y ritmo...",
  "Detectando patrones de vocalización...",
  "Cruzando datos con postura corporal...",
  "Generando traducción personalizada...",
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

  const maxHeight = 80;
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
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
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, { toValue: 1.5, duration: 650, useNativeDriver: true }),
        Animated.timing(dotScale, { toValue: 1.0, duration: 650, useNativeDriver: true }),
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

          {/* Top label */}
          <View style={styles.topRow}>
            <Animated.View style={[styles.dotWrap, { transform: [{ scale: dotScale }] }]}>
              <LinearGradient
                colors={["#818CF8", "#C084FC"]}
                style={styles.dot}
              />
            </Animated.View>
            <Text style={styles.topLabel}>Analizando tu mascota...</Text>
          </View>

          {/* Spectrogram */}
          <View style={styles.spectroWrap}>
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

          {/* Gradient progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View style={{ width: progressWidth, height: "100%", overflow: "hidden", borderRadius: 3 }}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>

          {/* Science badge */}
          <View style={styles.scienceBadge}>
            <Text style={styles.scienceText}>
              Modelo de etología computacional · Análisis multimodal
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

  topRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 44 },
  dotWrap: { width: 12, height: 12, borderRadius: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  topLabel: {
    fontFamily: "Inter_700Bold", fontSize: 22, color: "#F1F5F9", letterSpacing: -0.3,
  },

  spectroWrap: { width: SCREEN_W - 48, marginBottom: 10, position: "relative" },
  spectroContainer: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    height: 92, width: "100%",
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

  msgWrap: { height: 48, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  msgText: {
    fontFamily: "Inter_500Medium", fontSize: 14, color: "#94A3B8",
    textAlign: "center", letterSpacing: 0.1,
  },

  progressTrack: {
    width: SCREEN_W - 48, height: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3, overflow: "hidden", marginBottom: 28,
  },

  scienceBadge: {
    borderWidth: 1, borderColor: "rgba(129,140,248,0.3)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: "rgba(79,70,229,0.1)",
  },
  scienceText: {
    fontFamily: "Inter_400Regular", fontSize: 11, color: "#818CF8", letterSpacing: 0.3,
  },
});
