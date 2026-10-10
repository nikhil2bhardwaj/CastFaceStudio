/**
 * Character DNA & Morph Data Models
 * Master Reference: MasterDoc.md (FR1 - FR13)
 */

export type Undertone = 'cool-pink' | 'neutral' | 'warm-yellow' | 'olive';

export type ArtStylePreset = 'flat' | 'cartoon-shade' | 'soft-shade' | 'sketch' | 'noir';

export type LightingEnv = 'warm-interior' | 'cold-exterior' | 'studio-neutral';

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'surprise' | 'disgust' | 'contempt';

export interface HeadMorphs {
  cranialWidth: number;       // 0..1 (narrow to wide neurocranium)
  headLength: number;         // 0..1 (compact to elongated)
  jawSquareness: number;      // 0..1 (tapered V-shape to wide square angle)
  chinWidth: number;          // 0..1 (pointed to broad/cleft)
  chinProminence: number;     // 0..1 (recessed to forward projection)
  neckWidth: number;          // 0..1 (slender to thick/muscular)
  cheekFullness: number;      // 0..1 (hollow cheekbones to full youthful cheeks)
}

export interface FeatureMorphs {
  eyeSpacing: number;         // 0..1 (close-set to wide-set)
  eyeSize: number;            // 0..1 (small to large)
  eyeHeight: number;          // 0..1 (vertical position on midface)
  eyeSlant: number;           // -1..1 (downward canthal tilt to upward cat-eye)
  almondShape: number;        // 0..1 (round to deep almond/monolid fold)
  eyelidFold: number;         // 0..1 (prominent crease to hooded/epicanthic fold)
  browHeight: number;         // 0..1 (low-set heavy to high arched)
  browArch: number;           // 0..1 (straight flat to prominent arch)
  browThickness: number;      // 0..1 (fine sparse to dense/heavy)
  noseLength: number;         // 0..1 (short snub to long aquiline)
  noseBridgeWidth: number;    // 0..1 (pinched narrow to broad)
  noseHump: number;           // 0..1 (straight/concave to dorsal hump)
  noseTipSize: number;        // 0..1 (delicate pointed to bulbous/button)
  noseTipUpturn: number;      // -1..1 (drooped/hooked to upturned celestial)
  nostrilFlare: number;       // 0..1 (tucked nostrils to wide flared)
  mouthWidth: number;         // 0..1 (narrow bow to wide grin)
  mouthHeight: number;        // 0..1 (vertical positioning relative to nose)
  upperLipFullness: number;   // 0..1 (thin vermilion to pillowy plump)
  lowerLipFullness: number;   // 0..1 (thin vermilion to plump)
  cupidsBowDefinition: number;// 0..1 (soft curve to crisp sharp peaks)
  earSize: number;            // 0..1 (compact to prominent)
  earProtrusion: number;      // 0..1 (flat against head to protruding)
  earLobeAttached: number;    // 0..1 (attached lobe to free hanging lobe)
}

export interface SkinColoration {
  lightness: number;          // 0..1 (deep obsidian/espresso to porcelain fair)
  undertone: Undertone;       // cool-pink, neutral, warm-yellow, olive
  blushIntensity: number;     // 0..1 (subsurface rosiness on cheeks/nose)
  undereyeDarkness: number;   // 0..1 (infraorbital hollow tone)
  oilShine: number;           // 0..1 (T-zone specular highlight)
}

export interface EyeColoration {
  irisColorL: string;         // hex or oklch
  irisColorR: string;         // heterochromia support (FR2.2)
  irisSize: number;           // 0..1
  pupilSize: number;          // 0..1
  gazeX: number;              // -1..1
  gazeY: number;              // -1..1
}

export interface HairColoration {
  baseColor: string;          // Main hair color
  highlightColor: string;     // Midtone highlight
  rootColor: string;          // Root/dark shading
  graying: number;            // 0..1 (auto-driven by age with manual override)
}

export interface UniqueMark {
  id: string;
  type: 'mole' | 'freckles' | 'scar' | 'blemish' | 'birthmark';
  anchorPoint: 'cheek_L' | 'cheek_R' | 'forehead' | 'chin' | 'nose' | 'lip_corner_L' | 'brow_R';
  offsetX: number;
  offsetY: number;
  scale: number;
  opacity: number;
}

