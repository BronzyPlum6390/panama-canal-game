/**
 * BFS-based platform reachability checker.
 *
 * Models a player jumping through the level using the real physics constants:
 *   JUMP_IMPULSE = -340  →  max jump height ≈ 59 px
 *   MAX_WALK     = 110   →  time in air ≈ 0.694 s  →  max horizontal reach ≈ 76 px
 *   PW=48, PH=72
 *
 * All gates are treated as open (gate solvability is a separate check).
 */
'use strict';

// ── Physics constants (must match src/engine/Physics.js) ──────────────────
const JUMP_IMPULSE      = 340;   // absolute value (px/s upward)
const GRAVITY           = 980;   // px/s²
const MAX_WALK          = 110;   // px/s horizontal
const PW                = 48;
const PH                = 72;

// Derived jump physics
const MAX_JUMP_HEIGHT   = (JUMP_IMPULSE * JUMP_IMPULSE) / (2 * GRAVITY); // ≈ 59 px
const JUMP_AIR_TIME     = (2 * JUMP_IMPULSE) / GRAVITY;                   // ≈ 0.694 s
const MAX_HORIZ_REACH   = MAX_WALK * JUMP_AIR_TIME;                       // ≈ 76 px

// Tolerance to account for coyote time (+8px) and floating-point imprecision
const HEIGHT_TOL        = 8;
const HORIZ_TOL         = 10;

const EFF_JUMP_HEIGHT   = MAX_JUMP_HEIGHT + HEIGHT_TOL;  // ≈ 67 px
const EFF_HORIZ_REACH   = MAX_HORIZ_REACH + HORIZ_TOL;  // ≈ 86 px

// ── Helpers ───────────────────────────────────────────────────────────────

/** Return array of x positions representing stand-points on a platform */
function standPoints(platform) {
  const { x, w } = platform;
  const maxLeft = x + w - PW;
  if (maxLeft < x) return [x]; // platform narrower than player — single point
  const points = new Set([x, Math.floor(x + w / 2 - PW / 2), maxLeft]);
  return [...points].filter(px => px >= x && px <= maxLeft);
}

/**
 * Can a player standing at (fromFeetY) on any platform jump to land on
 * (toFeetY = toPlatform.y) given horizontal gap between the platforms?
 *
 * @param {number} fromFeetY  player feet y when on source platform
 * @param {number} fromLeft   left edge of source platform
 * @param {number} fromRight  right edge of source platform
 * @param {object} to         target platform {x, y, w}
 */
function canReach(fromFeetY, fromLeft, fromRight, to) {
  const toFeetY = to.y;          // player feet y when standing on target platform
  const deltaY  = fromFeetY - toFeetY; // positive = target is higher (harder to reach)

  // Can't jump higher than EFF_JUMP_HEIGHT
  if (deltaY > EFF_JUMP_HEIGHT) return false;

  // No downward limit — can fall any distance
  // (extremely tall falls might kill the player via respawn, but the path exists)

  // Horizontal gap: gap between nearest edges of the two platforms
  const gap = Math.max(0,
    Math.max(to.x - fromRight, fromLeft - (to.x + to.w))
  );

  // Correct horizontal reach using full jump-arc physics:
  //   Rise time always = JUMP_IMPULSE / GRAVITY = 0.347s
  //   Fall from peak to target = sqrt(2 * (MAX_JUMP_HEIGHT + |fall|) / GRAVITY)
  //   Total air time = rise time + fall time from peak
  const riseTime = JUMP_IMPULSE / GRAVITY;                          // 0.347s
  const peakToTarget = MAX_JUMP_HEIGHT + Math.max(0, -deltaY);     // fall dist from peak
  const fallTime = Math.sqrt(2 * peakToTarget / GRAVITY);
  const totalAirTime = riseTime + fallTime;
  const horizAvail = MAX_WALK * totalAirTime + HORIZ_TOL;

  return gap <= horizAvail;
}

/**
 * Determine whether a platform is a "wall" (not a walkable surface).
 * Walls are much taller than wide and should be ignored by BFS.
 */
function isWall(p) {
  return p.h > p.w * 2 && p.h > PH;
}

/**
 * Run BFS from the spawn points and return which platform indices are reachable.
 *
 * @param {object} chapter  built chapter instance
 * @returns {{ reachedPlatforms: Set<number>, maxReachedX: number }}
 */
function runBFS(chapter) {
  const platforms = chapter.platforms.filter(p => !isWall(p));
  const groundY   = chapter.groundY;

  // Index platforms for quick lookup
  // "Reachable positions" are stored as {platformIdx, feetY, left, right}
  const nodes = platforms.map((p, i) => ({
    idx:    i,
    x:      p.x,
    y:      p.y,      // top of platform = player feetY
    w:      p.w,
    left:   p.x,
    right:  p.x + p.w,
    feetY:  p.y,
    oneWay: p.body && p.body.oneWay,
  }));

  // Seed: all platforms at ground level (y == groundY) are reachable by walking
  const reached = new Set();
  const queue   = [];

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    // Ground-level platforms
    if (Math.abs(n.feetY - groundY) < 4) {
      reached.add(i);
      queue.push(i);
    }
    // Also seed the platforms that the spawn points are on / above
    const sx1 = chapter._spawnX1;
    const sx2 = chapter._spawnX2;
    if (
      (sx1 >= n.left && sx1 <= n.right) ||
      (sx2 >= n.left && sx2 <= n.right)
    ) {
      if (!reached.has(i)) { reached.add(i); queue.push(i); }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const fromIdx = queue[head++];
    const from    = nodes[fromIdx];

    for (let ti = 0; ti < nodes.length; ti++) {
      if (reached.has(ti)) continue;
      const to = nodes[ti];
      if (canReach(from.feetY, from.left, from.right, to)) {
        reached.add(ti);
        queue.push(ti);
      }
    }
  }

  const maxReachedX = queue.length === 0 ? 0 :
    Math.max(...[...reached].map(i => nodes[i].right));

  return { reachedPlatforms: reached, maxReachedX, totalPlatforms: nodes.length };
}

module.exports = { runBFS, MAX_JUMP_HEIGHT, EFF_JUMP_HEIGHT, EFF_HORIZ_REACH };
