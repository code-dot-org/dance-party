const test = require('tape');
const helpers = require('../helpers/createDanceAPI');
const sinon = require('sinon');

test('Shows 0 for current measure when current measure is negative', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  sinon.stub(nativeAPI.p5_, 'text');

  const clock = sinon.useFakeTimers(Date.now());

  // Pickup measure count determined by BPM and Delay
  const fakeSongData = {
    "bpm": 120,
    "delay": 4.0,
  };
  nativeAPI.play(fakeSongData);

  // text() draw call doesn't display measure text yet
  // getCurrentMeasure() still gives negative value for other work
  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 0);
  t.equal(nativeAPI.getCurrentMeasure(), -1);

  // Advance one measure
  clock.tick(2000);

  // text() draw call still doesn't display measure text
  // getCurrentMeasure() has advanced to zero
  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 0);
  t.equal(nativeAPI.getCurrentMeasure(), 0);

  // Advance one more measure
  clock.tick(2000);

  // draw call and getCurrentMeasure() are now advancing together
  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 1);
  t.equal(nativeAPI.p5_.text.firstCall.args[0], 'Measure: 1');
  t.equal(nativeAPI.getCurrentMeasure(), 1);

  t.end();
  nativeAPI.reset();
  clock.restore();
});
