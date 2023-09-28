module.exports = function drawFrostedGrid(p5, anchors, circles, spacing) {
  p5.beginShape();
  p5.noStroke();
  anchors.forEach(anchor => {
    anchor.x += anchor.velocityX;
    if (anchor.x < 0 || anchor.x > 400) {
      anchor.velocityX *= -1;
    }
    anchor.y += anchor.velocityY;
    if (anchor.y < 0 || anchor.y > 400) {
      anchor.velocityY *= -1;
    }
  });
  circles.forEach(circle => {
    let red = 0;
    let green = 0;
    let blue = 0;
    anchors.forEach(anchor => {
      red += getMappedColorValue(p5, 'R', circle.x, circle.y, anchor);
      green += getMappedColorValue(p5, 'G', circle.x, circle.y, anchor);
      blue += getMappedColorValue(p5, 'B', circle.x, circle.y, anchor);
    });
    p5.fill(p5.color(red, green, blue));
    p5.ellipse(circle.x, circle.y, spacing * 2, spacing * 2);
  });
  p5.endShape(p5.CLOSE);
};

function getMappedColorValue(p5, color, x, y, anchor) {
  const distance = Math.sqrt((anchor.x - x) ** 2 + (anchor.y - y) ** 2);
    // The amount that each anchor point contributes to the color of each
    // circle is proportional to the fourth root of the distance to
    // prevent the colors from getting too washed out.
  return p5.map(
      distance ** 0.25,
      565 ** 0.25,
      0,
      0,
      anchor[color]
    );
}
