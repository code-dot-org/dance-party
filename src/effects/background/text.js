module.exports = function (p5, lerpColorFromPalette, colorFromHue, randomNumber) {
  return {
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
};
