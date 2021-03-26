const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('addCues sorts measures and seconds cues', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // Initial Values
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

test('getTime returns 0 for measures and seconds before song starts', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  // Initial Values
  t.equal(nativeAPI.getTime('measures'), 0);
  t.equal(nativeAPI.getTime('seconds'), 0);

  t.end();
  nativeAPI.reset();
});
