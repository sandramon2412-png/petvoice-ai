import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { G, Path, Circle, Line, Ellipse } from "react-native-svg";

// ── OpenMoji dog (1F436) — body #C2692A ──────────────────────────────────────
export function DogIllustration({ size = 140, selected = false }) {
  const tongueAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(tongueAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(tongueAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.delay(400),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      tongueAnim.setValue(0);
    }
  }, [selected]);

  // tongue moves down by ~6px (in screen coords) when sticking out
  const tongueY = tongueAnim.interpolate({ inputRange: [0, 1], outputRange: [0, size * 6 / 72] });
  return (
    <Animated.View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 72 72" width={size} height={size} style={{ position: "absolute" }}>
        <G id="color">
          <Path fill="#C2692A" d="m24.473,15.1583l-5.0799,1.9352-7.2963,7.901-4.1377,10.5005,1.291,5.3405c1.2554,3.7911,3.3357,6.4338,7.0626,9.2506l2.6874-2.5839s3.8218,7.7098,10.7384,8.9598c0,0,10.2616,1.936,15.5949-.8765,1.4899-.7857,2.5141-1.8291,3.2921-2.5939,2.0702-2.0351,3.033-3.5201,4.5413-5.2395h0s1.6701,1.8077,1.6701,1.8077l1.838-.0557,5.0169-7.2292,2.0032-5.0703-.0215-4.255-2.1735-5.6141-4.8333-7.4167s-2.6368-4.2558-8.1667-3.9167c0,0-6.5-4.8333-11.8333-4.0833s-3.6104-.6772-12.1937,3.2395Z"/>
          <Path fill="#3f3f3f" d="M32.5,36.9188l-1.5833,3.75,2.1666,1.25,1.25,0.5,4.3334,0.1667,2.9166-2.25l-1.75-3.25L32.5,36.9188z"/>
        </G>
        <G id="line">
          <Path d="m29.5059,30.1088s-1.8051,1.2424-2.7484.6679c-.9434-.5745-1.2424-1.8051-.6679-2.7484s1.805-1.2424,2.7484-.6679.6679,2.7484.6679,2.7484Z"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m33.1089,37.006h6.1457c.4011,0,.7634.2397.9203.6089l1.1579,2.7245-2.1792,1.1456c-.6156.3236-1.3654-.0645-1.4567-.754"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m34.7606,40.763c-.1132.6268-.7757.9895-1.3647.7471l-2.3132-.952,1.0899-2.9035c.1465-.3901.5195-.6486.9362-.6486"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m30.4364,50.0268s-.7187,8.7934,3.0072,9.9375c2.6459.8125,5.1497.5324,6.0625-.25.875-.75,2.6323-4.4741,1.8267-9.6875"/>
          <Path d="m44.2636,30.1088s1.805,1.2424,2.7484.6679,1.2424-1.8051.6679-2.7484c-.5745-.9434-1.805-1.2424-2.7484-.6679s-.6679,2.7484-.6679,2.7484Z"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m25.6245,42.8393c-.475,3.6024,2.2343,5.7505,4.2847,6.8414,1.1968.6367,2.6508.5182,3.7176-.3181l2.581-2.0233,2.581,2.0233c1.0669.8363,2.5209.9548,3.7176.3181,2.0504-1.0909,4.7597-3.239,4.2847-6.8414"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.9509,28.3572c-2.3166,5.1597-.5084,13.0249.119,15.3759.122.4571.0755.9355-.1271,1.3631l-1.9874,4.1937c-.623,1.3146-2.3934,1.5533-3.331.4409-3.1921-3.7871-8.5584-11.3899-6.5486-16.686,7.0625-18.6104,15.8677-18.1429,15.8677-18.1429,2.8453-1.9336,13.1042-6.9375,24.8125.875,0,0,8.6323-1.7175,14.9375,16.9375,1.8036,5.3362-3.4297,12.8668-6.5506,16.6442-.9312,1.127-2.7162.8939-3.3423-.4272l-1.9741-4.1656c-.2026-.4275-.2491-.906-.1271-1.3631.6275-2.3509,2.4356-10.2161.119-15.3759"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m52.6309,46.4628s-3.0781,6.7216-7.8049,8.2712"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.437,46.969s3.0781,6.0823,7.8049,7.632"/>
          <Line x1="36.2078" x2="36.2078" y1="47.3393" y2="44.3093" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </G>
        {selected && (
          <G id="blush">
            <Circle cx="20" cy="35" r="3.5" fill="#FF9BB0" opacity="0.75"/>
            <Circle cx="52" cy="35" r="3.5" fill="#FF9BB0" opacity="0.75"/>
          </G>
        )}
      </Svg>

      {/* Tongue — slides down to simulate sticking out */}
      <Animated.View style={{
        position: "absolute", width: size, height: size,
        transform: [{ translateY: tongueY }],
      }}>
        <Svg viewBox="0 0 72 72" width={size} height={size}>
          <Path fill="#F06050" d="M30.4167,49.1491l-0.4754,3.8895,0.4207,3.0153,0.8047,2.3452,2.8333,1.5,4.5834-0.5833,0.8596-2.2042,0.7012-4.1781,0.7726-3.6177l-1.9999,0.25L36,46.7324l-3.0833,2.4167H30.4167z"/>
          <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m30.4364,50.0268s-.7187,8.7934,3.0072,9.9375c2.6459.8125,5.1497.5324,6.0625-.25.875-.75,2.6323-4.4741,1.8267-9.6875"/>
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

// ── OpenMoji-style cat face — same artistic language as the dog ───────────────
export function CatIllustration({ size = 140, selected = false }) {
  return (
    <Svg viewBox="0 0 72 72" width={size} height={size}>
      <G id="color">
        {/* Main head — golden orange, same palette family as OpenMoji cats */}
        <Path fill="#F4AA41"
          d="M10,38 C10,22 20,10 36,10 C52,10 62,22 62,38 C62,54 52,64 36,64 C20,64 10,54 10,38 Z"/>
        {/* Left ear */}
        <Path fill="#F4AA41"
          d="M14,28 C14,28 10,10 18,6 C22,14 22,24 22,28 Z"/>
        {/* Right ear */}
        <Path fill="#F4AA41"
          d="M58,28 C58,28 62,10 54,6 C50,14 50,24 50,28 Z"/>
        {/* Ear inner left — pink */}
        <Path fill="#E0737A"
          d="M16,26 C16,26 13,13 18,9 C21,15 21,22 21,26 Z"/>
        {/* Ear inner right — pink */}
        <Path fill="#E0737A"
          d="M56,26 C56,26 59,13 54,9 C51,15 51,22 51,26 Z"/>
        {/* Muzzle / chin area — lighter cream */}
        <Ellipse fill="#FDEBC8" cx="36" cy="50" rx="12" ry="9"/>
      </G>

      <G id="markings">
        {/* Forehead tabby stripes */}
        <Path fill="#D4880A" opacity="0.45"
          d="M30,16 Q33,13 36,15 Q39,13 42,16 Q39,19 36,18 Q33,19 30,16 Z"/>
        <Path fill="#D4880A" opacity="0.3"
          d="M28,22 Q32,19 36,21 Q40,19 44,22 Q40,24 36,23 Q32,24 28,22 Z"/>
      </G>

      <G id="line">
        {/* Head outline */}
        <Path fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M10,38 C10,22 20,10 36,10 C52,10 62,22 62,38 C62,54 52,64 36,64 C20,64 10,54 10,38 Z"/>
        {/* Left ear outline */}
        <Path fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M14,28 C14,28 10,10 18,6 C22,14 22,24 22,28"/>
        {/* Right ear outline */}
        <Path fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M58,28 C58,28 62,10 54,6 C50,14 50,24 50,28"/>

        {/* Eyes — same filled-dot style as OpenMoji dog */}
        {!selected ? (
          <G>
            <Circle cx="26" cy="36" r="4.5" fill="#1A1A2E"/>
            <Circle cx="46" cy="36" r="4.5" fill="#1A1A2E"/>
            <Circle cx="27.5" cy="34.5" r="1.6" fill="#fff"/>
            <Circle cx="47.5" cy="34.5" r="1.6" fill="#fff"/>
          </G>
        ) : (
          <G>
            {/* Heart eyes */}
            <Path fill="#FF2D55"
              d="M22,34 C22,31.5 24,30.2 26,32 C28,30.2 30,31.5 30,34 C30,37 26,40 26,40 C26,40 22,37 22,34Z"/>
            <Path fill="#FF2D55"
              d="M42,34 C42,31.5 44,30.2 46,32 C48,30.2 50,31.5 50,34 C50,37 46,40 46,40 C46,40 42,37 42,34Z"/>
            <Circle cx="24" cy="32.5" r="1.2" fill="#fff" opacity="0.7"/>
            <Circle cx="44" cy="32.5" r="1.2" fill="#fff" opacity="0.7"/>
          </G>
        )}

        {/* Nose — small triangle */}
        <Path fill="#C0392B" stroke="#000" strokeWidth="0.8" strokeLinejoin="round"
          d="M34.2,46 L36,48.5 L37.8,46 Z"/>

        {/* Mouth — cute cat W shape */}
        <Path fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round"
          d="M30,50 Q33,54 36,51.5 Q39,54 42,50"/>

        {/* Muzzle outline */}
        <Ellipse cx="36" cy="50" rx="12" ry="9" fill="none" stroke="#000" strokeWidth="1.4"/>

        {/* Whiskers — left */}
        <Line x1="8"  y1="46" x2="25" y2="48" stroke="#000" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <Line x1="8"  y1="51" x2="25" y2="51" stroke="#000" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        {/* Whiskers — right */}
        <Line x1="64" y1="46" x2="47" y2="48" stroke="#000" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <Line x1="64" y1="51" x2="47" y2="51" stroke="#000" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </G>

      {selected && (
        <G id="blush">
          <Circle cx="17" cy="44" r="4" fill="#FF9BB0" opacity="0.72"/>
          <Circle cx="55" cy="44" r="4" fill="#FF9BB0" opacity="0.72"/>
        </G>
      )}
    </Svg>
  );
}
