module.exports = function (p5, lerpColorFromPalette, getInPreviewMode) {
  return {
    hue: 0,
    update: function () {
      this.hue += 25;
    },
    draw: function ({isPeak, centroid}) {
      if (isPeak) {
        this.update();
      }
      const centroidValue = this.getPreviewCustomizations().getCentroid(centroid);
      p5.push();
      p5.rectMode(p5.CENTER);
      p5.translate(200, 200);
      p5.rotate(45);
      p5.noFill();
      p5.strokeWeight(p5.map(centroidValue, 0, 4000, 0, 50));
      for (let i = 5; i > -1; i--) {
        p5.stroke(lerpColorFromPalette(((this.hue + i * 10) % 360) / 360));
        p5.rect(0, 0, i * 100 + 50, i * 100 + 50);
      }
      p5.pop();
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {getCentroid: () => 2000} :
        {getCentroid: centroid => centroid};
    },
  };
};
