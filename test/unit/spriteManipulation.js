const test = require('tape');
const sinon = require('sinon');
const constants = require('../../src/constants');
const helpers = require('../helpers/createDanceAPI');
const UnitTestResourceLoader = require('../helpers/UnitTestResourceLoader');

test('Sprite dance decrements and loops for prev dance', async t => {
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
  for (let i = 0; i < moveCount; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    });
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
  for (let i = 0; i < moveCount; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
    nativeAPI.world.MOVE_NAMES.push({
      name: `move${i}`
    });
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
    for (let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i === 0,
      });
    }
    nativeAPI.world.fullLengthMoveCount = moveCount;
    nativeAPI.world.restMoveCount = 1;

    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  };

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
    // These tests set up their own moves, assuming no initial moves
    const nativeAPI = await helpers.createDanceAPI({
      spriteConfig: world => world.MOVE_NAMES = []
    });
    nativeAPI.play({
      bpm: 120,
    });

    // Mock cat animation poses
    for (let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i === 0,
      });
    }
    nativeAPI.world.fullLengthMoveCount = moveCount;
    nativeAPI.world.restMoveCount = 1;

    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  };

  // Verify invalid string parameter behavior:
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      // Passing 'some_string' should fail
      nativeAPI.changeMoveLR(sprite, 'some_string', 1);
    } catch (e) {
      error = e;
    }
    t.equal(error.toString(), "Error: Unexpected requestedChange value: some_string");
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
    t.equal(error.toString(), "Error: Not moving to a valid full length move index!");
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
    t.equal(error.toString(), "Error: next/prev/rand requires that we have 2 or more selectable moves");
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
    t.equal(error.toString(), "Error: Invalid move index: 3");
  }});

  // Verify "next" is not allowed for doMoveLR():
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      nativeAPI.doMoveLR(sprite, 'next', 1);
    } catch (e) {
      error = e;
    }
    t.equal(error.toString(), "Error: Unexpected requestedChange value: next");
  }});

  // Verify "prev" is not allowed for doMoveLR():
  await subTest({ testCode: ({ nativeAPI, sprite }) => {
    let error = null;
    try {
      nativeAPI.doMoveLR(sprite, 'prev', 1);
    } catch (e) {
      error = e;
    }
    t.equal(error.toString(), "Error: Unexpected requestedChange value: prev");
  }});

  t.end();
});

test('Sprite move sorting works reliably', async t => {
  const subTest = async ({ moveNames, testCode }) => {
    const nativeAPI = await helpers.createDanceAPI({
      spriteConfig: world => { world.MOVE_NAMES = moveNames; },
      resourceLoader: new UnitTestResourceLoader(constants.SPRITE_NAMES, moveNames),
    });

    nativeAPI.p5_.noLoop();

    testCode({ nativeAPI });

    nativeAPI.reset();
  };

  // Verify we don't modify moveNames that are already sorted properly:
  const moveNamesPreSorted = [
    {
      name: 'rest',
      rest: true,
    },
    {
      name: 'fullLength1',
    },
    {
      name: 'fullLength2',
    },
    {
      name: 'shortBurst1',
      shortBurst: true,
    },
    {
      name: 'shortBurst2',
      shortBurst: true,
    },
  ];

  await subTest({ moveNames: moveNamesPreSorted, testCode: ({ nativeAPI }) => {
    // The MOVE_NAMES as provided have not been changed.
    t.deepEqual(nativeAPI.world.MOVE_NAMES, moveNamesPreSorted);

    // The restMoveCount and fullLengthMoveCount are correct:
    t.equal(nativeAPI.world.restMoveCount, 1);
    t.equal(nativeAPI.world.fullLengthMoveCount, 3);
  }});

  // Verify we do properly sort rest and shortBurst moves:
  const moveNamesUnSorted = [
    {
      name: 'fullLength',
    },
    {
      name: 'shortBurst',
      shortBurst: true,
    },
    {
      name: 'rest',
      rest: true,
    },
  ];

  await subTest({ moveNames: moveNamesUnSorted, testCode: ({ nativeAPI }) => {
    // The MOVE_NAMES are now in the proper order:
    t.equal(nativeAPI.world.MOVE_NAMES[0].name, 'rest');
    t.ok(nativeAPI.world.MOVE_NAMES[0].rest);

    t.equal(nativeAPI.world.MOVE_NAMES[1].name, 'fullLength');

    t.equal(nativeAPI.world.MOVE_NAMES[2].name, 'shortBurst');
    t.ok(nativeAPI.world.MOVE_NAMES[2].shortBurst);

    // The restMoveCount and fullLengthMoveCount are correct:
    t.equal(nativeAPI.world.restMoveCount, 1);
    t.equal(nativeAPI.world.fullLengthMoveCount, 2);
  }});

  t.end();
});

