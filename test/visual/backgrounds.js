const test = require('tape');
const helpers = require('../helpers/createDanceAPI');
const parseDataURL = require('data-urls');
const fs = require('fs');

test('save an image', async t => {
  const nativeAPI = await helpers.createDanceAPI();

  nativeAPI.setBackgroundEffect('swirl');
  nativeAPI.getBackgroundEffect().draw({bpm: 120});

  const buffer = parseDataURL(nativeAPI.p5_.canvas.toDataURL()).body;
  fs.writeFileSync('out.png', buffer);

  nativeAPI.reset();
  t.end();
});
