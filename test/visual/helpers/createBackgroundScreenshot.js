const helpers = require('../../helpers/createDanceAPI');
const parseDataURL = require('data-urls');
const fs = require('fs');

/*
  Set the background to given effect and save a screenshot to pathname
 */
async function createBackgroundScreenshot(effectName, pathname){
  let nativeAPI = await helpers.createDanceAPI();
  nativeAPI.p5_.randomSeed(0);
  nativeAPI.setBackgroundEffect(effectName);
  for (let i = 0; i < 100; i++) {
    nativeAPI.getBackgroundEffect().draw({bpm: 0});
  }

  const buffer = parseDataURL(nativeAPI.p5_.canvas.toDataURL()).body;

  if (!fs.existsSync(pathname)) {
    fs.mkdirSync(pathname);
  }

  fs.writeFileSync(`${pathname}/${effectName}.png`, buffer);
  nativeAPI.reset();
}

module.exports = createBackgroundScreenshot;
