/**
 * NarrationSystem — chapter cards, cinematic text overlays, historical footnotes
 */
class NarrationSystem {
  constructor() {
    this.queue = [];
    this.current = null;
    this.state = 'idle'; // idle | fade_in | hold | fade_out
    this.alpha = 0;
    this.timer = 0;
    this.onComplete = null;
    this.FADE_TIME = 0.6;
  }

  // Enqueue a narration card
  push(card, onComplete) {
    // card: { type, title, subtitle, body, duration, style }
    // style: 'chapter_card' | 'cinematic' | 'footnote' | 'full'
    this.queue.push({ ...card, _onComplete: onComplete });
    if (this.state === 'idle') this._next();
  }

  _next() {
    if (this.queue.length === 0) {
      this.state = 'idle';
      this.current = null;
      return;
    }
    this.current = this.queue.shift();
    this.state = 'fade_in';
    this.alpha = 0;
    this.timer = 0;
  }

  update(dt, anyInput) {
    if (this.state === 'idle') return;

    this.timer += dt;

    if (this.state === 'fade_in') {
      this.alpha = Math.min(1, this.timer / this.FADE_TIME);
      if (this.timer >= this.FADE_TIME) {
        this.state = 'hold';
        this.timer = 0;
      }
    } else if (this.state === 'hold') {
      const holdTime = this.current.duration || 4;
      if (this.timer >= holdTime || (this.current.skipOnInput && anyInput)) {
        this.state = 'fade_out';
        this.timer = 0;
      }
    } else if (this.state === 'fade_out') {
      this.alpha = Math.max(0, 1 - this.timer / this.FADE_TIME);
      if (this.timer >= this.FADE_TIME) {
        if (this.current._onComplete) this.current._onComplete();
        this._next();
      }
    }
  }

  get active() { return this.state !== 'idle'; }

  draw(ctx, W, H) {
    if (!this.current || this.alpha <= 0) return;
    const card = this.current;
    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (card.style === 'chapter_card') {
      this._drawChapterCard(ctx, card, W, H);
    } else if (card.style === 'cinematic') {
      this._drawCinematic(ctx, card, W, H);
    } else if (card.style === 'footnote') {
      this._drawFootnote(ctx, card, W, H);
    } else if (card.style === 'full') {
      this._drawFull(ctx, card, W, H);
    } else {
      this._drawCinematic(ctx, card, W, H);
    }

    ctx.restore();
  }

  _drawChapterCard(ctx, card, W, H) {
    // Full black screen with chapter info
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';

    // Year label — top section
    if (card.year) {
      ctx.fillStyle = '#C8A840';
      ctx.font = `bold 22px 'Courier New', monospace`;
      ctx.fillText(card.year, W / 2, H * 0.22);
    }

    // Top decorative line
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.30);
    ctx.lineTo(W * 0.9, H * 0.30);
    ctx.stroke();

    // Chapter number
    if (card.chapterNum) {
      ctx.fillStyle = '#666';
      ctx.font = `12px 'Courier New', monospace`;
      ctx.fillText(`CHAPTER ${card.chapterNum}`, W / 2, H * 0.38);
    }

    // Title
    ctx.fillStyle = '#F0EAD0';
    ctx.font = `bold 22px 'Courier New', monospace`;
    ctx.fillText(card.title || '', W / 2, H * 0.50);

    // Subtitle
    if (card.subtitle) {
      ctx.fillStyle = '#A89060';
      ctx.font = `11px 'Courier New', monospace`;
      ctx.fillText(card.subtitle, W / 2, H * 0.59);
    }

    // Bottom decorative line — BELOW title section, ABOVE body
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.66);
    ctx.lineTo(W * 0.9, H * 0.66);
    ctx.stroke();

    // Body text — clearly below the bottom line
    if (card.body) {
      ctx.fillStyle = '#888';
      ctx.font = `11px 'Courier New', monospace`;
      this._drawTextCentered(ctx, card.body, W / 2, H * 0.73, W * 0.78, 15);
    }

    // Skip hint
    ctx.fillStyle = '#444';
    ctx.font = `11px 'Courier New', monospace`;
    ctx.fillText('[F or Enter to continue]', W / 2, H - 10);
    ctx.textAlign = 'left';
  }

  _drawCinematic(ctx, card, W, H) {
    // Letterbox bars
    const barH = H * 0.15;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, barH);
    ctx.fillRect(0, H - barH, W, barH);

    // Text in bottom bar
    if (card.body) {
      ctx.fillStyle = '#F0EAD0';
      ctx.font = `13px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      this._drawTextCentered(ctx, card.body, W / 2, H - barH + 14, W * 0.8, 13);
      ctx.textAlign = 'left';
    }
  }

  _drawFootnote(ctx, card, W, H) {
    // Small historical footnote at top of screen
    const BW = W * 0.7, BH = 36;
    const BX = (W - BW) / 2, BY = 8;
    ctx.fillStyle = 'rgba(5,10,20,0.9)';
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(BX, BY, BW, BH, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#C8A840';
    ctx.font = `bold 11px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('HISTORICAL NOTE', W / 2, BY + 11);

    ctx.fillStyle = '#D0C8A0';
    ctx.font = `11px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    this._drawTextCentered(ctx, card.body || '', W / 2, BY + 22, BW - 16, 10);
    ctx.textAlign = 'left';
  }

  _drawFull(ctx, card, W, H) {
    // Full screen fade to black with large text
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#E8C860';
    ctx.font = `bold 20px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(card.title || '', W / 2, H * 0.4);

    if (card.body) {
      ctx.fillStyle = '#A09070';
      ctx.font = `13px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      this._drawTextCentered(ctx, card.body, W / 2, H * 0.55, W * 0.75, 13);
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
