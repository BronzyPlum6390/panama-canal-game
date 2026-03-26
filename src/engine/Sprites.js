/**
 * Sprites — canvas-drawn pixel art characters and backgrounds
 * All graphics are procedurally drawn — no external image files
 */

const PLAYER_COLORS = {
  p1: {  // Rosa — Panamanian woman
    skin: '#C4956A', skinDark: '#A87550',
    hair: '#1A0A00', hairHL: '#3D1A00',
    shirt: '#CC4444', shirtDark: '#992222',
    pants: '#2244AA', pantsDark: '#1A3388',
    shoes: '#3D2200',
    outline: '#1A0A00',
  },
  p2: {  // Thomas — Caribbean worker
    skin: '#5C3A1E', skinDark: '#3D2210',
    hair: '#0A0500', hairHL: '#1A0A00',
    shirt: '#D4A030', shirtDark: '#A87820',
    pants: '#2A2A2A', pantsDark: '#111',
    shoes: '#3D2200',
    outline: '#0A0500',
  },
};

// Scale factor for player sprites (each "pixel" = SCALE px on canvas)
const PSCALE = 3;
const PW = 16 * PSCALE; // 48
const PH = 24 * PSCALE; // 72

class Sprites {
  static drawPlayer(ctx, playerId, x, y, facing, animFrame, state) {
    const c = PLAYER_COLORS[playerId];
    const f = Math.floor(animFrame % 4);
    const flip = facing === 'left';

    ctx.save();
    if (flip) {
      ctx.translate(x + PW, y);
      ctx.scale(-1, 1);
      x = 0; y = 0;
    }

    const leg = Math.sin(f * Math.PI / 2) * 2 * PSCALE; // leg swing

    // SHOES
    ctx.fillStyle = c.shoes;
    ctx.fillRect(x + 3*PSCALE, y + 21*PSCALE, 4*PSCALE, 3*PSCALE); // left
    ctx.fillRect(x + 9*PSCALE, y + 21*PSCALE, 4*PSCALE, 3*PSCALE); // right

    // LEGS
    ctx.fillStyle = c.pantsDark;
    ctx.fillRect(x + 4*PSCALE, y + 15*PSCALE + (state==='walk'? leg:0), 3*PSCALE, 7*PSCALE);
    ctx.fillRect(x + 9*PSCALE, y + 15*PSCALE - (state==='walk'? leg:0), 3*PSCALE, 7*PSCALE);
    ctx.fillStyle = c.pants;
    ctx.fillRect(x + 4*PSCALE, y + 15*PSCALE + (state==='walk'? leg:0), 2*PSCALE, 6*PSCALE);
    ctx.fillRect(x + 9*PSCALE, y + 15*PSCALE - (state==='walk'? leg:0), 2*PSCALE, 6*PSCALE);

    // BODY
    ctx.fillStyle = c.shirtDark;
    ctx.fillRect(x + 3*PSCALE, y + 8*PSCALE, 10*PSCALE, 9*PSCALE);
    ctx.fillStyle = c.shirt;
    ctx.fillRect(x + 4*PSCALE, y + 8*PSCALE, 8*PSCALE, 7*PSCALE);

    // ARMS
    const armSwing = Math.sin(f * Math.PI / 2) * 2 * PSCALE;
    ctx.fillStyle = c.shirt;
    ctx.fillRect(x + 1*PSCALE, y + 9*PSCALE + (state==='walk'? armSwing:0), 3*PSCALE, 6*PSCALE);
    ctx.fillRect(x + 12*PSCALE, y + 9*PSCALE - (state==='walk'? armSwing:0), 3*PSCALE, 6*PSCALE);
    // Hands
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 1*PSCALE, y + 14*PSCALE + (state==='walk'? armSwing:0), 3*PSCALE, 2*PSCALE);
    ctx.fillRect(x + 12*PSCALE, y + 14*PSCALE - (state==='walk'? armSwing:0), 3*PSCALE, 2*PSCALE);

