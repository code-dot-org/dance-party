const drawRainbow = require('../shapes/rainbow');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    rainbows: [],
    init: function () {
      if (this.rainbows.length) {
        return;
      }

      for (let i = 0; i < 15; i++) {
        this.rainbows.push({
          x: randomNumber(10, 390),
          y: this.getPreviewCustomizations().y,
          rot: randomNumber(0, 359),
          speed: 2,
          size: randomNumber(1.5, 3),
        });
      }
      this.image = p5.createGraphics(175, 100);
      this.image.scale(3);
      drawRainbow(this.image.drawingContext);
    },
    draw: function (context) {
      const centroid = this.getPreviewCustomizations().getCentroid(context);

      for (let i = 0; i < this.rainbows.length; i++) {
        p5.push();
        const rainbows = this.rainbows[i];
        let scale = p5.map(centroid, 5000, 8000, 0, rainbows.size);
        scale = p5.constrain(scale, 0, 3);
        p5.translate(rainbows.x, rainbows.y);
        p5.scale(scale / (2 * p5.pixelDensity()));
        p5.image(this.image);
        rainbows.y -= rainbows.speed;
        if (rainbows.y < -25) {
          rainbows.x = randomNumber(10, 390);
          rainbows.y = 450;
        }
        p5.pop();
      }
    },
    reset: function () {
      this.rainbows = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {
          y: randomNumber(0, 400),
          getCentroid: () => 6500,
        } :
        {
          y: randomNumber(400, 800),
          getCentroid: context => context.centroid,
        };
    },
  };
};
