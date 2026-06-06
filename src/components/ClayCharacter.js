/**
 * ClayCharacter — personajes 3D estilo plastilina construidos con RN puro.
 *
 * Para usar Lottie en el futuro:
 *   1. npx expo install lottie-react-native
 *   2. Pon los .json en assets/lottie/clay-dog.json y clay-cat.json
 *   3. Descomenta el bloque LOTTIE al final de este archivo
 */
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

// ─── Paletas de color ─────────────────────────────────────────────────────────
const DOG = {
  idle: { body: "#F2C898", ear: "#C87030", earInner: "#D4884A", shadow: "#B05A20", pupil: "#2C1200" },
  actv: { body: "#E8A050", ear: "#A84020", earInner: "#C06030", shadow: "#903010", pupil: "#2C1200" },
};
const CAT = {
  idle: { body: "#D8C4B0", ear: "#B09078", earInner: "#E8A0B8", shadow: "#988060", eye: "#5EAA6A", pupil: "#1A2A10", nose: "#D06880" },
  actv: { body: "#EEDCC0", ear: "#C49050", earInner: "#FFB8CC", shadow: "#A07030", eye: "#70C882", pupil: "#1A2A10", nose: "#E05878" },
};

// ─── Cara de Perro ────────────────────────────────────────────────────────────
function DogFace({ s, col, blinkAnim, earL, earR }) {
  const rotL = earL.interpolate({ inputRange: [0, 1], outputRange: ["-22deg", "-8deg"] });
  const rotR = earR.interpolate({ inputRange: [0, 1], outputRange: ["22deg", "8deg"] });

  return (
    <View style={{ width: s, height: s }}>

      {/* ── Orejas (detrás de la cabeza) ── */}
      <Animated.View style={{
        position: "absolute", top: s * 0.03, left: s * 0.02,
        width: s * 0.29, height: s * 0.48, borderRadius: s * 0.145,
        backgroundColor: col.ear,
        transform: [{ rotate: rotL }],
        shadowColor: "#000", shadowOffset: { width: 3, height: 6 },
        shadowOpacity: 0.22, shadowRadius: 7, elevation: 3, zIndex: 1,
      }} />
      <Animated.View style={{
        position: "absolute", top: s * 0.03, right: s * 0.02,
        width: s * 0.29, height: s * 0.48, borderRadius: s * 0.145,
        backgroundColor: col.ear,
        transform: [{ rotate: rotR }],
        shadowColor: "#000", shadowOffset: { width: -3, height: 6 },
        shadowOpacity: 0.22, shadowRadius: 7, elevation: 3, zIndex: 1,
      }} />

      {/* ── Sombra profundidad (clay depth) ── */}
      <View style={{
        position: "absolute", top: s * 0.16, left: s * 0.09,
        width: s * 0.83, height: s * 0.80, borderRadius: s * 0.415,
        backgroundColor: col.shadow, zIndex: 2,
      }} />

      {/* ── Cabeza principal ── */}
      <View style={{
        position: "absolute", top: s * 0.09, left: 0,
        width: s, height: s * 0.87, borderRadius: s * 0.435,
        backgroundColor: col.body, zIndex: 3,
      }}>
        {/* Reflejo superior izquierdo (volumen 3D) */}
        <View style={{
          position: "absolute", top: s * 0.08, left: s * 0.13,
          width: s * 0.30, height: s * 0.19, borderRadius: s * 0.10,
          backgroundColor: "rgba(255,255,255,0.38)",
        }} />

        {/* Ojo izquierdo */}
        <Animated.View style={{
          position: "absolute", top: s * 0.30, left: s * 0.17,
          width: s * 0.22, height: s * 0.22, borderRadius: s * 0.11,
          backgroundColor: col.pupil,
          transform: [{ scaleY: blinkAnim }],
        }}>
          <View style={{
            position: "absolute", top: 3, right: 4,
            width: s * 0.065, height: s * 0.065, borderRadius: s * 0.033,
            backgroundColor: "#fff",
          }} />
        </Animated.View>

        {/* Ojo derecho */}
        <Animated.View style={{
          position: "absolute", top: s * 0.30, right: s * 0.17,
          width: s * 0.22, height: s * 0.22, borderRadius: s * 0.11,
          backgroundColor: col.pupil,
          transform: [{ scaleY: blinkAnim }],
        }}>
          <View style={{
            position: "absolute", top: 3, right: 4,
            width: s * 0.065, height: s * 0.065, borderRadius: s * 0.033,
            backgroundColor: "#fff",
          }} />
        </Animated.View>

        {/* Nariz */}
        <View style={{
          position: "absolute", top: s * 0.51, alignSelf: "center",
          width: s * 0.21, height: s * 0.14, borderRadius: s * 0.07,
          backgroundColor: col.pupil,
        }} />

        {/* Lengua (feliz) */}
        <View style={{
          position: "absolute", top: s * 0.62, alignSelf: "center",
          width: s * 0.17, height: s * 0.15,
          borderBottomLeftRadius: s * 0.085, borderBottomRightRadius: s * 0.085,
          borderTopLeftRadius: s * 0.03, borderTopRightRadius: s * 0.03,
          backgroundColor: "#FF6E8A",
        }} />

        {/* Rubor mejilla izquierda */}
        <View style={{
          position: "absolute", top: s * 0.50, left: s * 0.06,
          width: s * 0.17, height: s * 0.10, borderRadius: s * 0.05,
          backgroundColor: "rgba(255,100,100,0.22)",
        }} />
        {/* Rubor mejilla derecha */}
        <View style={{
          position: "absolute", top: s * 0.50, right: s * 0.06,
          width: s * 0.17, height: s * 0.10, borderRadius: s * 0.05,
          backgroundColor: "rgba(255,100,100,0.22)",
        }} />
      </View>
    </View>
  );
}

