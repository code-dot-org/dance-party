const test = require('tape');
const DanceParty = require('../../src/p5.dance');


// Mock P5 to provide context to sprite
// Creates basic cat sprite
class mockP5 {
  constructor() {
    this.allSprites = [];
  }
  createSprite() {
    this.allSprites.push({});
  };

  createGroup(){};
}

test('getCues orders and de-duplicates measures and seconds cues', t => {
  let p5Inst = new mockP5();
  let nativeAPI = new DanceParty(p5Inst, () => {});

  //Initial Value
  t.deepEqual(nativeAPI.world.cues.measures, []);
  t.deepEqual(nativeAPI.world.cues.seconds, []);

  let cues = {measures: [0, 1, 4, 2, 0, 8, 3, 3, 3], seconds: [0, 1, 4, 2, 0, 8, 3, 3, 3]};
  let sortedCues = [0, 1, 2, 3, 4, 8];

  nativeAPI.addCues(cues);
  t.deepEqual(nativeAPI.world.cues.measures, sortedCues);
  t.deepEqual(nativeAPI.world.cues.seconds, sortedCues);

  t.end();
});

