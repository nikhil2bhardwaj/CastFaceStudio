/**
 * Application Entry & UI Controller
 * CastFace Studio — 2D Face Creator for Novel-to-Film Cast
 * Master Reference: MasterDoc.md (FR1 - FR13, Complete Phase 1 - 5 Production Suite)
 */

import { characterStore } from './state/character-store';
import { renderFaceSVG } from './renderer/svg-renderer';
import {
  generateAgeStripSVG,
  generateExpressionSheetSVG,
  downloadRasterPNG,
  recordGrowthVideo
} from './renderer/sheet-exporter';
import { FeatureRegion } from './core/genetics';
import { Emotion, Undertone, LightingEnv, CharacterDNA, ArtStylePreset } from './types/face';
import { parseProseToCharacter, ParseResult } from './core/text-parser';
import { generateCharacterBibleData } from './core/character-bible';
import { ZipPacker } from './utils/zip-packer';

// DOM Elements: Global & Telemetry
const viewportWrapper = document.getElementById('svg-viewport-wrapper') as HTMLDivElement;
const inputCharName = document.getElementById('input-character-name') as HTMLInputElement;
const badgeAge = document.getElementById('badge-character-age') as HTMLSpanElement;
const badgeBirth = document.getElementById('badge-character-birth') as HTMLSpanElement;
const displayAgeScrubber = document.getElementById('display-age-scrubber') as HTMLSpanElement;
const telemetryStat = document.getElementById('telemetry-stat') as HTMLSpanElement;
const toastMessage = document.getElementById('toast-message') as HTMLDivElement;
const toastText = document.getElementById('toast-text') as HTMLSpanElement;

// Identity Warning Banner
const bannerIdentity = document.getElementById('banner-identity-warning') as HTMLDivElement;
const textIdentity = document.getElementById('text-identity-warning') as HTMLSpanElement;

// Top Bar Action Buttons
const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement;
const btnRedo = document.getElementById('btn-redo') as HTMLButtonElement;
const btnSaveJSON = document.getElementById('btn-save-json') as HTMLButtonElement;
const btnLoadJSON = document.getElementById('btn-load-json') as HTMLButtonElement;
const fileInputJSON = document.getElementById('file-input-json') as HTMLInputElement;
const btnSaveProject = document.getElementById('btn-save-project') as HTMLButtonElement;
const fileInputProject = document.getElementById('file-input-project') as HTMLInputElement;
const btnOpenBible = document.getElementById('btn-open-bible') as HTMLButtonElement;
const btnExportSVG = document.getElementById('btn-export-svg') as HTMLButtonElement;
const btnExportAgeStrip = document.getElementById('btn-export-agestrip') as HTMLButtonElement;
const btnExportExprSheet = document.getElementById('btn-export-exprsheet') as HTMLButtonElement;
const btnExportBatchZip = document.getElementById('btn-export-batch-zip') as HTMLButtonElement;
const btnExportGrowthVideo = document.getElementById('btn-export-growth-video') as HTMLButtonElement;
const btnExportPNG = document.getElementById('btn-export-png') as HTMLButtonElement;

// Scrubber & Growth Animation
const sliderAge = document.getElementById('slider-age') as HTMLInputElement;
const sliderTimelineAge = document.getElementById('slider-timeline-age') as HTMLInputElement;
const btnPlayGrowth = document.getElementById('btn-play-growth') as HTMLButtonElement;
const iconPlayGrowth = document.getElementById('icon-play-growth') as unknown as SVGElement;
let isGrowthPlaying = false;
let growthAnimFrame: number | null = null;
let growthDirection = 1;

// Deliverable 5 Controls
const sliderJawSquare = document.getElementById('slider-jaw-square') as HTMLInputElement;
const sliderEyeSpacing = document.getElementById('slider-eye-spacing') as HTMLInputElement;
const sliderSkinDarkness = document.getElementById('slider-skin-darkness') as HTMLInputElement;
const sliderLipFullness = document.getElementById('slider-lip-fullness') as HTMLInputElement;

// Supplementary Morph Controls
const sliderGenderBlend = document.getElementById('slider-gender-blend') as HTMLInputElement;
const sliderChinWidth = document.getElementById('slider-chin-width') as HTMLInputElement;
const sliderNeckWidth = document.getElementById('slider-neck-width') as HTMLInputElement;
const sliderEyeSize = document.getElementById('slider-eye-size') as HTMLInputElement;
const sliderEyeSlant = document.getElementById('slider-eye-slant') as HTMLInputElement;
const sliderBrowThick = document.getElementById('slider-brow-thick') as HTMLInputElement;
const sliderNoseLength = document.getElementById('slider-nose-length') as HTMLInputElement;
const sliderNoseHump = document.getElementById('slider-nose-hump') as HTMLInputElement;
const sliderEarSize = document.getElementById('slider-ear-size') as HTMLInputElement;
const sliderBlush = document.getElementById('slider-blush') as HTMLInputElement;
const sliderEmotionStr = document.getElementById('slider-emotion-str') as HTMLInputElement;
const sliderOneBrow = document.getElementById('slider-one-brow') as HTMLInputElement;
const sliderCrookedSmile = document.getElementById('slider-crooked-smile') as HTMLInputElement;

// Assets & Hair / Beard / Accessories
const selectHair = document.getElementById('select-hairstyle') as HTMLSelectElement;
const selectBeard = document.getElementById('select-beard') as HTMLSelectElement;
const selectGlasses = document.getElementById('select-glasses') as HTMLSelectElement;
const selectEarrings = document.getElementById('select-earrings') as HTMLSelectElement;
const checkPiercingNose = document.getElementById('check-piercing-nose') as HTMLInputElement;
const checkForeheadDot = document.getElementById('check-forehead-dot') as HTMLInputElement;

