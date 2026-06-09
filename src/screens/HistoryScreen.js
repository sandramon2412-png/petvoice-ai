import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Emotion metadata ────────────────────────────────────────────────────────
const EMOTION_META = {
  Feliz:      { color: "#10B981", bg: "#ECFDF5", dot: "#059669", icon: "emoticon-excited-outline" },
  "Juguetón": { color: "#3B82F6", bg: "#EFF6FF", dot: "#2563EB", icon: "tennis-ball"              },
  Alerta:     { color: "#D97706", bg: "#FFFBEB", dot: "#B45309", icon: "bell-ring-outline"        },
  Curioso:    { color: "#4F46E5", bg: "#EEF2FF", dot: "#4338CA", icon: "eye-outline"              },
  Estresado:  { color: "#EF4444", bg: "#FEF2F2", dot: "#DC2626", icon: "lightning-bolt"           },
  Asustado:   { color: "#7C3AED", bg: "#F5F3FF", dot: "#6D28D9", icon: "ghost-outline"            },
  Tranquilo:  { color: "#64748B", bg: "#F8FAFC", dot: "#475569", icon: "weather-night"            },
  Hambriento: { color: "#F97316", bg: "#FFF7ED", dot: "#EA580C", icon: "food-drumstick-outline"   },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  { id: "1",  ts: "09:14", day: "Hoy",     emotion: "Feliz",      text: "¡Estoy tan contento de verte! Eres mi persona favorita en el mundo." },
  { id: "2",  ts: "09:14", day: "Hoy",     emotion: "Feliz",      owner: true, text: "¡Hola campeón! ¿Cómo amaneciste hoy?" },
  { id: "3",  ts: "12:05", day: "Hoy",     emotion: "Hambriento", text: "Ya es hora de comer. Mi estómago lleva un rato protestando." },
  { id: "4",  ts: "15:30", day: "Hoy",     emotion: "Juguetón",   text: "¡Quiero jugar! Ven, persígueme, será muy divertido." },
  { id: "5",  ts: "18:47", day: "Hoy",     emotion: "Tranquilo",  text: "Estoy muy relajado y a gusto. Este momento es perfecto." },
  { id: "6",  ts: "10:20", day: "Ayer",    emotion: "Alerta",     text: "Hay algo ahí afuera. No sé si es peligroso pero lo estoy vigilando." },
  { id: "7",  ts: "10:20", day: "Ayer",    emotion: "Alerta",     owner: true, text: "No te preocupes, es solo el cartero." },
  { id: "8",  ts: "14:55", day: "Ayer",    emotion: "Curioso",    text: "¿Qué es eso? Nunca lo había visto antes. Quiero investigarlo." },
  { id: "9",  ts: "20:10", day: "Ayer",    emotion: "Estresado",  text: "Me siento incómodo y necesito tu ayuda. Por favor quédate cerca." },
  { id: "10", ts: "11:30", day: "Martes",  emotion: "Feliz",      text: "¡Estoy tan contento de verte! Eres mi persona favorita." },
  { id: "11", ts: "16:00", day: "Martes",  emotion: "Asustado",   text: "Tengo miedo. Ese ruido me asusta mucho, necesito que me protejas." },
];

const WEEKLY_DATA = [
  { day: "Lun", dominant: "Feliz",      pct: 75  },
  { day: "Mar", dominant: "Estresado",  pct: 50  },
  { day: "Mié", dominant: "Juguetón",   pct: 100 },
  { day: "Jue", dominant: "Estresado",  pct: 45  },
  { day: "Vie", dominant: "Feliz",      pct: 90  },
  { day: "Sáb", dominant: "Feliz",      pct: 80  },
  { day: "Hoy", dominant: "Feliz",      pct: 85  },
];

function moodColors(dominant) {
  if (["Feliz", "Juguetón", "Tranquilo"].includes(dominant)) return ["#10B981", "#34D399"];
  if (["Alerta", "Curioso", "Hambriento"].includes(dominant)) return ["#F59E0B", "#FBBF24"];
  return ["#EF4444", "#F87171"];
}

