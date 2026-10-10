/**
 * Genetics Inheritance & Family Resemblance Engine
 * Master Reference: MasterDoc.md (FR5.1 - FR5.6, FR11.4)
 */

import { CharacterDNA } from '../types/face';
import { clamp, createPRNG } from './math';

export type FeatureRegion = 'eyes' | 'nose' | 'mouth' | 'jaw' | 'skin' | 'hair' | 'brows';

export interface BlendOptions {
  blendRatio: number;      // 0.0 (100% Parent A) to 1.0 (100% Parent B), 0.5 = 50/50
  variance: number;        // 0.0 to 1.0 amount of random allele variation
  seed: number;            // Deterministic PRNG seed
  lockedRegions: Set<FeatureRegion>; // Regions locked exclusively to Parent A
  parentBLockedRegions?: Set<FeatureRegion>; // Regions locked exclusively to Parent B
}

/**
 * Blend two parents into a genetically believable child (FR5.1, FR5.2)
 */
export function blendParents(
  parentA: CharacterDNA,
  parentB: CharacterDNA,
  options: BlendOptions
): CharacterDNA {
  const prng = createPRNG(options.seed);
  const ratio = clamp(options.blendRatio, 0, 1);
  const v = clamp(options.variance, 0, 1);

  // Clone base template from Parent A
  const child: CharacterDNA = JSON.parse(JSON.stringify(parentA));
  child.id = `char_child_${Math.floor(prng() * 1000000).toString(16)}`;
  child.seed = Math.floor(prng() * 1000000);
  child.meta.name = `Child of ${parentA.meta.name} & ${parentB.meta.name}`;
  child.meta.role = 'Offspring';
  child.timeline.age = 12; // Start child at story age 12
  child.meta.birthYear = Math.max(parentA.meta.birthYear, parentB.meta.birthYear) + 22;

  // Family lineage links (FR5.4)
  child.family = {
    parentIdA: parentA.id,
    parentIdB: parentB.id,
    blendRatio: ratio,
    lockedRegions: Array.from(options.lockedRegions)
  };

  const noise = () => (prng() - 0.5) * 2 * v * 0.15;

  // 1. HEAD & JAW BLEND
  if (options.lockedRegions.has('jaw')) {
    child.morphs.head = JSON.parse(JSON.stringify(parentA.morphs.head));
  } else if (options.parentBLockedRegions?.has('jaw')) {
    child.morphs.head = JSON.parse(JSON.stringify(parentB.morphs.head));
  } else {
    child.morphs.head.cranialWidth = clamp(blendVal(parentA.morphs.head.cranialWidth, parentB.morphs.head.cranialWidth, ratio) + noise());
    child.morphs.head.headLength = clamp(blendVal(parentA.morphs.head.headLength, parentB.morphs.head.headLength, ratio) + noise());
    child.morphs.head.jawSquareness = clamp(blendVal(parentA.morphs.head.jawSquareness, parentB.morphs.head.jawSquareness, ratio) + noise());
    child.morphs.head.chinWidth = clamp(blendVal(parentA.morphs.head.chinWidth, parentB.morphs.head.chinWidth, ratio) + noise());
    child.morphs.head.chinProminence = clamp(blendVal(parentA.morphs.head.chinProminence, parentB.morphs.head.chinProminence, ratio) + noise());
    child.morphs.head.neckWidth = clamp(blendVal(parentA.morphs.head.neckWidth, parentB.morphs.head.neckWidth, ratio) + noise());
    child.morphs.head.cheekFullness = clamp(blendVal(parentA.morphs.head.cheekFullness, parentB.morphs.head.cheekFullness, ratio) + noise());
  }

  // 2. EYES BLEND
  if (options.lockedRegions.has('eyes')) {
    child.morphs.features.eyeSpacing = parentA.morphs.features.eyeSpacing;
    child.morphs.features.eyeSize = parentA.morphs.features.eyeSize;
    child.morphs.features.eyeSlant = parentA.morphs.features.eyeSlant;
    child.morphs.features.almondShape = parentA.morphs.features.almondShape;
    child.morphs.features.eyelidFold = parentA.morphs.features.eyelidFold;
    child.coloration.eyes = JSON.parse(JSON.stringify(parentA.coloration.eyes));
  } else if (options.parentBLockedRegions?.has('eyes')) {
    child.morphs.features.eyeSpacing = parentB.morphs.features.eyeSpacing;
    child.morphs.features.eyeSize = parentB.morphs.features.eyeSize;
    child.morphs.features.eyeSlant = parentB.morphs.features.eyeSlant;
    child.morphs.features.almondShape = parentB.morphs.features.almondShape;
    child.morphs.features.eyelidFold = parentB.morphs.features.eyelidFold;
    child.coloration.eyes = JSON.parse(JSON.stringify(parentB.coloration.eyes));
  } else {
    child.morphs.features.eyeSpacing = clamp(blendVal(parentA.morphs.features.eyeSpacing, parentB.morphs.features.eyeSpacing, ratio) + noise());
    child.morphs.features.eyeSize = clamp(blendVal(parentA.morphs.features.eyeSize, parentB.morphs.features.eyeSize, ratio) + noise());
    child.morphs.features.eyeSlant = clamp(blendVal(parentA.morphs.features.eyeSlant, parentB.morphs.features.eyeSlant, ratio) + noise(), -1, 1);
    child.morphs.features.almondShape = clamp(blendVal(parentA.morphs.features.almondShape, parentB.morphs.features.almondShape, ratio) + noise());
    child.morphs.features.eyelidFold = clamp(blendVal(parentA.morphs.features.eyelidFold, parentB.morphs.features.eyelidFold, ratio) + noise());

    // Eye color allele dominance: pick parent A or parent B with ratio probability
    child.coloration.eyes.irisColorL = prng() > ratio ? parentA.coloration.eyes.irisColorL : parentB.coloration.eyes.irisColorL;
    child.coloration.eyes.irisColorR = child.coloration.eyes.irisColorL;
    child.coloration.eyes.irisSize = blendVal(parentA.coloration.eyes.irisSize, parentB.coloration.eyes.irisSize, ratio);
  }

  // 3. NOSE BLEND
  if (options.lockedRegions.has('nose')) {
    child.morphs.features.noseLength = parentA.morphs.features.noseLength;
    child.morphs.features.noseBridgeWidth = parentA.morphs.features.noseBridgeWidth;
    child.morphs.features.noseHump = parentA.morphs.features.noseHump;
    child.morphs.features.noseTipSize = parentA.morphs.features.noseTipSize;
    child.morphs.features.noseTipUpturn = parentA.morphs.features.noseTipUpturn;
    child.morphs.features.nostrilFlare = parentA.morphs.features.nostrilFlare;
  } else {
    child.morphs.features.noseLength = clamp(blendVal(parentA.morphs.features.noseLength, parentB.morphs.features.noseLength, ratio) + noise());
    child.morphs.features.noseBridgeWidth = clamp(blendVal(parentA.morphs.features.noseBridgeWidth, parentB.morphs.features.noseBridgeWidth, ratio) + noise());
    child.morphs.features.noseHump = clamp(blendVal(parentA.morphs.features.noseHump, parentB.morphs.features.noseHump, ratio) + noise());
    child.morphs.features.noseTipSize = clamp(blendVal(parentA.morphs.features.noseTipSize, parentB.morphs.features.noseTipSize, ratio) + noise());
    child.morphs.features.noseTipUpturn = clamp(blendVal(parentA.morphs.features.noseTipUpturn, parentB.morphs.features.noseTipUpturn, ratio) + noise(), -1, 1);
    child.morphs.features.nostrilFlare = clamp(blendVal(parentA.morphs.features.nostrilFlare, parentB.morphs.features.nostrilFlare, ratio) + noise());
  }

  // 4. MOUTH BLEND
  if (options.lockedRegions.has('mouth')) {
    child.morphs.features.mouthWidth = parentA.morphs.features.mouthWidth;
    child.morphs.features.mouthHeight = parentA.morphs.features.mouthHeight;
    child.morphs.features.upperLipFullness = parentA.morphs.features.upperLipFullness;
    child.morphs.features.lowerLipFullness = parentA.morphs.features.lowerLipFullness;
    child.morphs.features.cupidsBowDefinition = parentA.morphs.features.cupidsBowDefinition;
  } else {
    child.morphs.features.mouthWidth = clamp(blendVal(parentA.morphs.features.mouthWidth, parentB.morphs.features.mouthWidth, ratio) + noise());
    child.morphs.features.mouthHeight = clamp(blendVal(parentA.morphs.features.mouthHeight, parentB.morphs.features.mouthHeight, ratio) + noise());
    child.morphs.features.upperLipFullness = clamp(blendVal(parentA.morphs.features.upperLipFullness, parentB.morphs.features.upperLipFullness, ratio) + noise());
    child.morphs.features.lowerLipFullness = clamp(blendVal(parentA.morphs.features.lowerLipFullness, parentB.morphs.features.lowerLipFullness, ratio) + noise());
    child.morphs.features.cupidsBowDefinition = clamp(blendVal(parentA.morphs.features.cupidsBowDefinition, parentB.morphs.features.cupidsBowDefinition, ratio) + noise());
  }

  // 5. SKIN BLEND (Continuous melanin depth + undertone) (FR3.1, FR5.1)
  if (options.lockedRegions.has('skin')) {
    child.coloration.skin = JSON.parse(JSON.stringify(parentA.coloration.skin));
  } else {
    child.coloration.skin.lightness = clamp(blendVal(parentA.coloration.skin.lightness, parentB.coloration.skin.lightness, ratio) + noise() * 0.5, 0.08, 0.92);
    // Undertone selection based on allele ratio
    child.coloration.skin.undertone = prng() > ratio ? parentA.coloration.skin.undertone : parentB.coloration.skin.undertone;
    child.coloration.skin.blushIntensity = blendVal(parentA.coloration.skin.blushIntensity, parentB.coloration.skin.blushIntensity, ratio);
  }

  // 6. HAIR BLEND
  if (options.lockedRegions.has('hair')) {
    child.coloration.hair = JSON.parse(JSON.stringify(parentA.coloration.hair));
  } else {
    // Hair base color blend
    child.coloration.hair.baseColor = blendColorHex(parentA.coloration.hair.baseColor, parentB.coloration.hair.baseColor, ratio);
    child.coloration.hair.graying = 0; // Youthful reset
  }

  // Child gender expression assigned with random variance
  child.meta.genderExpression = clamp(0.5 + (prng() - 0.5) * 0.4);
  child.assets.beardStyleId = 'none';
  child.assets.beardDensity = 0;

  return child;
}

