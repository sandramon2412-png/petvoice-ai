import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

const { width: W } = Dimensions.get("window");

// Colores oscuros del sistema
const C = {
  bg:      "#06071A",
  card:    "rgba(255,255,255,0.06)",
  border:  "rgba(255,255,255,0.09)",
  text:    "#F1F5F9",
  muted:   "#64748B",
  sub:     "#94A3B8",
  indigo:  "#818CF8",
  violet:  "#A78BFA",
};

const EMO = {
  Feliz:      { color: "#10B981", bg: "rgba(16,185,129,0.15)",  icon: "emoticon-excited-outline" },
  "Juguetón": { color: "#60A5FA", bg: "rgba(96,165,250,0.15)",  icon: "tennis-ball"              },
  Alerta:     { color: "#FBBF24", bg: "rgba(251,191,36,0.15)",  icon: "bell-ring-outline"        },
  Curioso:    { color: "#818CF8", bg: "rgba(129,140,248,0.15)", icon: "eye-outline"              },
  Estresado:  { color: "#F87171", bg: "rgba(248,113,113,0.15)", icon: "lightning-bolt"           },
  Asustado:   { color: "#C084FC", bg: "rgba(192,132,252,0.15)", icon: "ghost-outline"            },
  Tranquilo:  { color: "#94A3B8", bg: "rgba(148,163,184,0.12)", icon: "weather-night"            },
  Hambriento: { color: "#FB923C", bg: "rgba(251,146,60,0.15)",  icon: "food-drumstick-outline"   },
};

// No more mock data — uses real history from context

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
  { icon:"emoticon-happy-outline", color:"#10B981", label:"Emoción predominante",   value:"Feliz · 72% de los análisis" },
  { icon:"lightning-bolt-outline", color:"#F87171", label:"Picos de estrés",         value:"Martes y Jueves por la tarde" },
  { icon:"chart-line-variant",     color:"#818CF8", label:"Análisis esta semana",    value:"18 análisis en 4 días" },
  { icon:"weather-sunny",          color:"#FBBF24", label:"Día más feliz",           value:"Miércoles · 100% bienestar" },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────
