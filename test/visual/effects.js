const test = require('tape');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const createEffectScreenshot = require('./helpers/createEffectScreenshot');

const fixturePath = 'test/visual/fixtures/';
const tempDir = fs.mkdtempSync(fixturePath);

function readPNG(pngPath){
  return new Promise(resolve => {
    const stream = fs.createReadStream(pngPath)
      .pipe(new PNG())
      .on('parsed', () => resolve(stream));
  });
}

async function createScreenshot([effectName, palette], type) {
  await createEffectScreenshot(effectName, tempDir, palette, type);

  // If there is no accepted image for this background (ex: it's a new background),
  // use this screenshot as accepted image
  if (!fs.existsSync(`${fixturePath}${effectName}.png`)) {
    await createEffectScreenshot(effectName, fixturePath, palette, type);
  }
}

async function testEffect(t, name, effect, type) {
  await createScreenshot(effect, type);

  const [actual, expected] = await Promise.all([
    readPNG(`${tempDir}/${name}.png`),
    readPNG(`${fixturePath}${name}.png`)
  ]);

  let diff = new PNG({width: actual.width, height: actual.height});

  let pixelDiff = pixelmatch(actual.data, expected.data, diff.data, actual.width, actual.height, {threshold: 0.1});
  t.equal(pixelDiff, 0, name);
}

// backgrounds
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
  // 'text', Font rendering differences across devices cause problems
  ['splatter'],
  ['spiral'],
  ['snowflakes'],
  ['sparkles'],
  ['pineapples'],
  ['quads', 'vintage'],
  ['quads', 'electronic'],
  ['kaleidoscope'],
  ['kaleidoscope', 'vintage'],
  ['kaleidoscope', 'electronic'],
  ['smiling_poop'],
  ['hearts_red'],
  ['stars'],
  ['galaxy'],
  ['music_wave'],
  ['ripples'],
  ['ripples_random'],
  ['squiggles'],
  ['growing_stars'],
  ['blooming_petals', 'vintage'],
  ['clouds', 'neon'],
  ['frosted_grid', 'vintage'],
].forEach(effect => {
  let name = effect[0] + (effect[1] ? ("_" + effect[1]) : "");
  test(`background - ${name}`, async t => {

    await testEffect(t, name, effect, 'background');
    t.end();
  });
});

// foregrounds
[
  ['bubbles'],
  ['color_lights'],
  ['confetti'],
  ['floating_rainbows'],
  ['music_notes'],
  ['paint_drip'],
  ['rain'],
  ['raining_tacos'],
  ['smile_face'],
  ['spotlight'],
  //['pizzas'], error with Node 14 & Canvas 2.8.0: "node: cairo-arc.c:189: _cairo_arc_in_direction: Assertion `angle_max >= angle_min' failed."
].forEach(effect => {
  test(`foreground - ${effect}`, async t => {
    await testEffect(t, effect, effect, 'foreground');
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
