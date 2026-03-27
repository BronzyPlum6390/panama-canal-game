/**
 * Game — main class orchestrating all systems
 */
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Logical resolution (all game coords are in these units)
    this.W = 640;
    this.H = 360;
    this._canvasScale = 1; // set by _resize()
    canvas.width = this.W;
    canvas.height = this.H;
    this.ctx.imageSmoothingEnabled = false;

    // State
    this.state = 'loading'; // loading | title | playing | dialogue | narration | paused | chapter_complete | game_complete
    this._prevState = null;
    this.fadeAlpha = 0;
    this.fadeDir = 0;
    this.fadeSpeed = 1.5;
    this.fadeCallback = null;

    // Systems
    this.input = new InputManager();
    this.physics = new PhysicsWorld();
    this.camera = new Camera(this.W, this.H);
    this.renderer = new Renderer(this.ctx, this.W, this.H);
    this.dialogue = new DialogueSystem();
    this.dialogueRenderer = new DialogueRenderer(this.renderer);
    this.narration = new NarrationSystem();
    this.ui = new UI(this.renderer);

    // Players
    this.player1 = null;
    this.player2 = null;

    // Chapter management
    this.chapters = [];
    this.currentChapterIdx = 0;
    this.chapter = null;

    // Timing
    this._lastTime = 0;
    this._scrollX = 0;

    // Sign/collectible popup
    this._popup = null;
    this._popupTimer = 0;

    // Expose globally for puzzle access
    window._game = this;
  }

  init() {
    // Build chapter list
    this.chapters = [
      new Chapter1(),
      new Chapter2(),
      new Chapter3(),
      new Chapter4(),
      new Chapter5(),
      new Chapter6(),
      new Chapter7(),
    ];

    // Resize canvas to fit window
    this._resize();
    window.addEventListener('resize', () => this._resize());

    // ESC = pause
    window.addEventListener('keydown', e => {
      if (e.code === 'Escape' && (this.state === 'playing' || this.state === 'paused')) {
        if (this.state === 'playing') this._setState('paused');
        else if (this.state === 'paused') this._setState('playing');
      }
    });

    // Simulate loading
    let progress = 0;
    const loadBar = document.getElementById('loading-bar');
    const loadText = document.getElementById('loading-text');
    const messages = [
      'Loading history...',
      'Preparing the jungle...',
      'Mixing concrete...',
      'Training mosquitoes...',
      'Reading the treaties...',
      'Ready.',
    ];
    const interval = setInterval(() => {
      progress += 18;
      if (loadBar) loadBar.style.width = Math.min(100, progress) + '%';
      const msgIdx = Math.min(messages.length - 1, Math.floor(progress / 20));
      if (loadText) loadText.textContent = messages[msgIdx];
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const screen = document.getElementById('loading-screen');
          if (screen) screen.classList.add('hidden');
          setTimeout(() => {
            if (screen) screen.style.display = 'none';
          }, 800);
          this._setState('title');
          this._startLoop();
        }, 600);
      }
    }, 80);
  }

  _startLoop() {
    const loop = (timestamp) => {
      const dt = Math.min((timestamp - this._lastTime) / 1000, 0.05);
      this._lastTime = timestamp;
      this.input.update();
      this._update(dt);
      this._draw();
      requestAnimationFrame(loop);
    };
    this._lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  _update(dt) {
    this.ui.update(dt);
    this.narration.update(dt, this.input.anyKey);

    // Fade logic
    if (this.fadeDir !== 0) {
      this.fadeAlpha += this.fadeDir * this.fadeSpeed * dt;
      if (this.fadeDir > 0 && this.fadeAlpha >= 1) {
        this.fadeAlpha = 1;
        this.fadeDir = 0;
        if (this.fadeCallback) { const cb = this.fadeCallback; this.fadeCallback = null; cb(); }
      } else if (this.fadeDir < 0 && this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.fadeDir = 0;
        if (this.fadeCallback) { const cb = this.fadeCallback; this.fadeCallback = null; cb(); }
      }
    }

    // Popup timer
    if (this._popup && this._popupTimer > 0) {
      this._popupTimer -= dt;
      if (this._popupTimer <= 0) this._popup = null;
    }

    if (this.state === 'title') {
      this.ui.titleAnimTime += dt;
      if (this.input.p1.justAction || this.input.p2.justAction || this.input.anyKey) {
        this._beginGame();
      }
    } else if (this.state === 'playing') {
      if (this.narration.active) return; // pause play during narration
      this._updatePlaying(dt);
    } else if (this.state === 'dialogue') {
      this.dialogue.update(dt, this.input.p1, this.input.p2);
      if (!this.dialogue.active) {
        this._setState('playing');
      }
    } else if (this.state === 'paused') {
      // Update pause menu selection
      if (this.input.p1.justJump || this.input.p2.justJump) {
        this.ui.pauseSelected = Math.max(0, this.ui.pauseSelected - 1);
      }
      if (this.input.p1.justDown || this.input.p2.justDown) {
        this.ui.pauseSelected = Math.min(this.ui.pauseOptions.length - 1, this.ui.pauseSelected + 1);
      }
      if (this.input.p1.justAction || this.input.p2.justAction) {
        switch (this.ui.pauseSelected) {
          case 0: this._setState('playing'); break;
          case 1: this._restartChapter(); break;
          case 2: this.ui.showControls = !this.ui.showControls; break;
          case 3: this._fadeOut(() => { this._teardownChapter(); this._setState('title'); this.ui.pauseSelected = 0; this.ui.titleAnimTime = 0; this._fadeIn(); }); break;
        }
      }
    } else if (this.state === 'chapter_complete') {
      if (this.input.p1.justAction || this.input.p2.justAction) {
        this._nextChapter();
      }
    } else if (this.state === 'game_complete') {
      // Handled in draw
    }
  }

  _updatePlaying(dt) {
    if (!this.chapter) return;

    // Camera scroll position for background parallax
    this._scrollX = this.camera.x;

    // Update players
    const interactables = this.chapter.interactables;
    const hazards = this.chapter.hazards;

    this.player1.update(dt, this.input, this.physics, interactables, hazards);
    this.player2.update(dt, this.input, this.physics, interactables, hazards);

    // Physics step
    this.physics.step(dt);

    // Camera follow
    this.camera.follow([this.player1, this.player2], dt);

    // Chapter update
    this.chapter.update(dt, [this.player1, this.player2], this.physics, this.input);

    // NPC interaction checks
    this._checkInteractions();

    // Chapter complete check
    if (this.chapter.complete) {
      if (this.currentChapterIdx >= this.chapters.length - 1) {
        this._fadeOut(() => this._setState('game_complete'));
      } else {
        this._setState('chapter_complete');
      }
    }
  }

  _checkInteractions() {
    for (const player of [this.player1, this.player2]) {
      if (!player.nearInteractable) continue;
      const inp = player.playerId === 'p1' ? this.input.p1 : this.input.p2;
      if (!inp.justAction) continue;

      const obj = player.nearInteractable;
      const result = obj.onInteract(player);
      if (!result) continue;

      if (result.type === 'dialogue') {
        this.dialogue.loadGraph(this.chapter.dialogueNodes);
        // Set speaker name on node
        const startNode = this.chapter.dialogueNodes.find(n => n.id === result.nodeId);
        if (startNode && !startNode.speakerName) startNode.speakerName = result.speakerName;
        this.dialogue.begin(result.nodeId, () => {
          this._setState('playing');
        });
        this._setState('dialogue');
      } else if (result.type === 'sign' || result.type === 'collectible') {
        this._showPopup(result.title || result.label, result.text || result.content);
      } else if (result.type === 'lever_pull') {
        // Chapter handles lever logic
      }
    }
  }

  _showPopup(title, text) {
    this._popup = { title, text };
    this._popupTimer = 5;
  }

  _beginGame() {
    this.currentChapterIdx = 0;
    this._loadChapter(0);
  }

  _loadChapter(idx) {
    if (idx >= this.chapters.length) {
      this._setState('game_complete');
      return;
    }

    this._teardownChapter();
    this.chapter = this.chapters[idx];

    // Build level
    this.chapter.build(this.physics);

    // Spawn players
    const sy = this.chapter.spawnY;
    if (!this.player1) {
      this.player1 = new Player('p1', this.chapter._spawnX1, sy);
    } else {
      this.player1.body.x = this.chapter._spawnX1;
      this.player1.body.y = sy;
      this.player1.body.vx = 0; this.player1.body.vy = 0;
      this.player1.health = this.player1.maxHealth;
    }
    if (!this.player2) {
      this.player2 = new Player('p2', this.chapter._spawnX2, sy);
    } else {
      this.player2.body.x = this.chapter._spawnX2;
      this.player2.body.y = sy;
      this.player2.body.vx = 0; this.player2.body.vy = 0;
      this.player2.health = this.player2.maxHealth;
    }

    this.player1.setRespawn(this.chapter._spawnX1, sy);
    this.player2.setRespawn(this.chapter._spawnX2, sy);

    // Add player bodies to physics
    this.physics.addBody(this.player1.body);
    this.physics.addBody(this.player2.body);

    // Camera setup
    this.camera.setBounds(0, -200, this.chapter.levelWidth, this.chapter.groundY + 100);
    this.camera.setPosition(this.chapter._spawnX1, this.chapter.spawnY);

    // Show intro cards, then start playing
    if (this.chapter.introCards && this.chapter.introCards.length > 0) {
      let cardIdx = 0;
      const showNext = () => {
        if (cardIdx < this.chapter.introCards.length) {
          this.narration.push({ ...this.chapter.introCards[cardIdx], skipOnInput: true }, () => {
            cardIdx++;
            showNext();
          });
        } else {
          this._setState('playing');
        }
      };
      this._setState('narration');
      this._fadeIn();
      showNext();
    } else {
      this._setState('playing');
      this._fadeIn();
    }
  }

  _teardownChapter() {
    if (this.chapter) {
      if (this.player1) this.physics.removeBody(this.player1.body);
      if (this.player2) this.physics.removeBody(this.player2.body);
      this.chapter.destroy(this.physics);
    }
    this.physics.clear();
    this._popup = null;
  }

  _nextChapter() {
    this.currentChapterIdx++;
    this._fadeOut(() => {
      this._loadChapter(this.currentChapterIdx);
    });
  }

  _restartChapter() {
    this._fadeOut(() => {
      this._loadChapter(this.currentChapterIdx);
    });
  }

  _setState(newState) {
    this._prevState = this.state;
    this.state = newState;
  }

  _fadeOut(cb) {
    this.fadeDir = 1;
    this.fadeCallback = cb;
  }

  _fadeIn() {
    this.fadeAlpha = 1;
    this.fadeDir = -1;
  }

  // ────────────────────────────────────────────────────────────────────────
  // DRAW
  // ────────────────────────────────────────────────────────────────────────

  _draw() {
    const ctx = this.ctx;
    ctx.save();
    // Scale all logical coordinates to actual canvas pixels (crisp HiDPI rendering)
    ctx.setTransform(this._canvasScale, 0, 0, this._canvasScale, 0, 0);
    ctx.imageSmoothingEnabled = false;

    if (this.state === 'title') {
      this.ui.drawTitle(ctx);
    } else if (this.state === 'game_complete') {
      this._drawGameComplete();
    } else {
      // Draw game world
      this._drawGame();

      if (this.state === 'paused') {
        this.ui.drawPauseSimple(ctx);
      } else if (this.state === 'chapter_complete') {
        this.ui.drawChapterComplete(ctx, this.chapter, this.chapters[this.currentChapterIdx + 1]);
        this.ui.titleAnimTime += 0.016;
      } else if (this.state === 'dialogue') {
        this.dialogueRenderer.draw(ctx, this.dialogue, this.W, this.H);
      }
    }

    // Narration overlay (always on top)
    if (this.narration.active) {
      this.narration.draw(ctx, this.W, this.H);
    }

    // Popup
    if (this._popup && this._popupTimer > 0) {
      this._drawPopup(ctx);
    }

    // Fade overlay
    if (this.fadeAlpha > 0) {
      this.renderer.fade(this.fadeAlpha);
    }

    ctx.restore();
  }

  _drawGame() {
    if (!this.chapter) return;
    const ctx = this.ctx;

    // Chapter background
    this.chapter.draw(ctx, this.camera, this._scrollX);

    // Players
    if (this.player1) this.player1.draw(ctx, this.camera);
    if (this.player2) this.player2.draw(ctx, this.camera);

    // HUD
    if (this.state === 'playing' || this.state === 'dialogue') {
      this.ui.drawHUD(
        this.player1, this.player2,
        this.chapter.title, this.chapter.num
      );
    }
  }

  _drawGameComplete() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = (i * 97.3) % W;
      const sy = (i * 67.1) % (H * 0.7);
      ctx.fillStyle = `rgba(255,240,200,${0.3 + (i % 3) * 0.2})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Canal water
    ctx.fillStyle = '#1A4060';
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
    ctx.strokeStyle = '#2A6080';
    ctx.lineWidth = 1;
    const t = Date.now() * 0.001;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H * 0.53 + i * 14);
      for (let x = 0; x <= W; x += 16) {
        ctx.lineTo(x, H * 0.53 + i * 14 + Math.sin(x * 0.03 + t + i) * 3);
      }
      ctx.stroke();
    }

    // A ship silhouette
    ctx.fillStyle = '#1A0A00';
    const sx = (t * 20) % (W + 200) - 100;
    ctx.fillRect(sx, H * 0.44, 120, 12);
    ctx.fillRect(sx + 20, H * 0.32, 8, 12);
    ctx.fillRect(sx + 90, H * 0.36, 6, 8);

    ctx.fillStyle = '#E8C860';
    ctx.font = `bold 20px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('THE CANAL IS OPEN', W / 2, H * 0.22);

    ctx.fillStyle = '#A89060';
    ctx.font = `13px 'Courier New', monospace`;
    ctx.fillText('August 15, 1914', W / 2, H * 0.3);

    const credits = [
      '',
      'THROUGH THE CUT',
      'A Panama Canal Story',
      '',
      'Built by the labor of 56,000 workers',
      'from 97 countries.',
      '',
      'Built on the displacement of',
      '6,000 Panamanian families.',
      '',
      'Built on the deaths of',
      'approximately 27,500 people.',
      '',
      'Owned by Panama since',
      'December 31, 1999.',
      '',
      'The workers who built it',
      'are still waiting to be remembered.',
      '',
      '— Thank you for playing —',
    ];

    ctx.font = `11px 'Courier New', monospace`;
    credits.forEach((line, i) => {
      const y = H * 0.5 - 20 + i * 12;
      if (y > H * 0.1 && y < H * 0.48) {
        ctx.fillStyle = i <= 2 ? '#E8C860' : (i <= 4 ? '#C8A840' : '#888');
        ctx.fillText(line, W / 2, y);
      }
    });

    ctx.fillStyle = '#444';
    ctx.font = `11px 'Courier New', monospace`;
    ctx.fillText('[F or Enter] — Play Again', W / 2, H - 14);
    ctx.textAlign = 'left';

    if (this.input.p1.justAction || this.input.p2.justAction) {
      this.currentChapterIdx = 0;
      this._fadeOut(() => { this._setState('title'); this._teardownChapter(); this.player1 = null; this.player2 = null; });
    }
  }

  _drawPopup(ctx) {
    const W = this.W, H = this.H;
    const alpha = Math.min(1, this._popupTimer / 0.5);
    const BW = W * 0.6, BH = 80;
    const BX = (W - BW) / 2, BY = 20;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(5,8,15,0.92)';
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(BX, BY, BW, BH, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E8C860';
    ctx.font = `bold 20px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(this._popup.title || '', W / 2, BY + 16);

    ctx.fillStyle = '#C0B890';
    ctx.font = `11px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    this._drawWrappedTextCenter(ctx, this._popup.text || '', W / 2, BY + 28, BW - 24, 11);

    ctx.textAlign = 'left';
    ctx.restore();
  }

  _drawWrappedTextCenter(ctx, text, cx, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, curY);
        line = word;
        curY += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, cx, curY);
  }

  _resize() {
    const container = this.canvas.parentElement;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    // Scale factor to fit logical resolution into container
    const scale = Math.min(cw / this.W, ch / this.H);

    // Display size in CSS pixels
    const displayW = Math.floor(this.W * scale);
    const displayH = Math.floor(this.H * scale);
    this.canvas.style.width = displayW + 'px';
    this.canvas.style.height = displayH + 'px';

    // Actual canvas pixel count (accounts for Retina/HiDPI)
    this.canvas.width = displayW * dpr;
    this.canvas.height = displayH * dpr;

    // Transform scale: logical units → actual canvas pixels
    this._canvasScale = scale * dpr;

    this.ctx.imageSmoothingEnabled = false;
  }
}
