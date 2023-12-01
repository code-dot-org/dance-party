const {getP5Color} = require('../../utils');

// This effect is slightly modified from Poetry background effect 'clouds'
// https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L368
module.exports = function (p5, lerpColorFromPalette) {
  return {
    tileSize: 20,
    tiles: [],
    init: function () {
      const noiseScale = 0.05;
      this.tiles = [];
      let xnoise = 0.01;
      let ynoise = 0.01;
      for (let x = 0; x < 400; x += this.tileSize) {
        xnoise = 0.01;
        for (let y = 0; y < 400; y += this.tileSize) {
          this.tiles.push({
            x,
            y,
            xnoise,
            ynoise,
          });
          xnoise += noiseScale;
        }
        ynoise += noiseScale;
      }
    },
    draw: function () {
      const speed = 0.015;
      let backgroundAmount = 0;
      p5.push();
      p5.noStroke();
      backgroundAmount += speed;
      p5.background(
        lerpColorFromPalette(backgroundAmount)
      );
      this.tiles.forEach(tile => {
        tile.alpha = p5.noise(tile.xnoise, tile.ynoise) * 255;
        tile.xnoise += speed;
        tile.ynoise += speed;
        p5.fill(getP5Color(p5, '#ffffff', tile.alpha));
        p5.rect(tile.x, tile.y, this.tileSize, this.tileSize);
      });
      p5.pop();
    },
  };
};
