module.exports = function (p5, lerpColorFromPalette) {
  return {
    inc: 360 / 15,
    heightFactor: 1,
    heightDivider: 200,
    yLoc: 300,
    lineWidth: p5.width / 80,
    draw: function (context) {
      const centroid = context.centroid;
      let scale = p5.map(centroid, 5000, 8000, 0, 250);
      let angle = 0;
      p5.background('black');
      for (let i = 0; i < p5.width; i += this.lineWidth) {
        p5.stroke(lerpColorFromPalette(i / p5.width));
        let amplitude = Math.abs(
          scale * (this.heightFactor / this.heightDivider) * p5.cos(angle)
        );
        let yInitial = this.yLoc - amplitude;
        let yFinal = this.yLoc + amplitude;
        p5.line(i, yInitial, i, yFinal);
        if (i < p5.width / 2) {
          this.heightFactor++;
        } else {
          this.heightFactor--;
        }
        angle += this.inc;
      }
    },
  };
};
