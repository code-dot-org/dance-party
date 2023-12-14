const drawMusicNote = require('../../shapes/musicNote');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    notes: [],
    init: function () {
      if (this.notes.length) {
        return;
      }
      for (let i = 0; i < 20; i++) {
        this.notes.push({
          x: randomNumber(10, 390),
          y: this.getPreviewCustomizations().y,
          rot: randomNumber(0, 359),
          speed: 2,
          size: randomNumber(1.5, 3),
        });
      }
      this.image = p5.createGraphics(70, 50);
      this.image.scale(4);
      drawMusicNote(this.image.drawingContext);
    },
    draw: function (context) {
      const centroid = this.getPreviewCustomizations().getCentroid(context);
      for (let i = 0; i < this.notes.length; i++) {
        p5.push();
        const notes = this.notes[i];
        let scale = p5.map(centroid, 5000, 8000, 0, notes.size);
        scale = p5.constrain(scale, 0, 3);
        p5.translate(notes.x, notes.y);
        p5.rotate(notes.rot);
        p5.scale(scale / (4 * p5.pixelDensity()));
        p5.drawingContext.drawImage(this.image.elt, 0, 0);
        notes.y += notes.speed;
        notes.rot++;
        if (notes.y > 410) {
          notes.x = randomNumber(10, 390);
          notes.y = -50;
        }
        p5.pop();
      }
    },
    reset: function () {
      this.notes = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {y: randomNumber(0, 390), getCentroid: () => 6500} :
        {y: randomNumber (-400, 0), getCentroid: context => context.centroid};
    },
  };
};
