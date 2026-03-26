/**
 * DialogueSystem — NPC conversation engine
 * Supports linear nodes, choice nodes, narration nodes, and game triggers
 */
class DialogueSystem {
  constructor() {
    this.active = false;
    this.nodes = {};
    this.currentNode = null;
    this.typedText = '';
    this.targetText = '';
    this.typeTimer = 0;
    this.typeSpeed = 0.03; // seconds per character
    this.typeFinished = false;
    this.onComplete = null;
    this.pendingTriggers = [];
    this.flags = {};
    this.history = [];
    this.speakerName = '';
    this.portraitId = null;
    this.choices = [];
    this.selectedChoice = -1;
    this._waitingForAdvance = false;
    this._advanceBuffered = false;
  }

  // Load a dialogue graph (array of node objects)
  loadGraph(nodes) {
    this.nodes = {};
    nodes.forEach(n => { this.nodes[n.id] = n; });
  }

  // Start dialogue from a node id
  begin(startNodeId, onComplete) {
    this.active = true;
    this.onComplete = onComplete || null;
    this.history = [];
    this._stepToNode(startNodeId);
  }

  _stepToNode(nodeId) {
    const node = this.nodes[nodeId];
    if (!node) { this.end(); return; }

    this.currentNode = node;
    this.choices = [];
    this.selectedChoice = -1;
    this.typedText = '';
    this.typeTimer = 0;
    this.typeFinished = false;
    this._waitingForAdvance = false;

    // Apply triggers
    if (node.triggers) {
      node.triggers.forEach(t => {
        if (t.type === 'set_flag') this.flags[t.key] = t.value !== undefined ? t.value : true;
      });
    }

    // Speaker setup
    this.speakerName = node.speakerName || '';
    this.portraitId = node.speakerId || null;

    if (node.type === 'narration') {
      this.targetText = node.text;
      this.typedText = '';
    } else if (node.type === 'dialogue') {
      this.targetText = node.text;
      this.typedText = '';
    } else if (node.type === 'choice') {
      this.targetText = node.text || 'What do you say?';
      this.choices = node.choices || [];
      this.selectedChoice = 0;
    } else if (node.type === 'auto') {
      // auto-advance after brief pause
      this.targetText = '';
      this.typedText = '';
      this.typeFinished = true;
    }
  }

  // Call this each frame
  update(dt, p1Input, p2Input) {
    if (!this.active) return;

    const advance = p1Input.justAction || p2Input.justAction;

    // Typewriter effect
    if (!this.typeFinished) {
      this.typeTimer += dt;
      const chars = Math.floor(this.typeTimer / this.typeSpeed);
      if (chars >= this.targetText.length) {
        this.typedText = this.targetText;
        this.typeFinished = true;
      } else {
        this.typedText = this.targetText.substring(0, chars);
      }
      // Speed-up on key press
      if (advance && !this.typeFinished) {
        this.typedText = this.targetText;
        this.typeFinished = true;
        return;
      }
    }

    if (!this.typeFinished) return;

    const node = this.currentNode;
    if (!node) return;

    if (node.type === 'choice') {
      // Navigate choices
      if (p1Input.justJump || p2Input.justJump) {
        this.selectedChoice = Math.max(0, this.selectedChoice - 1);
      }
      if (p1Input.justDown || p2Input.justDown) {
        this.selectedChoice = Math.min(this.choices.length - 1, this.selectedChoice + 1);
      }
      if (advance && this.selectedChoice >= 0) {
        const choice = this.choices[this.selectedChoice];
        this.history.push({ nodeId: node.id, choiceIdx: this.selectedChoice });
        if (choice.triggers) {
          choice.triggers.forEach(t => {
            if (t.type === 'set_flag') this.flags[t.key] = true;
          });
        }
        this._stepToNode(choice.nextNodeId);
      }
    } else if (node.type === 'narration') {
      if (advance || (node.autoAdvance && this.typeFinished)) {
        this._advance();
      }
    } else if (node.type === 'dialogue') {
      if (advance) {
        this.history.push({ nodeId: node.id });
        this._advance();
      }
    } else if (node.type === 'auto') {
      this._advance();
    }
  }

  _advance() {
    const node = this.currentNode;
    if (node.nextNodeId) {
      this._stepToNode(node.nextNodeId);
    } else {
      this.end();
    }
  }

  end() {
    this.active = false;
    this.currentNode = null;
    if (this.onComplete) {
      const cb = this.onComplete;
      this.onComplete = null;
      cb();
    }
  }

  // Check a flag
  flag(key) { return !!this.flags[key]; }
}

// ──────────────────────────────────────────────────────────────────────────────
// DialogueRenderer — draws the dialogue box on canvas
// ──────────────────────────────────────────────────────────────────────────────
class DialogueRenderer {
  constructor(renderer) {
    this.r = renderer;
  }

  draw(ctx, dialogue, W, H) {
    if (!dialogue.active || !dialogue.currentNode) return;
    const node = dialogue.currentNode;

    const BOX_H = 140;
    const BOX_Y = H - BOX_H - 8;
    const PAD = 14;
    const PORTRAIT_SIZE = 88;

    // Background
    ctx.fillStyle = 'rgba(5,10,20,0.92)';
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(8, BOX_Y, W - 16, BOX_H, 4);
    ctx.fill();
    ctx.stroke();

    // Portrait box
    if (dialogue.portraitId) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeStyle = '#C8A840';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(PAD, BOX_Y + (BOX_H - PORTRAIT_SIZE) / 2, PORTRAIT_SIZE, PORTRAIT_SIZE, 3);
      ctx.fill();
      ctx.stroke();
      this._drawPortrait(ctx, dialogue.portraitId, PAD, BOX_Y + (BOX_H - PORTRAIT_SIZE) / 2, PORTRAIT_SIZE);
    }

