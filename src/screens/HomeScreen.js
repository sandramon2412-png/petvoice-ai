import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Dimensions, Image, StatusBar, Modal,
  ActivityIndicator, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useApp } from "../context/AppContext";
import { analyzeSound } from "../services/aiService";

const { width: SCREEN_W } = Dimensions.get("window");
const BTN_SIZE = 96;

const C = {
  text: "#1E293B", muted: "#64748B", border: "#E2E8F0",
  card: "rgba(255,255,255,0.88)", indigo: "#4F46E5", violet: "#7C3AED",
  indigoLight: "#EEF2FF", coral: "#FF8A65", coralDark: "#F4511E",
};

const GLASS = {
  backgroundColor: "rgba(255,255,255,0.92)",
  borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
  shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
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
                  <MaterialCommunityIcons name={env.icon} size={18} color={selected === env.key ? "#fff" : C.muted} />
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

  useEffect(() => {
    return () => { recordingRef.current?.stopAndUnloadAsync().catch(() => {}); };
  }, []);

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

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#F8FAFC", "#EEF2FF", "#F5F3FF"]} style={StyleSheet.absoluteFill} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: dimAnim }]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.logoMark}>
                <MaterialCommunityIcons name="waveform" size={15} color="#fff" />
              </LinearGradient>
              <Text style={s.appLabel}>PetVoice AI</Text>
            </View>
            <View style={s.headerRight}>
              {pet?.photo
                ? <Image source={{ uri: pet.photo }} style={s.petAvatar} />
                : <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.petAvatar}>
                    <Text style={s.petAvatarLetter}>{petInitial}</Text>
                  </LinearGradient>}
              <PressableScale activeScale={0.94}>
                <LinearGradient colors={["#EEF2FF", "#F5F3FF"]} style={s.upgradeBtn}>
                  <MaterialCommunityIcons name="crown-outline" size={13} color={C.indigo} />
                  <Text style={s.upgradeBtnText}>Pro</Text>
                </LinearGradient>
              </PressableScale>
            </View>
          </View>

          {/* Status card */}
          <View style={[s.statusCard, GLASS]}>
            <View style={{ flex: 1 }}>
              <Text style={s.petName}>{pet?.name || "Tu Mascota"}</Text>
              <Text style={s.petBreed}>
                {species === "cat" ? "Gato" : "Perro"}
                {pet?.age ? ` · ${pet.age} años` : ""}
              </Text>
            </View>
            <View style={[s.limitBadge, !canRecord && s.limitBadgeWarn]}>
              <MaterialCommunityIcons name="microphone" size={13} color={canRecord ? C.indigo : "#DC2626"} />
              <Text style={[s.limitText, !canRecord && s.limitTextWarn]}>
                {canRecord ? `${remaining} restantes` : "Límite alcanzado"}
              </Text>
            </View>
          </View>

          {/* Posture chips */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Postura corporal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
              {postures.map(p => {
                const active = posture === p.key;
                return (
                  <PressableScale key={p.key} onPress={() => setPosture(p.key)} activeScale={0.95}>
                    {active ? (
                      <View style={s.chipActive}>
                        <MaterialCommunityIcons name={p.icon} size={16} color={C.indigo} style={{ marginRight: 5 }} />
                        <Text style={s.chipTextActive}>{p.label}</Text>
                      </View>
                    ) : (
                      <View style={[s.chip, GLASS]}>
                        <MaterialCommunityIcons name={p.icon} size={16} color={C.muted} style={{ marginRight: 5 }} />
                        <Text style={s.chipText}>{p.label}</Text>
                      </View>
                    )}
                  </PressableScale>
                );
              })}
            </ScrollView>
          </View>

          {/* Environment selector */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Contexto / Estímulo</Text>
            <PressableScale onPress={() => setEnvDropOpen(true)} activeScale={0.98} style={[s.envSelector, GLASS]}>
              <View style={s.envSelectorLeft}>
                <View style={s.envIconBox}>
                  <MaterialCommunityIcons name={selectedEnv.icon} size={18} color={C.indigo} />
                </View>
                <Text style={s.envText}>{selectedEnv.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color={C.muted} />
            </PressableScale>
          </View>

          {/* Record section */}
          <View style={s.recordSection}>
            <Text style={s.recordHint}>
              {isRecording
                ? "Grabando... toca para analizar"
                : canRecord
                ? "Toca para comenzar a grabar"
                : "Actualiza a Pro para más análisis"}
            </Text>

            <View style={s.btnOuter}>
              {[0, 1, 2].map(i => <WaveRing key={i} delay={i * 420} isRecording={isRecording} />)}

              {/* 3D base layer */}
              <View style={s.btnBase}>
                <PressableScale
                  onPress={handlePress}
                  disabled={loading || !canRecord}
                  activeScale={0.94}
                >
                  <LinearGradient
                    colors={
                      loading ? [C.indigo, C.violet]
                      : isRecording ? [C.coralDark, "#C63E17"]
                      : !canRecord ? ["#CBD5E1", "#CBD5E1"]
                      : [C.coral, C.coralDark]
                    }
                    style={s.recordBtn}
                  >
                    {loading
                      ? <ActivityIndicator size="large" color="#fff" />
                      : <MaterialCommunityIcons name={isRecording ? "stop" : "microphone"} size={40} color="#fff" />}
                  </LinearGradient>
                </PressableScale>
              </View>
            </View>

            {isRecording && (
              <View style={s.recIndicator}>
                <View style={s.recDot} />
                <Text style={s.recText}>REC</Text>
              </View>
            )}
          </View>

          {/* Tip card */}
          <View style={[s.tipCard, GLASS]}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={s.tipAccent} />
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={C.indigo} style={{ marginRight: 10 }} />
            <Text style={s.tipText}>
              Graba 3–10 segundos de forma natural. Más contexto = traducción más precisa.
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>

      <EnvDropdown
        visible={envDropOpen}
        onClose={() => setEnvDropOpen(false)}
        selected={environment}
        onSelect={setEnvironment}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  appLabel: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  petAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  petAvatarLetter: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  upgradeBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(79,70,229,0.2)",
  },
  upgradeBtnText: { fontFamily: "Inter_700Bold", fontSize: 12, color: C.indigo },

  statusCard: {
    marginHorizontal: 20, marginBottom: 20, borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center",
  },
  petName: { fontFamily: "Inter_800ExtraBold", fontSize: 18, color: C.text, marginBottom: 3 },
  petBreed: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.muted },
  limitBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.indigoLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  limitBadgeWarn: { backgroundColor: "#FEE2E2" },
  limitText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.indigo },
  limitTextWarn: { color: "#DC2626" },

  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.muted,
    marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8,
  },

  chipsRow: { gap: 8, flexDirection: "row", paddingRight: 4 },
  chip: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 9,
  },
  chipActive: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: "rgba(79,70,229,0.10)",
    borderWidth: 1, borderColor: "rgba(79,70,229,0.25)",
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.muted },
  chipTextActive: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.indigo },

  envSelector: {
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  envSelectorLeft: { flexDirection: "row", alignItems: "center" },
  envIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.indigoLight, alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  envText: { fontFamily: "Inter_500Medium", fontSize: 15, color: C.text },

  recordSection: { alignItems: "center", paddingVertical: 20, marginBottom: 8 },
  recordHint: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.muted, marginBottom: 28 },
  btnOuter: { width: BTN_SIZE * 3, height: BTN_SIZE * 3, alignItems: "center", justifyContent: "center" },
  wave: {
    position: "absolute", width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    backgroundColor: C.coral,
  },
  btnBase: {
    width: BTN_SIZE + 8, height: BTN_SIZE + 8, borderRadius: (BTN_SIZE + 8) / 2,
    backgroundColor: "rgba(244,81,30,0.3)",
    alignItems: "center", justifyContent: "center",
    shadowColor: C.coral, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  recordBtn: {
    width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
  },
  recIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  recText: { fontFamily: "Inter_800ExtraBold", fontSize: 13, color: "#EF4444", letterSpacing: 2 },

  tipCard: {
    marginHorizontal: 20, marginBottom: 32, borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "flex-start", overflow: "hidden",
  },
  tipAccent: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
  },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.indigo, flex: 1, lineHeight: 20 },

  // Dropdown
  dropOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "flex-end" },
  dropSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 40 : 28, paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 14,
  },
  dropHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  dropTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text, marginBottom: 12 },
  dropItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderRadius: 12, paddingHorizontal: 8, marginBottom: 4,
  },
  dropItemSel: { backgroundColor: C.indigoLight },
  dropIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#F1F5F9",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  dropIconBoxActive: { backgroundColor: C.indigo },
  dropItemText: { fontFamily: "Inter_400Regular", fontSize: 15, color: C.text },
  dropItemTextSel: { fontFamily: "Inter_600SemiBold", color: C.indigo },
});
