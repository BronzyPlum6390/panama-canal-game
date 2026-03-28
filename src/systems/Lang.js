/**
 * LangSystem — English / Español / Bilingual support
 *
 * Usage:
 *   LANG.t('pause.resume')          → 'RESUME' or 'CONTINUAR'
 *   LANG.txt('Hello', 'Hola')       → primary string for current lang
 *   LANG.txt2('Hello', 'Hola')      → secondary string (bilingual only), or null
 *   LANG.setLang('es')              → change language
 *   LANG.cycle()                    → rotate en → es → bilingual → en
 *   LANG.label                      → 'ENGLISH' / 'ESPAÑOL' / 'BILINGUAL'
 */

const UI_STRINGS = {
  // ── Title ─────────────────────────────────────────────────────────────────
  'title.main':     { en: 'THROUGH THE CUT',                       es: 'A TRAVÉS DEL CORTE' },
  'title.sub':      { en: 'A PANAMA CANAL STORY',                  es: 'UNA HISTORIA DEL CANAL DE PANAMÁ' },
  'title.years':    { en: '1881 — 1999',                            es: '1881 — 1999' },
  'title.coop':     { en: 'A 2-PLAYER CO-OP STORY',                es: 'HISTORIA COOPERATIVA PARA 2 JUGADORES' },
  'title.p1ctrl':   { en: 'PLAYER 1: WASD + F',                    es: 'JUGADOR 1: WASD + F' },
  'title.p2ctrl':   { en: 'PLAYER 2: ARROWS + ENTER',              es: 'JUGADOR 2: FLECHAS + ENTER' },
  'title.start':    { en: 'PRESS F OR ENTER TO BEGIN',             es: 'PRESIONA F O ENTER PARA COMENZAR' },
  // ── Pause ─────────────────────────────────────────────────────────────────
  'pause.title':    { en: 'PAUSED',                                 es: 'PAUSA' },
  'pause.resume':   { en: 'RESUME',                                 es: 'CONTINUAR' },
  'pause.restart':  { en: 'RESTART CHAPTER',                       es: 'REINICIAR CAPÍTULO' },
  'pause.controls': { en: 'CONTROLS',                              es: 'CONTROLES' },
  'pause.quit':     { en: 'QUIT TO TITLE',                         es: 'SALIR AL MENÚ' },
  'pause.music':    { en: 'MUSIC',                                  es: 'MÚSICA' },
  'pause.lang':     { en: 'LANGUAGE',                              es: 'IDIOMA' },
  'pause.nav':      { en: '↑↓ navigate  F/Enter select',           es: '↑↓ navegar  F/Enter seleccionar' },
  // ── Music labels ──────────────────────────────────────────────────────────
  'music.western':  { en: 'WESTERN',                               es: 'OCCIDENTAL' },
  'music.latin':    { en: 'LATIN',                                  es: 'LATINA' },
  'music.off':      { en: 'OFF',                                   es: 'APAGADA' },
  // ── Language labels ───────────────────────────────────────────────────────
  'lang.en':        { en: 'ENGLISH',                               es: 'INGLÉS' },
  'lang.es':        { en: 'ESPAÑOL',                               es: 'ESPAÑOL' },
  'lang.bilingual': { en: 'BILINGUAL',                             es: 'BILINGÜE' },
  // ── HUD ───────────────────────────────────────────────────────────────────
  'hud.controls':   { en: 'P1: WASD+F   P2: ARROWS+ENTER   ESC: PAUSE',
                      es: 'J1: WASD+F   J2: FLECHAS+ENTER   ESC: PAUSA' },
  // ── Chapter complete ──────────────────────────────────────────────────────
  'ch.complete':    { en: 'CHAPTER COMPLETE',                      es: 'CAPÍTULO COMPLETO' },
  'ch.continue':    { en: '[F/Enter] Continue',                    es: '[F/Enter] Continuar' },
  // ── Narration / chapter cards ─────────────────────────────────────────────
  'narr.chapter':   { en: 'CHAPTER',                               es: 'CAPÍTULO' },
  'narr.skip':      { en: '[F or Enter to continue]',              es: '[F o Enter para continuar]' },
  'narr.hist':      { en: 'HISTORICAL NOTE',                       es: 'NOTA HISTÓRICA' },
  // ── Controls overlay ──────────────────────────────────────────────────────
  'ctrl.p1':        { en: 'PLAYER 1 (ROSA)',                       es: 'JUGADOR 1 (ROSA)' },
  'ctrl.p2':        { en: 'PLAYER 2 (THOMAS)',                     es: 'JUGADOR 2 (THOMAS)' },
  'ctrl.movelr':    { en: 'A/D — Move Left/Right',                 es: 'A/D — Moverse izq./der.' },
  'ctrl.jump':      { en: 'W — Jump',                              es: 'W — Saltar' },
  'ctrl.duck':      { en: 'S — Crouch/Duck',                       es: 'S — Agacharse' },
  'ctrl.interact':  { en: 'F — Interact / Use',                    es: 'F — Interactuar / Usar' },
  'ctrl.arrows':    { en: 'LEFT/RIGHT — Move',                     es: 'FLECHAS — Moverse' },
  'ctrl.up':        { en: 'UP — Jump',                             es: 'ARRIBA — Saltar' },
  'ctrl.down':      { en: 'DOWN — Crouch/Duck',                    es: 'ABAJO — Agacharse' },
  'ctrl.enter':     { en: 'Enter — Interact / Use',                es: 'Enter — Interactuar / Usar' },
  'ctrl.esc':       { en: 'ESC — Pause',                           es: 'ESC — Pausa' },
  // ── Exit prompt ───────────────────────────────────────────────────────────
  'exit.continue':  { en: '→ CONTINUE',                            es: '→ CONTINUAR' },
  // ── Game complete ─────────────────────────────────────────────────────────
  'game.complete':  { en: 'THE CANAL IS OPEN',                     es: 'EL CANAL ESTÁ ABIERTO' },
};

