const drawSpiral = require('../shapes/spiral');

module.exports = function (p5, lerpColorFromPalette) {
  return {
    angle: 0,
    color: 0,
    init: function () {
      this.color = 0;
    },
    update: function () {
      this.color += 0.13;
      if (this.color > 1) {
        this.color -= 1;
      }
    },
    draw: function ({isPeak, bpm}) {
      if (isPeak) {
        this.update();
      }
      p5.background(lerpColorFromPalette(this.color));
      p5.push();
      p5.translate(200, 200);
      let rotation = (bpm / 90) * 200;
      this.angle -= rotation;
      p5.rotate((Math.PI / 180) * this.angle);
      p5.translate(-600, -600);
      drawSpiral(p5._renderer.drawingContext);
      p5.pop();
    },
  };
};