// Heterochromia & Eye Gaze
const checkHeterochromia = document.getElementById('check-heterochromia') as HTMLInputElement;
const colorIrisL = document.getElementById('color-iris-l') as HTMLInputElement;
const colorIrisR = document.getElementById('color-iris-r') as HTMLInputElement;
const sliderGazeX = document.getElementById('slider-gaze-x') as HTMLInputElement;

// 2-Way Emotion Mixer & Speech Visemes (FR6)
const selectSecondaryEmotion = document.getElementById('select-secondary-emotion') as HTMLSelectElement;
const sliderEmotionBlend = document.getElementById('slider-emotion-blend') as HTMLInputElement;
const btnPlaySpeechAnim = document.getElementById('btn-play-speech-anim') as HTMLButtonElement;
const iconSpeechPlay = document.getElementById('icon-speech-play') as unknown as SVGElement;
let isSpeechPlaying = false;
let speechAnimFrame: number | null = null;

// Genetics Panel Controls (FR5)
const selectParentA = document.getElementById('select-parent-a') as HTMLSelectElement;
const selectParentB = document.getElementById('select-parent-b') as HTMLSelectElement;
const sliderBlendRatio = document.getElementById('slider-blend-ratio') as HTMLInputElement;
const sliderBlendVariance = document.getElementById('slider-blend-variance') as HTMLInputElement;
const checkLockEyes = document.getElementById('check-lock-eyes') as HTMLInputElement;
const checkLockJaw = document.getElementById('check-lock-jaw') as HTMLInputElement;
const checkLockNose = document.getElementById('check-lock-nose') as HTMLInputElement;
const checkLockMouth = document.getElementById('check-lock-mouth') as HTMLInputElement;
const checkLockSkin = document.getElementById('check-lock-skin') as HTMLInputElement;
const checkLockHair = document.getElementById('check-lock-hair') as HTMLInputElement;
const btnGenerateChild = document.getElementById('btn-generate-child') as HTMLButtonElement;
const btnGenerateSiblings = document.getElementById('btn-generate-siblings') as HTMLButtonElement;
const selectCopySource = document.getElementById('select-copy-source') as HTMLSelectElement;
const selectCopyRegion = document.getElementById('select-copy-region') as HTMLSelectElement;
const btnCopyRegion = document.getElementById('btn-copy-region') as HTMLButtonElement;

// Art Style Controls (FR9)
const sliderLineWeight = document.getElementById('slider-line-weight') as HTMLInputElement;
const sliderLineWobble = document.getElementById('slider-line-wobble') as HTMLInputElement;

// Novel Prose NLP Parser Controls (FR10.3)
const textareaProse = document.getElementById('textarea-prose') as HTMLTextAreaElement;
const btnAnalyzeProse = document.getElementById('btn-analyze-prose') as HTMLButtonElement;
const btnApplyProse = document.getElementById('btn-apply-prose') as HTMLButtonElement;
const proseResultCard = document.getElementById('prose-result-card') as HTMLDivElement;
const proseTagsContainer = document.getElementById('prose-tags-container') as HTMLDivElement;
const proseSummaryText = document.getElementById('prose-summary-text') as HTMLParagraphElement;
let currentParsedResult: ParseResult | null = null;

// Cast Roster & Global Story Year Controls (FR10.1, FR11.1, FR11.2)
const sliderStoryYear = document.getElementById('slider-story-year') as HTMLInputElement;
const displayStoryYear = document.getElementById('display-story-year') as HTMLSpanElement;
const castCardsGrid = document.getElementById('cast-cards-grid') as HTMLDivElement;
const castCountBadge = document.getElementById('cast-count-badge') as HTMLSpanElement;
const btnRandomizeFace = document.getElementById('btn-randomize-face') as HTMLButtonElement;
const btnAddToCast = document.getElementById('btn-add-to-cast') as HTMLButtonElement;
const checkRandEyes = document.getElementById('check-rand-eyes') as HTMLInputElement;
const checkRandJaw = document.getElementById('check-rand-jaw') as HTMLInputElement;
const checkRandNose = document.getElementById('check-rand-nose') as HTMLInputElement;
const checkRandMouth = document.getElementById('check-rand-mouth') as HTMLInputElement;
const checkRandSkin = document.getElementById('check-rand-skin') as HTMLInputElement;
const checkRandHair = document.getElementById('check-rand-hair') as HTMLInputElement;
let activeCastFilter: string = 'all';

// Character Bible Modal Elements (FR13.3)
const modalCharacterBible = document.getElementById('modal-character-bible') as HTMLDivElement;
const btnCloseBible = document.getElementById('btn-close-bible') as HTMLButtonElement;
const btnPrintBible = document.getElementById('btn-print-bible') as HTMLButtonElement;
const bibleCharName = document.getElementById('bible-char-name') as HTMLHeadingElement;
const biblePortraitContainer = document.getElementById('bible-portrait-container') as HTMLDivElement;
const bibleNarrativeText = document.getElementById('bible-narrative-text') as HTMLDivElement;
const bibleSwatchesContainer = document.getElementById('bible-swatches-container') as HTMLDivElement;
const bibleMetricsContainer = document.getElementById('bible-metrics-container') as HTMLDivElement;

// Telemetry Timing Tracking
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFps = 60;

function updateTelemetry(renderDurationMs: number) {
  const now = performance.now();
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    currentFps = frameCount;
    frameCount = 0;
    lastFrameTime = now;
  }
  telemetryStat.textContent = `SVG Live ${renderDurationMs.toFixed(1)}ms | ${currentFps} FPS`;
}

function showToast(message: string) {
  toastText.textContent = message;
  toastMessage.classList.add('show');
  setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 2400);
}

