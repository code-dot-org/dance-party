module.exports = function (p5, randomNumber) {
  return {
    x: 200,
    y: 200,
    targetX: null,
    targetY: null,
    dx: 0,
    dy: 0,
    diameter: 0,
    swirl: null,
    init: function () {
      this.targetX = 200;
      this.targetY = 200;
      this.update();
    },
    update: function () {
      while (
        Math.sqrt(
          (this.targetY - this.y) ** 2 + (this.targetX - this.x) ** 2
        ) < 40
        ) {
        this.targetX = randomNumber(50, 350);
        this.targetY = randomNumber(50, 350);
      }
      let angleOfMovement = Math.atan2(
        this.targetY - this.y,
        this.targetX - this.x
      );
      this.dx = 6 * Math.cos(angleOfMovement);
      this.dy = 6 * Math.sin(angleOfMovement);
    },
    draw: function ({isPeak}) {
      if (
        isPeak ||
        (Math.abs(this.targetX - this.x) < 4 &&
          Math.abs(this.targetY - this.y) < 4)
      ) {
        this.update();
      }
      p5.push();
      p5.noFill();
      p5.stroke('#000');
      p5.strokeWeight(600);
      this.x += this.dx + randomNumber(-1, 1);
      this.y += this.dy + randomNumber(-1, 1);
      p5.ellipse(this.x, this.y, 800, 800);
      p5.pop();
    },
  };
};
