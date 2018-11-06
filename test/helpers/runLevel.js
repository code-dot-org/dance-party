const DanceParty = require('../../src/p5.dance');
const DanceAPI = require('../../src/api');

const fs = require('fs');
const path = require('path');
const interpreted = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'p5.dance.interpreted.js'), 'utf8');

module.exports = (userCode, validationCode, onPuzzleComplete) => {
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

      const epilogue = `return {runUserSetup, runUserEvents, getCueList};`;
      const globals = new DanceAPI(api);
      const code = interpreted + userCode + epilogue;

      const validationCallback = new Function('World', 'nativeAPI', 'sprites', validationCode);
      api.registerValidation(validationCallback);

      const params = [];
      const args = [];
      for (let k of Object.keys(globals)) {
        params.push(k);
        args.push(globals[k]);
      }
      params.push(code);
      const ctor = function () {
        return Function.apply(this, params);
      };
      ctor.prototype = Function.prototype;
      const {runUserSetup, runUserEvents, getCueList} = new ctor().apply(null, args);

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
      api.play({bpm: 1200, delay: 0});
    },
  });
};
