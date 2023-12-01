module.exports = function (p5, lerpColorFromPalette) {
  return {
    hue: 0,

    drawFlower: function (num_petals, color) {
      p5.fill(color);
      for (let i = 0; i < num_petals; i++) {
        p5.rotate(360 / num_petals);
        p5.ellipse(0, 30, 20, 80);
      }
    },

    draw: function ({isPeak}) {
      if (isPeak) {
        this.hue += 25;
      }
      p5.push();
      p5.noStroke();
      p5.translate(200, 200);
      p5.angleMode(p5.DEGREES);
      for (let i = 9; i > -1; i--) {
        p5.push();
        p5.scale(i);
        this.drawFlower(
            8,
            lerpColorFromPalette(((this.hue + i * 10) % 360) / 360)
          );
        p5.pop();
      }
      p5.pop();
    },
  };
};
