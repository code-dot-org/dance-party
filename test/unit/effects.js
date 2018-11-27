const test = require('tape');
const sinon = require('sinon');
const helpers = require('../helpers/createDanceAPI');

test('Background effects', async t => {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });

  const spyNone = sinon.spy(nativeAPI.bgEffects_.none, 'draw');
  const spyRainbow = sinon.spy(nativeAPI.bgEffects_.rainbow, 'draw');
  const spyDisco = sinon.spy(nativeAPI.bgEffects_.disco, 'draw');

  t.equal(spyNone.callCount, 0);
  t.equal(spyRainbow.callCount, 0);
  t.equal(spyDisco.callCount, 0);

  nativeAPI.draw();

  t.equal(spyNone.callCount, 1);
  t.equal(spyRainbow.callCount, 0);
  t.equal(spyDisco.callCount, 0);

  nativeAPI.setBackgroundEffect('rainbow');
  nativeAPI.draw();

  t.equal(spyNone.callCount, 1);
  t.equal(spyRainbow.callCount, 1);
  t.equal(spyDisco.callCount, 0);

  nativeAPI.setBackgroundEffect('disco');
  nativeAPI.draw();

  t.equal(spyNone.callCount, 1);
  t.equal(spyRainbow.callCount, 1);
  t.equal(spyDisco.callCount, 1);

  nativeAPI.setBackground('blue');
  nativeAPI.draw();

  t.equal(spyNone.callCount, 2);
  t.equal(spyRainbow.callCount, 1);
  t.equal(spyDisco.callCount, 1);


  nativeAPI.reset();
  t.end();
});
