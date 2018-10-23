const test = require('tape');
const DanceParty = require('../../src/p5.dance');

global.window = {
  addEventListener: () => {},
};
global.document = {
  hasFocus: () => true,
  getElementsByTagName: () => ({}),
};
global.screen = {};

const p5 = require('p5');
window.p5 = p5;

p5.prototype.createGroup = () => {};

test('sanity', t => {
  const nativeAPI = new DanceParty(new p5(), {});

  t.notOk(nativeAPI.metadataLoaded());
  t.end();
});
