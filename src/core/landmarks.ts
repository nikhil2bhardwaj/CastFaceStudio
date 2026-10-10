/**
 * 2D Anatomical Landmark & Feature Graph Engine
 * Master Reference: MasterDoc.md (FR1, FR2, FR4, FR6, FR7, FR8)
 */

import { CharacterDNA } from '../types/face';
import { calculateAgingFactors, clamp, lerp } from './math';

export interface Point {
  x: number;
  y: number;
}

export interface EyeFeature {
  center: Point;
  innerCorner: Point;
  outerCorner: Point;
  topLid: Point;
  bottomLid: Point;
  creaseStart: Point;
  creasePeak: Point;
  creaseEnd: Point;
  pupil: Point;
  irisRadius: number;
  pupilRadius: number;
  openness: number;
}

export interface BrowFeature {
  inner: Point;
  arch: Point;
  outer: Point;
  thickness: number;
}

export interface NoseFeature {
  root: Point;
  bridge: Point;
  tip: Point;
  leftAlar: Point;
  rightAlar: Point;
  columella: Point;
  width: number;
  bridgeWidth: number;
}

export interface MouthFeature {
  leftCorner: Point;
  rightCorner: Point;
  upperPeakL: Point;
  upperPeakR: Point;
  cupidCenter: Point;
  lowerLipBottom: Point;
  fissureCenter: Point;
  openGap: number;
}

export interface EarFeature {
  top: Point;
  outerPeak: Point;
  canal: Point;
  lobe: Point;
}

export interface FaceLandmarks {
  // Cranium & Jaw Outline
  crown: Point;
  templeL: Point;
  templeR: Point;
  cheekL: Point;
  cheekR: Point;
  jawAngleL: Point;
  jawAngleR: Point;
  chinL: Point;
  chinApex: Point;
  chinR: Point;

  // Neck & Trapezius
  neckL: Point;
  neckR: Point;
  clavicleMid: Point;
  shoulderL: Point;
  shoulderR: Point;

  // Features
  leftEye: EyeFeature;
  rightEye: EyeFeature;
  leftBrow: BrowFeature;
  rightBrow: BrowFeature;
  nose: NoseFeature;
  mouth: MouthFeature;
  leftEar: EarFeature;
  rightEar: EarFeature;

  // Feature Anchors for marks & accessories (FR7.4, FR8.2)
  anchors: Record<string, Point>;
}

