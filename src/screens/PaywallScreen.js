import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const BENEFITS = [
  { icon: '🎙', text: 'Traducciones ilimitadas cada día' },
  { icon: '🚫', text: 'Sin publicidad, experiencia limpia' },
  { icon: '💬', text: 'Historial completo de conversaciones' },
  { icon: '🩺', text: 'Consejos avanzados de salud y bienestar' },
  { icon: '⚡', text: 'Análisis prioritario más rápido' },
];

const PlanCard = ({ price, period, label, isPopular, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.planCard,
      isSelected && styles.planCardSelected,
      isPopular && styles.planCardPopular,
    ]}
    onPress={onSelect}
    activeOpacity={0.85}
  >
    {isPopular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularBadgeText}>AHORRA 50%</Text>
      </View>
    )}

    <View style={styles.planCardInner}>
      <View style={styles.planRadio}>
        <View style={[styles.planRadioInner, isSelected && styles.planRadioInnerSelected]} />
      </View>

      <View style={styles.planInfo}>
        <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
          {label}
        </Text>
        <View style={styles.planPriceRow}>
          <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
            {price}
          </Text>
          <Text style={[styles.planPeriod, isSelected && styles.planPeriodSelected]}>
            /{period}
          </Text>
        </View>
      </View>

      {isPopular && (
        <View style={styles.bestValueTag}>
          <Text style={styles.bestValueText}>Mejor valor</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const PaywallScreen = ({ navigation }) => {
  const { setPremium, pet, user } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = async () => {
    setIsLoading(true);

    // In production: integrate with RevenueCat, StoreKit, or Google Play Billing
    // For demo purposes: simulate a purchase and set premium
    console.log(`[PaywallScreen] Mock purchase initiated — plan: ${selectedPlan}`);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await setPremium(true);
      console.log('[PaywallScreen] Mock purchase successful — isPremium set to true');

      Alert.alert(
        '¡Bienvenido a Premium! 🎉',
        'Tu prueba gratuita de 7 días ha comenzado. Disfruta de traducciones ilimitadas.',
        [
          {
            text: '¡Genial!',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
              }
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo procesar la suscripción. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFree = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const petName = pet?.name || 'tu mascota';
  const limitReached = !user.isPremium && user.translationsToday >= 3;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 12 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header icon */}
      <View style={styles.lockIconWrapper}>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {limitReached
          ? 'Has usado tus 3 traducciones de hoy'
          : 'Desbloquea PetVoice Premium'}
      </Text>
      <Text style={styles.subtitle}>
        {limitReached
          ? `Actualiza ahora para seguir entendiendo a ${petName} sin límites`
          : `Todo lo que necesitas para conectar con ${petName}`}
      </Text>

      {/* Benefits list */}
      <View style={styles.benefitsCard}>
        {BENEFITS.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <View style={styles.benefitCheck}>
              <Text style={styles.benefitCheckText}>✓</Text>
            </View>
            <Text style={styles.benefitIcon}>{b.icon}</Text>
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}
      </View>

      {/* Trial badge */}
      <View style={styles.trialBadge}>
        <Text style={styles.trialBadgeText}>
          🎁 7 días gratis · Cancela cuando quieras
        </Text>
      </View>

      {/* Plan selection */}
      <View style={styles.plansSection}>
        <Text style={styles.plansTitle}>Elige tu plan</Text>

        <PlanCard
          price="$29.99"
          period="año"
          label="Plan Anual"
          isPopular
          isSelected={selectedPlan === 'annual'}
          onSelect={() => setSelectedPlan('annual')}
        />

        <PlanCard
          price="$4.99"
          period="mes"
          label="Plan Mensual"
          isPopular={false}
          isSelected={selectedPlan === 'monthly'}
          onSelect={() => setSelectedPlan('monthly')}
        />
      </View>

      {/* Pricing note */}
      <Text style={styles.pricingNote}>
        {selectedPlan === 'annual'
          ? 'Equivale a $2.50/mes · Facturado anualmente como $29.99'
          : 'Facturado mensualmente · Cancela en cualquier momento'}
      </Text>

      {/* CTA button */}
      <TouchableOpacity
        style={[styles.ctaBtn, isLoading && styles.ctaBtnDisabled]}
        onPress={handleStartTrial}
        activeOpacity={0.85}
        disabled={isLoading}
      >
        <Text style={styles.ctaBtnText}>
          {isLoading ? 'Procesando...' : 'Iniciar Prueba Gratuita de 7 Días'}
        </Text>
      </TouchableOpacity>

      {/* Continue free link */}
      <TouchableOpacity onPress={handleContinueFree} style={styles.continueFreeBtn}>
        <Text style={styles.continueFreeText}>Continuar sin premium</Text>
      </TouchableOpacity>

      {/* Legal */}
      <Text style={styles.legalText}>
        Al iniciar la prueba aceptas nuestros Términos de Servicio y Política de Privacidad.
        La suscripción se renueva automáticamente. Cancela antes que termine el periodo de prueba
        para no ser cobrado.
      </Text>

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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Header
  lockIconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  lockIcon: {
    fontSize: 52,
  },
  title: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.DARK,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  // Benefits
  benefitsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    marginBottom: 16,
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
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitCheckText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: FONTS.weight.bold,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    flex: 1,
    fontSize: FONTS.size.md,
    color: COLORS.DARK,
    fontWeight: FONTS.weight.medium,
    lineHeight: 21,
  },

  // Trial badge
  trialBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  trialBadgeText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: '#C2410C',
    textAlign: 'center',
  },

  // Plans
  plansSection: {
    gap: 10,
    marginBottom: 10,
  },
  plansTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.MUTED,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    padding: 16,
    position: 'relative',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  planCardSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#F5F3FF',
  },
  planCardPopular: {
    marginTop: 10,
  },
  popularBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    backgroundColor: COLORS.ACCENT,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    zIndex: 10,
  },
  popularBadgeText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.extrabold,
    letterSpacing: 0.8,
  },
  planCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  planRadioInnerSelected: {
    backgroundColor: COLORS.PRIMARY,
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.MUTED,
    marginBottom: 2,
  },
  planLabelSelected: {
    color: COLORS.PRIMARY,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  planPrice: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.DARK,
  },
  planPriceSelected: {
    color: COLORS.PRIMARY,
  },
  planPeriod: {
    fontSize: FONTS.size.sm,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.medium,
  },
  planPeriodSelected: {
    color: COLORS.PRIMARY,
  },
  bestValueTag: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bestValueText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
  },

  // Pricing note
  pricingNote: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 17,
  },

  // CTA
  ctaBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  ctaBtnDisabled: {
    opacity: 0.65,
  },
  ctaBtnText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  // Continue free
  continueFreeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  continueFreeText: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.medium,
    textDecorationLine: 'underline',
  },

  // Legal
  legalText: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 17,
    opacity: 0.75,
  },
});

export default PaywallScreen;
