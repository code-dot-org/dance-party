const test = require('tape');
const attempt = require('../helpers/runLevel.js');
const levels = require('../../levels/hourOfCode');

test('Dance 1: Pass the level', t => {
  const level = levels.hoc01;
  attempt(level.solution, level.validationCode, (result, message) => {
    t.true(result);
    t.end();
  });
});

test('Dance 1: Fail the level', t => {
  const level = levels.hoc01;
  attempt('', level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'You need to make a dancer.');
    t.end();
  });
});
