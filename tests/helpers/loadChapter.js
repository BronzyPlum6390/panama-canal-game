/**
 * loadChapter — builds a chapter instance inside a vm sandbox,
 * running the real game source files so we get real class behaviour.
 */
'use strict';

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const src  = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), 'utf8');

// Minimal browser stubs that the source files need at eval time.
// draw() / update() are never called in tests so canvas stubs are thin.
function makeContext() {
  const ctx = {
    // Browser globals
    window: {},
    Math,
    Date,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    console,
    setTimeout: () => {},
    clearTimeout: () => {},
    requestAnimationFrame: () => {},
    performance: { now: () => 0 },

    // Canvas stub — only needs to not throw when draw() is called accidentally
    CanvasRenderingContext2D: class {},

    // Sprites — referenced in NPC/Platform draw; never called during build
    Sprites: {
      drawPlayer: () => {},
      drawNPC: () => {},
      drawInteractPrompt: () => {},
      drawBackground: () => {},
    },

    // Input/Camera/Renderer stubs — not needed during chapter.build()
    InputManager: class { update(){} },
    Camera: class { constructor(){} worldToScreen(){ return {sx:0,sy:0}; } follow(){} setBounds(){} setPosition(){} },
    Renderer: class { constructor(){} },

    // Dialogue / Narration / UI — not needed during build
    DialogueSystem: class { constructor(){} },
    DialogueRenderer: class { constructor(){} },
    NarrationSystem: class { constructor(){} active=false; update(){} draw(){} push(){} },
    UI: class { constructor(){} },
    // Lang stub — t() returns key, no translations needed for structural tests
    LANG: { lang: 'en', t: (k) => k, txt: (en) => en, txt2: () => null, chapterEs: () => ({}) },
  };

  vm.createContext(ctx);

  // In Node vm, `class Foo {}` is lexically scoped and does NOT become a
  // property of the sandbox context. Fix: wrap each file so class declarations
  // are explicitly assigned to `this` (the sandbox).
  function evalFile(file) {
    const code = src(file);
    // Extract top-level class names so we can assign them to the context
    const classNames = [...code.matchAll(/^class\s+(\w+)/gm)].map(m => m[1]);
    const assignments = classNames.map(n => `try { this['${n}'] = ${n}; } catch(e) {}`).join('\n');
    const wrapped = `(function() {\n${code}\n${assignments}\n}).call(this)`;
    try {
      vm.runInContext(wrapped, ctx, { filename: file });
    } catch (e) {
      throw new Error(`Failed to eval ${file}: ${e.message}`);
    }
  }

  // Eval real source files in load order (matches index.html)
  evalFile('src/engine/Physics.js');      // defines PHYSICS, PhysicsBody, PhysicsWorld
  evalFile('src/entities/Entity.js');     // defines Entity
  evalFile('src/entities/Player.js');     // defines Player
  evalFile('src/entities/NPC.js');        // defines NPC
  evalFile('src/entities/Platform.js');   // defines Platform
  evalFile('src/entities/Puzzles.js');    // defines Gate, PressurePlate, Crank, RopePull, Lever, etc.
  evalFile('src/entities/Hazard.js');     // defines Hazard
  evalFile('src/chapters/Chapter.js');    // defines Chapter base class

  // PW and PH are defined in Sprites.js which we skip (too many canvas deps).
  // Hard-code them here to match the game's values.
  vm.runInContext('(function() { this.PW = 48; this.PH = 72; }).call(this)', ctx);

  return ctx;
}

/**
 * Load and build a chapter.
 * @param {number} num  1–7
 * @returns chapter instance after build()
 */
function evalInContext(ctx, file) {
  const code = src(file);
  const classNames = [...code.matchAll(/^class\s+(\w+)/gm)].map(m => m[1]);
  const assignments = classNames.map(n => `this['${n}'] = ${n};`).join('\n');
  const wrapped = `(function() {\n${code}\n${assignments}\n}).call(this)`;
  try {
    vm.runInContext(wrapped, ctx, { filename: file });
  } catch (e) {
    throw new Error(`Failed to eval ${file}: ${e.message}`);
  }
}

function loadChapter(num) {
  const ctx = makeContext();
  evalInContext(ctx, `src/chapters/Chapter${num}.js`);

  const ChapterClass = vm.runInContext(`this['Chapter${num}']`, ctx);
  if (!ChapterClass) throw new Error(`Chapter${num} class not found in context`);

  const chapter = new ChapterClass();

  // Mock physics world — statics are tracked so BFS can ignore them
  const mockPhysics = {
    statics: [],
    addStatic(body) { this.statics.push(body); },
    removeStatic(body) { this.statics = this.statics.filter(b => b !== body); },
    addBody() {},
    removeBody() {},
    clear() { this.statics = []; },
  };

  chapter.build(mockPhysics);
  return chapter;
}

module.exports = { loadChapter };
