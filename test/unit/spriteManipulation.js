const test = require('tape');
const DanceParty = require('../../src/p5.dance');

const createDanceAPI = () => {
  return new Promise(resolve => {
    new DanceParty({
      moveNames: [],
      onInit: nativeAPI => resolve(nativeAPI),
    });
  });
};

test.only('Sprite dance decrements and loops for prev dance', async t => {
  const nativeAPI = await createDanceAPI();

  //Mock 4 cat animation poses
  for(let i = 0; i < 4; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
  }

  debugger;
  const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

  //Initial value
  t.equal(sprite.current_move, 0);
  nativeAPI.changeMoveLR(sprite, 'prev', 1);
  //Looped value
  t.equal(sprite.current_move, 3);
  nativeAPI.changeMoveLR(sprite, 'prev', 1);
  //Decremented value
  t.equal(sprite.current_move, 2);
});

// test('Sprite dance increments by two and loops for next dance', async t => {
//   let nativeAPI = new DanceParty({});
//   await nativeAPI.init();
//
//   //Mock 4 cat animation poses
//   for(let i = 0; i < 4; i++) {
//     nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
//   }
//
//   const sprite = nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
//
//   //Initial value
//   t.equal(sprite.current_move, 0);
//   nativeAPI.changeMoveLR(sprite, 'next', 1);
//   //Incremented value
//   t.equal(sprite.current_move, 2);
//   nativeAPI.changeMoveLR(sprite, 'next', 1);
//   //Looped value
//   t.equal(sprite.current_move, 1);
//   t.end();
// });
