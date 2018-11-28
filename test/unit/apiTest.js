const sinon = require('sinon');
const test = require('tape');
const DanceAPI = require('../../src/api');

const FAKE_EFFECT = 'fake-effect-name';
const FAKE_PALETTE = 'fake-palette-name';

// DEPRECATED
// An old block may refer to this version of the command,
// so we're keeping it around for backwards-compat.
// @see https://github.com/code-dot-org/dance-party/issues/469
test('setBackgroundEffect calls nativeAPI.setBackgroundEffect', t => {
  t.plan(2);
  const fakeNativeAPI = {
    setBackgroundEffect: sinon.spy(),
  };
  const api = new DanceAPI(fakeNativeAPI);
  api.setBackgroundEffect(FAKE_EFFECT, FAKE_PALETTE);
  t.equal(fakeNativeAPI.setBackgroundEffect.callCount, 1);
  t.deepEqual(fakeNativeAPI.setBackgroundEffect.firstCall.args, [FAKE_EFFECT, FAKE_PALETTE]);
});

test('setBackgroundEffectWithPalette calls nativeAPI.setBackgroundEffect', t => {
  t.plan(2);
  const fakeNativeAPI = {
    setBackgroundEffect: sinon.spy(),
  };
  const api = new DanceAPI(fakeNativeAPI);
  api.setBackgroundEffectWithPalette(FAKE_EFFECT, FAKE_PALETTE);
  t.equal(fakeNativeAPI.setBackgroundEffect.callCount, 1);
  t.deepEqual(fakeNativeAPI.setBackgroundEffect.firstCall.args, [FAKE_EFFECT, FAKE_PALETTE]);
});

// DEPRECATED
// An old block may refer to this version of the command,
// so we're keeping it around for backwards-compat.
// @see https://github.com/code-dot-org/dance-party/issues/469
test('setForegroundEffect calls nativeAPI.setForegroundEffect', t => {
  t.plan(2);
  const fakeNativeAPI = {
    setForegroundEffect: sinon.spy(),
  };
  const api = new DanceAPI(fakeNativeAPI);
  api.setForegroundEffect(FAKE_EFFECT);
  t.equal(fakeNativeAPI.setForegroundEffect.callCount, 1);
  t.deepEqual(fakeNativeAPI.setForegroundEffect.firstCall.args, [FAKE_EFFECT]);
});

test('setForegroundEffectExtended calls nativeAPI.setForegroundEffect', t => {
  t.plan(2);
  const fakeNativeAPI = {
    setForegroundEffect: sinon.spy(),
  };
  const api = new DanceAPI(fakeNativeAPI);
  api.setForegroundEffectExtended(FAKE_EFFECT);
  t.equal(fakeNativeAPI.setForegroundEffect.callCount, 1);
  t.deepEqual(fakeNativeAPI.setForegroundEffect.firstCall.args, [FAKE_EFFECT]);
});
