const test = require('tape');
const attempt = require('../helpers/runLevel.js');
const levels = require('../../levels/effectsLevels');

test('Effects: sets background at timestamp', t => {
  const level = levels.changeBackgroundAtTimestamp;
  attempt(level.solutions, level.validationCode, (result) => {
    t.true(result);
    t.end();
  });
});
