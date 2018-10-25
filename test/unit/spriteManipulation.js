const test = require('tape');
const DanceParty = require('../../src/p5.dance');

const createDanceAPI = () => {
  return new Promise(resolve => {
    new DanceParty({
      moveNames: [],
      playSound: ({callback}) => callback(),
      onInit: nativeAPI => resolve(nativeAPI),
    });
  });
};

test('Sprite dance decrements and loops for prev dance', async t => {
  const nativeAPI = await createDanceAPI();
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

test('Sprite dance increments by two and loops for next dance', async t => {
  const nativeAPI = await createDanceAPI();
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
});
