module.exports = function (p5, randomColorFromPalette, getInPreviewMode) {
  return {
    star: [],
    draw: function () {
      p5.background('#303030');
      const numStarsToDraw = this.getPreviewCustomizations().numStarsToDraw;
      for (let i = 0; i < numStarsToDraw; i++) {
        let star = {
          x: p5.random(0, 400),
          y: p5.random(0, 400),
          size: p5.random(15, 30),
          color: randomColorFromPalette(),
        };
        this.star.push(star);
      }

      p5.noStroke();
      this.star.forEach(function (star) {
        p5.push();
        p5.fill(star.color);
        p5.translate(star.x, star.y);
        for (let i = 0; i < 3; i++) {
          p5.rotate(360 / 5);
          p5.ellipse(0, 0, 1, star.size);
        }
        let fadeSpeed = p5.map(star.size, 15, 30, 1, 2);
        star.size = star.size - fadeSpeed;
        star.y = star.y - 2;
        p5.pop();
      });
      this.star = this.star.filter(function (star) {
        return star.size > 0.1;
      });
    },
    reset: function () {
      this.star = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {numStarsToDraw: 30} :
        {numStarsToDraw: 1};
    }
  };
};
