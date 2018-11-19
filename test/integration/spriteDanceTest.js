const test = require('tape');
const attempt = require('../helpers/runLevel.js');
const levels = require('../../levels/spriteDance');

test('Dance collision: every measures - rarer move second', t => {
  const level = levels.collisionEveryNMeasure;
  attempt(level.solutions[0], level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 500);
});

test('Dance collision: every measures - rarer move first', t => {
  const level = levels.collisionEveryNMeasure;
  attempt(level.solutions[1], level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 500);
});
