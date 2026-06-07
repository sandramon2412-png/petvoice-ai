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
import SiriWave from "../components/SiriWave";

const { width: SCREEN_W } = Dimensions.get("window");

const EMOTION_IMAGES = {
  Feliz:      require("../../assets/emotions/feliz.png"),
  Juguetón:   require("../../assets/emotions/jugueton.png"),
  Alerta:     require("../../assets/emotions/alerta.png"),
  Curioso:    require("../../assets/emotions/curioso.png"),
  Estresado:  require("../../assets/emotions/estresado.png"),
  Asustado:   require("../../assets/emotions/asustado.png"),
  Tranquilo:  require("../../assets/emotions/tranquilo.png"),
  Hambriento: require("../../assets/emotions/hambriento.png"),
};

const EMOTION_MAP = {
  Feliz:      { color: "#10B981", wave: "#34D399", bg: ["#064E3B","#065F46","#047857"] },
  Juguetón:   { color: "#3B82F6", wave: "#93C5FD", bg: ["#1E3A8A","#1D4ED8","#2563EB"] },
  Alerta:     { color: "#F59E0B", wave: "#FCD34D", bg: ["#78350F","#92400E","#B45309"] },
  Curioso:    { color: "#6366F1", wave: "#A5B4FC", bg: ["#1E1B4B","#312E81","#3730A3"] },
  Estresado:  { color: "#818CF8", wave: "#C7D2FE", bg: ["#1E1B4B","#2E1065","#4C1D95"] },
  Asustado:   { color: "#8B5CF6", wave: "#C4B5FD", bg: ["#2E1065","#3B0764","#4C1D95"] },
  Tranquilo:  { color: "#94A3B8", wave: "#CBD5E1", bg: ["#0F172A","#1E293B","#334155"] },
  Hambriento: { color: "#F59E0B", wave: "#FDE68A", bg: ["#78350F","#92400E","#B45309"] },
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

// Slim circular confidence ring
function ConfidenceRing({ pct, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct / 100, tension: 45, friction: 7, useNativeDriver: false }).start();
  }, []);
  const SIZE = 96; const STROKE = 6; const R = SIZE / 2;
  const rR = anim.interpolate({ inputRange: [0,.5,1], outputRange: ["-180deg","0deg","0deg"] });
  const lR = anim.interpolate({ inputRange: [0,.5,1], outputRange: ["-180deg","-180deg","0deg"] });
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ position:"absolute", width:SIZE, height:SIZE, borderRadius:R, borderWidth:STROKE, borderColor:"rgba(255,255,255,0.15)" }} />
      <View style={{ position:"absolute", width:R, height:SIZE, left:R, overflow:"hidden" }}>
        <Animated.View style={{ width:SIZE, height:SIZE, borderRadius:R, borderWidth:STROKE, borderColor:color, position:"absolute", left:-R, transform:[{rotate:rR}] }} />
      </View>
      <View style={{ position:"absolute", width:R, height:SIZE, left:0, overflow:"hidden" }}>
        <Animated.View style={{ width:SIZE, height:SIZE, borderRadius:R, borderWidth:STROKE, borderColor:color, position:"absolute", left:0, transform:[{rotate:lR}] }} />
      </View>
      <View style={{ position:"absolute", top:0, left:0, right:0, bottom:0, alignItems:"center", justifyContent:"center" }}>
        <Text style={{ fontFamily:"Inter_700Bold", fontSize:20, color:"#fff", letterSpacing:-0.3 }}>{pct}%</Text>
      </View>
    </View>
  );
}

