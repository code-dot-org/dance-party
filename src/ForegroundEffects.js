const constants = require('./constants');
const utils = require('./utils');

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
  constructor(p5, getEffectsInPreviewMode) {
    this.p5_ = p5;

    // Duplicated in BackgroundEffects
    function randomNumber(min, max) {
      return Math.round(p5.random(min, max));
    }

    // Duplicated in BackgroundEffects
    function colorFromHue(h, s = 100, l = 80, a = constants.EFFECT_OPACITY.FOREGROUND) {
      return p5.color(
        'hsla(' + Math.floor(h % 360) + ', ' + s + '%, ' + l + '%,' + a + ')'
      );
    }

    function randomColor(s = 100, l = 80, a = constants.EFFECT_OPACITY.FOREGROUND) {
      return colorFromHue(randomNumber(0, 359), s, l, a);
    }

    // selecting "none" as a foreground is a no-op,
    // whereas selecting it as a background actually draws a white background.
    this.none = {
      draw: utils.noOp,
    };

    this.rain = rain(p5, randomNumber);
    this.raining_tacos = rainingTacos(p5, randomNumber, getEffectsInPreviewMode);
    this.pineapples = pineapples(p5, randomNumber, getEffectsInPreviewMode);
    this.spotlight = spotlight(p5, randomNumber);
    this.color_lights = colorLights(p5, randomNumber, randomColor);
    this.smiling_poop = smilingPoop(p5, randomNumber, getEffectsInPreviewMode);
    this.hearts_red = heartsRed(p5, randomNumber);
    this.hearts_colorful = heartsColorful(p5, randomNumber, randomColor);
    this.floating_rainbows = floatingRainbows(p5, randomNumber, getEffectsInPreviewMode);
    this.bubbles = bubbles(p5, randomColor, getEffectsInPreviewMode);
    this.exploding_stars = explodingStars(p5, randomNumber, randomColor, getEffectsInPreviewMode);
    this.pizzas = pizzas(p5, randomNumber, getEffectsInPreviewMode);
    this.smile_face = smileFace(p5, randomNumber, getEffectsInPreviewMode);
    this.confetti = confetti(p5, randomColor, getEffectsInPreviewMode);
    this.music_notes = musicNotes(p5, randomNumber, getEffectsInPreviewMode);
    this.paint_drip = paintDrip(p5, getEffectsInPreviewMode);
    this.emojis = emojis(p5, randomNumber, getEffectsInPreviewMode);
  }

  randomForegroundEffect() {
    const effects = constants.FOREGROUND_EFFECTS.filter(name =>
      this.hasOwnProperty(name)
    );
    return this.sample_(effects);
  }

  // Duplicated in BackgroundEffects
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