/**
 * Generate N related siblings from the same parents (FR5.3)
 */
export function generateSiblings(
  parentA: CharacterDNA,
  parentB: CharacterDNA,
  count: number = 3,
  baseSeed: number = 42
): CharacterDNA[] {
  const siblings: CharacterDNA[] = [];

  for (let i = 0; i < count; i++) {
    const siblingSeed = baseSeed + (i + 1) * 7919;
    const siblingPrng = createPRNG(siblingSeed);
    
    // Each sibling has a slightly different blend ratio around 0.5 (e.g. 0.35 to 0.65)
    const ratio = clamp(0.5 + (siblingPrng() - 0.5) * 0.35, 0.25, 0.75);
    
    // Different combination of locked/dominant alleles
    const locks = new Set<FeatureRegion>();
    if (siblingPrng() > 0.5) locks.add('eyes');
    if (siblingPrng() > 0.6) locks.add('skin');

    const sibling = blendParents(parentA, parentB, {
      blendRatio: ratio,
      variance: 0.4,
      seed: siblingSeed,
      lockedRegions: locks
    });

    sibling.meta.name = `Sibling ${i + 1} (${sibling.meta.genderExpression > 0.5 ? 'M' : 'F'})`;
    sibling.timeline.age = 10 + i * 3; // Different ages (e.g. 10, 13, 16)
    siblings.push(sibling);
  }

  return siblings;
}

