import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const AD_CONTENT = {
  comida: {
    headline: 'Royal Canin — Nutrición diseñada para cada raza',
    body: 'Fórmulas precisas que respetan las necesidades únicas de tu mascota. Entrega a domicilio.',
    cta: 'Ver oferta',
    icon: '🍖',
    sponsor: 'Royal Canin',
  },
  juguete: {
    headline: 'Kong — El juguete que resiste todo',
    body: 'Estimulación mental y física en un solo juguete. 1 millón de mascotas ya lo eligen.',
    cta: 'Explorar catálogo',
    icon: '🎾',
    sponsor: 'Kong Co.',
  },
  paseo: {
    headline: 'Ruffwear — Arnés sin jalones, paseos felices',
    body: 'Control cómodo y seguro. Diseñado para mascotas activas que aman explorar.',
    cta: 'Conocer más',
    icon: '🦮',
    sponsor: 'Ruffwear',
  },
};

const NativeAdBanner = ({ keyword, isPremium }) => {
  if (isPremium) return null;

  const ad = AD_CONTENT[keyword] || AD_CONTENT['comida'];

  return (
    <View style={styles.container}>
      {/* Sponsored label */}
      <Text style={styles.sponsoredLabel}>Publicidad · {ad.sponsor}</Text>

      <View style={styles.inner}>
        {/* Left accent bar */}
        <View style={styles.accentBar} />

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.icon}>{ad.icon}</Text>
            <View style={styles.textBlock}>
              <Text style={styles.headline}>{ad.headline}</Text>
              <Text style={styles.body}>{ad.body}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={() => {/* In production: open ad URL */}}
          >
            <Text style={styles.ctaText}>{ad.cta} →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 0,
  },
  sponsoredLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.medium,
    textAlign: 'right',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  inner: {
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    backgroundColor: COLORS.PRIMARY,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
  },
  headline: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.DARK,
    marginBottom: 4,
    lineHeight: 21,
  },
  body: {
    fontSize: FONTS.size.sm,
    color: COLORS.MUTED,
    lineHeight: 19,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ctaText: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.WHITE,
    letterSpacing: 0.2,
  },
});

export default NativeAdBanner;
