const constants = require('./constants');
const drawFrostedGrid = require('./shapes/frostedGrid');
const drawHeart = require('./shapes/heart');
const drawLovestruck = require('./shapes/lovestruck');
const drawMusicNote = require('./shapes/musicNote');
const drawPetal = require('./shapes/petal');
const drawPineapple = require('./shapes/pineapple');
const drawPizza = require('./shapes/pizza');
const drawPoop = require('./shapes/poop');
const drawRainbow = require('./shapes/rainbow');
const drawSmiley = require('./shapes/smiley');
const drawSparkle = require('./shapes/sparkle');
const drawSpiral = require('./shapes/spiral');
const drawStar = require('./shapes/star');
const drawStarburst = require('./shapes/starburst');
const drawStarstruck = require('./shapes/starstruck');
const drawSwirl = require('./shapes/swirl');
const drawTaco = require('./shapes/taco');
const drawTickled = require('./shapes/tickled');
const drawWink = require('./shapes/wink');
const {hexToRgb, getP5Color} = require('./utils');

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

    // figure out what to do here with foregrounds
    this.none = {
      draw: function ({backgroundColor}) {
        p5.background(backgroundColor || 'white');
      },
    };

    this.disco_ball = {
      stars: [],
      globe: function (u, v) {
        u = p5.constrain(u, -90, 90);
        return {
          x: (1 + p5.sin(u) * p5.sin(v)) * 45 + 155,
          y: (1 + p5.cos(v)) * 45 + 10,
        };
      },
      quad: function (i, j, faceSize, rotation = 0) {
        const k = ((i + rotation) % 360) - 180;
        if (k < -90 - faceSize || k > 90) {
          return;
        }
        const color = lerpColorFromPalette(p5.noise(i, j, p5.frameCount / 70));
        const highlight = 50 * p5.pow(p5.cos(k), 2);
        const brightness =
          p5.noise(i, j, p5.frameCount / 50) * 150 + 100 + highlight;
        p5.fill(p5.lerpColor(color, p5.color(brightness), brightness / 255));
        const a = this.globe(k, j);
        const b = this.globe(k + faceSize, j);
        const c = this.globe(k + faceSize, j + faceSize);
        const d = this.globe(k, j + faceSize);
        p5.quad(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
      },
      init: function () {
        this.stars.length = 0;

        for (let i = 0; i < 75; i++) {
          this.stars.push({
            x: p5.random(0, 400),
            y: p5.random(0, 250),
            color: p5.lerpColor(
              lerpColorFromPalette(p5.random()),
              p5.color('#fff'),
              0.75
            ),
          });
        }
      },
      draw: function () {
        p5.noFill();
        // Draw a horizontal gradient of the palette colors to the background
        let ctx = p5._renderer.drawingContext;
        ctx.save();
        let gradient = ctx.createLinearGradient(425, 425, 425, 0);
        // Initialize first color stop so colors loop
        let color = colorFromPalette(0);
        gradient.addColorStop(0, color);
        for (let i = 0; i < 5; i++) {
          let color = colorFromPalette(i);
          gradient.addColorStop((5 - i) / 5, color.toString());
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 425, 425);
        ctx.restore();

        p5.noStroke();

        for (const star of this.stars) {
          const distanceFromCenter = 200 - star.x;
          const opacity = p5.constrain(p5.cos(distanceFromCenter / 2), 0, 4);
          const heightFade = p5.constrain(250 - star.y, 0, 500);
          p5.push();
          p5.translate(star.x, star.y);
          const sparkle = p5.constrain(
            p5.noise(star.x / 50, star.y / 50, p5.frameCount / 50) + 0.4,
            0,
            1
          );
          p5.drawingContext.globalAlpha = opacity * (heightFade / 100) * 0.85;
          p5.scale(1 / sparkle);
          drawSparkle(p5._renderer.drawingContext, star.color);
          p5.pop();

          // Move the star to the left.
          star.x -= 4.5 - opacity * 1.5;

          // If we've gone off-screen, loop around to the right.
          if (star.x < 0) {
            star.x = 400;
          }
        }

        p5.noiseDetail(50, 0.5);
        p5.stroke('#999');
        p5.strokeWeight(2);
        p5.line(200, 0, 200, 15);
        p5.strokeWeight(0.25);

        const step = 20;
        for (let i = 0; i <= 360; i += step) {
          for (let j = 0; j < 180; j += step) {
            p5.push();
            this.quad(i, j, step, p5.frameCount * 2);
            p5.pop();
          }
        }
      },
    };

    this.higher_power = {
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

    this.rainbow = {
      lengths: [0, 0, 0, 0, 0, 0, 0],
      current: 0,
      update: function () {
        this.lengths[this.lengths.length - (1 + this.current)] = 1;
        this.current = (this.current + 1) % this.lengths.length;
      },
      draw: function ({isPeak, bpm}) {
        if (isPeak) {
          this.update();
        }
        p5.push();
        let backgroundColor = lerpColorFromPalette(0.5);
        // Hack to set alpha for p5
        backgroundColor._array[3] = 0.25;
        p5.background(backgroundColor);
        p5.noFill();
        p5.strokeWeight(50);
        let d, i;
        for (i = 0; i < 7; i++) {
          let paletteColor = lerpColorFromPalette(i * 0.14);
          paletteColor._array[3] = 0.5;
          p5.stroke(paletteColor);
          d = 150 + i * 100;
          p5.arc(0, 400, d, d, -90, 0);
          if (this.lengths[i] > 0) {
            // Hack to set RGB and Alpha values of p5 color objects
            let [red, green, blue] = paletteColor.levels;
            paletteColor.levels[0] = red - 20;
            paletteColor.levels[1] = green - 20;
            paletteColor.levels[2] = blue - 20;
            paletteColor._array[3] = 1 - this.lengths[i] / 90;
            p5.stroke(paletteColor);
            p5.arc(0, 400, d, d, -90, -90 + this.lengths[i]);
            this.lengths[i] = (this.lengths[i] + bpm / 50) % 90;
          }
        }
        p5.pop();
      },
    };

    this.flowers = {
      hue: 0,

      drawFlower: function (num_petals, color) {
        p5.fill(color);
        for (let i = 0; i < num_petals; i++) {
          p5.rotate(360 / num_petals);
          p5.ellipse(0, 30, 20, 80);
        }
      },

      draw: function ({isPeak}) {
        if (isPeak) {
          this.hue += 25;
        }
        p5.push();
        p5.noStroke();
        p5.translate(200, 200);
        p5.angleMode(p5.DEGREES);
        for (let i = 9; i > -1; i--) {
          p5.push();
          p5.scale(i);
          this.drawFlower(
            8,
            lerpColorFromPalette(((this.hue + i * 10) % 360) / 360)
          );
          p5.pop();
        }
        p5.pop();
      },
    };

    this.color_cycle = {
      color: 0,
      update: function () {
        this.color += 0.03;
      },
      draw: function ({isPeak}) {
        if (isPeak) {
          this.update();
        }
        p5.background(lerpColorFromPalette(this.color));
      },
    };

    this.disco = {
      bg: undefined,
      colors: [],
      squaresPerSide: 4,
      minColorChangesPerUpdate: 5,
      maxColorChangesPerUpdate: 9,
      init: function () {
        if (this.colors.length) {
          return;
        }
        // Alpha is ignored for this effect to avoid memory leaks with too many
        // layers of alpha blending.
        this.colors.length = this.squaresPerSide * this.squaresPerSide;
        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i] = lerpColorFromPalette(p5.random(0, 1));
        }
      },
      update: function () {
        const numChanges = randomNumber(
          this.minColorChangesPerUpdate,
          this.maxColorChangesPerUpdate
        );
        for (let i = 0; i < numChanges; i++) {
          const loc = randomNumber(0, this.colors.length);
          this.colors[loc] = lerpColorFromPalette(p5.random(0, 1));
        }
      },
      draw: function ({isPeak}) {
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.noStroke();
        const squareWidth = p5.width / this.squaresPerSide;
        const squareHeight = p5.height / this.squaresPerSide;
        for (let i = 0; i < this.colors.length; i++) {
          p5.fill(this.colors[i]);
          p5.rect(
            (i % this.squaresPerSide) * squareWidth,
            Math.floor(i / this.squaresPerSide) * squareHeight,
            squareWidth,
            squareHeight
          );
        }
        p5.pop();
      },
    };

    // Creates a "ripple" effect where the ripple positions can be random.
    let createRipplesEffect = function (isRandomRipple) {
      return {
        // Determines whether or not the start positions of the ripples are random or centered.
        isRandomRipple: isRandomRipple,
        // The max width a ripple can be before it disappears.
        maxRippleWidth: 575,
        // The ripples which are growing.
        ripples: [],
        // The count of ripples which have been created since the dance started.
        rippleCount: 0,
        // The timestamp of when the last "draw" happened.
        lastDrawTime: new Date(),
        // Tracks the last biggest ripple's color so we can set that as the background after it disappears
        backgroundColor: colorFromPalette(0),

        init: function () {
          this.lastDrawTime = new Date();
          this.backgroundColor = colorFromPalette(0);
          this.ripples = [];
          // If the starting location is random, then the circles might need to be 2x as wide to fill the screen.
          if (isRandomRipple) {
            this.maxRippleWidth = 1150;
          }
          // put some initial ripples.
          for (let i = 0; i < 6; i++) {
            this.ripples.push(
              this.createRipple(
                this.maxRippleWidth * (0.85 - 0.15 * i),
                this.isRandomRipple
              )
            );
          }
        },

        draw: function ({isPeak, bpm}) {
          let currentTime = new Date();
          let maxRippleWidth = this.maxRippleWidth;
          p5.background(this.backgroundColor);
          // On each "peak", create a new ripple.
          if (isPeak) {
            this.ripples.push(this.createRipple(1, this.isRandomRipple));
          }
          p5.push();
          p5.noStroke();
          p5.ellipseMode(p5.CENTER);
          // calculate how much the ripples have grown and draw them.
          let rippleWidthGrowth = this.getRippleGrowth(currentTime, bpm);
          for (let i = 0; i < this.ripples.length; i++) {
            let ripple = this.ripples[i];
            ripple.width += rippleWidthGrowth;
            p5.fill(ripple.color);
            p5.ellipse(ripple.x, ripple.y, ripple.width);
          }
          // remove ripples which are too big, and updated the backgroundColor to match the highest one.
          let backgroundColor = this.backgroundColor;
          this.ripples = this.ripples.filter(function (ripple) {
            if (ripple.width < maxRippleWidth) {
              return true;
            } else {
              backgroundColor = ripple.color;
              return false;
            }
          });
          this.backgroundColor = backgroundColor;
          p5.pop();
          // keep track of the draw times so we can calculate how much time has passed.
          this.lastDrawTime = currentTime;
        },

        // creates a object representing the size and position of a ripple given an initial width
        createRipple: function (width, isRandom) {
          let x = 200;
          let y = 200;
          if (isRandom) {
            x = randomNumber(20, 380);
            y = randomNumber(20, 380);
          }
          return {
            x: x,
            y: y,
            color: colorFromPalette(++this.rippleCount),
            width: width,
          };
        },

        // calculates the increase in width a ripple will experience depending on the
        // amount of time which has passed since the last drawm and the current BPM.
        getRippleGrowth: function (currentTime, bpm) {
          if (bpm === 0) {
            return 0;
          }
          // Velocity of the ripple width expansion.
          let velocity = this.maxRippleWidth / (bpm / 60) / 1.5;
          // Calculate how much time has passed so we know how wide the ripple should be.
          let deltaTime = (currentTime - this.lastDrawTime) / 1000;
          return Math.floor(velocity * deltaTime);
        },
      };
    };

    this.ripples = createRipplesEffect(false);
    this.ripples_random = createRipplesEffect(true);

    // This effect is slightly modified from Poetry background effect 'blooming'
    // https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L245
    this.blooming_petals = {
      colorIndex: 0,
      petals: [],
      paletteLength: 0,
      addPetalLayer: function (color, layer) {
        for (let i = 0; i < 8; i++) {
          this.petals.push({
            theta: 45 * i,
            length: 10 + 140 * layer,
            ...color,
          });
        }
      },
      init: function () {
        this.paletteLength = constants.PALETTES[getCurrentPalette()].length;
        this.petals = [];
        // Initialize with enough petals to fill the screen - this is mostly
        // useful so that preview shows what the background actually looks like.
        // Increment from 3 down to 0 so that petals are layered correctly with
        // bigger petals behind smaller petals.
        for (let layer = 3; layer >= 0; layer--) {
          const color = colorFromPalette(this.colorIndex);
          this.addPetalLayer(hexToRgb(color), layer);
          this.colorIndex = (this.colorIndex + 1) % this.paletteLength;
        }
      },
      draw: function () {
        p5.push();
        p5.strokeWeight(2);
        if (p5.World.frameCount % 70 === 0) {
          const color = colorFromPalette(this.colorIndex);
          this.addPetalLayer(hexToRgb(color), 0 /* layer */);
          this.colorIndex = (this.colorIndex + 1) % this.paletteLength;
        }
        const petalWidth = 35;
        this.petals.forEach(petal => {
          // Multiply each component by 0.8 to have the stroke color be
          // slightly darker than the fill color.
          p5.stroke(
            p5.color(petal.R * 0.8, petal.G * 0.8, petal.B * 0.8)
          );
          p5.fill(p5.color(petal.R, petal.G, petal.B));
          drawPetal(p5, petal.length, petal.theta, petalWidth);
          petal.theta = (petal.theta + 0.5) % 360;
          petal.length += 2;
        });
        this.petals = this.petals.filter(petal => petal.length < 700);
        p5.pop();
      },
    };

    // This effect is slightly modified from Poetry background effect 'clouds'
    // https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L368
    this.clouds = {
      tileSize: 20,
      tiles: [],
      init: function () {
        const noiseScale = 0.05;
        this.tiles = [];
        let xnoise = 0.01;
        let ynoise = 0.01;
        for (let x = 0; x < 400; x += this.tileSize) {
          xnoise = 0.01;
          for (let y = 0; y < 400; y += this.tileSize) {
            this.tiles.push({
              x,
              y,
              xnoise,
              ynoise,
            });
            xnoise += noiseScale;
          }
          ynoise += noiseScale;
        }
      },
      draw: function () {
        const speed = 0.015;
        let backgroundAmount = 0;
        p5.push();
        p5.noStroke();
        backgroundAmount += speed;
        p5.background(
          lerpColorFromPalette(backgroundAmount)
        );
        this.tiles.forEach(tile => {
          tile.alpha = p5.noise(tile.xnoise, tile.ynoise) * 255;
          tile.xnoise += speed;
          tile.ynoise += speed;
          p5.fill(getP5Color(p5, '#ffffff', tile.alpha));
          p5.rect(tile.x, tile.y, this.tileSize, this.tileSize);
        });
        p5.pop();
      },
    };

    // This effect is slightly modified from Poetry background effect 'fadeColors'
    // https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L181
    this.frosted_grid = {
      anchors: [],
      circles: [],
      spacing: 20,
      init: function () {
        this.anchors = [];
        this.circles = [];
        const paletteColors = constants.PALETTES[getCurrentPalette()];
        paletteColors.forEach(color => {
          this.anchors.push({
            x: randomNumber(0, 400),
            y: randomNumber(0, 400),
            velocityX: randomNumber(-3, 3),
            velocityY: randomNumber(-3, 3),
            ...hexToRgb(color),
          });
        });
        for (let x = 0; x < 420; x += this.spacing) {
          for (let y = 0; y < 420; y += this.spacing) {
            this.circles.push({x, y, red: 0, green: 0, blue: 0});
          }
        }
      },
      draw: function () {
        p5.push();
        drawFrostedGrid(p5, this.anchors, this.circles, this.spacing);
        p5.pop();
      },
    };

    // This background effect is inspired by the Poetry foreground effect 'starburst'
    // https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/foregroundEffects.js#L235
    this.starburst = {
      stars: [],
      init: function () {
        this.stars = [];
        p5.push();
        p5.background(lerpColorFromPalette(0));
        // A call to drawStarburst with isPreview=true will ensure background effect
        // is displayed in preview.
        drawStarburst(p5, true, this.stars, randomNumber, randomColorFromPalette, drawStar);
        p5.pop();
      },
      draw: function () {
        p5.push();
        p5.noStroke();
        p5.background(lerpColorFromPalette(0));
        drawStarburst(p5, false, this.stars, randomNumber, randomColorFromPalette, drawStar);
        p5.pop();
      },
    };

    this.diamonds = {
      hue: 0,
      update: function () {
        this.hue += 25;
      },
      draw: function ({isPeak, centroid}) {
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.rectMode(p5.CENTER);
        p5.translate(200, 200);
        p5.rotate(45);
        p5.noFill();
        p5.strokeWeight(p5.map(centroid, 0, 4000, 0, 50));
        for (let i = 5; i > -1; i--) {
          p5.stroke(lerpColorFromPalette(((this.hue + i * 10) % 360) / 360));
          p5.rect(0, 0, i * 100 + 50, i * 100 + 50);
        }
        p5.pop();
      },
    };

    this.circles = {
      hue: 0,
      update: function () {
        this.hue += 25;
      },
      draw: function ({isPeak}) {
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.noStroke();
        p5.ellipseMode(p5.CENTER);
        p5.translate(200, 200);
        for (let i = 5; i > -1; i--) {
          p5.fill(lerpColorFromPalette(((this.hue + i * 10) % 360) / 360));
          p5.ellipse(0, 0, i * 100 + 75, i * 100 + 75);
        }
        p5.pop();
      },
    };

    // looks good in production
    this.rain = {
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

    this.sparkles = {
      sparkles: [],
      maxSparkles: 80,
      makeRandomSparkle: function () {
        return {
          x: randomNumber(-100, 600),
          y: randomNumber(0, 400),
          color: randomColorFromPalette(),
        };
      },
      init: function () {
        if (this.sparkles.length) {
          return;
        }
        for (let i = 0; i < this.maxSparkles; i++) {
          this.sparkles.push(this.makeRandomSparkle());
        }
      },
      update: function () {},
      draw: function ({bpm}) {
        // Provide a default value for bpm of song when not provided so that
        // sparkles effect is drawn even in preview mode.
        bpm = bpm || 120;
        p5.background('#2b1e45');
        let velocity = Math.floor((bpm / 90) * 3);
        for (let i = 0; i < this.maxSparkles; i++) {
          p5.push();
          if (this.sparkles[i].x < 10 || this.sparkles[i].y > 410) {
            this.sparkles[i] = this.makeRandomSparkle();
          }

          this.sparkles[i].x -= velocity;
          this.sparkles[i].y += velocity;
          p5.translate(this.sparkles[i].x, this.sparkles[i].y);
          drawSparkle(p5._renderer.drawingContext, this.sparkles[i].color);
          p5.pop();
        }
      },
    };

    this.text = {
      texts: [],
      maxTexts: 10,
      update: function (text, hue, size) {
        this.texts.push({
          x: randomNumber(25, 375),
          y: randomNumber(25, 375),
          text: text,
          font: 'Arial',
          color: lerpColorFromPalette(hue / 360),
          size: size,
        });
        if (this.texts.length > this.maxTexts) {
          this.texts.shift();
        }
      },
      draw: function ({isPeak, centroid, artist, title}) {
        if (isPeak) {
          let text;
          if (randomNumber(0, 1) === 0) {
            text = artist;
          } else {
            text = title;
          }
          this.update(text, centroid, randomNumber(14, 48));
        }
        p5.push();
        p5.background(colorFromHue(0, 0, 40));
        p5.textAlign(p5.CENTER, p5.CENTER);
        this.texts.forEach(function (t) {
          p5.textSize(t.size);
          p5.textFont(t.font);
          p5.fill(t.color);
          p5.text(t.text, t.x, t.y);
        });
        p5.pop();
      },
    };

    // reset clicked with no tacos on the screen
    // doesn't preview any tacos
    this.raining_tacos = {
      tacos: [],
      init: function () {
        if (this.tacos.length) {
          return;
        }
        for (let i = 0; i < 10; i++) {
          this.tacos.push({
            x: randomNumber(20, 380),
            y: this.getPreviewCustomizations().y,
            rot: randomNumber(0, 359),
            speed: 3,
            size: 5,
          });
        }
        this.image = p5.createGraphics(125, 50);
        this.image.scale(3);
        drawTaco(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = this.getPreviewCustomizations().getCentroid(context);
        for (let i = 0; i < this.tacos.length; i++) {
          p5.push();
          const taco = this.tacos[i];
          let scale = p5.map(centroid, 5000, 8000, 0, taco.size);
          scale = p5.constrain(scale, 0, 5);
          p5.translate(taco.x, taco.y);
          p5.rotate(taco.rot);
          p5.scale(scale / (4 * p5.pixelDensity()));
          p5.image(this.image);
          taco.y += taco.speed;
          taco.rot++;
          if (taco.y > 420) {
            taco.x = randomNumber(20, 380);
            taco.y = -50;
          }
          p5.pop();
        }
      },
      reset: function () {
        this.tacos = [];
      },
      getPreviewCustomizations: function () {
        return getInPreviewMode() ?
          {
            y: randomNumber(0, 400),
            getCentroid: () => 6500,
          } :
          {
            y: randomNumber(-400, 0),
            getCentroid: context => context.centroid,
          };
      },
    };

    this.pineapples = {
      pineappleList: [],
      init: function () {
        if (this.pineappleList.length) {
          return;
        }
        for (let i = 0; i < 8; i++) {
          this.pineappleList.push({
            x: randomNumber(10, 390),
            y: randomNumber(10, 390),
            rot: randomNumber(0, 359),
            life: 5,
          });
        }
        this.image = p5.createGraphics(75, 130);
        this.image.scale(7);
        drawPineapple(this.image.drawingContext);
      },
      draw: function () {
        for (let i = 0; i < this.pineappleList.length; i++) {
          p5.push();
          const pineapple = this.pineappleList[i];

          // added. randomNumber(10, 120) copied from life reset below
          const scale = getInPreviewMode() ?
            randomNumber(10, 120) / 20 / (7 * p5.pixelDensity()) :
            pineapple.life / 20 / (7 * p5.pixelDensity());

          p5.translate(pineapple.x, pineapple.y);
          p5.rotate(pineapple.rot);
          p5.scale(scale); // changed
          p5.drawingContext.drawImage(this.image.elt, -35, -65);
          pineapple.life--;
          if (pineapple.life < 0) {
            pineapple.x = randomNumber(10, 390);
            pineapple.y = randomNumber(10, 390);
            pineapple.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      },
      reset: function () {
        this.pineappleList = [];
      },
    };

    this.splatter = {
      buffer: null,
      splats: [],
      numSplats: 5,
      randomSplat: function () {
        return {
          x: p5.random(0, 400),
          y: p5.random(0, 400),
          r: p5.random(5, 15),
          color: randomColorFromPalette(),
        };
      },
      init: function () {
        this.splats.length = 0;
        for (let i = 0; i < this.numSplats; i++) {
          this.splats.push(this.randomSplat());
        }

        if (this.buffer) {
          this.buffer.clear();
          return;
        }
        this.buffer = p5.createGraphics(p5.width, p5.height);
        this.buffer.noStroke();
        this.buffer.drawingContext.globalAlpha = 0.8;
      },
      draw: function () {
        // first make a pass and remove items, traversing in reverse so that removals
        // dont affect traversal
        for (let splat of this.splats) {
          if (splat.r > 30) {
            splat.x = p5.random(0, 400);
            splat.y = p5.random(0, 400);
            splat.r = p5.random(5, 15);
            splat.color = randomColorFromPalette();
          }

          splat.r += p5.random(1);
          this.buffer.fill(splat.color);
          for (let i = 0; i < 20; i++) {
            this.buffer.ellipse(
              p5.randomGaussian(splat.x, splat.r),
              p5.randomGaussian(splat.y, splat.r),
              p5.random(2, 8)
            );
          }
        }

        // Copy the off-screen buffer to the canvas.
        p5.push();
        p5.scale(1 / p5.pixelDensity());
        p5.drawingContext.drawImage(this.buffer.elt, 0, 0);
        p5.pop();
      },
    };

    this.swirl = {
      angle: 0,
      color: null,
      update: function () {
        this.color = randomColorFromPalette();
      },
      draw: function ({isPeak, bpm}) {
        if (isPeak || !this.color) {
          this.update();
        }
        p5.push();
        p5.background(this.color);
        p5.translate(200, 200);
        let rotation = (bpm / 90) * 50;
        this.angle -= rotation;
        p5.rotate((Math.PI / 180) * this.angle);
        p5.translate(-427, -400);
        drawSwirl(p5._renderer.drawingContext);
        p5.pop();
      },
    };

    this.spiral = {
      angle: 0,
      color: 0,
      init: function () {
        this.color = 0;
      },
      update: function () {
        this.color += 0.13;
        if (this.color > 1) {
          this.color -= 1;
        }
      },
      draw: function ({isPeak, bpm}) {
        if (isPeak) {
          this.update();
        }
        p5.background(lerpColorFromPalette(this.color));
        p5.push();
        p5.translate(200, 200);
        let rotation = (bpm / 90) * 200;
        this.angle -= rotation;
        p5.rotate((Math.PI / 180) * this.angle);
        p5.translate(-600, -600);
        drawSpiral(p5._renderer.drawingContext);
        p5.pop();
      },
    };

    // looks ok?
    this.spotlight = {
      x: 200,
      y: 200,
      targetX: null,
      targetY: null,
      dx: 0,
      dy: 0,
      diameter: 0,
      swirl: null,
      init: function () {
        this.targetX = 200;
        this.targetY = 200;
        this.update();
      },
      update: function () {
        while (
          Math.sqrt(
            (this.targetY - this.y) ** 2 + (this.targetX - this.x) ** 2
          ) < 40
        ) {
          this.targetX = randomNumber(50, 350);
          this.targetY = randomNumber(50, 350);
        }
        let angleOfMovement = Math.atan2(
          this.targetY - this.y,
          this.targetX - this.x
        );
        this.dx = 6 * Math.cos(angleOfMovement);
        this.dy = 6 * Math.sin(angleOfMovement);
      },
      draw: function ({isPeak}) {
        if (
          isPeak ||
          (Math.abs(this.targetX - this.x) < 4 &&
            Math.abs(this.targetY - this.y) < 4)
        ) {
          this.update();
        }
        p5.push();
        p5.noFill();
        p5.stroke('#000');
        p5.strokeWeight(600);
        this.x += this.dx + randomNumber(-1, 1);
        this.y += this.dy + randomNumber(-1, 1);
        p5.ellipse(this.x, this.y, 800, 800);
        p5.pop();
      },
    };

    this.lasers = {
      laser: [],
      init: function () {
        this.laser.length = 0;
      },
      draw: function () {
        p5.background('black');
        if (this.laser.length < 32) {
          let laser = {
            w: 200,
            x: 200,
            y: 1750,
            z: 400,
            color: lerpColorFromPalette(p5.frameCount / 16),
          };
          this.laser.push(laser);
        }
        p5.push();
        p5.translate(200, 180);
        for (const laser of this.laser) {
          let y = 200 * p5.sin(p5.frameCount);
          if (y < 0) {
            y *= -1;
          }
          const angle = p5.atan2(laser.y, y);
          p5.stroke(laser.color);
          p5.line(0, 0, p5.sin(angle) * 300, p5.cos(angle) * 300);
          laser.y = laser.y - 100;
          if (laser.y <= -1400) {
            laser.y = 1750;
          }
        }
        p5.pop();
      },
    };

    this.quads = {
      shapes: [],
      init: function () {
        if (!this.buffer) {
          this.buffer = p5.createGraphics(400, 400);
          this.buffer.noFill();
          this.buffer.stroke('#0f0');
          this.buffer.strokeWeight(2);
          this.buffer.strokeJoin(p5.BEVEL);
          this.buffer.background(0);
        }

        for (let i = 0; i < 2; i++) {
          const shape = [];
          shape.color = i;
          for (let j = 0; j < 4; j++) {
            const vertex = p5.createSprite();
            vertex.draw = () => {};
            vertex.position = p5.createVector(
              p5.random(0, 400),
              p5.random(0, 400)
            );
            vertex.velocity = p5.createVector(0, 2).rotate(p5.random(0, 360));
            shape.push(vertex);
          }
          this.shapes.push(shape);
        }
        this.edges = p5.createEdgeSprites();
      },
      reset: function () {
        this.shapes = [];
        p5.edges = null;
        this.buffer.clear();
      },
      draw: function () {
        this.buffer.drawingContext.globalAlpha = 0.25;
        this.buffer.background(colorFromPalette(2));
        this.buffer.drawingContext.globalAlpha = 1;

        for (const shape of this.shapes) {
          this.buffer.stroke(colorFromPalette(shape.color));
          this.buffer.quad.apply(
            this.buffer,
            shape.reduce((acc, current) => {
              current.bounceOff(this.edges);
              acc.push(current.position.x, current.position.y);
              return acc;
            }, [])
          );
        }

        // Copy the off-screen buffer to the canvas.
        p5.push();
        p5.scale(1 / p5.pixelDensity());
        p5.drawingContext.drawImage(this.buffer.elt, 0, 0);
        p5.pop();
      },
    };

    // looks good?
    this.color_lights = {
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

    this.kaleidoscope = {
      init: function () {
        if (this.shapes) {
          return;
        }

        this.h = (Math.sqrt(3) / 2) * 100;

        this.shapes = p5.createGraphics(100, Math.ceil(this.h));
        this.shapes.noStroke();
        this.shapes.angleMode(p5.DEGREES);

        this.hex = p5.createGraphics(200, 200);
        this.hex.angleMode(p5.DEGREES);
      },
      blitHex: function () {
        this.hex.push();
        this.hex.clear();
        this.hex.translate(100, 100);
        this.hex.push();
        this.hex.scale(1 / p5.pixelDensity());
        this.hex.rotate(30);
        for (let i = 0; i < 3; i++) {
          this.hex.drawingContext.drawImage(
            this.shapes.elt,
            -50 * p5.pixelDensity(),
            0
          );
          this.hex.scale(-1, 1);
          this.hex.rotate(60);
          this.hex.drawingContext.drawImage(
            this.shapes.elt,
            -50 * p5.pixelDensity(),
            0
          );
          this.hex.rotate(60);
          this.hex.scale(-1, 1);
        }
        this.hex.pop();
        this.hex.pop();
      },
      row: function (n) {
        p5.push();
        for (let i = 0; i < n; i++) {
          p5.push();
          p5.scale(1 / p5.pixelDensity());
          p5.drawingContext.drawImage(
            this.hex.elt,
            -100 * p5.pixelDensity(),
            -100 * p5.pixelDensity()
          );
          p5.pop();
          p5.translate(this.h * 2, 0);
        }
        p5.pop();
      },
      draw: function () {
        p5.background(colorFromPalette(2));

        const ctx = this.shapes.drawingContext;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(100, this.h);
        ctx.lineTo(0, this.h);
        ctx.clip();
        this.shapes.clear();
        this.shapes.rotate(p5.frameCount);
        this.shapes.fill(colorFromPalette(0));
        this.shapes.rect(20, 20, 50, 50);
        this.shapes.fill(colorFromPalette(2));
        this.shapes.triangle(0, 10, 80, 90, 0, 100);
        this.shapes.fill(colorFromPalette(1));
        this.shapes.triangle(20, 0, 50, 30, 30, 60);
        this.shapes.fill(colorFromPalette(4));
        this.shapes.ellipse(100, 50, 80);
        this.shapes.fill(colorFromPalette(1));
        this.shapes.ellipse(-50, -50, 50);
        this.shapes.fill(colorFromPalette(5));
        this.shapes.ellipse(-40, -46, 20);
        this.shapes.fill(colorFromPalette(0));
        this.shapes.triangle(-60, 0, -30, -40, -30, 0);
        this.shapes.fill(colorFromPalette(3));
        this.shapes.rect(-45, 0, 40, 300);
        this.shapes.rotate(17);
        this.shapes.fill(colorFromPalette(4));
        this.shapes.rect(30, 40, 10, 40);
        this.shapes.rotate(37);
        this.shapes.fill(colorFromPalette(6));
        this.shapes.rect(30, 40, 20, 40);
        this.shapes.rotate(180);
        this.shapes.fill(colorFromPalette(0));
        this.shapes.triangle(10, 20, 80, 90, 0, 100);
        this.shapes.translate(20, 0);
        this.shapes.rotate(20);
        this.shapes.fill(colorFromPalette(3));
        this.shapes.rect(0, 0, 20, 200);
        ctx.restore();

        p5.push();
        this.blitHex();
        p5.imageMode(p5.CENTER);

        p5.translate(200, 200);
        p5.rotate(p5.frameCount);
        p5.scale(0.8);

        p5.translate(this.h * -2, -300);
        this.row(3);
        p5.translate(-this.h, 150);
        this.row(4);
        p5.translate(-this.h, 150);
        this.row(5);
        p5.translate(this.h, 150);
        this.row(4);
        p5.translate(this.h, 150);
        this.row(3);

        p5.pop();
      },
    };

    // hitting reset removes poops from screen
    this.smiling_poop = {
      poopList: [],
      init: function () {
        if (this.poopList.length) {
          return;
        }
        for (let i = 0; i < 6; i++) {
          this.poopList.push({
            x: randomNumber(10, 390),
            y: randomNumber(10, 390),
            rot: randomNumber(0, 359),
            life: 5,
          });
        }
      },
      draw: function () {
        for (const poop of this.poopList) {
          const scale = getInPreviewMode() ?
            randomNumber(10, 120) / 20 :
            poop.life / 20;

          p5.push();
          p5.translate(poop.x, poop.y);
          p5.rotate(poop.rot);
          p5.scale(scale);
          drawPoop(p5._renderer.drawingContext);
          poop.life--;
          if (poop.life < 0) {
            poop.x = randomNumber(10, 390);
            poop.y = randomNumber(10, 390);
            poop.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      },
      reset: function () {
        this.poopList = [];
      },
    };

    // seems fine as is in production (doesn't reset though)
    this.hearts_red = {
      heartList: [],
      init: function () {
        if (this.heartList.length) {
          return;
        }
        for (let i = 0; i < 10; i++) {
          this.heartList.push({
            x: randomNumber(10, 390),
            y: randomNumber(10, 390),
            rot: randomNumber(0, 359),
            life: randomNumber(10, 120),
            color: p5.rgb(255, 0, 0, 0.5),
          });
        }
      },
      draw: function () {
        for (const heart of this.heartList) {
          p5.push();
          p5.translate(heart.x, heart.y);
          p5.rotate(heart.rot);
          p5.scale(heart.life / 20);
          drawHeart(p5._renderer.drawingContext, heart.color);
          heart.life--;
          if (heart.life < 0) {
            heart.x = randomNumber(10, 390);
            heart.y = randomNumber(10, 390);
            heart.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      },
      reset: function () {
        this.heartList = [];
      }
    };

    // seems fine as is in production (doesn't reset though)
    this.hearts_colorful = {
      heartList: [],
      init: function () {
        if (this.heartList.length) {
          return;
        }
        for (let i = 0; i < 10; i++) {
          this.heartList.push({
            x: randomNumber(10, 390),
            y: randomNumber(10, 390),
            rot: randomNumber(0, 359),
            life: randomNumber(10, 120),
            color: randomColor(100, 50, 0.25),
          });
        }
      },
      draw: function () {
        for (let i = 0; i < this.heartList.length; i++) {
          p5.push();
          const heart = this.heartList[i];
          p5.translate(heart.x, heart.y);
          p5.rotate(heart.rot);
          p5.scale(heart.life / 20);
          drawHeart(p5._renderer.drawingContext, heart.color);
          heart.life--;
          if (heart.life < 0) {
            heart.x = randomNumber(10, 390);
            heart.y = randomNumber(10, 390);
            heart.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      },
      reset: function () {
        this.heartList = [];
      },
    };

    // init happens on setting of foreground
    // reset happens on reset() (before each run)?
    this.floating_rainbows = {
      rainbows: [],
      init: function () {
        if (this.rainbows.length) {
          return;
        }

        const yMin = getInPreviewMode() ? 0 : 400;
        const yMax = getInPreviewMode() ? 400 : 800;
        for (let i = 0; i < 15; i++) {
          this.rainbows.push({
            x: randomNumber(10, 390),
            y: randomNumber(yMin, yMax),
            rot: randomNumber(0, 359),
            speed: 2,
            size: randomNumber(1.5, 3),
          });
        }
        this.image = p5.createGraphics(175, 100);
        this.image.scale(3);
        drawRainbow(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = getInPreviewMode() ?
          6500 :
          context.centroid;

        for (let i = 0; i < this.rainbows.length; i++) {
          p5.push();
          const rainbows = this.rainbows[i];
          let scale = p5.map(centroid, 5000, 8000, 0, rainbows.size);
          scale = p5.constrain(scale, 0, 3);
          p5.translate(rainbows.x, rainbows.y);
          p5.scale(scale / (2 * p5.pixelDensity()));
          p5.image(this.image);
          rainbows.y -= rainbows.speed;
          if (rainbows.y < -25) {
            rainbows.x = randomNumber(10, 390);
            rainbows.y = 450;
          }
          p5.pop();
        }
      },
      reset: function () {
        this.rainbows = [];
      }
    };

    this.snowflakes = {
      flake: [],
      draw: function () {
        p5.background(lerpColorFromPalette(0.5));
        let flake = {
          x: p5.random(-100, 400),
          y: -10,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12),
        };
        this.flake.push(flake);
        p5.noStroke();
        p5.fill('white');
        this.flake.forEach(function (flake) {
          p5.push();
          p5.translate(flake.x, flake.y);
          for (let i = 0; i < 5; i++) {
            p5.rotate(360 / 5);
            p5.ellipse(0, 0, 1, flake.size);
          }
          let fallSpeed = p5.map(flake.size, 6, 12, 2, 5);
          flake.y += fallSpeed;
          flake.x += flake.velocityX;
          p5.pop();
        });
        this.flake = this.flake.filter(function (flake) {
          return flake.y < 425;
        });
      },
    };

    this.fireworks = {
      particles: [],
      minExplosion: 20,
      maxExplosion: 50,
      minPotential: 200,
      maxPotential: 300,
      buffer: null,

      makeParticle: function (type, pos, vel, color, potential) {
        return {
          type: type,
          pos: pos,
          vel: vel,
          gravity: p5.createVector(0.0, 0.1),
          potential: potential,
          acc: p5.createVector(0, 0),
          color: color,
          alpha: 1,
          update: function () {
            this.acc.add(this.gravity);
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0, 0);
          },
        };
      },

      init: function () {
        if (this.buffer) {
          return;
        }
        // We get the tracer effect by writing frames to a
        // off-screen buffer that has a transparent background.
        this.buffer = p5.createGraphics(p5.width, p5.height);
      },

      draw: function () {
        p5.background(0);
        this.buffer.background(0, 25);

        p5.push();
        this.drawParticles();

        // Copy the off-screen buffer to the canvas.
        p5.scale(1 / p5.pixelDensity());
        p5.drawingContext.drawImage(this.buffer.elt, 0, 0);

        p5.pop();

        this.particles = this.nextParticles();
      },

      drawParticles: function () {
        for (var i = 0; i < this.particles.length; i++) {
          let p = this.particles[i];
          p.update();

          this.buffer.push();
          if (p.type === 'rocket') {
            this.buffer.strokeWeight(3);
            this.buffer.stroke(p.color);
            this.buffer.point(p.pos.x, p.pos.y);
          } else if (p.type === 'particle') {
            this.buffer.translate(p.pos.x, p.pos.y);
            this.buffer.drawingContext.globalAlpha = p.alpha;
            p.alpha = p5.constrain(p.alpha - 0.02, 0, 1);
            drawSparkle(this.buffer.drawingContext, p.color);
          }
          this.buffer.pop();
        }
      },

      nextParticles: function () {
        let ret = [];

        // total potential is the number of particles active, or the number represented
        // in unexploded rockets. This is how we manage total number of objects
        var totalPotential = 0;
        for (var i = 0; i < this.particles.length; i++) {
          let p = this.particles[i];

          if (p.type === 'rocket') {
            // explode a rocket when it reaches it peak height
            if (p.vel.y <= 0) {
              ret.push(p);
            } else {
              ret = ret.concat(this.explode(p));
            }

            // the rocket exploded to its potential or its still waiting
            totalPotential += p.potential;
          } else if (p.type === 'particle') {
            // remove things when they leave the window, except allow particles
            // to fall back down into the view from above
            if (p.pos.x > 0 && p.pos.x < p5.width && p.pos.y < p5.height) {
              ret.push(p);
              totalPotential += p.potential;
            }
          }
        }

        // make sure the total potential for particles is between the min and max potential
        if (totalPotential < this.minPotential) {
          // fire rockets until we fill the potential
          while (totalPotential < this.maxPotential) {
            let p = this.makeParticle(
              'rocket',
              p5.createVector(randomNumber(0, p5.height), p5.width),
              p5.createVector(0, p5.random(-9, -7)),
              randomColorFromPalette(),
              p5.random(this.minExplosion, this.maxExplosion)
            );
            totalPotential += p.potential;
            ret.push(p);
          }
        }
        return ret;
      },

      explode: function (p) {
        let ret = [];
        for (var i = 0; i < p.potential; i++) {
          ret.push(
            this.makeParticle(
              'particle',
              p5.createVector(p.pos.x, p.pos.y),
              p5.createVector(p5.random(-5, 5), p5.random(-5, 5)),
              p.color,
              1
            )
          );
        }
        return ret;
      },
    };

    this.bubbles = {
      bubble: [],
      draw: function () {
        const bubblesToDraw = getInPreviewMode() ? 200 : 1;
        for (let i = 0; i < bubblesToDraw; i++) {
          const y = getInPreviewMode() ? p5.random(-100, 400) : 410;
          let bubble = {
            x: p5.random(-100, 400),
            y: y,
            velocityX: p5.random(-2, 2),
            size: p5.random(6, 12, 18),
            color: randomColor(100, 50, 0.25),
          };
          this.bubble.push(bubble);
        }

        p5.noStroke();
        this.bubble.forEach(function (bubble) {
          p5.push();
          p5.fill(bubble.color);
          p5.translate(bubble.x, bubble.y);
          p5.ellipse(0, 0, bubble.size, bubble.size);
          let fallSpeed = p5.map(bubble.size, 6, 12, 1, 3);
          bubble.y -= fallSpeed;
          bubble.x += bubble.velocityX;
          p5.pop();
        });
        this.bubble = this.bubble.filter(function (bubble) {
          return bubble.y > 0;
        });
      },
      reset: function () {
        this.bubble = [];
      },
    };

    this.stars = {
      star: [],
      draw: function () {
        p5.background('#303030');
        let star = {
          x: p5.random(0, 400),
          y: p5.random(0, 400),
          size: p5.random(15, 30),
          color: randomColorFromPalette(),
        };
        this.star.push(star);
        p5.noStroke();
        this.star.forEach(function (star) {
          p5.push();
          p5.fill(star.color);
          p5.translate(star.x, star.y);
          for (let i = 0; i < 3; i++) {
            p5.rotate(360 / 5);
            p5.ellipse(0, 0, 1, star.size);
          }
          let fadeSpeed = p5.map(star.size, 15, 30, 1, 2);
          star.size = star.size - fadeSpeed;
          star.y = star.y - 2;
          p5.pop();
        });
        this.star = this.star.filter(function (star) {
          return star.size > 0.1;
        });
      },
    };

    // reset button is putting all the stars in the middle
    // instead of spreading out
    this.exploding_stars = {
      stars: [],
      reset: function () {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
          let theta = p5.random(0, 360);
          let velocity = p5.random(4, 12);

          const x = getInPreviewMode() ?
            randomNumber(0, 400) :
            200;
          const y = getInPreviewMode() ?
            randomNumber(0, 400) :
            200;
          this.stars.push({
            color: randomColor(255, 255, 100),
            x: x,
            y: y,
            dx: velocity * p5.cos(theta),
            dy: velocity * p5.sin(theta),
          });
        }
      },
      draw: function () {
        p5.angleMode(p5.DEGREES);
        p5.noStroke();
        if (this.stars.length === 0) {
          this.reset();
        }
        this.stars.forEach(star => {
          p5.fill(star.color);
          drawStar(p5, star.x, star.y, 3, 9, 5);
          star.x += star.dx;
          star.y += star.dy;
        });
        this.stars = this.stars.filter(
          star => star.x > -10 && star.x < 410 && star.y > -10 && star.y < 410
        );
      },
    };

    this.galaxy = {
      space: [],
      draw: function () {
        p5.background('black');
        for (let i = 0; i < 3; i++) {
          let space = {
            x: 200,
            y: 200,
            velocity: p5.createVector(0, 1).rotate(p5.random(0, 360)),
            size: 0.01,
            color: randomColorFromPalette(),
          };
          this.space.push(space);
        }
        p5.noStroke();
        this.space.forEach(function (space) {
          p5.push();
          p5.fill(space.color);
          p5.translate(space.x, space.y);
          p5.ellipse(0, 0, space.size, space.size);
          let speedMultiplier = p5.pow(space.size, 2) / 2;
          space.x += space.velocity.x * speedMultiplier;
          space.y += space.velocity.y * speedMultiplier;
          space.size += 0.1;
          p5.pop();
        });
        this.space = this.space.filter(function (space) {
          if (space.x < -5 || space.x > 405 || space.y < -5 || space.y > 405) {
            return false;
          }
          return true;
        });
      },
    };

    this.pizzas = {
      pizza: [],
      init: function () {
        if (this.pizza.length) {
          return;
        }
        for (let i = 0; i < 10; i++) {
          this.pizza.push({
            x: randomNumber(25, 375),
            y: randomNumber(25, 375),
            size: randomNumber(2, 6),
            rot: randomNumber(0, 359),
            life: 200,
          });
        }
        this.image = p5.createGraphics(100, 100);
        this.image.scale(3);
        drawPizza(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = getInPreviewMode() ?
          6500 :
          context.centroid;
        for (let i = 0; i < this.pizza.length; i++) {
          p5.push();
          const pizza = this.pizza[i];
          let scale = p5.map(centroid, 5000, 8000, 0, pizza.size);
          scale = p5.constrain(scale, 0, 5);
          p5.translate(pizza.x, pizza.y);
          p5.rotate(pizza.rot);
          p5.scale(scale / (4 * p5.pixelDensity()));
          p5.drawingContext.drawImage(this.image.elt, 0, 0);
          pizza.life--;
          if (pizza.life < 0) {
            (pizza.x = randomNumber(25, 375)),
              pizza.y - randomNumber(25, 375),
              (pizza.life = 200);
          }
          p5.pop();
        }
      },
    };

    this.smile_face = {
      smiles: [],
      init: function () {
        if (this.smiles.length) {
          return;
        }
        for (let i = 0; i < 10; i++) {
          this.smiles.push({
            x: randomNumber(25, 375),
            y: randomNumber(25, 375),
            size: randomNumber(2, 6),
            rot: randomNumber(0, 359),
            life: 200,
          });
        }
        this.image = p5.createGraphics(100, 100);
        this.image.scale(3);
        drawSmiley(this.image.drawingContext, 0.8);
      },
      draw: function (context) {
        const centroid = getInPreviewMode() ?
          6500 :
          context.centroid;

        for (let i = 0; i < this.smiles.length; i++) {
          p5.push();
          const smiles = this.smiles[i];
          let scale = p5.map(centroid, 5000, 8000, 0, smiles.size);
          scale = p5.constrain(scale, 0, 5);
          p5.translate(smiles.x, smiles.y);
          p5.rotate(smiles.rot);
          p5.scale(scale / (4 * p5.pixelDensity()));
          p5.drawingContext.drawImage(this.image.elt, 0, 0);
          smiles.life--;
          if (smiles.life < 0) {
            (smiles.x = randomNumber(25, 375)),
              smiles.y - randomNumber(25, 375),
              (smiles.life = 200);
          }
          p5.pop();
        }
      },
    };

    this.confetti = {
      confetti: [],
      draw: function () {
        const bubblesToDraw = getInPreviewMode() ? 200 : 1;
        for (let i = 0; i < bubblesToDraw; i++) {
          const spin = getInPreviewMode() ? p5.random(1, 80) : 1;
          let confetti = {
            x: p5.random(-100, 400),
            y: p5.random(-100, 400), // changed
            velocityX: p5.random(-2, 2),
            size: p5.random(6, 12, 18),
            // https://github.com/Automattic/node-canvas/issues/702
            // Bug with node-canvas prevents scaling with a value of 0, so spin initializes to 1
            spin: spin, //changed
            color: randomColor(255, 255, 100),
          };

          this.confetti.push(confetti);
        }

        p5.noStroke();
        this.confetti.forEach(function (confetti) {
          p5.push();
          p5.fill(confetti.color);
          p5.translate(confetti.x, confetti.y);
          const scaleX = p5.sin(confetti.spin);
          p5.scale(scaleX, 1);
          confetti.spin += 20;
          p5.rect(0, 0, 4, confetti.size);
          let fallSpeed = p5.map(confetti.size, 6, 12, 1, 3);
          confetti.y += fallSpeed;
          confetti.x += confetti.velocityX;
          p5.pop();
        });
        this.confetti = this.confetti.filter(function (confetti) {
          return confetti.y < 425;
        });
      },
      reset: function () {
        this.confetti = [];
      },
    };

    this.growing_stars = {
      stars: [],
      colorIndex: 0,
      starSpacing: 30,
      numStars: 9,

      init: function () {
        p5.angleMode(p5.DEGREES);
        this.colorIndex = 0;
        this.stars = [];
        for (var i = 0; i < this.numStars; i++) {
          this.stars.push({
            size: this.starSpacing * (this.numStars - i),
            colorIndex: this.colorIndex,
          });
          this.colorIndex++;
        }
      },

      draw: function () {
        for (let star of this.stars) {
          p5.fill(colorFromPalette(star.colorIndex));
          drawStar(p5, 200, 200, star.size, star.size * 2.5, 5);
          star.size += 1;
        }
        if (this.stars[0].size > this.starSpacing * this.numStars) {
          this.stars.shift();
          this.stars.push({size: 0, colorIndex: this.colorIndex});
          this.colorIndex++;
        }
      },
    };

    // looks ok, double check though
    this.music_notes = {
      notes: [],
      init: function () {
        const yMax = getInPreviewMode() ? 390 : 0;
        const yMin = getInPreviewMode() ? 0 : -400;
        if (this.notes.length) {
          return;
        }
        for (let i = 0; i < 20; i++) {
          this.notes.push({
            x: randomNumber(10, 390),
            y: randomNumber(yMin, yMax),
            rot: randomNumber(0, 359),
            speed: 2,
            size: randomNumber(1.5, 3),
          });
        }
        this.image = p5.createGraphics(70, 50);
        this.image.scale(4);
        drawMusicNote(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = getInPreviewMode() ? 6500 : context.centroid;
        for (let i = 0; i < this.notes.length; i++) {
          p5.push();
          const notes = this.notes[i];
          let scale = p5.map(centroid, 5000, 8000, 0, notes.size);
          scale = p5.constrain(scale, 0, 3);
          p5.translate(notes.x, notes.y);
          p5.rotate(notes.rot);
          p5.scale(scale / (4 * p5.pixelDensity()));
          p5.drawingContext.drawImage(this.image.elt, 0, 0);
          notes.y += notes.speed;
          notes.rot++;
          if (notes.y > 410) {
            notes.x = randomNumber(10, 390);
            notes.y = -50;
          }
          p5.pop();
        }
      },
      reset: function () {
        this.notes = [];
      }
    };

    // to do
    this.paint_drip = {
      current_drip: 0,
      current_drip_height: 0,
      crayons: [],
      start_width: 15,
      start_height: 30,
      dripping_up: false,
      drip_diameter: 20,
      drip_speed: 7,

      // doesn't do much
      // not sure if dripping_up reset necessary
      reset: function () {
        this.init();
        this.dripping_up = false;
      },
      init: function () {
        // Reset values
        this.current_drip = 0;
        this.current_drip_height = 0;
        this.crayons = [];

        this.crayons.push({maxHeight: p5.random(30, 200), startFrame: 0});
        for (let i = 0; i < 17; i++) {
          this.crayons.push({maxHeight: 0, startFrame: 0});
        }
      },

      draw: function () {
        for (let i = 0; i < this.crayons.length; i++) {
          let c = lerpColorFromSpecificPalette('neon', i / this.crayons.length);
          p5.fill(c);
          p5.noStroke();
          let rectHeight = this.start_height;

          // Drip is to the left of moving drip and should be stationary at full height
          if (i < this.current_drip) {
            rectHeight = this.crayons[i].maxHeight;
            // Drip is currently moving
          } else if (i === this.current_drip) {
            //Calculate height with regard to direction of movement
            if (this.dripping_up) {
              rectHeight =
                this.crayons[i].maxHeight -
                (p5.frameCount - this.crayons[i].startFrame) * this.drip_speed;
            } else {
              rectHeight =
                (p5.frameCount - this.crayons[i].startFrame) * this.drip_speed +
                this.start_height;
            }
            this.current_drip_height = rectHeight;
          }
          //Draw each drip with a rectangle and ellipse
          p5.rect(22 * i + 7, 0, this.start_width, rectHeight);
          p5.ellipse(
            22 * i + this.start_width,
            rectHeight,
            this.drip_diameter,
            this.drip_diameter
          );
        }

        // Check if the current drip is 'done'
        if (
          (!this.dripping_up &&
            this.current_drip_height >=
              this.crayons[this.current_drip].maxHeight) ||
          (this.dripping_up && this.current_drip_height <= 30)
        ) {
          if (
            !this.dripping_up &&
            this.current_drip === this.crayons.length - 1
          ) {
            // The rightmost drip is 'done' dripping down, switch to dripping up.
            this.dripping_up = true;
            this.current_drip_height =
              this.crayons[this.current_drip].maxHeight;
          } else if (this.dripping_up && this.current_drip === 0) {
            // The leftmost drip is 'done' dripping up, switch to dripping down.
            this.dripping_up = false;
            this.current_drip_height = 0;
          } else if (this.dripping_up) {
            // A non-edge drip is 'done' dripping up, move the next left drip.
            this.current_drip -= 1;
            this.current_drip_height =
              this.crayons[this.current_drip].maxHeight;
          } else {
            // A non-edge drip is 'done' dripping down, move the next drip right.
            this.current_drip += 1;
            this.current_drip_height = 0;
            //Each new drip down is assigned a random maximum height.
            this.crayons[this.current_drip].maxHeight = p5.random(30, 200);
          }
          //Note when this drip started to calculate the height in mid-drip
          this.crayons[this.current_drip].startFrame = p5.frameCount;
        }
      },
    };

    this.squiggles = {
      points: [],
      dotSpacing: 4,
      amplitude: 40,
      period: 400,
      dotRadius: 14,
      numSquiggles: 5,
      init: function () {
        this.points = [];
        p5.noStroke();
        p5.angleMode(p5.DEGREES);
        let numPoints = p5.height / this.dotSpacing;
        for (var i = 0; i < numPoints; i++) {
          this.points.push({
            x: 0,
            y: i * this.dotSpacing,
            theta: (360 / this.period) * i * this.dotSpacing,
            color: lerpColorFromPalette(i / numPoints),
          });
        }
      },
      draw: function ({bpm}) {
        p5.background('black');
        for (var i = 0; i < this.numSquiggles; i++) {
          this.points.forEach(point => {
            p5.fill(point.color);
            p5.ellipse(point.x, point.y, this.dotRadius, this.dotRadius);
            point.x =
              (p5.width / (this.numSquiggles - 1)) * i +
              p5.sin(point.theta) * this.amplitude;
            point.theta = (point.theta + bpm / 360) % 360;
          });
        }
      },
    };

    this.music_wave = {
      inc: 360 / 15,
      heightFactor: 1,
      heightDivider: 200,
      yLoc: 300,
      lineWidth: p5.width / 80,
      draw: function (context) {
        const centroid = context.centroid;
        let scale = p5.map(centroid, 5000, 8000, 0, 250);
        let angle = 0;
        p5.background('black');
        for (let i = 0; i < p5.width; i += this.lineWidth) {
          p5.stroke(lerpColorFromPalette(i / p5.width));
          let amplitude = Math.abs(
            scale * (this.heightFactor / this.heightDivider) * p5.cos(angle)
          );
          let yInitial = this.yLoc - amplitude;
          let yFinal = this.yLoc + amplitude;
          p5.line(i, yInitial, i, yFinal);
          if (i < p5.width / 2) {
            this.heightFactor++;
          } else {
            this.heightFactor--;
          }
          angle += this.inc;
        }
      },
    };

    this.emojis = {
      emojiList: [],
      emojiTypes: [],

      init: function () {
        this.imageLovestruck = p5.createGraphics(100, 100);
        this.imageLovestruck.scale(3);
        drawLovestruck(this.imageLovestruck.drawingContext);
        this.emojiTypes.push(this.imageLovestruck);

        this.imageSmiley = p5.createGraphics(100, 100);
        this.imageSmiley.scale(3);
        drawSmiley(this.imageSmiley.drawingContext, 1.0);
        this.emojiTypes.push(this.imageSmiley);

        this.imageStarstruck = p5.createGraphics(100, 100);
        this.imageStarstruck.scale(3);
        drawStarstruck(this.imageStarstruck.drawingContext);
        this.emojiTypes.push(this.imageStarstruck);

        this.imageTickled = p5.createGraphics(100, 100);
        this.imageTickled.scale(3);
        drawTickled(this.imageTickled.drawingContext);
        this.emojiTypes.push(this.imageTickled);

        this.imageWink = p5.createGraphics(100, 100);
        this.imageWink.scale(3);
        drawWink(this.imageWink.drawingContext);
        this.emojiTypes.push(this.imageWink);
      },

      draw: function () {
        if (getInPreviewMode()) {
          for (let i = 0; i < 12; i++) {
            this.emojiList.push({
              x: randomNumber(0, 350),
              y: randomNumber(0, 350),
              size: randomNumber(50, 90),
              image: this.emojiTypes[randomNumber(0, 4)],
            });
          }
        } else {
          if (p5.frameCount % 10 === 0) {
            // generate new emoji every 10 frames
            this.emojiList.push({
              x: randomNumber(0, 350),
              y: -50,
              size: randomNumber(50, 90),
              image: this.emojiTypes[randomNumber(0, 4)],
            });
          }
        }

        for (let i = 0; i < this.emojiList.length; ++i) {
          const emoji = this.emojiList[i];
          emoji.y += p5.pow(emoji.size, 0.25); // emoji falls at a rate fourth root to its size
          if (emoji.y > p5.height * 1.2) {
            // if the emoji has fallen past 120% of the screen
            this.emojiList.splice(i, 1);
          }
          p5.push();
          p5.drawingContext.drawImage(
            emoji.image.elt,
            emoji.x,
            emoji.y,
            emoji.size,
            emoji.size
          );
          p5.pop();
        }
        },
      reset: function () {
        this.emojiList = [];
      }
    };
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
