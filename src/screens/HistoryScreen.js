import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import ChatBubble, { DateSeparator } from '../components/ChatBubble';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

// Inject date separators between items that belong to different days
const buildDisplayList = (history) => {
  if (!history || history.length === 0) return [];

  // history is stored newest-first; display in chronological order (oldest first for inverted FlatList)
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const items = [];
  let lastDate = null;

  sorted.forEach((item) => {
    const itemDate = item.timestamp;
    if (!lastDate || !isSameDay(lastDate, itemDate)) {
      items.push({ type: 'date_separator', id: `sep_${itemDate}`, timestamp: itemDate });
      lastDate = itemDate;
    }
    items.push({ ...item, type: item.type || 'message' });
  });

  return items.reverse(); // Reversed because FlatList is inverted
};

const EmptyState = ({ onRecord, navigation }) => (
  <View style={emptyStyles.container}>
    <Text style={emptyStyles.illustration}>💬</Text>
    <Text style={emptyStyles.title}>Sin conversaciones aún</Text>
    <Text style={emptyStyles.subtitle}>
      Graba el primer sonido de tu mascota y{'\n'}aparecerá aquí como una conversación.
    </Text>
    <TouchableOpacity
      style={emptyStyles.ctaBtn}
      onPress={() => navigation.navigate('Home')}
      activeOpacity={0.85}
    >
      <Text style={emptyStyles.ctaBtnText}>🎤 Grabar ahora</Text>
    </TouchableOpacity>
  </View>
);

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    // compensate for inverted list
    transform: [{ scaleY: -1 }],
  },
  illustration: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  ctaBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  ctaBtnText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
});

const HistoryScreen = ({ navigation }) => {
  const { pet, history } = useApp();
  const insets = useSafeAreaInsets();

  const displayItems = useMemo(() => buildDisplayList(history), [history]);
  const petInitial = pet?.name ? pet.name.charAt(0).toUpperCase() : '?';

  const renderItem = ({ item }) => {
    if (item.type === 'date_separator') {
      return (
        <View style={styles.separatorWrapper}>
          <DateSeparator timestamp={item.timestamp} />
        </View>
      );
    }

    return (
      <ChatBubble
        message={item.message}
        isFromPet={item.isFromPet}
        petName={pet?.name}
        petPhoto={pet?.photo}
        timestamp={item.timestamp}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {pet?.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarInitial}>{petInitial}</Text>
            </View>
          )}
          <View>
            <Text style={styles.headerName}>{pet?.name || 'Tu mascota'}</Text>
            <Text style={styles.headerSub}>
              {history.length > 0
                ? `${history.length} mensaje${history.length !== 1 ? 's' : ''}`
                : 'Sin mensajes'}
            </Text>
          </View>
        </View>

        {history.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.newBtn}
          >
            <Text style={styles.newBtnText}>+ Grabar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Chat list */}
      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id || item.timestamp}
        renderItem={renderItem}
        inverted
        contentContainerStyle={[
          styles.listContent,
          displayItems.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={<EmptyState navigation={navigation} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  headerAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarInitial: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
  },
  headerName: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
    marginBottom: 1,
  },
  headerSub: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.medium,
  },
  newBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newBtnText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  listContent: {
    paddingVertical: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  separatorWrapper: {
    // inverted list flips children; DateSeparator handles its own layout
    transform: [{ scaleY: -1 }],
  },
});

export default HistoryScreen;
