# Master Document — 2D Face Creator for Novel-to-Film Cast

**Version 1.0 — handoff baseline | Date: 2026-09-12**

\---

## 1\. Context

**Background:** Author adapting own novels into a film. Characters currently drawn by hand. Author is not a trained artist and wants digital assistance to create a consistent, film-ready cast.

**Cast needs:**

* Multiple characters, all genders, diverse ancestral backgrounds / citizenships.
* Families: parents and children.
* Same children shown growing up across story years (e.g. 5 / 12 / 18 / 25 / 45 / 70).
* Final use: character bible, turnaround sheets, expression sheets, storyboard draw-over bases.

**Vision:** A 2D face-focused creation aid, not a general drawing app and not a 3D tool. User adjusts understandable controls, preserves identity across ages, blends parents into believable children, and exports clean sheets for artists.

**Primary user:** Author/director (non-artist). **Secondary:** character artist, continuity assistant.

**Success in one sentence:** Two parents made in 10 minutes, one-click believable child, scrub child to adult while still recognizable, one-click bible export.

## 2\. Scope

**In for V1:**
Front-view 2D face + neck base, full control set below, family/genetics, age timeline, expressions for boards, cast library, save/reopen, image/sheet/document/video export.

**Out for V1 (defer to V2 unless trivial):**
Full body, automatic side / three-quarter view sync, full animation rigging, automatic photo-to-face, cloud collaboration, mobile-first.

## 3\. Functional Requirements (tech-free — WHAT, not HOW)

### FR1 — Core face structure

* FR1.1 Single main age control that reshapes whole head naturally: large forehead / small recessed chin / low-clustered features for infants → longer jaw / defined chin / spaced features for adults.
* FR1.2 Gender appearance as smooth blend, not switch: jaw/chin squareness vs taper, chin shape, brow heaviness, neck/shoulder width, Adam's apple visibility.
* FR1.3 Ancestry as continuous feature controls, no fixed types: eye corner heights + eyelid fold coverage, nose bridge height/width + nostril flare, lip fullness + shape, cheekbone width, mid-face shape, temple width.
* FR1.4 Head/neck proportion controls.

### FR2 — Detailed features

* FR2.1 Eyes: spacing, size, height/width, round vs almond, slant, eyelid openness/curve, droop, under-eye bags.
* FR2.2 Iris/gaze: iris size, pupil size, gaze direction X/Y, shine spot position/size, optional different left/right color, optional squint offset.
* FR2.3 Brows: height, inner/outer tilt, spacing, thickness, arch position/height, taper, curve, fullness.
* FR2.4 Nose: length/width, bridge hump, root depth, tip size/shape/upturn/droop, nostril size/shape, underside visibility.
* FR2.5 Mouth/lower face: mouth width + height on face, upper vs lower lip fullness + shape, corner up/down from neutral, groove above lip length/definition, chin length/width/projection, jaw angle, cheek full vs hollow, lower-cheek sag.
* FR2.6 Ears: size, height on head, stick-out, lobe attached ↔ free, lobe size, inner detail strength.
* FR2.7 Symmetry: linked by default, unlink per feature, global slight-asymmetry control.

### FR3 — Skin, hair, eye color and light

* FR3.1 Skin darkness/lightness separate from undertone (cool pink / neutral / warm yellow / olive).
* FR3.2 Zones: cheek/nose blush, under-eye darkness, shine/oil, senior spots.
* FR3.3 Hair/eye palette: main + highlight + root/dark shading; lip natural color.
* FR3.4 Soft shadows under chin/nose/sockets that follow feature movement; adjustable light direction + cartoon vs soft shading.

### FR4 — Growth and aging

* FR4.1 Timeline scrub 0-80 with snaps 5/12/18/25/45/70; same setup at any age stays same person.
* FR4.2 Auto age details with manual override: forehead lines, eye-corner lines, smile lines, lower-face lines, under-eye lines, neck looseness.
* FR4.3 Late-age: nose/ear continued growth, lid sag, jowls.
* FR4.4 Teeth stages: toothless / baby / missing-front-child / braces option / adult / worn senior.
* FR4.5 Hair aging: graying auto by age + override, hairline recession patterns, baby-fine vs coarse.
* FR4.6 Puberty 11-15: accelerated nose/brow/jaw change, blemish spike, neck thickening.
* FR4.7 In-editor growth animation play (child → elder).

### FR5 — Family resemblance

