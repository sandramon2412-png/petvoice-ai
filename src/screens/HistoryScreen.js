import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

const { width: W } = Dimensions.get("window");

const C = {
  bg:     "#06071A",
  card:   "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.10)",
  text:   "#F1F5F9",
  muted:  "#64748B",
  indigo: "#818CF8",
};

// Colores más saturados/visibles sobre fondo oscuro
const EMO = {
  Feliz:      { color:"#10B981", g1:"#065F46", g2:"#047857", icon:"emoticon-excited-outline" },
  "Juguetón": { color:"#60A5FA", g1:"#1E3A8A", g2:"#1D4ED8", icon:"tennis-ball"             },
  Alerta:     { color:"#FBBF24", g1:"#78350F", g2:"#92400E", icon:"bell-ring-outline"       },
  Curioso:    { color:"#A78BFA", g1:"#2E1065", g2:"#4C1D95", icon:"eye-outline"             },
  Estresado:  { color:"#F87171", g1:"#7F1D1D", g2:"#991B1B", icon:"lightning-bolt"          },
  Asustado:   { color:"#C084FC", g1:"#3B0764", g2:"#4C1D95", icon:"ghost-outline"           },
  Tranquilo:  { color:"#94A3B8", g1:"#1E293B", g2:"#334155", icon:"weather-night"           },
  Hambriento: { color:"#FB923C", g1:"#7C2D12", g2:"#9A3412", icon:"food-drumstick-outline"  },
};

const WEEK = [
  { day:"L", pct:75,  mood:"good" },
  { day:"M", pct:50,  mood:"bad"  },
  { day:"X", pct:100, mood:"good" },
  { day:"J", pct:45,  mood:"bad"  },
  { day:"V", pct:90,  mood:"good" },
  { day:"S", pct:80,  mood:"good" },
  { day:"D", pct:85,  mood:"good", today:true },
];

const METRICS = [
  { icon:"emoticon-happy",         color:"#10B981", g1:"#065F46", g2:"#047857", label:"Emoción predominante",  value:"Feliz · 72% de los análisis",   badge:"72%" },
  { icon:"lightning-bolt",         color:"#F87171", g1:"#7F1D1D", g2:"#991B1B", label:"Picos de estrés",        value:"Martes y Jueves por la tarde",   badge:"2 días" },
  { icon:"chart-line-variant",     color:"#818CF8", g1:"#1E1B4B", g2:"#312E81", label:"Análisis esta semana",   value:"18 análisis en 4 días",          badge:"18" },
  { icon:"white-balance-sunny",    color:"#FBBF24", g1:"#78350F", g2:"#92400E", label:"Día más feliz",          value:"Miércoles · 100% bienestar",     badge:"100%" },
];