/**
 * Main Render Callback
 */
function render(dna: CharacterDNA) {
  const start = performance.now();
  const svgMarkup = renderFaceSVG(dna);
  viewportWrapper.innerHTML = svgMarkup;
  const renderDuration = performance.now() - start;
  updateTelemetry(renderDuration);

  // Identity Continuity Check (FR5.6, FR11.4)
  const idCheck = characterStore.evaluateIdentity();
  if (idCheck.isCaricatureWarning) {
    bannerIdentity.style.display = 'flex';
    textIdentity.textContent = idCheck.message;
  } else {
    bannerIdentity.style.display = 'none';
  }

  // Sync Badges
  inputCharName.value = dna.meta.name;
  badgeAge.textContent = `Age ${dna.timeline.age}`;
  badgeBirth.textContent = `Born ${dna.meta.birthYear}`;
  displayAgeScrubber.textContent = `${dna.timeline.age} years`;

  // Sync Sliders
  sliderAge.value = String(dna.timeline.age);
  sliderTimelineAge.value = String(dna.timeline.age);
  setText('val-age', `${dna.timeline.age} yrs`);

  sliderJawSquare.value = String(dna.morphs.head.jawSquareness);
  setText('val-jaw-square', dna.morphs.head.jawSquareness.toFixed(2));

  sliderEyeSpacing.value = String(dna.morphs.features.eyeSpacing);
  setText('val-eye-spacing', dna.morphs.features.eyeSpacing.toFixed(2));

  sliderSkinDarkness.value = String(dna.coloration.skin.lightness);
  setText('val-skin-darkness', dna.coloration.skin.lightness.toFixed(2));

  sliderLipFullness.value = String(dna.morphs.features.lowerLipFullness);
  setText('val-lip-fullness', dna.morphs.features.lowerLipFullness.toFixed(2));

  sliderGenderBlend.value = String(dna.meta.genderExpression);
  setText('val-gender-blend', dna.meta.genderExpression.toFixed(2));

  sliderChinWidth.value = String(dna.morphs.head.chinWidth);
  setText('val-chin-width', dna.morphs.head.chinWidth.toFixed(2));

  sliderNeckWidth.value = String(dna.morphs.head.neckWidth);
  setText('val-neck-width', dna.morphs.head.neckWidth.toFixed(2));

  sliderEyeSize.value = String(dna.morphs.features.eyeSize);
  setText('val-eye-size', dna.morphs.features.eyeSize.toFixed(2));

  sliderEyeSlant.value = String(dna.morphs.features.eyeSlant);
  setText('val-eye-slant', (dna.morphs.features.eyeSlant >= 0 ? '+' : '') + dna.morphs.features.eyeSlant.toFixed(2));

  sliderBrowThick.value = String(dna.morphs.features.browThickness);
  setText('val-brow-thick', dna.morphs.features.browThickness.toFixed(2));

  sliderNoseLength.value = String(dna.morphs.features.noseLength);
  setText('val-nose-length', dna.morphs.features.noseLength.toFixed(2));

  sliderNoseHump.value = String(dna.morphs.features.noseHump);
  setText('val-nose-hump', dna.morphs.features.noseHump.toFixed(2));

  sliderEarSize.value = String(dna.morphs.features.earSize);
  setText('val-ear-size', dna.morphs.features.earSize.toFixed(2));

  sliderBlush.value = String(dna.coloration.skin.blushIntensity);
  setText('val-blush', dna.coloration.skin.blushIntensity.toFixed(2));

  sliderEmotionStr.value = String(dna.expression.emotionStrength);
  setText('val-emotion-str', dna.expression.emotionStrength.toFixed(2));

  sliderOneBrow.value = String(dna.expression.oneBrowRaise);
  setText('val-one-brow', dna.expression.oneBrowRaise.toFixed(2));

  sliderCrookedSmile.value = String(dna.expression.crookedSmile ?? 0);
  setText('val-crooked-smile', (dna.expression.crookedSmile ?? 0).toFixed(2));

  // Sync Emotion Mixer
  selectSecondaryEmotion.value = dna.expression.blendEmotion ?? 'neutral';
  sliderEmotionBlend.value = String(dna.expression.blendStrength ?? 0);
  setText('val-emotion-blend', `${Math.round((dna.expression.blendStrength ?? 0) * 100)}% Secondary`);

  // Sync Accessories & Eye Colors
  selectHair.value = dna.assets.hairStyleId;
  selectBeard.value = dna.assets.beardStyleId;
  selectGlasses.value = dna.assets.glassesStyleId;
  selectEarrings.value = dna.assets.earringsStyleId ?? 'none';
  checkPiercingNose.checked = !!dna.assets.piercingNose;
  checkForeheadDot.checked = !!dna.assets.foreheadDot;

  colorIrisL.value = dna.coloration.eyes.irisColorL;
  colorIrisR.value = dna.coloration.eyes.irisColorR;
  sliderGazeX.value = String(dna.coloration.eyes.gazeX);
  setText('val-gaze-x', dna.coloration.eyes.gazeX.toFixed(2));

  // Sync Art Style Sliders & Presets (FR9)
  sliderLineWeight.value = String(dna.artStyle.lineWeight);
  setText('val-line-weight', dna.artStyle.lineWeight.toFixed(2));
  sliderLineWobble.value = String(dna.artStyle.lineWobble);
  setText('val-line-wobble', dna.artStyle.lineWobble.toFixed(2));

  document.querySelectorAll<HTMLButtonElement>('[data-style-preset]').forEach(btn => {
    if (btn.getAttribute('data-style-preset') === dna.artStyle.preset) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Sync Story Year (FR11.2)
  sliderStoryYear.value = String(characterStore.getStoryYear());
  displayStoryYear.textContent = `Year ${characterStore.getStoryYear()}`;

  // Sync Emotion Chips
  document.querySelectorAll<HTMLButtonElement>('[data-emotion]').forEach(chip => {
    if (chip.getAttribute('data-emotion') === dna.expression.activeEmotion) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Sync Viseme Chips
  document.querySelectorAll<HTMLButtonElement>('[data-viseme]').forEach(chip => {
    if (chip.getAttribute('data-viseme') === dna.expression.mouthViseme) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Snap Pills
  document.querySelectorAll<HTMLButtonElement>('.snap-pill').forEach(pill => {
    const snapAge = Number(pill.getAttribute('data-snap-age'));
    if (snapAge === dna.timeline.age) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Render Cast Grid (FR10.1, FR11.1)
  renderCastGrid(dna.id);

  // Undo / Redo
  btnUndo.disabled = !characterStore.canUndo();
  btnRedo.disabled = !characterStore.canRedo();
}

function setText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Continuous Slider Bindings
 */
function bindContinuousSlider(
  slider: HTMLInputElement,
  updater: (dna: CharacterDNA, val: number) => void
) {
  slider.addEventListener('input', () => {
    const val = parseFloat(slider.value);
    characterStore.updateContinuous(dna => updater(dna, val));
  });

  slider.addEventListener('change', () => {
    const val = parseFloat(slider.value);
    characterStore.commitUpdate(dna => updater(dna, val));
  });
}

// 1. Age Scrubbing
const updateAge = (dna: CharacterDNA, val: number) => {
  dna.timeline.age = Math.round(val);
};
bindContinuousSlider(sliderAge, updateAge);
bindContinuousSlider(sliderTimelineAge, updateAge);

// 2. Jaw Squareness
bindContinuousSlider(sliderJawSquare, (dna, val) => { dna.morphs.head.jawSquareness = val; });

// 3. Eye Spacing
bindContinuousSlider(sliderEyeSpacing, (dna, val) => { dna.morphs.features.eyeSpacing = val; });

// 4. Skin Melanin
bindContinuousSlider(sliderSkinDarkness, (dna, val) => { dna.coloration.skin.lightness = val; });

// 5. Lip Fullness
bindContinuousSlider(sliderLipFullness, (dna, val) => {
  dna.morphs.features.lowerLipFullness = val;
  dna.morphs.features.upperLipFullness = val * 0.95;
});

// Supplementary Sliders
bindContinuousSlider(sliderGenderBlend, (dna, val) => { dna.meta.genderExpression = val; });
bindContinuousSlider(sliderChinWidth, (dna, val) => { dna.morphs.head.chinWidth = val; });
bindContinuousSlider(sliderNeckWidth, (dna, val) => { dna.morphs.head.neckWidth = val; });
bindContinuousSlider(sliderEyeSize, (dna, val) => { dna.morphs.features.eyeSize = val; });
bindContinuousSlider(sliderEyeSlant, (dna, val) => { dna.morphs.features.eyeSlant = val; });
bindContinuousSlider(sliderBrowThick, (dna, val) => { dna.morphs.features.browThickness = val; });
bindContinuousSlider(sliderNoseLength, (dna, val) => { dna.morphs.features.noseLength = val; });
bindContinuousSlider(sliderNoseHump, (dna, val) => { dna.morphs.features.noseHump = val; });
bindContinuousSlider(sliderEarSize, (dna, val) => { dna.morphs.features.earSize = val; });
bindContinuousSlider(sliderBlush, (dna, val) => { dna.coloration.skin.blushIntensity = val; });
bindContinuousSlider(sliderEmotionStr, (dna, val) => { dna.expression.emotionStrength = val; });
bindContinuousSlider(sliderOneBrow, (dna, val) => { dna.expression.oneBrowRaise = val; });
bindContinuousSlider(sliderCrookedSmile, (dna, val) => { dna.expression.crookedSmile = val; });
bindContinuousSlider(sliderGazeX, (dna, val) => { dna.coloration.eyes.gazeX = val; });
bindContinuousSlider(sliderEmotionBlend, (dna, val) => {
  dna.expression.blendStrength = val;
  setText('val-emotion-blend', `${Math.round(val * 100)}% Secondary`);
});

// Art Style Sliders (FR9.1)
bindContinuousSlider(sliderLineWeight, (dna, val) => {
  dna.artStyle.lineWeight = val;
  setText('val-line-weight', val.toFixed(2));
});
bindContinuousSlider(sliderLineWobble, (dna, val) => {
  dna.artStyle.lineWobble = val;
  setText('val-line-wobble', val.toFixed(2));
});

// Name Input
inputCharName.addEventListener('change', () => {
  const name = inputCharName.value.trim() || 'Unnamed Character';
  characterStore.commitUpdate(dna => { dna.meta.name = name; });
  showToast(`Renamed character to "${name}"`);
});

// Snap Pills
document.querySelectorAll<HTMLButtonElement>('.snap-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const snapAge = Number(pill.getAttribute('data-snap-age'));
    characterStore.commitUpdate(dna => { dna.timeline.age = snapAge; });
    showToast(`Timeline snapped to age ${snapAge}`);
  });
});

// Undertone Pills
document.querySelectorAll<HTMLButtonElement>('.undertone-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const undertone = pill.getAttribute('data-undertone') as Undertone;
    document.querySelectorAll('.undertone-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    characterStore.commitUpdate(dna => { dna.coloration.skin.undertone = undertone; });
    showToast(`Skin undertone set to ${undertone}`);
  });
});

// Emotion Chips (8 Base Emotions)
document.querySelectorAll<HTMLButtonElement>('[data-emotion]').forEach(chip => {
  chip.addEventListener('click', () => {
    const emotion = chip.getAttribute('data-emotion') as Emotion;
    if (!emotion) return;
    characterStore.commitUpdate(dna => { dna.expression.activeEmotion = emotion; });
    showToast(`Primary emotion: ${emotion}`);
  });
});

// Viseme Chips (Talking Shapes)
document.querySelectorAll<HTMLButtonElement>('[data-viseme]').forEach(chip => {
  chip.addEventListener('click', () => {
    const viseme = chip.getAttribute('data-viseme') as any;
    if (!viseme) return;
    characterStore.commitUpdate(dna => { dna.expression.mouthViseme = viseme; });
    showToast(`Mouth viseme: ${viseme}`);
  });
});

// Secondary Emotion Mixer Dropdown
selectSecondaryEmotion.addEventListener('change', () => {
  const emotion = selectSecondaryEmotion.value as Emotion;
  characterStore.commitUpdate(dna => { dna.expression.blendEmotion = emotion; });
});

// Dropdowns & Checkboxes
selectHair.addEventListener('change', () => {
  characterStore.commitUpdate(dna => { dna.assets.hairStyleId = selectHair.value; });
});
selectBeard.addEventListener('change', () => {
  characterStore.commitUpdate(dna => {
    dna.assets.beardStyleId = selectBeard.value;
    dna.assets.beardDensity = selectBeard.value !== 'none' ? 0.6 : 0;
  });
});
selectGlasses.addEventListener('change', () => {
  characterStore.commitUpdate(dna => { dna.assets.glassesStyleId = selectGlasses.value; });
});
selectEarrings.addEventListener('change', () => {
  characterStore.commitUpdate(dna => { dna.assets.earringsStyleId = selectEarrings.value as any; });
});
checkPiercingNose.addEventListener('change', () => {
  characterStore.commitUpdate(dna => { dna.assets.piercingNose = checkPiercingNose.checked; });
});
checkForeheadDot.addEventListener('change', () => {
  characterStore.commitUpdate(dna => { dna.assets.foreheadDot = checkForeheadDot.checked; });
});

// Eye Color Pickers & Heterochromia
colorIrisL.addEventListener('input', () => {
  const color = colorIrisL.value;
  characterStore.commitUpdate(dna => {
    dna.coloration.eyes.irisColorL = color;
    if (!checkHeterochromia.checked) {
      dna.coloration.eyes.irisColorR = color;
      colorIrisR.value = color;
    }
  });
});
colorIrisR.addEventListener('input', () => {
  const color = colorIrisR.value;
  characterStore.commitUpdate(dna => { dna.coloration.eyes.irisColorR = color; });
});

checkHeterochromia.addEventListener('change', () => {
  if (checkHeterochromia.checked) {
    showToast('Heterochromia enabled: Left & Right iris colors unlinked');
  } else {
    characterStore.commitUpdate(dna => {
      dna.coloration.eyes.irisColorR = dna.coloration.eyes.irisColorL;
      colorIrisR.value = dna.coloration.eyes.irisColorL;
    });
    showToast('Iris colors linked');
  }
});

// Tab Navigation
document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => ((p as HTMLElement).style.display = 'none'));
    tabBtn.classList.add('active');
    const targetId = tabBtn.getAttribute('data-tab');
    if (targetId) {
      const pane = document.getElementById(targetId);
      if (pane) pane.style.display = 'block';
    }
  });
});

