const constants = require('./constants');
const utils = require('./utils');

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

module.exports = class BackgroundEffects {
  constructor(p5, alpha, getEffectsInPreviewMode, extraImages) {
    this.p5_ = p5;
    this.currentPalette = 'default';

    function randomNumber(min, max) {
      return Math.round(p5.random(min, max));
    }

    function colorFromHue(h, s = 100, l = 80, a = alpha) {
      return p5.color(
        'hsla(' + Math.floor(h % 360) + ', ' + s + '%, ' + l + '%,' + a + ')'
      );
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
    this.diamonds = diamonds(p5, lerpColorFromPalette, getEffectsInPreviewMode);
    this.circles = circles(p5, lerpColorFromPalette);
    this.sparkles = sparkles(p5, randomColorFromPalette, randomNumber);
    this.text = text(p5, lerpColorFromPalette, colorFromHue, randomNumber, getEffectsInPreviewMode);
    this.splatter = splatter(p5, randomColorFromPalette);
    this.swirl = swirl(p5, randomColorFromPalette);
    this.spiral = spiral(p5, lerpColorFromPalette);
    this.lasers = lasers(p5, lerpColorFromPalette, getEffectsInPreviewMode);
    this.quads = quads(p5, colorFromPalette);
    this.kaleidoscope = kaleidoscope(p5, colorFromPalette);
    this.snowflakes = snowflakes(p5, lerpColorFromPalette, getEffectsInPreviewMode);
    this.fireworks = fireworks(p5, randomColorFromPalette, randomNumber);
    this.stars = stars(p5, randomColorFromPalette, getEffectsInPreviewMode);
    this.galaxy = galaxy(p5, randomColorFromPalette, randomNumber, getEffectsInPreviewMode);
    this.growing_stars = growingStars(p5, colorFromPalette);
    this.squiggles = squiggles(p5, lerpColorFromPalette);
    this.music_wave = musicWave(p5, lerpColorFromPalette);
  }

  randomBackgroundEffect() {
    const effects = constants.BACKGROUND_EFFECTS.filter(name =>
      this.hasOwnProperty(name)
    );
    return utils.sample(effects);
  }

  randomBackgroundPalette() {
    return utils.sample(Object.keys(constants.PALETTES));
  }
};