* FR5.1 Child from two parents: adjustable blend balance + random variation amount.
* FR5.2 Region locks: e.g. keep mother's eyes, father's jaw, randomize rest.
* FR5.3 Sibling generator: same parents + reshuffle to get distinct but related siblings.
* FR5.4 Family tree view; age whole tree to a story year.
* FR5.5 Copy region from character A to B (e.g. eyes only).
* FR5.6 Identity warning if child-to-adult drifts beyond recognition threshold.

### FR6 — Expression and acting for boards

* FR6.1 Base emotions with strength: neutral, happy, sad, angry, fear, surprise, disgust, contempt.
* FR6.2 Emotion mixer: blend any two with proportions.
* FR6.3 Talking shapes: open/closed mouth shapes + jaw open + blink + gaze + brow raise/frown for animatic boards.
* FR6.4 Crooked-smile / one-brow expression asymmetry.
* FR6.5 Blink/talk cycle preview.

### FR7 — Hair, beard, accessories, collar

* FR7.1 Correct fixed drawing order: back hair → neck/ears → head → marks → features → beard → teeth → glasses → fringe → top hair → hats/covers.
* FR7.2 Hairstyles follow head shape on resize; controls for length, volume, part side, fringe, curl/coil, braid/loc definition; include cultural covers.
* FR7.3 Beard/mustache follow jaw: stubble density, style/length/coverage, graying linked to head hair.
* FR7.4 Accessories pinned to face: glasses fit nose width, earrings follow lobe, piercings, forehead dots.
* FR7.5 Simple collar/neckline fitting neck width.

### FR8 — Unique marks

* FR8.1 Unlimited moles with position/size/darkness; freckles with density/spread/darkness; blemishes, scars, tattoos, birthmarks, patch variation.
* FR8.2 Marks stay attached correctly through age/expression.

### FR9 — Art style

* FR9.1 Line feel: thickness, taper, hand-wobble, sketch breaks.
* FR9.2 Fill looks: flat / cartoon shade / soft shade / sketch.
* FR9.3 Named style presets on same face (e.g. Realistic, Cartoon, Child-simple, Noir, Picture-book).
* FR9.4 Scene-light preview (warm interior vs cold exterior).

### FR10 — Fast start

* FR10.1 30+ starter faces across ages/genders/looks.
* FR10.2 Randomize whole face or per-region with locks.
* FR10.3 Text-from-novel: paste prose description → editable suggested starting face (user approves).
* FR10.4 \[V2] Photo as starting point.

### FR11 — Cast and story management

* FR11.1 Cast grid with filter by family/age/gender; apply style to all at once.
* FR11.2 Birth year per character + Story Year control to auto-show correct ages.
* FR11.3 Unlimited undo/redo, saved versions, side-by-side compare, before/after overlay.
* FR11.4 Gentle warning against extreme caricature combos.

### FR12 — Saving

* FR12.1 Save one character's full setup as small reusable file; save whole project (characters + story years + style).
* FR12.2 Same save always renders same face; old files open after updates.

### FR13 — Export

* FR13.1 Clean layered scalable images for trace-over, clearly named parts, transparent option, high-res options.
* FR13.2 One-click sheets: expression sheet (6), age-strip (5/15/25/45/70), turnaround front set.
* FR13.3 Printable character bible: images + colors + key measures + auto plain-language description.
* FR13.4 Batch export whole cast for a story year as zip.
* FR13.5 Growth video clip export.

## 4\. Non-Functional Requirements

* NFR1 Instant feel: slider drag updates live on average laptop, no stutter.
* NFR2 Offline core; private by default, no upload required.
* NFR3 Input: mouse + pen + touch; keyboard-adjustable controls; readable UI at 1440p.
* NFR4 Accessibility: high-contrast UI, text description of face available.
* NFR5 Determinism: identical save → identical render.

## 5\. Acceptance Checklist (Definition of Done)

**C1 Creation:** Build adult female 30s, adult male 40s, child 6 from scratch each <10 min from preset + tweaks.
**C2 Growth:** Take child 5 → 15 → 25 → 45 → 70; 3/3 viewers recognize as same person.
**C3 Genetics:** Blend A+B 50/50 → child resembles both; lock eyes to mother works; reshuffle gives 3 distinct siblings.
**C4 Diversity:** Produce 10 distinct backgrounds using only feature controls, no caricature warning false-positive on normal ranges.
**C5 Expression:** Show 6 emotions + 2 blends + talking open/closed; blink preview plays.
**C6 Style:** Same face in 3 presets + 2 lighting previews; lines remain clean at 400% zoom.
**C7 Save:** Close/reopen project → pixel-identical; old V1 file opens after minor update.
**C8 Export:** One-click age-strip + expression sheet + bible + zip + video all complete without manual layout; layered file has correctly named parts and transparent background.
**C9 Performance:** Drag age + eye-spacing + skin darkness simultaneously with no visible lag; undo 50 steps instant.
**C10 Privacy/Offline:** Disconnect network → all C1-C8 still pass.

