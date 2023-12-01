const drawPoop = require('../shapes/poop');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    poopList: [],
    init: function () {
      if (this.poopList.length) {
        return;
      }
      for (let i = 0; i < 6; i++) {
        this.poopList.push({
          x: randomNumber(10, 390),
          y: randomNumber(10, 390),
          rot: randomNumber(0, 359),
          life: 5,
        });
      }
    },
    draw: function () {
      for (const poop of this.poopList) {
        const scale = this.getPreviewCustomizations().getScale(poop);

        p5.push();
        p5.translate(poop.x, poop.y);
        p5.rotate(poop.rot);
        p5.scale(scale);
        drawPoop(p5._renderer.drawingContext);
        poop.life--;
        if (poop.life < 0) {
          poop.x = randomNumber(10, 390);
          poop.y = randomNumber(10, 390);
          poop.life = randomNumber(10, 120);
        }
        p5.pop();
      }
    },
    reset: function () {
      this.poopList = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {getScale: () => randomNumber(10, 120) / 20} :
        {getScale: poop => poop.life / 20};
    },
  };
};