export function computeFaceLandmarks(dna: CharacterDNA): FaceLandmarks {
  const age = dna.timeline.age;
  const aging = calculateAgingFactors(age);
  const { head, features } = dna.morphs;

  const CX = 300; // Center X of canvas (600x750)
  
  // Biological Age Scaling:
  // Infant features sit lower on head, cranium is rounder, chin is shorter/recessed
  const infantOffset = (1.0 - aging.verticalFeatureRatio) * 45;
  const baseEyeY = 325 + infantOffset + (features.eyeHeight - 0.5) * 40;

  // Head Silhouette Dimensions
  const headHalfWidth = 115 + (head.cranialWidth - 0.5) * 40 - (1.0 - aging.verticalFeatureRatio) * 10;
  const cranialTopY = 100 - (head.headLength - 0.5) * 25 - (1.0 - aging.verticalFeatureRatio) * 20;
  
  // Jaw & Chin Shape
  const jawLengthFactor = aging.mandibleLength * (0.85 + (head.headLength - 0.5) * 0.4);
  const chinY = baseEyeY + 185 * jawLengthFactor + (head.chinProminence - 0.5) * 25;
  
  // Jaw squareness vs taper (FR1.2 gender appearance blend)
  const genderSquareness = lerp(0.35, 0.75, dna.meta.genderExpression);
  const totalJawSquare = clamp(head.jawSquareness * 0.7 + genderSquareness * 0.3);
  
  const jawAngleY = lerp(baseEyeY + 105, baseEyeY + 125, totalJawSquare) + (aging.tissueSag * 10);
  const jawHalfWidth = lerp(headHalfWidth * 0.68, headHalfWidth * 0.94, totalJawSquare) + (aging.tissueSag * 8);

  const chinHalfWidth = lerp(16, 42, head.chinWidth) * lerp(0.8, 1.2, totalJawSquare);
  const cheekHalfWidth = headHalfWidth * (0.95 + (head.cheekFullness - 0.5) * 0.15 + aging.cheekBabyFat * 0.12);

  // Outline Points
  const crown: Point = { x: CX, y: cranialTopY };
  const templeL: Point = { x: CX - headHalfWidth * 0.96, y: baseEyeY - 95 };
  const templeR: Point = { x: CX + headHalfWidth * 0.96, y: baseEyeY - 95 };
  
  const cheekL: Point = { x: CX - cheekHalfWidth, y: baseEyeY + 25 };
  const cheekR: Point = { x: CX + cheekHalfWidth, y: baseEyeY + 25 };

  const jawAngleL: Point = { x: CX - jawHalfWidth, y: jawAngleY };
  const jawAngleR: Point = { x: CX + jawHalfWidth, y: jawAngleY };

  const chinL: Point = { x: CX - chinHalfWidth, y: chinY - 4 };
  const chinApex: Point = { x: CX, y: chinY };
  const chinR: Point = { x: CX + chinHalfWidth, y: chinY - 4 };

  // Neck & Shoulders (FR1.4)
  const neckHalfWidth = lerp(50, 95, head.neckWidth * 0.7 + dna.meta.genderExpression * 0.3) * lerp(0.7, 1.05, aging.verticalFeatureRatio);
  const neckY = jawAngleY + 10;
  const neckL: Point = { x: CX - neckHalfWidth, y: neckY };
  const neckR: Point = { x: CX + neckHalfWidth, y: neckY };
  const clavicleMid: Point = { x: CX, y: 670 };
  const shoulderL: Point = { x: 70, y: 750 };
  const shoulderR: Point = { x: 530, y: 750 };

  // Eyes (FR2.1)
  // Eye Spacing: default pupil distance is ~125px
  const eyeHalfDist = lerp(45, 75, features.eyeSpacing);
  const eyeWidth = lerp(32, 54, features.eyeSize);
  const eyeHeight = lerp(18, 32, features.eyeSize) * lerp(1.15, 0.85, aging.tissueSag);
  const eyeSlantOffset = features.eyeSlant * 9; // canthal tilt

  // 8 Base Emotions & 2-Way Emotion Mixer (FR6.1, FR6.2)
  interface EmotionDeltas {
    eyeOpenMult: number;
    browInnerDelta: number;
    browArchDelta: number;
    mouthCornerYDeltaL: number;
    mouthCornerYDeltaR: number;
    mouthOpenDelta: number;
  }

  function getEmotionDeltas(emotion: string, strength: number): EmotionDeltas {
    const s = clamp(strength, 0, 1);
    switch (emotion) {
      case 'happy':
        return { eyeOpenMult: lerp(1.0, 0.78, s), browInnerDelta: 0, browArchDelta: -3 * s, mouthCornerYDeltaL: -18 * s, mouthCornerYDeltaR: -18 * s, mouthOpenDelta: 12 * s };
      case 'sad':
        return { eyeOpenMult: 1.0, browInnerDelta: -16 * s, browArchDelta: 10 * s, mouthCornerYDeltaL: 14 * s, mouthCornerYDeltaR: 14 * s, mouthOpenDelta: 2 * s };
      case 'angry':
        return { eyeOpenMult: lerp(1.0, 0.85, s), browInnerDelta: 18 * s, browArchDelta: -12 * s, mouthCornerYDeltaL: 8 * s, mouthCornerYDeltaR: 8 * s, mouthOpenDelta: 3 * s };
      case 'surprise':
        return { eyeOpenMult: lerp(1.0, 1.35, s), browInnerDelta: -18 * s, browArchDelta: -16 * s, mouthCornerYDeltaL: -4 * s, mouthCornerYDeltaR: -4 * s, mouthOpenDelta: 34 * s };
      case 'fear':
        return { eyeOpenMult: lerp(1.0, 1.25, s), browInnerDelta: -15 * s, browArchDelta: 12 * s, mouthCornerYDeltaL: 6 * s, mouthCornerYDeltaR: 6 * s, mouthOpenDelta: 18 * s };
      case 'disgust':
        return { eyeOpenMult: lerp(1.0, 0.82, s), browInnerDelta: 14 * s, browArchDelta: -6 * s, mouthCornerYDeltaL: -12 * s, mouthCornerYDeltaR: -6 * s, mouthOpenDelta: 10 * s };
      case 'contempt':
        // Unilateral asymmetric smirk (FR6.1, FR6.4)
        return { eyeOpenMult: 1.0, browInnerDelta: -2 * s, browArchDelta: -4 * s, mouthCornerYDeltaL: -16 * s, mouthCornerYDeltaR: 3 * s, mouthOpenDelta: 4 * s };
      case 'neutral':
      default:
        return { eyeOpenMult: 1.0, browInnerDelta: 0, browArchDelta: 0, mouthCornerYDeltaL: 0, mouthCornerYDeltaR: 0, mouthOpenDelta: 0 };
    }
  }

  // 2-Way Emotion Mixer: blend primary and secondary emotions (FR6.2)
  const blendW = clamp(dna.expression.blendStrength ?? 0, 0, 1);
  const primaryW = (1.0 - blendW) * dna.expression.emotionStrength;
  const secondaryW = blendW * dna.expression.emotionStrength;

  const d1 = getEmotionDeltas(dna.expression.activeEmotion, primaryW);
  const d2 = getEmotionDeltas(dna.expression.blendEmotion, secondaryW);

  let eyeOpenMult = d1.eyeOpenMult * d2.eyeOpenMult;
  let browInnerDelta = d1.browInnerDelta + d2.browInnerDelta;
  let browArchDelta = d1.browArchDelta + d2.browArchDelta;
  let mouthCornerYDeltaL = d1.mouthCornerYDeltaL + d2.mouthCornerYDeltaL;
  let mouthCornerYDeltaR = d1.mouthCornerYDeltaR + d2.mouthCornerYDeltaR;
  let mouthOpenDelta = d1.mouthOpenDelta + d2.mouthOpenDelta;

  // Speech Visemes & Talking Shapes (FR6.3)
  const viseme = dna.expression.mouthViseme;
  let visemeWidthDelta = 0;
  if (viseme === 'aa') {
    mouthOpenDelta = Math.max(mouthOpenDelta, 26);
    visemeWidthDelta = -6;
  } else if (viseme === 'ee') {
    mouthOpenDelta = Math.max(mouthOpenDelta, 14);
    visemeWidthDelta = 14;
    mouthCornerYDeltaL -= 6;
    mouthCornerYDeltaR -= 6;
  } else if (viseme === 'oo') {
    mouthOpenDelta = Math.max(mouthOpenDelta, 18);
    visemeWidthDelta = -20;
  } else if (viseme === 'wide') {
    mouthOpenDelta = Math.max(mouthOpenDelta, 36);
    visemeWidthDelta = 12;
  } else if (viseme === 'frown') {
    mouthCornerYDeltaL += 12;
    mouthCornerYDeltaR += 12;
  }

  // Asymmetric Expression: Crooked Smile (FR6.4)
  const crooked = dna.expression.crookedSmile ?? 0;
  mouthCornerYDeltaL -= crooked * 15;
  mouthCornerYDeltaR += crooked * 6;

  // Blink state (0 to 1)
  const effectiveBlink = Math.max(dna.expression.blinkState, 1.0 - eyeOpenMult);

  const leftPupilX = CX - eyeHalfDist;
  const rightPupilX = CX + eyeHalfDist;
  const pupilY = baseEyeY;

  const leftEye: EyeFeature = {
    center: { x: leftPupilX, y: pupilY },
    innerCorner: { x: leftPupilX + eyeWidth * 0.52, y: pupilY + eyeSlantOffset * 0.4 },
    outerCorner: { x: leftPupilX - eyeWidth * 0.52, y: pupilY - eyeSlantOffset },
    topLid: { x: leftPupilX, y: pupilY - eyeHeight * 0.55 * (1.0 - effectiveBlink) },
    bottomLid: { x: leftPupilX, y: pupilY + eyeHeight * 0.45 * (1.0 - effectiveBlink) },
    creaseStart: { x: leftPupilX + eyeWidth * 0.45, y: pupilY - eyeHeight * 0.3 },
    creasePeak: { x: leftPupilX, y: pupilY - eyeHeight * 0.85 },
    creaseEnd: { x: leftPupilX - eyeWidth * 0.45, y: pupilY - eyeHeight * 0.4 },
    pupil: { x: leftPupilX + dna.coloration.eyes.gazeX * 6, y: pupilY + dna.coloration.eyes.gazeY * 5 },
    irisRadius: lerp(11, 16, dna.coloration.eyes.irisSize),
    pupilRadius: lerp(4, 8, dna.coloration.eyes.pupilSize),
    openness: 1.0 - effectiveBlink
  };

  const rightEye: EyeFeature = {
    center: { x: rightPupilX, y: pupilY },
    innerCorner: { x: rightPupilX - eyeWidth * 0.52, y: pupilY + eyeSlantOffset * 0.4 },
    outerCorner: { x: rightPupilX + eyeWidth * 0.52, y: pupilY - eyeSlantOffset },
    topLid: { x: rightPupilX, y: pupilY - eyeHeight * 0.55 * (1.0 - effectiveBlink) },
    bottomLid: { x: rightPupilX, y: pupilY + eyeHeight * 0.45 * (1.0 - effectiveBlink) },
    creaseStart: { x: rightPupilX - eyeWidth * 0.45, y: pupilY - eyeHeight * 0.3 },
    creasePeak: { x: rightPupilX, y: pupilY - eyeHeight * 0.85 },
    creaseEnd: { x: rightPupilX + eyeWidth * 0.45, y: pupilY - eyeHeight * 0.4 },
    pupil: { x: rightPupilX + dna.coloration.eyes.gazeX * 6, y: pupilY + dna.coloration.eyes.gazeY * 5 },
    irisRadius: lerp(11, 16, dna.coloration.eyes.irisSize),
    pupilRadius: lerp(4, 8, dna.coloration.eyes.pupilSize),
    openness: 1.0 - effectiveBlink
  };

  // Brows (FR2.3)
  const browBaseY = pupilY - lerp(20, 38, features.browHeight);
  const browThickness = lerp(4, 13, features.browThickness);
  const browArchHeight = lerp(4, 18, features.browArch);

  // Expression brow asymmetry
  const oneBrowDelta = dna.expression.oneBrowRaise * 14;

  const leftBrow: BrowFeature = {
    inner: { x: leftEye.innerCorner.x + 3, y: browBaseY + browInnerDelta + oneBrowDelta },
    arch: { x: leftEye.center.x - 4, y: browBaseY - browArchHeight + browArchDelta + oneBrowDelta },
    outer: { x: leftEye.outerCorner.x - 6, y: browBaseY + 4 + oneBrowDelta },
    thickness: browThickness
  };

  const rightBrow: BrowFeature = {
    inner: { x: rightEye.innerCorner.x - 3, y: browBaseY + browInnerDelta },
    arch: { x: rightEye.center.x + 4, y: browBaseY - browArchHeight + browArchDelta },
    outer: { x: rightEye.outerCorner.x + 6, y: browBaseY + 4 },
    thickness: browThickness
  };

  // Nose (FR2.4)
  const noseLength = lerp(42, 85, features.noseLength) * aging.mandibleLength * aging.cartilageGrowth;
  const noseTipY = pupilY + noseLength;
  const noseBridgeWidth = lerp(10, 26, features.noseBridgeWidth);
  const noseTipWidth = lerp(16, 36, features.noseTipSize) * aging.cartilageGrowth;
  const alarFlare = lerp(22, 42, features.nostrilFlare);

  const nose: NoseFeature = {
    root: { x: CX, y: pupilY - 4 },
    bridge: { x: CX, y: pupilY + noseLength * 0.45 },
    tip: { x: CX, y: noseTipY - features.noseTipUpturn * 9 },
    leftAlar: { x: CX - alarFlare * 0.5, y: noseTipY + 4 },
    rightAlar: { x: CX + alarFlare * 0.5, y: noseTipY + 4 },
    columella: { x: CX, y: noseTipY + 7 },
    width: noseTipWidth,
    bridgeWidth: noseBridgeWidth
  };

  // Mouth (FR2.5, FR6.3, FR6.4)
  const mouthDistFromNose = lerp(24, 46, features.mouthHeight);
  const mouthY = nose.columella.y + mouthDistFromNose;
  const mouthHalfWidth = Math.max(16, lerp(26, 56, features.mouthWidth) + visemeWidthDelta);
  const upperLipHeight = lerp(7, 24, features.upperLipFullness);
  const lowerLipHeight = lerp(9, 28, features.lowerLipFullness);

  const mouth: MouthFeature = {
    leftCorner: { x: CX - mouthHalfWidth, y: mouthY + mouthCornerYDeltaL },
    rightCorner: { x: CX + mouthHalfWidth, y: mouthY + mouthCornerYDeltaR },
    upperPeakL: { x: CX - 10, y: mouthY - upperLipHeight },
    upperPeakR: { x: CX + 10, y: mouthY - upperLipHeight },
    cupidCenter: { x: CX, y: mouthY - upperLipHeight * (1.0 - features.cupidsBowDefinition * 0.45) },
    lowerLipBottom: { x: CX, y: mouthY + lowerLipHeight + mouthOpenDelta * 0.8 },
    fissureCenter: { x: CX, y: mouthY + mouthOpenDelta * 0.4 },
    openGap: mouthOpenDelta
  };

  // Ears (FR2.6)
  const earTopY = baseEyeY - 24;
  const earBottomY = nose.tip.y + lerp(8, 28, features.earSize) * aging.cartilageGrowth;
  const earProtrusion = lerp(18, 42, features.earProtrusion);

  const leftEar: EarFeature = {
    top: { x: templeL.x + 6, y: earTopY },
    outerPeak: { x: templeL.x - earProtrusion, y: (earTopY + earBottomY) * 0.45 },
    canal: { x: templeL.x + 4, y: baseEyeY },
    lobe: { x: templeL.x + (features.earLobeAttached > 0.5 ? 4 : -4), y: earBottomY }
  };

  const rightEar: EarFeature = {
    top: { x: templeR.x - 6, y: earTopY },
    outerPeak: { x: templeR.x + earProtrusion, y: (earTopY + earBottomY) * 0.45 },
    canal: { x: templeR.x - 4, y: baseEyeY },
    lobe: { x: templeR.x - (features.earLobeAttached > 0.5 ? 4 : -4), y: earBottomY }
  };

  // Dynamically Anchored Points for marks, scars, glasses, piercings
  const anchors: Record<string, Point> = {
    crown,
    forehead: { x: CX, y: baseEyeY - 60 },
    temple_L: templeL,
    temple_R: templeR,
    cheek_L: { x: CX - eyeHalfDist * 0.8, y: nose.bridge.y + 15 },
    cheek_R: { x: CX + eyeHalfDist * 0.8, y: nose.bridge.y + 15 },
    nose_bridge: nose.bridge,
    nose_tip: nose.tip,
    nose: nose.tip,
    lip_corner_L: mouth.leftCorner,
    lip_corner_R: mouth.rightCorner,
    chin: chinApex,
    ear_lobe_L: leftEar.lobe,
    ear_lobe_R: rightEar.lobe,
    brow_L: leftBrow.arch,
    brow_R: rightBrow.arch
  };

  return {
    crown,
    templeL,
    templeR,
    cheekL,
    cheekR,
    jawAngleL,
    jawAngleR,
    chinL,
    chinApex,
    chinR,
    neckL,
    neckR,
    clavicleMid,
    shoulderL,
    shoulderR,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    nose,
    mouth,
    leftEar,
    rightEar,
    anchors
  };
}
