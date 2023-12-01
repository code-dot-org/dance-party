const drawSparkle = require('../shapes/sparkle');

module.exports = function (p5, randomColorFromPalette, randomNumber) {
  return {
    sparkles: [],
    maxSparkles: 80,
    makeRandomSparkle: function () {
      return {
        x: randomNumber(-100, 600),
        y: randomNumber(0, 400),
        color: randomColorFromPalette(),
      };
    },
    init: function () {
      if (this.sparkles.length) {
        return;
      }
      for (let i = 0; i < this.maxSparkles; i++) {
        this.sparkles.push(this.makeRandomSparkle());
      }
    },
    update: function () {},
    draw: function ({bpm}) {
      // Provide a default value for bpm of song when not provided so that
      // sparkles effect is drawn even in preview mode.
      bpm = bpm || 120;
      p5.background('#2b1e45');
      let velocity = Math.floor((bpm / 90) * 3);
      for (let i = 0; i < this.maxSparkles; i++) {
        p5.push();
        if (this.sparkles[i].x < 10 || this.sparkles[i].y > 410) {
          this.sparkles[i] = this.makeRandomSparkle();
        }

        this.sparkles[i].x -= velocity;
        this.sparkles[i].y += velocity;
        p5.translate(this.sparkles[i].x, this.sparkles[i].y);
        drawSparkle(p5._renderer.drawingContext, this.sparkles[i].color);
        p5.pop();
      }
    },
  };
};
