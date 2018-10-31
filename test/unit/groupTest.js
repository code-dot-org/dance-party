const helpers = require('../helpers/createDanceAPI');
const test = require('tape');

test('changing dance moves for all updates all dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("CAT", 1, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 1, {}, () => {});

  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(catSprite.current_move, 0);
  t.equal(bearSprite.current_move, 0);
  nativeAPI.changeMoveEachLR('all', 1);

  t.equal(catSprite.current_move, 1);
  t.equal(bearSprite.current_move, 1);

  t.end();

  nativeAPI.reset();
});

test('changing dance moves for all cats updates only all cat dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("CAT", 1, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 1, {}, () => {});

  const catSpriteAlpha = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const catSpriteBeta = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(catSpriteAlpha.current_move, 0);
  t.equal(catSpriteBeta.current_move, 0);
  t.equal(bearSprite.current_move, 0);
  nativeAPI.changeMoveEachLR('CAT', 1);

  t.equal(catSpriteAlpha.current_move, 1);
  t.equal(catSpriteBeta.current_move, 1);
  t.equal(bearSprite.current_move, 0);

  t.end();

  nativeAPI.reset();
});

test('GetGroupByName returns the expected number of sprites ', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("ALIEN", 0, {}, () => {});

  const catSpriteAlpha = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const catSpriteBeta = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const alienSprite = nativeAPI.makeNewDanceSprite("ALIEN", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(nativeAPI.getGroupByName_('all').length, 4);
  t.equal(nativeAPI.getGroupByName_('CAT').length, 2);
  t.equal(nativeAPI.getGroupByName_('ALIEN').length, 1);
  t.equal(nativeAPI.getGroupByName_('DOG'), undefined);

  t.end();

  nativeAPI.reset();
});

test('MakeNewDanceSpriteGroup returns the expected number of the given costumed sprites ', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.makeNewDanceSpriteGroup(4, 'CAT', 'circle');

  t.equal(nativeAPI.getGroupByName_('CAT').length, 4);

  t.end();

  nativeAPI.reset();
});

test('LayoutSprites sets the x position of sprites in the expected orientation', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.makeNewDanceSpriteGroup(3, 'CAT', 'circle');
  nativeAPI.layoutSprites('CAT', 'column');

  let cats = nativeAPI.getGroupByName_('CAT');
  for(let i = 0; i < cats.length; i++){
    t.equal(cats[i].x, 200);
  }

  t.end();

  nativeAPI.reset();
});
