const helpers = require('../../helpers/createDanceAPI');
const parseDataURL = require('data-urls');
const fs = require('fs');

/*
  Set the effect and save a screenshot to pathname
 */
async function createEffectScreenshot(effectName, pathname, palette, type) {
  if (!['foreground', 'background'].includes(type)) {
    throw new Error('Effect type must be foreground or background');
  }

  let nativeAPI;
  try {
    nativeAPI = await helpers.createDanceAPI();
  } catch (e) {
    console.error(e);
    return;
  }
  nativeAPI.p5_.randomSeed(0);
  nativeAPI.p5_.noiseSeed(0);

  if (type === 'foreground') {
    nativeAPI.setForegroundEffect(effectName);
  } else {
    nativeAPI.setBackgroundEffect(effectName, palette);
  }

  for (let i = 0; i < 100; i++) {
    nativeAPI.p5_.background('#fff');
    const effect = type === 'foreground' ?
      nativeAPI.getForegroundEffect() :
      nativeAPI.getBackgroundEffect();
    effect.draw({bpm: 0, centroid: 7000, artist: 'artist', title: 'title', isPeak: i % 6 === 0});
  }

  const buffer = parseDataURL(nativeAPI.p5_.canvas.toDataURL()).body;

  if (!fs.existsSync(pathname)) {
    fs.mkdirSync(pathname);
  }

  let name = effectName + (palette ? ("_" + palette) : "");

  fs.writeFileSync(`${pathname}/${name}.png`, buffer);
  nativeAPI.reset();
}

module.exports = createEffectScreenshot;
