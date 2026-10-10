/**
 * 100% Offline Rule & Keyword-Based Novel Prose Parser
 * Master Reference: MasterDoc.md (FR10.3)
 * Analyzes natural language character prose into parametric face settings
 */

import { CharacterDNA, DEFAULT_CHARACTER } from '../types/face';

export interface ParseResult {
  dna: CharacterDNA;
  matchedTags: string[];
  summary: string;
}

export function parseProseToCharacter(proseText: string): ParseResult {
  const text = proseText.toLowerCase();
  const matchedTags: string[] = [];

  // Start with a clean baseline
  const dna: CharacterDNA = JSON.parse(JSON.stringify(DEFAULT_CHARACTER));
  dna.meta.name = 'Novel Character';
  dna.meta.notes = proseText.trim();

  // 1. AGE PARSING
  let detectedAge: number | null = null;
  const ageNumMatch = text.match(/(?:age|aged|is)\s+(\d{1,2})/i) || text.match(/(\d{1,2})\s*(?:years?\s*old|yo)/i);
  if (ageNumMatch) {
    detectedAge = parseInt(ageNumMatch[1], 10);
    matchedTags.push(`Age: ${detectedAge} (exact)`);
  } else if (text.includes('toddler') || text.includes('infant') || text.includes('baby')) {
    detectedAge = 4;
    matchedTags.push('Age: Toddler (~4)');
  } else if (text.includes('child') || text.includes('little girl') || text.includes('young boy') || text.includes('kid')) {
    detectedAge = 8;
    matchedTags.push('Age: Child (~8)');
  } else if (text.includes('teen') || text.includes('adolescent') || text.includes('fifteen') || text.includes('sixteen')) {
    detectedAge = 16;
    matchedTags.push('Age: Teen (~16)');
  } else if (text.includes('early twenties') || text.includes('early 20s') || text.includes('college student')) {
    detectedAge = 21;
    matchedTags.push('Age: Early 20s (~21)');
  } else if (text.includes('twenties') || text.includes('20s') || text.includes('young woman') || text.includes('young man')) {
    detectedAge = 26;
    matchedTags.push('Age: Mid 20s (~26)');
  } else if (text.includes('thirties') || text.includes('30s')) {
    detectedAge = 34;
    matchedTags.push('Age: 30s (~34)');
  } else if (text.includes('forties') || text.includes('40s') || text.includes('middle-aged') || text.includes('weathered')) {
    detectedAge = 46;
    matchedTags.push('Age: 40s (~46)');
  } else if (text.includes('fifties') || text.includes('50s')) {
    detectedAge = 54;
    matchedTags.push('Age: 50s (~54)');
  } else if (text.includes('elder') || text.includes('elderly') || text.includes('senior') || text.includes('seventies') || text.includes('old man') || text.includes('old woman') || text.includes('gray-haired')) {
    detectedAge = 72;
    matchedTags.push('Age: Senior (~72)');
  }

  if (detectedAge !== null) {
    dna.timeline.age = Math.max(0, Math.min(80, detectedAge));
  }

  // 2. GENDER / PRESENTATION
  if (text.includes('woman') || text.includes('female') || text.includes('girl') || text.includes('her ') || text.includes('she ')) {
    dna.meta.genderExpression = 0.25;
    matchedTags.push('Gender: Feminine (0.25)');
  } else if (text.includes('man') || text.includes('male') || text.includes('boy') || text.includes('his ') || text.includes('he ') || text.includes('rugged')) {
    dna.meta.genderExpression = 0.85;
    matchedTags.push('Gender: Masculine (0.85)');
  }

  // 3. EYES
  if (text.includes('green eye') || text.includes('emerald eye')) {
    dna.coloration.eyes.irisColorL = '#2d6848';
    dna.coloration.eyes.irisColorR = '#2d6848';
    matchedTags.push('Eye Color: Green');
  } else if (text.includes('blue eye') || text.includes('azure') || text.includes('sapphire')) {
    dna.coloration.eyes.irisColorL = '#33588a';
    dna.coloration.eyes.irisColorR = '#33588a';
    matchedTags.push('Eye Color: Blue');
  } else if (text.includes('brown eye') || text.includes('dark eye') || text.includes('obsidian eye')) {
    dna.coloration.eyes.irisColorL = '#2a1a15';
    dna.coloration.eyes.irisColorR = '#2a1a15';
    matchedTags.push('Eye Color: Dark Brown');
  } else if (text.includes('hazel eye')) {
    dna.coloration.eyes.irisColorL = '#6b5832';
    dna.coloration.eyes.irisColorR = '#6b5832';
    matchedTags.push('Eye Color: Hazel');
  }

  if (text.includes('almond') || text.includes('asian') || text.includes('monolid') || text.includes('epicanthic')) {
    dna.morphs.features.almondShape = 0.85;
    dna.morphs.features.eyelidFold = 0.85;
    dna.morphs.features.eyeSlant = 0.10;
    matchedTags.push('Eye Shape: Almond / Epicanthic Fold');
  } else if (text.includes('wide eye') || text.includes('large eye') || text.includes('doe eye')) {
    dna.morphs.features.eyeSize = 0.72;
    matchedTags.push('Eye Shape: Large / Wide');
  } else if (text.includes('narrow eye') || text.includes('squint') || text.includes('piercing eye')) {
    dna.morphs.features.eyeSize = 0.40;
    matchedTags.push('Eye Shape: Narrow / Piercing');
  }

  // 4. JAW & CHIN
  if (text.includes('square jaw') || text.includes('chiseled') || text.includes('angular') || text.includes('strong jaw')) {
    dna.morphs.head.jawSquareness = 0.82;
    dna.morphs.head.chinWidth = 0.65;
    matchedTags.push('Jaw: Strong Square / Chiseled');
  } else if (text.includes('pointed chin') || text.includes('delicate jaw') || text.includes('heart-shaped')) {
    dna.morphs.head.jawSquareness = 0.28;
    dna.morphs.head.chinWidth = 0.25;
    matchedTags.push('Jaw: Tapered / Pointed');
  } else if (text.includes('round face') || text.includes('soft cheek') || text.includes('chubby')) {
    dna.morphs.head.jawSquareness = 0.35;
    dna.morphs.head.cheekFullness = 0.80;
    matchedTags.push('Face Shape: Soft / Round');
  }

  // 5. NOSE
  if (text.includes('aquiline') || text.includes('hooked nose') || text.includes('hawk nose') || text.includes('prominent bridge')) {
    dna.morphs.features.noseLength = 0.68;
    dna.morphs.features.noseHump = 0.45;
    dna.morphs.features.noseTipUpturn = -0.15;
    matchedTags.push('Nose: Aquiline / Hooked Bridge');
  } else if (text.includes('button nose') || text.includes('snub nose') || text.includes('upturned nose')) {
    dna.morphs.features.noseLength = 0.36;
    dna.morphs.features.noseTipUpturn = 0.30;
    dna.morphs.features.noseTipSize = 0.48;
    matchedTags.push('Nose: Button / Upturned');
  } else if (text.includes('broad nose') || text.includes('flared nostril')) {
    dna.morphs.features.nostrilFlare = 0.72;
    dna.morphs.features.noseBridgeWidth = 0.65;
    matchedTags.push('Nose: Broad / Flared');
  }

  // 6. SKIN TONE & UNDERTONE
  if (text.includes('dark skin') || text.includes('espresso') || text.includes('ebony') || text.includes('african') || text.includes('deep brown skin')) {
    dna.coloration.skin.lightness = 0.22;
    dna.coloration.skin.undertone = 'warm-yellow';
    matchedTags.push('Skin: Deep Melanin (Warm)');
  } else if (text.includes('olive skin') || text.includes('mediterranean') || text.includes('olive complexion')) {
    dna.coloration.skin.lightness = 0.60;
    dna.coloration.skin.undertone = 'olive';
    matchedTags.push('Skin: Olive Undertone');
  } else if (text.includes('fair skin') || text.includes('pale') || text.includes('porcelain') || text.includes('alabaster')) {
    dna.coloration.skin.lightness = 0.84;
    dna.coloration.skin.undertone = 'cool-pink';
    matchedTags.push('Skin: Fair / Porcelain');
  } else if (text.includes('tan') || text.includes('bronzed') || text.includes('golden skin')) {
    dna.coloration.skin.lightness = 0.55;
    dna.coloration.skin.undertone = 'warm-yellow';
    matchedTags.push('Skin: Golden Tan');
  }

  // 7. HAIR & BEARD
  if (text.includes('stubble') || text.includes('unshaven') || text.includes('five o\'clock shadow')) {
    dna.assets.beardStyleId = 'stubble';
    dna.assets.beardDensity = 0.65;
    matchedTags.push('Facial Hair: Stubble');
  } else if (text.includes('beard') || text.includes('bearded')) {
    dna.assets.beardStyleId = 'clean-beard';
    dna.assets.beardDensity = 0.85;
    matchedTags.push('Facial Hair: Full Beard');
  }

  if (text.includes('bald') || text.includes('shaved head')) {
    dna.assets.hairStyleId = 'bald';
    matchedTags.push('Hair: Bald');
  } else if (text.includes('buzz cut') || text.includes('cropped')) {
    dna.assets.hairStyleId = 'buzz';
    matchedTags.push('Hair: Buzz Cut');
  } else if (text.includes('long hair') || text.includes('flowing hair')) {
    dna.assets.hairStyleId = 'long-straight';
    matchedTags.push('Hair: Long');
  } else if (text.includes('wavy hair') || text.includes('curly hair')) {
    dna.assets.hairStyleId = 'wavy-medium';
    matchedTags.push('Hair: Wavy Medium');
  } else if (text.includes('afro')) {
    dna.assets.hairStyleId = 'afro-short';
    matchedTags.push('Hair: Afro');
  }

  if (text.includes('gray hair') || text.includes('silver hair') || text.includes('salt and pepper')) {
    dna.coloration.hair.graying = 0.85;
    matchedTags.push('Hair Color: Silver / Gray');
  } else if (text.includes('blonde') || text.includes('golden hair') || text.includes('fair hair')) {
    dna.coloration.hair.baseColor = '#d6b876';
    matchedTags.push('Hair Color: Blonde');
  } else if (text.includes('red hair') || text.includes('ginger') || text.includes('auburn')) {
    dna.coloration.hair.baseColor = '#8a331c';
    matchedTags.push('Hair Color: Auburn / Red');
  } else if (text.includes('dark hair') || text.includes('black hair') || text.includes('raven hair')) {
    dna.coloration.hair.baseColor = '#141416';
    matchedTags.push('Hair Color: Black');
  }

  // 8. ACCESSORIES & UNIQUE MARKS
  if (text.includes('glasses') || text.includes('spectacles')) {
    if (text.includes('wire') || text.includes('round glasses')) {
      dna.assets.glassesStyleId = 'wire-round';
      matchedTags.push('Glasses: Wire Round');
    } else {
      dna.assets.glassesStyleId = 'acetate-square';
      matchedTags.push('Glasses: Acetate Square');
    }
  }

  if (text.includes('mole') || text.includes('beauty mark')) {
    dna.marks = [
      { id: 'm_parsed', type: 'mole', anchorPoint: 'cheek_R', offsetX: 14, offsetY: 8, scale: 1.0, opacity: 0.9 }
    ];
    matchedTags.push('Mark: Beauty Mole on Cheek');
  } else if (text.includes('scar')) {
    dna.marks = [
      { id: 's_parsed', type: 'scar', anchorPoint: 'brow_R', offsetX: 8, offsetY: 2, scale: 1.2, opacity: 0.85 }
    ];
    matchedTags.push('Mark: Facial Scar across Brow');
  } else if (text.includes('freckles') || text.includes('freckled')) {
    dna.marks = [
      { id: 'f_parsed', type: 'freckles', anchorPoint: 'nose', offsetX: 0, offsetY: 0, scale: 1.0, opacity: 0.75 }
    ];
    matchedTags.push('Mark: Freckle Constellation');
  }

  const summary = matchedTags.length > 0
    ? `Extracted ${matchedTags.length} character trait(s) from prose description.`
    : 'No explicit traits detected; standard baseline applied.';

  return {
    dna,
    matchedTags,
    summary
  };
}
