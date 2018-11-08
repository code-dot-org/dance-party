const fs = require('fs');
const path = require('path');
const interpreted = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'p5.dance.interpreted.js'), 'utf8');
const injectInterpreted = require('../helpers/injectInterpreted');

const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

async function runUserCode(userCode) {
  const nativeAPI = await helpers.createDanceAPI();
  return {
    nativeAPI,
    interpretedAPI: injectInterpreted(nativeAPI, interpreted, userCode),
  };
}

test('atTimestamp adds a cue to the cue list', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    atTimestamp(2, "seconds", function () {});
  `);

  t.deepEqual(interpretedAPI.getCueList(), {seconds: [2], measures: []});

  t.end();
  nativeAPI.reset();
});

test('conflicting everySeconds and atTimestamp cues', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(2, "seconds", () => setBackground("green"));
    everySeconds(4, "seconds", () => setBackground("blue"));
    atTimestamp(6, "seconds", () => setBackground("red"));
  `);

  function goToSecondsAndVerify(n, expectedColor) {
    interpretedAPI.runUserEvents({
      any: true,
      'cue-seconds': {
        [n]: true,
      }
    });
    t.deepEqual(nativeAPI.world.background_color, expectedColor);
  }

  goToSecondsAndVerify(1, undefined);
  goToSecondsAndVerify(2, 'green');
  goToSecondsAndVerify(3, 'green');
  goToSecondsAndVerify(4, 'blue');
  goToSecondsAndVerify(5, 'blue');
  goToSecondsAndVerify(6, 'red');
  goToSecondsAndVerify(7, 'red');
  goToSecondsAndVerify(8, 'blue');
  goToSecondsAndVerify(9, 'blue');
  goToSecondsAndVerify(10, 'green');
  goToSecondsAndVerify(11, 'green');

  t.end();
  nativeAPI.reset();
});
