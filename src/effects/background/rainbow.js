module.exports = function (p5, lerpColorFromPalette) {
  return {
    lengths: [0, 0, 0, 0, 0, 0, 0],
    current: 0,
    update: function () {
      this.lengths[this.lengths.length - (1 + this.current)] = 1;
      this.current = (this.current + 1) % this.lengths.length;
    },
    draw: function ({isPeak, bpm}) {
      if (isPeak) {
        this.update();
      }
      p5.push();
      let backgroundColor = lerpColorFromPalette(0.5);
      // Hack to set alpha for p5
      backgroundColor._array[3] = 0.25;
      p5.background(backgroundColor);
      p5.noFill();
      p5.strokeWeight(50);
      let d, i;
      for (i = 0; i < 7; i++) {
        let paletteColor = lerpColorFromPalette(i * 0.14);
        paletteColor._array[3] = 0.5;
        p5.stroke(paletteColor);
        d = 150 + i * 100;
        p5.arc(0, 400, d, d, -90, 0);
        if (this.lengths[i] > 0) {
          // Hack to set RGB and Alpha values of p5 color objects
          let [red, green, blue] = paletteColor.levels;
          paletteColor.levels[0] = red - 20;
          paletteColor.levels[1] = green - 20;
          paletteColor.levels[2] = blue - 20;
          paletteColor._array[3] = 1 - this.lengths[i] / 90;
          p5.stroke(paletteColor);
          p5.arc(0, 400, d, d, -90, -90 + this.lengths[i]);
          this.lengths[i] = (this.lengths[i] + bpm / 50) % 90;
        }
      }
      p5.pop();
    },
  };
};
