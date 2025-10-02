// Thin p5 adapter: owns a p5.Graphics mid-layer and gives its 2D context
// to the external renderer. CommonJS to match the rest of dance-party.

// Map of move IDs to move names. These values are used to fetch source animation JSON.
const movesById = {
  0: 'rest',
  1: 'clap_high',
  2: 'clown',
  3: 'dab',
  4: 'double_jam',
  5: 'drop',
  6: 'floss',
  7: 'fresh',
  8: 'kick',
  9: 'roll',
  10: 'this_or_that',
  11: 'thriller',
  12: 'xarmsside',
  13: 'xarmsup',
  14: 'xjump',
  15: 'xclapside',
  16: 'xheadhips',
  17: 'xhighkick',
  18: 'xbend',
  19: 'xfever',
  20: 'xhop',
  21: 'xknee',
  22: 'xkneel',
  23: 'xole',
  24: 'xslide',
};

class GeneratedDancer {
  constructor(p5, worldW, worldH, renderer) {
    if (!p5 || !renderer) {
      throw new Error('GeneratedDancer requires p5 and a renderer');
    }
    this.p5 = p5;
    this.renderer = renderer;

    this.graphics = this.p5.createGraphics(worldW, worldH);
    this.graphics.pixelDensity(1);

    // Hand the renderer our mid-layer 2D context.
    this.renderer.init(this.graphics.drawingContext);
  }

  async setSource(src) {
    if (typeof src === 'number') {
      src = movesById[src] || movesById[0];
    }
    return this.renderer.setSource(src);
  }

  getDurationFrames() {
    return (
      (this.renderer.getDurationFrames && this.renderer.getDurationFrames()) ||
      null
    );
  }

  render(frameIndex) {
    if (!this.graphics || !this.renderer) {
      return;
    }
    // The renderer paints directly into graphics.drawingContext
    this.renderer.renderFrame(frameIndex);
  }

  resize(worldW, worldH) {
    // detach old <canvas> to avoid DOM leaks
    this.dispose();
    this.graphics = this.p5.createGraphics(worldW, worldH);
    this.graphics.pixelDensity(1);
    this.renderer.init(this.graphics.drawingContext);
  }

  dispose() {
    this.renderer.destroyAnim();

    const el =
      this.graphics &&
      (this.graphics.elt ||
        this.graphics.canvas ||
        (this.graphics._renderer && this.graphics._renderer.canvas));
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    if (this.p5 && Array.isArray(this.p5._elements)) {
      this.p5._elements = this.p5._elements.filter(e => e !== this.graphics);
    }

    this.graphics = null;
    this.renderer = null;
    this.p5 = null;
  }
}

module.exports = GeneratedDancer;
