/**
 * MusicSystem — procedural music via Web Audio API.
 * No audio files. Pure synthesis.
 *
 * Three period-inspired themes:
 *   'title'    — French waltz (D major, 88 BPM)   fin-de-siècle salon music
 *   'french'   — Canal atmosphère (C major, 80 BPM) French excavation era 1881–1889
 *   'american' — Ragtime march (G major, 116 BPM)  American era 1904–1914
 *
 * Usage:
 *   music.play('title')   — starts a track with 2s fade-in
 *   music.stop()          — 1.5s fade-out
 *   music.toggleMute()    — instant mute/unmute (M key)
 */

// ── Note data ──────────────────────────────────────────────────────────────────
// Built in an IIFE so _hz doesn't pollute globals after this block.
const MUSIC_TRACKS = (function () {

  /** Frequency of a note by name + octave. e.g. hz('D',5) = 587.3 Hz */
  function hz(name, oct) {
    const s = {
      C: 0, 'C#': 1, Db: 1,
      D: 2, 'D#': 3, Eb: 3,
      E: 4, F: 5, 'F#': 6, Gb: 6,
      G: 7, 'G#': 8, Ab: 8,
      A: 9, 'A#': 10, Bb: 10,
      B: 11,
    };
    return 440 * Math.pow(2, ((oct + 1) * 12 + s[name] - 69) / 12);
  }

  // ── Track 1: "La Grande Entreprise" ──────────────────────────────────────────
  // French waltz, D major, 88 BPM, 3/4 — 16 bars × 3 beats = 48 beats/loop
  // Note fields: f=melody Hz, d=beats, g=gain, hm=harmony Hz, b=bass Hz
  const titleNotes = [
    // — Phrase A (bars 1–4): D → A → G → D —
    {f:hz('D',5),  d:1.5, g:0.50, b:hz('D',3)},
    {f:hz('C#',5), d:0.5, g:0.32},
    {f:hz('D',5),  d:1.0, g:0.40},
    {f:hz('A',4),  d:1.5, g:0.48, b:hz('A',2), hm:hz('F#',4)},
    {f:hz('G',4),  d:1.5, g:0.30},
    {f:hz('F#',4), d:1.0, g:0.42, b:hz('G',2)},
    {f:hz('G',4),  d:0.5, g:0.30},
    {f:hz('A',4),  d:1.5, g:0.38},
    {f:hz('D',4),  d:3.0, g:0.45, b:hz('D',3), hm:hz('F#',3)},
    // — Phrase A′ (bars 5–8) —
    {f:hz('E',4),  d:1.0, g:0.40, b:hz('E',3)},
    {f:hz('F#',4), d:0.5, g:0.30},
    {f:hz('G',4),  d:1.5, g:0.38},
    {f:hz('A',4),  d:2.0, g:0.48, b:hz('A',2), hm:hz('C#',4)},
    {f:hz('F#',4), d:1.0, g:0.32},
    {f:hz('G',4),  d:1.0, g:0.42, b:hz('G',2)},
    {f:hz('A',4),  d:0.5, g:0.30},
    {f:hz('B',4),  d:1.5, g:0.38},
    {f:hz('A',4),  d:2.0, g:0.45, b:hz('A',2)},
    {f:null,       d:1.0},
    // — Phrase B (bars 9–12): higher register, B minor → E minor → G → D —
    {f:hz('F#',5), d:1.5, g:0.48, b:hz('B',2)},
    {f:hz('E',5),  d:0.5, g:0.32},
    {f:hz('F#',5), d:1.0, g:0.40},
    {f:hz('D',5),  d:1.5, g:0.50, b:hz('D',3), hm:hz('F#',4)},
    {f:hz('C#',5), d:1.5, g:0.35},
    {f:hz('B',4),  d:1.0, g:0.45, b:hz('E',3)},
    {f:hz('A',4),  d:0.5, g:0.30},
    {f:hz('G',4),  d:1.5, g:0.38},
    {f:hz('F#',4), d:3.0, g:0.45, b:hz('D',3), hm:hz('A',3)},
    // — Phrase B′ (bars 13–16): return, cadence —
    {f:hz('G',4),  d:1.0, g:0.42, b:hz('G',2)},
    {f:hz('A',4),  d:0.5, g:0.30},
    {f:hz('B',4),  d:1.5, g:0.38},
    {f:hz('D',5),  d:2.0, g:0.50, b:hz('D',3), hm:hz('F#',4)},
    {f:hz('A',4),  d:1.0, g:0.35},
    {f:hz('F#',4), d:2.0, g:0.45, b:hz('A',2), hm:hz('C#',4)},
    {f:hz('E',4),  d:1.0, g:0.32},
    {f:hz('D',4),  d:3.0, g:0.50, b:hz('D',3), hm:hz('F#',3)},
  ];

  // ── Track 2: "El Camino del Canal" ───────────────────────────────────────────
  // Atmospheric C major, 80 BPM, 4/4 — 8 bars × 4 beats = 32 beats/loop
  // Evokes the jungle, the heat, the slow toil of the French workers
  const frenchNotes = [
    // Bar 1 — C major, opening
    {f:hz('C',5), d:2.0, g:0.45, b:hz('C',3), hm:hz('E',4)},
    {f:hz('E',4), d:1.0, g:0.30},
    {f:hz('G',4), d:1.0, g:0.35},
    // Bar 2 — F major colour
    {f:hz('A',4), d:1.5, g:0.42, b:hz('F',3)},
    {f:hz('G',4), d:0.5, g:0.28},
    {f:hz('F',4), d:2.0, g:0.38, hm:hz('A',3)},
    // Bar 3 — back to C, gentle rise
    {f:hz('E',4), d:1.0, g:0.38, b:hz('C',3)},
    {f:hz('F',4), d:1.0, g:0.32},
    {f:hz('G',4), d:2.0, g:0.42, hm:hz('E',4)},
    // Bar 4 — root, settle
    {f:hz('C',4), d:3.5, g:0.48, b:hz('C',3)},
    {f:null,      d:0.5},
    // Bar 5 — G major, slight tension
    {f:hz('G',4), d:1.0, g:0.40, b:hz('G',2)},
    {f:hz('A',4), d:1.0, g:0.35},
    {f:hz('B',4), d:2.0, g:0.42, hm:hz('D',4)},
    // Bar 6 — descending return
    {f:hz('C',5), d:1.5, g:0.48, b:hz('C',3)},
    {f:hz('B',4), d:0.5, g:0.30},
    {f:hz('A',4), d:2.0, g:0.40, hm:hz('C',4)},
    // Bar 7 — F major passing
    {f:hz('F',4), d:1.0, g:0.38, b:hz('F',3)},
    {f:hz('G',4), d:1.0, g:0.32},
    {f:hz('E',4), d:2.0, g:0.42, hm:hz('C',4)},
    // Bar 8 — final cadence
    {f:hz('C',4), d:3.0, g:0.45, b:hz('C',3)},
    {f:null,      d:1.0},
  ];

  // ── Track 3: "Steam & Steel" ─────────────────────────────────────────────────
  // Ragtime-inspired G major, 116 BPM, 4/4 — 8 bars × 4 beats = 32 beats/loop
  // Energetic, syncopated — the American determination of 1904–1914
  const americanNotes = [
    // Bar 1 — G major ascending run
    {f:hz('G',4),  d:1.0, g:0.50, b:hz('G',2)},
    {f:hz('B',4),  d:0.5, g:0.40},
    {f:hz('D',5),  d:0.5, g:0.42},
    {f:hz('G',5),  d:1.5, g:0.48, hm:hz('B',4)},
    {f:hz('F#',5), d:0.5, g:0.35},
    // Bar 2 — resolve to C, bounce back
    {f:hz('E',5),  d:1.0, g:0.45, b:hz('C',3)},
    {f:hz('D',5),  d:1.0, g:0.38},
    {f:hz('G',4),  d:2.0, g:0.42, b:hz('G',2)},
    // Bar 3 — D7 feel, syncopation
    {f:hz('A',4),  d:1.0, g:0.48, b:hz('D',3)},
    {f:hz('C',5),  d:0.5, g:0.38},
    {f:hz('B',4),  d:0.5, g:0.40},
    {f:hz('D',5),  d:1.5, g:0.50, hm:hz('B',4)},
    {f:hz('C',5),  d:0.5, g:0.35},
    // Bar 4 — land on G chord
    {f:hz('B',4),  d:2.0, g:0.48, b:hz('G',2), hm:hz('G',4)},
    {f:hz('G',4),  d:2.0, g:0.40},
    // Bar 5 — A minor taste
    {f:hz('D',5),  d:1.0, g:0.50, b:hz('D',3)},
    {f:hz('B',4),  d:0.5, g:0.38},
    {f:hz('G',4),  d:0.5, g:0.40},
    {f:hz('A',4),  d:1.5, g:0.45},
    {f:hz('B',4),  d:0.5, g:0.38},
    // Bar 6 — C major passing
    {f:hz('C',5),  d:1.0, g:0.48, b:hz('C',3)},
    {f:hz('B',4),  d:1.0, g:0.38},
    {f:hz('A',4),  d:2.0, g:0.42},
    // Bar 7 — triumphant return to G
    {f:hz('G',4),  d:0.5, g:0.45, b:hz('G',2)},
    {f:hz('A',4),  d:0.5, g:0.38},
    {f:hz('B',4),  d:1.0, g:0.42},
    {f:hz('D',5),  d:1.5, g:0.50, hm:hz('B',4)},
    {f:hz('G',5),  d:0.5, g:0.45},
    // Bar 8 — final cadence
    {f:hz('D',5),  d:2.0, g:0.50, b:hz('D',3), hm:hz('F#',4)},
    {f:hz('G',4),  d:2.0, g:0.45, b:hz('G',2)},
  ];

  // ── Track 4: "Panama Beat" ───────────────────────────────────────────────────
  // Latin cumbia-calypso, A minor, 100 BPM, 4/4 — 8 bars × 4 beats = 32 beats/loop
  // Inspired by the Panama beat fusion of cumbia, calypso, and Caribbean rhythms
  // brought by Jamaican, Trinidadian, and Colombian workers who built the canal.
  // Brighter 'sawtooth' timbre evokes accordion / cuatro guitar of the isthmus.
  const latinNotes = [
    // Bar 1 — Am, lively ascending motif
    {f:hz('A',4),  d:1.0, g:0.52, b:hz('A',2),  type:'sawtooth'},
    {f:hz('C',5),  d:0.5, g:0.40, type:'sawtooth'},
    {f:hz('E',5),  d:0.5, g:0.42, type:'sawtooth'},
    {f:hz('A',5),  d:1.5, g:0.50, hm:hz('E',5), type:'sawtooth'},
    {f:hz('G',5),  d:0.5, g:0.38, type:'sawtooth'},
    // Bar 2 — F major colour (calypso ii chord)
    {f:hz('F',5),  d:1.5, g:0.48, b:hz('F',3),  type:'sawtooth'},
    {f:hz('E',5),  d:0.5, g:0.35, type:'sawtooth'},
    {f:hz('D',5),  d:2.0, g:0.44, hm:hz('A',4), type:'sawtooth'},
    // Bar 3 — E major (dominant), syncopated
    {f:hz('E',5),  d:1.0, g:0.50, b:hz('E',3),  type:'sawtooth'},
    {f:hz('G',5),  d:0.5, g:0.38, type:'sawtooth'},
    {f:hz('A',5),  d:0.5, g:0.42, type:'sawtooth'},
    {f:hz('B',5),  d:1.0, g:0.48, hm:hz('G#',5),type:'sawtooth'},
    {f:hz('A',5),  d:0.5, g:0.35, type:'sawtooth'},
    {f:hz('G',5),  d:0.5, g:0.32, type:'sawtooth'},
    // Bar 4 — return to Am, syncopated rest
    {f:hz('E',5),  d:2.0, g:0.48, b:hz('A',2),  type:'sawtooth'},
    {f:null,       d:0.5},
    {f:hz('A',4),  d:1.5, g:0.44, type:'sawtooth'},
    // Bar 5 — C major, brightness (relative major)
    {f:hz('C',5),  d:1.0, g:0.50, b:hz('C',3),  type:'sawtooth'},
    {f:hz('E',5),  d:0.5, g:0.38, type:'sawtooth'},
    {f:hz('G',5),  d:0.5, g:0.42, type:'sawtooth'},
    {f:hz('A',5),  d:1.5, g:0.52, hm:hz('E',5), type:'sawtooth'},
    {f:hz('G',5),  d:0.5, g:0.38, type:'sawtooth'},
    // Bar 6 — F + E, descending
    {f:hz('F',5),  d:2.0, g:0.48, b:hz('F',3),  type:'sawtooth'},
    {f:hz('E',5),  d:1.0, g:0.40, type:'sawtooth'},
    {f:hz('D',5),  d:1.0, g:0.36, type:'sawtooth'},
    // Bar 7 — descending scalar run, calypso bounce
    {f:hz('D',5),  d:1.0, g:0.46, b:hz('D',3),  type:'sawtooth'},
    {f:hz('C',5),  d:0.5, g:0.36, type:'sawtooth'},
    {f:hz('B',4),  d:0.5, g:0.38, type:'sawtooth'},
    {f:hz('A',4),  d:1.5, g:0.50, hm:hz('C',5), type:'sawtooth'},
    {f:hz('G',4),  d:0.5, g:0.32, type:'sawtooth'},
    // Bar 8 — root cadence, breathe
    {f:hz('A',4),  d:3.0, g:0.50, b:hz('A',2),  hm:hz('E',4), type:'sawtooth'},
    {f:null,       d:1.0},
  ];

  return {
    title:    { bpm: 88,  notes: titleNotes    },
    french:   { bpm: 80,  notes: frenchNotes   },
    american: { bpm: 116, notes: americanNotes },
    latin:    { bpm: 100, notes: latinNotes    },
  };
})();

