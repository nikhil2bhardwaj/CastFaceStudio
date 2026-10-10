/**
 * Layered Scalable Vector Graphic (SVG) Face Renderer
 * Master Reference: MasterDoc.md (FR1, FR2, FR3, FR4, FR6, FR7, FR8, FR9, FR13)
 */

import { CharacterDNA } from '../types/face';
import { computeFaceLandmarks, FaceLandmarks } from '../core/landmarks';
import { calculateSkinPalette, calculateAgingFactors } from '../core/math';

export interface RenderOptions {
  transparentBackground?: boolean;
  showLandmarks?: boolean;
}

export function renderFaceSVG(dna: CharacterDNA, options: RenderOptions = {}): string {
  const lm: FaceLandmarks = computeFaceLandmarks(dna);
  const skin = calculateSkinPalette(
    dna.coloration.skin.lightness,
    dna.coloration.skin.undertone,
    dna.coloration.skin.blushIntensity
  );
  const ageFactors = calculateAgingFactors(dna.timeline.age);
  
  // Dynamic stroke color and weight based on art style preset (FR9.1, FR9.2, FR9.3)
  const preset = dna.artStyle.preset;
  let strokeColor = '#231815';
  let lineWeight = dna.artStyle.lineWeight;

  if (preset === 'noir') {
    strokeColor = '#050505';
    lineWeight = Math.max(1.8, dna.artStyle.lineWeight * 1.35);
  } else if (preset === 'sketch') {
    strokeColor = '#3e3e42';
    lineWeight = Math.max(1.0, dna.artStyle.lineWeight * 0.95);
  } else if (preset === 'cartoon-shade') {
    strokeColor = '#1a181c';
    lineWeight = Math.max(2.0, dna.artStyle.lineWeight * 1.5);
  } else if (preset === 'flat') {
    strokeColor = '#1f1b24';
    lineWeight = Math.max(1.4, dna.artStyle.lineWeight * 1.15);
  }

  // Background styling (FR9.4, FR7.2)
  let bgFill = 'transparent';
  if (!options.transparentBackground) {
    if (preset === 'sketch') {
      bgFill = '#f5f2eb'; // Warm sketchbook parchment paper
    } else if (preset === 'noir') {
      bgFill = '#0a0c10'; // Stark graphic novel dark
    } else if (dna.artStyle.lighting === 'warm-interior') {
      bgFill = '#1c1b22';
    } else if (dna.artStyle.lighting === 'cold-exterior') {
      bgFill = '#161d26';
    } else {
      bgFill = '#181a20';
    }
  }

  const wobbleAmount = Math.max(
    dna.artStyle.lineWobble * 8,
    preset === 'sketch' ? 3.6 : 0
  );

  // Generate SVG filters / gradients for soft-shading
  const defs = `
    <defs>
      ${wobbleAmount > 0 ? `
        <!-- Hand-Drawn Wobble & Pencil Jitter Filter (FR9.1) -->
        <filter id="filter-line-wobble" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="${wobbleAmount.toFixed(1)}" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      ` : ''}

      <!-- Skin Ambient Soft Radial Gradient -->
      <radialGradient id="grad-face-ambient" cx="48%" cy="40%" r="55%" fx="45%" fy="35%">
        <stop offset="0%" stop-color="${skin.highlight}" stop-opacity="0.9" />
        <stop offset="65%" stop-color="${skin.base}" />
        <stop offset="100%" stop-color="${skin.shadow}" />
      </radialGradient>

      <!-- Cheek Blush Gradient -->
      <radialGradient id="grad-blush" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${skin.blush}" stop-opacity="${preset === 'flat' ? 0.2 : 0.45 * dna.coloration.skin.blushIntensity}" />
        <stop offset="100%" stop-color="${skin.blush}" stop-opacity="0" />
      </radialGradient>

      <!-- Neck Drop Shadow -->
      <linearGradient id="grad-neck-shadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skin.deepShadow}" stop-opacity="0.6" />
        <stop offset="40%" stop-color="${skin.shadow}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${skin.base}" stop-opacity="0" />
      </linearGradient>

      <!-- Iris Depth Gradient -->
      <radialGradient id="grad-iris-L" cx="42%" cy="38%" r="60%">
        <stop offset="0%" stop-color="${lightenColor(dna.coloration.eyes.irisColorL, 25)}" />
        <stop offset="70%" stop-color="${dna.coloration.eyes.irisColorL}" />
        <stop offset="100%" stop-color="${darkenColor(dna.coloration.eyes.irisColorL, 40)}" />
      </radialGradient>
      <radialGradient id="grad-iris-R" cx="42%" cy="38%" r="60%">
        <stop offset="0%" stop-color="${lightenColor(dna.coloration.eyes.irisColorR, 25)}" />
        <stop offset="70%" stop-color="${dna.coloration.eyes.irisColorR}" />
        <stop offset="100%" stop-color="${darkenColor(dna.coloration.eyes.irisColorR, 40)}" />
      </radialGradient>

      <!-- Soft Nose Shadow -->
      <radialGradient id="grad-nose-shadow" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stop-color="${skin.shadow}" stop-opacity="0.45" />
        <stop offset="100%" stop-color="${skin.shadow}" stop-opacity="0" />
      </radialGradient>
    </defs>
  `;

  // LAYER 1: BACK HAIR
  const backHair = renderBackHair(dna, lm);

  // LAYER 2: NECK & COLLAR
  const neckAndCollar = renderNeckAndCollar(dna, lm, skin, strokeColor, lineWeight);

  // LAYER 3: EARS
  const ears = renderEars(lm, skin, strokeColor, lineWeight);

  // LAYER 4: HEAD SILHOUETTE
  const headSilhouette = renderHeadSilhouette(dna, lm, skin, strokeColor, lineWeight);

  // LAYER 5: SKIN SHADING & BLUSH
  const skinShading = renderSkinShading(dna, lm, skin);

  // LAYER 6: UNIQUE MARKS (FR8)
  const marks = renderMarks(dna, lm);

  // LAYER 7: NOSE
  const nose = renderNose(dna, lm, skin, strokeColor, lineWeight);

  // LAYER 8: MOUTH & TEETH
  const mouth = renderMouth(dna, lm, skin, strokeColor, lineWeight);

  // LAYER 9: BEARD / STUBBLE
  const beard = renderBeard(dna, lm, strokeColor);

  // LAYER 10: EYES
  const eyes = renderEyes(lm, strokeColor, lineWeight);

  // LAYER 11: BROWS
  const brows = renderBrows(dna, lm, strokeColor);

  // LAYER 12: AGE LINES & CREASES (FR4)
  const ageLines = renderAgeLines(dna, lm, ageFactors, strokeColor);

  // LAYER 13: GLASSES & ACCESSORIES (FR7.4)
  const accessories = renderAccessories(dna, lm);

  // LAYER 14: FRONT HAIR / BANGS / FRINGE
  const frontHair = renderFrontHair(dna, lm, strokeColor, lineWeight);

  const filterAttr = wobbleAmount > 0 ? 'filter="url(#filter-line-wobble)"' : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="100%" height="100%" class="cast-face-svg">
      ${defs}
      <rect width="600" height="750" fill="${bgFill}" />

      <!-- Fixed Drawing Order (FR7.1) -->
      <g id="rig-vector-content" ${filterAttr}>
        <g id="layer-back-hair">${backHair}</g>
        <g id="layer-neck-collar">${neckAndCollar}</g>
        <g id="layer-ears">${ears}</g>
        <g id="layer-head-silhouette">${headSilhouette}</g>
        <g id="layer-skin-shading">${skinShading}</g>
        <g id="layer-marks-scars">${marks}</g>
        <g id="layer-nose">${nose}</g>
        <g id="layer-mouth-teeth">${mouth}</g>
        <g id="layer-beard-stubble">${beard}</g>
        <g id="layer-eyes">${eyes}</g>
        <g id="layer-brows">${brows}</g>
        <g id="layer-age-lines">${ageLines}</g>
        <g id="layer-accessories">${accessories}</g>
        <g id="layer-front-hair">${frontHair}</g>
      </g>
    </svg>
  `.trim();
}

/** Layer Renderers **/

function renderBackHair(dna: CharacterDNA, lm: FaceLandmarks): string {
  const style = dna.assets.hairStyleId;
  if (style === 'bald' || style === 'buzz') return '';

  const hairColor = getEffectiveHairColor(dna);
  const cx = 300;

  if (style === 'long-straight' || style === 'wavy-medium') {
    return `
      <path d="M ${lm.templeL.x - 22} ${lm.templeL.y}
               C ${lm.templeL.x - 35} ${lm.jawAngleL.y}, ${lm.neckL.x - 45} 560, ${lm.neckL.x - 30} 650
               L ${lm.neckR.x + 30} 650
               C ${lm.neckR.x + 45} 560, ${lm.templeR.x + 35} ${lm.jawAngleR.y}, ${lm.templeR.x + 22} ${lm.templeR.y}
               C ${cx + 100} ${lm.crown.y - 30}, ${cx - 100} ${lm.crown.y - 30}, ${lm.templeL.x - 22} ${lm.templeL.y} Z"
            fill="${darkenColor(hairColor, 15)}" />
    `;
  }

  if (style === 'afro-short') {
    return `
      <ellipse cx="${cx}" cy="${lm.crown.y + 40}" rx="145" ry="120"
               fill="${darkenColor(hairColor, 12)}" />
    `;
  }

  return '';
}

function renderNeckAndCollar(dna: CharacterDNA, lm: FaceLandmarks, skin: any, strokeColor: string, weight: number): string {
  const collarColor = dna.assets.collarColor;

  return `
    <!-- Neck -->
    <path d="M ${lm.neckL.x} ${lm.neckL.y}
             C ${lm.neckL.x - 4} 540, ${lm.shoulderL.x + 60} 620, ${lm.shoulderL.x} ${lm.shoulderL.y}
             L ${lm.shoulderR.x} ${lm.shoulderR.y}
             C ${lm.shoulderR.x - 60} 620, ${lm.neckR.x + 4} 540, ${lm.neckR.x} ${lm.neckR.y} Z"
          fill="${skin.shadow}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />

    <!-- Trapezius shading -->
    <path d="M ${lm.neckL.x + 10} ${lm.neckL.y + 30}
             Q 300 560, ${lm.neckR.x - 10} ${lm.neckR.y + 30}
             L ${lm.neckR.x} 620
             L ${lm.neckL.x} 620 Z"
          fill="url(#grad-neck-shadow)" />

    <!-- Simple Collar / Shirt (FR7.5) -->
    <path d="M ${lm.neckL.x - 8} 590
             Q 300 660, ${lm.neckR.x + 8} 590
             L ${lm.neckR.x + 40} 750
             L ${lm.neckL.x - 40} 750 Z"
          fill="${collarColor}" stroke="${strokeColor}" stroke-width="${weight}" />
    <path d="M ${lm.neckL.x - 8} 590 Q 300 660, ${lm.neckR.x + 8} 590"
          fill="none" stroke="${lightenColor(collarColor, 20)}" stroke-width="${weight * 1.5}" />
  `;
}

function renderEars(lm: FaceLandmarks, skin: any, strokeColor: string, weight: number): string {
  const l = lm.leftEar;
  const r = lm.rightEar;

  return `
    <!-- Left Ear -->
    <path d="M ${l.top.x} ${l.top.y}
             C ${l.outerPeak.x - 4} ${l.top.y}, ${l.outerPeak.x - 2} ${l.canal.y}, ${l.outerPeak.x} ${l.canal.y + 10}
             C ${l.outerPeak.x + 2} ${l.lobe.y}, ${l.lobe.x - 6} ${l.lobe.y + 2}, ${l.lobe.x} ${l.lobe.y}
             Z"
          fill="${skin.base}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />
    <path d="M ${l.top.x - 2} ${l.top.y + 8}
             Q ${l.outerPeak.x + 6} ${l.canal.y}, ${l.lobe.x - 2} ${l.canal.y + 12}"
          fill="none" stroke="${skin.shadow}" stroke-width="${weight * 1.2}" />

    <!-- Right Ear -->
    <path d="M ${r.top.x} ${r.top.y}
             C ${r.outerPeak.x + 4} ${r.top.y}, ${r.outerPeak.x + 2} ${r.canal.y}, ${r.outerPeak.x} ${r.canal.y + 10}
             C ${r.outerPeak.x - 2} ${r.lobe.y}, ${r.lobe.x + 6} ${r.lobe.y + 2}, ${r.lobe.x} ${r.lobe.y}
             Z"
          fill="${skin.base}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />
    <path d="M ${r.top.x + 2} ${r.top.y + 8}
             Q ${r.outerPeak.x - 6} ${r.canal.y}, ${r.lobe.x + 2} ${r.canal.y + 12}"
          fill="none" stroke="${skin.shadow}" stroke-width="${weight * 1.2}" />
  `;
}

function renderHeadSilhouette(dna: CharacterDNA, lm: FaceLandmarks, skin: any, strokeColor: string, weight: number): string {
  // Smooth cubic Bézier head outline
  const pathD = `
    M ${lm.crown.x} ${lm.crown.y}
    C ${lm.templeR.x + 10} ${lm.crown.y + 5}, ${lm.templeR.x + 18} ${lm.templeR.y - 20}, ${lm.templeR.x} ${lm.templeR.y}
    C ${lm.cheekR.x + 15} ${lm.templeR.y + 35}, ${lm.cheekR.x + 12} ${lm.cheekR.y}, ${lm.jawAngleR.x} ${lm.jawAngleR.y}
    C ${lm.jawAngleR.x - 10} ${lm.chinR.y - 15}, ${lm.chinR.x + 12} ${lm.chinR.y}, ${lm.chinApex.x} ${lm.chinApex.y}
    C ${lm.chinL.x - 12} ${lm.chinL.y}, ${lm.jawAngleL.x + 10} ${lm.chinL.y - 15}, ${lm.jawAngleL.x} ${lm.jawAngleL.y}
    C ${lm.cheekL.x - 12} ${lm.cheekL.y}, ${lm.cheekL.x - 15} ${lm.templeL.y + 35}, ${lm.templeL.x} ${lm.templeL.y}
    C ${lm.templeL.x - 18} ${lm.templeL.y - 20}, ${lm.templeL.x - 10} ${lm.crown.y + 5}, ${lm.crown.x} ${lm.crown.y}
    Z
  `;

  const fillStyle = dna.artStyle.preset === 'soft-shade' ? 'url(#grad-face-ambient)' : skin.base;

  return `
    <path d="${pathD}" fill="${fillStyle}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />
  `;
}

function renderSkinShading(dna: CharacterDNA, lm: FaceLandmarks, skin: any): string {
  const blushRadius = 55;
  const blushY = lm.nose.bridge.y + 12;
  const undereyeOpacity = dna.coloration.skin.undereyeDarkness * 0.45;

  return `
    <!-- Left Cheek Blush Zone (FR3.2) -->
    <ellipse cx="${lm.cheekL.x + 35}" cy="${blushY}" rx="${blushRadius}" ry="35"
             fill="url(#grad-blush)" />

    <!-- Right Cheek Blush Zone (FR3.2) -->
    <ellipse cx="${lm.cheekR.x - 35}" cy="${blushY}" rx="${blushRadius}" ry="35"
             fill="url(#grad-blush)" />

    <!-- Undereye Shadows (FR3.2) -->
    ${undereyeOpacity > 0.02 ? `
      <ellipse cx="${lm.leftEye.center.x}" cy="${lm.leftEye.bottomLid.y + 6}" rx="${lm.leftEye.irisRadius * 1.6}" ry="6"
               fill="${skin.undereye}" opacity="${undereyeOpacity}" />
      <ellipse cx="${lm.rightEye.center.x}" cy="${lm.rightEye.bottomLid.y + 6}" rx="${lm.rightEye.irisRadius * 1.6}" ry="6"
               fill="${skin.undereye}" opacity="${undereyeOpacity}" />
    ` : ''}

    <!-- Nose Tip Blush -->
    <ellipse cx="${lm.nose.tip.x}" cy="${lm.nose.tip.y}" rx="18" ry="12"
             fill="url(#grad-blush)" />

    <!-- Sub-mandibular Chin Shadow -->
    <ellipse cx="300" cy="${lm.chinApex.y + 8}" rx="${Math.abs(lm.chinR.x - lm.chinL.x) * 0.9}" ry="12"
             fill="${skin.deepShadow}" opacity="0.35" />
  `;
}

function renderMarks(dna: CharacterDNA, lm: FaceLandmarks): string {
  if (!dna.marks || dna.marks.length === 0) return '';

  return dna.marks.map(mark => {
    const anchor = lm.anchors[mark.anchorPoint] || { x: 300, y: 350 };
    const mx = anchor.x + mark.offsetX;
    const my = anchor.y + mark.offsetY;

    if (mark.type === 'mole') {
      return `
        <circle cx="${mx}" cy="${my}" r="${2.4 * mark.scale}" fill="#261b17" opacity="${mark.opacity}" />
      `;
    }
    if (mark.type === 'freckles') {
      return `
        <circle cx="${mx - 6}" cy="${my - 2}" r="1.2" fill="#5c3826" opacity="${mark.opacity * 0.6}" />
        <circle cx="${mx}" cy="${my}" r="1.4" fill="#5c3826" opacity="${mark.opacity * 0.7}" />
        <circle cx="${mx + 7}" cy="${my + 3}" r="1.1" fill="#5c3826" opacity="${mark.opacity * 0.5}" />
        <circle cx="${mx + 3}" cy="${my - 5}" r="1.3" fill="#5c3826" opacity="${mark.opacity * 0.6}" />
      `;
    }
    if (mark.type === 'scar') {
      return `
        <line x1="${mx - 8}" y1="${my - 8}" x2="${mx + 8}" y2="${my + 8}"
              stroke="#8a4d46" stroke-width="1.8" stroke-linecap="round" opacity="${mark.opacity * 0.8}" />
        <line x1="${mx - 2}" y1="${my - 4}" x2="${mx + 3}" y2="${my - 2}"
              stroke="#eed8d4" stroke-width="1" opacity="${mark.opacity * 0.6}" />
      `;
    }
    return '';
  }).join('\n');
}

function renderNose(dna: CharacterDNA, lm: FaceLandmarks, skin: any, strokeColor: string, weight: number): string {
  const n = lm.nose;

  return `
    <!-- Nose Bridge Soft Shadow -->
    <path d="M ${n.root.x - 6} ${n.root.y}
             L ${n.bridge.x - 7} ${n.bridge.y}
             L ${n.tip.x - 12} ${n.tip.y}
             L ${n.tip.x + 12} ${n.tip.y}
             L ${n.bridge.x + 5} ${n.bridge.y} Z"
          fill="${skin.shadow}" opacity="0.32" />

    <!-- Nose Tip Highlight -->
    <ellipse cx="${n.tip.x}" cy="${n.tip.y - 2}" rx="${n.width * 0.35}" ry="${n.width * 0.28}"
             fill="${skin.highlight}" opacity="${0.45 + dna.coloration.skin.oilShine * 0.4}" />

    <!-- Nose Tip Contour & Underside (FR2.4) -->
    <path d="M ${n.leftAlar.x} ${n.leftAlar.y}
             Q ${n.leftAlar.x + 6} ${n.tip.y + 4}, ${n.columella.x} ${n.columella.y}
             Q ${n.rightAlar.x - 6} ${n.tip.y + 4}, ${n.rightAlar.x} ${n.rightAlar.y}"
          fill="none" stroke="${strokeColor}" stroke-width="${weight * 1.1}" stroke-linecap="round" />

    <!-- Nostril Accents -->
    <ellipse cx="${n.columella.x - 8}" cy="${n.columella.y - 2}" rx="3.5" ry="2"
             fill="${strokeColor}" opacity="0.8" />
    <ellipse cx="${n.columella.x + 8}" cy="${n.columella.y - 2}" rx="3.5" ry="2"
             fill="${strokeColor}" opacity="0.8" />

    <!-- Disgust Nasal Bridge Wrinkles (FR6.1) -->
    ${(dna.expression.activeEmotion === 'disgust' || dna.expression.blendEmotion === 'disgust') ? `
      <path d="M ${n.root.x - 10} ${n.root.y + 10} Q ${n.root.x} ${n.root.y + 7}, ${n.root.x + 10} ${n.root.y + 10}"
            fill="none" stroke="${strokeColor}" stroke-width="${weight * 0.9}" stroke-linecap="round" opacity="0.75" />
      <path d="M ${n.root.x - 7} ${n.root.y + 16} Q ${n.root.x} ${n.root.y + 13}, ${n.root.x + 7} ${n.root.y + 16}"
            fill="none" stroke="${strokeColor}" stroke-width="${weight * 0.8}" stroke-linecap="round" opacity="0.65" />
    ` : ''}
  `;
}

function renderMouth(dna: CharacterDNA, lm: FaceLandmarks, skin: any, strokeColor: string, weight: number): string {
  const m = lm.mouth;
  const isSmile = dna.expression.activeEmotion === 'happy';

  return `
    <!-- Upper Lip -->
    <path d="M ${m.leftCorner.x} ${m.leftCorner.y}
             Q ${m.leftCorner.x + 12} ${m.upperPeakL.y}, ${m.upperPeakL.x} ${m.upperPeakL.y}
             Q ${m.cupidCenter.x} ${m.cupidCenter.y + 3}, ${m.upperPeakR.x} ${m.upperPeakR.y}
             Q ${m.rightCorner.x - 12} ${m.upperPeakR.y}, ${m.rightCorner.x} ${m.rightCorner.y}
             Q ${m.fissureCenter.x} ${m.fissureCenter.y - 2}, ${m.leftCorner.x} ${m.leftCorner.y} Z"
          fill="${skin.lipColor}" stroke="${strokeColor}" stroke-width="${weight * 0.9}" stroke-linejoin="round" />

    <!-- Teeth / Open Mouth Void & Age Stages (FR4.4, FR6.3) -->
    ${m.openGap > 4 ? `
      <path d="M ${m.leftCorner.x + 4} ${m.leftCorner.y}
               Q 300 ${m.fissureCenter.y + m.openGap}, ${m.rightCorner.x - 4} ${m.rightCorner.y}
               Q 300 ${m.fissureCenter.y - 2}, ${m.leftCorner.x + 4} ${m.leftCorner.y} Z"
            fill="#381014" />
      ${dna.timeline.age <= 2 ? `
        <!-- Toothless Infant Gum Line -->
        <path d="M ${m.leftCorner.x + 12} ${m.fissureCenter.y + 1} Q 300 ${m.fissureCenter.y + 3}, ${m.rightCorner.x - 12} ${m.fissureCenter.y + 1}"
              stroke="#e29598" stroke-width="2.5" fill="none" stroke-linecap="round" />
      ` : dna.timeline.age >= 6 && dna.timeline.age <= 8 ? `
        <!-- Child Missing Front Incisor Stage (FR4.4) -->
        <path d="M ${m.leftCorner.x + 8} ${m.fissureCenter.y + 1} Q ${300 - 6} ${m.fissureCenter.y + 3}, ${300 - 6} ${m.fissureCenter.y + 1}" fill="#f7f6f2" />
        <path d="M ${300 + 6} ${m.fissureCenter.y + 1} Q ${m.rightCorner.x - 8} ${m.fissureCenter.y + 3}, ${m.rightCorner.x - 8} ${m.fissureCenter.y + 1}" fill="#f7f6f2" />
      ` : `
        <!-- Standard Dentition (Adult pearly white / Senior slightly worn ivory) -->
        <path d="M ${m.leftCorner.x + 8} ${m.fissureCenter.y + 1}
                 Q 300 ${m.fissureCenter.y + 4}, ${m.rightCorner.x - 8} ${m.rightCorner.y + 1}
                 Q 300 ${m.fissureCenter.y - 1}, ${m.leftCorner.x + 8} ${m.leftCorner.y + 1} Z"
              fill="${dna.timeline.age >= 65 ? '#ece8d9' : '#f7f6f2'}" />
      `}
    ` : ''}

    <!-- Oral Fissure (Center Closure Line) -->
    <path d="M ${m.leftCorner.x} ${m.leftCorner.y}
             Q 300 ${m.fissureCenter.y + (isSmile ? -3 : 2)}, ${m.rightCorner.x} ${m.rightCorner.y}"
          fill="none" stroke="${strokeColor}" stroke-width="${weight * 1.2}" stroke-linecap="round" />

    <!-- Lower Lip -->
    <path d="M ${m.leftCorner.x} ${m.leftCorner.y}
             Q 300 ${m.fissureCenter.y + 2}, ${m.rightCorner.x} ${m.rightCorner.y}
             Q 300 ${m.lowerLipBottom.y + 3}, ${m.leftCorner.x} ${m.leftCorner.y} Z"
          fill="${lightenColor(skin.lipColor, 8)}" stroke="${strokeColor}" stroke-width="${weight * 0.9}" stroke-linejoin="round" />

    <!-- Lower Lip Crease / Chin Groove (FR2.5) -->
    <path d="M ${300 - 15} ${m.lowerLipBottom.y + 7} Q 300 ${m.lowerLipBottom.y + 9}, ${300 + 15} ${m.lowerLipBottom.y + 7}"
          fill="none" stroke="${skin.shadow}" stroke-width="${weight * 1.1}" stroke-linecap="round" />
  `;
}

function renderBeard(dna: CharacterDNA, lm: FaceLandmarks, strokeColor: string): string {
  const style = dna.assets.beardStyleId;
  if (style === 'none') return '';

  const hairColor = getEffectiveHairColor(dna);

  if (style === 'stubble') {
    return `
      <!-- Stubble dots across jaw and upper lip -->
      <path d="M ${lm.jawAngleL.x + 15} ${lm.jawAngleL.y}
               Q 300 ${lm.chinApex.y - 10}, ${lm.jawAngleR.x - 15} ${lm.jawAngleR.y}
               Q 300 ${lm.chinApex.y + 4}, ${lm.jawAngleL.x + 15} ${lm.jawAngleL.y} Z"
            fill="${darkenColor(hairColor, 10)}" opacity="${0.25 * dna.assets.beardDensity}" />
    `;
  }

  if (style === 'clean-beard' || style === 'full-bushy') {
    return `
      <path d="M ${lm.jawAngleL.x} ${lm.jawAngleL.y - 15}
               C ${lm.jawAngleL.x + 10} ${lm.chinApex.y + 15}, ${lm.chinL.x - 15} ${lm.chinApex.y + 35}, ${lm.chinApex.x} ${lm.chinApex.y + (style === 'full-bushy' ? 45 : 20)}
               C ${lm.chinR.x + 15} ${lm.chinApex.y + 35}, ${lm.jawAngleR.x - 10} ${lm.chinApex.y + 15}, ${lm.jawAngleR.x} ${lm.jawAngleR.y - 15}
               C ${lm.jawAngleR.x - 20} ${lm.chinApex.y - 10}, ${lm.chinR.x + 5} ${lm.mouth.lowerLipBottom.y + 15}, 300 ${lm.mouth.lowerLipBottom.y + 15}
               C ${lm.chinL.x - 5} ${lm.mouth.lowerLipBottom.y + 15}, ${lm.jawAngleL.x + 20} ${lm.chinApex.y - 10}, ${lm.jawAngleL.x} ${lm.jawAngleL.y - 15} Z"
            fill="${hairColor}" stroke="${strokeColor}" stroke-width="1" />
    `;
  }

  return '';
}

function renderEyes(lm: FaceLandmarks, strokeColor: string, weight: number): string {
  const l = lm.leftEye;
  const r = lm.rightEye;

  return `
    <!-- LEFT EYE -->
    <g id="eye-left">
      <!-- Sclera (Eyeball white) -->
      <path d="M ${l.innerCorner.x} ${l.innerCorner.y}
               Q ${l.center.x} ${l.topLid.y - 2}, ${l.outerCorner.x} ${l.outerCorner.y}
               Q ${l.center.x} ${l.bottomLid.y + 2}, ${l.innerCorner.x} ${l.innerCorner.y} Z"
            fill="#f7f9fa" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />

      <!-- Iris (Clipped inside lids) -->
      <g clip-path="url(#clip-eye-l)">
        <circle cx="${l.pupil.x}" cy="${l.pupil.y}" r="${l.irisRadius}" fill="url(#grad-iris-L)" />
        <!-- Pupil -->
        <circle cx="${l.pupil.x}" cy="${l.pupil.y}" r="${l.pupilRadius}" fill="#0d0d11" />
        <!-- Specular Catchlight (FR2.2) -->
        <circle cx="${l.pupil.x - l.pupilRadius * 0.7}" cy="${l.pupil.y - l.pupilRadius * 0.7}" r="${l.pupilRadius * 0.6}" fill="#ffffff" opacity="0.95" />
        <circle cx="${l.pupil.x + l.pupilRadius * 0.8}" cy="${l.pupil.y + l.pupilRadius * 0.5}" r="${l.pupilRadius * 0.3}" fill="#ffffff" opacity="0.65" />
      </g>

      <!-- Upper Eyelid Fold / Epicanthic Crease (FR1.3, FR2.1) -->
      <path d="M ${l.creaseStart.x} ${l.creaseStart.y}
               Q ${l.creasePeak.x} ${l.creasePeak.y}, ${l.creaseEnd.x} ${l.creaseEnd.y}"
            fill="none" stroke="${strokeColor}" stroke-width="${weight * 0.85}" stroke-linecap="round" opacity="0.75" />

      <!-- Upper Lash Line (emphasized) -->
      <path d="M ${l.innerCorner.x} ${l.innerCorner.y}
               Q ${l.center.x} ${l.topLid.y - 2}, ${l.outerCorner.x} ${l.outerCorner.y}"
            fill="none" stroke="${strokeColor}" stroke-width="${weight * 1.5}" stroke-linecap="round" />
    </g>

    <!-- RIGHT EYE -->
    <g id="eye-right">
      <path d="M ${r.innerCorner.x} ${r.innerCorner.y}
               Q ${r.center.x} ${r.topLid.y - 2}, ${r.outerCorner.x} ${r.outerCorner.y}
               Q ${r.center.x} ${r.bottomLid.y + 2}, ${r.innerCorner.x} ${r.innerCorner.y} Z"
            fill="#f7f9fa" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />

      <g clip-path="url(#clip-eye-r)">
        <circle cx="${r.pupil.x}" cy="${r.pupil.y}" r="${r.irisRadius}" fill="url(#grad-iris-R)" />
        <circle cx="${r.pupil.x}" cy="${r.pupil.y}" r="${r.pupilRadius}" fill="#0d0d11" />
        <circle cx="${r.pupil.x - r.pupilRadius * 0.7}" cy="${r.pupil.y - r.pupilRadius * 0.7}" r="${r.pupilRadius * 0.6}" fill="#ffffff" opacity="0.95" />
        <circle cx="${r.pupil.x + r.pupilRadius * 0.8}" cy="${r.pupil.y + r.pupilRadius * 0.5}" r="${r.pupilRadius * 0.3}" fill="#ffffff" opacity="0.65" />
      </g>

      <path d="M ${r.creaseStart.x} ${r.creaseStart.y}
               Q ${r.creasePeak.x} ${r.creasePeak.y}, ${r.creaseEnd.x} ${r.creaseEnd.y}"
            fill="none" stroke="${strokeColor}" stroke-width="${weight * 0.85}" stroke-linecap="round" opacity="0.75" />

      <path d="M ${r.innerCorner.x} ${r.innerCorner.y}
               Q ${r.center.x} ${r.topLid.y - 2}, ${r.outerCorner.x} ${r.outerCorner.y}"
            fill="none" stroke="${strokeColor}" stroke-width="${weight * 1.5}" stroke-linecap="round" />
    </g>

    <!-- Clip Paths for Irises -->
    <clipPath id="clip-eye-l">
      <path d="M ${l.innerCorner.x} ${l.innerCorner.y}
               Q ${l.center.x} ${l.topLid.y - 2}, ${l.outerCorner.x} ${l.outerCorner.y}
               Q ${l.center.x} ${l.bottomLid.y + 2}, ${l.innerCorner.x} ${l.innerCorner.y} Z" />
    </clipPath>
    <clipPath id="clip-eye-r">
      <path d="M ${r.innerCorner.x} ${r.innerCorner.y}
               Q ${r.center.x} ${r.topLid.y - 2}, ${r.outerCorner.x} ${r.outerCorner.y}
               Q ${r.center.x} ${r.bottomLid.y + 2}, ${r.innerCorner.x} ${r.innerCorner.y} Z" />
    </clipPath>
  `;
}

function renderBrows(dna: CharacterDNA, lm: FaceLandmarks, strokeColor: string): string {
  const lb = lm.leftBrow;
  const rb = lm.rightBrow;
  const hairColor = getEffectiveHairColor(dna);
  const fill = darkenColor(hairColor, 15);

  return `
    <!-- Left Brow -->
    <path d="M ${lb.inner.x} ${lb.inner.y}
             Q ${lb.arch.x} ${lb.arch.y}, ${lb.outer.x} ${lb.outer.y}
             Q ${lb.arch.x - 2} ${lb.arch.y - lb.thickness}, ${lb.inner.x + 3} ${lb.inner.y - lb.thickness * 0.7} Z"
          fill="${fill}" stroke="${strokeColor}" stroke-width="0.8" stroke-linejoin="round" />

    <!-- Right Brow -->
    <path d="M ${rb.inner.x} ${rb.inner.y}
             Q ${rb.arch.x} ${rb.arch.y}, ${rb.outer.x} ${rb.outer.y}
             Q ${rb.arch.x + 2} ${rb.arch.y - rb.thickness}, ${rb.inner.x - 3} ${rb.inner.y - rb.thickness * 0.7} Z"
          fill="${fill}" stroke="${strokeColor}" stroke-width="0.8" stroke-linejoin="round" />
  `;
}

function renderAgeLines(dna: CharacterDNA, lm: FaceLandmarks, aging: any, strokeColor: string): string {
  const lines: string[] = [];
  const cx = 300;

  // Forehead horizontal furrows (FR4.2)
  const fhInt = dna.timeline.overrides.foreheadLines ?? aging.foreheadLineIntensity;
  if (fhInt > 0.1) {
    const opacity = fhInt * 0.65;
    const y1 = lm.crown.y + 60;
    const y2 = lm.crown.y + 80;
    lines.push(`
      <path d="M ${cx - 65} ${y1} Q ${cx} ${y1 - 3}, ${cx + 65} ${y1}"
            fill="none" stroke="${strokeColor}" stroke-width="1.2" stroke-linecap="round" opacity="${opacity}" />
      <path d="M ${cx - 50} ${y2} Q ${cx} ${y2 - 2}, ${cx + 50} ${y2}"
            fill="none" stroke="${strokeColor}" stroke-width="1.0" stroke-linecap="round" opacity="${opacity * 0.8}" />
    `);
  }

  // Crow's feet (Eye corner lines)
  const cfInt = dna.timeline.overrides.crowFeet ?? aging.crowFeetIntensity;
  if (cfInt > 0.1) {
    const opacity = cfInt * 0.7;
    // Left eye corner
    lines.push(`
      <path d="M ${lm.leftEye.outerCorner.x - 2} ${lm.leftEye.outerCorner.y - 2} L ${lm.leftEye.outerCorner.x - 14} ${lm.leftEye.outerCorner.y - 8}"
            stroke="${strokeColor}" stroke-width="1" opacity="${opacity}" stroke-linecap="round" />
      <path d="M ${lm.leftEye.outerCorner.x - 2} ${lm.leftEye.outerCorner.y} L ${lm.leftEye.outerCorner.x - 16} ${lm.leftEye.outerCorner.y + 2}"
            stroke="${strokeColor}" stroke-width="1.1" opacity="${opacity}" stroke-linecap="round" />
      <path d="M ${lm.leftEye.outerCorner.x - 2} ${lm.leftEye.outerCorner.y + 3} L ${lm.leftEye.outerCorner.x - 13} ${lm.leftEye.outerCorner.y + 10}"
            stroke="${strokeColor}" stroke-width="0.9" opacity="${opacity}" stroke-linecap="round" />
    `);
    // Right eye corner
    lines.push(`
      <path d="M ${lm.rightEye.outerCorner.x + 2} ${lm.rightEye.outerCorner.y - 2} L ${lm.rightEye.outerCorner.x + 14} ${lm.rightEye.outerCorner.y - 8}"
            stroke="${strokeColor}" stroke-width="1" opacity="${opacity}" stroke-linecap="round" />
      <path d="M ${lm.rightEye.outerCorner.x + 2} ${lm.rightEye.outerCorner.y} L ${lm.rightEye.outerCorner.x + 16} ${lm.rightEye.outerCorner.y + 2}"
            stroke="${strokeColor}" stroke-width="1.1" opacity="${opacity}" stroke-linecap="round" />
      <path d="M ${lm.rightEye.outerCorner.x + 2} ${lm.rightEye.outerCorner.y + 3} L ${lm.rightEye.outerCorner.x + 13} ${lm.rightEye.outerCorner.y + 10}"
            stroke="${strokeColor}" stroke-width="0.9" opacity="${opacity}" stroke-linecap="round" />
    `);
  }

  // Nasolabial Folds (Smile lines)
  const smInt = dna.timeline.overrides.smileLines ?? aging.smileLineIntensity;
  if (smInt > 0.1) {
    const opacity = smInt * 0.75;
    lines.push(`
      <path d="M ${lm.nose.leftAlar.x - 2} ${lm.nose.leftAlar.y + 6}
               C ${lm.mouth.leftCorner.x - 14} ${lm.nose.leftAlar.y + 22}, ${lm.mouth.leftCorner.x - 16} ${lm.mouth.leftCorner.y - 4}, ${lm.mouth.leftCorner.x - 10} ${lm.mouth.leftCorner.y + 12}"
            fill="none" stroke="${strokeColor}" stroke-width="1.4" opacity="${opacity}" stroke-linecap="round" />
      <path d="M ${lm.nose.rightAlar.x + 2} ${lm.nose.rightAlar.y + 6}
               C ${lm.mouth.rightCorner.x + 14} ${lm.nose.rightAlar.y + 22}, ${lm.mouth.rightCorner.x + 16} ${lm.mouth.rightCorner.y - 4}, ${lm.mouth.rightCorner.x + 10} ${lm.mouth.rightCorner.y + 12}"
            fill="none" stroke="${strokeColor}" stroke-width="1.4" opacity="${opacity}" stroke-linecap="round" />
    `);
  }

  // Marionette lines / Jowls (FR4.3)
  const jowlInt = dna.timeline.overrides.jowls ?? aging.marionetteIntensity;
  if (jowlInt > 0.1) {
    const opacity = jowlInt * 0.7;
    lines.push(`
      <path d="M ${lm.mouth.leftCorner.x - 6} ${lm.mouth.leftCorner.y + 14} Q ${lm.chinL.x - 8} ${lm.chinL.y - 12}, ${lm.chinL.x} ${lm.chinL.y}"
            fill="none" stroke="${strokeColor}" stroke-width="1.2" opacity="${opacity}" stroke-linecap="round" />
      <path d="M ${lm.mouth.rightCorner.x + 6} ${lm.mouth.rightCorner.y + 14} Q ${lm.chinR.x + 8} ${lm.chinR.y - 12}, ${lm.chinR.x} ${lm.chinR.y}"
            fill="none" stroke="${strokeColor}" stroke-width="1.2" opacity="${opacity}" stroke-linecap="round" />
    `);
  }

  return lines.join('\n');
}

function renderAccessories(dna: CharacterDNA, lm: FaceLandmarks): string {
  const parts: string[] = [];
  const cx = 300;
  const eyeL = lm.leftEye.center;
  const eyeR = lm.rightEye.center;
  const glasses = dna.assets.glassesStyleId;

  // 1. Eyewear (FR7.4)
  if (glasses === 'wire-round') {
    parts.push(`
      <!-- Wire Round Glasses (FR7.4) -->
      <circle cx="${eyeL.x}" cy="${eyeL.y}" r="32" fill="none" stroke="#cca352" stroke-width="2.5" />
      <circle cx="${eyeR.x}" cy="${eyeR.y}" r="32" fill="none" stroke="#cca352" stroke-width="2.5" />
      <!-- Bridge -->
      <path d="M ${eyeL.x + 32} ${eyeL.y} Q ${cx} ${eyeL.y - 6}, ${eyeR.x - 32} ${eyeR.y}"
            fill="none" stroke="#cca352" stroke-width="2.5" />
      <!-- Temple bars -->
      <line x1="${eyeL.x - 32}" y1="${eyeL.y}" x2="${lm.leftEar.top.x}" y2="${lm.leftEar.top.y + 6}" stroke="#cca352" stroke-width="2" />
      <line x1="${eyeR.x + 32}" y1="${eyeR.y}" x2="${lm.rightEar.top.x}" y2="${lm.rightEar.top.y + 6}" stroke="#cca352" stroke-width="2" />
    `);
  } else if (glasses === 'acetate-square') {
    parts.push(`
      <!-- Acetate Square Glasses -->
      <rect x="${eyeL.x - 36}" y="${eyeL.y - 24}" width="72" height="48" rx="8"
            fill="none" stroke="#222222" stroke-width="4.5" />
      <rect x="${eyeR.x - 36}" y="${eyeR.y - 24}" width="72" height="48" rx="8"
            fill="none" stroke="#222222" stroke-width="4.5" />
      <line x1="${eyeL.x + 36}" y1="${eyeL.y - 12}" x2="${eyeR.x - 36}" y2="${eyeR.y - 12}" stroke="#222222" stroke-width="5" />
      <line x1="${eyeL.x - 36}" y1="${eyeL.y - 12}" x2="${lm.leftEar.top.x}" y2="${lm.leftEar.top.y + 6}" stroke="#222222" stroke-width="4" />
      <line x1="${eyeR.x + 36}" y1="${eyeR.y - 12}" x2="${lm.rightEar.top.x}" y2="${lm.rightEar.top.y + 6}" stroke="#222222" stroke-width="4" />
    `);
  }

  // 2. Earrings / Earlobe Piercings (FR7.4)
  const earrings = dna.assets.earringsStyleId;
  if (earrings === 'gold-stud') {
    parts.push(`
      <circle cx="${lm.leftEar.lobe.x - 1}" cy="${lm.leftEar.lobe.y - 1}" r="3.5" fill="#eab308" stroke="#ca8a04" stroke-width="0.8" />
      <circle cx="${lm.rightEar.lobe.x + 1}" cy="${lm.rightEar.lobe.y - 1}" r="3.5" fill="#eab308" stroke="#ca8a04" stroke-width="0.8" />
    `);
  } else if (earrings === 'silver-hoop') {
    parts.push(`
      <circle cx="${lm.leftEar.lobe.x - 3}" cy="${lm.leftEar.lobe.y + 5}" r="8" fill="none" stroke="#cbd5e1" stroke-width="2" />
      <circle cx="${lm.rightEar.lobe.x + 3}" cy="${lm.rightEar.lobe.y + 5}" r="8" fill="none" stroke="#cbd5e1" stroke-width="2" />
    `);
  }

  // 3. Nostril Piercing (FR7.4)
  if (dna.assets.piercingNose) {
    parts.push(`
      <circle cx="${lm.nose.leftAlar.x + 2}" cy="${lm.nose.leftAlar.y - 2}" r="2.2" fill="#eab308" stroke="#ca8a04" stroke-width="0.6" />
    `);
  }

  // 4. Cultural Forehead Dot / Bindi (FR7.4)
  if (dna.assets.foreheadDot) {
    parts.push(`
      <circle cx="300" cy="${(lm.leftEye.center.y + lm.leftBrow.inner.y) * 0.5 - 6}" r="4.5" fill="#b91c1c" />
    `);
  }

  return parts.join('\n');
}

function renderFrontHair(dna: CharacterDNA, lm: FaceLandmarks, strokeColor: string, weight: number): string {
  const style = dna.assets.hairStyleId;
  if (style === 'bald') return '';

  const hairColor = getEffectiveHairColor(dna);
  const cx = 300;

  if (style === 'buzz') {
    return `
      <path d="M ${lm.templeL.x - 5} ${lm.templeL.y}
               C ${lm.templeL.x - 8} ${lm.crown.y - 10}, ${lm.templeR.x + 8} ${lm.crown.y - 10}, ${lm.templeR.x + 5} ${lm.templeR.y}
               C ${cx + 70} ${lm.crown.y + 35}, ${cx - 70} ${lm.crown.y + 35}, ${lm.templeL.x - 5} ${lm.templeL.y} Z"
            fill="${hairColor}" opacity="0.45" />
    `;
  }

  if (style === 'crop-short') {
    return `
      <path d="M ${lm.templeL.x - 14} ${lm.templeL.y + 10}
               C ${lm.templeL.x - 20} ${lm.crown.y - 25}, ${lm.templeR.x + 20} ${lm.crown.y - 25}, ${lm.templeR.x + 14} ${lm.templeR.y + 10}
               C ${lm.templeR.x - 10} ${lm.crown.y + 25}, ${cx + 40} ${lm.crown.y + 35}, ${cx} ${lm.crown.y + 30}
               C ${cx - 40} ${lm.crown.y + 35}, ${lm.templeL.x + 10} ${lm.crown.y + 25}, ${lm.templeL.x - 14} ${lm.templeL.y + 10} Z"
            fill="${hairColor}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />
    `;
  }

  if (style === 'wavy-medium' || style === 'long-straight') {
    return `
      <path d="M ${lm.templeL.x - 20} ${lm.templeL.y + 15}
               C ${lm.templeL.x - 30} ${lm.crown.y - 30}, ${lm.templeR.x + 30} ${lm.crown.y - 30}, ${lm.templeR.x + 20} ${lm.templeR.y + 15}
               C ${lm.templeR.x + 10} ${lm.templeR.y + 50}, ${lm.templeR.x - 15} ${lm.crown.y + 55}, ${cx + 15} ${lm.crown.y + 40}
               C ${cx - 30} ${lm.crown.y + 55}, ${lm.templeL.x - 5} ${lm.templeL.y + 45}, ${lm.templeL.x - 20} ${lm.templeL.y + 15} Z"
            fill="${hairColor}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />
      <!-- Side Strands -->
      <path d="M ${lm.templeL.x - 15} ${lm.templeL.y + 20}
               C ${lm.templeL.x - 25} ${lm.jawAngleL.y}, ${lm.neckL.x - 15} 530, ${lm.neckL.x - 10} 560
               Q ${lm.templeL.x - 5} ${lm.jawAngleL.y + 20}, ${lm.templeL.x - 10} ${lm.templeL.y + 35}"
            fill="${hairColor}" stroke="${strokeColor}" stroke-width="${weight * 0.8}" />
      <path d="M ${lm.templeR.x + 15} ${lm.templeR.y + 20}
               C ${lm.templeR.x + 25} ${lm.jawAngleR.y}, ${lm.neckR.x + 15} 530, ${lm.neckR.x + 10} 560
               Q ${lm.templeR.x + 5} ${lm.jawAngleR.y + 20}, ${lm.templeR.x + 10} ${lm.templeR.y + 35}"
            fill="${hairColor}" stroke="${strokeColor}" stroke-width="${weight * 0.8}" />
    `;
  }

  // Default fallback hair
  return `
    <path d="M ${lm.templeL.x - 16} ${lm.templeL.y}
             C ${lm.templeL.x - 20} ${lm.crown.y - 25}, ${lm.templeR.x + 20} ${lm.crown.y - 25}, ${lm.templeR.x + 16} ${lm.templeR.y}
             C ${cx + 60} ${lm.crown.y + 30}, ${cx - 60} ${lm.crown.y + 30}, ${lm.templeL.x - 16} ${lm.templeL.y} Z"
          fill="${hairColor}" stroke="${strokeColor}" stroke-width="${weight}" stroke-linejoin="round" />
  `;
}

/** Color Helper Utilities **/

function getEffectiveHairColor(dna: CharacterDNA): string {
  const ageFactors = calculateAgingFactors(dna.timeline.age);
  const graying = dna.timeline.overrides.hairGraying ?? (dna.coloration.hair.graying > 0 ? dna.coloration.hair.graying : ageFactors.autoGraying);
  if (graying <= 0.05) return dna.coloration.hair.baseColor;

  // Gray blend
  return blendHex(dna.coloration.hair.baseColor, '#d0d4db', graying);
}

function blendHex(c1: string, c2: string, ratio: number): string {
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

function lightenColor(hex: string, percent: number): string {
  return adjustBrightness(hex, percent);
}

function darkenColor(hex: string, percent: number): string {
  return adjustBrightness(hex, -percent);
}

function adjustBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return '#333333';
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