// Art Style Presets (FR9.2, FR9.3)
document.querySelectorAll<HTMLButtonElement>('[data-style-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.getAttribute('data-style-preset') as ArtStylePreset;
    if (!preset) return;
    characterStore.setArtStylePreset(preset);
    showToast(`Art style switched to ${preset}`);
  });
});

// Lighting Toggle (FR9.4)
document.querySelectorAll<HTMLButtonElement>('.lighting-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const light = btn.getAttribute('data-light') as LightingEnv;
    document.querySelectorAll('.lighting-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    characterStore.commitUpdate(dna => { dna.artStyle.lighting = light; });
  });
});

// Growth Playback Scrub Loop (FR4.7)
btnPlayGrowth.addEventListener('click', () => {
  if (isGrowthPlaying) {
    isGrowthPlaying = false;
    if (growthAnimFrame) cancelAnimationFrame(growthAnimFrame);
    btnPlayGrowth.title = 'Play Growth Cycle';
    iconPlayGrowth.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    showToast('Paused growth animation');
  } else {
    isGrowthPlaying = true;
    btnPlayGrowth.title = 'Pause Growth Cycle';
    iconPlayGrowth.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    showToast('Playing biological growth cycle (FR4.7)');

    let lastTime = performance.now();
    const stepGrowth = (time: number) => {
      if (!isGrowthPlaying) return;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      let currentAge = characterStore.getDNA().timeline.age;
      currentAge += growthDirection * delta * 12;

      if (currentAge >= 76) {
        currentAge = 76;
        growthDirection = -1;
      } else if (currentAge <= 5) {
        currentAge = 5;
        growthDirection = 1;
      }

      characterStore.updateContinuous(dna => {
        dna.timeline.age = Math.round(currentAge);
      });

      growthAnimFrame = requestAnimationFrame(stepGrowth);
    };
    growthAnimFrame = requestAnimationFrame(stepGrowth);
  }
});

