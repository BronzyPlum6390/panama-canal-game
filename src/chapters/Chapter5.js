/**
 * Chapter 5: "Corte Culebra" — The Cut (1910–1913)
 *
 * History: The Culebra Cut (later renamed Gaillard Cut) was 9 miles of
 * excavation through the Continental Divide. 100+ steam shovels, 61 million
 * pounds of dynamite, and workers from 97 countries. Landslides constantly
 * refilled the cut — sometimes overnight. George Goethals drove the project
 * with iron will. It remains one of the greatest engineering feats in history.
 */
class Chapter5 extends Chapter {
  constructor() {
    super({
      id: 'ch05',
      num: 5,
      title: 'Corte Culebra',
      subtitle: 'The Cut',
      year: '1910',
      bgType: 'construction',
      levelWidth: 2800,
      groundY: 320,
      exitCondition: 'reach_end',
      footnote: 'The Culebra Cut moved over 232 million cubic yards of earth and rock — ' +
        'enough to build the Great Wall of China four times. ' +
        'Workers from 97 countries participated. Despite the engineering triumph, ' +
        'mudslides remained a constant threat. One slide in 1907 undid 6 months of work in a single night.',
      introCards: [
        {
          style: 'chapter_card',
          chapterNum: 5,
          year: '1910',
          title: 'Corte Culebra',
          subtitle: 'The Cut',
          body: 'The heart of the canal: nine miles of mountain must be cut through. ' +
            '100 steam shovels work day and night. 61 million pounds of dynamite. ' +
            'And the mountain fights back — with mud.',
          duration: 6,
          skipOnInput: true,
        }
      ]
    });
    this._mudslideTriggered = false;
    this._leverSequence = null;
    this._leverCorrectOrder = [2, 0, 1, 3]; // indices into this._levers
    this._leverCurrentIdx = 0;
    this._levers = [];
  }

