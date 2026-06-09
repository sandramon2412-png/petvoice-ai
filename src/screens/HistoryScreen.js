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

const EMO = {
  Feliz:      { color: "#10B981", light: "#ECFDF5", icon: "emoticon-excited-outline" },
  "Juguetón": { color: "#3B82F6", light: "#EFF6FF", icon: "tennis-ball"              },
  Alerta:     { color: "#D97706", light: "#FFFBEB", icon: "bell-ring-outline"        },
  Curioso:    { color: "#6366F1", light: "#EEF2FF", icon: "eye-outline"              },
  Estresado:  { color: "#EF4444", light: "#FEF2F2", icon: "lightning-bolt"           },
  Asustado:   { color: "#7C3AED", light: "#F5F3FF", icon: "ghost-outline"            },
  Tranquilo:  { color: "#64748B", light: "#F8FAFC", icon: "weather-night"            },
  Hambriento: { color: "#F97316", light: "#FFF7ED", icon: "food-drumstick-outline"   },
};

const CHAT = [
  { id:"1",  ts:"09:14", day:"Hoy",    emotion:"Feliz",      text:"¡Estoy tan contento de verte! Eres mi persona favorita en el mundo." },
  { id:"2",  ts:"09:14", day:"Hoy",    owner:true,           text:"¡Hola campeón! ¿Cómo amaneciste hoy?" },
  { id:"3",  ts:"12:05", day:"Hoy",    emotion:"Hambriento", text:"Ya es hora de comer. Mi estómago lleva un rato protestando." },
  { id:"4",  ts:"15:30", day:"Hoy",    emotion:"Juguetón",   text:"¡Quiero jugar! Ven, persígueme, será muy divertido." },
  { id:"5",  ts:"18:47", day:"Hoy",    emotion:"Tranquilo",  text:"Estoy muy relajado y a gusto. Este momento es perfecto." },
  { id:"6",  ts:"10:20", day:"Ayer",   emotion:"Alerta",     text:"Hay algo ahí afuera. No sé si es peligroso pero lo estoy vigilando." },
  { id:"7",  ts:"10:20", day:"Ayer",   owner:true,           text:"Tranquilo, es solo el cartero." },
  { id:"8",  ts:"14:55", day:"Ayer",   emotion:"Curioso",    text:"¿Qué es eso? Nunca lo había visto. Quiero investigarlo." },
  { id:"9",  ts:"20:10", day:"Ayer",   emotion:"Estresado",  text:"Me siento incómodo y necesito tu ayuda. Por favor quédate cerca." },
  { id:"10", ts:"11:30", day:"Martes", emotion:"Feliz",      text:"¡Estoy tan contento de verte! Eres mi persona favorita." },
  { id:"11", ts:"16:00", day:"Martes", emotion:"Asustado",   text:"Tengo miedo. Ese ruido me asusta mucho, necesito que me protejas." },
];

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
  { icon:"emoticon-happy-outline",   color:"#10B981", label:"Emoción predominante",       value:"Feliz · 72% de los análisis" },
  { icon:"lightning-bolt-outline",   color:"#EF4444", label:"Picos de estrés",             value:"Martes y Jueves por la tarde" },
  { icon:"chart-line-variant",       color:"#6366F1", label:"Análisis esta semana",        value:"18 análisis en 4 días" },
  { icon:"weather-sunny",            color:"#F59E0B", label:"Día más feliz",               value:"Miércoles · 100% bienestar" },
];

