// This shape is slightly modified from the Poetry background effect 'blooming'
// https://github.com/code-dot-org/code-dot-org/blob/381e9b93f7cbd081738dfa7adbc9e7ce4e169a0c/apps/src/p5lab/poetry/commands/backgroundEffects.js#L245
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
