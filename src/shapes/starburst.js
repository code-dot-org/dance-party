// This shape is slightly modified from the Poetry foreground effect 'starburst'
// https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/foregroundEffects.js#L235
module.exports = function drawStarburst(p5, isPreview, stars, randomInt, randomColorFromPalette, drawStar) {
  p5.beginShape();
  p5.noStroke();
  const numStars = isPreview ? 100 : 10;
  for (let i = 0; i < numStars; i++) {
    const theta = randomInt(0, 360);
    const velocity = randomInt(2, 7);
    stars.push({
      color: randomColorFromPalette(),
      x: 200,
      y: 200,
      velocityX: velocity * p5.cos(theta),
      velocityY: velocity * p5.sin(theta),
    });
  }
  stars.forEach(star => {
    p5.fill(star.color);
    const scalar = isPreview ? randomInt(0,50) : 1;
    star.x += star.velocityX + scalar * star.velocityX;
    star.y += star.velocityY + scalar * star.velocityY;
    drawStar(p5, star.x, star.y, 3, 9, 5);
  });
  stars = stars.filter(
      star =>
        star.x > -10 && star.x < 410 && star.y > -10 && star.y < 410
    );
  p5.endShape(p5.CLOSE);
};
