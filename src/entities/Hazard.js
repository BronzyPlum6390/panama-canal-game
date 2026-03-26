/**
 * Hazard entities — environmental dangers
 */
class Hazard extends Entity {
  constructor(x, y, w, h, opts = {}) {
    super(x, y, w, h);
    this.damage = opts.damage || 5;
    this.type = opts.type || 'spikes'; // spikes | fever_zone | mosquito | mudslide | steam | water
    this.damageInterval = opts.damageInterval || 0.5;
    this._damageTimers = {}; // per-player timers
    this.color = opts.color || '#CC2222';
    this.animTimer = 0;
    this.pulsing = opts.pulsing || false;
    this.warnLabel = opts.warnLabel || null;
  }

  update(dt, players) {
    this.animTimer += dt;
    // Damage timers tick down
    for (const pid in this._damageTimers) {
      if (this._damageTimers[pid] > 0) this._damageTimers[pid] -= dt;
    }
  }

  canDamage(player) {
    const pid = player.playerId;
    return !this._damageTimers[pid] || this._damageTimers[pid] <= 0;
  }

  dealDamage(player) {
    const pid = player.playerId;
    this._damageTimers[pid] = this.damageInterval;
    player.takeDamage(this.damage);
  }

  overlapsPlayer(player) {
    return this.overlaps({ x: player.body.x, y: player.body.y,
                           w: player.body.w, h: player.body.h,
                           right: player.body.right, bottom: player.body.bottom });
  }

  draw(ctx, camera) {
    const { sx, sy } = camera.worldToScreen(this.x, this.y);
    const t = this.animTimer;

    switch (this.type) {
      case 'fever_zone':
        ctx.fillStyle = `rgba(200,80,20,${0.15 + Math.sin(t*2)*0.05})`;
        ctx.fillRect(sx, sy, this.w, this.h);
        // Wavy heat lines
        ctx.strokeStyle = `rgba(255,120,40,0.4)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const hx = sx + (i+1) * this.w / 4;
          ctx.beginPath();
          ctx.moveTo(hx, sy + this.h);
          for (let y = this.h; y >= 0; y -= 4) {
            ctx.lineTo(hx + Math.sin(y * 0.2 + t * 3 + i) * 4, sy + y);
          }
          ctx.stroke();
        }
        if (this.warnLabel) {
          ctx.fillStyle = 'rgba(200,80,20,0.8)';
          ctx.font = `6px 'Courier New', monospace`;
          ctx.textAlign = 'center';
          ctx.fillText('⚠ ' + this.warnLabel, sx + this.w/2, sy - 3);
          ctx.textAlign = 'left';
        }
        break;

      case 'mosquito':
        // Swarm of dots
        ctx.fillStyle = `rgba(0,0,0,0.3)`;
        ctx.fillRect(sx, sy, this.w, this.h);
        ctx.fillStyle = '#333';
        for (let i = 0; i < 12; i++) {
          const mx = sx + ((i * 23 + t * 40) % this.w);
          const my = sy + ((i * 17 + Math.sin(i + t * 2) * 10 + 10) % this.h);
          ctx.fillRect(mx, my, 2, 2);
          // Tiny wings
          ctx.fillStyle = 'rgba(200,200,200,0.5)';
          ctx.fillRect(mx - 2, my, 2, 1);
          ctx.fillRect(mx + 2, my, 2, 1);
          ctx.fillStyle = '#333';
        }
        break;

      case 'mudslide':
        ctx.fillStyle = `rgba(100,70,20,${0.7 + Math.sin(t*3)*0.1})`;
        ctx.fillRect(sx, sy, this.w, this.h);
        // Slide streaks
        ctx.fillStyle = 'rgba(80,50,10,0.5)';
        for (let i = 0; i < 4; i++) {
          const offset = (t * 60 + i * 20) % this.h;
          ctx.fillRect(sx + i * (this.w/4), sy + offset, this.w/5, 8);
        }
        break;

      case 'steam':
        ctx.fillStyle = `rgba(200,200,220,${0.2 + Math.sin(t*4)*0.1})`;
        ctx.fillRect(sx, sy, this.w, this.h);
        // Steam puffs
        for (let i = 0; i < 3; i++) {
          const puffOffset = (t * 30 + i * 15) % this.h;
          ctx.fillStyle = 'rgba(240,240,255,0.3)';
          ctx.beginPath();
          ctx.arc(sx + (i+1) * this.w/4, sy + this.h - puffOffset, 8, 0, Math.PI*2);
          ctx.fill();
        }
        break;

      case 'water':
        ctx.fillStyle = `rgba(40,100,180,0.6)`;
        ctx.fillRect(sx, sy, this.w, this.h);
        // Wave lines
        ctx.strokeStyle = 'rgba(80,160,220,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, sy + 4);
        for (let x = 0; x <= this.w; x += 8) {
          ctx.lineTo(sx + x, sy + 4 + Math.sin(x * 0.2 + t * 2) * 3);
        }
        ctx.stroke();
        break;

      case 'spikes':
      default:
        ctx.fillStyle = '#333';
        ctx.fillRect(sx, sy, this.w, this.h);
        ctx.fillStyle = '#AA2222';
        const spikeW = 8;
        for (let i = 0; i < Math.floor(this.w / spikeW); i++) {
          ctx.beginPath();
          ctx.moveTo(sx + i * spikeW, sy + this.h);
          ctx.lineTo(sx + i * spikeW + spikeW/2, sy);
          ctx.lineTo(sx + (i+1) * spikeW, sy + this.h);
          ctx.closePath();
          ctx.fill();
        }
        break;
    }
  }
}

// ─── MOVING HAZARD (e.g. boulder, mudball) ─────────────────────────────────
class MovingHazard extends Entity {
  constructor(x, y, opts = {}) {
    super(x, y, 20, 20);
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.damage = opts.damage || 20;
    this.type = opts.type || 'boulder';
    this.color = opts.color || '#666';
    this.removeOnHit = opts.removeOnHit !== false;
    this.animTimer = 0;
    this._damageTimers = {};
  }

  update(dt, physics) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.animTimer += dt;
    // Remove if off screen far
    if (this.y > 3000) this.active = false;
  }

  overlapsPlayer(player) {
    return this.overlaps({ x: player.body.x, y: player.body.y,
                           w: player.body.w, h: player.body.h,
                           right: player.body.right, bottom: player.body.bottom });
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const { sx, sy } = camera.worldToScreen(this.x, this.y);

    if (this.type === 'boulder') {
      ctx.fillStyle = '#7A6A50';
      ctx.beginPath();
      ctx.arc(sx + 10, sy + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5A4A30';
      ctx.fillRect(sx + 2, sy + 3, 6, 4);
    } else if (this.type === 'mud') {
      ctx.fillStyle = '#8A6020';
      ctx.beginPath();
      ctx.ellipse(sx + 10, sy + 10, 10, 7, this.animTimer, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
