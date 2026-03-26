/**
 * InputManager — keyboard polling for two players
 * P1: WASD + F (interact)
 * P2: Arrow keys + Enter (interact)
 */
class InputManager {
  constructor() {
    this._held = new Set();
    this._justPressed = new Set();
    this._justReleased = new Set();
    this._pendingDown = new Set();
    this._pendingUp = new Set();

    window.addEventListener('keydown', e => {
      if (!this._held.has(e.code)) {
        this._pendingDown.add(e.code);
      }
      this._held.add(e.code);
      // Prevent page scroll for arrow keys / space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => {
      this._held.delete(e.code);
      this._pendingUp.add(e.code);
    });

    this.p1 = this._makeInput();
    this.p2 = this._makeInput();
    this.anyKey = false;
  }

  _makeInput() {
    return {
      left: false, right: false, up: false, down: false,
      action: false,
      justLeft: false, justRight: false, justJump: false,
      justAction: false, justDown: false,
    };
  }

  update() {
    // Commit pending events
    this._justPressed.clear();
    this._justReleased.clear();
    this._pendingDown.forEach(k => this._justPressed.add(k));
    this._pendingUp.forEach(k => this._justReleased.add(k));
    this._pendingDown.clear();
    this._pendingUp.clear();

    this.anyKey = this._justPressed.size > 0;

    // P1: WASD + F
    this.p1.left    = this._held.has('KeyA');
    this.p1.right   = this._held.has('KeyD');
    this.p1.up      = this._held.has('KeyW');
    this.p1.down    = this._held.has('KeyS');
    this.p1.action  = this._held.has('KeyF');
    this.p1.justLeft   = this._justPressed.has('KeyA');
    this.p1.justRight  = this._justPressed.has('KeyD');
    this.p1.justJump   = this._justPressed.has('KeyW');
    this.p1.justAction = this._justPressed.has('KeyF');
    this.p1.justDown   = this._justPressed.has('KeyS');

    // P2: Arrow Keys + Enter
    this.p2.left    = this._held.has('ArrowLeft');
    this.p2.right   = this._held.has('ArrowRight');
    this.p2.up      = this._held.has('ArrowUp');
    this.p2.down    = this._held.has('ArrowDown');
    this.p2.action  = this._held.has('Enter');
    this.p2.justLeft   = this._justPressed.has('ArrowLeft');
    this.p2.justRight  = this._justPressed.has('ArrowRight');
    this.p2.justJump   = this._justPressed.has('ArrowUp');
    this.p2.justAction = this._justPressed.has('Enter');
    this.p2.justDown   = this._justPressed.has('ArrowDown');
  }

  held(code) { return this._held.has(code); }
  justPressed(code) { return this._justPressed.has(code); }
  justReleased(code) { return this._justReleased.has(code); }
}
