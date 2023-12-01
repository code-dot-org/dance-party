const drawStar = require('../shapes/star');

module.exports = function (p5, randomNumber, randomColor, getInPreviewMode) {
  return {
    stars: [],
    init: function () {
      this.stars = [];
      for (let i = 0; i < 100; i++) {
        let theta = p5.random(0, 360);
        let velocity = p5.random(4, 12);

        this.stars.push({
          color: randomColor(255, 255, 100),
          x: this.getPreviewCustomizations().x,
          y: this.getPreviewCustomizations().y,
          dx: velocity * p5.cos(theta),
          dy: velocity * p5.sin(theta),
        });
      }
    },
    draw: function () {
      p5.angleMode(p5.DEGREES);
      p5.noStroke();
      if (this.stars.length === 0) {
        this.init();
      }
      this.stars.forEach(star => {
        p5.fill(star.color);
        drawStar(p5, star.x, star.y, 3, 9, 5);
        star.x += star.dx;
        star.y += star.dy;
      });
      this.stars = this.stars.filter(
        star => star.x > -10 && star.x < 410 && star.y > -10 && star.y < 410
      );
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {x: randomNumber(0, 400), y: randomNumber(0, 400)} :
        {x: 200, y: 200};
    }
  };
};