## 6\. Testing Method

**6.1 Determinism tests (automated):**

* Same save rendered twice → image-identical.
* Same parents + same seed + same balance → identical child; different seed → different child.
* Age scrub 5→25→5 returns to start within tolerance.

**6.2 Golden-set visual tests:**

* Maintain 10 reference characters (toddler, teen F/M diverse, adult F/M diverse, senior). Any code change must not alter their renders beyond approved threshold unless age/style logic intentionally changed. Reviewer approves new goldens with side-by-side diff.

**6.3 Continuity tests (manual):**

* Tester performs C2 + C3 checklist blind: can they match child to grown adult? Pass = ≥80% correct across 10 trials.

**6.4 Usability tests (timed, with non-artist):**

* Tasks: make parent pair, make child, age child to teen, export bible. Measure time + errors. Pass = completes without developer help, notes where slider grouping confused them.

**6.5 Range/robustness tests:**

* Push every slider min→max: no broken overlap, no detached accessories/marks, no shadow floating. Record allowed extremes; caricature guard must trigger only on defined extreme combos.
* Randomize 100 faces with distinctness filter → no duplicates, no invalid geometry.

**6.6 Export tests:**

* Open layered export in 2 different art tools → layers named, order correct, scales cleanly, transparent where expected. Print bible → readable in B/W + color. Video plays on standard player.

**6.7 Performance test:**

* Drag master age slider 0-80 continuously on reference laptop; log frame time. Pass = live update, no freeze, final frame correct.

**6.8 Regression rule:** No release if C1-C10 fail or goldens drift unapproved.

## 7\. Suggested Tech (advisory only — developer chooses)

Developer is free to choose any stack meeting Sections 3-5. Options:

**7.1 Face rendering:**

* Web vector (SVG/DOM): best clean layers + naming + zoom; easy trace-over export. Weaker for 100+ crowd scenes.
* Canvas 2D: faster bulk render, harder clean layers.
* Real-time / game (WebGL/Unity/Godot): best for light/shaders/animation, overkill for V1 2D.
* *Ask:* separate data (control points) from renderer so renderer can be swapped later.

**7.2 App shell:**

* Web (TS + any UI framework): easiest hiring, runs everywhere.
* Desktop native (Qt / .NET / Tauri / Electron + Python/JS): better files + pen tablets + offline.
* iPad-native: best pen feel, worst for pipeline hiring. Not recommended V1.
* *Constraint:* must meet NFR1-NFR4 regardless.

**7.3 Data/storage:**

* Text file per character + project file (e.g. JSON/YAML) for simplicity/diff, OR local DB (SQLite/IndexedDB) for 100+ cast + history. Must include: version, seed, all control values, asset IDs, colors, marks, expression. Document schema before UI.

**7.4 Logic (age/genetics/expression):**

* Stack-independent math: keyframed age curves + weighted average + seeded variance + additive expression offsets. Any mainstream language works. Keep as isolated tested module.

**7.5 Color/shading/assets:**

* Use perceptual color handling (lightness separate from hue) — avoid naive RGB mixing for skin.
* Assets as attachable groups anchored to named face points (temple/crown/nose bridge/lobe) so they track morphs. Avoid free-stretch of hair art.

**7.6 Helpers:**

* Text-from-novel: rule-based keyword mapper or small local/API language model — your choice, note privacy tradeoff.
* Photo-fit: face-landmark detector library (JS/Python have open options) — mark V2.

**7.7 Export/video/docs:**

* Image: vector-to-raster at 1x/2x/4x. Sheets/bible: any HTML-to-PDF/report compositor. Video: frame-sequence encoder; do not build custom codec.

## 8\. Build Order

1. Rig + FR1/FR2/FR3 + save/load + instant drag proof-of-concept.
2. FR4 age timeline + FR5 genetics + FR13 single export.
3. FR6 expressions + FR7 assets + FR8 marks.
4. FR9 styles + FR10 helpers + FR11 cast/story.
5. FR13 batch/bible/video + Section 6 hardening.

## 9\. First Deliverable Required

1. 1-page stack choice + why.
2. Data draft for one character.
3. Working proof: one face with 5 controls (age, jaw, eye spacing, skin darkness, lip fullness) live + save/load round-trip.
4. Estimate for V1 per Sections 3-5.