// Animatic Blink & Talking Cycle Preview (FR6.5)
const visemeCycle: Array<'rest' | 'aa' | 'ee' | 'oo' | 'rest'> = ['rest', 'aa', 'ee', 'oo', 'rest'];
let visemeIndex = 0;
btnPlaySpeechAnim.addEventListener('click', () => {
  if (isSpeechPlaying) {
    isSpeechPlaying = false;
    if (speechAnimFrame) cancelAnimationFrame(speechAnimFrame);
    iconSpeechPlay.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    characterStore.commitUpdate(dna => {
      dna.expression.mouthViseme = 'rest';
      dna.expression.blinkState = 0;
    });
    showToast('Stopped speech animatic');
  } else {
    isSpeechPlaying = true;
    iconSpeechPlay.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    showToast('Playing animatic talk & blink preview (FR6.5)');

    let lastTick = performance.now();
    let blinkTimer = 0;

    const stepSpeech = (time: number) => {
      if (!isSpeechPlaying) return;
      const elapsed = time - lastTick;

      if (elapsed > 220) {
        lastTick = time;
        visemeIndex = (visemeIndex + 1) % visemeCycle.length;
        blinkTimer++;

        characterStore.updateContinuous(dna => {
          dna.expression.mouthViseme = visemeCycle[visemeIndex];
          dna.expression.blinkState = blinkTimer % 8 === 0 ? 0.95 : 0;
        });
      }

      speechAnimFrame = requestAnimationFrame(stepSpeech);
    };
    speechAnimFrame = requestAnimationFrame(stepSpeech);
  }
});

