module.exports = function drawBloom(p5, length, theta, petalWidth) {
  p5.beginShape();
  const leftAnchor = {
    x: 200 + length * p5.sin(theta - petalWidth),
    y: 200 + length * p5.cos(theta - petalWidth),
  };
  const rightAnchor = {
    x: 200 + length * p5.sin(theta + petalWidth),
    y: 200 + length * p5.cos(theta + petalWidth),
  };
  p5.bezier(
            200,
            200,
            leftAnchor.x,
            leftAnchor.y,
            rightAnchor.x,
            rightAnchor.y,
            200,
            200
          );
  p5.endShape(p5.CLOSE);
};