// ── Spanish translations for all 7 chapter intro cards ───────────────────────
// Keys match chapter id (e.g. 'ch01')
const CHAPTER_ES = {
  ch01: {
    title_es:    'Le Grand Canal',
    subtitle_es: 'El Sueño Francés',
    body_es:     'Panamá. La compañía francesa del canal ha llegado, liderada por Ferdinand de Lesseps — constructor del Canal de Suez. Él cree que Panamá es simplemente otro problema de ingeniería. Nunca ha visto la selva en temporada de lluvias.',
    footnote_es: 'La Compañía Francesa del Canal de Panamá declaró quiebra en 1889. Más de 22,000 trabajadores murieron, la mayoría de fiebre amarilla y malaria. Ferdinand de Lesseps fue condenado por fraude. Su sueño se convirtió en un monumento a la soberbia.',
  },
  ch02: {
    title_es:    'La Fièvre Jaune',
    subtitle_es: 'Los Años de la Fiebre Amarilla',
    body_es:     'Tres años en el proyecto francés. Los trabajadores mueren por cientos. Nadie sabe por qué. Un médico cubano llamado Carlos Finlay tiene una teoría. Nadie lo escucha.',
    footnote_es: 'El Dr. Carlos Finlay, médico cubano-estadounidense, identificó el mosquito vector de la fiebre amarilla en 1881 y fue ignorado por los franceses durante 20 años. Cuando los americanos finalmente lo escucharon en 1904, la fiebre amarilla fue erradicada de la zona del canal en menos de 18 meses.',
  },
  ch03: {
    title_es:    'Ambición Americana',
    subtitle_es: 'Llegan los Americanos',
    body_es:     'Los franceses han fracasado. Estados Unidos, bajo el presidente Theodore Roosevelt, compra los restos del proyecto por $40 millones. Panamá, recién independizada de Colombia con ayuda americana, firma un tratado que otorga a EE.UU. el control de la zona del canal — para siempre.',
    footnote_es: 'Panamá declaró independencia de Colombia el 3 de noviembre de 1903. Un buque de guerra estadounidense impidió que tropas colombianas desembarcaran para sofocar la revuelta. 15 días después, EE.UU. y Panamá firmaron un tratado que daba a América el control de la zona del canal — a perpetuidad. Panamá recibió $10 millones y un pago anual de $250,000.',
  },
  ch04: {
    title_es:    'Oro y Plata',
    subtitle_es: 'El Sistema de Dos Niveles',
    body_es:     'En el apogeo de la construcción, 45,000 trabajadores laboran en el canal. EE.UU. los ha dividido en dos clases: la Nómina de Oro y la Nómina de Plata. La diferencia no es de habilidad ni experiencia. Es de raza.',
    footnote_es: 'La división Nómina de Oro / Nómina de Plata fue política oficial del gobierno de EE.UU. de 1904 a 1955. Unos 31,000 trabajadores fueron clasificados como Nómina de Plata en el apogeo de la construcción — principalmente trabajadores negros de las Antillas. Construyeron la mayor parte del canal pero recibieron salarios más bajos, peores viviendas y tenían prohibido el acceso a las instalaciones de la Nómina de Oro.',
  },
  ch05: {
    title_es:    'Corte Culebra',
    subtitle_es: 'El Corte',
    body_es:     'El corazón del canal: nueve millas de montaña deben ser cortadas. 100 palas de vapor trabajan día y noche. 61 millones de libras de dinamita. Y la montaña contraataca — con barro.',
    footnote_es: 'El Corte Culebra movió más de 232 millones de yardas cúbicas de tierra y roca — suficiente para construir la Gran Muralla China cuatro veces. Participaron trabajadores de 97 países. A pesar del triunfo ingenieril, los derrumbes fueron una amenaza constante. Un deslizamiento en 1907 deshizo 6 meses de trabajo en una sola noche.',
  },
  ch06: {
    title_es:    'Agua',
    subtitle_es: 'La Inundación',
    body_es:     'La presa está casi terminada. El Lago Gatún será el lago artificial más grande del mundo. Un triunfo de la ingeniería. Pero el valle de abajo aún no sabe que dejará de existir.',
    footnote_es: 'El 10 de octubre de 1913, el presidente Wilson presionó una tecla de telégrafo en Washington D.C. La carga de dinamita en el Dique de Gamboa estalló. El valle del Chagres se inundó. La creación del Lago Gatún desplazó a 6,000 personas de 12 comunidades. Muchos recibieron poca o ninguna compensación. Sus aldeas permanecen bajo el agua hasta hoy.',
  },
  ch07: {
    title_es:    'El Canal es Nuestro',
    subtitle_es: 'Nuestro Canal',
    body_es:     'El canal ha operado por 50 años. Pero la tierra pertenece a Panamá, y el canal no. El 9 de enero de 1964, estudiantes panameños deciden cambiar eso — izando una bandera.',
    footnote_es: 'El 31 de diciembre de 1999 a las 12:00 del mediodía, el Canal de Panamá fue transferido a la República de Panamá. La Autoridad del Canal de Panamá lo ha operado desde entonces con uno de los mejores historiales de seguridad de cualquier vía acuática en el mundo. El 9 de enero se celebra ahora como el Día de los Mártires — feriado nacional en Panamá.',
  },
};

