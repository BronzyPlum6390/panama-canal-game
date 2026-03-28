'use strict';

/**
 * Language system tests
 *
 *   1. Every UI string key returns a non-empty value for 'en' and 'es'
 *   2. cycle() rotates en → es → bilingual → en
 *   3. txt() / txt2() return the right value per language mode
 *   4. chapterEs() returns all expected ES fields for all 7 chapter IDs
 *   5. label getter reflects the current language in the active language
 *   6. LANG starts in 'en' mode
 */

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

// ── Load Lang.js into a sandbox ───────────────────────────────────────────────
function loadLang() {
  const src = fs.readFileSync(path.resolve(__dirname, '../src/systems/Lang.js'), 'utf8');
  const ctx = vm.createContext({ window: {}, Math, console });
  const wrapped = `(function() {\n${src}\n}).call(this)`;
  vm.runInContext(wrapped, ctx);
  // window.LANG is set inside the script via window.LANG = new LangSystem()
  return ctx.window.LANG;
}

// ── All UI string keys that must be present ───────────────────────────────────
// (mirrors the keys defined in UI_STRINGS in Lang.js)
const EXPECTED_KEYS = [
  'title.main', 'title.sub', 'title.years', 'title.coop',
  'title.p1ctrl', 'title.p2ctrl', 'title.start',
  'pause.title', 'pause.resume', 'pause.restart', 'pause.controls',
  'pause.quit', 'pause.music', 'pause.lang', 'pause.nav',
  'music.western', 'music.latin', 'music.off',
  'lang.en', 'lang.es', 'lang.bilingual',
  'hud.controls',
  'ch.complete', 'ch.continue',
  'narr.chapter', 'narr.skip', 'narr.hist',
  'ctrl.p1', 'ctrl.p2', 'ctrl.movelr', 'ctrl.jump', 'ctrl.duck',
  'ctrl.interact', 'ctrl.arrows', 'ctrl.up', 'ctrl.down', 'ctrl.enter', 'ctrl.esc',
  'exit.continue',
  'game.complete',
];

const CHAPTER_IDS = ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07'];
const CHAPTER_ES_FIELDS = ['title_es', 'subtitle_es', 'body_es', 'footnote_es'];

// ── Tests ─────────────────────────────────────────────────────────────────────

let LANG;

beforeEach(() => {
  // Fresh instance for each test
  LANG = loadLang();
});

test('starts in English mode', () => {
  expect(LANG.lang).toBe('en');
});

test('all UI string keys return non-empty English strings', () => {
  LANG.setLang('en');
  const missing = EXPECTED_KEYS.filter(k => {
    const v = LANG.t(k);
    return !v || v === k; // returns key itself = not found
  });
  if (missing.length > 0) {
    throw new Error(`Missing EN translations for: ${missing.join(', ')}`);
  }
});

test('all UI string keys return non-empty Spanish strings', () => {
  LANG.setLang('es');
  const missing = EXPECTED_KEYS.filter(k => {
    const v = LANG.t(k);
    return !v || v === k;
  });
  if (missing.length > 0) {
    throw new Error(`Missing ES translations for: ${missing.join(', ')}`);
  }
});

test('cycle() rotates en → es → bilingual → en', () => {
  expect(LANG.lang).toBe('en');
  LANG.cycle();
  expect(LANG.lang).toBe('es');
  LANG.cycle();
  expect(LANG.lang).toBe('bilingual');
  LANG.cycle();
  expect(LANG.lang).toBe('en');
});

describe('txt() inline helper', () => {
  test('returns English string in en mode', () => {
    LANG.setLang('en');
    expect(LANG.txt('Hello', 'Hola')).toBe('Hello');
  });

  test('returns Spanish string in es mode', () => {
    LANG.setLang('es');
    expect(LANG.txt('Hello', 'Hola')).toBe('Hola');
  });

  test('returns English string in bilingual mode (primary)', () => {
    LANG.setLang('bilingual');
    expect(LANG.txt('Hello', 'Hola')).toBe('Hello');
  });

  test('falls back to English when es arg is missing', () => {
    LANG.setLang('es');
    expect(LANG.txt('Hello')).toBe('Hello');
  });
});

describe('txt2() secondary helper', () => {
  test('returns null in en mode', () => {
    LANG.setLang('en');
    expect(LANG.txt2('Hello', 'Hola')).toBeNull();
  });

  test('returns null in es mode', () => {
    LANG.setLang('es');
    expect(LANG.txt2('Hello', 'Hola')).toBeNull();
  });

  test('returns Spanish in bilingual mode', () => {
    LANG.setLang('bilingual');
    expect(LANG.txt2('Hello', 'Hola')).toBe('Hola');
  });

  test('returns null in bilingual when es arg is missing', () => {
    LANG.setLang('bilingual');
    expect(LANG.txt2('Hello')).toBeNull();
  });
});

describe('label getter', () => {
  test('returns English label in en mode', () => {
    LANG.setLang('en');
    expect(LANG.label).toBe('ENGLISH');
  });

  test('returns Spanish label in es mode', () => {
    LANG.setLang('es');
    // In es mode t('lang.es') returns 'ESPAÑOL'
    expect(LANG.label).toBe('ESPAÑOL');
  });

  test('returns bilingual label in bilingual mode', () => {
    LANG.setLang('bilingual');
    expect(LANG.label).toBe('BILINGUAL');
  });
});

describe.each(CHAPTER_IDS)('chapterEs("%s")', (id) => {
  test('returns all required ES fields', () => {
    const es = LANG.chapterEs(id);
    const missing = CHAPTER_ES_FIELDS.filter(f => !es[f] || es[f].trim() === '');
    if (missing.length > 0) {
      throw new Error(`Chapter "${id}" missing ES fields: ${missing.join(', ')}`);
    }
  });

  test('ES body is different from EN (actually translated, not a copy)', () => {
    // This catches accidentally duplicated EN text in the ES slot.
    // We only check body_es since it's the most substantial field.
    const es = LANG.chapterEs(id);
    // Spanish text typically contains accented characters or Spanish words.
    // Simple heuristic: must contain at least one Spanish-specific character OR
    // differ from a known English word. Check for accented chars as proxy.
    const spanishMarkers = /[áéíóúüñ¿¡]/i;
    expect(spanishMarkers.test(es.body_es)).toBe(true);
  });
});
