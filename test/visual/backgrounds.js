const test = require('tape');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const createBackgroundScreenshot = require('./helpers/createBackgroundScreenshot');

const fixturePath = 'test/visual/fixtures/';
const tempDir = fs.mkdtempSync(fixturePath);

async function createScreenshot(effectName) {
  await createBackgroundScreenshot(effectName, tempDir);

  // If there is no accepted image for this background (ex: it's a new background),
  // use this screenshot as accepted image
  if (!fs.existsSync(`${fixturePath}${effectName}.png`)) {
    await createBackgroundScreenshot(effectName, fixturePath);
  }
}

async function testBackground(t, effect) {
  await createScreenshot(effect);

  const actual = fs.createReadStream(`${tempDir}/${effect}.png`).pipe(new PNG()).on('parsed', doneReading),
    expected = fs.createReadStream(`${fixturePath}${effect}.png`).pipe(new PNG()).on('parsed', doneReading);
  let filesRead = 0;

  function doneReading() {
    if (++filesRead < 2) {
      return;
    }
    let diff = new PNG({width: actual.width, height: actual.height});

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
  await fs.readdir(tempDir, (err, files) => {
    files.forEach((file) => {
      fs.unlinkSync(`${tempDir}/${file}`);
    });

    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  });

  t.end();
});
