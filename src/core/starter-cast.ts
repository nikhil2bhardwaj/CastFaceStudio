/**
 * Curated Database of 32 Diverse Starter Faces across Ages, Genders and Phenotypes
 * Master Reference: MasterDoc.md (FR10.1)
 */

import { CharacterDNA, DEFAULT_CHARACTER } from '../types/face';

export const STARTER_CAST: CharacterDNA[] = [
  // --- CHILDREN & TEENS ---
  createCastProfile('c_01', 'Leo Sterling', 2020, 4, 0.5, 'Toddler', {
    headLength: 0.40, jawSquareness: 0.30, cheekFullness: 0.90, eyeSize: 0.70, noseLength: 0.32, noseTipUpturn: 0.25,
    hairStyleId: 'crop-short', hairColor: '#b58c5a', skinLightness: 0.75, undertone: 'neutral'
  }),
  createCastProfile('c_02', 'Mei Chen', 2016, 8, 0.25, 'Child', {
    headLength: 0.44, jawSquareness: 0.32, cheekFullness: 0.85, eyeSize: 0.65, almondShape: 0.80, eyelidFold: 0.75,
    hairStyleId: 'long-straight', hairColor: '#121214', skinLightness: 0.76, undertone: 'warm-yellow'
  }),
  createCastProfile('c_03', 'Kenji Sato', 2013, 11, 0.60, 'Pre-Teen', {
    headLength: 0.46, jawSquareness: 0.40, cheekFullness: 0.70, eyeSize: 0.58, almondShape: 0.85,
    hairStyleId: 'crop-short', hairColor: '#151518', skinLightness: 0.72, undertone: 'warm-yellow'
  }),
  createCastProfile('c_04', 'Tariq Mansoor', 2010, 14, 0.75, 'Adolescent', {
    headLength: 0.50, jawSquareness: 0.55, noseLength: 0.52, browThickness: 0.65, eyeSize: 0.52,
    hairStyleId: 'wavy-medium', hairColor: '#1a1412', skinLightness: 0.58, undertone: 'olive'
  }),
  createCastProfile('c_05', 'Chloe Dubois', 2008, 16, 0.20, 'Teenager', {
    headLength: 0.48, jawSquareness: 0.35, eyeSize: 0.62, noseLength: 0.42, upperLipFullness: 0.58,
    hairStyleId: 'wavy-medium', hairColor: '#7a3b22', skinLightness: 0.82, undertone: 'cool-pink'
  }),

  // --- YOUNG ADULTS (20s) ---
  createCastProfile('ya_01', 'Maya Lin', 1998, 26, 0.35, 'Protagonist', {
    headLength: 0.52, jawSquareness: 0.42, cheekFullness: 0.54, eyeSize: 0.54, eyeSlant: 0.04,
    hairStyleId: 'wavy-medium', hairColor: '#2b211d', skinLightness: 0.65, undertone: 'warm-yellow'
  }),
  createCastProfile('ya_02', 'Liam Carter', 2002, 22, 0.80, 'Young Athlete', {
    headLength: 0.54, jawSquareness: 0.72, chinWidth: 0.58, browThickness: 0.62, eyeSize: 0.50,
    hairStyleId: 'crop-short', hairColor: '#8a6842', skinLightness: 0.78, undertone: 'neutral'
  }),
  createCastProfile('ya_03', 'Priya Sharma', 2000, 24, 0.20, 'Researcher', {
    headLength: 0.50, jawSquareness: 0.38, eyeSize: 0.60, almondShape: 0.65, upperLipFullness: 0.60,
    hairStyleId: 'long-straight', hairColor: '#111012', skinLightness: 0.52, undertone: 'warm-yellow',
    foreheadDot: true
  }),
  createCastProfile('ya_04', 'Amara Diallo', 1999, 25, 0.25, 'Engineer', {
    headLength: 0.52, jawSquareness: 0.45, nostrilFlare: 0.65, lowerLipFullness: 0.72, upperLipFullness: 0.68,
    hairStyleId: 'buzz', hairColor: '#0a0a0c', skinLightness: 0.20, undertone: 'warm-yellow'
  }),
  createCastProfile('ya_05', 'Nikolai Rostov', 1997, 27, 0.85, 'Detective', {
    headLength: 0.56, jawSquareness: 0.75, noseLength: 0.58, browThickness: 0.70, eyeSpacing: 0.48,
    hairStyleId: 'crop-short', hairColor: '#524338', skinLightness: 0.80, undertone: 'cool-pink'
  }),
  createCastProfile('ya_06', 'Sofia Rossi', 2001, 23, 0.15, 'Artist', {
    headLength: 0.50, jawSquareness: 0.36, noseTipUpturn: 0.15, upperLipFullness: 0.62,
    hairStyleId: 'wavy-medium', hairColor: '#281a14', skinLightness: 0.74, undertone: 'olive'
  }),
  createCastProfile('ya_07', 'Lucas Silva', 1996, 28, 0.75, 'Pilot', {
    headLength: 0.53, jawSquareness: 0.68, cheekFullness: 0.45, noseLength: 0.50, beardStyleId: 'stubble',
    hairStyleId: 'crop-short', hairColor: '#1d1715', skinLightness: 0.58, undertone: 'warm-yellow'
  }),
  createCastProfile('ya_08', 'Hana Takahashi', 2002, 22, 0.15, 'Archivist', {
    headLength: 0.48, jawSquareness: 0.32, almondShape: 0.88, eyelidFold: 0.85, eyeSlant: 0.12,
    hairStyleId: 'long-straight', hairColor: '#141416', skinLightness: 0.80, undertone: 'warm-yellow'
  }),

  // --- ADULTS (30s & 40s) ---
  createCastProfile('ad_01', 'David Vance', 1982, 42, 0.88, 'Veteran Captain', {
    headLength: 0.55, jawSquareness: 0.78, chinWidth: 0.62, browThickness: 0.72, noseLength: 0.58, beardStyleId: 'stubble',
    hairStyleId: 'crop-short', hairColor: '#241a18', skinLightness: 0.62, undertone: 'neutral'
  }),
  createCastProfile('ad_02', 'Elena Ramos', 1986, 38, 0.30, 'Chief Counsel', {
    headLength: 0.52, jawSquareness: 0.48, noseHump: 0.15, browArch: 0.65, eyeSize: 0.52,
    hairStyleId: 'wavy-medium', hairColor: '#1c1514', skinLightness: 0.64, undertone: 'olive'
  }),
  createCastProfile('ad_03', 'Kwesi Appiah', 1989, 35, 0.85, 'Architect', {
    headLength: 0.54, jawSquareness: 0.70, nostrilFlare: 0.68, lowerLipFullness: 0.74, beardStyleId: 'clean-beard',
    hairStyleId: 'buzz', hairColor: '#0c0c0e', skinLightness: 0.18, undertone: 'warm-yellow'
  }),
  createCastProfile('ad_04', 'Jin-Woo Park', 1984, 40, 0.80, 'Surgeon', {
    headLength: 0.52, jawSquareness: 0.62, almondShape: 0.85, glassesStyleId: 'wire-round',
    hairStyleId: 'crop-short', hairColor: '#18181b', skinLightness: 0.75, undertone: 'warm-yellow'
  }),
  createCastProfile('ad_05', 'Sarah Jenkins', 1988, 36, 0.25, 'Botanist', {
    headLength: 0.50, jawSquareness: 0.40, noseTipUpturn: 0.12, eyeSize: 0.56,
    hairStyleId: 'wavy-medium', hairColor: '#a14224', skinLightness: 0.82, undertone: 'cool-pink'
  }),
  createCastProfile('ad_06', 'Marcus Thorne', 1976, 48, 0.90, 'Commander', {
    headLength: 0.58, jawSquareness: 0.85, chinWidth: 0.68, browThickness: 0.78, noseHump: 0.35, beardStyleId: 'stubble',
    hairStyleId: 'buzz', hairColor: '#423c3a', skinLightness: 0.68, undertone: 'neutral', hairGraying: 0.45
  }),
  createCastProfile('ad_07', 'Leila Farhadi', 1990, 34, 0.20, 'Diplomat', {
    headLength: 0.52, jawSquareness: 0.44, noseLength: 0.54, eyeSize: 0.58, browArch: 0.68,
    hairStyleId: 'long-straight', hairColor: '#191514', skinLightness: 0.66, undertone: 'warm-yellow'
  }),
  createCastProfile('ad_08', 'Donald MacLeod', 1979, 45, 0.85, 'Inspector', {
    headLength: 0.56, jawSquareness: 0.72, noseLength: 0.56, beardStyleId: 'clean-beard',
    hairStyleId: 'crop-short', hairColor: '#783824', skinLightness: 0.82, undertone: 'cool-pink', hairGraying: 0.35
  }),

  // --- MIDDLE AGE (50s) ---
  createCastProfile('mid_01', 'Chief Henderson', 1970, 54, 0.85, 'Police Commissioner', {
    headLength: 0.56, jawSquareness: 0.76, earSize: 0.62, noseLength: 0.58, browThickness: 0.75,
    hairStyleId: 'crop-short', hairColor: '#8a888c', skinLightness: 0.70, undertone: 'neutral', hairGraying: 0.75
  }),
  createCastProfile('mid_02', 'Fatima Al-Mansoor', 1972, 52, 0.25, 'Dean of Faculty', {
    headLength: 0.53, jawSquareness: 0.48, eyeSize: 0.54, noseLength: 0.52, glassesStyleId: 'wire-round',
    hairStyleId: 'wavy-medium', hairColor: '#2b2628', skinLightness: 0.62, undertone: 'olive', hairGraying: 0.35
  }),
  createCastProfile('mid_03', 'Carlos Mendoza', 1968, 56, 0.80, 'Judge', {
    headLength: 0.55, jawSquareness: 0.72, noseLength: 0.60, beardStyleId: 'stubble',
    hairStyleId: 'crop-short', hairColor: '#6e6967', skinLightness: 0.58, undertone: 'warm-yellow', hairGraying: 0.65
  }),
  createCastProfile('mid_04', 'Dr. Aris Thorne', 1966, 58, 0.75, 'Historian', {
    headLength: 0.56, jawSquareness: 0.65, glassesStyleId: 'acetate-square', noseLength: 0.62, earSize: 0.65,
    hairStyleId: 'crop-short', hairColor: '#96969a', skinLightness: 0.74, undertone: 'cool-pink', hairGraying: 0.85
  }),
  createCastProfile('mid_05', 'Ingrid Lindstrom', 1973, 51, 0.20, 'Ambassador', {
    headLength: 0.52, jawSquareness: 0.46, eyeSize: 0.52, noseLength: 0.50,
    hairStyleId: 'crop-short', hairColor: '#bbb098', skinLightness: 0.85, undertone: 'cool-pink', hairGraying: 0.50
  }),
  createCastProfile('mid_06', 'Zhenya Petrov', 1969, 55, 0.85, 'Security Chief', {
    headLength: 0.57, jawSquareness: 0.80, chinWidth: 0.70, browThickness: 0.82,
    hairStyleId: 'buzz', hairColor: '#8a888c', skinLightness: 0.78, undertone: 'neutral', hairGraying: 0.70
  }),

  // --- ELDERS (60s & 70s+) ---
  createCastProfile('eld_01', 'Arthur Sterling', 1952, 72, 0.75, 'Elder Statesman', {
    headLength: 0.57, jawSquareness: 0.58, earSize: 0.78, noseLength: 0.64, glassesStyleId: 'acetate-square',
    hairStyleId: 'crop-short', hairColor: '#dcdde1', skinLightness: 0.72, undertone: 'cool-pink', hairGraying: 0.95
  }),
  createCastProfile('eld_02', 'Elder Zhang', 1946, 78, 0.70, 'Village Elder', {
    headLength: 0.55, jawSquareness: 0.52, almondShape: 0.88, earSize: 0.82, noseLength: 0.60,
    hairStyleId: 'bald', hairColor: '#e2e2e6', skinLightness: 0.70, undertone: 'warm-yellow', hairGraying: 1.0
  }),
  createCastProfile('eld_03', 'Margaret Gable', 1954, 70, 0.15, 'Matriarch', {
    headLength: 0.53, jawSquareness: 0.44, earSize: 0.72, glassesStyleId: 'wire-round',
    hairStyleId: 'crop-short', hairColor: '#e0e0e5', skinLightness: 0.80, undertone: 'cool-pink', hairGraying: 0.90
  }),
  createCastProfile('eld_04', 'Olorunfemi Balogun', 1956, 68, 0.80, 'Master Storyteller', {
    headLength: 0.56, jawSquareness: 0.68, earSize: 0.74, nostrilFlare: 0.70, beardStyleId: 'clean-beard',
    hairStyleId: 'buzz', hairColor: '#d6d6da', skinLightness: 0.24, undertone: 'warm-yellow', hairGraying: 0.92
  }),
  createCastProfile('eld_05', 'Siobhan O\'Connor', 1958, 66, 0.20, 'Novelist', {
    headLength: 0.52, jawSquareness: 0.45, earSize: 0.70, glassesStyleId: 'wire-round',
    hairStyleId: 'wavy-medium', hairColor: '#cfced4', skinLightness: 0.82, undertone: 'cool-pink', hairGraying: 0.85
  })
];