test('Sprite doMove rand will choose short burst', async t => {
  const moveNamesOneFullLengthOneShortBurst = [
    {
      name: 'rest',
      rest: true,
    },
    {
      name: 'shortBurst1',
      shortBurst: true,
    },
  ];

  const nativeAPI = await helpers.createDanceAPI({
    spriteConfig: world => { world.MOVE_NAMES = moveNamesOneFullLengthOneShortBurst; },
    resourceLoader: new UnitTestResourceLoader(constants.SPRITE_NAMES, moveNamesOneFullLengthOneShortBurst),
  });

  nativeAPI.p5_.noLoop();

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  t.equal(sprite.getAnimationLabel(), 'anim0');

  nativeAPI.doMoveLR(sprite, 'rand', 1);

  // Verify the animation has changed to anim1
  t.equal(sprite.getAnimationLabel(), 'anim1');

  nativeAPI.reset();

  t.end();
});

test('Sprite dance changes will allow short burst moves for doMoveLR but not changeMoveLR', async t => {

  const subTest = async ({ moveCount = 3, shortMoveCount = 1, testCode }) => {
    const nativeAPI = await helpers.createDanceAPI();
    nativeAPI.play({
      bpm: 120,
    });

    // Mock cat animation poses
    for (let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i === 0,
        shortBurst: i >= (moveCount - shortMoveCount),
      });
    }
    nativeAPI.world.fullLengthMoveCount = moveCount - shortMoveCount;
    nativeAPI.world.restMoveCount = 1;

    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  };

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
    t.equal(sprite.getAnimationLabel(), 'anim1');
    t.equal(sprite.current_move, 1);

    // Rest move:
    nativeAPI.changeMoveLR(sprite, 0, 1);
    t.equal(sprite.getAnimationLabel(), 'anim0');
    t.equal(sprite.current_move, 0);

    // Short burst move:
    let error = null;
    try {
      nativeAPI.changeMoveLR(sprite, 2, 1);
    } catch (e) {
      error = e;
    }
    t.notEqual(error, null, "short burst move should fail with changeMoveLR");
    t.equal(sprite.getAnimationLabel(), 'anim0');
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

test('p5 fixedSpriteAnimationSizes is true', async t => {
  // Turning this flag on allows us to scale a sprite horizontally and vertically
  const nativeAPI = await helpers.createDanceAPI();
  t.ok(nativeAPI.p5_._fixedSpriteAnimationFrameSizes);
  t.end();

  nativeAPI.reset();
});

test('changing width and height accounted for during p5 draw', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // Initial value
  t.equal(nativeAPI.p5_.allSprites.get(0)._getScaleX(), 1);
  t.equal(nativeAPI.p5_.allSprites.get(0)._getScaleY(), 1);

  nativeAPI.setProp(sprite, "width", 50);
  nativeAPI.setProp(sprite, 'height', 75);

  // setProp sets the value to SIZE (300) * (val / 100)
  t.equal(nativeAPI.p5_.allSprites.get(0)._getScaleX(), 150);
  t.equal(nativeAPI.p5_.allSprites.get(0)._getScaleY(), 225);

  t.end();

  nativeAPI.reset();
});


