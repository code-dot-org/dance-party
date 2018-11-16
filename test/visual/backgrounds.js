const test = require('tape');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const createBackgroundScreenshot = require('./helpers/createBackgroundScreenshot');

async function createScreenshot(effectName) {
  await createBackgroundScreenshot(effectName, `test/visual/fixtures/temp/`);

  // If there is no accepted image for this background (ex: it's a new background),
  // use this screenshot as accepted image
  if (!fs.existsSync(`test/visual/fixtures/${effectName}.png`)) {
    await createBackgroundScreenshot(effectName, `test/visual/fixtures/`);
  }
}

async function testBackground(t, effect) {
  await createScreenshot(effect);

  const actual = fs.createReadStream(`test/visual/fixtures/temp/${effect}.png`).pipe(new PNG()).on('parsed', doneReading),
    expected = fs.createReadStream(`test/visual/fixtures/${effect}.png`).pipe(new PNG()).on('parsed', doneReading);
  let filesRead = 0;

  function doneReading() {
    if (++filesRead < 2) {
      return;
    }
    const diff = new PNG({width: actual.width, height: actual.height});

    let pixelDiff = pixelmatch(actual.data, expected.data, diff.data, actual.width, actual.height, {threshold: 0.1});
    t.equal(pixelDiff, 0, effect);
  }
}

[
  'none',
  'swirl',
  'rainbow',
  'color_cycle',
  'disco',
  'diamonds',
  'strobe',
  'rain',
  'text',
  'raining_tacos',
  'splatter',
  'spiral',
  'spotlight',
  'color_lights',
  'snowflakes'
].forEach(effect => {
  test(`background - ${effect}`, async t => {
    await testBackground(t, effect);
    t.end();
  });
});

test('teardown', async t => {
  //Clean-up testing artifacts after test complete
  await fs.readdir('test/visual/fixtures/temp/', (err, files) => {
    files.forEach((file) => {
      fs.unlinkSync(`test/visual/fixtures/temp/${file}`);
    });

    if (fs.existsSync(`test/visual/fixtures/temp`)) {
      fs.rmdirSync(`test/visual/fixtures/temp`);
    }
  });

  t.end();
});
