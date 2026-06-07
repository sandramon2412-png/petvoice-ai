import React from "react";
import Svg, {
  Circle, Ellipse, Path, G, Defs,
  RadialGradient, LinearGradient as SvgLinear,
  Stop,
} from "react-native-svg";

// ── Friendly clay dog ─────────────────────────────────────────────────────────
// Big head, long snout, floppy hanging ears, round happy eyes
export function DogIllustration({ size = 160, selected = false }) {
  const fur     = selected ? "#F97316" : "#FB923C";
  const furDark = selected ? "#C2410C" : "#EA580C";
  const furLite = selected ? "#FED7AA" : "#FFEDD5";
  const muzzle  = "#FEF3C7";
  const nose    = "#1C1917";
  const eye     = "#1C1917";

  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
      <Defs>
        <RadialGradient id="dHead" cx="38%" cy="30%" r="65%">
          <Stop offset="0%" stopColor={furLite} />
          <Stop offset="45%" stopColor={fur} />
          <Stop offset="100%" stopColor={furDark} />
        </RadialGradient>
        <RadialGradient id="dBody" cx="40%" cy="25%" r="65%">
          <Stop offset="0%" stopColor={furLite} />
          <Stop offset="50%" stopColor={fur} />
          <Stop offset="100%" stopColor={furDark} />
        </RadialGradient>
        <RadialGradient id="dMuzzle" cx="35%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </RadialGradient>
      </Defs>

      {/* Ground shadow */}
      <Ellipse cx="90" cy="168" rx="42" ry="7" fill={furDark} opacity="0.2" />

      {/* Body */}
      <Ellipse cx="90" cy="130" rx="38" ry="30" fill="url(#dBody)" />

      {/* Legs */}
      <Ellipse cx="68" cy="152" rx="13" ry="9" fill={fur} />
      <Ellipse cx="112" cy="152" rx="13" ry="9" fill={fur} />
      <Ellipse cx="68"  cy="156" rx="8"  ry="4" fill={furLite} opacity="0.45" />
      <Ellipse cx="112" cy="156" rx="8"  ry="4" fill={furLite} opacity="0.45" />

      {/* Tail */}
      <Path d="M 125 120 Q 155 108 148 88 Q 142 72 128 78"
        stroke={fur} strokeWidth="13" strokeLinecap="round" fill="none" />
      <Path d="M 125 120 Q 155 108 148 88 Q 142 72 128 78"
        stroke={furLite} strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.4" />

      {/* Floppy ears — hang DOWN beside head */}
      <Path d="M 52 68 Q 30 72 28 92 Q 27 110 46 112 Q 55 113 58 100 Q 60 88 56 78 Z"
        fill={furDark} />
      <Path d="M 52 68 Q 34 72 33 90 Q 32 106 48 108 Q 54 109 55 96 Q 57 84 54 76 Z"
        fill={fur} />
      <Path d="M 128 68 Q 150 72 152 92 Q 153 110 134 112 Q 125 113 122 100 Q 120 88 124 78 Z"
        fill={furDark} />
      <Path d="M 128 68 Q 146 72 147 90 Q 148 106 132 108 Q 126 109 125 96 Q 123 84 126 76 Z"
        fill={fur} />

      {/* Head — large and round */}
      <Circle cx="90" cy="80" r="44" fill="url(#dHead)" />

      {/* Head shine */}
      <Ellipse cx="74" cy="58" rx="14" ry="9"
        fill={furLite} opacity="0.4" transform="rotate(-25 74 58)" />

      {/* Muzzle — distinct snout, not monkey-flat */}
      <Ellipse cx="90" cy="96" rx="26" ry="19" fill="url(#dMuzzle)" />
      {/* Muzzle shade for depth */}
      <Ellipse cx="90" cy="100" rx="22" ry="12" fill={fur} opacity="0.12" />

      {/* Nose — wide friendly */}
      <Ellipse cx="90" cy="88" rx="10" ry="7" fill={nose} />
      {/* Nose highlight */}
      <Ellipse cx="86" cy="85" rx="4" ry="2.5" fill="white" opacity="0.55" />

      {/* Mouth — happy open smile */}
      <Path d="M 78 100 Q 90 112 102 100"
        stroke={furDark} strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Eyes — big and round, friendly */}
      <Circle cx="70"  cy="72" r="10" fill={eye} />
      <Circle cx="110" cy="72" r="10" fill={eye} />
      {/* Iris colour */}
      <Circle cx="70"  cy="72" r="6" fill="#78350F" />
      <Circle cx="110" cy="72" r="6" fill="#78350F" />
      {/* Pupil */}
      <Circle cx="70"  cy="72" r="4" fill={eye} />
      <Circle cx="110" cy="72" r="4" fill={eye} />
      {/* Big shine — makes eyes look alive */}
      <Circle cx="73"  cy="68" r="3.5" fill="white" />
      <Circle cx="113" cy="68" r="3.5" fill="white" />
      <Circle cx="75"  cy="70" r="1.5" fill="white" opacity="0.7" />
      <Circle cx="115" cy="70" r="1.5" fill="white" opacity="0.7" />

      {/* Eyebrows — raised = happy/curious */}
      <Path d="M 61 60 Q 70 56 79 60"
        stroke={furDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M 101 60 Q 110 56 119 60"
        stroke={furDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Tongue — optional cute detail */}
      <Ellipse cx="90" cy="108" rx="8" ry="6" fill="#F9A8D4" />
      <Path d="M 82 108 Q 90 116 98 108"
        stroke="#F472B6" strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// ── Friendly clay cat ─────────────────────────────────────────────────────────
// Big round eyes (NOT slanted), perky ears, sweet expression
export function CatIllustration({ size = 160, selected = false }) {
  const fur     = selected ? "#A855F7" : "#C084FC";
  const furDark = selected ? "#7C3AED" : "#9333EA";
  const furLite = selected ? "#EDE9FE" : "#F3E8FF";
  const belly   = "#FAF5FF";
  const nose    = "#EC4899";
  const eye     = "#0F172A";
  const iris    = selected ? "#10B981" : "#34D399";

  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
      <Defs>
        <RadialGradient id="cHead" cx="38%" cy="28%" r="65%">
          <Stop offset="0%" stopColor={furLite} />
          <Stop offset="48%" stopColor={fur} />
          <Stop offset="100%" stopColor={furDark} />
        </RadialGradient>
        <RadialGradient id="cBody" cx="40%" cy="25%" r="65%">
          <Stop offset="0%" stopColor={furLite} />
          <Stop offset="50%" stopColor={fur} />
          <Stop offset="100%" stopColor={furDark} />
        </RadialGradient>
        <RadialGradient id="cEye" cx="30%" cy="28%" r="70%">
          <Stop offset="0%" stopColor="#6EE7B7" />
          <Stop offset="100%" stopColor={iris} />
        </RadialGradient>
      </Defs>

      {/* Ground shadow */}
      <Ellipse cx="90" cy="168" rx="38" ry="6" fill={furDark} opacity="0.2" />

      {/* Tail wraps in front */}
      <Path d="M 52 135 Q 20 118 24 92 Q 28 70 48 78"
        stroke={furDark} strokeWidth="14" strokeLinecap="round" fill="none" />
      <Path d="M 52 135 Q 20 118 24 92 Q 28 70 48 78"
        stroke={fur} strokeWidth="9" strokeLinecap="round" fill="none" />
      <Path d="M 52 135 Q 20 118 24 92 Q 28 70 48 78"
        stroke={furLite} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Body */}
      <Ellipse cx="92" cy="126" rx="36" ry="28" fill="url(#cBody)" />
      {/* Belly patch */}
      <Ellipse cx="92" cy="130" rx="20" ry="16" fill={belly} opacity="0.55" />

      {/* Legs */}
      <Ellipse cx="72"  cy="149" rx="12" ry="8" fill={fur} />
      <Ellipse cx="112" cy="149" rx="12" ry="8" fill={fur} />
      <Ellipse cx="72"  cy="153" rx="7"  ry="3.5" fill={furLite} opacity="0.5" />
      <Ellipse cx="112" cy="153" rx="7"  ry="3.5" fill={furLite} opacity="0.5" />

      {/* Pointed ears — behind head */}
      <Path d="M 54 54 L 42 24 L 72 50 Z" fill={furDark} />
      <Path d="M 58 54 L 48 28 L 70 50 Z" fill={fur} />
      {/* Inner ear pink */}
      <Path d="M 57 52 L 50 34 L 67 50 Z" fill="#F9A8D4" opacity="0.7" />

      <Path d="M 126 54 L 138 24 L 108 50 Z" fill={furDark} />
      <Path d="M 122 54 L 132 28 L 110 50 Z" fill={fur} />
      <Path d="M 123 52 L 130 34 L 113 50 Z" fill="#F9A8D4" opacity="0.7" />

      {/* Head — round, not angular */}
      <Circle cx="90" cy="82" r="42" fill="url(#cHead)" />

      {/* Head shine */}
      <Ellipse cx="73" cy="60" rx="13" ry="8"
        fill={furLite} opacity="0.45" transform="rotate(-22 73 60)" />

      {/* Cheek fluff — makes cat look chubby/cute */}
      <Ellipse cx="60"  cy="92" rx="13" ry="9" fill={furLite} opacity="0.4" />
      <Ellipse cx="120" cy="92" rx="13" ry="9" fill={furLite} opacity="0.4" />

      {/* Muzzle */}
      <Ellipse cx="90" cy="97" rx="20" ry="13" fill={belly} opacity="0.8" />

      {/* Nose */}
      <Path d="M 86 91 L 90 87 L 94 91 L 90 95 Z" fill={nose} />
      <Ellipse cx="88" cy="90" rx="2.5" ry="1.8" fill="white" opacity="0.6" />

      {/* Mouth — W shape = happy cat */}
      <Path d="M 90 95 Q 85 102 80 99"
        stroke={furDark} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M 90 95 Q 95 102 100 99"
        stroke={furDark} strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Whiskers */}
      <Path d="M 56 90 L 74 93" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <Path d="M 53 95 L 72 96" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <Path d="M 56 100 L 73 99" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <Path d="M 124 90 L 106 93" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <Path d="M 127 95 L 108 96" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <Path d="M 124 100 L 107 99" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />

      {/* Eyes — BIG and ROUND, not slanted = friendly not evil */}
      <Circle cx="70"  cy="78" r="13" fill={eye} />
      <Circle cx="110" cy="78" r="13" fill={eye} />
      {/* Iris */}
      <Circle cx="70"  cy="78" r="9" fill="url(#cEye)" />
      <Circle cx="110" cy="78" r="9" fill="url(#cEye)" />
      {/* Pupil — vertical slit for cat realism */}
      <Ellipse cx="70"  cy="78" rx="3.5" ry="6" fill={eye} />
      <Ellipse cx="110" cy="78" rx="3.5" ry="6" fill={eye} />
      {/* Big eye shine */}
      <Circle cx="74"  cy="73" r="4" fill="white" />
      <Circle cx="114" cy="73" r="4" fill="white" />
      <Circle cx="76"  cy="75" r="1.8" fill="white" opacity="0.7" />
      <Circle cx="116" cy="75" r="1.8" fill="white" opacity="0.7" />
    </Svg>
  );
}
