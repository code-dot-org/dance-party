const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

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
  const nativeAPI = await helpers.createDanceAPI({
    i18n: {
      measure: () => 'hello'
    },
  });
  nativeAPI.play({
    bpm: 0,
  });

  nativeAPI.p5_.text = text => {
    t.equals(text, 'hello 0');
    t.end();
  };

  nativeAPI.reset();
});