/**
 * Copy specific region from source character to target character (FR5.5)
 */
export function copyFeatureRegion(
  sourceDNA: CharacterDNA,
  targetDNA: CharacterDNA,
  region: FeatureRegion
): CharacterDNA {
  const result: CharacterDNA = JSON.parse(JSON.stringify(targetDNA));

  switch (region) {
    case 'eyes':
      result.morphs.features.eyeSpacing = sourceDNA.morphs.features.eyeSpacing;
      result.morphs.features.eyeSize = sourceDNA.morphs.features.eyeSize;
      result.morphs.features.eyeSlant = sourceDNA.morphs.features.eyeSlant;
      result.morphs.features.almondShape = sourceDNA.morphs.features.almondShape;
      result.morphs.features.eyelidFold = sourceDNA.morphs.features.eyelidFold;
      result.coloration.eyes = JSON.parse(JSON.stringify(sourceDNA.coloration.eyes));
      break;

    case 'nose':
      result.morphs.features.noseLength = sourceDNA.morphs.features.noseLength;
      result.morphs.features.noseBridgeWidth = sourceDNA.morphs.features.noseBridgeWidth;
      result.morphs.features.noseHump = sourceDNA.morphs.features.noseHump;
      result.morphs.features.noseTipSize = sourceDNA.morphs.features.noseTipSize;
      result.morphs.features.noseTipUpturn = sourceDNA.morphs.features.noseTipUpturn;
      result.morphs.features.nostrilFlare = sourceDNA.morphs.features.nostrilFlare;
      break;

    case 'mouth':
      result.morphs.features.mouthWidth = sourceDNA.morphs.features.mouthWidth;
      result.morphs.features.mouthHeight = sourceDNA.morphs.features.mouthHeight;
      result.morphs.features.upperLipFullness = sourceDNA.morphs.features.upperLipFullness;
      result.morphs.features.lowerLipFullness = sourceDNA.morphs.features.lowerLipFullness;
      result.morphs.features.cupidsBowDefinition = sourceDNA.morphs.features.cupidsBowDefinition;
      break;

    case 'jaw':
      result.morphs.head = JSON.parse(JSON.stringify(sourceDNA.morphs.head));
      break;

    case 'skin':
      result.coloration.skin = JSON.parse(JSON.stringify(sourceDNA.coloration.skin));
      break;

    case 'hair':
      result.coloration.hair = JSON.parse(JSON.stringify(sourceDNA.coloration.hair));
      result.assets.hairStyleId = sourceDNA.assets.hairStyleId;
      break;

    case 'brows':
      result.morphs.features.browHeight = sourceDNA.morphs.features.browHeight;
      result.morphs.features.browArch = sourceDNA.morphs.features.browArch;
      result.morphs.features.browThickness = sourceDNA.morphs.features.browThickness;
      break;
  }

  return result;
}

