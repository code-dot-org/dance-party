const test = require('tape');
const helpers = require('../helpers/createDanceAPI');
const parseDataURL = require('data-urls');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

let nativeAPI = null;

async function createBackgroundScreenshot(effectName) {
  nativeAPI = await helpers.createDanceAPI({deterministic: true});
  nativeAPI.setBackgroundEffect(effectName);
  for (let i = 0; i < 100; i++) {
    nativeAPI.getBackgroundEffect().draw({bpm: 0});
  }

  const buffer = parseDataURL(nativeAPI.p5_.canvas.toDataURL()).body;

  // If there is no accepted image for this background (ex: it's a new background),
  // use this screenshot as accepted image
  if (!fs.existsSync(`test/visual/images/${effectName}.png`)) {
    fs.writeFileSync(`test/visual/images/${effectName}.png`, buffer);
  }
  fs.writeFileSync(`test/visual/images/temp/${effectName}.png`, buffer);

  nativeAPI.reset();
}

async function testBackground(t, effect) {
  await createBackgroundScreenshot(effect);

  var img1 = fs.createReadStream(`test/visual/images/temp/${effect}.png`).pipe(new PNG()).on('parsed', doneReading),
    img2 = fs.createReadStream(`test/visual/images/${effect}.png`).pipe(new PNG()).on('parsed', doneReading),
    filesRead = 0;

  function doneReading() {
    if (++filesRead < 2) {
      return;
    }
    var diff = new PNG({width: img1.width, height: img1.height});

    let pixelDiff = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0.1});
    t.equal(pixelDiff, 0, effect);
  }
}

test('background - none', async t => {
  await testBackground(t, 'none');

  t.end();
});

test('background - swirl', async t => {
  await testBackground(t, 'swirl');

  t.end();
});


test('background - rainbow', async t => {
  await testBackground(t, 'rainbow');

  t.end();
});


test('background - color_cycle', async t => {
  await testBackground(t, 'color_cycle');

  t.end();
});

test('background - disco', async t => {
  await testBackground(t, 'disco');

  t.end();
});

test('background - diamonds', async t => {
  await testBackground(t, 'diamonds');

  t.end();
});

test('background - strobe', async t => {
  await testBackground(t, 'strobe');

  t.end();
});

test('background - rain', async t => {
  await testBackground(t, 'rain');

  t.end();
});

test('background - text', async t => {
  await testBackground(t, 'text');

  t.end();
});

test('background - raining_tacos', async t => {
  await testBackground(t, 'raining_tacos');

  t.end();
});

test('background - splatter', async t => {
  await testBackground(t, 'splatter');

  t.end();
});

test('background - spiral', async t => {
  await testBackground(t, 'spiral');

  t.end();
});

test('background - spotlight', async t => {
  await testBackground(t, 'spotlight');

  t.end();
});

test('background - color_lights', async t => {
  await testBackground(t, 'color_lights');

  t.end();
});

test('background - snowflakes', async t => {
  await testBackground(t, 'snowflakes');

  t.end();
});


test('teardown', async t => {
  //Clean-up testing artifacts after test complete
  await fs.readdir('test/visual/images/temp/', (err, files) => {
    files.forEach((file) => {
      fs.unlinkSync(`test/visual/images/temp/${file}`);
    });
  });

  t.end();
});
