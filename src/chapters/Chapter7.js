/**
 * Chapter 7: "El Canal es Nuestro" — Our Canal (1964–1999)
 *
 * History:
 * - January 9, 1964 (Martyrs' Day): Panamanian students tried to raise Panama's flag
 *   in the US-controlled Canal Zone. Riots broke out. 21 Panamanians and 4 US soldiers
 *   died. Panama broke diplomatic relations with the US.
 * - 1977: President Carter and Gen. Omar Torrijos signed two treaties:
 *   Panama Canal Treaty (transferring control by December 31, 1999)
 *   and the Neutrality Treaty.
 * - December 31, 1999 at noon: Full control transferred to Panama.
 *   President Mireya Moscoso presided. The US flag came down.
 *   Panama's flag went up.
 */
class Chapter7 extends Chapter {
  constructor() {
    super({
      id: 'ch07',
      num: 7,
      title: 'El Canal es Nuestro',
      subtitle: 'Our Canal',
      year: '1964–1999',
      bgType: 'city',
      levelWidth: 3000,
      groundY: 310,
      exitCondition: 'reach_end',
      footnote: 'On December 31, 1999 at 12:00 PM, the Panama Canal was transferred to the ' +
        'Republic of Panama. Panama\'s Canal Authority (ACP) has operated it ever since, ' +
        'with one of the best safety records of any waterway in the world. ' +
        'January 9th is now celebrated as Martyrs\' Day — a national holiday in Panama.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 7,
          year: '1964 — 1999',
          title: 'El Canal es Nuestro',
          subtitle: 'Our Canal',
          body: 'The canal has operated for 50 years. But the land belongs to Panama, ' +
            'and the canal does not. ' +
            'On January 9, 1964, Panamanian students decide to change that — ' +
            'by raising a flag.',
          duration: 7,
          skipOnInput: true,
        }
      ]
    });
    this._section = 0; // 0 = 1964 riots, 1 = 1977 treaty, 2 = 1999 handover
    this._flagPole1 = null;
    this._flagPole2 = null;
    this._crank1Complete = false;
    this._crank2Complete = false;
    this._finalFlagRaised = false;
  }

  _buildLevel(physics) {
    const G = this.groundY;

    this.addGround(physics);

    // ══ SECTION A: 1964 Riots (x 0–900) ════════════════════════════════

    // City street / canal zone fence line
    this.addPlatform(80, G - 50, 120, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(260, G - 70, 80, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(400, G - 50, 100, { texture: 'stone', color: '#5A5A60' });

    // Canal zone fence (symbolic barrier)
    const fenceGate = this.addGate(510, G - 140, 16, 140, { color: '#888880', label: 'ZONE FENCE' });

    // Pressure plate — both students together to push through fence
    const fencePlate = this.addPressurePlate(420, G - 58, 80, {
      requiredCount: 2,
      linkedGate: fenceGate,
      label: 'PUSH TOGETHER',
      momentary: false,
    });

    this.addPlatform(580, G - 70, 100, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(740, G - 90, 80, { texture: 'stone', color: '#5A5A60' });

    // Crank pair — raise the 1964 flag together
    const flagGate = this.addGate(800, G - 160, 16, 160, { color: '#0038A8', label: 'FLAG POLE' });

    this._crank1 = this.addCrank(750, G - 120, {
      linkedGate: null,
      label: 'HOIST',
      required: Math.PI * 3,
    });
    this._crank2 = this.addCrank(850, G - 50, {
      linkedGate: null,
      label: 'TENSION',
      required: Math.PI * 3,
    });
    this._flagCrankGate = flagGate;

    // ── Transition zone (900–1100) ─────────────────────────────────────
    this.addPlatform(900, G - 60, 200, { texture: 'stone', color: '#5A5A60' });
    // Year transition sign
    this.addSign(960, G - 70, {
      type: 'notice',
      title: '→ 1977',
      text: '"13 years of negotiations. President Carter and General Torrijos are meeting today."'
    });

    // ══ SECTION B: 1977 Treaty (x 1100–1900) ═══════════════════════════

    this.addPlatform(1140, G - 60, 100, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(1300, G - 80, 80, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(1440, G - 60, 100, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(1600, G - 90, 80, { texture: 'stone', color: '#5A5A60' });
    this.addPlatform(1740, G - 60, 100, { texture: 'stone', color: '#5A5A60' });

    // Rope pull — signing the treaty (both pull it across)
    const treatyGate = this.addGate(1620, G - 120, 16, 120, { color: '#446A20', label: 'TREATY' });
    const treatyRope = this.addRopePull(
      1540, G - 90,
      1700, G - 90,
      { targetTension: 0.65, tolerance: 0.2, requiredHold: 2.5, linkedGate: treatyGate }
    );

    // ── Transition zone (1900–2100) ─────────────────────────────────────
    this.addPlatform(1920, G - 60, 200, { texture: 'stone', color: '#5A5060' });
    this.addSign(1960, G - 70, {
      type: 'notice',
      title: '→ December 31, 1999',
      text: '"22 years later. The day has come. Noon. The canal transfers to Panama."'
    });

    // ══ SECTION C: 1999 Handover (x 2100–2900) ══════════════════════════

    // Miraflores Locks ceremony
    this.addPlatform(2140, G - 60, 100, { texture: 'stone', color: '#5A5060' });
    this.addPlatform(2300, G - 80, 80, { texture: 'stone', color: '#5A5060' });
    this.addPlatform(2440, G - 100, 100, { texture: 'stone', color: '#5A5060' });
    this.addPlatform(2600, G - 120, 120, { texture: 'stone', color: '#6A6A70' });

    // Final flag pole — the handover ceremony
    // All mechanics from the game in one final sequence
    const finalPlate1 = this.addPressurePlate(2650, G - 128, 50, {
      requiredCount: 1, linkedGate: null, label: 'P1 READY', momentary: true,
    });
    const finalPlate2 = this.addPressurePlate(2750, G - 128, 50, {
      requiredCount: 1, linkedGate: null, label: 'P2 READY', momentary: true,
    });
    this._finalPlate1 = finalPlate1;
    this._finalPlate2 = finalPlate2;

    // When both step on: final cutscene flag raise
    this.exitX = 2880;

    // ── Signs ──────────────────────────────────────────────────────────
    this.addSign(180, G - 70, {
      type: 'memorial',
      title: 'January 9, 1964',
      text: '"Students from the Instituto Nacional marched to raise Panama\'s flag in the Canal Zone. ' +
        'US soldiers refused. Riots broke out. 21 Panamanians died. ' +
        'Flags can start revolutions."'
    });

    this.addSign(680, G - 110, {
      type: 'notice',
      title: 'Martyrs\' Day',
      text: '"The students\' names: Ascanio Arosemena. Ezequiel González Meneses. ' +
        'Carlos Renato Orjuela. Rodolfo Sánchez. Victoriano Lorenzo Ortega... ' +
        '(17 more names follow) ' +
        'January 9 is now Panama\'s Martyrs\' Day. A national holiday."'
    });

    this.addSign(1330, G - 100, {
      type: 'notice',
      title: 'Carter-Torrijos Treaties, 1977',
      text: '"The United States of America and the Republic of Panama have concluded ' +
        'two new treaties which will provide for a complete transfer of Canal ' +
        'control to Panama by December 31, 1999." ' +
        '— Joint Announcement, September 7, 1977'
    });

    this.addSign(1700, G - 80, {
      type: 'notice',
      title: 'What Torrijos Said',
      text: '"We are not abolishing the canal — we are recovering our dignity. ' +
        'The canal is in our blood; it runs through our history; ' +
        'it is part of our present and will be part of our future." ' +
        '— Gen. Omar Torrijos, 1977'
    });

    this.addSign(2160, G - 80, {
      type: 'memorial',
      title: 'December 31, 1999',
      text: '"At 11:59:59 AM, the Panama Canal was an American waterway. ' +
        'At 12:00:00 PM, it was Panamanian. ' +
        'One second. A century of struggle."'
    });

    this.addSign(2640, G - 140, {
      type: 'wood',
      title: 'The Ceremony',
      text: '"Both of you — step up together. ' +
        'This flag goes up the same way the canal was built: ' +
        'by people working together. ' +
        'You know how to do this."'
    });

    // ── Collectibles ───────────────────────────────────────────────────
    this.addCollectible(350, G - 80, {
      label: 'Student\'s Armband',
      content: '"This armband was worn by a student in the 1964 march. ' +
        'It reads: \'La Zona del Canal es territorio panameño.\' ' +
        '(The Canal Zone is Panamanian territory.) ' +
        'The student who wore this was 17 years old."'
    });

    this.addCollectible(1200, G - 90, {
      label: 'Treaty Document',
      content: '"The Panama Canal Treaty shall enter into force simultaneously with ' +
        'the Permanent Neutrality Treaty... The Canal shall be permanently neutral ' +
        'after December 31, 1999, while the Republic of Panama shall administer, ' +
        'operate and maintain the Canal." — Treaty text, 1977'
    });

    this.addCollectible(2400, G - 120, {
      label: 'Moscoso\'s Speech',
      content: '"Today the Panamanian people have reaffirmed their love of peace ' +
        'and democracy and show to the world that they are ready to assume fully ' +
        'the responsibilities that this canal represents. ' +
        'This canal is, above all, our canal." ' +
        '— President Mireya Moscoso, December 31, 1999'
    });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'student_martyr',
      x: 300, y: G - PH,
      displayName: 'Ascanio (1964)',
      dialogueId: 'ascanio_1',
      colors: {
        skin: '#8A6040', hair: '#0A0500',
        shirt: '#0038A8', shirtDark: '#002280',
        pants: '#1A1A2A',
      },
    });

    this.addNPC({
      id: 'torrijos',
      x: 1460, y: G - PH,
      displayName: 'Gen. Torrijos',
      dialogueId: 'torrijos_1',
      colors: {
        skin: '#8A6040', hair: '#1A0A00',
        shirt: '#3A6A30', shirtDark: '#2A5020',
        pants: '#1A3020', hat: '#2A5020', hatDark: '#1A3010',
      },
    });

    this.addNPC({
      id: 'moscoso',
      x: 2500, y: G - PH,
      displayName: 'President Moscoso',
      dialogueId: 'moscoso_1',
      colors: {
        skin: '#C4956A', hair: '#1A0A00',
        shirt: '#AA2222', shirtDark: '#881010',
        pants: '#1A1A2A',
      },
    });
  }

  update(dt, players, physics, input) {
    super.update(dt, players, physics, input);

    // Check final plates — when both active, trigger ending
    if (this._finalPlate1 && this._finalPlate2 && !this._finalFlagRaised) {
      if (this._finalPlate1.activated && this._finalPlate2.activated) {
        this._finalFlagRaised = true;
        this._triggerExit();
      }
    }

    // Check crank pair for 1964 flag
    if (this._flagCrankGate && this._crank1 && this._crank2) {
      if (this._crank1.complete && this._crank2.complete) {
        this._flagCrankGate.open = true;
      }
    }
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── Ascanio ────────────────────────────────────────────────────────
      {
        id: 'ascanio_1',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Ascanio (Student, 1964)',
        text: 'We are going to raise our flag in the Canal Zone today. There is a treaty that says we can fly it alongside the American flag. They have been refusing for weeks.',
        nextNodeId: 'ascanio_2',
      },
      {
        id: 'ascanio_2',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Ascanio (Student, 1964)',
        text: 'It is just a flag. That is what they will say. But a flag is not just a flag. A flag says: we exist. We belong here. This is ours.',
        nextNodeId: 'ascanio_3',
      },
      {
        id: 'ascanio_3',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Ascanio (Student, 1964)',
        text: 'I know it might get dangerous. That is okay. Some things are worth the danger. My grandfather helped build this canal. My country has a right to stand on its own soil and fly its own flag.',
        nextNodeId: 'ascanio_choice',
      },
      {
        id: 'ascanio_choice',
        type: 'choice', speakerId: 'rosa', speakerName: 'Rosa',
        text: 'What do you say?',
        choices: [
          {
            text: '"We\'re with you. Let\'s go."',
            nextNodeId: 'ascanio_together',
            triggers: [{ type: 'set_flag', key: 'joined_students' }],
          },
          {
            text: '"Is this really the right moment for this?"',
            nextNodeId: 'ascanio_questioned',
          },
        ],
      },
      {
        id: 'ascanio_together',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Ascanio',
        text: 'Then come on. All of Panama is watching.',
        nextNodeId: 'ascanio_narration',
      },
      {
        id: 'ascanio_questioned',
        type: 'dialogue', speakerId: 'thomas',
        speakerName: 'Ascanio',
        text: 'The right moment? We have been waiting for the right moment for 60 years. There is no right moment. There is only the moment that is now.',
        nextNodeId: 'ascanio_narration',
      },
      {
        id: 'ascanio_narration',
        type: 'narration',
        text: 'January 9, 1964. Panama City. ' +
          'Panamanian students entered the Canal Zone to raise their flag. ' +
          'Confrontations escalated. Police and rioters clashed across the zone boundary. ' +
          '21 Panamanians and 4 US soldiers were killed. ' +
          'Panama broke diplomatic relations with the United States.',
        duration: 8,
        skipOnInput: true,
        nextNodeId: null,
      },
      // ── Torrijos ──────────────────────────────────────────────────────
      {
        id: 'torrijos_1',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Gen. Omar Torrijos',
        text: 'I am not an ideologue. I am a Panamanian. The canal was built on our land by our people — and by the people from the Caribbean who came and never left, because this became their home too.',
        nextNodeId: 'torrijos_2',
      },
      {
        id: 'torrijos_2',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Gen. Omar Torrijos',
        text: 'Carter and I have agreed on two treaties. In 1999, Panama will control its canal. It took blood and patience to get here — the blood of the January 9 martyrs, and 13 years of negotiating.',
        nextNodeId: 'torrijos_3',
      },
      {
        id: 'torrijos_3',
        type: 'dialogue', speakerId: 'gorgas',
        speakerName: 'Gen. Omar Torrijos',
        text: 'To the Panamanians who built this canal as Silver Roll workers — to the families whose homes are under Gatun Lake — this handover is for them. History is slow. But it moves.',
        nextNodeId: null,
      },
      // ── Moscoso ──────────────────────────────────────────────────────
      {
        id: 'moscoso_1',
        type: 'dialogue', speakerId: 'moscoso',
        speakerName: 'President Mireya Moscoso',
        text: 'Today is the day. At noon, the canal transfers to Panama. I want you to understand what that means — not politically, but historically.',
        nextNodeId: 'moscoso_2',
      },
      {
        id: 'moscoso_2',
        type: 'dialogue', speakerId: 'moscoso',
        speakerName: 'President Moscoso',
        text: 'It means that the workers who built this and were never given their names in the history books — their descendants now run it. That is not just irony. That is justice.',
        nextNodeId: 'moscoso_3',
      },
      {
        id: 'moscoso_3',
        type: 'dialogue', speakerId: 'moscoso',
        speakerName: 'President Moscoso',
        text: 'The flag goes up at noon. I need you both to raise it. That is not symbolic — every flag here needs two hands. It always has.',
        nextNodeId: 'moscoso_final_narration',
      },
      {
        id: 'moscoso_final_narration',
        type: 'narration',
        text: 'December 31, 1999. 12:00 PM. ' +
          'The Panama Canal was transferred to the Republic of Panama. ' +
          'It has been operated by Panamanians ever since — ' +
          'with one of the best safety records of any waterway in the world. ' +
          'The canal that was built on the bodies and labor of thousands of people from dozens of nations ' +
          'finally belongs to the land it runs through.',
        duration: 10,
        skipOnInput: true,
        nextNodeId: null,
      },
    ];
  }
}
