module.exports = function (p5, randomColorFromPalette) {
  return {
    buffer: null,
    splats: [],
    numSplats: 5,
    randomSplat: function () {
      return {
        x: p5.random(0, 400),
        y: p5.random(0, 400),
        r: p5.random(5, 15),
        color: randomColorFromPalette(),
      };
    },
    init: function () {
      this.splats.length = 0;
      for (let i = 0; i < this.numSplats; i++) {
        this.splats.push(this.randomSplat());
      }

      if (this.buffer) {
        this.buffer.clear();
        return;
      }
      this.buffer = p5.createGraphics(p5.width, p5.height);
      this.buffer.noStroke();
      this.buffer.drawingContext.globalAlpha = 0.8;
    },
    draw: function () {
      // first make a pass and remove items, traversing in reverse so that removals
      // dont affect traversal
      for (let splat of this.splats) {
        if (splat.r > 30) {
          splat.x = p5.random(0, 400);
          splat.y = p5.random(0, 400);
          splat.r = p5.random(5, 15);
          splat.color = randomColorFromPalette();
        }

        splat.r += p5.random(1);
        this.buffer.fill(splat.color);
        for (let i = 0; i < 20; i++) {
          this.buffer.ellipse(
            p5.randomGaussian(splat.x, splat.r),
            p5.randomGaussian(splat.y, splat.r),
            p5.random(2, 8)
          );
        }
      }

      // Copy the off-screen buffer to the canvas.
      p5.push();
      p5.scale(1 / p5.pixelDensity());
      p5.drawingContext.drawImage(this.buffer.elt, 0, 0);
      p5.pop();
    },
  };
};
