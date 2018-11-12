const test = require('tape-async');
const helpers = require('../helpers/createDanceAPI');
const constants = require('../../src/constants');

test('ensureSpritesAreLoaded sanity test', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.ensureSpritesAreLoaded();
  await nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), constants.SPRITE_NAMES);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  t.end();

  nativeAPI.reset();
});

test('Awaiting play without awaiting ensureSpritesAreLoaded sanity test', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  nativeAPI.ensureSpritesAreLoaded();
  await nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), constants.SPRITE_NAMES);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  t.end();

  nativeAPI.reset();
});

test('Awaiting play without calling ensureSpritesAreLoaded sanity test', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), constants.SPRITE_NAMES);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  t.end();

  nativeAPI.reset();
});

test('ensureSpritesAreLoaded with filtered sprite list', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.ensureSpritesAreLoaded(["CAT"]);
  await nativeAPI.play({
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
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  nativeAPI.ensureSpritesAreLoaded(["CAT"]);
  await nativeAPI.ensureSpritesAreLoaded(["BEAR"]);
  await nativeAPI.play({
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
  const nativeAPI = await helpers.createDanceAPI();
  const testInterface = nativeAPI.getTestInterface();

  await nativeAPI.ensureSpritesAreLoaded(["CAT"]);
  await nativeAPI.play({
    bpm: 120,
  });

  t.deepEqual(testInterface.getAvailableSpriteNames(), ["CAT"]);

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(testInterface.getSprites().length, 1);
  t.equal(testInterface.getSprites()[0], sprite);

  nativeAPI.reset();

  await nativeAPI.ensureSpritesAreLoaded(["BEAR"]);
  await nativeAPI.play({
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
