// Thin p5 adapter: owns a p5.Graphics mid-layer and gives its 2D context
// to the external renderer. CommonJS to match the rest of dance-party.

class ExternalDancerLayer {
  constructor(p5, worldW, worldH, renderer) {
    if (!p5 || !renderer)
      throw new Error('ExternalDancerLayer requires p5 and a renderer');
    this.p5 = p5;
    this.renderer = renderer;

    this.graphics = this.p5.createGraphics(worldW, worldH);
    this.graphics.pixelDensity(1);

    // Hand the renderer our mid-layer 2D context
    this.renderer.init(this.graphics.drawingContext);
  }

  async setSource(src) {
    return this.renderer.setSource(src);
  }

  getDurationFrames() {
    return (
      (this.renderer.getDurationFrames && this.renderer.getDurationFrames()) ||
      null
    );
  }

  render(frameIndex, layout) {
    if (!this.graphics || !this.renderer) return;
    // The renderer paints directly into graphics.drawingContext
    this.renderer.renderFrame(frameIndex, layout);
  }

  resize(worldW, worldH) {
    // detach old <canvas> to avoid DOM leaks
    const el =
      this.graphics &&
      (this.graphics.elt ||
        this.graphics.canvas ||
        this.graphics._renderer?.canvas);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (this.p5 && Array.isArray(this.p5._elements)) {
      this.p5._elements = this.p5._elements.filter(e => e !== this.graphics);
    }

    this.graphics = this.p5.createGraphics(worldW, worldH);
    this.graphics.pixelDensity(1);
    this.renderer.init(this.graphics.drawingContext);
  }

  dispose() {
    try {
      this.renderer && this.renderer.dispose && this.renderer.dispose();
    } catch {}

    const el =
      this.graphics &&
      (this.graphics.elt ||
        this.graphics.canvas ||
        this.graphics._renderer?.canvas);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    if (this.p5 && Array.isArray(this.p5._elements)) {
      this.p5._elements = this.p5._elements.filter(e => e !== this.graphics);
    }

    this.graphics = null;
    this.renderer = null;
    this.p5 = null;
  }
}

module.exports = ExternalDancerLayer;