// ─── Tab selector ─────────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  return (
    <View style={tb.wrap}>
      {["Conversaciones", "Diario de Ánimo"].map((label, i) => (
        <TouchableOpacity key={label} style={[tb.tab, active === i && tb.tabActive]} onPress={() => onChange(i)} activeOpacity={0.7}>
          <MaterialCommunityIcons name={i === 0 ? "chat-outline" : "chart-bar"} size={15} color={active === i ? "#4F46E5" : "#94A3B8"} />
          <Text style={[tb.label, active === i && tb.labelActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const tb = StyleSheet.create({
  wrap: {
    flexDirection: "row", backgroundColor: "#F1F5F9",
    borderRadius: 14, padding: 4, marginHorizontal: 20, marginBottom: 8,
  },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 11 },
  tabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#94A3B8" },
  labelActive: { color: "#4F46E5" },
});

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function Bubble({ item }) {
  const meta = EMOTION_META[item.emotion] || EMOTION_META.Tranquilo;
  if (item.owner) {
    return (
      <View style={ch.rowRight}>
        <View style={ch.bubbleOwner}>
          <Text style={ch.textOwner}>{item.text}</Text>
          <Text style={ch.time}>{item.ts}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={ch.rowLeft}>
      <View style={[ch.avatar, { backgroundColor: meta.bg, borderColor: meta.color + "50" }]}>
        <MaterialCommunityIcons name={meta.icon} size={17} color={meta.color} />
      </View>
      <View style={{ maxWidth: SCREEN_W * 0.64 }}>
        <View style={[ch.bubblePet, { backgroundColor: meta.bg, borderColor: meta.color + "35" }]}>
          <View style={[ch.badge, { backgroundColor: meta.color + "18" }]}>
            <View style={[ch.dot, { backgroundColor: meta.dot }]} />
            <Text style={[ch.badgeText, { color: meta.color }]}>{item.emotion}</Text>
          </View>
          <Text style={ch.textPet}>{item.text}</Text>
          <Text style={ch.time}>{item.ts}</Text>
        </View>
      </View>
    </View>
  );
}
const ch = StyleSheet.create({
  rowLeft:  { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 10, paddingHorizontal: 16 },
  rowRight: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10, paddingHorizontal: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  bubblePet: { borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1, padding: 12, gap: 6 },
  bubbleOwner: { backgroundColor: "#4F46E5", borderRadius: 18, borderTopRightRadius: 4, padding: 12, maxWidth: SCREEN_W * 0.64, gap: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 0.4 },
  textPet:   { fontFamily: "Inter_400Regular", fontSize: 14, color: "#1E293B", lineHeight: 20 },
  textOwner: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#fff", lineHeight: 20 },
  time: { fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8", textAlign: "right" },
});

// ─── Day separator ─────────────────────────────────────────────────────────────
function DaySep({ label }) {
  return (
    <View style={ds.row}>
      <View style={ds.line} /><Text style={ds.text}>{label}</Text><View style={ds.line} />
    </View>
  );
}
const ds = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 14, paddingHorizontal: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  text: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#94A3B8", marginHorizontal: 10, letterSpacing: 0.6, textTransform: "uppercase" },
});

// ─── Conversations tab ─────────────────────────────────────────────────────────
function ConversationsTab() {
  const items = [];
  let lastDay = null;
  MOCK_HISTORY.forEach((item) => {
    if (item.day !== lastDay) { items.push({ type: "sep", id: "sep_" + item.day, label: item.day }); lastDay = item.day; }
    items.push({ type: "bubble", ...item });
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}>
      {items.map((item) => item.type === "sep" ? <DaySep key={item.id} label={item.label} /> : <Bubble key={item.id} item={item} />)}
    </ScrollView>
  );
}

// ─── Animated bar ─────────────────────────────────────────────────────────────
function WeekBar({ item }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: item.pct / 100, duration: 900, delay: 120, useNativeDriver: false }).start();
  }, []);
  const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const [c1, c2] = moodColors(item.dominant);
  return (
    <View style={wb.row}>
      <Text style={wb.day}>{item.day}</Text>
      <View style={wb.track}>
        <Animated.View style={[wb.fill, { width: barW, overflow: "hidden" }]}>
          <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
      <Text style={wb.pct}>{item.pct}%</Text>
    </View>
  );
}
const wb = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 11 },
  day:   { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#64748B", width: 30 },
  track: { flex: 1, height: 10, backgroundColor: "#F1F5F9", borderRadius: 5, overflow: "hidden" },
  fill:  { height: "100%", borderRadius: 5 },
  pct:   { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#94A3B8", width: 34, textAlign: "right" },
});

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  return (
    <View style={sc.card}>
      <View style={[sc.iconBg, { backgroundColor: accent + "18" }]}>
        <MaterialCommunityIcons name={icon} size={20} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sc.label}>{label}</Text>
        <Text style={sc.value}>{value}</Text>
      </View>
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "#EEF2FF", marginBottom: 10,
    shadowColor: "#4F46E5", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  iconBg: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#94A3B8", marginBottom: 3 },
  value: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#1E293B", lineHeight: 20 },
});

