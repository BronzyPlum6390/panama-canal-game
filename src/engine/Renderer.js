/**
 * Renderer — canvas drawing helpers and layer management
 */
class Renderer {
  constructor(ctx, logicalW, logicalH) {
    this.ctx = ctx;
    // Always use logical (game-coordinate) dimensions, not canvas pixel dimensions.
    // The Game applies a scale transform so all drawing uses logical coords.
    this.W = logicalW || 640;
    this.H = logicalH || 360;
  }

  clear(color = '#000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // Draw a filled rectangle in world space via camera
  fillRect(camera, wx, wy, ww, wh, color) {
    const { sx, sy } = camera.worldToScreen(wx, wy);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(sx, sy, ww, wh);
  }

  // Draw a filled rectangle in screen space
  fillRectS(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  strokeRectS(x, y, w, h, color, lineWidth = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  text(str, x, y, color = '#fff', size = 8, align = 'left') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px 'Courier New', monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(str, x, y);
    this.ctx.textAlign = 'left';
  }

  textWrap(str, x, y, maxW, lineH, color, size) {
    const words = str.split(' ');
    let line = '';
    let curY = y;
    this.ctx.font = `${size}px 'Courier New', monospace`;
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (this.ctx.measureText(test).width > maxW && line) {
        this.text(line, x, curY, color, size);
        line = word;
        curY += lineH;
      } else {
        line = test;
      }
    }
    if (line) this.text(line, x, curY, color, size);
    return curY + lineH;
  }

  // Pixel-block drawing — used for sprite rendering
  pixelBlock(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
  }

  // Draw a rounded rect
  roundRect(x, y, w, h, r, fill, stroke) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  // Semi-transparent overlay
  overlay(color, alpha) {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.W, this.H);
    this.ctx.globalAlpha = 1;
  }

  // Gradient background
  gradientBg(topColor, bottomColor) {
    const g = this.ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, topColor);
    g.addColorStop(1, bottomColor);
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  // Fade rectangle (for transitions)
  fade(alpha, color = '#000') {
    if (alpha <= 0) return;
    this.ctx.globalAlpha = Math.min(1, alpha);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.W, this.H);
    this.ctx.globalAlpha = 1;
  }

  // Draw a simple circle
  circle(x, y, r, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Ellipse
  ellipse(x, y, rx, ry, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