/**
 * Identity Continuity Metric & Caricature Drift Warning (FR5.6, FR11.4)
 * Calculates whether facial proportions have drifted beyond biological recognition threshold
 */
export interface IdentityCheckResult {
  driftScore: number;       // 0 (identical) to 1 (completely divergent)
  isCaricatureWarning: boolean;
  message: string;
}

export function evaluateIdentityDrift(dna: CharacterDNA): IdentityCheckResult {
  let drift = 0;
  const f = dna.morphs.features;
  const h = dna.morphs.head;

  // Extreme feature combinations that cause caricature distortion
  // E.g., hyper-wide head with micro-eyes, or extreme nose length with hyper-pinched bridge
  if (Math.abs(h.cranialWidth - f.eyeSpacing) > 0.55) {
    drift += 0.25;
  }
  if (f.noseLength > 0.85 && f.noseBridgeWidth < 0.15) {
    drift += 0.20;
  }
  if (f.eyeSize > 0.85 && f.eyeSpacing < 0.2) {
    drift += 0.25;
  }
  if (f.mouthWidth > 0.85 && h.chinWidth < 0.2) {
    drift += 0.20;
  }

  const isCaricatureWarning = drift >= 0.40;
  let message = 'Facial morphology within natural human continuity range.';
  if (isCaricatureWarning) {
    message = 'Warning: Extreme feature combination detected. Character proportions may appear exaggerated or drift from cast continuity.';
  }

  return {
    driftScore: clamp(drift),
    isCaricatureWarning,
    message
  };
}

/** Helper Math Functions **/

function blendVal(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blendColorHex(c1: string, c2: string, ratio: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16) || 0;
  const g1 = parseInt(c1.slice(3, 5), 16) || 0;
  const b1 = parseInt(c1.slice(5, 7), 16) || 0;

  const r2 = parseInt(c2.slice(1, 3), 16) || 0;
  const g2 = parseInt(c2.slice(3, 5), 16) || 0;
  const b2 = parseInt(c2.slice(5, 7), 16) || 0;

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
