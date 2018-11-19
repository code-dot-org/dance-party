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

    this.strobe = {
      waitTime: 0,
      flashing: false,
      update: function () {
        this.flashing = true;
        this.waitTime = 6;
      },
      draw: function ({isPeak}) {
        let bgcolor = p5.rgb(1, 1, 1);
        if (isPeak) {
          this.update();
        }
        if (this.flashing) {
          this.waitTime--;
        } else {
          p5.background(bgcolor);
        }
        if (this.waitTime <= 0) {
          this.flashing = false;
        }
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
        return {x: randomNumber(40, 400),y:randomNumber(0, 380),color: randomColor()};
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
          if ((this.sparkles[i].x<10) || (this.sparkles[i].y>390)) {
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
          p5.fill(t.color);
          p5.text(t.text, t.x, t.y);
        });
        p5.pop();
      }
    };

    this.raining_tacos = {
      tacos: [],
      size: 50,
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.tacos.push({
            x: randomNumber(20, 380),
            y: randomNumber(20, 380),
            rot: randomNumber(0, 359),
            speed: randomNumber(2, 5),
          });
        }
      },
      update: function () {
        this.size += randomNumber(-5, 5);
      },
      draw: function () {
        if (this.tacos.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.tacos.length; i++) {
          p5.push();
          const taco = this.tacos[i];
          p5.translate(taco.x, taco.y);
          p5.rotate(taco.rot);
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.textSize(this.size);
          p5.text(String.fromCodePoint(55356, 57134), 0, 0);
          taco.y += taco.speed;
          taco.rot++;
          if (taco.y > 450) {
            taco.x = randomNumber(20, 380);
            taco.y = -50;
          }
          p5.pop();
        }
      }
    };

    this.pineapples = {
      pineapple: [],
      size: 50,
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.pineapple.push({
            x: randomNumber(20, 380),
            y: randomNumber(20, 380),
            rot: randomNumber(0, 359),
            speed: randomNumber(2, 5),
          });
        }
      },
      update: function () {
        this.size += randomNumber(-5, 5);
      },
      draw: function () {
        if (this.pineapple.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.pineapple.length; i++) {
          p5.push();
          const pineapple = this.pineapple[i];
          p5.translate(pineapple.x, pineapple.y);
          p5.rotate(pineapple.rot);
          drawPineapple(p5._renderer.drawingContext);
          pineapple.y += pineapple.speed;
          pineapple.rot++;
          if (pineapple.y > 450) {
            pineapple.x = randomNumber(20, 380);
            pineapple.y = -50;
          }
          p5.pop();
        }
      }
    };

    this.pizzas = {
      pizza: [],
      size: 50,
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.pizza.push({
            x: randomNumber(20, 380),
            y: randomNumber(20, 380),
            rot: randomNumber(0, 359),
            speed: randomNumber(2, 5),
          });
        }
      },
      update: function () {
        this.size += randomNumber(-5, 5);
      },
      draw: function () {
        if (this.pizza.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.pizza.length; i++) {
          p5.push();
          const pizza = this.pizza[i];
          p5.translate(pizza.x, pizza.y);
          p5.rotate(pizza.rot);
          drawPizza(p5._renderer.drawingContext);
          pizza.y += pizza.speed;
          pizza.rot++;
          if (pizza.y > 450) {
            pizza.x = randomNumber(20, 380);
            pizza.y = -50;
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
        for (var i=0;i<this.splats.length;i++) {
          if (randomNumber(0,50) === 0) {
            this.splats[i]=this.randomSplat();
          }
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
        this.shapes.pixelDensity(1);
        this.shapes.fill('white');
        this.shapes.noStroke();
        this.shapes.angleMode(p5.DEGREES);

        this.hex = p5.createGraphics(200, 200);
        this.hex.pixelDensity(1);
        this.hex.angleMode(p5.DEGREES);
      },
      blitHex: function () {
        this.hex.push();
        this.hex.clear();
        this.hex.translate(100, 100);
        this.hex.rotate(30);
        for (let i = 0; i < 3; i++) {
          this.hex.image(this.shapes, -50, 0);
          this.hex.scale(-1, 1);
          this.hex.rotate(60);
          this.hex.image(this.shapes, -50, 0);
          this.hex.rotate(60);
          this.hex.scale(-1, 1);
        }
        this.hex.pop();
      },
      row: function (n) {
        p5.push();
        for (let i = 0; i < n; i++) {
          p5.image(this.hex, 0, 0);
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

    this.falling_poop = {
      poop: [],
      size: 50,
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.poop.push({
            x: randomNumber(10, 390),
            y: -50,
            rot: randomNumber(0, 359),
            speed: p5.random(1,5),
          });
        }
      },
      update: function () {
        this.size += randomNumber(-5, 5);
      },
      draw: function () {
        if (this.poop.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.poop.length; i++) {
          p5.push();
          const poop = this.poop[i];
          p5.translate(poop.x, poop.y);
          p5.rotate(poop.rot);
          drawFallingPoop(p5._renderer.drawingContext);
          poop.y += poop.speed;
          poop.rot++;
          if (poop.y > 410) {
            poop.x = randomNumber(10, 390);
            poop.y = -50;
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
          for (let i = 0; i < 1; i++) {
            p5.ellipse(0, 0, bubble.size, bubble.size);
          }
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

    this.confetti = {
      confetti: [],
      draw: function () {
        let confetti = {
          x: p5.random(-100, 400),
          y: -10,
          velocityX: p5.random(-2, 2),
          size: p5.random(6, 12, 18),
          color: randomColor(255, 255, 100),
        };
        this.confetti.push(confetti);
        p5.noStroke();
        this.confetti.forEach(function (confetti) {
          p5.push();
          p5.fill(confetti.color);
          p5.translate(confetti.x, confetti.y);
          let confettiFlash = p5.random(1, 5);
          for (let i = 0; i < 1; i++) {
            if (confettiFlash <= 2) {
              //causes the confetti to flash on / off
            }
            if (confettiFlash <= 5) {
              p5.rect(0, 0, 4, confetti.size);
            }
          }
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
      size: 50,
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.notes.push({
            x: randomNumber(10, 390),
            y: -50,
            rot: randomNumber(0, 359),
            speed: p5.random(1,5),
          });
        }
      },
      update: function () {
        this.size += randomNumber(-5, 5);
      },
      draw: function () {
        if (this.notes.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.notes.length; i++) {
          p5.push();
          const notes = this.notes[i];
          p5.translate(notes.x, notes.y);
          p5.rotate(notes.rot);
          drawMusicNote(p5._renderer.drawingContext);
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

function drawFallingPoop(ctx) {
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
  ctx.beginPath();
  ctx.moveTo(3.378,11.244);
  ctx.lineTo(14.622,11.244);
  ctx.quadraticCurveTo(18,11.244,18,14.622);
  ctx.lineTo(18,14.620999999999999);
  ctx.quadraticCurveTo(18,17.999,14.622,17.999);
  ctx.lineTo(3.378,17.999);
  ctx.quadraticCurveTo(0,17.999,0,14.620999999999999);
  ctx.lineTo(0,14.622);
  ctx.quadraticCurveTo(0,11.244,3.378,11.244);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#995243";
  ctx.transform(1,0,-0.00017,1,2.104,5.87);
  ctx.beginPath();
  ctx.moveTo(3.592,0);
  ctx.lineTo(10.179,0);
  ctx.quadraticCurveTo(13.771,0,13.771,3.592);
  ctx.lineTo(13.771,3.592);
  ctx.quadraticCurveTo(13.771,7.184,10.179,7.184);
  ctx.lineTo(3.592,7.184);
  ctx.quadraticCurveTo(0,7.184,0,3.592);
  ctx.lineTo(0,3.592);
  ctx.quadraticCurveTo(0,0,3.592,0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#995243";
  ctx.beginPath();
  ctx.moveTo(9.21,2.183);
  ctx.bezierCurveTo(6.843,2.603,5.45,0,5.45,0);
  ctx.bezierCurveTo(4.062,2.411,4.166,5.546,6.356,7.264);
  ctx.bezierCurveTo(7.734,8.345,9.317,9.11,10.58,8.406);
  ctx.translate(10.29000831352916,5.243266874714561);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.176,1.4793617709217972,-0.002288060785636592,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10.29000831352916,-5.243266874714561);
  ctx.translate(10.29200425009582,5.230805811883339);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,3.174,0.0016364809184027914,-1.7625824314825702,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10.29200425009582,-5.230805811883339);
  ctx.bezierCurveTo(9.536000000000001,2.1310000000000007,9.377,2.1530000000000005,9.212000000000002,2.1830000000000007);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(6.381,6.8870000000000005);
  ctx.bezierCurveTo(7.603758436125377,6.8870000000000005,8.595,7.876002987623777,8.595,9.096);
  ctx.bezierCurveTo(8.595,10.315997012376222,7.603758436125377,11.305,6.381,11.305);
  ctx.bezierCurveTo(5.158241563874624,11.305,4.167,10.315997012376222,4.167,9.096);
  ctx.bezierCurveTo(4.167,7.876002987623777,5.158241563874624,6.8870000000000005,6.381,6.8870000000000005);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#311a12";
  ctx.beginPath();
  ctx.moveTo(6.394,7.565);
  ctx.bezierCurveTo(7.274341891230285,7.565,7.988,8.277314963019208,7.988,9.156);
  ctx.bezierCurveTo(7.988,10.034685036980793,7.274341891230285,10.747,6.394,10.747);
  ctx.bezierCurveTo(5.513658108769715,10.747,4.8,10.034685036980793,4.8,9.156);
  ctx.bezierCurveTo(4.8,8.277314963019208,5.513658108769715,7.565,6.394,7.565);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(11.59,6.886000000000001);
  ctx.bezierCurveTo(12.812758436125376,6.886000000000001,13.804,7.875002987623778,13.804,9.095);
  ctx.bezierCurveTo(13.804,10.314997012376224,12.812758436125376,11.304,11.59,11.304);
  ctx.bezierCurveTo(10.367241563874623,11.304,9.376,10.314997012376224,9.376,9.095);
  ctx.bezierCurveTo(9.376,7.875002987623778,10.367241563874623,6.886000000000001,11.59,6.886000000000001);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#311a12";
  ctx.beginPath();
  ctx.moveTo(11.577,7.565);
  ctx.bezierCurveTo(12.457341891230286,7.565,13.171,8.277314963019208,13.171,9.156);
  ctx.bezierCurveTo(13.171,10.034685036980793,12.457341891230286,10.747,11.577,10.747);
  ctx.bezierCurveTo(10.696658108769714,10.747,9.983,10.034685036980793,9.983,9.156);
  ctx.bezierCurveTo(9.983,8.277314963019208,10.696658108769714,7.565,11.577,7.565);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(11.455,12.627);
  ctx.lineTo(11.455,12.692);
  ctx.translate(9.175,12.692);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,2.28,0,3.141592653589793,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.175,-12.692);
  ctx.lineTo(6.8950000000000005,12.627);
  ctx.lineTo(11.455,12.627);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawMusicNote(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#143441";
  ctx.beginPath();
  ctx.moveTo(5.8,0);
  ctx.bezierCurveTo(5.2,0,4.7,0.45,4.7,1.0);
  ctx.lineTo(4.7,7.0);
  ctx.bezierCurveTo(4.2,6.7,3.6,6.6,3.0,6.6);
  ctx.bezierCurveTo(1.3,6.6,0,7.8,0,9.3);
  ctx.bezierCurveTo(0,10.7,1.3,12,3.0,12);
  ctx.bezierCurveTo(4.7,12,6.1,10.7,6.1,9.3);
  ctx.bezierCurveTo(6.1,9.2,6.1,9.2,6.1,9.2);
  ctx.lineTo(6.1,1.7);
  ctx.lineTo(14.5,1.7);
  ctx.lineTo(14.5,7.0);
  ctx.bezierCurveTo(14.1,6.7,13.5,6.6,12.9,6.6);
  ctx.bezierCurveTo(11.2,6.6,9.8,7.8,9.8,9.3);
  ctx.bezierCurveTo(9.8,10.7,11.2,12,12.9,12);
  ctx.bezierCurveTo(14.6,12,15.9,10.8,16,9.3);
  ctx.lineTo(16,9.3);
  ctx.lineTo(16,1.0);
  ctx.bezierCurveTo(16,0.45,15.4,0,14.8,0);
  ctx.lineTo(5.8,0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#7d8e9e";
  ctx.beginPath();
  ctx.moveTo(2.5,7.3);
  ctx.bezierCurveTo(3.1,7.3,3.6,7.8,3.6,8.3);
  ctx.bezierCurveTo(3.6,8.8,3.1,9.3,2.5,9.3);
  ctx.bezierCurveTo(1.9,9.3,1.4,8.8,1.4,8.3);
  ctx.bezierCurveTo(1.4,7.8,1.9,7.3,2.5,7.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#7d8e9e";
  ctx.beginPath();
  ctx.moveTo(12.7,7.3);
  ctx.bezierCurveTo(13.3,7.3,13.8,7.8,13.8,8.3);
  ctx.bezierCurveTo(13.8,8.8,13.3,9.3,12.7,9.3);
  ctx.bezierCurveTo(12.1,9.3,11.6,8.8,11.6,8.3);
  ctx.bezierCurveTo(11.6,7.8,12.1,7.3,12.7,7.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#7d8e9e";
  ctx.beginPath();
  ctx.moveTo(5.67,0.41);
  ctx.lineTo(14.89,0.41);
  ctx.quadraticCurveTo(15.0,0.41,15.0,0.58);
  ctx.lineTo(15.0,0.58);
  ctx.quadraticCurveTo(15.0,0.75,14.8,0.75);
  ctx.lineTo(5.6,0.75);
  ctx.quadraticCurveTo(5.5,0.75,5.5,0.58);
  ctx.lineTo(5.5,0.58);
  ctx.quadraticCurveTo(5.5,0.41,5.6,0.41);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawPineapple(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(10,0);
  ctx.lineTo(10,18);
  ctx.lineTo(0,18);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#30b1ad";
  ctx.beginPath();
  ctx.moveTo(6.118,2.025);
  ctx.lineTo(6.205,2.025);
  ctx.bezierCurveTo(7.043,1.6269999999999998,7.965,1.6749999999999998,7.965,1.6749999999999998);
  ctx.bezierCurveTo(7.965,1.6749999999999998,8.015,2.705,7.545,3.58);
  ctx.bezierCurveTo(8.532,3.535,9.36,3.8040000000000003,9.36,3.8040000000000003);
  ctx.bezierCurveTo(9.36,3.8040000000000003,8.921999999999999,5.834,7.438999999999999,6.692);
  ctx.bezierCurveTo(6.664999999999999,7.139,5.7589999999999995,7.179,5.0699999999999985,7.115);
  ctx.bezierCurveTo(4.379999999999999,7.179,3.4749999999999988,7.139,2.6999999999999984,6.692);
  ctx.bezierCurveTo(1.219,5.834,0.78,3.804,0.78,3.804);
  ctx.bezierCurveTo(0.78,3.804,1.476,3.577,2.3529999999999998,3.574);
  ctx.bezierCurveTo(1.8859999999999997,2.6999999999999997,1.9359999999999997,1.674,1.9359999999999997,1.674);
  ctx.bezierCurveTo(1.9359999999999997,1.674,2.8579999999999997,1.627,3.6959999999999997,2.025);
  ctx.lineTo(3.8289999999999997,2.025);
  ctx.bezierCurveTo(4.009,0.878,4.97,0,4.97,0);
  ctx.bezierCurveTo(4.97,0,5.935,0.878,6.117,2.025);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(5.0009999999999994,5.112);
  ctx.lineTo(5,5.112);
  ctx.quadraticCurveTo(9.991,5.112,9.991,10.103);
  ctx.lineTo(9.991,13.008000000000003);
  ctx.quadraticCurveTo(9.991,17.999000000000002,5,17.999000000000002);
  ctx.lineTo(5.0009999999999994,17.999000000000002);
  ctx.quadraticCurveTo(0.01,17.999000000000002,0.01,13.008000000000003);
  ctx.lineTo(0.01,10.103);
  ctx.quadraticCurveTo(0.01,5.112,5.0009999999999994,5.112);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ec7523";
  ctx.globalAlpha = 0.5;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-4.844,15.18);
  ctx.lineTo(6.953,3.297);
  ctx.lineTo(7.353000000000001,3.7);
  ctx.lineTo(-4.444,15.582);
  ctx.closePath();
  ctx.moveTo(-3.346,16.689);
  ctx.lineTo(8.451,4.806);
  ctx.lineTo(8.851,5.208);
  ctx.lineTo(-2.9459999999999997,17.091);
  ctx.closePath();
  ctx.moveTo(-1.846,18.198);
  ctx.lineTo(9.951,6.316);
  ctx.lineTo(10.351,6.718);
  ctx.lineTo(-1.4459999999999997,18.601);
  ctx.closePath();
  ctx.moveTo(-0.348,19.707);
  ctx.lineTo(11.45,7.824);
  ctx.lineTo(11.85,8.227);
  ctx.lineTo(0.052,20.109);
  ctx.closePath();
  ctx.moveTo(1.15,21.217);
  ctx.lineTo(12.947,9.334);
  ctx.lineTo(13.347,9.737);
  ctx.lineTo(1.55,21.619);
  ctx.closePath();
  ctx.moveTo(2.648,22.726);
  ctx.lineTo(14.445,10.843);
  ctx.lineTo(14.845,NaN);
  ctx.lineTo(17.893,NaN);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(3.046,3.298);
  ctx.lineTo(14.843,15.18);
  ctx.lineTo(14.443,15.583);
  ctx.lineTo(2.646,3.7);
  ctx.closePath();
  ctx.moveTo(1.548,4.807);
  ctx.lineTo(13.345,16.689);
  ctx.lineTo(12.945,17.092);
  ctx.lineTo(1.148,5.209);
  ctx.closePath();
  ctx.moveTo(0.05,6.317);
  ctx.lineTo(11.849,18.2);
  ctx.lineTo(11.449,18.602);
  ctx.lineTo(-0.349,6.72);
  ctx.closePath();
  ctx.moveTo(-1.448,7.826);
  ctx.lineTo(10.349,19.71);
  ctx.lineTo(9.949,20.112000000000002);
  ctx.lineTo(-1.848,8.23);
  ctx.closePath();
  ctx.moveTo(-2.947,9.335);
  ctx.lineTo(8.85,21.218);
  ctx.lineTo(8.45,21.62);
  ctx.lineTo(-3.347,9.737);
  ctx.closePath();
  ctx.moveTo(-4.445,10.844);
  ctx.lineTo(7.352,22.726);
  ctx.lineTo(6.952,23.128999999999998);
  ctx.lineTo(-4.845000000000001,11.245999999999999);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawPizza(ctx) {
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
  ctx.restore();
  ctx.save();
  ctx.save();
  ctx.fillStyle = "#ffa31a";
  ctx.beginPath();
  ctx.moveTo(17.4,3.168);
  ctx.lineTo(8.984,18.092);
  ctx.lineTo(0.6,3.219);
  ctx.translate(9.029231629626716,13.015827554576049);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.924,-2.281299643347812,-0.8662453736196343,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.029231629626716,-13.015827554576049);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#dc1c4b";
  ctx.beginPath();
  ctx.moveTo(17.4,6.262);
  ctx.lineTo(8.984,21.186);
  ctx.lineTo(0.6,6.312);
  ctx.translate(9.029231629626716,16.108827554576052);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.924,-2.281299643347812,-0.8662453736196343,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.029231629626716,-16.108827554576052);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffdf40";
  ctx.beginPath();
  ctx.moveTo(17.4,6.824);
  ctx.lineTo(8.984,21.748);
  ctx.lineTo(0.6,6.875);
  ctx.translate(9.029231629626716,16.671827554576048);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.924,-2.281299643347812,-0.8662453736196343,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.029231629626716,-16.671827554576048);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffdf40";
  ctx.beginPath();
  ctx.moveTo(17.4,6.824);
  ctx.lineTo(8.984,21.748);
  ctx.lineTo(0.6,6.875);
  ctx.translate(9.029231629626716,16.671827554576048);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,12.924,-2.281299643347812,-0.8662453736196343,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.029231629626716,-16.671827554576048);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.restore();
  ctx.save();
  ctx.save();
  ctx.fillStyle = "#e3482c";
  ctx.beginPath();
  ctx.moveTo(6.731,6.112);
  ctx.bezierCurveTo(7.7483085091883215,6.112,8.573,6.955495531318785,8.573,7.996);
  ctx.bezierCurveTo(8.573,9.036504468681215,7.7483085091883215,9.88,6.731,9.88);
  ctx.bezierCurveTo(5.713691490811678,9.88,4.888999999999999,9.036504468681215,4.888999999999999,7.996);
  ctx.bezierCurveTo(4.888999999999999,6.955495531318785,5.713691490811678,6.112,6.731,6.112);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(7.545,4.258);
  ctx.bezierCurveTo(7.853174890405583,4.258,8.103,4.513645407846616,8.103,4.829);
  ctx.bezierCurveTo(8.103,5.144354592153383,7.853174890405583,5.3999999999999995,7.545,5.3999999999999995);
  ctx.bezierCurveTo(7.236825109594417,5.3999999999999995,6.987,5.144354592153383,6.987,4.829);
  ctx.bezierCurveTo(6.987,4.513645407846616,7.236825109594417,4.258,7.545,4.258);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(3.179,6.571000000000001);
  ctx.bezierCurveTo(3.4871748904055826,6.571000000000001,3.737,6.826645407846617,3.737,7.142);
  ctx.bezierCurveTo(3.737,7.457354592153384,3.4871748904055826,7.713,3.179,7.713);
  ctx.bezierCurveTo(2.870825109594417,7.713,2.6209999999999996,7.457354592153384,2.6209999999999996,7.142);
  ctx.bezierCurveTo(2.6209999999999996,6.826645407846617,2.870825109594417,6.571000000000001,3.179,6.571000000000001);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(7.626,10.581);
  ctx.bezierCurveTo(7.9341748904055835,10.581,8.184000000000001,10.836645407846616,8.184000000000001,11.152);
  ctx.bezierCurveTo(8.184000000000001,11.467354592153383,7.9341748904055835,11.722999999999999,7.626,11.722999999999999);
  ctx.bezierCurveTo(7.317825109594417,11.722999999999999,7.0680000000000005,11.467354592153383,7.0680000000000005,11.152);
  ctx.bezierCurveTo(7.0680000000000005,10.836645407846616,7.317825109594417,10.581,7.626,10.581);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(10.515,14.053);
  ctx.bezierCurveTo(10.823174890405584,14.053,11.073,14.308645407846617,11.073,14.624);
  ctx.bezierCurveTo(11.073,14.939354592153384,10.823174890405584,15.195,10.515,15.195);
  ctx.bezierCurveTo(10.206825109594417,15.195,9.957,14.939354592153384,9.957,14.624);
  ctx.bezierCurveTo(9.957,14.308645407846617,10.206825109594417,14.053,10.515,14.053);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(12.96,8.432);
  ctx.bezierCurveTo(13.268174890405584,8.432,13.518,8.687645407846617,13.518,9.003);
  ctx.bezierCurveTo(13.518,9.318354592153383,13.268174890405584,9.574,12.96,9.574);
  ctx.bezierCurveTo(12.651825109594418,9.574,12.402000000000001,9.318354592153383,12.402000000000001,9.003);
  ctx.bezierCurveTo(12.402000000000001,8.687645407846617,12.651825109594418,8.432,12.96,8.432);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(14.657,5.4350000000000005);
  ctx.bezierCurveTo(14.965174890405583,5.4350000000000005,15.215,5.690645407846617,15.215,6.006);
  ctx.bezierCurveTo(15.215,6.321354592153384,14.965174890405583,6.577,14.657,6.577);
  ctx.bezierCurveTo(14.348825109594417,6.577,14.099,6.321354592153384,14.099,6.006);
  ctx.bezierCurveTo(14.099,5.690645407846617,14.348825109594417,5.4350000000000005,14.657,5.4350000000000005);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e3482c";
  ctx.beginPath();
  ctx.moveTo(11.34,4.256);
  ctx.bezierCurveTo(12.386579600929354,4.256,13.235,5.123672154827922,13.235,6.194);
  ctx.bezierCurveTo(13.235,7.264327845172078,12.386579600929354,8.132,11.34,8.132);
  ctx.bezierCurveTo(10.293420399070646,8.132,9.445,7.264327845172078,9.445,6.194);
  ctx.bezierCurveTo(9.445,5.123672154827922,10.293420399070646,4.256,11.34,4.256);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e3482c";
  ctx.beginPath();
  ctx.moveTo(7.55,12.43);
  ctx.bezierCurveTo(8.46900182371844,12.43,9.214,13.192011355787988,9.214,14.132);
  ctx.bezierCurveTo(9.214,15.071988644212011,8.46900182371844,15.834,7.55,15.834);
  ctx.bezierCurveTo(6.630998176281559,15.834,5.886,15.071988644212011,5.886,14.132);
  ctx.bezierCurveTo(5.886,13.192011355787988,6.630998176281559,12.43,7.55,12.43);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e3482c";
  ctx.beginPath();
  ctx.moveTo(10.664,9.39);
  ctx.bezierCurveTo(11.58300182371844,9.39,12.328,10.15201135578799,12.328,11.092);
  ctx.bezierCurveTo(12.328,12.031988644212012,11.58300182371844,12.794,10.664,12.794);
  ctx.bezierCurveTo(9.744998176281559,12.794,9,12.031988644212012,9,11.092);
  ctx.bezierCurveTo(9,10.15201135578799,9.744998176281559,9.39,10.664,9.39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffa319";
  ctx.beginPath();
  ctx.moveTo(1.753,3.954);
  ctx.bezierCurveTo(2.1029999999999998,4.55,2.987,4.024,3.178,3.6420000000000003);
  ctx.bezierCurveTo(3.368,2.7950000000000004,3.04,2.4460000000000006,2.443,3.2920000000000003);
  ctx.bezierCurveTo(1.847,2.9920000000000004,1.241,3.2750000000000004,1.0030000000000001,3.575);
  ctx.bezierCurveTo(0.7660000000000001,4.369,2.146,4.325,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