// Genetics Engine UI (FR5)
sliderBlendRatio.addEventListener('input', () => {
  const r = parseFloat(sliderBlendRatio.value);
  const pA = Math.round((1 - r) * 100);
  const pB = Math.round(r * 100);
  setText('val-blend-ratio', `${pA}% A / ${pB}% B`);
});

sliderBlendVariance.addEventListener('input', () => {
  setText('val-blend-variance', parseFloat(sliderBlendVariance.value).toFixed(2));
});

// 1-Click Believable Child (FR5.1, FR5.2)
btnGenerateChild.addEventListener('click', () => {
  const pAId = selectParentA.value;
  const pBId = selectParentB.value;
  const ratio = parseFloat(sliderBlendRatio.value);
  const variance = parseFloat(sliderBlendVariance.value);
  const seed = Math.floor(Math.random() * 1000000);

  const locks = new Set<FeatureRegion>();
  if (checkLockEyes.checked) locks.add('eyes');
  if (checkLockJaw.checked) locks.add('jaw');
  if (checkLockNose.checked) locks.add('nose');
  if (checkLockMouth.checked) locks.add('mouth');
  if (checkLockSkin.checked) locks.add('skin');
  if (checkLockHair.checked) locks.add('hair');

  const child = characterStore.blendChildFromCast(pAId, pBId, ratio, variance, seed, locks);
  showToast(`Generated child "${child.meta.name}" with inherited traits!`);
});

// Sibling Generator (FR5.3)
btnGenerateSiblings.addEventListener('click', () => {
  const pAId = selectParentA.value;
  const pBId = selectParentB.value;
  const siblings = characterStore.createSiblingsFromCast(pAId, pBId, 3);
  showToast(`Generated 3 distinct siblings! Active: ${siblings[0].meta.name}`);
});

// Copy Feature Region (FR5.5)
btnCopyRegion.addEventListener('click', () => {
  const donorId = selectCopySource.value;
  const region = selectCopyRegion.value as FeatureRegion;
  characterStore.copyRegionFromCast(donorId, region);
  showToast(`Transferred ${region} from donor cast!`);
});

// Novel Prose NLP Parser Integration (FR10.3)
const sampleQuotes: Record<string, string> = {
  veteran: 'Marcus Thorne, a 48-year-old veteran commander with a chiseled square jaw, scar across his right brow, piercing blue eyes, and graying stubble.',
  apprentice: 'Chloe Dubois, a 16-year-old girl with doe eyes, fair porcelain skin, dark wavy hair, delicate jaw and freckles across her nose.',
  scholar: 'Dr. Aris Thorne, a 72-year-old elder historian with wire round spectacles, hooked aquiline nose, silver gray hair and weathered expression.',
  diplomat: 'Leila Farhadi, a 34-year-old diplomat with warm golden skin, almond monolid eyes, defined cheekbones and long flowing raven hair.'
};

document.querySelectorAll<HTMLButtonElement>('[data-sample-quote]').forEach(chip => {
  chip.addEventListener('click', () => {
    const key = chip.getAttribute('data-sample-quote') || '';
    if (sampleQuotes[key]) {
      textareaProse.value = sampleQuotes[key];
      runProseAnalysis();
    }
  });
});

function runProseAnalysis() {
  const text = textareaProse.value.trim();
  if (!text) {
    showToast('Please enter or select character prose description');
    return;
  }

  currentParsedResult = parseProseToCharacter(text);
  proseTagsContainer.innerHTML = '';

  for (const tag of currentParsedResult.matchedTags) {
    const pill = document.createElement('span');
    pill.className = 'prose-tag-pill';
    pill.textContent = tag;
    proseTagsContainer.appendChild(pill);
  }

  proseSummaryText.textContent = currentParsedResult.summary;
  proseResultCard.style.display = 'block';
  btnApplyProse.disabled = false;
  showToast(`Extracted ${currentParsedResult.matchedTags.length} traits from prose!`);
}

btnAnalyzeProse.addEventListener('click', runProseAnalysis);

btnApplyProse.addEventListener('click', () => {
  if (!currentParsedResult) return;
  characterStore.commitUpdate(dna => {
    Object.assign(dna.meta, currentParsedResult!.dna.meta);
    Object.assign(dna.timeline, currentParsedResult!.dna.timeline);
    Object.assign(dna.morphs.head, currentParsedResult!.dna.morphs.head);
    Object.assign(dna.morphs.features, currentParsedResult!.dna.morphs.features);
    Object.assign(dna.coloration.skin, currentParsedResult!.dna.coloration.skin);
    Object.assign(dna.coloration.eyes, currentParsedResult!.dna.coloration.eyes);
    Object.assign(dna.coloration.hair, currentParsedResult!.dna.coloration.hair);
    Object.assign(dna.assets, currentParsedResult!.dna.assets);
    if (currentParsedResult!.dna.marks && currentParsedResult!.dna.marks.length > 0) {
      dna.marks = currentParsedResult!.dna.marks;
    }
  });
  showToast(`Applied parsed traits to "${characterStore.getDNA().meta.name}"!`);
});

