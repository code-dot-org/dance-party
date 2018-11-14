const test = require('tape');
const attempt = require('../helpers/runLevel.js');
const levels = require('../../levels/hourOfCode');

const KEY_UP_ARROW = 38;

test('Dance 1: Pass the level', t => {
  const level = levels.hoc01;
  attempt(level.solution, level.validationCode, (result) => {
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
  attempt(level.solution, level.validationCode, (result) => {
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
  attempt(level.solution, level.validationCode, (result) => {
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

test('Dance 7: Pass the level', t => {
  const level = levels.hoc07;
  attempt(level.solution, level.validationCode, (result) => {
    t.true(result);
    t.end();
  });
});

test('Dance 7: Fail the level', t => {
  const level = levels.hoc07;
  attempt('', level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'Use the `set backup_dancer2 size` block to make that dancer smaller.');
    t.end();
  });
});

test('Dance 9: Pass the level', t => {
  const level = levels.hoc09;
  attempt(level.solution, level.validationCode, (result) => {
    t.true(result);
    t.end();
  });
});

test('Dance 9: Fail the level', t => {
  const level = levels.hoc09;
  attempt('', level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'Try adding the `right_pineapple begins size following bass` block to your program.');
    t.end();
  });
});

test('Dance 10: Pass the level', t => {
  const level = levels.hoc10;
  attempt(level.solution, level.validationCode, (result) => {
    t.true(result);
    t.end();
  }, 320, {
    1000: KEY_UP_ARROW,
  });
});

test('Dance 10: Fail the level', t => {
  const level = levels.hoc10;
  attempt('', level.validationCode, (result, message) => {
    t.false(result);
    t.equals(message, 'Make sure you add a `when key` event and press the key to test it.');
    t.end();
  }, 320);
});