// ── Tabs ───────────────────────────────────────────────────────────────────────
function Tabs({ active, onChange }) {
  const TABS = [
    { label:"Conversaciones",  iconOn:"chat-processing",         iconOff:"chat-processing-outline"        },
    { label:"Diario de Ánimo", iconOn:"chart-timeline-variant",  iconOff:"chart-timeline-variant-shimmer" },
  ];
  return (
    <View style={tb.wrap}>
      {TABS.map((tab, i) => {
        const on = active === i;
        return (
          <TouchableOpacity key={i} style={[tb.tab, on && tb.tabOn]} onPress={() => onChange(i)} activeOpacity={0.8}>
            {on && <LinearGradient colors={["rgba(129,140,248,0.25)","rgba(129,140,248,0.10)"]} style={StyleSheet.absoluteFill} />}
            <MaterialCommunityIcons name={on ? tab.iconOn : tab.iconOff} size={15} color={on ? "#818CF8" : C.muted}/>
            <Text style={[tb.label, on && tb.labelOn]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const tb = StyleSheet.create({
  wrap:    { flexDirection:"row", backgroundColor:"rgba(255,255,255,0.04)", borderRadius:16, padding:4, marginHorizontal:20, marginBottom:16, borderWidth:1, borderColor:C.border, overflow:"hidden" },
  tab:     { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, paddingVertical:11, borderRadius:13, overflow:"hidden" },
  tabOn:   { borderWidth:1, borderColor:"rgba(129,140,248,0.30)" },
  label:   { fontFamily:"Inter_600SemiBold", fontSize:13, color:C.muted },
  labelOn: { color:"#818CF8" },
});

// ── Day separator ──────────────────────────────────────────────────────────────
function Day({ label }) {
  return (
    <View style={dy.row}>
      <View style={dy.line}/>
      <View style={dy.pill}><Text style={dy.text}>{label}</Text></View>
      <View style={dy.line}/>
    </View>
  );
}
const dy = StyleSheet.create({
  row:  { flexDirection:"row", alignItems:"center", marginVertical:18, paddingHorizontal:20 },
  line: { flex:1, height:1, backgroundColor:"rgba(255,255,255,0.07)" },
  pill: { backgroundColor:"rgba(129,140,248,0.15)", borderRadius:20, paddingHorizontal:12, paddingVertical:5, marginHorizontal:12 },
  text: { fontFamily:"Inter_600SemiBold", fontSize:11, color:"#818CF8", letterSpacing:0.5 },
});

// ── Bubble ─────────────────────────────────────────────────────────────────────
function Bubble({ item }) {
  const m = EMO[item.emotion] || EMO.Tranquilo;

  if (item.owner) return (
    <View style={b.right}>
      <View style={[b.ownerWrap]}>
        <LinearGradient colors={["#6366F1","#4338CA"]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
        <LinearGradient colors={["rgba(255,255,255,0.25)","transparent"]} start={{x:0,y:0}} end={{x:0,y:1}} style={[StyleSheet.absoluteFill,{borderRadius:20}]}/>
        <Text style={b.ownerText}>{item.text}</Text>
        <Text style={b.ownerTime}>{item.ts}</Text>
      </View>
    </View>
  );

  return (
    <View style={b.left}>
      {/* Avatar con color sólido de la emoción */}
      <LinearGradient colors={[m.g1, m.g2]} style={b.avatar}>
        <MaterialCommunityIcons name={m.icon} size={17} color={m.color}/>
      </LinearGradient>

      <View style={{ maxWidth: W * 0.68 }}>
        <View style={[b.petWrap, { borderColor: m.color + "50" }]}>
          {/* Fondo degradado fuerte del color de la emoción */}
          <LinearGradient
            colors={[m.g2 + "EE", m.g1 + "CC"]}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={StyleSheet.absoluteFill}
          />
          {/* Brillo superior tipo cristal */}
          <LinearGradient
            colors={["rgba(255,255,255,0.18)","transparent"]}
            start={{x:0,y:0}} end={{x:0,y:1}}
            style={[StyleSheet.absoluteFill, {borderRadius:20}]}
          />
          <View style={[b.emoTag, { backgroundColor: m.color + "30", borderColor: m.color + "60" }]}>
            <View style={[b.emoDot, { backgroundColor: m.color }]}/>
            <Text style={[b.emoText, { color: m.color }]}>{item.emotion}</Text>
          </View>
          <Text style={b.petText}>{item.text}</Text>
          <Text style={b.petTime}>{item.ts}</Text>
        </View>
      </View>
    </View>
  );
}
const b = StyleSheet.create({
  left:     { flexDirection:"row", alignItems:"flex-end", gap:10, marginBottom:14, paddingHorizontal:20 },
  right:    { alignItems:"flex-end", marginBottom:14, paddingHorizontal:20 },
  avatar:   { width:36, height:36, borderRadius:18, alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:4 },
  petWrap:  { borderRadius:20, borderTopLeftRadius:5, borderWidth:1.5, paddingHorizontal:14, paddingVertical:12, gap:6, overflow:"hidden" },
  ownerWrap:{ borderRadius:20, borderTopRightRadius:5, overflow:"hidden", paddingHorizontal:14, paddingVertical:12, gap:4, maxWidth:W*0.68, borderWidth:1, borderColor:"rgba(255,255,255,0.20)" },
  emoTag:   { flexDirection:"row", alignItems:"center", gap:5, alignSelf:"flex-start", paddingHorizontal:8, paddingVertical:3, borderRadius:20, borderWidth:1 },
  emoDot:   { width:5, height:5, borderRadius:3 },
  emoText:  { fontFamily:"Inter_700Bold", fontSize:10, letterSpacing:0.3 },
  petText:  { fontFamily:"Inter_400Regular", fontSize:14, color:"#F1F5F9", lineHeight:20 },
  ownerText:{ fontFamily:"Inter_400Regular", fontSize:14, color:"#fff", lineHeight:20 },
  petTime:  { fontFamily:"Inter_400Regular", fontSize:10, color:"rgba(255,255,255,0.45)", alignSelf:"flex-end" },
  ownerTime:{ fontFamily:"Inter_400Regular", fontSize:10, color:"rgba(255,255,255,0.40)", alignSelf:"flex-end" },
});

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyChat() {
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", paddingHorizontal:40, gap:14 }}>
      <LinearGradient colors={["#4F46E5","#7C3AED"]} style={{ width:72, height:72, borderRadius:22, alignItems:"center", justifyContent:"center" }}>
        <MaterialCommunityIcons name="chat-processing-outline" size={32} color="#fff"/>
      </LinearGradient>
      <Text style={{ fontFamily:"Inter_700Bold", fontSize:18, color:C.text, textAlign:"center" }}>Sin análisis aún</Text>
      <Text style={{ fontFamily:"Inter_400Regular", fontSize:13, color:C.muted, textAlign:"center", lineHeight:20 }}>
        Graba el sonido de tu mascota en Inicio y aquí aparecerá la traducción automáticamente.
      </Text>
    </View>
  );
}

// ── Chat tab ───────────────────────────────────────────────────────────────────
function ChatTab({ history }) {
  if (history.length === 0) return <EmptyChat/>;
  const rows = [];
  let last = null;
  history.forEach(item => {
    if (item.day !== last) { rows.push({ type:"day", id:"d"+item.day+item.id, label:item.day }); last=item.day; }
    rows.push({ type:"bubble", ...item });
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop:4, paddingBottom:28 }}>
      {rows.map(r => r.type==="day" ? <Day key={r.id} label={r.label}/> : <Bubble key={r.id} item={r}/>)}
    </ScrollView>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
function Bar({ item }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue:item.pct/100, duration:1000, delay:120, useNativeDriver:false }).start();
  }, []);
  const h = anim.interpolate({ inputRange:[0,1], outputRange:["0%","100%"] });
  const colors = item.mood==="good" ? ["#34D399","#059669"] : ["#F87171","#DC2626"];
  return (
    <View style={bar.col}>
      <Text style={bar.pctTxt}>{item.pct}%</Text>
      <View style={bar.track}>
        <Animated.View style={[bar.fill,{height:h,overflow:"hidden"}]}>
          <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:0,y:1}} style={StyleSheet.absoluteFill}/>
        </Animated.View>
      </View>
      <View style={[bar.pill, item.today && bar.pillOn]}>
        <Text style={[bar.dayTxt, item.today && bar.dayOn]}>{item.day}</Text>
      </View>
    </View>
  );
}
const bar = StyleSheet.create({
  col:    { flex:1, alignItems:"center", gap:6 },
  pctTxt: { fontFamily:"Inter_600SemiBold", fontSize:9, color:C.muted },
  track:  { width:28, height:100, backgroundColor:"rgba(255,255,255,0.06)", borderRadius:14, overflow:"hidden", justifyContent:"flex-end" },
  fill:   { width:"100%", borderRadius:14 },
  pill:   { width:28, height:28, borderRadius:9, alignItems:"center", justifyContent:"center" },
  pillOn: { backgroundColor:"#4F46E5" },
  dayTxt: { fontFamily:"Inter_600SemiBold", fontSize:11, color:C.muted },
  dayOn:  { color:"#fff" },
});

// ── Metric card ────────────────────────────────────────────────────────────────
function Metric({ item }) {
  return (
    <View style={mc.card}>
      <LinearGradient colors={[item.g1, item.g2]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
      <LinearGradient colors={["rgba(255,255,255,0.14)","transparent"]} start={{x:0,y:0}} end={{x:0,y:1}} style={StyleSheet.absoluteFill}/>
      <View style={mc.top}>
        <View style={[mc.iconCircle, { backgroundColor: item.color+"30" }]}>
          <MaterialCommunityIcons name={item.icon} size={22} color={item.color}/>
        </View>
        <View style={[mc.badgePill, { backgroundColor: item.color+"25", borderColor: item.color+"50" }]}>
          <Text style={[mc.badgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
      </View>
      <Text style={mc.label}>{item.label}</Text>
      <Text style={mc.value}>{item.value}</Text>
    </View>
  );
}
const mc = StyleSheet.create({
  card: {
    flex:1, borderRadius:20, padding:14, gap:8, overflow:"hidden",
    borderWidth:1, borderColor:"rgba(255,255,255,0.12)", minHeight:120,
  },
  top:        { flexDirection:"row", justifyContent:"space-between", alignItems:"flex-start" },
  iconCircle: { width:40, height:40, borderRadius:13, alignItems:"center", justifyContent:"center" },
  badgePill:  { borderRadius:20, paddingHorizontal:8, paddingVertical:3, borderWidth:1 },
  badgeText:  { fontFamily:"Inter_700Bold", fontSize:11 },
  label:      { fontFamily:"Inter_400Regular", fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:15 },
  value:      { fontFamily:"Inter_700Bold", fontSize:13, color:"#F1F5F9", lineHeight:17 },
});

// ── Diary tab ──────────────────────────────────────────────────────────────────
function DiaryTab({ isPremium }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:28, paddingTop:4 }}>

      {/* Weekly mood summary strip */}
      <View style={dr.strip}>
        <LinearGradient colors={["#10B981","#059669"]} style={dr.stripIcon}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={18} color="#fff"/>
        </LinearGradient>
        <View>
          <Text style={dr.stripTitle}>Esta semana tu mascota estuvo</Text>
          <Text style={dr.stripValue}>Feliz el 72% del tiempo 🐾</Text>
        </View>
      </View>

      {/* Chart card */}
      <View style={dr.card}>
        <View style={dr.cardHead}>
          <Text style={dr.cardTitle}>Bienestar diario</Text>
          <View style={dr.badge}><Text style={dr.badgeTxt}>7 días</Text></View>
        </View>

        <View style={[!isPremium && { opacity:0.30 }]}>
          <View style={dr.bars}>
            {WEEK.map(w => <Bar key={w.day} item={w}/>)}
          </View>
          <View style={dr.legend}>
            {[["#34D399","Bienestar"], ["#F87171","Estrés"]].map(([c,l]) => (
              <View key={l} style={dr.legItem}>
                <View style={[dr.legDot,{backgroundColor:c}]}/>
                <Text style={dr.legText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {!isPremium && (
          <View style={dr.lockRow}>
            <LinearGradient colors={["#4F46E5","#7C3AED"]} style={dr.lockIcon}>
              <MaterialCommunityIcons name="lock" size={12} color="#fff"/>
            </LinearGradient>
            <Text style={dr.lockTxt}>Gráfica completa disponible en Premium</Text>
          </View>
        )}
      </View>

      {/* Paywall CTA */}
      {!isPremium && (
        <TouchableOpacity activeOpacity={0.88} style={dr.ctaWrap}>
          <LinearGradient colors={["#FF8A65","#F4511E"]} start={{x:0,y:0}} end={{x:1,y:0}} style={dr.cta}>
            <LinearGradient colors={["rgba(255,255,255,0.20)","transparent"]} start={{x:0,y:0}} end={{x:0,y:1}} style={[StyleSheet.absoluteFill,{borderRadius:18}]}/>
            <MaterialCommunityIcons name="star-four-points" size={22} color="#fff"/>
            <View style={{ flex:1 }}>
              <Text style={dr.ctaTitle}>Desbloquear Reporte Premium</Text>
              <Text style={dr.ctaSub}>Análisis completo · Sin límites</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.7)"/>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Metrics grid 2×2 */}
      <View style={[!isPremium && { opacity:0.45 }]}>
        <Text style={dr.gridTitle}>Métricas de la semana</Text>
        <View style={dr.grid}>
          <View style={dr.gridCol}>
            <Metric item={METRICS[0]}/>
            <Metric item={METRICS[2]}/>
          </View>
          <View style={dr.gridCol}>
            <Metric item={METRICS[1]}/>
            <Metric item={METRICS[3]}/>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}
const dr = StyleSheet.create({
  strip: {
    flexDirection:"row", alignItems:"center", gap:14,
    marginHorizontal:20, marginBottom:14, padding:16,
    backgroundColor:"rgba(16,185,129,0.12)", borderRadius:18,
    borderWidth:1, borderColor:"rgba(16,185,129,0.25)",
  },
  stripIcon:  { width:42, height:42, borderRadius:13, alignItems:"center", justifyContent:"center" },
  stripTitle: { fontFamily:"Inter_400Regular", fontSize:11, color:C.muted, marginBottom:2 },
  stripValue: { fontFamily:"Inter_700Bold", fontSize:15, color:"#34D399" },
  card: {
    backgroundColor:C.card, borderRadius:22, padding:18,
    marginHorizontal:20, marginBottom:14,
    borderWidth:1, borderColor:C.border,
  },
  cardHead: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:18 },
  cardTitle:{ fontFamily:"Inter_700Bold", fontSize:16, color:C.text },
  badge:    { backgroundColor:"rgba(129,140,248,0.18)", borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  badgeTxt: { fontFamily:"Inter_600SemiBold", fontSize:11, color:C.indigo },
  bars:     { flexDirection:"row", gap:4, alignItems:"flex-end", marginBottom:14 },
  legend:   { flexDirection:"row", gap:18 },
  legItem:  { flexDirection:"row", alignItems:"center", gap:6 },
  legDot:   { width:8, height:8, borderRadius:4 },
  legText:  { fontFamily:"Inter_400Regular", fontSize:12, color:C.muted },
  lockRow:  { flexDirection:"row", alignItems:"center", gap:10, marginTop:14, paddingTop:14, borderTopWidth:1, borderTopColor:C.border },
  lockIcon: { width:26, height:26, borderRadius:8, alignItems:"center", justifyContent:"center" },
  lockTxt:  { fontFamily:"Inter_400Regular", fontSize:12, color:C.muted, flex:1 },
  ctaWrap:  { marginHorizontal:20, marginBottom:14, borderRadius:18, overflow:"hidden", shadowColor:"#F4511E", shadowOpacity:0.4, shadowRadius:14, shadowOffset:{width:0,height:5}, elevation:7 },
  cta:      { flexDirection:"row", alignItems:"center", gap:14, padding:18, overflow:"hidden" },
  ctaTitle:  { fontFamily:"Inter_700Bold", fontSize:14, color:"#fff" },
  ctaSub:    { fontFamily:"Inter_400Regular", fontSize:11, color:"rgba(255,255,255,0.72)", marginTop:2 },
  gridTitle: { fontFamily:"Inter_700Bold", fontSize:16, color:C.text, marginHorizontal:20, marginBottom:12 },
  grid:      { flexDirection:"row", gap:10, paddingHorizontal:20, marginBottom:14 },
  gridCol:   { flex:1, gap:10 },
});

// ── Pet cards ──────────────────────────────────────────────────────────────────
const pc = StyleSheet.create({
  row:      { paddingHorizontal:20, paddingBottom:14, gap:12, flexDirection:"row", alignItems:"flex-start" },
  card:     { width:120, borderRadius:22, paddingBottom:14, alignItems:"center", overflow:"hidden", borderWidth:1.5, borderColor:"rgba(255,255,255,0.08)" },
  cardOn:   { borderColor:"rgba(129,140,248,0.50)", shadowColor:"#818CF8", shadowOpacity:0.35, shadowRadius:12, shadowOffset:{width:0,height:4}, elevation:6 },
  lottieWrap:{ width:90, height:80, overflow:"hidden", marginTop:8 },
  lottie:   { width:110, height:110, marginTop:-10, marginLeft:-10 },
  name:     { fontFamily:"Inter_700Bold", fontSize:13, marginTop:4 },
  badge:    { marginTop:5, paddingHorizontal:9, paddingVertical:3, borderRadius:20, borderWidth:1 },
  badgeTxt: { fontFamily:"Inter_600SemiBold", fontSize:10 },
});

// ── Bottom nav ─────────────────────────────────────────────────────────────────
function BottomNav({ navigation, active }) {
  const TABS = [
    { label:"Inicio",    iconOn:"home",            iconOff:"home-outline",           screen:"Home"     },
    { label:"Historial", iconOn:"clock-time-four", iconOff:"clock-time-four-outline",screen:"History"  },
    { label:"Ajustes",   iconOn:"cog",             iconOff:"cog-outline",            screen:"Settings" },
  ];
  return (
    <View style={nav.bar}>
      {TABS.map(tab => {
        const on = tab.screen === active;
        return (
          <TouchableOpacity key={tab.screen} style={nav.item} onPress={()=>!on&&navigation.navigate(tab.screen)} activeOpacity={0.7}>
            <View style={[nav.icon, on && nav.iconOn]}>
              <MaterialCommunityIcons name={on ? tab.iconOn : tab.iconOff} size={23} color={on ? "#818CF8" : C.muted}/>
            </View>
            <Text style={[nav.label, on && nav.labelOn]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const nav = StyleSheet.create({
  bar:    { flexDirection:"row", paddingTop:8, paddingBottom:4, paddingHorizontal:12, backgroundColor:"#0A0C22", borderTopWidth:1, borderTopColor:C.border },
  item:   { flex:1, alignItems:"center", gap:3 },
  icon:   { width:44, height:36, borderRadius:13, alignItems:"center", justifyContent:"center" },
  iconOn: { backgroundColor:"rgba(129,140,248,0.18)" },
  label:  { fontFamily:"Inter_400Regular", fontSize:10, color:C.muted },
  labelOn:{ fontFamily:"Inter_600SemiBold", fontSize:10, color:"#818CF8" },
});

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function HistoryScreen({ navigation }) {
  const { pet, history, clearHistory } = useApp();
  const [tab, setTab] = useState(0);
  const [selectedPet, setSelectedPet] = useState(null);
  const isPremium = false;

  // Todas las mascotas con historial (sin duplicados)
  const allPets = [...new Set(history.map(e => e.petName || pet?.name || "Mascota").filter(Boolean))];
  const activePet = selectedPet || pet?.name || allPets[0] || "Mascota";
  const petHistory = history.filter(e => (e.petName || pet?.name || "Mascota") === activePet);

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={["#06071A","#0C0E2E","#080C24"]} style={StyleSheet.absoluteFill}/>
      <LinearGradient colors={["#4F46E518","transparent","#7C3AED10"]} style={StyleSheet.absoluteFill} start={{x:1,y:0}} end={{x:0,y:1}}/>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <SafeAreaView style={{ flex:1 }} edges={["top"]}>

        <View style={sc.header}>
          <View>
            <Text style={sc.title}>Historial</Text>
            <Text style={sc.sub}>{activePet} · {petHistory.length} análisis</Text>
          </View>
          {petHistory.length > 0 && (
            <TouchableOpacity style={sc.iconBtn} activeOpacity={0.7} onPress={() => clearHistory(activePet)}>
              <MaterialCommunityIcons name="delete-outline" size={20} color={C.muted}/>
            </TouchableOpacity>
          )}
        </View>

        {/* Selector de mascota — tarjetas estilo onboarding */}
        {allPets.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pc.row}>
            {allPets.map(name => {
              const species = (history.find(e => (e.petName || pet?.name || "Mascota") === name)?.petSpecies) || "dog";
              const isDog = species !== "cat";
              const on = name === activePet;
              return (
                <TouchableOpacity key={name} onPress={() => setSelectedPet(name)} activeOpacity={0.85}>
                  <View style={[pc.card, on && pc.cardOn]}>
                    <LinearGradient
                      colors={isDog ? ["#2A1A0A","#3D2610"] : ["#1A0A2E","#2E1065"]}
                      start={{x:0,y:0}} end={{x:1,y:1}}
                      style={StyleSheet.absoluteFill}
                    />
                    {on && (
                      <LinearGradient
                        colors={isDog ? ["rgba(251,146,60,0.18)","transparent"] : ["rgba(167,139,250,0.18)","transparent"]}
                        start={{x:0,y:0}} end={{x:0,y:1}}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={pc.lottieWrap}>
                      <LottieView
                        source={isDog ? require("../../assets/lottie/dog.json") : require("../../assets/lottie/cat.json")}
                        autoPlay loop
                        style={pc.lottie}
                      />
                    </View>
                    <Text style={[pc.name, { color: on ? (isDog ? "#FB923C" : "#A78BFA") : C.text }]}>{name}</Text>
                    {on && (
                      <View style={[pc.badge, { backgroundColor: isDog ? "#FB923C22" : "#A78BFA22", borderColor: isDog ? "#FB923C66" : "#A78BFA66" }]}>
                        <Text style={[pc.badgeTxt, { color: isDog ? "#FB923C" : "#A78BFA" }]}>Activo</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <Tabs active={tab} onChange={setTab}/>
        <View style={{ flex:1 }}>
          {tab===0 ? <ChatTab history={petHistory}/> : <DiaryTab isPremium={isPremium}/>}
        </View>

      </SafeAreaView>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor:"#0A0C22" }}>
        <BottomNav navigation={navigation} active="History"/>
      </SafeAreaView>
    </View>
  );
}

const sc = StyleSheet.create({
  header:       { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:8, paddingBottom:12 },
  title:        { fontFamily:"Inter_700Bold", fontSize:26, color:C.text, letterSpacing:-0.6 },
  sub:          { fontFamily:"Inter_400Regular", fontSize:12, color:C.muted, marginTop:2 },
  iconBtn:      { width:40, height:40, borderRadius:12, backgroundColor:C.card, borderWidth:1, borderColor:C.border, alignItems:"center", justifyContent:"center" },
});
