const fs = require('fs');
const path = require('path');
const interpreted = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'p5.dance.interpreted.js'), 'utf8');
const injectInterpreted = require('../helpers/injectInterpreted');

const test = require('tape');
const helpers = require('../helpers/createDanceAPI');

async function runUserCode(userCode) {
  const nativeAPI = await helpers.createDanceAPI();
  return {
    nativeAPI,
    interpretedAPI: injectInterpreted(nativeAPI, interpreted, userCode),
  };
}

test('atTimestamp adds a cue to the cue list', async t => {
  const {nativeAPI, interpretedAPI} = await runUserCode(`
    atTimestamp(2, "seconds", function () {});
  `);

  t.deepEqual(interpretedAPI.getCueList(), {seconds: [2], measures: []});

  t.end();
  nativeAPI.reset();
});
