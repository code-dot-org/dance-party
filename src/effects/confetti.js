module.exports = function (p5, randomColor, getInPreviewMode) {
  return {
    confetti: [],
    draw: function () {
      const numConfettiToDraw = this.getPreviewCustomizations().numConfettiToDraw;
      for (let i = 0; i < numConfettiToDraw; i++) {
        const spin = this.getPreviewCustomizations().spin;
        let confetti = {
          x: p5.random(-100, 400),
          y: this.getPreviewCustomizations().y,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12, 18),
          // https://github.com/Automattic/node-canvas/issues/702
          // Bug with node-canvas prevents scaling with a value of 0, so spin initializes to 1
          spin: spin,
          color: randomColor(255, 255, 100),
        };

        this.confetti.push(confetti);
      }

      p5.noStroke();
      this.confetti.forEach(function (confetti) {
        p5.push();
        p5.fill(confetti.color);
        p5.translate(confetti.x, confetti.y);
        const scaleX = p5.sin(confetti.spin);
        p5.scale(scaleX, 1);
        confetti.spin += 20;
        p5.rect(0, 0, 4, confetti.size);
        let fallSpeed = p5.map(confetti.size, 6, 12, 1, 3);
        confetti.y += fallSpeed;
        confetti.x += confetti.velocityX;
        p5.pop();
      });
      this.confetti = this.confetti.filter(function (confetti) {
        return confetti.y < 425;
      });
    },
    reset: function () {
      this.confetti = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {numConfettiToDraw: 200, spin: p5.random(1, 80), y: p5.random(-100, 400)} :
        {numConfettiToDraw: 1, spin: 1, y: -10};
    }
  };
};