test('prev, next, and rand dance move will throw when not enough dance moves', async t => {

  const subTest = async ({moveCount = 1, testCode}) => {
    const nativeAPI = await helpers.createDanceAPI({
      spriteConfig: world => world.MOVE_NAMES = []
    });
    nativeAPI.play({
      bpm: 120,
    });

    // Mock cat animation poses
    for (let i = 0; i < moveCount; i++) {
      nativeAPI.setAnimationSpriteSheet("CAT", i, {}, () => {});
      nativeAPI.world.MOVE_NAMES.push({
        name: `move${i}`,
        rest: i === 0,
      });
    }
    nativeAPI.world.fullLengthMoveCount = moveCount;
    nativeAPI.world.restMoveCount = 1;

    const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    testCode({ nativeAPI, sprite });

    nativeAPI.reset();
  };

  // Verify invalid number of tests:
  await subTest({ testCode: ({nativeAPI, sprite}) => {
    let error = null;
    try {
      // Requesting 'rand' when only one dance should fail
      nativeAPI.changeMoveLR(sprite, 'rand', 1);
    } catch (e) {
      error = e;
    }
    t.equal(error.toString(), "Error: next/prev/rand requires that we have 2 or more selectable moves");
  }});

  // Verify invalid move index behavior for changeMoveLR():
  await subTest({ testCode: ({nativeAPI, sprite}) => {
    let error = null;
    try {
      // Requesting 'next' when only one dance should fail
      nativeAPI.changeMoveLR(sprite, 'next', 1);
    } catch (e) {
      error = e;
    }
    t.equal(error.toString(), "Error: next/prev/rand requires that we have 2 or more selectable moves");
  }});

  // Verify invalid rand move because we don't have any different, non-resting moves:
  await subTest({ moveCount: 2, testCode: ({nativeAPI, sprite}) => {
    let error = null;
    try {
      // Requesting 'prev' when only one dance should fail
      nativeAPI.changeMoveLR(sprite, 'prev', 1);
    } catch (e) {
      error = e;
    }
    t.equal(error.toString(), "Error: next/prev/rand requires that we have 2 or more selectable moves");
  }});

  t.end();
});

test('startMapping/stopMapping adds and removes behaviors', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});

  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // This is 1 only because we have a behavior that we add to every sprite
  // (which should arguably be a different concept)
  t.equal(sprite.behaviors.length, 1);

  nativeAPI.startMapping(sprite, 'x', 'bass');

  t.equal(sprite.behaviors.length, 2);

  // adding the same mapping again gets ignored
  nativeAPI.startMapping(sprite, 'x', 'bass');
  t.equal(sprite.behaviors.length, 2);

  // changing the range gives a new behavior
  nativeAPI.startMapping(sprite, 'x', 'treble');
  t.equal(sprite.behaviors.length, 3);

  // changing the property gives a new behavior
  nativeAPI.startMapping(sprite, 'y', 'bass');
  t.equal(sprite.behaviors.length, 4);

  // stop mapping removes behavior
  nativeAPI.stopMapping(sprite, 'x', 'bass');
  t.equal(sprite.behaviors.length, 3);

  // removing a non-existent behavior is a noop
  nativeAPI.stopMapping(sprite, 'rotation', 'bass');
  t.equal(sprite.behaviors.length, 3);

  t.end();
  nativeAPI.reset();
});

test('startMapping results in sprite properties being updated', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, () => {});
  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const sprite2 = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  const sprite3 = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  // hard code the energy values at different levels
  const getEnergy = sinon.stub(nativeAPI, 'getEnergy');
  getEnergy.withArgs('bass').returns(0);
  getEnergy.withArgs('mid').returns(128);
  getEnergy.withArgs('treble').returns(255);

  nativeAPI.startMapping(sprite, 'x', 'bass');
  nativeAPI.startMapping(sprite, 'y', 'treble');

  nativeAPI.startMapping(sprite2, 'scale', 'bass');
  nativeAPI.startMapping(sprite2, 'width', 'mid');
  nativeAPI.startMapping(sprite2, 'height', 'treble');

  nativeAPI.startMapping(sprite3, 'rotation', 'bass');
  nativeAPI.startMapping(sprite3, 'tint', 'treble');

  const initials = {
    x: sprite.x,
    y: sprite.y,

    scale: sprite.scale,
    width: sprite.width,
    height: sprite.height,

    rotation: sprite.rotation,
  };

  setTimeout(() => {
    // x and y position is relative to initial position
    t.equal(sprite.x, initials.x - 100);
    t.equal(sprite.y, initials.y + 100);

    t.equal(sprite2.scale, initials.scale * 0.5);
    // sprite2.width should be effectively 1, but not necessarily exactly due to
    // how we do our mpping
    t.ok(Math.abs(sprite2.width - initials.width) < 1/255);
    t.equal(sprite2.height, initials.height * 1.5);

    t.equal(sprite3.rotation, initials.rotation - 60);

    // tint is still absolute (not relative)
    t.equal(sprite3.tint, 'hsb(360,100%,100%)');

    t.end();

    nativeAPI.reset();
    nativeAPI.getEnergy.restore();
  }, 100);
});