// ── Tabs ──────────────────────────────────────────────────────────────────────
function Tabs({ active, onChange }) {
  return (
    <View style={t.wrap}>
      {["Conversaciones","Diario de Ánimo"].map((label, i) => (
        <TouchableOpacity key={i} style={[t.tab, active===i && t.tabOn]} onPress={()=>onChange(i)} activeOpacity={0.8}>
          <Text style={[t.label, active===i && t.labelOn]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const t = StyleSheet.create({
  wrap:    { flexDirection:"row", backgroundColor:"#EEF2FF", borderRadius:16, padding:4, marginHorizontal:20, marginBottom:16 },
  tab:     { flex:1, paddingVertical:10, borderRadius:13, alignItems:"center" },
  tabOn:   { backgroundColor:"#fff", shadowColor:"#6366F1", shadowOpacity:0.12, shadowRadius:8, shadowOffset:{width:0,height:2}, elevation:3 },
  label:   { fontFamily:"Inter_600SemiBold", fontSize:13, color:"#94A3B8" },
  labelOn: { color:"#4F46E5" },
});

// ── Day label ─────────────────────────────────────────────────────────────────
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
  line: { flex:1, height:1, backgroundColor:"#E2E8F0" },
  text: { fontFamily:"Inter_600SemiBold", fontSize:11, color:"#94A3B8", marginHorizontal:14, letterSpacing:0.8 },
});

// ── Bubble ────────────────────────────────────────────────────────────────────
function Bubble({ item }) {
  const m = EMO[item.emotion] || EMO.Tranquilo;

  if (item.owner) return (
    <View style={b.right}>
      <View style={b.ownerBubble}>
        <Text style={b.ownerText}>{item.text}</Text>
        <Text style={b.ownerTime}>{item.ts}</Text>
      </View>
    </View>
  );

  return (
    <View style={b.left}>
      <View style={[b.dot, { backgroundColor: m.color }]}>
        <MaterialCommunityIcons name={m.icon} size={15} color="#fff" />
      </View>
      <View style={{ maxWidth: W * 0.67 }}>
        <View style={[b.petBubble, { backgroundColor: m.light }]}>
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
  dot:   { width:34, height:34, borderRadius:17, alignItems:"center", justifyContent:"center", flexShrink:0, marginBottom:4 },
  petBubble:  { borderRadius:20, borderTopLeftRadius:6, paddingHorizontal:14, paddingTop:10, paddingBottom:10, gap:4 },
  ownerBubble:{ backgroundColor:"#4F46E5", borderRadius:20, borderTopRightRadius:6, paddingHorizontal:14, paddingTop:10, paddingBottom:10, gap:4, maxWidth:W*0.67 },
  tag:      { fontFamily:"Inter_700Bold", fontSize:11, letterSpacing:0.2 },
  petText:  { fontFamily:"Inter_400Regular", fontSize:14, color:"#1E293B", lineHeight:20 },
  ownerText:{ fontFamily:"Inter_400Regular", fontSize:14, color:"#fff", lineHeight:20 },
  petTime:  { fontFamily:"Inter_400Regular", fontSize:10, color:"#94A3B8", alignSelf:"flex-end" },
  ownerTime:{ fontFamily:"Inter_400Regular", fontSize:10, color:"rgba(255,255,255,0.5)", alignSelf:"flex-end" },
});

// ── Chat tab ──────────────────────────────────────────────────────────────────
function ChatTab() {
  const rows = [];
  let last = null;
  CHAT.forEach(item => {
    if (item.day !== last) { rows.push({ type:"day", id:"d"+item.day, label:item.day }); last=item.day; }
    rows.push({ type:"bubble", ...item });
  });
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
  const colors = item.mood==="good" ? ["#059669","#6EE7B7"] : item.mood==="warn" ? ["#D97706","#FCD34D"] : ["#DC2626","#FCA5A5"];
  return (
    <View style={bar.col}>
      <View style={bar.track}>
        <Animated.View style={[bar.fill,{height:h,overflow:"hidden"}]}>
          <LinearGradient colors={[colors[1],colors[0]]} style={StyleSheet.absoluteFill}/>
        </Animated.View>
      </View>
      <View style={[bar.dayPill, item.today && bar.dayPillToday]}>
        <Text style={[bar.dayText, item.today && bar.dayTextToday]}>{item.day}</Text>
      </View>
    </View>
  );
}
const bar = StyleSheet.create({
  col:         { flex:1, alignItems:"center", gap:8 },
  track:       { width:28, height:100, backgroundColor:"#F1F5F9", borderRadius:14, overflow:"hidden", justifyContent:"flex-end" },
  fill:        { width:"100%", borderRadius:14 },
  dayPill:     { width:28, height:28, borderRadius:9, alignItems:"center", justifyContent:"center" },
  dayPillToday:{ backgroundColor:"#4F46E5" },
  dayText:     { fontFamily:"Inter_600SemiBold", fontSize:11, color:"#94A3B8" },
  dayTextToday:{ color:"#fff" },
});

// ── Metric card ───────────────────────────────────────────────────────────────
function Metric({ item }) {
  return (
    <View style={mc.card}>
      <LinearGradient colors={[item.color+"22", item.color+"08"]} style={mc.iconBg}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.color}/>
      </LinearGradient>
      <View style={{ flex:1 }}>
        <Text style={mc.label}>{item.label}</Text>
        <Text style={mc.value}>{item.value}</Text>
      </View>
    </View>
  );
}
const mc = StyleSheet.create({
  card:  { flexDirection:"row", alignItems:"center", gap:14, paddingVertical:14, borderBottomWidth:1, borderBottomColor:"#F1F5F9" },
  iconBg:{ width:44, height:44, borderRadius:14, alignItems:"center", justifyContent:"center" },
  label: { fontFamily:"Inter_400Regular", fontSize:11, color:"#94A3B8", marginBottom:3 },
  value: { fontFamily:"Inter_700Bold", fontSize:14, color:"#1E293B" },
});

// ── Diary tab ─────────────────────────────────────────────────────────────────
function DiaryTab({ isPremium }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:28 }}>

      {/* Chart card */}
      <View style={dr.card}>
        <View style={dr.cardHeader}>
          <Text style={dr.cardTitle}>Bienestar semanal</Text>
          <View style={dr.pill}><Text style={dr.pillText}>Últimos 7 días</Text></View>
        </View>

        <View style={[dr.chartArea, !isPremium && {opacity:0.3}]}>
          <View style={dr.bars}>
            {WEEK.map(item => <Bar key={item.day} item={item}/>)}
          </View>
          <View style={dr.legend}>
            {[["#059669","Bienestar"],["#D97706","Alerta"],["#DC2626","Estrés"]].map(([c,l])=>(
              <View key={l} style={dr.legendItem}>
                <View style={[dr.legendDot,{backgroundColor:c}]}/>
                <Text style={dr.legendText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {!isPremium && (
          <View style={dr.lockRow}>
            <View style={dr.lockIcon}>
              <MaterialCommunityIcons name="lock-outline" size={16} color="#4F46E5"/>
            </View>
            <Text style={dr.lockText}>Gráfica completa disponible en Premium</Text>
          </View>
        )}
      </View>

      {/* Paywall CTA */}
      {!isPremium && (
        <TouchableOpacity activeOpacity={0.88} style={dr.cta}>
          <LinearGradient colors={["#FF8A65","#F4511E"]} start={{x:0,y:0}} end={{x:1,y:0}} style={dr.ctaGrad}>
            <MaterialCommunityIcons name="star" size={18} color="#fff"/>
            <View>
              <Text style={dr.ctaTitle}>Desbloquear Reporte Premium</Text>
              <Text style={dr.ctaSub}>Análisis completo · Sin límites diarios</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)"/>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Metrics */}
      <View style={[dr.card, !isPremium && {opacity:0.45}]}>
        <Text style={dr.cardTitle}>Métricas de la semana</Text>
        {METRICS.map((m,i) => <Metric key={i} item={m}/>)}
      </View>

    </ScrollView>
  );
}
const dr = StyleSheet.create({
  card: {
    backgroundColor:"#fff", borderRadius:24, padding:20,
    marginHorizontal:20, marginBottom:16,
    shadowColor:"#000", shadowOpacity:0.05, shadowRadius:14, shadowOffset:{width:0,height:4}, elevation:3,
  },
  cardHeader: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:20 },
  cardTitle:  { fontFamily:"Inter_700Bold", fontSize:16, color:"#1E293B" },
  pill:       { backgroundColor:"#EEF2FF", borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  pillText:   { fontFamily:"Inter_600SemiBold", fontSize:11, color:"#4F46E5" },
  chartArea:  { gap:16 },
  bars:       { flexDirection:"row", gap:6, alignItems:"flex-end" },
  legend:     { flexDirection:"row", gap:16, marginTop:4 },
  legendItem: { flexDirection:"row", alignItems:"center", gap:5 },
  legendDot:  { width:7, height:7, borderRadius:4 },
  legendText: { fontFamily:"Inter_400Regular", fontSize:11, color:"#64748B" },
  lockRow:    { flexDirection:"row", alignItems:"center", gap:8, marginTop:16, paddingTop:14, borderTopWidth:1, borderTopColor:"#F1F5F9" },
  lockIcon:   { width:28, height:28, borderRadius:9, backgroundColor:"#EEF2FF", alignItems:"center", justifyContent:"center" },
  lockText:   { fontFamily:"Inter_400Regular", fontSize:12, color:"#94A3B8", flex:1 },
  cta: { marginHorizontal:20, borderRadius:20, overflow:"hidden", marginBottom:16, shadowColor:"#F4511E", shadowOpacity:0.3, shadowRadius:12, shadowOffset:{width:0,height:4}, elevation:5 },
  ctaGrad: { flexDirection:"row", alignItems:"center", gap:14, padding:18 },
  ctaTitle: { fontFamily:"Inter_700Bold", fontSize:14, color:"#fff" },
  ctaSub:   { fontFamily:"Inter_400Regular", fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:1 },
});

// ── Bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ navigation, active }) {
  const TABS = [
    { label:"Inicio",    icon:"home-variant-outline", screen:"Home"     },
    { label:"Historial", icon:"history",               screen:"History"  },
    { label:"Ajustes",   icon:"tune-variant",          screen:"Settings" },
  ];
  return (
    <View style={nav.bar}>
      {TABS.map(tab => {
        const on = tab.screen === active;
        return (
          <TouchableOpacity key={tab.screen} style={nav.item} onPress={()=>!on&&navigation.navigate(tab.screen)} activeOpacity={0.7}>
            <View style={[nav.icon, on && nav.iconOn]}>
              <MaterialCommunityIcons name={tab.icon} size={23} color={on?"#4F46E5":"#94A3B8"}/>
            </View>
            <Text style={[nav.label, on && nav.labelOn]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const nav = StyleSheet.create({
  bar:    { flexDirection:"row", paddingTop:8, paddingBottom:4, paddingHorizontal:12, backgroundColor:"#fff", borderTopWidth:1, borderTopColor:"#F1F5F9" },
  item:   { flex:1, alignItems:"center", gap:3 },
  icon:   { width:42, height:34, borderRadius:13, alignItems:"center", justifyContent:"center" },
  iconOn: { backgroundColor:"#EEF2FF" },
  label:  { fontFamily:"Inter_400Regular", fontSize:10, color:"#94A3B8" },
  labelOn:{ fontFamily:"Inter_600SemiBold", fontSize:10, color:"#4F46E5" },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function HistoryScreen({ navigation }) {
  const { pet } = useApp();
  const [tab, setTab] = useState(0);
  const isPremium = false;

  return (
    <View style={{ flex:1, backgroundColor:"#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC"/>
      <SafeAreaView style={{ flex:1 }} edges={["top"]}>

        <View style={sc.header}>
          <View>
            <Text style={sc.title}>Historial</Text>
            <Text style={sc.sub}>{pet?.name||"Tu mascota"} · PetVoice AI</Text>
          </View>
          <TouchableOpacity style={sc.searchBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="magnify" size={20} color="#64748B"/>
          </TouchableOpacity>
        </View>

        <Tabs active={tab} onChange={setTab}/>

        <View style={{ flex:1 }}>
          {tab===0 ? <ChatTab/> : <DiaryTab isPremium={isPremium}/>}
        </View>

      </SafeAreaView>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor:"#fff" }}>
        <BottomNav navigation={navigation} active="History"/>
      </SafeAreaView>
    </View>
  );
}

const sc = StyleSheet.create({
  header:    { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop:8, paddingBottom:16 },
  title:     { fontFamily:"Inter_700Bold", fontSize:26, color:"#1E293B", letterSpacing:-0.6 },
  sub:       { fontFamily:"Inter_400Regular", fontSize:12, color:"#94A3B8", marginTop:2 },
  searchBtn: { width:40, height:40, borderRadius:12, backgroundColor:"#fff", borderWidth:1, borderColor:"#E2E8F0", alignItems:"center", justifyContent:"center" },
});
