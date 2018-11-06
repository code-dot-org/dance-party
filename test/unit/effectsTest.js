const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('setBackground changes the bgEffect to color_cycle effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.bg_effect, null);

  nativeAPI.setBackgroundEffect('color_cycle');

  t.notEqual(nativeAPI.world.bg_effect.color, null);

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

  t.deepEqual(nativeAPI.world.bg_effect.texts, []);
  nativeAPI.world.bg_effect.update('test', 20, 20);
  t.deepEqual(nativeAPI.world.bg_effect.texts[0].text, 'test');

  t.end();
  nativeAPI.reset();
});

test('rainbow foreground effect updates with specified effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.fg_effect, null);

  nativeAPI.setForegroundEffect('rainbow');

  t.deepEqual(nativeAPI.world.fg_effect.lengths, [0, 0, 0, 0, 0, 0, 0]);
  t.deepEqual(nativeAPI.world.fg_effect.current, 0);
  nativeAPI.world.fg_effect.update();
  t.deepEqual(nativeAPI.world.fg_effect.lengths, [0, 0, 0, 0, 0, 0, 1]);
  t.equal(nativeAPI.world.fg_effect.current, 1);
  nativeAPI.world.fg_effect.update();
  t.deepEqual(nativeAPI.world.fg_effect.lengths, [0, 0, 0, 0, 0, 1, 1]);
  t.equal(nativeAPI.world.fg_effect.current, 2);

  t.end();
  nativeAPI.reset();
});

test('color_lights foreground effect updates with specified effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.fg_effect, null);

  nativeAPI.setForegroundEffect('color_lights');

  t.deepEqual(nativeAPI.world.fg_effect.lights, []);
  nativeAPI.world.fg_effect.init();
  t.equal(nativeAPI.world.fg_effect.lights.length, 4);

  t.end();
  nativeAPI.reset();
});

