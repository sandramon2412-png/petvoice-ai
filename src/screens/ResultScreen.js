import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { analyzeAudio } from '../services/aiService';
import EmotionCard from '../components/EmotionCard';
import NativeAdBanner from '../components/NativeAdBanner';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const LoadingState = ({ petName }) => {
  const dotAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = dotAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay((dotAnims.length - i - 1) * 200),
        ])
      )
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, [dotAnims]);

  return (
    <View style={loadingStyles.container}>
      <Text style={loadingStyles.emoji}>🔍</Text>
      <Text style={loadingStyles.title}>Analizando el sonido</Text>
      <Text style={loadingStyles.subtitle}>
        Traduciendo lo que {petName || 'tu mascota'} quiere decirte...
      </Text>
      <View style={loadingStyles.dotsRow}>
        {dotAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              loadingStyles.dot,
              {
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 56, marginBottom: 20 },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
});

const ResultScreen = ({ route, navigation }) => {
  const { audioUri } = route.params || {};
  const { pet, user, addTranslation, addHumanMessage } = useApp();
  const insets = useSafeAreaInsets();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const petContext = {
        name: pet?.name,
        species: pet?.species,
        breed: pet?.breed,
        age: pet?.age,
      };

      const analysisResult = await analyzeAudio(audioUri, petContext);
      setResult(analysisResult);

      // Save to history and increment counter
      await addTranslation(analysisResult);

      // Fade in the result
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Analysis error:', err);
      setError('No pudimos analizar el sonido. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    const msg = replyText.trim();
    if (!msg) return;

    setIsSendingReply(true);
    try {
      await addHumanMessage(msg);
      setReplyText('');
      setReplySent(true);
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar tu mensaje.');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
        <LoadingState petName={pet?.name} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.errorCenter, { paddingTop: insets.top }]}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Algo salió mal</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={runAnalysis}>
          <Text style={styles.retryBtnText}>Intentar de nuevo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Volver atrás</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={[styles.screen, { paddingTop: insets.top + 16 }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back + title */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Traducción</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* Pet label */}
        <View style={styles.petLabel}>
          <Text style={styles.petLabelText}>
            {pet?.species === 'cat' ? '🐱' : '🐶'}{' '}
            <Text style={styles.petLabelName}>{pet?.name || 'Tu mascota'}</Text> dice...
          </Text>
        </View>

        {/* Emotion card */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <EmotionCard
            emotion={result?.emocion}
            color={result?.color_alerta}
            translation={result?.traduccion}
            advice={result?.consejo_veterinario}
          />
        </Animated.View>

        {/* Reply section */}
        <View style={styles.replySection}>
          <Text style={styles.replyTitle}>¿Qué quieres responderle?</Text>

          {replySent ? (
            <View style={styles.replySentBox}>
              <Text style={styles.replySentText}>
                💬 Tu mensaje fue guardado en el historial de conversación.
              </Text>
              <TouchableOpacity onPress={() => setReplySent(false)} style={styles.replyAgainBtn}>
                <Text style={styles.replyAgainText}>Escribir otro mensaje</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.replyRow}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Respóndele a ${pet?.name || 'tu mascota'}...`}
                placeholderTextColor={COLORS.MUTED}
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!replyText.trim() || isSendingReply) && styles.sendBtnDisabled,
                ]}
                onPress={handleSendReply}
                disabled={!replyText.trim() || isSendingReply}
                activeOpacity={0.8}
              >
                <Text style={styles.sendBtnText}>
                  {isSendingReply ? '...' : '→'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Native ad */}
        <NativeAdBanner
          keyword={result?.sugerencia_anuncio || 'comida'}
          isPremium={user?.isPremium}
        />

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.newRecordingBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.newRecordingText}>🎤 Nueva grabación</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => navigation.navigate('Historial')}
            activeOpacity={0.8}
          >
            <Text style={styles.historyBtnText}>Ver historial</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: FONTS.size.md,
    color: COLORS.PRIMARY,
    fontWeight: FONTS.weight.semibold,
  },
  screenTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
  },

  petLabel: {
    marginBottom: 12,
  },
  petLabelText: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
  },
  petLabelName: {
    color: COLORS.DARK,
    fontWeight: FONTS.weight.bold,
  },

  // Reply
  replySection: {
    marginTop: 16,
    marginBottom: 8,
  },
  replyTitle: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.DARK,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  replyRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  replyInput: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONTS.size.md,
    color: COLORS.DARK,
    maxHeight: 100,
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
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.BORDER,
  },
  sendBtnText: {
    fontSize: FONTS.size.xl,
    color: COLORS.WHITE,
    fontWeight: FONTS.weight.bold,
  },
  replySentBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    padding: 14,
    gap: 10,
  },
  replySentText: {
    fontSize: FONTS.size.sm,
    color: '#166534',
    lineHeight: 20,
  },
  replyAgainBtn: {
    alignSelf: 'flex-start',
  },
  replyAgainText: {
    fontSize: FONTS.size.sm,
    color: COLORS.PRIMARY,
    fontWeight: FONTS.weight.semibold,
  },

  // Actions
  actions: {
    gap: 12,
    marginTop: 8,
  },
  newRecordingBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  newRecordingText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    letterSpacing: 0.2,
  },
  historyBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  historyBtnText: {
    color: COLORS.DARK,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
  },

  // Error state
  errorCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorEmoji: { fontSize: 56, marginBottom: 16 },
  errorTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginBottom: 12,
  },
  retryBtnText: {
    color: COLORS.WHITE,
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.bold,
  },
  backLink: { padding: 8 },
  backLinkText: {
    color: COLORS.MUTED,
    fontSize: FONTS.size.md,
  },
});

export default ResultScreen;
