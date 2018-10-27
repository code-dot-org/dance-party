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

test('Dance 2: Pass the level', t => {
  const level = levels.hoc02;
  attempt(level.solution, level.validationCode, (result, message) => {
    t.true(result);
    t.end();
  });
});

test('Dance 2: Fail the level with no dancers', t => {
  const level = levels.hoc02;
  attempt('', level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'You have no dancers.');
    t.end();
  });
});

test('Dance 2: Fail the level by not changing the move', t => {
  const level = levels.hoc02;
  const userCode = `
    whenSetup(function () {
      makeNewDanceSprite("MOOSE", null, {x: 200, y: 200});
    });
  `;
  attempt(userCode, level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'Your dancer wasn\'t doing a new move after the fourth measure.');
    t.end();
  });
});

test('Dance 4: Pass the level', t => {
  const level = levels.hoc04;
  attempt(level.solution, level.validationCode, (result, message) => {
    t.true(result);
    t.end();
  });
});

test('Dance 4: Fail the level', t => {
  const level = levels.hoc04;
  attempt('', level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'You need to add a background effect.');
    t.end();
  });
});
