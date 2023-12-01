module.exports = function (p5, colorFromPalette) {
  return {
    init: function () {
      if (this.shapes) {
        return;
      }

      this.h = (Math.sqrt(3) / 2) * 100;

      this.shapes = p5.createGraphics(100, Math.ceil(this.h));
      this.shapes.noStroke();
      this.shapes.angleMode(p5.DEGREES);

      this.hex = p5.createGraphics(200, 200);
      this.hex.angleMode(p5.DEGREES);
    },
    blitHex: function () {
      this.hex.push();
      this.hex.clear();
      this.hex.translate(100, 100);
      this.hex.push();
      this.hex.scale(1 / p5.pixelDensity());
      this.hex.rotate(30);
      for (let i = 0; i < 3; i++) {
        this.hex.drawingContext.drawImage(
          this.shapes.elt,
          -50 * p5.pixelDensity(),
          0
        );
        this.hex.scale(-1, 1);
        this.hex.rotate(60);
        this.hex.drawingContext.drawImage(
          this.shapes.elt,
          -50 * p5.pixelDensity(),
          0
        );
        this.hex.rotate(60);
        this.hex.scale(-1, 1);
      }
      this.hex.pop();
      this.hex.pop();
    },
    row: function (n) {
      p5.push();
      for (let i = 0; i < n; i++) {
        p5.push();
        p5.scale(1 / p5.pixelDensity());
        p5.drawingContext.drawImage(
          this.hex.elt,
          -100 * p5.pixelDensity(),
          -100 * p5.pixelDensity()
        );
        p5.pop();
        p5.translate(this.h * 2, 0);
      }
      p5.pop();
    },
    draw: function () {
      p5.background(colorFromPalette(2));

      const ctx = this.shapes.drawingContext;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(100, this.h);
      ctx.lineTo(0, this.h);
      ctx.clip();
      this.shapes.clear();
      this.shapes.rotate(p5.frameCount);
      this.shapes.fill(colorFromPalette(0));
      this.shapes.rect(20, 20, 50, 50);
      this.shapes.fill(colorFromPalette(2));
      this.shapes.triangle(0, 10, 80, 90, 0, 100);
      this.shapes.fill(colorFromPalette(1));
      this.shapes.triangle(20, 0, 50, 30, 30, 60);
      this.shapes.fill(colorFromPalette(4));
      this.shapes.ellipse(100, 50, 80);
      this.shapes.fill(colorFromPalette(1));
      this.shapes.ellipse(-50, -50, 50);
      this.shapes.fill(colorFromPalette(5));
      this.shapes.ellipse(-40, -46, 20);
      this.shapes.fill(colorFromPalette(0));
      this.shapes.triangle(-60, 0, -30, -40, -30, 0);
      this.shapes.fill(colorFromPalette(3));
      this.shapes.rect(-45, 0, 40, 300);
      this.shapes.rotate(17);
      this.shapes.fill(colorFromPalette(4));
      this.shapes.rect(30, 40, 10, 40);
      this.shapes.rotate(37);
      this.shapes.fill(colorFromPalette(6));
      this.shapes.rect(30, 40, 20, 40);
      this.shapes.rotate(180);
      this.shapes.fill(colorFromPalette(0));
      this.shapes.triangle(10, 20, 80, 90, 0, 100);
      this.shapes.translate(20, 0);
      this.shapes.rotate(20);
      this.shapes.fill(colorFromPalette(3));
      this.shapes.rect(0, 0, 20, 200);
      ctx.restore();

      p5.push();
      this.blitHex();
      p5.imageMode(p5.CENTER);

      p5.translate(200, 200);
      p5.rotate(p5.frameCount);
      p5.scale(0.8);

      p5.translate(this.h * -2, -300);
      this.row(3);
      p5.translate(-this.h, 150);
      this.row(4);
      p5.translate(-this.h, 150);
      this.row(5);
      p5.translate(this.h, 150);
      this.row(4);
      p5.translate(this.h, 150);
      this.row(3);

      p5.pop();
    },
  };
};
