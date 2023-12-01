module.exports = function (p5, colorFromPalette) {
  return {
    shapes: [],
    init: function () {
      if (!this.buffer) {
        this.buffer = p5.createGraphics(400, 400);
        this.buffer.noFill();
        this.buffer.stroke('#0f0');
        this.buffer.strokeWeight(2);
        this.buffer.strokeJoin(p5.BEVEL);
        this.buffer.background(0);
      }

      for (let i = 0; i < 2; i++) {
        const shape = [];
        shape.color = i;
        for (let j = 0; j < 4; j++) {
          const vertex = p5.createSprite();
          vertex.draw = () => {};
          vertex.position = p5.createVector(
            p5.random(0, 400),
            p5.random(0, 400)
          );
          vertex.velocity = p5.createVector(0, 2).rotate(p5.random(0, 360));
          shape.push(vertex);
        }
        this.shapes.push(shape);
      }
      this.edges = p5.createEdgeSprites();
    },
    reset: function () {
      this.shapes = [];
      p5.edges = null;
      this.buffer.clear();
    },
    draw: function () {
      this.buffer.drawingContext.globalAlpha = 0.25;
      this.buffer.background(colorFromPalette(2));
      this.buffer.drawingContext.globalAlpha = 1;

      for (const shape of this.shapes) {
        this.buffer.stroke(colorFromPalette(shape.color));
        this.buffer.quad.apply(
          this.buffer,
          shape.reduce((acc, current) => {
            current.bounceOff(this.edges);
            acc.push(current.position.x, current.position.y);
            return acc;
          }, [])
        );
      }

      // Copy the off-screen buffer to the canvas.
      p5.push();
      p5.scale(1 / p5.pixelDensity());
      p5.drawingContext.drawImage(this.buffer.elt, 0, 0);
      p5.pop();
    },
  };
};
