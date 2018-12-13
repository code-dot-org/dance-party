const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

test('make sure we are checking all relevant keys', async t => {
  let lastEvents;
  const nativeAPI = await helpers.createDanceAPI({ onHandleEvents: events => {
    lastEvents = events;
  }});

  const p5 = nativeAPI.p5_;

  nativeAPI.play({
    bpm: 0,
  });

  // Force an entire draw cycle (synchronously)
  p5.redraw();

  // simulate key presses
  nativeAPI.onKeyDown(p5.KEY.LEFT_ARROW);
  nativeAPI.onKeyDown(p5.KEY.SPACE);
  nativeAPI.onKeyDown(p5.KEY.ENTER);
  nativeAPI.onKeyDown(p5.KEY.A);
  nativeAPI.onKeyDown(p5.KEY.Z);
  nativeAPI.onKeyDown(p5.KEY['0']);
  nativeAPI.onKeyDown(p5.KEY['9']);

  // Force another entire draw cycle (synchronously)
  p5.redraw();

  t.deepEqual(lastEvents['this.p5_.keyWentDown'], {
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
