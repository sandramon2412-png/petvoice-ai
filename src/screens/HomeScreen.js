import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import RecordButton from '../components/RecordButton';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

// Animated waveform dots
const WaveformDots = ({ isActive }) => {
  const anims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    if (!isActive) {
      anims.forEach((a) => {
        a.stopAnimation();
        Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
      return;
    }

    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, {
            toValue: 2.2 + Math.random() * 1.2,
            duration: 280 + i * 40,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.6,
            duration: 280 + i * 40,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, [isActive, anims]);

  return (
    <View style={waveStyles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            waveStyles.dot,
            {
              backgroundColor: isActive ? COLORS.DANGER : COLORS.BORDER,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const waveStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 48,
  },
  dot: {
    width: 5,
    height: 20,
    borderRadius: 3,
  },
});

const HomeScreen = ({ navigation }) => {
  const { pet, user, canTranslate, resetDailyIfNeeded } = useApp();
  const insets = useSafeAreaInsets();

  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const recordingRef = useRef(null);

  useEffect(() => {
    (async () => {
      await resetDailyIfNeeded();
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso al micrófono para grabar los sonidos de tu mascota.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (!canTranslate()) {
      navigation.navigate('Paywall');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación. Intenta de nuevo.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    setIsRecording(false);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (uri) {
        navigation.navigate('Result', { audioUri: uri });
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      recordingRef.current = null;
    }
  };

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const petInitial = pet?.name ? pet.name.charAt(0).toUpperCase() : '?';
  const translationsLeft = Math.max(0, 3 - user.translationsToday);
  const limitReached = !canTranslate();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            ¡Hola! Soy{' '}
            <Text style={styles.petNameInline}>{pet?.name || 'tu mascota'}</Text>
          </Text>
          <Text
            style={[styles.counter, limitReached && styles.counterLimit]}
          >
            {user.isPremium
              ? 'Traducciones ilimitadas ✨'
              : limitReached
              ? 'Límite diario alcanzado 🔒'
              : `Traducciones hoy: ${user.translationsToday} de 3`}
          </Text>
        </View>

        {/* Pet avatar */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Ajustes')}
          activeOpacity={0.8}
        >
          {pet?.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.petAvatar} />
          ) : (
            <View style={styles.petAvatarFallback}>
              <Text style={styles.petAvatarInitial}>{petInitial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress bar (non-premium) */}
      {!user.isPremium && (
        <View style={styles.progressWrapper}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, (user.translationsToday / 3) * 100)}%`,
                  backgroundColor: limitReached ? COLORS.DANGER : COLORS.PRIMARY,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {translationsLeft} restante{translationsLeft !== 1 ? 's' : ''} hoy
          </Text>
        </View>
      )}

      {/* Center area */}
      <View style={styles.centerArea}>
        {/* Large pet avatar */}
        <View style={styles.bigAvatarWrapper}>
          {pet?.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.bigAvatar} />
          ) : (
            <View style={styles.bigAvatarFallback}>
              <Text style={styles.bigAvatarEmoji}>
                {pet?.species === 'cat' ? '🐱' : '🐶'}
              </Text>
            </View>
          )}
          {isRecording && (
            <View style={styles.recordingBadge}>
              <Text style={styles.recordingBadgeText}>REC</Text>
            </View>
          )}
        </View>

        {/* Pet name */}
        <Text style={styles.petName}>{pet?.name || 'Tu mascota'}</Text>
        {pet?.breed ? (
          <Text style={styles.petBreed}>{pet.breed}</Text>
        ) : null}

        {/* Waveform */}
        <View style={styles.waveformArea}>
          <WaveformDots isActive={isRecording} />
        </View>

        {/* Instruction */}
        {!isRecording && (
          <Text style={[styles.instruction, limitReached && styles.instructionLimit]}>
            {limitReached
              ? 'Actualiza a Premium para continuar'
              : 'Toca el botón para grabar'}
          </Text>
        )}
        {isRecording && (
          <Text style={styles.instructionRecording}>
            Escuchando a {pet?.name || 'tu mascota'}...{'\n'}Toca de nuevo para analizar
          </Text>
        )}
      </View>

      {/* Record button */}
      <View style={styles.recordArea}>
        <RecordButton
          isRecording={isRecording}
          onPress={limitReached ? () => navigation.navigate('Paywall') : handleRecordPress}
        />

        {limitReached && (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeBtnText}>🔓 Obtener Premium</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: insets.bottom + 16 }} />
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  greeting: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    marginBottom: 3,
  },
  petNameInline: {
    color: COLORS.PRIMARY,
    fontWeight: FONTS.weight.bold,
  },
  counter: {
    fontSize: FONTS.size.sm,
    color: COLORS.DARK,
    fontWeight: FONTS.weight.semibold,
  },
  counterLimit: {
    color: COLORS.DANGER,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  petAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatarInitial: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
  },

  // Progress bar
  progressWrapper: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
    fontWeight: FONTS.weight.medium,
    minWidth: 80,
    textAlign: 'right',
  },

  // Center
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bigAvatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  bigAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  bigAvatarFallback: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#EEF2FF',
    borderWidth: 4,
    borderColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  bigAvatarEmoji: {
    fontSize: 64,
  },
  recordingBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.DANGER,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  recordingBadgeText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.5,
  },
  petName: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.DARK,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: FONTS.size.sm,
    color: COLORS.MUTED,
    marginBottom: 8,
    fontWeight: FONTS.weight.medium,
  },
  waveformArea: {
    marginVertical: 20,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  instructionLimit: {
    color: COLORS.DANGER,
    fontWeight: FONTS.weight.medium,
  },
  instructionRecording: {
    fontSize: FONTS.size.md,
    color: COLORS.PRIMARY,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: FONTS.weight.medium,
  },

  // Record area
  recordArea: {
    alignItems: 'center',
    paddingBottom: 16,
    gap: 20,
  },
  upgradeBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  upgradeBtnText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
