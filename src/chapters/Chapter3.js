/**
 * Chapter 3: "American Ambition" — The Americans Arrive (1904)
 *
 * History: After the French bankruptcy, the US bought the rights for $40M.
 * Panama declared independence from Colombia in 1903 — with direct US support
 * (a US warship blocked Colombia from landing troops). Dr. William Gorgas
 * implemented Finlay's mosquito theory and eliminated yellow fever in 18 months.
 * But America also imported Jim Crow-style racial segregation to the canal zone.
 */
class Chapter3 extends Chapter {
  constructor() {
    super({
      id: 'ch03',
      num: 3,
      title: 'American Ambition',
      subtitle: 'The Americans Arrive',
      year: '1904',
      bgType: 'construction',
      levelWidth: 2500,
      groundY: 320,
      exitCondition: 'reach_end',
      footnote: 'Panama declared independence from Colombia on November 3, 1903. ' +
        'A US warship, the USS Nashville, prevented Colombian troops from landing to suppress the revolt. ' +
        '15 days later, the US and Panama signed a treaty giving America control of the canal zone — ' +
        'in perpetuity. Panama received $10 million and an annual payment of $250,000.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 3,
          year: '1904',
          title: 'American Ambition',
          subtitle: 'The Americans Arrive',
          body: 'The French have failed. The United States, under President Theodore Roosevelt, ' +
            'buys the remains of the project for $40 million. ' +
            'Panama, newly independent from Colombia with American help, ' +
            'signs a treaty granting the US control of the canal zone — forever.',
          duration: 7,
          skipOnInput: true,
        }
      ]
    });
  }

  _buildLevel(physics) {
    const G = this.groundY;

    this.addGround(physics);

    // ── Section 1: New American Canal Zone (x 0–700) ────────────────────
    // Freshly-built wooden structures
    this.addPlatform(120, G - 60, 100, { texture: 'wood', color: '#8A6A30' });
    this.addPlatform(270, G - 80, 80, { texture: 'wood', color: '#8A6A30' });
    this.addPlatform(400, G - 50, 120, { texture: 'stone', color: '#5A5A5A' });

    // Stagnant ponds from French era — still present
    this.addHazard(160, G - 16, 80, 16,
      { type: 'water', damage: 1, damageInterval: 1, warnLabel: 'OLD BREEDING GROUND' });
    this.addHazard(350, G - 16, 60, 16,
      { type: 'mosquito', damage: 4, damageInterval: 0.5 });

    // ── Drainage puzzle: both players operate pump stations ─────────────
    // Gate blocked by standing water
    const drainGate = this.addGate(580, G - 130, 16, 130, { color: '#5A7A50', label: 'DRAIN COMPLETE' });

    // Two cranks on opposite sides of the pool
    this._drainCrankA = this.addCrank(480, G - 80, {
      linkedGate: null,
      label: 'PUMP A',
      required: Math.PI * 3,
    });
    this._drainCrankB = this.addCrank(700, G - 80, {
      linkedGate: null,
      label: 'PUMP B',
      required: Math.PI * 3,
    });
    this._drainGate = drainGate;

    // ── Section 2: Medical camp (x 700–1400) ────────────────────────────
    this.addPlatform(660, G - 50, 120, { texture: 'stone', color: '#5A5A5A' });
    this.addPlatform(830, G - 80, 80, { texture: 'wood', color: '#9A8060' });
    this.addPlatform(960, G - 60, 100, { texture: 'stone', color: '#5A5A5A' });
    this.addPlatform(1120, G - 100, 80, { texture: 'wood', color: '#9A8060' });
    this.addPlatform(1260, G - 70, 100, { texture: 'stone', color: '#5A5A5A' });

    // Fumigation kit collectible on high platform
    this.addPlatform(1000, G - 160, 50, { texture: 'wood', color: '#9A8060' });

    // ── Section 3: Construction begins (x 1400–2400) ────────────────────
    this.addPlatform(1400, G - 50, 120, { texture: 'stone', color: '#5A5050' });
    this.addPlatform(1560, G - 90, 80, { texture: 'metal', color: '#4A5060' });
    this.addPlatform(1680, G - 60, 100, { texture: 'stone', color: '#5A5050' });

    // Steam construction hazards
    this.addHazard(1760, G - 60, 40, 60, { type: 'steam', damage: 6, damageInterval: 0.3, warnLabel: 'STEAM PIPE' });
    this.addHazard(1900, G - 60, 40, 60, { type: 'steam', damage: 6, damageInterval: 0.3 });

    this.addPlatform(1820, G - 100, 60, { texture: 'metal', color: '#4A5060' });
    this.addPlatform(1960, G - 60, 120, { texture: 'stone', color: '#5A5050' });
    this.addPlatform(2120, G - 80, 80, { texture: 'metal', color: '#4A5060' });
    this.addPlatform(2260, G - 50, 120, { texture: 'stone', color: '#5A5050' });

    // Rope pull — hauling construction equipment
    const liftGate = this.addGate(2150, G - 120, 16, 120, { color: '#4A5060' });
    const rope = this.addRopePull(
      2090, G - 90,
      2240, G - 90,
      { targetTension: 0.7, tolerance: 0.2, requiredHold: 2.0, linkedGate: liftGate }
    );

    this.exitX = 2400;

    // ── Signs ──────────────────────────────────────────────────────────
    this.addSign(200, G - 80, {
      type: 'notice',
      title: 'Treaty of 1903',
      text: '"The Republic of Panama grants to the United States in perpetuity the use, occupation and control of a zone of land... for the construction, maintenance, operation, sanitation and protection of said Canal."'
    });

    this.addSign(830, G - 100, {
      type: 'notice',
      title: 'Gorgas Order: 1904',
      text: '"ALL standing water within 200 yards of any dwelling is to be drained, oiled, or filled. ' +
        'Window screens are MANDATORY on all structures. ' +
        'The mosquito is the enemy. This is a military campaign against an insect." ' +
        '— Col. W.C. Gorgas, Chief Sanitary Officer'
    });

    this.addSign(1300, G - 80, {
      type: 'notice',
      title: 'Paymaster\'s Bulletin',
      text: '"Effective immediately, all employees are classified as follows: ' +
        'GOLD ROLL — American citizens, paid in gold. ' +
        'SILVER ROLL — All other employees, paid in silver. ' +
        'Separate facilities will be maintained for each classification." ' +
        '— Isthmian Canal Commission, 1904'
    });

    // ── Collectibles ───────────────────────────────────────────────────
    this.addCollectible(1020, G - 200, {
      label: 'Fumigation Report',
      content: '"Month 6 of Operation Mosquito: Zero new cases of yellow fever this week. ' +
        'First time since construction began. Col. Gorgas\'s methods are working. ' +
        'Total cost of sanitation campaign: $1 million. ' +
        'Estimated lives saved: 30,000." — U.S. Army Medical Report, 1906'
    });

    this.addCollectible(1680, G - 80, {
      label: 'Roosevelt\'s Letter',
      content: '"I am interested in the Canal as a matter for the United States. ' +
        'The Colombians were unreasonable and impossible to deal with. ' +
        'I am delighted with the result." — Theodore Roosevelt, 1904 ' +
        '(Colombia had rejected the US treaty offer. The US then supported Panama\'s secession.)'
    });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'gorgas',
      x: 880, y: G - PH,
      displayName: 'Col. Gorgas',
      dialogueId: 'gorgas_1',
      colors: {
        skin: '#D4B090', hair: '#7A5A30',
        shirt: '#4A6A30', shirtDark: '#3A5020',
        pants: '#2A3A20', hat: '#3A5020', hatDark: '#2A4010',
      },
    });

    this.addNPC({
      id: 'canal_worker_3',
      x: 1500, y: G - PH,
      displayName: 'West Indian Worker',
      dialogueId: 'west_indian_1',
      colors: {
        skin: '#5C3A1E', hair: '#0A0500',
        shirt: '#887840', shirtDark: '#6A5820',
        pants: '#2A2A2A', hat: '#7A6020', hatDark: '#5A4010',
      },
    });

    this.addNPC({
      id: 'panamanian_elder',
      x: 2100, y: G - PH,
      displayName: 'Panamanian Elder',
      dialogueId: 'panamanian_elder_1',
      colors: {
        skin: '#A07850', hair: '#FFFFFF',
        shirt: '#6A4A20', shirtDark: '#4A2A10',
        pants: '#3A2A10',
      },
    });
  }

  update(dt, players, physics, input) {
    super.update(dt, players, physics, input);
    // Paired drain pumps: both cranks must complete to open drain gate
    if (this._drainCrankA && this._drainCrankB && this._drainGate) {
      if (this._drainCrankA.complete && this._drainCrankB.complete) {
        this._drainGate.open = true;
      }
    }
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── Gorgas ───────────────────────────────────────────────────────
      {
        id: 'gorgas_1',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Col. William Gorgas',
        text: 'You two look healthy. Good. I plan to keep you that way. The French lost 22,000 people. We are not repeating that history.',
        nextNodeId: 'gorgas_2',
      },
      {
        id: 'gorgas_2',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Col. William Gorgas',
        text: 'A Cuban physician named Finlay told the French that the mosquito spreads yellow fever. They ignored him. I read his work. He was right. We are going to eliminate every mosquito breeding ground in this zone.',
        nextNodeId: 'gorgas_3',
      },
      {
        id: 'gorgas_3',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Col. William Gorgas',
        text: 'I need you to help drain those old French basins. It is not glamorous work. But it will save more lives than any surgery I will ever perform.',
        nextNodeId: 'gorgas_choice',
      },
      {
        id: 'gorgas_choice',
        type: 'choice', speakerId: 'thomas', speakerName: 'Thomas',
        text: 'What do you want to say?',
        choices: [
          {
            text: '"What about the Gold Roll and Silver Roll we\'ve heard about?"',
            nextNodeId: 'gorgas_race_question',
          },
          {
            text: '"We\'ll help. Show us the pumps."',
            nextNodeId: 'gorgas_work',
          },
        ],
      },
      {
        id: 'gorgas_race_question',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Col. William Gorgas',
        text: '(Pause) The pay classification is... the ICC\'s decision. Not mine. I treat every worker the same in my medical work. Yellow fever does not read payroll classifications. The rest... is above my authority.',
        nextNodeId: null,
      },
      {
        id: 'gorgas_work',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Col. William Gorgas',
        text: 'Good. Drain pump A is to the west, B is to the east. Both must be operated simultaneously — they\'re linked. Bring a partner.',
        nextNodeId: null,
      },
      // ── West Indian Worker ───────────────────────────────────────────
      {
        id: 'west_indian_1',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Nathaniel (Barbados)',
        text: 'I came from Bridgetown six months ago. Good wages, they said. They did not say they\'d be SILVER wages and the Americans get GOLD.',
        nextNodeId: 'west_indian_2',
      },
      {
        id: 'west_indian_2',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Nathaniel (Barbados)',
        text: 'Same work. Same hours. Same jungle. But at the commissary they have two lines — one for Gold Roll, one for Silver Roll. The Gold Roll line has butter. We don\'t get butter.',
        nextNodeId: 'west_indian_3',
      },
      {
        id: 'west_indian_3',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Nathaniel (Barbados)',
        text: 'I am not complaining about butter. I am saying — I came here because I believed there was dignity in building something this large. The butter is just... a symbol.',
        nextNodeId: null,
      },
      // ── Panamanian Elder ─────────────────────────────────────────────
      {
        id: 'panamanian_elder_1',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Doña Carmen',
        text: 'My father remembered the French. My children will remember the Americans. Different flags. Same story.',
        nextNodeId: 'panamanian_elder_2',
      },
      {
        id: 'panamanian_elder_2',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Doña Carmen',
        text: 'Our new nation was three weeks old when they made us sign that treaty. Three weeks. The ink on our independence papers was not yet dry. They call it a partnership.',
        nextNodeId: 'panamanian_elder_3',
      },
      {
        id: 'panamanian_elder_3',
        type: 'dialogue', speakerId: 'elder',
        speakerName: 'Doña Carmen',
        text: 'But we are not partners. We are the land. They are building their canal on our spine. I want them to build it — the world needs this canal. But I also want us to own it. Someday.',
        nextNodeId: null,
      },
    ];
  }
}
