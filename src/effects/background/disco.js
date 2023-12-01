module.exports = function (p5, lerpColorFromPalette, randomNumber) {
  return {
    bg: undefined,
    colors: [],
    squaresPerSide: 4,
    minColorChangesPerUpdate: 5,
    maxColorChangesPerUpdate: 9,
    init: function () {
      if (this.colors.length) {
        return;
      }
      // Alpha is ignored for this effect to avoid memory leaks with too many
      // layers of alpha blending.
      this.colors.length = this.squaresPerSide * this.squaresPerSide;
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i] = lerpColorFromPalette(p5.random(0, 1));
      }
    },
    update: function () {
      const numChanges = randomNumber(
        this.minColorChangesPerUpdate,
        this.maxColorChangesPerUpdate
      );
      for (let i = 0; i < numChanges; i++) {
        const loc = randomNumber(0, this.colors.length);
        this.colors[loc] = lerpColorFromPalette(p5.random(0, 1));
      }
    },
    draw: function ({isPeak}) {
      if (isPeak) {
        this.update();
      }
      p5.push();
      p5.noStroke();
      const squareWidth = p5.width / this.squaresPerSide;
      const squareHeight = p5.height / this.squaresPerSide;
      for (let i = 0; i < this.colors.length; i++) {
        p5.fill(this.colors[i]);
        p5.rect(
          (i % this.squaresPerSide) * squareWidth,
          Math.floor(i / this.squaresPerSide) * squareHeight,
          squareWidth,
          squareHeight
        );
      }
      p5.pop();
    },
  };
};
