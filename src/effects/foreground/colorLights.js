module.exports = function (p5, randomNumber, randomColor) {
  return {
    lights: [],
    newLight: function (x, arc, offset) {
      return {
        x: x,
        arc: arc,
        offset: offset,
        shift: randomNumber(0, 359),
        color: randomColor(100, 50, 0.25),
      };
    },
    init: function () {
      if (this.lights.length) {
        return;
      }
      this.lights.push(this.newLight(75, 25, -10));
      this.lights.push(this.newLight(100, 15, -15));
      this.lights.push(this.newLight(300, 15, 15));
      this.lights.push(this.newLight(325, 25, 10));
    },
    update: function () {
      this.lights.forEach(function (light) {
        light.color = randomColor(100, 50, 0.25);
      });
    },
    draw: function ({isPeak, centroid}) {
      if (isPeak) {
        this.update();
      }
      p5.noStroke();
      this.lights.forEach(function (light) {
        p5.push();
        p5.fill(light.color);
        p5.translate(light.x, -50);
        p5.rotate(
          Math.sin(p5.frameCount / 100 + light.shift + centroid / 2000) *
          light.arc +
          light.offset
        );
        p5.triangle(0, 0, -75, 600, 75, 600);
        p5.pop();
      });
    },
  };
};
