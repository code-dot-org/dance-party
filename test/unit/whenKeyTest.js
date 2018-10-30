const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('make sure we are checking all relevant keys', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  const p5 = nativeAPI.p5_;

  // simulate key presses
  p5._onkeydown({which: p5.KEY.LEFT_ARROW});
  p5._onkeydown({which: p5.KEY.SPACE});
  p5._onkeydown({which: p5.KEY.ENTER});
  p5._onkeydown({which: p5.KEY.A});
  p5._onkeydown({which: p5.KEY.Z});
  p5._onkeydown({which: p5.KEY['0']});
  p5._onkeydown({which: p5.KEY['9']});
  p5.readPresses();

  nativeAPI.updateEvents_();
  t.deepEqual(nativeAPI.currentFrameEvents['this.p5_.keyWentDown'], {
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
