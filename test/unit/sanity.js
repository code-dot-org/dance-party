const test = require('tape');
const loadP5 = require('../../src/loadP5');
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

test('sanity', async t => {
  const nativeAPI = await createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // TODO: more tests!
  t.end();

  nativeAPI.reset();
});
