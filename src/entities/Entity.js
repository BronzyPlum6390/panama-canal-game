/**
 * Entity — base class for all game objects
 */
class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.active = true;
    this.id = Entity._nextId++;
    this.tags = new Set();
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get right() { return this.x + this.w; }
  get bottom() { return this.y + this.h; }

  // Simple AABB overlap
  overlaps(other) {
    return this.x < other.right && this.right > other.x &&
           this.y < other.bottom && this.bottom > other.y;
  }

  distanceTo(other) {
    const dx = this.cx - other.cx;
    const dy = this.cy - other.cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  update(dt, game) {}
  draw(ctx, camera) {}
}
Entity._nextId = 0;
