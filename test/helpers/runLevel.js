const {createDanceAPI} = require('./createDanceAPI');
const ResourceLoader = require('../../src/ResourceLoader');
const interpreted = require('raw-loader!../../src/p5.dance.interpreted.js');
const injectInterpreted = require('./injectInterpreted');

module.exports = (userCode, validationCode, onPuzzleComplete, bpm = 1200, keyPresses = {}) => {
  let nativeAPI;
  createDanceAPI({
    resourceLoader: new ResourceLoader('/base/assets/sprite_sheets/'),
    onPuzzleComplete: (result, message) => {
      onPuzzleComplete(result, message);
      nativeAPI.reset();
      nativeAPI.teardown();
    },
    onInit: async (api) => {
      nativeAPI = api;

      const validationCallback = new Function('World', 'nativeAPI', 'sprites', 'events', validationCode);
      api.registerValidation(validationCallback);

      const {
        runUserSetup,
        runUserEvents,
        getCueList
      } = injectInterpreted(nativeAPI, interpreted, userCode);

      api.addCues(getCueList());
      api.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
      await api.ensureSpritesAreLoaded();
      runUserSetup();
      api.play({bpm: bpm, delay: 0});

      for (let [time, whichKey] of Object.entries(keyPresses)) {
        setTimeout(() => {
          api.onKeyDown(whichKey);
        }, time);
      }
    },
  });
};
