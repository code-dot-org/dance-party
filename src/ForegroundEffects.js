const constants = require('./constants');

const rain = require('./effects/foreground/rain');
const rainingTacos = require('./effects/foreground/rainingTacos');
const pineapples = require('./effects/foreground/pineapples');
const spotlight = require('./effects/foreground/spotlight');
const colorLights = require('./effects/foreground/colorLights');
const smilingPoop = require('./effects/foreground/smilingPoop');
const heartsRed = require('./effects/foreground/heartsRed');
const heartsColorful = require('./effects/foreground/heartsColorful');
const floatingRainbows = require('./effects/foreground/floatingRainbows');
const bubbles = require('./effects/foreground/bubbles');
const explodingStars = require('./effects/foreground/explodingStars');
const pizzas = require('./effects/foreground/pizzas');
const smileFace = require('./effects/foreground/smileFace');
const confetti = require('./effects/foreground/confetti');
const musicNotes = require('./effects/foreground/musicNotes');
const paintDrip = require('./effects/foreground/paintDrip');
const emojis = require('./effects/foreground/emojis');

module.exports = class ForegroundEffects {
  constructor(p5, alpha) {
    this.p5_ = p5;
    this.inPreviewMode = false;
    const getInPreviewMode = this.getInPreviewMode.bind(this);

    function randomNumber(min, max) {
      return Math.round(p5.random(min, max));
    }

    function colorFromHue(h, s = 100, l = 80, a = alpha) {
      return p5.color(
        'hsla(' + Math.floor(h % 360) + ', ' + s + '%, ' + l + '%,' + a + ')'
      );
    }

    function randomColor(s = 100, l = 80, a = alpha) {
      return colorFromHue(randomNumber(0, 359), s, l, a);
    }

    const lerpColorFromSpecificPalette = (paletteName, amount) => {
      const palette = constants.PALETTES[paletteName];
      const which = amount * palette.length;
      const n = Math.floor(which);
      const remainder = which - n;

      const prev = palette[n % palette.length];
      const next = palette[(n + 1) % palette.length];

      return p5.lerpColor(p5.color(prev), p5.color(next), remainder);
    };

    // selecting "none" as a foreground is a no-op,
    // whereas selecting it as a background actually draws a white background.
    this.none = {
      draw: function () {
      }
    };

    this.rain = rain(p5, randomNumber);
    this.raining_tacos = rainingTacos(p5, randomNumber, getInPreviewMode);
    this.pineapples = pineapples(p5, randomNumber, getInPreviewMode);
    this.spotlight = spotlight(p5, randomNumber);
    this.color_lights = colorLights(p5, randomNumber, randomColor);
    this.smiling_poop = smilingPoop(p5, randomNumber, getInPreviewMode);
    this.hearts_red = heartsRed(p5, randomNumber);
    this.hearts_colorful = heartsColorful(p5, randomNumber, randomColor);
    this.floating_rainbows = floatingRainbows(p5, randomNumber, getInPreviewMode);
    this.bubbles = bubbles(p5, randomColor, getInPreviewMode);
    this.exploding_stars = explodingStars(p5, randomNumber, randomColor, getInPreviewMode);
    this.pizzas = pizzas(p5, randomNumber, getInPreviewMode);
    this.smile_face = smileFace(p5, randomNumber, getInPreviewMode);
    this.confetti = confetti(p5, randomColor, getInPreviewMode);
    this.music_notes = musicNotes(p5, randomNumber, getInPreviewMode);
    this.paint_drip = paintDrip(p5, lerpColorFromSpecificPalette, getInPreviewMode);
    this.emojis = emojis(p5, randomNumber, getInPreviewMode);
  }

  setInPreviewMode(inPreviewMode) {
    this.inPreviewMode = inPreviewMode;
  }

  getInPreviewMode() {
    return this.inPreviewMode;
  }

  randomForegroundEffect() {
    const effects = constants.FOREGROUND_EFFECTS.filter(name =>
      this.hasOwnProperty(name)
    );
    return this.sample_(effects);
  }

  /**
   * Randomly pick one element out of an array.
   * @param {Array.<T>} collection
   * @returns {T}
   * @private
   */
  sample_(collection) {
    return collection[Math.floor(this.p5_.random(0, collection.length))];
  }
};
