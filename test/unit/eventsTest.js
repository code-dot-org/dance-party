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

function goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, n, expectedColor) {
  interpretedAPI.runUserEvents({
    any: true,
    'cue-measures': {
      [n]: true,
    }
  });
  t.deepEqual(nativeAPI.world.background_color, expectedColor);
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
    atTimestamp(1, "seconds", () => setForegroundEffectExtended("color_lights"));
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

test('conflicting everyMeasures cues, rarer definition wins - rarer first', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(2, "measures", () => setBackground("purple"));
    everySeconds(1, "measures", () => setBackground("orange"));
  `);

  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 1, undefined);
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 2, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 3, 'purple');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 4, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 5, 'purple');

  t.end();
  nativeAPI.reset();
});

test('conflicting everyMeasures cues, rarer definition wins - rarer last', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(1, "measures", () => setBackground("orange"));
    everySeconds(2, "measures", () => setBackground("purple"));
  `);

  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 1, undefined);
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 2, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 3, 'purple');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 4, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 5, 'purple');

  t.end();
  nativeAPI.reset();
});

test('conflicting everyMeasures and atTimestamp cues, rarer definition wins - rarer first', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(2, "measures", () => setBackground("purple"));
    atTimestamp(1, "measures", () => setBackground("orange"));
  `);

  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 1, undefined);
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 2, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 3, 'purple');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 4, 'purple');

  t.end();
  nativeAPI.reset();
});

test('conflicting everyMeasures cues and atTimestamp cues, rarer definition wins - rarer last', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(1, "measures", () => setBackground("orange"));
    atTimestamp(3, "measures", () => setBackground("purple"));
  `);

  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 1, undefined);
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 2, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 3, 'orange');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 4, 'purple');
  goToMeasuresAndVerifyBackgroundColor(interpretedAPI, t, nativeAPI, 5, 'orange');

  t.end();
  nativeAPI.reset();
});

test('silently clamp maximum event rate in seconds', async t => {
  // Try and create an event that's waaay too frequent
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(0.00314, "seconds", function () {});
  `);

  const assertClose = (a, b) => t.ok(Math.abs(a - b) < 1.0e-7, `${a} and ${b} were within 1.0e-7`);
  const cueList = interpretedAPI.getCueList();
  assertClose(cueList.seconds[0], 0.1);
  assertClose(cueList.seconds[1], 0.2);
  assertClose(cueList.seconds[2], 0.3);
  assertClose(cueList.seconds[3], 0.4);
  assertClose(cueList.seconds[4], 0.5);
  assertClose(cueList.seconds[5], 0.6);

  t.end();
  nativeAPI.reset();
});

test('silently clamp maximum event rate in measures', async t => {
  // Try and create an event that's waaay too frequent
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    everySeconds(0.00314, "measures", function () {});
  `);

  const assertClose = (a, b) => t.ok(Math.abs(a - b) < 1e-7, `${a} and ${b} were within 1e-7`);
  const cueList = interpretedAPI.getCueList();
  assertClose(cueList.measures[0], 1.1);
  assertClose(cueList.measures[1], 1.2);
  assertClose(cueList.measures[2], 1.3);
  assertClose(cueList.measures[3], 1.4);
  assertClose(cueList.measures[4], 1.5);
  assertClose(cueList.measures[5], 1.6);

  t.end();
  nativeAPI.reset();
});
