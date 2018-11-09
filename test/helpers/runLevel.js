const {createDanceAPIWithDefaultMoves} = require('./createDanceAPI');

const interpreted = require('raw-loader!../../src/p5.dance.interpreted.js');
const injectInterpreted = require('./injectInterpreted');

module.exports = (userCode, validationCode, onPuzzleComplete, bpm = 1200) => {
  let nativeAPI;
  createDanceAPIWithDefaultMoves({
    onPuzzleComplete: (result, message) => {
      onPuzzleComplete(result, message);
      nativeAPI.reset();
    },
    onInit: api => {
      nativeAPI = api;

      const validationCallback = new Function('World', 'nativeAPI', 'sprites', validationCode);
      api.registerValidation(validationCallback);

      const {
        runUserSetup,
        runUserEvents,
        getCueList
      } = injectInterpreted(nativeAPI, interpreted, userCode);

      api.addCues(getCueList());
      api.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
      runUserSetup();
      api.play({bpm: bpm, delay: 0});
    },
  });
};
