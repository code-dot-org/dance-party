const drawLovestruck = require('../../shapes/lovestruck');
const drawSmiley = require('../../shapes/smiley');
const drawStarstruck = require('../../shapes/starstruck');
const drawTickled = require('../../shapes/tickled');
const drawWink = require('../../shapes/wink');

module.exports = function (p5, randomNumber, getInPreviewMode) {
  return {
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
      this.getPreviewCustomizations().addEmojis();

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
    },
    getPreviewCustomizations: function () {
      if (getInPreviewMode()) {
        const addEmojisPreview = () => {
          if (this.emojiList.length) {
            return;
          }

          for (let i = 0; i < 12; i++) {
            this.emojiList.push({
              x: randomNumber(0, 350),
              y: randomNumber(0, 350),
              size: randomNumber(50, 90),
              image: this.emojiTypes[randomNumber(0, 4)],
            });
          }
        };
        return {addEmojis: addEmojisPreview};
      } else {
        const addEmojisDefault = () => {
          if (p5.frameCount % 10 === 0) {
            // generate new emoji every 10 frames
            this.emojiList.push({
              x: randomNumber(0, 350),
              y: -50,
              size: randomNumber(50, 90),
              image: this.emojiTypes[randomNumber(0, 4)],
            });
          }
        };
        return {addEmojis: addEmojisDefault};
      }
    },
  };
};
