const drawStarburst = require('../../shapes/starburst');
const drawStar = require('../../shapes/star');

// This background effect is inspired by the Poetry foreground effect 'starburst'
// https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/foregroundEffects.js#L235
module.exports = function (p5, lerpColorFromPalette, randomColorFromPalette, randomNumber) {
  return {
    stars: [],
    init: function () {
      this.stars = [];
      p5.push();
      p5.background(lerpColorFromPalette(0));
      // A call to drawStarburst with isPreview=true will ensure background effect
      // is displayed in preview.
      drawStarburst(p5, true, this.stars, randomNumber, randomColorFromPalette, drawStar);
      p5.pop();
    },
    draw: function () {
      p5.push();
      p5.noStroke();
      p5.background(lerpColorFromPalette(0));
      drawStarburst(p5, false, this.stars, randomNumber, randomColorFromPalette, drawStar);
      p5.pop();
    },
  };
};
