/**
 * Camera — follows midpoint of two players with smooth lerp
 */
class Camera {
  constructor(viewW, viewH) {
    this.x = 0;
    this.y = 0;
    this.viewW = viewW;
    this.viewH = viewH;
    this.lerpSpeed = 0.1;
    this.bounds = { minX: 0, maxX: 99999, minY: -99999, maxY: 99999 };
    this._shakeX = 0;
    this._shakeY = 0;
    this._shakeMag = 0;
    this._shakeDuration = 0;
    this._shakeTimer = 0;
    this.zoom = 1;
  }

  follow(entities, dt) {
    if (!entities || entities.length === 0) return;

    let targetX, targetY;
    if (entities.length === 1) {
      targetX = entities[0].x + entities[0].w / 2;
      targetY = entities[0].y + entities[0].h / 2;
    } else {
      // Midpoint between all entities
      let sumX = 0, sumY = 0;
      entities.forEach(e => { sumX += e.x + e.w / 2; sumY += e.y + e.h / 2; });
      targetX = sumX / entities.length;
      targetY = sumY / entities.length;
    }

    // Camera top-left
    const destX = targetX - this.viewW / 2;
    const destY = targetY - this.viewH / 2;

    const dx = destX - this.x;
    const dy = destY - this.y;
    // Snap instantly if very far away (e.g. after respawn)
    if (Math.abs(dx) > 400 || Math.abs(dy) > 300) {
      this.x = destX;
      this.y = destY;
    } else {
      this.x += dx * this.lerpSpeed;
      this.y += dy * this.lerpSpeed;
    }

    // Clamp to level bounds
    this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX - this.viewW, this.x));
    this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY - this.viewH, this.y));

    // Shake
    if (this._shakeTimer > 0) {
      this._shakeTimer -= dt;
      const t = this._shakeTimer / this._shakeDuration;
      const mag = this._shakeMag * t;
      this._shakeX = (Math.random() * 2 - 1) * mag;
      this._shakeY = (Math.random() * 2 - 1) * mag;
    } else {
      this._shakeX = 0;
      this._shakeY = 0;
    }
  }

  shake(duration, magnitude) {
    this._shakeDuration = duration;
    this._shakeTimer = duration;
    this._shakeMag = magnitude;
  }

  worldToScreen(wx, wy) {
    return {
      sx: Math.round((wx - this.x) + this._shakeX),
      sy: Math.round((wy - this.y) + this._shakeY)
    };
  }

  setBounds(minX, minY, maxX, maxY) {
    this.bounds = { minX, minY, maxX, maxY };
  }

  setPosition(wx, wy) {
    this.x = wx - this.viewW / 2;
    this.y = wy - this.viewH / 2;
  }
}
