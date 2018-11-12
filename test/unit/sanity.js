const test = require('tape-async');
const helpers = require('../helpers/createDanceAPI');

test('sanity', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  await nativeAPI.play({
    bpm: 120,
  });

  // TODO: more tests!
  t.end();

  nativeAPI.reset();
});

test('i18n', async t => {
  const nativeAPI = await helpers.createDanceAPI({
    i18n: {
      measure: () => 'hello'
    },
  });
  await nativeAPI.play({
    bpm: 0,
  });

  nativeAPI.p5_.text = text => {
    t.equals(text, 'hello 0');
    t.end();
    nativeAPI.p5_.text = () => {};
  };

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
