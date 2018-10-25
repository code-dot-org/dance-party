module.exports = class Effects {
  constructor(p5, alpha, blend) {
    this.blend = blend || p5.BLEND;

    function randomNumber(min, max) {
      return Math.floor(p5.random(min, max));
    }

    this.none = {
      draw: function ({backgroundColor}) {
        p5.background(backgroundColor || "white");
      }
    };

    this.rainbow = {
      color: p5.color('hsla(0, 100%, 80%, ' + alpha + ')'),
      update: function () {
        p5.push();
        p5.colorMode(p5.HSL);
        this.color =
          p5.color(this.color._getHue() + 10, 100, 80, alpha);
        p5.pop();
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
          this.colors[i] = p5.color("hsl(" + randomNumber(0, 359) + ", 100%, 80%)");
        }
      },
      update: function () {
        const numChanges = randomNumber(this.minColorChangesPerUpdate, this.maxColorChangesPerUpdate + 1);
        for (let i = 0; i < numChanges; i++) {
          const loc = randomNumber(0, this.colors.length + 1);
          this.colors[loc] = p5.color("hsl(" + randomNumber(0, 359) + ", 100%, 80%)");
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
        p5.colorMode(p5.HSB);
        p5.rectMode(p5.CENTER);
        p5.translate(200, 200);
        p5.rotate(45);
        p5.noFill();
        p5.strokeWeight(p5.map(centroid, 0, 4000, 0, 50));
        for (let i = 5; i > -1; i--) {
          p5.stroke((this.hue + i * 10) % 360, 100, 75, alpha);
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
            color: p5.color("hsl(" + randomNumber(0, 359) + ", 100%, 80%)"),
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
        p5.background(p5.color("hsl(" + this.color + ", 100%, 10%)"));
        p5.push();
        p5.imageMode("center");
        p5.translate(200,200);
        let rotation=(bpm/90)*200;
        this.angle-=rotation;
        p5.rotate(Math.PI / 180 * this.angle);
        p5.tint(p5.color("hsl(" + this.color + ", 100%, 60%)"));
        p5.image(this.swirl,0,0,600,600);
        p5.pop();

      }
    };
  }
};
