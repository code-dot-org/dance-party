const constants = require("./constants");
module.exports = {
  hexToRgb: function (hexColor) {
    const R = parseInt(hexColor.substr(1, 2), 16);
    const G = parseInt(hexColor.substr(3, 2), 16);
    const B = parseInt(hexColor.substr(5, 2), 16);
    return {R, G, B};
  },
  // polyfill for https://github.com/processing/p5.js/blob/main/src/color/p5.Color.js#L355
  getP5Color: function (p5, hex, alpha) {
    let color = p5.color(hex);
    if (alpha !== undefined) {
      color._array[3] = alpha / color.maxes[color.mode][3];
    }
    const array = color._array;
    // (loop backwards for performance)
    const levels = (color.levels = new Array(array.length));
    for (let i = array.length - 1; i >= 0; --i) {
      levels[i] = Math.round(array[i] * 255);
    }
    return color;
  },
  lerpColorFromSpecificPalette: function (p5, paletteName, amount) {
    const palette = constants.PALETTES[paletteName];
    const which = amount * palette.length;
    const n = Math.floor(which);
    const remainder = which - n;

    const prev = palette[n % palette.length];
    const next = palette[(n + 1) % palette.length];

    return p5.lerpColor(p5.color(prev), p5.color(next), remainder);
  },
  noOp: () => {},
};
