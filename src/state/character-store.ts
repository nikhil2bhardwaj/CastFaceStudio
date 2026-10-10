/**
 * Character State Store, Cast Roster & Deterministic History Engine
 * Master Reference: MasterDoc.md (FR5, FR9, FR10, FR11, FR12, C7, C9)
 */

import { CharacterDNA, DEFAULT_CHARACTER, ArtStylePreset } from '../types/face';
import { blendParents, generateSiblings, copyFeatureRegion, evaluateIdentityDrift, FeatureRegion, IdentityCheckResult } from '../core/genetics';
import { STARTER_CAST } from '../core/starter-cast';

export type StoreListener = (dna: CharacterDNA) => void;

class CharacterStore {
  private current: CharacterDNA;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private listeners: Set<StoreListener> = new Set();
  private maxHistory: number = 60;

  // Master Cast Roster (FR10.1, FR11.1)
  private castRoster: Map<string, CharacterDNA> = new Map();
  private storyYear: number = 2024; // Story timeline synchronization (FR11.2)

  constructor() {
    this.current = JSON.parse(JSON.stringify(DEFAULT_CHARACTER));
    this.initStarterRoster();
    this.recordState();
  }

  private initStarterRoster() {
    for (const castMember of STARTER_CAST) {
      this.castRoster.set(castMember.id, JSON.parse(JSON.stringify(castMember)));
    }
    // Set active to Maya Lin if available
    const maya = this.castRoster.get('ya_01');
    if (maya) {
      this.current = JSON.parse(JSON.stringify(maya));
    }
  }

  public getDNA(): CharacterDNA {
    return this.current;
  }

  public getCastRoster(): CharacterDNA[] {
    return Array.from(this.castRoster.values());
  }

  public getCharacterById(id: string): CharacterDNA | undefined {
    return this.castRoster.get(id);
  }

  public getStoryYear(): number {
    return this.storyYear;
  }

  /**
   * Set global Story Year and auto-synchronize all cast ages (FR11.2)
   */
  public setStoryYear(year: number) {
    this.storyYear = year;
    // Auto-update age for every character in the cast based on birthYear
    for (const [, char] of this.castRoster) {
      const calculatedAge = Math.max(0, Math.min(80, year - char.meta.birthYear));
      char.timeline.age = calculatedAge;
    }

    // Update active character age
    const activeCalcAge = Math.max(0, Math.min(80, year - this.current.meta.birthYear));
    if (this.current.timeline.age !== activeCalcAge) {
      this.current.timeline.age = activeCalcAge;
      this.notify();
    }
  }

  /**
   * Switch active canvas character to an existing cast member (FR11.1)
   */
  public loadFromCastById(id: string): boolean {
    const member = this.castRoster.get(id);
    if (!member) return false;
    this.current = JSON.parse(JSON.stringify(member));
    // Synchronize to current story year
    this.current.timeline.age = Math.max(0, Math.min(80, this.storyYear - this.current.meta.birthYear));
    this.recordState();
    this.notify();
    return true;
  }

  /**
   * Load character by preset key or cast ID
   */
  public loadPreset(key: string): boolean {
    const map: Record<string, string> = {
      'default': 'ya_01',
      'child': 'c_01',
      'male-adult': 'ad_01',
      'senior': 'eld_01',
      'almond-eyes': 'c_02',
      'deep-tone': 'ya_04'
    };
    const targetId = map[key] || key;
    return this.loadFromCastById(targetId);
  }

  /**
   * Save current character back into cast roster
   */
  public saveCurrentToCast() {
    this.castRoster.set(this.current.id, JSON.parse(JSON.stringify(this.current)));
    this.notify();
  }

  /**
   * Export entire cast project (FR12.1)
   */
  public exportProjectToJSON(): string {
    const project = {
      schemaVersion: '1.0.0',
      storyYear: this.storyYear,
      activeCharacterId: this.current.id,
      characters: Array.from(this.castRoster.values())
    };
    return JSON.stringify(project, null, 2);
  }

