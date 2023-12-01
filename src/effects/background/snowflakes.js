module.exports = function (p5, lerpColorFromPalette, getInPreviewMode) {
  return {
    flake: [],
    draw: function () {
      p5.background(lerpColorFromPalette(0.5));
      const numSnowflakesToDraw = this.getPreviewCustomizations().numSnowflakesToDraw;
      for (let i = 0; i < numSnowflakesToDraw; i++) {
        let flake = {
          x: p5.random(-100, 400),
          y: this.getPreviewCustomizations().y,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12),
        };
        this.flake.push(flake);
      }
      p5.noStroke();
      p5.fill('white');
      this.flake.forEach(function (flake) {
        p5.push();
        p5.translate(flake.x, flake.y);
        for (let i = 0; i < 5; i++) {
          p5.rotate(360 / 5);
          p5.ellipse(0, 0, 1, flake.size);
        }
        let fallSpeed = p5.map(flake.size, 6, 12, 2, 5);
        flake.y += fallSpeed;
        flake.x += flake.velocityX;
        p5.pop();
      });
      this.flake = this.flake.filter(function (flake) {
        return flake.y < 425;
      });
    },
    reset: function () {
      this.flake = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {numSnowflakesToDraw: 200, y: p5.random(-100, 400)} :
        {numSnowflakesToDraw: 1, y: -10};
    },
  };
};
