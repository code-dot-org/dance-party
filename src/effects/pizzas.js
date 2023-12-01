const drawPizza = require('../shapes/pizza');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
    pizza: [],
    init: function () {
      if (this.pizza.length) {
        return;
      }
      for (let i = 0; i < 10; i++) {
        this.pizza.push({
          x: randomNumber(25, 375),
          y: randomNumber(25, 375),
          size: randomNumber(2, 6),
          rot: randomNumber(0, 359),
          life: 200,
        });
      }
      this.image = p5.createGraphics(100, 100);
      this.image.scale(3);
      drawPizza(this.image.drawingContext);
    },
    draw: function (context) {
      const centroid = this.getPreviewCustomizations().getCentroid(context);
      for (let i = 0; i < this.pizza.length; i++) {
        p5.push();
        const pizza = this.pizza[i];
        let scale = p5.map(centroid, 5000, 8000, 0, pizza.size);
        scale = p5.constrain(scale, 0, 5);
        p5.translate(pizza.x, pizza.y);
        p5.rotate(pizza.rot);
        p5.scale(scale / (4 * p5.pixelDensity()));
        p5.drawingContext.drawImage(this.image.elt, 0, 0);
        pizza.life--;
        if (pizza.life < 0) {
          (pizza.x = randomNumber(25, 375)),
          pizza.y - randomNumber(25, 375),
            (pizza.life = 200);
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