function Tabs({ active, onChange }) {
  return (
    <View style={tb.wrap}>
      {[
        { label:"Conversaciones",  icon: active===0 ? "chat-processing" : "chat-processing-outline" },
        { label:"Diario de Ánimo", icon: active===1 ? "chart-bell-curve" : "chart-bell-curve-cumulative" },
      ].map((tab, i) => (
        <TouchableOpacity key={i} style={[tb.tab, active===i && tb.tabOn]} onPress={() => onChange(i)} activeOpacity={0.8}>
          <MaterialCommunityIcons name={tab.icon} size={15} color={active===i ? "#818CF8" : C.muted}/>
          <Text style={[tb.label, active===i && tb.labelOn]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const tb = StyleSheet.create({
  wrap:    { flexDirection:"row", backgroundColor:"rgba(255,255,255,0.05)", borderRadius:16, padding:4, marginHorizontal:20, marginBottom:16, borderWidth:1, borderColor:C.border },
  tab:     { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, paddingVertical:10, borderRadius:13 },
  tabOn:   { backgroundColor:"rgba(129,140,248,0.18)" },
  label:   { fontFamily:"Inter_600SemiBold", fontSize:13, color:C.muted },
  labelOn: { color:"#818CF8" },
});

// ── Day separator ─────────────────────────────────────────────────────────────
function Day({ label }) {
  return (
    <View style={dy.row}>
      <View style={dy.line}/>
      <Text style={dy.text}>{label}</Text>
      <View style={dy.line}/>
    </View>
  );
}
const dy = StyleSheet.create({
  row:  { flexDirection:"row", alignItems:"center", marginVertical:20, paddingHorizontal:24 },
  line: { flex:1, height:1, backgroundColor:"rgba(255,255,255,0.07)" },
  text: { fontFamily:"Inter_600SemiBold", fontSize:11, color:C.muted, marginHorizontal:14, letterSpacing:0.8 },
});

// ── Chat bubble ───────────────────────────────────────────────────────────────
function Bubble({ item }) {
  const m = EMO[item.emotion] || EMO.Tranquilo;

  if (item.owner) return (
    <View style={b.right}>
      <View style={b.ownerOuter}>
        <LinearGradient colors={["#6366F1","#4F46E5"]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill}/>
        {/* glass shine */}
        <LinearGradient colors={["rgba(255,255,255,0.22)","transparent"]} style={b.shine}/>
        <Text style={b.ownerText}>{item.text}</Text>
        <Text style={b.ownerTime}>{item.ts}</Text>
      </View>
    </View>
  );

  return (
    <View style={b.left}>
      <View style={[b.avatar, { backgroundColor: m.bg }]}>
        <MaterialCommunityIcons name={m.icon} size={16} color={m.color} />
      </View>
      <View style={{ maxWidth: W * 0.67 }}>
        {/* glass pet bubble */}
        <View style={[b.petOuter, { borderColor: m.color + "40" }]}>
          <LinearGradient
            colors={[m.color + "28", m.color + "0A"]}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient colors={["rgba(255,255,255,0.10)","transparent"]} style={b.shine}/>
          <Text style={[b.tag, { color: m.color }]}>{item.emotion}</Text>
          <Text style={b.petText}>{item.text}</Text>
          <Text style={b.petTime}>{item.ts}</Text>
        </View>
      </View>
    </View>
  );
}
const b = StyleSheet.create({
  left:  { flexDirection:"row", alignItems:"flex-end", gap:10, marginBottom:14, paddingHorizontal:20 },
  right: { alignItems:"flex-end", marginBottom:14, paddingHorizontal:20 },
  avatar:{ width:34, height:34, borderRadius:17, alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:4 },
  petOuter: {
    borderRadius:20, borderTopLeftRadius:5, borderWidth:1,
    paddingHorizontal:14, paddingVertical:11, gap:5, overflow:"hidden",
  },
  ownerOuter:{
    borderRadius:20, borderTopRightRadius:5, overflow:"hidden",
    paddingHorizontal:14, paddingVertical:11, gap:4, maxWidth:W*0.67,
    borderWidth:1, borderColor:"rgba(255,255,255,0.18)",
  },
  shine: { position:"absolute", top:0, left:0, right:0, height:"55%", borderRadius:20 },
  tag:      { fontFamily:"Inter_700Bold", fontSize:11, letterSpacing:0.2 },
  petText:  { fontFamily:"Inter_400Regular", fontSize:14, color:C.text, lineHeight:20 },
  ownerText:{ fontFamily:"Inter_400Regular", fontSize:14, color:"#fff", lineHeight:20 },
  petTime:  { fontFamily:"Inter_400Regular", fontSize:10, color:C.muted, alignSelf:"flex-end" },
  ownerTime:{ fontFamily:"Inter_400Regular", fontSize:10, color:"rgba(255,255,255,0.4)", alignSelf:"flex-end" },
});

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyChat() {
  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", paddingHorizontal:40, gap:12 }}>
      <View style={{ width:64, height:64, borderRadius:20, backgroundColor:"rgba(129,140,248,0.12)", alignItems:"center", justifyContent:"center" }}>
        <MaterialCommunityIcons name="chat-processing-outline" size={30} color="#818CF8"/>
      </View>
      <Text style={{ fontFamily:"Inter_700Bold", fontSize:17, color:C.text, textAlign:"center" }}>Sin análisis aún</Text>
      <Text style={{ fontFamily:"Inter_400Regular", fontSize:13, color:C.muted, textAlign:"center", lineHeight:19 }}>
        Graba el sonido de tu mascota en Inicio y aquí aparecerá la traducción.
      </Text>
    </View>
  );
}

// ── Chat tab ──────────────────────────────────────────────────────────────────
function ChatTab({ history }) {
  const rows = [];
  let last = null;
  history.forEach(item => {
    if (item.day !== last) { rows.push({ type:"day", id:"d"+item.day+item.id, label:item.day }); last=item.day; }
    rows.push({ type:"bubble", ...item });
  });

  if (history.length === 0) return <EmptyChat/>;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop:4, paddingBottom:24 }}>
      {rows.map(r => r.type==="day" ? <Day key={r.id} label={r.label}/> : <Bubble key={r.id} item={r}/>)}
    </ScrollView>
  );
}

// ── Column bar ────────────────────────────────────────────────────────────────
function Bar({ item }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue:item.pct/100, duration:900, delay:100, useNativeDriver:false }).start();
  }, []);
  const h = anim.interpolate({ inputRange:[0,1], outputRange:["0%","100%"] });
  const colors = item.mood==="good" ? ["#059669","#34D399"] : ["#DC2626","#F87171"];
  return (
    <View style={bar.col}>
      <View style={bar.track}>
        <Animated.View style={[bar.fill,{height:h,overflow:"hidden"}]}>
          <LinearGradient colors={[colors[1],colors[0]]} style={StyleSheet.absoluteFill}/>
        </Animated.View>
      </View>
      <View style={[bar.pill, item.today && bar.pillToday]}>
        <Text style={[bar.dayTxt, item.today && bar.dayTxtToday]}>{item.day}</Text>
      </View>
    </View>
  );
}
const bar = StyleSheet.create({
  col:         { flex:1, alignItems:"center", gap:8 },
  track:       { width:26, height:96, backgroundColor:"rgba(255,255,255,0.07)", borderRadius:13, overflow:"hidden", justifyContent:"flex-end" },
  fill:        { width:"100%", borderRadius:13 },
  pill:        { width:26, height:26, borderRadius:8, alignItems:"center", justifyContent:"center" },
  pillToday:   { backgroundColor:"#4F46E5" },
  dayTxt:      { fontFamily:"Inter_600SemiBold", fontSize:11, color:C.muted },
  dayTxtToday: { color:"#fff" },
});