function createCastProfile(
  id: string,
  name: string,
  birthYear: number,
  age: number,
  gender: number,
  role: string,
  overrides: Record<string, any>
): CharacterDNA {
  const dna: CharacterDNA = JSON.parse(JSON.stringify(DEFAULT_CHARACTER));
  dna.id = id;
  dna.meta.name = name;
  dna.meta.birthYear = birthYear;
  dna.timeline.age = age;
  dna.meta.genderExpression = gender;
  dna.meta.role = role;

  if (overrides.headLength) dna.morphs.head.headLength = overrides.headLength;
  if (overrides.jawSquareness) dna.morphs.head.jawSquareness = overrides.jawSquareness;
  if (overrides.chinWidth) dna.morphs.head.chinWidth = overrides.chinWidth;
  if (overrides.cheekFullness) dna.morphs.head.cheekFullness = overrides.cheekFullness;
  if (overrides.eyeSize) dna.morphs.features.eyeSize = overrides.eyeSize;
  if (overrides.almondShape) dna.morphs.features.almondShape = overrides.almondShape;
  if (overrides.eyelidFold) dna.morphs.features.eyelidFold = overrides.eyelidFold;
  if (overrides.eyeSlant) dna.morphs.features.eyeSlant = overrides.eyeSlant;
  if (overrides.eyeSpacing) dna.morphs.features.eyeSpacing = overrides.eyeSpacing;
  if (overrides.browThickness) dna.morphs.features.browThickness = overrides.browThickness;
  if (overrides.browArch) dna.morphs.features.browArch = overrides.browArch;
  if (overrides.noseLength) dna.morphs.features.noseLength = overrides.noseLength;
  if (overrides.noseHump) dna.morphs.features.noseHump = overrides.noseHump;
  if (overrides.noseTipUpturn) dna.morphs.features.noseTipUpturn = overrides.noseTipUpturn;
  if (overrides.nostrilFlare) dna.morphs.features.nostrilFlare = overrides.nostrilFlare;
  if (overrides.earSize) dna.morphs.features.earSize = overrides.earSize;
  if (overrides.upperLipFullness) dna.morphs.features.upperLipFullness = overrides.upperLipFullness;
  if (overrides.lowerLipFullness) dna.morphs.features.lowerLipFullness = overrides.lowerLipFullness;

  if (overrides.hairStyleId) dna.assets.hairStyleId = overrides.hairStyleId;
  if (overrides.beardStyleId) {
    dna.assets.beardStyleId = overrides.beardStyleId;
    dna.assets.beardDensity = 0.7;
  }
  if (overrides.glassesStyleId) dna.assets.glassesStyleId = overrides.glassesStyleId;
  if (overrides.foreheadDot) dna.assets.foreheadDot = overrides.foreheadDot;

  if (overrides.hairColor) dna.coloration.hair.baseColor = overrides.hairColor;
  if (overrides.hairGraying !== undefined) dna.coloration.hair.graying = overrides.hairGraying;
  if (overrides.skinLightness) dna.coloration.skin.lightness = overrides.skinLightness;
  if (overrides.undertone) dna.coloration.skin.undertone = overrides.undertone;

  return dna;
}