// ── MusicSystem ────────────────────────────────────────────────────────────────
class MusicSystem {
  constructor() {
    this.actx         = null;
    this.master       = null;
    this.volume       = 0.30;
    this.muted        = false;
    this._nodes       = [];         // live OscillatorNodes (for cleanup)
    this._schedHandle = null;       // setTimeout id for scheduler
    this._track       = null;       // current MUSIC_TRACKS entry
    this._trackId     = null;       // current track name
    this._seqIdx      = 0;          // position in notes array
    this._nextBeat    = 0;          // AudioContext time of next note
  }

  // ── public ──────────────────────────────────────────────────────────────────

  play(trackId) {
    if (this._trackId === trackId) return;
    this._boot();
    this._cancel();
    this._trackId  = trackId;
    this._track    = MUSIC_TRACKS[trackId];
    if (!this._track) return;
    this._seqIdx   = 0;
    this._nextBeat = this.actx.currentTime + 0.1;

    // Fade in from silence
    const g = this.master.gain;
    g.cancelScheduledValues(this.actx.currentTime);
    g.setValueAtTime(0, this.actx.currentTime);
    g.linearRampToValueAtTime(
      this.muted ? 0 : this.volume,
      this.actx.currentTime + 2.0
    );
    this._tick();
  }

  stop() {
    if (!this.actx || !this._trackId) return;
    const g = this.master.gain;
    g.cancelScheduledValues(this.actx.currentTime);
    g.setValueAtTime(g.value, this.actx.currentTime);
    g.linearRampToValueAtTime(0, this.actx.currentTime + 1.5);
    setTimeout(() => this._cancel(), 1600);
  }

