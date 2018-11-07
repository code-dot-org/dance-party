const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('make sure we are checking all relevant keys', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const p5 = nativeAPI.p5_;

  // simulate key presses
  nativeAPI.onKeyDown(p5.KEY.LEFT_ARROW);
  nativeAPI.onKeyDown(p5.KEY.SPACE);
  nativeAPI.onKeyDown(p5.KEY.ENTER);
  nativeAPI.onKeyDown(p5.KEY.A);
  nativeAPI.onKeyDown(p5.KEY.Z);
  nativeAPI.onKeyDown(p5.KEY['0']);
  nativeAPI.onKeyDown(p5.KEY['9']);
  p5.readPresses();

  const events = nativeAPI.updateEvents_();
  t.deepEqual(events['this.p5_.keyWentDown'], {
    left: true,
    space: true,
    enter: true,
    a: true,
    z: true,
    0: true,
    9: true,
  });

  t.end();
  nativeAPI.reset();
});
