module.exports = function (p5, lerpColorFromPalette) {
  return {
    points: [],
    dotSpacing: 4,
    amplitude: 40,
    period: 400,
    dotRadius: 14,
    numSquiggles: 5,
    init: function () {
      this.points = [];
      p5.noStroke();
      p5.angleMode(p5.DEGREES);
      let numPoints = p5.height / this.dotSpacing;
      for (var i = 0; i < numPoints; i++) {
        this.points.push({
          x: 0,
          y: i * this.dotSpacing,
          theta: (360 / this.period) * i * this.dotSpacing,
          color: lerpColorFromPalette(i / numPoints),
        });
      }
    },
    draw: function ({bpm}) {
      p5.background('black');
      for (var i = 0; i < this.numSquiggles; i++) {
        this.points.forEach(point => {
          p5.fill(point.color);
          p5.ellipse(point.x, point.y, this.dotRadius, this.dotRadius);
          point.x =
            (p5.width / (this.numSquiggles - 1)) * i +
            p5.sin(point.theta) * this.amplitude;
          point.theta = (point.theta + bpm / 360) % 360;
        });
      }
    },
  };
};
