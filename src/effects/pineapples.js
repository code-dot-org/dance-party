const drawPineapple = require('../shapes/pineapple');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    pineappleList: [],
    init: function () {
      if (this.pineappleList.length) {
        return;
      }
      for (let i = 0; i < 8; i++) {
        this.pineappleList.push({
          x: randomNumber(10, 390),
          y: randomNumber(10, 390),
          rot: randomNumber(0, 359),
          life: 5,
        });
      }
      this.image = p5.createGraphics(75, 130);
      this.image.scale(7);
      drawPineapple(this.image.drawingContext);
    },
    draw: function () {
      for (let i = 0; i < this.pineappleList.length; i++) {
        p5.push();
        const pineapple = this.pineappleList[i];
        const scale = this.getPreviewCustomizations().getScale(pineapple);

        p5.translate(pineapple.x, pineapple.y);
        p5.rotate(pineapple.rot);
        p5.scale(scale);
        p5.drawingContext.drawImage(this.image.elt, -35, -65);
        pineapple.life--;
        if (pineapple.life < 0) {
          pineapple.x = randomNumber(10, 390);
          pineapple.y = randomNumber(10, 390);
          pineapple.life = randomNumber(10, 120);
        }
        p5.pop();
      }
    },
    reset: function () {
      this.pineappleList = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {getScale: () => randomNumber(10, 120) / 20 / (7 * p5.pixelDensity())} :
        {getScale: pineapple => pineapple.life / 20 / (7 * p5.pixelDensity())};
    },
  };
};