// ─── Cara de Gato ─────────────────────────────────────────────────────────────
function CatFace({ s, col, blinkAnim, earL, earR }) {
  const rotL  = earL.interpolate({ inputRange: [0, 1], outputRange: ["-10deg", "0deg"] });
  const rotR  = earR.interpolate({ inputRange: [0, 1], outputRange: ["10deg", "0deg"] });
  const scL   = earL.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.0] });
  const scR   = earR.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.0] });

  return (
    <View style={{ width: s, height: s }}>

      {/* ── Orejas puntiagudas ── */}
      <Animated.View style={{
        position: "absolute", top: -s * 0.03, left: s * 0.09,
        width: s * 0.27, height: s * 0.38,
        borderTopLeftRadius: s * 0.03, borderTopRightRadius: s * 0.12,
        borderBottomLeftRadius: s * 0.13, borderBottomRightRadius: s * 0.13,
        backgroundColor: col.ear,
        transform: [{ rotate: rotL }, { scaleY: scL }],
        zIndex: 1,
      }} />
      <Animated.View style={{
        position: "absolute", top: -s * 0.03, right: s * 0.09,
        width: s * 0.27, height: s * 0.38,
        borderTopLeftRadius: s * 0.12, borderTopRightRadius: s * 0.03,
        borderBottomLeftRadius: s * 0.13, borderBottomRightRadius: s * 0.13,
        backgroundColor: col.ear,
        transform: [{ rotate: rotR }, { scaleY: scR }],
        zIndex: 1,
      }} />

      {/* ── Interior de orejas (rosa) ── */}
      <View style={{
        position: "absolute", top: s * 0.01, left: s * 0.135,
        width: s * 0.13, height: s * 0.22,
        borderTopLeftRadius: s * 0.02, borderTopRightRadius: s * 0.07,
        borderBottomLeftRadius: s * 0.065, borderBottomRightRadius: s * 0.065,
        backgroundColor: col.earInner, zIndex: 2,
      }} />
      <View style={{
        position: "absolute", top: s * 0.01, right: s * 0.135,
        width: s * 0.13, height: s * 0.22,
        borderTopLeftRadius: s * 0.07, borderTopRightRadius: s * 0.02,
        borderBottomLeftRadius: s * 0.065, borderBottomRightRadius: s * 0.065,
        backgroundColor: col.earInner, zIndex: 2,
      }} />

      {/* ── Sombra profundidad ── */}
      <View style={{
        position: "absolute", top: s * 0.15, left: s * 0.09,
        width: s * 0.83, height: s * 0.81, borderRadius: s * 0.415,
        backgroundColor: col.shadow, zIndex: 3,
      }} />

      {/* ── Cabeza principal ── */}
      <View style={{
        position: "absolute", top: s * 0.09, left: 0,
        width: s, height: s * 0.87, borderRadius: s * 0.435,
        backgroundColor: col.body, zIndex: 4,
      }}>
        {/* Reflejo 3D */}
        <View style={{
          position: "absolute", top: s * 0.09, left: s * 0.13,
          width: s * 0.27, height: s * 0.17, borderRadius: s * 0.09,
          backgroundColor: "rgba(255,255,255,0.36)",
        }} />

        {/* Ojo izquierdo (almendra) */}
        <Animated.View style={{
          position: "absolute", top: s * 0.32, left: s * 0.15,
          width: s * 0.24, height: s * 0.20, borderRadius: s * 0.10,
          backgroundColor: col.eye,
          transform: [{ scaleX: 0.72 }, { scaleY: blinkAnim }],
        }}>
          {/* Pupila vertical */}
          <View style={{
            position: "absolute", alignSelf: "center", top: s * 0.03,
            width: s * 0.075, height: s * 0.14, borderRadius: s * 0.04,
            backgroundColor: col.pupil,
          }} />
          {/* Brillo */}
          <View style={{
            position: "absolute", top: 2, right: 3,
            width: s * 0.055, height: s * 0.055, borderRadius: s * 0.028,
            backgroundColor: "#fff",
          }} />
        </Animated.View>

        {/* Ojo derecho (almendra) */}
        <Animated.View style={{
          position: "absolute", top: s * 0.32, right: s * 0.15,
          width: s * 0.24, height: s * 0.20, borderRadius: s * 0.10,
          backgroundColor: col.eye,
          transform: [{ scaleX: 0.72 }, { scaleY: blinkAnim }],
        }}>
          <View style={{
            position: "absolute", alignSelf: "center", top: s * 0.03,
            width: s * 0.075, height: s * 0.14, borderRadius: s * 0.04,
            backgroundColor: col.pupil,
          }} />
          <View style={{
            position: "absolute", top: 2, right: 3,
            width: s * 0.055, height: s * 0.055, borderRadius: s * 0.028,
            backgroundColor: "#fff",
          }} />
        </Animated.View>

        {/* Nariz triangular */}
        <View style={{
          position: "absolute", top: s * 0.53, alignSelf: "center",
          width: s * 0.13, height: s * 0.10,
          borderTopLeftRadius: s * 0.01, borderTopRightRadius: s * 0.01,
          borderBottomLeftRadius: s * 0.065, borderBottomRightRadius: s * 0.065,
          backgroundColor: col.nose,
        }} />

        {/* Sonrisa en U */}
        <View style={{
          position: "absolute", top: s * 0.61, alignSelf: "center",
          width: s * 0.26, height: s * 0.12,
          borderBottomLeftRadius: s * 0.12, borderBottomRightRadius: s * 0.12,
          borderLeftWidth: 2.5, borderRightWidth: 2.5, borderBottomWidth: 2.5,
          borderColor: col.pupil,
        }} />

        {/* Rubores */}
        <View style={{
          position: "absolute", top: s * 0.52, left: s * 0.07,
          width: s * 0.15, height: s * 0.09, borderRadius: s * 0.045,
          backgroundColor: "rgba(255,120,120,0.22)",
        }} />
        <View style={{
          position: "absolute", top: s * 0.52, right: s * 0.07,
          width: s * 0.15, height: s * 0.09, borderRadius: s * 0.045,
          backgroundColor: "rgba(255,120,120,0.22)",
        }} />
      </View>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ClayCharacter({ species = "dog", active = false, size = 80 }) {
  const palette = species === "dog" ? DOG : CAT;
  const col = active ? palette.actv : palette.idle;

  // Parpadeo periódico
  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let alive = true;
    const doBlink = () => {
      if (!alive) return;
      const delay = 2000 + Math.random() * 2500;
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(blinkAnim, { toValue: 0.04, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 95, useNativeDriver: true }),
      ]).start(() => doBlink());
    };
    doBlink();
    return () => { alive = false; };
  }, []);

  // Animación de orejas (activo = orejas más erguidas)
  const earL = useRef(new Animated.Value(active ? 1 : 0)).current;
  const earR = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    const t = active ? 1 : 0;
    Animated.spring(earL, { toValue: t, tension: 170, friction: 7, useNativeDriver: true }).start();
    Animated.spring(earR, { toValue: t, tension: 170, friction: 7, useNativeDriver: true }).start();
  }, [active]);

  /*
   * ── LOTTIE (futuro) ──────────────────────────────────────────────────────
   * 1. npx expo install lottie-react-native
   * 2. Coloca clay-dog.json y clay-cat.json en assets/lottie/
   * 3. Descomenta:
   *
   * import LottieView from "lottie-react-native";
   * const DOG_JSON = require("../../assets/lottie/clay-dog.json");
   * const CAT_JSON = require("../../assets/lottie/clay-cat.json");
   *
   * return (
   *   <LottieView
   *     source={species === "dog" ? DOG_JSON : CAT_JSON}
   *     autoPlay loop
   *     style={{ width: size, height: size }}
   *     speed={active ? 1.4 : 0.6}
   *   />
   * );
   * ─────────────────────────────────────────────────────────────────────────
   */

  if (species === "cat") {
    return <CatFace s={size} col={col} blinkAnim={blinkAnim} earL={earL} earR={earR} />;
  }
  return <DogFace s={size} col={col} blinkAnim={blinkAnim} earL={earL} earR={earR} />;
}