// ── Metric row ────────────────────────────────────────────────────────────────
function Metric({ item, last }) {
  return (
    <View style={[mc.row, last && mc.rowLast]}>
      <View style={[mc.icon, { backgroundColor: item.color+"20" }]}>
        <MaterialCommunityIcons name={item.icon} size={19} color={item.color}/>
      </View>
      <View style={{ flex:1 }}>
        <Text style={mc.label}>{item.label}</Text>
        <Text style={mc.value}>{item.value}</Text>
      </View>
    </View>
  );
}
const mc = StyleSheet.create({
  row:     { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:13, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.06)" },
  rowLast: { borderBottomWidth:0 },
  icon:    { width:40, height:40, borderRadius:12, alignItems:"center", justifyContent:"center" },
  label:   { fontFamily:"Inter_400Regular", fontSize:11, color:C.muted, marginBottom:3 },
  value:   { fontFamily:"Inter_700Bold", fontSize:14, color:C.text },
});

// ── Diary tab ─────────────────────────────────────────────────────────────────
function DiaryTab({ isPremium }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:28 }}>

      {/* Chart card */}
      <View style={dr.card}>
        <View style={dr.cardHead}>
          <Text style={dr.cardTitle}>Bienestar semanal</Text>
          <View style={dr.badge}><Text style={dr.badgeTxt}>7 días</Text></View>
        </View>
        <View style={[!isPremium && { opacity:0.28 }]}>
          <View style={dr.bars}>{WEEK.map(w=><Bar key={w.day} item={w}/>)}</View>
          <View style={dr.legend}>
            {[["#34D399","Bienestar"],["#F87171","Estrés"]].map(([c,l])=>(
              <View key={l} style={dr.legItem}>
                <View style={[dr.legDot,{backgroundColor:c}]}/>
                <Text style={dr.legText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
        {!isPremium && (
          <View style={dr.lockRow}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={C.indigo}/>
            <Text style={dr.lockTxt}>Gráfica completa disponible en Premium</Text>
          </View>
        )}
      </View>

      {/* Paywall CTA */}
      {!isPremium && (
        <TouchableOpacity activeOpacity={0.88} style={dr.ctaWrap}>
          <LinearGradient colors={["#FF8A65","#F4511E"]} start={{x:0,y:0}} end={{x:1,y:0}} style={dr.cta}>
            <LinearGradient colors={["rgba(255,255,255,0.18)","transparent"]} style={StyleSheet.absoluteFill}/>
            <MaterialCommunityIcons name="star" size={20} color="#fff"/>
            <View style={{ flex:1 }}>
              <Text style={dr.ctaTitle}>Desbloquear Reporte Premium</Text>
              <Text style={dr.ctaSub}>Análisis completo · Sin límites diarios</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.6)"/>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Metrics */}
      <View style={[dr.card, !isPremium && { opacity:0.4 }]}>
        <View style={dr.cardHead}>
          <Text style={dr.cardTitle}>Métricas de la semana</Text>
        </View>
        {METRICS.map((m,i) => <Metric key={i} item={m} last={i===METRICS.length-1}/>)}
      </View>

    </ScrollView>
  );
}
const dr = StyleSheet.create({
  card: {
    backgroundColor:C.card, borderRadius:22, padding:18,
    marginHorizontal:20, marginBottom:14,
    borderWidth:1, borderColor:C.border,
  },
  cardHead: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:18 },
  cardTitle:{ fontFamily:"Inter_700Bold", fontSize:16, color:C.text },
  badge:    { backgroundColor:"rgba(129,140,248,0.2)", borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  badgeTxt: { fontFamily:"Inter_600SemiBold", fontSize:11, color:C.indigo },
  bars:     { flexDirection:"row", gap:4, alignItems:"flex-end", marginBottom:14 },
  legend:   { flexDirection:"row", gap:16 },
  legItem:  { flexDirection:"row", alignItems:"center", gap:5 },
  legDot:   { width:7, height:7, borderRadius:4 },
  legText:  { fontFamily:"Inter_400Regular", fontSize:11, color:C.muted },
  lockRow:  { flexDirection:"row", alignItems:"center", gap:7, marginTop:14, paddingTop:12, borderTopWidth:1, borderTopColor:C.border },
  lockTxt:  { fontFamily:"Inter_400Regular", fontSize:12, color:C.muted },
  ctaWrap:  { marginHorizontal:20, marginBottom:14, borderRadius:18, overflow:"hidden", shadowColor:"#F4511E", shadowOpacity:0.35, shadowRadius:12, shadowOffset:{width:0,height:4}, elevation:6 },
  cta:      { flexDirection:"row", alignItems:"center", gap:14, padding:18, overflow:"hidden" },
  ctaTitle: { fontFamily:"Inter_700Bold", fontSize:14, color:"#fff" },
  ctaSub:   { fontFamily:"Inter_400Regular", fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:2 },
});

// ── Bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ navigation, active }) {
  const TABS = [
    { label:"Inicio",    icon:"home-outline",          screen:"Home"     },
    { label:"Historial", icon:"clock-time-four-outline",screen:"History"  },
    { label:"Ajustes",   icon:"cog-outline",           screen:"Settings" },
  ];
  return (
    <View style={nav.bar}>
      {TABS.map(tab => {
        const on = tab.screen === active;
        return (
          <TouchableOpacity key={tab.screen} style={nav.item} onPress={()=>!on&&navigation.navigate(tab.screen)} activeOpacity={0.7}>
            <View style={[nav.icon, on && nav.iconOn]}>
              <MaterialCommunityIcons name={tab.icon} size={23} color={on ? "#818CF8" : C.muted}/>
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
  icon:   { width:42, height:34, borderRadius:13, alignItems:"center", justifyContent:"center" },
  iconOn: { backgroundColor:"rgba(129,140,248,0.15)" },
  label:  { fontFamily:"Inter_400Regular", fontSize:10, color:C.muted },
  labelOn:{ fontFamily:"Inter_600SemiBold", fontSize:10, color:"#818CF8" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HistoryScreen({ navigation }) {
  const { pet, history, clearHistory } = useApp();
  const [tab, setTab] = useState(0);
  const isPremium = false;

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={["#06071A","#0C0E2E","#080C24"]} style={StyleSheet.absoluteFill}/>
      <LinearGradient colors={["#4F46E518","transparent","#7C3AED10"]} style={StyleSheet.absoluteFill} start={{x:1,y:0}} end={{x:0,y:1}}/>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <SafeAreaView style={{ flex:1 }} edges={["top"]}>

        {/* Header */}
        <View style={sc.header}>
          <View>
            <Text style={sc.title}>Historial</Text>
            <Text style={sc.sub}>
              {pet?.name||"Tu mascota"} · {history.length} {history.length===1?"análisis":"análisis"}
            </Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity style={sc.clearBtn} activeOpacity={0.7} onPress={clearHistory}>
              <MaterialCommunityIcons name="delete-outline" size={18} color={C.muted}/>
            </TouchableOpacity>
          )}
        </View>

        <Tabs active={tab} onChange={setTab}/>

        <View style={{ flex:1 }}>
          {tab===0 ? <ChatTab history={history}/> : <DiaryTab isPremium={isPremium}/>}
        </View>

      </SafeAreaView>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor:"#0A0C22" }}>
        <BottomNav navigation={navigation} active="History"/>
      </SafeAreaView>
    </View>
  );
}

const sc = StyleSheet.create({
  header:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:8, paddingBottom:16 },
  title:     { fontFamily:"Inter_700Bold", fontSize:26, color:C.text, letterSpacing:-0.6 },
  sub:       { fontFamily:"Inter_400Regular", fontSize:12, color:C.muted, marginTop:2 },
  clearBtn:  { width:40, height:40, borderRadius:12, backgroundColor:C.card, borderWidth:1, borderColor:C.border, alignItems:"center", justifyContent:"center" },
});