function EmotionOrb({ color, waveColor, size = 120 }) {
  const breathe = useRef(new Animated.Value(1)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.5)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.35)).current;
  const entryScale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Entry spring
    Animated.spring(entryScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }).start();
    // Breathe
    Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1.07, duration: 1800, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
    ])).start();
    // Ring 1 pulse
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(ring1Scale, { toValue: 2.0, duration: 2200, useNativeDriver: true }),
        Animated.timing(ring1Opacity, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ring1Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(ring1Opacity, { toValue: 0.45, duration: 0, useNativeDriver: true }),
      ]),
    ])).start();
    // Ring 2 pulse — offset
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 2.0, duration: 2200, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Opacity, { toValue: 0.3, duration: 0, useNativeDriver: true }),
        ]),
      ])).start();
    }, 1100);
  }, []);

  return (
    <Animated.View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", transform: [{ scale: entryScale }] }}>
      {/* Pulse rings */}
      <Animated.View style={{
        position: "absolute", width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: ring1Opacity, transform: [{ scale: ring1Scale }],
      }} />
      <Animated.View style={{
        position: "absolute", width: size, height: size, borderRadius: size / 2,
        backgroundColor: waveColor, opacity: ring2Opacity, transform: [{ scale: ring2Scale }],
      }} />
      {/* Glow halo */}
      <View style={{
        position: "absolute", width: size + 24, height: size + 24, borderRadius: (size + 24) / 2,
        backgroundColor: color, opacity: 0.18,
      }} />
      {/* Main orb — gradient sphere */}
      <Animated.View style={{
        width: size, height: size, borderRadius: size / 2,
        overflow: "hidden", transform: [{ scale: breathe }],
        shadowColor: color, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9, shadowRadius: 28, elevation: 20,
      }}>
        <LinearGradient
          colors={[waveColor, color, color + "88"]}
          style={{ width: size, height: size }}
          start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
        />
        {/* Inner shine */}
        <View style={{
          position: "absolute", top: size * 0.12, left: size * 0.2,
          width: size * 0.35, height: size * 0.22, borderRadius: size * 0.11,
          backgroundColor: "rgba(255,255,255,0.28)", transform: [{ rotate: "-20deg" }],
        }} />
      </Animated.View>
    </Animated.View>
  );
}

