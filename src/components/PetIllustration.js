import React from "react";
import Svg, {
  Circle, Ellipse, Path, G, Defs,
  RadialGradient, LinearGradient as SvgLinear,
  Stop, ClipPath, Rect,
} from "react-native-svg";

// ── Premium clay-style dog illustration ──────────────────────────────────────
export function DogIllustration({ size = 160, selected = false }) {
  const s = size / 160;
  const bodyColor   = selected ? "#F97316" : "#FB923C";
  const bodyDark    = selected ? "#C2410C" : "#EA580C";
  const bodyLight   = selected ? "#FED7AA" : "#FFEDD5";
  const earColor    = selected ? "#C2410C" : "#EA580C";
  const noseColor   = "#1C0A00";
  const eyeColor    = "#1C0A00";

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Defs>
        {/* Body radial gradient — gives clay sphere feel */}
        <RadialGradient id="bodyGrad" cx="42%" cy="32%" r="58%">
          <Stop offset="0%" stopColor={bodyLight} stopOpacity="1" />
          <Stop offset="55%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={bodyDark} stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="headGrad" cx="40%" cy="30%" r="60%">
          <Stop offset="0%" stopColor={bodyLight} stopOpacity="1" />
          <Stop offset="50%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={bodyDark} stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="earGrad" cx="35%" cy="25%" r="65%">
          <Stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={earColor} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Drop shadow under body */}
      <Ellipse cx="80" cy="148" rx="38" ry="7" fill={bodyDark} opacity="0.25" />

      {/* Body */}
      <Ellipse cx="80" cy="112" rx="38" ry="32" fill="url(#bodyGrad)" />

      {/* Front legs */}
      <Ellipse cx="58" cy="138" rx="12" ry="8" fill={bodyColor} />
      <Ellipse cx="102" cy="138" rx="12" ry="8" fill={bodyColor} />
      {/* Paw highlight */}
      <Ellipse cx="58" cy="141" rx="7" ry="4" fill={bodyLight} opacity="0.4" />
      <Ellipse cx="102" cy="141" rx="7" ry="4" fill={bodyLight} opacity="0.4" />

      {/* Tail — curved path */}
      <Path
        d="M 116 118 Q 145 105 138 88 Q 132 74 120 80"
        stroke={bodyColor} strokeWidth="11" strokeLinecap="round" fill="none"
      />
      <Path
        d="M 116 118 Q 145 105 138 88 Q 132 74 120 80"
        stroke={bodyLight} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35"
      />

      {/* Floppy ears — behind head */}
      <Path
        d="M 50 72 Q 34 60 36 82 Q 38 96 54 92"
        fill="url(#earGrad)" />
      <Path
        d="M 110 72 Q 126 60 124 82 Q 122 96 106 92"
        fill="url(#earGrad)" />

      {/* Head */}
      <Circle cx="80" cy="76" r="36" fill="url(#headGrad)" />

      {/* Forehead shine — clay highlight */}
      <Ellipse cx="68" cy="60" rx="12" ry="8" fill={bodyLight} opacity="0.38" transform="rotate(-20 68 60)" />

      {/* Snout */}
      <Ellipse cx="80" cy="88" rx="18" ry="13" fill={bodyLight} opacity="0.7" />
      <Ellipse cx="80" cy="88" rx="15" ry="10" fill={bodyColor} opacity="0.2" />

      {/* Nose */}
      <Path d="M 74 84 Q 80 80 86 84 Q 83 90 80 90 Q 77 90 74 84 Z" fill={noseColor} />
      {/* Nose shine */}
      <Ellipse cx="76" cy="83" rx="3" ry="2" fill="white" opacity="0.5" />

      {/* Mouth */}
      <Path d="M 75 91 Q 80 97 85 91" stroke={bodyDark} strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <Circle cx="65" cy="74" r="7" fill={eyeColor} />
      <Circle cx="95" cy="74" r="7" fill={eyeColor} />
      {/* Eye shine */}
      <Circle cx="67" cy="72" r="2.5" fill="white" />
      <Circle cx="97" cy="72" r="2.5" fill="white" />
      <Circle cx="68.5" cy="73.5" r="1" fill="white" opacity="0.6" />
      <Circle cx="98.5" cy="73.5" r="1" fill="white" opacity="0.6" />

      {/* Eyebrows — give personality */}
      <Path d="M 59 66 Q 65 63 71 66" stroke={bodyDark} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M 89 66 Q 95 63 101 66" stroke={bodyDark} strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Inner ear detail */}
      <Path
        d="M 44 76 Q 38 66 42 82 Q 44 90 50 88"
        fill={noseColor} opacity="0.15" />
      <Path
        d="M 116 76 Q 122 66 118 82 Q 116 90 110 88"
        fill={noseColor} opacity="0.15" />
    </Svg>
  );
}

