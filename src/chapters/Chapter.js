/**
 * Chapter — base class for all game chapters/levels
 */
class Chapter {
  constructor(config) {
    this.id = config.id;
    this.num = config.num;
    this.title = config.title;
    this.subtitle = config.subtitle;
    this.year = config.year;
    this.footnote = config.footnote || '';
    this.bgType = config.bgType || 'jungle'; // jungle | construction | hospital | city | village
    this.levelWidth = config.levelWidth || 2400;
    this.levelHeight = config.levelHeight || 400;
    this.groundY = config.groundY || 320;
    this.music = config.music || null;

    this.platforms = [];
    this.npcs = [];
    this.puzzles = [];
    this.hazards = [];
    this.signs = [];
    this.collectibles = [];
    this.gates = [];
    this.interactables = []; // all objects players can interact with

    this.dialogueNodes = [];
    this.exitCondition = config.exitCondition || 'reach_end'; // reach_end | puzzle_complete | dialogue_complete

    this.exitTriggered = false;
    this.exitX = config.levelWidth - 80;
    this.exitGate = null;

    this._spawnX1 = config.spawnX1 || 80;
    this._spawnX2 = config.spawnX2 || 140;
    this._spawnY = config.spawnY || null; // null = computed from groundY

    this.complete = false;
    this.completionTimer = 0;
    this.COMPLETION_DELAY = 0.5;

    this.introCards = config.introCards || [];
    this.introShown = false;
  }

  get spawnY() { return this._spawnY !== null ? this._spawnY : this.groundY - PH; }

  // Called once when chapter loads
  build(physics) {
    this._buildLevel(physics);
    this._buildDialogue();
    this._rebuildInteractables();
    // Register all platform bodies
    for (const p of this.platforms) {
      physics.addStatic(p.body);
    }
    for (const g of this.gates) {
      physics.addStatic(g.body);
    }
  }

  _buildLevel(physics) {
    // Overridden by each chapter
  }

  _buildDialogue() {
    // Overridden by each chapter
  }

  _rebuildInteractables() {
    this.interactables = [
      ...this.npcs,
      ...this.puzzles,
      ...this.signs,
      ...this.collectibles,
      ...this.gates.filter(g => g.isExit),
    ];
  }

  update(dt, players, physics, input) {
    // Update all entities
    for (const p of this.platforms) p.update(dt, players);
    for (const g of this.gates) g.update(dt);
    for (const h of this.hazards) h.update(dt, players);
    for (const n of this.npcs) n.update(dt, players);
    for (const c of this.collectibles) c.update(dt);

    // Update puzzles
    for (const puzzle of this.puzzles) {
      if (puzzle.update) puzzle.update(dt, players);
    }

    // Check hazard collisions
    for (const h of this.hazards) {
      for (const p of players) {
        if (!p.active) continue;
        if (h.overlapsPlayer && h.overlapsPlayer(p) && h.canDamage(p)) {
          h.dealDamage(p);
        }
      }
    }

    // Check exit condition
    if (!this.exitTriggered) {
      if (this.exitCondition === 'reach_end') {
        let allNear = true;
        for (const p of players) {
          // Use player center so they don't need to walk past the portal edge
          if (p.body.cx < this.exitX) { allNear = false; break; }
        }
        if (allNear) this._triggerExit();
      }
    }

    if (this.exitTriggered && !this.complete) {
      this.completionTimer += dt;
      if (this.completionTimer >= this.COMPLETION_DELAY) {
        this.complete = true;
      }
    }
  }

  _triggerExit() {
    this.exitTriggered = true;
  }

  draw(ctx, camera, scrollX) {
    // Background
    this._drawBackground(ctx, camera, scrollX);
    // Platforms
    for (const p of this.platforms) p.draw(ctx, camera);
    // Gates
    for (const g of this.gates) g.draw(ctx, camera);
    // Hazards
    for (const h of this.hazards) h.draw(ctx, camera);
    // NPCs
    for (const n of this.npcs) n.draw(ctx, camera);
    // Puzzles / interactables
    for (const pz of this.puzzles) if (pz.draw) pz.draw(ctx, camera);
    for (const s of this.signs) s.draw(ctx, camera);
    for (const c of this.collectibles) c.draw(ctx, camera);
    // Exit marker
    this._drawExit(ctx, camera);
  }

