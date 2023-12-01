module.exports = function (isRandomRipple, p5, colorFromPalette, randomNumber) {
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
