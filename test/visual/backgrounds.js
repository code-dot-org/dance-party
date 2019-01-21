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

async function createScreenshot([effectName, palette]) {
  await createBackgroundScreenshot(effectName, tempDir, palette);

  // If there is no accepted image for this background (ex: it's a new background),
  // use this screenshot as accepted image
  if (!fs.existsSync(`${fixturePath}${effectName}.png`)) {
    await createBackgroundScreenshot(effectName, fixturePath, palette);
  }
}

async function testBackground(t, name, effect) {
  await createScreenshot(effect);

  const [actual, expected] = await Promise.all([
    readPNG(`${tempDir}/${name}.png`),
    readPNG(`${fixturePath}${name}.png`)
  ]);

  let diff = new PNG({width: actual.width, height: actual.height});

  let pixelDiff = pixelmatch(actual.data, expected.data, diff.data, actual.width, actual.height, {threshold: 0.1});
  t.equal(pixelDiff, 0, name);
}

[
  ['none'],
  ['swirl'],
  ['rainbow', 'default'],
  ['rainbow', 'electronic'],
  ['rainbow', 'vintage'],
  ['rainbow', 'cool'],
  ['rainbow', 'warm'],
  ['rainbow', 'iceCream'],
  ['rainbow', 'tropical'],
  ['rainbow', 'neon'],
  ['rainbow', 'rave'],
  ['color_cycle'],
  ['circles'],
  ['disco'],
  ['disco_ball'],
  ['disco_ball', 'neon'],
  ['diamonds'],
  ['fireworks'],
  ['flowers'],
  ['lasers'],
  //'strobe',
  ['rain'],
  // 'text', Font rendering differences across devices cause problems
  ['raining_tacos'],
  ['splatter'],
  ['spiral'],
  ['spotlight'],
  ['color_lights'],
  ['snowflakes'],
  ['sparkles'],
  ['pineapples'],
  ['pizzas'],
  ['quads', 'vintage'],
  ['quads', 'electronic'],
  ['kaleidoscope'],
  ['kaleidoscope', 'vintage'],
  ['kaleidoscope', 'electronic'],
  ['smile_face'],
  // 'smiling_poop', need to debug
  // 'hearts_red', need to debug
  ['floating_rainbows'],
  ['bubbles'],
  ['stars'],
  ['galaxy'],
  ['confetti'],
  ['music_notes']
].forEach(effect => {
  let name = effect[0] + (effect[1] ? ("_" + effect[1]) : "");
  test(`background - ${name}`, async t => {

    await testBackground(t, name, effect);
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
