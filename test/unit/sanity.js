const test = require('tape');
const helpers = require('../helpers/createDanceAPI');
const sinon = require('sinon');

test('sanity', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  // TODO: more tests!
  t.end();

  nativeAPI.reset();
});

test('i18n', async t => {
  const clock = sinon.useFakeTimers(Date.now());
  const nativeAPI = await helpers.createDanceAPI({
    i18n: {
      measure: () => 'hello'
    },
  });
  nativeAPI.play({
    bpm: 120,
    delay: 0,
  });

  sinon.stub(nativeAPI.p5_, 'text');

  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 1);
  t.equal(nativeAPI.p5_.text.firstCall.args[0], 'hello 1');

  // Advance one measure
  clock.tick(2000);

  nativeAPI.draw();
  t.equal(nativeAPI.p5_.text.callCount, 2);
  t.equal(nativeAPI.p5_.text.secondCall.args[0], 'hello 2');

  t.end();
  nativeAPI.reset();
});

test('draw without songData', async t => {
  // we have a valid scenario where draw is called without having set any song
  // metadata. make sure that we dont hit any exceptions in that path
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.draw();

  t.end();

  nativeAPI.reset();
});
