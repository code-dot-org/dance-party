const test = require('tape-async');
const helpers = require('../helpers/createDanceAPI');
const sinon = require('sinon');

test('Shows 0 for current measure when current measure is negative', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  sinon.stub(nativeAPI.p5_, 'text');

  // Pickup measure count determined by BPM and Delay
  const fakeSongData = {
    "bpm": 120,
    "delay": 4.0,
  };
  await nativeAPI.play(fakeSongData);

  // text() draw call shows zero measures
  // getCurrentMeasure() still gives negative value for other work
  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 1);
  t.equal(nativeAPI.p5_.text.firstCall.args[0], 'Measure: 0');
  t.assert(nativeAPI.getCurrentMeasure() - (-1) < 0.1);

  // // Advance one measure
  const clock = sinon.useFakeTimers(Date.now());
  clock.tick(2000);

  // text() draw call still shows zero measures
  // getCurrentMeasure() has advanced to zero
  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 2);
  t.equal(nativeAPI.p5_.text.secondCall.args[0], 'Measure: 0');
  t.assert(nativeAPI.getCurrentMeasure() - (0) < 0.1);

  // Advance one more measure
  clock.tick(2000);

  // draw call and getCurrentMeasure() are now advancing together
  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 3);
  t.equal(nativeAPI.p5_.text.thirdCall.args[0], 'Measure: 1');
  t.assert(nativeAPI.getCurrentMeasure() - (1) < 0.1);

  t.end();
  nativeAPI.reset();
  clock.restore();
});

