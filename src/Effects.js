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

    this.text = {
      texts: [],
      maxTexts: 100,
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
      swirl: null,
      angle: 0,
      color: null,
      init: function () {
        this.swirl = p5.loadImage('data: image/svg+xml,'+encodeURIComponent(`<svg width="855" height="834" viewBox="0 0 855 834" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M277.353 2.93555C179.837 73.7852 158.22 210.271 229.067 307.787C275.989 372.367 351.696 403.66 425.806 396.854C328.591 464.24 194.86 441.895 124.981 345.713C54.1299 248.197 75.7471 111.709 173.263 40.8594C206.2 16.9316 243.579 3.55078 281.376 0.078125L279.462 1.41992C278.755 1.91992 278.052 2.42578 277.353 2.93555ZM450.388 178.842C521.235 81.3262 657.724 59.709 755.239 130.559L756.817 131.717L757.821 132.461L759.2 133.506C744.22 98.6309 719.942 67.2129 687.005 43.2832C589.489 -27.5664 453.005 -5.94922 382.153 91.5664C312.274 187.748 332.349 321.84 426.474 393.473C397.099 325.092 403.466 243.422 450.388 178.842ZM781.825 625.113C819.075 510.477 756.337 387.35 641.7 350.104C565.782 325.436 486.142 344.619 430.185 393.686C469.224 282.029 590.552 221.502 703.618 258.24C818.255 295.486 880.993 418.613 843.743 533.25C831.165 571.969 808.786 604.768 780.247 629.793L780.915 627.857L781.47 626.189L781.825 625.113ZM319.759 802.969C440.294 802.969 538.009 705.254 538.009 584.719C538.009 504.895 495.153 435.078 431.196 397.023C549.454 399.648 644.509 496.332 644.509 615.219C644.509 735.754 546.794 833.469 426.259 833.469C385.548 833.469 347.438 822.322 314.821 802.914C316.462 802.951 318.11 802.969 319.759 802.969ZM282.548 558.994C167.911 596.242 44.7861 533.506 7.53612 418.869C7.02831 417.299 6.53612 415.729 6.06346 414.156C-2.31544 451.176 -1.13966 490.863 11.4385 529.582C48.6885 644.219 171.813 706.955 286.45 669.707C399.517 632.971 462.095 512.689 428.048 399.41C411.622 471.996 358.466 534.328 282.548 558.994Z" fill="#4D575F"/></svg>`));
        this.color=randomNumber(0,359);
      },
      update: function () {
        this.color=randomNumber(0,359);
      },
      draw: function ({isPeak,bpm}) {
        if (this.swirl === null) {
          this.init();
        }
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.imageMode("center");
        p5.translate(200,200);
        let rotation=(bpm/90)*50;
        this.angle-=rotation;
        p5.rotate(Math.PI / 180 * this.angle);
        p5.tint(colorFromHue(this.color, 100, 60));
        p5.image(this.swirl,0,0,600,600);
        p5.pop();

      }
    };
    this.spiral = {
      swirl: null,
      angle: 0,
      color: null,
      init: function () {
        this.swirl = p5.loadImage('data: image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="600" height="600" viewBox="0 0 1210 1280" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,1200) scale(0.1,-0.1)" fill="#e1e1e1" stroke="none"><path d="M7221 12785 c-122 -27 -264 -113 -338 -203 -123 -151 -171 -361 -123 -546 29 -113 73 -190 160 -277 89 -89 123 -109 317 -185 1038 -404 1873 -1042 2535 -1934 536 -723 914 -1630 1042 -2505 50 -334 70 -828 47 -1135 -113 -1519 -837 -2848 -2045 -3755 -705 -528 -1541 -869 -2401 -979 -416 -53 -918 -46 -1325 20 -1179 189 -2213 811 -2940 1769 -470 619 -779 1363 -884 2130 -59 431 -44 938 39 1361 245 1239 1035 2275 2172 2848 413 208 810 329 1313 398 149 20 722 17 875 -5 989 -144 1776 -597 2371 -1367 333 -431 580 -996 667 -1530 55 -333 55 -723 1 -1038 -144 -842 -610 -1555 -1320 -2022 -807 -531 -1782 -623 -2614 -246 -663 299 -1174 914 -1355 1626 -49 194 -59 281 -59 520 0 247 10 334 65 539 184 694 736 1232 1423 1386 688 154 1362 -151 1659 -750 147 -298 170 -604 66 -889 -106 -290 -375 -514 -666 -556 -66 -9 -184 -3 -182 9 0 3 36 23 80 44 110 53 203 146 258 259 57 116 73 183 78 334 5 123 3 137 -25 236 -81 284 -311 486 -627 549 -100 20 -311 17 -413 -5 -160 -34 -293 -90 -407 -171 -74 -52 -208 -190 -262 -270 -329 -486 -256 -1159 182 -1668 232 -270 587 -462 970 -527 114 -20 153 -22 325 -17 260 8 415 40 664 139 401 159 777 481 1005 861 159 264 266 587 301 906 26 234 1 571 -59 809 -193 754 -741 1407 -1451 1728 -501 226 -1058 298 -1610 208 -634 -104 -1249 -432 -1717 -917 -491 -508 -786 -1147 -874 -1892 -17 -136 -17 -544 -1 -680 84 -710 343 -1332 787 -1885 622 -776 1522 -1261 2530 -1365 262 -27 654 -18 930 21 1025 145 1994 703 2656 1530 199 247 323 440 469 729 259 511 401 1018 451 1603 17 205 6 681 -20 877 -122 911 -471 1709 -1060 2424 -204 248 -535 561 -817 773 -1120 845 -2622 1142 -4029 798 -1212 -297 -2276 -1010 -3021 -2025 -376 -512 -670 -1131 -838 -1765 -223 -842 -232 -1765 -25 -2635 315 -1331 1110 -2529 2219 -3347 788 -581 1712 -951 2690 -1077 296 -39 411 -45 765 -45 528 0 892 42 1390 160 1408 335 2662 1145 3565 2304 687 882 1131 1961 1269 3085 37 298 46 446 46 800 0 444 -27 755 -101 1160 -411 2253 -1940 4184 -4029 5087 -151 66 -361 148 -445 175 -67 21 -223 25 -299 8z"/></g></svg>`));
        this.color=randomNumber(0,359);
      },
      update: function () {
        this.color=(this.color+randomNumber(0,20)) % 359;
      },
      draw: function ({isPeak,bpm}) {
        if (this.swirl === null) {
          this.init();
        }
        if (isPeak) {
          this.update();
        }
        p5.background(colorFromHue(this.color, 100, 10));
        p5.push();
        p5.imageMode("center");
        p5.translate(200,200);
        let rotation=(bpm/90)*200;
        this.angle-=rotation;
        p5.rotate(Math.PI / 180 * this.angle);
        p5.tint(colorFromHue(this.color, 100, 60));
        p5.image(this.swirl,0,0,600,600);
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
          shift: randomNumber(0, 100),
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
      draw: function ({isPeak, bpm, centroid}) {
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
          p5.rotate((Math.sin((p5.frameCount / 100) + light.shift + centroid / 1000) * light.arc) + light.offset);
          p5.triangle(0, 0, -75, 600, 75, 600);
          p5.pop();
        })
      }
    };
  }
};
