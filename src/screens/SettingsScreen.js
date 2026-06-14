import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

const C = {
  bg:     "#06071A",
  card:   "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.09)",
  text:   "#F1F5F9",
  muted:  "#64748B",
  sub:    "#94A3B8",
  indigo: "#818CF8",
};

function Row({ icon, color, label, value, onPress, last }) {
  return (
    <TouchableOpacity
      style={[r.row, last && r.last]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[r.icon, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color}/>
      </View>
      <Text style={r.label}>{label}</Text>
      <View style={{ flex:1 }}/>
      {value ? <Text style={r.value}>{value}</Text> : null}
      {onPress ? <MaterialCommunityIcons name="chevron-right" size={17} color="rgba(255,255,255,0.2)"/> : null}
    </TouchableOpacity>
  );
}
const r = StyleSheet.create({
  row:   { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:14, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.05)" },
  last:  { borderBottomWidth:0 },
  icon:  { width:36, height:36, borderRadius:10, alignItems:"center", justifyContent:"center" },
  label: { fontFamily:"Inter_500Medium", fontSize:15, color:C.text },
  value: { fontFamily:"Inter_400Regular", fontSize:13, color:C.muted, marginRight:4 },
});

function Card({ title, children }) {
  return (
    <View style={card.wrap}>
      <Text style={card.title}>{title}</Text>
      <View style={card.body}>{children}</View>
    </View>
  );
}
const card = StyleSheet.create({
  wrap:  { marginHorizontal:20, marginBottom:14, backgroundColor:C.card, borderRadius:20, borderWidth:1, borderColor:C.border, overflow:"hidden" },
  title: { fontFamily:"Inter_600SemiBold", fontSize:11, color:C.muted, letterSpacing:0.8, textTransform:"uppercase", paddingHorizontal:16, paddingTop:14, paddingBottom:8 },
  body:  {},
});

function BottomNav({ navigation }) {
  const TABS = [
    { label:"Inicio",    icon:"home-outline",          iconOn:"home",             screen:"Home"     },
    { label:"Historial", icon:"clock-time-four-outline",iconOn:"clock-time-four",  screen:"History"  },
    { label:"Ajustes",   icon:"cog-outline",           iconOn:"cog",              screen:"Settings" },
  ];
  return (
    <View style={nav.bar}>
      {TABS.map(tab => {
        const on = tab.screen === "Settings";
        return (
          <TouchableOpacity key={tab.screen} style={nav.item} onPress={()=>!on&&navigation.navigate(tab.screen)} activeOpacity={0.7}>
            <View style={[nav.icon, on && nav.iconOn]}>
              <MaterialCommunityIcons name={on ? tab.iconOn : tab.icon} size={23} color={on?"#818CF8":C.muted}/>
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

export default function SettingsScreen({ navigation }) {
  const { pet, pets, switchPet, removePet } = useApp();

  const handleRemovePet = (p) => {
    Alert.alert(
      `Eliminar a ${p.name}`,
      "Se eliminará el perfil y todo su historial. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => removePet(p.name) },
      ]
    );
  };

  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <LinearGradient colors={["#06071A","#0C0E2E","#080C24"]} style={StyleSheet.absoluteFill}/>
      <LinearGradient colors={["#4F46E518","transparent","#7C3AED10"]} style={StyleSheet.absoluteFill} start={{x:1,y:0}} end={{x:0,y:1}}/>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <SafeAreaView style={{ flex:1 }} edges={["top"]}>

        <View style={sc.header}>
          <Text style={sc.title}>Ajustes</Text>
          <Text style={sc.sub}>{pet?.name||"Tu mascota"} · PetVoice AI</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:24 }}>

          {/* Selector de mascota activa */}
          <View style={{ marginHorizontal:20, marginBottom:16 }}>
            <Text style={{ fontFamily:"Inter_600SemiBold", fontSize:11, color:C.muted, letterSpacing:0.8, textTransform:"uppercase", marginBottom:10 }}>Mascota activa</Text>
            <View style={{ flexDirection:"row", gap:8, flexWrap:"wrap" }}>
              {pets.map(p => {
                const active = p.name === pet?.name;
                return (
                  <TouchableOpacity
                    key={p.name}
                    onPress={() => switchPet(p.name)}
                    onLongPress={() => handleRemovePet(p)}
                    activeOpacity={0.75}
                    style={{
                      flexDirection:"row", alignItems:"center", gap:7,
                      paddingHorizontal:14, paddingVertical:9, borderRadius:20,
                      backgroundColor: active ? "rgba(129,140,248,0.18)" : C.card,
                      borderWidth:1, borderColor: active ? "rgba(129,140,248,0.45)" : C.border,
                    }}
                  >
                    <MaterialCommunityIcons name="paw" size={13} color={active ? C.indigo : C.muted}/>
                    <Text style={{ fontFamily:"Inter_600SemiBold", fontSize:13, color: active ? C.indigo : C.text }}>{p.name}</Text>
                    {active && <MaterialCommunityIcons name="check-circle" size={13} color={C.indigo}/>}
                  </TouchableOpacity>
                );
              })}
              {/* Botón agregar mascota */}
              <TouchableOpacity
                onPress={() => navigation.navigate("Onboarding", { addMode: true })}
                activeOpacity={0.75}
                style={{
                  flexDirection:"row", alignItems:"center", gap:7,
                  paddingHorizontal:14, paddingVertical:9, borderRadius:20,
                  backgroundColor: C.card,
                  borderWidth:1, borderColor: C.border, borderStyle:"dashed",
                }}
              >
                <MaterialCommunityIcons name="plus" size={13} color={C.muted}/>
                <Text style={{ fontFamily:"Inter_600SemiBold", fontSize:13, color: C.muted }}>Agregar</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontFamily:"Inter_400Regular", fontSize:11, color:C.muted, marginTop:8, opacity:0.6 }}>
              Mantén presionado un chip para eliminar esa mascota
            </Text>
          </View>

          {/* Plan card */}
          <View style={sc.planWrap}>
            <LinearGradient colors={["#4F46E5","#7C3AED"]} start={{x:0,y:0}} end={{x:1,y:1}} style={sc.planCard}>
              <LinearGradient colors={["rgba(255,255,255,0.12)","transparent"]} style={StyleSheet.absoluteFill}/>
              <View>
                <Text style={sc.planBadge}>PLAN ACTIVO</Text>
                <Text style={sc.planName}>Gratuito</Text>
                <Text style={sc.planDesc}>5 análisis/día · Historial 7 días</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85}>
                <View style={sc.proBtn}>
                  <MaterialCommunityIcons name="star" size={13} color="#F4511E"/>
                  <Text style={sc.proBtnText}>Ver Pro</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <Card title="Mi mascota">
            <Row icon="paw"          color="#10B981" label="Nombre"  value={pet?.name||"—"} last={false}/>
            <Row icon="dog"          color="#818CF8" label="Especie" value={pet?.species==="cat"?"Gato":"Perro"} last={false}/>
            <Row icon="cake-variant" color="#FBBF24" label="Edad"    value={pet?.age?`${pet.age} años`:"—"} last/>
          </Card>

          <Card title="Preferencias">
            <Row icon="bell-outline"          color="#818CF8" label="Notificaciones"  onPress={()=>Alert.alert("Próximamente","Esta función estará disponible pronto.")} last={false}/>
            <Row icon="translate"             color="#60A5FA" label="Idioma"          value="Español" last={false}/>
            <Row icon="moon-waning-crescent"  color="#A78BFA" label="Tema"            value="Oscuro" last/>
          </Card>

          <Card title="Soporte">
            <Row icon="help-circle-outline"  color="#818CF8" label="Centro de ayuda"   onPress={()=>Alert.alert("Próximamente","Esta función estará disponible pronto.")} last={false}/>
            <Row icon="message-outline"      color="#FBBF24" label="Enviar comentario" onPress={()=>Alert.alert("Próximamente","Esta función estará disponible pronto.")} last={false}/>
            <Row icon="shield-check-outline" color="#10B981" label="Privacidad"        onPress={()=>Alert.alert("Próximamente","Esta función estará disponible pronto.")} last={false}/>
            <Row icon="information-outline"  color={C.muted} label="Versión"           value="1.0.0" last/>
          </Card>

        </ScrollView>
      </SafeAreaView>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor:"#0A0C22" }}>
        <BottomNav navigation={navigation}/>
      </SafeAreaView>
    </View>
  );
}

const sc = StyleSheet.create({
  header:   { paddingHorizontal:20, paddingTop:8, paddingBottom:20 },
  title:    { fontFamily:"Inter_700Bold", fontSize:26, color:C.text, letterSpacing:-0.6 },
  sub:      { fontFamily:"Inter_400Regular", fontSize:12, color:C.muted, marginTop:2 },
  planWrap: { marginHorizontal:20, marginBottom:16 },
  planCard: { borderRadius:22, padding:20, flexDirection:"row", alignItems:"center", justifyContent:"space-between", overflow:"hidden" },
  planBadge:{ fontFamily:"Inter_600SemiBold", fontSize:10, color:"rgba(255,255,255,0.55)", letterSpacing:0.8, marginBottom:4 },
  planName: { fontFamily:"Inter_700Bold", fontSize:22, color:"#fff" },
  planDesc: { fontFamily:"Inter_400Regular", fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:4 },
  proBtn:   { backgroundColor:"#fff", borderRadius:20, paddingHorizontal:14, paddingVertical:8, flexDirection:"row", alignItems:"center", gap:5 },
  proBtnText:{ fontFamily:"Inter_700Bold", fontSize:13, color:"#F4511E" },
});