  /**
   * Load entire cast project (FR12.1)
   */
  public loadProjectFromJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.characters || !Array.isArray(data.characters)) return false;
      this.castRoster.clear();
      for (const char of data.characters) {
        this.castRoster.set(char.id, char);
      }
      if (typeof data.storyYear === 'number') {
        this.storyYear = data.storyYear;
      }
      const active = this.castRoster.get(data.activeCharacterId) || data.characters[0];
      if (active) {
        this.current = JSON.parse(JSON.stringify(active));
      }
      this.recordState();
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    listener(this.current);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.current);
    }
  }

  private recordState() {
    const snapshot = JSON.stringify(this.current);
    if (this.undoStack.length === 0 || this.undoStack[this.undoStack.length - 1] !== snapshot) {
      this.undoStack.push(snapshot);
      if (this.undoStack.length > this.maxHistory) {
        this.undoStack.shift();
      }
      this.redoStack = [];
    }
  }

  public updateContinuous(updater: (dna: CharacterDNA) => void) {
    updater(this.current);
    this.notify();
  }

  public commitUpdate(updater: (dna: CharacterDNA) => void) {
    updater(this.current);
    this.recordState();
    this.notify();
  }

  public undo(): boolean {
    if (this.undoStack.length <= 1) return false;
    const currentSnap = this.undoStack.pop()!;
    this.redoStack.push(currentSnap);
    const prevSnap = this.undoStack[this.undoStack.length - 1];
    this.current = JSON.parse(prevSnap);
    this.notify();
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const nextSnap = this.redoStack.pop()!;
    this.undoStack.push(nextSnap);
    this.current = JSON.parse(nextSnap);
    this.notify();
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public loadFromJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as CharacterDNA;
      if (!data.schemaVersion || !data.morphs) {
        throw new Error('Invalid CharacterDNA JSON format');
      }
      this.current = data;
      this.castRoster.set(data.id, data);
      this.recordState();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to load character JSON:', err);
      return false;
    }
  }

  public exportToJSON(): string {
    return JSON.stringify(this.current, null, 2);
  }

  /**
   * Randomize face with optional region locks (FR10.2)
   */
  public randomizeFace(locks: Set<FeatureRegion> = new Set()) {
    const rnd = Math.random;
    this.commitUpdate(dna => {
      dna.seed = Math.floor(rnd() * 1000000);

      if (!locks.has('jaw')) {
        dna.morphs.head.cranialWidth = 0.35 + rnd() * 0.35;
        dna.morphs.head.headLength = 0.40 + rnd() * 0.30;
        dna.morphs.head.jawSquareness = 0.20 + rnd() * 0.65;
        dna.morphs.head.chinWidth = 0.25 + rnd() * 0.50;
        dna.morphs.head.cheekFullness = 0.30 + rnd() * 0.50;
        dna.morphs.head.neckWidth = 0.35 + rnd() * 0.40;
      }

      if (!locks.has('eyes')) {
        dna.morphs.features.eyeSpacing = 0.35 + rnd() * 0.30;
        dna.morphs.features.eyeSize = 0.40 + rnd() * 0.28;
        dna.morphs.features.eyeSlant = -0.08 + rnd() * 0.18;
        dna.morphs.features.almondShape = rnd() * 0.85;
        dna.morphs.features.eyelidFold = rnd() * 0.80;
      }

      if (!locks.has('nose')) {
        dna.morphs.features.noseLength = 0.35 + rnd() * 0.35;
        dna.morphs.features.noseBridgeWidth = 0.30 + rnd() * 0.35;
        dna.morphs.features.noseHump = rnd() < 0.3 ? rnd() * 0.5 : 0;
        dna.morphs.features.noseTipUpturn = -0.2 + rnd() * 0.4;
        dna.morphs.features.nostrilFlare = 0.30 + rnd() * 0.40;
      }

      if (!locks.has('mouth')) {
        dna.morphs.features.mouthWidth = 0.35 + rnd() * 0.30;
        dna.morphs.features.upperLipFullness = 0.30 + rnd() * 0.40;
        dna.morphs.features.lowerLipFullness = 0.35 + rnd() * 0.40;
      }

      if (!locks.has('skin')) {
        dna.coloration.skin.lightness = 0.15 + rnd() * 0.70;
        const undertones: Array<'cool-pink' | 'neutral' | 'warm-yellow' | 'olive'> = ['cool-pink', 'neutral', 'warm-yellow', 'olive'];
        dna.coloration.skin.undertone = undertones[Math.floor(rnd() * undertones.length)];
      }

      if (!locks.has('hair')) {
        const hairPalettes = ['#141416', '#2a1a15', '#483528', '#8a6842', '#d6b876', '#8a331c'];
        dna.coloration.hair.baseColor = hairPalettes[Math.floor(rnd() * hairPalettes.length)];
      }
    });
  }

  /**
   * Set Art Style Preset (FR9.3)
   */
  public setArtStylePreset(preset: ArtStylePreset) {
    this.commitUpdate(dna => {
      dna.artStyle.preset = preset;
    });
  }

  /**
   * Blend two parents into child (FR5.1)
   */
  public blendChildFromCast(
    parentAId: string,
    parentBId: string,
    ratio: number,
    variance: number,
    seed: number,
    lockedRegions: Set<FeatureRegion>
  ): CharacterDNA {
    const parentA = this.castRoster.get(parentAId) || this.current;
    const parentB = this.castRoster.get(parentBId) || DEFAULT_CHARACTER;

    const child = blendParents(parentA, parentB, {
      blendRatio: ratio,
      variance,
      seed,
      lockedRegions
    });

    this.current = child;
    this.castRoster.set(child.id, child);
    this.recordState();
    this.notify();
    return child;
  }

  /**
   * Generate 3 siblings from parents (FR5.3)
   */
  public createSiblingsFromCast(
    parentAId: string,
    parentBId: string,
    count: number = 3
  ): CharacterDNA[] {
    const parentA = this.castRoster.get(parentAId) || this.current;
    const parentB = this.castRoster.get(parentBId) || DEFAULT_CHARACTER;

    const siblings = generateSiblings(parentA, parentB, count, Date.now());
    for (const sib of siblings) {
      this.castRoster.set(sib.id, sib);
    }

    if (siblings.length > 0) {
      this.current = siblings[0];
      this.recordState();
      this.notify();
    }

    return siblings;
  }

  /**
   * Copy feature region from donor cast member (FR5.5)
   */
  public copyRegionFromCast(sourceId: string, region: FeatureRegion) {
    const source = this.castRoster.get(sourceId);
    if (!source) return;

    this.commitUpdate(dna => {
      const updated = copyFeatureRegion(source, dna, region);
      Object.assign(dna, updated);
    });
  }

  /**
   * Evaluate identity continuity & caricature warnings (FR5.6, FR11.4)
   */
  public evaluateIdentity(): IdentityCheckResult {
    return evaluateIdentityDrift(this.current);
  }
}

export const characterStore = new CharacterStore();
