module.exports = function (p5, randomNumber) {
  return {
    drops: [],
    init: function () {
      if (this.drops.length) {
        return;
      }
      for (let i = 0; i < 20; i++) {
        this.drops.push({
          x: randomNumber(0, 380),
          y: randomNumber(0, 380),
          length: randomNumber(10, 20),
        });
      }
    },
    color: p5.rgb(92, 101, 180, 0.5),
    update: function () {
      this.color = p5.rgb(92, 101, randomNumber(140, 220), 0.5);
    },
    draw: function () {
      p5.strokeWeight(3);
      p5.stroke(this.color);
      for (let i = 0; i < this.drops.length; i++) {
        p5.push();
        p5.translate(this.drops[i].x - 20, this.drops[i].y - 20);
        p5.line(0, 0, this.drops[i].length, this.drops[i].length * 2);
        p5.pop();
        this.drops[i].y = (this.drops[i].y + this.drops[i].length) % 420;
        this.drops[i].x = (this.drops[i].x + this.drops[i].length / 2) % 420;
      }
    },
  };
};
