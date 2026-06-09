import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, Image, StatusBar, Modal,
  ActivityIndicator, Platform, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import GlassView from "../components/GlassView";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useApp } from "../context/AppContext";
import { analyzeSound } from "../services/aiService";
import SiriWave from "../components/SiriWave";

const { width: SCREEN_W } = Dimensions.get("window");
const BTN_SIZE = 114;

const C = {
  text: "#F1F5F9", muted: "#94A3B8", border: "rgba(255,255,255,0.12)",
  card: "rgba(255,255,255,0.06)", indigo: "#818CF8", violet: "#A78BFA",
  indigoLight: "rgba(129,140,248,0.15)", coral: "#FF8A65", coralDark: "#F4511E",
};

const GLASS = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
};

const POSTURES_CAT = [
  { key: "relajado", label: "Relajado", icon: "cat" },
  { key: "alerta",   label: "Alerta",   icon: "eye-outline" },
  { key: "arqueado", label: "Arqueado", icon: "arrow-up-bold" },
  { key: "sentado",  label: "Sentado",  icon: "seat" },
  { key: "tumbado",  label: "Tumbado",  icon: "sleep" },
  { key: "jugueton", label: "Juguetón", icon: "run-fast" },
];
const POSTURES_DOG = [
  { key: "relajado", label: "Relajado", icon: "dog" },
  { key: "alerta",   label: "Alerta",   icon: "eye-outline" },
  { key: "sentado",  label: "Sentado",  icon: "seat" },
  { key: "tumbado",  label: "Tumbado",  icon: "sleep" },
  { key: "jugueton", label: "Juguetón", icon: "run-fast" },
  { key: "sumiso",   label: "Sumiso",   icon: "paw-outline" },
];
const ENVIRONMENTS = [
  { key: "llegada",  label: "Llegada a casa",     icon: "home-heart" },
  { key: "comida",   label: "Hora de comida",      icon: "food-variant" },
  { key: "extrano",  label: "Extraños / ruido",    icon: "account-alert" },
  { key: "juego",    label: "Sesión de juego",     icon: "toy-brick" },
  { key: "descanso", label: "Hora de descanso",    icon: "moon-waning-crescent" },
];

// ─── PressableScale ───────────────────────────────────────────────────────────
function PressableScale({ onPress, onPressIn: extIn, onPressOut: extOut, style, children, disabled, activeScale = 0.97 }) {
  const anim = useRef(new Animated.Value(1)).current;
  const cfg = { useNativeDriver: true };
  const handleIn = () => {
    Animated.spring(anim, { toValue: activeScale, tension: 300, friction: 12, ...cfg }).start();
    extIn?.();
  };
  const handleOut = () => {
    Animated.spring(anim, { toValue: 1, tension: 200, friction: 8, ...cfg }).start();
    extOut?.();
  };
  return (
    <TouchableOpacity onPressIn={handleIn} onPressOut={handleOut} onPress={onPress} disabled={disabled} activeOpacity={1}>
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// ─── Idle Pulse Rings ────────────────────────────────────────────────────────
function IdleRing({ active, delay: ringDelay }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let anim;
    if (active) {
      opacity.setValue(0);
      anim = Animated.loop(
        Animated.sequence([
          Animated.delay(ringDelay),
          Animated.timing(opacity, { toValue: 0.55, duration: 0, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 2.6, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,   duration: 1600, useNativeDriver: true }),
          ]),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      );
      anim.start();
    } else {
      anim?.stop();
      scale.setValue(1);
      opacity.setValue(0);
    }
    return () => anim?.stop();
  }, [active, ringDelay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.wave, { opacity, transform: [{ scale }], backgroundColor: C.coralDark }]}
    />
  );
}

