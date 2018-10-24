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
      animation: {looping: false},
      scale: 1,
      y: 100
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

test('getCurrentDance returns current move value for initialized sprite and undefined for uninitialized sprite', t => {
  let p5Inst = new mockP5();
  p5Inst.createSprite();
  let nativeAPI = new DanceParty(p5Inst, () => {});
  nativeAPI.setAnimationSpriteSheet("CAT", 0, {}, ()=> {} );

  //Initial value
  t.equal(nativeAPI.getCurrentDance(p5Inst.allSprites[0]), p5Inst.allSprites[0].current_move);

  let uninitializedSprite = {
    style: "DOG",
    current_move: 0,
    mirrorX: () => {},
    changeAnimation: () => {},
    animation: {looping: false}
  };

  t.equal(nativeAPI.getCurrentDance(uninitializedSprite), undefined);
  t.end();
});


test('setProp and getProp changes and retrieves sprite scale properties based on given values', t => {
  let p5Inst = new mockP5();
  p5Inst.createSprite();
  let nativeAPI = new DanceParty(p5Inst, () => {});
  let uninitializedSprite = {
    style: "DOG",
    current_move: 0,
    mirrorX: () => {},
    changeAnimation: () => {},
    animation: {looping: false}
  };

  t.equal(nativeAPI.setProp(uninitializedSprite, 'scale', 10), undefined);
  t.equal(nativeAPI.setProp(p5Inst.allSprites[0], 'scale', undefined), undefined);

  nativeAPI.setProp(p5Inst.allSprites[0], 'scale', 50);
  t.equal(p5Inst.allSprites[0].scale, 0.5);
  t.equal(nativeAPI.getProp(p5Inst.allSprites[0], 'scale'), 50);

  t.end();
});


test('setPropRandom set sprite y properties between 50 and 350', t => {
  let p5Inst = new mockP5();
  p5Inst.createSprite();
  let nativeAPI = new DanceParty(p5Inst, () => {});

  t.equal(p5Inst.allSprites[0].y, 100);
  nativeAPI.setPropRandom(p5Inst.allSprites[0], 'y');
  t.ok(p5Inst.allSprites[0].y > 50 && p5Inst.allSprites[0].y < 350);

  t.end();
});
