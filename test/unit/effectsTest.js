const test = require('tape');
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
  t.equal(nativeAPI.world.bg_effect, 'fireworks');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  t.end();
  nativeAPI.reset();
});

test('rainbow foreground effect updates with specified effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.world.fg_effect, null);

  nativeAPI.setForegroundEffect('rainbow');

  t.deepEqual(nativeAPI.getForegroundEffect().lengths, [0, 0, 0, 0, 0, 0, 0]);
  t.deepEqual(nativeAPI.getForegroundEffect().current, 0);
  nativeAPI.getForegroundEffect().update();
  t.deepEqual(nativeAPI.getForegroundEffect().lengths, [0, 0, 0, 0, 0, 0, 1]);
  t.equal(nativeAPI.getForegroundEffect().current, 1);
  nativeAPI.getForegroundEffect().update();
  t.deepEqual(nativeAPI.getForegroundEffect().lengths, [0, 0, 0, 0, 0, 1, 1]);
  t.equal(nativeAPI.getForegroundEffect().current, 2);

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
  t.equal(nativeAPI.getForegroundEffect(), undefined);

  t.end();
  nativeAPI.reset();
});

test('random foreground effect', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.p5_.randomSeed(0);

  nativeAPI.setForegroundEffect('rand');
  t.equal(nativeAPI.world.fg_effect, 'music_notes');
  nativeAPI.getForegroundEffect().draw({bpm: 120});

  t.end();
  nativeAPI.reset();
});