// ── LangSystem ────────────────────────────────────────────────────────────────
class LangSystem {
  constructor() {
    this.lang = 'en'; // 'en' | 'es' | 'bilingual'
  }

  setLang(l) { this.lang = l; }

  cycle() {
    const order = ['en', 'es', 'bilingual'];
    const i = order.indexOf(this.lang);
    this.lang = order[(i + 1) % order.length];
    return this.lang;
  }

  /** Primary UI string for current language */
  t(key) {
    const e = UI_STRINGS[key];
    if (!e) return key;
    return this.lang === 'es' ? (e.es || e.en) : e.en;
  }

  /** Inline text: pick primary string based on language */
  txt(en, es) {
    if (this.lang === 'es') return es || en;
    return en;
  }

  /** Secondary string for bilingual mode (null otherwise) */
  txt2(en, es) {
    if (this.lang !== 'bilingual' || !es) return null;
    return es;
  }

  /** Get chapter ES data by chapter id */
  chapterEs(id) {
    return CHAPTER_ES[id] || {};
  }

  /** Current language label for display in menus */
  get label() {
    if (this.lang === 'es')        return this.t('lang.es');
    if (this.lang === 'bilingual') return this.t('lang.bilingual');
    return this.t('lang.en');
  }
}

window.LANG = new LangSystem();
