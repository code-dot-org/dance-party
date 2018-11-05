const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('Sprite dance decrements and loops for prev dance', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // Mock 4 cat animation poses
  const moveCount = 4;
  for(let i = 0; i < moveCount; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    })
  }
  nativeAPI.world.fullLengthMoveCount = moveCount;
  nativeAPI.world.restMoveCount = 1;

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'prev', 1);
  // Looped value
  t.equal(sprite.current_move, 3);
  nativeAPI.changeMoveLR(sprite, 'prev', 1);
  // Decremented value
  t.equal(sprite.current_move, 2);
  t.end();

  nativeAPI.reset();
});

test('Sprite dance increments by one and loops for next dance', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // Mock 3 cat animation poses
  const moveCount = 3;
  for(let i = 0; i < moveCount; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    })
  }
  nativeAPI.world.fullLengthMoveCount = moveCount;
  nativeAPI.world.restMoveCount = 1;

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'next', 1);
  // Incremented value
  t.equal(sprite.current_move, 1);
  nativeAPI.changeMoveLR(sprite, 'next', 1);

  // Incremented value
  t.equal(sprite.current_move, 2);
  nativeAPI.changeMoveLR(sprite, 'next', 1);

  // Loops without rest move
  t.equal(sprite.current_move, 1);
  t.end();

  nativeAPI.reset();
});

test('Sprite dance changes to a new dance for random', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // Mock 3 cat animation poses
  const moveCount = 3;
  for(let i = 0; i < moveCount; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    })
  }
  nativeAPI.world.fullLengthMoveCount = moveCount;
  nativeAPI.world.restMoveCount = 1;

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'rand', 1);
  // Different value
  t.notEqual(sprite.current_move, 0);
  t.end();

  nativeAPI.reset();
});

test('Sprite dance changes with next/prev/rand avoids rest dance', async t => {

  const subTest = async testCode => {
    const nativeAPI = await helpers.createDanceAPI();
    nativeAPI.play({
      bpm: 120,
    });
  
    // Mock 3 cat animation poses
    const moveCount = 3;
    for(let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i == 0,
      })
    }
    nativeAPI.world.fullLengthMoveCount = moveCount;
    nativeAPI.world.restMoveCount = 1;
  
    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});  

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  }

  // Verify Next behavior:
  await subTest(({ nativeAPI, sprite }) => {
    // Initial value
    t.equal(sprite.current_move, 0);
    nativeAPI.changeMoveLR(sprite, 'next', 1);
    // Index 1
    t.equal(sprite.current_move, 1);
    nativeAPI.changeMoveLR(sprite, 'next', 1);
    // Index 2
    t.equal(sprite.current_move, 2);
    nativeAPI.changeMoveLR(sprite, 'next', 1);
    // Loops back to index 1 (skipping 0, which is the rest dance)
    t.equal(sprite.current_move, 1);
  });

  // Verify Prev behavior:
  await subTest(({ nativeAPI, sprite }) => {
    // Initial value
    t.equal(sprite.current_move, 0);
    nativeAPI.changeMoveLR(sprite, 'prev', 1);
    // Index 2
    t.equal(sprite.current_move, 2);
    nativeAPI.changeMoveLR(sprite, 'prev', 1);
    // Index 1
    t.equal(sprite.current_move, 1);
    nativeAPI.changeMoveLR(sprite, 'prev', 1);
    // Loops back to index 2 (skipping 0, which is the rest dance)
    t.equal(sprite.current_move, 2);
  });

  // Verify Rand behavior:
  await subTest(({ nativeAPI, sprite }) => {
    // Initial value
    t.equal(sprite.current_move, 0);
    nativeAPI.changeMoveLR(sprite, 1, 1);
    // Index 1
    t.equal(sprite.current_move, 1);
    nativeAPI.changeMoveLR(sprite, 'rand', 1);
    // Must be Index 2 (must be different and not 0, which is the rest dance)
    t.equal(sprite.current_move, 2);
    nativeAPI.changeMoveLR(sprite, 'rand', 1);
    // Must be Index 1 (must be different and not 0, which is the rest dance)
    t.equal(sprite.current_move, 1);
  });

  t.end();
});

