const constants = require('./constants');

const discoBall = require('./effects/discoBall');
const higherPower = require('./effects/higherPower');
const rainbow = require('./effects/rainbow');
const flowers = require('./effects/flowers');
const colorCycle = require('./effects/colorCycle');
const disco = require('./effects/disco');
const ripples = require('./effects/ripples');
const bloomingPetals = require('./effects/bloomingPetals');
const clouds = require('./effects/clouds');
const frostedGrid = require('./effects/frostedGrid');
const starburst = require('./effects/starburst');
const diamonds = require('./effects/diamonds');
const circles = require('./effects/circles');
const sparkles = require('./effects/sparkles');
const text = require('./effects/text');
const splatter = require('./effects/splatter');
const swirl = require('./effects/swirl');
const spiral = require('./effects/spiral');
const lasers = require('./effects/lasers');
const quads = require('./effects/quads');
const kaleidoscope = require('./effects/kaleidoscope');
const snowflakes = require('./effects/snowflakes');
const fireworks = require('./effects/fireworks');
const stars = require('./effects/stars');
const galaxy = require('./effects/galaxy');
const growingStars = require('./effects/growingStars');
const squiggles = require('./effects/squiggles');
const musicWave = require('./effects/musicWave');

// foreground
const rain = require('./effects/rain');
const rainingTacos = require('./effects/rainingTacos');
const pineapples = require('./effects/pineapples');
const spotlight = require('./effects/spotlight');
const colorLights = require('./effects/colorLights');
const smilingPoop = require('./effects/smilingPoop');
const heartsRed = require('./effects/heartsRed');
const heartsColorful = require('./effects/heartsColorful');
const floatingRainbows = require('./effects/floatingRainbows');
const bubbles = require('./effects/bubbles');
const explodingStars = require('./effects/explodingStars');
const pizzas = require('./effects/pizzas');
const smileFace = require('./effects/smileFace');
const confetti = require('./effects/confetti');
const musicNotes = require('./effects/musicNotes');
const paintDrip = require('./effects/paintDrip');
const emojis = require('./effects/emojis');

module.exports = class Effects {
  constructor(p5, alpha, extraImages, blend, currentPalette = 'default') {
    this.p5_ = p5;
    this.extraImages = extraImages;
    this.blend = blend || p5.BLEND;
    this.currentPalette = currentPalette;
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

    const colorFromPalette = n => {
      const palette = constants.PALETTES[this.currentPalette];
      return palette[n % palette.length];
    };

    const lerpColorFromPalette = amount => {
      return lerpColorFromSpecificPalette(this.currentPalette, amount);
    };

    const lerpColorFromSpecificPalette = (paletteName, amount) => {
      const palette = constants.PALETTES[paletteName];
      const which = amount * palette.length;
      const n = Math.floor(which);
      const remainder = which - n;

      const prev = palette[n % palette.length];
      const next = palette[(n + 1) % palette.length];

      return p5.lerpColor(p5.color(prev), p5.color(next), remainder);
    };

    const randomColorFromPalette = () => {
      const palette = constants.PALETTES[this.currentPalette];
      return palette[randomNumber(0, palette.length - 1)];
    };

    const getCurrentPalette = () => {
      return this.currentPalette;
    };

    this.none = {
      draw: function ({backgroundColor}) {
        p5.background(backgroundColor || 'white');
      },
    };

    // background
    this.disco_ball = discoBall(p5, lerpColorFromPalette, colorFromPalette);
    this.higher_power = higherPower(p5, getCurrentPalette, extraImages);
    this.rainbow = rainbow(p5, lerpColorFromPalette);
    this.flowers = flowers(p5, lerpColorFromPalette);
    this.color_cycle = colorCycle(p5, lerpColorFromPalette);
    this.disco = disco(p5, lerpColorFromPalette, randomNumber);
    this.ripples = ripples(false, p5, colorFromPalette, randomNumber);
    this.ripples_random = ripples(true, p5, colorFromPalette, randomNumber);
    this.blooming_petals = bloomingPetals(p5, getCurrentPalette, colorFromPalette);
    this.clouds = clouds(p5, lerpColorFromPalette);
    this.frosted_grid = frostedGrid(p5, getCurrentPalette, randomNumber);
    this.starburst = starburst(p5, lerpColorFromPalette, randomColorFromPalette, randomNumber);
    this.diamonds = diamonds(p5, lerpColorFromPalette, getInPreviewMode);
    this.circles = circles(p5, lerpColorFromPalette);
    this.sparkles = sparkles(p5, randomColorFromPalette, randomNumber);
    this.text = text(p5, lerpColorFromPalette, colorFromHue, randomNumber, getInPreviewMode);
    this.splatter = splatter(p5, randomColorFromPalette);
    this.swirl = swirl(p5, randomColorFromPalette);
    this.spiral = spiral(p5, lerpColorFromPalette);
    this.lasers = lasers(p5, lerpColorFromPalette, getInPreviewMode);
    this.quads = quads(p5, colorFromPalette);
    this.kaleidoscope = kaleidoscope(p5, colorFromPalette);
    this.snowflakes = snowflakes(p5, lerpColorFromPalette, getInPreviewMode);
    this.fireworks = fireworks(p5, randomColorFromPalette, randomNumber);
    this.stars = stars(p5, randomColorFromPalette, getInPreviewMode);
    this.galaxy = galaxy(p5, randomColorFromPalette, randomNumber, getInPreviewMode);
    this.growing_stars = growingStars(p5, colorFromPalette);
    this.squiggles = squiggles(p5, lerpColorFromPalette);
    this.music_wave = musicWave(p5, lerpColorFromPalette);

    // foreground
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

  randomBackgroundEffect() {
    const effects = constants.BACKGROUND_EFFECTS.filter(name =>
      this.hasOwnProperty(name)
    );
    return this.sample_(effects);
  }

  randomBackgroundPalette() {
    return this.sample_(Object.keys(constants.PALETTES));
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
