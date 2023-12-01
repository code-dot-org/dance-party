const constants = require('../../constants');
const {hexToRgb} = require('../../utils');
const drawPetal = require('../../shapes/petal');

// This effect is slightly modified from Poetry background effect 'blooming'
// https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L245
module.exports = function (p5, getCurrentPalette, colorFromPalette) {
  return {
    colorIndex: 0,
    petals: [],
    paletteLength: 0,
    addPetalLayer: function (color, layer) {
      for (let i = 0; i < 8; i++) {
        this.petals.push({
          theta: 45 * i,
          length: 10 + 140 * layer,
          ...color,
        });
      }
    },
    init: function () {
      this.paletteLength = constants.PALETTES[getCurrentPalette()].length;
      this.petals = [];
      // Initialize with enough petals to fill the screen - this is mostly
      // useful so that preview shows what the background actually looks like.
      // Increment from 3 down to 0 so that petals are layered correctly with
      // bigger petals behind smaller petals.
      for (let layer = 3; layer >= 0; layer--) {
        const color = colorFromPalette(this.colorIndex);
        this.addPetalLayer(hexToRgb(color), layer);
        this.colorIndex = (this.colorIndex + 1) % this.paletteLength;
      }
    },
    draw: function () {
      p5.push();
      p5.strokeWeight(2);
      if (p5.World.frameCount % 70 === 0) {
        const color = colorFromPalette(this.colorIndex);
        this.addPetalLayer(hexToRgb(color), 0 /* layer */);
        this.colorIndex = (this.colorIndex + 1) % this.paletteLength;
      }
      const petalWidth = 35;
      this.petals.forEach(petal => {
        // Multiply each component by 0.8 to have the stroke color be
        // slightly darker than the fill color.
        p5.stroke(
          p5.color(petal.R * 0.8, petal.G * 0.8, petal.B * 0.8)
        );
        p5.fill(p5.color(petal.R, petal.G, petal.B));
        drawPetal(p5, petal.length, petal.theta, petalWidth);
        petal.theta = (petal.theta + 0.5) % 360;
        petal.length += 2;
      });
      this.petals = this.petals.filter(petal => petal.length < 700);
      p5.pop();
    },
  };
};
