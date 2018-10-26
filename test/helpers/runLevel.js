const DanceParty = require('../../src/p5.dance');
const Levels = require('../../levels/hourOfCode');
const loadP5 = require('../../src/loadP5');

const levels = Object.assign({}, Levels);

module.exports = (levelName, onPuzzleComplete) => {
  new DanceParty({
    moveNames: [],
    playSound: ({callback}) => callback(),
    onPuzzleComplete,
    onInit: api => {
      debugger;
      console.log(levels[levelName].solution);

      api.play({bpm: 120});

      setTimeout(() => {
        onPuzzleComplete();
        api.reset();
      }, 2000);
    },
  });
};