    // NECK
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 6*PSCALE, y + 5*PSCALE, 4*PSCALE, 4*PSCALE);

    // HEAD
    ctx.fillStyle = c.skin;
    ctx.fillRect(x + 4*PSCALE, y + 1*PSCALE, 8*PSCALE, 7*PSCALE);

    // FACE DETAILS
    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 5*PSCALE, y + 3*PSCALE, 2*PSCALE, 2*PSCALE);
    ctx.fillRect(x + 9*PSCALE, y + 3*PSCALE, 2*PSCALE, 2*PSCALE);
    // Mouth
    if (state === 'idle') {
      ctx.fillStyle = c.skinDark;
      ctx.fillRect(x + 6*PSCALE, y + 6*PSCALE, 4*PSCALE, 1*PSCALE);
    }

    // HAIR
    ctx.fillStyle = c.hair;
    if (playerId === 'p1') {
      // Rosa: long dark hair
      ctx.fillRect(x + 3*PSCALE, y + 0, 10*PSCALE, 3*PSCALE);
      ctx.fillRect(x + 2*PSCALE, y + 3*PSCALE, 2*PSCALE, 5*PSCALE);
      ctx.fillRect(x + 12*PSCALE, y + 3*PSCALE, 2*PSCALE, 5*PSCALE);
    } else {
      // Thomas: short hair / cap
      ctx.fillRect(x + 3*PSCALE, y + 0, 10*PSCALE, 2*PSCALE);
      ctx.fillStyle = '#7A5020'; // straw hat brim
      ctx.fillRect(x + 2*PSCALE, y + 1*PSCALE, 12*PSCALE, 1*PSCALE);
      ctx.fillStyle = '#C48030';
      ctx.fillRect(x + 3*PSCALE, y + 0, 10*PSCALE, 1*PSCALE);
    }

    // Jump pose override
    if (state === 'jump' || state === 'fall') {
      ctx.fillStyle = c.skin;
      // Bent legs
      ctx.fillStyle = c.pantsDark;
      ctx.fillRect(x + 3*PSCALE, y + 16*PSCALE, 4*PSCALE, 4*PSCALE);
      ctx.fillRect(x + 9*PSCALE, y + 16*PSCALE, 4*PSCALE, 4*PSCALE);
    }

    // Interact glow (when near something)
    if (state === 'interact') {
      ctx.fillStyle = 'rgba(255,230,100,0.4)';
      ctx.fillRect(x - PSCALE, y - PSCALE, PW + 2*PSCALE, PH + 2*PSCALE);
    }

    ctx.restore();
  }

  static drawNPC(ctx, x, y, config, animFrame) {
    const c = config.colors;
    const idle = Math.sin(animFrame * 0.05) * PSCALE * 0.5;

    ctx.save();

    // Body
    ctx.fillStyle = c.shirtDark || '#444';
    ctx.fillRect(x + 3*PSCALE, y + 8*PSCALE + idle, 10*PSCALE, 8*PSCALE);
    ctx.fillStyle = c.shirt || '#666';
    ctx.fillRect(x + 4*PSCALE, y + 8*PSCALE + idle, 8*PSCALE, 6*PSCALE);

    // Legs
    ctx.fillStyle = c.pants || '#333';
    ctx.fillRect(x + 4*PSCALE, y + 15*PSCALE + idle, 3*PSCALE, 7*PSCALE);
    ctx.fillRect(x + 9*PSCALE, y + 15*PSCALE + idle, 3*PSCALE, 7*PSCALE);

    // Shoes
    ctx.fillStyle = '#2A1800';
    ctx.fillRect(x + 3*PSCALE, y + 21*PSCALE + idle, 4*PSCALE, 3*PSCALE);
    ctx.fillRect(x + 9*PSCALE, y + 21*PSCALE + idle, 4*PSCALE, 3*PSCALE);

    // Neck
    ctx.fillStyle = c.skin || '#C4956A';
    ctx.fillRect(x + 6*PSCALE, y + 5*PSCALE + idle, 4*PSCALE, 4*PSCALE);

    // Head
    ctx.fillStyle = c.skin || '#C4956A';
    ctx.fillRect(x + 4*PSCALE, y + 1*PSCALE + idle, 8*PSCALE, 7*PSCALE);

    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 5*PSCALE, y + 3*PSCALE + idle, 2*PSCALE, 2*PSCALE);
    ctx.fillRect(x + 9*PSCALE, y + 3*PSCALE + idle, 2*PSCALE, 2*PSCALE);

    // Hair / hat
    if (c.hat) {
      ctx.fillStyle = c.hat;
      ctx.fillRect(x + 2*PSCALE, y + 0 + idle, 12*PSCALE, 3*PSCALE);
      ctx.fillStyle = c.hatDark || c.hat;
      ctx.fillRect(x + 3*PSCALE, y + 0 + idle, 10*PSCALE, 1*PSCALE);
    } else {
      ctx.fillStyle = c.hair || '#1A0A00';
      ctx.fillRect(x + 3*PSCALE, y + 0 + idle, 10*PSCALE, 3*PSCALE);
    }

    // Arms
    ctx.fillStyle = c.shirt || '#666';
    ctx.fillRect(x + 1*PSCALE, y + 9*PSCALE + idle, 3*PSCALE, 5*PSCALE);
    ctx.fillRect(x + 12*PSCALE, y + 9*PSCALE + idle, 3*PSCALE, 5*PSCALE);

    ctx.restore();
  }

  // Draw interact prompt (F / Enter key hint)
  static drawInteractPrompt(ctx, x, y, key) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - 12, y - 20, 24, 16);
    ctx.fillStyle = '#FFE066';
    ctx.font = `12px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`[${key}]`, x, y - 8);
    ctx.textAlign = 'left';
    ctx.restore();
  }

  // Draw health bar
  static drawHealthBar(ctx, x, y, hp, maxHp, color, label) {
    const w = 60, h = 6;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, (hp / maxHp) * w, h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    if (label) {
      ctx.fillStyle = '#ccc';
      ctx.font = `11px 'Courier New', monospace`;
      ctx.fillText(label, x, y - 2);
    }
  }

  // === BACKGROUND DRAWING ===

  static drawJungleBg(ctx, W, H, scrollX, layer) {
    if (layer === 0) {
      // Sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      g.addColorStop(0, '#1A3A6A');
      g.addColorStop(0.6, '#4A7A3A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else if (layer === 1) {
      // Distant mountains
      ctx.fillStyle = '#2A5020';
      const ox = (scrollX * 0.15) % W;
      for (let i = -1; i <= 2; i++) {
        const bx = i * W - ox;
        ctx.beginPath();
        ctx.moveTo(bx, H * 0.7);
        ctx.lineTo(bx + W * 0.2, H * 0.3);
        ctx.lineTo(bx + W * 0.4, H * 0.55);
        ctx.lineTo(bx + W * 0.6, H * 0.25);
        ctx.lineTo(bx + W * 0.8, H * 0.5);
        ctx.lineTo(bx + W, H * 0.7);
        ctx.closePath();
        ctx.fill();
      }
    } else if (layer === 2) {
      // Mid jungle canopy
      ctx.fillStyle = '#1A4010';
      const ox = (scrollX * 0.3) % W;
      for (let i = -1; i <= 2; i++) {
        const bx = i * W - ox;
        for (let j = 0; j < 8; j++) {
          const tx = bx + (j / 8) * W;
          const th = H * (0.4 + Math.sin(j * 2.3) * 0.15);
          ctx.beginPath();
          ctx.arc(tx, H * 0.6, W / 12, 0, Math.PI, true);
          ctx.fill();
        }
      }
    } else if (layer === 3) {
      // Near ferns / foliage
      ctx.fillStyle = '#0F2808';
      const ox = (scrollX * 0.55) % W;
      for (let i = -1; i <= 2; i++) {
        const bx = i * W - ox;
        for (let j = 0; j < 6; j++) {
          const tx = bx + (j / 6) * W + 20;
          ctx.fillRect(tx, H * 0.72, 30, H * 0.3);
          // Leaf
          ctx.beginPath();
          ctx.ellipse(tx + 15, H * 0.72, 20, 8, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  static drawCitySkyline(ctx, W, H, scrollX, year) {
    // Panama City era skyline
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0A1030');
    g.addColorStop(1, '#1A2050');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const ox = (scrollX * 0.2) % W;
    ctx.fillStyle = '#0A0A20';
    for (let i = -1; i <= 2; i++) {
      const bx = i * W - ox;
      // Buildings
      const buildings = [
        { x: 0.05, w: 0.06, h: 0.5 },
        { x: 0.12, w: 0.04, h: 0.65 },
        { x: 0.18, w: 0.08, h: 0.45 },
        { x: 0.28, w: 0.05, h: 0.7 },
        { x: 0.35, w: 0.07, h: 0.4 },
        { x: 0.44, w: 0.04, h: 0.8 },
        { x: 0.5, w: 0.06, h: 0.55 },
        { x: 0.58, w: 0.09, h: 0.35 },
        { x: 0.7, w: 0.05, h: 0.6 },
        { x: 0.78, w: 0.08, h: 0.45 },
        { x: 0.88, w: 0.06, h: 0.7 },
      ];
      buildings.forEach(b => {
        ctx.fillRect(
          Math.floor(bx + b.x * W), Math.floor(H * (1 - b.h)),
          Math.floor(b.w * W), Math.floor(H * b.h)
        );
        // Windows
        ctx.fillStyle = 'rgba(255,220,100,0.3)';
        for (let wy = 0; wy < Math.floor(b.h * H / 12); wy++) {
          for (let wx = 0; wx < Math.floor(b.w * W / 8); wx++) {
            if (Math.random() > 0.4) {
              ctx.fillRect(
                Math.floor(bx + b.x * W + 2 + wx * 8),
                Math.floor(H * (1 - b.h) + 4 + wy * 12),
                4, 6
              );
            }
          }
        }
        ctx.fillStyle = '#0A0A20';
      });
    }
  }

  static drawConstructionBg(ctx, W, H, scrollX) {
    // Canal construction site
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#7A6040');
    g.addColorStop(0.5, '#5A4020');
    g.addColorStop(1, '#3A2810');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Dust / haze
    ctx.fillStyle = 'rgba(200,150,80,0.2)';
    ctx.fillRect(0, 0, W, H * 0.4);

    // Distant cut walls
    const ox = (scrollX * 0.25) % W;
    for (let i = -1; i <= 2; i++) {
      const bx = i * W - ox;
      ctx.fillStyle = '#6A5030';
      ctx.fillRect(bx, 0, 20, H * 0.8);
      ctx.fillRect(bx + W - 20, 0, 20, H * 0.8);

      // Horizontal strata lines (geology)
      ctx.fillStyle = '#7A6840';
      for (let s = 0; s < 8; s++) {
        ctx.fillRect(bx, H * (0.1 + s * 0.1), W, 3);
      }

      // Steam shovel silhouette
      ctx.fillStyle = '#2A1A08';
      const sx = bx + W * 0.3;
      const sy = H * 0.5;
      ctx.fillRect(sx, sy, 60, 30);  // body
      ctx.fillRect(sx + 50, sy - 20, 8, 20); // cab
      ctx.fillRect(sx - 10, sy + 25, 80, 10); // track
      // Boom
      ctx.save();
      ctx.translate(sx + 20, sy);
      ctx.rotate(-0.4);
      ctx.fillRect(0, -50, 8, 55);
      ctx.restore();
    }
  }

  static drawHospitalBg(ctx, W, H, scrollX) {
    // Hospital tents
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#C8A870');
    g.addColorStop(1, '#8A6840');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const ox = (scrollX * 0.3) % W;
    for (let i = -1; i <= 2; i++) {
      const bx = i * W - ox;
      // Tents
      for (let t = 0; t < 5; t++) {
        const tx = bx + t * (W / 5) + 10;
        const ty = H * 0.45;
        ctx.fillStyle = '#E8E0C8';
        ctx.beginPath();
        ctx.moveTo(tx, ty + 60);
        ctx.lineTo(tx + 30, ty);
        ctx.lineTo(tx + 60, ty + 60);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#A89870';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Red cross
        ctx.fillStyle = '#CC2222';
        ctx.fillRect(tx + 25, ty + 20, 10, 3);
        ctx.fillRect(tx + 28, ty + 17, 4, 9);
      }
    }

    // Mosquito hint particles (just dots)
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    for (let m = 0; m < 20; m++) {
      const mx = ((scrollX * 0.8 + m * 37) % W);
      const my = H * 0.2 + Math.sin(m * 1.3 + scrollX * 0.01) * H * 0.2;
      ctx.fillRect(mx, my, 2, 2);
    }
  }

  static drawVillageBg(ctx, W, H, scrollX) {
    // Flooding village
    const waterLevel = H * 0.65;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#87CEEB');
    g.addColorStop(0.6, '#6AB0A0');
    g.addColorStop(1, '#2A8080');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Water surface
    ctx.fillStyle = 'rgba(40,120,180,0.6)';
    ctx.fillRect(0, waterLevel, W, H);

    // Submerged village elements
    ctx.fillStyle = 'rgba(40,60,40,0.5)';
    const ox = (scrollX * 0.3) % W;
    for (let i = -1; i <= 2; i++) {
      const bx = i * W - ox;
      // Partially submerged houses
      for (let h = 0; h < 4; h++) {
        const hx = bx + h * (W / 4) + 20;
        const hy = waterLevel - 20 + h * 15;
        ctx.fillStyle = '#5A3A20';
        ctx.fillRect(hx, hy, 40, 50);
        ctx.fillStyle = '#7A5030';
        ctx.beginPath();
        ctx.moveTo(hx - 5, hy);
        ctx.lineTo(hx + 20, hy - 20);
        ctx.lineTo(hx + 45, hy);
        ctx.closePath();
        ctx.fill();
      }
      // Tree tops sticking out
      ctx.fillStyle = '#1A5010';
      for (let t = 0; t < 3; t++) {
        ctx.beginPath();
        ctx.arc(bx + t * (W / 3) + 60, waterLevel - 10, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
