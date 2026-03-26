/**
 * Co-op puzzle objects: Pressure Plates, Cranks, Rope Pulls, Levers, Weight Balance
 */

// ─── PRESSURE PLATE ────────────────────────────────────────────────────────────
class PressurePlate extends Entity {
  constructor(x, y, w, opts = {}) {
    super(x, y, w || 48, 8);
    this.requiredCount = opts.requiredCount || 2; // how many players needed
    this.activated = false;
    this.activeCount = 0;
    this.linkedGate = opts.linkedGate || null;
    this.label = opts.label || 'STAND TOGETHER';
    this.color = '#C8A840';
    this.momentary = opts.momentary !== false; // re-locks if players leave
    this.locked = false;
    this.body = new PhysicsBody(x, y + 4, w || 48, 4);
    this.body.isStatic = true;
    this.body.entity = this;
  }

  update(dt, players) {
    if (this.locked) return;
    this.activeCount = 0;
    for (const p of players) {
      if (p.body.onGround &&
          p.body.x < this.right && p.body.right > this.x &&
          Math.abs(p.body.bottom - this.y - 4) < 6) {
        this.activeCount++;
      }
    }
    const wasActivated = this.activated;
    this.activated = this.activeCount >= this.requiredCount;
    if (!this.momentary && wasActivated && this.activated) {
      this.locked = true; // stays open
    }
    if (this.linkedGate) {
      this.linkedGate.open = this.activated;
    }
  }

  draw(ctx, camera) {
    const { sx, sy } = camera.worldToScreen(this.x, this.y);
    const pressDepth = this.activated ? 3 : 0;

    // Base plate
    ctx.fillStyle = this.activated ? '#44CC44' : '#888840';
    ctx.fillRect(sx, sy + pressDepth, this.w, 8 - pressDepth);
    // Glow
    if (this.activated) {
      ctx.fillStyle = 'rgba(100,255,100,0.3)';
      ctx.fillRect(sx - 2, sy - 4, this.w + 4, 12);
    }

    // Edge detail
    ctx.fillStyle = '#666';
    ctx.fillRect(sx, sy + 6, this.w, 2);

    // Label
    ctx.fillStyle = this.activated ? '#88FF88' : '#AAA840';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.label, sx + this.w / 2, sy - 4);
    ctx.textAlign = 'left';
  }

  distanceTo(other) {
    const dx = (this.x + this.w/2) - other.cx;
    const dy = (this.y + this.h/2) - other.cy;
    return Math.sqrt(dx*dx+dy*dy);
  }
  onInteract() {}
}

// ─── GATE (opened by pressure plate or puzzle) ─────────────────────────────────
class Gate extends Entity {
  constructor(x, y, w, h, opts = {}) {
    super(x, y, w, h);
    this.open = false;
    this.openAmt = 0; // 0 = closed, 1 = open
    this.openSpeed = opts.openSpeed || 2;
    this.body = new PhysicsBody(x, y, w, h);
    this.body.isStatic = true;
    this.body.entity = this;
    this.color = opts.color || '#5A4A30';
    this.label = opts.label || '';
    this.direction = opts.direction || 'up'; // up | left | right
    this.isExit = opts.isExit || false;
    this._openY = y;
    this._closeY = y;
  }

  update(dt) {
    const target = this.open ? 1 : 0;
    this.openAmt += (target - this.openAmt) * Math.min(1, this.openSpeed * dt);

    if (this.direction === 'up') {
      this.body.y = this.y + (this.h * this.openAmt);
      this.body.h = Math.max(1, this.h - this.h * this.openAmt);
    }

    this.body.solid = this.openAmt < 0.95;
  }

