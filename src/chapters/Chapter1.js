/**
 * Chapter 1: "Le Grand Canal" — The French Dream (1881)
 *
 * History: Ferdinand de Lesseps, fresh off building the Suez Canal, arrived
 * in Panama with a sea-level canal plan. He ignored warnings about the jungle,
 * disease, and terrain. 20,000 workers arrived with promises of glory.
 * The French would spend $287 million and lose 22,000 lives before going bankrupt.
 */
class Chapter1 extends Chapter {
  constructor() {
    super({
      id: 'ch01',
      num: 1,
      title: 'Le Grand Canal',
      subtitle: 'The French Dream',
      year: '1881',
      bgType: 'jungle',
      levelWidth: 2600,
      groundY: 330,
      exitCondition: 'reach_end',
      footnote: 'The French Panama Canal Company declared bankruptcy in 1889. ' +
        'Over 22,000 workers died — most from yellow fever and malaria. ' +
        'Ferdinand de Lesseps was convicted of fraud. His dream became a monument to hubris.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 1,
          year: '1881',
          title: 'Le Grand Canal',
          subtitle: 'The French Dream',
          body: 'Panama. The French canal company has arrived, led by Ferdinand de Lesseps — builder of the Suez Canal. He believes Panama is simply another engineering problem. He has never seen the jungle in rainy season.',
          duration: 7,
          skipOnInput: true,
        }
      ]
    });
  }

  _buildLevel(physics) {
    const G = this.groundY;
    const W = this.levelWidth;

    // ── Ground ──────────────────────────────────────────────────────────
    this.addGround(physics);

    // ── Section 1: French camp (x 0–600) ───────────────────────────────
    // Wooden platforms for the camp structures (one-way so players can walk under)
    this.addPlatform(180, G - 50, 80, { texture: 'wood', color: '#7A4A20', topColor: '#9A6A30', oneWay: true });
    this.addPlatform(320, G - 50, 120, { texture: 'wood', color: '#7A4A20', oneWay: true });

    // Supply crate stepping stones — progressive heights for jump path to gate
    this.addPlatform(420, G - 50, 40, { texture: 'wood', color: '#8A5A20', topColor: '#AA7A30', oneWay: true });
    this.addPlatform(500, G - 80, 40, { texture: 'wood', color: '#8A5A20', oneWay: true });
    this.addPlatform(580, G - 50, 40, { texture: 'wood', color: '#8A5A20', oneWay: true });

    // Gate between camp and jungle proper — de Lesseps encounter
    const gate1 = this.addGate(660, G - 140, 20, 140,
      { color: '#5A4020', label: 'CAMP EXIT' });
    this.gates.push(gate1);

    // Pressure plate to open gate (both players must stand together — cooperative intro)
    // Plate is LEFT of the gate so players step on it, gate opens, they walk through
    const plate1 = this.addPressurePlate(560, G - 8, 80, {
      requiredCount: 2,
      linkedGate: gate1,
      label: 'STAND TOGETHER',
      momentary: false,
    });

    // ── Section 2: Jungle path (x 700–1300) ─────────────────────────────
    // Uneven jungle terrain — all one-way so players can jump through from below
    this.addPlatform(760, G - 50, 60, { texture: 'grass', color: '#3A2810', oneWay: true });
    this.addPlatform(860, G - 50, 80, { texture: 'grass', color: '#3A2810', oneWay: true });
    this.addPlatform(970, G - 50, 50, { texture: 'stone', color: '#5A5A40', oneWay: true });
    this.addPlatform(1060, G - 50, 60, { texture: 'grass', color: '#3A2810', oneWay: true });
    this.addPlatform(1160, G - 50, 80, { texture: 'stone', color: '#5A5A40', oneWay: true });

    // Rope puzzle platforms — both anchors left of the gate so both players can reach
    this.addPlatform(1250, G - 50, 80, { texture: 'grass', color: '#3A2810', oneWay: true });
    this.addPlatform(1360, G - 50, 80, { texture: 'stone', color: '#5A5A40', oneWay: true });
    // After gate
    this.addPlatform(1500, G - 50, 80, { texture: 'grass', color: '#3A2810', oneWay: true });

    // Rope puzzle site — both anchors on left side of gate, players stand on platforms above
    // Gate top at G-120 (y=210); max jump from G-50 platform only reaches y=221, so can't jump over
    const gate2 = this.addGate(1460, G - 120, 16, 120,
      { color: '#4A6040', label: 'SURVEY COMPLETE?' });

    const rope1 = this.addRopePull(
      1270, G - 80,
      1420, G - 80,
      {
        targetTension: 0.65,
        tolerance: 0.25,
        requiredHold: 2.5,
        linkedGate: gate2,
      }
    );

    // ── Section 3: Excavation site (x 1300–2000) ─────────────────────────
    this.addPlatform(1600, G - 50, 120, { texture: 'dirt', color: '#6A4A20' });
    this.addPlatform(1760, G - 100, 80, { texture: 'stone', color: '#5A5A40' });
    this.addPlatform(1880, G - 50, 100, { texture: 'dirt', color: '#6A4A20' });

    // Pit — muddy area (hazard)
    this.addHazard(2000, G - 20, 80, 24,
      { type: 'mudslide', damage: 8, damageInterval: 0.3, warnLabel: 'MUD PIT' });

    // Stepping stone above the mud — bridges the gap to the winch platform
    this.addPlatform(2020, G - 80, 60, { texture: 'stone', color: '#5A5A40', oneWay: true });

    this.addPlatform(2100, G - 80, 80, { texture: 'stone', color: '#5A5A40' });
    this.addPlatform(2200, G - 50, 120, { texture: 'grass', color: '#3A2810' });
    this.addPlatform(2350, G - 30, 80, { texture: 'stone', color: '#5A5A40' });

    // Final gate — exit
    const exitGate = this.addGate(2480, G - 160, 20, 160,
      { color: '#C8A840', label: 'CONTINUE', isExit: false });
    exitGate.open = true; // always open — just decorative

    this.exitX = 2500;

    // ── Signs ──────────────────────────────────────────────────────────
    this.addSign(200, G - 50, {
      type: 'wood',
      title: 'French Canal Company Bulletin',
      text: '"Work proceeds on schedule. Monsieur de Lesseps sends his regards. ' +
        'Any worker reporting illness should visit the hospital tent. Malaria reports are to be kept confidential."'
    });

    this.addSign(900, G - 80, {
      type: 'notice',
      title: 'Warning (Ignored)',
      text: 'LOCAL FARMER: "You cannot cut this mountain in dry season only. ' +
        'When the rains come, everything you dig will fill back in." ' +
        '(His warning was dismissed by the French engineers.)'
    });

    this.addSign(1700, G - 60, {
      type: 'notice',
      title: 'Work Orders',
      text: '"CULEBRA CUT — All workers to begin excavation at dawn. ' +
        'Quota: 100 cubic meters per crew per day. Failure to meet quota ' +
        'results in docking of wages. — French Canal Company, 1883"'
    });

    // ── Collectibles ───────────────────────────────────────────────────
    this.addCollectible(540, G - 100, {
      label: 'de Lesseps Letter',
      content: '"My dear investors — The Panama canal is, if anything, ' +
        'easier than Suez. The terrain presents no unusual obstacles. ' +
        'By 1886, your investment will be richly rewarded." — F. de Lesseps, 1881'
    });

    this.addCollectible(1900, G - 80, {
      label: 'Worker\'s Diary',
      content: '"Day 40. Three men from my crew have fallen ill. ' +
        'They say it is the air. I say it is the water that sits still ' +
        'in the barrel outside the tent. Nobody listens. God help us." — Anonymous, 1883'
    });

    // ── Crank puzzle (bonus mechanic intro) ───────────────────────────
    const crankGate = this.addGate(2150, G - 100, 16, 100, { color: '#5A4020' });
    this.addCrank(2100, G - 80, { linkedGate: crankGate, label: 'WINCH', required: Math.PI * 4 });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'de_lesseps',
      x: 350, y: G - PH,
      displayName: 'de Lesseps',
      dialogueId: 'de_lesseps_1',
      colors: {
        skin: '#D4A070', hair: '#8B6914',
        shirt: '#1A3060', shirtDark: '#0A1840',
        pants: '#1A1A40', hat: '#1A1A1A', hatDark: '#0A0A0A',
      },
    });

    this.addNPC({
      id: 'farmer',
      x: 880, y: G - PH,
      displayName: 'Panamanian Farmer',
      dialogueId: 'farmer_1',
      colors: {
        skin: '#8A6040', hair: '#1A0A00',
        shirt: '#6A5A30', shirtDark: '#4A3A10',
        pants: '#3A2A10',
      },
    });

    this.addNPC({
      id: 'worker_dying',
      x: 1650, y: G - PH,
      displayName: 'Sick Worker',
      dialogueId: 'sick_worker_1',
      isAlive: false,
      colors: {
        skin: '#7A5A3A', hair: '#0A0500',
        shirt: '#887840', shirtDark: '#6A5820',
        pants: '#2A2A2A',
      },
    });
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── de Lesseps ─────────────────────────────────────
      {
        id: 'de_lesseps_1',
        type: 'dialogue',
        speakerId: 'de_lesseps',
        speakerName: 'Ferdinand de Lesseps',
        text: 'Ah, new workers! Welcome to the greatest engineering project in human history. By 1888 — seven short years — this jungle will be a canal, and France will be immortal.',
        nextNodeId: 'de_lesseps_2',
      },
      {
        id: 'de_lesseps_2',
        type: 'dialogue',
        speakerId: 'de_lesseps',
        speakerName: 'Ferdinand de Lesseps',
        text: 'I built the Suez in ten years. This is merely a 50-mile ditch. The science is sound. The investors are confident. What could possibly go wrong?',
        nextNodeId: 'de_lesseps_choice',
      },
      {
        id: 'de_lesseps_choice',
        type: 'choice',
        speakerId: 'rosa',
        speakerName: 'Rosa',
        text: 'How do you respond?',
        choices: [
          {
            text: '"Monsieur, our people have lived here for generations. The jungle is not like Suez."',
            nextNodeId: 'de_lesseps_warned',
            triggers: [{ type: 'set_flag', key: 'warned_de_lesseps' }],
          },
          {
            text: '"Oui, Monsieur. We will work hard."',
            nextNodeId: 'de_lesseps_pleased',
          },
        ],
      },
      {
        id: 'de_lesseps_warned',
        type: 'dialogue',
        speakerId: 'de_lesseps',
        speakerName: 'Ferdinand de Lesseps',
        text: '(laughs) You locals always say this. Do not worry — French engineering has conquered greater obstacles. Your concerns are... appreciated. Now get to work.',
        nextNodeId: null,
      },
      {
        id: 'de_lesseps_pleased',
        type: 'dialogue',
        speakerId: 'de_lesseps',
        speakerName: 'Ferdinand de Lesseps',
        text: 'Excellent spirit! That is what I need. France depends on workers like you. Off you go.',
        nextNodeId: null,
      },
      // ── Farmer ─────────────────────────────────────────
      {
        id: 'farmer_1',
        type: 'dialogue',
        speakerId: 'elder',
        speakerName: 'Panamanian Farmer',
        text: 'You see that cloud forming over the mountain? That means three days of rain. When it rains here, the Chagres River rises twenty feet in a night.',
        nextNodeId: 'farmer_2',
      },
      {
        id: 'farmer_2',
        type: 'dialogue',
        speakerId: 'elder',
        speakerName: 'Panamanian Farmer',
        text: 'I told the French engineers this. They wrote it in their notebooks and did nothing. My grandfather farmed this land. It will swallow whatever they build.',
        nextNodeId: 'farmer_3',
      },
      {
        id: 'farmer_3',
        type: 'dialogue',
        speakerId: 'elder',
        speakerName: 'Panamanian Farmer',
        text: 'And the mosquitoes... they say the sickness comes from bad air. But I have seen: the workers who sleep near the standing water die first. Every time.',
        nextNodeId: null,
      },
      // ── Sick Worker ────────────────────────────────────
      {
        id: 'sick_worker_1',
        type: 'dialogue',
        speakerId: 'worker',
        speakerName: 'Sick Worker (1883)',
        text: '"I came from Barbados for a better wage. They promised good food and lodging. We sleep in tents above the mud. Every morning, two more men don\'t wake up."',
        nextNodeId: 'sick_worker_2',
      },
      {
        id: 'sick_worker_2',
        type: 'dialogue',
        speakerId: 'worker',
        speakerName: 'Sick Worker (1883)',
        text: '"The French call it Panama Fever. They ship the bodies home in lead-lined boxes so no one in France will see how bad it is. My brother is in one of those boxes."',
        nextNodeId: 'sick_worker_3',
      },
      {
        id: 'sick_worker_3',
        type: 'narration',
        text: 'During the French construction period (1881–1889), an estimated 22,000 workers died — primarily from yellow fever and malaria. The French suppressed death toll numbers to maintain investor confidence.',
        duration: 6,
        skipOnInput: true,
        nextNodeId: null,
      },
    ];
  }
}