// ─── Wave Ring ────────────────────────────────────────────────────────────────
function WaveRing({ delay, isRecording }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let anim;
    if (isRecording) {
      opacity.setValue(0.4);
      anim = Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 3.0, duration: 1600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 1600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ]));
      anim.start();
    } else {
      scale.setValue(1);
      opacity.setValue(0);
    }
    return () => anim?.stop();
  }, [isRecording, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.wave, { opacity, transform: [{ scale }] }]}
    />
  );
}

// ─── Env Dropdown ─────────────────────────────────────────────────────────────
function EnvDropdown({ visible, onClose, selected, onSelect }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={s.dropOverlay} activeOpacity={1} onPress={onClose}>
        <View style={s.dropSheet}>
          <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.dropHandle} />
          <Text style={s.dropTitle}>Contexto / Estímulo</Text>
          {ENVIRONMENTS.map(env => (
            <PressableScale key={env.key} onPress={() => { onSelect(env.key); onClose(); }} activeScale={0.98}>
              <View style={[s.dropItem, selected === env.key && s.dropItemSel]}>
                <View style={[s.dropIconBox, selected === env.key && s.dropIconBoxActive]}>
                  <MaterialCommunityIcons name={env.icon} size={16} color={selected === env.key ? "#A5B4FC" : "rgba(255,255,255,0.4)"} />
                </View>
                <Text style={[s.dropItemText, selected === env.key && s.dropItemTextSel]}>{env.label}</Text>
                {selected === env.key && (
                  <MaterialCommunityIcons name="check-circle" size={18} color={C.indigo} style={{ marginLeft: "auto" }} />
                )}
              </View>
            </PressableScale>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { pet, canRecord, remaining, setLastPosture, setLastEnvironment, setLastAnalysisAudio, saveResult } = useApp();

  const species = pet?.species || "dog";
  const postures = species === "cat" ? POSTURES_CAT : POSTURES_DOG;

  const [posture, setPosture] = useState(postures[0].key);
  const [environment, setEnvironment] = useState("llegada");
  const [envDropOpen, setEnvDropOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recordingObj, setRecordingObj] = useState(null);

  const dimAnim = useRef(new Animated.Value(0)).current;
  const recordingRef = useRef(null);
  const selectedEnv = ENVIRONMENTS.find(e => e.key === environment) || ENVIRONMENTS[0];
  const petInitial = pet?.name ? pet.name[0].toUpperCase() : "?";

  // Release microphone on unmount and reset audio session
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    };
  }, []);

  // Reset UI state whenever this screen comes back into focus (e.g., from Result)
  useFocusEffect(
    useCallback(() => {
      if (!recordingRef.current) {
        setIsRecording(false);
        setRecordingObj(null);
        setLoading(false);
      }
    }, [])
  );

  useEffect(() => {
    Animated.timing(dimAnim, {
      toValue: isRecording ? 0.12 : 0, duration: 300, useNativeDriver: true,
    }).start();
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (!canRecord) return;
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecordingObj(recording);
      setIsRecording(true);
    } catch (e) { console.warn("startRecording:", e); }
  }, [canRecord]);

  const stopAndAnalyze = useCallback(async () => {
    if (!recordingObj) return;
    setIsRecording(false);
    setLoading(true);
    try {
      // Always stop and unload to release the microphone
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setLastAnalysisAudio(uri);
      recordingRef.current = null;
      setRecordingObj(null);
      setLastPosture(posture);
      setLastEnvironment(environment);
      navigation.navigate("Loading", { posture, environment });
      const result = await analyzeSound(pet?.species || "dog", pet?.name || "Tu mascota", posture, environment);
      saveResult(result);
    } catch (e) { console.warn("analyze:", e); setLoading(false); }
  }, [recordingObj, posture, environment, pet, navigation]);

  const handlePress = useCallback(() => {
    if (loading) return;
    isRecording ? stopAndAnalyze() : startRecording();
  }, [isRecording, loading, startRecording, stopAndAnalyze]);

  // Stop recording, reset audio session, then navigate to Onboarding safely
  const handleGoBack = useCallback(async () => {
    if (recordingObj) {
      setIsRecording(false);
      try {
        await recordingObj.stopAndUnloadAsync();
      } catch (e) {}
      recordingRef.current = null;
      setRecordingObj(null);
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
  }, [recordingObj, navigation]);

  return (
    <View style={{ flex: 1 }}>
      {/* Deep dark premium background — multi-layer like ResultScreen */}
      <LinearGradient colors={["#04050F", "#080C22", "#0A0E28"]} style={StyleSheet.absoluteFill} />
      {/* Diagonal colour accent layer */}
      <LinearGradient
        colors={["#4F46E520", "transparent", "#7C3AED14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
      />
      {/* Light blobs for depth */}
      <View style={{ position:"absolute", width:280, height:280, borderRadius:140,
        backgroundColor:"#6366F1", opacity:0.22, top:-100, left:-80 }} />
      <View style={{ position:"absolute", width:200, height:200, borderRadius:100,
        backgroundColor:"#8B5CF6", opacity:0.18, top:"35%", right:-80 }} />
      <View style={{ position:"absolute", width:180, height:180, borderRadius:90,
        backgroundColor:"#4F46E5", opacity:0.15, bottom:60, left:-50 }} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: dimAnim }]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <TouchableOpacity onPress={handleGoBack} style={s.navBackBtn} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chevron-left" size={22} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              <View>
                <Text style={s.appLabel}>PetVoice AI</Text>
                <Text style={s.appSub}>Análisis emocional</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              {pet?.photo
                ? <Image source={{ uri: pet.photo }} style={s.petAvatar} />
                : <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={s.petAvatar}>
                    <Text style={s.petAvatarLetter}>{petInitial}</Text>
                  </LinearGradient>}
              <PressableScale onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})} activeScale={0.94}>
                <GlassView intensity={20} tint="dark" style={s.upgradeBtn}>
                  <MaterialCommunityIcons name="crown-outline" size={12} color="#A78BFA" />
                  <Text style={s.upgradeBtnText}>Pro</Text>
                </GlassView>
              </PressableScale>
            </View>
          </View>

          {/* ── Pet + quota ── */}
          <GlassView intensity={18} tint="dark" style={s.statusCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.petName}>{pet?.name || "Tu Mascota"}</Text>
              <Text style={s.petBreed}>
                {species === "cat" ? "Gato" : "Perro"}
                {pet?.age ? ` · ${pet.age} años` : ""}
              </Text>
            </View>
            <View style={[s.limitBadge, !canRecord && s.limitBadgeWarn]}>
              <MaterialCommunityIcons name="microphone" size={12} color={canRecord ? "#818CF8" : "#F87171"} />
              <Text style={[s.limitText, !canRecord && s.limitTextWarn]}>
                {canRecord ? `${remaining} restantes` : "Límite alcanzado"}
              </Text>
            </View>
          </GlassView>

          {/* ── Posture chips ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Postura corporal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
              {postures.map(p => {
                const active = posture === p.key;
                return (
                  <PressableScale key={p.key} onPress={() => { setPosture(p.key); Haptics.selectionAsync().catch(()=>{}); }} activeScale={0.95}>
                    <GlassView intensity={active ? 0 : 16} tint="dark" style={[s.chip, active && s.chipActive]}>
                      <Text style={[s.chipText, active && s.chipTextActive]}>{p.label}</Text>
                    </GlassView>
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Environment selector ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Contexto</Text>
            <PressableScale onPress={() => setEnvDropOpen(true)} activeScale={0.98}>
              <GlassView intensity={18} tint="dark" style={s.envSelector}>
                <View style={s.envSelectorLeft}>
                  <View style={s.envIconBox}>
                    <MaterialCommunityIcons name={selectedEnv.icon} size={16} color="#818CF8" />
                  </View>
                  <Text style={s.envText}>{selectedEnv.label}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,255,255,0.3)" />
              </GlassView>
            </PressableScale>
          </View>

          {/* ── Record section ── */}
          <View style={s.recordSection}>
            <Text style={s.recordHint}>
              {isRecording ? "Escuchando · toca para analizar"
               : canRecord ? "Toca para comenzar"
               : "Actualiza a Pro para más análisis"}
            </Text>

            <View style={s.btnOuter}>
              <IdleRing active={!isRecording && !loading && canRecord} delay={0} />
              <IdleRing active={!isRecording && !loading && canRecord} delay={700} />
              {[0, 1, 2].map(i => <WaveRing key={i} delay={i * 420} isRecording={isRecording} />)}

              <View style={s.btnGlow}>
                <View style={s.btnBase}>
                  <PressableScale
                    onPress={() => {
                      Haptics.impactAsync(isRecording ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy).catch(()=>{});
                      handlePress();
                    }}
                    disabled={loading || !canRecord}
                    activeScale={0.94}
                  >
                    <LinearGradient
                      colors={
                        loading ? ["#6366F1","#8B5CF6"]
                        : isRecording ? ["#EF4444","#DC2626"]
                        : !canRecord ? ["#374151","#374151"]
                        : [C.coral, C.coralDark]
                      }
                      style={s.recordBtn}
                    >
                      {loading
                        ? <ActivityIndicator size="large" color="#fff" />
                        : <MaterialCommunityIcons
                            name={isRecording ? "stop" : "microphone"}
                            size={46} color="#fff"
                          />}
                    </LinearGradient>
                  </PressableScale>
                </View>
              </View>
            </View>

            {isRecording && (
              <View style={s.recIndicator}>
                <View style={s.recDot} />
                <Text style={s.recText}>REC</Text>
                <View style={s.recWaveWrap}>
                  <SiriWave color="#FF8A65" width={SCREEN_W * 0.5} height={32} intensity={0.85} speed={1.1} />
                </View>
              </View>
            )}
          </View>

          {/* ── Subtle tip ── */}
          <Text style={s.tipText}>
            Graba 3–10 s de forma natural · más contexto = mejor análisis
          </Text>

        </ScrollView>
      </SafeAreaView>

      <EnvDropdown
        visible={envDropOpen}
        onClose={() => setEnvDropOpen(false)}
        selected={environment}
        onSelect={setEnvironment}
      />

      {/* ── Bottom navigation bar ── */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "rgba(6,7,26,0.96)" }}>
        <View style={s.bottomNav}>
          {[
            { label: "Inicio",    icon: "home",    screen: "Home"    },
            { label: "Historial", icon: "history", screen: "History" },
            { label: "Ajustes",   icon: "cog-outline", screen: "Settings" },
          ].map((t) => {
            const active = t.screen === "Home";
            return (
              <TouchableOpacity
                key={t.screen}
                style={s.bottomNavItem}
                onPress={() => !active && navigation.navigate(t.screen)}
                activeOpacity={0.7}
              >
                <View style={[s.bottomNavIcon, active && s.bottomNavIconActive]}>
                  <MaterialCommunityIcons name={t.icon} size={22} color={active ? "#818CF8" : "rgba(255,255,255,0.35)"} />
                </View>
                <Text style={[s.bottomNavLabel, active && s.bottomNavLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  navBackBtn: { padding: 4 },
  appLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: "rgba(255,255,255,0.9)" },
  appSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  petAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  petAvatarLetter: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },
  upgradeBtn: {
    flexDirection: "row", alignItems: "center", gap: 4, overflow: "hidden",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: "rgba(167,139,250,0.3)",
  },
  upgradeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#A78BFA" },

  statusCard: {
    marginHorizontal: 20, marginBottom: 22, borderRadius: 20, overflow: "hidden",
    padding: 16, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  petName: { fontFamily: "Inter_700Bold", fontSize: 17, color: "rgba(255,255,255,0.92)", marginBottom: 2 },
  petBreed: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.4)" },
  limitBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(129,140,248,0.18)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(129,140,248,0.2)",
  },
  limitBadgeWarn: { backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.2)" },
  limitText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#818CF8" },
  limitTextWarn: { color: "#F87171" },

  section: { marginHorizontal: 20, marginBottom: 18 },
  sectionLabel: {
    fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.3)",
    marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2,
  },

  chipsRow: { gap: 8, flexDirection: "row", paddingRight: 4 },
  chip: {
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 9, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: {
    backgroundColor: "rgba(129,140,248,0.22)",
    borderWidth: 1, borderColor: "rgba(129,140,248,0.4)",
  },
  chipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.45)" },
  chipTextActive: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#A5B4FC" },

  envSelector: {
    borderRadius: 16, overflow: "hidden", paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  envSelectorLeft: { flexDirection: "row", alignItems: "center" },
  envIconBox: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "rgba(129,140,248,0.15)",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  envText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "rgba(255,255,255,0.82)" },

  recordSection: { alignItems: "center", paddingVertical: 16, marginBottom: 8 },
  recordHint: {
    fontFamily: "Inter_400Regular", fontSize: 14,
    color: "rgba(255,255,255,0.55)", marginBottom: 28, letterSpacing: 0.2,
  },
  btnOuter: { width: BTN_SIZE * 3.2, height: BTN_SIZE * 3.2, alignItems: "center", justifyContent: "center" },
  wave: {
    position: "absolute", width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    backgroundColor: "rgba(255,138,101,0.6)",
  },
  btnGlow: {
    width: BTN_SIZE + 36, height: BTN_SIZE + 36, borderRadius: (BTN_SIZE + 36) / 2,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.coralDark,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 28,
  },
  btnBase: {
    width: BTN_SIZE + 12, height: BTN_SIZE + 12, borderRadius: (BTN_SIZE + 12) / 2,
    backgroundColor: "rgba(244,81,30,0.25)",
    alignItems: "center", justifyContent: "center",
    shadowColor: C.coralDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 18,
  },
  recordBtn: {
    width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.25)",
  },
  recIndicator: { alignItems: "center", gap: 4, marginTop: 20 },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#EF4444" },
  recText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "rgba(239,68,68,0.8)", letterSpacing: 3 },
  recWaveWrap: { marginTop: 6 },

  tipText: {
    fontFamily: "Inter_400Regular", fontSize: 12,
    color: "rgba(255,255,255,0.22)", textAlign: "center",
    marginHorizontal: 32, marginBottom: 32, lineHeight: 18,
  },

  // Dropdown
  dropOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  dropSheet: {
    backgroundColor: "#0F1130", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 40 : 28, paddingHorizontal: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  dropHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18, backgroundColor: "rgba(255,255,255,0.15)" },
  dropTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: "rgba(255,255,255,0.9)", marginBottom: 12 },
  dropItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderRadius: 14, paddingHorizontal: 10, marginBottom: 4,
  },
  dropItemSel: { backgroundColor: "rgba(129,140,248,0.15)" },
  dropIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  dropIconBoxActive: { backgroundColor: "rgba(129,140,248,0.25)" },
  dropItemText: { fontFamily: "Inter_400Regular", fontSize: 15, color: "rgba(255,255,255,0.75)" },
  dropItemTextSel: { fontFamily: "Inter_600SemiBold", color: "#A5B4FC" },

  // Bottom nav
  bottomNav: {
    flexDirection: "row", paddingTop: 8, paddingBottom: 4, paddingHorizontal: 12,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
  },
  bottomNavItem:       { flex: 1, alignItems: "center", gap: 3 },
  bottomNavIcon:       { width: 40, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bottomNavIconActive: { backgroundColor: "rgba(129,140,248,0.15)" },
  bottomNavLabel:      { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.3)" },
  bottomNavLabelActive:{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#818CF8" },
});