  _buildLevel(physics) {
    const G = this.groundY;

    this.addGround(physics);

    // ── Section 1: Approach (x 0–600) ───────────────────────────────────
    this.addPlatform(80, G - 50, 100, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(230, G - 80, 80, { texture: 'dirt', color: '#6A4A20' });
    this.addPlatform(370, G - 100, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(490, G - 70, 100, { texture: 'stone', color: '#5A5040' });

    // Steam shovels (decorative hazard areas)
    this.addHazard(140, G - 50, 50, 50, { type: 'steam', damage: 5, damageInterval: 0.4, warnLabel: 'HOT EXHAUST' });

    // ── Section 2: Deep cut entrance (x 600–1200) ───────────────────────
    // The cut walls — very high terrain on both sides
    this.addPlatform(0, 0, 40, G - 20, { texture: 'stone', color: '#4A4A30' }); // left wall
    this.addPlatform(this.levelWidth - 40, 0, 40, G - 20, { texture: 'stone', color: '#4A4A30' });

    this.addPlatform(600, G - 60, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(720, G - 100, 60, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(840, G - 70, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(980, G - 120, 60, { texture: 'stone', color: '#4A4030' });

    // Crank puzzle: lock mechanism on blasting door
    const blastGate = this.addGate(1060, G - 140, 16, 140, { color: '#4A3820', label: 'BLAST DOOR' });
    this._blastCrankA = this.addCrank(1000, G - 130, { linkedGate: null, label: 'LOCK A', required: Math.PI * 4 });
    this._blastCrankB = this.addCrank(1100, G - 50, { linkedGate: null, label: 'LOCK B', required: Math.PI * 4 });
    this._blastGate = blastGate;

    // ── Section 3: Lever sequence zone (mudslide escape) ────────────────
    // Players must pull levers in correct order to survive mudslide
    this.addPlatform(1140, G - 60, 100, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(1300, G - 90, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(1430, G - 120, 80, { texture: 'stone', color: '#4A4030' });
    this.addPlatform(1560, G - 90, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(1680, G - 60, 100, { texture: 'stone', color: '#5A5040' });

    // 4 levers scattered across this section — sequence puzzle
    const lever0 = this.addLever(1200, G - 100, { label: 'GATE A', sequenceId: 'mudslide', sequenceIdx: 0, color: '#4488FF' });
    const lever1 = this.addLever(1380, G - 130, { label: 'GATE B', sequenceId: 'mudslide', sequenceIdx: 1, color: '#4488FF' });
    const lever2 = this.addLever(1500, G - 160, { label: 'GATE C', sequenceId: 'mudslide', sequenceIdx: 2, color: '#FF8844' });
    const lever3 = this.addLever(1720, G - 100, { label: 'GATE D', sequenceId: 'mudslide', sequenceIdx: 3, color: '#FF8844' });

    this._levers = [lever0, lever1, lever2, lever3];

    // Mudslide hazard that gets redirected by levers
    const mudslide = this.addHazard(1400, G - 200, 200, 30,
      { type: 'mudslide', damage: 20, damageInterval: 0.1, warnLabel: 'MUDSLIDE!' });
    mudslide.active = false; // activated by trigger
    this._mudslideHazard = mudslide;
    this._mudslideArea = { x: 1400, y: G - 200, w: 200, h: 200 };

    // ── Section 4: Post-slide (x 1800–2700) ─────────────────────────────
    this.addPlatform(1820, G - 50, 100, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(1970, G - 90, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(2100, G - 60, 100, { texture: 'dirt', color: '#6A4A20' });
    this.addPlatform(2260, G - 100, 80, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(2380, G - 70, 100, { texture: 'stone', color: '#5A5040' });
    this.addPlatform(2540, G - 50, 120, { texture: 'stone', color: '#5A5040' });

    // Moving platform (construction lift)
    const liftPlat = this.addPlatform(2100, G - 120, 60, { type: 'moving', texture: 'metal', color: '#4A5060' });
    liftPlat.type = 'moving';
    liftPlat.movePoints = [{ x: 2100, y: G - 120 }, { x: 2100, y: G - 220 }];
    liftPlat.moveSpeed = 30;

    this.exitX = 2700;

    // ── Signs ──────────────────────────────────────────────────────────
    this.addSign(350, G - 110, {
      type: 'notice',
      title: 'Work Orders — The Cut',
      text: '"Daily quota: 5,000 cubic yards per shovel. Night shift continues. ' +
        'All workers report to Shift Foreman Wilson before 5am. ' +
        'Do NOT enter marked blast zones. Bodies will NOT be recovered." ' +
        '— Culebra Cut Division, 1910'
    });

    this.addSign(940, G - 80, {
      type: 'memorial',
      title: 'The Slides',
      text: '"The mountain breathes, the old workers say. What they dig by day, ' +
        'the mountain fills by night. On October 4, 1907, a slide moved ' +
        '500,000 cubic yards in one hour. Six weeks of work. Gone."'
    });

    this.addSign(1760, G - 80, {
      type: 'notice',
      title: 'Goethals\' Notice',
      text: '"To all workers: The slide of September 3rd has set us back 8 weeks. ' +
        'We will recover those 8 weeks. I do not accept the mountain as our master. ' +
        'We proceed." — Col. George Goethals, Chief Engineer'
    });

    // ── Collectibles ───────────────────────────────────────────────────
    this.addCollectible(820, G - 100, {
      label: 'Dynamite Log',
      content: '"Week 42, Culebra Section: Powder used — 28,000 lbs. ' +
        'Cubic yards removed — 187,000. Net gain after two overnight slides — 94,000. ' +
        'The slides took back 93,000 yards. We are digging this mountain twice." ' +
        '— Foreman\'s Report, 1911'
    });

    this.addCollectible(2400, G - 90, {
      label: 'Worker\'s Last Letter',
      content: '"Dear Mother — The work is hard and dangerous but I am still standing. ' +
        'They say by next year we will see water in the Cut. That will be something. ' +
        'Something no one has ever seen. A ship sailing over a continent. ' +
        'I helped make that. Even if no one writes my name down. I helped make that." ' +
        '— Cornelius Blake, Jamaica, 1912'
    });

    // ── NPCs ───────────────────────────────────────────────────────────
    this.addNPC({
      id: 'goethals',
      x: 500, y: G - PH,
      displayName: 'Col. Goethals',
      dialogueId: 'goethals_1',
      colors: {
        skin: '#D4B090', hair: '#8A7050',
        shirt: '#4A4A60', shirtDark: '#3A3A50',
        pants: '#3A3A50', hat: '#3A3A50', hatDark: '#2A2A40',
      },
    });

    this.addNPC({
      id: 'chinese_worker',
      x: 1200, y: G - PH,
      displayName: 'Li Wei (China/CA)',
      dialogueId: 'li_wei_1',
      colors: {
        skin: '#C4956A', hair: '#0A0500',
        shirt: '#4A6A30', shirtDark: '#3A5020',
        pants: '#2A3A20', hat: '#4A3A10', hatDark: '#3A2A00',
      },
    });

    this.addNPC({
      id: 'greek_worker',
      x: 1850, y: G - PH,
      displayName: 'Kostas (Greece)',
      dialogueId: 'kostas_1',
      colors: {
        skin: '#C89060', hair: '#2C1810',
        shirt: '#5A3080', shirtDark: '#3A1860',
        pants: '#2A1840',
      },
    });
  }

  update(dt, players, physics, input) {
    super.update(dt, players, physics, input);

    // Blast door: both cranks must complete
    if (this._blastCrankA && this._blastCrankB && this._blastGate) {
      if (this._blastCrankA.complete && this._blastCrankB.complete) {
        this._blastGate.open = true;
      }
    }

    // Trigger mudslide when players enter zone
    if (!this._mudslideTriggered) {
      for (const p of players) {
        if (p.body.x > 1380 && p.body.x < 1800) {
          this._mudslideTriggered = true;
          // Activate mudslide after 2 seconds
          setTimeout(() => {
            if (this._mudslideHazard) {
              this._mudslideHazard.active = true;
            }
          }, 2000);
          break;
        }
      }
    }

    // Check lever sequence — if correct lever pulled, advance sequence
    // (lever interaction handled in Game via event returns)
    if (this._mudslideHazard && this._mudslideHazard.active) {
      const allCorrect = this._levers.every(l => l.pulled);
      if (allCorrect) {
        this._mudslideHazard.active = false;
      }
    }
  }

  _buildDialogue() {
    this.dialogueNodes = [
      // ── Goethals ─────────────────────────────────────────────────────
      {
        id: 'goethals_1',
        type: 'dialogue', speakerId: 'goethals',
        speakerName: 'Col. George Goethals',
        text: 'Nine miles of mountain. That is all it is. Not an impossible mountain. Not a magic mountain. Nine miles of rock and mud that bleeds steam and slides back at us every time it rains.',
        nextNodeId: 'goethals_2',
      },
      {
        id: 'goethals_2',
        type: 'dialogue', speakerId: 'goethals',
        speakerName: 'Col. George Goethals',
        text: 'The French quit. We are not quitting. The work is simple: keep digging. Every yard we move is a yard that will never slide back — eventually. It just requires more explosions than we planned for.',
        nextNodeId: 'goethals_3',
      },
      {
        id: 'goethals_3',
        type: 'dialogue', speakerId: 'goethals',
        speakerName: 'Col. George Goethals',
        text: 'On Sundays I hold an open court for any worker to bring a complaint — Gold or Silver Roll. I have heard 10,000 complaints. I have resolved most of them. That is the job.',
        nextNodeId: null,
      },
      // ── Li Wei ───────────────────────────────────────────────────────
      {
        id: 'li_wei_1',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Li Wei',
        text: 'I built the Central Pacific Railroad in California. Blasted through the Sierra Nevada. They called us Chinese workers — never our names. Then they passed the Chinese Exclusion Act and said we were not welcome in America.',
        nextNodeId: 'li_wei_2',
      },
      {
        id: 'li_wei_2',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Li Wei',
        text: 'Panama hired me. I am 58 years old. I have blasted more mountains than anyone at this site. I teach the young men. They call me "the old man." I think that is a fine name.',
        nextNodeId: 'li_wei_3',
      },
      {
        id: 'li_wei_3',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Li Wei',
        text: 'When the levers are pulled in the right order — C, A, B, D — the mudslide runs into the diversion channel and not onto the workers. I figured this out. Remember: C, A, B, D.',
        nextNodeId: null,
        triggers: [{ type: 'set_flag', key: 'learned_lever_sequence' }],
      },
      // ── Kostas ────────────────────────────────────────────────────────
      {
        id: 'kostas_1',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Kostas Papadakis (Greece)',
        text: 'In Greece we have an expression: the stone you cannot move, you go around. This mountain, we cannot go around. So we go through. It takes longer. But you end up on the same side.',
        nextNodeId: 'kostas_2',
      },
      {
        id: 'kostas_2',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Kostas Papadakis (Greece)',
        text: 'I work next to men from Jamaica, Colombia, Barbados, Spain, Italy, America. We cannot speak to each other most of the time. But we learned the gestures. Stand clear. Fire in the hole. Good work today.',
        nextNodeId: 'kostas_3',
      },
      {
        id: 'kostas_3',
        type: 'dialogue', speakerId: 'worker',
        speakerName: 'Kostas Papadakis',
        text: 'You know what is funny? The mountain does not speak any of our languages either. And it still communicates very clearly.',
        nextNodeId: null,
      },
    ];
  }
}
