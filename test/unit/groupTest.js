const helpers = require ('./testHelpers');
const test = require('tape');

test('changing dance moves for all updates all dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, ()=> {} );
  nativeAPI.setAnimationSpriteSheet("CAT", 1, {}, ()=> {} );
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, ()=> {} );
  nativeAPI.setAnimationSpriteSheet("BEAR", 1, {}, ()=> {} );

  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});


  t.equal(catSprite.current_move, 0);
  t.equal(bearSprite.current_move, 0);
  nativeAPI.changeMoveEachLR('all', 1);

  t.equal(catSprite.current_move, 1);
  t.equal(bearSprite.current_move, 1);

  t.end();

  nativeAPI.reset();
});


test.only('changing dance moves for all cats updates only all cat dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, ()=> {} );
  nativeAPI.setAnimationSpriteSheet("CAT", 1, {}, ()=> {} );
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, ()=> {} );
  nativeAPI.setAnimationSpriteSheet("BEAR", 1, {}, ()=> {} );

  const catSpriteAlpha = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const catSpriteBeta = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});


  t.equal(catSpriteAlpha.current_move, 0);
  t.equal(catSpriteBeta.current_move, 0);
  t.equal(bearSprite.current_move, 0);
  nativeAPI.changeMoveEachLR('CAT', 1);

  t.equal(catSpriteAlpha.current_move, 1);
  t.equal(catSpriteBeta.current_move, 1);
  t.equal(bearSprite.current_move, 1);

  t.end();

  nativeAPI.reset();
});

