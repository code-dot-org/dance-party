const test = require('tape');
const helpers = require ('./testHelpers');

test('Sprite dance decrements and loops for prev dance', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  //Mock 4 cat animation poses
  for(let i = 0; i < 4; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
  }

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  //Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'prev', 1);
  //Looped value
  t.equal(sprite.current_move, 3);
  nativeAPI.changeMoveLR(sprite, 'prev', 1);
  //Decremented value
  t.equal(sprite.current_move, 2);
  t.end();

  nativeAPI.reset();
});

test('Sprite dance increments by one and loops for next dance', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  //Mock 3 cat animation poses
  for(let i = 0; i < 3; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
  }

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  //Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'next', 1);
  //Incremented value
  t.equal(sprite.current_move, 1);
  nativeAPI.changeMoveLR(sprite, 'next', 1);

  //Incremented value
  t.equal(sprite.current_move, 2);
  nativeAPI.changeMoveLR(sprite, 'next', 1);

  //Loops without rest move
  t.equal(sprite.current_move, 1);
  t.end();

  nativeAPI.reset();
});

test('Sprite dance changes to a new dance for random', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  //Mock 3 cat animation poses
  for(let i = 0; i < 3; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
  }

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  //Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'rand', 1);
  //Different value
  t.notEqual(sprite.current_move, 0);
  t.end();

  nativeAPI.reset();
});

test('getCurrentDance returns current move value for initialized sprite and undefined for uninitialized sprite', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, ()=> {} );

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  //Initial value
  t.equal(nativeAPI.getCurrentDance(sprite), sprite.current_move);

  let uninitializedSprite = {
    style: "DOG",
    current_move: 0,
    mirrorX: () => {},
    changeAnimation: () => {},
    animation: {looping: false}
  };

  t.equal(nativeAPI.getCurrentDance(uninitializedSprite), undefined);
  t.end();

  nativeAPI.reset();
});


test('setProp and getProp changes and retrieves sprite scale properties based on given values', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, ()=> {} );

  let uninitializedSprite = {
    style: "DOG",
    current_move: 0,
    mirrorX: () => {},
    changeAnimation: () => {},
    animation: {looping: false}
  };

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(nativeAPI.setProp(sprite, 'scale', undefined), undefined);

  nativeAPI.setProp(sprite, 'scale', 50);
  t.equal(sprite.scale, 0.5);
  t.equal(nativeAPI.getProp(sprite, 'scale'), 50);

  t.end();

  nativeAPI.reset();
});


test('setPropRandom set sprite y properties between 50 and 350', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, ()=> {} );

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(sprite.y, 200);
  nativeAPI.setPropRandom(sprite, 'y');
  t.ok(sprite.y > 50 && sprite.y < 350);

  t.end();

  nativeAPI.reset();
});
