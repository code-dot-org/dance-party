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

test('getCues sorts measures and seconds cues', async t => {
  const nativeAPI = await createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  //Initial Value
  t.deepEqual(nativeAPI.world.cues.measures, []);
  t.deepEqual(nativeAPI.world.cues.seconds, []);

  let cues = {measures: [0, 1, 4, 2, 0, 8, 3, 3, 3], seconds: [0, 1, 4, 2, 0, 8, 3, 3, 3]};
  let sortedCues = [0, 0, 1, 2, 3, 3, 3, 4, 8];

  nativeAPI.addCues(cues);
  t.deepEqual(nativeAPI.world.cues.measures, sortedCues);
  t.deepEqual(nativeAPI.world.cues.seconds, sortedCues);

  t.end();
  nativeAPI.reset();
});

