module.exports = function (p5, lerpColorFromPalette) {
  return {
    color: 0,
    update: function () {
      this.color += 0.03;
    },
    draw: function ({isPeak}) {
      if (isPeak) {
        this.update();
      }
      p5.background(lerpColorFromPalette(this.color));
    },
  };
};
