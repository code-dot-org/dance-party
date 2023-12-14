const drawSparkle = require("../../shapes/sparkle");

module.exports = function (p5, lerpColorFromPalette, colorFromPalette) {
  return {
    stars: [],
    globe: function (u, v) {
      u = p5.constrain(u, -90, 90);
      return {
        x: (1 + p5.sin(u) * p5.sin(v)) * 45 + 155,
        y: (1 + p5.cos(v)) * 45 + 10,
      };
    },
    quad: function (i, j, faceSize, rotation = 0) {
      const k = ((i + rotation) % 360) - 180;
      if (k < -90 - faceSize || k > 90) {
        return;
      }
      const color = lerpColorFromPalette(p5.noise(i, j, p5.frameCount / 70));
      const highlight = 50 * p5.pow(p5.cos(k), 2);
      const brightness =
      p5.noise(i, j, p5.frameCount / 50) * 150 + 100 + highlight;
      p5.fill(p5.lerpColor(color, p5.color(brightness), brightness / 255));
      const a = this.globe(k, j);
      const b = this.globe(k + faceSize, j);
      const c = this.globe(k + faceSize, j + faceSize);
      const d = this.globe(k, j + faceSize);
      p5.quad(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
    },
    init: function () {
      this.stars.length = 0;

      for (let i = 0; i < 75; i++) {
        this.stars.push({
          x: p5.random(0, 400),
          y: p5.random(0, 250),
          color: p5.lerpColor(
          lerpColorFromPalette(p5.random()),
          p5.color('#fff'),
          0.75
        ),
        });
      }
    },
    draw: function () {
      p5.noFill();
    // Draw a horizontal gradient of the palette colors to the background
      let ctx = p5._renderer.drawingContext;
      ctx.save();
      let gradient = ctx.createLinearGradient(425, 425, 425, 0);
    // Initialize first color stop so colors loop
      let color = colorFromPalette(0);
      gradient.addColorStop(0, color);
      for (let i = 0; i < 5; i++) {
        let color = colorFromPalette(i);
        gradient.addColorStop((5 - i) / 5, color.toString());
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 425, 425);
      ctx.restore();

      p5.noStroke();

      for (const star of this.stars) {
        const distanceFromCenter = 200 - star.x;
        const opacity = p5.constrain(p5.cos(distanceFromCenter / 2), 0, 4);
        const heightFade = p5.constrain(250 - star.y, 0, 500);
        p5.push();
        p5.translate(star.x, star.y);
        const sparkle = p5.constrain(
        p5.noise(star.x / 50, star.y / 50, p5.frameCount / 50) + 0.4,
        0,
        1
      );
        p5.drawingContext.globalAlpha = opacity * (heightFade / 100) * 0.85;
        p5.scale(1 / sparkle);
        drawSparkle(p5._renderer.drawingContext, star.color);
        p5.pop();

      // Move the star to the left.
        star.x -= 4.5 - opacity * 1.5;

      // If we've gone off-screen, loop around to the right.
        if (star.x < 0) {
          star.x = 400;
        }
      }

      p5.noiseDetail(50, 0.5);
      p5.stroke('#999');
      p5.strokeWeight(2);
      p5.line(200, 0, 200, 15);
      p5.strokeWeight(0.25);

      const step = 20;
      for (let i = 0; i <= 360; i += step) {
        for (let j = 0; j < 180; j += step) {
          p5.push();
          this.quad(i, j, step, p5.frameCount * 2);
          p5.pop();
        }
      }
    },
  };
};
