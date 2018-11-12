const fs = require('fs');
const path = require('path');
const interpreted = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'p5.dance.interpreted.js'), 'utf8');
const injectInterpreted = require('../helpers/injectInterpreted');

const test = require('tape-async');
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
    everySeconds(4, "seconds", () => setBackground("blue"));
    everySeconds(2, "seconds", () => setBackground("green"));
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
  goToSecondsAndVerify(12, 'blue');
  goToSecondsAndVerify(13, 'blue');
  goToSecondsAndVerify(14, 'green');
  goToSecondsAndVerify(15, 'green');

  t.end();
  nativeAPI.reset();
});

test('non-conflicting everySeconds cues', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  for (let i = 0; i < 4; i++) {
    nativeAPI.setAnimationSpriteSheet("MOOSE", i, {}, () => {});
    nativeAPI.setAnimationSpriteSheet("ROBOT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    });
  }
  nativeAPI.world.fullLengthMoveCount = 4;
  nativeAPI.world.restMoveCount = 1;
  const userCode = `
    const moose = makeNewDanceSprite("MOOSE");
    const robot = makeNewDanceSprite("ROBOT");

    everySeconds(1, "seconds", () => changeMoveLR(moose, "next"));
    everySeconds(2, "seconds", () => changeMoveLR(robot, "next"));
  `;
  const interpretedAPI = injectInterpreted(nativeAPI, interpreted, userCode);

  function goToSecondsAndVerify(n, expectedMooseDance, expectedRobotDance) {
    interpretedAPI.runUserEvents({
      any: true,
      'cue-seconds': {
        [n]: true,
      }
    });
    t.equal(nativeAPI.getGroupByName_('MOOSE')[0].current_move, expectedMooseDance);
    t.equal(nativeAPI.getGroupByName_('ROBOT')[0].current_move, expectedRobotDance);
  }

  goToSecondsAndVerify(0, 0, 0);
  goToSecondsAndVerify(1, 1, 0);
  goToSecondsAndVerify(2, 2, 1);
  goToSecondsAndVerify(3, 3, 1);
  goToSecondsAndVerify(4, 1, 2);
  goToSecondsAndVerify(5, 2, 2);
  goToSecondsAndVerify(6, 3, 3);
  goToSecondsAndVerify(7, 1, 3);

  t.end();
  nativeAPI.reset();
});

test('conflicting atTimestamp cues, last definition wins', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    atTimestamp(1, "seconds", () => setBackground("orange"));
    atTimestamp(1, "seconds", () => setBackground("purple"));
  `);

  interpretedAPI.runUserEvents({
    any: true,
    'cue-seconds': {
      1: true,
    }
  });
  t.deepEqual(nativeAPI.world.background_color, 'purple');

  t.end();
  nativeAPI.reset();
});

test('non-conflicting atTimestamp cues, both take effect', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    atTimestamp(1, "seconds", () => setBackground("orange"));
    atTimestamp(1, "seconds", () => setForegroundEffect("color_lights"));
  `);

  interpretedAPI.runUserEvents({
    any: true,
    'cue-seconds': {
      1: true,
    }
  });
  t.deepEqual(nativeAPI.world.background_color, 'orange');
  t.deepEqual(nativeAPI.world.fg_effect, 'color_lights');

  t.end();
  nativeAPI.reset();
});
