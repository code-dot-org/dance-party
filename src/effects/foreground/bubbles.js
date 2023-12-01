module.exports = function (p5, randomColor, getInPreviewMode) {
  return {
    bubble: [],
    draw: function () {
      const numBubblesToDraw = this.getPreviewCustomizations().numBubblesToDraw;
      for (let i = 0; i < numBubblesToDraw; i++) {
        let bubble = {
          x: p5.random(-100, 400),
          y: this.getPreviewCustomizations().y,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12, 18),
          color: randomColor(100, 50, 0.25),
        };
        this.bubble.push(bubble);
      }

      p5.noStroke();
      this.bubble.forEach(function (bubble) {
        p5.push();
        p5.fill(bubble.color);
        p5.translate(bubble.x, bubble.y);
        p5.ellipse(0, 0, bubble.size, bubble.size);
        let fallSpeed = p5.map(bubble.size, 6, 12, 1, 3);
        bubble.y -= fallSpeed;
        bubble.x += bubble.velocityX;
        p5.pop();
      });
      this.bubble = this.bubble.filter(function (bubble) {
        return bubble.y > 0;
      });
    },
    reset: function () {
      this.bubble = [];
    },
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {numBubblesToDraw: 200, y: p5.random(-100, 400)} :
        {numBubblesToDraw: 1, y: 410};
    }
  };
};