// Story Year Scrubber (FR11.2)
sliderStoryYear.addEventListener('input', () => {
  const year = parseInt(sliderStoryYear.value, 10);
  displayStoryYear.textContent = `Year ${year}`;
  characterStore.setStoryYear(year);
});

// Randomize Face with Region Locks (FR10.2)
btnRandomizeFace.addEventListener('click', () => {
  const locks = new Set<FeatureRegion>();
  if (checkRandEyes.checked) locks.add('eyes');
  if (checkRandJaw.checked) locks.add('jaw');
  if (checkRandNose.checked) locks.add('nose');
  if (checkRandMouth.checked) locks.add('mouth');
  if (checkRandSkin.checked) locks.add('skin');
  if (checkRandHair.checked) locks.add('hair');

  characterStore.randomizeFace(locks);
  showToast(`Rolled random face (${locks.size} region(s) locked)`);
});

btnAddToCast.addEventListener('click', () => {
  characterStore.saveCurrentToCast();
  showToast(`Saved "${characterStore.getDNA().meta.name}" to cast roster!`);
});

// Cast Filters (FR11.1)
document.querySelectorAll<HTMLButtonElement>('[data-cast-filter]').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.cast-filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeCastFilter = pill.getAttribute('data-cast-filter') || 'all';
    renderCastGrid(characterStore.getDNA().id);
  });
});

function renderCastGrid(activeId: string) {
  const roster = characterStore.getCastRoster();
  const storyYear = characterStore.getStoryYear();

  const filtered = roster.filter(m => {
    const age = Math.max(0, Math.min(80, storyYear - m.meta.birthYear));
    if (activeCastFilter === 'children') return age < 18;
    if (activeCastFilter === 'young-adults') return age >= 18 && age < 30;
    if (activeCastFilter === 'adults') return age >= 30 && age < 50;
    if (activeCastFilter === 'middle-age') return age >= 50 && age < 65;
    if (activeCastFilter === 'elders') return age >= 65;
    return true;
  });

  castCountBadge.textContent = `${filtered.length} Active`;
  castCardsGrid.innerHTML = '';

  for (const m of filtered) {
    const dynamicAge = Math.max(0, Math.min(80, storyYear - m.meta.birthYear));
    const card = document.createElement('div');
    card.className = `cast-member-card ${m.id === activeId ? 'active' : ''}`;
    card.innerHTML = `
      <div class="cast-card-name" title="${m.meta.name}">${m.meta.name}</div>
      <div class="cast-card-role">${m.meta.role}</div>
      <div class="cast-card-meta">
        <span class="cast-card-age">Age ${dynamicAge}</span>
        <span class="cast-card-birth">b. ${m.meta.birthYear}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      characterStore.loadFromCastById(m.id);
      showToast(`Loaded ${m.meta.name} (Age ${dynamicAge} in ${storyYear})`);
    });

    castCardsGrid.appendChild(card);
  }
}

// Character Bible Modal Dialog (FR13.3)
btnOpenBible.addEventListener('click', () => {
  const dna = characterStore.getDNA();
  const bible = generateCharacterBibleData(dna);

  bibleCharName.textContent = `${dna.meta.name} — Character Bible`;
  biblePortraitContainer.innerHTML = bible.portraitSVG;
  bibleNarrativeText.textContent = bible.summaryParagraph;

  // Swatches
  bibleSwatchesContainer.innerHTML = `
    <div class="bible-swatch">
      <div class="bible-swatch-chip" style="background:${dna.coloration.skin.lightness < 0.35 ? '#3b281f' : '#e6bf9c'};"></div>
      Skin: ${bible.palette.skinLightness}
    </div>
    <div class="bible-swatch">
      <div class="bible-swatch-chip" style="background:#d9777f;"></div>
      Undertone: ${bible.palette.undertone}
    </div>
    <div class="bible-swatch">
      <div class="bible-swatch-chip" style="background:${bible.palette.eyeColorL};"></div>
      Left Eye: ${bible.palette.eyeColorL}
    </div>
    <div class="bible-swatch">
      <div class="bible-swatch-chip" style="background:${bible.palette.eyeColorR};"></div>
      Right Eye: ${bible.palette.eyeColorR}
    </div>
    <div class="bible-swatch">
      <div class="bible-swatch-chip" style="background:${bible.palette.hairColor};"></div>
      Hair Base: ${bible.palette.hairColor} (${bible.palette.graying} Gray)
    </div>
  `;

  // Metrics Table
  bibleMetricsContainer.innerHTML = `
    <table class="bible-metrics-table">
      <thead>
        <tr><th>Morph Zone</th><th>Continuous Measure</th><th>Continuity Spec</th></tr>
      </thead>
      <tbody>
        <tr><td>Cranial Width</td><td>${bible.metrics.cranialWidth}</td><td>Invariant neurocranium baseline</td></tr>
        <tr><td>Jaw Squareness</td><td>${bible.metrics.jawSquareness}</td><td>Mandibular angle index</td></tr>
        <tr><td>Chin Definition</td><td>${bible.metrics.chinWidth}</td><td>Mentalis apex projection</td></tr>
        <tr><td>Eye Spacing (Pupillary)</td><td>${bible.metrics.eyeSpacing}</td><td>Fixed anatomical anchor (FR2.1)</td></tr>
        <tr><td>Nose Projection</td><td>${bible.metrics.noseLength}</td><td>Nasion-to-subnasale proportion</td></tr>
        <tr><td>Lip Vermilion Fullness</td><td>${bible.metrics.lipFullness}</td><td>Oral aperture vermilion volume</td></tr>
      </tbody>
    </table>
  `;

  modalCharacterBible.classList.add('open');
});

btnCloseBible.addEventListener('click', () => {
  modalCharacterBible.classList.remove('open');
});

btnPrintBible.addEventListener('click', () => {
  window.print();
});

modalCharacterBible.addEventListener('click', (e) => {
  if (e.target === modalCharacterBible) {
    modalCharacterBible.classList.remove('open');
  }
});

// Full Project Save & Load (FR12.1)
btnSaveProject.addEventListener('click', () => {
  const jsonStr = characterStore.exportProjectToJSON();
  const year = characterStore.getStoryYear();
  const fileName = `film_cast_project_${year}.castproject.json`;
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Saved complete film cast project (${year})`);
});

