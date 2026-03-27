/**
 * Player entity — physics-driven character with state machine
 */
class Player extends Entity {
  constructor(playerId, x, y) {
    super(x, y, PW, PH);
    this.playerId = playerId; // 'p1' or 'p2'
    // Physics body is slightly narrower for better feel
    this.body = new PhysicsBody(x + 2, y, PW - 4, PH - 2);
    this.body.entity = this;

    this.health = 100;
    this.maxHealth = 100;
    this.state = 'idle';  // idle | walk | jump | fall | interact | hurt
    this.facing = 'right';
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 0.12; // seconds per frame

    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.wasOnGround = false;

    this.nearInteractable = null;
    this.interacting = false;
    this.hurtTimer = 0;

    this.respawnX = x;
    this.respawnY = y;
  }

  // Sync entity position from body (call at end of update)
  _syncPos() {
    this.x = this.body.x - 2;
    this.y = this.body.y;
  }

  update(dt, input, physics, interactables, hazards) {
    const inp = input[this.playerId]; // p1 or p2 input bindings

    // Coyote time
    if (this.wasOnGround && !this.body.onGround) {
      this.coyoteTimer = PHYSICS.COYOTE_TIME;
    }
    if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    this.wasOnGround = this.body.onGround;

    // Jump buffer
    if (inp.justJump) this.jumpBufferTimer = PHYSICS.JUMP_BUFFER;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;

    // Hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) this.state = 'idle';
    }

    const canMove = this.state !== 'interact' && this.hurtTimer <= 0;

    // Horizontal movement
    if (canMove) {
      if (inp.left) {
        this.body.vx -= PHYSICS.WALK_ACCEL * dt;
        this.body.vx = Math.max(-PHYSICS.MAX_WALK, this.body.vx);
        this.facing = 'left';
      } else if (inp.right) {
        this.body.vx += PHYSICS.WALK_ACCEL * dt;
        this.body.vx = Math.min(PHYSICS.MAX_WALK, this.body.vx);
        this.facing = 'right';
      } else {
        // Friction
        const f = this.body.onGround ? PHYSICS.GROUND_FRICTION : PHYSICS.AIR_FRICTION;
        this.body.vx *= Math.pow(f, dt * 60);
        if (Math.abs(this.body.vx) < 1) this.body.vx = 0;
      }
    }

    // Jump — allowed even during hurt so players can escape hazards
    if (this.state !== 'interact') {
      const canJump = (this.body.onGround || this.coyoteTimer > 0);
      if (canJump && this.jumpBufferTimer > 0) {
        this.body.vy = PHYSICS.JUMP_IMPULSE;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.hurtTimer = 0; // cancel hurt lock so they can move after jumping out
      }
    }

    // Update state
    if (this.hurtTimer > 0) {
      this.state = 'hurt';
    } else if (!this.body.onGround) {
      this.state = this.body.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.body.vx) > 5) {
      this.state = 'walk';
    } else {
      this.state = 'idle';
    }

    // Animate
    this.animTimer += dt;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer -= this.animSpeed;
      this.animFrame++;
    }

    // Interaction detection
    this.nearInteractable = null;
    if (interactables) {
      let closest = null, closestDist = 60;
      for (const obj of interactables) {
        if (!obj.active) continue;
        const d = this.distanceTo(obj);
        if (d < closestDist) { closestDist = d; closest = obj; }
      }
      this.nearInteractable = closest;
    }

    // Handle interact input
    if (inp.justAction && this.nearInteractable) {
      this.nearInteractable.onInteract(this);
    }

    // Hazard damage
    if (hazards) {
      for (const h of hazards) {
        if (!h.active) continue;
        if (this.overlaps(h) && this.hurtTimer <= 0) {
          this.takeDamage(h.damage || 10);
        }
      }
    }

    // Respawn if fallen off
    if (this.body.y > 2000) {
      this.respawn();
    }

    // Sync entity bounds from physics body
    this._syncPos();
    this.w = PW;
    this.h = PH;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.hurtTimer = 0.5;
    this.body.vx += this.facing === 'right' ? -80 : 80;
    this.body.vy = -150;
    if (this.health <= 0) {
      setTimeout(() => this.respawn(), 1000);
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  respawn() {
    this.body.x = this.respawnX;
    this.body.y = this.respawnY;
    this.body.vx = 0;
    this.body.vy = 0;
    this.health = this.maxHealth;
    this.hurtTimer = 0;
    this.state = 'idle';
  }

  setRespawn(x, y) {
    this.respawnX = x;
    this.respawnY = y;
  }

  draw(ctx, camera) {
    const { sx, sy } = camera.worldToScreen(this.x, this.body.y);

    // Hurt flash
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer * 10) % 2 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
    }

    Sprites.drawPlayer(ctx, this.playerId, sx, sy, this.facing, this.animFrame, this.state);

    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer * 10) % 2 === 0) {
      ctx.restore();
    }

    // Interact prompt
    if (this.nearInteractable) {
      const key = this.playerId === 'p1' ? 'F' : 'ENTER';
      Sprites.drawInteractPrompt(ctx, sx + PW / 2, sy - 4, key);
    }
  }
}
