const DanceParty = require('../../src/p5.dance');
const UnitTestResourceLoader = require('./UnitTestResourceLoader');

function createDanceAPIHelper(props, loadSpriteAnimations = true) {
  return new Promise(resolve => {
    new DanceParty({
      playSound: (url, callback) => callback(),
      onInit: nativeAPI => {
        if (loadSpriteAnimations) {
          resolve(nativeAPI.ensureSpritesAreLoaded().then(() => nativeAPI));
        } else {
          resolve(nativeAPI);
        }
      },
      resourceLoader: new UnitTestResourceLoader(),
      ...props
    });
  });
}

module.exports = {
  createDanceAPI: props => createDanceAPIHelper(props),
  createDanceAPIWithoutLoading: props => createDanceAPIHelper(props, false),
};
