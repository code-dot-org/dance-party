const test = require('tape');
const sinon = require('sinon');
const utils = require('../../src/utils');
const helpers = require('../helpers/createDanceAPI');

test('setBackground clears the bgEffect and sets background_color', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.setBackgroundEffect('diamonds');

  // Initial Values
  t.equal(nativeAPI.world.bg_effect, 'diamonds');

  nativeAPI.setBackground('purple');

  t.equal(nativeAPI.world.background_color, 'purple');
  t.equal(nativeAPI.world.bg_effect, null);

  t.end();
  nativeAPI.reset();
});

test('setBackgroundEffect changes the bgEffect to color_cycle effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.bg_effect, null);

  nativeAPI.setBackgroundEffect('color_cycle');

  t.notEqual(nativeAPI.getBackgroundEffect().color, null);

  t.end();
  nativeAPI.reset();
});

test('text background effect updates with song text', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // Initial Values
  t.equal(nativeAPI.world.bg_effect, null);

  nativeAPI.setBackgroundEffect('text');

  t.deepEqual(nativeAPI.getBackgroundEffect().texts, []);
  nativeAPI.getBackgroundEffect().update('test', 20, 20);
  t.deepEqual(nativeAPI.getBackgroundEffect().texts[0].text, 'test');

  t.end();
  nativeAPI.reset();
});

// TODO: this would be a good candidate for pixelmatch tests (Erin P).
test('other background effects', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  nativeAPI.setBackgroundEffect('kaleidoscope');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  nativeAPI.setBackgroundEffect('swirl');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  nativeAPI.setBackgroundEffect('spiral');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  nativeAPI.setBackgroundEffect('sparkles');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  t.end();
  nativeAPI.reset();
});

test('random background effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.p5_.randomSeed(0);

  nativeAPI.setBackgroundEffect('rand');
  t.equal(nativeAPI.world.bg_effect, 'kaleidoscope');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  t.end();
  nativeAPI.reset();
});

test('rainbow background effect updates with specified effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.bg_effect, null);

  nativeAPI.setBackgroundEffect('rainbow');

  t.deepEqual(nativeAPI.getBackgroundEffect().lengths, [0, 0, 0, 0, 0, 0, 0]);
  t.deepEqual(nativeAPI.getBackgroundEffect().current, 0);
  nativeAPI.getBackgroundEffect().update();
  t.deepEqual(nativeAPI.getBackgroundEffect().lengths, [0, 0, 0, 0, 0, 0, 1]);
  t.equal(nativeAPI.getBackgroundEffect().current, 1);
  nativeAPI.getBackgroundEffect().update();
  t.deepEqual(nativeAPI.getBackgroundEffect().lengths, [0, 0, 0, 0, 0, 1, 1]);
  t.equal(nativeAPI.getBackgroundEffect().current, 2);

  t.end();
  nativeAPI.reset();
});

test('color_lights foreground effect updates with specified effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.fg_effect, null);

  nativeAPI.setForegroundEffect('color_lights');
  t.equal(nativeAPI.getForegroundEffect().lights.length, 4);

  t.end();
  nativeAPI.reset();
});

test('setting fg effect to none clears the fg effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.setForegroundEffect('color_lights');
  nativeAPI.setForegroundEffect('none');
  t.equal(nativeAPI.getForegroundEffect().draw, utils.noOp);

  t.end();
  nativeAPI.reset();
});

test('random foreground effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.p5_.randomSeed(0);

  nativeAPI.setForegroundEffect('rand');
  t.equal(nativeAPI.world.fg_effect, 'pineapples');
  nativeAPI.getForegroundEffect().draw();

  t.end();
  nativeAPI.reset();
});

test('logs invalid background effect', async t => {
  const invalidEffect = 'invalidBg';
  const loggerSpy = {
    logWarning: sinon.spy(),
  };
  const consoleSpy = sinon.spy(console, 'warn');
  const nativeAPI = await helpers.createDanceAPI({
    logger: loggerSpy
  });

  nativeAPI.setBackgroundEffect(invalidEffect);
  t.equal(consoleSpy.callCount, 1);
  t.equal(loggerSpy.logWarning.callCount, 1);
  const warningMessage = loggerSpy.logWarning.firstCall.args[0];
  t.true(warningMessage.includes(invalidEffect));

  t.end();
  nativeAPI.reset();
  sinon.restore();
});

test('logs invalid foreground effect', async t => {
  const invalidEffect = 'invalidFg';
  const loggerSpy = {
    logWarning: sinon.spy(),
  };
  const consoleSpy = sinon.spy(console, 'warn');
  const nativeAPI = await helpers.createDanceAPI({
    logger: loggerSpy
  });

  nativeAPI.setForegroundEffect(invalidEffect);
  t.equal(consoleSpy.callCount, 1);
  t.equal(loggerSpy.logWarning.callCount, 1);
  const warningMessage = loggerSpy.logWarning.firstCall.args[0];
  t.true(warningMessage.includes(invalidEffect));

  t.end();
  nativeAPI.reset();
  sinon.restore();
});

test('logs invalid background palette', async t => {
  const invalidPalette = 'invalidPalette';
  const loggerSpy = {
    logWarning: sinon.spy(),
  };
  const consoleSpy = sinon.spy(console, 'warn');
  const nativeAPI = await helpers.createDanceAPI({
    logger: loggerSpy
  });

  nativeAPI.setBackgroundEffect('color_cycle', invalidPalette);
  t.equal(consoleSpy.callCount, 1);
  t.equal(loggerSpy.logWarning.callCount, 1);
  const warningMessage = loggerSpy.logWarning.firstCall.args[0];
  t.true(warningMessage.includes(invalidPalette));

  t.end();
  nativeAPI.reset();
  sinon.restore();
});
