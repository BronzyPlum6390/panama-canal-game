/**
 * Physics — simple AABB-based physics with gravity
 */
const PHYSICS = {
  GRAVITY: 980,
  MAX_FALL: 640,
  JUMP_IMPULSE: -340,
  WALK_ACCEL: 1600,
  MAX_WALK: 110,
  GROUND_FRICTION: 0.82,
  AIR_FRICTION: 0.96,
  COYOTE_TIME: 0.08,
  JUMP_BUFFER: 0.1,
};

class PhysicsBody {
  constructor(x, y, w, h) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.isStatic = false;
    this.oneWay = false;    // can jump through from below
    this.solid = true;
    this.entity = null;     // back-reference
  }
  get right()  { return this.x + this.w; }
  get bottom() { return this.y + this.h; }
  get cx()     { return this.x + this.w / 2; }
  get cy()     { return this.y + this.h / 2; }
}

class PhysicsWorld {
  constructor() {
    this.bodies = [];
    this.statics = [];
    this.FIXED_STEP = 1 / 60;
    this._accumulator = 0;
  }

  addBody(body) { this.bodies.push(body); }
  removeBody(body) {
    this.bodies = this.bodies.filter(b => b !== body);
  }
  addStatic(body) { this.statics.push(body); }
  removeStatic(body) {
    this.statics = this.statics.filter(b => b !== body);
  }
  clear() { this.bodies = []; this.statics = []; this._accumulator = 0; }

  step(dt) {
    this._accumulator += dt;
    let iterations = 0;
    while (this._accumulator >= this.FIXED_STEP && iterations < 3) {
      this._tick(this.FIXED_STEP);
      this._accumulator -= this.FIXED_STEP;
      iterations++;
    }
    if (this._accumulator > this.FIXED_STEP * 3) {
      this._accumulator = 0; // prevent spiral of death
    }
  }

  _tick(dt) {
    for (const b of this.bodies) {
      if (b.isStatic) continue;

      // Apply gravity
      b.vy += PHYSICS.GRAVITY * dt;
      b.vy = Math.min(b.vy, PHYSICS.MAX_FALL);

      // Integrate
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.onGround = false;

      // Collide against statics
      for (const s of this.statics) {
        if (!s.solid) continue;
        this._resolveBodyVsStatic(b, s);
      }

      // Body vs body (players only need this for co-op puzzles)
      for (const other of this.bodies) {
        if (other === b || other.isStatic) continue;
        this._resolveBodyVsBody(b, other);
      }
    }
  }

  _resolveBodyVsStatic(b, s) {
    if (!this._overlaps(b, s)) return;

    const overlapX = Math.min(b.right - s.x, s.right - b.x);
    const overlapY = Math.min(b.bottom - s.y, s.bottom - b.y);

    if (s.oneWay) {
      // Only resolve from above (falling down onto platform)
      if (b.vy >= 0 && (b.bottom - b.vy * (1/60)) <= s.y + 2) {
        b.y = s.y - b.h;
        b.vy = 0;
        b.onGround = true;
      }
      return;
    }

    if (overlapX < overlapY) {
      // Horizontal collision
      if (b.cx < s.cx) { b.x = s.x - b.w; b.vx = Math.min(b.vx, 0); }
      else             { b.x = s.right;    b.vx = Math.max(b.vx, 0); }
    } else {
      // Vertical collision
      if (b.cy < s.cy) {
        b.y = s.y - b.h;
        b.vy = Math.min(b.vy, 0);
        b.onGround = true;
      } else {
        b.y = s.bottom;
        b.vy = Math.max(b.vy, 0);
      }
    }
  }

  _resolveBodyVsBody(a, b) {
    if (!this._overlaps(a, b)) return;
    const overlapX = Math.min(a.right - b.x, b.right - a.x);
    const overlapY = Math.min(a.bottom - b.y, b.bottom - a.y);
    if (overlapX < overlapY) {
      const half = overlapX / 2;
      if (a.cx < b.cx) { a.x -= half; b.x += half; }
      else             { a.x += half; b.x -= half; }
    }
    // Don't push vertically between bodies to avoid stacking issues
  }

  _overlaps(a, b) {
    return a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
  }

  // Check if a rect overlaps any static
  rectOverlapsAny(x, y, w, h) {
    const r = { x, y, w, h, right: x+w, bottom: y+h };
    for (const s of this.statics) {
      if (this._overlaps(r, s)) return s;
    }
    return null;
  }
}
