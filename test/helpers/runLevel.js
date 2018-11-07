const DanceParty = require('../../src/p5.dance');

const fs = require('fs');
const path = require('path');
const interpreted = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'p5.dance.interpreted.js'), 'utf8');
const injectInterpreted = require('./injectInterpreted');

module.exports = (userCode, validationCode, onPuzzleComplete, bpm = 1200) => {
  let nativeAPI;
  new DanceParty({
    moveNames: [],
    playSound: (url, callback) => callback(),
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


      // Mock 4 cat and moose animation poses.
      const moveCount = 10;
      for (let i = 0; i < moveCount; i++) {
        api.setAnimationSpriteSheet("CAT", i, {}, () => {});
        api.setAnimationSpriteSheet("MOOSE", i, {}, () => {});
        api.setAnimationSpriteSheet("ROBOT", i, {}, () => {});
        api.world.MOVE_NAMES.push({
          name: `move${i}`
        });
      }

      api.world.fullLengthMoveCount = moveCount;
      api.world.restMoveCount = 1;

      api.addCues(getCueList());
      api.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
      runUserSetup();
      api.play({bpm: bpm, delay: 0});
    },
  });
};
