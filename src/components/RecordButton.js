import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';

const BUTTON_SIZE = 100;
const RING_MAX_SCALE = 2.2;

const PulseRing = ({ delay, color }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animate = () => {
      scale.setValue(1);
      opacity.setValue(0.6);

      Animated.parallel([
        Animated.timing(scale, {
          toValue: RING_MAX_SCALE,
          duration: 1600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1600,
          delay,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
    return () => {
      scale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [delay, scale, opacity]);

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

const RecordButton = ({ isRecording, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, scaleAnim]);

  const ringColor = isRecording
    ? 'rgba(239,68,68,0.35)'
    : 'rgba(255,138,101,0.3)';

  return (
    <View style={styles.wrapper}>
      {/* Animated pulsing rings */}
      {isRecording && (
        <>
          <PulseRing delay={0} color="rgba(239,68,68,0.18)" />
          <PulseRing delay={400} color="rgba(239,68,68,0.12)" />
          <PulseRing delay={800} color="rgba(239,68,68,0.07)" />
        </>
      )}
      {!isRecording && (
        <>
          <PulseRing delay={0} color="rgba(255,138,101,0.15)" />
          <PulseRing delay={500} color="rgba(255,138,101,0.09)" />
        </>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={[
            styles.button,
            isRecording ? styles.buttonRecording : styles.buttonIdle,
          ]}
        >
          {isRecording ? (
            <View style={styles.recordingInner}>
              <View style={styles.redDot} />
              <Text style={styles.micText}>🎙</Text>
            </View>
          ) : (
            <Text style={styles.micText}>🎤</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Label below */}
      <Text style={[styles.label, isRecording && styles.labelRecording]}>
        {isRecording ? 'Grabando...' : 'Toca para grabar'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.DARK,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  buttonIdle: {
    backgroundColor: COLORS.ACCENT,
  },
  buttonRecording: {
    backgroundColor: COLORS.DANGER,
  },
  recordingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  redDot: {
    position: 'absolute',
    top: -28,
    right: -28,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.DANGER,
  },
  micText: {
    fontSize: 38,
  },
  label: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.MUTED,
    letterSpacing: 0.2,
  },
  labelRecording: {
    color: COLORS.DANGER,
    fontWeight: '600',
  },
});

export default RecordButton;
