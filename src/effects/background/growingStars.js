const drawStar = require('../../shapes/star');

module.exports = function (p5, colorFromPalette) {
  return {
    stars: [],
    colorIndex: 0,
    starSpacing: 30,
    numStars: 9,

    init: function () {
      p5.angleMode(p5.DEGREES);
      this.colorIndex = 0;
      this.stars = [];
      for (var i = 0; i < this.numStars; i++) {
        this.stars.push({
          size: this.starSpacing * (this.numStars - i),
          colorIndex: this.colorIndex,
        });
        this.colorIndex++;
      }
    },

    draw: function () {
      for (let star of this.stars) {
        p5.fill(colorFromPalette(star.colorIndex));
        drawStar(p5, 200, 200, star.size, star.size * 2.5, 5);
        star.size += 1;
      }
      if (this.stars[0].size > this.starSpacing * this.numStars) {
        this.stars.shift();
        this.stars.push({size: 0, colorIndex: this.colorIndex});
        this.colorIndex++;
      }
    },
  };
};
