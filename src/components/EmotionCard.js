import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const EMOTION_CONFIG = {
  Verde: {
    bg: '#D1FAE5',
    border: '#6EE7B7',
    textPrimary: '#065F46',
    textSecondary: '#047857',
    emoji: '😊',
    badge: '#10B981',
    badgeText: '#FFFFFF',
  },
  Amarillo: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    textPrimary: '#92400E',
    textSecondary: '#B45309',
    emoji: '😟',
    badge: '#F59E0B',
    badgeText: '#FFFFFF',
  },
  Rojo: {
    bg: '#FEE2E2',
    border: '#FCA5A5',
    textPrimary: '#991B1B',
    textSecondary: '#B91C1C',
    emoji: '😣',
    badge: '#EF4444',
    badgeText: '#FFFFFF',
  },
};

const EmotionCard = ({ emotion, color, translation, advice }) => {
  const config = EMOTION_CONFIG[color] || EMOTION_CONFIG['Verde'];

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderColor: config.border }]}>
      {/* Emotion badge + emoji row */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View style={[styles.badge, { backgroundColor: config.badge }]}>
          <Text style={[styles.badgeText, { color: config.badgeText }]}>
            {emotion}
          </Text>
        </View>
      </View>

      {/* First-person translation */}
      <Text style={[styles.translation, { color: config.textPrimary }]}>
        "{translation}"
      </Text>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: config.border }]} />

      {/* Veterinary advice */}
      <View style={styles.adviceRow}>
        <Text style={styles.adviceIcon}>🩺</Text>
        <View style={styles.adviceTextWrapper}>
          <Text style={[styles.adviceLabel, { color: config.textSecondary }]}>
            Consejo veterinario
          </Text>
          <Text style={[styles.adviceText, { color: config.textSecondary }]}>
            {advice}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  emoji: {
    fontSize: 48,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  translation: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.medium,
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginBottom: 14,
    borderRadius: 1,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  adviceIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  adviceTextWrapper: {
    flex: 1,
  },
  adviceLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: FONTS.size.sm,
    lineHeight: 20,
    fontWeight: FONTS.weight.regular,
  },
});

export default EmotionCard;
