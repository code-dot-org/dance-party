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

test('Dance collision: every measures - different dancers', t => {
  const level = levels.collisionEveryNMeasureDifferentDancers;
  attempt(level.solution, level.validationCode, (result) => {
    t.true(result);
    t.end();
  });
});

test('Dance collision: every seconds - rarer move second', t => {
  const level = levels.collisionEveryNSeconds;
  attempt(level.solutions[0], level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 500);
});

test('Dance collision: every seconds - rarer move first', t => {
  const level = levels.collisionEveryNSeconds;
  attempt(level.solutions[1], level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 500);
});

test('Dance collision: every measures and at timestamp - rarer move second', t => {
  const level = levels.collisionEveryNSeconds;
  attempt(level.solutions[0], level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 500);
});

test('Dance collision: every measures and at timestamp - rarer move first', t => {
  const level = levels.collisionEveryNSeconds;
  attempt(level.solutions[1], level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 500);
});