  draw(ctx, camera) {
    const visibleH = this.h * (1 - this.openAmt);
    if (visibleH < 1) return;
    const { sx, sy } = camera.worldToScreen(this.x, this.y + this.h * this.openAmt);

    ctx.fillStyle = this.color;
    ctx.fillRect(sx, sy, this.w, visibleH);

    // Gate bars
    ctx.fillStyle = this._darken(this.color, 20);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sx + 4 + i * (this.w / 3 - 2), sy, 4, visibleH);
    }

    if (this.label) {
      ctx.fillStyle = '#C8A840';
      ctx.font = `10px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(this.label, sx + this.w / 2, sy - 4);
      ctx.textAlign = 'left';
    }
  }

  _darken(hex, amt) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0, ((n >> 16) & 0xFF) - amt);
    const g = Math.max(0, ((n >> 8) & 0xFF) - amt);
    const b = Math.max(0, (n & 0xFF) - amt);
    return `rgb(${r},${g},${b})`;
  }

  onInteract() {}
}

// ─── CRANK ─────────────────────────────────────────────────────────────────────
class Crank extends Entity {
  constructor(x, y, opts = {}) {
    super(x, y, 24, 30);
    this.label = opts.label || 'CRANK';
    this.angle = 0;
    this.rotation = 0; // accumulated rotation for progress
    this.required = opts.required || Math.PI * 6; // 3 full turns
    this.linkedGate = opts.linkedGate || null;
    this.complete = false;
    this.activatedBy = null;
    this.holdTimer = 0;
    this.color = '#7A6040';
    this.pairId = opts.pairId || null; // links two cranks
    this.pairCrank = null; // set after both created
  }

  update(dt, players) {
    if (this.complete) return;
    let anyHolding = false;

    for (const p of players) {
      if (this.distanceTo(p) < 50 && (
          (p.playerId === 'p1' && window._game && window._game.input.p1.action) ||
          (p.playerId === 'p2' && window._game && window._game.input.p2.action)
      )) {
        anyHolding = true;
        this.rotation += dt * 3;
        this.angle += dt * 3;
        this.activatedBy = p.playerId;
        break;
      }
    }

    if (!anyHolding) {
      this.rotation -= dt * 1.5; // springs back
      this.rotation = Math.max(0, this.rotation);
      this.activatedBy = null;
    }

    if (this.rotation >= this.required && !this.complete) {
      this.complete = true;
      if (this.linkedGate) this.linkedGate.open = true;
      if (this._onComplete) this._onComplete();
    }
  }

  get progress() { return Math.min(1, this.rotation / this.required); }

  draw(ctx, camera) {
    const { sx, sy } = camera.worldToScreen(this.x, this.y);
    const cx = sx + 12, cy = sy + 12;

    // Post
    ctx.fillStyle = '#4A3820';
    ctx.fillRect(cx - 4, sy, 8, 30);

    // Wheel base
    ctx.strokeStyle = this.complete ? '#44CC44' : '#888';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Crank arm
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.angle) * 10, cy + Math.sin(this.angle) * 10);
    ctx.stroke();

    // Progress ring
    ctx.strokeStyle = this.complete ? '#44CC44' : '#C87020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, -Math.PI / 2, -Math.PI / 2 + this.progress * Math.PI * 2);
    ctx.stroke();

    // Label
    ctx.fillStyle = this.complete ? '#44CC44' : '#AAA';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.activatedBy ? `HOLD ${this.activatedBy.toUpperCase()}` : `[${this.label}]`, cx, sy - 4);
    ctx.textAlign = 'left';
  }

  distanceTo(other) {
    const dx = (this.x+12) - other.cx;
    const dy = (this.y+12) - other.cy;
    return Math.sqrt(dx*dx+dy*dy);
  }
  onInteract() {}
}

// ─── ROPE PULL ─────────────────────────────────────────────────────────────────
class RopePull extends Entity {
  constructor(x1, y1, x2, y2, opts = {}) {
    super(Math.min(x1,x2), Math.min(y1,y2),
          Math.abs(x2-x1), Math.abs(y2-y1) + 16);
    this.anchorA = { x: x1, y: y1 };
    this.anchorB = { x: x2, y: y2 };
    this.pullA = 0; // 0 = not pulling, 1 = pulling
    this.pullB = 0;
    this.tension = 0; // 0 = slack, 1 = taut
    this.targetTension = opts.targetTension || 0.7;
    this.tolerance = opts.tolerance || 0.2;
    this.holdTime = 0;
    this.requiredHold = opts.requiredHold || 2.0;
    this.complete = false;
    this.linkedGate = opts.linkedGate || null;
    this.label = opts.label || 'PULL TOGETHER';
  }

  update(dt, players) {
    if (this.complete) return;
    this.pullA = 0;
    this.pullB = 0;

    for (const p of players) {
      const nearA = Math.abs(p.cx - this.anchorA.x) < 50 && Math.abs(p.cy - this.anchorA.y) < 50;
      const nearB = Math.abs(p.cx - this.anchorB.x) < 50 && Math.abs(p.cy - this.anchorB.y) < 50;
      const holding = (p.playerId === 'p1' && window._game && window._game.input.p1.action) ||
                      (p.playerId === 'p2' && window._game && window._game.input.p2.action);
      if (nearA && holding) this.pullA = 1;
      if (nearB && holding) this.pullB = 1;
    }

    // Tension based on both pulling (visual only)
    const targetT = (this.pullA + this.pullB) / 2;
    this.tension += (targetT - this.tension) * Math.min(1, dt * 4);

    // Gate opens when BOTH players hold simultaneously for requiredHold seconds
    if (this.pullA && this.pullB) {
      this.holdTime += dt;
    } else {
      this.holdTime = Math.max(0, this.holdTime - dt * 0.5);
    }

    if (this.holdTime >= this.requiredHold) {
      this.complete = true;
      if (this.linkedGate) this.linkedGate.open = true;
    }
  }

  draw(ctx, camera) {
    const a = camera.worldToScreen(this.anchorA.x, this.anchorA.y);
    const b = camera.worldToScreen(this.anchorB.x, this.anchorB.y);

    // Rope (catenary approximation)
    const sag = (1 - this.tension) * 40;
    const mx = (a.sx + b.sx) / 2;
    const my = (a.sy + b.sy) / 2 + sag;

    ctx.strokeStyle = this.complete ? '#44CC44' : (this.tension > 0.5 ? '#C8A840' : '#8A7050');
    ctx.lineWidth = this.tension > 0.5 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.quadraticCurveTo(mx, my, b.sx, b.sy);
    ctx.stroke();

    // Anchors
    ctx.fillStyle = '#7A5030';
    ctx.beginPath(); ctx.arc(a.sx, a.sy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(b.sx, b.sy, 5, 0, Math.PI * 2); ctx.fill();

    // Progress arc
    const progress = this.holdTime / this.requiredHold;
    if (progress > 0) {
      ctx.strokeStyle = '#44CC44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, 10, -Math.PI/2, -Math.PI/2 + progress * Math.PI * 2);
      ctx.stroke();
    }

    // Labels at anchors
    ctx.fillStyle = this.pullA ? '#E8C860' : '#666';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.pullA ? 'PULLING' : 'HOLD', a.sx, a.sy - 8);
    ctx.fillStyle = this.pullB ? '#E8C860' : '#666';
    ctx.fillText(this.pullB ? 'PULLING' : 'HOLD', b.sx, b.sy - 8);
    ctx.textAlign = 'left';
  }

  onInteract() {}
}

// ─── LEVER ─────────────────────────────────────────────────────────────────────
class Lever extends Entity {
  constructor(x, y, opts = {}) {
    super(x, y, 16, 24);
    this.pulled = false;
    this.linkedGate = opts.linkedGate || null;
    this.sequenceId = opts.sequenceId || null;
    this.sequenceIdx = opts.sequenceIdx !== undefined ? opts.sequenceIdx : -1;
    this.label = opts.label || '';
    this.color = opts.color || '#888';
    this.disabled = false;
    this.glowing = false;
  }

  onInteract(player) {
    if (this.disabled) return null;
    this.pulled = !this.pulled;
    if (this.linkedGate) this.linkedGate.open = this.pulled;
    return { type: 'lever_pull', leverId: this.id, sequenceId: this.sequenceId, idx: this.sequenceIdx };
  }

  draw(ctx, camera) {
    const { sx, sy } = camera.worldToScreen(this.x, this.y);
    const cx = sx + 8;

    // Base
    ctx.fillStyle = '#4A3820';
    ctx.fillRect(cx - 6, sy + 14, 12, 10);

    // Shaft
    const angle = this.pulled ? 0.5 : -0.5;
    ctx.strokeStyle = this.glowing ? '#88FF88' : (this.pulled ? '#44CC44' : this.color);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, sy + 18);
    ctx.lineTo(cx + Math.sin(angle) * 14, sy + 18 - Math.cos(angle) * 14);
    ctx.stroke();

    // Handle ball
    ctx.fillStyle = this.glowing ? '#88FF88' : (this.pulled ? '#44CC44' : '#AAA');
    ctx.beginPath();
    ctx.arc(cx + Math.sin(angle) * 14, sy + 18 - Math.cos(angle) * 14, 4, 0, Math.PI * 2);
    ctx.fill();

    if (this.label) {
      ctx.fillStyle = '#AAA';
      ctx.font = `10px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(this.label, cx, sy - 3);
      ctx.textAlign = 'left';
    }
  }
}

