const drawTaco = require('../../shapes/taco');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    tacos: [],
    init: function () {
      if (this.tacos.length) {
        return;
      }
      for (let i = 0; i < 10; i++) {
        this.tacos.push({
          x: randomNumber(20, 380),
          y: this.getPreviewCustomizations().y,
          rot: randomNumber(0, 359),
          speed: 3,
          size: 5,
        });
      }
      this.image = p5.createGraphics(125, 50);
      this.image.scale(3);
      drawTaco(this.image.drawingContext);
    },
    draw: function (context) {
      const centroid = this.getPreviewCustomizations().getCentroid(context);
      for (let i = 0; i < this.tacos.length; i++) {
        p5.push();
        const taco = this.tacos[i];
        let scale = p5.map(centroid, 5000, 8000, 0, taco.size);
        scale = p5.constrain(scale, 0, 5);
        p5.translate(taco.x, taco.y);
        p5.rotate(taco.rot);
        p5.scale(scale / (4 * p5.pixelDensity()));
        p5.image(this.image);
        taco.y += taco.speed;
        taco.rot++;
        if (taco.y > 420) {
          taco.x = randomNumber(20, 380);
          taco.y = -50;
        }
        p5.pop();
      }
    },
    reset: function () {
      this.tacos = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {
          y: randomNumber(0, 400),
          getCentroid: () => 6500,
        } :
        {
          y: randomNumber(-400, 0),
          getCentroid: context => context.centroid,
        };
    },
  };
};
