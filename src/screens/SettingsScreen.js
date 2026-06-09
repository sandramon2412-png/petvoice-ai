import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";

function SettingRow({ icon, label, value, accent = "#4F46E5", onPress }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[s.rowIcon, { backgroundColor: accent + "15" }]}>
        <MaterialCommunityIcons name={icon} size={20} color={accent} />
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {onPress ? <MaterialCommunityIcons name="chevron-right" size={18} color="#CBD5E1" /> : null}
    </TouchableOpacity>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BottomNav({ navigation }) {
  const tabs = [
    { label: "Inicio",    icon: "home-variant",  screen: "Home"     },
    { label: "Historial", icon: "history",        screen: "History"  },
    { label: "Ajustes",   icon: "tune-variant",   screen: "Settings" },
  ];
  return (
    <View style={s.bottomNav}>
      {tabs.map((t) => {
        const active = t.screen === "Settings";
        return (
          <TouchableOpacity key={t.screen} style={s.navItem} onPress={() => !active && navigation.navigate(t.screen)} activeOpacity={0.7}>
            <View style={[s.navIcon, active && s.navIconActive]}>
              <MaterialCommunityIcons name={t.icon} size={24} color={active ? "#4F46E5" : "#94A3B8"} />
            </View>
            <Text style={[s.navLabel, active && s.navLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { pet } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

        <View style={s.header}>
          <Text style={s.headerTitle}>Ajustes</Text>
          <Text style={s.headerSub}>{pet?.name || "Tu mascota"} · PetVoice AI</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>

          {/* Plan */}
          <View style={s.planCard}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={StyleSheet.absoluteFill} />
            <View style={s.planRow}>
              <View>
                <Text style={s.planLabel}>Plan actual</Text>
                <Text style={s.planName}>Gratuito</Text>
              </View>
              <TouchableOpacity style={s.upgradeBtn} activeOpacity={0.85}>
                <LinearGradient colors={["#FF8A65", "#F4511E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.upgradeBtnGrad}>
                  <MaterialCommunityIcons name="star-outline" size={14} color="#fff" />
                  <Text style={s.upgradeBtnText}>Upgrade a Pro</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={s.planFeatures}>
              {["5 análisis por día", "Historial básico"].map((f) => (
                <View key={f} style={s.planFeature}>
                  <MaterialCommunityIcons name="check-circle-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={s.planFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          <SectionCard title="Mascota">
            <SettingRow icon="paw" label="Nombre" value={pet?.name || "—"} accent="#10B981" />
            <SettingRow icon="dog" label="Especie" value={pet?.species === "cat" ? "Gato" : "Perro"} accent="#6366F1" />
            <SettingRow icon="cake-variant-outline" label="Edad" value={pet?.age ? `${pet.age} años` : "—"} accent="#F59E0B" />
          </SectionCard>

          <SectionCard title="Preferencias">
            <SettingRow icon="bell-outline"      label="Notificaciones"   onPress={() => {}} accent="#4F46E5" />
            <SettingRow icon="translate"          label="Idioma"          value="Español"    accent="#0EA5E9" />
            <SettingRow icon="moon-waning-crescent" label="Tema oscuro"   onPress={() => {}} accent="#7C3AED" />
          </SectionCard>

          <SectionCard title="Acerca de">
            <SettingRow icon="shield-check-outline" label="Privacidad"    onPress={() => {}} accent="#10B981" />
            <SettingRow icon="file-document-outline" label="Términos"     onPress={() => {}} accent="#64748B" />
            <SettingRow icon="information-outline"  label="Versión"       value="1.0.0"      accent="#94A3B8" />
          </SectionCard>

        </ScrollView>
      </SafeAreaView>

      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#fff" }}>
        <BottomNav navigation={navigation} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#1E293B", letterSpacing: -0.6 },
  headerSub:   { fontFamily: "Inter_400Regular", fontSize: 12, color: "#94A3B8", marginTop: 2 },

  planCard: {
    borderRadius: 20, overflow: "hidden", padding: 20, marginBottom: 20,
    shadowColor: "#4F46E5", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  planRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  planLabel:   { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 2 },
  planName:    { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },
  upgradeBtn:  { borderRadius: 12, overflow: "hidden" },
  upgradeBtnGrad: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  upgradeBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" },
  planFeatures:   { flexDirection: "row", gap: 16 },
  planFeature:    { flexDirection: "row", alignItems: "center", gap: 5 },
  planFeatureText:{ fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" },

  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 6,
    marginBottom: 16, borderWidth: 1, borderColor: "#F1F5F9",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase", paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14 },
  rowIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: "#1E293B" },
  rowValue: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#94A3B8" },

  bottomNav: { flexDirection: "row", paddingTop: 10, paddingBottom: 4, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  navItem:       { flex: 1, alignItems: "center", gap: 4 },
  navIcon:       { width: 44, height: 36, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  navIconActive: { backgroundColor: "#EEF2FF" },
  navLabel:      { fontFamily: "Inter_400Regular", fontSize: 10, color: "#94A3B8" },
  navLabelActive:{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#4F46E5" },
});