// ─── Mood Diary tab ────────────────────────────────────────────────────────────
function MoodDiaryTab({ isPremium }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>

      <Text style={md.sectionTitle}>Estado emocional semanal</Text>
      <Text style={[md.sectionSub, { marginBottom: 16 }]}>Últimos 7 días</Text>

      {/* Chart + optional paywall */}
      <View style={{ marginBottom: 20 }}>
        <View style={[md.chartCard, !isPremium && { opacity: 0.30 }]}>
          <View style={md.legendRow}>
            {[["#10B981", "Bienestar"], ["#F59E0B", "Alerta"], ["#EF4444", "Estrés"]].map(([c, l]) => (
              <View key={l} style={md.legendItem}>
                <View style={[md.legendDot, { backgroundColor: c }]} />
                <Text style={md.legendText}>{l}</Text>
              </View>
            ))}
          </View>
          {WEEKLY_DATA.map((item) => <WeekBar key={item.day} item={item} />)}
        </View>

        {!isPremium && (
          <View style={md.paywallOverlay}>
            <View style={md.paywallCard}>
              <LinearGradient colors={["rgba(255,255,255,0.97)", "rgba(248,250,252,0.99)"]} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={md.lockBg}>
                <MaterialCommunityIcons name="lock-outline" size={22} color="#fff" />
              </LinearGradient>
              <Text style={md.pwTitle}>Reporte semanal Premium</Text>
              <Text style={md.pwSub}>Accede al análisis completo del comportamiento emocional de tu mascota.</Text>
              <TouchableOpacity activeOpacity={0.85} style={md.pwBtn}>
                <LinearGradient colors={["#FF8A65", "#F4511E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={md.pwBtnGrad}>
                  <MaterialCommunityIcons name="star-outline" size={15} color="#fff" />
                  <Text style={md.pwBtnText}>Desbloquear Reporte Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Metrics */}
      <View style={[!isPremium && { opacity: 0.45 }]}>
        <Text style={[md.sectionTitle, { marginBottom: 12 }]}>Métricas de la semana</Text>
        <StatCard icon="emoticon-happy-outline"  label="Emoción predominante"          value="Feliz · 72% de los análisis"       accent="#10B981" />
        <StatCard icon="lightning-bolt-outline"  label="Picos de estrés detectados"    value="Martes y Jueves por la tarde"      accent="#EF4444" />
        <StatCard icon="chart-line-variant"      label="Total de análisis"             value="18 análisis · 4 días activos"      accent="#4F46E5" />
        <StatCard icon="weather-sunny"           label="Día más feliz"                 value="Miércoles · 100% bienestar"        accent="#F59E0B" />
      </View>

    </ScrollView>
  );
}
const md = StyleSheet.create({
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#1E293B", letterSpacing: -0.3 },
  sectionSub:   { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8", marginTop: 2 },
  chartCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: "#F1F5F9",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  legendRow:  { flexDirection: "row", gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#64748B" },
  paywallOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
    borderRadius: 20, overflow: "hidden",
  },
  paywallCard: {
    width: "88%", borderRadius: 24, overflow: "hidden",
    padding: 24, alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "rgba(79,70,229,0.18)",
    shadowColor: "#4F46E5", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  lockBg:    { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pwTitle:   { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1E293B", textAlign: "center" },
  pwSub:     { fontFamily: "Inter_400Regular", fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 18 },
  pwBtn:     { width: "100%", borderRadius: 16, overflow: "hidden", marginTop: 4 },
  pwBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  pwBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },
});

// ─── Bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ navigation }) {
  const tabs = [
    { label: "Inicio",    icon: "home-outline", screen: "Home"    },
    { label: "Historial", icon: "history",       screen: "History" },
    { label: "Ajustes",   icon: "cog-outline",   screen: "Settings" },
  ];
  return (
    <View style={bn.bar}>
      {tabs.map((t) => {
        const active = t.screen === "History";
        return (
          <TouchableOpacity key={t.screen} style={bn.item} onPress={() => !active && navigation.navigate(t.screen)} activeOpacity={0.7}>
            <View style={[bn.iconBox, active && bn.iconBoxActive]}>
              <MaterialCommunityIcons name={t.icon} size={22} color={active ? "#4F46E5" : "#94A3B8"} />
            </View>
            <Text style={[bn.label, active && bn.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const bn = StyleSheet.create({
  bar: {
    flexDirection: "row", paddingTop: 8, paddingBottom: 4, paddingHorizontal: 12,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 8,
  },
  item:         { flex: 1, alignItems: "center", gap: 3 },
  iconBox:      { width: 40, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconBoxActive:{ backgroundColor: "#EEF2FF" },
  label:        { fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8" },
  labelActive:  { fontFamily: "Inter_600SemiBold", color: "#4F46E5" },
});

// ─── Main export ───────────────────────────────────────────────────────────────
export default function HistoryScreen({ navigation }) {
  const { pet } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const isPremium = false;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        {/* Header */}
        <View style={hs.header}>
          <View>
            <Text style={hs.title}>Historial</Text>
            <Text style={hs.sub}>{pet?.name || "Tu mascota"} · PetVoice AI</Text>
          </View>
          <TouchableOpacity style={hs.searchBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <TabBar active={activeTab} onChange={setActiveTab} />

        <View style={{ flex: 1 }}>
          {activeTab === 0 ? <ConversationsTab /> : <MoodDiaryTab isPremium={isPremium} />}
        </View>

      </SafeAreaView>

      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#fff" }}>
        <BottomNav navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const hs = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  title:     { fontFamily: "Inter_700Bold", fontSize: 26, color: "#1E293B", letterSpacing: -0.6 },
  sub:       { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8", marginTop: 2 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
});
