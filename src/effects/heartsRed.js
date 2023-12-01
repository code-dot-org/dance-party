const drawHeart = require('../shapes/heart');

module.exports = function (p5, randomNumber) {
  return {
    heartList: [],
    init: function () {
      if (this.heartList.length) {
        return;
      }
      for (let i = 0; i < 10; i++) {
        this.heartList.push({
          x: randomNumber(10, 390),
          y: randomNumber(10, 390),
          rot: randomNumber(0, 359),
          life: randomNumber(10, 120),
          color: p5.rgb(255, 0, 0, 0.5),
        });
      }
    },
    draw: function () {
      for (const heart of this.heartList) {
        p5.push();
        p5.translate(heart.x, heart.y);
        p5.rotate(heart.rot);
        p5.scale(heart.life / 20);
        drawHeart(p5._renderer.drawingContext, heart.color);
        heart.life--;
        if (heart.life < 0) {
          heart.x = randomNumber(10, 390);
          heart.y = randomNumber(10, 390);
          heart.life = randomNumber(10, 120);
        }
        p5.pop();
      }
    },
    reset: function () {
      this.heartList = [];
    }
  };
};
