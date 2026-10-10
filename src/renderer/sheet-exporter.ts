/**
 * Multi-Panel Sheet Exporter & Turnaround Compositor
 * Master Reference: MasterDoc.md (FR13.1, FR13.2, C8)
 */

import { CharacterDNA, Emotion } from '../types/face';
import { renderFaceSVG } from './svg-renderer';

export interface SheetOptions {
  transparentBackground?: boolean;
  scale?: number;
}

/**
 * Generate a horizontal Age Strip SVG (5 / 12 / 18 / 25 / 45 / 70) (FR13.2, C8)
 */
export function generateAgeStripSVG(
  dna: CharacterDNA,
  milestones: number[] = [5, 12, 18, 25, 45, 70]
): string {
  const panelWidth = 320;
  const panelHeight = 400;
  const gap = 20;
  const headerHeight = 90;
  const totalWidth = milestones.length * panelWidth + (milestones.length + 1) * gap;
  const totalHeight = panelHeight + headerHeight + gap + 30;

  // Clone DNA for each age milestone
  const panelsSVG = milestones.map((age, idx) => {
    const ageDNA: CharacterDNA = JSON.parse(JSON.stringify(dna));
    ageDNA.timeline.age = age;
    const faceSVG = renderFaceSVG(ageDNA, { transparentBackground: true });

    const x = gap + idx * (panelWidth + gap);
    const y = headerHeight;

    return `
      <!-- Age Milestone Panel: Age ${age} -->
      <g transform="translate(${x}, ${y})">
        <!-- Panel Border Card -->
        <rect width="${panelWidth}" height="${panelHeight}" rx="12" fill="#151922" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
        
        <!-- Scaled Face Rig -->
        <svg x="10" y="10" width="${panelWidth - 20}" height="${panelHeight - 50}" viewBox="0 0 600 750">
          ${extractSvgInner(faceSVG)}
        </svg>

        <!-- Age Label Badge -->
        <rect x="20" y="${panelHeight - 38}" width="${panelWidth - 40}" height="28" rx="6" fill="#1c2230" />
        <text x="${panelWidth / 2}" y="${panelHeight - 20}" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="14" font-weight="600" text-anchor="middle">
          Age ${age} ${getAgeStageName(age)}
        </text>
      </g>
    `;
  }).join('\n');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
      <!-- Background Canvas -->
      <rect width="${totalWidth}" height="${totalHeight}" fill="#0e1117" />

      <!-- Sheet Header -->
      <text x="${gap}" y="42" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="24" font-weight="700">
        ${dna.meta.name} — Biological Age Progression Strip
      </text>
      <text x="${gap}" y="68" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="14">
        Cast Continuity Baseline (Story Snapshots: 5 → 70 years) | Novel-to-Film Turnaround Bible
      </text>

      ${panelsSVG}
    </svg>
  `.trim();
}

/**
 * Generate a 3x2 Expression Sheet SVG (FR13.2, C8)
 */
export function generateExpressionSheetSVG(dna: CharacterDNA): string {
  const emotions: { emotion: Emotion; label: string }[] = [
    { emotion: 'neutral', label: 'Neutral' },
    { emotion: 'happy', label: 'Joy / Smile' },
    { emotion: 'sad', label: 'Sadness' },
    { emotion: 'angry', label: 'Anger' },
    { emotion: 'surprise', label: 'Surprise' },
    { emotion: 'fear', label: 'Fear' }
  ];

  const cols = 3;
  const rows = 2;
  const panelWidth = 320;
  const panelHeight = 400;
  const gap = 20;
  const headerHeight = 90;
  const totalWidth = cols * panelWidth + (cols + 1) * gap;
  const totalHeight = rows * panelHeight + (rows + 1) * gap + headerHeight;

  const panelsSVG = emotions.map((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const exprDNA: CharacterDNA = JSON.parse(JSON.stringify(dna));
    exprDNA.expression.activeEmotion = item.emotion;
    exprDNA.expression.emotionStrength = 1.0;
    const faceSVG = renderFaceSVG(exprDNA, { transparentBackground: true });

    const x = gap + col * (panelWidth + gap);
    const y = headerHeight + row * (panelHeight + gap);

    return `
      <!-- Expression Panel: ${item.label} -->
      <g transform="translate(${x}, ${y})">
        <rect width="${panelWidth}" height="${panelHeight}" rx="12" fill="#151922" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
        <svg x="10" y="10" width="${panelWidth - 20}" height="${panelHeight - 50}" viewBox="0 0 600 750">
          ${extractSvgInner(faceSVG)}
        </svg>
        <rect x="20" y="${panelHeight - 38}" width="${panelWidth - 40}" height="28" rx="6" fill="#1c2230" />
        <text x="${panelWidth / 2}" y="${panelHeight - 20}" fill="#a5b4fc" font-family="'Outfit', sans-serif" font-size="14" font-weight="600" text-anchor="middle">
          ${item.label}
        </text>
      </g>
    `;
  }).join('\n');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
      <rect width="${totalWidth}" height="${totalHeight}" fill="#0e1117" />
      <text x="${gap}" y="42" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="24" font-weight="700">
        ${dna.meta.name} — Facial Expression & Acting Sheet
      </text>
      <text x="${gap}" y="68" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="14">
        6 Base Emotional Poses for Storyboard & Draw-Over Reference (Age ${dna.timeline.age})
      </text>
      ${panelsSVG}
    </svg>
  `.trim();
}

/**
 * High-Res PNG Rasterizer via Offscreen Canvas (FR13.1, C8)
 */
export async function downloadRasterPNG(
  svgString: string,
  width: number,
  height: number,
  filename: string,
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(pngUrl);
        resolve();
      }, 'image/png');
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

function extractSvgInner(fullSvg: string): string {
  // Strip outer <svg ...> and </svg> tags
  const start = fullSvg.indexOf('>') + 1;
  const end = fullSvg.lastIndexOf('</svg>');
  if (start > 0 && end > start) {
    return fullSvg.slice(start, end);
  }
  return fullSvg;
}

function getAgeStageName(age: number): string {
  if (age <= 5) return '(Toddler)';
  if (age <= 12) return '(Child)';
  if (age <= 18) return '(Adolescent)';
  if (age <= 35) return '(Young Adult)';
  if (age <= 55) return '(Mature)';
  return '(Senior)';
}

export function drawSvgToCanvas(svgString: string, ctx: CanvasRenderingContext2D, width: number, height: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Record biological aging timelapse clip (0 - 80) as WebM video (FR13.5, C8)
 */
export async function recordGrowthVideo(
  dna: CharacterDNA,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const canvasWithStream = canvas as any;
  if (typeof MediaRecorder === 'undefined' || !canvasWithStream.captureStream) {
    throw new Error('MediaRecorder or canvas.captureStream not supported in this browser');
  }

  const stream = canvasWithStream.captureStream(24);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise(async (resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
    recorder.onerror = reject;

    recorder.start();

    const ages = [4, 7, 10, 13, 16, 20, 24, 28, 32, 36, 40, 45, 50, 55, 60, 65, 70, 75];
    for (let i = 0; i < ages.length; i++) {
      const a = ages[i];
      const frameDna: CharacterDNA = JSON.parse(JSON.stringify(dna));
      frameDna.timeline.age = a;
      const svgMarkup = renderFaceSVG(frameDna, { transparentBackground: false });
      await drawSvgToCanvas(svgMarkup, ctx, 600, 750);
      if (onProgress) onProgress(Math.round(((i + 1) / ages.length) * 100));
      await new Promise(r => setTimeout(r, 120));
    }

    recorder.stop();
  });
}
