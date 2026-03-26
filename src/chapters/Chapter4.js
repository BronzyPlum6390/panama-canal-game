/**
 * Chapter 4: "Gold and Silver" — The Two-Tier System (1908)
 *
 * History: The US Canal Zone operated an officially codified racial hierarchy.
 * Gold Roll workers (white Americans) received higher pay, better housing,
 * separate cafeterias, libraries, schools, hospitals, water fountains, and post
 * office windows. Silver Roll (everyone else — mostly Black West Indians,
 * Panamanians, and Southern Europeans) received less pay and segregated
 * inferior facilities. This was US government policy.
 */
class Chapter4 extends Chapter {
  constructor() {
    super({
      id: 'ch04',
      num: 4,
      title: 'Gold and Silver',
      subtitle: 'The Two-Tier System',
      year: '1908',
      bgType: 'construction',
      levelWidth: 2600,
      groundY: 320,
      exitCondition: 'reach_end',
      footnote: 'The Gold Roll / Silver Roll division was official US government policy from 1904 to 1955. ' +
        'About 31,000 workers were classified as Silver Roll at the peak of construction — ' +
        'primarily Black workers from the West Indies. They built the majority of the canal ' +
        'but received lower pay, worse housing, and were legally barred from Gold Roll facilities. ' +
        'Some Silver Roll workers were paid as little as 10 cents per hour.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 4,
          year: '1908',
          title: 'Gold and Silver',
          subtitle: 'The Two-Tier System',
          body: 'At the height of construction, 45,000 workers labor on the canal. ' +
            'The US has divided them into two classes: the Gold Roll and the Silver Roll. ' +
            'The difference is not about skill or experience. It is about race.',
          duration: 6,
          skipOnInput: true,
        }
      ]
    });
  }

  _buildLevel(physics) {
    const G = this.groundY;

    this.addGround(physics);

    // ── Section 1: Segregated town center (x 0–800) ─────────────────────
    // Two parallel paths — upper (Gold Roll area) and lower (Silver Roll)
    // UPPER path — Gold Roll zone (restricted access)
    this.addPlatform(60, G - 100, 200, { texture: 'wood', color: '#9A7A30', topColor: '#C0A050' });
    this.addPlatform(320, G - 100, 200, { texture: 'wood', color: '#9A7A30', topColor: '#C0A050' });

    // LOWER path — Silver Roll zone
    this.addPlatform(60, G - 40, 180, { texture: 'wood', color: '#6A5A30', topColor: '#7A6A40' });
    this.addPlatform(300, G - 40, 180, { texture: 'wood', color: '#6A5A30', topColor: '#7A6A40' });

    // Wall separating zones (blocks Silver Roll from going up to Gold zone)
    const separatorWall = this.addGate(240, G - 160, 12, 120,
      { color: '#4A3A20', label: 'GOLD ONLY' });

    // Balance puzzle to cross — players must BOTH be equal weight to proceed
    // Metaphor: the only way through the system is together, as equals
    const balancePlate1 = this.addPressurePlate(160, G - 48, 50, {
      requiredCount: 1,
      linkedGate: null,
      label: 'THOMAS HERE',
      momentary: true,
    });
    const balancePlate2 = this.addPressurePlate(370, G - 48, 50, {
      requiredCount: 1,
      linkedGate: null,
      label: 'ROSA HERE',
      momentary: true,
    });

    // When both plates active simultaneously, wall opens
    // This is handled in update() via _bothPlateCheck
    this._balancePlate1 = balancePlate1;
    this._balancePlate2 = balancePlate2;
    this._balanceGate = separatorWall;

    // ── Commissary section (x 500–1200) ──────────────────────────────
    this.addPlatform(550, G - 60, 150, { texture: 'wood', color: '#8A6A30' });
    this.addPlatform(760, G - 60, 120, { texture: 'wood', color: '#8A6A30' });

    // Gold commissary (upper level, blocked)
    this.addPlatform(900, G - 120, 120, { texture: 'wood', color: '#C0A040', topColor: '#E0C060' });

    // Silver commissary line
    this.addPlatform(900, G - 60, 120, { texture: 'wood', color: '#7A6040', topColor: '#8A7050' });

    // Weight balance loading platform puzzle
    const supplyGate = this.addGate(1060, G - 100, 16, 100,
      { color: '#5A4A20', label: 'SUPPLY LOADED' });

    const plate3 = this.addPressurePlate(940, G - 68, 60, {
      requiredCount: 2,
      linkedGate: supplyGate,
      label: 'LOAD TOGETHER',
      momentary: false,
    });

    // ── Section 3: Worker barracks (x 1200–1900) ──────────────────────
    this.addPlatform(1150, G - 50, 120, { texture: 'wood', color: '#8A6A30' });
    this.addPlatform(1320, G - 80, 100, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(1460, G - 60, 120, { texture: 'wood', color: '#8A6A30' });
    this.addPlatform(1620, G - 90, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(1750, G - 60, 120, { texture: 'wood', color: '#8A6A30' });

    // ── Section 4: Construction site (x 1900–2500) ────────────────────
    this.addPlatform(1920, G - 50, 100, { texture: 'stone', color: '#5A5050' });
    this.addPlatform(2060, G - 90, 80, { texture: 'metal', color: '#4A5060' });
    this.addPlatform(2180, G - 60, 100, { texture: 'stone', color: '#5A5050' });
    this.addPlatform(2340, G - 80, 80, { texture: 'metal', color: '#4A5060' });

    // Steam hazards
    this.addHazard(2000, G - 60, 40, 60, { type: 'steam', damage: 6, damageInterval: 0.3 });
    this.addHazard(2120, G - 60, 40, 60, { type: 'steam', damage: 6, damageInterval: 0.3 });

    this.exitX = 2480;

    // ── Signs (the story told through environmental signage) ──────────
    this.addSign(250, G - 120, {
      type: 'notice',
      title: 'GOLD ROLL COMMISSARY',
      text: '"Gold Roll employees only. Menu: Roast beef, potatoes, butter, fresh bread, coffee. ' +
        'Price: 15 cents. — Canal Zone Commissary Division"'
    });
    this.addSign(250, G - 60, {
      type: 'notice',
      title: 'SILVER ROLL COMMISSARY',
      text: '"Silver Roll employees. Menu: Rice, salt fish, no butter. Price: 10 cents. ' +
        'Gold Roll employees not permitted in this line. — Canal Zone Commissary Division"'
    });

    this.addSign(640, G - 70, {
      type: 'memorial',
      title: 'The Division',
      text: '"In the Canal Zone everything was Gold and Silver. ' +
        'Gold water fountains. Silver water fountains. ' +
        'Gold paymaster windows. Silver paymaster windows. ' +
        'Gold post office lines. Silver post office lines." ' +
        '— Oral history, West Indian worker (collected 1970s)'
    });

    this.addSign(1350, G - 100, {
      type: 'notice',
      title: 'Silver Roll Housing',
      text: '"Silver Roll workers are assigned to barracks in Section 9. ' +
        'Each barracks houses 40 workers. Cooking facilities are shared. ' +
        'Gold Roll employees are assigned to individual cottages with screens and running water." ' +
        '— ICC Housing Division, 1907'
    });

    this.addSign(1780, G - 70, {
      type: 'memorial',
      title: 'Who Built the Canal',
      text: '"Of the 56,307 workers who built the Panama Canal, more than 31,000 were classified ' +
        'as Silver Roll. The majority were Black workers from Barbados, Jamaica, and Trinidad. ' +
        'Their names are largely absent from official histories."'
    });

    // ── Collectibles ───────────────────────────────────────────────────
    this.addCollectible(700, G - 80, {
      label: 'Pay Stubs',
      content: '"Marcus Williams (Barbados) — Silver Roll — Grade 7 Laborer: $0.10/hr ' +
        'James MacAllister (Georgia, USA) — Gold Roll — Grade 7 Laborer: $0.16/hr ' +
        'Same work. Same grade. Different pay. Official US government policy."'
    });

    this.addCollectible(1580, G - 100, {
      label: 'Benjamin\'s Letter',
      content: '"I have studied the employment contract carefully. ' +
        'There is nothing in law that requires this distinction. ' +
        'It is custom. American custom, imported from Georgia and Mississippi. ' +
        'We work alongside these men every day. The mountain does not care which roll we are on. ' +
        'Why does the paymaster?" — Benjamin Joseph, Trinidad, 1908'
    });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'benjamin',
      x: 600, y: G - PH,
      displayName: 'Benjamin (Trinidad)',
      dialogueId: 'benjamin_1',
      colors: {
        skin: '#5C3A1E', hair: '#0A0500',
        shirt: '#304080', shirtDark: '#1A2860',
        pants: '#1A1A40',
      },
    });

    this.addNPC({
      id: 'supervisor_4',
      x: 350, y: G - 110,
      displayName: 'Zone Supervisor',
      dialogueId: 'supervisor_4_1',
      colors: {
        skin: '#D4B090', hair: '#8A6030',
        shirt: '#4A3A20', shirtDark: '#2A1A10',
        pants: '#2A2A2A', hat: '#3A2A10', hatDark: '#1A1A08',
      },
    });

    this.addNPC({
      id: 'elder_2',
      x: 1700, y: G - PH,
      displayName: 'Doña María',
      dialogueId: 'dona_maria_1',
      colors: {
        skin: '#A07850', hair: '#FFFFFF',
        shirt: '#882244', shirtDark: '#661022',
        pants: '#2A1810',
      },
    });
  }

  update(dt, players, physics, input) {
    super.update(dt, players, physics, input);
    // Check both balance plates — when both active, open the separator gate
    if (this._balancePlate1 && this._balancePlate2 && this._balanceGate) {
      this._balanceGate.open = this._balancePlate1.activated && this._balancePlate2.activated;
    }
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── Zone Supervisor ──────────────────────────────────────────────
      {
        id: 'supervisor_4_1',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'Zone Supervisor (Atlanta, GA)',
        text: 'Gold Roll employees use that door. Silver Roll employees use the other door. This isn\'t personal — it\'s policy. I didn\'t write it.',
        nextNodeId: 'supervisor_4_2',
      },
      {
        id: 'supervisor_4_2',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'Zone Supervisor',
        text: 'Look, I\'m just enforcing ICC regulations. The Gold/Silver classification is based on... skill level and... employment category. It\'s administrative.',
        nextNodeId: 'supervisor_4_choice',
      },
      {
        id: 'supervisor_4_choice',
        type: 'choice', speakerId: 'thomas', speakerName: 'Thomas',
        text: 'Respond:',
        choices: [
          {
            text: '"My friend Rosa and I do the same job as the Gold Roll men. We\'ve seen their work orders."',
            nextNodeId: 'supervisor_caught',
            triggers: [{ type: 'set_flag', key: 'confronted_supervisor' }],
          },
          {
            text: '(Say nothing. Move on.)',
            nextNodeId: 'supervisor_dismissed',
          },
        ],
      },
      {
        id: 'supervisor_caught',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'Zone Supervisor',
        text: '(Flustered) You need to be careful about the tone you take. You\'ve got a good job here. Don\'t make it difficult.',
        nextNodeId: null,
      },
      {
        id: 'supervisor_dismissed',
        type: 'dialogue', speakerId: 'supervisor',
        speakerName: 'Zone Supervisor',
        text: 'Good. Now get to work.',
        nextNodeId: null,
      },
      // ── Benjamin ──────────────────────────────────────────────────────
      {
        id: 'benjamin_1',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Benjamin Joseph (Trinidad)',
        text: 'I have been studying their legal documents. The Gold/Silver distinction — there is no engineering reason for it. None. I can read. I read their engineering manuals. I can operate every machine on this site.',
        nextNodeId: 'benjamin_2',
      },
      {
        id: 'benjamin_2',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Benjamin Joseph (Trinidad)',
        text: 'They brought this system from Alabama and Georgia. Those places call it something different, but it is the same mathematics: your labor is worth less because of your face.',
        nextNodeId: 'benjamin_3',
      },
      {
        id: 'benjamin_3',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Benjamin Joseph (Trinidad)',
        text: 'What they do not understand: we remember everything. Every name, every injustice, every year. We are building this canal. When the history books are written — WE built this canal.',
        nextNodeId: 'benjamin_narration',
      },
      {
        id: 'benjamin_narration',
        type: 'narration',
        text: 'Of the 56,307 workers who built the Panama Canal, more than 31,000 were classified as Silver Roll. ' +
          'The majority were Black workers from the West Indies. Their average pay was 10 cents per hour. ' +
          'Gold Roll workers doing identical work received 16 cents per hour — plus better housing, food, and facilities. ' +
          'This policy was in effect from 1904 to 1955.',
        duration: 8,
        skipOnInput: true,
        nextNodeId: null,
      },
      // ── Doña María ───────────────────────────────────────────────────
      {
        id: 'dona_maria_1',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Doña María',
        text: 'My husband works the dynamite line. He is very skilled — they will not let him advance past Grade 6 because he is Silver Roll. A white American with half his skill is Grade 9.',
        nextNodeId: 'dona_maria_2',
      },
      {
        id: 'dona_maria_2',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Doña María',
        text: 'I do not hate the Americans. I hate the system. And I know the difference. Systems are built. Systems can be torn down. It takes longer. But it happens.',
        nextNodeId: null,
      },
    ];
  }
}
