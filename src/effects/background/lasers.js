module.exports = function (p5, lerpColorFromPalette, getInPreviewMode) {
  return {
    laser: [],
    init: function () {
      this.laser.length = 0;
    },
    draw: function () {
      p5.background('black');
      if (this.laser.length < 32) {
        const numLasersToDraw = this.getPreviewCustomizations().numLasersToDraw;
        for (let i = 0; i < numLasersToDraw; i++) {
          let laser = {
            y: this.getPreviewCustomizations().getY(i),
            color: this.getPreviewCustomizations().getColor(i)
          };
          this.laser.push(laser);
        }
      }
      p5.push();
      p5.translate(200, 180);
      for (const [index, laser] of this.laser.entries()) {
        let x = this.getPreviewCustomizations().getX(index);
        if (x < 0) {
          x *= -1;
        }
        const angle = p5.atan2(laser.y, x);
        p5.stroke(laser.color);
        p5.line(0, 0, p5.sin(angle) * 300, p5.cos(angle) * 300);
        laser.y = laser.y - 100;
        if (laser.y <= -1400) {
          laser.y = 1750;
        }
      }
      p5.pop();
    },
    reset: function () {
      this.laser = [];
    },
    // Note to future readers: at the time of writing,
    // this implementation felt particularly hacky relative to other preview customizations.
    // It's more challenging than many others, because the effect is "less random" than many other previews.
    // Definitely open to alternative implementations as time allows!
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {
          numLasersToDraw: 32,
          getY: iterationNum => 1750 - (iterationNum * 100),
          getColor: iterationNum => lerpColorFromPalette(iterationNum / 16),
          getX: iterationNum => 200 * p5.sin(iterationNum),
        } :
        {
          numLasersToDraw: 1,
          getY: () => 1750,
          getColor: () => lerpColorFromPalette(p5.frameCount / 16),
          getX: () => 200 * p5.sin(p5.frameCount),
        };
    },
  };
};
