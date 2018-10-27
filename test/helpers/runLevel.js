const DanceParty = require('../../src/p5.dance');
const Levels = require('../../levels/hourOfCode');
const fs = require('fs');
const path = require('path');
const interpreted = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'p5.dance.interpreted.js'), 'utf8');

const levels = Object.assign({}, Levels);

module.exports = (levelName, onPuzzleComplete) => {
  new DanceParty({
    moveNames: [],
    playSound: ({callback}) => callback(),
    onPuzzleComplete,
    onInit: api => {
      debugger;
      eval(interpreted + levels[levelName].solution);
      console.log(runUserSetup());

      api.play({bpm: 120});

      setTimeout(() => {
        onPuzzleComplete();
        api.reset();
      }, 2000);
    },
  });
};
