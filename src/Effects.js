const constants = require('./constants');

// background
const discoBall = require('./effects/background/discoBall');
const higherPower = require('./effects/background/higherPower');
const rainbow = require('./effects/background/rainbow');
const flowers = require('./effects/background/flowers');
const colorCycle = require('./effects/background/colorCycle');
const disco = require('./effects/background/disco');
const ripples = require('./effects/background/ripples');
const bloomingPetals = require('./effects/background/bloomingPetals');
const clouds = require('./effects/background/clouds');
const frostedGrid = require('./effects/background/frostedGrid');
const starburst = require('./effects/background/starburst');
const diamonds = require('./effects/background/diamonds');
const circles = require('./effects/background/circles');
const sparkles = require('./effects/background/sparkles');
const text = require('./effects/background/text');
const splatter = require('./effects/background/splatter');
const swirl = require('./effects/background/swirl');
const spiral = require('./effects/background/spiral');
const lasers = require('./effects/background/lasers');
const quads = require('./effects/background/quads');
const kaleidoscope = require('./effects/background/kaleidoscope');
const snowflakes = require('./effects/background/snowflakes');
const fireworks = require('./effects/background/fireworks');
const stars = require('./effects/background/stars');
const galaxy = require('./effects/background/galaxy');
const growingStars = require('./effects/background/growingStars');
const squiggles = require('./effects/background/squiggles');
const musicWave = require('./effects/background/musicWave');

// foreground
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
