/**
 * Character Bible Generator & Narrative Plain-Language Description
 * Master Reference: MasterDoc.md (FR13.3)
 */

import { CharacterDNA } from '../types/face';
import { renderFaceSVG } from '../renderer/svg-renderer';

export interface CharacterBibleData {
  summaryParagraph: string;
  portraitSVG: string;
  palette: {
    skinLightness: string;
    undertone: string;
    eyeColorL: string;
    eyeColorR: string;
    hairColor: string;
    graying: string;
  };
  metrics: {
    cranialWidth: string;
    jawSquareness: string;
    chinWidth: string;
    eyeSpacing: string;
    eyeSize: string;
    noseLength: string;
    lipFullness: string;
  };
  marksSummary: string;
}

export function generateCharacterBibleData(dna: CharacterDNA): CharacterBibleData {
  const meta = dna.meta;
  const age = dna.timeline.age;
  const skin = dna.coloration.skin;
  const eyes = dna.coloration.eyes;
  const hair = dna.coloration.hair;
  const head = dna.morphs.head;
  const feat = dna.morphs.features;

  // 1. Natural Language Description Generation
  const genderTerm = meta.genderExpression > 0.65 ? 'man' : meta.genderExpression < 0.35 ? 'woman' : 'individual';
  const ageStage = age < 12 ? 'child' : age < 20 ? 'adolescent' : age < 40 ? 'adult' : age < 60 ? 'mature' : 'elder';
  
  let jawDesc = 'balanced tapered jawline';
  if (head.jawSquareness > 0.65) jawDesc = 'prominent, chiseled square jaw';
  else if (head.jawSquareness < 0.35) jawDesc = 'delicate, softly tapered jaw';

  let eyeDesc = 'expressive eyes';
  if (feat.almondShape > 0.65) eyeDesc = 'distinct almond-shaped eyes with subtle epicanthic fold definition';
  else if (feat.eyeSize > 0.62) eyeDesc = 'large, luminous wide eyes';
  else if (feat.eyeSize < 0.42) eyeDesc = 'piercing, focused narrow eyes';

  let noseDesc = 'straight nose bridge';
  if (feat.noseHump > 0.25 || feat.noseLength > 0.60) noseDesc = 'prominent aquiline nose with defined dorsal bridge';
  else if (feat.noseTipUpturn > 0.15) noseDesc = 'gently upturned button nose';

  let hairDesc = `${dna.assets.hairStyleId} hair`;
  if (hair.graying > 0.5) hairDesc += ` with pronounced silver-gray streaks`;

  let marksText = 'No distinct facial scarring or blemishes recorded.';
  if (dna.marks && dna.marks.length > 0) {
    const list = dna.marks.map(m => `${m.type} situated at ${m.anchorPoint.replace('_', ' ')}`);
    marksText = `Distinguishing physical marks include ${list.join(', ')}.`;
  }

  const summaryParagraph = `${meta.name} is a ${age}-year-old ${ageStage} (${genderTerm}, ${meta.role}) born in ${meta.birthYear}. Physiologically, ${meta.name} presents with a ${jawDesc}, ${eyeDesc}, and a ${noseDesc}. Coloration is characterized by ${skin.undertone} skin undertones, ${eyes.irisColorL === eyes.irisColorR ? `${eyes.irisColorL} irises` : `heterochromatic eyes (${eyes.irisColorL} left, ${eyes.irisColorR} right)`}, and natural ${hairDesc}. ${marksText} Rigged with continuity-locked coordinates for multi-generation cinematic tracking.`;

  const portraitSVG = renderFaceSVG(dna, { transparentBackground: false });

  return {
    summaryParagraph,
    portraitSVG,
    palette: {
      skinLightness: `${Math.round(skin.lightness * 100)}% (${skin.lightness < 0.35 ? 'Deep Obsidian' : skin.lightness < 0.6 ? 'Warm Olive/Tan' : 'Fair Porcelain'})`,
      undertone: skin.undertone.replace('-', ' '),
      eyeColorL: eyes.irisColorL,
      eyeColorR: eyes.irisColorR,
      hairColor: hair.baseColor,
      graying: `${Math.round(hair.graying * 100)}%`
    },
    metrics: {
      cranialWidth: `${Math.round(head.cranialWidth * 100)}%`,
      jawSquareness: `${Math.round(head.jawSquareness * 100)}%`,
      chinWidth: `${Math.round(head.chinWidth * 100)}%`,
      eyeSpacing: `${Math.round(feat.eyeSpacing * 100)}%`,
      eyeSize: `${Math.round(feat.eyeSize * 100)}%`,
      noseLength: `${Math.round(feat.noseLength * 100)}%`,
      lipFullness: `${Math.round(feat.lowerLipFullness * 100)}%`
    },
    marksSummary: marksText
  };
}
