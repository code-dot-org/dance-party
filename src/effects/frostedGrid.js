const constants = require('../constants');
const {hexToRgb} = require('../utils');
const drawFrostedGrid = require('../shapes/frostedGrid');

// This effect is slightly modified from Poetry background effect 'fadeColors'
// https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L181
module.exports = function (p5, getCurrentPalette, randomNumber) {
  return {
    anchors: [],
    circles: [],
    spacing: 20,
    init: function () {
      this.anchors = [];
      this.circles = [];
      const paletteColors = constants.PALETTES[getCurrentPalette()];
      paletteColors.forEach(color => {
        this.anchors.push({
          x: randomNumber(0, 400),
          y: randomNumber(0, 400),
          velocityX: randomNumber(-3, 3),
          velocityY: randomNumber(-3, 3),
          ...hexToRgb(color),
        });
      });
      for (let x = 0; x < 420; x += this.spacing) {
        for (let y = 0; y < 420; y += this.spacing) {
          this.circles.push({x, y, red: 0, green: 0, blue: 0});
        }
      }
    },
    draw: function () {
      p5.push();
      drawFrostedGrid(p5, this.anchors, this.circles, this.spacing);
      p5.pop();
    },
  };
};