  /** Toggle mute. Returns new muted state. */
  toggleMute() {
    this.muted = !this.muted;
    if (this.master && this.actx) {
      const g = this.master.gain;
      g.cancelScheduledValues(this.actx.currentTime);
      g.setValueAtTime(g.value, this.actx.currentTime);
      g.linearRampToValueAtTime(
        this.muted ? 0 : this.volume,
        this.actx.currentTime + 0.25
      );
    }
    return this.muted;
  }

  // ── private ─────────────────────────────────────────────────────────────────

  _boot() {
    if (this.actx) {
      if (this.actx.state === 'suspended') this.actx.resume();
      return;
    }
    this.actx   = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.actx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.actx.destination);
  }

  _cancel() {
    if (this._schedHandle) clearTimeout(this._schedHandle);
    this._schedHandle = null;
    this._trackId     = null;
    this._track       = null;
    for (const n of this._nodes) { try { n.stop(0); } catch (_) {} }
    this._nodes = [];
  }

  /** Look-ahead scheduler — runs every 60ms, schedules up to 0.3s ahead. */
  _tick() {
    const AHEAD    = 0.30; // seconds of notes to schedule in advance
    const INTERVAL = 60;   // ms between scheduler runs

    if (!this._track || !this.actx) return;

    const { notes, bpm } = this._track;
    const beatDur = 60 / bpm;

    while (this._nextBeat < this.actx.currentTime + AHEAD) {
      const note = notes[this._seqIdx % notes.length];
      this._emit(note, this._nextBeat, beatDur);
      this._nextBeat += note.d * beatDur;
      this._seqIdx++;
    }

    this._schedHandle = setTimeout(() => this._tick(), INTERVAL);
  }

  _emit(note, when, beatDur) {
    const dur  = note.d * beatDur;
    const type = note.type || 'triangle';
    if (note.f)  this._osc(note.f,  when, dur,          note.g  || 0.4, type);
    if (note.hm) this._osc(note.hm, when, dur,          (note.g || 0.4) * 0.28, 'sine');
    if (note.b)  this._osc(note.b,  when, Math.min(dur, beatDur * 1.1), (note.g || 0.4) * 0.45, 'sine');
  }

  _osc(freq, when, dur, gain, type) {
    if (!freq || gain <= 0) return;

    const osc = this.actx.createOscillator();
    const env = this.actx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(this.master);

    const atk = 0.015;
    const rel = Math.min(0.09, dur * 0.22);
    env.gain.setValueAtTime(0,    when);
    env.gain.linearRampToValueAtTime(gain, when + atk);
    env.gain.setValueAtTime(gain, when + dur - rel);
    env.gain.linearRampToValueAtTime(0,    when + dur);

    osc.start(when);
    osc.stop(when + dur + 0.02);
    this._nodes.push(osc);
    osc.onended = () => {
      const i = this._nodes.indexOf(osc);
      if (i >= 0) this._nodes.splice(i, 1);
    };
  }
}
