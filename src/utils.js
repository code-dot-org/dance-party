/**
 * Randomly pick one element out of an array.
 * @param {Array.<T>} collection
 * @returns {T}
 * @private
 */
const sample = (collection) => collection[Math.floor(Math.random() * collection.length)];

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
  sample,
  noOp: () => {},
};