// ─── COLLECTIBLE (historical document / item) ───────────────────────────────
class Collectible extends Entity {
  constructor(x, y, opts = {}) {
    super(x, y, 16, 20);
    this.label = opts.label || 'Document';
    this.content = opts.content || '';
    this.color = opts.color || '#E8C860';
    this.collected = false;
    this.bobTimer = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.bobTimer += dt * 2;
  }

  onInteract(player) {
    if (!this.collected) {
      this.collected = true;
      this.active = false;
      return { type: 'collectible', label: this.label, content: this.content };
    }
    return null;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const { sx, sy } = camera.worldToScreen(this.x, this.y + Math.sin(this.bobTimer) * 3);

    // Document icon
    ctx.fillStyle = '#E8DDA0';
    ctx.fillRect(sx, sy, 14, 18);
    ctx.fillStyle = '#C8A840';
    ctx.fillRect(sx + 2, sy + 4, 10, 1);
    ctx.fillRect(sx + 2, sy + 7, 10, 1);
    ctx.fillRect(sx + 2, sy + 10, 7, 1);

    // Glow
    ctx.fillStyle = 'rgba(255,220,80,0.3)';
    ctx.beginPath();
    ctx.arc(sx + 7, sy + 9, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C8A840';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.label, sx + 7, sy - 4);
    ctx.textAlign = 'left';
  }
}

// ─── SIGN (read-only story object) ──────────────────────────────────────────
class Sign extends Entity {
  constructor(x, y, opts = {}) {
    super(x, y, 20, 30);
    this.text = opts.text || '';
    this.title = opts.title || '';
    this.read = false;
    this.type = opts.type || 'wood'; // wood | notice | memorial
  }

  onInteract(player) {
    this.read = true;
    return { type: 'sign', title: this.title, text: this.text };
  }

  draw(ctx, camera) {
    const { sx, sy } = camera.worldToScreen(this.x, this.y);
    const signColor = this.type === 'notice' ? '#D4C870' :
                      this.type === 'memorial' ? '#808080' : '#8A5A20';

    // Post
    ctx.fillStyle = '#5A3A10';
    ctx.fillRect(sx + 8, sy + 16, 4, 14);

    // Sign board
    ctx.fillStyle = signColor;
    ctx.fillRect(sx, sy, 20, 16);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, 20, 16);

    // Lines of text (symbolic)
    ctx.fillStyle = this.type === 'notice' ? '#333' : '#1A0A00';
    ctx.fillRect(sx + 2, sy + 4, 16, 1);
    ctx.fillRect(sx + 2, sy + 7, 12, 1);
    ctx.fillRect(sx + 2, sy + 10, 14, 1);

    if (!this.read) {
      ctx.fillStyle = '#E8C860';
      ctx.font = `10px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('READ', sx + 10, sy - 3);
      ctx.textAlign = 'left';
    }
  }
}
