import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

const NUM_BARS = 30;
const GAP = 2.8;

// Three-sine Siri-style liquid wave rendered as thin rounded bars.
// Uses transform (scaleY + translateY) so animation stays off the layout engine.
export default function SiriWave({
  color = "#6366F1",
  width = 280,
  height = 80,
  intensity = 1,
  speed = 1,
}) {
  const barAnims = useRef(
    Array.from({ length: NUM_BARS }, () => new Animated.Value(0.04))
  ).current;
  const phaseRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      phaseRef.current += 0.055 * speed;
      const p = phaseRef.current;
      for (let i = 0; i < NUM_BARS; i++) {
        const x = i / (NUM_BARS - 1);
        // Bell-shaped envelope so edges taper to near-zero
        const envelope = Math.sin(x * Math.PI);
        // Three overlapping sine waves — different freq & phase for liquid feel
        const wave =
          Math.sin(p + x * 7.0) * 0.52 +
          Math.sin(p * 0.73 + x * 12.0 + 1.4) * 0.28 +
          Math.sin(p * 1.42 + x * 4.8 - 0.9) * 0.20;
        const norm = Math.max(0.04, (wave * envelope * 0.5 + 0.5) * Math.min(1, intensity));
        barAnims[i].setValue(norm);
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [intensity, speed]);

  const barW = Math.max(2, (width - (NUM_BARS - 1) * GAP) / NUM_BARS);
  const maxH = height * 0.88;

  return (
    <View
      style={{
        width,
        height,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {barAnims.map((anim, i) => {
        // translateY anchors bars to bottom as they shrink
        const translateY = anim.interpolate({
          inputRange: [0.04, 1.0],
          outputRange: [maxH * 0.48, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              width: barW,
              height: maxH,
              marginHorizontal: GAP / 2,
              borderRadius: barW,
              backgroundColor: color,
              // Neon glow — soft light emission on each bar
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.72,
              shadowRadius: 7,
              elevation: 4,
              transform: [{ scaleY: anim }, { translateY }],
            }}
          />
        );
      })}
    </View>
  );
}
