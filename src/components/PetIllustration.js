import React from "react";
import Svg, { G, Path, Polygon, Circle, Line, Ellipse } from "react-native-svg";

// ── OpenMoji dog (1F436) — color modified: body #C2692A, tongue #F06050 ───────
export function DogIllustration({ size = 140, selected = false }) {
  return (
    <Svg viewBox="0 0 72 72" width={size} height={size}>
      <G id="color">
        <Path fill="#C2692A" d="m24.473,15.1583l-5.0799,1.9352-7.2963,7.901-4.1377,10.5005,1.291,5.3405c1.2554,3.7911,3.3357,6.4338,7.0626,9.2506l2.6874-2.5839s3.8218,7.7098,10.7384,8.9598c0,0,10.2616,1.936,15.5949-.8765,1.4899-.7857,2.5141-1.8291,3.2921-2.5939,2.0702-2.0351,3.033-3.5201,4.5413-5.2395h0s1.6701,1.8077,1.6701,1.8077l1.838-.0557,5.0169-7.2292,2.0032-5.0703-.0215-4.255-2.1735-5.6141-4.8333-7.4167s-2.6368-4.2558-8.1667-3.9167c0,0-6.5-4.8333-11.8333-4.0833s-3.6104-.6772-12.1937,3.2395Z"/>
        <Polygon fill="#F06050" points="36 46.7324 32.9167 49.1491 30.4167 49.1491 30.9413 53.0386 31.362 56.0539 32.1667 58.3991 35 59.8991 39.5833 59.3158 40.4429 57.1116 41.1441 52.9335 41.9167 49.3158 39.9167 49.5658 36 46.7324"/>
        <Polygon fill="#3f3f3f" points="32.5 36.9188 30.9167 40.6688 33.0833 41.9188 34.3333 42.4188 38.6667 42.5855 41.5833 40.3355 39.8333 37.0855 32.5 36.9188"/>
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
          <Ellipse cx="22" cy="38" rx="5" ry="3" fill="#FF9BB0" opacity="0.7"/>
          <Ellipse cx="50" cy="38" rx="5" ry="3" fill="#FF9BB0" opacity="0.7"/>
        </G>
      )}
    </Svg>
  );
}

// ── OpenMoji smiling cat face (1F638) — CC BY-SA 4.0 · hfg-gmuend.github.io/openmoji ─
export function CatIllustration({ size = 140, selected = false }) {
  return (
    <Svg viewBox="0 0 72 72" width={size} height={size}>
      <G id="color">
        {/* Body / face */}
        <Path fill="#F4AA41" d="M15.999,14.0019c0,0-6.3985,6.4-5.5985,17.2001 c0.4,5.2,2.7998,9.9995,5.5985,14.1992c2.6992,4.0999,7,8.5,13.3994,10.7998c3.2998,1.2002,6.2998,1.2002,6.2998,1.2002 s3,0,6.2998-1.2002c6.3994-2.2998,10.7002-6.6999,13.3994-10.7998c2.7988-4.1997,5.1987-8.9993,5.5985-14.1992 c0.8-10.8001-5.5985-17.2001-5.5985-17.2001L55.2998,6.2002C55.2998,6.2002,50.2998,9.6,36,9.6 s-19.2998-3.3998-19.2998-3.3998L15.999,14.0019z"/>
        {/* Ear inner left */}
        <Path fill="#F17B26" d="M16.7,13.4l-0.7012,0.6019C13.5,16.7,11.5,20.1,11,23.6c1.7-2.7,4.2-5.1,7.8-6.5 C18.1,15.9,17.4,14.5,16.7,13.4z"/>
        {/* Ear inner right */}
        <Path fill="#F17B26" d="M55.3,13.4l0.7012,0.6019C58.5,16.7,60.5,20.1,61,23.6c-1.7-2.7-4.2-5.1-7.8-6.5 C53.9,15.9,54.6,14.5,55.3,13.4z"/>
        {/* Muzzle white area */}
        <Ellipse fill="#FDEBC8" cx="36" cy="46" rx="9" ry="6"/>
        {/* Mouth / smile */}
        <Path fill="#F17B26" d="M30.5,47.5c0,0,2.5,4.5,5.5,4.5s5.5-4.5,5.5-4.5H30.5z"/>
      </G>
      <G id="hair">
        {/* Forehead tufts */}
        <Path fill="#F17B26" d="M29,14c0,0-3,3-3,7h3C29,21,28,17,29,14z"/>
        <Path fill="#F17B26" d="M36,12c0,0-1,4-1,9h2C37,21,37,16,36,12z"/>
        <Path fill="#F17B26" d="M43,14c0,0,3,3,3,7h-3C43,21,44,17,43,14z"/>
      </G>
      <G id="line">
        {/* Outer outline */}
        <Path fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M15.999,14.0019c0,0-6.3985,6.4-5.5985,17.2001c0.4,5.2,2.7998,9.9995,5.5985,14.1992 c2.6992,4.0999,7,8.5,13.3994,10.7998c3.2998,1.2002,6.2998,1.2002,6.2998,1.2002s3,0,6.2998-1.2002 c6.3994-2.2998,10.7002-6.6999,13.3994-10.7998c2.7988-4.1997,5.1987-8.9993,5.5985-14.1992 c0.8-10.8001-5.5985-17.2001-5.5985-17.2001L55.2998,6.2002C55.2998,6.2002,50.2998,9.6,36,9.6 s-19.2998-3.3998-19.2998-3.3998L15.999,14.0019z"/>
        {/* Eyes — happy arc shape (smiling) */}
        <Path fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round"
          d="M26,32 Q28,28 30,32"/>
        <Path fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round"
          d="M42,32 Q44,28 46,32"/>
        {/* Nose */}
        <Path fill="#D2691E" stroke="#000" strokeWidth="1" d="M34.5,39.5 L36,41.5 L37.5,39.5 Z"/>
        {/* Whiskers left */}
        <Line x1="20" y1="40" x2="31" y2="41.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        <Line x1="20" y1="44" x2="31" y2="43" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Whiskers right */}
        <Line x1="52" y1="40" x2="41" y2="41.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        <Line x1="52" y1="44" x2="41" y2="43" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Big smile */}
        <Path fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round"
          d="M30,44 Q36,52 42,44"/>
        {/* Muzzle outline */}
        <Ellipse cx="36" cy="46" rx="9" ry="6" fill="none" stroke="#000" strokeWidth="1.2"/>
      </G>
      {selected && (
        <G id="selected-overlay">
          {/* Blush cheeks */}
          <Ellipse cx="21" cy="44" rx="5.5" ry="3" fill="#FF9BB0" opacity="0.7"/>
          <Ellipse cx="51" cy="44" rx="5.5" ry="3" fill="#FF9BB0" opacity="0.7"/>
          {/* Heart eyes */}
          <Path fill="#FF4D6D" d="M25,29 C25,27.2 26.5,26 28,27.5 C29.5,26 31,27.2 31,29 C31,31 28,33.5 28,33.5 C28,33.5 25,31 25,29Z" opacity="0.9"/>
          <Path fill="#FF4D6D" d="M41,29 C41,27.2 42.5,26 44,27.5 C45.5,26 47,27.2 47,29 C47,31 44,33.5 44,33.5 C44,33.5 41,31 41,29Z" opacity="0.9"/>
        </G>
      )}
    </Svg>
  );
}
