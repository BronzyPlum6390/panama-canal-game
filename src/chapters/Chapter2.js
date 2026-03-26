/**
 * Chapter 2: "La Fièvre Jaune" — The Yellow Fever Years (1884)
 *
 * History: Dr. Carlos Finlay correctly identified Aedes aegypti mosquitoes
 * as the vector for yellow fever in 1881 — and was ignored for 20 years.
 * The French Ancon Hospital was planted in standing water — a mosquito
 * paradise. Flower pots in the ward used to deter ants were filled with
 * water, unintentionally breeding the killers.
 */
class Chapter2 extends Chapter {
  constructor() {
    super({
      id: 'ch02',
      num: 2,
      title: 'La Fièvre Jaune',
      subtitle: 'The Yellow Fever Years',
      year: '1884',
      bgType: 'hospital',
      levelWidth: 2400,
      groundY: 320,
      exitCondition: 'reach_end',
      footnote: 'Dr. Carlos Finlay, a Cuban-American physician, identified the mosquito vector ' +
        'for yellow fever in 1881 and was ignored by the French for 20 years. ' +
        'When the Americans finally listened to him in 1904, yellow fever was eradicated ' +
        'from the canal zone in under 18 months.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 2,
          year: '1884',
          title: 'La Fièvre Jaune',
          subtitle: 'The Yellow Fever Years',
          body: 'Three years into the French project. Workers are dying by the hundreds. ' +
            'Nobody knows why. A Cuban doctor named Carlos Finlay has a theory. ' +
            'Nobody is listening.',
          duration: 6,
          skipOnInput: true,
        }
      ]
    });
  }

  _buildLevel(physics) {
    const G = this.groundY;

    this.addGround(physics);

    // ── Section 1: Hospital grounds (x 0–700) ──────────────────────────
    // Wooden walkways (elevated above muddy ground)
    this.addPlatform(60, G - 50, 120, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(230, G - 60, 80, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(360, G - 50, 100, { texture: 'wood', color: '#9A7A40' });

    // Standing water hazard zones (mosquito breeding)
    this.addHazard(130, G - 16, 80, 16,
      { type: 'water', damage: 2, damageInterval: 0.8, warnLabel: 'STAGNANT WATER' });
    this.addHazard(270, G - 16, 60, 16,
      { type: 'water', damage: 2, damageInterval: 0.8, warnLabel: 'MOSQUITO BREEDING' });

    // Mosquito swarm zones — float above ground
    this.addHazard(150, G - 100, 60, 80,
      { type: 'mosquito', damage: 5, damageInterval: 0.4, warnLabel: 'MOSQUITO SWARM' });
    this.addHazard(280, G - 120, 50, 90,
      { type: 'mosquito', damage: 5, damageInterval: 0.4 });

    // ── Ward separation puzzle: gate that requires draining water ───────
    const wardGate = this.addGate(500, G - 140, 16, 140,
      { color: '#8A7A60', label: 'WARD B' });

    // Pressure plate — drain the basin (both players hold it to drain water)
    const drain1 = this.addPressurePlate(420, G - 8, 60, {
      requiredCount: 2,
      linkedGate: wardGate,
      label: 'DRAIN VALVE',
      momentary: false,
    });

    // ── Section 2: Wards (x 600–1300) ──────────────────────────────────
    this.addPlatform(570, G - 50, 100, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(720, G - 80, 80, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(860, G - 50, 120, { texture: 'wood', color: '#9A7A40' });

    // Fever zone (inside hospital — high fever heat)
    this.addHazard(640, G - 100, 200, 104,
      { type: 'fever_zone', damage: 3, damageInterval: 0.5, warnLabel: 'FEVER ZONE' });

    // Medicine platform (raised — safe from the hazard)
    this.addPlatform(700, G - 130, 60, { texture: 'wood', color: '#C8A860' });

    // ── Crank puzzle: ventilation pump ──────────────────────────────────
    const ventGate = this.addGate(1100, G - 120, 16, 120,
      { color: '#7A9A60' });
    this.addCrank(1040, G - 80, {
      linkedGate: ventGate,
      label: 'VENTILATION',
      required: Math.PI * 5,
    });

    // ── Section 3: Finlay's lab / escape (x 1300–2300) ──────────────────
    this.addPlatform(1200, G - 60, 80, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(1340, G - 80, 100, { texture: 'stone', color: '#6A6A50' });
    this.addPlatform(1480, G - 100, 80, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(1600, G - 70, 100, { texture: 'stone', color: '#6A6A50' });

    // More mosquito swarms
    this.addHazard(1460, G - 180, 80, 100, { type: 'mosquito', damage: 5, damageInterval: 0.4 });

    this.addPlatform(1760, G - 50, 120, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(1920, G - 80, 80, { texture: 'stone', color: '#6A6A50' });
    this.addPlatform(2060, G - 50, 120, { texture: 'wood', color: '#9A7A40' });
    this.addPlatform(2200, G - 60, 80, { texture: 'stone', color: '#6A6A50' });

    this.exitX = 2300;

    // ── Signs ──────────────────────────────────────────────────────────
    this.addSign(140, G - 60, {
      type: 'notice',
      title: 'Hospital Notice (1883)',
      text: '"To prevent insects: Place flower pots at all bed posts and fill with water. ' +
        'This deters the ants." — Ancon Hospital Director ' +
        '(The water-filled pots were perfect mosquito breeding grounds.)'
    });

    this.addSign(750, G - 90, {
      type: 'memorial',
      title: 'The Death Rate',
      text: '"In 1884, the Ancon Hospital admitted 654 workers. ' +
        'Of those, 423 died. A mortality rate of 65 percent. ' +
        'The canal company continued recruiting in the Caribbean."'
    });

    this.addSign(1500, G - 110, {
      type: 'notice',
      title: 'Finlay\'s Paper (1881)',
      text: '"The mosquito Aedes aegypti is the vector for yellow fever. ' +
        'To eliminate the disease, eliminate the mosquito\'s breeding grounds." ' +
        '— Dr. Carlos Finlay. Ignored by French authorities for 20 years.'
    });

    // ── Collectibles ───────────────────────────────────────────────────
    this.addCollectible(210, G - 80, {
      label: 'Patient Record',
      content: '"Jacques Moreau, age 24, laborer. Admitted: June 3, 1884. ' +
        'Symptoms: fever, black vomit, jaundice. Cause of death: Unidentified fever. ' +
        'Body returned to family: July 2, 1884." ' +
        '(This record was one of thousands.)'
    });

    this.addCollectible(1700, G - 100, {
      label: 'Finlay\'s Notes',
      content: '"I have now demonstrated in twelve cases that the yellow fever agent ' +
        'is transmitted only by the bite of a specific mosquito. ' +
        'The cure is simple: drain standing water, screen windows, ' +
        'and kill the mosquito. No one will hear me." — Dr. Finlay, 1883'
    });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'finlay',
      x: 1350, y: G - PH,
      displayName: 'Dr. Carlos Finlay',
      dialogueId: 'finlay_1',
      colors: {
        skin: '#C4956A', hair: '#2C1810',
        shirt: '#E8E0C0', shirtDark: '#C0C0A0',
        pants: '#303030',
      },
    });

    this.addNPC({
      id: 'french_admin',
      x: 300, y: G - PH,
      displayName: 'French Director',
      dialogueId: 'french_admin_1',
      colors: {
        skin: '#D4B090', hair: '#6A5020',
        shirt: '#1A3060', shirtDark: '#0A1840',
        pants: '#1A1A40', hat: '#2A2A2A', hatDark: '#111',
      },
    });

    this.addNPC({
      id: 'nurse',
      x: 700, y: G - 130,
      displayName: 'Nurse Rosalie',
      dialogueId: 'nurse_1',
      colors: {
        skin: '#8A6040', hair: '#0A0500',
        shirt: '#E0E0D0', shirtDark: '#C0C0B0',
        pants: '#E0E0D0',
      },
    });
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── French Director ──────────────────────────────────────────────
      {
        id: 'french_admin_1',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'French Director',
        text: 'Do not trouble the investors with death statistics. We label all deaths as "fever of unknown origin." It is not a lie. We simply do not know the origin.',
        nextNodeId: 'french_admin_2',
      },
      {
        id: 'french_admin_2',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'French Director',
        text: 'There is a doctor — a Cuban named Finlay — who claims the mosquito is to blame. We have reviewed his theory. It is... imaginative. The real cause is the bad air. The miasma. Everyone knows this.',
        nextNodeId: 'french_admin_3',
      },
      {
        id: 'french_admin_3',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'French Director',
        text: '(He lowers his voice) Between us? The shareholders cannot know how many men we are losing. If Paris finds out, the bonds will collapse. We carry on.',
        nextNodeId: null,
      },
      // ── Dr. Finlay ────────────────────────────────────────────────────
      {
        id: 'finlay_1',
        type: 'dialogue', speakerId: 'finlay',
        speakerName: 'Dr. Carlos Finlay',
        text: 'You look well. Hold on to that. I have something important to tell you — something the French will not tell you.',
        nextNodeId: 'finlay_2',
      },
      {
        id: 'finlay_2',
        type: 'dialogue', speakerId: 'finlay',
        speakerName: 'Dr. Carlos Finlay',
        text: 'Yellow fever is spread by the Aedes aegypti mosquito. Not bad air. Not contaminated water. The mosquito. I have proven this. Repeatedly. The French read my paper and filed it away.',
        nextNodeId: 'finlay_3',
      },
      {
        id: 'finlay_3',
        type: 'dialogue', speakerId: 'finlay',
        speakerName: 'Dr. Carlos Finlay',
        text: 'Do you see those flower pots at each bed? The French put water in them to stop ants. Those pots breed 10,000 mosquitoes a week. They are killing their own workers while trying to prevent ant infestations.',
        nextNodeId: 'finlay_choice',
      },
      {
        id: 'finlay_choice',
        type: 'choice',
        speakerId: 'rosa', speakerName: 'Rosa',
        text: 'What should we do with this knowledge?',
        choices: [
          {
            text: '"We should empty those pots now."',
            nextNodeId: 'finlay_practical',
            triggers: [{ type: 'set_flag', key: 'knows_mosquito_truth' }],
          },
          {
            text: '"Why won\'t they listen to you?"',
            nextNodeId: 'finlay_why',
          },
        ],
      },
      {
        id: 'finlay_practical',
        type: 'dialogue', speakerId: 'finlay',
        speakerName: 'Dr. Carlos Finlay',
        text: 'You understand faster than twenty French engineers. Yes — empty the pots, drain the basins, screen the windows. Simple. Free. Life-saving. But it requires admitting that a Cuban doctor in Havana solved what they could not.',
        nextNodeId: null,
      },
      {
        id: 'finlay_why',
        type: 'dialogue', speakerId: 'finlay',
        speakerName: 'Dr. Carlos Finlay',
        text: 'Because I am Cuban. Because I am not French. Because admitting I am right means admitting they have been wrong — and that their workers died for nothing. Science has never been purely about truth. There is always politics.',
        nextNodeId: null,
      },
      // ── Nurse ─────────────────────────────────────────────────────────
      {
        id: 'nurse_1',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Nurse Rosalie',
        text: 'I have been here eight months. I have held the hands of 200 dying men. French, Jamaican, Colombian, Greek — the fever does not care where you are from.',
        nextNodeId: 'nurse_2',
      },
      {
        id: 'nurse_2',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Nurse Rosalie',
        text: 'They tell us not to speak of the numbers. But I count them. I always count them. Somebody has to remember.',
        nextNodeId: 'nurse_narration',
      },
      {
        id: 'nurse_narration',
        type: 'narration',
        text: 'Between 1881 and 1889, the French lost approximately 22,000 workers to disease — ' +
          'mostly yellow fever and malaria. The French Canal Company concealed the true death toll ' +
          'from investors and the public for years.',
        duration: 7,
        skipOnInput: true,
        nextNodeId: null,
      },
    ];
  }
}
