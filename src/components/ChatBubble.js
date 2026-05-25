import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const PetAvatar = ({ petName, petPhoto, size = 36 }) => {
  const initials = petName ? petName.charAt(0).toUpperCase() : '?';

  if (petPhoto) {
    return (
      <Image
        source={{ uri: petPhoto }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
};

const ChatBubble = ({ message, isFromPet, petName, petPhoto, timestamp }) => {
  const timeStr = timestamp ? formatTime(timestamp) : '';

  if (isFromPet) {
    return (
      <View style={styles.petRow}>
        <PetAvatar petName={petName} petPhoto={petPhoto} />
        <View style={styles.petBubbleWrapper}>
          <Text style={styles.senderName}>{petName || 'Tu mascota'}</Text>
          <View style={styles.petBubble}>
            <Text style={styles.petBubbleText}>{message}</Text>
          </View>
          <Text style={styles.timestamp}>{timeStr}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.humanRow}>
      <View style={styles.humanBubbleWrapper}>
        <View style={styles.humanBubble}>
          <Text style={styles.humanBubbleText}>{message}</Text>
        </View>
        <Text style={[styles.timestamp, styles.timestampRight]}>{timeStr}</Text>
      </View>
    </View>
  );
};

export const DateSeparator = ({ timestamp }) => (
  <View style={styles.dateSeparatorRow}>
    <View style={styles.dateSeparatorLine} />
    <Text style={styles.dateSeparatorText}>{formatDate(timestamp)}</Text>
    <View style={styles.dateSeparatorLine} />
  </View>
);

const styles = StyleSheet.create({
  // Pet (left) bubble
  petRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  avatar: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
  petBubbleWrapper: {
    maxWidth: '75%',
  },
  senderName: {
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.MUTED,
    marginBottom: 3,
    marginLeft: 4,
  },
  petBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  petBubbleText: {
    fontSize: FONTS.size.md,
    color: COLORS.DARK,
    lineHeight: 22,
    fontWeight: FONTS.weight.regular,
  },
  timestamp: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    marginTop: 4,
    marginLeft: 4,
  },

  // Human (right) bubble
  humanRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  humanBubbleWrapper: {
    maxWidth: '75%',
    alignItems: 'flex-end',
  },
  humanBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  humanBubbleText: {
    fontSize: FONTS.size.md,
    color: COLORS.WHITE,
    lineHeight: 22,
    fontWeight: FONTS.weight.regular,
  },
  timestampRight: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },

  // Date separator
  dateSeparatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dateSeparatorText: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.semibold,
    letterSpacing: 0.5,
  },
});

export default ChatBubble;
