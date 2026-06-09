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

const EMOTION_META = {
  Feliz:      { color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", icon: "emoticon-excited-outline" },
  "Juguetón": { color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", icon: "tennis-ball"              },
  Alerta:     { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "bell-ring-outline"        },
  Curioso:    { color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE", icon: "eye-outline"              },
  Estresado:  { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: "lightning-bolt"           },
  Asustado:   { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", icon: "ghost-outline"            },
  Tranquilo:  { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", icon: "weather-night"            },
  Hambriento: { color: "#F97316", bg: "#FFF7ED", border: "#FED7AA", icon: "food-drumstick-outline"   },
};

const MOCK_HISTORY = [
  { id: "1",  ts: "09:14", day: "Hoy",    emotion: "Feliz",      text: "¡Estoy tan contento de verte! Eres mi persona favorita en el mundo." },
  { id: "2",  ts: "09:14", day: "Hoy",    emotion: "Feliz",      owner: true, text: "¡Hola campeón! ¿Cómo amaneciste hoy?" },
  { id: "3",  ts: "12:05", day: "Hoy",    emotion: "Hambriento", text: "Ya es hora de comer. Mi estómago lleva un rato protestando." },
  { id: "4",  ts: "15:30", day: "Hoy",    emotion: "Juguetón",   text: "¡Quiero jugar! Ven, persígueme, será muy divertido." },
  { id: "5",  ts: "18:47", day: "Hoy",    emotion: "Tranquilo",  text: "Estoy muy relajado y a gusto. Este momento es perfecto." },
  { id: "6",  ts: "10:20", day: "Ayer",   emotion: "Alerta",     text: "Hay algo ahí afuera. No sé si es peligroso pero lo estoy vigilando." },
  { id: "7",  ts: "10:20", day: "Ayer",   emotion: "Alerta",     owner: true, text: "No te preocupes, es solo el cartero." },
  { id: "8",  ts: "14:55", day: "Ayer",   emotion: "Curioso",    text: "¿Qué es eso? Nunca lo había visto antes. Quiero investigarlo." },
  { id: "9",  ts: "20:10", day: "Ayer",   emotion: "Estresado",  text: "Me siento incómodo y necesito tu ayuda. Por favor quédate cerca." },
  { id: "10", ts: "11:30", day: "Martes", emotion: "Feliz",      text: "¡Estoy tan contento de verte! Eres mi persona favorita." },
  { id: "11", ts: "16:00", day: "Martes", emotion: "Asustado",   text: "Tengo miedo. Ese ruido me asusta mucho, necesita que me protejas." },
];

const WEEKLY = [
  { day: "L", dominant: "Feliz",     pct: 75  },
  { day: "M", dominant: "Estresado", pct: 50  },
  { day: "X", dominant: "Juguetón",  pct: 100 },
  { day: "J", dominant: "Estresado", pct: 45  },
  { day: "V", dominant: "Feliz",     pct: 90  },
  { day: "S", dominant: "Feliz",     pct: 80  },
  { day: "D", dominant: "Feliz",     pct: 85  },
];

function moodGrad(dominant) {
  if (["Feliz", "Juguetón", "Tranquilo"].includes(dominant)) return ["#059669", "#34D399"];
  if (["Alerta", "Curioso", "Hambriento"].includes(dominant)) return ["#D97706", "#FCD34D"];
  return ["#DC2626", "#F87171"];
}

// ─── Tab selector ─────────────────────────────────────────────────────────────
function TabBar({ active, onChange }) {
  return (
    <View style={tb.wrap}>
      {[
        { label: "Conversaciones", icon: "chat-outline" },
        { label: "Diario de Ánimo", icon: "chart-areaspline" },
      ].map((t, i) => (
        <TouchableOpacity key={i} style={[tb.tab, active === i && tb.tabActive]} onPress={() => onChange(i)} activeOpacity={0.75}>
          <MaterialCommunityIcons name={t.icon} size={15} color={active === i ? "#4F46E5" : "#94A3B8"} />
          <Text style={[tb.label, active === i && tb.labelActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const tb = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 14, padding: 4, marginHorizontal: 20, marginBottom: 12 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 11 },
  tabActive: { backgroundColor: "#fff", shadowColor: "#4F46E5", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#94A3B8" },
  labelActive: { fontFamily: "Inter_600SemiBold", color: "#4F46E5" },
});

// ─── Day separator ─────────────────────────────────────────────────────────────
function DaySep({ label }) {
  return (
    <View style={ds.row}>
      <View style={ds.line} />
      <View style={ds.badge}><Text style={ds.text}>{label}</Text></View>
      <View style={ds.line} />
    </View>
  );
}
const ds = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", marginVertical: 16, paddingHorizontal: 20 },
  line:  { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  badge: { backgroundColor: "#EEF2FF", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginHorizontal: 10 },
  text:  { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#6366F1", letterSpacing: 0.4 },
});

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function Bubble({ item }) {
  const meta = EMOTION_META[item.emotion] || EMOTION_META.Tranquilo;
  if (item.owner) {
    return (
      <View style={bub.rowRight}>
        <View style={bub.ownerBubble}>
          <Text style={bub.ownerText}>{item.text}</Text>
          <Text style={bub.ownerTime}>{item.ts}</Text>
        </View>
        <View style={bub.ownerAvatar}>
          <MaterialCommunityIcons name="account" size={16} color="#fff" />
        </View>
      </View>
    );
  }
  return (
    <View style={bub.rowLeft}>
      <View style={[bub.petAvatar, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <MaterialCommunityIcons name={meta.icon} size={16} color={meta.color} />
      </View>
      <View style={[bub.petBubble, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <View style={[bub.emotionTag, { backgroundColor: meta.color }]}>
          <Text style={bub.emotionTagText}>{item.emotion}</Text>
        </View>
        <Text style={bub.petText}>{item.text}</Text>
        <Text style={bub.petTime}>{item.ts}</Text>
      </View>
    </View>
  );
}
const bub = StyleSheet.create({
  rowLeft:  { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12, paddingLeft: 16, paddingRight: 40 },
  rowRight: { flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", gap: 8, marginBottom: 12, paddingRight: 16, paddingLeft: 40 },
  petAvatar:   { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ownerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  petBubble:  { flex: 1, borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1.5, padding: 12, gap: 6 },
  ownerBubble:{ backgroundColor: "#4F46E5", borderRadius: 18, borderTopRightRadius: 4, padding: 12, gap: 4 },
  emotionTag: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  emotionTagText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#fff", letterSpacing: 0.3 },
  petText:    { fontFamily: "Inter_400Regular", fontSize: 14, color: "#1E293B", lineHeight: 21 },
  ownerText:  { fontFamily: "Inter_400Regular", fontSize: 14, color: "#fff", lineHeight: 21 },
  petTime:    { fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8", textAlign: "right" },
  ownerTime:  { fontFamily: "Inter_400Regular", fontSize: 10, color: "rgba(255,255,255,0.55)", textAlign: "right" },
});

// ─── Conversations tab ─────────────────────────────────────────────────────────
function ConversationsTab() {
  const rows = [];
  let lastDay = null;
  MOCK_HISTORY.forEach((item) => {
    if (item.day !== lastDay) { rows.push({ type: "sep", id: "s_" + item.day, label: item.day }); lastDay = item.day; }
    rows.push({ type: "bubble", ...item });
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 28 }}>
      {rows.map((r) => r.type === "sep" ? <DaySep key={r.id} label={r.label} /> : <Bubble key={r.id} item={r} />)}
    </ScrollView>
  );
}

// ─── Animated column bar ──────────────────────────────────────────────────────
function ColBar({ item, maxPct }) {
  const anim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: item.pct / 100, duration: 900, delay: 80, useNativeDriver: false }).start();
  }, []);
  const [c1, c2] = moodGrad(item.dominant);
  const barH = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const isToday = item.day === "D";
  return (
    <View style={col.wrap}>
      <Text style={col.pct}>{item.pct}%</Text>
      <View style={col.track}>
        <Animated.View style={[col.fill, { height: barH, overflow: "hidden" }]}>
          <LinearGradient colors={[c2, c1]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
      <View style={[col.dayBadge, isToday && col.dayBadgeToday]}>
        <Text style={[col.day, isToday && col.dayToday]}>{item.day}</Text>
      </View>
    </View>
  );
}
const col = StyleSheet.create({
  wrap:         { flex: 1, alignItems: "center", gap: 6 },
  pct:          { fontFamily: "Inter_600SemiBold", fontSize: 9, color: "#94A3B8" },
  track:        { width: 24, height: 90, backgroundColor: "#F1F5F9", borderRadius: 12, overflow: "hidden", justifyContent: "flex-end" },
  fill:         { width: "100%", borderRadius: 12 },
  dayBadge:     { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  dayBadgeToday:{ backgroundColor: "#4F46E5" },
  day:          { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#94A3B8" },
  dayToday:     { color: "#fff" },
});

// ─── Mood Diary tab ────────────────────────────────────────────────────────────
function MoodDiaryTab({ isPremium }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>

      {/* Weekly overview card */}
      <View style={md.section}>
        <Text style={md.sectionTitle}>Esta semana</Text>
        <Text style={md.sectionSub}>Estado emocional diario</Text>
      </View>

      <View style={[md.chartCard, !isPremium && { opacity: 0.35 }]}>
        {/* Legend */}
        <View style={md.legend}>
          {[["#059669","Bienestar"],["#D97706","Alerta"],["#DC2626","Estrés"]].map(([c,l]) => (
            <View key={l} style={md.legendItem}>
              <View style={[md.legendDot, { backgroundColor: c }]} />
              <Text style={md.legendText}>{l}</Text>
            </View>
          ))}
        </View>
        {/* Column bars */}
        <View style={md.bars}>
          {WEEKLY.map((item) => <ColBar key={item.day} item={item} />)}
        </View>
        {/* Dominant this week */}
        <View style={md.weekSummary}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#10B981" />
          <Text style={md.weekSummaryText}>Feliz fue la emoción predominante — <Text style={{ color: "#10B981", fontFamily: "Inter_700Bold" }}>72%</Text> de la semana</Text>
        </View>
      </View>

      {/* Paywall */}
      {!isPremium && (
        <View style={md.paywallWrap}>
          <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={md.lockCircle}>
            <MaterialCommunityIcons name="lock-outline" size={24} color="#fff" />
          </LinearGradient>
          <Text style={md.pwTitle}>Reporte completo bloqueado</Text>
          <Text style={md.pwSub}>Desbloquea el análisis semanal detallado, métricas de bienestar y alertas de estrés de tu mascota.</Text>
          <TouchableOpacity activeOpacity={0.85} style={md.pwBtn}>
            <LinearGradient colors={["#FF8A65", "#F4511E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={md.pwBtnGrad}>
              <MaterialCommunityIcons name="star" size={16} color="#fff" />
              <Text style={md.pwBtnText}>Desbloquear Reporte Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Metrics */}
      <View style={[md.metricsSection, !isPremium && { opacity: 0.4 }]}>
        <Text style={[md.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>Métricas</Text>
        {[
          { icon: "emoticon-happy-outline",  accent: "#10B981", label: "Emoción predominante",       value: "Feliz · 72% de los análisis" },
          { icon: "lightning-bolt-outline",  accent: "#EF4444", label: "Picos de estrés detectados", value: "Martes y Jueves por la tarde" },
          { icon: "chart-line-variant",      accent: "#4F46E5", label: "Total de análisis",          value: "18 análisis · 4 días activos" },
          { icon: "weather-sunny",           accent: "#F59E0B", label: "Día más feliz",              value: "Miércoles · 100% bienestar"   },
        ].map((m) => (
          <View key={m.label} style={md.metricCard}>
            <View style={[md.metricIcon, { backgroundColor: m.accent + "15" }]}>
              <MaterialCommunityIcons name={m.icon} size={22} color={m.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={md.metricLabel}>{m.label}</Text>
              <Text style={md.metricValue}>{m.value}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}
const md = StyleSheet.create({
  section:     { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 },
  sectionTitle:{ fontFamily: "Inter_700Bold", fontSize: 18, color: "#1E293B", letterSpacing: -0.3 },
  sectionSub:  { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8", marginTop: 2 },

  chartCard: {
    marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: "#F1F5F9",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    marginBottom: 16,
  },
  legend:     { flexDirection: "row", gap: 14, marginBottom: 18 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#64748B" },
  bars:       { flexDirection: "row", gap: 4, alignItems: "flex-end", marginBottom: 16 },
  weekSummary:{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 10 },
  weekSummaryText: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#374151", flex: 1, lineHeight: 17 },

  paywallWrap: {
    marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 22, padding: 24,
    alignItems: "center", gap: 10, marginBottom: 20,
    borderWidth: 1.5, borderColor: "#EEF2FF",
    shadowColor: "#4F46E5", shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  lockCircle: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  pwTitle:    { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1E293B", textAlign: "center" },
  pwSub:      { fontFamily: "Inter_400Regular", fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 19 },
  pwBtn:      { width: "100%", borderRadius: 16, overflow: "hidden", marginTop: 4 },
  pwBtnGrad:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  pwBtnText:  { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },

  metricsSection: { gap: 0 },
  metricCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 10,
    borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#F1F5F9",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  metricIcon:  { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  metricLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#94A3B8", marginBottom: 3 },
  metricValue: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#1E293B" },
});

// ─── Bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ navigation }) {
  const tabs = [
    { label: "Inicio",    icon: "home-variant",  screen: "Home"     },
    { label: "Historial", icon: "history",        screen: "History"  },
    { label: "Ajustes",   icon: "tune-variant",   screen: "Settings" },
  ];
  return (
    <View style={bn.bar}>
      {tabs.map((t) => {
        const active = t.screen === "History";
        return (
          <TouchableOpacity key={t.screen} style={bn.item} onPress={() => !active && navigation.navigate(t.screen)} activeOpacity={0.7}>
            <View style={[bn.icon, active && bn.iconActive]}>
              <MaterialCommunityIcons name={t.icon} size={24} color={active ? "#4F46E5" : "#94A3B8"} />
            </View>
            <Text style={[bn.label, active && bn.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const bn = StyleSheet.create({
  bar:        { flexDirection: "row", paddingTop: 10, paddingBottom: 4, paddingHorizontal: 8, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  item:       { flex: 1, alignItems: "center", gap: 4 },
  icon:       { width: 44, height: 36, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  iconActive: { backgroundColor: "#EEF2FF" },
  label:      { fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8" },
  labelActive:{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#4F46E5" },
});

// ─── Main ──────────────────────────────────────────────────────────────────────
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
