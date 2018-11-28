const helpers = require('../../helpers/createDanceAPI');
const parseDataURL = require('data-urls');
const fs = require('fs');

/*
  Set the background to given effect and save a screenshot to pathname
 */
async function createBackgroundScreenshot(effectName, pathname, palette){
  let nativeAPI = await helpers.createDanceAPI();
  nativeAPI.p5_.randomSeed(0);
  nativeAPI.p5_.noiseSeed(0);
  nativeAPI.setBackgroundEffect(effectName, palette);
  for (let i = 0; i < 100; i++) {
    nativeAPI.p5_.background('#fff');
    nativeAPI.getBackgroundEffect().draw({bpm: 0, centroid: 7000, artist: 'artist', title: 'title', isPeak: i % 6 === 0});
  }

  const buffer = parseDataURL(nativeAPI.p5_.canvas.toDataURL()).body;

  if (!fs.existsSync(pathname)) {
    fs.mkdirSync(pathname);
  }

  let name = effectName + (palette ? ("_" + palette) : "");

  fs.writeFileSync(`${pathname}/${name}.png`, buffer);
  nativeAPI.reset();
}

module.exports = createBackgroundScreenshot;
