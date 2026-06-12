import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const SettingRow = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.settingLeft}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
        {label}
      </Text>
    </View>
    {value !== undefined && (
      <Text style={styles.settingValue}>{value}</Text>
    )}
    {onPress && !danger && (
      <Text style={styles.settingArrow}>›</Text>
    )}
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }) => {
  const { pet, user, clearHistory, setPremium } = useApp();
  const insets = useSafeAreaInsets();

  const petInitial = pet?.name ? pet.name.charAt(0).toUpperCase() : '?';

  const handleClearHistory = () => {
    Alert.alert(
      'Borrar historial',
      '¿Estás seguro? Esto eliminará todas las conversaciones guardadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Listo', 'El historial fue borrado.');
          },
        },
      ]
    );
  };

  const handleEditPet = () => {
    navigation.navigate('Onboarding');
  };

  const handleManagePremium = () => {
    if (user.isPremium) {
      Alert.alert(
        'Gestionar suscripción',
        'Para cancelar tu suscripción, ve a la configuración de tu tienda de aplicaciones.',
        [{ text: 'Entendido' }]
      );
    } else {
      navigation.navigate('Paywall');
    }
  };

  // Dev-only: toggle premium for testing
  const handleTogglePremiumDev = () => {
    Alert.alert(
      'Demo: Toggle Premium',
      `Cambiar a ${user.isPremium ? 'Free' : 'Premium'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => setPremium(!user.isPremium),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Ajustes</Text>

      {/* Pet profile card */}
      <View style={styles.petCard}>
        {pet?.photo ? (
          <Image source={{ uri: pet.photo }} style={styles.petCardAvatar} />
        ) : (
          <View style={styles.petCardAvatarFallback}>
            <Text style={styles.petCardAvatarInitial}>{petInitial}</Text>
          </View>
        )}
        <View style={styles.petCardInfo}>
          <Text style={styles.petCardName}>{pet?.name || 'Sin nombre'}</Text>
          <Text style={styles.petCardDetails}>
            {pet?.species === 'cat' ? 'Gato' : 'Perro'}
            {pet?.breed ? ` · ${pet.breed}` : ''}
            {pet?.age ? ` · ${pet.age}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={handleEditPet}>
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Add pet button */}
      <TouchableOpacity
        style={styles.addPetBtn}
        onPress={() => navigation.navigate('Onboarding', { addMode: true })}
        activeOpacity={0.75}
      >
        <Text style={styles.addPetIcon}>＋</Text>
        <Text style={styles.addPetText}>Agregar mascota</Text>
      </TouchableOpacity>

      {/* Account section */}
      <Text style={styles.sectionHeader}>Cuenta</Text>
      <View style={styles.settingsGroup}>
        <SettingRow
          icon={user.isPremium ? '⭐' : '🔒'}
          label={user.isPremium ? 'PetVoice Premium' : 'Actualizar a Premium'}
          value={user.isPremium ? 'Activo' : undefined}
          onPress={handleManagePremium}
        />
        <View style={styles.groupDivider} />
        <SettingRow
          icon="📊"
          label="Traducciones hoy"
          value={user.isPremium ? 'Ilimitadas' : `${user.translationsToday} / 3`}
        />
      </View>

      {/* Data section */}
      <Text style={styles.sectionHeader}>Datos</Text>
      <View style={styles.settingsGroup}>
        <SettingRow
          icon="💬"
          label="Ver historial"
          onPress={() => navigation.navigate('Historial')}
        />
        <View style={styles.groupDivider} />
        <SettingRow
          icon="🗑"
          label="Borrar historial"
          onPress={handleClearHistory}
          danger
        />
      </View>

      {/* About section */}
      <Text style={styles.sectionHeader}>Acerca de</Text>
      <View style={styles.settingsGroup}>
        <SettingRow icon="📝" label="Términos de servicio" onPress={() => {}} />
        <View style={styles.groupDivider} />
        <SettingRow icon="🔐" label="Política de privacidad" onPress={() => {}} />
        <View style={styles.groupDivider} />
        <SettingRow icon="⭐" label="Calificar la app" onPress={() => {}} />
        <View style={styles.groupDivider} />
        <SettingRow icon="📱" label="Versión" value="1.0.0" />
      </View>

      {/* Dev tools */}
      <Text style={styles.sectionHeader}>Herramientas de demo</Text>
      <View style={styles.settingsGroup}>
        <SettingRow
          icon="🧪"
          label={`Toggle Premium (ahora: ${user.isPremium ? 'ON' : 'OFF'})`}
          onPress={handleTogglePremiumDev}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🐾 PetVoice AI</Text>
        <Text style={styles.footerSubText}>
          Hecho con amor para las mascotas y sus familias
        </Text>
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  content: {
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.DARK,
    marginBottom: 20,
  },

  // Pet card
  petCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  petCardAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  petCardAvatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCardAvatarInitial: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
  },
  petCardInfo: {
    flex: 1,
  },
  petCardName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
    marginBottom: 3,
  },
  petCardDetails: {
    fontSize: FONTS.size.sm,
    color: COLORS.MUTED,
    textTransform: 'capitalize',
  },
  editBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  editBtnText: {
    color: COLORS.PRIMARY,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
  },

  // Settings groups
  addPetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginBottom: 28,
    gap: 10,
  },
  addPetIcon: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    lineHeight: 22,
  },
  addPetText: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.PRIMARY,
  },
  sectionHeader: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    color: COLORS.MUTED,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    fontSize: 20,
    width: 26,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: FONTS.size.md,
    color: COLORS.DARK,
    fontWeight: FONTS.weight.medium,
  },
  settingLabelDanger: {
    color: COLORS.DANGER,
  },
  settingValue: {
    fontSize: FONTS.size.sm,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.medium,
    marginRight: 4,
  },
  settingArrow: {
    fontSize: FONTS.size.xl,
    color: COLORS.MUTED,
    marginLeft: 4,
  },
  groupDivider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginLeft: 54,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  footerText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.PRIMARY,
  },
  footerSubText: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    textAlign: 'center',
  },
});

export default SettingsScreen;
