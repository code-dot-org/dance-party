const drawSwirl = require('../../shapes/swirl');

module.exports = function (p5, randomColorFromPalette) {
  return {
    angle: 0,
    color: null,
    update: function () {
      this.color = randomColorFromPalette();
    },
    draw: function ({isPeak, bpm}) {
      if (isPeak || !this.color) {
        this.update();
      }
      p5.push();
      p5.background(this.color);
      p5.translate(200, 200);
      let rotation = (bpm / 90) * 50;
      this.angle -= rotation;
      p5.rotate((Math.PI / 180) * this.angle);
      p5.translate(-427, -400);
      drawSwirl(p5._renderer.drawingContext);
      p5.pop();
    },
  };
};
