module.exports = function (p5, lerpColorFromPalette) {
  return {
    hue: 0,
    update: function () {
      this.hue += 25;
    },
    draw: function ({isPeak}) {
      if (isPeak) {
        this.update();
      }
      p5.push();
      p5.noStroke();
      p5.ellipseMode(p5.CENTER);
      p5.translate(200, 200);
      for (let i = 5; i > -1; i--) {
        p5.fill(lerpColorFromPalette(((this.hue + i * 10) % 360) / 360));
        p5.ellipse(0, 0, i * 100 + 75, i * 100 + 75);
      }
      p5.pop();
    },
  };
};
