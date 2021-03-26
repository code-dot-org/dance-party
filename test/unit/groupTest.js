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
  nativeAPI.world.MOVE_NAMES = [
    { name: `move1` },
    { name: `move2` },
  ];
  nativeAPI.world.fullLengthMoveCount = nativeAPI.world.MOVE_NAMES.length;
  nativeAPI.world.restMoveCount = 1;

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

test('changing dance moves for empty group does nothing without error', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(catSprite.current_move, 0);
  nativeAPI.changeMoveEachLR('BEAR', 1);
  t.equal(catSprite.current_move, 0);

  t.end();

  nativeAPI.reset();
});

test('changing to a random dance for empty group does nothing without error', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(catSprite.current_move, 0);
  nativeAPI.changeMoveEachLR("BEAR", "rand");
  t.equal(catSprite.current_move, 0);
  nativeAPI.doMoveEachLR("BEAR", "rand");
  t.equal(catSprite.current_move, 0);
  t.end();

  nativeAPI.reset();
});


test('changing visibility for all updates all dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, () => {});

  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(catSprite.visible, true);
  t.equal(bearSprite.visible, true);

  nativeAPI.setVisibleEach('all', false);
  t.equal(nativeAPI.getProp(catSprite, 'visible'), false);
  t.equal(nativeAPI.getProp(bearSprite, 'visible'), false);

  nativeAPI.setTintEach('all', 'blue');
  t.equal(nativeAPI.getProp(catSprite, 'tint'), 240);
  t.equal(nativeAPI.getProp(bearSprite, 'tint'), 240);

  t.end();

  nativeAPI.reset();
});

test('changing dance speed for all updates all dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, () => {});

  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(catSprite.dance_speed, 1);
  t.equal(bearSprite.dance_speed, 1);

  nativeAPI.setDanceSpeedEach('all', 2);
  t.equal(nativeAPI.getProp(catSprite, 'dance_speed'), 2);
  t.equal(nativeAPI.getProp(bearSprite, 'dance_speed'), 2);

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
  nativeAPI.world.MOVE_NAMES = [
    { name: `move1` },
    { name: `move2` },
  ];
  nativeAPI.world.fullLengthMoveCount = nativeAPI.world.MOVE_NAMES.length;
  nativeAPI.world.restMoveCount = 1;

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

test('changing dance moves for all to rand sets same dance for all dancers', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // Mock 4 cat animation poses
  const moveCount = 4;
  for (let i = 0; i < moveCount; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    });
  }

  nativeAPI.world.fullLengthMoveCount = moveCount;
  nativeAPI.world.restMoveCount = 1;

  let spriteGroup = [];
  const groupCount = 5;
  for (let i = 0; i < groupCount; i++) {
    spriteGroup[i] = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  }

  let firstDanceMove = 2;
  nativeAPI.changeMoveEachLR('all', firstDanceMove);
  nativeAPI.changeMoveEachLR('all', 'rand');

  const newMove = spriteGroup[0].current_move;
  t.notEqual(newMove, firstDanceMove);
  for (let i = 0; i < groupCount; i++) {
    t.equal(spriteGroup[i].current_move, newMove);
  }

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

  nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  nativeAPI.makeNewDanceSprite("ALIEN", null, {x: 200, y: 200});
  nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  t.equal(nativeAPI.getGroupByName_('all').length, 4);
  t.equal(nativeAPI.getGroupByName_('CAT').length, 2);
  t.equal(nativeAPI.getGroupByName_('ALIEN').length, 1);
  t.equal(nativeAPI.getGroupByName_('DOG').length, 0);

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
  for (let i = 0; i < cats.length; i++) {
    t.equal(cats[i].x, 200);
  }

  t.end();

  nativeAPI.reset();
});

test('LayoutSprites is safe to call with any layout on an empty group', async t => {
  // Checking for divide-by-zero errors
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  ['circle', 'plus', 'x', 'grid', 'inner', 'diamond', 'top', 'row', 'bottom', 'left', 'column', 'right', 'border', 'random'].forEach(layout => {
    nativeAPI.layoutSprites('BEAR', layout);
  });

  t.end();

  nativeAPI.reset();
});

test('LayoutSprites resets rotation', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.makeNewDanceSpriteGroup(3, 'CAT', 'circle');

  nativeAPI.layoutSprites('CAT', 'grid');
  let cats = nativeAPI.getGroupByName_('CAT');
  for (let i = 0; i < cats.length; i++) {
    t.equal(cats[i].rotation, 0);
  }

  nativeAPI.layoutSprites('CAT', 'circle');
  nativeAPI.layoutSprites('CAT', 'border');
  cats = nativeAPI.getGroupByName_('CAT');
  for (let i = 0; i < cats.length; i++) {
    t.equal(cats[i].rotation, 0);
  }

  t.end();

  nativeAPI.reset();
});

test('changing property value by delta updates property by delta for all sprites', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet("BEAR", 0, {}, () => {});

  const catSprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const bearSprite = nativeAPI.makeNewDanceSprite("BEAR", null, {x: 200, y: 200});

  nativeAPI.setProp(catSprite, 'scale', 20);
  nativeAPI.setProp(bearSprite, 'scale', 35);

  nativeAPI.changePropEachBy('all', 'scale', 14);

  t.equal(nativeAPI.getProp(catSprite, 'scale'), 34);
  t.equal(nativeAPI.getProp(bearSprite, 'scale'), 49);

  t.end();

  nativeAPI.reset();
});

test('randomizing property of a group sets to individually random properties', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.makeNewDanceSpriteGroup(5, 'CAT', 'circle');

  let cats = nativeAPI.getGroupByName_('CAT');
  for (let i = 0; i < cats.length; i++) {
    nativeAPI.setProp(cats[i].name, 'scale', 20);
  }

  nativeAPI.setPropRandomEach(cats, 'scale');

  // Create a list of cat scales and fail if at least one is not unique
  // This test will fail when all five scales are randomly changed to
  // the same value and should be re-run in those flakey cases - should
  // be very rare.
  let catScales = new Set();
  for (let i = 0; i < cats.length; i++) {
    catScales.add(nativeAPI.getProp(cats[i], 'scale'));
  }

  t.true(catScales.size > 0);

  t.end();

  nativeAPI.reset();
});

test('jumpTo for a group sets each sprite location with slight variance', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  nativeAPI.makeNewDanceSpriteGroup(6, 'CAT', 'row');

  let cats = nativeAPI.getGroupByName_('CAT');

  nativeAPI.jumpToEach(cats, {x: 200, y: 100});

  let catXPositions = new Set();
  let catYPositions = new Set();
  for (let i = 0; i < cats.length; i++) {
    let newX = cats[i].x;
    let newY = cats[i].y;

    // Fail if two sprites move to the exact same position- failure should be incredibly rare
    t.false(catXPositions.has(newX) && catYPositions.has(newY));

    // Fail if a cat is outside 3 standard deviations- failure should be incredibly rare.
    t.true(newX > 185);
    t.true(newX < 215);
    t.true(newY > 85);
    t.true(newY < 115);
    catXPositions.add(newX);
    catYPositions.add(newY);
  }

  t.end();

  nativeAPI.reset();
});
