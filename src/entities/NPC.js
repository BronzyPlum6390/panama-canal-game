/**
 * NPC — interactive non-player character with dialogue
 */
class NPC extends Entity {
  constructor(config) {
    super(config.x, config.y, PW, PH);
    this.id = config.id || 'npc';
    this.displayName = config.displayName || 'Stranger';
    this.dialogueId = config.dialogueId || null; // start node in dialogue graph
    this.colors = config.colors || {};
    this.patrolPath = config.patrolPath || null;
    this.patrolIdx = 0;
    this.patrolDir = 1;
    this.patrolSpeed = config.patrolSpeed || 20;
    this.facing = 'right';
    this.animFrame = 0;
    this.animTimer = 0;
    this.hasBeenTalkedTo = false;
    this.repeatable = config.repeatable !== false;
    this.exclamation = false;
    this.exclamTimer = 0;
    this.isAlive = config.isAlive !== false;
  }

  update(dt, players) {
    this.animTimer += dt;
    if (this.animTimer >= 0.15) {
      this.animTimer -= 0.15;
      this.animFrame++;
    }

    // Exclamation pulse
    if (this.exclamTimer > 0) this.exclamTimer -= dt;

    // Patrol
    if (this.patrolPath && this.patrolPath.length >= 2) {
      const target = this.patrolPath[this.patrolIdx];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 2) {
        this.patrolIdx = (this.patrolIdx + this.patrolDir + this.patrolPath.length) % this.patrolPath.length;
        if (this.patrolIdx === this.patrolPath.length - 1 || this.patrolIdx === 0) {
          this.patrolDir *= -1;
        }
      } else {
        this.x += (dx / dist) * this.patrolSpeed * dt;
        this.facing = dx > 0 ? 'right' : 'left';
      }
    }

    // Show exclamation if players are near and haven't talked yet
    if (!this.hasBeenTalkedTo && this.dialogueId) {
      for (const p of players) {
        if (this.distanceTo(p) < 80) {
          this.exclamation = true;
          this.exclamTimer = 0.2;
        }
      }
      if (this.exclamTimer <= 0) this.exclamation = false;
    }
  }

  onInteract(player) {
    if (this.dialogueId && (this.repeatable || !this.hasBeenTalkedTo)) {
      this.hasBeenTalkedTo = true;
      return { type: 'dialogue', nodeId: this.dialogueId, speakerName: this.displayName, speakerId: this.id };
    }
    return null;
  }

  draw(ctx, camera) {
    if (!this.active) return;
    const { sx, sy } = camera.worldToScreen(this.x, this.y);

    if (!this.isAlive) {
      // Ghosted / memorial appearance
      ctx.save();
      ctx.globalAlpha = 0.4;
      Sprites.drawNPC(ctx, sx, sy, this, this.animFrame);
      ctx.restore();
      return;
    }

    Sprites.drawNPC(ctx, sx, sy, this, this.animFrame);

    // Name label
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx, sy - 14, PW, 10);
    ctx.fillStyle = '#E8C860';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.displayName, sx + PW / 2, sy - 6);
    ctx.textAlign = 'left';

    // Exclamation mark
    if (this.exclamation && !this.hasBeenTalkedTo) {
      const pulse = 0.8 + Math.sin(Date.now() * 0.008) * 0.2;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#FFE050';
      ctx.font = `bold 12px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('!', sx + PW / 2, sy - 18);
      ctx.restore();
    }
  }
}
