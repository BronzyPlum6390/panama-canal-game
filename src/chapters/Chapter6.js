/**
 * Chapter 6: "Agua" — The Flood (1913)
 *
 * History: To create Gatun Lake — the world's largest man-made lake at the time —
 * the US Army Corps dammed the Chagres River. The resulting flood submerged
 * 164 square miles of Panamanian land, including 12 villages and towns.
 * Approximately 6,000 people were displaced, most Afro-Panamanian and
 * indigenous communities with deep roots in the valley.
 * The flooding of their homes was the direct cost of the canal's miracle engineering.
 */
class Chapter6 extends Chapter {
  constructor() {
    super({
      id: 'ch06',
      num: 6,
      title: 'Agua',
      subtitle: 'The Flood',
      year: '1913',
      bgType: 'village',
      levelWidth: 2400,
      groundY: 280,  // lower groundY — village is near water level
      exitCondition: 'reach_end',
      footnote: 'On October 10, 1913, President Wilson pressed a telegraph key in Washington D.C. ' +
        'The dynamite charge at Gamboa Dike fired. The Chagres valley flooded. ' +
        'The creation of Gatun Lake displaced 6,000 people from 12 communities. ' +
        'Many received little to no compensation. Their villages remain underwater today.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 6,
          year: '1913',
          title: 'Agua',
          subtitle: 'The Flood',
          body: 'The dam is nearly finished. Gatun Lake will be the largest man-made lake in the world. ' +
            'A triumph of engineering. ' +
            'But the valley below does not know yet that it will cease to exist.',
          duration: 6,
          skipOnInput: true,
        }
      ]
    });
    this._waterRising = false;
    this._waterLevel = 0; // rises over time
    this._waterStartTime = 0;
    this._waterMaxHeight = 180;
    this._villageItems = 0;
    this._totalItems = 4;
  }

  _buildLevel(physics) {
    const G = this.groundY;

    this.addGround(physics);

    // ── Section 1: Village (x 0–800) ─────────────────────────────────────
    // Houses on stilts / raised platforms
    this.addPlatform(80, G - 60, 100, { texture: 'wood', color: '#8A6A30', topColor: '#AA8A40' });
    this.addPlatform(240, G - 80, 80, { texture: 'wood', color: '#8A6A30', topColor: '#AA8A40' });
    this.addPlatform(380, G - 60, 120, { texture: 'wood', color: '#8A6A30', topColor: '#AA8A40' });
    this.addPlatform(560, G - 90, 80, { texture: 'wood', color: '#8A6A30', topColor: '#AA8A40' });

    // Church — highest point
    this.addPlatform(300, G - 140, 60, { texture: 'stone', color: '#A0A090', topColor: '#C0C0B0' });

    // Rope puzzle: lower boxes from second floor
    const boxGate = this.addGate(680, G - 110, 16, 110, { color: '#7A5A20' });
    const rope1 = this.addRopePull(
      600, G - 80,
      760, G - 80,
      {
        targetTension: 0.6,
        tolerance: 0.25,
        requiredHold: 2.5,
        linkedGate: boxGate,
      }
    );

    // ── Section 2: Evacuation path (x 800–1600) ──────────────────────────
    this.addPlatform(780, G - 60, 100, { texture: 'stone', color: '#7A7060' });
    this.addPlatform(940, G - 90, 80, { texture: 'stone', color: '#7A7060' });
    this.addPlatform(1080, G - 120, 80, { texture: 'grass', color: '#3A5020' });
    this.addPlatform(1220, G - 100, 80, { texture: 'stone', color: '#7A7060' });
    this.addPlatform(1360, G - 80, 100, { texture: 'grass', color: '#3A5020' });
    this.addPlatform(1500, G - 110, 80, { texture: 'stone', color: '#7A7060' });

    // Rising water hazard (grows as chapter progresses)
    const waterHazard = this.addHazard(0, G + 20, this.levelWidth, 80,
      { type: 'water', damage: 3, damageInterval: 1 });
    this._waterHazard = waterHazard;

    // Crumbling platforms near water line — urgency mechanic
    const crumblePlat1 = new Platform(860, G - 40, 60, 16,
      { type: 'crumbling', texture: 'wood', color: '#8A6A30', crumbleDelay: 1.5, crumbleBreak: 0.4 });
    this.platforms.push(crumblePlat1);
    // Note: physics.addStatic is called by Chapter.build() for all this.platforms

    const crumblePlat2 = new Platform(1000, G - 60, 60, 16,
      { type: 'crumbling', texture: 'wood', color: '#8A6A30', crumbleDelay: 1.5, crumbleBreak: 0.4 });
    this.platforms.push(crumblePlat2);

    // ── Section 3: High ground (x 1600–2300) ─────────────────────────────
    this.addPlatform(1620, G - 140, 100, { texture: 'grass', color: '#3A5020' });
    this.addPlatform(1780, G - 160, 80, { texture: 'stone', color: '#7A7060' });
    this.addPlatform(1920, G - 140, 100, { texture: 'grass', color: '#3A5020' });
    this.addPlatform(2080, G - 160, 80, { texture: 'stone', color: '#7A7060' });
    this.addPlatform(2200, G - 140, 120, { texture: 'grass', color: '#3A5020' });

    // High ground — safe final area
    this.addPlatform(2000, G - 220, 300, 20, { texture: 'grass', color: '#3A5020', topColor: '#5A8030' });

    this.exitX = 2350;

    // ── Signs ──────────────────────────────────────────────────────────
    this.addSign(160, G - 80, {
      type: 'notice',
      title: 'Relocation Notice',
      text: '"Residents of Gatun Valley: The Gamboa Dike will be opened October 10, 1913. ' +
        'All residents must vacate their properties by October 1st. ' +
        'Compensation will be distributed at the Canal Zone Office." ' +
        '(Average compensation: $50-200 per family. Market value was rarely paid.)'
    });

    this.addSign(390, G - 80, {
      type: 'memorial',
      title: 'What Was Here',
      text: '"The villages of Gatun, Lion Hill, Bohio, Frijoles, San Pablo, Tabernilla — ' +
        'communities that had existed for hundreds of years. ' +
        'Under 85 feet of water now. Permanently."'
    });

    this.addSign(1100, G - 140, {
      type: 'memorial',
      title: 'The Other Cost',
      text: '"Progress has a price. The Canal Engineers knew this price would be paid — ' +
        'they just were not the ones paying it. ' +
        'The Afro-Panamanian and indigenous families of the Chagres valley paid it instead."'
    });

    this.addSign(2050, G - 240, {
      type: 'wood',
      title: 'High Ground',
      text: '"From here you can see everything. ' +
        'The dam is complete. The water is rising. ' +
        'Below: where your family lived for four generations. ' +
        'Up here: you. Your memories. Your hands. ' +
        'They cannot flood those."'
    });

    // ── Collectibles — family items to be rescued ──────────────────────
    this.addCollectible(260, G - 100, {
      label: 'Family Bible',
      content: '"CHÁVEZ FAMILY — Baptisms, marriages, deaths recorded from 1792. ' +
        'Four generations in Gatun village. ' +
        'We are taking this with us. The valley they can have. This, they cannot take." ' +
        '— Inscription added October 9, 1913'
    });
    this.addCollectible(450, G - 80, {
      label: 'Village Map',
      content: '"Hand-drawn map of Gatun Village — church, market, school, the Reyes family\'s farm, ' +
        'the mango tree where the children play. ' +
        'Drawn from memory by Rosa Reyes, age 67, the day before the flood."'
    });
    this.addCollectible(750, G - 110, {
      label: 'Elder\'s Letter',
      content: '"We are not obstacles to progress. We are not sacrifice zones. ' +
        'We are people with names and histories and rights that precede this canal by centuries. ' +
        'I am writing this because I want someone, someday, to know that we were here." ' +
        '— Letter left in the Gatun church, never mailed. Found by a diver in 1962.'
    });
    this.addCollectible(1460, G - 100, {
      label: 'Photograph',
      content: '"A photograph of the Gatun village school, 1912. ' +
        '47 children. 3 teachers. ' +
        'The school was demolished in 1913. ' +
        'The site is now 60 feet underwater."'
    });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'icc_officer',
      x: 380, y: G - PH,
      displayName: 'Relocation Officer',
      dialogueId: 'icc_officer_1',
      colors: {
        skin: '#D4B090', hair: '#8A6030',
        shirt: '#4A3A20', shirtDark: '#2A1A10',
        pants: '#2A2020', hat: '#3A2A10', hatDark: '#1A1A08',
      },
    });

    this.addNPC({
      id: 'village_elder',
      x: 640, y: G - PH,
      displayName: 'Abuela Carmen',
      dialogueId: 'abuela_1',
      colors: {
        skin: '#A07850', hair: '#FFFFFF',
        shirt: '#7A3A20', shirtDark: '#5A1A00',
        pants: '#3A2A10',
      },
    });

    this.addNPC({
      id: 'village_neighbor',
      x: 1200, y: G - 110,
      displayName: 'Neighbor Tomás',
      dialogueId: 'neighbor_1',
      colors: {
        skin: '#8A6040', hair: '#1A0A00',
        shirt: '#6A4A30', shirtDark: '#4A2A10',
        pants: '#2A1A10',
      },
    });
  }

  update(dt, players, physics, input) {
    // Rising water effect
    if (!this._waterRising) {
      // Start rising when players are past midpoint
      for (const p of players) {
        if (p.body.x > 800) { this._waterRising = true; break; }
      }
    }

    if (this._waterRising && this._waterLevel < this._waterMaxHeight) {
      this._waterLevel += dt * 4; // slowly rise
      if (this._waterHazard) {
        const newY = this.groundY + 20 - this._waterLevel;
        this._waterHazard.y = newY;
        this._waterHazard.h = this.groundY + 80 - newY;
        this._waterHazard.body ? null : null;
      }
    }

    super.update(dt, players, physics, input);
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── ICC Officer ───────────────────────────────────────────────────
      {
        id: 'icc_officer_1',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'ICC Relocation Officer',
        text: 'This is a lawful relocation order. The Gamboa Dike opens October 10th. You need to be off your property by October 1st.',
        nextNodeId: 'icc_2',
      },
      {
        id: 'icc_2',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'ICC Relocation Officer',
        text: 'Compensation has been calculated based on... assessed property value. You should receive your check within 60 days. Most families are finding good land in the uplands.',
        nextNodeId: 'icc_choice',
      },
      {
        id: 'icc_choice',
        type: 'choice', speakerId: 'rosa', speakerName: 'Rosa',
        text: 'Respond to the officer:',
        choices: [
          {
            text: '"My grandmother\'s house was assessed at $50. It has 12 rooms. She built it herself."',
            nextNodeId: 'icc_confronted',
            triggers: [{ type: 'set_flag', key: 'challenged_icc' }],
          },
          {
            text: '"What happens if we don\'t leave?"',
            nextNodeId: 'icc_threat',
          },
        ],
      },
      {
        id: 'icc_confronted',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'ICC Relocation Officer',
        text: '(Looking at his papers) I... the assessments were conducted by... I see your objection. I can note it in the record. I\'ll be honest with you — the record doesn\'t change the dam.',
        nextNodeId: null,
      },
      {
        id: 'icc_threat',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'ICC Relocation Officer',
        text: 'Then the flood takes your property. We cannot stop that — the engineering is in motion. I\'m sorry. I know how that sounds.',
        nextNodeId: null,
      },
      // ── Abuela Carmen ─────────────────────────────────────────────────
      {
        id: 'abuela_1',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Abuela Carmen',
        text: 'I was born in this house. My mother was born in this house. My mother\'s mother was born in this house. I am 72 years old. You want to know how long it takes to build something like that?',
        nextNodeId: 'abuela_2',
      },
      {
        id: 'abuela_2',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Abuela Carmen',
        text: 'I am not angry at the canal. The canal is real. Ships will sail it. People will eat because of what moves through it. I understand that.',
        nextNodeId: 'abuela_3',
      },
      {
        id: 'abuela_3',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Abuela Carmen',
        text: 'I am angry that they decided our homes were worth less than the water they needed. They did not ask us. They did not mourn with us. They sent a man with a check.',
        nextNodeId: 'abuela_4',
      },
      {
        id: 'abuela_4',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Abuela Carmen',
        text: 'Help me carry the Bible and the photographs. Those are not replaceable. The house — someday the waters may recede. But a photograph of my grandmother\'s face — that is what I need you to carry.',
        nextNodeId: null,
      },
      // ── Neighbor Tomás ────────────────────────────────────────────────
      {
        id: 'neighbor_1',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Tomás (neighbor)',
        text: 'I refused to leave. For two weeks after the deadline. The water started coming up from the ground first — before the dam even opened. Like the earth already knew.',
        nextNodeId: 'neighbor_2',
      },
      {
        id: 'neighbor_2',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Tomás (neighbor)',
        text: 'Eventually I walked out. What else could I do? Stand there and drown to prove a point? I had children.',
        nextNodeId: 'neighbor_3',
      },
      {
        id: 'neighbor_3',
        type: 'narration',
        text: 'October 10, 1913. President Wilson pressed a telegraph key in Washington. ' +
          'The dynamite charge at Gamboa Dike detonated. ' +
          'The Chagres valley began to fill. ' +
          '164 square miles submerged. 12 villages gone. 6,000 people displaced. ' +
          'Gatun Lake — the largest artificial body of water in the world — was born.',
        duration: 8,
        skipOnInput: true,
        nextNodeId: null,
      },
    ];
  }
}
