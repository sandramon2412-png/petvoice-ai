import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

function Row({ icon, color, label, value, onPress, last }) {
  return (
    <TouchableOpacity
      style={[r.row, last && r.rowLast]}
      onPress={onPress || undefined}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[r.iconBox, { backgroundColor: color + "15" }]}>
        <MaterialCommunityIcons name={icon} size={19} color={color} />
      </View>
      <Text style={r.label}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value ? <Text style={r.value}>{value}</Text> : null}
      {onPress ? <MaterialCommunityIcons name="chevron-right" size={17} color="#CBD5E1" /> : null}
    </TouchableOpacity>
  );
}
const r = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC",
  },
  rowLast: { borderBottomWidth: 0 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label:   { fontFamily: "Inter_500Medium", fontSize: 15, color: "#1E293B" },
  value:   { fontFamily: "Inter_400Regular", fontSize: 13, color: "#94A3B8", marginRight: 4 },
});

function Card({ title, children }) {
  return (
    <View style={c.card}>
      <Text style={c.title}>{title}</Text>
      <View style={c.body}>{children}</View>
    </View>
  );
}
const c = StyleSheet.create({
  card:  { marginHorizontal: 20, marginBottom: 16, backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  body:  {},
});

function BottomNav({ navigation }) {
  const TABS = [
    { label: "Inicio",    icon: "home-variant-outline", screen: "Home"     },
    { label: "Historial", icon: "history",               screen: "History"  },
    { label: "Ajustes",   icon: "tune-variant",          screen: "Settings" },
  ];
  return (
    <View style={nav.bar}>
      {TABS.map(tab => {
        const on = tab.screen === "Settings";
        return (
          <TouchableOpacity key={tab.screen} style={nav.item} onPress={() => !on && navigation.navigate(tab.screen)} activeOpacity={0.7}>
            <View style={[nav.icon, on && nav.iconOn]}>
              <MaterialCommunityIcons name={tab.icon} size={23} color={on ? "#4F46E5" : "#94A3B8"} />
            </View>
            <Text style={[nav.label, on && nav.labelOn]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const nav = StyleSheet.create({
  bar:    { flexDirection: "row", paddingTop: 8, paddingBottom: 4, paddingHorizontal: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  item:   { flex: 1, alignItems: "center", gap: 3 },
  icon:   { width: 42, height: 34, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  iconOn: { backgroundColor: "#EEF2FF" },
  label:  { fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8" },
  labelOn:{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#4F46E5" },
});

export default function SettingsScreen({ navigation }) {
  const { pet } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        <View style={sc.header}>
          <Text style={sc.title}>Ajustes</Text>
          <Text style={sc.sub}>{pet?.name || "Tu mascota"} · PetVoice AI</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

          {/* Plan banner */}
          <View style={sc.planWrap}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sc.planCard}>
              <View>
                <Text style={sc.planLabel}>Plan activo</Text>
                <Text style={sc.planName}>Gratuito</Text>
                <Text style={sc.planDesc}>5 análisis por día · Historial básico</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85}>
                <View style={sc.upgradePill}>
                  <MaterialCommunityIcons name="star" size={14} color="#F4511E" />
                  <Text style={sc.upgradeText}>Ver Pro</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <Card title="Mi mascota">
            <Row icon="paw"             color="#10B981" label="Nombre"   value={pet?.name || "—"} last={false} />
            <Row icon="dog"             color="#6366F1" label="Especie"  value={pet?.species === "cat" ? "Gato" : "Perro"} last={false} />
            <Row icon="cake-variant"    color="#F59E0B" label="Edad"     value={pet?.age ? `${pet.age} años` : "—"} last />
          </Card>

          <Card title="App">
            <Row icon="bell-outline"        color="#4F46E5" label="Notificaciones"  onPress={() => Alert.alert("Próximamente")} last={false} />
            <Row icon="translate"           color="#0EA5E9" label="Idioma"          value="Español" last={false} />
            <Row icon="shield-check-outline"color="#10B981" label="Privacidad"      onPress={() => Alert.alert("Próximamente")} last={false} />
            <Row icon="file-document"       color="#64748B" label="Términos de uso" onPress={() => Alert.alert("Próximamente")} last />
          </Card>

          <Card title="Soporte">
            <Row icon="help-circle-outline"  color="#6366F1" label="Centro de ayuda"   onPress={() => Alert.alert("Próximamente")} last={false} />
            <Row icon="message-outline"      color="#F59E0B" label="Enviar comentario" onPress={() => Alert.alert("Próximamente")} last={false} />
            <Row icon="information-outline"  color="#94A3B8" label="Versión"           value="1.0.0" last />
          </Card>

        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#fff" }}>
        <BottomNav navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const sc = StyleSheet.create({
  header:   { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  title:    { fontFamily: "Inter_700Bold", fontSize: 26, color: "#1E293B", letterSpacing: -0.6 },
  sub:      { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8", marginTop: 2 },
  planWrap: { marginHorizontal: 20, marginBottom: 20 },
  planCard: { borderRadius: 22, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planLabel:{ fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 2 },
  planName: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#fff" },
  planDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  upgradePill: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  upgradeText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#F4511E" },
});