fileInputProject.addEventListener('change', (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    if (content && characterStore.loadProjectFromJSON(content)) {
      showToast('Successfully restored complete film project!');
    } else {
      showToast('Error: Failed to load cast project file');
    }
  };
  reader.readAsText(file);
  fileInputProject.value = '';
});

// Batch ZIP Exporter (FR13.4, NFR2)
btnExportBatchZip.addEventListener('click', () => {
  showToast('Packaging full cast into 100% offline ZIP archive...');
  const zip = new ZipPacker();
  const roster = characterStore.getCastRoster();
  const year = characterStore.getStoryYear();

  for (const char of roster) {
    const safeName = char.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const svgMarkup = renderFaceSVG(char, { transparentBackground: true });
    zip.addFile(`${safeName}_vector.svg`, svgMarkup);
    zip.addFile(`${safeName}_dna.json`, JSON.stringify(char, null, 2));
  }

  // Include master project manifest
  zip.addFile('project_manifest.json', characterStore.exportProjectToJSON());

  const blob = zip.generateZipBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `film_cast_batch_year_${year}.zip`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ZIP bundle with ${roster.length} cast members!`);
});

// Biological Growth Video Clip Exporter (FR13.5)
btnExportGrowthVideo.addEventListener('click', async () => {
  const dna = characterStore.getDNA();
  showToast('Recording biological growth video (WebM)...');
  try {
    const videoBlob = await recordGrowthVideo(dna, pct => {
      showToast(`Recording growth video... ${pct}%`);
    });
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dna.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_growth_timelapse.webm`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported biological growth video (.webm)!');
  } catch (err) {
    console.error(err);
    showToast('Video recording fallback: generating 6-age progression strip');
    btnExportAgeStrip.click();
  }
});

// Undo & Redo (NFR1, C9)
btnUndo.addEventListener('click', () => {
  if (characterStore.undo()) showToast('Undo action');
});
btnRedo.addEventListener('click', () => {
  if (characterStore.redo()) showToast('Redo action');
});

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    if (e.shiftKey) {
      characterStore.redo();
    } else {
      characterStore.undo();
    }
    e.preventDefault();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
    characterStore.redo();
    e.preventDefault();
  }
});

// JSON Save & Load (FR12.1)
btnSaveJSON.addEventListener('click', () => {
  const jsonStr = characterStore.exportToJSON();
  const dna = characterStore.getDNA();
  const fileName = `${dna.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_dna.json`;
  
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Saved character JSON: ${fileName}`);
});

btnLoadJSON.addEventListener('click', () => { fileInputJSON.click(); });
fileInputJSON.addEventListener('change', (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    if (content) {
      const ok = characterStore.loadFromJSON(content);
      if (ok) {
        showToast('Successfully loaded character DNA!');
      } else {
        showToast('Error: Failed to parse character JSON');
      }
    }
  };
  reader.readAsText(file);
  fileInputJSON.value = '';
});

// 1. Export Clean Layered Vector SVG (FR13.1, C8)
btnExportSVG.addEventListener('click', () => {
  const dna = characterStore.getDNA();
  const svgContent = renderFaceSVG(dna, { transparentBackground: true });
  const fileName = `${dna.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vector.svg`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported layered vector SVG: ${fileName}`);
});

// 2. Export Age-Strip Multi-Panel Sheet (FR13.2, C8)
btnExportAgeStrip.addEventListener('click', () => {
  const dna = characterStore.getDNA();
  const stripSVG = generateAgeStripSVG(dna);
  const fileName = `${dna.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_age_progression_strip.svg`;

  const blob = new Blob([stripSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported 6-Age Progression Strip: ${fileName}`);
});

// 3. Export 6-Emotion Acting Board Sheet (FR13.2, C8)
btnExportExprSheet.addEventListener('click', () => {
  const dna = characterStore.getDNA();
  const exprSVG = generateExpressionSheetSVG(dna);
  const fileName = `${dna.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_expression_board.svg`;

  const blob = new Blob([exprSVG], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported 6-Emotion Acting Board: ${fileName}`);
});

// 4. Export High-Res 2x PNG (FR13.1, C8)
btnExportPNG.addEventListener('click', async () => {
  const dna = characterStore.getDNA();
  const svgContent = renderFaceSVG(dna, { transparentBackground: false });
  const fileName = `${dna.meta.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_2x.png`;
  showToast('Rendering high-res raster PNG...');
  try {
    await downloadRasterPNG(svgContent, 600, 750, fileName, 2);
    showToast(`Exported high-res 2x PNG: ${fileName}`);
  } catch (err) {
    console.error(err);
    showToast('Failed to export PNG');
  }
});

// Initialize Subscription
characterStore.subscribe(render);
