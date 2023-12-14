const constants = require("../../constants");

module.exports = function (p5, getCurrentPalette, extraImages) {
  return {
    init: function () {},
    draw: function () {
      // The symbols are arranged to roughly fill a circle.  These are [x,y] offset pairs.
      const offsets = [
        [0, 270],
        [61, 112],
        [164, 1],
        [312, 1],
        [428, 66],
        [591, 153],
        [603, 323],
        [491, 502],
        [369, 502],
        [237, 542],
        [61, 438],
        [200, 134],
        [341, 173],
        [473, 215],
        [483, 340],
        [353, 333],
        [193, 419],
        [141, 255],
        [242, 248],
      ];

      let ctx = p5._renderer.drawingContext;

      ctx.save();
      let gradient = ctx.createLinearGradient(425, 425, 425, 0);
      gradient.addColorStop(
        1,
        constants.HIGHER_POWER_COLORS[getCurrentPalette()][0]
      );
      gradient.addColorStop(
        0,
        constants.HIGHER_POWER_COLORS[getCurrentPalette()][1]
      );
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 425, 425);
      ctx.restore();

      p5.push();
      p5.translate(p5.width / 2, p5.height / 2);
      p5.imageMode(p5.CENTER);
      p5.rotate(p5.frameCount);
      p5.scale(1.7);
      extraImages['higherPower'].drawFrame(19, 0, 0);
      p5.pop();

      // There is a low frequency oscillation between equal-size symbols and
      // different-size symbols.
      const scaleContribution = Math.sin(p5.frameCount / 200);

      offsets.forEach(function (offset, symbolIndex) {
        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        p5.imageMode(p5.CENTER);
        p5.rotate(-p5.frameCount * 3);
        p5.translate(offset[0] * 0.4 - 120, offset[1] * 0.4 - 120);
        p5.rotate(p5.frameCount * 5);
        p5.scale(
          0.27 +
          (scaleContribution *
            Math.sin(p5.frameCount / 100 + symbolIndex * 40)) /
          3
        );
        extraImages['higherPower'].drawFrame(symbolIndex, 0, 0);
        p5.pop();
      });
    },
  };
};