export default function ResultScreen({ navigation }) {
  const { pet, analysisResult } = useApp();

  const heroY   = useRef(new Animated.Value(30)).current;
  const heroO   = useRef(new Animated.Value(0)).current;
  const cardY   = useRef(new Animated.Value(40)).current;
  const cardO   = useRef(new Animated.Value(0)).current;
  const waveO   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.sequence([
      Animated.parallel([
        Animated.timing(waveO,  { toValue:1, duration:700, useNativeDriver:true }),
        Animated.spring(heroY,  { toValue:0, tension:60, friction:10, useNativeDriver:true }),
        Animated.timing(heroO,  { toValue:1, duration:500, useNativeDriver:true }),
      ]),
      Animated.parallel([
        Animated.spring(cardY,  { toValue:0, tension:60, friction:10, useNativeDriver:true }),
        Animated.timing(cardO,  { toValue:1, duration:350, useNativeDriver:true }),
      ]),
    ]).start();
  }, []);

  const result = analysisResult || {
    emocion_principal: "Feliz",
    porcentaje_confianza: 91,
    traduccion_humana: "¡Estoy tan contento de verte! Eres mi persona favorita en el mundo.",
    consejo_propietario: "Tu mascota está en su mejor momento emocional. Una caricia o juguete reforzará este vínculo.",
    keyword_publicidad: "bienestar_animal",
  };

  const emo     = getEmo(result.emocion_principal);
  const petName = pet?.name || "Tu mascota";

  return (
    <View style={{ flex:1, backgroundColor: emo.bg[0] }}>
      {/* Full-screen emotion gradient */}
      <LinearGradient
        colors={[emo.bg[0], emo.bg[1], emo.bg[0]+"DD"]}
        style={StyleSheet.absoluteFill}
        start={{ x:0.1, y:0 }} end={{ x:0.9, y:1 }}
      />

      <SafeAreaView style={{ flex:1 }} edges={["top","bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView
          style={{ flex:1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.8}>
              <GlassView intensity={20} tint="dark" style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
              </GlassView>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Resultado</Text>
            {/* Pet avatar */}
            {pet?.photo
              ? <Image source={{ uri: pet.photo }} style={styles.petAvatar} />
              : <GlassView intensity={20} tint="dark" style={styles.petAvatarBlur}>
                  <Text style={styles.petAvatarLetter}>{petName[0]?.toUpperCase()}</Text>
                </GlassView>
            }
          </View>

          {/* ── Hero ── */}
          <Animated.View style={[styles.hero, { opacity: heroO, transform: [{ translateY: heroY }] }]}>
            <Text style={styles.petSays}>{petName} dice:</Text>

            {/* Emotion icon 3D + orb glow behind it */}
            <View style={{ alignItems: "center", marginBottom: 12, marginTop: 8 }}>
              {/* Orb glow behind image */}
              <View style={{
                position: "absolute",
                width: 130, height: 130, borderRadius: 65,
                backgroundColor: emo.color, opacity: 0.25,
                shadowColor: emo.color, shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1, shadowRadius: 40, elevation: 20,
              }} />
              {/* 3D emotion image — large, floating */}
              <Animated.Image
                source={EMOTION_IMAGES[result.emocion_principal] || EMOTION_IMAGES["Feliz"]}
                style={{
                  width: 140, height: 140,
                  transform: [{ scale: waveO }],
                }}
                resizeMode="contain"
              />
            </View>

            {/* Siri wave — primary + echo */}
            <Animated.View style={{ opacity: waveO, marginBottom: 6 }}>
              {/* Neon aura behind wave */}
              <View style={[styles.waveAura, { backgroundColor: emo.wave + "20" }]} />
              <SiriWave color={emo.wave}  width={SCREEN_W - 48} height={100} intensity={0.82} speed={0.9} />
              <View style={[styles.waveEcho, { opacity: 0.35 }]}>
                <SiriWave color={emo.color} width={SCREEN_W - 80} height={56} intensity={0.42} speed={0.6} />
              </View>
            </Animated.View>

            {/* Emotion name — typographic hero */}
            <Text style={styles.emotionName}>{result.emocion_principal.toUpperCase()}</Text>
            <View style={[styles.emotionLine, { backgroundColor: emo.wave }]} />

            {/* Translation — real BlurView glass */}
            <GlassView intensity={28} tint="light" style={styles.translationCard}>
              <Text style={styles.translationText}>
                "{result.traduccion_humana}"
              </Text>
            </GlassView>
          </Animated.View>

          {/* ── Data cards ── */}
          <Animated.View style={{ opacity: cardO, transform: [{ translateY: cardY }] }}>

            {/* Confidence + advice row */}
            <GlassView intensity={22} tint="dark" style={styles.dataCard}>
              <View style={styles.dataRow}>
                {/* Confidence */}
                <View style={styles.confCol}>
                  <ConfidenceRing pct={result.porcentaje_confianza} color={emo.wave} />
                  <Text style={styles.dataLabel}>Confianza</Text>
                </View>

                <View style={styles.dataDivider} />

                {/* Advice */}
                <View style={styles.adviceCol}>
                  <Text style={styles.adviceTitle}>{petName} también dice:</Text>
                  <Text style={styles.adviceText}>{result.consejo_propietario}</Text>
                </View>
              </View>
            </GlassView>

            {/* CTA */}
            <PressableScale onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{}); navigation.navigate("Home"); }} style={{ marginHorizontal: 20, marginBottom: 32 }}>
              <GlassView intensity={30} tint="light" style={styles.ctaBtn}>
                <MaterialCommunityIcons name="microphone" size={17} color={emo.bg[0]} style={{ marginRight: 8 }} />
                <Text style={[styles.ctaBtnText, { color: emo.bg[0] }]}>Analizar otro sonido</Text>
              </GlassView>
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
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  topBarTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "rgba(255,255,255,0.9)", letterSpacing: 0.2 },
  petAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)" },
  petAvatarBlur: {
    width: 36, height: 36, borderRadius: 18, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  petAvatarLetter: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },

  // Hero
  hero: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  petSays: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 20, letterSpacing: 0.3 },

  waveAura: { position: "absolute", width: "100%", height: "100%", borderRadius: 50 },
  waveEcho: { position: "absolute", bottom: -6, left: 16 },

  emotionName: {
    fontFamily: "Inter_800ExtraBold", fontSize: 48,
    color: "#fff", letterSpacing: -2,
    marginTop: 16, marginBottom: 10,
  },
  emotionLine: { width: 48, height: 3, borderRadius: 2, marginBottom: 24, opacity: 0.9 },

  // Real glass translation card
  translationCard: {
    borderRadius: 28, overflow: "hidden",
    paddingHorizontal: 28, paddingVertical: 28,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.22)",
  },
  translationText: {
    fontFamily: "Inter_400Regular", fontSize: 18,
    color: "#1E293B", lineHeight: 30, letterSpacing: -0.1,
    textAlign: "center",
  },

  // Data card
  dataCard: {
    marginHorizontal: 20, marginBottom: 14, borderRadius: 28, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 24, paddingHorizontal: 20,
  },
  dataRow: { flexDirection: "row", alignItems: "flex-start" },
  confCol: { alignItems: "center", minWidth: 96 },
  dataLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 8, letterSpacing: 0.5 },
  dataDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 18, alignSelf: "stretch" },
  adviceCol: { flex: 1 },
  adviceTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 8, letterSpacing: 0.3 },
  adviceText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 22 },

  // CTA
  ctaBtn: {
    borderRadius: 18, overflow: "hidden",
    paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.5)",
  },
  ctaBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, letterSpacing: 0.1 },
});
