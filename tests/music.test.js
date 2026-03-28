'use strict';

/**
 * Music system tests
 *
 * Verifies MUSIC_TRACKS data integrity without needing a browser or AudioContext:
 *   1. All four required tracks exist
 *   2. Each track has a positive BPM
 *   3. Each track's note durations sum to the expected loop length (beats)
 *   4. No note has an invalid frequency (NaN, ≤ 0)
 *   5. No note has a zero or negative duration
 */

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

// ── Load Music.js into a minimal sandbox ─────────────────────────────────────
// Music.js uses `const MUSIC_TRACKS = (function(){ ... })()` at module scope.
// We wrap it so the const is exposed on the sandbox context.

function loadMusicTracks() {
  const src  = fs.readFileSync(path.resolve(__dirname, '../src/systems/Music.js'), 'utf8');
  const ctx  = vm.createContext({ window: {}, Math, console });

  // Expose MUSIC_TRACKS and MusicSystem onto context after eval
  const wrapped = `(function() {\n${src}\nthis.MUSIC_TRACKS = MUSIC_TRACKS;\n}).call(this)`;
  vm.runInContext(wrapped, ctx);
  return ctx.MUSIC_TRACKS;
}

// ── Expected loop lengths (beats) per track ───────────────────────────────────
const EXPECTED_BEATS = {
  title:    48,   // 16 bars × 3 beats (3/4 waltz)
  french:   32,   // 8 bars  × 4 beats (4/4)
  american: 32,   // 8 bars  × 4 beats (4/4)
  latin:    32,   // 8 bars  × 4 beats (4/4)
};

// ── Tests ─────────────────────────────────────────────────────────────────────

let tracks;

beforeAll(() => {
  tracks = loadMusicTracks();
});

test('all four tracks exist in MUSIC_TRACKS', () => {
  expect(tracks).toBeDefined();
  for (const id of Object.keys(EXPECTED_BEATS)) {
    expect(tracks[id]).toBeDefined();
  }
});

describe.each(Object.entries(EXPECTED_BEATS))('Track "%s"', (id, expectedBeats) => {
  let track;

  beforeAll(() => {
    track = tracks[id];
  });

  test('has a positive BPM', () => {
    expect(typeof track.bpm).toBe('number');
    expect(track.bpm).toBeGreaterThan(0);
  });

  test('has a non-empty notes array', () => {
    expect(Array.isArray(track.notes)).toBe(true);
    expect(track.notes.length).toBeGreaterThan(0);
  });

  test(`note durations sum to ${expectedBeats} beats`, () => {
    const total = track.notes.reduce((acc, n) => acc + n.d, 0);
    // Allow ±0.01 for floating-point accumulation
    expect(total).toBeCloseTo(expectedBeats, 1);
  });

  test('all melody frequencies are valid (positive, finite) or null (rest)', () => {
    const bad = track.notes.filter(n => {
      if (n.f == null) return false;            // rest — OK
      return typeof n.f !== 'number' || !isFinite(n.f) || n.f <= 0;
    });
    if (bad.length > 0) {
      throw new Error(
        `${bad.length} note(s) in "${id}" have invalid melody freq:\n` +
        bad.map(n => `  f=${n.f} d=${n.d}`).join('\n')
      );
    }
  });

  test('all harmony/bass frequencies are valid when present', () => {
    const bad = track.notes.filter(n => {
      for (const key of ['hm', 'b']) {
        const v = n[key];
        if (v == null) continue;
        if (typeof v !== 'number' || !isFinite(v) || v <= 0) return true;
      }
      return false;
    });
    if (bad.length > 0) {
      throw new Error(
        `${bad.length} note(s) in "${id}" have invalid hm/b freq:\n` +
        bad.map(n => `  hm=${n.hm} b=${n.b} d=${n.d}`).join('\n')
      );
    }
  });

  test('no note has a zero or negative duration', () => {
    const bad = track.notes.filter(n => typeof n.d !== 'number' || n.d <= 0);
    if (bad.length > 0) {
      throw new Error(
        `${bad.length} note(s) in "${id}" have invalid duration:\n` +
        bad.map((n, i) => `  index ${i}: d=${n.d}`).join('\n')
      );
    }
  });
});