  _drawBackground(ctx, camera, scrollX) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    switch (this.bgType) {
      case 'jungle':
        for (let layer = 0; layer < 4; layer++) {
          Sprites.drawJungleBg(ctx, W, H, scrollX, layer);
        }
        break;
      case 'construction':
        Sprites.drawConstructionBg(ctx, W, H, scrollX);
        break;
      case 'hospital':
        Sprites.drawHospitalBg(ctx, W, H, scrollX);
        break;
      case 'city':
        Sprites.drawCitySkyline(ctx, W, H, scrollX, this.year);
        break;
      case 'village':
        Sprites.drawVillageBg(ctx, W, H, scrollX);
        break;
    }
  }

  _drawExit(ctx, camera) {
    if (this.exitCondition !== 'reach_end') return;
    const { sx, sy } = camera.worldToScreen(this.exitX, this.groundY - 80);
    // Pulse faster and brighter once triggered
    const speed = this.exitTriggered ? 0.015 : 0.003;
    const pulse = 0.7 + Math.sin(Date.now() * speed) * 0.3;
    const brightness = this.exitTriggered ? 1.0 : pulse;
    ctx.fillStyle = `rgba(200,168,64,${brightness * 0.4})`;
    ctx.beginPath();
    ctx.arc(sx + 16, sy + 40, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(200,168,64,${brightness})`;
    ctx.lineWidth = this.exitTriggered ? 3 : 2;
    ctx.beginPath();
    ctx.arc(sx + 16, sy + 40, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(200,168,64,${brightness})`;
    ctx.font = `7px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this.exitTriggered ? '✓ LOADING...' : '→ CONTINUE', sx + 16, sy - 2);
    ctx.textAlign = 'left';
  }

  // Helper: add a ground platform spanning the full level
  addGround(physics) {
    const ground = new Platform(0, this.groundY, this.levelWidth, 80,
      { color: '#3A2810', topColor: '#5A4020', texture: 'dirt' });
    this.platforms.push(ground);
    return ground;
  }

  // Helper: add a floating platform
  addPlatform(x, y, w, opts = {}) {
    const p = new Platform(x, y, w, 16, opts);
    this.platforms.push(p);
    return p;
  }

  // Helper: add an NPC
  addNPC(config) {
    const npc = new NPC(config);
    this.npcs.push(npc);
    return npc;
  }

  // Helper: add a gate
  addGate(x, y, w, h, opts = {}) {
    const g = new Gate(x, y, w, h, opts);
    this.gates.push(g);
    return g;
  }

  // Helper: add a pressure plate
  addPressurePlate(x, y, w, opts = {}) {
    const plate = new PressurePlate(x, y, w, opts);
    this.puzzles.push(plate);
    return plate;
  }

  // Helper: add a crank
  addCrank(x, y, opts = {}) {
    const crank = new Crank(x, y, opts);
    this.puzzles.push(crank);
    return crank;
  }

  // Helper: add a rope pull
  addRopePull(x1, y1, x2, y2, opts = {}) {
    const rope = new RopePull(x1, y1, x2, y2, opts);
    this.puzzles.push(rope);
    return rope;
  }

  // Helper: add a lever
  addLever(x, y, opts = {}) {
    const lever = new Lever(x, y, opts);
    this.puzzles.push(lever);
    this.interactables.push(lever);
    return lever;
  }

  addSign(x, y, opts = {}) {
    const sign = new Sign(x, y, opts);
    this.signs.push(sign);
    return sign;
  }

  addCollectible(x, y, opts = {}) {
    const c = new Collectible(x, y, opts);
    this.collectibles.push(c);
    return c;
  }

  addHazard(x, y, w, h, opts = {}) {
    const hazard = new Hazard(x, y, w, h, opts);
    this.hazards.push(hazard);
    return hazard;
  }

  destroy(physics) {
    for (const p of this.platforms) physics.removeStatic(p.body);
    for (const g of this.gates) physics.removeStatic(g.body);
    physics.clear();
  }
}