test('Sprite dance changes will throw with invalid parameters', async t => {

  const subTest = async ({ moveCount = 3, testCode }) => {
    const nativeAPI = await helpers.createDanceAPI();
    nativeAPI.play({
      bpm: 120,
    });
  
    // Mock cat animation poses
    for(let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i == 0,
      })
    }
    nativeAPI.world.fullLengthMoveCount = moveCount;
    nativeAPI.world.restMoveCount = 1;
  
    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});  

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  }

  // Verify invalid string parameter behavior:
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      // Passing 'some_string' should fail
      nativeAPI.changeMoveLR(sprite, 'some_string', 1);
    } catch (e) {
      error = e;
    }
    t.notEqual(error, null, "invalid string parameter");
  }});

  // Verify invalid move index behavior for changeMoveLR():
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      // Passing 3 should fail (index is too large)
      nativeAPI.changeMoveLR(sprite, 3, 1);
    } catch (e) {
      error = e;
    }
    t.notEqual(error, null, "invalid move index for changeMoveLR");
  }});

  // Verify invalid rand move because we don't have any different, non-resting moves:
  await subTest({ moveCount: 2, testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      // Passing 'rand' should fail
      nativeAPI.changeMoveLR(sprite, 'rand', 1);
    } catch (e) {
      error = e;
    }
    t.notEqual(error, null, "invalid rand move");
  }});

  // Verify invalid move index behavior for doMoveLR():
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      // Passing 3 should fail (index is too large)
      nativeAPI.doMoveLR(sprite, 3, 1);
    } catch (e) {
      error = e;
    }
    t.notEqual(error, null, "invalid move index for doMoveLR");
  }});

  t.end();
});

test('Sprite dance changes will allow short burst moves for doMoveLR but not changeMoveLR', async t => {

  const subTest = async ({ moveCount = 3, shortMoveCount = 1, testCode }) => {
    const nativeAPI = await helpers.createDanceAPI();
    nativeAPI.play({
      bpm: 120,
    });
  
    // Mock cat animation poses
    for(let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i == 0,
        shortBurst: i >= (moveCount - shortMoveCount),
      })
    }
    nativeAPI.world.fullLengthMoveCount = moveCount - shortMoveCount;
    nativeAPI.world.restMoveCount = 1;
  
    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});  

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  }

  // Verify we can call doMoveLR() with a rest, full length, and short burst move:
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    // Full length move:
    nativeAPI.doMoveLR(sprite, 1, 1);
    t.equal(sprite.getAnimationLabel(), 'anim1');

    // Rest move:
    nativeAPI.doMoveLR(sprite, 0, 1);
    t.equal(sprite.getAnimationLabel(), 'anim0');

    // Short burst move:
    nativeAPI.doMoveLR(sprite, 2, 1);
    t.equal(sprite.getAnimationLabel(), 'anim2');
  }});

  // Verify we can call changeMoveLR() with a rest or a full length, but not a short burst move:
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    // Full length move:
    nativeAPI.changeMoveLR(sprite, 1, 1);
    t.equal(sprite.current_move, 1);

    // Rest move:
    nativeAPI.changeMoveLR(sprite, 0, 1);
    t.equal(sprite.current_move, 0);

    // Short burst move:
    let error = null;
    try {
      // Passing 3 should fail (index is too large)
      nativeAPI.changeMoveLR(sprite, 2, 1);
    } catch (e) {
      error = e;
    }
    t.notEqual(error, null, "short burst move should fail with changeMoveLR");
    t.equal(sprite.current_move, 0);
  }});

  t.end();
});

test('getCurrentDance returns current move value for initialized sprite and undefined for uninitialized sprite', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // Initial value
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
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});

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
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(sprite.y, 200);
  nativeAPI.setPropRandom(sprite, 'y');
  t.ok(sprite.y > 50 && sprite.y < 350);

  t.end();

  nativeAPI.reset();
});
