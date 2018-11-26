const test = require('tape');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const createBackgroundScreenshot = require('./helpers/createBackgroundScreenshot');

const fixturePath = 'test/visual/fixtures/';
const tempDir = fs.mkdtempSync(fixturePath);

function readPNG(pngPath){
  return new Promise(resolve => {
    const stream = fs.createReadStream(pngPath)
      .pipe(new PNG())
      .on('parsed', () => resolve(stream));
  });
}

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

  const [actual, expected] = await Promise.all([
    readPNG(`${tempDir}/${effect}.png`),
    readPNG(`${fixturePath}${effect}.png`)
  ]);

  let diff = new PNG({width: actual.width, height: actual.height});

  let pixelDiff = pixelmatch(actual.data, expected.data, diff.data, actual.width, actual.height, {threshold: 0.1});
  t.equal(pixelDiff, 0, effect);
}

[
  'none',
  'swirl',
  'rainbow',
  'color_cycle',
  'disco',
  'disco_ball',
  'diamonds',
  'lasers',
  //'strobe',
  'rain',
  'text',
  'raining_tacos',
  'splatter',
  'spiral',
  'spotlight',
  'color_lights',
  'snowflakes',
  'sparkles',
  //'pineapples', temporarily removed
  //'pizzas', temporarily removed
  //'kaleidoscope', temporarily removed
  'falling_poop',
  'hearts',
  'falling_rainbows',
  'bubbles',
  'stars',
  'starspace',
  'strobe_lights',
  'confetti',
  'music_notes'
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
