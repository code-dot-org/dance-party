const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('testInterface getSprites', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  t.equal(testInterface.getSprites().length, 0);

  nativeAPI.play({
    bpm: 120,
  });

  t.equal(testInterface.getSprites().length, 0);

  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  t.end();
  nativeAPI.reset();
});
