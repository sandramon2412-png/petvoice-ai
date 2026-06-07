import React from "react";
import Svg, { G, Path, Circle, Line, Ellipse } from "react-native-svg";

// ── OpenMoji dog (1F436) — body #C2692A ──────────────────────────────────────
export function DogIllustration({ size = 140, selected = false }) {
  return (
    <Svg viewBox="0 0 72 72" width={size} height={size}>
      <G id="color">
        <Path fill="#C2692A" d="m24.473,15.1583l-5.0799,1.9352-7.2963,7.901-4.1377,10.5005,1.291,5.3405c1.2554,3.7911,3.3357,6.4338,7.0626,9.2506l2.6874-2.5839s3.8218,7.7098,10.7384,8.9598c0,0,10.2616,1.936,15.5949-.8765,1.4899-.7857,2.5141-1.8291,3.2921-2.5939,2.0702-2.0351,3.033-3.5201,4.5413-5.2395h0s1.6701,1.8077,1.6701,1.8077l1.838-.0557,5.0169-7.2292,2.0032-5.0703-.0215-4.255-2.1735-5.6141-4.8333-7.4167s-2.6368-4.2558-8.1667-3.9167c0,0-6.5-4.8333-11.8333-4.0833s-3.6104-.6772-12.1937,3.2395Z"/>
        <Path fill="#F06050" d="M30.4167,49.1491l-0.4754,3.8895,0.4207,3.0153,0.8047,2.3452,2.8333,1.5,4.5834-0.5833,0.8596-2.2042,0.7012-4.1781,0.7726-3.6177l-1.9999,0.25L36,46.7324l-3.0833,2.4167H30.4167z"/>
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
          {/* Round blush circles on cheeks — dog cheeks are around y=43 */}
          <Circle cx="21" cy="43" r="5.5" fill="#FF9BB0" opacity="0.72"/>
          <Circle cx="51" cy="43" r="5.5" fill="#FF9BB0" opacity="0.72"/>
        </G>
      )}
    </Svg>
  );
}

// ── Kawaii cat — big round eyes, tiny nose, sweet smile ──────────────────────
export function CatIllustration({ size = 140, selected = false }) {
  return (
    <Svg viewBox="0 0 72 72" width={size} height={size}>
      {/* ── Colors ── */}

      {/* Ears */}
      <Path fill="#E8922A" d="M14,8 L14,26 L24,22 Z"/>
      <Path fill="#E8922A" d="M58,8 L58,26 L48,22 Z"/>
      {/* Ear inner pink */}
      <Path fill="#F9C5A7" d="M16,12 L16,23 L23,20 Z"/>
      <Path fill="#F9C5A7" d="M56,12 L56,23 L49,20 Z"/>

      {/* Round face */}
      <Circle cx="36" cy="38" r="24" fill="#F5A623"/>
      {/* Lighter forehead highlight */}
      <Ellipse cx="36" cy="26" rx="14" ry="8" fill="#F9C87A" opacity="0.55"/>

      {/* White muzzle area */}
      <Ellipse cx="36" cy="48" rx="11" ry="8" fill="#FFF3DC"/>

      {/* ── Face features ── */}

      {/* Eyes — big cute circles */}
      {!selected ? (
        <G>
          <Circle cx="26" cy="36" r="5.5" fill="#1A1A2E"/>
          <Circle cx="46" cy="36" r="5.5" fill="#1A1A2E"/>
          {/* Eye shine */}
          <Circle cx="27.8" cy="34.2" r="1.8" fill="#fff"/>
          <Circle cx="47.8" cy="34.2" r="1.8" fill="#fff"/>
          {/* Small bottom shine */}
          <Circle cx="25.2" cy="38" r="0.9" fill="#fff" opacity="0.6"/>
          <Circle cx="45.2" cy="38" r="0.9" fill="#fff" opacity="0.6"/>
        </G>
      ) : (
        <G>
          {/* Heart eyes when selected */}
          <Path fill="#FF2D55" d="M21,33.5 C21,31 23,30 25,31.8 C27,30 29,31 29,33.5 C29,36.5 25,39.5 25,39.5 C25,39.5 21,36.5 21,33.5Z"/>
          <Path fill="#FF2D55" d="M43,33.5 C43,31 45,30 47,31.8 C49,30 51,31 51,33.5 C51,36.5 47,39.5 47,39.5 C47,39.5 43,36.5 43,33.5Z"/>
          {/* Small heart shine */}
          <Circle cx="23.5" cy="32" r="1.2" fill="#fff" opacity="0.7"/>
          <Circle cx="45.5" cy="32" r="1.2" fill="#fff" opacity="0.7"/>
        </G>
      )}

      {/* Nose — tiny triangle */}
      <Path fill="#C0392B" d="M34.5,44 L36,46 L37.5,44 Z"/>

      {/* Mouth — cute W shape */}
      <Path fill="none" stroke="#7B3F00" strokeWidth="1.6" strokeLinecap="round"
        d="M31,47 Q33.5,50 36,48 Q38.5,50 41,47"/>

      {/* Whiskers */}
      <Line x1="10" y1="44" x2="27" y2="46" stroke="#7B3F00" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <Line x1="10" y1="48" x2="27" y2="48" stroke="#7B3F00" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <Line x1="62" y1="44" x2="45" y2="46" stroke="#7B3F00" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <Line x1="62" y1="48" x2="45" y2="48" stroke="#7B3F00" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>

      {/* Forehead stripe markings */}
      <Path fill="none" stroke="#D4820A" strokeWidth="1.2" strokeLinecap="round"
        d="M31,18 Q33,14 36,13 Q39,14 41,18" opacity="0.6"/>

      {/* Outline */}
      <Circle cx="36" cy="38" r="24" fill="none" stroke="#7B3F00" strokeWidth="1.8"/>
      <Path fill="none" stroke="#7B3F00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        d="M14,8 L14,26 L24,22"/>
      <Path fill="none" stroke="#7B3F00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        d="M58,8 L58,26 L48,22"/>

      {selected && (
        <G id="blush">
          {/* Round blush circles on cheeks */}
          <Circle cx="18" cy="46" r="5.5" fill="#FF9BB0" opacity="0.72"/>
          <Circle cx="54" cy="46" r="5.5" fill="#FF9BB0" opacity="0.72"/>
        </G>
      )}
    </Svg>
  );
}
