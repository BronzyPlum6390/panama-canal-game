/**
 * Platform / terrain entity
 */
class Platform extends Entity {
  constructor(x, y, w, h, opts = {}) {
    super(x, y, w, h);
    this.body = new PhysicsBody(x, y, w, h);
    this.body.isStatic = true;
    this.body.oneWay = opts.oneWay || false;
    this.body.entity = this;

    this.type = opts.type || 'solid'; // solid | oneWay | moving | crumbling | hazard
    this.color = opts.color || '#5A4020';
    this.topColor = opts.topColor || null;
    this.texture = opts.texture || 'dirt'; // dirt | stone | wood | metal | grass

    // Moving platform
    this.movePoints = opts.movePoints || null;
    this.moveIdx = 0;
    this.moveDir = 1;
    this.moveSpeed = opts.moveSpeed || 40;
    this._moveT = 0;

    // Crumbling
    this.crumbleTimer = 0;
    this.crumbleDelay = opts.crumbleDelay || 1.2;
    this.crumbleBreak = opts.crumbleBreak || 0.3;
    this.crumbling = false;
    this.broken = false;
    this.respawnTimer = 0;
    this.RESPAWN_TIME = 5;
  }

  update(dt, players) {
    // Sync body to entity position
    this.body.x = this.x;
    this.body.y = this.y;

    // Moving platform
    if (this.type === 'moving' && this.movePoints && this.movePoints.length >= 2) {
      const target = this.movePoints[this.moveIdx];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 2) {
        this.moveIdx = (this.moveIdx + this.moveDir + this.movePoints.length) % this.movePoints.length;
        if (this.moveIdx === this.movePoints.length - 1 || this.moveIdx === 0) this.moveDir *= -1;
      } else {
        const speed = this.moveSpeed * dt;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        this.x += vx;
        this.y += vy;
        this.body.x = this.x;
        this.body.y = this.y;
        // Carry players standing on this platform
        if (players) {
          for (const p of players) {
            if (p.body.onGround && Math.abs(p.body.bottom - this.y) < 4) {
              p.body.x += vx;
              p.body.y += vy;
            }
          }
        }
      }
    }

    // Crumbling
    if (this.type === 'crumbling' && !this.broken) {
      if (this.crumbling) {
        this.crumbleTimer -= dt;
        if (this.crumbleTimer <= 0) {
          this.broken = true;
          this.body.solid = false;
          this.respawnTimer = this.RESPAWN_TIME;
        }
      } else {
        // Check if anyone is standing on it
        if (players) {
          for (const p of players) {
            if (p.body.onGround && Math.abs(p.body.bottom - this.y) < 4 &&
                p.body.x < this.right && p.body.right > this.x) {
              if (this.crumbleTimer <= 0) {
                this.crumbleTimer = this.crumbleDelay;
                this.crumbling = true;
              }
              break;
            }
          }
        }
      }
    }

    if (this.broken) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.broken = false;
        this.crumbling = false;
        this.crumbleTimer = 0;
        this.body.solid = true;
      }
    }
  }

  draw(ctx, camera) {
    if (!this.active || this.broken) return;
    const { sx, sy } = camera.worldToScreen(this.x, this.y);

    // Crumble effect
    let alpha = 1;
    if (this.crumbling && this.crumbleTimer < this.crumbleBreak) {
      alpha = this.crumbleTimer / this.crumbleBreak;
    }
    ctx.save();
    ctx.globalAlpha = alpha;

    this._drawTexture(ctx, sx, sy, this.w, this.h);

    // Top surface highlight
    if (this.topColor) {
      ctx.fillStyle = this.topColor;
      ctx.fillRect(sx, sy, this.w, 3);
    }

    // Crumble shake
    if (this.crumbling) {
      const shake = Math.random() * 2 - 1;
      ctx.translate(shake, 0);
    }

    ctx.restore();
  }

  _drawTexture(ctx, x, y, w, h) {
    switch (this.texture) {
      case 'stone':
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#4A4A4A';
        // Mortar lines
        for (let i = 0; i < Math.floor(h / 12); i++) {
          ctx.fillRect(x, y + i * 12, w, 1);
        }
        for (let j = 0; j < Math.floor(w / 24); j++) {
          ctx.fillRect(x + j * 24, y, 1, h);
        }
        break;
      case 'wood':
        ctx.fillStyle = '#7A4A20';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#5A3010';
        for (let i = 0; i < Math.floor(h / 10); i++) {
          ctx.fillRect(x, y + i * 10 + 9, w, 1);
        }
        // Wood grain
        ctx.fillStyle = '#6A3A15';
        for (let g = 0; g < w; g += 6) {
          ctx.fillRect(x + g + 2, y, 1, h);
        }
        break;
      case 'metal':
        ctx.fillStyle = '#5A6070';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#6A7080';
        ctx.fillRect(x, y, w, 3);
        ctx.fillStyle = '#4A5060';
        ctx.fillRect(x, y + h - 3, w, 3);
        // Rivets
        ctx.fillStyle = '#7A8090';
        for (let r = 4; r < w; r += 16) {
          ctx.fillRect(x + r, y + h/2 - 1, 3, 3);
        }
        break;
      case 'grass':
        ctx.fillStyle = '#5A3A18';
        ctx.fillRect(x, y + 4, w, h - 4);
        ctx.fillStyle = '#3A7A20';
        ctx.fillRect(x, y, w, 5);
        // Grass tufts
        ctx.fillStyle = '#4A9A30';
        for (let t = 2; t < w; t += 8) {
          ctx.fillRect(x + t, y - 2, 2, 4);
        }
        break;
      case 'dirt':
      default:
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, w, h);
        // Surface
        ctx.fillStyle = this.topColor || this._lighten(this.color, 20);
        ctx.fillRect(x, y, w, 3);
        break;
    }
  }

  _lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((n >> 16) & 0xFF) + amt);
    const g = Math.min(255, ((n >> 8) & 0xFF) + amt);
    const b = Math.min(255, (n & 0xFF) + amt);
    return `rgb(${r},${g},${b})`;
  }
}
