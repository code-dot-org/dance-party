module.exports = function (p5, randomColorFromPalette, randomNumber, getInPreviewMode) {
  return {
    asteroid: [],
    draw: function () {
      p5.background('black');
      const numAsteroidsToDraw = this.getPreviewCustomizations().numAsteroidsToDraw;
      for (let i = 0; i < numAsteroidsToDraw; i++) {
        let asteroid = {
          x: this.getPreviewCustomizations().x,
          y: this.getPreviewCustomizations().y,
          velocity: p5.createVector(0, 1).rotate(p5.random(0, 360)),
          size: this.getPreviewCustomizations().size,
          color: randomColorFromPalette(),
        };
        this.asteroid.push(asteroid);
      }
      p5.noStroke();

      this.asteroid.forEach(asteroid => {
        p5.push();
        p5.fill(asteroid.color);
        p5.translate(asteroid.x, asteroid.y);
        p5.ellipse(0, 0, asteroid.size, asteroid.size);
        let speedMultiplier = p5.pow(asteroid.size, 2) / 2;
        asteroid.x += this.getPreviewCustomizations().getMovementDistance(asteroid.velocity.x, speedMultiplier);
        asteroid.y += this.getPreviewCustomizations().getMovementDistance(asteroid.velocity.y, speedMultiplier);
        asteroid.size += 0.1;
        p5.pop();
      });
      this.asteroid = this.asteroid.filter(function (asteroid) {
        if (asteroid.x < -5 || asteroid.x > 405 || asteroid.y < -5 || asteroid.y > 405) {
          return false;
        }
        return true;
      });
    },
    reset: function () {
      this.asteroid = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {
          numAsteroidsToDraw: 200,
          size: 3,
          x: randomNumber(0, 400),
          y: randomNumber(0, 400),
          getMovementDistance: () => 0,
        } :
        {
          numAsteroidsToDraw: 3,
          size: 0.01,
          x: 200,
          y: 200,
          getMovementDistance: (dimension, multiplier) => dimension * multiplier
        };
    }
  };
};
