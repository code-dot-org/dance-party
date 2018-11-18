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
          drawTacos(p5._renderer.drawingContext);
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

function drawTacos(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(18,0);
  ctx.lineTo(18,11);
  ctx.lineTo(0,11);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0)';
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 4;
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(9,1.709);
  ctx.bezierCurveTo(4.47,1.709,0.722,5.164,0.093,9.661);
  ctx.bezierCurveTo(-0.01,10.396,0.602,11,1.343,11);
  ctx.lineTo(16.656,11);
  ctx.bezierCurveTo(17.398,11,18.009999999999998,10.395,17.907,9.66);
  ctx.bezierCurveTo(17.278,5.164,13.53,1.709,9,1.709);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#eaae37";
  ctx.beginPath();
  ctx.moveTo(9,1.861);
  ctx.bezierCurveTo(2.05,2.077,-0.595,9.617,0.577,10.347);
  ctx.bezierCurveTo(1.748,11.077,2.008,3.0519999999999996,9.632,3.0519999999999996);
  ctx.bezierCurveTo(17.256,3.0519999999999996,16.345,10.768999999999998,17.349,9.617);
  ctx.bezierCurveTo(18.354,8.465,15.174,1.67,9,1.861);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(1.218,9.111999999999998);
  ctx.bezierCurveTo(1.717817698596868,9.111999999999998,2.123,9.429877827620135,2.123,9.822);
  ctx.bezierCurveTo(2.123,10.214122172379863,1.717817698596868,10.532,1.218,10.532);
  ctx.bezierCurveTo(0.7181823014031318,10.532,0.31299999999999994,10.214122172379863,0.31299999999999994,9.822);
  ctx.bezierCurveTo(0.31299999999999994,9.429877827620135,0.7181823014031318,9.111999999999998,1.218,9.111999999999998);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#529d1b";
  ctx.beginPath();
  ctx.moveTo(6.22,1.699);
  ctx.translate(6.839829480781666,2.21421589140275);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.806,-2.448101713555534,-0.9449054575671616,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-6.839829480781666,-2.21421589140275);
  ctx.lineTo(7.664999999999999,1.818);
  ctx.translate(8.136402647459974,1.1691675532406487);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.802,2.1991131238151924,1.27784950457748,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-8.136402647459974,-1.1691675532406487);
  ctx.lineTo(9.030999999999999,1.737);
  ctx.translate(9.218178572722698,2.3521529744002647);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.643,-1.8661748272664898,-0.02356823842572564,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.218178572722698,-2.3521529744002647);
  ctx.bezierCurveTo(9.867999999999999,2.637,10.415,2.951,NaN,2.556);
  ctx.bezierCurveTo(NaN,NaN,NaN,2.6510000000000002,NaN,3.548);
  ctx.lineTo(10.85,4);
  ctx.translate(11.231321501763995,4.414201535840285);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.563,-2.3148866600929257,-3.8256837175160805,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-11.231321501763995,-4.414201535840285);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.565,NaN,NaN,1.325);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(-4.850467289719626,1);
  ctx.arc(0,0,0.107,NaN,NaN,0.18600000000000005);
  ctx.scale(-0.20616570327552985,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.009948376736367677);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,1.025);
  ctx.scale(1,0);
  ctx.rotate(-0.009948376736367677);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.811,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(10.201,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.806,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(9.025,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.801,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(7.862,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.798,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(6.602,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.56,NaN,NaN,1.233);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1.875,1);
  ctx.arc(0,0,-0.008,NaN,NaN,0.42000000000000004);
  ctx.scale(0.5333333333333333,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(-0.017976891295541596);
  ctx.scale(1,0.03);
  ctx.arc(0,0,1,NaN,NaN,0.798);
  ctx.scale(1,33.333333333333336);
  ctx.rotate(0.017976891295541596);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.654,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.654,NaN,NaN,0.33599999999999997);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,0.0391304347826087);
  ctx.arc(0,0,0.69,NaN,NaN,0.99);
  ctx.scale(1,25.555555555555554);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.004939281783143952);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,NaN);
  ctx.scale(NaN,1);
  ctx.rotate(-0.004939281783143952);
  ctx.translate(NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#529d1b";
  ctx.beginPath();
  ctx.moveTo(10.35,2.07);
  ctx.translate(10.92863485857401,2.631086179158812);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.806,-2.3715906197959677,-1.020681010683408,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10.92863485857401,-2.631086179158812);
  ctx.lineTo(11.894,2.278);
  ctx.translate(12.31370943301371,1.596939068923118);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.8,2.1230847450252117,1.4715201245954015,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-12.31370943301371,-1.596939068923118);
  ctx.lineTo(13.093,2.3230000000000004);
  ctx.translate(13.1571382559205,3.014029872094888);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.694,-1.6633466305944156,0.15329438553741093,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-13.1571382559205,-3.014029872094888);
  ctx.bezierCurveTo(13.806,3.3690000000000007,14.343,3.7680000000000007,NaN,3.7990000000000004);
  ctx.bezierCurveTo(NaN,3.7990000000000004,NaN,4.799,NaN,4.95);
  ctx.lineTo(NaN,5.08);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.815,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,5.815);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.812,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,6.283);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.806,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,6.665);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.8,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,6.118);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.798,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,5.654000000000001);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.675,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.686,NaN,NaN,0.891);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,1.9609999999999999);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.014172073526193957);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.014172073526193957);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,-0.5142231947483588);
  ctx.arc(0,0,0.457,NaN,NaN,1.46);
  ctx.scale(1,-1.9446808510638303);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#529d1b";
  ctx.beginPath();
  ctx.moveTo(13.45,3.905);
  ctx.translate(14.109346576367745,4.368571021777823);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.806,-2.5288049693327195,-0.8652453266782336,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-14.109346576367745,-4.368571021777823);
  ctx.lineTo(14.702,3.815);
  ctx.translate(15.223355370580194,3.208214553926028);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.8,2.2806123160132827,1.4811203960992325,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-15.223355370580194,-3.208214553926028);
  ctx.lineTo(15.388,3.995);
  ctx.translate(15.457719440817216,4.772881867362992);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.781,-1.6601847697016523,0.08347479958485349,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-15.457719440817216,-4.772881867362992);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,0.777);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,-0.20100000000000007);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.014224433403753785);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.014224433403753785);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(-0.6418181818181817,1);
  ctx.arc(0,0,0.55,NaN,NaN,0.973);
  ctx.scale(-1.558073654390935,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.812,NaN,NaN,2.011);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(3.655172413793103,1);
  ctx.arc(0,0,-0.029,NaN,NaN,0.19399999999999995);
  ctx.scale(0.27358490566037735,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0013439035240356337);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,1.096);
  ctx.scale(1,0);
  ctx.rotate(-0.0013439035240356337);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.8,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.798,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.776,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.785,NaN,NaN,0.926);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,2.028);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.014189526818713898);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.014189526818713898);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,-0.6252354048964218);
  ctx.arc(0,0,0.531,NaN,NaN,1.075);
  ctx.scale(1,-1.599397590361446);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,0.852342640795078);
  ctx.arc(0,0,4.226,NaN,NaN,0.621);
  ctx.scale(1,1.173237090505275);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0.68);
  ctx.arc(0,0,1,NaN,NaN,0.901);
  ctx.scale(1,1.4705882352941175);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.006335545184739416);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.006335545184739416);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,0.4879725085910653);
  ctx.arc(0,0,0.582,NaN,NaN,0.88);
  ctx.scale(1,2.0492957746478875);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.39,NaN,NaN,0.565);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,0.45599999999999996);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.007661995416255106);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.007661995416255106);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.007661995416255106);
  ctx.scale(0.37979094076655057,1);
  ctx.arc(0,0,0.574,NaN,NaN,1);
  ctx.scale(2.6330275229357794,1);
  ctx.rotate(-0.007661995416255106);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(-0.0003839724354387525);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,NaN);
  ctx.scale(NaN,1);
  ctx.rotate(0.0003839724354387525);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,0.376);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.003246312408709453);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,0.394);
  ctx.scale(NaN,1);
  ctx.rotate(-0.003246312408709453);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.414,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.372,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.372,NaN,NaN,1.5030000000000001);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(-0.23287671232876717,1);
  ctx.arc(0,0,0.073,NaN,NaN,0.636);
  ctx.scale(-4.2941176470588225,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.002548180707911721);
  ctx.scale(1,-0.637);
  ctx.arc(0,0,1,NaN,NaN,1);
  ctx.scale(1,-1.5698587127158556);
  ctx.rotate(-0.002548180707911721);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.006352998477259359);
  ctx.scale(-Infinity,1);
  ctx.arc(0,0,0,NaN,NaN,1);
  ctx.scale(0,1);
  ctx.rotate(-0.006352998477259359);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(4.363013698630137,1);
  ctx.arc(0,0,-0.146,NaN,NaN,1.073);
  ctx.scale(0.2291993720565149,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.372,NaN,NaN,1.5030000000000001);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,1.416);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.007225663103256524);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.007225663103256524);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.007225663103256524);
  ctx.scale(1,1.4352941176470586);
  ctx.arc(0,0,-0.34,NaN,NaN,1);
  ctx.scale(1,0.6967213114754099);
  ctx.rotate(-0.007225663103256524);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0008726646259971648);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,NaN);
  ctx.scale(NaN,1);
  ctx.rotate(-0.0008726646259971648);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,1.624);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.007661995416255106);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.007661995416255106);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.007661995416255106);
  ctx.scale(1,-7.677083333333333);
  ctx.arc(0,0,0.096,NaN,NaN,1);
  ctx.scale(1,-0.13025780189959296);
  ctx.rotate(-0.007661995416255106);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(-0.0008726646259971648);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,NaN);
  ctx.scale(NaN,1);
  ctx.rotate(0.0008726646259971648);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,1.5430000000000001);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.00757472895365539);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,NaN);
  ctx.scale(NaN,1);
  ctx.rotate(-0.00757472895365539);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.363,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.restore();
  ctx.save();
  ctx.save();
  ctx.fillStyle = "#88550c";
  ctx.beginPath();
  ctx.moveTo(1.85,7.742);
  ctx.translate(2.3245,7.98477304216078);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.533,-2.668676695973641,-0.47291595761615257,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.3245,-7.98477304216078);
  ctx.translate(3.2738261073375425,7.497672007762769);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.534,2.666362558876918,1.3801798738370095,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.2738261073375425,-7.497672007762769);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.536,NaN,NaN,0.403);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(-0.40476190476190477,1);
  ctx.arc(0,0,0.042,NaN,NaN,0.43999999999999995);
  ctx.scale(-2.4705882352941178,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.011047934165124106);
  ctx.scale(0,1);
  ctx.arc(0,0,0.143,NaN,NaN,0.984);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.011047934165124106);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.551,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.548,NaN,NaN,1.4);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(-0.05555555555555556,1);
  ctx.arc(0,0,0.036,NaN,NaN,0.472);
  ctx.scale(-18,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.006981317007977318);
  ctx.scale(1,-0.848);
  ctx.arc(0,0,1,NaN,NaN,1);
  ctx.scale(1,-1.179245283018868);
  ctx.rotate(-0.006981317007977318);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.009215338450530061);
  ctx.scale(-Infinity,1);
  ctx.arc(0,0,0,NaN,NaN,1);
  ctx.scale(0,1);
  ctx.rotate(-0.009215338450530061);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(2.1199999999999997,1);
  ctx.arc(0,0,-0.4,NaN,NaN,1.036);
  ctx.scale(0.47169811320754723,1);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.548,NaN,NaN,1.4);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.017453292519943295);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,1.94);
  ctx.scale(NaN,1);
  ctx.rotate(-0.017453292519943295);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.009773843811168246);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.009773843811168246);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,-4.426573426573427);
  ctx.arc(0,0,0.143,NaN,NaN,1.042);
  ctx.scale(1,-0.2259083728278041);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.536,NaN,NaN,0.403);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,1.28);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(1.781,7.04);
  ctx.translate(2.175,7.286959510851475);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.465,-2.581699436812668,-0.5598932167771253,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.175,-7.286959510851475);
  ctx.bezierCurveTo(2.63,7.14,2.741,7.242,2.659,7.5280000000000005);
  ctx.bezierCurveTo(3.415,NaN,2.646,7.5440000000000005,NaN,8.008000000000001);
  ctx.bezierCurveTo(NaN,8.008000000000001,NaN,8.008000000000001,NaN,8.331000000000001);
  ctx.lineTo(NaN,8.359000000000002);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.462,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.462,NaN,NaN,1.342);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.462,NaN,NaN,1.633);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(NaN);
  ctx.scale(1,-14);
  ctx.arc(0,0,0.002,NaN,NaN,0.52);
  ctx.scale(1,-0.07142857142857142);
  ctx.rotate(NaN);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(-0.0056374134839416844);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,1.013);
  ctx.scale(1,0);
  ctx.rotate(0.0056374134839416844);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.478,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.467,NaN,NaN,0.729);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(5.95,5.538);
  ctx.translate(5.9575449394604405,6.11395058285285);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,-1.5838955546371967,0.04350229111806714,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.9575449394604405,-6.11395058285285);
  ctx.lineTo(6.527,6.351);
  ctx.bezierCurveTo(6.521,6.551,6.915,6.851,NaN,6.52);
  ctx.bezierCurveTo(NaN,NaN,NaN,6.71,NaN,7.359999999999999);
  ctx.lineTo(NaN,7.528999999999999);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.6,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,8.282999999999998);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.589,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,9.100999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,9.700999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.563,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,10.015999999999998);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.552,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,10.233999999999998);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.556,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,9.924999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.562,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,9.676999999999996);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,8.862999999999996);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.591,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,8.242999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.597,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,7.234999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.6,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,6.479999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.589,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,5.661999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,5.061999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.563,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.746999999999996);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.552,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.528999999999996);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.556,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.8379999999999965);
  ctx.bezierCurveTo(NaN,5.002999999999997,NaN,5.092999999999996,NaN,5.043999999999997);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(2.314,6.57);
  ctx.translate(2.548,6.824872517153184);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,-2.313525189777379,-0.8280674638124146,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.548,-6.824872517153184);
  ctx.lineTo(2.944,6.719);
  ctx.translate(2.708895683411177,6.972854210761419);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,-0.8237259783206259,0.2516230948859888,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.708895683411177,-6.972854210761419);
  ctx.lineTo(2.954,7.415);
  ctx.translate(2.618858231496681,7.3290000290438);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,0.25118797625322503,1.5703865912247048,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.618858231496681,-7.3290000290438);
  ctx.lineTo(2.4770000000000003,7.675);
  ctx.translate(2.478142244864361,7.329001885443476);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,1.5740976185265747,2.8904102164800918,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.478142244864361,-7.329001885443476);
  ctx.lineTo(2.051,7.059);
  ctx.translate(2.3862954052061367,6.973600988017117);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,2.892197414481618,3.968500468588151,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-2.3862954052061367,-6.973600988017117);
  ctx.lineTo(2.314,6.569);
  ctx.closePath();
  ctx.moveTo(3.318,4.589);
  ctx.translate(3.551,4.844787020780962);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,-2.3096086910244207,-0.8319839625653727,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.551,-4.844787020780962);
  ctx.lineTo(3.8920000000000003,4.688000000000001);
  ctx.translate(3.658929497640269,4.943722781405534);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,-0.8317082987990733,0.25201531897583374,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.658929497640269,-4.943722781405534);
  ctx.lineTo(3.9240000000000004,5.299);
  ctx.translate(3.5891161448682234,5.212001128903423);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,0.2541696514760511,1.5682418294161748,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.5891161448682234,-5.212001128903423);
  ctx.lineTo(3.5120000000000005,5.558000000000001);
  ctx.translate(3.513142244864361,5.212001885443477);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,1.5740976185265747,2.8904102164800918,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.513142244864361,-5.212001885443477);
  ctx.lineTo(3.1080000000000005,5.030000000000001);
  ctx.translate(3.443070502359732,4.943722781405536);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,2.8895773346139597,3.9733009523888665,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-3.443070502359732,-4.943722781405536);
  ctx.lineTo(3.3180000000000005,4.588000000000002);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(7.326,3.967);
  ctx.translate(7.295128625739146,4.542172111851093);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,-1.5171744981408304,-0.021133711766809116,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-7.295128625739146,-4.542172111851093);
  ctx.lineTo(7.888,5.008);
  ctx.bezierCurveTo(7.893,5.148,8.161,5.384,NaN,5.324);
  ctx.bezierCurveTo(NaN,NaN,NaN,5.923,NaN,5.324);
  ctx.bezierCurveTo(NaN,5.324,NaN,NaN,NaN,5.675);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.595,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,6.529);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,7.109999999999999);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,7.590999999999999);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,7.265);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,7.092);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,6.051);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.595,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,5.325);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.599,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.178);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.595,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,3.324);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,2.7430000000000003);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,2.262);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,2.587);
  ctx.bezierCurveTo(NaN,2.6830000000000003,NaN,2.7430000000000003,NaN,3.0500000000000003);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(7.375,2.492);
  ctx.translate(7.393081703296596,3.067716121023108);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,-1.6021933309222558,0.06129510900279178,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-7.393081703296596,-3.067716121023108);
  ctx.lineTo(7.964,3.186);
  ctx.translate(8.559334258748224,3.2141623926665);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.596,-3.0943227151716948,-3.863478587724819,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-8.559334258748224,-3.2141623926665);
  ctx.lineTo(8.18,3.685);
  ctx.bezierCurveTo(8.379999999999999,3.911,8.753,3.68,8.975999999999999,NaN);
  ctx.bezierCurveTo(8.765999999999998,NaN,NaN,NaN,9.568999999999999,NaN);
  ctx.bezierCurveTo(9.568999999999999,NaN,9.418999999999999,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.56,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.556,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.596,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.599,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.593,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.56,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(11.592,2.244);
  ctx.bezierCurveTo(11.869,2.2670000000000003,11.842,2.7800000000000002,NaN,2.2870000000000004);
  ctx.bezierCurveTo(NaN,NaN,NaN,2.4190000000000005,NaN,2.6390000000000002);
  ctx.lineTo(NaN,3.0580000000000003);
  ctx.bezierCurveTo(NaN,3.281,NaN,3.853,NaN,2.7710000000000004);
  ctx.bezierCurveTo(NaN,NaN,NaN,3.3670000000000004,NaN,2.7710000000000004);
  ctx.bezierCurveTo(NaN,2.6210000000000004,NaN,NaN,NaN,3.2090000000000005);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,3.7950000000000004);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.557,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.246);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,3.853);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,3.6510000000000002);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,2.5490000000000004);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.594,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,1.7790000000000006);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.599,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,0.6630000000000005);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.596,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,-0.17599999999999955);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,-0.7619999999999996);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.557,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,-1.2119999999999995);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,-0.8189999999999996);
  ctx.bezierCurveTo(NaN,-0.7289999999999996,NaN,-0.6639999999999996,NaN,-0.2699999999999996);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#88540c";
  ctx.beginPath();
  ctx.moveTo(14.455,3.358);
  ctx.bezierCurveTo(14.732,3.3810000000000002,14.705,3.8930000000000002,NaN,3.402);
  ctx.bezierCurveTo(NaN,NaN,NaN,3.5330000000000004,NaN,3.754);
  ctx.lineTo(NaN,4.172);
  ctx.bezierCurveTo(NaN,4.396,NaN,4.967,NaN,3.8859999999999997);
  ctx.bezierCurveTo(NaN,NaN,NaN,4.481999999999999,NaN,3.8859999999999997);
  ctx.bezierCurveTo(NaN,3.7359999999999998,NaN,NaN,NaN,4.324999999999999);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.911);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.557,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,5.361);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.968);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.558,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,4.766);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,3.6639999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.595,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,2.8939999999999997);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.599,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,1.7779999999999998);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.596,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,0.9389999999999996);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.576,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,0.35399999999999965);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.557,NaN,NaN,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,-0.09700000000000034);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.554,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.lineTo(NaN,0.2959999999999997);
  ctx.bezierCurveTo(NaN,0.3859999999999997,NaN,0.45199999999999974,NaN,0.8459999999999998);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ef4d50";
  ctx.beginPath();
  ctx.moveTo(5.402,3.11);
  ctx.translate(5.6345,3.366241585227691);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,-2.3076556757623634,-0.8339369778274295,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.6345,-3.366241585227691);
  ctx.lineTo(6.312,3.5149999999999997);
  ctx.translate(6.078331472148387,3.7701764469767136);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,-0.8293672296193563,0.2566330330743748,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-6.078331472148387,-3.7701764469767136);
  ctx.lineTo(6.216,4.619999999999999);
  ctx.translate(5.881116433056571,4.533000019590545);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,0.25417296400765854,1.5711328385254388,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.881116433056571,-4.533000019590545);
  ctx.lineTo(5.388,4.879);
  ctx.translate(5.388883855131778,4.533001128903422);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,1.5733508241736194,2.887423002113742,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.388883855131778,-4.533001128903422);
  ctx.lineTo(4.856,3.857999999999999);
  ctx.translate(5.190861077485682,3.7709134982610477);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.346,2.8871613184858216,3.9741195998174295,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-5.190861077485682,-3.7709134982610477);
  ctx.lineTo(5.402,3.1109999999999993);
  ctx.closePath();
  ctx.moveTo(8.77,2.001);
  ctx.translate(8.924499999999998,2.1713811902763918);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,-2.307350299763863,-0.8342423538259305,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-8.924499999999998,-2.1713811902763918);
  ctx.lineTo(9.262999999999998,2.166);
  ctx.translate(9.108790821490599,2.336644452776691);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,-0.8359479230464634,0.26102151207590263,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.108790821490599,-2.336644452776691);
  ctx.lineTo(9.242999999999999,2.7319999999999998);
  ctx.translate(9.02043304986903,2.6740004076790327);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,0.25492428421560887,1.57267915342487,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-9.02043304986903,-2.6740004076790327);
  ctx.lineTo(8.829999999999998,2.904);
  ctx.translate(8.829566950130967,2.6740004076790327);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,1.5689135001649235,2.886668369374185,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-8.829566950130967,-2.6740004076790327);
  ctx.lineTo(8.517999999999997,2.396);
  ctx.translate(8.740401862927813,2.3373705588783444);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,2.8838373917346423,3.982261504400685,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-8.740401862927813,-2.3373705588783444);
  ctx.lineTo(8.770999999999997,2.001);
  ctx.closePath();
  ctx.moveTo(13.768,3.571);
  ctx.translate(13.922,3.7418332520325013);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,-2.3044195935561205,-0.8371730600336729,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-13.922,-3.7418332520325013);
  ctx.lineTo(14.26,3.737);
  ctx.translate(14.105790821490602,3.9076444527766916);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,-0.8359479230464634,0.26102151207590263,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-14.105790821490602,-3.9076444527766916);
  ctx.lineTo(14.24,4.303);
  ctx.translate(14.017695874492624,4.244001052700908);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,0.25941706134520004,1.5738218726831161,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-14.017695874492624,-4.244001052700908);
  ctx.lineTo(13.827,4.474);
  ctx.translate(13.826304125507374,4.244001052700908);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,1.5677707809066772,2.882175592244593,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-13.826304125507374,-4.244001052700908);
  ctx.lineTo(13.514999999999999,3.9659999999999997);
  ctx.translate(13.73759103902872,3.9080929249217853);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.23,2.887084029628174,3.986982951838855,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-13.73759103902872,-3.9080929249217853);
  ctx.lineTo(13.767999999999999,3.5709999999999997);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#bd812e";
  ctx.beginPath();
  ctx.moveTo(2.071,7.638);
  ctx.bezierCurveTo(2.2057574789587138,7.638,2.3150000000000004,7.742765368539594,2.3150000000000004,7.872);
  ctx.bezierCurveTo(2.3150000000000004,8.001234631460406,2.2057574789587138,8.106,2.071,8.106);
  ctx.bezierCurveTo(1.9362425210412866,8.106,1.8270000000000002,8.001234631460406,1.8270000000000002,7.872);
  ctx.bezierCurveTo(1.8270000000000002,7.742765368539594,1.9362425210412866,7.638,2.071,7.638);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#bd812e";
  ctx.beginPath();
  ctx.moveTo(1.148,9.328);
  ctx.bezierCurveTo(1.2247675802264801,9.328,1.287,9.388441558772842,1.287,9.463);
  ctx.bezierCurveTo(1.287,9.537558441227157,1.2247675802264801,9.597999999999999,1.148,9.597999999999999);
  ctx.bezierCurveTo(1.0712324197735197,9.597999999999999,1.009,9.537558441227157,1.009,9.463);
  ctx.bezierCurveTo(1.009,9.388441558772842,1.0712324197735197,9.328,1.148,9.328);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "#fff79c";
  ctx.lineWidth = 0.23399999737739563;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(4.023,5.136);
  ctx.bezierCurveTo(3.9819999999999998,4.855,3.7949999999999995,4.851,3.9269999999999996,4.659);
  ctx.bezierCurveTo(4.069,4.455,4.3149999999999995,5.1899999999999995,3.8369999999999997,4.834);
  ctx.bezierCurveTo(3.6439999999999997,4.574,3.4099999999999997,4.771999999999999,3.162,4.954);
  ctx.bezierCurveTo(3.011,5.443,3.651,NaN,9.394,7.882);
  ctx.bezierCurveTo(9.604000000000001,7.637,9.432,7.51,9.726,7.449);
  ctx.bezierCurveTo(10.040000000000001,7.3839999999999995,10.031,8.029,10.063,7.414);
  ctx.bezierCurveTo(10.197000000000001,6.91,10.603000000000002,6.8469999999999995,10.311,7.377);
  ctx.bezierCurveTo(10.715,7.781,NaN,18.436,13.001,NaN);
  ctx.bezierCurveTo(13.302999999999999,NaN,13.216999999999999,NaN,13.501,NaN);
  ctx.bezierCurveTo(13.802999999999999,NaN,13.860999999999999,NaN,13.865,NaN);
  ctx.bezierCurveTo(14.61,NaN,14.096,NaN,14.027000000000001,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#ffd687";
  ctx.beginPath();
  ctx.moveTo(9.594,2.427);
  ctx.bezierCurveTo(5.5009999999999994,2.427,2.1239999999999997,6.173,1.548,9.976);
  ctx.bezierCurveTo(1.476,10.452000000000002,1.445,10.556000000000001,0.9660000000000001,10.504000000000001);
  ctx.bezierCurveTo(0.8430000000000001,10.677000000000001,12.221,10.563,16.083000000000002,10.519000000000002);
  ctx.bezierCurveTo(16.075000000000003,11.793000000000003,15.497000000000002,11.688000000000002,14.800000000000002,9.935000000000002);
  ctx.bezierCurveTo(10.942000000000002,6.145000000000002,7.990000000000003,2.277000000000002,7.990000000000003,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(9.861,2.61);
  ctx.bezierCurveTo(5.56,2.61,2.046,6.87,1.717,11);
  ctx.lineTo(16.36,11);
  ctx.bezierCurveTo(17.070999999999998,11,17.658,10.42,17.557,9.716);
  ctx.bezierCurveTo(16.983999999999998,5.691999999999999,13.755999999999998,2.6099999999999994,9.86,2.6099999999999994);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(1.313,10.551);
  ctx.bezierCurveTo(1.585,10.551,1.7489999999999999,10.524000000000001,1.81,10.255);
  ctx.bezierCurveTo(1.842,10.111,1.8,10.632000000000001,1.8,10.632000000000001);
  ctx.bezierCurveTo(1.8,10.632000000000001,1.165,10.552000000000001,1.3130000000000002,10.552000000000001);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#e9ac22";
  ctx.beginPath();
  ctx.moveTo(10.767,3.812);
  ctx.translate(10.761039063972293,3.4850543359491155);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,1.5525661548807426,-0.01545730038298676,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10.761039063972293,-3.4850543359491155);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1.321);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,0.6679999999999999);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005602506898901798);
  ctx.scale(1,0.7826086956521738);
  ctx.arc(0,0,0.184,NaN,NaN,NaN);
  ctx.scale(1,1.277777777777778);
  ctx.rotate(-0.005602506898901798);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.327,NaN,NaN,1.321);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0025132741228718345);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,0.679);
  ctx.scale(1,0);
  ctx.rotate(-0.0025132741228718345);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0025830872929516074);
  ctx.scale(0,1);
  ctx.arc(0,0,0.321,NaN,NaN,NaN);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.0025830872929516074);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(1,-1.0375);
  ctx.arc(0,0,0.32,NaN,NaN,1);
  ctx.scale(1,-0.9638554216867469);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(-1.0152905198776758,1);
  ctx.arc(0,0,0.327,NaN,NaN,1);
  ctx.scale(-0.9849397590361446,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.327,NaN,NaN,1.322);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0025132741228718345);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,0.6779999999999999);
  ctx.scale(1,0);
  ctx.rotate(-0.0025132741228718345);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.002617993877991494);
  ctx.scale(0,1);
  ctx.arc(0,0,0.321,NaN,NaN,NaN);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.002617993877991494);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(-0.966867469879518,1);
  ctx.arc(0,0,0.332,NaN,NaN,1);
  ctx.scale(-1.0342679127725858,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,0.856);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(-1.8757062146892658,1);
  ctx.arc(0,0,0.177,NaN,NaN,0.851);
  ctx.scale(-0.5331325301204819,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.moveTo(13.544,8.479);
  ctx.translate(13.539038806263767,8.1520376374004);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,1.5556238983913855,-0.015406228403770372,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-13.539038806263767,-8.1520376374004);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1.322);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,0.6679999999999999);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005585053606381855);
  ctx.scale(1,0.7814207650273224);
  ctx.arc(0,0,0.183,NaN,NaN,NaN);
  ctx.scale(1,1.2797202797202798);
  ctx.rotate(-0.005585053606381855);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.327,NaN,NaN,1.32);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.002495820830351891);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,0.6799999999999999);
  ctx.scale(1,0);
  ctx.rotate(-0.002495820830351891);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0026005405854715507);
  ctx.scale(0,1);
  ctx.arc(0,0,0.322,NaN,NaN,NaN);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.0026005405854715507);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(1,-1.0342679127725858);
  ctx.arc(0,0,0.321,NaN,NaN,1);
  ctx.scale(1,-0.966867469879518);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(-1.0152905198776758,1);
  ctx.arc(0,0,0.327,NaN,NaN,1);
  ctx.scale(-0.9849397590361446,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#febe40";
  ctx.beginPath();
  ctx.moveTo(10.767,4.08);
  ctx.translate(10.761025138124104,3.7530545901445262);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,1.552523561094891,-0.012399675983454372,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-10.761025138124104,-3.7530545901445262);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1.321);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,0.6679999999999999);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005602506898901798);
  ctx.scale(1,0.7868852459016393);
  ctx.arc(0,0,0.183,NaN,NaN,NaN);
  ctx.scale(1,1.2708333333333333);
  ctx.rotate(-0.005602506898901798);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.327,NaN,NaN,1.321);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0025132741228718345);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,0.679);
  ctx.scale(1,0);
  ctx.rotate(-0.0025132741228718345);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0026005405854715507);
  ctx.scale(0,1);
  ctx.arc(0,0,0.321,NaN,NaN,NaN);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.0026005405854715507);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(1,-1.034375);
  ctx.arc(0,0,0.32,NaN,NaN,1);
  ctx.scale(1,-0.9667673716012084);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(-1.0152905198776758,1);
  ctx.arc(0,0,0.327,NaN,NaN,1);
  ctx.scale(-0.9849397590361446,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.327,NaN,NaN,1.322);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0025132741228718345);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,0.6779999999999999);
  ctx.scale(1,0);
  ctx.rotate(-0.0025132741228718345);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0026005405854715507);
  ctx.scale(0,1);
  ctx.arc(0,0,0.321,NaN,NaN,NaN);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.0026005405854715507);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(-0.966867469879518,1);
  ctx.arc(0,0,0.332,NaN,NaN,1);
  ctx.scale(-1.0342679127725858,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,0.856);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(-1.8700564971751414,1);
  ctx.arc(0,0,0.177,NaN,NaN,0.852);
  ctx.scale(-0.5347432024169184,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.moveTo(13.544,8.748);
  ctx.translate(13.539038806263767,8.421037637400401);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,1.5556238983913855,-0.015406228403770372,1);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(-13.539038806263767,-8.421037637400401);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1.322);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(NaN,1);
  ctx.arc(0,0,0,NaN,NaN,0.6679999999999999);
  ctx.scale(NaN,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005585053606381855);
  ctx.scale(1,0.7814207650273224);
  ctx.arc(0,0,0.183,NaN,NaN,NaN);
  ctx.scale(1,1.2797202797202798);
  ctx.rotate(-0.005585053606381855);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,1);
  ctx.arc(0,0,0.327,NaN,NaN,0);
  ctx.scale(1,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(1,0);
  ctx.arc(0,0,0.327,NaN,NaN,1.32);
  ctx.scale(1,Infinity);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.002495820830351891);
  ctx.scale(1,-Infinity);
  ctx.arc(0,0,0,NaN,NaN,0.6799999999999999);
  ctx.scale(1,0);
  ctx.rotate(-0.002495820830351891);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.0026005405854715507);
  ctx.scale(0,1);
  ctx.arc(0,0,0.322,NaN,NaN,NaN);
  ctx.scale(Infinity,1);
  ctx.rotate(-0.0026005405854715507);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(NaN,1);
  ctx.arc(0,0,NaN,NaN,NaN,1);
  ctx.scale(NaN,1);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0.005707226654021458);
  ctx.scale(1,-1.0342679127725858);
  ctx.arc(0,0,0.321,NaN,NaN,1);
  ctx.scale(1,-0.966867469879518);
  ctx.rotate(-0.005707226654021458);
  ctx.translate(NaN,NaN);
  ctx.translate(NaN,NaN);
  ctx.rotate(0);
  ctx.scale(-1.0152905198776758,1);
  ctx.arc(0,0,0.327,NaN,NaN,1);
  ctx.scale(-0.9849397590361446,1);
  ctx.rotate(0);
  ctx.translate(NaN,NaN);
  ctx.bezierCurveTo(NaN,NaN,NaN,NaN,NaN,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "#fff79c";
  ctx.lineWidth = 0.23399999737739563;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(2.22,6.425);
  ctx.bezierCurveTo(2.213,6.199,2.067,6.213,2.188,6.044);
  ctx.bezierCurveTo(2.3160000000000003,5.864,2.4850000000000003,6.467,2.064,6.1979999999999995);
  ctx.bezierCurveTo(1.889,6.031999999999999,1.739,6.207999999999999,1.517,NaN);
  ctx.bezierCurveTo(4.247,NaN,4.5169999999999995,NaN,4.5169999999999995,NaN);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#bd812e";
  ctx.beginPath();
  ctx.moveTo(1.087,8.231);
  ctx.bezierCurveTo(1.1593493022278338,8.231,1.218,8.287412121521319,1.218,8.357);
  ctx.bezierCurveTo(1.218,8.42658787847868,1.1593493022278338,8.482999999999999,1.087,8.482999999999999);
  ctx.bezierCurveTo(1.014650697772166,8.482999999999999,0.956,8.42658787847868,0.956,8.357);
  ctx.bezierCurveTo(0.956,8.287412121521319,1.014650697772166,8.231,1.087,8.231);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "#bd812e";
  ctx.beginPath();
  ctx.moveTo(0.852,9.364);
  ctx.bezierCurveTo(0.9867574789587136,9.364,1.096,9.468765368539595,1.096,9.598);
  ctx.bezierCurveTo(1.096,9.727234631460407,0.9867574789587136,9.832,0.852,9.832);
  ctx.bezierCurveTo(0.7172425210412864,9.832,0.608,9.727234631460407,0.608,9.598);
  ctx.bezierCurveTo(0.608,9.468765368539595,0.7172425210412864,9.364,0.852,9.364);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}
