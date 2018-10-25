const test = require('tape');
const DanceParty = require('../../src/p5.dance');


// Mock P5 to provide context to sprite
// Creates basic cat sprite
class mockP5 {
  constructor() {
    this.allSprites = [];
  }

  createSprite() {
    this.allSprites.push({
      style: "CAT",
      current_move: 0,
      mirrorX: () => {},
      changeAnimation: () => {},
      animation: {looping: false}
    });
  };

  createGroup(){};
}

test('Sprite dance decrements and loops for prev dance', t => {
  let p5Inst = new mockP5();
  p5Inst.createSprite();
  let nativeAPI = new DanceParty(p5Inst, () => {});
  //Mock 4 cat animation poses
  for(let i = 0; i < 3; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
  }

  //Initial value
  t.equal(p5Inst.allSprites[0].current_move, 0);
  nativeAPI.changeMoveLR(p5Inst.allSprites[0], 'prev', 1);
  //Looped value
  t.equal(p5Inst.allSprites[0].current_move, 2);
  nativeAPI.changeMoveLR(p5Inst.allSprites[0], 'prev', 1);
  //Decremented value
  t.equal(p5Inst.allSprites[0].current_move, 1);
  nativeAPI.changeMoveLR(p5Inst.allSprites[0], 'prev', 1);
  //Loops without rest move
  t.equal(p5Inst.allSprites[0].current_move, 2);
  t.end();
});

test('Sprite dance increments and loops for next dance', t => {
  let p5Inst = new mockP5();
  p5Inst.createSprite();
  let nativeAPI = new DanceParty(p5Inst, () => {});
  //Mock 4 cat animation poses
  for(let i = 0; i < 3; i++) {
    nativeAPI.setAnimationSpriteSheet("CAT", i, {}, ()=> {} );
  }

  //Initial value
  t.equal(p5Inst.allSprites[0].current_move, 0);
  nativeAPI.changeMoveLR(p5Inst.allSprites[0], 'next', 1);
  //Incremented value
  t.equal(p5Inst.allSprites[0].current_move, 1);
  nativeAPI.changeMoveLR(p5Inst.allSprites[0], 'next', 1);

  //Incremented value
  t.equal(p5Inst.allSprites[0].current_move, 2);
  nativeAPI.changeMoveLR(p5Inst.allSprites[0], 'next', 1);

  //Loops without rest move
  t.equal(p5Inst.allSprites[0].current_move, 1);
  t.end();
});
