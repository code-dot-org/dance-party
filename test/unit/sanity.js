const test = require('tape');
const loadP5 = require('../../src/loadP5');
const DanceParty = require('../../src/p5.dance');

test('sanity', t => {
  loadP5().then(p5Inst => {
    const nativeAPI = new DanceParty(p5Inst, {});

    t.notOk(nativeAPI.metadataLoaded());
    t.end();
  });
});