export interface CharacterDNA {
  schemaVersion: '1.0.0';
  id: string;
  seed: number;
  meta: {
    name: string;
    role: string;
    birthYear: number;
    genderExpression: number; // 0 (feminine) to 1 (masculine), smooth continuous blend (FR1.2)
    notes: string;
  };
  family?: {
    parentIdA?: string;
    parentIdB?: string;
    blendRatio?: number;
    lockedRegions?: string[];
  };
  timeline: {
    age: number;               // 0 to 80 (FR4.1)
    autoAgeDetails: boolean;
    overrides: {
      foreheadLines?: number;
      crowFeet?: number;
      smileLines?: number;
      jowls?: number;
      hairGraying?: number;
    };
  };
  morphs: {
    head: HeadMorphs;
    features: FeatureMorphs;
    symmetry: {
      globalAsymmetry: number;  // 0..1 (FR2.7)
      unlockedFeatures: string[];
    };
  };
  coloration: {
    skin: SkinColoration;
    eyes: EyeColoration;
    hair: HairColoration;
  };
  assets: {
    hairStyleId: string;       // 'bald' | 'buzz' | 'crop-short' | 'wavy-medium' | 'afro-short' | 'braids' | 'long-straight'
    beardStyleId: string;      // 'none' | 'stubble' | 'clean-beard' | 'full-bushy' | 'mustache'
    beardDensity: number;
    glassesStyleId: string;    // 'none' | 'wire-round' | 'acetate-square' | 'reading-half'
    collarStyleId: string;     // 'crewneck' | 'v-neck' | 'collar-shirt' | 'hoodie'
    collarColor: string;
    earringsStyleId?: 'none' | 'gold-stud' | 'silver-hoop';
    foreheadDot?: boolean;     // Cultural bindi / forehead mark (FR7.4)
    piercingNose?: boolean;    // Nostril stud (FR7.4)
  };
  marks: UniqueMark[];
  expression: {
    activeEmotion: Emotion;
    emotionStrength: number;   // 0..1
    blendEmotion: Emotion;     // Secondary emotion (FR6.2)
    blendStrength: number;     // 0..1 (FR6.2)
    mouthViseme: 'rest' | 'aa' | 'ee' | 'oo' | 'mm' | 'wide' | 'frown';
    blinkState: number;        // 0 (open) to 1 (closed)
    oneBrowRaise: number;      // -1..1 asymmetric expressiveness (FR6.4)
    crookedSmile: number;      // -1..1 asymmetric lip curl (FR6.4)
  };
  artStyle: {
    preset: ArtStylePreset;
    lineWeight: number;        // 0.5 to 3.0
    lineWobble: number;        // hand-drawn jitter
    lighting: LightingEnv;
  };
}

export const DEFAULT_CHARACTER: CharacterDNA = {
  schemaVersion: '1.0.0',
  id: 'char_default_01',
  seed: 428912,
  meta: {
    name: 'Maya Lin',
    role: 'Protagonist',
    birthYear: 1996,
    genderExpression: 0.45,
    notes: 'Film-ready base character. Expressive eyes and defined cheekbones.'
  },
  timeline: {
    age: 26,
    autoAgeDetails: true,
    overrides: {}
  },
  morphs: {
    head: {
      cranialWidth: 0.50,
      headLength: 0.52,
      jawSquareness: 0.42,
      chinWidth: 0.40,
      chinProminence: 0.48,
      neckWidth: 0.46,
      cheekFullness: 0.54
    },
    features: {
      eyeSpacing: 0.50,
      eyeSize: 0.52,
      eyeHeight: 0.50,
      eyeSlant: 0.04,
      almondShape: 0.58,
      eyelidFold: 0.45,
      browHeight: 0.48,
      browArch: 0.52,
      browThickness: 0.46,
      noseLength: 0.48,
      noseBridgeWidth: 0.44,
      noseHump: 0.05,
      noseTipSize: 0.38,
      noseTipUpturn: 0.08,
      nostrilFlare: 0.40,
      mouthWidth: 0.48,
      mouthHeight: 0.38,
      upperLipFullness: 0.50,
      lowerLipFullness: 0.54,
      cupidsBowDefinition: 0.62,
      earSize: 0.46,
      earProtrusion: 0.32,
      earLobeAttached: 0.15
    },
    symmetry: {
      globalAsymmetry: 0.02,
      unlockedFeatures: []
    }
  },
  coloration: {
    skin: {
      lightness: 0.65,
      undertone: 'warm-yellow',
      blushIntensity: 0.28,
      undereyeDarkness: 0.12,
      oilShine: 0.15
    },
    eyes: {
      irisColorL: '#3b6e56',
      irisColorR: '#3b6e56',
      irisSize: 0.52,
      pupilSize: 0.35,
      gazeX: 0.0,
      gazeY: 0.0
    },
    hair: {
      baseColor: '#2b211d',
      highlightColor: '#43342d',
      rootColor: '#171210',
      graying: 0.0
    }
  },
  assets: {
    hairStyleId: 'wavy-medium',
    beardStyleId: 'none',
    beardDensity: 0.0,
    glassesStyleId: 'none',
    collarStyleId: 'crewneck',
    collarColor: '#2b3445'
  },
  marks: [
    {
      id: 'mark_beauty_spot',
      type: 'mole',
      anchorPoint: 'cheek_R',
      offsetX: 12,
      offsetY: 6,
      scale: 1.0,
      opacity: 0.85
    }
  ],
  expression: {
    activeEmotion: 'neutral',
    emotionStrength: 1.0,
    blendEmotion: 'happy',
    blendStrength: 0.15,
    mouthViseme: 'rest',
    blinkState: 0.0,
    oneBrowRaise: 0.0,
    crookedSmile: 0.0
  },
  artStyle: {
    preset: 'soft-shade',
    lineWeight: 1.2,
    lineWobble: 0.0,
    lighting: 'warm-interior'
  }
};
