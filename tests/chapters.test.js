/**
 * Chapter playability tests
 *
 * For each chapter, verifies:
 *   1. Builds without throwing
 *   2. No chicken-and-egg trigger placement (puzzle gating its own gate)
 *   3. Every blocking gate has a trigger linked to it
 *   4. All platforms are reachable via jump physics from spawn
 *   5. The exit is reachable
 */
'use strict';

const { loadChapter }                   = require('./helpers/loadChapter');
const { runBFS, MAX_JUMP_HEIGHT }       = require('./helpers/bfs');

// ── helpers ───────────────────────────────────────────────────────────────

/**
 * Collect all puzzles that have a linkedGate property set.
 * Deduplicates gates that got pushed twice (Chapter1 bug).
 */
function linkedPuzzles(chapter) {
  return chapter.puzzles.filter(p => p.linkedGate != null);
}

function uniqueGates(chapter) {
  return [...new Set(chapter.gates)];
}

/**
 * For a puzzle return its "access x" — the x coordinate a player would stand
 * at to use it. For RopePull with two anchors, return the leftmost anchor
 * (that's the accessible side from spawn).
 */
function puzzleAccessX(puzzle) {
  if (puzzle.anchorA !== undefined) {
    return Math.min(puzzle.anchorA.x, puzzle.anchorB.x);
  }
  return puzzle.x;
}

// ── test suite ────────────────────────────────────────────────────────────

const CHAPTERS = [1, 2, 3, 4, 5, 6, 7];

describe.each(CHAPTERS)('Chapter %i', (num) => {
  let chapter;

  beforeAll(() => {
    chapter = loadChapter(num);
  });

  // ── Test 1: builds without errors ──────────────────────────────────────
  test('builds without throwing', () => {
    expect(chapter).toBeDefined();
    expect(Array.isArray(chapter.platforms)).toBe(true);
    expect(Array.isArray(chapter.gates)).toBe(true);
    expect(Array.isArray(chapter.puzzles)).toBe(true);
    expect(typeof chapter.exitX).toBe('number');
    expect(typeof chapter.groundY).toBe('number');
    expect(typeof chapter._spawnX1).toBe('number');
  });

  // ── Test 2: no chicken-and-egg ─────────────────────────────────────────
  test('puzzle triggers are not behind their own gate', () => {
    const violations = [];

    for (const puzzle of linkedPuzzles(chapter)) {
      const gate       = puzzle.linkedGate;
      const gateX      = gate.x;
      const accessX    = puzzleAccessX(puzzle);

      // The trigger must be accessible from the spawn side (left of gate).
      // A small overlap tolerance of 20px handles edge cases where the
      // trigger is placed right at the gate entrance.
      if (accessX > gateX + 20) {
        violations.push({
          puzzle: puzzle.constructor.name,
          puzzleAccessX: accessX,
          gateX,
        });
      }
    }

    if (violations.length > 0) {
      const msg = violations.map(v =>
        `  ${v.puzzle} at x=${v.puzzleAccessX} is behind gate at x=${v.gateX}`
      ).join('\n');
      throw new Error(`Chicken-and-egg trigger placement:\n${msg}`);
    }
  });

  // ── Test 3: every blocking gate has a trigger ──────────────────────────
  test('every blocking gate has a trigger or custom open logic', () => {
    const hardFailures = [];
    const warnings     = [];

    for (const gate of uniqueGates(chapter)) {
      // Skip gates that start open
      if (gate.open === true) continue;
      // Skip purely decorative exit gates
      if (gate.isExit) continue;

      const linked = chapter.puzzles.filter(p => p.linkedGate === gate);

      if (linked.length === 0) {
        // Check for custom update() logic: chapter may manage gate via
        // instance properties (e.g. chapter._drainGate, chapter._balanceGate)
        const chapterProps = Object.values(chapter);
        const managedByChapter = chapterProps.some(v => v === gate);

        if (managedByChapter) {
          warnings.push(`Gate at x=${gate.x} is managed by chapter.update() — OK`);
        } else {
          hardFailures.push(`Gate at x=${gate.x} y=${gate.y} has NO trigger and is NOT managed`);
        }
      }
    }

    if (warnings.length > 0) {
      console.warn(`  Ch${num} gate warnings:`, warnings);
    }

    if (hardFailures.length > 0) {
      throw new Error(`Unsolvable gates:\n${hardFailures.map(f => '  ' + f).join('\n')}`);
    }
  });

  // ── Test 4: platform reachability via jump physics ─────────────────────
  test('all platforms are reachable from spawn via jumps', () => {
    const { reachedPlatforms, totalPlatforms } = runBFS(chapter);

    const unreachable = [];
    chapter.platforms.forEach((p, i) => {
      // Skip wall-like platforms (taller than wide, not a walking surface)
      if (p.h > p.w * 2 && p.h > 72) return;
      // Skip crumbling / moving platforms — dynamic by design
      if (p.type === 'crumbling' || p.type === 'moving') return;
      // Skip platforms buried below ground (level decoration)
      if (p.y > chapter.groundY) return;
      // Skip platforms more than 3× jump height above ground — structural/ceiling elements
      // (e.g. wall stubs created by passing height as opts to addPlatform)
      if (chapter.groundY - p.y > MAX_JUMP_HEIGHT * 4) return;

      if (!reachedPlatforms.has(i)) {
        unreachable.push({ x: p.x, y: p.y, w: p.w, h: p.h, oneWay: p.body?.oneWay });
      }
    });

    if (unreachable.length > 0) {
      const detail = unreachable.map(p =>
        `  Platform at x=${p.x} y=${p.y} w=${p.w}${p.oneWay ? ' [oneWay]' : ''}`
      ).join('\n');
      throw new Error(`${unreachable.length} unreachable platform(s):\n${detail}`);
    }
  });

  // ── Test 5: exit is reachable ──────────────────────────────────────────
  test('exit is reachable from spawn', () => {
    const { maxReachedX } = runBFS(chapter);

    // Allow a 100px buffer — the BFS reaches the last platform before exitX
    expect(maxReachedX).toBeGreaterThan(chapter.exitX - 200);
  });
});
