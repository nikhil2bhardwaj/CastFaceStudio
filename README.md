# CastFace Studio — 2D Face Creator for Novel-to-Film Cast

> **A professional, 100% offline 2D face design studio and continuity rig for authors, film directors, and character artists adapting novels into cinema.**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue.svg)](https://www.typescriptlang.org/)
[![Vector](https://img.shields.io/badge/Renderer-Procedural%20SVG-emerald.svg)](#architecture)
[![Telemetry](https://img.shields.io/badge/Telemetry-%3C2ms%20%40%2060%20FPS-orange.svg)](#performance)

---

## 🎭 Overview

**CastFace Studio** solves character continuity when adapting novels to screen. It allows directors and authors (non-artists) to design consistent, film-ready 2D character casts across biological aging (0–80 years), 50/50 genetic lineage blending, multi-panel storyboard turnarounds, and printable character continuity bibles.

### Key Capabilities

- **👶 ➡️ 🧓 Biological Growth Timeline (0–80 Years)**: Reshapes the entire craniofacial architecture naturally. Children cluster features low with soft jaws; adults elongate with defined zygomatic/mandibular bones; seniors show natural ptosis, nasolabial creases, and ear/nose cartilage expansion.
- **🧬 50/50 Genetic Lineage & Sibling Generator**: Blend any two parents with adjustable ratio and mutation variance ($\sigma$). Features can be locked per region (eyes, jaw, nose, mouth, skin, hair) to guarantee believable family resemblance.
- **📖 100% Offline Novel Prose NLP Extractor**: Paste a natural language excerpt from your novel (e.g. *"Marcus Thorne, a 48-year-old veteran commander with a chiseled square jaw, scar across his right brow, and piercing blue eyes"*). The rule-based NLP extractor parses age, jaw geometry, coloration, and scars into editable facial rigs.
- **📅 32-Member Starter Cast & Master Story Year Scrubber**: Includes 32 curated characters across all ages, genders, and ancestries. Scrubbing the Master Story Year (1990–2060) dynamically updates every cast member's age based on their birth year.
- **🎨 5 Named Art Style Presets**:
  - **Soft-Shaded Standard**: Smooth radial/linear gradients and ambient occlusion.
  - **Flat Comic / Webtoon**: Solid fills with crisp vector ink lines.
  - **Cartoon / Feature**: Bold expressive outlines and saturated palette.
  - **Pencil Sketch Draft**: Graphite strokes on warm sketchbook paper with hand-drawn jitter.
  - **High-Contrast Noir**: Stark ink shadows and graphic novel angles.
- **🎬 Acting & Emotion Board (FACS)**: 8 core emotions (Neutral, Joy, Sadness, Anger, Surprise, Fear, Disgust, Contempt) with 2-way continuous FACS mixer, talking phonemes/visemes, and automated animatic blink/talk playback.
- **📋 Production Export Suite**:
  - Clean layered SVG vector exports for trace-over artists in Illustrator/Figma.
  - 1-Click 6-Age Progression Strips (5, 12, 18, 25, 45, 70).
  - 1-Click 6-Emotion Acting Boards.
  - High-res 2x raster PNGs.
  - Printable **Character Continuity Bible** with narrative descriptions, color swatches, and cranial metrics.
  - Client-side **Batch ZIP export** of the entire 32-character roster.
  - Biological growth timelapse video clips (`.webm`).

---

## ⚡ Performance & Privacy

- **<2ms Live Telemetry**: Updates directly in the SVG DOM at 60 FPS on any laptop without stutter (NFR1).
- **100% Offline & Private**: Zero external network dependencies, no cloud telemetry, no API keys required (NFR2).
- **Deterministic Schema**: Versioned JSON schema (`CharacterDNA`) guarantees identical renders across any device or update (NFR5).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/nikhil2bhardwaj/CastFaceStudio.git
cd CastFaceStudio

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Build Production Bundle
```bash
npm run build
```
Generates a static web bundle in `dist/`.

---

## 🌐 Live Web Demo on GitHub Pages

The live application is hosted on GitHub Pages:
👉 **[https://nikhil2bhardwaj.github.io/CastFaceStudio/](https://nikhil2bhardwaj.github.io/CastFaceStudio/)**

This repository includes an automated GitHub Actions deployment workflow in `.github/workflows/deploy.yml` that automatically builds and updates the live site upon every push to `main`.

---

## 🏗️ Architecture

```
src/
├── core/
│   ├── math.ts            # Perceptual OKLCH palettes, aging curves, Bézier math
│   ├── landmarks.ts       # 36 parametric anatomical cranial coordinates
│   ├── genetics.ts        # 50/50 parent blending, sibling generator, region locks
│   ├── text-parser.ts     # Offline rule-based NLP extractor from novel prose
│   ├── starter-cast.ts    # 32 diverse film-ready cast member profiles
│   └── character-bible.ts # Dynamic narrative bio generator & metrics tables
├── renderer/
│   ├── svg-renderer.ts    # 14-layer scalable vector graphic compositor
│   └── sheet-exporter.ts  # Multi-panel turnarounds, 2x PNG, video recorder
├── state/
│   └── character-store.ts # Reactive pub/sub store, linear history, story year
├── types/
│   └── face.ts            # Deterministic CharacterDNA data schema
├── utils/
│   └── zip-packer.ts      # Pure offline client-side PKZIP packer
├── main.ts                # Application controller & UI event bindings
└── style.css              # Dark glassmorphism studio design system
```

---

## 📄 License
MIT License. Free for commercial and non-commercial storytelling and film productions.
