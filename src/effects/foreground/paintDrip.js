module.exports = function (p5, lerpColorFromSpecificPalette, getInPreviewMode) {
  return {
    current_drip: 0,
    current_drip_height: 0,
    crayons: [],
    start_width: 15,
    start_height: 30,
    dripping_up: false,
    drip_diameter: 20,
    drip_speed: 7,

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
        let rectHeight = this.getPreviewCustomizations().getRectHeight();

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
    getPreviewCustomizations: function () {
      return getInPreviewMode() ?
        {getRectHeight: () => p5.random(30, 200)} :
        {getRectHeight: () => this.start_height};
    }
  };
};
