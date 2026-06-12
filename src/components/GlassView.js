import React from "react";
import { View } from "react-native";

// Drop-in replacement for BlurView that works in any Expo Go version.
// tint="dark"  → dark semi-transparent glass
// tint="light" → light semi-transparent glass
export default function GlassView({ intensity = 20, tint = "dark", style, children }) {
  const isDark = tint === "dark";

  const base = isDark
    ? `rgba(10, 12, 35, ${0.55 + intensity * 0.005})`
    : `rgba(255, 255, 255, ${0.38 + intensity * 0.006})`;

  const border = isDark
    ? "rgba(255,255,255,0.09)"
    : "rgba(255,255,255,0.70)";

  return (
    <View
      style={[
        {
          backgroundColor: base,
          borderWidth: 1,
          borderColor: border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