// ── Premium clay-style cat illustration ──────────────────────────────────────
export function CatIllustration({ size = 160, selected = false }) {
  const bodyColor   = selected ? "#A855F7" : "#C084FC";
  const bodyDark    = selected ? "#7C3AED" : "#9333EA";
  const bodyLight   = selected ? "#EDE9FE" : "#F3E8FF";
  const eyeIris     = selected ? "#10B981" : "#34D399";
  const eyeDark     = "#0F172A";
  const noseColor   = "#BE185D";

  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Defs>
        <RadialGradient id="catBodyGrad" cx="42%" cy="30%" r="60%">
          <Stop offset="0%" stopColor={bodyLight} stopOpacity="1" />
          <Stop offset="50%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={bodyDark} stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="catHeadGrad" cx="38%" cy="28%" r="62%">
          <Stop offset="0%" stopColor={bodyLight} stopOpacity="1" />
          <Stop offset="48%" stopColor={bodyColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={bodyDark} stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="eyeGrad" cx="30%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#6EE7B7" stopOpacity="1" />
          <Stop offset="100%" stopColor={eyeIris} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Drop shadow */}
      <Ellipse cx="80" cy="149" rx="34" ry="6" fill={bodyDark} opacity="0.22" />

      {/* Tail — sweeping around the side */}
      <Path
        d="M 46 128 Q 18 115 22 90 Q 26 70 42 78"
        stroke={bodyColor} strokeWidth="12" strokeLinecap="round" fill="none"
      />
      <Path
        d="M 46 128 Q 18 115 22 90 Q 26 70 42 78"
        stroke={bodyLight} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.3"
      />

      {/* Body */}
      <Ellipse cx="82" cy="114" rx="34" ry="28" fill="url(#catBodyGrad)" />

      {/* Front legs — slim */}
      <Ellipse cx="62" cy="137" rx="10" ry="7" fill={bodyColor} />
      <Ellipse cx="102" cy="137" rx="10" ry="7" fill={bodyColor} />
      <Ellipse cx="62" cy="140" rx="6" ry="3.5" fill={bodyLight} opacity="0.45" />
      <Ellipse cx="102" cy="140" rx="6" ry="3.5" fill={bodyLight} opacity="0.45" />

      {/* Pointed ears — behind head */}
      <Path d="M 52 60 L 42 36 L 66 54 Z" fill={bodyColor} />
      <Path d="M 108 60 L 118 36 L 94 54 Z" fill={bodyColor} />
      {/* Inner ear */}
      <Path d="M 54 58 L 47 42 L 63 55 Z" fill={noseColor} opacity="0.35" />
      <Path d="M 106 58 L 113 42 L 97 55 Z" fill={noseColor} opacity="0.35" />

      {/* Head */}
      <Circle cx="80" cy="74" r="32" fill="url(#catHeadGrad)" />

      {/* Head shine */}
      <Ellipse cx="67" cy="59" rx="11" ry="7" fill={bodyLight} opacity="0.42" transform="rotate(-20 67 59)" />

      {/* Cheek fluff — cat specific */}
      <Ellipse cx="55" cy="82" rx="10" ry="7" fill={bodyLight} opacity="0.35" />
      <Ellipse cx="105" cy="82" rx="10" ry="7" fill={bodyLight} opacity="0.35" />

      {/* Snout / muzzle */}
      <Ellipse cx="80" cy="86" rx="15" ry="10" fill={bodyLight} opacity="0.65" />

      {/* Nose — small triangle */}
      <Path d="M 77 82 L 80 79 L 83 82 L 80 85 Z" fill={noseColor} />
      {/* Nose shine */}
      <Ellipse cx="78" cy="81" rx="2" ry="1.5" fill="white" opacity="0.55" />

      {/* Mouth */}
      <Path d="M 80 85 Q 76 90 73 88" stroke={bodyDark} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M 80 85 Q 84 90 87 88" stroke={bodyDark} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Whiskers */}
      <Path d="M 60 83 L 72 85" stroke={bodyDark} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Path d="M 58 87 L 71 87" stroke={bodyDark} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Path d="M 100 83 L 88 85" stroke={bodyDark} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <Path d="M 102 87 L 89 87" stroke={bodyDark} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

      {/* Eyes — cat almond shape */}
      <Path d="M 60 72 Q 67 65 74 72 Q 67 79 60 72 Z" fill={eyeDark} />
      <Path d="M 86 72 Q 93 65 100 72 Q 93 79 86 72 Z" fill={eyeDark} />
      {/* Iris */}
      <Path d="M 62 72 Q 67 67 72 72 Q 67 77 62 72 Z" fill="url(#eyeGrad)" />
      <Path d="M 88 72 Q 93 67 98 72 Q 93 77 88 72 Z" fill="url(#eyeGrad)" />
      {/* Pupil */}
      <Path d="M 65 72 Q 67 69 69 72 Q 67 75 65 72 Z" fill={eyeDark} />
      <Path d="M 91 72 Q 93 69 95 72 Q 93 75 91 72 Z" fill={eyeDark} />
      {/* Eye shine */}
      <Circle cx="65" cy="70" r="2" fill="white" />
      <Circle cx="91" cy="70" r="2" fill="white" />

      {/* Body tummy lighter patch */}
      <Ellipse cx="82" cy="116" rx="18" ry="14" fill={bodyLight} opacity="0.3" />
    </Svg>
  );
}
