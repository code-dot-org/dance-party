const test = require('tape');
const UnitTestResourceLoader = require('../helpers/UnitTestResourceLoader');
const DanceParty = require('../../src/p5.dance');
const constants = require('../../src/constants');

function createDanceAPIWithoutLoading() {
  return new Promise(resolve => {
    new DanceParty({
      playSound: (url, callback) => callback(),
      onInit: nativeAPI => resolve(nativeAPI),
      resourceLoader: new UnitTestResourceLoader(),
    });
  });
}

test('ensureSpritesAreLoaded sanity test', async t => {
  const nativeAPI = await createDanceAPIWithoutLoading();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.ensureSpritesAreLoaded();
  nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), constants.SPRITE_NAMES);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  t.end();

  nativeAPI.reset();
});

test('Calling play without awaiting ensureSpritesAreLoaded should throw test', async t => {
  const nativeAPI = await createDanceAPIWithoutLoading();

  nativeAPI.ensureSpritesAreLoaded();
  // This should fail since we didn't wait for the promise!
  let error = null;
  try {
    nativeAPI.play({
      bpm: 120,
    });
  } catch (e) {
    error = e;
  }
  t.equal(error.toString(), "Error: play() called before ensureSpritesAreLoaded() has completed!");
  t.end();

  nativeAPI.reset();
});


test('Calling play without calling ensureSpritesAreLoaded should throw test', async t => {
  const nativeAPI = await createDanceAPIWithoutLoading();

  // This should fail since we didn't call ensureSpritesAreLoaded() before play()
  let error = null;
  try {
    nativeAPI.play({
      bpm: 120,
    });
  } catch (e) {
    error = e;
  }
  t.equal(error.toString(), "Error: play() called before ensureSpritesAreLoaded() has completed!");
  t.end();

  nativeAPI.reset();
});

test('ensureSpritesAreLoaded with filtered sprite list', async t => {
  const nativeAPI = await createDanceAPIWithoutLoading();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.ensureSpritesAreLoaded(["CAT"]);
  nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), ["CAT"]);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  t.end();

  nativeAPI.reset();
});

test('ensureSpritesAreLoaded can be called multiple times and they are additive', async t => {
  const nativeAPI = await createDanceAPIWithoutLoading();
  const testInterface = nativeAPI.getTestInterface();

  nativeAPI.ensureSpritesAreLoaded(["CAT"]);
  await nativeAPI.ensureSpritesAreLoaded(["BEAR"]);
  nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), ["BEAR", "CAT"]);

  const spriteCat = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const spriteBear = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 2);
  t.equal(testInterface.getSprites()[0], spriteCat);
  t.equal(testInterface.getSprites()[1], spriteBear);

  t.end();

  nativeAPI.reset();
});


test('ensureSpritesAreLoaded can be called multiple times after play/reset', async t => {
  const nativeAPI = await createDanceAPIWithoutLoading();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.ensureSpritesAreLoaded(["CAT"]);
  nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), ["CAT"]);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  nativeAPI.reset();

  await nativeAPI.ensureSpritesAreLoaded(["BEAR"]);
  nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), ["BEAR", "CAT"]);

  const spriteCat = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const spriteBear = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 2);
  t.equal(testInterface.getSprites()[0], spriteCat);
  t.equal(testInterface.getSprites()[1], spriteBear);

  t.end();

  nativeAPI.reset();
});
