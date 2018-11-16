const helpers = require('../../helpers/createDanceAPI');
const parseDataURL = require('data-urls');
const fs = require('fs');

/**
 * Run: 'node ./test/visual/generateScreenshot.js <effectName>'
 *
 * For debugging 'npm run test:visual' failures.
 * Saves a screenshot of the background with the given effect name
 * to the test visual images folder.
 */

/*
  Set the background to given effect and save a screenshot to test/visual/images/temp
 */
async function createBackgroundScreenshot(effectName){
  let nativeAPI = await helpers.createDanceAPI();
  nativeAPI.p5_.randomSeed(0);
  nativeAPI.setBackgroundEffect(effectName);
  for (let i = 0; i < 100; i++) {
    nativeAPI.getBackgroundEffect().draw({bpm: 0});
  }

  const buffer = parseDataURL(nativeAPI.p5_.canvas.toDataURL()).body;
  fs.writeFileSync(`test/visual/images/temp/${effectName}.png`, buffer);
  nativeAPI.reset();
}

var args = process.argv.slice(2);

createBackgroundScreenshot(args[0]);