    // Speaker name
    const textX = dialogue.portraitId ? PAD + PORTRAIT_SIZE + 10 : PAD + 4;
    const maxTextW = W - 16 - textX - PAD;

    if (dialogue.speakerName) {
      ctx.fillStyle = '#E8C860';
      ctx.font = `bold 13px 'Courier New', monospace`;
      ctx.fillText(dialogue.speakerName.toUpperCase(), textX, BOX_Y + 18);
    }

    // Dialogue text
    ctx.fillStyle = '#F0EAD0';
    ctx.font = `13px 'Courier New', monospace`;
    const textY = dialogue.speakerName ? BOX_Y + 36 : BOX_Y + 22;
    this._drawWrappedText(ctx, dialogue.typedText, textX, textY, maxTextW, 17);

    // Choices
    if (node.type === 'choice' && dialogue.typeFinished) {
      ctx.font = `12px 'Courier New', monospace`;
      let choiceY = BOX_Y + 50;
      dialogue.choices.forEach((ch, i) => {
        if (i === dialogue.selectedChoice) {
          ctx.fillStyle = '#E8C860';
          ctx.fillText('▶', textX - 10, choiceY);
        }
        ctx.fillStyle = i === dialogue.selectedChoice ? '#FFE090' : '#A89860';
        const linesDrawn = this._drawWrappedText(ctx, ch.text, textX, choiceY, maxTextW, 16);
        choiceY += linesDrawn * 16 + 4;
      });
    }

    // Advance indicator
    if (dialogue.typeFinished && node.type !== 'choice') {
      const flash = Math.floor(Date.now() / 400) % 2 === 0;
      if (flash) {
        ctx.fillStyle = '#C8A840';
        ctx.font = `12px 'Courier New', monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('[F / Enter]', W - PAD, BOX_Y + BOX_H - 8);
        ctx.textAlign = 'left';
      }
    }

    // Narration style — different box
    if (node.type === 'narration') {
      // Already drawn above, just different style indicator
    }
  }

  _drawWrappedText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    let lineCount = 1;
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, curY);
        line = word;
        curY += lineH;
        lineCount++;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, curY);
    return lineCount;
  }

  _drawPortrait(ctx, speakerId, x, y, size) {
    // Draw character portrait based on id
    const portraits = {
      'rosa':        { skin:'#C4956A', hair:'#1A0A00', shirt:'#CC4444', hat: null, label:'R' },
      'thomas':      { skin:'#5C3A1E', hair:'#0A0500', shirt:'#D4A030', hat:'#C48030', label:'T' },
      'de_lesseps':  { skin:'#D4A070', hair:'#8B6914', shirt:'#1A3060', hat:'#1A1A1A', label:'L' },
      'gorgas':      { skin:'#D4B090', hair:'#7A5A30', shirt:'#4A6A30', hat:'#3A5020', label:'G' },
      'finlay':      { skin:'#C4956A', hair:'#2C1810', shirt:'#E8E0C0', hat: null, label:'F' },
      'goethals':    { skin:'#D4B090', hair:'#8A7050', shirt:'#4A4A60', hat:'#3A3A50', label:'Gt' },
      'torrijos':    { skin:'#8A6040', hair:'#1A0A00', shirt:'#3A6A30', hat:'#2A5020', label:'To' },
      'moscoso':     { skin:'#C4956A', hair:'#1A0A00', shirt:'#AA2222', hat: null, label:'M' },
      'narrator':    { skin: null, hair: null, shirt: null, hat: null, label:'N' },
      'elder':       { skin:'#A07850', hair:'#FFFFFF', shirt:'#6A4A20', hat: null, label:'E' },
      'worker':      { skin:'#5C3A1E', hair:'#0A0500', shirt:'#887840', hat:'#7A6020', label:'W' },
      'supervisor':  { skin:'#D4B090', hair:'#8A6030', shirt:'#4A3A20', hat:'#3A2A10', label:'S' },
    };
    const p = portraits[speakerId] || portraits['worker'];

    const cx = x + size / 2;
    const cy = y + size / 2;

    // Background
    ctx.fillStyle = '#1A1A2A';
    ctx.fillRect(x, y, size, size);

    if (!p.skin) {
      // Narrator — just text
      ctx.fillStyle = '#C8A840';
      ctx.font = `bold 20px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('★', cx, cy + 4);
      ctx.textAlign = 'left';
      return;
    }

    // Body
    ctx.fillStyle = p.shirt;
    ctx.fillRect(x + 12, y + 38, 48, 30);

    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(x + 26, y + 30, 20, 12);

    // Head
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    if (p.hair) {
      ctx.fillStyle = p.hair;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 18, 18, 10, 0, Math.PI, 0);
      ctx.fill();
    }

    // Hat
    if (p.hat) {
      ctx.fillStyle = p.hat;
      ctx.fillRect(x + 12, y + 14, 48, 8);
      ctx.fillRect(x + 20, y + 6, 32, 14);
    }

    // Eyes
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(cx - 6, cy - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 6, cy - 4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(cx - 7, cy - 5, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 5, cy - 5, 1.5, 0, Math.PI * 2); ctx.fill();

    // Mouth
    ctx.strokeStyle = '#5A2A10';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Label outline
    ctx.strokeStyle = '#C8A840';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);
  }
}
