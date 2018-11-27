const drawHeart = require('./shapes/heart');
const drawMusicNote = require('./shapes/musicNote');
const drawPineapple = require('./shapes/pineapple');
const drawPizza = require('./shapes/pizza');
const drawRainbow = require('./shapes/rainbow');
const drawSmiley = require('./shapes/smiley');
const drawTaco = require('./shapes/taco');

module.exports = class Effects {
  constructor(p5, alpha, blend, currentPalette = 'default') {
    this.blend = blend || p5.BLEND;
    this.currentPalette = currentPalette;

    this.palettes = {
      default: ['#ffa899', '#99aaff', '#99ffac', '#fcff99', '#ffdd99'],
      electronic: ['#fc71ee', '#3f0f6e', '#030a24', '#222152', '#00f7eb'],
      vintage: ['#594c51', '#97bcb2', '#f1ebc4', '#e9b76f', '#de6965'],
      cool: ['#2b5ef6', '#408ae1', '#69d5fb', '#6ee4d4', '#7afaae'],
      warm: ['#ba2744', '#d85422', '#ed7c49', '#f1a54b', '#f6c54f'],
      iceCream: ['#f6ccec', '#e2fee0', '#6784a6', '#dfb48d', '#feffed'],
      tropical: ['#eb6493', '#72d7fb', '#7efaaa', '#fffe5c', '#ee8633'],
      neon: ['#e035a1', '#a12dd3', '#58b0ed', '#75e847', '#fdf457'],
      rave: ['#000000', '#5b6770', '#c6cacd', '#e7e8ea', '#ffffff'],
    };

    function randomNumber(min, max) {
      return Math.round(p5.random(min, max));
    }

    function colorFromHue(h, s=100, l=80, a=alpha) {
      return p5.color("hsla(" + Math.floor(h % 360) + ", " + s + "%, " + l + "%," + a + ")");
    }

    function randomColor(s=100, l=80, a=alpha) {
      return colorFromHue(randomNumber(0, 359), s, l, a);
    }

    const colorFromPalette = (n) => {
      const palette = this.palettes[this.currentPalette];
      return palette[n % (palette.length)];
    };

    const lerpColorFromPalette = (amount) => {
      const palette = this.palettes[this.currentPalette];
      const which = amount * palette.length;
      const n = Math.floor(which);
      const remainder = which - n;

      const prev = palette[n % (palette.length)];
      const next = palette[(n + 1) % (palette.length)];

      return p5.lerpColor(p5.color(prev), p5.color(next), remainder);
    };

    const randomColorFromPalette = () => {
      const palette = this.palettes[this.currentPalette];
      return palette[randomNumber(0, palette.length - 1)];
    };

    this.none = {
      draw: function ({backgroundColor}) {
        p5.background(backgroundColor || "white");
      }
    };

    this.disco_ball = {
      stars: [],
      globe: function (u, v) {
        u = p5.constrain(u, -90, 90);
        return {
          x: (1 + p5.sin(u) * p5.sin(v)) * 40 + 160,
          y: (1 + p5.cos(v)) * 40 + 10,
        };
      },
      quad: function (i, j, faceSize, rotation = 0) {
        const k = (i + rotation) % 360 - 180;
        if (k < -90 - faceSize || k > 90) {
          return;
        }
        const a = this.globe(k, j);
        const b = this.globe(k + faceSize, j);
        const c = this.globe(k + faceSize, j + faceSize);
        const d = this.globe(k, j + faceSize);
        p5.quad(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
      },
      init: function () {
        for (let i = 0; i < 75; i++) {
          this.stars.push({
            x: p5.random(0, 400),
            y: p5.random(0,100),
            color: "#C0C0C0",
          });
        }
      },
      draw: function () {
        if (this.stars.length === 0) {
          this.init();
        }
        p5.background("#9370DB");
        p5.noStroke();

        this.stars.forEach(star => {
          const distanceFromCenter = 200 - star.x;
          const opacity = p5.constrain(p5.cos(distanceFromCenter / 2), 0, 4);
          p5.push();
          p5.translate(star.x, star.y);
          p5.drawingContext.globalAlpha = opacity;
          drawSparkle(p5._renderer.drawingContext, star.color);
          p5.pop();

          // Move the star to the left.
          star.x -= 4 - opacity;

          // If we've gone off-screen, loop around to the right.
          if (star.x < 0) {
            star.x = 400;
          }
        });

        p5.noiseDetail(50, .5);
        const step = 20;
        for (let i = 0; i <= 360; i += step) {
          p5.fill("#C0C0C0");
          p5.rect(199.5, 0, 2, 10.25);
          for (let j = 0; j < 180; j += step) {
            p5.push();
            p5.fill(p5.noise(i, j, p5.frameCount / 50) * 255 + 100);
            this.quad(i, j, step, p5.frameCount * 3);
            p5.pop();
          }
        }
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
        p5.background(colorFromHue(180, 50, 90));
        p5.noFill();
        p5.strokeWeight(50);
        let d, i;
        for (i = 0; i < 7; i++) {
          p5.stroke(colorFromHue(i * 51.5, 100, 95));
          d = 150 + i * 100;
          p5.arc(0, 400, d, d, -90, 0);
          if (this.lengths[i] > 0) {
            p5.stroke(colorFromHue(i * 60, 100, 80, 1 - this.lengths[i] / 90));
            p5.arc(0, 400, d, d, -90, -90 + this.lengths[i]);
            this.lengths[i] = (this.lengths[i] + bpm / 50) % 90;
          }
        }
        p5.pop();
      }
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
      }
    };

    this.disco = {
      bg: undefined,
      colors: [],
      squaresPerSide: 4,
      minColorChangesPerUpdate: 5,
      maxColorChangesPerUpdate: 9,
      init: function () {
        // Alpha is ignored for this effect to avoid memory leaks with too many
        // layers of alpha blending.
        this.colors.length = this.squaresPerSide * this.squaresPerSide;
        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i] = lerpColorFromPalette(p5.random(0, 1));
        }
      },
      update: function () {
        const numChanges = randomNumber(this.minColorChangesPerUpdate, this.maxColorChangesPerUpdate);
        for (let i = 0; i < numChanges; i++) {
          const loc = randomNumber(0, this.colors.length);
          this.colors[loc] = lerpColorFromPalette(p5.random(0, 1));
        }
      },
      draw: function ({isPeak}) {
        if (this.colors.length === 0) {
          this.init();
        }
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.noStroke();
        const squareWidth = p5.width / this.squaresPerSide;
        const squareHeight = p5.height / this.squaresPerSide;
        for (let i = 0; i < this.colors.length; i++) {
          p5.fill(this.colors[i]);
          p5.rect((i % this.squaresPerSide) * squareWidth,
              Math.floor(i / this.squaresPerSide) * squareHeight,
              squareWidth,
              squareHeight);
        }
        p5.pop();
      }
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
      }
    };

    this.circles = {
      hue: 0,
      update: function () {
        this.hue += 25;
      },
      draw: function ({isPeak, centroid}) {
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.ellipseMode(p5.CENTER);
        p5.translate(200, 200);
        p5.rotate(45);
        p5.noFill();
        p5.strokeWeight(p5.map(centroid, 0, 4000, 0, 50));
        for (let i = 5; i > -1; i--) {
          p5.stroke(lerpColorFromPalette(((this.hue + i * 10) % 360) / 360));
          p5.ellipse(0, 0, i * 100 + 50, i * 100 + 50);
        }
        p5.pop();
      }
    };

    this.rain = {
      drops: [],
      init: function () {
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
        if (this.drops.length < 1) {
          this.init();
        }
        p5.strokeWeight(3);
        p5.stroke(this.color);
        p5.push();
        for (let i = 0; i < this.drops.length; i++) {
          p5.push();
          p5.translate(this.drops[i].x - 20, this.drops[i].y - 20);
          p5.line(0, 0, this.drops[i].length, this.drops[i].length * 2);
          p5.pop();
          this.drops[i].y = (this.drops[i].y + this.drops[i].length) % 420;
          this.drops[i].x = (this.drops[i].x + (this.drops[i].length / 2)) % 420;
        }
        p5.pop();
      }
    };

    this.sparkles = {
      sparkles: [],
      maxSparkles: 80,
      makeRandomSparkle: function () {
        return {
          x: randomNumber(-100, 600),y:randomNumber(0, 400),
          color: randomColorFromPalette(),
        };
      },
      init: function () {
        for (let i=0;i<this.maxSparkles;i++) {
          this.sparkles.push(this.makeRandomSparkle());
        }
      },
      update: function () {

      },
      draw: function ({bpm}) {
        if (this.sparkles.length<1) {
          this.init();
        }
        p5.background("#2b1e45");
        let velocity = Math.floor(bpm/90*3);
        for (let i = 0;i<this.maxSparkles;i++){
          p5.push();
          if ((this.sparkles[i].x<10) || (this.sparkles[i].y>410)) {
            this.sparkles[i]=this.makeRandomSparkle();
          }

          this.sparkles[i].x-=velocity;
          this.sparkles[i].y+=velocity;
          p5.translate(this.sparkles[i].x,this.sparkles[i].y);
          drawSparkle(p5._renderer.drawingContext,this.sparkles[i].color);
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
          color: colorFromHue(hue),
          size: size
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
        p5.background(colorFromHue(0, 0, 23));
        p5.textAlign(p5.CENTER, p5.CENTER);
        this.texts.forEach(function (t) {
          p5.textSize(t.size);
          p5.textFont(t.font);
          p5.fill(t.color);
          p5.text(t.text, t.x, t.y);
        });
        p5.pop();
      }
    };

    this.raining_tacos = {
      tacos: [],
      init: function () {
        for (let i = 0; i < 10; i++) {
          this.tacos.push({
            x: randomNumber(20, 380),
            y: randomNumber(-400, 0),
            rot: randomNumber(0, 359),
            speed: 3,
            size: 5,
          });
        }
        this.image = p5.createGraphics(70, 50);
        this.image.pixelDensity(1);
        this.image.scale(4,4);
        drawTaco(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = context.centroid;
        if (this.tacos.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.tacos.length; i++) {
          p5.push();
          const taco = this.tacos[i];
          let scale = p5.map(centroid, 5000, 8000, 0, taco.size);
          scale = p5.constrain(scale, 0, 5);
          p5.translate(taco.x, taco.y);
          p5.rotate(taco.rot);
          p5.scale(scale / 4);
          p5.image(this.image);
          taco.y += taco.speed;
          taco.rot++;
          if (taco.y > 420) {
            taco.x = randomNumber(20, 380);
            taco.y = -50;
          }
          p5.pop();
        }
      }
    };

    this.pineapples = {
      pineappleList: [],
      init: function () {
        for (let i = 0; i < 8; i++) {
          this.pineappleList.push({
            x: randomNumber(10, 390),
            y: randomNumber(10, 390),
            rot: randomNumber(0, 359),
            life: 5,
          });
        }
      },
      draw: function () {
        if (this.pineappleList.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.pineappleList.length; i++) {
          p5.push();
          const pineapple = this.pineappleList[i];
          p5.translate(pineapple.x, pineapple.y);
          p5.rotate(pineapple.rot);
          p5.scale(pineapple.life / 20);
          drawPineapple(p5._renderer.drawingContext);
          pineapple.life--;
          if (pineapple.life < 0) {
            pineapple.x = randomNumber(10, 390);
            pineapple.y = randomNumber(10, 390);
            pineapple.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      }
    };

    this.splatter = {
      splats:[],
      numSplats:100,
      randomSplat: function () {
        let r = randomNumber(30,60);
        return {x: randomNumber(0,400),
            y: randomNumber(0,400),
            color: randomColorFromPalette(),
            width: r,
            height: r,
        };
      },
      init: function () {
        for (var i=0;i<this.numSplats;i++) {
          this.splats.push(this.randomSplat());
        }
        p5.strokeWeight(0);
      },
      update: function () {
        //TODO: add some music-driven change? Right now it just grows continuously.
      },
      draw: function () {
        if (this.splats.length<1) {
          this.init();
        }
        p5.strokeWeight(0);
        // first make a pass and remove items, traversing in reverse so that removals
        // dont affect traversal
        for (var i=this.splats.length-1;i>=0;i--) {
          if (randomNumber(0,50) === 0) {
            // remove existing
            this.splats.splice(i, 1);
            // add new item to end of array, so that it gets rendered above older ones
            this.splats.push(this.randomSplat());
          }
        }
        for (i=0;i<this.splats.length;i++) {
          p5.fill(this.splats[i].color);
          this.splats[i].width+=randomNumber(0,4);
          this.splats[i].height+=randomNumber(0,4);
          p5.ellipse(this.splats[i].x,this.splats[i].y,this.splats[i].width,this.splats[i].height);
        }
      }
    };

    this.swirl = {
      angle: 0,
      color: null,
      update: function () {
        this.color = randomColorFromPalette();
      },
      draw: function ({isPeak,bpm}) {
        if (isPeak || !this.color) {
          this.update();
        }
        p5.push();
        p5.background(this.color);
        p5.translate(200,200);
        let rotation=(bpm/90)*50;
        this.angle-=rotation;
        p5.rotate(Math.PI / 180 * this.angle);
        p5.translate(-427,-400);
        drawSwirl(p5._renderer.drawingContext);
        p5.pop();

      }
    };

    this.spiral = {
      angle: 0,
      color: null,
      init: function () {
        this.color = 0;
      },
      update: function () {
        this.color += 0.13;
        if (this.color > 1) {
          this.color -= 1;
        }
      },
      draw: function ({isPeak,bpm}) {
        if (this.color === null) {
          this.init();
        }
        if (isPeak) {
          this.update();
        }
        p5.background(lerpColorFromPalette(this.color));
        p5.push();
        p5.translate(200,200);
        let rotation=(bpm/90)*200;
        this.angle-=rotation;
        p5.rotate(Math.PI / 180 * this.angle);
        p5.translate(-600,-600);
        drawSpiral(p5._renderer.drawingContext);
        p5.pop();

      }
    };

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
        this.targetX=200;
        this.targetY=200;
        this.update();
      },
      update: function () {
        while (Math.sqrt((this.targetY - this.y)**2 + (this.targetX - this.x)**2) < 40) {
          this.targetX = randomNumber(50,350);
          this.targetY = randomNumber(50,350);
        }
        let angleOfMovement=Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.dx = 6*Math.cos(angleOfMovement);
        this.dy = 6*Math.sin(angleOfMovement);
      },
      draw: function ({isPeak}) {
        if ((isPeak) ||
          (Math.abs(this.targetX - this.x)<4 && Math.abs(this.targetY - this.y)<4)) {
          this.update();
        }
        if (this.targetX === 0) {
          this.init();
        }
        p5.push();
        p5.noFill();
        p5.strokeWeight(600);
        this.x+=this.dx+randomNumber(-1,1);
        this.y+=this.dy+randomNumber(-1,1);
        p5.ellipse(this.x,this.y,800,800);
        p5.pop();
      }
    };

    this.lasers = {
      laser: [],
      draw: function () {
        p5.background('black');
        if (this.laser.length < 100) {
          let laser = {
            w: 200,
            x: 200,
            y: 1700,
            z: 400,
            color: randomColor(255,255,255),
          };
          this.laser.push(laser);
        }
        p5.stroke('white');
        p5.line(0,200,400,200);
        this.laser.forEach(laser => {
          p5.push();
          p5.stroke(laser.color);
          p5.line(laser.w, laser.x, laser.y, laser.z);
          laser.y = laser.y -100;
          p5.pop();
          if (laser.y <= -1400) {
            laser.y = 1700;
          }
        });
      }
    };

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
        if (this.lights.length<1) {
          this.init();
        }
        if (isPeak) {
          this.update();
        }
        p5.noStroke();
        this.lights.forEach(function (light) {
          p5.push();
          p5.fill(light.color);
          p5.translate(light.x, -50);
          p5.rotate((Math.sin((p5.frameCount / 100) + light.shift + centroid / 2000) * light.arc) + light.offset);
          p5.triangle(0, 0, -75, 600, 75, 600);
          p5.pop();
        });
      }
    };

    this.kaleidoscope = {
      init: function () {
        this.h = Math.sqrt(3) / 2 * 100;

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
          this.hex.drawingContext.drawImage(this.shapes.elt, -50 * p5.pixelDensity(), 0);
          this.hex.scale(-1, 1);
          this.hex.rotate(60);
          this.hex.drawingContext.drawImage(this.shapes.elt, -50 * p5.pixelDensity(), 0);
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
          p5.drawingContext.drawImage(this.hex.elt, -100 * p5.pixelDensity(), -100 * p5.pixelDensity());
          p5.pop();
          p5.translate(this.h * 2, 0);
        }
        p5.pop();
      },
      draw: function () {
        if (!this.shapes) {
          this.init();
        }

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
        this.shapes.fill(colorFromPalette(5));
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
      }
    };

    this.smiling_poop = {
      poopList: [],
      init: function () {
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
        if (this.poopList.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.poopList.length; i++) {
          p5.push();
          const poop = this.poopList[i];
          p5.translate(poop.x, poop.y);
          p5.rotate(poop.rot);
          p5.scale(poop.life / 20);
          p5.drawingContext.globalAlpha - 0.5;
          drawPoop(p5._renderer.drawingContext);
          poop.life--;
          if (poop.life < 0) {
            poop.x = randomNumber(10, 390);
            poop.y = randomNumber(10, 390);
            poop.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      }
    };

    this.hearts_red = {
      heartList: [],
      init: function () {
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
        if (this.heartList.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.heartList.length; i++) {
          p5.push();
          const heart = this.heartList[i];
          p5.translate(heart.x, heart.y);
          p5.rotate(heart.rot);
          p5.scale(heart.life / 20);
          p5.drawingContext.globalAlpha - 0.5;
          drawHeart(p5._renderer.drawingContext, heart.color);
          heart.life--;
          if (heart.life < 0) {
            heart.x = randomNumber(10, 390);
            heart.y = randomNumber(10, 390);
            heart.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      }
    };

    this.hearts_colorful = {
      heartList: [],
      init: function () {
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
        if (this.heartList.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.heartList.length; i++) {
          p5.push();
          const heart = this.heartList[i];
          p5.translate(heart.x, heart.y);
          p5.rotate(heart.rot);
          p5.scale(heart.life / 20);
          p5.drawingContext.globalAlpha - 0.5;
          drawHeart(p5._renderer.drawingContext, heart.color);
          heart.life--;
          if (heart.life < 0) {
            heart.x = randomNumber(10, 390);
            heart.y = randomNumber(10, 390);
            heart.life = randomNumber(10, 120);
          }
          p5.pop();
        }
      }
    };

    this.floating_rainbows = {
      rainbows: [],
      init: function () {
        for (let i = 0; i < 15; i++) {
          this.rainbows.push({
            x: randomNumber(10, 390),
            y: randomNumber(400, 800),
            rot: randomNumber(0, 359),
            speed: 2,
            size: randomNumber(1.5, 3),
          });
        }
        this.image = p5.createGraphics(100, 100);
        this.image.pixelDensity(1);
        this.image.scale(4,4);
        drawRainbow(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = context.centroid;
        if (this.rainbows.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.rainbows.length; i++) {
          p5.push();
          const rainbows = this.rainbows[i];
          let scale = p5.map(centroid, 5000, 8000, 0, rainbows.size);
          scale = p5.constrain(scale, 0, 3);
          p5.translate(rainbows.x, rainbows.y);
          p5.scale(scale / 2);
          p5.image(this.image);
          rainbows.y -= rainbows.speed;
          if (rainbows.y < -25) {
            rainbows.x = randomNumber(10, 390);
            rainbows.y = 450;
          }
          p5.pop();
        }
      }
    };

    this.snowflakes = {
      flake: [],
      draw: function () {
        p5.background('lightblue');
        let flake = {
          x: p5.random(-100, 400),
          y: -10,
          velocityX: p5.random(-2, 2),
          size: p5.random(6,12),
        };
        this.flake.push(flake);
        p5.noStroke();
        p5.fill('white');
        this.flake.forEach(function (flake){
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
      }
    };

    this.fireworks = {
      particles:[],
      minExplosion:20,
      maxExplosion:50,
      minPotential:200,
      maxPotential:300,
      enableTracers:true,
      buffer:null,

      makeParticle: function (type, pos, vel, color, potential) {
        return  {
          type:type,
          pos:pos,
          vel:vel,
          gravity: p5.createVector(0.0, 0.1),
          potential:potential,
          acc:p5.createVector(0, 0),
          color:color,
          update: function () {
            this.acc.add(this.gravity);
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0, 0);
          },
        };
      },

      draw: function () {
        if (this.buffer === null) {
          this.buffer = p5;
          // We get the tracer effect by writing frames to a
          // offscreen buffer that has a transparent background
          if (this.enableTracers) {
            this.buffer = p5.createGraphics(p5.width, p5.height);
            this.buffer.pixelDensity(1);
          }
        }

        p5.background(0);

        // if we are using the offscreen buffer, use a transparent background
        if (this.buffer !== p5) {
          this.buffer.background(0, 25);
        }

        p5.push();
        this.drawParticles();

        // if we are drawing to offscreen buffer, copy it to the canvas
        if (this.buffer !== p5) {
          p5.image(this.buffer);
        }

        p5.pop();

        this.particles = this.nextParticles();
      },

      drawParticles: function () {
        for (var i = 0; i < this.particles.length; i++) {
          let p = this.particles[i];
          p.update();

          this.buffer.push();
          if (p.type === "rocket") {
            this.buffer.strokeWeight(3);
            this.buffer.stroke(p.color);
            this.buffer.point(p.pos.x, p.pos.y);
          } else if (p.type === "particle") {
            this.buffer.translate(p.pos.x, p.pos.y);
            drawSparkle(this.buffer._renderer.drawingContext, p.color);
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

          if (p.type === "rocket") {
            // explode a rocket when it reaches it peak height
            if (p.vel.y <= 0) {
              ret.push(p);
            } else {
              ret = ret.concat(this.explode(p));
            }

            // the rocket exploded to its potential or its still waiting
            totalPotential += p.potential;
          } else if (p.type === "particle") {

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
              "rocket",
              p5.createVector(randomNumber(0, p5.height), p5.width),
              p5.createVector(0, p5.random(-9, -7)),
              randomColor(),
              p5.random(this.minExplosion, this.maxExplosion),
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
          ret.push(this.makeParticle(
            "particle",
            p5.createVector(p.pos.x, p.pos.y),
            p5.createVector(p5.random(-5, 5), p5.random(-5, 5)),
            p.color,
            1,
          ));
        }
        return ret;
      }
    };

    this.bubbles = {
      bubble: [],
      draw: function () {
        let bubble = {
          x: p5.random(-100, 400),
          y: 410,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12, 18),
          color: randomColor(100, 50, 0.25),
        };
        this.bubble.push(bubble);
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
      }
    };

    this.stars = {
      star: [],
      draw: function () {
        p5.background("#303030");
        let star = {
          x: p5.random(0, 400),
          y: p5.random(0, 400),
          size: p5.random(15, 30),
        };
        this.star.push(star);
        p5.noStroke();
        p5.fill("#FFFACD");
        this.star.forEach(function (star){
          p5.push();
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
      }
    };

    this.galaxy = {
      space: [],
      draw: function () {
        p5.background('black');
        for (let i = 0; i < 3; i ++) {
          let space = {
            x: 200,
            y: 200,
            velocity: p5.createVector(0, 1).rotate(p5.random(0,360)),
            size: 0.01,
          };
          this.space.push(space);
        }
        p5.noStroke();
        p5.fill('white');
        this.space.forEach(function (space){
          p5.push();
          p5.translate(space.x, space.y);
          p5.ellipse(0, 0, space.size, space.size);
          let speedMultiplier = p5.pow(space.size, 2) /2;
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
      }
    };

    this.pizzas = {
      pizza: [],
      draw: function () {
        p5.background('black');
        let pizza = {
          x: 200,
          y: 200,
          velocity: p5.createVector(0, 1).rotate(p5.random(0,360)),
          size: 0.1,
        };
        this.pizza.push(pizza);
        p5.noStroke();
        this.pizza.forEach(function (pizza){
          p5.push();
          p5.translate(pizza.x, pizza.y);
          drawPizza(p5._renderer.drawingContext);
          let speedMultiplier = p5.pow(pizza.size, 2) / 8;
          pizza.x += pizza.velocity.x * speedMultiplier;
          pizza.y += pizza.velocity.y * speedMultiplier;
          pizza.size += 0.1;
          p5.pop();
        });
        this.pizza = this.pizza.filter(function (pizza) {
          if (pizza.x < -5 || pizza.x > 405 || pizza.y < -5 || pizza.y > 405) {
            return false;
          }
          return true;
        });
      }
    };

    this.smile_face = {
      smile: [],
      draw: function () {
        p5.background("#D3D3D3");
        let smile = {
          x: 200,
          y: 200,
          velocity: p5.createVector(0, 1).rotate(p5.random(0,360)),
          size: 0.1,
        };
        this.smile.push(smile);
        p5.noStroke();
        this.smile.forEach(function (smile){
          p5.push();
          p5.translate(smile.x, smile.y);
          drawSmiley(p5._renderer.drawingContext);
          let speedMultiplier = p5.pow(smile.size, 2) / 8;
          smile.x += smile.velocity.x * speedMultiplier;
          smile.y += smile.velocity.y * speedMultiplier;
          smile.size += 0.1;
          p5.pop();
        });
        this.smile = this.smile.filter(function (smile) {
          if (smile.x < -5 || smile.x > 405 || smile.y < -5 || smile.y > 405) {
            return false;
          }
          return true;
        });
      }
    };

    this.confetti = {
      confetti: [],
      draw: function () {
        let confetti = {
          x: p5.random(-100, 400),
          y: -10,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12, 18),
          // https://github.com/Automattic/node-canvas/issues/702
          // Bug with node-canvas prevents scaling with a value of 0, so spin initializes to 1
          spin: 1,
          color: randomColor(255, 255, 100),
        };
        this.confetti.push(confetti);
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
      }
    };

    this.music_notes = {
      notes: [],
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.notes.push({
            x: randomNumber(10, 390),
            y: randomNumber(-400, 0),
            rot: randomNumber(0, 359),
            speed: 2,
            size: randomNumber(1.5, 3),
          });
        }
        this.image = p5.createGraphics(70, 50);
        this.image.pixelDensity(1);
        this.image.scale(4,4);
        drawMusicNote(this.image.drawingContext);
      },
      draw: function (context) {
        const centroid = context.centroid;
        if (this.notes.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.notes.length; i++) {
          p5.push();
          const notes = this.notes[i];
          let scale = p5.map(centroid, 5000, 8000, 0, notes.size);
          scale = p5.constrain(scale, 0, 3);
          p5.translate(notes.x, notes.y);
          p5.rotate(notes.rot);
          p5.scale(scale / 4);
          p5.image(this.image);
          notes.y += notes.speed;
          notes.rot++;
          if (notes.y > 410) {
            notes.x = randomNumber(10, 390);
            notes.y = -50;
          }
          p5.pop();
        }
      }
    };
  }
};

function drawSwirl(ctx) {
  ctx.save();
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(277.353,2.93555);
  ctx.bezierCurveTo(179.837,73.7852,158.22,210.271,229.067,307.787);
  ctx.bezierCurveTo(275.989,372.367,351.696,403.66,425.806,396.854);
  ctx.bezierCurveTo(328.591,464.24,194.86,441.895,124.981,345.713);
  ctx.bezierCurveTo(54.1299,248.197,75.7471,111.709,173.263,40.8594);
  ctx.bezierCurveTo(206.2,16.9316,243.579,3.55078,281.376,0.078125);
  ctx.lineTo(279.462,1.41992);
  ctx.bezierCurveTo(278.755,1.91992,278.052,2.42578,277.353,2.93555);
  ctx.closePath();
  ctx.moveTo(450.388,178.842);
  ctx.bezierCurveTo(521.235,81.3262,657.724,59.709,755.239,130.559);
  ctx.lineTo(756.817,131.717);
  ctx.lineTo(757.821,132.461);
  ctx.lineTo(759.2,133.506);
  ctx.bezierCurveTo(744.22,98.6309,719.942,67.2129,687.005,43.2832);
  ctx.bezierCurveTo(589.489,-27.5664,453.005,-5.94922,382.153,91.5664);
  ctx.bezierCurveTo(312.274,187.748,332.349,321.84,426.474,393.473);
  ctx.bezierCurveTo(397.099,325.092,403.466,243.422,450.388,178.842);
  ctx.closePath();
  ctx.moveTo(781.825,625.113);
  ctx.bezierCurveTo(819.075,510.477,756.337,387.35,641.7,350.104);
  ctx.bezierCurveTo(565.782,325.436,486.142,344.619,430.185,393.686);
  ctx.bezierCurveTo(469.224,282.029,590.552,221.502,703.618,258.24);
  ctx.bezierCurveTo(818.255,295.486,880.993,418.613,843.743,533.25);
  ctx.bezierCurveTo(831.165,571.969,808.786,604.768,780.247,629.793);
  ctx.lineTo(780.915,627.857);
  ctx.lineTo(781.47,626.189);
  ctx.lineTo(781.825,625.113);
  ctx.closePath();
  ctx.moveTo(319.759,802.969);
  ctx.bezierCurveTo(440.294,802.969,538.009,705.254,538.009,584.719);
  ctx.bezierCurveTo(538.009,504.895,495.153,435.078,431.196,397.023);
  ctx.bezierCurveTo(549.454,399.648,644.509,496.332,644.509,615.219);
  ctx.bezierCurveTo(644.509,735.754,546.794,833.469,426.259,833.469);
  ctx.bezierCurveTo(385.548,833.469,347.438,822.322,314.821,802.914);
  ctx.bezierCurveTo(316.462,802.951,318.11,802.969,319.759,802.969);
  ctx.closePath();
  ctx.moveTo(282.548,558.994);
  ctx.bezierCurveTo(167.911,596.242,44.7861,533.506,7.53612,418.869);
  ctx.bezierCurveTo(7.02831,417.299,6.53612,415.729,6.06346,414.156);
  ctx.bezierCurveTo(-2.31544,451.176,-1.13966,490.863,11.4385,529.582);
  ctx.bezierCurveTo(48.6885,644.219,171.813,706.955,286.45,669.707);
  ctx.bezierCurveTo(399.517,632.971,462.095,512.689,428.048,399.41);
  ctx.bezierCurveTo(411.622,471.996,358.466,534.328,282.548,558.994);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSpiral(ctx) {
  ctx.save();
  ctx.scale(0.5,0.5);
  ctx.translate(620,1750);
  ctx.scale(0.1,-0.1);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(7221,12785);
  ctx.bezierCurveTo(7099,12758,6957,12672,6883,12582);
  ctx.bezierCurveTo(6760,12431,6712,12221,6760,12036);
  ctx.bezierCurveTo(6789,11923,6833,11846,6920,11759);
  ctx.bezierCurveTo(7009,11670,7043,11650,7237,11574);
  ctx.bezierCurveTo(8275,11170,9110,10532,9772,9640);
  ctx.bezierCurveTo(10308,8917,10686,8010,10814,7135);
  ctx.bezierCurveTo(10864,6801,10884,6307,10861,6000);
  ctx.bezierCurveTo(10748,4481,10024,3152,8816,2245);
  ctx.bezierCurveTo(8111,1717,7275,1376,6415,1266);
  ctx.bezierCurveTo(5999,1213,5497,1220,5090,1286);
  ctx.bezierCurveTo(3911,1475,2877,2097,2150,3055);
  ctx.bezierCurveTo(1680,3674,1371,4418,1266,5185);
  ctx.bezierCurveTo(1207,5616,1222,6123,1305,6546);
  ctx.bezierCurveTo(1550,7785,2340,8821,3477,9394);
  ctx.bezierCurveTo(3890,9602,4287,9723,4790,9792);
  ctx.bezierCurveTo(4939,9812,5512,9809,5665,9787);
  ctx.bezierCurveTo(6654,9643,7441,9190,8036,8420);
  ctx.bezierCurveTo(8369,7989,8616,7424,8703,6890);
  ctx.bezierCurveTo(8758,6557,8758,6167,8704,5852);
  ctx.bezierCurveTo(8560,5010,8094,4297,7384,3830);
  ctx.bezierCurveTo(6577,3299,5602,3207,4770,3584);
  ctx.bezierCurveTo(4107,3883,3596,4498,3415,5210);
  ctx.bezierCurveTo(3366,5404,3356,5491,3356,5730);
  ctx.bezierCurveTo(3356,5977,3366,6064,3421,6269);
  ctx.bezierCurveTo(3605,6963,4157,7501,4844,7655);
  ctx.bezierCurveTo(5532,7809,6206,7504,6503,6905);
  ctx.bezierCurveTo(6650,6607,6673,6301,6569,6016);
  ctx.bezierCurveTo(6463,5726,6194,5502,5903,5460);
  ctx.bezierCurveTo(5837,5451,5719,5457,5721,5469);
  ctx.bezierCurveTo(5721,5472,5757,5492,5801,5513);
  ctx.bezierCurveTo(5911,5566,6004,5659,6059,5772);
  ctx.bezierCurveTo(6116,5888,6132,5955,6137,6106);
  ctx.bezierCurveTo(6142,6229,6140,6243,6112,6342);
  ctx.bezierCurveTo(6031,6626,5801,6828,5485,6891);
  ctx.bezierCurveTo(5385,6911,5174,6908,5072,6886);
  ctx.bezierCurveTo(4912,6852,4779,6796,4665,6715);
  ctx.bezierCurveTo(4591,6663,4457,6525,4403,6445);
  ctx.bezierCurveTo(4074,5959,4147,5286,4585,4777);
  ctx.bezierCurveTo(4817,4507,5172,4315,5555,4250);
  ctx.bezierCurveTo(5669,4230,5708,4228,5880,4233);
  ctx.bezierCurveTo(6140,4241,6295,4273,6544,4372);
  ctx.bezierCurveTo(6945,4531,7321,4853,7549,5233);
  ctx.bezierCurveTo(7708,5497,7815,5820,7850,6139);
  ctx.bezierCurveTo(7876,6373,7851,6710,7791,6948);
  ctx.bezierCurveTo(7598,7702,7050,8355,6340,8676);
  ctx.bezierCurveTo(5839,8902,5282,8974,4730,8884);
  ctx.bezierCurveTo(4096,8780,3481,8452,3013,7967);
  ctx.bezierCurveTo(2522,7459,2227,6820,2139,6075);
  ctx.bezierCurveTo(2122,5939,2122,5531,2138,5395);
  ctx.bezierCurveTo(2222,4685,2481,4063,2925,3510);
  ctx.bezierCurveTo(3547,2734,4447,2249,5455,2145);
  ctx.bezierCurveTo(5717,2118,6109,2127,6385,2166);
  ctx.bezierCurveTo(7410,2311,8379,2869,9041,3696);
  ctx.bezierCurveTo(9240,3943,9364,4136,9510,4425);
  ctx.bezierCurveTo(9769,4936,9911,5443,9961,6028);
  ctx.bezierCurveTo(9978,6233,9967,6709,9941,6905);
  ctx.bezierCurveTo(9819,7816,9470,8614,8881,9329);
  ctx.bezierCurveTo(8677,9577,8346,9890,8064,10102);
  ctx.bezierCurveTo(6944,10947,5442,11244,4035,10900);
  ctx.bezierCurveTo(2823,10603,1759,9890,1014,8875);
  ctx.bezierCurveTo(638,8363,344,7744,176,7110);
  ctx.bezierCurveTo(-47,6268,-56,5345,151,4475);
  ctx.bezierCurveTo(466,3144,1261,1946,2370,1128);
  ctx.bezierCurveTo(3158,547,4082,177,5060,51);
  ctx.bezierCurveTo(5356,12,5471,6,5825,6);
  ctx.bezierCurveTo(6353,6,6717,48,7215,166);
  ctx.bezierCurveTo(8623,501,9877,1311,10780,2470);
  ctx.bezierCurveTo(11467,3352,11911,4431,12049,5555);
  ctx.bezierCurveTo(12086,5853,12095,6001,12095,6355);
  ctx.bezierCurveTo(12095,6799,12068,7110,11994,7515);
  ctx.bezierCurveTo(11583,9768,10054,11699,7965,12602);
  ctx.bezierCurveTo(7814,12668,7604,12750,7520,12777);
  ctx.bezierCurveTo(7453,12798,7297,12802,7221,12785);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function drawSparkle(ctx, color) {
  ctx.save();
  ctx.scale(0.25,0.25);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(54.3,27.2);
  ctx.bezierCurveTo(30.7,29.1,29.1,30.7,27.2,54.3);
  ctx.bezierCurveTo(25.2,30.7,23.6,29.1,0,27.2);
  ctx.bezierCurveTo(23.6,25.2,25.2,23.6,27.2,0);
  ctx.bezierCurveTo(29.1,23.6,30.7,25.2,54.3,27.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPoop(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(18,0);
  ctx.lineTo(18,18);
  ctx.lineTo(0,18);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#995243";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(5.449,0);
  ctx.bezierCurveTo(5.449,0,6.842,2.603,9.21,2.183);
  ctx.bezierCurveTo(9.375,2.153,9.534,2.131,9.685,2.1149999999999998);
  ctx.translate(10.298035045701008,5.222101065743173);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.167,-1.7655956307563185,0.004704448757110846,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10.298035045701008,-5.222101065743173);
  ctx.bezierCurveTo(13.465,5.513,13.429,5.78,13.363999999999999,6.035);
  ctx.translate(12.28082155257508,9.460839087148454);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.593,-1.2645632722304196,0.5451577676855324,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-12.28082155257508,-9.460839087148454);
  ctx.translate(14.61316499362498,14.621011550380446);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.379,-1.350057200443468,1.5681816430299116,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-14.61316499362498,-14.621011550380446);
  ctx.lineTo(3.378,18);
  ctx.translate(3.3736182456025494,14.622002841885683);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.378,1.5694991818492987,4.488917795855039,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.3736182456025494,-14.622002841885683);
  ctx.translate(5.696605206394599,9.461967455790333);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.594,2.5956689895309397,4.5687106221629605,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.696605206394599,-9.461967455790333);
  ctx.bezierCurveTo(4.194,4.166,4.375,1.867,5.45,0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(8.595,9.095);
  ctx.bezierCurveTo(8.595,10.315000000000001,7.603000000000001,11.304,6.381,11.304);
  ctx.translate(6.377999774777696,9.093002035584698);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,2.211,1.5694393724108913,3.141141290202552,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-6.377999774777696,-9.093002035584698);
  ctx.bezierCurveTo(4.167,7.874000000000001,5.1579999999999995,6.886000000000001,6.381,6.886000000000001);
  ctx.bezierCurveTo(7.603,6.886000000000001,8.595,7.875000000000001,8.595,9.095);
  ctx.closePath();
  ctx.moveTo(13.804,9.095);
  ctx.bezierCurveTo(13.804,10.315000000000001,12.812000000000001,11.304,11.59,11.304);
  ctx.translate(11.586999774777697,9.093002035584698);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,2.211,1.5694393724108913,3.141141290202552,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-11.586999774777697,-9.093002035584698);
  ctx.bezierCurveTo(9.376,7.874000000000001,10.366999999999999,6.886000000000001,11.59,6.886000000000001);
  ctx.bezierCurveTo(12.812,6.886000000000001,13.804,7.875000000000001,13.804,9.095);
  ctx.closePath();
  ctx.moveTo(11.455,12.692);
  ctx.lineTo(11.455,12.627);
  ctx.lineTo(6.8950000000000005,12.627);
  ctx.lineTo(6.8950000000000005,12.692);
  ctx.translate(9.175,12.692);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,2.28,3.141592653589793,0,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.175,-12.692);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#311a12";
  ctx.beginPath();
  ctx.moveTo(6.395,10.747);
  ctx.bezierCurveTo(7.2749999999999995,10.747,7.989999999999999,10.035,7.989999999999999,9.157);
  ctx.bezierCurveTo(7.989999999999999,8.277,7.276,7.5649999999999995,6.395,7.5649999999999995);
  ctx.bezierCurveTo(5.515,7.5649999999999995,4.800999999999999,8.277999999999999,4.800999999999999,9.155999999999999);
  ctx.bezierCurveTo(4.800999999999999,10.036,5.514999999999999,10.746999999999998,6.395,10.746999999999998);
  ctx.closePath();
  ctx.moveTo(11.577,10.747);
  ctx.bezierCurveTo(12.457,10.747,13.171,10.035,13.171,9.157);
  ctx.bezierCurveTo(13.171,8.277,12.456999999999999,7.5649999999999995,11.577,7.5649999999999995);
  ctx.bezierCurveTo(10.697,7.5649999999999995,9.982,8.277999999999999,9.982,9.155999999999999);
  ctx.bezierCurveTo(9.982,10.036,10.696,10.746999999999998,11.577,10.746999999999998);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
