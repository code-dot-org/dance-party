const drawSmiley = require('../shapes/smiley');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    smiles: [],
    init: function () {
      if (this.smiles.length) {
        return;
      }
      for (let i = 0; i < 10; i++) {
        this.smiles.push({
          x: randomNumber(25, 375),
          y: randomNumber(25, 375),
          size: randomNumber(2, 6),
          rot: randomNumber(0, 359),
          life: 200,
        });
      }
      this.image = p5.createGraphics(100, 100);
      this.image.scale(3);
      drawSmiley(this.image.drawingContext, 0.8);
    },
    draw: function (context) {
      const centroid = this.getPreviewCustomizations().getCentroid(context);

      for (let i = 0; i < this.smiles.length; i++) {
        p5.push();
        const smiles = this.smiles[i];
        let scale = p5.map(centroid, 5000, 8000, 0, smiles.size);
        scale = p5.constrain(scale, 0, 5);
        p5.translate(smiles.x, smiles.y);
        p5.rotate(smiles.rot);
        p5.scale(scale / (4 * p5.pixelDensity()));
        p5.drawingContext.drawImage(this.image.elt, 0, 0);
        smiles.life--;
        if (smiles.life < 0) {
          (smiles.x = randomNumber(25, 375)),
          smiles.y - randomNumber(25, 375),
            (smiles.life = 200);
        }
        p5.pop();
      }
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {getCentroid: () => 6500} :
        {getCentroid: context => context.centroid};
    },
  };
};
