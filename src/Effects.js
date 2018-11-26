const drawPineapple = require('./drawPineapple');

module.exports = class Effects {
  constructor(p5, alpha, blend) {
    this.blend = blend || p5.BLEND;

    function randomNumber(min, max) {
      return Math.round(p5.random(min, max));
    }

    function colorFromHue(h, s=100, l=80, a=alpha) {
      return p5.color("hsla(" + Math.floor(h % 360) + ", " + s + "%, " + l + "%," + a + ")");
    }

    function randomColor(s=100, l=80, a=alpha) {
      return colorFromHue(randomNumber(0, 359), s, l, a);
    }

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
      color: colorFromHue(0),
      update: function () {
        this.color = colorFromHue(this.color._getHue() + 10);
      },
      draw: function ({isPeak}) {
        if (isPeak) {
          this.update();
        }
        p5.background(this.color);
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
          this.colors[i] = randomColor();
        }
      },
      update: function () {
        const numChanges = randomNumber(this.minColorChangesPerUpdate, this.maxColorChangesPerUpdate);
        for (let i = 0; i < numChanges; i++) {
          const loc = randomNumber(0, this.colors.length);
          this.colors[loc] = randomColor();
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
          p5.stroke(colorFromHue((this.hue + i * 10) % 360));
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
          p5.stroke(colorFromHue((this.hue + i * 10) % 360));
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
        return {x: randomNumber(-100, 600),y:randomNumber(0, 400),color: randomColor()};
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
            color: randomColor(),
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
        this.color=randomNumber(0,359);
      },
      draw: function ({isPeak,bpm}) {
        if (isPeak || !this.color) {
          this.update();
        }
        p5.push();
        p5.background(colorFromHue(this.color, 100, 60));
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
        this.color=randomNumber(0,359);
      },
      update: function () {
        this.color=(this.color+randomNumber(0,20)) % 359;
      },
      draw: function ({isPeak,bpm}) {
        if (this.color === null) {
          this.init();
        }
        if (isPeak) {
          this.update();
        }
        p5.background(colorFromHue(this.color, 100, 60));
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

        p5.background('#333');

        const ctx = this.shapes._renderer.drawingContext;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(100, this.h);
        ctx.lineTo(0, this.h);
        ctx.clip();
        this.shapes.clear();
        this.shapes.rotate(p5.frameCount);
        this.shapes.fill('#146030');
        this.shapes.rect(20, 20, 50, 50);
        this.shapes.fill('#082036');
        this.shapes.triangle(0, 10, 80, 90, 0, 100);
        this.shapes.fill('#3C565C');
        this.shapes.triangle(20, 0, 50, 30, 30, 60);
        this.shapes.fill('#CB5612');
        this.shapes.ellipse(100, 50, 80);
        this.shapes.fill('#3C565C');
        this.shapes.ellipse(-50, -50, 50);
        this.shapes.fill('#CB5612');
        this.shapes.ellipse(-40, -46, 20);
        this.shapes.fill('#146030');
        this.shapes.triangle(-60, 0, -30, -40, -30, 0);
        this.shapes.fill('#F0DFA2');
        this.shapes.rect(-45, 0, 40, 300);
        this.shapes.rotate(17);
        this.shapes.fill('#717171');
        this.shapes.rect(30, 40, 10, 40);
        this.shapes.rotate(37);
        this.shapes.fill('#5b2c6e');
        this.shapes.rect(30, 40, 20, 40);
        this.shapes.rotate(180);
        this.shapes.fill('#146030');
        this.shapes.triangle(10, 20, 80, 90, 0, 100);
        this.shapes.translate(20, 0);
        this.shapes.rotate(20);
        this.shapes.fill('#F0DFA2');
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

function drawMusicNote(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(16,0);
  ctx.lineTo(16,12);
  ctx.lineTo(0,12);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#143441";
  ctx.beginPath();
  ctx.moveTo(4.706,1.024);
  ctx.bezierCurveTo(4.706,0.458,5.23,0,5.874,0);
  ctx.lineTo(14.832,0);
  ctx.bezierCurveTo(15.477,0,16,0.458,16,1.024);
  ctx.lineTo(16,9.389);
  ctx.bezierCurveTo(15.954,10.838,14.603,12,12.945,12);
  ctx.bezierCurveTo(11.258000000000001,12,9.89,10.797,9.89,9.312);
  ctx.bezierCurveTo(9.89,7.827999999999999,11.258000000000001,6.625,12.945,6.625);
  ctx.bezierCurveTo(13.555,6.625,14.122,6.782,14.599,7.052);
  ctx.lineTo(14.599,1.735);
  ctx.lineTo(6.108,1.735);
  ctx.lineTo(6.108,9.215);
  ctx.lineTo(6.109999999999999,9.312);
  ctx.bezierCurveTo(6.11,10.797,4.742,12,3.055,12);
  ctx.bezierCurveTo(1.3680000000000003,12,0,10.797,0,9.312);
  ctx.bezierCurveTo(0,7.827999999999999,1.368,6.625,3.055,6.625);
  ctx.bezierCurveTo(3.6630000000000003,6.625,4.23,6.781,4.706,7.051);
  ctx.lineTo(4.706,1.024);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#143441";
  ctx.beginPath();
  ctx.moveTo(5.874,0);
  ctx.bezierCurveTo(5.23,0,4.706,0.458,4.706,1.024);
  ctx.lineTo(4.706,7.05);
  ctx.translate(3.0713425115256543,9.97296012551912);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.349,-1.0608812123956128,-1.5756761644736175,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.0713425115256543,-9.97296012551912);
  ctx.bezierCurveTo(1.368,6.625,0,7.828,0,9.312);
  ctx.bezierCurveTo(0,10.797,1.368,12,3.055,12);
  ctx.bezierCurveTo(4.742,12,6.11,10.797,6.11,9.312);
  ctx.bezierCurveTo(6.11,9.28,6.11,9.247,6.1080000000000005,9.215);
  ctx.lineTo(6.1080000000000005,1.7349999999999994);
  ctx.lineTo(14.598,1.7349999999999994);
  ctx.lineTo(14.598,7.052);
  ctx.translate(12.961553823086197,9.973959087678026);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.349,-1.0602691634285102,-1.5757392621473125,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-12.961553823086197,-9.973959087678026);
  ctx.bezierCurveTo(11.258000000000001,6.625,9.89,7.828,9.89,9.312);
  ctx.bezierCurveTo(9.89,10.796999999999999,11.258000000000001,12,12.945,12);
  ctx.bezierCurveTo(14.603,12,15.954,10.838000000000001,16,9.39);
  ctx.lineTo(16,1.023);
  ctx.bezierCurveTo(16,0.458,15.477,0,14.832,0);
  ctx.lineTo(5.874,0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#7d8e9e";
  ctx.beginPath();
  ctx.moveTo(2.091,7.25);
  ctx.bezierCurveTo(2.693542662065396,7.25,3.1820000000000004,7.6815975011631155,3.1820000000000004,8.214);
  ctx.bezierCurveTo(3.1820000000000004,8.746402498836886,2.693542662065396,9.178,2.091,9.178);
  ctx.bezierCurveTo(1.4884573379346044,9.178,1.0000000000000002,8.746402498836886,1.0000000000000002,8.214);
  ctx.bezierCurveTo(1.0000000000000002,7.6815975011631155,1.4884573379346044,7.25,2.091,7.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#7d8e9e";
  ctx.beginPath();
  ctx.moveTo(12.091,7.25);
  ctx.bezierCurveTo(12.693542662065395,7.25,13.181999999999999,7.6815975011631155,13.181999999999999,8.214);
  ctx.bezierCurveTo(13.181999999999999,8.746402498836886,12.693542662065395,9.178,12.091,9.178);
  ctx.bezierCurveTo(11.488457337934603,9.178,11,8.746402498836886,11,8.214);
  ctx.bezierCurveTo(11,7.6815975011631155,11.488457337934603,7.25,12.091,7.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#7d8e9e";
  ctx.beginPath();
  ctx.moveTo(5.75,0.25);
  ctx.lineTo(14.25,0.25);
  ctx.quadraticCurveTo(14.5,0.25,14.5,0.5);
  ctx.lineTo(14.5,0.5);
  ctx.quadraticCurveTo(14.5,0.75,14.25,0.75);
  ctx.lineTo(5.75,0.75);
  ctx.quadraticCurveTo(5.5,0.75,5.5,0.5);
  ctx.lineTo(5.5,0.5);
  ctx.quadraticCurveTo(5.5,0.25,5.75,0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawPizza(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(18,0);
  ctx.lineTo(18,19);
  ctx.lineTo(0,19);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#ffdf40";
  ctx.beginPath();
  ctx.moveTo(2.053,5.795);
  ctx.translate(9.018345825070071,16.62199559144544);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.874,-2.142469283130931,-1.5699687536904956,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.018345825070071,-16.62199559144544);
  ctx.bezierCurveTo(11.565,3.7479999999999998,13.933,4.481999999999999,15.940999999999999,5.754);
  ctx.lineTo(8.986,18.092);
  ctx.lineTo(2.053,5.795);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffdf40";
  ctx.beginPath();
  ctx.moveTo(2.053,5.795);
  ctx.translate(9.018345825070071,16.62199559144544);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.874,-2.142469283130931,-1.5699687536904956,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.018345825070071,-16.62199559144544);
  ctx.bezierCurveTo(11.565,3.7479999999999998,13.933,4.481999999999999,15.940999999999999,5.754);
  ctx.lineTo(8.986,18.092);
  ctx.lineTo(2.053,5.795);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffa31a";
  ctx.beginPath();
  ctx.moveTo(15.941,5.754);
  ctx.lineTo(17.4,3.168);
  ctx.translate(9.029219880119381,13.010879720112984);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.921,-0.8660467874524094,-2.2814982295150372,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.029219880119381,-13.010879720112984);
  ctx.lineTo(2.052999999999998,5.795);
  ctx.translate(9.018347169935046,16.6219947262515);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.874,-2.1424694073449864,-1.5698911821890151,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.018347169935046,-16.6219947262515);
  ctx.bezierCurveTo(11.565999999999999,3.748,13.933,4.482,15.942,5.754);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#dc1c4b";
  ctx.beginPath();
  ctx.moveTo(1.858,5.36);
  ctx.translate(9.018425420187592,16.064996441005075);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.879,-2.1603340231136614,-1.5700529010091713,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.018425420187592,-16.064996441005075);
  ctx.bezierCurveTo(11.647,3.1860000000000004,14.086,3.9680000000000004,16.136,5.317);
  ctx.lineTo(15.902999999999999,5.73);
  ctx.translate(9.040607269917343,16.618994766189793);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.871,-1.0084566785325626,-1.5716981426204462,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.040607269917343,-16.618994766189793);
  ctx.bezierCurveTo(6.481999999999999,3.748,4.1049999999999995,4.488,2.09,5.771000000000001);
  ctx.lineTo(1.8579999999999999,5.360000000000001);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(3.133,7.711);
  ctx.lineTo(2.675,6.898000000000001);
  ctx.translate(3.182943487726767,7.1289922363976075);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,-2.7147876016617154,-1.5760714188701996,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.182943487726767,-7.1289922363976075);
  ctx.bezierCurveTo(3.4879999999999995,6.571000000000001,3.7379999999999995,6.827000000000001,3.7509999999999994,NaN);
  ctx.bezierCurveTo(4.315999999999999,NaN,3.7509999999999994,NaN,4.7509999999999994,NaN);
  ctx.bezierCurveTo(5.321,NaN,NaN,NaN,19.191,NaN);
  ctx.bezierCurveTo(18.773,NaN,NaN,NaN,19.756,NaN);
  ctx.bezierCurveTo(19.756,NaN,19.088,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.565,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.moveTo(8.184,11.152);
  ctx.bezierCurveTo(8.184,11.466999999999999,7.933999999999999,11.722,7.6259999999999994,11.722);
  ctx.translate(7.632977492722385,11.15704308607177);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.565,1.5831461853652529,3.150518588170521,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-7.632977492722385,-11.15704308607177);
  ctx.bezierCurveTo(7.068,10.837,7.318,10.581999999999999,7.6259999999999994,10.581999999999999);
  ctx.bezierCurveTo(7.933999999999999,10.581999999999999,8.184,10.837,8.196,NaN);
  ctx.moveTo(13.518,9.003);
  ctx.bezierCurveTo(13.518,9.318,13.268,9.573,12.96,9.573);
  ctx.translate(12.966977492722386,9.00804308607177);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.565,1.5831461853652529,3.150518588170521,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-12.966977492722386,-9.00804308607177);
  ctx.bezierCurveTo(12.402000000000001,8.687,12.652000000000001,8.432,12.96,8.432);
  ctx.bezierCurveTo(13.268,8.432,13.518,8.687000000000001,13.530000000000001,NaN);
  ctx.moveTo(15.216,6.006);
  ctx.bezierCurveTo(15.216,6.322,14.966,6.577,14.657,6.577);
  ctx.translate(14.663977492722385,6.01204308607177);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.565,1.5831461853652529,3.150518588170521,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-14.663977492722385,-6.01204308607177);
  ctx.bezierCurveTo(14.099,5.691,14.349,5.436,14.657,5.436);
  ctx.bezierCurveTo(14.966,5.436,15.216,5.691,15.227,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e3482c";
  ctx.beginPath();
  ctx.moveTo(8.082,16.49);
  ctx.lineTo(6.452000000000001,13.597999999999999);
  ctx.translate(7.550168029464652,14.811999991376327);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,1.637,-2.306139647203975,-1.5708989715505144,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-7.550168029464652,-14.811999991376327);
  ctx.bezierCurveTo(8.469000000000001,13.174999999999999,9.214,13.937,9.214,14.876);
  ctx.translate(7.5140335779773295,14.886684755282294);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,1.7,-0.006285191547278363,1.2301483605310315,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-7.5140335779773295,-14.886684755282294);
  ctx.closePath();
  ctx.moveTo(13.235,6.938);
  ctx.bezierCurveTo(13.235,8.008,12.386,8.876999999999999,11.34,8.876999999999999);
  ctx.bezierCurveTo(10.293,8.876999999999999,9.443999999999999,8.008999999999999,9.443999999999999,6.937999999999999);
  ctx.bezierCurveTo(9.443999999999999,5.8679999999999986,10.293,4.999999999999999,11.34,4.999999999999999);
  ctx.bezierCurveTo(12.386,4.999999999999999,13.235,5.867999999999999,13.235,6.937999999999999);
  ctx.closePath();
  ctx.moveTo(6.73,9.624);
  ctx.bezierCurveTo(7.748,9.624,8.572000000000001,8.781,8.572000000000001,7.74);
  ctx.bezierCurveTo(8.572000000000001,6.7,7.748000000000001,5.856,6.731000000000001,5.856);
  ctx.bezierCurveTo(5.713000000000001,5.856,4.889000000000001,6.7,4.889000000000001,7.74);
  ctx.bezierCurveTo(4.889000000000001,8.780000000000001,5.713000000000001,9.624,6.731000000000002,9.624);
  ctx.closePath();
  ctx.moveTo(12.164,11.798);
  ctx.bezierCurveTo(12.164,12.738,11.419,13.5,10.5,13.5);
  ctx.bezierCurveTo(9.581,13.5,8.836,12.738,8.836,11.798);
  ctx.bezierCurveTo(8.836,10.858,9.581,10.097,10.5,10.097);
  ctx.bezierCurveTo(11.419,10.097,12.164,10.857999999999999,12.164,11.798);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawSmiley(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(17,0);
  ctx.lineTo(17,16);
  ctx.lineTo(0,16);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#ffdf40";
  ctx.beginPath();
  ctx.arc(8.5,8,8,0,6.283185307179586,true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#311a12";
  ctx.globalAlpha = 0.9;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(6.9,6.4);
  ctx.bezierCurveTo(6.9,7.283,6.422000000000001,8,5.833,8);
  ctx.bezierCurveTo(5.244,8,4.767,7.283,4.767,6.4);
  ctx.bezierCurveTo(4.767,5.516,5.244000000000001,4.800000000000001,5.833,4.800000000000001);
  ctx.bezierCurveTo(6.423,4.800000000000001,6.9,5.516000000000001,6.9,6.4);
  ctx.closePath();
  ctx.moveTo(4.894,10.666);
  ctx.bezierCurveTo(5.322,11.803,6.774,12.639000000000001,8.5,12.639000000000001);
  ctx.bezierCurveTo(10.225,12.639000000000001,11.678,11.803,12.106,10.666);
  ctx.bezierCurveTo(11.227,11.222000000000001,9.936,11.573,8.5,11.573);
  ctx.bezierCurveTo(7.063,11.573,5.773,11.222000000000001,4.894,10.666);
  ctx.closePath();
  ctx.moveTo(11.167,8);
  ctx.bezierCurveTo(11.756,8,12.233,7.283,12.233,6.4);
  ctx.bezierCurveTo(12.233,5.516,11.756,4.800000000000001,11.167,4.800000000000001);
  ctx.bezierCurveTo(10.577,4.800000000000001,10.1,5.516000000000001,10.1,6.4);
  ctx.bezierCurveTo(10.1,7.283,10.578,8,11.167,8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawHeart(ctx, color) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(18,0);
  ctx.lineTo(18,16);
  ctx.lineTo(0,16);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0,5.016);
  ctx.bezierCurveTo(0,6.718,0.84,7.959,2.014,9.128);
  ctx.lineTo(8.85,15.937999999999999);
  ctx.translate(9,15.785369727773288);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.214,2.3475033371885377,0.7940893164012557,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9,-15.785369727773288);
  ctx.lineTo(15.986,9.128);
  ctx.bezierCurveTo(17.16,7.958,18,6.718,18,5.016);
  ctx.bezierCurveTo(18,2.246,15.684,0,12.828,0);
  ctx.translate(12.806054971254465,5.231953976834406);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,5.232,-1.5666019282681247,-2.385404775142245,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-12.806054971254465,-5.231953976834406);
  ctx.translate(5.193945028745534,5.231953976834407);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,5.232,-0.7561878784475481,-1.5749907253216684,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.193945028745534,-5.231953976834407);
  ctx.bezierCurveTo(2.316,0,0,2.246,0,5.016);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(9.001,2.673);
  ctx.translate(5.7940041418097,6.064961315456039);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4.668,-0.8134203244268714,-1.5748674909565874,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.7940041418097,-6.064961315456039);
  ctx.bezierCurveTo(3.2379999999999995,1.397,1.1819999999999995,3.38,1.1819999999999995,5.8260000000000005);
  ctx.bezierCurveTo(1.1819999999999995,6.6530000000000005,1.4169999999999994,7.4270000000000005,1.8259999999999996,8.089);
  ctx.translate(4.795990939436072,4.927133807437823);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4.338,2.324913157276619,3.1395488087915053,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-4.795990939436072,-4.927133807437823);
  ctx.bezierCurveTo(0.458,2.49,2.515,0.508,5.052,0.508);
  ctx.bezierCurveTo(6.73,0.508,8.2,1.376,9,2.673);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawTaco(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(19,0);
  ctx.lineTo(19,10);
  ctx.lineTo(0,10);
  ctx.closePath();
  ctx.clip();
  ctx.translate(0,0);
  ctx.translate(0,0);
  ctx.scale(1,1);
  ctx.translate(0,0);
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(9,0.708008);
  ctx.bezierCurveTo(4.36142,0.708008,0.977887,2.70451,0.54661,8.6598);
  ctx.bezierCurveTo(0.493162,9.39784,1.09354,10.0001,1.83351,10.0001);
  ctx.bezierCurveTo(5.48554,10.0003,13.4784,9.99978,16.6573,9.99958);
  ctx.bezierCurveTo(17.3994,9.99953,18.0099,9.39461,17.9071,8.65964);
  ctx.bezierCurveTo(17.2781,4.16296,13.5298,0.708008,9,0.708008);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#529d1b";
  ctx.beginPath();
  ctx.moveTo(7.31258,0.560337);
  ctx.bezierCurveTo(6.97087,0.311416,6.49307,0.371935,6.21979,0.698753);
  ctx.lineTo(5.93742,1.03643);
  ctx.bezierCurveTo(5.77577,1.22975,5.53402,1.33728,5.28349,1.32729);
  ctx.lineTo(4.59322,1.29977);
  ctx.bezierCurveTo(4.1689,1.28285,3.84052,1.67307,3.92944,2.08855);
  ctx.bezierCurveTo(3.98291,2.33837,3.88436,2.59284,3.68656,2.74388);
  ctx.bezierCurveTo(3.684,2.74205,3.68145,2.74018,3.67892,2.73827);
  ctx.bezierCurveTo(3.44196,2.55967,3.10242,2.72505,3.09695,3.02172);
  ctx.lineTo(3.09473,3.14232);
  ctx.bezierCurveTo(3.09419,3.17201,3.09036,3.2008,3.08361,3.22838);
  ctx.bezierCurveTo(3.07718,3.24557,3.07158,3.26303,3.06681,3.28067);
  ctx.bezierCurveTo(3.00339,3.43849,2.84022,3.54341,2.66023,3.52282);
  ctx.bezierCurveTo(2.36152,3.48865,2.13801,3.7909,2.25818,4.06649);
  ctx.lineTo(2.3085,4.18189);
  ctx.bezierCurveTo(2.40394,4.40073,2.30686,4.65571,2.09005,4.75568);
  ctx.bezierCurveTo(1.7964,4.89108,1.74514,5.28682,1.9946,5.49257);
  ctx.lineTo(2.01664,5.51075);
  ctx.bezierCurveTo(2.20429,5.66551,2.23771,5.9402,2.09264,6.13543);
  ctx.lineTo(2.04237,6.20309);
  ctx.bezierCurveTo(1.85726,6.45222,2.00179,6.80891,2.30811,6.85891);
  ctx.bezierCurveTo(2.539,6.89659,2.69288,7.11789,2.64783,7.34746);
  ctx.lineTo(2.62107,7.48379);
  ctx.bezierCurveTo(2.56407,7.77421,2.85231,8.01183,3.12653,7.90048);
  ctx.bezierCurveTo(3.33823,7.81452,3.57671,7.93775,3.62905,8.16017);
  ctx.lineTo(3.64623,8.23318);
  ctx.bezierCurveTo(3.71553,8.52765,4.09304,8.61384,4.28328,8.37863);
  ctx.bezierCurveTo(4.42891,8.19859,4.70344,8.19859,4.84906,8.37863);
  ctx.bezierCurveTo(5.03931,8.61384,5.41681,8.52765,5.48612,8.23318);
  ctx.lineTo(5.5033,8.16017);
  ctx.bezierCurveTo(5.55564,7.93775,5.79412,7.81452,6.00582,7.90048);
  ctx.bezierCurveTo(6.28004,8.01183,6.56828,7.77421,6.51128,7.48379);
  ctx.lineTo(6.48452,7.34746);
  ctx.bezierCurveTo(6.43946,7.11789,6.59335,6.89659,6.82424,6.85891);
  ctx.bezierCurveTo(7.13055,6.80891,7.27509,6.45222,7.08998,6.20309);
  ctx.lineTo(7.03971,6.13543);
  ctx.bezierCurveTo(6.99848,6.07995,6.97167,6.01804,6.95872,5.9543);
  ctx.lineTo(7.05379,5.89544);
  ctx.bezierCurveTo(7.25381,5.77163,7.49708,5.74082,7.72015,5.81104);
  ctx.lineTo(8.28835,5.9899);
  ctx.bezierCurveTo(8.7199,6.12575,9.18096,5.87737,9.30819,5.44052);
  ctx.lineTo(9.3333,5.3543);
  ctx.bezierCurveTo(9.34143,5.32636,9.351,5.29908,9.36191,5.27252);
  ctx.lineTo(9.36659,5.28127);
  ctx.bezierCurveTo(9.56429,5.65062,10.013,5.80392,10.3979,5.63361);
  ctx.lineTo(11.1287,5.3103);
  ctx.bezierCurveTo(11.2731,5.24637,11.4328,5.22614,11.588,5.25212);
  ctx.lineTo(11.9671,5.31558);
  ctx.bezierCurveTo(11.9267,5.66233,12.1235,6.01172,12.4771,6.13648);
  ctx.lineTo(12.5089,6.1477);
  ctx.bezierCurveTo(12.7216,6.22279,12.8925,6.38427,12.9796,6.59268);
  ctx.lineTo(12.9905,6.61889);
  ctx.bezierCurveTo(13.1758,7.06216,13.7062,7.24216,14.1262,7.00432);
  ctx.lineTo(14.2223,6.94992);
  ctx.bezierCurveTo(14.4078,6.84492,14.6265,6.81721,14.8311,6.87282);
  ctx.lineTo(14.937,6.90163);
  ctx.bezierCurveTo(15.4003,7.02758,15.8728,6.72055,15.9488,6.24419);
  ctx.lineTo(15.9533,6.21601);
  ctx.bezierCurveTo(15.989,5.99205,16.117,5.79273,16.3058,5.66677);
  ctx.lineTo(16.3341,5.64794);
  ctx.bezierCurveTo(16.7447,5.3741,16.805,4.79403,16.459,4.44683);
  ctx.bezierCurveTo(16.2996,4.28687,16.2182,4.06384,16.236,3.83751);
  ctx.bezierCurveTo(16.274,3.35382,15.8709,2.95204,15.3885,2.99559);
  ctx.lineTo(15.2951,3.00403);
  ctx.bezierCurveTo(15.0794,3.0235,14.8656,2.95525,14.7019,2.81466);
  ctx.lineTo(14.6327,2.75523);
  ctx.bezierCurveTo(14.4333,2.58403,14.1755,2.52944,13.9386,2.58144);
  ctx.bezierCurveTo(13.8544,2.44627,13.8188,2.28231,13.8432,2.11943);
  ctx.bezierCurveTo(13.91,1.67267,13.5426,1.2772,13.0941,1.32211);
  ctx.lineTo(12.3929,1.39231);
  ctx.bezierCurveTo(12.2182,1.40981,12.043,1.36971,11.8939,1.27812);
  ctx.lineTo(11.3496,0.943669);
  ctx.bezierCurveTo(11.0299,0.747251,10.6154,0.79975,10.3512,1.07013);
  ctx.lineTo(9.90129,1.53051);
  ctx.lineTo(9.89671,1.53516);
  ctx.bezierCurveTo(9.8748,1.47284,9.86221,1.40629,9.86042,1.33731);
  ctx.bezierCurveTo(9.84942,0.911964,9.43941,0.615269,9.03164,0.737584);
  ctx.lineTo(8.36828,0.936563);
  ctx.bezierCurveTo(8.12752,1.00878,7.86777,0.964775,7.66564,0.817532);
  ctx.lineTo(7.31258,0.560337);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(12.1119,1.78009);
  ctx.bezierCurveTo(12.0895,1.49426,11.8697,1.26734,11.5928,1.2442);
  ctx.lineTo(11.0444,1.19835);
  ctx.bezierCurveTo(10.9171,1.18771,10.797,1.13294,10.7036,1.04295);
  ctx.lineTo(10.2982,0.652432);
  ctx.bezierCurveTo(10.0816,0.443685,9.74568,0.44255,9.5277,0.649828);
  ctx.lineTo(9.21686,0.945399);
  ctx.bezierCurveTo(9.1114,1.04567,8.97305,1.10095,8.82969,1.1001);
  ctx.lineTo(8.40481,1.09757);
  ctx.bezierCurveTo(8.0893,1.09569,7.83307,1.36023,7.83488,1.68595);
  ctx.lineTo(7.83495,1.69845);
  ctx.bezierCurveTo(7.72572,1.5653,7.55991,1.48312,7.37619,1.49186);
  ctx.lineTo(7.29565,1.49569);
  ctx.bezierCurveTo(7.14522,1.50285,6.99821,1.4479,6.8871,1.34297);
  ctx.lineTo(6.8123,1.27233);
  ctx.bezierCurveTo(6.59374,1.06595,6.2581,1.06814,6.0421,1.27737);
  ctx.lineTo(5.81771,1.49472);
  ctx.bezierCurveTo(5.72975,1.57992,5.61775,1.63392,5.49801,1.64887);
  ctx.lineTo(5.18131,1.68841);
  ctx.bezierCurveTo(4.92226,1.72075,4.71809,1.93153,4.68676,2.19897);
  ctx.lineTo(4.64847,2.52593);
  ctx.bezierCurveTo(4.63399,2.64955,4.58168,2.76518,4.49915,2.85599);
  ctx.lineTo(4.40509,2.95948);
  ctx.lineTo(4.221,2.96664);
  ctx.bezierCurveTo(3.92479,2.97816,3.68723,3.22342,3.67607,3.52922);
  ctx.lineTo(3.65862,4.0074);
  ctx.bezierCurveTo(3.65627,4.07193,3.64361,4.13508,3.6216,4.19446);
  ctx.lineTo(3.43671,4.12619);
  ctx.bezierCurveTo(3.12972,4.01282,2.79362,4.18962,2.70201,4.51266);
  ctx.lineTo(2.64436,4.71598);
  ctx.bezierCurveTo(2.59008,4.90737,2.44512,5.05703,2.25973,5.11306);
  ctx.lineTo(2.06278,5.17259);
  ctx.bezierCurveTo(1.99441,5.19326,1.9328,5.22597,1.87941,5.2678);
  ctx.bezierCurveTo(1.79896,5.41813,1.7243,5.56839,1.65536,5.71785);
  ctx.bezierCurveTo(1.65345,5.78834,1.66397,5.86045,1.68844,5.93108);
  ctx.lineTo(1.74402,6.0915);
  ctx.bezierCurveTo(1.68338,6.16393,1.60139,6.21678,1.50951,6.24199);
  ctx.bezierCurveTo(1.47892,6.25038,1.45002,6.26143,1.42293,6.27478);
  ctx.bezierCurveTo(1.33972,6.49741,1.26957,6.71613,1.21227,6.92841);
  ctx.bezierCurveTo(1.22509,6.95211,1.24019,6.97518,1.25766,6.99735);
  ctx.lineTo(1.2705,7.01365);
  ctx.lineTo(1.27713,7.02227);
  ctx.lineTo(1.27262,7.02142);
  ctx.bezierCurveTo(1.24482,7.01602,1.21736,7.01282,1.19036,7.01166);
  ctx.bezierCurveTo(1,8.5,1.00017,9.5,2.49965,9.5);
  ctx.bezierCurveTo(4.50014,9.5,4.68204,9.04228,6.82879,7.36097);
  ctx.bezierCurveTo(6.8282,7.34644,6.82815,7.33192,6.82861,7.31743);
  ctx.bezierCurveTo(6.83986,7.3163,6.85117,7.3155,6.86252,7.31506);
  ctx.lineTo(6.88842,7.31405);
  ctx.bezierCurveTo(7.22434,7.04858,7.55688,6.76557,7.88036,6.46784);
  ctx.lineTo(7.88808,6.25629);
  ctx.bezierCurveTo(7.89318,6.11644,7.94667,5.98312,8.03885,5.88051);
  ctx.lineTo(8.35402,5.52965);
  ctx.bezierCurveTo(8.36492,5.51752,8.37523,5.50503,8.38495,5.49222);
  ctx.bezierCurveTo(8.42063,5.5028,8.45777,5.50988,8.49599,5.51307);
  ctx.lineTo(9.04434,5.55892);
  ctx.bezierCurveTo(9.17169,5.56956,9.29182,5.62433,9.38522,5.71432);
  ctx.lineTo(9.79056,6.10484);
  ctx.bezierCurveTo(10.0072,6.31359,10.3431,6.31472,10.5611,6.10744);
  ctx.lineTo(10.8221,5.85929);
  ctx.lineTo(10.8402,6.09046);
  ctx.bezierCurveTo(10.8626,6.37629,11.0824,6.60321,11.3593,6.62636);
  ctx.lineTo(11.9076,6.6722);
  ctx.bezierCurveTo(12.035,6.68284,12.1551,6.73761,12.2485,6.8276);
  ctx.lineTo(12.6538,7.21812);
  ctx.bezierCurveTo(12.8705,7.42687,13.2064,7.428,13.4244,7.22072);
  ctx.lineTo(13.7352,6.92515);
  ctx.bezierCurveTo(13.8407,6.82488,13.979,6.7696,14.1224,6.77045);
  ctx.lineTo(14.5473,6.77298);
  ctx.bezierCurveTo(14.8628,6.77486,15.119,6.51033,15.1172,6.1846);
  ctx.lineTo(15.1147,5.74596);
  ctx.bezierCurveTo(15.1139,5.59795,15.1674,5.45512,15.2646,5.34625);
  ctx.lineTo(15.5509,5.02534);
  ctx.bezierCurveTo(15.7517,4.8003,15.7506,4.45355,15.5484,4.22986);
  ctx.lineTo(15.1701,3.8114);
  ctx.bezierCurveTo(15.0829,3.71497,15.0299,3.59095,15.0196,3.45948);
  ctx.lineTo(14.9752,2.89337);
  ctx.bezierCurveTo(14.9527,2.60754,14.7329,2.38062,14.4561,2.35748);
  ctx.lineTo(13.9077,2.31164);
  ctx.bezierCurveTo(13.7804,2.30099,13.6602,2.24622,13.5668,2.15623);
  ctx.lineTo(13.1615,1.76571);
  ctx.bezierCurveTo(12.9448,1.55697,12.609,1.55583,12.391,1.76311);
  ctx.lineTo(12.13,2.01126);
  ctx.lineTo(12.1119,1.78009);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(9.77029,1.13825);
  ctx.bezierCurveTo(9.8579,1.05939,9.9909,1.05939,10.0785,1.13825);
  ctx.lineTo(10.2622,1.30358);
  ctx.bezierCurveTo(10.3263,1.36125,10.3528,1.44986,10.3309,1.53324);
  ctx.lineTo(10.2427,1.86945);
  ctx.bezierCurveTo(10.2162,1.97074,10.1246,2.04137,10.0199,2.04137);
  ctx.lineTo(9.82889,2.04137);
  ctx.bezierCurveTo(9.72417,2.04137,9.63263,1.97074,9.60606,1.86945);
  ctx.lineTo(9.51788,1.53324);
  ctx.bezierCurveTo(9.49602,1.44986,9.52253,1.36125,9.5866,1.30358);
  ctx.lineTo(9.77029,1.13825);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(5.64101,3.21105);
  ctx.bezierCurveTo(5.77283,3.09113,5.97423,3.09113,6.10605,3.21105);
  ctx.lineTo(6.55035,3.61521);
  ctx.bezierCurveTo(6.64528,3.70156,6.68454,3.83341,6.6523,3.95762);
  ctx.lineTo(6.45438,4.72028);
  ctx.bezierCurveTo(6.41484,4.87265,6.27732,4.97903,6.11991,4.97903);
  ctx.lineTo(5.62715,4.97903);
  ctx.bezierCurveTo(5.46974,4.97903,5.33222,4.87265,5.29268,4.72028);
  ctx.lineTo(5.09476,3.95762);
  ctx.bezierCurveTo(5.06252,3.83341,5.10178,3.70156,5.19671,3.61521);
  ctx.lineTo(5.64101,3.21105);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(7.91643,1.47345);
  ctx.bezierCurveTo(7.9366,1.35732,7.86585,1.24469,7.75247,1.21244);
  ctx.lineTo(7.51477,1.14484);
  ctx.bezierCurveTo(7.43185,1.12126,7.34271,1.14594,7.28373,1.20881);
  ctx.lineTo(7.04594,1.46231);
  ctx.bezierCurveTo(6.97429,1.53869,6.96318,1.65378,7.01888,1.74246);
  ctx.lineTo(7.12048,1.90421);
  ctx.bezierCurveTo(7.17618,1.99288,7.28469,2.03283,7.38459,2.00145);
  ctx.lineTo(7.7162,1.89729);
  ctx.bezierCurveTo(7.79844,1.87146,7.85937,1.80187,7.87413,1.71694);
  ctx.lineTo(7.91643,1.47345);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(13.7674,2.57086);
  ctx.bezierCurveTo(13.855,2.492,13.988,2.492,14.0756,2.57086);
  ctx.lineTo(14.2593,2.7362);
  ctx.bezierCurveTo(14.3233,2.79386,14.3499,2.88248,14.328,2.96586);
  ctx.lineTo(14.2398,3.30207);
  ctx.bezierCurveTo(14.2132,3.40336,14.1217,3.47399,14.017,3.47399);
  ctx.lineTo(13.826,3.47399);
  ctx.bezierCurveTo(13.7212,3.47399,13.6297,3.40336,13.6031,3.30207);
  ctx.lineTo(13.515,2.96586);
  ctx.bezierCurveTo(13.4931,2.88248,13.5196,2.79386,13.5837,2.7362);
  ctx.lineTo(13.7674,2.57086);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(3.78428,3.58888);
  ctx.bezierCurveTo(3.65241,3.46877,3.45078,3.46877,3.31891,3.58888);
  ctx.lineTo(3.21054,3.68759);
  ctx.bezierCurveTo(3.11575,3.77393,3.07655,3.90565,3.10872,4.02976);
  ctx.lineTo(3.17847,4.29886);
  ctx.bezierCurveTo(3.21797,4.45127,3.35551,4.55771,3.51296,4.55771);
  ctx.lineTo(3.59023,4.55771);
  ctx.bezierCurveTo(3.74768,4.55771,3.88522,4.45127,3.92472,4.29886);
  ctx.lineTo(3.99447,4.02976);
  ctx.bezierCurveTo(4.02664,3.90565,3.98744,3.77393,3.89265,3.68759);
  ctx.lineTo(3.78428,3.58888);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#fff79c";
  ctx.beginPath();
  ctx.moveTo(4.50723,3.91779);
  ctx.lineTo(4.60245,3.98548);
  ctx.lineTo(4.60245,3.98548);
  ctx.lineTo(4.50723,3.91779);
  ctx.closePath();
  ctx.moveTo(4.36695,3.25366);
  ctx.lineTo(4.26778,3.19191);
  ctx.lineTo(4.26778,3.19191);
  ctx.lineTo(4.36695,3.25366);
  ctx.closePath();
  ctx.moveTo(4.8134,3.36849);
  ctx.bezierCurveTo(4.87249,3.3944,4.9414,3.36751,4.96731,3.30842);
  ctx.bezierCurveTo(4.99322,3.24932,4.96633,3.18041,4.90724,3.1545);
  ctx.lineTo(4.8134,3.36849);
  ctx.closePath();
  ctx.moveTo(4.02744,4.56079);
  ctx.bezierCurveTo(4.0442,4.6231,4.10829,4.66003,4.1706,4.64328);
  ctx.bezierCurveTo(4.23291,4.62652,4.26984,4.56243,4.25309,4.50012);
  ctx.lineTo(4.02744,4.56079);
  ctx.closePath();
  ctx.moveTo(3.99013,4.0684);
  ctx.lineTo(4.09319,4.12343);
  ctx.lineTo(4.09319,4.12343);
  ctx.lineTo(3.99013,4.0684);
  ctx.closePath();
  ctx.moveTo(6.96813,1.82639);
  ctx.lineTo(6.94272,1.71235);
  ctx.lineTo(6.94272,1.71235);
  ctx.lineTo(6.96813,1.82639);
  ctx.closePath();
  ctx.moveTo(7.43943,1.20079);
  ctx.lineTo(7.47028,1.31348);
  ctx.lineTo(7.43943,1.20079);
  ctx.closePath();
  ctx.moveTo(7.77983,1.57973);
  ctx.bezierCurveTo(7.80955,1.637,7.88007,1.65934,7.93734,1.62962);
  ctx.bezierCurveTo(7.99461,1.5999,8.01695,1.52938,7.98724,1.47211);
  ctx.lineTo(7.77983,1.57973);
  ctx.closePath();
  ctx.moveTo(5.98241,2.01766);
  ctx.bezierCurveTo(5.94646,2.07125,5.96076,2.14382,6.01434,2.17977);
  ctx.bezierCurveTo(6.06792,2.21572,6.1405,2.20142,6.17645,2.14784);
  ctx.lineTo(5.98241,2.01766);
  ctx.closePath();
  ctx.moveTo(6.35928,1.61354);
  ctx.lineTo(6.39599,1.72446);
  ctx.lineTo(6.35928,1.61354);
  ctx.closePath();
  ctx.moveTo(11.7417,1.53553);
  ctx.lineTo(11.7796,1.42504);
  ctx.lineTo(11.7796,1.42504);
  ctx.lineTo(11.7417,1.53553);
  ctx.closePath();
  ctx.moveTo(12.458,1.24735);
  ctx.lineTo(12.4907,1.13518);
  ctx.lineTo(12.4907,1.13518);
  ctx.lineTo(12.458,1.24735);
  ctx.closePath();
  ctx.moveTo(12.5644,1.75462);
  ctx.bezierCurveTo(12.5618,1.81909,12.612,1.87346,12.6764,1.87607);
  ctx.bezierCurveTo(12.7409,1.87868,12.7953,1.82853,12.7979,1.76406);
  ctx.lineTo(12.5644,1.75462);
  ctx.closePath();
  ctx.moveTo(10.7974,1.18221);
  ctx.bezierCurveTo(10.739,1.20963,10.7139,1.2792,10.7413,1.33761);
  ctx.bezierCurveTo(10.7687,1.39602,10.8383,1.42114,10.8967,1.39373);
  ctx.lineTo(10.7974,1.18221);
  ctx.closePath();
  ctx.moveTo(11.3207,1.03313);
  ctx.lineTo(11.2939,1.14684);
  ctx.lineTo(11.2939,1.14684);
  ctx.lineTo(11.3207,1.03313);
  ctx.closePath();
  ctx.moveTo(2.82846,5.47299);
  ctx.lineTo(2.92453,5.53947);
  ctx.lineTo(2.92453,5.53947);
  ctx.lineTo(2.82846,5.47299);
  ctx.closePath();
  ctx.moveTo(2.77595,4.9283);
  ctx.lineTo(2.87512,4.99005);
  ctx.lineTo(2.87512,4.99005);
  ctx.lineTo(2.77595,4.9283);
  ctx.closePath();
  ctx.moveTo(3.10912,5.00062);
  ctx.bezierCurveTo(3.16932,5.02384,3.23695,4.99387,3.26018,4.93368);
  ctx.bezierCurveTo(3.28341,4.87348,3.25344,4.80585,3.19324,4.78262);
  ctx.lineTo(3.10912,5.00062);
  ctx.closePath();
  ctx.moveTo(2.38322,6.03643);
  ctx.bezierCurveTo(2.39285,6.10023,2.45238,6.14415,2.51618,6.13452);
  ctx.bezierCurveTo(2.57998,6.12489,2.6239,6.06537,2.61427,6.00157);
  ctx.lineTo(2.38322,6.03643);
  ctx.closePath();
  ctx.moveTo(2.42218,5.64464);
  ctx.lineTo(2.31989,5.58819);
  ctx.lineTo(2.42218,5.64464);
  ctx.closePath();
  ctx.moveTo(4.60245,3.98548);
  ctx.bezierCurveTo(4.66699,3.8947,4.66501,3.80124,4.63502,3.72111);
  ctx.bezierCurveTo(4.6092,3.65211,4.55949,3.58619,4.52627,3.53932);
  ctx.bezierCurveTo(4.48764,3.48484,4.46233,3.44513,4.45148,3.40822);
  ctx.bezierCurveTo(4.44304,3.37949,4.44309,3.35241,4.46613,3.31542);
  ctx.lineTo(4.26778,3.19191);
  ctx.bezierCurveTo(4.20693,3.28964,4.20151,3.38631,4.2273,3.47409);
  ctx.bezierCurveTo(4.25069,3.55369,4.29932,3.62322,4.33566,3.67447);
  ctx.bezierCurveTo(4.3774,3.73334,4.40368,3.76962,4.41618,3.80301);
  ctx.bezierCurveTo(4.42451,3.82527,4.42317,3.83439,4.41201,3.85009);
  ctx.lineTo(4.60245,3.98548);
  ctx.closePath();
  ctx.moveTo(4.46613,3.31542);
  ctx.bezierCurveTo(4.46645,3.31491,4.47107,3.30587,4.50282,3.30155);
  ctx.bezierCurveTo(4.53522,3.29714,4.57904,3.30059,4.62865,3.31065);
  ctx.bezierCurveTo(4.67687,3.32043,4.72346,3.33496,4.75864,3.34739);
  ctx.bezierCurveTo(4.77603,3.35354,4.79018,3.35901,4.7998,3.36287);
  ctx.bezierCurveTo(4.8046,3.3648,4.80824,3.36631,4.81057,3.36729);
  ctx.bezierCurveTo(4.81173,3.36778,4.81256,3.36813,4.81304,3.36834);
  ctx.bezierCurveTo(4.81328,3.36844,4.81343,3.36851,4.81349,3.36853);
  ctx.bezierCurveTo(4.81352,3.36854,4.81353,3.36855,4.81351,3.36854);
  ctx.bezierCurveTo(4.8135,3.36854,4.81349,3.36853,4.81347,3.36852);
  ctx.bezierCurveTo(4.81346,3.36852,4.81344,3.36851,4.81344,3.36851);
  ctx.bezierCurveTo(4.81342,3.3685,4.8134,3.36849,4.86032,3.2615);
  ctx.bezierCurveTo(4.90724,3.1545,4.90721,3.15449,4.90719,3.15448);
  ctx.bezierCurveTo(4.90717,3.15447,4.90715,3.15446,4.90712,3.15445);
  ctx.bezierCurveTo(4.90708,3.15443,4.90703,3.15441,4.90698,3.15439);
  ctx.bezierCurveTo(4.90687,3.15434,4.90673,3.15428,4.90657,3.15421);
  ctx.bezierCurveTo(4.90626,3.15407,4.90584,3.1539,4.90534,3.15368);
  ctx.bezierCurveTo(4.90433,3.15324,4.90295,3.15266,4.90122,3.15193);
  ctx.bezierCurveTo(4.89776,3.15047,4.8929,3.14846,4.8868,3.14601);
  ctx.bezierCurveTo(4.87462,3.14112,4.85739,3.13447,4.8365,3.12708);
  ctx.bezierCurveTo(4.79511,3.11246,4.73748,3.09431,4.6751,3.08166);
  ctx.bezierCurveTo(4.61413,3.06929,4.54098,3.06054,4.47132,3.07002);
  ctx.bezierCurveTo(4.401,3.07959,4.31845,3.11052,4.26778,3.19191);
  ctx.lineTo(4.46613,3.31542);
  ctx.closePath();
  ctx.moveTo(4.25309,4.50012);
  ctx.bezierCurveTo(4.2089,4.33577,4.12549,4.25059,4.08963,4.20318);
  ctx.bezierCurveTo(4.08095,4.19169,4.07685,4.18502,4.07472,4.18072);
  ctx.bezierCurveTo(4.07377,4.17882,4.07342,4.17777,4.07331,4.17739);
  ctx.bezierCurveTo(4.07321,4.17708,4.07321,4.177,4.07321,4.17695);
  ctx.bezierCurveTo(4.0732,4.1769,4.07313,4.17622,4.07327,4.17469);
  ctx.bezierCurveTo(4.07342,4.17309,4.07383,4.1703,4.07495,4.16609);
  ctx.bezierCurveTo(4.07728,4.15737,4.08238,4.14367,4.09319,4.12343);
  ctx.lineTo(3.88707,4.01336);
  ctx.bezierCurveTo(3.85433,4.07467,3.83426,4.13629,3.84072,4.20039);
  ctx.bezierCurveTo(3.84723,4.26492,3.87895,4.31196,3.90325,4.3441);
  ctx.bezierCurveTo(3.95146,4.40785,3.99793,4.45103,4.02744,4.56079);
  ctx.lineTo(4.25309,4.50012);
  ctx.closePath();
  ctx.moveTo(4.09319,4.12343);
  ctx.bezierCurveTo(4.10659,4.09833,4.11817,4.09351,4.13043,4.09053);
  ctx.bezierCurveTo(4.15168,4.08536,4.18121,4.08644,4.2326,4.0924);
  ctx.bezierCurveTo(4.27543,4.09736,4.34196,4.10724,4.40393,4.10012);
  ctx.bezierCurveTo(4.47424,4.09205,4.54817,4.06183,4.60245,3.98548);
  ctx.lineTo(4.41201,3.85009);
  ctx.bezierCurveTo(4.40434,3.86088,4.39727,3.86569,4.37728,3.86798);
  ctx.bezierCurveTo(4.34894,3.87124,4.31586,3.86682,4.25952,3.86029);
  ctx.bezierCurveTo(4.21173,3.85475,4.14253,3.84712,4.07522,3.86348);
  ctx.bezierCurveTo(3.99893,3.88204,3.93213,3.92899,3.88707,4.01336);
  ctx.lineTo(4.09319,4.12343);
  ctx.closePath();
  ctx.moveTo(6.99354,1.94042);
  ctx.bezierCurveTo(7.10979,1.91452,7.18395,1.85124,7.22853,1.76795);
  ctx.bezierCurveTo(7.26734,1.69545,7.28168,1.60894,7.29359,1.54974);
  ctx.bezierCurveTo(7.30724,1.48193,7.31963,1.43422,7.34349,1.39677);
  ctx.bezierCurveTo(7.36366,1.36511,7.39689,1.33357,7.47028,1.31348);
  ctx.lineTo(7.40857,1.08811);
  ctx.bezierCurveTo(7.28363,1.12232,7.20012,1.18693,7.14642,1.27123);
  ctx.bezierCurveTo(7.0964,1.34975,7.07777,1.43783,7.06453,1.50363);
  ctx.bezierCurveTo(7.04955,1.57803,7.04111,1.62295,7.02252,1.65769);
  ctx.bezierCurveTo(7.00971,1.68163,6.99185,1.70141,6.94272,1.71235);
  ctx.lineTo(6.99354,1.94042);
  ctx.closePath();
  ctx.moveTo(7.47028,1.31348);
  ctx.bezierCurveTo(7.51981,1.29991,7.58668,1.32997,7.66522,1.41691);
  ctx.bezierCurveTo(7.7,1.45541,7.72905,1.4966,7.74963,1.52878);
  ctx.bezierCurveTo(7.75981,1.5447,7.76766,1.55799,7.77283,1.56708);
  ctx.bezierCurveTo(7.77542,1.57161,7.77732,1.57507,7.7785,1.57725);
  ctx.bezierCurveTo(7.77909,1.57834,7.7795,1.57911,7.77973,1.57953);
  ctx.bezierCurveTo(7.77984,1.57974,7.7799,1.57987,7.77992,1.5799);
  ctx.bezierCurveTo(7.77993,1.57992,7.77993,1.57991,7.77991,1.57988);
  ctx.bezierCurveTo(7.77991,1.57987,7.7799,1.57985,7.77988,1.57982);
  ctx.bezierCurveTo(7.77987,1.57981,7.77986,1.57979,7.77986,1.57978);
  ctx.bezierCurveTo(7.77985,1.57975,7.77983,1.57973,7.88353,1.52592);
  ctx.bezierCurveTo(7.98724,1.47211,7.98722,1.47208,7.9872,1.47205);
  ctx.bezierCurveTo(7.9872,1.47204,7.98718,1.47201,7.98717,1.47198);
  ctx.bezierCurveTo(7.98714,1.47193,7.98711,1.47188,7.98708,1.47181);
  ctx.bezierCurveTo(7.98702,1.47169,7.98694,1.47154,7.98685,1.47137);
  ctx.bezierCurveTo(7.98667,1.47103,7.98644,1.4706,7.98616,1.47007);
  ctx.bezierCurveTo(7.9856,1.46901,7.98484,1.46759,7.98389,1.46583);
  ctx.bezierCurveTo(7.98198,1.46232,7.97929,1.45744,7.97585,1.4514);
  ctx.bezierCurveTo(7.96899,1.43936,7.95909,1.42261,7.94647,1.40288);
  ctx.bezierCurveTo(7.92147,1.36379,7.88471,1.31131,7.8386,1.26028);
  ctx.bezierCurveTo(7.75537,1.16814,7.60018,1.03564,7.40857,1.08811);
  ctx.lineTo(7.47028,1.31348);
  ctx.closePath();
  ctx.moveTo(6.17645,2.14784);
  ctx.bezierCurveTo(6.28391,1.98766,6.28494,1.86372,6.29506,1.80178);
  ctx.bezierCurveTo(6.29944,1.77496,6.30334,1.77133,6.30587,1.76861);
  ctx.bezierCurveTo(6.31175,1.76229,6.33184,1.74569,6.39599,1.72446);
  ctx.lineTo(6.32257,1.50263);
  ctx.bezierCurveTo(6.24389,1.52867,6.18009,1.5608,6.13486,1.60938);
  ctx.bezierCurveTo(6.08628,1.66156,6.07183,1.719,6.06446,1.76411);
  ctx.bezierCurveTo(6.05108,1.84603,6.05502,1.90943,5.98241,2.01766);
  ctx.lineTo(6.17645,2.14784);
  ctx.closePath();
  ctx.moveTo(6.39599,1.72446);
  ctx.bezierCurveTo(6.44834,1.70713,6.47916,1.71238,6.50173,1.72134);
  ctx.bezierCurveTo(6.52991,1.73253,6.55715,1.75406,6.59765,1.79105);
  ctx.bezierCurveTo(6.66855,1.85581,6.78995,1.98579,6.99354,1.94042);
  ctx.lineTo(6.94272,1.71235);
  ctx.bezierCurveTo(6.87568,1.72729,6.84494,1.70046,6.75522,1.61852);
  ctx.bezierCurveTo(6.7154,1.58215,6.66021,1.53286,6.58797,1.50418);
  ctx.bezierCurveTo(6.51011,1.47326,6.4225,1.46956,6.32257,1.50263);
  ctx.lineTo(6.39599,1.72446);
  ctx.closePath();
  ctx.moveTo(11.7037,1.64602);
  ctx.bezierCurveTo(11.8165,1.68476,11.9127,1.66999,11.994,1.62109);
  ctx.bezierCurveTo(12.0643,1.57885,12.12,1.51148,12.1593,1.46732);
  ctx.bezierCurveTo(12.2047,1.41635,12.2383,1.38276,12.2764,1.36375);
  ctx.bezierCurveTo(12.3081,1.34791,12.3516,1.33805,12.4253,1.35952);
  ctx.lineTo(12.4907,1.13518);
  ctx.bezierCurveTo(12.3662,1.09892,12.2614,1.11004,12.1719,1.15472);
  ctx.bezierCurveTo(12.0889,1.19622,12.0286,1.26266,11.9847,1.31201);
  ctx.bezierCurveTo(11.9348,1.36816,11.9059,1.40141,11.8736,1.42086);
  ctx.bezierCurveTo(11.8523,1.43366,11.828,1.44166,11.7796,1.42504);
  ctx.lineTo(11.7037,1.64602);
  ctx.closePath();
  ctx.moveTo(12.4253,1.35952);
  ctx.bezierCurveTo(12.4772,1.37461,12.5208,1.43842,12.5457,1.55425);
  ctx.bezierCurveTo(12.5568,1.60576,12.5616,1.65649,12.5635,1.69495);
  ctx.bezierCurveTo(12.5644,1.71398,12.5646,1.72952,12.5646,1.74005);
  ctx.bezierCurveTo(12.5646,1.7453,12.5646,1.74927,12.5645,1.75177);
  ctx.bezierCurveTo(12.5645,1.75302,12.5644,1.7539,12.5644,1.75438);
  ctx.bezierCurveTo(12.5644,1.75462,12.5644,1.75476,12.5644,1.75481);
  ctx.bezierCurveTo(12.5644,1.75483,12.5644,1.75482,12.5644,1.75479);
  ctx.bezierCurveTo(12.5644,1.75477,12.5644,1.75475,12.5644,1.75472);
  ctx.bezierCurveTo(12.5644,1.75471,12.5644,1.75468,12.5644,1.75467);
  ctx.bezierCurveTo(12.5644,1.75465,12.5644,1.75462,12.6812,1.75934);
  ctx.bezierCurveTo(12.7979,1.76406,12.7979,1.76403,12.7979,1.76399);
  ctx.bezierCurveTo(12.7979,1.76398,12.7979,1.76394,12.7979,1.76391);
  ctx.bezierCurveTo(12.7979,1.76386,12.7979,1.7638,12.7979,1.76373);
  ctx.bezierCurveTo(12.7979,1.76359,12.7979,1.76342,12.7979,1.76323);
  ctx.bezierCurveTo(12.7979,1.76284,12.798,1.76235,12.798,1.76175);
  ctx.bezierCurveTo(12.798,1.76056,12.7981,1.75895,12.7981,1.75695);
  ctx.bezierCurveTo(12.7982,1.75294,12.7983,1.74735,12.7983,1.74039);
  ctx.bezierCurveTo(12.7983,1.72648,12.798,1.70696,12.7969,1.68347);
  ctx.bezierCurveTo(12.7946,1.6369,12.7888,1.57279,12.7742,1.50509);
  ctx.bezierCurveTo(12.7478,1.38247,12.6799,1.19029,12.4907,1.13518);
  ctx.lineTo(12.4253,1.35952);
  ctx.closePath();
  ctx.moveTo(10.8967,1.39373);
  ctx.bezierCurveTo(11.0701,1.31236,11.133,1.20551,11.172,1.15817);
  ctx.bezierCurveTo(11.1888,1.13783,11.1931,1.13775,11.1952,1.13716);
  ctx.bezierCurveTo(11.2025,1.13508,11.2277,1.13124,11.2939,1.14684);
  ctx.lineTo(11.3475,0.91941);
  ctx.bezierCurveTo(11.2669,0.900425,11.1956,0.894231,11.1316,0.912315);
  ctx.bezierCurveTo(11.0624,0.93188,11.0206,0.974473,10.9917,1.00958);
  ctx.bezierCurveTo(10.9394,1.07313,10.9123,1.1283,10.7974,1.18221);
  ctx.lineTo(10.8967,1.39373);
  ctx.closePath();
  ctx.moveTo(11.2939,1.14684);
  ctx.bezierCurveTo(11.3479,1.15956,11.3729,1.18059,11.3889,1.20136);
  ctx.bezierCurveTo(11.4085,1.22666,11.4216,1.26029,11.4383,1.31318);
  ctx.bezierCurveTo(11.4677,1.40647,11.5077,1.57865,11.7037,1.64602);
  ctx.lineTo(11.7796,1.42504);
  ctx.bezierCurveTo(11.712,1.4018,11.698,1.35966,11.6611,1.24284);
  ctx.bezierCurveTo(11.6446,1.19067,11.6215,1.1203,11.574,1.05864);
  ctx.bezierCurveTo(11.5229,0.992456,11.45,0.943567,11.3475,0.91941);
  ctx.lineTo(11.2939,1.14684);
  ctx.closePath();
  ctx.moveTo(2.92453,5.53947);
  ctx.bezierCurveTo(2.97746,5.46298,2.9869,5.38519,2.96849,5.3122);
  ctx.bezierCurveTo(2.95296,5.25066,2.9168,5.19409,2.89641,5.15955);
  ctx.bezierCurveTo(2.87168,5.11765,2.85887,5.09177,2.85469,5.06785);
  ctx.bezierCurveTo(2.85166,5.05053,2.85191,5.02734,2.87512,4.99005);
  ctx.lineTo(2.67677,4.86655);
  ctx.bezierCurveTo(2.62506,4.9496,2.611,5.03068,2.62452,5.10807);
  ctx.bezierCurveTo(2.63688,5.17886,2.67146,5.23813,2.69519,5.27833);
  ctx.bezierCurveTo(2.72327,5.32589,2.73663,5.34838,2.74192,5.36935);
  ctx.bezierCurveTo(2.74432,5.37887,2.74586,5.38705,2.73239,5.40651);
  ctx.lineTo(2.92453,5.53947);
  ctx.closePath();
  ctx.moveTo(2.87512,4.99005);
  ctx.bezierCurveTo(2.88088,4.9808,2.90584,4.96247,2.98488,4.97121);
  ctx.bezierCurveTo(3.01759,4.97483,3.04925,4.98227,3.07336,4.98914);
  ctx.bezierCurveTo(3.0852,4.99251,3.09473,4.9956,3.10106,4.99776);
  ctx.bezierCurveTo(3.10421,4.99884,3.10654,4.99967,3.10793,5.00018);
  ctx.bezierCurveTo(3.10862,5.00043,3.10908,5.0006,3.10928,5.00068);
  ctx.bezierCurveTo(3.10938,5.00072,3.10942,5.00073,3.1094,5.00072);
  ctx.bezierCurveTo(3.10938,5.00072,3.10935,5.0007,3.10931,5.00069);
  ctx.bezierCurveTo(3.10929,5.00068,3.10926,5.00067,3.10923,5.00066);
  ctx.bezierCurveTo(3.10921,5.00065,3.10919,5.00064,3.10918,5.00064);
  ctx.bezierCurveTo(3.10915,5.00063,3.10912,5.00062,3.15118,4.89162);
  ctx.bezierCurveTo(3.19324,4.78262,3.19321,4.78261,3.19318,4.7826);
  ctx.bezierCurveTo(3.19316,4.78259,3.19313,4.78258,3.19311,4.78257);
  ctx.bezierCurveTo(3.19306,4.78255,3.19301,4.78253,3.19295,4.78251);
  ctx.bezierCurveTo(3.19283,4.78246,3.1927,4.78241,3.19255,4.78236);
  ctx.bezierCurveTo(3.19225,4.78224,3.19188,4.7821,3.19144,4.78194);
  ctx.bezierCurveTo(3.19057,4.78161,3.18942,4.78118,3.18801,4.78067);
  ctx.bezierCurveTo(3.18519,4.77964,3.18132,4.77826,3.17653,4.77662);
  ctx.bezierCurveTo(3.16696,4.77336,3.15358,4.76903,3.13736,4.76441);
  ctx.bezierCurveTo(3.10535,4.75529,3.06028,4.74447,3.01058,4.73897);
  ctx.bezierCurveTo(2.92478,4.72947,2.76212,4.72948,2.67677,4.86655);
  ctx.lineTo(2.87512,4.99005);
  ctx.closePath();
  ctx.moveTo(2.61427,6.00157);
  ctx.bezierCurveTo(2.59285,5.85964,2.53075,5.78787,2.5086,5.75325);
  ctx.bezierCurveTo(2.49974,5.7394,2.50394,5.74222,2.5039,5.74913);
  ctx.bezierCurveTo(2.50388,5.75149,2.50318,5.73966,2.52447,5.70109);
  ctx.lineTo(2.31989,5.58819);
  ctx.bezierCurveTo(2.29101,5.64053,2.27057,5.69302,2.27024,5.74771);
  ctx.bezierCurveTo(2.26988,5.80694,2.29317,5.8501,2.31178,5.87918);
  ctx.bezierCurveTo(2.34457,5.93043,2.37093,5.95493,2.38322,6.03643);
  ctx.lineTo(2.61427,6.00157);
  ctx.closePath();
  ctx.moveTo(2.52447,5.70109);
  ctx.bezierCurveTo(2.53905,5.67467,2.55035,5.66981,2.55635,5.66757);
  ctx.bezierCurveTo(2.56826,5.66313,2.58536,5.66134,2.62321,5.66182);
  ctx.bezierCurveTo(2.68469,5.6626,2.82951,5.6768,2.92453,5.53947);
  ctx.lineTo(2.73239,5.40651);
  ctx.bezierCurveTo(2.71876,5.42621,2.71393,5.42929,2.62618,5.42818);
  ctx.bezierCurveTo(2.58942,5.42771,2.53201,5.42727,2.47469,5.44865);
  ctx.bezierCurveTo(2.41145,5.47223,2.35881,5.51767,2.31989,5.58819);
  ctx.lineTo(2.52447,5.70109);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(10.8962,1.61035);
  ctx.bezierCurveTo(6.59509,1.61035,3.08164,5.86954,2.75195,9.99993);
  ctx.lineTo(17.3961,9.99993);
  ctx.bezierCurveTo(18.1074,9.99993,18.6937,9.42034,18.5934,8.71618);
  ctx.bezierCurveTo(18.0198,4.69212,14.7921,1.61035,10.8962,1.61035);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(10.4731,2.61454);
  ctx.bezierCurveTo(10.523,2.49817,10.6358,2.41699,10.767,2.41699);
  ctx.bezierCurveTo(10.8981,2.41699,11.0109,2.49817,11.0609,2.61454);
  ctx.bezierCurveTo(11.0785,2.57348,11.0882,2.52805,11.0882,2.48026);
  ctx.bezierCurveTo(11.0882,2.297,10.9444,2.14844,10.767,2.14844);
  ctx.bezierCurveTo(10.5896,2.14844,10.4457,2.297,10.4457,2.48026);
  ctx.bezierCurveTo(10.4457,2.52805,10.4555,2.57348,10.4731,2.61454);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(7.06582,4.26294);
  ctx.bezierCurveTo(7.08343,4.22189,7.09321,4.17646,7.09321,4.12866);
  ctx.bezierCurveTo(7.09321,3.9454,6.94938,3.79684,6.77196,3.79684);
  ctx.bezierCurveTo(6.59453,3.79684,6.4507,3.9454,6.4507,4.12866);
  ctx.bezierCurveTo(6.4507,4.17646,6.46048,4.22189,6.47809,4.26294);
  ctx.bezierCurveTo(6.528,4.14658,6.6408,4.0654,6.77196,4.0654);
  ctx.bezierCurveTo(6.90311,4.0654,7.01591,4.14658,7.06582,4.26294);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(5.51649,8.54451);
  ctx.bezierCurveTo(5.5341,8.50346,5.54388,8.45803,5.54388,8.41024);
  ctx.bezierCurveTo(5.54388,8.22697,5.40005,8.07842,5.22262,8.07842);
  ctx.bezierCurveTo(5.0452,8.07842,4.90137,8.22697,4.90137,8.41024);
  ctx.bezierCurveTo(4.90137,8.45803,4.91115,8.50346,4.92876,8.54451);
  ctx.bezierCurveTo(4.97867,8.42815,5.09147,8.34697,5.22262,8.34697);
  ctx.bezierCurveTo(5.35378,8.34697,5.46658,8.42815,5.51649,8.54451);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(10.5404,9.01549);
  ctx.bezierCurveTo(10.5904,8.89912,10.7031,8.81794,10.8343,8.81794);
  ctx.bezierCurveTo(10.9655,8.81794,11.0783,8.89912,11.1282,9.01549);
  ctx.bezierCurveTo(11.1458,8.97443,11.1556,8.929,11.1556,8.88121);
  ctx.bezierCurveTo(11.1556,8.69795,11.0117,8.54939,10.8343,8.54939);
  ctx.bezierCurveTo(10.6569,8.54939,10.5131,8.69795,10.5131,8.88121);
  ctx.bezierCurveTo(10.5131,8.929,10.5228,8.97443,10.5404,9.01549);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(8.39231,7.53835);
  ctx.bezierCurveTo(8.40991,7.49729,8.4197,7.45186,8.4197,7.40407);
  ctx.bezierCurveTo(8.4197,7.2208,8.27587,7.07225,8.09844,7.07225);
  ctx.bezierCurveTo(7.92101,7.07225,7.77718,7.2208,7.77718,7.40407);
  ctx.bezierCurveTo(7.77718,7.45186,7.78696,7.49729,7.80457,7.53835);
  ctx.bezierCurveTo(7.85448,7.42198,7.96728,7.3408,8.09844,7.3408);
  ctx.bezierCurveTo(8.2296,7.3408,8.34239,7.42198,8.39231,7.53835);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(10.1126,5.5046);
  ctx.bezierCurveTo(10.1302,5.46355,10.14,5.41811,10.14,5.37032);
  ctx.bezierCurveTo(10.14,5.18706,9.99615,5.0385,9.81872,5.0385);
  ctx.bezierCurveTo(9.64129,5.0385,9.49746,5.18706,9.49746,5.37032);
  ctx.bezierCurveTo(9.49746,5.41811,9.50724,5.46355,9.52485,5.5046);
  ctx.bezierCurveTo(9.57476,5.38823,9.68756,5.30705,9.81872,5.30705);
  ctx.bezierCurveTo(9.94988,5.30705,10.0627,5.38823,10.1126,5.5046);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(12.0069,5.01222);
  ctx.bezierCurveTo(12.0568,4.89585,12.1696,4.81467,12.3007,4.81467);
  ctx.bezierCurveTo(12.4319,4.81467,12.5447,4.89585,12.5946,5.01222);
  ctx.bezierCurveTo(12.6122,4.97116,12.622,4.92573,12.622,4.87794);
  ctx.bezierCurveTo(12.622,4.69468,12.4782,4.54612,12.3007,4.54612);
  ctx.bezierCurveTo(12.1233,4.54612,11.9795,4.69468,11.9795,4.87794);
  ctx.bezierCurveTo(11.9795,4.92573,11.9893,4.97116,12.0069,5.01222);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(13.2504,7.28145);
  ctx.bezierCurveTo(13.3004,7.16508,13.4132,7.08391,13.5443,7.08391);
  ctx.bezierCurveTo(13.6755,7.08391,13.7883,7.16508,13.8382,7.28145);
  ctx.bezierCurveTo(13.8558,7.2404,13.8656,7.19497,13.8656,7.14717);
  ctx.bezierCurveTo(13.8656,6.96391,13.7217,6.81535,13.5443,6.81535);
  ctx.bezierCurveTo(13.3669,6.81535,13.2231,6.96391,13.2231,7.14717);
  ctx.bezierCurveTo(13.2231,7.19497,13.2328,7.2404,13.2504,7.28145);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(15.0536,4.71251);
  ctx.bezierCurveTo(15.1035,4.59614,15.2163,4.51496,15.3475,4.51496);
  ctx.bezierCurveTo(15.4787,4.51496,15.5915,4.59614,15.6414,4.71251);
  ctx.bezierCurveTo(15.659,4.67145,15.6688,4.62602,15.6688,4.57823);
  ctx.bezierCurveTo(15.6688,4.39497,15.5249,4.24641,15.3475,4.24641);
  ctx.bezierCurveTo(15.1701,4.24641,15.0262,4.39497,15.0262,4.57823);
  ctx.bezierCurveTo(15.0262,4.62602,15.036,4.67145,15.0536,4.71251);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(16.7532,8.35184);
  ctx.bezierCurveTo(16.8031,8.23548,16.9159,8.1543,17.0471,8.1543);
  ctx.bezierCurveTo(17.1782,8.1543,17.291,8.23548,17.3409,8.35184);
  ctx.bezierCurveTo(17.3585,8.31079,17.3683,8.26536,17.3683,8.21757);
  ctx.bezierCurveTo(17.3683,8.0343,17.2245,7.88575,17.0471,7.88575);
  ctx.bezierCurveTo(16.8696,7.88575,16.7258,8.0343,16.7258,8.21757);
  ctx.bezierCurveTo(16.7258,8.26536,16.7356,8.31079,16.7532,8.35184);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawRainbow(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(20,0);
  ctx.lineTo(20,10);
  ctx.lineTo(0,10);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#dd527c";
  ctx.beginPath();
  ctx.moveTo(10,0);
  ctx.bezierCurveTo(4.822,0,0.564,3.935,0.052,8.978);
  ctx.bezierCurveTo(0.017,9.314,0,9.655,0,10);
  ctx.lineTo(6,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4,3.141592653589793,6.283185307179586,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(20,10);
  ctx.bezierCurveTo(20,4.477,15.523,0,10,0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(10,1);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,9,-1.5707963267948966,0,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(14,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4,0,-3.141592653589793,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(1,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,9,3.141592653589793,4.71238898038469,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#fff79c";
  ctx.beginPath();
  ctx.moveTo(10,2);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,8,-1.5707963267948966,0,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(14,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4,0,-3.141592653589793,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(2,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,8,3.141592653589793,4.71238898038469,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#8fc23f";
  ctx.beginPath();
  ctx.moveTo(10,3);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,7,-1.5707963267948966,0,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(14,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4,0,-3.141592653589793,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(3,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,7,3.141592653589793,4.71238898038469,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#30b1ad";
  ctx.beginPath();
  ctx.moveTo(10,4);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,6,-1.5707963267948966,0,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(14,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4,0,-3.141592653589793,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(4,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,6,3.141592653589793,4.71238898038469,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#5e79bc";
  ctx.beginPath();
  ctx.moveTo(10,5);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,5,-1.5707963267948966,0,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(14,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,4,0,-3.141592653589793,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.lineTo(5,10);
  ctx.translate(10,10);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,5,3.141592653589793,4.71238898038469,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10,-10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
