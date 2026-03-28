/**
 * UI — HUD, title screen, pause menu, chapter transitions
 */
class UI {
  constructor(renderer) {
    this.r = renderer;
    this.W = renderer.W;
    this.H = renderer.H;
    this.fadeAlpha = 0;
    this.fadeDir = 0;
    this.fadeSpeed = 1.5;
    this.fadeCallback = null;
    this.titleAnimTime = 0;
    this.pauseSelected = 0;
    this.showControls = false;
    // musicStyle / lang are owned by Game — pause menu reads them via options injected at draw time
  }

  update(dt) {
    this.titleAnimTime += dt;
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
  }

  fadeOut(cb) { this.fadeDir = 1; this.fadeCallback = cb; }
  fadeIn()    { this.fadeDir = -1; this.fadeAlpha = 1; }
  get isFading() { return this.fadeDir !== 0 || this.fadeAlpha > 0; }

  drawFade() {
    if (this.fadeAlpha <= 0) return;
    this.r.fade(this.fadeAlpha);
  }

  drawHUD(player1, player2, chapterTitle, chapterNum) {
    const ctx = this.r.ctx;
    const W = this.W, H = this.H;
    const L = window.LANG;

    // Chapter indicator — centered top
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - 110, 4, 220, 20);
    ctx.fillStyle = '#C8A840';
    ctx.font = `bold 11px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`CH.${chapterNum}: ${chapterTitle.toUpperCase()}`, W / 2, 17);
    ctx.textAlign = 'left';

    // P1 HUD (top left)
    this._drawPlayerHUD(ctx, 6, 4, player1, 'P1 ROSA', '#E06060');

    // P2 HUD (top right)
    this._drawPlayerHUD(ctx, W - 110, 4, player2, 'P2 THOMAS', '#E0B040');

    // Controls reminder (bottom)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, H - 16, 300, 14);
    ctx.fillStyle = '#666';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.fillText(L ? L.t('hud.controls') : 'P1: WASD+F   P2: ARROWS+ENTER   ESC: PAUSE', 8, H - 5);
  }

  _drawPlayerHUD(ctx, x, y, player, label, barColor) {
    const BW = 102, BH = 32;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y, BW, BH);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, BW, BH);

    ctx.fillStyle = '#AAA';
    ctx.font = `bold 10px 'Courier New', monospace`;
    ctx.fillText(label, x + 4, y + 11);

    if (player) {
      const hp = player.health / player.maxHealth;
      const BAR_X = x + 4, BAR_Y = y + 16, BAR_W = BW - 8, BAR_H = 9;
      ctx.fillStyle = '#222';
      ctx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
      ctx.fillStyle = hp > 0.5 ? '#44BB44' : hp > 0.25 ? '#CCAA22' : '#CC2222';
      ctx.fillRect(BAR_X, BAR_Y, Math.max(0, hp * BAR_W), BAR_H);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.strokeRect(BAR_X, BAR_Y, BAR_W, BAR_H);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = `bold 8px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(player.health)}HP`, BAR_X + BAR_W / 2, BAR_Y + BAR_H - 1);
      ctx.textAlign = 'left';

      if (player.nearInteractable) {
        ctx.fillStyle = '#E8C860';
        ctx.font = `10px 'Courier New', monospace`;
        ctx.fillText(`[${label.startsWith('P1') ? 'F' : 'ENTER'}]`, x + 4, y + BH - 3);
      }
    }
  }

  drawTitle(ctx) {
    const W = this.W, H = this.H;
    const t = this.titleAnimTime;
    const L = window.LANG;

    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    // Animated canal water
    ctx.fillStyle = '#1A4060';
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.strokeStyle = '#2A6080';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const wy = H * 0.58 + i * 12 + Math.sin(t * 0.8 + i) * 3;
      ctx.moveTo(0, wy);
      for (let x = 0; x <= W; x += 20) {
        ctx.lineTo(x, wy + Math.sin(x * 0.03 + t * 1.2 + i) * 3);
      }
      ctx.stroke();
    }

    // Lock gate silhouette
    ctx.fillStyle = '#2A1A08';
    ctx.fillRect(W * 0.1, H * 0.3, 30, H * 0.35);
    ctx.fillRect(W * 0.82, H * 0.3, 30, H * 0.35);
    ctx.fillStyle = '#1A0A00';
    ctx.fillRect(W * 0.1 + 30, H * 0.4, W * 0.36 - 5, 15);
    ctx.fillRect(W * 0.54 + 5, H * 0.4, W * 0.28 - 5, 15);

    // Jungle silhouette
    ctx.fillStyle = '#0A1A08';
    for (let i = 0; i < 12; i++) {
      const tx = (i / 12) * W;
      ctx.beginPath();
      ctx.arc(tx + W / 24, H * 0.55, W / 20, 0, Math.PI, true);
      ctx.fill();
    }

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137.5) % W;
      const sy = (i * 71.3) % (H * 0.5);
      const sb = 0.4 + 0.6 * Math.sin(t * 0.5 + i);
      ctx.fillStyle = `rgba(255,240,200,${sb * 0.7})`;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Title text
    const pulse = 1 + Math.sin(t * 1.5) * 0.02;
    ctx.save();
    ctx.translate(W / 2, H * 0.25);
    ctx.scale(pulse, pulse);

    ctx.fillStyle = '#E8C860';
    ctx.font = `bold 28px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(L ? L.t('title.main') : 'THROUGH THE CUT', 0, 0);

    ctx.fillStyle = '#A89050';
    ctx.font = `13px 'Courier New', monospace`;
    ctx.fillText(L ? L.t('title.sub') : 'A PANAMA CANAL STORY', 0, 18);
    ctx.restore();

    // Bilingual subtitle line
    if (L && L.lang === 'bilingual') {
      ctx.fillStyle = '#7A6840';
      ctx.font = `11px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('A TRAVÉS DEL CORTE  /  UNA HISTORIA DEL CANAL DE PANAMÁ', W / 2, H * 0.32);
    }

    ctx.fillStyle = '#7A6840';
    ctx.font = `12px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(L ? L.t('title.years') : '1881 — 1999', W / 2, H * 0.38);

    ctx.fillStyle = '#888';
    ctx.font = `11px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(L ? L.t('title.coop') : 'A 2-PLAYER CO-OP STORY', W / 2, H * 0.75);

    ctx.fillStyle = '#556';
    ctx.fillText(
      (L ? L.t('title.p1ctrl') : 'PLAYER 1: WASD + F') + '      ' +
      (L ? L.t('title.p2ctrl') : 'PLAYER 2: ARROWS + ENTER'),
      W / 2, H * 0.8
    );

    const blink = Math.floor(t * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#C8A840';
      ctx.font = `13px 'Courier New', monospace`;
      ctx.fillText(L ? L.t('title.start') : 'PRESS F OR ENTER TO BEGIN', W / 2, H * 0.88);
    }

    ctx.textAlign = 'left';
  }

  drawPauseSimple(ctx, musicStyle) {
    this._renderPauseMenu(ctx, musicStyle);
  }

  drawPause(ctx, selectedIdx, input, musicStyle) {
    this._renderPauseMenu(ctx, musicStyle);
    return this.pauseSelected;
  }

  _renderPauseMenu(ctx, musicStyle = 'western') {
    const W = this.W, H = this.H;
    const L = window.LANG;

    const musicLabel = L ? L.t(`music.${musicStyle}`) : musicStyle.toUpperCase();
    const langLabel  = L ? L.label : 'ENGLISH';

    const opts = [
      L ? L.t('pause.resume')   : 'RESUME',
      L ? L.t('pause.restart')  : 'RESTART CHAPTER',
      L ? L.t('pause.controls') : 'CONTROLS',
      L ? L.t('pause.quit')     : 'QUIT TO TITLE',
      `${L ? L.t('pause.music') : 'MUSIC'}: ${musicLabel}`,
      `${L ? L.t('pause.lang')  : 'LANGUAGE'}: ${langLabel}`,
    ];

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);

    const BW = 220, BH = 190;
    const BX = (W - BW) / 2, BY = (H - BH) / 2;

    ctx.fillStyle = '#08080F';
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(BX, BY, BW, BH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E8C860';
    ctx.font = `bold 16px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(L ? L.t('pause.title') : 'PAUSED', W / 2, BY + 20);

    opts.forEach((opt, i) => {
      const oy = BY + 42 + i * 22;
      if (i === this.pauseSelected) {
        ctx.fillStyle = 'rgba(200,168,64,0.2)';
        ctx.fillRect(BX + 8, oy - 12, BW - 16, 16);
        ctx.fillStyle = '#FFE090';
        ctx.font = `bold 11px 'Courier New', monospace`;
        ctx.fillText('▶ ' + opt, W / 2, oy);
      } else {
        ctx.fillStyle = '#888';
        ctx.font = `11px 'Courier New', monospace`;
        ctx.fillText(opt, W / 2, oy);
      }
    });

    ctx.font = `10px 'Courier New', monospace`;
    ctx.fillStyle = '#444';
    ctx.fillText(L ? L.t('pause.nav') : '↑↓ navigate  F/Enter select', W / 2, BY + BH - 8);
    ctx.textAlign = 'left';

    if (this.showControls) {
      this._drawControls(ctx, W, H);
    }
  }

  _drawControls(ctx, W, H) {
    const L = window.LANG;
    const BW = 260, BH = 120;
    const BX = (W - BW) / 2, BY = H * 0.1;
    ctx.fillStyle = '#050510';
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(BX, BY, BW, BH, 4);
    ctx.fill();
    ctx.stroke();

    const t = (k) => L ? L.t(k) : k;
    const controls = [
      [t('ctrl.p1'),      t('ctrl.p2')],
      [t('ctrl.movelr'),  t('ctrl.arrows')],
      [t('ctrl.jump'),    t('ctrl.up')],
      [t('ctrl.duck'),    t('ctrl.down')],
      [t('ctrl.interact'),t('ctrl.enter')],
      [t('ctrl.esc'),     ''],
    ];

    ctx.font = `11px 'Courier New', monospace`;
    controls.forEach((row, i) => {
      const ry = BY + 16 + i * 16;
      if (i === 0) {
        ctx.fillStyle = '#C8A840';
        ctx.textAlign = 'left';
        ctx.fillText(row[0], BX + 12, ry);
        ctx.textAlign = 'right';
        ctx.fillText(row[1], BX + BW - 12, ry);
      } else {
        ctx.fillStyle = '#AAA';
        ctx.textAlign = 'left';
        ctx.fillText(row[0], BX + 12, ry);
        ctx.textAlign = 'right';
        ctx.fillText(row[1], BX + BW - 12, ry);
      }
    });
    ctx.textAlign = 'left';
  }

  drawCoopIndicator(ctx, x, y, label, active, progress) {
    const W = 80, H = 12;
    const BX = x - W / 2, BY = y - H - 4;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(BX, BY, W, H);
    if (active) {
      ctx.fillStyle = progress >= 1 ? '#44CC44' : '#C8A840';
      ctx.fillRect(BX + 1, BY + 1, (W - 2) * Math.min(1, progress), H - 2);
    }
    ctx.strokeStyle = active ? '#C8A840' : '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(BX, BY, W, H);
    ctx.fillStyle = active ? '#FFF' : '#666';
    ctx.font = `10px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x, BY + H - 2);
    ctx.textAlign = 'left';
  }

  drawChapterComplete(ctx, chapter, nextChapter) {
    const W = this.W, H = this.H;
    const L = window.LANG;
    const es = L ? L.chapterEs(chapter.id) : {};
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#E8C860';
    ctx.font = `bold 16px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(L ? L.t('ch.complete') : 'CHAPTER COMPLETE', W / 2, H * 0.32);

    // Chapter title — bilingual
    const titleEn = chapter.title || '';
    const titleEs = es.title_es || '';
    if (L && L.lang === 'bilingual' && titleEs) {
      ctx.fillStyle = '#A89060';
      ctx.font = `13px 'Courier New', monospace`;
      ctx.fillText(titleEn, W / 2, H * 0.42);
      ctx.fillStyle = '#8A7040';
      ctx.font = `12px 'Courier New', monospace`;
      ctx.fillText(titleEs, W / 2, H * 0.49);
    } else {
      ctx.fillStyle = '#A89060';
      ctx.font = `13px 'Courier New', monospace`;
      ctx.fillText(L && L.lang === 'es' && titleEs ? titleEs : titleEn, W / 2, H * 0.44);
    }

    // Footnote
    const footnoteEn = chapter.footnote || '';
    const footnoteEs = es.footnote_es || '';
    const footnoteText = L && L.lang === 'es' && footnoteEs ? footnoteEs : footnoteEn;
    if (footnoteText) {
      ctx.fillStyle = '#888';
      ctx.font = `11px 'Courier New', monospace`;
      this._drawTextCentered(ctx, footnoteText, W / 2, H * 0.54, W * 0.75, 11);
      if (L && L.lang === 'bilingual' && footnoteEs && footnoteEn !== footnoteEs) {
        ctx.fillStyle = '#666';
        ctx.font = `10px 'Courier New', monospace`;
        this._drawTextCentered(ctx, footnoteEs, W / 2, H * 0.64, W * 0.75, 10);
      }
    }

    const blink = Math.floor(this.titleAnimTime * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#C8A840';
      ctx.font = `12px 'Courier New', monospace`;
      ctx.fillText(L ? L.t('ch.continue') : '[F/Enter] Continue', W / 2, H * 0.83);
    }
    ctx.textAlign = 'left';
  }

  _drawTextCentered(ctx, text, cx, y, maxW, lineH) {
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
}
