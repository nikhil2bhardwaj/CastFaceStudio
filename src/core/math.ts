/**
 * Mathematical & Biological Transformation Core
 * Master Reference: MasterDoc.md (FR1.1, FR3.1, FR4.1 - FR4.6)
 */

import { Undertone } from '../types/face';

export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
export function createPRNG(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Natural Perceptual Skin Palette Generator
 * Separates Lightness (Melanin Depth) from Undertone
 */
export interface SkinPalette {
  base: string;
  shadow: string;
  deepShadow: string;
  highlight: string;
  blush: string;
  lipColor: string;
  undereye: string;
  earRim: string;
}

export function calculateSkinPalette(lightness: number, undertone: Undertone, blushIntensity: number): SkinPalette {
  // L ranges from 0.12 (deepest espresso) to 0.92 (porcelain)
  const l = clamp(lightness, 0.05, 0.95);

  let hueBase: number;
  let satBase: number;

  switch (undertone) {
    case 'cool-pink':
      hueBase = 12;
      satBase = 0.52;
      break;
    case 'warm-yellow':
      hueBase = 32;
      satBase = 0.58;
      break;
    case 'olive':
      hueBase = 42;
      satBase = 0.36;
      break;
    case 'neutral':
    default:
      hueBase = 24;
      satBase = 0.44;
      break;
  }

  // Adjust saturation for very light and very dark tones to prevent clipping or ashy grayness
  const adjustedSat = satBase * (0.45 + 0.55 * Math.sin(l * Math.PI));

  // Convert HSL to Hex
  const baseHex = hslToHex(hueBase, adjustedSat, 0.15 + l * 0.72);
  const shadowHex = hslToHex(hueBase - 4, adjustedSat * 1.15, Math.max(0.08, (0.15 + l * 0.72) * 0.76));
  const deepShadowHex = hslToHex(hueBase - 8, adjustedSat * 1.25, Math.max(0.05, (0.15 + l * 0.72) * 0.58));
  const highlightHex = hslToHex(hueBase + 4, adjustedSat * 0.75, Math.min(0.98, (0.15 + l * 0.72) * 1.14 + 0.05));
  
  // Blush subsurface scatter
  const blushSat = clamp(adjustedSat * 1.4 + blushIntensity * 0.3, 0.3, 0.9);
  const blushHex = hslToHex(8, blushSat, clamp((0.15 + l * 0.72) * 0.88, 0.2, 0.78));

  // Natural lip color derived from skin undertone with mucous membrane vascularity
  const lipHex = hslToHex(6 + (undertone === 'cool-pink' ? -4 : undertone === 'warm-yellow' ? 4 : 0),
    clamp(adjustedSat * 1.35 + 0.15, 0.3, 0.85),
    clamp((0.15 + l * 0.72) * 0.82, 0.18, 0.65)
  );

  const undereyeHex = hslToHex(hueBase - 15, adjustedSat * 0.85, Math.max(0.1, (0.15 + l * 0.72) * 0.78));
  const earRimHex = hslToHex(hueBase - 10, adjustedSat * 1.2, (0.15 + l * 0.72) * 0.9);

  return {
    base: baseHex,
    shadow: shadowHex,
    deepShadow: deepShadowHex,
    highlight: highlightHex,
    blush: blushHex,
    lipColor: lipHex,
    undereye: undereyeHex,
    earRim: earRimHex
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toByte = (n: number) => {
    const val = Math.round((n + m) * 255);
    return Math.max(0, Math.min(255, val)).toString(16).padStart(2, '0');
  };

  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

/**
 * Biological Craniofacial Aging Factors
 * Master Reference: MasterDoc.md (FR1.1, FR4.1 - FR4.6)
 */
export interface AgingFactors {
  verticalFeatureRatio: number; // 0 (infant low-cluster) to 1 (adult spaced)
  mandibleLength: number;       // chin/jaw downward length growth
  jawDefinition: number;        // round soft baby jaw to chiseled adult
  cheekBabyFat: number;         // round full cheeks in youth, hollow/sag in age
  cartilageGrowth: number;      // nose & ear elongation in late adulthood (FR4.3)
  tissueSag: number;            // jowl and lid descent in 50+
  foreheadLineIntensity: number;
  crowFeetIntensity: number;
  smileLineIntensity: number;
  marionetteIntensity: number;
  autoGraying: number;
}

export function calculateAgingFactors(age: number): AgingFactors {
  const a = clamp(age, 0, 80);

  // Growth phase (0 to 22)
  const childNorm = smoothstep(0, 18, a);
  // Puberty surge (11 to 15)
  const pubertySurge = smoothstep(11, 16, a);
  // Senior aging phase (35 to 80)
  const seniorNorm = smoothstep(35, 75, a);
  // Elder deep aging (55 to 80)
  const elderNorm = smoothstep(55, 80, a);

  // Vertical feature ratio: infant eyes are lower on the cranial box (around 0.58), adult is 0.50
  const verticalFeatureRatio = lerp(0.0, 1.0, childNorm);

  // Mandible & jaw length expansion
  const mandibleLength = lerp(0.65, 1.0, childNorm) * (1.0 + pubertySurge * 0.08);

  // Jaw definition (round soft baby chin -> defined adult -> softer jowly senior)
  const jawDefinition = lerp(0.3, 1.0, childNorm) * lerp(1.0, 0.7, elderNorm);

  // Youthful cheek volume
  const cheekBabyFat = lerp(1.0, 0.0, childNorm);

  // Cartilage continues growing into senior years (ears & nose enlarge) (FR4.3)
  const cartilageGrowth = 1.0 + seniorNorm * 0.22;

  // Tissue gravity descent
  const tissueSag = seniorNorm;

  // Wrinkle intensities (procedural curves with realistic onset ages)
  const foreheadLineIntensity = smoothstep(30, 68, a);
  const crowFeetIntensity = smoothstep(32, 65, a);
  const smileLineIntensity = smoothstep(28, 62, a);
  const marionetteIntensity = smoothstep(48, 76, a);

  // Hair graying auto curve (starting ~38, widespread by 65)
  const autoGraying = smoothstep(36, 70, a);

  return {
    verticalFeatureRatio,
    mandibleLength,
    jawDefinition,
    cheekBabyFat,
    cartilageGrowth,
    tissueSag,
    foreheadLineIntensity,
    crowFeetIntensity,
    smileLineIntensity,
    marionetteIntensity,
    autoGraying
  };
}
